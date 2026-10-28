document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    
    let chartInstance = null;
    let allTeamsData = []; // Store parsed team data

    // localStorage persistence keys
    const STORAGE_KEY_METRIC = 'atlas_baseball_metric';
    const STORAGE_KEY_DIVISION = 'atlas_baseball_division';
    const STORAGE_KEY_TEAM = 'atlas_baseball_team';

    const urlParams = new URLSearchParams(window.location.search);
    const paramMetric = urlParams.get('metric');
    const paramDivision = urlParams.get('division');
    const paramTeam = urlParams.get('team') || urlParams.get('team1');

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
            const scheduleResponse = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2026&gameType=R');
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
                        
                        let teamIndex = expectedStats.findIndex(s => s.id === stat.id);
                        if (stat.remaining <= 0) {
                            t.playoffOdds.push({x: gameNum, y: teamIndex < 6 ? 100 : 0});
                        } else {
                            let targetTeam = teamIndex < 6 ? team7 : team6;
                            
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

            if (paramTeam && Array.from(teamSelect.options).some(o => String(o.value) === String(paramTeam))) {
                teamSelect.value = paramTeam;
            } else {
                const savedTeam = localStorage.getItem(STORAGE_KEY_TEAM);
                if (savedTeam && Array.from(teamSelect.options).some(o => o.value === savedTeam)) {
                    teamSelect.value = savedTeam;
                }
            }

            loading.style.display = 'none';
            populateAwardsAndStandings();
            renderChart();
            syncUrlParams();

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

    function getShareableUrl() {
        const params = new URLSearchParams();
        if (metricSelect && metricSelect.value && metricSelect.value !== 'runDiff') {
            params.set('metric', metricSelect.value);
        }
        if (divisionSelect && divisionSelect.value && divisionSelect.value !== 'all') {
            params.set('division', divisionSelect.value);
        }
        if (teamSelect && teamSelect.value && teamSelect.value !== 'none') {
            params.set('team', teamSelect.value);
        }
        const qs = params.toString();
        const url = window.location.origin + window.location.pathname + (qs ? '?' + qs : '');
        return { url, qs };
    }

    function syncUrlParams() {
        try {
            const { url } = getShareableUrl();
            window.history.replaceState(null, '', url);
        } catch (e) {}
    }

    async function copyShareLink(btn) {
        syncUrlParams();
        const { url } = getShareableUrl();
        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(url);
                copied = true;
            } catch (err) {}
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
        const metricVal = metricSelect ? metricSelect.value : 'runDiff';
        const metricText = metricSelect ? metricSelect.options[metricSelect.selectedIndex].text : 'Run Differential';
        const filterVal = divisionSelect.value;
        const highlightId = teamSelect.value;

        const team = allTeamsData.find(t => String(t.id) === String(highlightId));

        let teamSubtitle = "All 30 MLB Teams";
        if (team) {
            teamSubtitle = team.name;
        } else if (filterVal !== 'all') {
            teamSubtitle = divisionSelect.options[divisionSelect.selectedIndex].text;
        }

        const hasHighlights = highlightId !== 'none';
        const datasets = [];

        allTeamsData.forEach(teamObj => {
            let include = false;
            if (filterVal === 'all') include = true;
            else if (filterVal === '103' && teamObj.leagueId == 103) include = true;
            else if (filterVal === '104' && teamObj.leagueId == 104) include = true;
            else if (teamObj.divisionId == filterVal) include = true;

            if (include) {
                const isHighlighted = highlightId !== 'none' && String(highlightId) === String(teamObj.id);

                let color = teamObj.color;
                let borderWidth = 2;
                let zIndex = 1;
                let borderDash = [];
                let pointRadius = 0;

                if (hasHighlights) {
                    if (isHighlighted) {
                        color = teamObj.color;
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

                let plotData = teamObj.runDiff;
                if (metricVal === 'gamesAbove500') plotData = teamObj.gamesAbove500;
                else if (metricVal === 'rollingWinPct') plotData = teamObj.rollingWinPct;
                else if (metricVal === 'pythagorean') plotData = teamObj.pythagorean;
                else if (metricVal === 'rollingRunsScored') plotData = teamObj.rollingRunsScored;
                else if (metricVal === 'rollingRunsAllowed') plotData = teamObj.rollingRunsAllowed;
                else if (metricVal === 'winPct') plotData = teamObj.winPct;
                else if (metricVal === 'oneRunWinPct') plotData = teamObj.oneRunWinPct;
                else if (metricVal === 'blowoutWinPct') plotData = teamObj.blowoutWinPct;
                else if (metricVal === 'streak') plotData = teamObj.streak;
                else if (metricVal === 'playoffOdds') plotData = teamObj.playoffOdds;

                datasets.push({
                    label: teamObj.name,
                    data: plotData,
                    borderColor: color,
                    borderWidth: borderWidth,
                    borderDash: borderDash,
                    pointRadius: pointRadius,
                    pointBackgroundColor: color,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    fill: false,
                    tension: 0.2,
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
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' }, stepSize: 10 }
                    },
                    y: {
                        title: {
                            display: true,
                            text: metricText,
                            color: '#0f172a',
                            font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                        },
                        grid: { color: '#e2e8f0' },
                        ticks: { color: '#475569', font: { size: 12, family: 'Inter, sans-serif' } }
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
        ctx.fillText(`MLB Momentum Tracker — ${metricText}`, 60, 52);

        // Header Subtitle & Filter/Team Context (Line 2: baseline y=82)
        ctx.font = '500 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        ctx.fillStyle = '#64748b';

        const filterName = filterVal !== 'all' ? divisionSelect.options[divisionSelect.selectedIndex].text : '';

        if (team) {
            const prefix = filterName ? `Regular Season Trajectory • ${filterName} • ` : `Regular Season Trajectory • `;
            ctx.fillText(prefix, 60, 82);
            let badgeX = 60 + ctx.measureText(prefix).width + 6;

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
        } else {
            const subtitleText = filterName ? `Regular Season Trajectory • ${filterName}` : 'Regular Season Trajectory • All 30 MLB Teams';
            ctx.fillText(subtitleText, 60, 82);
        }

        // Watermark branding
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.fillText('THOMS FOOLERY | PROJECT ATLAS', 1530, 52);
        ctx.font = '400 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('thomsfoolery.com/tools/baseball-trend-analyzer', 1530, 76);
        ctx.textAlign = 'left';

        // Draw Chart
        ctx.drawImage(chartCanvas, 50, 105, 1500, 740);

        // Cleanup
        tempChart.destroy();

        return { canvas: exportCanvas, filename: `mlb-${metricVal}-momentum.png` };
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

    function populateAwardsAndStandings() {
        const container = document.getElementById('awards-container');
        const top10El = document.getElementById('award-top10');
        const bottom10El = document.getElementById('award-bottom10');
        const winStreakEl = document.getElementById('award-winstreak');
        const lossStreakEl = document.getElementById('award-lossstreak');
        const bestDiffEl = document.getElementById('award-bestdiff');
        const worstDiffEl = document.getElementById('award-worstdiff');
        if (!container || !allTeamsData || allTeamsData.length === 0) return;

        const stats = allTeamsData.map(t => {
            const gamesCount = t.runDiff ? t.runDiff.length - 1 : 0;
            const finalDiff = gamesCount > 0 ? t.runDiff[gamesCount].y : 0;
            const finalWinPctObj = t.winPct ? t.winPct[gamesCount] : null;
            const finalWinPct = finalWinPctObj && finalWinPctObj.y !== null ? finalWinPctObj.y : 0;

            let maxWStreak = 0;
            let maxLStreak = 0;
            if (t.streak) {
                t.streak.forEach(s => {
                    if (s.y > maxWStreak) maxWStreak = s.y;
                    if (s.y < 0 && Math.abs(s.y) > maxLStreak) maxLStreak = Math.abs(s.y);
                });
            }

            return {
                id: t.id,
                name: t.name,
                gamesCount,
                finalDiff,
                finalWinPct,
                maxWStreak,
                maxLStreak
            };
        });

        const sortedTop = [...stats].sort((a, b) => b.finalWinPct - a.finalWinPct || b.finalDiff - a.finalDiff);
        const top10 = sortedTop.slice(0, 10);
        const bottom10 = [...sortedTop].reverse().slice(0, 10);

        if (top10El) {
            top10El.innerHTML = top10.map(t => `<li><strong>${t.name}</strong> (${(t.finalWinPct * 100).toFixed(1)}%)</li>`).join('');
        }
        if (bottom10El) {
            bottom10El.innerHTML = bottom10.map(t => `<li><strong>${t.name}</strong> (${(t.finalWinPct * 100).toFixed(1)}%)</li>`).join('');
        }

        const bestWinStreakTeam = [...stats].sort((a, b) => b.maxWStreak - a.maxWStreak)[0];
        const worstLossStreakTeam = [...stats].sort((a, b) => b.maxLStreak - a.maxLStreak)[0];
        const bestDiffTeam = [...stats].sort((a, b) => b.finalDiff - a.finalDiff)[0];
        const worstDiffTeam = [...stats].sort((a, b) => a.finalDiff - b.finalDiff)[0];

        if (winStreakEl && bestWinStreakTeam) winStreakEl.textContent = `${bestWinStreakTeam.name} (${bestWinStreakTeam.maxWStreak} games)`;
        if (lossStreakEl && worstLossStreakTeam) lossStreakEl.textContent = `${worstLossStreakTeam.name} (${worstLossStreakTeam.maxLStreak} games)`;
        if (bestDiffEl && bestDiffTeam) bestDiffEl.textContent = `${bestDiffTeam.name} (${bestDiffTeam.finalDiff > 0 ? '+' : ''}${bestDiffTeam.finalDiff})`;
        if (worstDiffEl && worstDiffTeam) worstDiffEl.textContent = `${worstDiffTeam.name} (${worstDiffTeam.finalDiff > 0 ? '+' : ''}${worstDiffTeam.finalDiff})`;

        container.style.display = 'block';
    }

    async function copyAwardsTable(btn) {
        const top10 = Array.from(document.querySelectorAll('#award-top10 li')).map(li => li.textContent.trim());
        const bottom10 = Array.from(document.querySelectorAll('#award-bottom10 li')).map(li => li.textContent.trim());
        const winStreak = document.getElementById('award-winstreak')?.textContent || '';
        const lossStreak = document.getElementById('award-lossstreak')?.textContent || '';
        const bestDiff = document.getElementById('award-bestdiff')?.textContent || '';
        const worstDiff = document.getElementById('award-worstdiff')?.textContent || '';

        let text = "2026 MLB Season Awards & Standings\n\n";
        text += "Top 10 Teams (Win %):\n" + top10.map((t, idx) => `${idx + 1}. ${t}`).join('\n') + "\n\n";
        text += "Bottom 10 Teams (Win %):\n" + bottom10.map((t, idx) => `${idx + 1}. ${t}`).join('\n') + "\n\n";
        text += "Notable Streaks & Metrics:\n";
        text += `• Longest Win Streak: ${winStreak}\n`;
        text += `• Longest Losing Streak: ${lossStreak}\n`;
        text += `• Best Run Differential: ${bestDiff}\n`;
        text += `• Worst Run Differential: ${worstDiff}\n`;

        let copied = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                copied = true;
            } catch (err) {}
        }
        if (!copied) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
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

        if (btn) {
            const origHtml = btn.innerHTML;
            btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>✓ Table Copied!</span>`;
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(() => {
                btn.innerHTML = origHtml;
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 2400);
        }
    }

    if (metricSelect) {
        metricSelect.addEventListener('change', () => {
            localStorage.setItem(STORAGE_KEY_METRIC, metricSelect.value);
            syncUrlParams();
            renderChart();
        });
    }
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
    
    const resetZoomBtn = document.getElementById('reset-zoom');
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', () => {
            if (chartInstance) {
                chartInstance.resetZoom();
            }
        });
    }

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            if (metricSelect) metricSelect.value = 'runDiff';
            if (divisionSelect) divisionSelect.value = 'all';
            if (teamSelect) teamSelect.value = 'none';
            localStorage.removeItem(STORAGE_KEY_METRIC);
            localStorage.removeItem(STORAGE_KEY_DIVISION);
            localStorage.removeItem(STORAGE_KEY_TEAM);
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

    const copyAwardsBtn = document.getElementById('copy-awards-btn');
    if (copyAwardsBtn) {
        copyAwardsBtn.addEventListener('click', () => copyAwardsTable(copyAwardsBtn));
    }

    fetchData();
});
