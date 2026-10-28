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
    const drawerCopyTableBtn = document.getElementById('drawer-copy-table-btn');

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

        const hasCompletedGames = (d) => Array.isArray(d?.dates) && d.dates.some(dt => Array.isArray(dt.games) && dt.games.some(g => g.status?.statusCode === 'F' || g.status?.statusCode === 'O'));

        // Tier 2: Try Local Cached Dataset for requested season
        if (!hasCompletedGames(data)) {
            try {
                const localUrl = `/data/postseason-${season}.json`;
                data = await fetchWithTimeout(localUrl, 3000);
                sourceUsed = 'cache';
            } catch (cacheErr) {
                console.warn(`[MLB Postseason Analyzer] Local archive for season ${season} unavailable. Falling back to 2024 postseason archive...`);
            }
        }

        // Tier 3: Guaranteed 2024 Archive Fallback
        if (!hasCompletedGames(data)) {
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

        // Sort chronologically by exact game timestamp, with tie-breakers for series/doubleheader game numbers and gamePk
        allGames.sort((a, b) => {
            const tA = new Date(a.gameDate || a.officialDate || a.date || 0).getTime();
            const tB = new Date(b.gameDate || b.officialDate || b.date || 0).getTime();
            if (tA !== tB) return tA - tB;
            const gnA = a.seriesGameNumber || a.gameNumber || 1;
            const gnB = b.seriesGameNumber || b.gameNumber || 1;
            if (gnA !== gnB) return gnA - gnB;
            return (a.gamePk || 0) - (b.gamePk || 0);
        });

        const seenGamePks = new Set();

        allGames.forEach(game => {
            if (game.gamePk && seenGamePks.has(game.gamePk)) return;
            if (game.gamePk) seenGamePks.add(game.gamePk);

            const home = game.teams?.home;
            const away = game.teams?.away;
            if (!home?.team || !away?.team) return;

            const homeScore = Number(home.score);
            const awayScore = Number(away.score);
            if (!Number.isFinite(homeScore) || !Number.isFinite(awayScore)) return;

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

            const awayWon = away.isWinner !== undefined ? Boolean(away.isWinner) : (awayScore > homeScore);
            const homeWon = home.isWinner !== undefined ? Boolean(home.isWinner) : (homeScore > awayScore);
            const winningTeamId = awayWon ? away.team.id : (homeWon ? home.team.id : null);

            if (winningTeamId) {
                if (seriesMap[sKey].team1.id === winningTeamId) {
                    seriesMap[sKey].team1Wins++;
                } else if (seriesMap[sKey].team2.id === winningTeamId) {
                    seriesMap[sKey].team2Wins++;
                }
            }
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

            if (game.linescore && Array.isArray(game.linescore.innings) && game.linescore.innings.length > 0) {
                game.linescore.innings.forEach(inn => {
                    cumAway += Number(inn.away?.runs) || 0;
                    cumHome += Number(inn.home?.runs) || 0;
                    inningsCount++;
                    if (cumAway > cumHome) awayLeadInnings++;
                    else if (cumHome > cumAway) homeLeadInnings++;
                });
            } else {
                inningsCount = 9;
                if (awayScore > homeScore) awayLeadInnings = 5;
                else if (homeScore > awayScore) homeLeadInnings = 5;
            }

            const dec = game.decisions || {};
            const decText = dec.winner ? `W: ${dec.winner.fullName?.split(' ').pop()} / L: ${dec.loser?.fullName?.split(' ').pop() || '--'}${dec.save ? ` / S: ${dec.save.fullName?.split(' ').pop()}` : ''}` : 'Final';

            // Away Game Record
            const awayMargin = awayScore - homeScore;
            parsedTeams[away.team.id].games.push({
                gamePk: game.gamePk,
                date: game.officialDate || game.date,
                round: round,
                opponentId: home.team.id,
                opponentName: home.team.name,
                teamScore: awayScore,
                oppScore: homeScore,
                isWin: awayWon,
                margin: awayMargin,
                leadInnings: awayLeadInnings,
                totalInnings: inningsCount,
                decision: decText
            });
            parsedTeams[away.team.id].runsScored += awayScore;
            parsedTeams[away.team.id].runsAllowed += homeScore;
            parsedTeams[away.team.id].leadInningsTotal += awayLeadInnings;
            parsedTeams[away.team.id].totalInningsPlayed += inningsCount;
            if (awayWon) {
                parsedTeams[away.team.id].totalWins++;
                if (awayMargin === 1) parsedTeams[away.team.id].oneRunWins++;
                if (awayMargin >= 5) parsedTeams[away.team.id].blowoutWins++;
            } else {
                parsedTeams[away.team.id].totalLosses++;
                if (Math.abs(awayMargin) === 1) parsedTeams[away.team.id].oneRunLosses++;
            }

            // Home Game Record
            const homeMargin = homeScore - awayScore;
            parsedTeams[home.team.id].games.push({
                gamePk: game.gamePk,
                date: game.officialDate || game.date,
                round: round,
                opponentId: away.team.id,
                opponentName: away.team.name,
                teamScore: homeScore,
                oppScore: awayScore,
                isWin: homeWon,
                margin: homeMargin,
                leadInnings: homeLeadInnings,
                totalInnings: inningsCount,
                decision: decText
            });
            parsedTeams[home.team.id].runsScored += homeScore;
            parsedTeams[home.team.id].runsAllowed += awayScore;
            parsedTeams[home.team.id].leadInningsTotal += homeLeadInnings;
            parsedTeams[home.team.id].totalInningsPlayed += inningsCount;
            if (homeWon) {
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
            let streak = 0;

            team.trajectory = [];

            team.games.forEach((g, idx) => {
                cumDiff += g.margin;
                cumRS += g.teamScore;
                cumRA += g.oppScore;
                cumLead += g.leadInnings;
                cumInnings += g.totalInnings;
                if (g.isWin) {
                    cumWins++;
                    streak = streak > 0 ? streak + 1 : 1;
                } else {
                    streak = streak < 0 ? streak - 1 : -1;
                }

                // 3-Game Weighted Moving Average Run Diff (renormalized weights on partial windows)
                let wma3 = g.margin;
                if (idx === 1) {
                    wma3 = (3 * g.margin + 2 * team.games[0].margin) / 5;
                } else if (idx >= 2) {
                    wma3 = (3 * g.margin + 2 * team.games[idx - 1].margin + 1 * team.games[idx - 2].margin) / 6;
                }

                // Pythagorean Expected Win % (exponent 1.83)
                const rsPow = Math.pow(Math.max(0, cumRS), 1.83);
                const raPow = Math.pow(Math.max(0, cumRA), 1.83);
                const pyth = (rsPow + raPow === 0) ? 0.5 : (rsPow / (rsPow + raPow));
                const actWinPct = cumWins / (idx + 1);
                const luckGap = actWinPct - pyth; // > 0 = overperforming run diff, < 0 = underperforming

                // Lead Inning Share %
                const leadShare = cumInnings > 0 ? (cumLead / cumInnings) * 100 : 50;

                // Postseason Momentum Index (Normalized -100 to +100)
                // Components: 35% WMA3 run diff (clamped +-5 -> +-35), 25% Lead Share (0-100 -> +-25),
                // 25% Pythagorean Performance (0-1 -> +-25), 15% Win Streak Momentum (clamped +-3 -> +-15)
                const wmaComp = Math.max(-35, Math.min(35, wma3 * 7));
                const leadComp = Math.max(-25, Math.min(25, (leadShare - 50) * 0.5));
                const pythComp = Math.max(-25, Math.min(25, (pyth - 0.5) * 50));
                const streakComp = Math.max(-15, Math.min(15, streak * 5));
                const pmiRaw = wmaComp + leadComp + pythComp + streakComp;
                const pmi = Math.max(-100, Math.min(100, Math.round(pmiRaw)));

                g.pmi = pmi;
                g.cumRunDiff = cumDiff;
                g.wma3 = parseFloat(wma3.toFixed(2));
                g.luckGap = parseFloat(luckGap.toFixed(3));
                g.leadShare = parseFloat(leadShare.toFixed(1));
                g.cumAvgRS = parseFloat((cumRS / (idx + 1)).toFixed(2));
                g.cumAvgRA = parseFloat((cumRA / (idx + 1)).toFixed(2));

                team.trajectory.push({
                    gameNum: idx + 1,
                    round: g.round,
                    date: g.date,
                    margin: g.margin,
                    cumRunDiff: cumDiff,
                    rolling3RunDiff: g.wma3,
                    leadInningShare: g.leadShare,
                    luckGap: g.luckGap,
                    pmi: pmi,
                    cumAvgRS: g.cumAvgRS,
                    cumAvgRA: g.cumAvgRA
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

    // Helper: compute symmetric hard axis bounds [min, max, interval] centered exactly at splitVal
    function computeSymmetricBounds(values, splitVal, minHalfSpan, stepSize) {
        let maxAbsDev = minHalfSpan;
        values.forEach(v => {
            if (Number.isFinite(v)) {
                const dev = Math.abs(v - splitVal);
                if (dev > maxAbsDev) maxAbsDev = dev;
            }
        });
        // Add a small 10% breathing margin when data approaches or exceeds default span, rounded up to nice stepSize
        const padded = Math.max(minHalfSpan, Math.ceil((maxAbsDev * 1.08) / stepSize) * stepSize);
        const min = parseFloat((splitVal - padded).toFixed(4));
        const max = parseFloat((splitVal + padded).toFixed(4));
        return { min, max, halfSpan: padded };
    }

    // Populate Team Selector
    function populateTeamSelect() {
        teamSelect.innerHTML = '<option value="all">All Playoff Teams</option>';
        const sorted = Object.values(parsedTeams).sort((a, b) => (b.finalPMI - a.finalPMI) || (b.finalRunDiff - a.finalRunDiff) || (b.totalWins - a.totalWins));
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
        const surging = [...teams].sort((a, b) => (b.finalPMI - a.finalPMI) || (b.finalRunDiff - a.finalRunDiff) || (b.totalWins - a.totalWins))[0];
        if (surging) {
            document.getElementById('kpi-surge-team').innerHTML = renderKpiTeamHtml(surging, `${surging.finalPMI > 0 ? '+' : ''}${surging.finalPMI} PMI`);
            document.getElementById('kpi-surge-desc').textContent = `Diff: ${surging.finalRunDiff > 0 ? '+' : ''}${surging.finalRunDiff} runs | ${surging.totalWins}-${surging.totalLosses} overall`;
        }

        // 2. Coldest / Fall-off Risk
        const coldest = [...teams].sort((a, b) => (a.finalPMI - b.finalPMI) || (a.finalRunDiff - b.finalRunDiff) || (b.totalLosses - a.totalLosses))[0];
        if (coldest) {
            document.getElementById('kpi-cold-team').innerHTML = renderKpiTeamHtml(coldest, `${coldest.finalPMI} PMI`);
            document.getElementById('kpi-cold-desc').textContent = `Diff: ${coldest.finalRunDiff} runs | ${coldest.totalLosses} losses`;
        }

        // 3. Game Control Leader
        const leadBoss = [...teams].sort((a, b) => (b.finalLeadShare - a.finalLeadShare) || (b.leadInningsTotal - a.leadInningsTotal))[0];
        if (leadBoss) {
            document.getElementById('kpi-lead-team').innerHTML = renderKpiTeamHtml(leadBoss, `${leadBoss.finalLeadShare}% Inning Lead`);
            document.getElementById('kpi-lead-desc').textContent = `Commanded the lead across ${leadBoss.leadInningsTotal} total innings`;
        }

        // 4. Cardiac Kids (Most 1-Run Game Wins)
        const cardiac = [...teams].sort((a, b) => (b.oneRunWins - a.oneRunWins) || (a.oneRunLosses - b.oneRunLosses) || (b.totalWins - a.totalWins))[0];
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

        const allTeams = Object.values(parsedTeams);
        let filteredTeams = [...allTeams];
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

        // Hard-set symmetric Y-axis bounds centered around each metric's neutral split value
        const metricAxisSpecs = {
            'pmi': { split: 0, minHalfSpan: 100, step: 20 },
            'cumRunDiff': { split: 0, minHalfSpan: 40, step: 10 },
            'rolling3RunDiff': { split: 0, minHalfSpan: 10, step: 2 },
            'leadInningShare': { split: 50, minHalfSpan: 50, step: 10 },
            'luckGap': { split: 0, minHalfSpan: 0.5, step: 0.1 }
        };
        const spec = metricAxisSpecs[selectedMetric] || { split: 0, minHalfSpan: 50, step: 10 };
        const allMetricVals = [];
        allTeams.forEach(t => t.trajectory.forEach(pt => allMetricVals.push(pt[selectedMetric])));
        const yBounds = computeSymmetricBounds(allMetricVals, spec.split, spec.minHalfSpan, spec.step);

        // Hard-set X-axis bounds (integer game count)
        const roundMaxGames = { 'F': 3, 'D': 5, 'L': 7, 'W': 7 };
        let seasonMaxGames = 0;
        allTeams.forEach(t => {
            if (t.trajectory.length > seasonMaxGames) seasonMaxGames = t.trajectory.length;
        });
        let xMax = 18;
        if (isolatedSeries) {
            xMax = Math.max(isolatedSeries.games.length, roundMaxGames[isolatedSeries.round] || 3, maxGames, 2);
        } else if (selectedRound !== 'all') {
            xMax = Math.max(roundMaxGames[selectedRound] || 5, maxGames, 2);
        } else {
            xMax = Math.max(seasonMaxGames, maxGames, 5);
        }

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
                    const gameNumLabel = isolatedSeries ? `Series Game ${dataItem[0]}` : (selectedRound !== 'all' ? `Round Game ${dataItem[0]}` : `Game ${dataItem[0]}`);
                    const val = dataItem[1];
                    const isPositive = val >= spec.split;
                    const signPrefix = (spec.split === 0 && val > 0) ? '+' : '';

                    return `
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.3rem;">
                                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${team?.color || '#38BDF8'};"></span>
                                <strong style="font-size:0.95rem; color:#fff;">${team?.name || params.seriesName}</strong>
                                <span style="color:var(--text-dim); margin-left:auto;">${gameNumLabel}</span>
                            </div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">Round: <strong>${ROUND_NAMES[rawGame?.round] || 'Postseason'}</strong></div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">Score: <strong style="color:#fff;">${rawGame ? `${rawGame.isWin ? 'W' : 'L'} ${rawGame.teamScore}-${rawGame.oppScore} vs ${rawGame.opponentName}` : '--'}</strong></div>
                            <div style="color:var(--text-muted); margin-bottom: 0.2rem;">${metricLabels[selectedMetric]}: <strong style="color:${isPositive ? '#10B981' : '#EF4444'}; font-size:1rem;">${signPrefix}${val}</strong></div>
                            ${rawGame ? `<div style="font-size:0.75rem; color:var(--text-dim); margin-top:0.4rem;">${rawGame.decision}</div>` : ''}
                            <div style="margin-top:0.5rem; font-size:0.75rem; color:#EA580C; text-align:right;">Click node for game telemetry &rarr;</div>
                        </div>
                    `;
                }
            },
            grid: {
                left: 55,
                right: '4%',
                bottom: '12%',
                top: 48,
                containLabel: true
            },
            xAxis: {
                type: 'value',
                name: xAxisTitle,
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                min: 1,
                max: xMax,
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
                nameLocation: 'end',
                nameTextStyle: {
                    color: '#94A3B8',
                    fontFamily: 'JetBrains Mono, monospace',
                    align: 'left',
                    padding: [0, 0, 8, 0]
                },
                min: yBounds.min,
                max: yBounds.max,
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
        const allTeams = Object.values(parsedTeams);
        let teams = [...allTeams];

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

        if (allTeams.length === 0) return;

        // Compute season-wide baselines so the quadrant split and axis bounds remain stable across filters
        let totalPostseasonRS = 0;
        let totalPostseasonRA = 0;
        let totalTeamGames = 0;
        allTeams.forEach(t => {
            totalPostseasonRS += t.runsScored;
            totalPostseasonRA += t.runsAllowed;
            totalTeamGames += t.games.length;
        });

        const avgLeagueRS = totalTeamGames > 0
            ? parseFloat((totalPostseasonRS / totalTeamGames).toFixed(2))
            : 4.0;
        const avgLeagueRA = totalTeamGames > 0
            ? parseFloat((totalPostseasonRA / totalTeamGames).toFixed(2))
            : 4.0;

        // Collect all scatter and cumulative-trajectory comet coordinates across the season to guarantee full containment
        const allXValues = [0];
        const allYValues = [0];
        allTeams.forEach(t => {
            allXValues.push(t.avgRS);
            allYValues.push(t.avgRA);
            if (t.trajectory.length >= 2) {
                t.trajectory.slice(-3).forEach(pt => {
                    allXValues.push(pt.cumAvgRS);
                    allYValues.push(pt.cumAvgRA);
                });
            }
        });

        // Symmetric hard-set bounds around (avgLeagueRS, avgLeagueRA) so all 4 quadrants have strictly EQUAL area
        const xBounds = computeSymmetricBounds(allXValues, avgLeagueRS, Math.max(avgLeagueRS, 4.5), 0.5);
        const yBounds = computeSymmetricBounds(allYValues, avgLeagueRA, Math.max(avgLeagueRA, 4.5), 0.5);
        const xMin = xBounds.min;
        const xMax = xBounds.max;
        const yMin = yBounds.min;
        const yMax = yBounds.max;

        // X: Runs Scored per Game (Offense Form)
        // Y: Runs Allowed per Game (Inverted: low RA is high on Y-axis for Lockdown)
        const scatterData = [];
        const vectorLines = [];

        teams.forEach(team => {
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

            // If team played multiple games, build vector comet tail of last 3 cumulative states ending at (team.avgRS, team.avgRA)
            if (team.trajectory.length >= 2) {
                const coords = team.trajectory.slice(-3).map(pt => [pt.cumAvgRS, pt.cumAvgRA]);
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
                            <div style="color:var(--text-muted); margin-top:0.3rem;">Offense: <strong>${t.avgRS} Runs/G</strong> (Avg: ${avgLeagueRS})</div>
                            <div style="color:var(--text-muted);">Pitching Allowed: <strong>${t.avgRA} Runs/G</strong> (Avg: ${avgLeagueRA})</div>
                            <div style="color:var(--text-muted);">Lead Inning Share: <strong>${t.finalLeadShare}%</strong></div>
                            <div style="color:${t.finalPMI >= 0 ? '#10B981' : '#EF4444'}; margin-top:0.3rem;">Momentum Index: <strong>${t.finalPMI > 0 ? '+' : ''}${t.finalPMI}</strong></div>
                        </div>
                    `;
                }
            },
            grid: {
                left: 65,
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
                min: xMin,
                max: xMax,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: {
                    color: '#94A3B8',
                    fontFamily: 'JetBrains Mono, monospace',
                    formatter: (val) => val < 0 ? '' : Number(val.toFixed(1))
                }
            },
            yAxis: {
                type: 'value',
                inverse: true, // Inverted so lower runs allowed is higher up
                name: '← Pitching Lockdown (Fewer Runs Allowed)',
                nameLocation: 'middle',
                nameGap: 40,
                min: yMin,
                max: yMax,
                nameTextStyle: { color: '#94A3B8', fontFamily: 'JetBrains Mono, monospace' },
                splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
                axisLabel: {
                    color: '#94A3B8',
                    fontFamily: 'JetBrains Mono, monospace',
                    formatter: (val) => val < 0 ? '' : Number(val.toFixed(1))
                }
            },
            series: [
                // Quadrant Backdrop MarkArea & Center Crosshairs
                {
                    type: 'scatter',
                    data: [],
                    markLine: {
                        silent: true,
                        symbol: 'none',
                        lineStyle: {
                            color: 'rgba(241, 245, 249, 0.35)',
                            type: 'dashed',
                            width: 1.5
                        },
                        label: {
                            color: '#94A3B8',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 10
                        },
                        data: [
                            { xAxis: avgLeagueRS, label: { formatter: `Avg RS: ${avgLeagueRS}` } },
                            { yAxis: avgLeagueRA, label: { formatter: `Avg RA: ${avgLeagueRA}` } }
                        ]
                    },
                    markArea: {
                        silent: true,
                        itemStyle: { opacity: 0.08 },
                        data: [
                            [
                                { name: 'JUGGERNAUTS 🔥\n(Elite Hitting & Lockdown Arms)', coord: [avgLeagueRS, yMin], itemStyle: { color: '#10B981' } },
                                { coord: [xMax, avgLeagueRA] }
                            ],
                            [
                                { name: 'PITCHING FORTRESS 🛡️\n(Dominant Arms, Cold Bats)', coord: [xMin, yMin], itemStyle: { color: '#38BDF8' } },
                                { coord: [avgLeagueRS, avgLeagueRA] }
                            ],
                            [
                                { name: 'GLASS CANNONS ⚔️\n(High Slugging, Leaky Pen)', coord: [avgLeagueRS, avgLeagueRA], itemStyle: { color: '#EA580C' } },
                                { coord: [xMax, yMax] }
                            ],
                            [
                                { name: 'DEAD WATER ❄️\n(Fall-Off / Cold Bats & Bleeding Runs)', coord: [xMin, avgLeagueRA], itemStyle: { color: '#EF4444' } },
                                { coord: [avgLeagueRS, yMax] }
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
            ],
            graphic: scatterData.length === 0 ? [{
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
                <td style="padding: 0.6rem; font-weight:bold; color:${delta >= 0 ? '#10B981' : '#EF4444'};">${delta > 0 ? '+' : ''}${delta}</td>
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

    const btnCopyChart = document.getElementById('btn-copy-chart');
    if (btnCopyChart) {
        btnCopyChart.addEventListener('click', async () => {
            if (!chartInstance) return;
            try {
                const dataUrl = chartInstance.getDataURL({
                    type: 'png',
                    pixelRatio: 2,
                    backgroundColor: '#0B1120'
                });

                let copied = false;
                if (navigator.clipboard && window.ClipboardItem) {
                    try {
                        const res = await fetch(dataUrl);
                        const blob = await res.blob();
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        copied = true;
                    } catch (e) {
                        console.warn('Clipboard image write failed:', e);
                    }
                }
                if (!copied) {
                    const link = document.createElement('a');
                    link.download = `mlb-postseason-${seasonSelect.value || '2026'}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }

                const origHtml = btnCopyChart.innerHTML;
                btnCopyChart.innerHTML = copied
                    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Copied!</span>`
                    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Downloaded!</span>`;
                btnCopyChart.style.borderColor = '#10b981';
                btnCopyChart.style.color = '#10b981';
                setTimeout(() => {
                    btnCopyChart.innerHTML = origHtml;
                    btnCopyChart.style.borderColor = '';
                    btnCopyChart.style.color = '';
                }, 2400);
            } catch (err) {
                console.error('Error copying chart:', err);
            }
        });
    }

    drawerCloseBtn.addEventListener('click', () => {
        telemetryDrawer.style.display = 'none';
    });

    if (drawerCopyTableBtn) {
        drawerCopyTableBtn.addEventListener('click', async () => {
            const title = drawerTeamName ? drawerTeamName.textContent : 'Team Telemetry';
            const meta = drawerTeamMeta ? drawerTeamMeta.textContent : '';
            const headers = Array.from(telemetryDrawer.querySelectorAll('thead th')).map(th => th.textContent.trim());
            const rows = Array.from(drawerTableBody.querySelectorAll('tr')).map(tr => {
                return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()).join('\t');
            });
            const tsv = `${title} — ${meta}\n${headers.join('\t')}\n${rows.join('\n')}`;

            let copied = false;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(tsv);
                    copied = true;
                } catch (err) {}
            }
            if (!copied) {
                const textarea = document.createElement('textarea');
                textarea.value = tsv;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    copied = true;
                } catch (e) {}
                document.body.removeChild(textarea);
            }

            const origHtml = drawerCopyTableBtn.innerHTML;
            drawerCopyTableBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Table Copied!</span>`;
            drawerCopyTableBtn.style.borderColor = '#10b981';
            drawerCopyTableBtn.style.color = '#10b981';
            setTimeout(() => {
                drawerCopyTableBtn.innerHTML = origHtml;
                drawerCopyTableBtn.style.borderColor = '';
                drawerCopyTableBtn.style.color = '';
            }, 2400);
        });
    }

    // Start with 2026 postseason as default
    loadPostseasonData(seasonSelect.value || '2026');
});
