/**
 * AtlasFetch - small resilient fetch helper shared by the NFL / NHL / MLB trend analyzers.
 *
 *  - per-attempt timeout (AbortController)
 *  - bounded retries with exponential backoff + jitter for network errors, timeouts, 5xx and 429
 *  - no retries for other 4xx
 *  - response shape validation (guards against missing fields)
 *  - sessionStorage cache with TTL and stale-cache fallback when the network fails
 *  - tiny UI helpers: error panel with Retry button, dismissible-less notices
 *
 * Works in browsers (window.AtlasFetch) and in Node/vm tests (module.exports).
 */
(function (root) {
    'use strict';

    const CACHE_PREFIX = 'atlas:fetch:v1:';
    const TTL_SCHEDULE_MS = 10 * 60 * 1000;          // schedules change as games finish
    const TTL_COMPLETED_SUMMARY_MS = 24 * 60 * 60 * 1000; // completed boxscores are immutable

    class FetchError extends Error {
        constructor(message, kind, extra) {
            super(message);
            this.name = 'FetchError';
            this.kind = kind; // 'network' | 'timeout' | 'http' | 'parse' | 'schema'
            if (extra) Object.assign(this, extra);
        }
    }

    function getStorage(opts) {
        if (opts && opts.storage !== undefined) return opts.storage;
        try { return root.sessionStorage || null; } catch (e) { return null; }
    }

    function readCache(storage, key) {
        if (!storage) return null;
        try {
            const raw = storage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.t !== 'number' || !('d' in parsed)) return null;
            return parsed;
        } catch (e) { return null; }
    }

    function writeCache(storage, key, data) {
        if (!storage) return;
        try {
            storage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), d: data }));
        } catch (e) {
            // Quota exceeded / disabled storage: caching is best-effort only.
        }
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    function isRetryableStatus(status) {
        return status === 429 || (status >= 500 && status <= 599);
    }

    async function attempt(url, timeoutMs, fetchImpl) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        try {
            let res;
            try {
                res = await fetchImpl(url, { signal: controller.signal });
            } catch (err) {
                if (controller.signal.aborted) throw new FetchError(`Timed out after ${timeoutMs}ms`, 'timeout');
                throw new FetchError(`Network error: ${err && err.message}`, 'network');
            }
            if (!res.ok) {
                throw new FetchError(`HTTP ${res.status}`, 'http', {
                    status: res.status,
                    retryAfterMs: parseRetryAfter(res)
                });
            }
            try {
                return await res.json();
            } catch (err) {
                if (controller.signal.aborted) throw new FetchError(`Timed out after ${timeoutMs}ms`, 'timeout');
                throw new FetchError('Response was not valid JSON', 'parse');
            }
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function parseRetryAfter(res) {
        try {
            const h = res.headers && res.headers.get && res.headers.get('Retry-After');
            const secs = h ? parseFloat(h) : NaN;
            return isFinite(secs) ? Math.min(secs * 1000, 5000) : 0;
        } catch (e) { return 0; }
    }

    /**
     * @param {string} url
     * @param {object} [opts]
     * @param {number} [opts.timeoutMs=10000]
     * @param {number} [opts.retries=2]       extra attempts after the first
     * @param {number} [opts.baseDelayMs=400]
     * @param {number} [opts.ttlMs=0]         0 disables fresh-cache reads (stale fallback still applies if cached)
     * @param {(data:any)=>string|null|void} [opts.validate]  return an error string (or throw) when shape is bad
     * @returns {Promise<{data:any, stale:boolean, fromCache:boolean, ageMs:number}>}
     */
    async function fetchJson(url, opts) {
        opts = opts || {};
        const timeoutMs = opts.timeoutMs || 10000;
        const retries = opts.retries === undefined ? 2 : opts.retries;
        const baseDelayMs = opts.baseDelayMs === undefined ? 400 : opts.baseDelayMs;
        const ttlMs = opts.ttlMs || 0;
        const fetchImpl = opts.fetchImpl ||
            (root && typeof root.fetch === 'function' ? root.fetch.bind(root) : (typeof fetch === 'function' ? fetch : null));
        if (!fetchImpl) throw new FetchError('fetch is not available in this environment', 'network');
        const sleepFn = opts.sleep || sleep;
        const storage = getStorage(opts);
        const key = opts.cacheKey || url;

        const validate = (data) => {
            if (!opts.validate) return;
            let msg;
            try { msg = opts.validate(data); } catch (e) { msg = e && e.message ? e.message : 'validation threw'; }
            if (msg) throw new FetchError(`Unexpected response shape: ${msg}`, 'schema');
        };

        const cached = readCache(storage, key);
        if (cached && ttlMs > 0 && Date.now() - cached.t < ttlMs) {
            try {
                validate(cached.d);
                return { data: cached.d, stale: false, fromCache: true, ageMs: Date.now() - cached.t };
            } catch (e) { /* bad cache entry: refetch */ }
        }

        let lastErr;
        for (let n = 0; n <= retries; n++) {
            try {
                const data = await attempt(url, timeoutMs, fetchImpl);
                validate(data);
                writeCache(storage, key, data);
                return { data, stale: false, fromCache: false, ageMs: 0 };
            } catch (err) {
                lastErr = err instanceof FetchError ? err : new FetchError(String(err && err.message || err), 'network');
                const retryable = lastErr.kind === 'network' || lastErr.kind === 'timeout' ||
                    (lastErr.kind === 'http' && isRetryableStatus(lastErr.status));
                if (!retryable || n === retries) break;
                const backoff = baseDelayMs * Math.pow(2, n);
                const jitter = Math.random() * backoff * 0.5;
                await sleepFn(Math.max(backoff + jitter, lastErr.retryAfterMs || 0));
            }
        }

        // Stale fallback: any previously cached payload that still passes validation.
        if (cached) {
            try {
                validate(cached.d);
                return { data: cached.d, stale: true, fromCache: true, ageMs: Date.now() - cached.t };
            } catch (e) { /* unusable cache */ }
        }
        throw lastErr;
    }

    // ---- Shape validators (only fields the analyzers depend on) ----
    const validators = {
        espnSchedule(d) {
            if (!d || typeof d !== 'object') return 'not an object';
            if (!Array.isArray(d.events)) return 'missing events[]';
            return null;
        },
        espnSummary(d) {
            if (!d || typeof d !== 'object') return 'not an object';
            if (!d.boxscore || !Array.isArray(d.boxscore.teams)) return 'missing boxscore.teams[]';
            return null;
        },
        mlbTeams(d) {
            if (!d || typeof d !== 'object' || !Array.isArray(d.teams)) return 'missing teams[]';
            return null;
        },
        mlbSchedule(d) {
            if (!d || typeof d !== 'object') return 'not an object';
            if (d.dates !== undefined && !Array.isArray(d.dates)) return 'dates is not an array';
            return null;
        }
    };

    // ---- UI helpers ----
    function esc(s) {
        return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function resolveDoc(node) {
        return (node && node.ownerDocument) || (root && root.document) || (typeof document !== 'undefined' ? document : null);
    }

    /** Fill the existing error element with a friendly message and a Retry button. */
    function showError(errorDiv, message, onRetry) {
        if (!errorDiv) return;
        const doc = resolveDoc(errorDiv);
        errorDiv.innerHTML = '<p>' + esc(message) + '</p>';
        if (onRetry && doc) {
            const btn = doc.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Retry';
            btn.className = 'atlas-retry-btn';
            btn.style.cssText = 'margin-top:0.5rem;padding:0.4rem 1rem;border-radius:6px;border:1px solid currentColor;background:transparent;color:inherit;font-weight:bold;cursor:pointer;';
            btn.addEventListener('click', () => {
                errorDiv.style.display = 'none';
                return onRetry();
            });
            errorDiv.appendChild(btn);
        }
        errorDiv.style.display = 'block';
    }

    /** Create/update a non-fatal note rendered just before the error element. */
    function setNotice(anchor, id, message, onRetry) {
        if (!anchor || !anchor.parentNode) return;
        const doc = resolveDoc(anchor);
        if (!doc) return;
        let el = doc.getElementById(id);
        if (!message) { if (el) el.style.display = 'none'; return; }
        if (!el) {
            el = doc.createElement('div');
            el.id = id;
            el.setAttribute('role', 'status');
            el.style.cssText = 'margin-top:1rem;padding:0.6rem 0.9rem;border-radius:6px;border:1px solid rgba(245,158,11,0.5);background:rgba(245,158,11,0.1);color:#f59e0b;font-size:0.9rem;';
            anchor.parentNode.insertBefore(el, anchor);
        }
        el.innerHTML = '<span>' + esc(message) + '</span>';
        if (onRetry) {
            const btn = doc.createElement('button');
            btn.type = 'button';
            btn.textContent = 'Retry';
            btn.className = 'atlas-notice-retry-btn';
            btn.style.cssText = 'margin-left:0.75rem;padding:0.2rem 0.7rem;border-radius:6px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;';
            btn.addEventListener('click', () => onRetry());
            el.appendChild(btn);
        }
        el.style.display = 'block';
    }

    const api = { fetchJson, FetchError, validators, ui: { showError, setNotice }, TTL_SCHEDULE_MS, TTL_COMPLETED_SUMMARY_MS };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.AtlasFetch = api;
})(typeof window !== 'undefined' ? window : globalThis);
