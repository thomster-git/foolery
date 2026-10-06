document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    
    let chartInstance = null;
    let allTeamsData = []; // Store parsed team data

    function normalCDF(x) {
        var t = 1 / (1 + 0.2316419 * Math.abs(x));
        var d = 0.3989423 * Math.exp(-x * x / 2);
        var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
        return x > 0 ? 1 - p : p;
    }


    // Team colors (approximate) for the chart
    const teamColors = {
        108: '#BA0021', // Angels
        109: '#A71930', // D-backs
        110: '#DF4601', // Orioles
        111: '#BD3039', // Red Sox
        112: '#0E3386', // Cubs
        113: '#C6011F', // Reds
        114: '#13274F', // Guardians
        115: '#33006F', // Rockies
        116: '#0C2340', // Tigers
        117: '#003278', // Astros
        118: '#004687', // Royals
        119: '#005A9C', // Dodgers
        120: '#00A3E0', // Nationals
        121: '#004687', // Mets
        122: '#13294B', // Athletics
        133: '#005C5C', // Athletics (if moved or alternate ID)
        143: '#E31937', // Phillies
        134: '#FDB827', // Pirates
        135: '#2F241D', // Padres
        136: '#005C5C', // Mariners
        137: '#FD5A1E', // Giants
        138: '#C41E3A', // Cardinals
        139: '#092C5C', // Rays
        140: '#003278', // Rangers
        141: '#134A8E', // Blue Jays
        142: '#000000', // Twins
        144: '#13294B', // Braves
        145: '#000000', // White Sox
        146: '#00A3E0', // Marlins
        147: '#003087', // Yankees
        158: '#C41E3A'  // Brewers
    };

    async function fetchData() {
        try {
            // Fetch teams to build the team select and know division/leagues
            const teamsResponse = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
            const teamsData = await teamsResponse.json();
            
            // Map team info
            const teamMap = {};
            teamsData.teams.forEach(t => {
                teamMap[t.id] = {
                    id: t.id,
                    name: t.name,
                    leagueId: t.league ? t.league.id : null,
                    divisionId: t.division ? t.division.id : null
                };
            });

            // Fetch schedule for the whole season (e.g. 2026) to calculate run differentials
            // The API returns all games. 
            const scheduleResponse = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2026&gameType=P');
            const scheduleData = await scheduleResponse.json();

            // Process game data
            const teamPerformance = {};
            
            teamsData.teams.forEach(t => {
                teamPerformance[t.id] = {
                    games: []
                };
            });

            scheduleData.dates.forEach(dateObj => {
                dateObj.games.forEach(game => {
                    if (game.status.statusCode === 'F' || game.status.statusCode === 'O') {
                        const homeTeam = game.teams.home;
                        const awayTeam = game.teams.away;
                        
                        if (homeTeam.score !== undefined && awayTeam.score !== undefined) {
                            teamPerformance[homeTeam.team.id].games.push({
                                rs: homeTeam.score,
                                ra: awayTeam.score,
                                w: homeTeam.score > awayTeam.score ? 1 : 0
                            });
                            teamPerformance[awayTeam.team.id].games.push({
                                rs: awayTeam.score,
                                ra: homeTeam.score,
                                w: awayTeam.score > homeTeam.score ? 1 : 0
                            });
                        }
                    }
                });
            });

            // Format data for chart
            allTeamsData = Object.keys(teamPerformance).map(teamId => {
                const info = teamMap[teamId];
                if (!info) return null;
                
                const games = teamPerformance[teamId].games;
                let cumRS = 0, cumRA = 0, cumWins = 0;
                
                const runDiffData = [{x:0, y:0}];
                const gamesAbove500Data = [{x:0, y:0}];
                const rollingWinPctData = [{x:0, y:0}];
                const pythData = [{x:0, y:0}];
                const rollingRSData = [{x:0, y:0}];
                const rollingRAData = [{x:0, y:0}];
                const winPctData = [{x:0, y:0}];
                
                const oneRunWinPctData = [{x:0, y:0}];
                const blowoutWinPctData = [{x:0, y:0}];
                const streakData = [{x:0, y:0}];
                let cumOneRunGames = 0, cumOneRunWins = 0;
                let cumBlowoutGames = 0, cumBlowoutWins = 0;
                let currentStreak = 0;

                games.forEach((g, i) => {
                    const gameNum = i + 1;
                    cumRS += g.rs;
                    cumRA += g.ra;
                    cumWins += g.w;
                    
                    runDiffData.push({x: gameNum, y: cumRS - cumRA});
                    gamesAbove500Data.push({x: gameNum, y: cumWins - (gameNum - cumWins)});
                    
                    const diff = Math.abs(g.rs - g.ra);
                    if (diff === 1) {
                        cumOneRunGames++;
                        cumOneRunWins += g.w;
                    }
                    if (diff >= 5) {
                        cumBlowoutGames++;
                        cumBlowoutWins += g.w;
                    }
                    
                    if (g.w === 1) {
                        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                    } else {
                        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                    }
                    
                    oneRunWinPctData.push({x: gameNum, y: cumOneRunGames > 0 ? cumOneRunWins / cumOneRunGames : null});
                    blowoutWinPctData.push({x: gameNum, y: cumBlowoutGames > 0 ? cumBlowoutWins / cumBlowoutGames : null});
                    streakData.push({x: gameNum, y: currentStreak});
                    
                    if (gameNum < 10) {
                        winPctData.push({x: gameNum, y: null});
                        pythData.push({x: gameNum, y: null});
                        rollingWinPctData.push({x: gameNum, y: null});
                        rollingRSData.push({x: gameNum, y: null});
                        rollingRAData.push({x: gameNum, y: null});
                    } else {
                        winPctData.push({x: gameNum, y: cumWins / gameNum});
                        
                        const pyth = (cumRS === 0 && cumRA === 0) ? 0 : (Math.pow(cumRS, 2) / (Math.pow(cumRS, 2) + Math.pow(cumRA, 2)));
                        pythData.push({x: gameNum, y: pyth});
                        
                        let rollStart = Math.max(0, gameNum - 10);
                        let rollGames = gameNum - rollStart;
                        let rollRS = 0, rollRA = 0, rollW = 0;
                        for (let j = rollStart; j < gameNum; j++) {
                            rollRS += games[j].rs;
                            rollRA += games[j].ra;
                            rollW += games[j].w;
                        }
                        rollingWinPctData.push({x: gameNum, y: rollW / rollGames});
                        rollingRSData.push({x: gameNum, y: rollRS / rollGames});
                        rollingRAData.push({x: gameNum, y: rollRA / rollGames});
                    }
                });

                return {
                    id: teamId,
                    name: info.name,
                    leagueId: info.leagueId,
                    divisionId: info.divisionId,
                    runDiff: runDiffData,
                    gamesAbove500: gamesAbove500Data,
                    rollingWinPct: rollingWinPctData,
                    pythagorean: pythData,
                    oneRunWinPct: oneRunWinPctData,
                    blowoutWinPct: blowoutWinPctData,
                    streak: streakData,
                    rollingRunsScored: rollingRSData,
                    rollingRunsAllowed: rollingRAData,
                    winPct: winPctData,
                    color: teamColors[teamId] || '#999999'
                };
            }).filter(t => t !== null && t.runDiff.length > 1);

            // Dynamic Playoff Odds Calculation
            const maxGames = Math.max(...allTeamsData.map(t => t.runDiff.length));
            for (let t of allTeamsData) {
                t.playoffOdds = [{x:0, y:0}]; // Init
            }
            
            for (let gameNum = 1; gameNum < maxGames; gameNum++) {
                [103, 104].forEach(leagueId => {
                    let leagueTeams = allTeamsData.filter(t => t.leagueId == leagueId && t.runDiff[gameNum]);
                    if (leagueTeams.length < 6) return;
                    
                    let expectedStats = leagueTeams.map(t => {
                        let winPctObj = t.winPct[gameNum];
                        let pythObj = t.pythagorean[gameNum];
                        if (!winPctObj || !pythObj || winPctObj.y === null || pythObj.y === null) return null;
                        
                        let cumWins = Math.round(winPctObj.y * gameNum);
                        let pyth = pythObj.y;
                        if (pyth === 0) pyth = 0.001;
                        if (pyth === 1) pyth = 0.999;
                        let remaining = 162 - gameNum;
                        if (remaining <= 0) remaining = 0;
                        
                        let expWins = cumWins + (remaining * pyth);
                        let variance = remaining * pyth * (1 - pyth);
                        if (variance < 0.0001) variance = 0.0001;
                        
                        return { id: t.id, expWins, variance, cumWins, remaining };
                    }).filter(x => x !== null);
                    
                    if (expectedStats.length < 6) {
                        leagueTeams.forEach(t => t.playoffOdds.push({x: gameNum, y: null}));
                        return;
                    }
                    
                    expectedStats.sort((a, b) => b.expWins - a.expWins);
                    let team6 = expectedStats[5]; // The last team IN
                    let team7 = expectedStats.length > 6 ? expectedStats[6] : team6; // The first team OUT
                    
                    leagueTeams.forEach(t => {
                        let stat = expectedStats.find(s => s.id === t.id);
                        if (!stat) {
                            t.playoffOdds.push({x: gameNum, y: null});
                            return;
                        }
                        
                        if (stat.remaining <= 0) {
                            t.playoffOdds.push({x: gameNum, y: stat.cumWins >= team6.cumWins ? 100 : 0});
                        } else {
                            let targetTeam = (stat.expWins >= team6.expWins) ? team7 : team6;
                            
                            let diffExp = stat.expWins - targetTeam.expWins;
                            // Multiply variance by 3.0 to account for empirical uncertainties (injuries, schedule, non-independence)
                            // This softens extreme probabilities (like 99.9%) down to more realistic numbers (like 85-90%)
                            let diffVar = (stat.variance + targetTeam.variance) * 3.0; 
                            let z = diffVar > 0 ? (diffExp / Math.sqrt(diffVar)) : 0;
                            let prob = normalCDF(z) * 100;
                            t.playoffOdds.push({x: gameNum, y: prob});
                        }
                    });
                });
            }

            // Populate Team Select
            allTeamsData.sort((a, b) => a.name.localeCompare(b.name)).forEach(t => {
                const option = document.createElement('option');
                option.value = t.id;
                option.textContent = t.name;
                teamSelect.appendChild(option);
            });

            loading.style.display = 'none';
            renderChart();

        } catch (e) {
            console.error(e);
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }

    function renderChart() {
        const metricVal = metricSelect ? metricSelect.value : 'runDiff';
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;

        // Filter data
        let datasets = [];
        allTeamsData.forEach(team => {
            // Apply division/league filter
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === '103' && team.leagueId == 103) include = true;
            else if (filterVal === '104' && team.leagueId == 104) include = true;
            else if (team.divisionId == filterVal) include = true;

            if (include) {
                let isHighlighted = highlightId === 'none' || highlightId == team.id;
                let color = isHighlighted ? team.color : '#333333';
                let opacity = highlightId === 'none' ? 0.7 : (isHighlighted ? 1 : 0.1);
                let borderWidth = isHighlighted ? 2 : 1;
                let zIndex = isHighlighted ? 10 : 1;
                
                let plotData = team.runDiff;
                if (metricVal === 'gamesAbove500') plotData = team.gamesAbove500;
                else if (metricVal === 'rollingWinPct') plotData = team.rollingWinPct;
                else if (metricVal === 'pythagorean') plotData = team.pythagorean;
                else if (metricVal === 'rollingRunsScored') plotData = team.rollingRunsScored;
                else if (metricVal === 'rollingRunsAllowed') plotData = team.rollingRunsAllowed;
                else if (metricVal === 'winPct') plotData = team.winPct;
                else if (metricVal === 'oneRunWinPct') plotData = team.oneRunWinPct;
                else if (metricVal === 'blowoutWinPct') plotData = team.blowoutWinPct;
                else if (metricVal === 'streak') plotData = team.streak;
                else if (metricVal === 'playoffOdds') plotData = team.playoffOdds;

                datasets.push({
                    label: team.name,
                    data: plotData,
                    borderColor: color,
                    borderWidth: borderWidth,
                    pointRadius: 0, // hide points for smooth line
                    pointHoverRadius: 4,
                    fill: false,
                    tension: 0.2, // slight curve
                    borderDash: isHighlighted ? [] : [5, 5], // dashed if not highlighted
                    backgroundColor: color,
                    order: -zIndex // Chart.js draws higher order first, so lower order is on top
                });
            }
        });

        const ctx = document.getElementById('trendChart').getContext('2d');

        if (chartInstance) {
            chartInstance.destroy();
        }

        // Configure Chart.js dark theme defaults
        Chart.defaults.color = '#888';
        Chart.defaults.font.family = 'Inter, sans-serif';

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: false // Too many teams to show legend, use dropdown instead
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return 'Game ' + context[0].parsed.x;
                            }
                        }
                    },
                    zoom: {
                        zoom: {
                            wheel: { enabled: true },
                            pinch: { enabled: true },
                            mode: 'x',
                        },
                        pan: {
                            enabled: true,
                            mode: 'x',
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Games Played'
                        },
                        grid: {
                            color: '#333'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: metricSelect ? metricSelect.options[metricSelect.selectedIndex].text : 'Metric'
                        },
                        grid: {
                            color: '#333'
                        }
                    }
                }
            }
        });
    }

    if (metricSelect) metricSelect.addEventListener('change', renderChart);
    divisionSelect.addEventListener('change', renderChart);
    teamSelect.addEventListener('change', renderChart);
    
    const resetZoomBtn = document.getElementById('reset-zoom');
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            if (chartInstance) {
                chartInstance.resetZoom();
            }
        });
    }

    fetchData();
});
