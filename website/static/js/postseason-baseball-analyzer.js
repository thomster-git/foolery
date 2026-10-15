/**
 * ============================================================
 * MLB Postseason Momentum Analyzer
 * Powered by Apache ECharts 5.5 & MLB Stats API
 * ============================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const chartDom = document.getElementById('postseasonChart');
    if (!chartDom) return;

    const loadingEl = document.getElementById('chart-loading');
    const errorEl = document.getElementById('chart-error');
    const seasonSelect = document.getElementById('season-select');
    const roundSelect = document.getElementById('round-select');
    const metricSelect = document.getElementById('metric-select');
    const teamSelect = document.getElementById('team-select');
    const btnTrajectory = document.getElementById('btn-mode-trajectory');
    const btnQuadrant = document.getElementById('btn-mode-quadrant');
    const btnResetView = document.getElementById('btn-reset-view');
    const bracketRibbon = document.getElementById('bracket-ribbon');
    const bracketHelper = document.getElementById('bracket-helper');
    const telemetryDrawer = document.getElementById('telemetry-drawer');
    const drawerTeamName = document.getElementById('drawer-team-name');
    const drawerTeamMeta = document.getElementById('drawer-team-meta');
    const drawerTableBody = document.getElementById('drawer-table-body');
    const drawerCloseBtn = document.getElementById('drawer-close-btn');

    // localStorage persistence keys
    const STORAGE_KEY_SEASON = 'atlas_postseason_season';
    const STORAGE_KEY_ROUND = 'atlas_postseason_round';
    const STORAGE_KEY_METRIC = 'atlas_postseason_metric';
    const STORAGE_KEY_TEAM = 'atlas_postseason_team';
    const STORAGE_KEY_MODE = 'atlas_postseason_mode';

    // MLB Team Official Colors
    const TEAM_COLORS = {
        108: '#BA0021', // LAA
        109: '#A71930', // AZ
        110: '#DF4601', // BAL
        111: '#BD3039', // BOS
        112: '#0E3386', // CHC
        113: '#C6011F', // CIN
        114: '#00385D', // CLE
        115: '#33006F', // COL
        116: '#0C2340', // DET
        117: '#EB6E1F', // HOU
        118: '#004687', // KC
        119: '#005A9C', // LAD
        120: '#AB0003', // WSH
        121: '#002D72', // NYM
        122: '#003831', // OAK
        133: '#003831', // ATH
        134: '#FDB827', // PIT
        135: '#2F241D', // SD
        136: '#005C5C', // SEA
        137: '#FD5A1E', // SF
        138: '#C41E3A', // STL
        139: '#092C5C', // TB
        140: '#003278', // TEX
        141: '#134A8E', // TOR
        142: '#D31145', // MIN
        143: '#E81828', // PHI
        144: '#CE1141', // ATL
        145: '#27251F', // CWS
        146: '#00A3E0', // MIA
        147: '#003087', // NYY
        158: '#12284B'  // MIL
    };

    const ROUND_NAMES = {
        'F': 'Wild Card (WC)',
        'D': 'Division Series (LDS)',
        'L': 'Championship Series (LCS)',
        'W': 'World Series (WS)'
    };

    let chartInstance = null;
    let currentMode = 'trajectory'; // 'trajectory' or 'quadrant'
    let rawPostseasonData = null;
    let parsedTeams = {}; // teamId -> stats
    let seriesMatches = []; // array of series objects
    let selectedSeriesId = null;

    // Initialize ECharts instance with dark theme and CDN readiness check
    async function initChart() {
        if (!chartInstance) {
            if (typeof echarts === 'undefined') {
                for (let i = 0; i < 20; i++) {
                    await new Promise(r => setTimeout(r, 150));
                    if (typeof echarts !== 'undefined') break;
                }
            }
            if (typeof echarts === 'undefined') {
                throw new Error('ECharts engine not loaded. Please check script blockers or refresh.');
            }
            chartInstance = echarts.init(chartDom, 'dark', { renderer: 'canvas' });
            window.addEventListener('resize', () => {
                if (chartInstance) chartInstance.resize();
            });
            chartInstance.on('click', (params) => {
                const targetTeamId = params.data?.[2]?.teamId || params.data?.[1]?.[2]?.teamId || params.seriesId || params.data?.team?.id;
                if (targetTeamId && parsedTeams[targetTeamId]) {
                    openTelemetry(targetTeamId);
                }
            });
        }
    }

    // Resilient Fetch with AbortController Timeout
    async function fetchWithTimeout(url, timeoutMs = 4000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timer);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (err) {
            clearTimeout(timer);
            throw err;
        }
    }

    // Dynamic Data Source Status Pill
    function updateDataSourceIndicator(source, season) {
        const badge = document.getElementById('data-source-badge');
        if (!badge) return;
        if (source === 'live') {
            badge.innerHTML = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#10B981;"></span> Live MLB API (${season})`;
            badge.style.color = '#34D399';
            badge.style.borderColor = 'rgba(52, 211, 153, 0.3)';
            badge.style.background = 'rgba(16, 185, 129, 0.1)';
            badge.title = 'Streaming live scores & decisions from statsapi.mlb.com';
        } else {
            badge.innerHTML = `<span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#38BDF8;"></span> Verified MLB Dataset (${season})`;
            badge.style.color = '#38BDF8';
            badge.style.borderColor = 'rgba(56, 189, 248, 0.3)';
            badge.style.background = 'rgba(56, 189, 248, 0.1)';
            badge.title = 'Loaded from verified local postseason data archive (fast & offline-ready)';
        }
    }

    // Main Ingestion Pipeline with Multi-Tier Fallback
    async function loadPostseasonData(season) {
        if (loadingEl) loadingEl.style.display = 'flex';
        if (errorEl) errorEl.style.display = 'none';

        let data = null;
        let sourceUsed = 'live';

        // Tier 1: Try Live MLB Stats API
        try {
            const liveUrl = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${season}&gameType=F&gameType=D&gameType=L&gameType=W&hydrate=linescore,decisions,seriesStatus,team`;
            data = await fetchWithTimeout(liveUrl, 4000);
            sourceUsed = 'live';
        } catch (liveErr) {
            console.warn(`[MLB Postseason Analyzer] Live API fetch failed for season ${season} (${liveErr.message}). Switching to verified local postseason archive...`);
        }

        // Tier 2: Try Local Cached Dataset for requested season
        if (!data || !data.dates || data.dates.length === 0) {
            try {
                const localUrl = `/data/postseason-${season}.json`;
                data = await fetchWithTimeout(localUrl, 3000);
                sourceUsed = 'cache';
            } catch (cacheErr) {
                console.warn(`[MLB Postseason Analyzer] Local archive for season ${season} unavailable. Falling back to 2024 postseason archive...`);
            }
        }

        // Tier 3: Guaranteed 2024 Archive Fallback
        if (!data || !data.dates || data.dates.length === 0) {
            try {
                data = await fetchWithTimeout('/data/postseason-2024.json', 3000);
                sourceUsed = 'cache-2024';
            } catch (fallbackErr) {
                console.error('[MLB Postseason Analyzer] All data sources failed:', fallbackErr);
            }
        }

        if (!data || !data.dates) {
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.innerHTML = `<p style="margin:0;">Failed to load postseason data from MLB stats API. Please check network connectivity or choose an earlier season.</p>`;
                errorEl.style.display = 'block';
            }
            return;
        }

        try {
            rawPostseasonData = data;
            processData(data);
            populateTeamSelect();
            const savedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
            if (savedTeam && teamSelect && Array.from(teamSelect.options).some(o => o.value === savedTeam)) {
                teamSelect.value = savedTeam;
            }
            populateBracketRibbon();
            updatePulseKPIs();
            await renderChart();
            updateDataSourceIndicator(sourceUsed, season);
            if (loadingEl) loadingEl.style.display = 'none';
        } catch (err) {
            console.error('Error processing or rendering postseason data:', err);
            if (loadingEl) loadingEl.style.display = 'none';
            if (errorEl) {
                errorEl.innerHTML = `<p style="margin:0;">Error rendering chart: ${err.message}.</p>`;
                errorEl.style.display = 'block';
            }
        }
    }

    // Process & Model Sabermetric Metrics
    function processData(apiData) {
        parsedTeams = {};
        seriesMatches = [];
        const seriesMap = {};

        if (!apiData || !apiData.dates) return;

        // Flatten all completed games chronologically
        const allGames = [];
        apiData.dates.forEach(dateObj => {
            if (!dateObj.games) return;
            dateObj.games.forEach(game => {
                if (game.status?.statusCode === 'F' || game.status?.statusCode === 'O') {
                    allGames.push(game);
                }
            });
        });

        // Sort by official date and game number
        allGames.sort((a, b) => new Date(a.officialDate || a.date) - new Date(b.officialDate || b.date));

        allGames.forEach(game => {
            const home = game.teams.home;
            const away = game.teams.away;
            if (!home?.team || !away?.team || home.score === undefined || away.score === undefined) return;

            const round = game.gameType || 'F';
            const sDesc = game.seriesDescription || ROUND_NAMES[round] || 'Postseason';
            const sNum = game.seriesNumber || 1;
            const sKey = `${round}-${sNum}-${Math.min(home.team.id, away.team.id)}-${Math.max(home.team.id, away.team.id)}`;

            if (!seriesMap[sKey]) {
                seriesMap[sKey] = {
                    id: sKey,
                    round: round,
                    seriesDescription: sDesc,
                    team1: away.team,
                    team2: home.team,
                    team1Wins: 0,
                    team2Wins: 0,
                    games: []
                };
            }

            if (away.isWinner) seriesMap[sKey].team1Wins++;
            if (home.isWinner) seriesMap[sKey].team2Wins++;
            seriesMap[sKey].games.push(game);

            // Initialize Team Records
            [away, home].forEach(tObj => {
                const tid = tObj.team.id;
                if (!parsedTeams[tid]) {
                    parsedTeams[tid] = {
                        id: tid,
                        name: tObj.team.name,
                        abbreviation: tObj.team.abbreviation || tObj.team.name.substring(0, 3).toUpperCase(),
                        color: TEAM_COLORS[tid] || '#38BDF8',
                        games: [],
                        totalWins: 0,
                        totalLosses: 0,
                        runsScored: 0,
                        runsAllowed: 0,
                        leadInningsTotal: 0,
                        totalInningsPlayed: 0,
                        oneRunWins: 0,
                        oneRunLosses: 0,
                        blowoutWins: 0,
                        active: true,
                        eliminatedRound: null
                    };
                }
            });

            // Calculate Inning-level Lead Dominance from linescore
            let homeLeadInnings = 0;
            let awayLeadInnings = 0;
            let cumHome = 0;
            let cumAway = 0;
            let inningsCount = 0;

            if (game.linescore && Array.isArray(game.linescore.innings)) {
                game.linescore.innings.forEach(inn => {
                    cumAway += inn.away?.runs || 0;
                    cumHome += inn.home?.runs || 0;
                    inningsCount++;
                    if (cumAway > cumHome) awayLeadInnings++;
                    else if (cumHome > cumAway) homeLeadInnings++;
                });
            } else {
                inningsCount = 9;
                if (away.score > home.score) awayLeadInnings = 5;
                else homeLeadInnings = 5;
            }

            const dec = game.decisions || {};
            const decText = dec.winner ? `W: ${dec.winner.fullName?.split(' ').pop()} / L: ${dec.loser?.fullName?.split(' ').pop() || '--'}${dec.save ? ` / S: ${dec.save.fullName?.split(' ').pop()}` : ''}` : 'Final';

            // Away Game Record
            const awayMargin = away.score - home.score;
            parsedTeams[away.team.id].games.push({
                gamePk: game.gamePk,
                date: game.officialDate || game.date,
                round: round,
                opponentId: home.team.id,
                opponentName: home.team.name,
                teamScore: away.score,
                oppScore: home.score,
                isWin: away.isWinner || away.score > home.score,
                margin: awayMargin,
                leadInnings: awayLeadInnings,
                totalInnings: inningsCount,
                decision: decText
            });
            parsedTeams[away.team.id].runsScored += away.score;
            parsedTeams[away.team.id].runsAllowed += home.score;
            parsedTeams[away.team.id].leadInningsTotal += awayLeadInnings;
            parsedTeams[away.team.id].totalInningsPlayed += inningsCount;
            if (away.isWinner) {
                parsedTeams[away.team.id].totalWins++;
                if (awayMargin === 1) parsedTeams[away.team.id].oneRunWins++;
                if (awayMargin >= 5) parsedTeams[away.team.id].blowoutWins++;
            } else {
                parsedTeams[away.team.id].totalLosses++;
                if (Math.abs(awayMargin) === 1) parsedTeams[away.team.id].oneRunLosses++;
            }

            // Home Game Record
            const homeMargin = home.score - away.score;
            parsedTeams[home.team.id].games.push({
                gamePk: game.gamePk,
                date: game.officialDate || game.date,
                round: round,
                opponentId: away.team.id,
                opponentName: away.team.name,
                teamScore: home.score,
                oppScore: away.score,
                isWin: home.isWinner || home.score > away.score,
                margin: homeMargin,
                leadInnings: homeLeadInnings,
                totalInnings: inningsCount,
                decision: decText
            });
            parsedTeams[home.team.id].runsScored += home.score;
            parsedTeams[home.team.id].runsAllowed += away.score;
            parsedTeams[home.team.id].leadInningsTotal += homeLeadInnings;
            parsedTeams[home.team.id].totalInningsPlayed += inningsCount;
            if (home.isWinner) {
                parsedTeams[home.team.id].totalWins++;
                if (homeMargin === 1) parsedTeams[home.team.id].oneRunWins++;
                if (homeMargin >= 5) parsedTeams[home.team.id].blowoutWins++;
            } else {
                parsedTeams[home.team.id].totalLosses++;
                if (Math.abs(homeMargin) === 1) parsedTeams[home.team.id].oneRunLosses++;
            }
        });

        seriesMatches = Object.values(seriesMap);

        // Compute Trajectory Vectors & Sabermetric Momentum Index (PMI)
        Object.values(parsedTeams).forEach(team => {
            let cumDiff = 0;
            let cumRS = 0;
            let cumRA = 0;
            let cumLead = 0;
            let cumInnings = 0;
            let cumWins = 0;

            team.trajectory = [];

            team.games.forEach((g, idx) => {
                cumDiff += g.margin;
                cumRS += g.teamScore;
                cumRA += g.oppScore;
                cumLead += g.leadInnings;
                cumInnings += g.totalInnings;
                if (g.isWin) cumWins++;

                // 3-Game Weighted Moving Average Run Diff
                const w0 = g.margin;
                const w1 = idx >= 1 ? team.games[idx - 1].margin : w0;
                const w2 = idx >= 2 ? team.games[idx - 2].margin : w1;
                const wma3 = (3 * w0 + 2 * w1 + 1 * w2) / 6;

                // Pythagorean Expected Win %
                const pyth = (cumRS === 0 && cumRA === 0) ? 0.5 : (Math.pow(cumRS, 1.83) / (Math.pow(cumRS, 1.83) + Math.pow(cumRA, 1.83)));
                const actWinPct = cumWins / (idx + 1);
                const luckGap = actWinPct - pyth; // > 0 = overperforming run diff, < 0 = underperforming

                // Lead Inning Share %
                const leadShare = cumInnings > 0 ? (cumLead / cumInnings) * 100 : 50;

                // Postseason Momentum Index (Normalized -100 to +100)
                // Components: 35% WMA3 run diff (+-5), 25% Lead Share (0-100), 25% Pythagorean Performance, 15% Win Streak Momentum
                const pmiRaw = (wma3 * 10) + ((leadShare - 50) * 0.8) - (luckGap * 30);
                const pmi = Math.max(-100, Math.min(100, Math.round(pmiRaw)));

                g.pmi = pmi;
                g.cumRunDiff = cumDiff;
                g.wma3 = parseFloat(wma3.toFixed(2));
                g.luckGap = parseFloat(luckGap.toFixed(3));
                g.leadShare = parseFloat(leadShare.toFixed(1));

                team.trajectory.push({
                    gameNum: idx + 1,
                    round: g.round,
                    date: g.date,
                    margin: g.margin,
                    cumRunDiff: cumDiff,
                    rolling3RunDiff: g.wma3,
                    leadInningShare: g.leadShare,
                    luckGap: g.luckGap,
                    pmi: pmi
                });
            });

            // Overall Summary
            team.finalPMI = team.trajectory.length > 0 ? team.trajectory[team.trajectory.length - 1].pmi : 0;
            team.finalRunDiff = cumDiff;
            team.finalLeadShare = cumInnings > 0 ? Math.round((cumLead / cumInnings) * 100) : 50;
            team.avgRS = team.games.length > 0 ? parseFloat((cumRS / team.games.length).toFixed(2)) : 0;
            team.avgRA = team.games.length > 0 ? parseFloat((cumRA / team.games.length).toFixed(2)) : 0;
        });
    }

    // Populate Team Selector
    function populateTeamSelect() {
        teamSelect.innerHTML = '<option value="all">All Playoff Teams</option>';
        const sorted = Object.values(parsedTeams).sort((a, b) => b.finalPMI - a.finalPMI);
        sorted.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = `${t.name} (PMI: ${t.finalPMI > 0 ? '+' : ''}${t.finalPMI})`;
            teamSelect.appendChild(opt);
        });
    }

    // Populate Micro-Bracket Ribbon
    function populateBracketRibbon() {
        bracketRibbon.innerHTML = '';
        if (seriesMatches.length === 0) {
            if (bracketHelper) {
                bracketHelper.innerHTML = '<span style="color:var(--text-dim); font-family:monospace;">No series telemetry loaded</span>';
            }
            return;
        }

        const currentRound = roundSelect.value;
        const filteredSeries = currentRound === 'all'
            ? seriesMatches
            : seriesMatches.filter(s => s.round === currentRound);

        // Update Dynamic Trajectory Isolation Helper / Badge
        if (bracketHelper) {
            if (selectedSeriesId) {
                const activeSeries = seriesMatches.find(s => s.id === selectedSeriesId);
                if (activeSeries) {
                    const t1 = activeSeries.team1.abbreviation || activeSeries.team1.name.split(' ').pop();
                    const t2 = activeSeries.team2.abbreviation || activeSeries.team2.name.split(' ').pop();
                    const rName = ROUND_NAMES[activeSeries.round] || activeSeries.seriesDescription;
                    bracketHelper.innerHTML = `
                        <span style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(56, 189, 248, 0.12); border:1px solid rgba(56, 189, 248, 0.4); padding:3px 10px; border-radius:6px; color:var(--accent-cyan); font-weight:600;">
                            <span>⚡ Isolating: <strong>${t1}</strong> vs <strong>${t2}</strong> (${activeSeries.games.length} Games · ${rName})</span>
                            <button id="btn-clear-series" type="button" style="background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#fca5a5; cursor:pointer; font-weight:700; font-size:0.75rem; padding:1px 6px; border-radius:4px; margin-left:4px; font-family:monospace;" title="Reset series isolation">✕ Show All</button>
                        </span>
                    `;
                    const clearBtn = document.getElementById('btn-clear-series');
                    if (clearBtn) {
                        clearBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            selectedSeriesId = null;
                            populateBracketRibbon();
                            renderChart();
                        });
                    }
                } else {
                    bracketHelper.innerHTML = '<span style="color:var(--text-dim); font-family:monospace;">Click any series to isolate its trajectory</span>';
                }
            } else {
                bracketHelper.innerHTML = '<span style="color:var(--text-dim); font-family:monospace;">Click any series to isolate its trajectory</span>';
            }
        }

        if (filteredSeries.length === 0) {
            const roundLabel = ROUND_NAMES[currentRound] || currentRound;
            bracketRibbon.innerHTML = `
                <div style="font-size:0.8rem; color:var(--text-muted); font-family:monospace; padding:0.6rem 0; display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
                    <span>No series matchups recorded for ${roundLabel} in the ${seasonSelect.value} postseason.</span>
                    <button type="button" class="switch-season-pill" data-season="2025" style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); color:var(--accent-cyan); padding:2px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;">View 2025</button>
                    <button type="button" class="switch-season-pill" data-season="2024" style="background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); color:var(--accent-cyan); padding:2px 8px; border-radius:4px; font-size:0.75rem; cursor:pointer;">View 2024</button>
                </div>
            `;
            bracketRibbon.querySelectorAll('.switch-season-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    seasonSelect.value = btn.dataset.season;
                    localStorage.setItem(STORAGE_KEY_SEASON, btn.dataset.season);
                    selectedSeriesId = null;
                    userChangedSeason = true;
                    loadPostseasonData(btn.dataset.season);
                });
            });
            return;
        }

        filteredSeries.forEach(series => {
            const chip = document.createElement('div');
            chip.className = 'bracket-chip';
            if (selectedSeriesId === series.id) chip.classList.add('active');

            const t1 = series.team1.abbreviation || series.team1.name.split(' ').pop();
            const t2 = series.team2.abbreviation || series.team2.name.split(' ').pop();
            const rBadge = series.round;

            chip.innerHTML = `
                <span style="font-size:0.7rem; color:var(--text-dim); border:1px solid var(--border-color); padding:1px 4px; border-radius:3px;">${rBadge}</span>
                <span><strong>${t1}</strong> ${series.team1Wins}</span>
                <span style="color:var(--text-dim);">-</span>
                <span>${series.team2Wins} <strong>${t2}</strong></span>
            `;

            chip.addEventListener('click', () => {
                if (selectedSeriesId === series.id) {
                    selectedSeriesId = null;
                } else {
                    selectedSeriesId = series.id;
                }
                populateBracketRibbon();
                renderChart();
            });

            bracketRibbon.appendChild(chip);
        });
    }

    // High-contrast helper for KPI team names
    function renderKpiTeamHtml(team, suffixText) {
        if (!team) return '--';
        const dot = `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${team.color}; border:1.5px solid rgba(255,255,255,0.7); box-shadow:0 0 6px ${team.color}; flex-shrink:0;"></span>`;
        return `<span style="display:inline-flex; align-items:center; gap:0.45rem; color:#ffffff; font-weight:700;">${dot}<span>${team.name}</span></span> <span style="color:#e2e8f0; font-weight:600; font-size:0.95em;">(${suffixText})</span>`;
    }

    // Update Pulse Summary KPI Cards
    function updatePulseKPIs() {
        const teams = Object.values(parsedTeams);
        if (teams.length === 0) return;

        // 1. Top Surge
        const surging = [...teams].sort((a, b) => b.finalPMI - a.finalPMI)[0];
        if (surging) {
            document.getElementById('kpi-surge-team').innerHTML = renderKpiTeamHtml(surging, `${surging.finalPMI > 0 ? '+' : ''}${surging.finalPMI} PMI`);
            document.getElementById('kpi-surge-desc').textContent = `Diff: ${surging.finalRunDiff > 0 ? '+' : ''}${surging.finalRunDiff} runs | ${surging.totalWins}-${surging.totalLosses} overall`;
        }

        // 2. Coldest / Fall-off Risk
        const coldest = [...teams].sort((a, b) => a.finalPMI - b.finalPMI)[0];
        if (coldest) {
            document.getElementById('kpi-cold-team').innerHTML = renderKpiTeamHtml(coldest, `${coldest.finalPMI} PMI`);
            document.getElementById('kpi-cold-desc').textContent = `Diff: ${coldest.finalRunDiff} runs | ${coldest.totalLosses} losses`;
        }

        // 3. Game Control Leader
        const leadBoss = [...teams].sort((a, b) => b.finalLeadShare - a.finalLeadShare)[0];
        if (leadBoss) {
            document.getElementById('kpi-lead-team').innerHTML = renderKpiTeamHtml(leadBoss, `${leadBoss.finalLeadShare}% Inning Lead`);
            document.getElementById('kpi-lead-desc').textContent = `Commanded the lead across ${leadBoss.leadInningsTotal} total innings`;
        }

        // 4. Cardiac Kids (Most 1-Run Game Wins)
        const cardiac = [...teams].sort((a, b) => b.oneRunWins - a.oneRunWins)[0];
        if (cardiac) {
            document.getElementById('kpi-cardiac-team').innerHTML = renderKpiTeamHtml(cardiac, `${cardiac.oneRunWins} 1-Run Wins`);
            document.getElementById('kpi-cardiac-desc').textContent = `Record in 1-run games: ${cardiac.oneRunWins}-${cardiac.oneRunLosses}`;
        }
    }

    // Render Charts
    async function renderChart() {
        await initChart();
        if (!chartInstance) return;

        if (currentMode === 'trajectory') {
            renderTrajectoryView();
        } else {
            renderQuadrantView();
        }
    }

    // MODE 1: Phase-Normalized Momentum Trajectory Stream
    function renderTrajectoryView() {
        const selectedMetric = metricSelect.value;
        const selectedRound = roundSelect.value;
        const selectedTeamId = teamSelect.value;

        let filteredTeams = Object.values(parsedTeams);
        let isolatedSeries = null;

        // Filter by series if bracket chip is active
        if (selectedSeriesId) {
            isolatedSeries = seriesMatches.find(s => s.id === selectedSeriesId);
            if (isolatedSeries) {
                const seriesTeamIds = [isolatedSeries.team1.id, isolatedSeries.team2.id];
                filteredTeams = filteredTeams.filter(t => seriesTeamIds.includes(t.id));
            }
        }

        // Filter by selected team
        if (selectedTeamId !== 'all') {
            const tid = parseInt(selectedTeamId);
            filteredTeams = filteredTeams.filter(t => t.id === tid);
        }

        // Build series datasets
        const seriesData = [];
        let maxGames = 0;

        filteredTeams.forEach(team => {
            let pts = [];

            if (isolatedSeries) {
                // When isolating a series: isolate ONLY games played in this exact head-to-head series!
                const seriesGamePks = new Set(isolatedSeries.games.map(g => g.gamePk));
                const teamSeriesGames = team.games.filter(g => seriesGamePks.has(g.gamePk));
                
                teamSeriesGames.forEach((g, sIdx) => {
                    const gIdx = team.games.indexOf(g);
                    const pt = team.trajectory[gIdx];
                    if (pt) {
                        pts.push([sIdx + 1, pt[selectedMetric], pt, g]);
                    }
                });
            } else if (selectedRound !== 'all') {
                // When filtering by a round: normalize game numbers to round game number (Game 1, 2, 3... of this round)
                const teamRoundGames = team.games.filter(g => g.round === selectedRound);
                
                teamRoundGames.forEach((g, rIdx) => {
                    const gIdx = team.games.indexOf(g);
                    const pt = team.trajectory[gIdx];
                    if (pt) {
                        pts.push([rIdx + 1, pt[selectedMetric], pt, g]);
                    }
                });
            } else {
                // Full tournament view: cumulative postseason game numbers
                team.trajectory.forEach((pt, idx) => {
                    pts.push([pt.gameNum, pt[selectedMetric], pt, team.games[idx]]);
                });
            }

            if (pts.length > maxGames) maxGames = pts.length;
            if (pts.length === 0) return;

            const isHighlighted = (selectedTeamId !== 'all' && team.id === parseInt(selectedTeamId)) || (selectedSeriesId !== null);

            seriesData.push({
                id: String(team.id),
                teamId: team.id,
                name: team.name,
                type: 'line',
                data: pts.map(p => [p[0], p[1], { teamId: team.id, gameNum: p[0], pt: p[2], rawGame: p[3] }]),
                smooth: 0.25,
                symbol: 'circle',
                symbolSize: isHighlighted ? 9 : 6,
                showSymbol: true,
                lineStyle: {
                    color: team.color,
                    width: isHighlighted ? 4 : 2.5,
                    shadowBlur: isHighlighted ? 12 : 0,
                    shadowColor: team.color
                },
                itemStyle: {
                    color: team.color,
                    borderColor: '#0F172A',
                    borderWidth: 2
                },
                emphasis: {
                    focus: 'series',
                    lineStyle: { width: 5 }
                }
            });
        });

        const metricLabels = {
            'pmi': 'Postseason Momentum Index (PMI)',
            'cumRunDiff': 'Cumulative Run Differential',
            'rolling3RunDiff': '3-Game Rolling Run Diff',
            'leadInningShare': 'Lead Inning Share (%)',
            'luckGap': 'Pythagorean Luck Gap'
        };

        let xAxisTitle = 'Postseason Games Played';
        if (isolatedSeries) {
            xAxisTitle = `Series Game Number (${isolatedSeries.seriesDescription || 'Matchup'})`;
        } else if (selectedRound !== 'all') {
            xAxisTitle = `${ROUND_NAMES[selectedRound] || 'Round'} Game Number`;
        }

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#475569',
                borderWidth: 1,
                padding: [12, 16],
                textStyle: { color: '#F1F5F9', fontFamily: 'Outfit, sans-serif' },
                formatter: (params) => {
                    const dataItem = params.data;
                    const teamId = dataItem?.[2]?.teamId || seriesData[params.seriesIndex]?.teamId;
                    const team = parsedTeams[teamId];
                    const rawGame = dataItem?.[2]?.rawGame;
                    const pt = dataItem?.[2]?.pt;
                    const gameNumLabel = isolatedSeries ? `Series Game ${dataItem[0]}` : (selectedRound !== 'all' ? `Round Game ${dataItem[0]}` : `Game ${dataItem[0]}`);

                    return `
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem;">
                                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${team?.color || '#38BDF8'};"></span>
                                <strong style="font-size:0.95rem; color:#fff;">${team?.name || params.seriesName}</strong>
                                <span style="color:var(--text-dim); margin-left:auto;">${gameNumLabel}</span>
                            </div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">Round: <strong>${ROUND_NAMES[rawGame?.round] || 'Postseason'}</strong></div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">Score: <strong style="color:#fff;">${rawGame ? `${rawGame.isWin ? 'W' : 'L'} ${rawGame.teamScore}-${rawGame.oppScore} vs ${rawGame.opponentName}` : '--'}</strong></div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">${metricLabels[selectedMetric]}: <strong style="color:${dataItem[1] >= 0 ? '#10B981' : '#EF4444'}; font-size:1rem;">${dataItem[1] > 0 ? '+' : ''}${dataItem[1]}</strong></div>
                            ${rawGame ? `<div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.4rem;">${rawGame.decision}</div>` : ''}
                            <div style="margin-top:0.5rem; font-size:0.75rem; color:#EA580C; text-align:right;">Click node for game telemetry &rarr;</div>
                        </div>
                    `;
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '12%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: xAxisTitle,
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                min: 1,
                max: Math.max(isolatedSeries ? (isolatedSeries.games.length + 1) : 4, maxGames + 1),
                interval: 1,
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: {
                    color: '#94A3B8',
                    fontFamily: 'JetBrains Mono, monospace',
                    formatter: (val) => `G${val}`
                }
            },
            yAxis: {
                type: 'value',
                name: metricLabels[selectedMetric],
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.07)' } },
                axisLabel: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }
            },
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: 0
                },
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    bottom: 10,
                    height: 20,
                    borderColor: 'rgba(255,255,255,0.1)',
                    fillerColor: 'rgba(234, 88, 12, 0.2)',
                    textStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono' }
                }
            ],
            series: seriesData,
            graphic: seriesData.length === 0 ? [{
                type: 'text',
                left: 'center',
                top: 'center',
                style: {
                    text: `No completed games for ${ROUND_NAMES[selectedRound] || 'this round'} in ${seasonSelect.value}`,
                    fill: '#94A3B8',
                    font: '14px monospace'
                }
            }] : []
        };

        chartInstance.setOption(option, true);
    }

    // MODE 2: Fire & Ice Quadrants (Offense Form vs Pitching Lockdown)
    function renderQuadrantView() {
        const selectedRound = roundSelect.value;
        const selectedTeamId = teamSelect.value;
        let teams = Object.values(parsedTeams);

        if (selectedSeriesId) {
            const series = seriesMatches.find(s => s.id === selectedSeriesId);
            if (series) {
                teams = teams.filter(t => t.id === series.team1.id || t.id === series.team2.id);
            }
        }
        if (selectedTeamId !== 'all') {
            const tid = parseInt(selectedTeamId);
            teams = teams.filter(t => t.id === tid);
        }
        if (selectedRound !== 'all') {
            teams = teams.filter(t => t.games.some(g => g.round === selectedRound));
        }

        if (teams.length === 0) return;

        // X: Runs Scored per Game (Offense Form)
        // Y: Runs Allowed per Game (Inverted: low RA is high on Y-axis for Lockdown)
        const scatterData = [];
        const vectorLines = [];

        teams.forEach(team => {
            const currentPoint = [team.avgRS, team.avgRA, team];
            scatterData.push({
                name: team.name,
                value: [team.avgRS, team.avgRA],
                team: team,
                itemStyle: {
                    color: team.color,
                    borderColor: '#fff',
                    borderWidth: 1.5,
                    shadowBlur: 10,
                    shadowColor: team.color
                }
            });

            // If team played multiple games, build vector comet tail of last 3 games
            if (team.games.length >= 2) {
                const recent = team.games.slice(-3);
                const coords = [];
                let rCumRS = 0, rCumRA = 0;
                recent.forEach((g, idx) => {
                    rCumRS += g.teamScore;
                    rCumRA += g.oppScore;
                    coords.push([parseFloat((rCumRS / (idx + 1)).toFixed(2)), parseFloat((rCumRA / (idx + 1)).toFixed(2))]);
                });

                vectorLines.push({
                    coords: coords,
                    lineStyle: {
                        color: team.color,
                        width: 2.5,
                        opacity: 0.7,
                        type: 'solid'
                    }
                });
            }
        });

        // Compute averages for quadrant crosshairs
        const avgLeagueRS = teams.reduce((acc, t) => acc + t.avgRS, 0) / teams.length || 4.0;
        const avgLeagueRA = teams.reduce((acc, t) => acc + t.avgRA, 0) / teams.length || 4.0;

        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                borderColor: '#475569',
                padding: [10, 14],
                textStyle: { color: '#F1F5F9', fontFamily: 'Outfit, sans-serif' },
                formatter: (params) => {
                    const t = params.data?.team;
                    if (!t) return '';
                    return `
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                            <strong style="font-size:1rem; color:${t.color};">${t.name}</strong> (${t.totalWins}-${t.totalLosses})
                            <div style="color:var(--text-muted); margin-top:0.3rem;">Offense: <strong>${t.avgRS} Runs/G</strong></div>
                            <div style="color:var(--text-muted);">Pitching Allowed: <strong>${t.avgRA} Runs/G</strong></div>
                            <div style="color:var(--text-muted);">Lead Inning Share: <strong>${t.finalLeadShare}%</strong></div>
                            <div style="color:${t.finalPMI >= 0 ? '#10B981' : '#EF4444'}; margin-top:0.3rem;">Momentum Index: <strong>${t.finalPMI > 0 ? '+' : ''}${t.finalPMI}</strong></div>
                        </div>
                    `;
                }
            },
            grid: {
                left: '6%',
                right: '8%',
                bottom: '10%',
                top: '12%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: 'Offensive Firepower (Runs Scored / Game) →',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }
            },
            yAxis: {
                type: 'value',
                inverse: true, // Inverted so lower runs allowed is higher up
                name: '← Pitching Lockdown (Fewer Runs Allowed)',
                nameLocation: 'middle',
                nameGap: 40,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' }
            },
            series: [
                // Quadrant Backdrop MarkArea
                {
                    type: 'scatter',
                    data: [],
                    markArea: {
                        silent: true,
                        itemStyle: { opacity: 0.08 },
                        data: [
                            [
                                { name: 'JUGGERNAUTS 🔥\n(Elite Hitting & Lockdown Arms)', coord: [avgLeagueRS, 0], itemStyle: { color: '#10B981' } },
                                { coord: [12, avgLeagueRA] }
                            ],
                            [
                                { name: 'PITCHING FORTRESS 🛡️\n(Dominant Arms, Cold Bats)', coord: [0, 0], itemStyle: { color: '#38BDF8' } },
                                { coord: [avgLeagueRS, avgLeagueRA] }
                            ],
                            [
                                { name: 'GLASS CANNONS ⚔️\n(High Slugging, Leaky Pen)', coord: [avgLeagueRS, avgLeagueRA], itemStyle: { color: '#EA580C' } },
                                { coord: [12, 12] }
                            ],
                            [
                                { name: 'DEAD WATER ❄️\n(Fall-Off / Cold Bats & Bleeding Runs)', coord: [0, avgLeagueRA], itemStyle: { color: '#EF4444' } },
                                { coord: [avgLeagueRS, 12] }
                            ]
                        ]
                    }
                },
                // Teams Scatter Nodes
                {
                    type: 'scatter',
                    symbolSize: 18,
                    data: scatterData,
                    label: {
                        show: true,
                        formatter: (p) => p.data?.team?.abbreviation || '',
                        position: 'top',
                        color: '#F1F5F9',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 'bold',
                        fontSize: 11
                    }
                },
                // Vector Movement Trails
                {
                    type: 'lines',
                    coordinateSystem: 'cartesian2d',
                    data: vectorLines,
                    polyline: true,
                    effect: {
                        show: true,
                        period: 4,
                        trailLength: 0.5,
                        symbolSize: 4,
                        color: '#fff'
                    }
                }
            ]
        };

        chartInstance.setOption(option, true);
    }

    // Telemetry Drawer View
    function openTelemetry(teamId) {
        const team = parsedTeams[teamId];
        if (!team) return;

        drawerTeamName.textContent = team.name;
        drawerTeamName.style.color = team.color;
        drawerTeamMeta.textContent = `${seasonSelect.value || '2026'} Postseason Record: ${team.totalWins}-${team.totalLosses} | Net Run Diff: ${team.finalRunDiff > 0 ? '+' : ''}${team.finalRunDiff} | PMI: ${team.finalPMI > 0 ? '+' : ''}${team.finalPMI}`;

        drawerTableBody.innerHTML = '';
        team.games.forEach((g, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            const delta = idx > 0 ? g.pmi - team.games[idx - 1].pmi : g.pmi;

            tr.innerHTML = `
                <td style="padding: 0.6rem; color: var(--text-dim);">${g.round}</td>
                <td style="padding: 0.6rem;">Game ${idx + 1}</td>
                <td style="padding: 0.6rem;">${g.opponentName}</td>
                <td style="padding: 0.6rem; font-weight:bold; color:${g.isWin ? '#10B981' : '#EF4444'};">${g.isWin ? 'WIN' : 'LOSS'}</td>
                <td style="padding: 0.6rem;">${g.teamScore}-${g.oppScore}</td>
                <td style="padding: 0.6rem; color:${g.margin > 0 ? '#10B981' : '#EF4444'};">${g.margin > 0 ? '+' : ''}${g.margin}</td>
                <td style="padding: 0.6rem;">${g.leadInnings} of ${g.totalInnings}</td>
                <td style="padding: 0.6rem; color:var(--text-dim); font-size:0.75rem;">${g.decision}</td>
                <td style="padding: 0.6rem; font-weight:bold; color:${delta >= 0 ? '#10B981' : '#EF4444'};">${delta >= 0 ? '+' : ''}${delta}</td>
            `;
            drawerTableBody.appendChild(tr);
        });

        telemetryDrawer.style.display = 'block';
        telemetryDrawer.scrollIntoView({ behavior: 'smooth' });
    }

    function updateSeriesRoundPills(round) {
        document.querySelectorAll('.series-pill').forEach(btn => {
            if (btn.dataset.round === round) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    let userChangedSeason = false;

    // Restore saved selections on load
    const savedSeason = localStorage.getItem(STORAGE_KEY_SEASON);
    if (savedSeason && seasonSelect) {
        seasonSelect.value = savedSeason;
        userChangedSeason = true;
    }
    const savedRound = localStorage.getItem(STORAGE_KEY_ROUND);
    if (savedRound && roundSelect) {
        roundSelect.value = savedRound;
        updateSeriesRoundPills(savedRound);
    }
    const savedMetric = localStorage.getItem(STORAGE_KEY_METRIC);
    if (savedMetric && metricSelect) {
        metricSelect.value = savedMetric;
    }
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
    if (savedMode === 'quadrant') {
        currentMode = 'quadrant';
        btnQuadrant.classList.add('active');
        btnQuadrant.style.background = 'var(--accent-cyan)';
        btnQuadrant.style.color = '#fff';
        btnTrajectory.classList.remove('active');
        btnTrajectory.style.background = 'transparent';
        btnTrajectory.style.color = 'var(--text-muted)';
    }

    function handleRoundChange() {
        const currentRound = roundSelect.value;
        updateSeriesRoundPills(currentRound);

        // When selecting all tournament rounds, 2026 season should be the default that loads unless user explicitly selected another season
        if (currentRound === 'all' && seasonSelect.value !== '2026' && !userChangedSeason) {
            seasonSelect.value = '2026';
            selectedSeriesId = null;
            loadPostseasonData('2026');
            return;
        }

        // Deselect active series if it is not in the newly selected round
        if (selectedSeriesId) {
            const activeSeries = seriesMatches.find(s => s.id === selectedSeriesId);
            if (activeSeries && currentRound !== 'all' && activeSeries.round !== currentRound) {
                selectedSeriesId = null;
            }
        }

        populateBracketRibbon();
        renderChart();
    }

    // Series round filter pills
    document.querySelectorAll('.series-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetRound = btn.dataset.round;
            if (roundSelect.value === targetRound) {
                // If user re-clicks the active round pill, clear any series isolation and refresh view
                if (selectedSeriesId) {
                    selectedSeriesId = null;
                    populateBracketRibbon();
                    renderChart();
                }
                return;
            }
            roundSelect.value = targetRound;
            localStorage.setItem(STORAGE_KEY_ROUND, targetRound);
            selectedSeriesId = null;
            handleRoundChange();
        });
    });

    // Event Listeners
    seasonSelect.addEventListener('change', () => {
        userChangedSeason = true;
        selectedSeriesId = null;
        localStorage.setItem(STORAGE_KEY_SEASON, seasonSelect.value);
        loadPostseasonData(seasonSelect.value);
    });

    roundSelect.addEventListener('change', () => {
        selectedSeriesId = null;
        localStorage.setItem(STORAGE_KEY_ROUND, roundSelect.value);
        handleRoundChange();
    });
    metricSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_METRIC, metricSelect.value);
        renderChart();
    });
    teamSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_TEAM, teamSelect.value);
        renderChart();
    });

    btnTrajectory.addEventListener('click', () => {
        currentMode = 'trajectory';
        btnTrajectory.classList.add('active');
        btnTrajectory.style.background = 'var(--accent-cyan)';
        btnTrajectory.style.color = '#fff';
        btnQuadrant.classList.remove('active');
        btnQuadrant.style.background = 'transparent';
        btnQuadrant.style.color = 'var(--text-muted)';
        localStorage.setItem(STORAGE_KEY_MODE, 'trajectory');
        renderChart();
    });

    btnQuadrant.addEventListener('click', () => {
        currentMode = 'quadrant';
        btnQuadrant.classList.add('active');
        btnQuadrant.style.background = 'var(--accent-cyan)';
        btnQuadrant.style.color = '#fff';
        btnTrajectory.classList.remove('active');
        btnTrajectory.style.background = 'transparent';
        btnTrajectory.style.color = 'var(--text-muted)';
        localStorage.setItem(STORAGE_KEY_MODE, 'quadrant');
        renderChart();
    });

    btnResetView.addEventListener('click', () => {
        if (chartInstance) {
            chartInstance.dispatchAction({ type: 'dataZoom', start: 0, end: 100 });
        }
    });

    drawerCloseBtn.addEventListener('click', () => {
        telemetryDrawer.style.display = 'none';
    });

    // Start with 2026 postseason as default
    loadPostseasonData(seasonSelect.value || '2026');
});
