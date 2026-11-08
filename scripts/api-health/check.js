#!/usr/bin/env node
/**
 * Sports Trend Analyzer Upstream API Health Check
 *
 * Probes representative ESPN (NFL, NHL) and MLB Stats API endpoints using
 * Node 20+ built-in `fetch` (zero external dependencies) and validates the
 * exact JSON paths relied upon by:
 *   - website/static/js/nfl-trend-analyzer.js
 *   - website/static/js/nhl-trend-analyzer.js
 *   - website/static/js/baseball-trend-analyzer.js
 *
 * Exits 0 when all checks pass (or skip cleanly in offseason), 1 on any failure.
 */

import { pathToFileURL } from 'node:url';

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRIES = 2;
const BASE_DELAY_MS = 600;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, { timeoutMs = DEFAULT_TIMEOUT_MS, retries = DEFAULT_RETRIES } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const started = Date.now();
        try {
            const res = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'ProjectAtlas-ApiHealthCheck/1.0'
                }
            });
            if (!res.ok) {
                const retryable = res.status === 429 || (res.status >= 500 && res.status <= 599);
                const err = new Error(`HTTP ${res.status} ${res.statusText}`);
                err.retryable = retryable;
                throw err;
            }
            const json = await res.json();
            return { data: json, durationMs: Date.now() - started, attempts: attempt + 1 };
        } catch (err) {
            lastErr = controller.signal.aborted
                ? new Error(`Request timed out after ${timeoutMs}ms`)
                : err;
            const retryable = lastErr.retryable !== false;
            if (!retryable || attempt === retries) break;
            const backoff = BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
            await sleep(backoff);
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastErr;
}

export function validateNflSchedule(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { ok: false, errors: ['Root payload is not an object'], details: '' };
    }
    if (!Array.isArray(data.events)) {
        return { ok: false, errors: ['Missing events[] array'], details: '' };
    }

    let completedCount = 0;
    let sampleCompletedEventId = null;

    for (let i = 0; i < data.events.length; i++) {
        const ev = data.events[i];
        const prefix = `events[${i}]`;
        if (!ev || typeof ev !== 'object') {
            errors.push(`${prefix}: not an object`);
            continue;
        }
        if (ev.id === undefined || ev.id === null || String(ev.id).trim() === '') {
            errors.push(`${prefix}: missing id`);
        }
        if (!ev.date || Number.isNaN(Date.parse(ev.date))) {
            errors.push(`${prefix}: missing or unparseable date (${JSON.stringify(ev.date)})`);
        }
        if (!ev.seasonType || (ev.seasonType.id === undefined && ev.seasonType.type === undefined)) {
            errors.push(`${prefix}: missing seasonType.id / seasonType.type`);
        }
        const comp = Array.isArray(ev.competitions) ? ev.competitions[0] : null;
        if (!comp) {
            errors.push(`${prefix}: missing competitions[0]`);
            continue;
        }
        if (!comp.status || !comp.status.type || typeof comp.status.type.completed !== 'boolean') {
            errors.push(`${prefix}: missing boolean competitions[0].status.type.completed`);
            continue;
        }
        if (!Array.isArray(comp.competitors) || comp.competitors.length < 2) {
            errors.push(`${prefix}: competitions[0].competitors must have >= 2 entries`);
            continue;
        }
        for (let cIdx = 0; cIdx < comp.competitors.length; cIdx++) {
            const c = comp.competitors[cIdx];
            const cid = c && (c.id ?? (c.team && c.team.id));
            if (cid === undefined || cid === null) {
                errors.push(`${prefix}.competitors[${cIdx}]: missing id`);
            }
            if (comp.status.type.completed) {
                if (!c.score || (c.score.value === undefined && c.score.displayValue === undefined)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: completed game missing score.value/displayValue`);
                }
                if (c.leaders !== undefined && !Array.isArray(c.leaders)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: leaders is not an array`);
                }
                if (c.statistics !== undefined && !Array.isArray(c.statistics)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: statistics is not an array`);
                }
            }
        }
        if (comp.status.type.completed) {
            completedCount++;
            if (!sampleCompletedEventId && ev.id) {
                sampleCompletedEventId = String(ev.id);
            }
        }
        if (errors.length >= 10) break;
    }

    return {
        ok: errors.length === 0,
        errors,
        completedEventId: sampleCompletedEventId,
        details: `${data.events.length} events (${completedCount} completed)`
    };
}

export function validateNflSummary(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { ok: false, errors: ['Root payload is not an object'], details: '' };
    }
    if (!data.boxscore || !Array.isArray(data.boxscore.teams)) {
        return { ok: false, errors: ['Missing boxscore.teams[] array'], details: '' };
    }
    if (data.boxscore.teams.length < 2) {
        errors.push(`boxscore.teams[] expected >= 2 teams, got ${data.boxscore.teams.length}`);
    }

    let totalStats = 0;
    data.boxscore.teams.forEach((tb, idx) => {
        if (!tb || !tb.team || tb.team.id === undefined) {
            errors.push(`boxscore.teams[${idx}]: missing team.id`);
        }
        if (!Array.isArray(tb?.statistics)) {
            errors.push(`boxscore.teams[${idx}]: missing statistics[] array`);
        } else {
            totalStats += tb.statistics.length;
            tb.statistics.forEach((s, sIdx) => {
                if (!s || typeof s.name !== 'string') {
                    errors.push(`boxscore.teams[${idx}].statistics[${sIdx}]: missing string name`);
                } else if (s.value === undefined && s.displayValue === undefined) {
                    errors.push(`boxscore.teams[${idx}].statistics[${sIdx}] (${s.name}): missing value/displayValue`);
                }
            });
        }
    });

    return {
        ok: errors.length === 0,
        errors: errors.slice(0, 10),
        details: `${data.boxscore.teams.length} boxscore teams (${totalStats} stat entries)`
    };
}

export function validateNhlSchedule(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { ok: false, errors: ['Root payload is not an object'], details: '' };
    }
    if (!Array.isArray(data.events)) {
        return { ok: false, errors: ['Missing events[] array'], details: '' };
    }

    let completedCount = 0;
    for (let i = 0; i < data.events.length; i++) {
        const ev = data.events[i];
        const prefix = `events[${i}]`;
        if (!ev || typeof ev !== 'object') {
            errors.push(`${prefix}: not an object`);
            continue;
        }
        if (!ev.date || Number.isNaN(Date.parse(ev.date))) {
            errors.push(`${prefix}: missing or unparseable date (${JSON.stringify(ev.date)})`);
        }
        if (!ev.seasonType || (ev.seasonType.id === undefined && ev.seasonType.type === undefined)) {
            errors.push(`${prefix}: missing seasonType.id / seasonType.type`);
        }
        const comp = Array.isArray(ev.competitions) ? ev.competitions[0] : null;
        if (!comp) {
            errors.push(`${prefix}: missing competitions[0]`);
            continue;
        }
        if (!comp.status || !comp.status.type || typeof comp.status.type.completed !== 'boolean') {
            errors.push(`${prefix}: missing boolean competitions[0].status.type.completed`);
            continue;
        }
        if (!Array.isArray(comp.competitors) || comp.competitors.length < 2) {
            errors.push(`${prefix}: competitions[0].competitors must have >= 2 entries`);
            continue;
        }

        if (comp.status.type.completed) {
            completedCount++;
            if (typeof comp.status.period !== 'number') {
                errors.push(`${prefix}: completed game missing numeric competitions[0].status.period`);
            }
            comp.competitors.forEach((c, cIdx) => {
                const cid = c && (c.id ?? (c.team && c.team.id));
                if (cid === undefined || cid === null) {
                    errors.push(`${prefix}.competitors[${cIdx}]: missing id`);
                }
                if (!c || !c.score || (c.score.value === undefined && c.score.displayValue === undefined)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: completed game missing score.value/displayValue`);
                }
                if (c && c.linescore !== undefined && !Array.isArray(c.linescore)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: linescore is not an array`);
                }
                if (c && c.statistics !== undefined && !Array.isArray(c.statistics)) {
                    errors.push(`${prefix}.competitors[${cIdx}]: statistics is not an array`);
                }
            });
        }
        if (errors.length >= 10) break;
    }

    return {
        ok: errors.length === 0,
        errors,
        details: `${data.events.length} events (${completedCount} completed)`
    };
}

export function validateMlbTeams(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { ok: false, errors: ['Root payload is not an object'], details: '' };
    }
    if (!Array.isArray(data.teams)) {
        return { ok: false, errors: ['Missing teams[] array'], details: '' };
    }
    if (data.teams.length < 30) {
        errors.push(`Expected >= 30 MLB teams, received ${data.teams.length}`);
    }
    for (let i = 0; i < data.teams.length; i++) {
        const t = data.teams[i];
        const prefix = `teams[${i}]`;
        if (!t || typeof t.id !== 'number') errors.push(`${prefix}: missing numeric id`);
        if (!t || typeof t.name !== 'string' || !t.name.trim()) errors.push(`${prefix}: missing string name`);
        if (!t || !t.league || typeof t.league.id !== 'number') errors.push(`${prefix}: missing numeric league.id`);
        if (!t || !t.division || typeof t.division.id !== 'number') errors.push(`${prefix}: missing numeric division.id`);
        if (errors.length >= 10) break;
    }
    return {
        ok: errors.length === 0,
        errors,
        details: `${data.teams.length} MLB teams`
    };
}

export function validateMlbSchedule(data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
        return { ok: false, errors: ['Root payload is not an object'], details: '' };
    }
    if (data.dates !== undefined && !Array.isArray(data.dates)) {
        return { ok: false, errors: ['dates field is not an array'], details: '' };
    }
    const dates = data.dates || [];
    let totalGames = 0;
    let finalGames = 0;

    for (let dIdx = 0; dIdx < dates.length; dIdx++) {
        const dateObj = dates[dIdx];
        if (!dateObj || !Array.isArray(dateObj.games)) {
            errors.push(`dates[${dIdx}]: missing games[] array`);
            if (errors.length >= 10) break;
            continue;
        }
        for (let gIdx = 0; gIdx < dateObj.games.length; gIdx++) {
            totalGames++;
            const g = dateObj.games[gIdx];
            const prefix = `dates[${dIdx}].games[${gIdx}]`;
            if (!g || !g.status || typeof g.status.statusCode !== 'string') {
                errors.push(`${prefix}: missing string status.statusCode`);
                continue;
            }
            const home = g.teams && g.teams.home;
            const away = g.teams && g.teams.away;
            if (!home || !home.team || typeof home.team.id !== 'number') {
                errors.push(`${prefix}: missing numeric teams.home.team.id`);
            }
            if (!away || !away.team || typeof away.team.id !== 'number') {
                errors.push(`${prefix}: missing numeric teams.away.team.id`);
            }
            if (g.status.statusCode === 'F' || g.status.statusCode === 'O') {
                finalGames++;
                if (typeof home?.score !== 'number' || typeof away?.score !== 'number') {
                    errors.push(`${prefix}: Final game missing numeric home.score / away.score`);
                }
                if (g.linescore && g.linescore.innings !== undefined && !Array.isArray(g.linescore.innings)) {
                    errors.push(`${prefix}: linescore.innings is not an array`);
                }
            }
            if (errors.length >= 10) break;
        }
        if (errors.length >= 10) break;
    }

    return {
        ok: errors.length === 0,
        errors,
        details: `${dates.length} dates, ${totalGames} games (${finalGames} final)`
    };
}

async function runCheck(name, url, validator) {
    try {
        const { data, durationMs, attempts } = await fetchJsonWithRetry(url);
        const validation = validator(data);
        return {
            name,
            url,
            status: validation.ok ? 'PASS' : 'FAIL',
            durationMs,
            attempts,
            details: validation.details,
            errors: validation.errors,
            extra: validation
        };
    } catch (err) {
        return {
            name,
            url,
            status: 'FAIL',
            durationMs: 0,
            attempts: DEFAULT_RETRIES + 1,
            details: '',
            errors: [err && err.message ? err.message : String(err)],
            extra: null
        };
    }
}

async function main() {
    const mlbSeason = process.env.MLB_SEASON || String(new Date().getUTCFullYear());
    const results = [];

    console.log('=== Project Atlas Sports Trend Analyzer API Health Check ===');
    console.log(`Timestamp (UTC): ${new Date().toISOString()}`);
    console.log('');

    // 1. NFL Schedule (Buffalo Bills, id=2)
    const nflSchedUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/2/schedule';
    const nflSchedRes = await runCheck('NFL Schedule (ESPN)', nflSchedUrl, validateNflSchedule);
    results.push(nflSchedRes);

    // 2. NFL Summary (conditional on completed event ID from schedule)
    const completedEventId = nflSchedRes.extra && nflSchedRes.extra.completedEventId;
    if (completedEventId) {
        const nflSumUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${completedEventId}`;
        const nflSumRes = await runCheck(`NFL Summary (ESPN event=${completedEventId})`, nflSumUrl, validateNflSummary);
        results.push(nflSumRes);
    } else if (nflSchedRes.status === 'PASS') {
        results.push({
            name: 'NFL Summary (ESPN)',
            url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=<offseason>',
            status: 'SKIP',
            durationMs: 0,
            attempts: 0,
            details: 'No completed event ID in current NFL schedule (offseason/preseason)',
            errors: []
        });
    } else {
        results.push({
            name: 'NFL Summary (ESPN)',
            url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=<unavailable>',
            status: 'FAIL',
            durationMs: 0,
            attempts: 0,
            details: 'Blocked because NFL Schedule check failed',
            errors: ['Could not obtain event ID because NFL Schedule check failed']
        });
    }

    // 3. NHL Schedule (Boston Bruins, id=1)
    const nhlSchedUrl = 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/1/schedule';
    results.push(await runCheck('NHL Schedule (ESPN)', nhlSchedUrl, validateNhlSchedule));

    // 4. MLB Teams + Schedule
    const mlbTeamsUrl = `https://statsapi.mlb.com/api/v1/teams?sportId=1&season=${mlbSeason}`;
    const mlbSchedUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${mlbSeason}&gameType=R`;
    results.push(await runCheck(`MLB Teams (season=${mlbSeason})`, mlbTeamsUrl, validateMlbTeams));
    results.push(await runCheck(`MLB Schedule (season=${mlbSeason})`, mlbSchedUrl, validateMlbSchedule));

    // Print diagnostic summary
    let failedCount = 0;
    for (const r of results) {
        const timing = r.durationMs ? ` (${r.durationMs}ms, try #${r.attempts})` : '';
        const info = r.details ? ` — ${r.details}` : '';
        console.log(`[${r.status}] ${r.name}${timing}${info}`);
        console.log(`       URL: ${r.url}`);
        if (r.status === 'FAIL') {
            failedCount++;
            for (const e of r.errors) {
                console.error(`       ERROR: ${e}`);
            }
        }
    }

    console.log('');
    const passCount = results.filter((r) => r.status === 'PASS').length;
    const skipCount = results.filter((r) => r.status === 'SKIP').length;
    console.log(`Summary: ${passCount} passed, ${skipCount} skipped, ${failedCount} failed (total ${results.length} checks).`);

    if (failedCount > 0) {
        process.exit(1);
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch((err) => {
        console.error('Unhandled error in API health check:', err);
        process.exit(1);
    });
}
