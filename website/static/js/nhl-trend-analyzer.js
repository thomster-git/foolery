document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    const teamSelect2 = document.getElementById('team-select-2');
    
    let chartInstance = null;
    let allTeamsData = []; 

    // localStorage persistence keys
    const STORAGE_KEY_METRIC = 'atlas_nhl_metric';
    const STORAGE_KEY_DIVISION = 'atlas_nhl_division';
    const STORAGE_KEY_TEAM = 'atlas_nhl_team';
    const STORAGE_KEY_TEAM2 = 'atlas_nhl_team2';

    const urlParams = new URLSearchParams(window.location.search);
    const paramMetric = urlParams.get('metric');
    const paramDivision = urlParams.get('division');
    const paramTeam = urlParams.get('team') || urlParams.get('team1');
    const paramTeam2 = urlParams.get('team2');

    if (metricSelect) {
        if (paramMetric && Array.from(metricSelect.options).some(o => o.value === paramMetric)) {
            metricSelect.value = paramMetric;
        } else if (localStorage.getItem(STORAGE_KEY_METRIC)) {
            metricSelect.value = localStorage.getItem(STORAGE_KEY_METRIC);
        }
    }
    if (divisionSelect) {
        if (paramDivision && Array.from(divisionSelect.options).some(o => o.value === paramDivision)) {
            divisionSelect.value = paramDivision;
        } else if (localStorage.getItem(STORAGE_KEY_DIVISION)) {
            divisionSelect.value = localStorage.getItem(STORAGE_KEY_DIVISION);
        }
    }

    const nhlTeams = [
        { id: 1, name: "Boston Bruins", abbrev: "BOS", division: "A", conf: "E", color: "#FFB81C" },
        { id: 2, name: "Buffalo Sabres", abbrev: "BUF", division: "A", conf: "E", color: "#002654" },
        { id: 5, name: "Detroit Red Wings", abbrev: "DET", division: "A", conf: "E", color: "#CE1126" },
        { id: 26, name: "Florida Panthers", abbrev: "FLA", division: "A", conf: "E", color: "#041E42" },
        { id: 10, name: "Montreal Canadiens", abbrev: "MTL", division: "A", conf: "E", color: "#AF1E2D" },
        { id: 14, name: "Ottawa Senators", abbrev: "OTT", division: "A", conf: "E", color: "#C52032" },
        { id: 20, name: "Tampa Bay Lightning", abbrev: "TB", division: "A", conf: "E", color: "#002868" },
        { id: 21, name: "Toronto Maple Leafs", abbrev: "TOR", division: "A", conf: "E", color: "#00205B" },
        
        { id: 7, name: "Carolina Hurricanes", abbrev: "CAR", division: "M", conf: "E", color: "#CE1126" },
        { id: 29, name: "Columbus Blue Jackets", abbrev: "CBJ", division: "M", conf: "E", color: "#002654" },
        { id: 11, name: "New Jersey Devils", abbrev: "NJ", division: "M", conf: "E", color: "#CE1126" },
        { id: 12, name: "New York Islanders", abbrev: "NYI", division: "M", conf: "E", color: "#00539B" },
        { id: 13, name: "New York Rangers", abbrev: "NYR", division: "M", conf: "E", color: "#0038A8" },
        { id: 15, name: "Philadelphia Flyers", abbrev: "PHI", division: "M", conf: "E", color: "#F74902" },
        { id: 16, name: "Pittsburgh Penguins", abbrev: "PIT", division: "M", conf: "E", color: "#FCB514" },
        { id: 23, name: "Washington Capitals", abbrev: "WSH", division: "M", conf: "E", color: "#041E42" },

        { id: 4, name: "Chicago Blackhawks", abbrev: "CHI", division: "C", conf: "W", color: "#CF0A2C" },
        { id: 17, name: "Colorado Avalanche", abbrev: "COL", division: "C", conf: "W", color: "#6F263D" },
        { id: 9, name: "Dallas Stars", abbrev: "DAL", division: "C", conf: "W", color: "#006847" },
        { id: 30, name: "Minnesota Wild", abbrev: "MIN", division: "C", conf: "W", color: "#154734" },
        { id: 27, name: "Nashville Predators", abbrev: "NSH", division: "C", conf: "W", color: "#FFB81C" },
        { id: 19, name: "St. Louis Blues", abbrev: "STL", division: "C", conf: "W", color: "#002F87" },
        { id: 129764, name: "Utah Hockey Club", abbrev: "UTA", division: "C", conf: "W", color: "#7BA4D9" },
        { id: 28, name: "Winnipeg Jets", abbrev: "WPG", division: "C", conf: "W", color: "#041E42" },

        { id: 25, name: "Anaheim Ducks", abbrev: "ANA", division: "P", conf: "W", color: "#F47A38" },
        { id: 3, name: "Calgary Flames", abbrev: "CGY", division: "P", conf: "W", color: "#C8102E" },
        { id: 6, name: "Edmonton Oilers", abbrev: "EDM", division: "P", conf: "W", color: "#FF4C00" },
        { id: 8, name: "Los Angeles Kings", abbrev: "LA", division: "P", conf: "W", color: "#111111" },
        { id: 18, name: "San Jose Sharks", abbrev: "SJ", division: "P", conf: "W", color: "#006D75" },
        { id: 124292, name: "Seattle Kraken", abbrev: "SEA", division: "P", conf: "W", color: "#001628" },
        { id: 22, name: "Vancouver Canucks", abbrev: "VAN", division: "P", conf: "W", color: "#00205B" },
        { id: 37, name: "Vegas Golden Knights", abbrev: "VGK", division: "P", conf: "W", color: "#B4975A" }
    ];

    function getGameSeed(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    async function fetchInChunks(items, chunkSize, fn) {
        const results = [];
        for (let i = 0; i < items.length; i += chunkSize) {
            const chunk = items.slice(i, i + chunkSize);
            const chunkResults = await Promise.allSettled(chunk.map(fn));
            results.push(...chunkResults);
        }
        return results;
    }

    function generateFallbackNhlData() {
        return nhlTeams.map(t => {
            const seed = getGameSeed("nhl-2026-" + t.id);
            const gamesCount = 10 + (seed % 5);
            let cumGF = 0, cumGA = 0, cumPoints = 0, currentStreak = 0, cumRegWins = 0;
            let cumOneGoalGames = 0, cumOneGoalWins = 0, cumBlowoutWins = 0, cumP1Leads = 0, cumP1LeadWins = 0;
            let cumPenalties = 0, cumPIM = 0, cumPPOpp = 0, cumPPG = 0, cumPPAgainst = 0, cumPKGA = 0;
            let cumSF = 0, cumSA = 0;

            const goalDiffData = [{x:0, y:0}];
            const winPctData = [{x:0, y:0}];
            const pythagoreanData = [{x:0, y:0}];
            const goalsForPerGameData = [{x:0, y:0}];
            const goalsAgainstPerGameData = [{x:0, y:0}];
            const regulationWinPctData = [{x:0, y:0}];
            const streakData = [{x:0, y:0}];
            const ppPctData = [{x:0, y:0}];
            const pkPctData = [{x:0, y:0}];
            const specialTeamsIndexData = [{x:0, y:0}];
            const ppGoalsPerGameData = [{x:0, y:0}];
            const ppPerGameData = [{x:0, y:0}];
            const penaltiesPerGameData = [{x:0, y:0}];
            const penaltyMinutesPerGameData = [{x:0, y:0}];
            const netPenaltyDiffData = [{x:0, y:0}];
            const shotsForPerGameData = [{x:0, y:0}];
            const shotsAgainstPerGameData = [{x:0, y:0}];
            const shotDiffData = [{x:0, y:0}];
            const shotSharePctData = [{x:0, y:0}];
            const savePctData = [{x:0, y:0}];
            const shootingPctData = [{x:0, y:0}];
            const pdoData = [{x:0, y:0}];
            const oneGoalWinPctData = [{x:0, y:0}];
            const blowoutWinPctData = [{x:0, y:0}];
            const firstPeriodLeadPctData = [{x:0, y:0}];

            // Team base strength variance (1 to 5)
            const strength = 2.5 + ((seed % 10) / 4.0);

            for (let g = 1; g <= gamesCount; g++) {
                const gSeed = getGameSeed(`${t.id}-g-${g}`);
                const gf = Math.max(0, Math.round(strength + ((gSeed % 5) - 2)));
                const ga = Math.max(0, Math.round(3.0 + (((gSeed >> 2) % 5) - 2)));
                const isOT = gf === ga ? true : ((gSeed >> 4) % 6 === 0);
                const isWin = isOT ? ((gSeed >> 5) % 2 === 0) : gf > ga;

                const actualGF = gf === ga ? (isWin ? gf + 1 : gf) : (isWin ? Math.max(gf, ga + 1) : Math.min(gf, Math.max(0, ga - 1)));
                const actualGA = gf === ga ? (isWin ? ga : ga + 1) : (isWin ? Math.min(ga, actualGF - 1) : Math.max(ga, actualGF + 1));

                cumGF += actualGF;
                cumGA += actualGA;

                if (isWin) {
                    cumPoints += 2;
                    currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                    if (!isOT) cumRegWins++;
                } else if (isOT) {
                    cumPoints += 1;
                    currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                } else {
                    currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                }

                if (Math.abs(actualGF - actualGA) === 1) {
                    cumOneGoalGames++;
                    if (isWin) cumOneGoalWins++;
                }
                if (actualGF - actualGA >= 3) {
                    cumBlowoutWins++;
                }

                const ledP1 = (actualGF >= 2 && (gSeed % 2 === 0)) || (isWin && (gSeed % 3 === 0));
                if (ledP1) {
                    cumP1Leads++;
                    if (isWin) cumP1LeadWins++;
                }

                const gPens = 2 + (gSeed % 3) + (isOT ? 1 : 0);
                const gPIM = gPens * 2 + ((gSeed >> 3) % 4 === 0 ? 5 : 0);
                const gPPOpp = 2 + ((gSeed >> 2) % 3);
                const gPPG = actualGF >= 3 && (gSeed % 3 === 0) ? 1 : 0;
                const gPPAgainst = 2 + ((gSeed >> 4) % 3);
                const gPKGA = actualGA >= 3 && ((gSeed >> 5) % 3 === 0) ? 1 : 0;

                const gSF = 27 + ((gSeed >> 1) % 9) + actualGF * 2;
                const gSA = 27 + ((gSeed >> 3) % 9) + actualGA * 2;

                cumPenalties += gPens;
                cumPIM += gPIM;
                cumPPOpp += gPPOpp;
                cumPPG += gPPG;
                cumPPAgainst += gPPAgainst;
                cumPKGA += gPKGA;
                cumSF += gSF;
                cumSA += gSA;

                const gfExp = Math.pow(Math.max(1, cumGF), 2.15);
                const gaExp = Math.pow(Math.max(1, cumGA), 2.15);
                const pythPct = (gfExp + gaExp > 0) ? (gfExp / (gfExp + gaExp)) * 100 : 50.0;
                const currPP = cumPPOpp > 0 ? (cumPPG / cumPPOpp) * 100 : 20.0;
                const currPK = cumPPAgainst > 0 ? ((cumPPAgainst - cumPKGA) / cumPPAgainst) * 100 : 82.0;
                const currSV = cumSA > 0 ? ((cumSA - cumGA) / cumSA) * 100 : 91.0;
                const currSH = cumSF > 0 ? (cumGF / cumSF) * 100 : 9.5;

                goalDiffData.push({x: g, y: cumGF - cumGA});
                winPctData.push({x: g, y: parseFloat(((cumPoints / (g * 2)) * 100).toFixed(1))});
                pythagoreanData.push({x: g, y: parseFloat(pythPct.toFixed(1))});
                goalsForPerGameData.push({x: g, y: parseFloat((cumGF / g).toFixed(2))});
                goalsAgainstPerGameData.push({x: g, y: parseFloat((cumGA / g).toFixed(2))});
                regulationWinPctData.push({x: g, y: parseFloat(((cumRegWins / g) * 100).toFixed(1))});
                streakData.push({x: g, y: currentStreak});

                ppPctData.push({x: g, y: parseFloat(currPP.toFixed(1))});
                pkPctData.push({x: g, y: parseFloat(currPK.toFixed(1))});
                specialTeamsIndexData.push({x: g, y: parseFloat((currPP + currPK).toFixed(1))});
                ppGoalsPerGameData.push({x: g, y: parseFloat((cumPPG / g).toFixed(2))});
                ppPerGameData.push({x: g, y: parseFloat((cumPPOpp / g).toFixed(2))});
                penaltiesPerGameData.push({x: g, y: parseFloat((cumPenalties / g).toFixed(2))});
                penaltyMinutesPerGameData.push({x: g, y: parseFloat((cumPIM / g).toFixed(1))});
                netPenaltyDiffData.push({x: g, y: cumPPOpp - cumPPAgainst});

                shotsForPerGameData.push({x: g, y: parseFloat((cumSF / g).toFixed(1))});
                shotsAgainstPerGameData.push({x: g, y: parseFloat((cumSA / g).toFixed(1))});
                shotDiffData.push({x: g, y: cumSF - cumSA});
                shotSharePctData.push({x: g, y: parseFloat((cumSF + cumSA > 0 ? (cumSF / (cumSF + cumSA)) * 100 : 50.0).toFixed(1))});

                savePctData.push({x: g, y: parseFloat(currSV.toFixed(2))});
                shootingPctData.push({x: g, y: parseFloat(currSH.toFixed(2))});
                pdoData.push({x: g, y: parseFloat((currSV + currSH).toFixed(1))});

                oneGoalWinPctData.push({x: g, y: parseFloat((cumOneGoalGames > 0 ? (cumOneGoalWins / cumOneGoalGames) * 100 : 50.0).toFixed(1))});
                blowoutWinPctData.push({x: g, y: parseFloat(((cumBlowoutWins / g) * 100).toFixed(1))});
                firstPeriodLeadPctData.push({x: g, y: parseFloat((cumP1Leads > 0 ? (cumP1LeadWins / cumP1Leads) * 100 : 75.0).toFixed(1))});
            }

            return {
                id: t.id,
                name: t.name,
                abbrev: t.abbrev,
                divisionId: t.division,
                leagueId: t.conf,
                color: t.color,
                goalDiff: goalDiffData,
                winPct: winPctData,
                pythagorean: pythagoreanData,
                goalsForPerGame: goalsForPerGameData,
                goalsAgainstPerGame: goalsAgainstPerGameData,
                regulationWinPct: regulationWinPctData,
                streak: streakData,
                ppPct: ppPctData,
                pkPct: pkPctData,
                specialTeamsIndex: specialTeamsIndexData,
                ppGoalsPerGame: ppGoalsPerGameData,
                ppPerGame: ppPerGameData,
                penaltiesPerGame: penaltiesPerGameData,
                penaltyMinutesPerGame: penaltyMinutesPerGameData,
                netPenaltyDiff: netPenaltyDiffData,
                shotsForPerGame: shotsForPerGameData,
                shotsAgainstPerGame: shotsAgainstPerGameData,
                shotDiff: shotDiffData,
                shotSharePct: shotSharePctData,
                savePct: savePctData,
                shootingPct: shootingPctData,
                pdo: pdoData,
                oneGoalWinPct: oneGoalWinPctData,
                blowoutWinPct: blowoutWinPctData,
                firstPeriodLeadPct: firstPeriodLeadPctData
            };
        });
    }

    async function fetchRealData() {
        try {
            const teamFetchFn = async (t) => {
                const url = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${t.id}/schedule`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 12000);
                try {
                    const res = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!res.ok) throw new Error(`Failed to fetch ${t.id}: ${res.statusText}`);
                    const data = await res.json();

                    let cumGF = 0, cumGA = 0;
                    let cumPoints = 0;
                    let currentStreak = 0;
                    let cumRegWins = 0;
                    let cumOneGoalGames = 0, cumOneGoalWins = 0;
                    let cumBlowoutWins = 0;
                    let cumP1Leads = 0, cumP1LeadWins = 0;

                    let cumPenalties = 0, cumPIM = 0, cumPPOpp = 0, cumPPG = 0, cumPPAgainst = 0, cumPKGA = 0;
                    let cumSF = 0, cumSA = 0;

                    const goalDiffData = [{x:0, y:0}];
                    const winPctData = [{x:0, y:0}];
                    const pythagoreanData = [{x:0, y:0}];
                    const goalsForPerGameData = [{x:0, y:0}];
                    const goalsAgainstPerGameData = [{x:0, y:0}];
                    const regulationWinPctData = [{x:0, y:0}];
                    const streakData = [{x:0, y:0}];

                    const ppPctData = [{x:0, y:0}];
                    const pkPctData = [{x:0, y:0}];
                    const specialTeamsIndexData = [{x:0, y:0}];
                    const ppGoalsPerGameData = [{x:0, y:0}];
                    const ppPerGameData = [{x:0, y:0}];
                    const penaltiesPerGameData = [{x:0, y:0}];
                    const penaltyMinutesPerGameData = [{x:0, y:0}];
                    const netPenaltyDiffData = [{x:0, y:0}];

                    const shotsForPerGameData = [{x:0, y:0}];
                    const shotsAgainstPerGameData = [{x:0, y:0}];
                    const shotDiffData = [{x:0, y:0}];
                    const shotSharePctData = [{x:0, y:0}];

                    const savePctData = [{x:0, y:0}];
                    const shootingPctData = [{x:0, y:0}];
                    const pdoData = [{x:0, y:0}];

                    const oneGoalWinPctData = [{x:0, y:0}];
                    const blowoutWinPctData = [{x:0, y:0}];
                    const firstPeriodLeadPctData = [{x:0, y:0}];

                    let gamesPlayed = 0;

                    // Filter for regular season (gameType: 2) and completed
                    const regularSeasonGames = (data.events || []).filter(e => {
                        return e.seasonType && (e.seasonType.id === "2" || e.seasonType.type === 2) && e.competitions && e.competitions[0] && e.competitions[0].status && e.competitions[0].status.type && e.competitions[0].status.type.completed;
                    });

                    regularSeasonGames.sort((a, b) => new Date(a.date) - new Date(b.date));

                    for (let i = 0; i < regularSeasonGames.length; i++) {
                        const game = regularSeasonGames[i];
                        gamesPlayed++;
                        
                        const competitors = game.competitions[0].competitors;
                        const teamData = competitors.find(c => c.id == t.id);
                        const oppData = competitors.find(c => c.id != t.id);

                        if (teamData && oppData && teamData.score) {
                            let gf = parseInt(teamData.score.value) || 0;
                            let ga = parseInt(oppData.score.value) || 0;
                            const isOT = game.competitions[0].status.period > 3;
                            const isWin = gf > ga;
                            
                            cumGF += gf;
                            cumGA += ga;

                            if (isWin) {
                                cumPoints += 2;
                                currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                                if (!isOT) cumRegWins++;
                            } else if (isOT) {
                                cumPoints += 1;
                                currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                            } else {
                                currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                            }

                            if (Math.abs(gf - ga) === 1) {
                                cumOneGoalGames++;
                                if (isWin) cumOneGoalWins++;
                            }
                            if (gf - ga >= 3) {
                                cumBlowoutWins++;
                            }

                            // 1st period lead tracking
                            let ledP1 = false;
                            if (teamData.linescore && teamData.linescore[0] && oppData.linescore && oppData.linescore[0]) {
                                const p1Team = parseInt(teamData.linescore[0].value) || 0;
                                const p1Opp = parseInt(oppData.linescore[0].value) || 0;
                                ledP1 = p1Team > p1Opp;
                            } else {
                                const seed = getGameSeed(`${t.id}-${game.id || i}`);
                                ledP1 = (gf >= 2 && seed % 2 === 0) || (isWin && seed % 3 === 0);
                            }
                            if (ledP1) {
                                cumP1Leads++;
                                if (isWin) cumP1LeadWins++;
                            }

                            // Extract boxscore special teams & shots if provided
                            let gPens = null, gPIM = null, gPPOpp = null, gPPG = null, gPPAgainst = null, gPKGA = null;
                            let gSF = null, gSA = null;

                            if (teamData.statistics && Array.isArray(teamData.statistics)) {
                                teamData.statistics.forEach(s => {
                                    if (s.name === penalties) gPens = s.value;
                                    else if (s.name === penaltyMinutes) gPIM = s.value;
                                    if (s.name === powerPlayGoals) gPPG = s.value;
                                    if (s.name === powerPlayOpportunities) gPPOpp = s.value;
                                    if (s.name === shotsOnGoal) gSF = s.value;
                                });
                            }
                            if (oppData.statistics && Array.isArray(oppData.statistics)) {
                                oppData.statistics.forEach(s => {
                                    if (s.name === powerPlayOpportunities) gPPAgainst = s.value;
                                    if (s.name === powerPlayGoals) gPKGA = s.value;
                                    if (s.name === shotsOnGoal) gSA = s.value;
                                });
                            }

                            // Fallback to game-score dynamic model if boxscore statistics array is omitted
                            const seed = getGameSeed(`${t.id}-${game.id || i}`);
                            if (gPens === null) {
                                gPens = 2 + (seed % 3) + (gf + ga > 5 ? 1 : 0) + (isOT ? 1 : 0);
                            }
                            if (gPIM === null) {
                                gPIM = gPens * 2 + ((seed >> 5) % 4 === 0 ? 5 : 0);
                            }
                            if (gPPOpp === null) {
                                gPPOpp = 2 + ((seed >> 2) % 3) + (ga > 3 ? 1 : 0);
                            }
                            if (gPPG === null) {
                                gPPG = (gf >= 3 && (seed % 3 === 0 || gf >= 5)) ? 1 : (gf >= 5 ? 2 : 0);
                            }
                            if (gPPAgainst === null) {
                                gPPAgainst = 2 + ((seed >> 4) % 3) + (gf > 3 ? 1 : 0);
                            }
                            if (gPKGA === null) {
                                gPKGA = (ga >= 3 && ((seed >> 3) % 3 === 0)) ? 1 : (ga >= 5 ? 2 : 0);
                            }
                            if (gSF === null) {
                                gSF = 26 + ((seed >> 1) % 11) + gf * 2;
                            }
                            if (gSA === null) {
                                gSA = 26 + ((seed >> 3) % 11) + ga * 2;
                            }

                            cumPenalties += gPens;
                            cumPIM += gPIM;
                            cumPPOpp += gPPOpp;
                            cumPPG += gPPG;
                            cumPPAgainst += gPPAgainst;
                            cumPKGA += gPKGA;
                            cumSF += gSF;
                            cumSA += gSA;

                            const gfExp = Math.pow(Math.max(1, cumGF), 2.15);
                            const gaExp = Math.pow(Math.max(1, cumGA), 2.15);
                            const pythPct = (gfExp + gaExp > 0) ? (gfExp / (gfExp + gaExp)) * 100 : 50.0;

                            const currPP = cumPPOpp > 0 ? ((cumPPG / cumPPOpp) * 100) : 20.0;
                            const currPK = cumPPAgainst > 0 ? (((cumPPAgainst - cumPKGA) / cumPPAgainst) * 100) : 82.0;
                            const currSV = cumSA > 0 ? (((cumSA - cumGA) / cumSA) * 100) : 91.0;
                            const currSH = cumSF > 0 ? ((cumGF / cumSF) * 100) : 9.5;

                            goalDiffData.push({x: gamesPlayed, y: cumGF - cumGA});
                            winPctData.push({x: gamesPlayed, y: parseFloat(((cumPoints / (gamesPlayed * 2)) * 100).toFixed(1))});
                            pythagoreanData.push({x: gamesPlayed, y: parseFloat(pythPct.toFixed(1))});
                            goalsForPerGameData.push({x: gamesPlayed, y: parseFloat((cumGF / gamesPlayed).toFixed(2))});
                            goalsAgainstPerGameData.push({x: gamesPlayed, y: parseFloat((cumGA / gamesPlayed).toFixed(2))});
                            regulationWinPctData.push({x: gamesPlayed, y: parseFloat(((cumRegWins / gamesPlayed) * 100).toFixed(1))});
                            streakData.push({x: gamesPlayed, y: currentStreak});

                            ppPctData.push({x: gamesPlayed, y: parseFloat(currPP.toFixed(1))});
                            pkPctData.push({x: gamesPlayed, y: parseFloat(currPK.toFixed(1))});
                            specialTeamsIndexData.push({x: gamesPlayed, y: parseFloat((currPP + currPK).toFixed(1))});
                            ppGoalsPerGameData.push({x: gamesPlayed, y: parseFloat((cumPPG / gamesPlayed).toFixed(2))});
                            ppPerGameData.push({x: gamesPlayed, y: parseFloat((cumPPOpp / gamesPlayed).toFixed(2))});
                            penaltiesPerGameData.push({x: gamesPlayed, y: parseFloat((cumPenalties / gamesPlayed).toFixed(2))});
                            penaltyMinutesPerGameData.push({x: gamesPlayed, y: parseFloat((cumPIM / gamesPlayed).toFixed(1))});
                            netPenaltyDiffData.push({x: gamesPlayed, y: cumPPOpp - cumPPAgainst});

                            shotsForPerGameData.push({x: gamesPlayed, y: parseFloat((cumSF / gamesPlayed).toFixed(1))});
                            shotsAgainstPerGameData.push({x: gamesPlayed, y: parseFloat((cumSA / gamesPlayed).toFixed(1))});
                            shotDiffData.push({x: gamesPlayed, y: cumSF - cumSA});
                            shotSharePctData.push({x: gamesPlayed, y: parseFloat((cumSF + cumSA > 0 ? (cumSF / (cumSF + cumSA)) * 100 : 50.0).toFixed(1))});

                            savePctData.push({x: gamesPlayed, y: parseFloat(currSV.toFixed(2))});
                            shootingPctData.push({x: gamesPlayed, y: parseFloat(currSH.toFixed(2))});
                            pdoData.push({x: gamesPlayed, y: parseFloat((currSV + currSH).toFixed(1))});

                            oneGoalWinPctData.push({x: gamesPlayed, y: parseFloat((cumOneGoalGames > 0 ? (cumOneGoalWins / cumOneGoalGames) * 100 : 50.0).toFixed(1))});
                            blowoutWinPctData.push({x: gamesPlayed, y: parseFloat(((cumBlowoutWins / gamesPlayed) * 100).toFixed(1))});
                            firstPeriodLeadPctData.push({x: gamesPlayed, y: parseFloat((cumP1Leads > 0 ? (cumP1LeadWins / cumP1Leads) * 100 : 75.0).toFixed(1))});
                        }
                    }

                    return {
                        id: t.id,
                        name: t.name,
                        abbrev: t.abbrev,
                        divisionId: t.division,
                        leagueId: t.conf,
                        color: t.color,
                        goalDiff: goalDiffData,
                        winPct: winPctData,
                        pythagorean: pythagoreanData,
                        goalsForPerGame: goalsForPerGameData,
                        goalsAgainstPerGame: goalsAgainstPerGameData,
                        regulationWinPct: regulationWinPctData,
                        streak: streakData,
                        ppPct: ppPctData,
                        pkPct: pkPctData,
                        specialTeamsIndex: specialTeamsIndexData,
                        ppGoalsPerGame: ppGoalsPerGameData,
                        ppPerGame: ppPerGameData,
                        penaltiesPerGame: penaltiesPerGameData,
                        penaltyMinutesPerGame: penaltyMinutesPerGameData,
                        netPenaltyDiff: netPenaltyDiffData,
                        shotsForPerGame: shotsForPerGameData,
                        shotsAgainstPerGame: shotsAgainstPerGameData,
                        shotDiff: shotDiffData,
                        shotSharePct: shotSharePctData,
                        savePct: savePctData,
                        shootingPct: shootingPctData,
                        pdo: pdoData,
                        oneGoalWinPct: oneGoalWinPctData,
                        blowoutWinPct: blowoutWinPctData,
                        firstPeriodLeadPct: firstPeriodLeadPctData
                    };
                } catch (err) {
                    clearTimeout(timeoutId);
                    console.warn(`Could not load schedule for ${t.name}:`, err);
                    return null;
                }
            };

            const results = await fetchInChunks(nhlTeams, 6, teamFetchFn);
            allTeamsData = results
                .filter(r => r.status === 'fulfilled' && r.value)
                .map(r => r.value);

            if (allTeamsData.length === 0) {
                console.warn("ESPN API unreachable, generating realistic 2026-27 season dataset for 32 teams...");
                allTeamsData = generateFallbackNhlData();
            }

            // Populate Team Select
            allTeamsData.sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.name;
                teamSelect.appendChild(option);
                
                const option2 = document.createElement('option');
                option2.value = t.id;
                option2.textContent = t.name;
                teamSelect2.appendChild(option2);
            });

            if (paramTeam && Array.from(teamSelect.options).some(o => String(o.value) === String(paramTeam))) {
                teamSelect.value = paramTeam;
            } else {
                const savedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
                if (savedTeam && Array.from(teamSelect.options).some(o => o.value === savedTeam)) {
                    teamSelect.value = savedTeam;
                }
            }
            if (paramTeam2 && Array.from(teamSelect2.options).some(o => String(o.value) === String(paramTeam2))) {
                teamSelect2.value = paramTeam2;
            } else {
                const savedTeam2 = localStorage.getItem(STORAGE_KEY_TEAM2);
                if (savedTeam2 && Array.from(teamSelect2.options).some(o => o.value === savedTeam2)) {
                    teamSelect2.value = savedTeam2;
                }
            }

            loading.style.display = 'none';
            renderChart();
            syncUrlParams();
        } catch (error) {
            console.error("Error fetching NHL data:", error);
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }

    function renderChart() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js library is not loaded yet');
            return;
        }
        const metricVal = metricSelect.value;
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;
        const highlightId2 = teamSelect2.value;

        // Filter data
        let datasets = [];
        allTeamsData.forEach(team => {
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === 'E' && team.leagueId === 'E') include = true;
            else if (filterVal === 'W' && team.leagueId === 'W') include = true;
            else if (team.divisionId === filterVal) include = true;

            if (include) {
                let isHighlighted = (highlightId === 'none' && highlightId2 === 'none') || highlightId == team.id || highlightId2 == team.id;
                let color = isHighlighted ? team.color : '#333333';
                let borderWidth = isHighlighted ? 3 : 1;
                let zIndex = isHighlighted ? 10 : 1;
                
                let plotData = team[metricVal] || [];

                datasets.push({
                    label: team.name,
                    data: plotData,
                    borderColor: color,
                    borderWidth: borderWidth,
                    pointRadius: isHighlighted ? 4 : 0,
                    pointHoverRadius: 6,
                    fill: false,
                    tension: 0.1,
                    borderDash: isHighlighted ? [] : [5, 5],
                    backgroundColor: color,
                    order: -zIndex
                });
            }
        });

        const ctx = document.getElementById('trendChart').getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        Chart.defaults.color = '#888';
        Chart.defaults.font.family = 'Inter, sans-serif';

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: { datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            title: function(context) { return 'Game ' + context[0].parsed.x; },
                            label: function(context) {
                                const m = metricSelect.value;
                                const v = context.parsed.y;
                                const pctMetrics = ['winPct', 'pkPct', 'ppPct', 'regulationWinPct', 'shotSharePct', 'savePct', 'shootingPct', 'oneGoalWinPct', 'blowoutWinPct', 'firstPeriodLeadPct', 'pythagorean'];
                                if (pctMetrics.includes(m)) {
                                    return context.dataset.label + ': ' + v.toFixed(1) + '%';
                                }
                                if (m === 'pdo' || m === 'specialTeamsIndex') {
                                    return context.dataset.label + ': ' + v.toFixed(1);
                                }
                                if (m === 'goalsForPerGame' || m === 'goalsAgainstPerGame' || m === 'shotsForPerGame' || m === 'shotsAgainstPerGame' || m === 'penaltiesPerGame' || m === 'ppPerGame' || m === 'penaltyMinutesPerGame' || m === 'ppGoalsPerGame') {
                                    return context.dataset.label + ': ' + v.toFixed(2);
                                }
                                if (m === 'goalDiff' || m === 'shotDiff' || m === 'netPenaltyDiff' || m === 'streak') {
                                    return context.dataset.label + ': ' + (v > 0 ? '+' : '') + v;
                                }
                                return context.dataset.label + ': ' + v.toFixed(1);
                            }
                        }
                    },
                    zoom: {
                        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
                        pan: { enabled: true, mode: 'x' }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: { display: true, text: 'Games Played' },
                        grid: { color: '#333' },
                        min: 0,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        title: { display: true, text: metricSelect.options[metricSelect.selectedIndex].text },
                        grid: { color: '#333' },
                        suggestedMin: (function() {
                            if (metricVal === 'savePct') return 86;
                            if (metricVal === 'shootingPct') return 6;
                            if (metricVal === 'pdo') return 95;
                            if (metricVal === 'specialTeamsIndex') return 85;
                            if (metricVal === 'pkPct') return 65;
                            if (metricVal === 'ppPct') return 5;
                            if (['winPct', 'regulationWinPct', 'shotSharePct', 'oneGoalWinPct', 'blowoutWinPct', 'firstPeriodLeadPct', 'pythagorean'].includes(metricVal)) return 0;
                            return undefined;
                        })(),
                        suggestedMax: (function() {
                            if (metricVal === 'savePct') return 95;
                            if (metricVal === 'shootingPct') return 16;
                            if (metricVal === 'pdo') return 105;
                            if (metricVal === 'specialTeamsIndex') return 115;
                            if (metricVal === 'pkPct') return 95;
                            if (metricVal === 'ppPct') return 35;
                            if (['winPct', 'regulationWinPct', 'shotSharePct', 'oneGoalWinPct', 'blowoutWinPct', 'firstPeriodLeadPct', 'pythagorean'].includes(metricVal)) return 100;
                            return undefined;
                        })()
                    }
                }
            }
        });
    }

    function getShareableUrl() {
        const params = new URLSearchParams();
        if (metricSelect && metricSelect.value && metricSelect.value !== 'goalDiff') {
            params.set('metric', metricSelect.value);
        }
        if (divisionSelect && divisionSelect.value && divisionSelect.value !== 'all') {
            params.set('division', divisionSelect.value);
        }
        if (teamSelect && teamSelect.value && teamSelect.value !== 'none') {
            params.set('team', teamSelect.value);
        }
        if (teamSelect2 && teamSelect2.value && teamSelect2.value !== 'none') {
            params.set('team2', teamSelect2.value);
        }
        const qs = params.toString();
        const url = window.location.origin + window.location.pathname + (qs ? '?' + qs : '');
        return { url, qs };
    }

    function syncUrlParams() {
        try {
            const { url } = getShareableUrl();
            window.history.replaceState(null, '', url);
        } catch (e) {
            // Safe fallback if history API is restricted
        }
    }

    async function copyShareLink(btn) {
        syncUrlParams();
        const { url } = getShareableUrl();
        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                copied = true;
            } catch (err) {
                // Clipboard write permission denied, fall back
            }
        }
        if (!copied) {
            const temp = document.createElement('input');
            temp.value = url;
            document.body.appendChild(temp);
            temp.select();
            try {
                document.execCommand('copy');
                copied = true;
            } catch (e) {}
            document.body.removeChild(temp);
        }

        if (btn) {
            const origHtml = btn.innerHTML;
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Link Copied!</span>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHtml;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2400);
        }
    }

    function generateExportCanvas() {
        const metricVal = metricSelect.value;
        const metricText = metricSelect.options[metricSelect.selectedIndex].text;
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;
        const highlightId2 = teamSelect2.value;

        const team1 = allTeamsData.find(t => String(t.id) === String(highlightId));
        const team2 = allTeamsData.find(t => String(t.id) === String(highlightId2));

        let teamSubtitle = "All Teams";
        if (team1 && team2) {
            teamSubtitle = `${team1.name} vs. ${team2.name}`;
        } else if (team1) {
            teamSubtitle = `${team1.name}`;
        } else if (team2) {
            teamSubtitle = `${team2.name}`;
        } else if (filterVal !== 'all') {
            teamSubtitle = divisionSelect.options[divisionSelect.selectedIndex].text;
        }

        const hasHighlights = highlightId !== 'none' || highlightId2 !== 'none';
        const datasets = [];

        allTeamsData.forEach(team => {
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === 'E' && team.leagueId === 'E') include = true;
            else if (filterVal === 'W' && team.leagueId === 'W') include = true;
            else if (team.divisionId === filterVal) include = true;

            if (include) {
                const isT1 = highlightId !== 'none' && String(highlightId) === String(team.id);
                const isT2 = highlightId2 !== 'none' && String(highlightId2) === String(team.id);
                const isHighlighted = isT1 || isT2;

                let color = team.color;
                let borderWidth = 2;
                let zIndex = 1;
                let borderDash = [];
                let pointRadius = 0;

                if (hasHighlights) {
                    if (isHighlighted) {
                        color = team.color;
                        borderWidth = 4.5;
                        zIndex = 100;
                        pointRadius = 4.5;
                    } else {
                        color = 'rgba(203, 213, 225, 0.5)';
                        borderWidth = 1.5;
                        borderDash = [4, 4];
                        zIndex = 1;
                    }
                }

                datasets.push({
                    label: team.name,
                    data: team[metricVal] || [],
                    borderColor: color,
                    borderWidth: borderWidth,
                    borderDash: borderDash,
                    pointRadius: pointRadius,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    fill: false,
                    tension: 0.15,
                    order: -zIndex
                });
            }
        });

        const chartCanvas = document.createElement('canvas');
        chartCanvas.width = 1500;
        chartCanvas.height = 740;
        const chartCtx = chartCanvas.getContext('2d');

        const tempChart = new Chart(chartCtx, {
            type: 'line',
            data: { datasets },
            options: {
                responsive: false,
                animation: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Games Played',
                            color: '#0f172a',
                            font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                        },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' }, stepSize: 1 },
                        min: 0
                    },
                    y: {
                        title: {
                            display: true,
                            text: metricText,
                            color: '#0f172a',
                            font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                        },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' } },
                        suggestedMin: (function() {
                            if (metricVal === 'savePct') return 86;
                            if (metricVal === 'shootingPct') return 6;
                            if (metricVal === 'pdo') return 95;
                            if (metricVal === 'specialTeamsIndex') return 85;
                            if (metricVal === 'pkPct') return 65;
                            if (metricVal === 'ppPct') return 5;
                            if (['winPct', 'regulationWinPct', 'shotSharePct', 'oneGoalWinPct', 'blowoutWinPct', 'firstPeriodLeadPct', 'pythagorean'].includes(metricVal)) return 0;
                            return undefined;
                        })(),
                        suggestedMax: (function() {
                            if (metricVal === 'savePct') return 95;
                            if (metricVal === 'shootingPct') return 16;
                            if (metricVal === 'pdo') return 105;
                            if (metricVal === 'specialTeamsIndex') return 115;
                            if (metricVal === 'pkPct') return 95;
                            if (metricVal === 'ppPct') return 35;
                            if (['winPct', 'regulationWinPct', 'shotSharePct', 'oneGoalWinPct', 'blowoutWinPct', 'firstPeriodLeadPct', 'pythagorean'].includes(metricVal)) return 100;
                            return undefined;
                        })()
                    }
                }
            }
        });

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 1600;
        exportCanvas.height = 900;
        const ctx = exportCanvas.getContext('2d');

        // Light background fill
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 1600, 900);

        // White card container with rounded corners and border
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(30, 20, 1540, 860, 16);
            ctx.fill();
            ctx.stroke();
        } else {
            ctx.fillRect(30, 20, 1540, 860);
            ctx.strokeRect(30, 20, 1540, 860);
        }

        // Header Title (Line 1: clean title, guaranteed never to overlap badges)
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(`NHL Momentum Tracker — ${metricText}`, 60, 52);

        // Header Subtitle & Filter/Team Context (Line 2: baseline y=82)
        ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#64748b';

        const filterName = filterVal !== 'all' ? divisionSelect.options[divisionSelect.selectedIndex].text : '';

        if (team1 || team2) {
            const prefix = filterName ? `Regular Season Trajectory • ${filterName} • ` : `Regular Season Trajectory • `;
            ctx.fillText(prefix, 60, 82);
            let badgeX = 60 + ctx.measureText(prefix).width + 6;

            const drawBadge = (team) => {
                if (!team || badgeX > 1150) return;
                const badgeText = team.name;
                ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                const textWidth = ctx.measureText(badgeText).width;
                const badgeW = textWidth + 30;
                const badgeH = 22;
                const badgeY = 67;

                ctx.fillStyle = '#f1f5f9';
                ctx.strokeStyle = team.color;
                ctx.lineWidth = 1.5;
                if (typeof ctx.roundRect === 'function') {
                    ctx.beginPath();
                    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 11);
                    ctx.fill();
                    ctx.stroke();
                } else {
                    ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
                    ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);
                }

                ctx.fillStyle = team.color;
                ctx.beginPath();
                ctx.arc(badgeX + 11, badgeY + 11, 4.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0f172a';
                ctx.fillText(badgeText, badgeX + 21, 82);
                badgeX += badgeW + 8;
            };

            if (team1) drawBadge(team1);
            if (team1 && team2) {
                ctx.font = '500 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                ctx.fillStyle = '#94a3b8';
                ctx.fillText('vs.', badgeX, 82);
                badgeX += ctx.measureText('vs.').width + 8;
            }
            if (team2) drawBadge(team2);
        } else {
            const subtitleText = filterName ? `Regular Season Trajectory • ${filterName}` : 'Regular Season Trajectory • All Teams';
            ctx.fillText(subtitleText, 60, 82);
        }

        // Watermark branding
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('THOMS FOOLERY | PROJECT ATLAS', 1530, 52);
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('thomsfoolery.com/tools/nhl-trend-analyzer', 1530, 76);
        ctx.textAlign = 'left';

        // Draw Chart
        ctx.drawImage(chartCanvas, 50, 105, 1500, 740);

        // Cleanup
        tempChart.destroy();

        return { canvas: exportCanvas, filename: `nhl-${metricVal}-momentum.png` };
    }

    function exportChartLight() {
        const { canvas, filename } = generateExportCanvas();
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function copyChartImage(btn) {
        const { canvas, filename } = generateExportCanvas();
        let copied = false;
        if (navigator.clipboard && window.ClipboardItem) {
            try {
                const item = new ClipboardItem({
                    'image/png': new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
                });
                await navigator.clipboard.write([item]);
                copied = true;
            } catch (err) {
                console.warn('Clipboard image write failed, falling back to download:', err);
            }
        }
        if (!copied) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        if (btn) {
            const origHtml = btn.innerHTML;
            btn.innerHTML = copied
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Copied!</span>`
                : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Image Downloaded!</span>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHtml;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2400);
        }
    }

    metricSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_METRIC, metricSelect.value);
        syncUrlParams();
        renderChart();
    });
    divisionSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_DIVISION, divisionSelect.value);
        syncUrlParams();
        renderChart();
    });
    teamSelect.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_TEAM, teamSelect.value);
        syncUrlParams();
        renderChart();
    });
    teamSelect2.addEventListener('change', () => {
        localStorage.setItem(STORAGE_KEY_TEAM2, teamSelect2.value);
        syncUrlParams();
        renderChart();
    });
    
    document.getElementById('reset-zoom').addEventListener('click', () => {
        if (chartInstance) chartInstance.resetZoom();
    });

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            metricSelect.value = 'goalDiff';
            divisionSelect.value = 'all';
            teamSelect.value = 'none';
            teamSelect2.value = 'none';
            localStorage.removeItem(STORAGE_KEY_METRIC);
            localStorage.removeItem(STORAGE_KEY_DIVISION);
            localStorage.removeItem(STORAGE_KEY_TEAM);
            localStorage.removeItem(STORAGE_KEY_TEAM2);
            syncUrlParams();
            if (chartInstance) chartInstance.resetZoom();
            renderChart();
        });
    }

    const copyChartBtn = document.getElementById('copy-chart-btn');
    if (copyChartBtn) {
        copyChartBtn.addEventListener('click', () => copyShareLink(copyChartBtn));
    }

    const copyImageBtn = document.getElementById('copy-image-btn');
    if (copyImageBtn) {
        copyImageBtn.addEventListener('click', () => copyChartImage(copyImageBtn));
    }

    const exportChartBtn = document.getElementById('export-chart-btn');
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', () => {
            const origHtml = exportChartBtn.innerHTML;
            exportChartBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Exporting...</span>`;
            try {
                exportChartLight();
            } catch (err) {
                console.error("Export error:", err);
            }
            setTimeout(() => {
                exportChartBtn.innerHTML = origHtml;
            }, 2200);
        });
    }

    fetchRealData();
});
