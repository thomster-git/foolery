import re

# 1. Update baseball-trend-analyzer.js
with open('website/static/js/baseball-trend-analyzer.js', 'r') as f:
    js_content = f.read()

awards_js = """
    // Calculate and populate end of season awards
    function populateAwards(dataArray) {
        if (!dataArray || dataArray.length === 0) return;
        
        // Compute final stats
        let stats = [];
        dataArray.forEach(d => {
            if (!d) return;
            const finalWinPct = d.winPctData[d.winPctData.length - 1].y;
            const finalRunDiff = d.runDiffData[d.runDiffData.length - 1].y;
            
            // Calculate max streaks
            let maxWinStreak = 0;
            let maxLossStreak = 0;
            d.streakData.forEach(s => {
                if (s.y > maxWinStreak) maxWinStreak = s.y;
                if (s.y < maxLossStreak) maxLossStreak = s.y;
            });
            
            stats.push({
                teamId: d.teamId,
                name: teamMap[d.teamId].name,
                winPct: finalWinPct,
                runDiff: finalRunDiff,
                maxWinStreak: maxWinStreak,
                maxLossStreak: maxLossStreak
            });
        });
        
        if (stats.length === 0) return;
        
        // Sort by Win Pct
        stats.sort((a, b) => b.winPct - a.winPct);
        
        const top10 = stats.slice(0, 10);
        const bottom10 = [...stats].reverse().slice(0, 10);
        
        // Find extreme streaks and differentials
        const bestStreak = [...stats].sort((a, b) => b.maxWinStreak - a.maxWinStreak)[0];
        const worstStreak = [...stats].sort((a, b) => a.maxLossStreak - b.maxLossStreak)[0];
        const bestDiff = [...stats].sort((a, b) => b.runDiff - a.runDiff)[0];
        const worstDiff = [...stats].sort((a, b) => a.runDiff - b.runDiff)[0];
        
        // Populate UI
        document.getElementById('award-top10').innerHTML = top10.map(t => `<li><strong>${t.name}</strong> (${t.winPct.toFixed(3)})</li>`).join('');
        document.getElementById('award-bottom10').innerHTML = bottom10.map(t => `<li><strong>${t.name}</strong> (${t.winPct.toFixed(3)})</li>`).join('');
        
        document.getElementById('award-winstreak').innerHTML = `${bestStreak.name} (${bestStreak.maxWinStreak} games)`;
        document.getElementById('award-lossstreak').innerHTML = `${worstStreak.name} (${Math.abs(worstStreak.maxLossStreak)} games)`;
        document.getElementById('award-bestdiff').innerHTML = `${bestDiff.name} (${bestDiff.runDiff > 0 ? '+' : ''}${bestDiff.runDiff})`;
        document.getElementById('award-worstdiff').innerHTML = `${worstDiff.name} (${worstDiff.runDiff})`;
        
        // Show container
        document.getElementById('awards-container').style.display = 'block';
    }
    
    // We hook into where allTeamsData is populated. It's done during init.
    // wait a short tick then populate.
    setTimeout(() => {
        populateAwards(allTeamsData);
    }, 1500);
"""

if "// Calculate and populate end of season awards" not in js_content:
    js_content = js_content.replace('function updateChart() {', awards_js + '\n    function updateChart() {')
    with open('website/static/js/baseball-trend-analyzer.js', 'w') as f:
        f.write(js_content)

# 2. Update tools.html to include baseball tools
with open('website/templates/layouts/tools.html', 'r') as f:
    tools_content = f.read()

bb_cards = """
            <a href="/tools/postseason-baseball-analyzer.html" class="tool-card">
                <div class="tool-card-inner" style="position: relative; overflow: hidden;">
                    <div class="tool-badge">NEW</div>
                    <div class="tool-icon">⚾🏆</div>
                    <h2 class="tool-title">MLB Postseason Analyzer</h2>
                    <p class="tool-desc">Analyze MLB team momentum and metrics during the 2026 Playoffs.</p>
                </div>
            </a>

            <a href="/tools/baseball-trend-analyzer.html" class="tool-card">
                <div class="tool-card-inner" style="position: relative; overflow: hidden;">
                    <div class="tool-badge">NEW</div>
                    <div class="tool-icon">⚾📉</div>
                    <h2 class="tool-title">MLB Regular Season Analyzer</h2>
                    <p class="tool-desc">Full 2026 MLB season momentum tracking, including end of season awards.</p>
                </div>
            </a>
"""

if "postseason-baseball-analyzer.html" not in tools_content:
    tools_content = tools_content.replace('        </div>\n\n    </div>', bb_cards + '\n        </div>\n\n    </div>')
    with open('website/templates/layouts/tools.html', 'w') as f:
        f.write(tools_content)

