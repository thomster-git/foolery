document.addEventListener('DOMContentLoaded', async () => {
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');
    const metricSelect = document.getElementById('metric-select');
    const divisionSelect = document.getElementById('division-select');
    const teamSelect = document.getElementById('team-select');
    const teamSelect2 = document.getElementById('team-select-2');
    
    let chartInstance = null;
    let allTeamsData = []; 

    const nflTeams = [
        { id: 2, name: "Buffalo Bills", division: "AFCE", conf: "AFC", color: "#00338D" },
        { id: 15, name: "Miami Dolphins", division: "AFCE", conf: "AFC", color: "#008E97" },
        { id: 17, name: "New England Patriots", division: "AFCE", conf: "AFC", color: "#002244" },
        { id: 20, name: "New York Jets", division: "AFCE", conf: "AFC", color: "#125740" },
        { id: 33, name: "Baltimore Ravens", division: "AFCN", conf: "AFC", color: "#241773" },
        { id: 4, name: "Cincinnati Bengals", division: "AFCN", conf: "AFC", color: "#FB4F14" },
        { id: 5, name: "Cleveland Browns", division: "AFCN", conf: "AFC", color: "#311D00" },
        { id: 23, name: "Pittsburgh Steelers", division: "AFCN", conf: "AFC", color: "#FFB612" },
        { id: 34, name: "Houston Texans", division: "AFCS", conf: "AFC", color: "#03202F" },
        { id: 11, name: "Indianapolis Colts", division: "AFCS", conf: "AFC", color: "#002C5F" },
        { id: 30, name: "Jacksonville Jaguars", division: "AFCS", conf: "AFC", color: "#006778" },
        { id: 10, name: "Tennessee Titans", division: "AFCS", conf: "AFC", color: "#0C2340" },
        { id: 7, name: "Denver Broncos", division: "AFCW", conf: "AFC", color: "#FB4F14" },
        { id: 12, name: "Kansas City Chiefs", division: "AFCW", conf: "AFC", color: "#E31837" },
        { id: 13, name: "Las Vegas Raiders", division: "AFCW", conf: "AFC", color: "#000000" },
        { id: 24, name: "Los Angeles Chargers", division: "AFCW", conf: "AFC", color: "#0080C6" },

        { id: 6, name: "Dallas Cowboys", division: "NFCE", conf: "NFC", color: "#003594" },
        { id: 19, name: "New York Giants", division: "NFCE", conf: "NFC", color: "#0B2265" },
        { id: 21, name: "Philadelphia Eagles", division: "NFCE", conf: "NFC", color: "#004C54" },
        { id: 28, name: "Washington Commanders", division: "NFCE", conf: "NFC", color: "#5A1414" },
        { id: 3, name: "Chicago Bears", division: "NFCN", conf: "NFC", color: "#C83803" },
        { id: 8, name: "Detroit Lions", division: "NFCN", conf: "NFC", color: "#0076B6" },
        { id: 9, name: "Green Bay Packers", division: "NFCN", conf: "NFC", color: "#203731" },
        { id: 14, name: "Minnesota Vikings", division: "NFCN", conf: "NFC", color: "#4F2683" },
        { id: 1, name: "Atlanta Falcons", division: "NFCS", conf: "NFC", color: "#A71930" },
        { id: 29, name: "Carolina Panthers", division: "NFCS", conf: "NFC", color: "#0085CA" },
        { id: 18, name: "New Orleans Saints", division: "NFCS", conf: "NFC", color: "#D3BC8D" },
        { id: 27, name: "Tampa Bay Buccaneers", division: "NFCS", conf: "NFC", color: "#D50A0A" },
        { id: 22, name: "Arizona Cardinals", division: "NFCW", conf: "NFC", color: "#97233F" },
        { id: 14, name: "Los Angeles Rams", division: "NFCW", conf: "NFC", color: "#003594" },
        { id: 25, name: "San Francisco 49ers", division: "NFCW", conf: "NFC", color: "#AA0000" },
        { id: 26, name: "Seattle Seahawks", division: "NFCW", conf: "NFC", color: "#002244" }
    ];

    async function fetchRealData() {
        try {
            const fetchPromises = nflTeams.map(async t => {
                const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${t.id}/schedule`;
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch ${t.id}`);
                const data = await res.json();
                
                let cumPF = 0, cumPA = 0;
                let wins = 0;
                
                const pointDiffData = [{x:0, y:0}];
                const pointsScoredData = [{x:0, y:0}];
                const pointsAllowedData = [{x:0, y:0}];
                const winPctData = [{x:0, y:0}];

                let gamesPlayed = 0;

                // Filter for regular season events (seasonType.id == 2) that are completed (status.type.completed)
                const regularSeasonGames = data.events.filter(e => {
                    return e.seasonType.id === "2" && e.competitions[0].status.type.completed;
                });

                // Sort by date just in case
                regularSeasonGames.sort((a, b) => new Date(a.date) - new Date(b.date));

                for (let i = 0; i < regularSeasonGames.length; i++) {
                    const game = regularSeasonGames[i];
                    gamesPlayed++;
                    
                    const competitors = game.competitions[0].competitors;
                    const teamData = competitors.find(c => c.id == t.id);
                    const oppData = competitors.find(c => c.id != t.id);
                    
                    if (teamData && oppData && teamData.score) {
                        let pf = parseInt(teamData.score.value) || 0;
                        let pa = parseInt(oppData.score.value) || 0;
                        
                        cumPF += pf;
                        cumPA += pa;

                        if (pf > pa) wins++;
                        else if (pf === pa) wins += 0.5; // Tie

                        pointDiffData.push({x: gamesPlayed, y: cumPF - cumPA});
                        pointsScoredData.push({x: gamesPlayed, y: cumPF / gamesPlayed});
                        pointsAllowedData.push({x: gamesPlayed, y: cumPA / gamesPlayed});
                        winPctData.push({x: gamesPlayed, y: (wins / gamesPlayed) * 100});
                    }
                }

                return {
                    id: t.id,
                    name: t.name,
                    divisionId: t.division,
                    leagueId: t.conf,
                    color: t.color,
                    pointDiff: pointDiffData,
                    pointsScored: pointsScoredData,
                    pointsAllowed: pointsAllowedData,
                    winPct: winPctData
                };
            });

            allTeamsData = await Promise.all(fetchPromises);

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
            console.error("Error fetching NFL data:", error);
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
            else if (filterVal === 'AFC' && team.leagueId === 'AFC') include = true;
            else if (filterVal === 'NFC' && team.leagueId === 'NFC') include = true;
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
                            title: function(context) { return 'Week ' + context[0].parsed.x; },
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
