#!/usr/bin/env node
/**
 * Offline VM Test Suite for `espn-client.js` (`AtlasFetch`) and all three
 * sports trend analyzers (`nfl-trend-analyzer.js`, `nhl-trend-analyzer.js`,
 * `baseball-trend-analyzer.js`) plus `check.js` schema validators.
 *
 * Zero network access required. Exits nonzero on any assertion failure or
 * uncaught exception / unhandled rejection.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
    validateNflSchedule,
    validateNflSummary,
    validateNhlSchedule,
    validateMlbTeams,
    validateMlbSchedule
} from './check.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const PATHS = {
    espnClient: path.join(ROOT, 'website/static/js/espn-client.js'),
    nflJs: path.join(ROOT, 'website/static/js/nfl-trend-analyzer.js'),
    nhlJs: path.join(ROOT, 'website/static/js/nhl-trend-analyzer.js'),
    mlbJs: path.join(ROOT, 'website/static/js/baseball-trend-analyzer.js'),
    nflHtml: path.join(ROOT, 'website/templates/layouts/nfl-trend-analyzer.html'),
    nhlHtml: path.join(ROOT, 'website/templates/layouts/nhl-trend-analyzer.html'),
    mlbHtml: path.join(ROOT, 'website/templates/layouts/baseball-trend-analyzer.html')
};

const SOURCES = Object.fromEntries(
    Object.entries(PATHS).map(([k, p]) => [k, fs.readFileSync(p, 'utf8')])
);

const uncaughtErrors = [];
process.on('uncaughtException', (err) => {
    uncaughtErrors.push(err);
    console.error('[UNCAUGHT EXCEPTION]', err);
});
process.on('unhandledRejection', (reason) => {
    uncaughtErrors.push(reason);
    console.error('[UNHANDLED REJECTION]', reason);
});

let passedTests = 0;
let failedTests = 0;

async function test(name, fn) {
    const beforeUncaught = uncaughtErrors.length;
    try {
        await fn();
        if (uncaughtErrors.length > beforeUncaught) {
            throw uncaughtErrors[beforeUncaught];
        }
        passedTests++;
        console.log(`  [PASS] ${name}`);
    } catch (err) {
        failedTests++;
        console.error(`  [FAIL] ${name}`);
        console.error(`         ${err && err.stack ? err.stack : err}`);
    }
}

// ---------------------------------------------------------------------------
// Minimal DOM + Web Storage + Canvas + Chart.js Harness for Node `vm`
// ---------------------------------------------------------------------------

function createStorage() {
    const store = new Map();
    return {
        getItem(k) { return store.has(String(k)) ? store.get(String(k)) : null; },
        setItem(k, v) { store.set(String(k), String(v)); },
        removeItem(k) { store.delete(String(k)); },
        clear() { store.clear(); },
        get size() { return store.size; },
        _raw: store
    };
}

function createCanvas2DContext() {
    return {
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        font: '',
        textAlign: 'left',
        textBaseline: 'alphabetic',
        fillRect() {},
        strokeRect() {},
        clearRect() {},
        beginPath() {},
        closePath() {},
        roundRect() {},
        fill() {},
        stroke() {},
        arc() {},
        moveTo() {},
        lineTo() {},
        fillText() {},
        measureText(str) { return { width: String(str || '').length * 7 }; },
        drawImage() {},
        save() {},
        restore() {}
    };
}

function parseSelectOptionsFromHtml(html, selectId) {
    const selectRe = new RegExp(`<select[^>]*id=["']${selectId}["'][^>]*>([\\s\\S]*?)<\\/select>`, 'i');
    const m = html.match(selectRe);
    if (!m) return [];
    const opts = [];
    for (const om of m[1].matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)) {
        const attrs = om[1];
        const valMatch = attrs.match(/value=["']([^"']*)["']/i);
        const text = om[2].replace(/&amp;/g, '&').replace(/<[^>]*>/g, '').trim();
        const selected = /\bselected\b/i.test(attrs);
        opts.push({ value: valMatch ? valMatch[1] : text, text, selected });
    }
    return opts;
}

class MockElement {
    constructor(tagName, ownerDocument, id = '') {
        this.tagName = String(tagName || 'DIV').toUpperCase();
        this.ownerDocument = ownerDocument;
        this._id = id;
        this.className = '';
        this.type = '';
        this.title = '';
        this.download = '';
        this.href = '';
        this.style = { display: '', borderColor: '', color: '', cssText: '', position: '', opacity: '' };
        this.attributes = new Map();
        this.children = [];
        this.parentNode = null;
        this.listeners = new Map();
        this._textContent = '';
        this._innerHTML = '';
        this._value = '';
        this.width = 800;
        this.height = 400;
        if (id && ownerDocument) ownerDocument._register(this);
    }

    get id() { return this._id; }
    set id(v) {
        this._id = String(v || '');
        if (this._id && this.ownerDocument) this.ownerDocument._register(this);
    }

    setAttribute(k, v) {
        this.attributes.set(String(k), String(v));
        if (k === 'id') this.id = v;
    }
    getAttribute(k) { return this.attributes.get(String(k)) ?? null; }

    get textContent() {
        if (this.children.length > 0 && !this._textContent) {
            return this.children.map((c) => c.textContent).join('');
        }
        return this._textContent;
    }
    set textContent(v) {
        this._textContent = String(v ?? '');
        this._innerHTML = this._textContent;
        if (this.tagName === 'OPTION' && !this._valueExplicit) {
            this._value = this._textContent;
        }
    }

    get innerHTML() { return this._innerHTML; }
    set innerHTML(html) {
        const str = String(html ?? '');
        this._innerHTML = str;
        this._textContent = str.replace(/<[^>]*>/g, '');
        this.children = [];
        if (this.tagName === 'SELECT') {
            for (const om of str.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)) {
                const opt = new MockElement('OPTION', this.ownerDocument);
                const valMatch = om[1].match(/value=["']([^"']*)["']/i);
                opt.textContent = om[2].replace(/<[^>]*>/g, '').trim();
                if (valMatch) opt.value = valMatch[1];
                this.appendChild(opt);
            }
            this._syncSelectDefault();
        } else if (this.tagName === 'OL' || this.tagName === 'UL') {
            for (const lm of str.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
                const li = new MockElement('LI', this.ownerDocument);
                li.textContent = lm[1].replace(/<[^>]*>/g, '').trim();
                this.appendChild(li);
            }
        }
    }

    get options() {
        if (this.tagName !== 'SELECT') return [];
        return this.children.filter((c) => c.tagName === 'OPTION');
    }

    get selectedIndex() {
        const opts = this.options;
        if (opts.length === 0) return -1;
        const idx = opts.findIndex((o) => String(o.value) === String(this._value));
        return idx >= 0 ? idx : 0;
    }

    get value() {
        if (this.tagName === 'SELECT') {
            const opts = this.options;
            if (this._value !== '' && opts.some((o) => String(o.value) === String(this._value))) {
                return this._value;
            }
            return opts[0] ? opts[0].value : '';
        }
        return this._value;
    }
    set value(v) {
        this._valueExplicit = true;
        this._value = String(v ?? '');
    }

    get text() { return this.textContent; }
    set text(v) { this.textContent = v; }

    _syncSelectDefault() {
        const opts = this.options;
        if (opts.length === 0) {
            this._value = '';
            return;
        }
        const sel = opts.find((o) => o._selectedAttr) || opts[0];
        this._value = sel.value;
    }

    appendChild(child) {
        if (!child) return child;
        child.parentNode = this;
        this.children.push(child);
        if (child.id && this.ownerDocument) this.ownerDocument._register(child);
        if (this.tagName === 'SELECT' && this.children.length === 1 && !this._value) {
            this._value = child.value;
        }
        return child;
    }

    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx >= 0) {
            this.children.splice(idx, 1);
            child.parentNode = null;
        }
        return child;
    }

    insertBefore(newNode, refNode) {
        newNode.parentNode = this;
        const idx = this.children.indexOf(refNode);
        if (idx >= 0) this.children.splice(idx, 0, newNode);
        else this.children.push(newNode);
        if (newNode.id && this.ownerDocument) this.ownerDocument._register(newNode);
        return newNode;
    }

    addEventListener(type, fn) {
        if (!this.listeners.has(type)) this.listeners.set(type, []);
        this.listeners.get(type).push(fn);
    }

    async dispatchEvent(evt) {
        const type = typeof evt === 'string' ? evt : evt.type;
        const fns = this.listeners.get(type) || [];
        const results = [];
        for (const fn of fns) {
            results.push(await fn({ type, target: this, preventDefault() {} }));
        }
        return results;
    }

    click() {
        return this.dispatchEvent('click');
    }

    select() {}

    getContext(kind) {
        if (kind === '2d') return createCanvas2DContext();
        return null;
    }

    toDataURL() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }

    toBlob(cb) {
        cb(new Blob(['png'], { type: 'image/png' }));
    }

    querySelector(selector) {
        return this.querySelectorAll(selector)[0] || null;
    }

    querySelectorAll(selector) {
        const out = [];
        const matchSimple = (el, sel) => {
            if (sel.startsWith('.')) {
                const cls = sel.slice(1);
                return String(el.className || '').split(/\s+/).includes(cls);
            }
            if (sel.startsWith('#')) return el.id === sel.slice(1);
            return el.tagName === sel.toUpperCase();
        };
        const parts = selector.trim().split(/\s+/);
        const walk = (node, partIdx) => {
            for (const c of node.children) {
                if (matchSimple(c, parts[partIdx])) {
                    if (partIdx === parts.length - 1) out.push(c);
                    else walk(c, partIdx + 1);
                } else {
                    walk(c, partIdx);
                }
            }
        };
        walk(this, 0);
        return out;
    }
}

function createAnalyzerEnvironment({ htmlSource, pathname, search = '', fetchHandler }) {
    const byId = new Map();
    const docListeners = new Map();
    const consoleErrors = [];
    const consoleWarns = [];
    const activeTimers = new Set();

    const doc = {
        _register(el) { if (el.id) byId.set(el.id, el); },
        getElementById(id) { return byId.get(String(id)) || null; },
        createElement(tag) { return new MockElement(tag, doc); },
        addEventListener(type, fn) {
            if (!docListeners.has(type)) docListeners.set(type, []);
            docListeners.get(type, []).push(fn);
        },
        execCommand() { return true; },
        querySelector(sel) { return doc.body.querySelector(sel); },
        querySelectorAll(sel) { return doc.body.querySelectorAll(sel); },
        body: null
    };
    doc.body = new MockElement('BODY', doc, 'body');

    const card = new MockElement('DIV', doc, 'analyzer-card');
    doc.body.appendChild(card);

    const buildSelect = (id, fallbackOpts = []) => {
        const el = new MockElement('SELECT', doc, id);
        const parsed = parseSelectOptionsFromHtml(htmlSource, id);
        const opts = parsed.length > 0 ? parsed : fallbackOpts;
        for (const o of opts) {
            const optEl = new MockElement('OPTION', doc);
            optEl.textContent = o.text;
            optEl.value = o.value;
            optEl._selectedAttr = Boolean(o.selected);
            el.appendChild(optEl);
        }
        el._syncSelectDefault();
        card.appendChild(el);
        return el;
    };

    buildSelect('season-select', [{ value: '2026', text: '2026 Season', selected: true }]);
    buildSelect('metric-select');
    const winContainer = new MockElement('DIV', doc, 'window-select-container');
    card.appendChild(winContainer);
    buildSelect('window-select');
    buildSelect('division-select');
    buildSelect('team-select', [{ value: 'none', text: 'None', selected: true }]);
    buildSelect('team-select-2', [{ value: 'none', text: 'None', selected: true }]);

    for (const btnId of ['clear-filters', 'reset-zoom', 'copy-chart-btn', 'copy-image-btn', 'export-chart-btn', 'copy-awards-btn']) {
        card.appendChild(new MockElement('BUTTON', doc, btnId));
    }

    const chartContainer = new MockElement('DIV', doc, 'chart-container');
    const loading = new MockElement('DIV', doc, 'chart-loading');
    loading.style.display = 'flex';
    const canvas = new MockElement('CANVAS', doc, 'trendChart');
    chartContainer.appendChild(loading);
    chartContainer.appendChild(canvas);
    card.appendChild(chartContainer);

    const errorDiv = new MockElement('DIV', doc, 'chart-error');
    errorDiv.style.display = 'none';
    card.appendChild(errorDiv);

    // MLB awards elements
    const awardsContainer = new MockElement('DIV', doc, 'awards-container');
    awardsContainer.style.display = 'none';
    awardsContainer.appendChild(new MockElement('H2', doc, 'awards-title'));
    awardsContainer.appendChild(new MockElement('OL', doc, 'award-top10'));
    awardsContainer.appendChild(new MockElement('OL', doc, 'award-bottom10'));
    awardsContainer.appendChild(new MockElement('SPAN', doc, 'award-winstreak'));
    awardsContainer.appendChild(new MockElement('SPAN', doc, 'award-lossstreak'));
    awardsContainer.appendChild(new MockElement('SPAN', doc, 'award-bestdiff'));
    awardsContainer.appendChild(new MockElement('SPAN', doc, 'award-worstdiff'));
    card.appendChild(awardsContainer);

    const chartInstances = [];
    class MockChart {
        constructor(ctx, config) {
            this.ctx = ctx;
            this.config = config;
            this.type = config.type;
            this.data = config.data || { datasets: [] };
            this.options = config.options || {};
            this.destroyed = false;
            this.zoomResetCount = 0;
            chartInstances.push(this);
        }
        destroy() { this.destroyed = true; }
        resetZoom() { this.zoomResetCount++; }
        update() {}
    }
    MockChart.defaults = { color: '#888', font: { family: 'Inter, sans-serif' } };

    const localStorage = createStorage();
    const sessionStorage = createStorage();
    let currentUrl = `https://thomsfoolery.com${pathname}${search}`;
    let currentFetch = fetchHandler;

    // Fast timer shim so retry backoff delays resolve in ~1ms during offline VM tests
    const fastSetTimeout = (fn, ms) => {
        const clamped = Math.min(Number(ms) || 0, 2);
        const id = setTimeout(() => {
            activeTimers.delete(id);
            fn();
        }, clamped);
        activeTimers.add(id);
        return id;
    };
    const fastClearTimeout = (id) => {
        activeTimers.delete(id);
        clearTimeout(id);
    };

    const mockConsole = {
        log() {},
        info() {},
        warn(...args) { consoleWarns.push(args); },
        error(...args) { consoleErrors.push(args); }
    };

    const sandbox = {
        console: mockConsole,
        setTimeout: fastSetTimeout,
        clearTimeout: fastClearTimeout,
        AbortController,
        URL,
        URLSearchParams,
        Blob,
        Math,
        Date,
        JSON,
        Number,
        String,
        Boolean,
        Array,
        Object,
        Set,
        Map,
        RegExp,
        Error,
        TypeError,
        Promise,
        parseInt,
        parseFloat,
        isNaN,
        isFinite,
        encodeURIComponent,
        decodeURIComponent,
        Chart: MockChart,
        localStorage,
        sessionStorage,
        navigator: {
            clipboard: {
                async writeText() {},
                async write() {}
            }
        },
        location: {
            origin: 'https://thomsfoolery.com',
            pathname,
            search
        },
        history: {
            replaceState(_s, _t, url) { currentUrl = url; }
        },
        document: doc,
        fetch: (...args) => currentFetch(...args)
    };
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;

    const context = vm.createContext(sandbox);

    return {
        context,
        sandbox,
        doc,
        card,
        errorDiv,
        loading,
        localStorage,
        sessionStorage,
        consoleErrors,
        consoleWarns,
        chartInstances,
        getActiveChart() {
            // Return the latest non-destroyed main trendChart instance
            for (let i = chartInstances.length - 1; i >= 0; i--) {
                if (!chartInstances[i].destroyed) return chartInstances[i];
            }
            return null;
        },
        getCurrentUrl() { return currentUrl; },
        setFetch(fn) { currentFetch = fn; },
        runScripts(analyzerCode, analyzerLabel) {
            new vm.Script(SOURCES.espnClient, { filename: 'espn-client.js' }).runInContext(context);
            new vm.Script(analyzerCode, { filename: analyzerLabel }).runInContext(context);
        },
        async fireDOMContentLoaded() {
            const handlers = docListeners.get('DOMContentLoaded') || [];
            for (const h of handlers) {
                await h();
            }
        },
        cleanupTimers() {
            for (const id of activeTimers) clearTimeout(id);
            activeTimers.clear();
        }
    };
}

function jsonResponse(body, status = 200, headers = {}) {
    return {
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : `HTTP ${status}`,
        headers: {
            get(k) {
                const found = Object.keys(headers).find((hk) => hk.toLowerCase() === String(k).toLowerCase());
                return found ? String(headers[found]) : null;
            }
        },
        async json() { return structuredClone(body); }
    };
}

// ---------------------------------------------------------------------------
// Realistic Mock Upstream Payloads
// ---------------------------------------------------------------------------

function makeNflSchedulePayload(teamId, gameCount = 4) {
    const oppId = teamId === 2 ? 15 : 2;
    const events = [];
    for (let g = 1; g <= gameCount; g++) {
        const myScore = 17 + ((teamId + g * 3) % 18);
        const oppScore = 14 + ((oppId + g * 5) % 17);
        events.push({
            id: `401671${String(g).padStart(2, '0')}${String(teamId).padStart(2, '0')}`,
            date: `2026-09-${String(6 + g * 5).padStart(2, '0')}T17:00Z`,
            seasonType: { id: '2', type: 2, name: 'Regular Season' },
            competitions: [{
                id: `comp-${teamId}-${g}`,
                status: {
                    period: g === 2 ? 5 : 4,
                    type: { completed: true, state: 'post' }
                },
                competitors: [
                    {
                        id: String(teamId),
                        team: { id: String(teamId) },
                        homeAway: g % 2 === 0 ? 'home' : 'away',
                        score: { value: myScore, displayValue: String(myScore) },
                        leaders: [
                            { name: 'passingLeader', leaders: [{ value: 255, displayValue: '22/31, 255 YDS, 2 TD, 1 INT' }] },
                            { name: 'rushingLeader', leaders: [{ value: 78, displayValue: '16 CAR, 78 YDS, 1 TD' }] }
                        ]
                    },
                    {
                        id: String(oppId),
                        team: { id: String(oppId) },
                        homeAway: g % 2 === 0 ? 'away' : 'home',
                        score: { value: oppScore, displayValue: String(oppScore) },
                        leaders: [
                            { name: 'passingLeader', leaders: [{ value: 210, displayValue: '19/30, 210 YDS, 1 TD, 1 INT' }] },
                            { name: 'rushingLeader', leaders: [{ value: 64, displayValue: '14 CAR, 64 YDS' }] }
                        ]
                    }
                ]
            }]
        });
    }
    // Include one future unplayed game + one preseason game (must be ignored by filter)
    events.push({
        id: `future-${teamId}`,
        date: '2026-12-20T18:00Z',
        seasonType: { id: '2', type: 2 },
        competitions: [{
            status: { period: 0, type: { completed: false, state: 'pre' } },
            competitors: [{ id: String(teamId) }, { id: String(oppId) }]
        }]
    });
    events.push({
        id: `pre-${teamId}`,
        date: '2026-08-15T18:00Z',
        seasonType: { id: '1', type: 1 },
        competitions: [{
            status: { period: 4, type: { completed: true, state: 'post' } },
            competitors: [
                { id: String(teamId), score: { value: 10, displayValue: '10' } },
                { id: String(oppId), score: { value: 7, displayValue: '7' } }
            ]
        }]
    });
    return { events };
}

function makeNflSummaryPayload(eventId) {
    return {
        header: { id: String(eventId) },
        boxscore: {
            teams: [
                {
                    team: { id: '2', abbreviation: 'BUF' },
                    statistics: [
                        { name: 'firstDowns', value: 22, displayValue: '22' },
                        { name: 'thirdDownEff', displayValue: '7-13' },
                        { name: 'fourthDownEff', displayValue: '1-1' },
                        { name: 'redZoneAttempts', displayValue: '3-4' },
                        { name: 'totalOffensivePlays', value: 64, displayValue: '64' },
                        { name: 'totalYards', value: 382, displayValue: '382' },
                        { name: 'netPassingYards', value: 258, displayValue: '258' },
                        { name: 'rushingYards', value: 124, displayValue: '124' },
                        { name: 'sacksYardsLost', displayValue: '1-7' },
                        { name: 'turnovers', value: 1, displayValue: '1' },
                        { name: 'totalPenaltiesYards', displayValue: '5-42' },
                        { name: 'possessionTime', displayValue: '31:45' }
                    ]
                },
                {
                    team: { id: '15', abbreviation: 'MIA' },
                    statistics: [
                        { name: 'firstDowns', value: 18, displayValue: '18' },
                        { name: 'thirdDownEff', displayValue: '5-12' },
                        { name: 'fourthDownEff', displayValue: '0-2' },
                        { name: 'redZoneAttempts', displayValue: '2-3' },
                        { name: 'totalOffensivePlays', value: 58, displayValue: '58' },
                        { name: 'totalYards', value: 310, displayValue: '310' },
                        { name: 'netPassingYards', value: 215, displayValue: '215' },
                        { name: 'rushingYards', value: 95, displayValue: '95' },
                        { name: 'sacksYardsLost', displayValue: '3-21' },
                        { name: 'turnovers', value: 2, displayValue: '2' },
                        { name: 'totalPenaltiesYards', displayValue: '6-55' },
                        { name: 'possessionTime', displayValue: '28:15' }
                    ]
                }
            ]
        }
    };
}

function makeNhlSchedulePayload(teamId, gameCount = 4) {
    const oppId = teamId === 1 ? 2 : 1;
    const events = [];
    for (let g = 1; g <= gameCount; g++) {
        const gf = 2 + ((teamId + g) % 4);
        const rawGa = 1 + ((oppId + g * 2) % 4);
        const ga = rawGa === gf ? gf - 1 : rawGa;
        const includeBoxStats = g % 2 === 1; // Exercise BOTH statistics[] parsing AND dynamic fallback!
        events.push({
            id: `401688${String(g).padStart(2, '0')}${String(teamId)}`,
            date: `2026-10-${String(8 + g * 3).padStart(2, '0')}T23:00Z`,
            seasonType: { id: '2', type: 2 },
            competitions: [{
                status: {
                    period: g === 3 ? 4 : 3,
                    type: { completed: true, state: 'post' }
                },
                competitors: [
                    {
                        id: String(teamId),
                        team: { id: String(teamId) },
                        score: { value: gf, displayValue: String(gf) },
                        linescore: [{ value: 1 }, { value: 1 }, { value: Math.max(0, gf - 2) }],
                        ...(includeBoxStats ? {
                            statistics: [
                                { name: 'penalties', value: 3, displayValue: '3' },
                                { name: 'penaltyMinutes', value: 6, displayValue: '6' },
                                { name: 'powerPlayGoals', value: 1, displayValue: '1' },
                                { name: 'powerPlayOpportunities', value: 3, displayValue: '3' },
                                { name: 'shotsOnGoal', value: 32, displayValue: '32' }
                            ]
                        } : {})
                    },
                    {
                        id: String(oppId),
                        team: { id: String(oppId) },
                        score: { value: ga, displayValue: String(ga) },
                        linescore: [{ value: 0 }, { value: 1 }, { value: Math.max(0, ga - 1) }],
                        ...(includeBoxStats ? {
                            statistics: [
                                { name: 'penalties', value: 3, displayValue: '3' },
                                { name: 'penaltyMinutes', value: 6, displayValue: '6' },
                                { name: 'powerPlayGoals', value: 0, displayValue: '0' },
                                { name: 'powerPlayOpportunities', value: 3, displayValue: '3' },
                                { name: 'shotsOnGoal', value: 28, displayValue: '28' }
                            ]
                        } : {})
                    }
                ]
            }]
        });
    }
    return { events };
}

const MLB_30_TEAMS = [
    [110, 'Baltimore Orioles', 103, 201], [111, 'Boston Red Sox', 103, 201],
    [147, 'New York Yankees', 103, 201], [139, 'Tampa Bay Rays', 103, 201],
    [141, 'Toronto Blue Jays', 103, 201], [145, 'Chicago White Sox', 103, 202],
    [114, 'Cleveland Guardians', 103, 202], [116, 'Detroit Tigers', 103, 202],
    [118, 'Kansas City Royals', 103, 202], [142, 'Minnesota Twins', 103, 202],
    [117, 'Houston Astros', 103, 200], [108, 'Los Angeles Angels', 103, 200],
    [133, 'Athletics', 103, 200], [136, 'Seattle Mariners', 103, 200],
    [140, 'Texas Rangers', 103, 200], [144, 'Atlanta Braves', 104, 204],
    [146, 'Miami Marlins', 104, 204], [121, 'New York Mets', 104, 204],
    [143, 'Philadelphia Phillies', 104, 204], [120, 'Washington Nationals', 104, 204],
    [112, 'Chicago Cubs', 104, 205], [113, 'Cincinnati Reds', 104, 205],
    [158, 'Milwaukee Brewers', 104, 205], [134, 'Pittsburgh Pirates', 104, 205],
    [138, 'St. Louis Cardinals', 104, 205], [109, 'Arizona Diamondbacks', 104, 203],
    [115, 'Colorado Rockies', 104, 203], [119, 'Los Angeles Dodgers', 104, 203],
    [135, 'San Diego Padres', 104, 203], [137, 'San Francisco Giants', 104, 203]
];

function makeMlbTeamsPayload() {
    return {
        teams: MLB_30_TEAMS.map(([id, name, leagueId, divisionId]) => ({
            id,
            name,
            league: { id: leagueId },
            division: { id: divisionId }
        }))
    };
}

function makeMlbSchedulePayload(daysCount = 5) {
    const dates = [];
    for (let d = 1; d <= daysCount; d++) {
        const games = [];
        for (let i = 0; i < MLB_30_TEAMS.length; i += 2) {
            const homeId = MLB_30_TEAMS[i][0];
            const awayId = MLB_30_TEAMS[(i + 1) % MLB_30_TEAMS.length][0];
            const homeScore = 2 + ((homeId + d) % 6);
            const rawAway = 1 + ((awayId + d * 2) % 5);
            const awayScore = rawAway === homeScore ? homeScore + 1 : rawAway;
            games.push({
                gamePk: 745000 + d * 100 + i,
                status: { statusCode: 'F', abstractGameState: 'Final' },
                teams: {
                    home: { team: { id: homeId, name: MLB_30_TEAMS[i][1] }, score: homeScore },
                    away: { team: { id: awayId, name: MLB_30_TEAMS[i + 1][1] }, score: awayScore }
                },
                linescore: {
                    innings: [
                        { away: { runs: awayScore > 0 ? 1 : 0 }, home: { runs: 0 } },
                        { away: { runs: Math.max(0, awayScore - 1) }, home: { runs: homeScore } }
                    ]
                }
            });
        }
        dates.push({ date: `2026-04-${String(d).padStart(2, '0')}`, games });
    }
    return { dates };
}

function assertValidChartDatasets(chart, expectedMinDatasets, expectedMinPoints = 1) {
    assert.ok(chart, 'Expected active Chart instance to exist');
    assert.ok(Array.isArray(chart.data.datasets), 'Expected chart.data.datasets array');
    assert.ok(
        chart.data.datasets.length >= expectedMinDatasets,
        `Expected >= ${expectedMinDatasets} datasets, got ${chart.data.datasets.length}`
    );
    for (const ds of chart.data.datasets) {
        assert.equal(typeof ds.label, 'string');
        assert.ok(ds.label.length > 0, 'Dataset label must be non-empty');
        assert.ok(Array.isArray(ds.data), `Dataset ${ds.label} data must be an array`);
        assert.ok(
            ds.data.length >= expectedMinPoints,
            `Dataset ${ds.label} expected >= ${expectedMinPoints} points, got ${ds.data.length}`
        );
        for (const pt of ds.data) {
            assert.equal(typeof pt.x, 'number', `Dataset ${ds.label} point.x must be number`);
            assert.ok(Number.isFinite(pt.x), `Dataset ${ds.label} point.x must be finite`);
            if (pt.y !== null) {
                assert.equal(typeof pt.y, 'number', `Dataset ${ds.label} point.y must be number or null`);
                assert.ok(Number.isFinite(pt.y), `Dataset ${ds.label} point.y must be finite`);
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Suite Execution
// ---------------------------------------------------------------------------

console.log('=== Offline Analyzer & AtlasFetch VM Test Suite ===\n');
console.log('1. espn-client.js (AtlasFetch) Unit Tests');

// Load AtlasFetch inside an isolated VM context for unit tests
const unitStorage = createStorage();
const unitVm = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    AbortController,
    sessionStorage: unitStorage,
    Date,
    Math,
    JSON,
    Promise,
    Error,
    Object,
    Array,
    String,
    Number,
    isFinite,
    parseFloat
});
unitVm.window = unitVm;
unitVm.globalThis = unitVm;
new vm.Script(SOURCES.espnClient, { filename: 'espn-client.js' }).runInContext(unitVm);
const AtlasFetch = unitVm.AtlasFetch;

await test('retries network errors, 5xx, and 429 with backoff and succeeds', async () => {
    const storage = createStorage();
    let calls = 0;
    const delays = [];
    const res = await AtlasFetch.fetchJson('https://example.test/nfl/schedule', {
        retries: 2,
        baseDelayMs: 50,
        ttlMs: AtlasFetch.TTL_SCHEDULE_MS,
        storage,
        sleep: async (ms) => { delays.push(ms); },
        validate: AtlasFetch.validators.espnSchedule,
        fetchImpl: async () => {
            calls++;
            if (calls === 1) throw new Error('ECONNRESET');
            if (calls === 2) return jsonResponse({}, 503);
            return jsonResponse({ events: [{ id: '1' }] }, 200);
        }
    });
    assert.equal(calls, 3);
    assert.equal(delays.length, 2);
    assert.ok(delays[0] >= 50 && delays[1] >= 100, 'Expected exponential backoff delays');
    assert.equal(res.fromCache, false);
    assert.equal(res.stale, false);
    assert.equal(res.data.events.length, 1);

    // Also verify 429 honors Retry-After
    let rateCalls = 0;
    let rateDelay = 0;
    await AtlasFetch.fetchJson('https://example.test/rate-limited', {
        retries: 1,
        baseDelayMs: 10,
        storage: null,
        sleep: async (ms) => { rateDelay = ms; },
        fetchImpl: async () => {
            rateCalls++;
            if (rateCalls === 1) return jsonResponse({}, 429, { 'Retry-After': '2' });
            return jsonResponse({ ok: true }, 200);
        }
    });
    assert.equal(rateCalls, 2);
    assert.ok(rateDelay >= 2000, `Expected Retry-After >= 2000ms, got ${rateDelay}`);
});

await test('aborts timed-out requests and surfaces kind="timeout"', async () => {
    let attempts = 0;
    await assert.rejects(
        () => AtlasFetch.fetchJson('https://example.test/hang', {
            timeoutMs: 20,
            retries: 1,
            baseDelayMs: 1,
            storage: null,
            sleep: async () => {},
            fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => {
                attempts++;
                signal.addEventListener('abort', () => reject(new Error('Aborted')));
            })
        }),
        (err) => err.kind === 'timeout'
    );
    assert.equal(attempts, 2);
});

await test('does NOT retry non-429 4xx responses (400, 404)', async () => {
    for (const status of [400, 404]) {
        let calls = 0;
        await assert.rejects(
            () => AtlasFetch.fetchJson(`https://example.test/err-${status}`, {
                retries: 3,
                storage: null,
                sleep: async () => {},
                fetchImpl: async () => {
                    calls++;
                    return jsonResponse({ message: 'client error' }, status);
                }
            }),
            (err) => err.kind === 'http' && err.status === status
        );
        assert.equal(calls, 1, `HTTP ${status} must not be retried`);
    }
});

await test('serves fresh TTL cache hits from sessionStorage without network calls', async () => {
    const storage = createStorage();
    let calls = 0;
    const url = 'https://example.test/cached-schedule';
    const first = await AtlasFetch.fetchJson(url, {
        ttlMs: 60_000,
        storage,
        validate: AtlasFetch.validators.espnSchedule,
        fetchImpl: async () => {
            calls++;
            return jsonResponse({ events: [{ id: 'abc' }] }, 200);
        }
    });
    assert.equal(first.fromCache, false);
    assert.equal(calls, 1);

    const second = await AtlasFetch.fetchJson(url, {
        ttlMs: 60_000,
        storage,
        validate: AtlasFetch.validators.espnSchedule,
        fetchImpl: async () => {
            calls++;
            throw new Error('Should not have hit network on fresh cache');
        }
    });
    assert.equal(calls, 1);
    assert.equal(second.fromCache, true);
    assert.equal(second.stale, false);
    assert.deepEqual(second.data, { events: [{ id: 'abc' }] });
});

await test('falls back to stale cache when expired and network fails', async () => {
    const storage = createStorage();
    const url = 'https://example.test/stale-schedule';
    storage.setItem(
        'atlas:fetch:v1:' + url,
        JSON.stringify({ t: Date.now() - 3_600_000, d: { events: [{ id: 'stale-1' }] } })
    );

    let calls = 0;
    const res = await AtlasFetch.fetchJson(url, {
        ttlMs: 1_000,
        retries: 1,
        storage,
        sleep: async () => {},
        validate: AtlasFetch.validators.espnSchedule,
        fetchImpl: async () => {
            calls++;
            return jsonResponse({}, 502);
        }
    });
    assert.equal(calls, 2);
    assert.equal(res.fromCache, true);
    assert.equal(res.stale, true);
    assert.deepEqual(res.data, { events: [{ id: 'stale-1' }] });
});

await test('rejects malformed payloads via validators without retrying or caching', async () => {
    const storage = createStorage();
    const badCases = [
        ['espnSchedule', AtlasFetch.validators.espnSchedule, { notEvents: [] }],
        ['espnSummary', AtlasFetch.validators.espnSummary, { boxscore: { notTeams: [] } }],
        ['mlbTeams', AtlasFetch.validators.mlbTeams, { teams: 'not-array' }],
        ['mlbSchedule', AtlasFetch.validators.mlbSchedule, { dates: 123 }]
    ];
    for (const [name, validate, badBody] of badCases) {
        let calls = 0;
        await assert.rejects(
            () => AtlasFetch.fetchJson(`https://example.test/bad-${name}`, {
                retries: 2,
                ttlMs: 60_000,
                storage,
                sleep: async () => {},
                validate,
                fetchImpl: async () => {
                    calls++;
                    return jsonResponse(badBody, 200);
                }
            }),
            (err) => err.kind === 'schema'
        );
        assert.equal(calls, 1, `Schema error for ${name} must not retry`);
        assert.equal(storage.size, 0, `Schema error for ${name} must not write cache`);
    }
});

console.log('\n2. check.js Upstream Schema Validators');

await test('check.js validators accept valid payloads and flag missing nested paths', async () => {
    const nflOk = validateNflSchedule(makeNflSchedulePayload(2, 3));
    assert.equal(nflOk.ok, true);
    assert.ok(nflOk.completedEventId);
    assert.equal(validateNflSchedule({ events: [{ id: '1' }] }).ok, false);

    assert.equal(validateNflSummary(makeNflSummaryPayload('401')).ok, true);
    assert.equal(validateNflSummary({ boxscore: { teams: [{}] } }).ok, false);

    assert.equal(validateNhlSchedule(makeNhlSchedulePayload(1, 3)).ok, true);
    assert.equal(validateNhlSchedule({ events: [{}] }).ok, false);

    assert.equal(validateMlbTeams(makeMlbTeamsPayload()).ok, true);
    assert.equal(validateMlbTeams({ teams: [{ id: 1 }] }).ok, false);

    assert.equal(validateMlbSchedule(makeMlbSchedulePayload(2)).ok, true);
    assert.equal(validateMlbSchedule({ dates: [] }).ok, true); // valid offseason
    assert.equal(validateMlbSchedule({ dates: [{ games: [{}] }] }).ok, false);
});

console.log('\n3. NFL Trend Analyzer VM Integration Tests');

await test('NFL normal season: loads 32 teams, enriches boxscores, supports rolling window & export', async () => {
    let summaryFetches = 0;
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nflHtml,
        pathname: '/tools/nfl-trend-analyzer/',
        fetchHandler: async (url) => {
            const schedMatch = url.match(/\/nfl\/teams\/(\d+)\/schedule/);
            if (schedMatch) return jsonResponse(makeNflSchedulePayload(Number(schedMatch[1]), 4));
            const sumMatch = url.match(/\/nfl\/summary\?event=(.+)$/);
            if (sumMatch) {
                summaryFetches++;
                return jsonResponse(makeNflSummaryPayload(sumMatch[1]));
            }
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.nflJs, 'nfl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.consoleErrors.length, 0, `Unexpected console.error: ${JSON.stringify(env.consoleErrors)}`);
    assert.equal(env.errorDiv.style.display, 'none');
    assert.equal(env.loading.style.display, 'none');
    assertValidChartDatasets(env.getActiveChart(), 32, 5);

    // Highlight Buffalo Bills (id=2) -> triggers enrichTeamWithBoxscores
    const teamSelect = env.doc.getElementById('team-select');
    teamSelect.value = '2';
    await teamSelect.dispatchEvent('change');
    assert.equal(summaryFetches, 4, 'Expected 4 completed-game summary fetches for highlighted team');

    // Rolling window mode + unsupported metric toggle
    const metricSelect = env.doc.getElementById('metric-select');
    const windowSelect = env.doc.getElementById('window-select');
    const winContainer = env.doc.getElementById('window-select-container');
    windowSelect.value = '3';
    await windowSelect.dispatchEvent('change');
    assertValidChartDatasets(env.getActiveChart(), 32, 5);
    assert.ok(env.getCurrentUrl().includes('window=3'));

    metricSelect.value = 'fourthDownPct'; // Not in NFL_ROLLING_SUPPORTED_METRICS
    await metricSelect.dispatchEvent('change');
    assert.equal(winContainer.style.display, 'none');

    // Export canvas & clear filters
    await env.doc.getElementById('export-chart-btn').click();
    await env.doc.getElementById('clear-filters').click();
    assertValidChartDatasets(env.getActiveChart(), 32, 5);
    env.cleanupTimers();
});

await test('NFL 0-game offseason: renders 32 teams at (0,0) and displays offseason notice', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nflHtml,
        pathname: '/tools/nfl-trend-analyzer/',
        fetchHandler: async (url) => {
            const schedMatch = url.match(/\/nfl\/teams\/(\d+)\/schedule/);
            if (schedMatch) {
                return jsonResponse({
                    events: [{
                        id: `fut-${schedMatch[1]}`,
                        date: '2026-09-10T20:00Z',
                        seasonType: { id: '2', type: 2 },
                        competitions: [{
                            status: { period: 0, type: { completed: false } },
                            competitors: [{ id: schedMatch[1] }, { id: '99' }]
                        }]
                    }]
                });
            }
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.nflJs, 'nfl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    const notice = env.doc.getElementById('nfl-offseason-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected nfl-offseason-notice to be visible');
    assert.match(notice.textContent, /Offseason|No completed/i);
    assertValidChartDatasets(env.getActiveChart(), 32, 1);
    env.cleanupTimers();
});

await test('NFL partial failure: logs console.error per failed team and renders remaining teams with notice', async () => {
    const failingIds = new Set([2, 15, 17, 20]);
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nflHtml,
        pathname: '/tools/nfl-trend-analyzer/',
        fetchHandler: async (url) => {
            const m = url.match(/\/nfl\/teams\/(\d+)\/schedule/);
            const id = m ? Number(m[1]) : 0;
            if (failingIds.has(id)) return jsonResponse({}, 500);
            return jsonResponse(makeNflSchedulePayload(id, 3));
        }
    });

    env.runScripts(SOURCES.nflJs, 'nfl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    assert.equal(env.consoleErrors.length, 4, 'Expected 4 per-team console.error logs');
    assert.ok(String(env.consoleErrors[0][0]).includes('Buffalo Bills'));
    const notice = env.doc.getElementById('nfl-data-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected partial-data notice');
    assertValidChartDatasets(env.getActiveChart(), 28, 4);
    assert.equal(env.getActiveChart().data.datasets.length, 28);
    env.cleanupTimers();
});

await test('NFL total failure + Retry: shows error with Retry button, then recovers cleanly on click', async () => {
    let shouldFail = true;
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nflHtml,
        pathname: '/tools/nfl-trend-analyzer/',
        fetchHandler: async (url) => {
            if (shouldFail) return jsonResponse({}, 503);
            const m = url.match(/\/nfl\/teams\/(\d+)\/schedule/);
            return jsonResponse(makeNflSchedulePayload(Number(m[1]), 3));
        }
    });

    env.runScripts(SOURCES.nflJs, 'nfl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'block', 'Expected errorDiv visible on total failure');
    const retryBtn = env.errorDiv.querySelector('.atlas-retry-btn');
    assert.ok(retryBtn, 'Expected .atlas-retry-btn inside errorDiv');

    shouldFail = false;
    await retryBtn.click();

    assert.equal(env.errorDiv.style.display, 'none', 'Expected errorDiv hidden after successful retry');
    assertValidChartDatasets(env.getActiveChart(), 32, 4);
    assert.equal(env.doc.getElementById('team-select').options.length, 33, 'Expected None + 32 unique team options');
    env.cleanupTimers();
});

console.log('\n4. NHL Trend Analyzer VM Integration Tests');

await test('NHL normal season: parses competitor.statistics without ReferenceError and renders 32 teams', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nhlHtml,
        pathname: '/tools/nhl-trend-analyzer/',
        fetchHandler: async (url) => {
            const m = url.match(/\/nhl\/teams\/(\d+)\/schedule/);
            if (m) return jsonResponse(makeNhlSchedulePayload(Number(m[1]), 4));
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.nhlJs, 'nhl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.consoleErrors.length, 0, `Unexpected NHL console.error: ${JSON.stringify(env.consoleErrors)}`);
    assert.equal(env.errorDiv.style.display, 'none');
    assertValidChartDatasets(env.getActiveChart(), 32, 5);
    // Verify real data (4 games + x=0 -> length 5), NOT fallback (10-14 games)
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 5);

    // Rolling window + export test
    const metricSelect = env.doc.getElementById('metric-select');
    const windowSelect = env.doc.getElementById('window-select');
    metricSelect.value = 'ppPct';
    await metricSelect.dispatchEvent('change');
    windowSelect.value = '3';
    await windowSelect.dispatchEvent('change');
    assertValidChartDatasets(env.getActiveChart(), 32, 5);

    await env.doc.getElementById('export-chart-btn').click();
    env.cleanupTimers();
});

await test('NHL 0-game offseason: renders 32 teams at (0,0) and displays offseason notice', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nhlHtml,
        pathname: '/tools/nhl-trend-analyzer/',
        fetchHandler: async () => jsonResponse({ events: [] })
    });

    env.runScripts(SOURCES.nhlJs, 'nhl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    const notice = env.doc.getElementById('nhl-offseason-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected nhl-offseason-notice to be visible');
    assertValidChartDatasets(env.getActiveChart(), 32, 1);
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 1);
    env.cleanupTimers();
});

await test('NHL partial failure: logs console.error per failed team and shows partial-data notice', async () => {
    const failingIds = new Set([1, 2, 5]);
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nhlHtml,
        pathname: '/tools/nhl-trend-analyzer/',
        fetchHandler: async (url) => {
            const m = url.match(/\/nhl\/teams\/(\d+)\/schedule/);
            const id = m ? Number(m[1]) : 0;
            if (failingIds.has(id)) return jsonResponse({}, 500);
            return jsonResponse(makeNhlSchedulePayload(id, 3));
        }
    });

    env.runScripts(SOURCES.nhlJs, 'nhl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.consoleErrors.length, 3);
    assert.ok(String(env.consoleErrors[0][0]).includes('Boston Bruins'));
    const notice = env.doc.getElementById('nhl-data-notice');
    assert.ok(notice && notice.style.display === 'block');
    assert.equal(env.getActiveChart().data.datasets.length, 29);
    env.cleanupTimers();
});

await test('NHL total failure + Retry: shows error + Retry button, then loads live NHL data on retry', async () => {
    let shouldFail = true;
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.nhlHtml,
        pathname: '/tools/nhl-trend-analyzer/',
        fetchHandler: async (url) => {
            if (shouldFail) throw new Error('Network unreachable');
            const m = url.match(/\/nhl\/teams\/(\d+)\/schedule/);
            return jsonResponse(makeNhlSchedulePayload(Number(m[1]), 3));
        }
    });

    env.runScripts(SOURCES.nhlJs, 'nhl-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'block', 'Expected errorDiv visible on NHL total failure');
    const retryBtn = env.errorDiv.querySelector('.atlas-retry-btn');
    assert.ok(retryBtn, 'Expected .atlas-retry-btn inside NHL errorDiv');

    shouldFail = false;
    await retryBtn.click();

    assert.equal(env.errorDiv.style.display, 'none');
    assertValidChartDatasets(env.getActiveChart(), 32, 4);
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 4, 'Expected live 3-game series after retry');
    assert.equal(env.doc.getElementById('team-select').options.length, 33);
    env.cleanupTimers();
});

console.log('\n5. Baseball (MLB) Trend Analyzer VM Integration Tests');

await test('MLB normal season: loads 30 teams, populates standings/awards, supports rolling window & export', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.mlbHtml,
        pathname: '/tools/baseball-trend-analyzer/',
        fetchHandler: async (url) => {
            if (url.includes('/api/v1/teams')) return jsonResponse(makeMlbTeamsPayload());
            if (url.includes('/api/v1/schedule')) return jsonResponse(makeMlbSchedulePayload(5));
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.mlbJs, 'baseball-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.consoleErrors.length, 0, `Unexpected MLB console.error: ${JSON.stringify(env.consoleErrors)}`);
    assert.equal(env.errorDiv.style.display, 'none');
    assertValidChartDatasets(env.getActiveChart(), 30, 6);
    assert.equal(env.doc.getElementById('awards-container').style.display, 'block');
    assert.equal(env.doc.getElementById('award-top10').children.length, 10);

    // Rolling window + export test
    const windowSelect = env.doc.getElementById('window-select');
    windowSelect.value = '3';
    await windowSelect.dispatchEvent('change');
    assertValidChartDatasets(env.getActiveChart(), 30, 6);

    await env.doc.getElementById('export-chart-btn').click();
    env.cleanupTimers();
});

await test('MLB 0-game offseason: keeps 30 real teams at (0,0), hides awards, and shows offseason notice', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.mlbHtml,
        pathname: '/tools/baseball-trend-analyzer/',
        fetchHandler: async (url) => {
            if (url.includes('/api/v1/teams')) return jsonResponse(makeMlbTeamsPayload());
            if (url.includes('/api/v1/schedule')) {
                return jsonResponse({
                    dates: [{
                        date: '2026-03-26',
                        games: [{
                            status: { statusCode: 'S' },
                            teams: {
                                home: { team: { id: 110, name: 'Baltimore Orioles' } },
                                away: { team: { id: 147, name: 'New York Yankees' } }
                            }
                        }]
                    }]
                });
            }
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.mlbJs, 'baseball-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    const notice = env.doc.getElementById('mlb-offseason-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected mlb-offseason-notice visible');
    assert.equal(env.doc.getElementById('awards-container').style.display, 'none');
    assertValidChartDatasets(env.getActiveChart(), 30, 1);
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 1, 'Offseason should plot (0,0), not 162 fake games');
    env.cleanupTimers();
});

await test('MLB partial failure & stale cache: survives /teams failure with live /schedule and surfaces notice', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.mlbHtml,
        pathname: '/tools/baseball-trend-analyzer/',
        fetchHandler: async (url) => {
            if (url.includes('/api/v1/teams')) return jsonResponse({}, 500);
            if (url.includes('/api/v1/schedule')) return jsonResponse(makeMlbSchedulePayload(4));
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.mlbJs, 'baseball-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    assert.equal(env.consoleErrors.length, 1);
    const notice = env.doc.getElementById('mlb-data-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected mlb-data-notice on partial failure');
    assertValidChartDatasets(env.getActiveChart(), 30, 5);
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 5);
    env.cleanupTimers();
});

await test('MLB total failure + Retry: shows error + Retry button, then loads live MLB data on retry', async () => {
    let shouldFail = true;
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.mlbHtml,
        pathname: '/tools/baseball-trend-analyzer/',
        fetchHandler: async (url) => {
            if (shouldFail) return jsonResponse({}, 503);
            if (url.includes('/api/v1/teams')) return jsonResponse(makeMlbTeamsPayload());
            if (url.includes('/api/v1/schedule')) return jsonResponse(makeMlbSchedulePayload(4));
            return jsonResponse({}, 404);
        }
    });

    env.runScripts(SOURCES.mlbJs, 'baseball-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'block', 'Expected errorDiv visible on MLB total failure');
    const retryBtn = env.errorDiv.querySelector('.atlas-retry-btn');
    assert.ok(retryBtn, 'Expected .atlas-retry-btn inside MLB errorDiv');

    shouldFail = false;
    await retryBtn.click();

    assert.equal(env.errorDiv.style.display, 'none', 'Expected errorDiv hidden after successful MLB retry');
    assertValidChartDatasets(env.getActiveChart(), 30, 5);
    assert.equal(env.getActiveChart().data.datasets[0].data.length, 5, 'Expected live 4-game series after retry');
    assert.equal(env.doc.getElementById('team-select').options.length, 31, 'Expected None + 30 unique MLB teams');
    env.cleanupTimers();
});

await test('Stale-cache fallback notice works end-to-end in analyzers when network goes offline', async () => {
    const env = createAnalyzerEnvironment({
        htmlSource: SOURCES.mlbHtml,
        pathname: '/tools/baseball-trend-analyzer/',
        fetchHandler: async () => { throw new Error('Offline'); }
    });
    const staleTime = Date.now() - 24 * 60 * 60 * 1000;
    env.sessionStorage.setItem(
        'atlas:fetch:v1:https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026',
        JSON.stringify({ t: staleTime, d: makeMlbTeamsPayload() })
    );
    env.sessionStorage.setItem(
        'atlas:fetch:v1:https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2026&gameType=R',
        JSON.stringify({ t: staleTime, d: makeMlbSchedulePayload(3) })
    );

    env.runScripts(SOURCES.mlbJs, 'baseball-trend-analyzer.js');
    await env.fireDOMContentLoaded();

    assert.equal(env.errorDiv.style.display, 'none');
    const notice = env.doc.getElementById('mlb-data-notice');
    assert.ok(notice && notice.style.display === 'block', 'Expected stale-cache mlb-data-notice');
    assert.match(notice.textContent, /cached/i);
    assertValidChartDatasets(env.getActiveChart(), 30, 4);
    env.cleanupTimers();
});

await test('Exhaustive metric, rolling-window, and tooltip sweep across NFL, NHL, and MLB', async () => {
    const suites = [
        {
            label: 'NFL',
            html: SOURCES.nflHtml,
            js: SOURCES.nflJs,
            path: '/tools/nfl-trend-analyzer/',
            minDatasets: 32,
            fetch: async (url) => {
                const m = url.match(/\/nfl\/teams\/(\d+)\/schedule/);
                return m ? jsonResponse(makeNflSchedulePayload(Number(m[1]), 4)) : jsonResponse({}, 404);
            }
        },
        {
            label: 'NHL',
            html: SOURCES.nhlHtml,
            js: SOURCES.nhlJs,
            path: '/tools/nhl-trend-analyzer/',
            minDatasets: 32,
            fetch: async (url) => {
                const m = url.match(/\/nhl\/teams\/(\d+)\/schedule/);
                return m ? jsonResponse(makeNhlSchedulePayload(Number(m[1]), 4)) : jsonResponse({}, 404);
            }
        },
        {
            label: 'MLB',
            html: SOURCES.mlbHtml,
            js: SOURCES.mlbJs,
            path: '/tools/baseball-trend-analyzer/',
            minDatasets: 30,
            fetch: async (url) => {
                if (url.includes('/api/v1/teams')) return jsonResponse(makeMlbTeamsPayload());
                if (url.includes('/api/v1/schedule')) return jsonResponse(makeMlbSchedulePayload(4));
                return jsonResponse({}, 404);
            }
        }
    ];

    for (const s of suites) {
        const env = createAnalyzerEnvironment({
            htmlSource: s.html,
            pathname: s.path,
            fetchHandler: s.fetch
        });
        env.runScripts(s.js, `${s.label.toLowerCase()}-trend-analyzer.js`);
        await env.fireDOMContentLoaded();

        const metricSelect = env.doc.getElementById('metric-select');
        const windowSelect = env.doc.getElementById('window-select');
        assert.ok(metricSelect.options.length >= 15, `Expected >= 15 metrics for ${s.label}`);

        for (const opt of metricSelect.options) {
            metricSelect.value = opt.value;
            windowSelect.value = 'cumulative';
            await metricSelect.dispatchEvent('change');
            const chartCum = env.getActiveChart();
            assertValidChartDatasets(chartCum, s.minDatasets, 4);

            // Invoke tooltip formatter on last data point
            const sampleDs = chartCum.data.datasets[0];
            const lastPt = sampleDs.data[sampleDs.data.length - 1];
            const labelFn = chartCum.options?.plugins?.tooltip?.callbacks?.label;
            if (labelFn) {
                const text = labelFn({ dataset: sampleDs, parsed: { x: lastPt.x, y: lastPt.y } });
                assert.equal(typeof text, 'string');
            }

            // Also test 3-game rolling window
            windowSelect.value = '3';
            await windowSelect.dispatchEvent('change');
            assertValidChartDatasets(env.getActiveChart(), s.minDatasets, 4);
        }
        env.cleanupTimers();
    }
});

console.log(`\nSummary: ${passedTests} passed, ${failedTests} failed, ${uncaughtErrors.length} uncaught.`);
if (failedTests > 0 || uncaughtErrors.length > 0) {
    process.exit(1);
}
