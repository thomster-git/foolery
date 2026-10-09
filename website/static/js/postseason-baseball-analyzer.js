document.addEventListener('DOMContentLoaded', async () => {
    const bracketContainer = document.getElementById('bracket-container');
    const loading = document.getElementById('chart-loading');
    const errorDiv = document.getElementById('chart-error');

    // Basic team colors for the charts
    const teamColors = {
        108: '#BA0021', 109: '#A71930', 110: '#DF4601', 111: '#BD3039', 112: '#0E3386',
        113: '#C6011F', 114: '#13274F', 115: '#33006F', 116: '#0C2340', 117: '#003278',
        118: '#004687', 119: '#005A9C', 120: '#00A3E0', 121: '#004687', 122: '#13294B',
        133: '#005C5C', 143: '#E31937', 134: '#FDB827', 135: '#2F241D', 136: '#005C5C',
        137: '#FD5A1E', 138: '#C41E3A', 139: '#092C5C', 140: '#003278', 141: '#134A8E',
        142: '#000000', 144: '#13294B', 145: '#000000', 146: '#00A3E0', 147: '#003087',
        158: '#C41E3A'
    };

    async function fetchData() {
        try {
            // Get teams
            const teamsResponse = await fetch('https://statsapi.mlb.com/api/v1/teams?sportId=1');
            const teamsData = await teamsResponse.json();
            const teamMap = {};
            teamsData.teams.forEach(t => teamMap[t.id] = t);

            // Try 2026 first, if empty try 2025 (or current year)
            let scheduleResponse = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2026&gameType=P');
            let scheduleData = await scheduleResponse.json();
            if (!scheduleData.dates || scheduleData.dates.length === 0) {
                scheduleResponse = await fetch('https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2025&gameType=P');
                scheduleData = await scheduleResponse.json();
            }

            // Group games by series
            const seriesMap = {};
            
            scheduleData.dates.forEach(dateObj => {
                dateObj.games.forEach(game => {
                    const awayTeam = game.teams.away.team.id;
                    const homeTeam = game.teams.home.team.id;
                    
                    // Create a unique key for the matchup (smaller ID first)
                    const matchKey = [awayTeam, homeTeam].sort((a,b)=>a-b).join('-');
                    
                    if (!seriesMap[matchKey]) {
                        seriesMap[matchKey] = {
                            id: matchKey,
                            name: game.seriesDescription || "Postseason Series",
                            team1: awayTeam,
                            team2: homeTeam,
                            games: [],
                            round: determineRound(game.seriesDescription)
                        };
                    }
                    
                    if (game.status.statusCode === 'F' || game.status.statusCode === 'O') {
                        seriesMap[matchKey].games.push({
                            date: game.officialDate,
                            home: homeTeam,
                            away: awayTeam,
                            homeScore: game.teams.home.score,
                            awayScore: game.teams.away.score
                        });
                    }
                });
            });

            renderBracket(seriesMap, teamMap);
            loading.style.display = 'none';

        } catch (err) {
            console.error(err);
            loading.style.display = 'none';
            if(errorDiv) errorDiv.style.display = 'block';
        }
    }

    function determineRound(desc) {
        if (!desc) return 0;
        desc = desc.toLowerCase();
        if (desc.includes('wild card')) return 1;
        if (desc.includes('division series')) return 2;
        if (desc.includes('championship')) return 3;
        if (desc.includes('world series')) return 4;
        return 0;
    }

    function renderBracket(seriesMap, teamMap) {
        // Group by round
        const rounds = {
            1: [], // WC
            2: [], // LDS
            3: [], // LCS
            4: []  // WS
        };

        Object.values(seriesMap).forEach(s => {
            if (rounds[s.round]) rounds[s.round].push(s);
        });

        // Clear container
        bracketContainer.innerHTML = '';
        
        // Ensure standard Chart.js defaults
        Chart.defaults.color = '#888';
        Chart.defaults.font.family = 'Inter, sans-serif';

        // Render each round column
        Object.keys(rounds).sort().forEach(r => {
            const seriesList = rounds[r];
            if (seriesList.length === 0) return;

            const col = document.createElement('div');
            col.style.display = 'flex';
            col.style.flexDirection = 'column';
            col.style.justifyContent = 'center';
            col.style.gap = '2rem';
            col.style.minWidth = '250px';

            const roundTitles = {1: 'Wild Card', 2: 'Division Series', 3: 'Championship Series', 4: 'World Series'};
            
            const title = document.createElement('h3');
            title.textContent = roundTitles[r] || 'Series';
            title.style.textAlign = 'center';
            title.style.color = 'var(--text-main)';
            title.style.marginBottom = '1rem';
            col.appendChild(title);

            seriesList.forEach(series => {
                let t1Diff = 0;
                const sparkData = [{x:0, y:0}]; 
                
                let t1Wins = 0;
                let t2Wins = 0;
                
                series.games.sort((a,b) => a.date.localeCompare(b.date)).forEach((g, i) => {
                    let t1Score = g.home === series.team1 ? g.homeScore : g.awayScore;
                    let t2Score = g.home === series.team2 ? g.homeScore : g.awayScore;
                    
                    t1Diff += (t1Score - t2Score);
                    sparkData.push({x: i+1, y: t1Diff});
                    
                    if (t1Score > t2Score) t1Wins++;
                    if (t2Score > t1Score) t2Wins++;
                });

                const t1Info = teamMap[series.team1];
                const t2Info = teamMap[series.team2];
                const t1Color = teamColors[series.team1] || '#ccc';
                const t2Color = teamColors[series.team2] || '#ccc';

                const card = document.createElement('div');
                card.style.background = 'var(--bg-main)';
                card.style.border = '1px solid var(--border-color)';
                card.style.borderRadius = 'var(--radius-md)';
                card.style.padding = '1rem';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.gap = '0.5rem';

                card.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width:12px; height:12px; border-radius:50%; background:${t1Color};"></div>
                            <span style="font-weight: bold; color: ${t1Wins >= t2Wins ? 'var(--text-main)' : 'var(--text-dim)'};">${t1Info ? t1Info.teamName || t1Info.name : series.team1}</span>
                        </div>
                        <span style="font-weight: bold; font-size: 1.2rem;">${t1Wins}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width:12px; height:12px; border-radius:50%; background:${t2Color};"></div>
                            <span style="font-weight: bold; color: ${t2Wins >= t1Wins ? 'var(--text-main)' : 'var(--text-dim)'};">${t2Info ? t2Info.teamName || t2Info.name : series.team2}</span>
                        </div>
                        <span style="font-weight: bold; font-size: 1.2rem;">${t2Wins}</span>
                    </div>
                    <div style="margin-top: 1rem; height: 60px; width: 100%; position: relative;">
                        <canvas id="spark-${series.id}"></canvas>
                    </div>
                    <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Series Run Differential</div>
                `;
                
                col.appendChild(card);

                setTimeout(() => {
                    const ctx = document.getElementById(`spark-${series.id}`).getContext('2d');
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            datasets: [{
                                data: sparkData,
                                borderColor: t1Color,
                                backgroundColor: 'rgba(0,0,0,0)',
                                borderWidth: 2,
                                fill: false,
                                pointRadius: 2,
                                tension: 0.1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: { enabled: false }
                            },
                            scales: {
                                x: { display: false },
                                y: { 
                                    display: false,
                                    suggestedMin: -5,
                                    suggestedMax: 5
                                }
                            }
                        }
                    });
                }, 50);

            });

            bracketContainer.appendChild(col);
        });
    }

    fetchData();
});
