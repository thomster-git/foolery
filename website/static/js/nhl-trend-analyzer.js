document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    const teamSelect2 = document.getElementById('team-select-2');
    
    let chartInstance = null;
    let allTeamsData = []; 

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
        { id: 129764, name: "Utah Mammoth", abbrev: "UTAH", division: "C", conf: "W", color: "#542E91" },
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

    async function fetchRealData() {
        try {
            const fetchPromises = nhlTeams.map(async t => {
                const url = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${t.id}/schedule`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch ${t.id}`);
                const data = await res.json();
                
                let cumGF = 0, cumGA = 0;
                let cumPoints = 0;
                let currentStreak = 0;
                
                const goalDiffData = [{x:0, y:0}];
                const winPctData = [{x:0, y:0}];
                const streakData = [{x:0, y:0}];

                let gamesPlayed = 0;

                // Filter for regular season (gameType: 2) and completed
                const regularSeasonGames = data.events.filter(e => {
                    return e.seasonType.id === "2" && e.competitions[0].status.type.completed;
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
                        
                        cumGF += gf;
                        cumGA += ga;

                        if (gf > ga) {
                            cumPoints += 2;
                            currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
                        } else if (game.competitions[0].status.period > 3) {
                            cumPoints += 1;
                            currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                        } else {
                            currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
                        }

                        goalDiffData.push({x: gamesPlayed, y: cumGF - cumGA});
                        winPctData.push({x: gamesPlayed, y: (cumPoints / (gamesPlayed * 2)) * 100});
                        streakData.push({x: gamesPlayed, y: currentStreak});
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
                    streak: streakData
                };
            });

            const results = await Promise.allSettled(fetchPromises);
            allTeamsData = results.filter(r => r.status === 'fulfilled').map(r => r.value);

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

            loading.style.display = 'none';
            renderChart();
        } catch (error) {
            console.error("Error fetching NHL data:", error);
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }

    function renderChart() {
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
                
                let plotData = team[metricVal];

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
                            label: function(context) { return context.dataset.label + ': ' + context.parsed.y.toFixed(1); }
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
                        grid: { color: '#333' }
                    }
                }
            }
        });
    }

    metricSelect.addEventListener('change', renderChart);
    divisionSelect.addEventListener('change', renderChart);
    teamSelect.addEventListener('change', renderChart);
    teamSelect2.addEventListener('change', renderChart);
    
    document.getElementById('reset-zoom').addEventListener('click', () => {
        if (chartInstance) chartInstance.resetZoom();
    });

    fetchRealData();
});
