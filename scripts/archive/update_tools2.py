import re

# 1. Update baseball-trend-analyzer.html
with open('website/templates/layouts/baseball-trend-analyzer.html', 'r') as f:
    bb_content = f.read()

# Breadcrumbs
bb_content = bb_content.replace('<a href="/tools/">Developer Tools</a>', '<a href="/tools/">Interactive Tools</a>')

# The Atlas Connection
atlas_blurb = """        <div style="background: rgba(168, 85, 247, 0.05); border-left: 4px solid var(--accent-purple); padding: 1.5rem; margin-bottom: 2.5rem; text-align: left; font-size: 0.95rem; line-height: 1.6; border-radius: 0 var(--radius-md) var(--radius-md) 0;">
            <strong style="color: var(--accent-purple); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px; display: block; margin-bottom: 0.5rem;">The Atlas Connection</strong>
            At first glance, baseball stats might seem out of place in a digital garden. But sports seasons are ultimately sprawling datasets of <strong>variance, momentum, and statistical pattern recognition</strong>. By graphing trailing indicators, we can identify when a team's actual performance diverges from their raw win percentage—detecting systemic signal through the noise.
        </div>"""
bb_content = bb_content.replace('<h1 style="font-size: 3rem; margin-bottom: 2rem;">Baseball Trend Analyzer</h1>', '<h1 style="font-size: 3rem; margin-bottom: 2rem;">Baseball Trend Analyzer</h1>\n' + atlas_blurb)

# Share Button
share_btn = '<button class="share-btn" data-title="Baseball Trend Analyzer" data-text="Check out this interactive Baseball Trend Analyzer at Thoms Foolery. ⚾📈" data-url="https://thomsfoolery.com/tools/baseball-trend-analyzer.html" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem; font-family: monospace; background: rgba(168, 85, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple); border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'var(--accent-purple)\'; this.style.color=\'white\';" onmouseout="this.style.background=\'rgba(168, 85, 247, 0.1)\'; this.style.color=\'var(--accent-purple)\';"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Tool</button>'
bb_content = bb_content.replace('<p style="color: var(--text-muted); margin-bottom: 2rem;">Analyze MLB team momentum via cumulative run differential. Select a team to highlight their specific trendline over the 2026 season.</p>', '<p style="color: var(--text-muted); margin-bottom: 1rem;">Analyze MLB team momentum via cumulative run differential. Select a team to highlight their specific trendline over the 2026 season.</p>\n<div style="margin-bottom: 2rem;">' + share_btn + '</div>')

# End of Season Awards container
awards_html = """
        <div id="awards-container" style="background: var(--bg-card); padding: 2rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color); margin-bottom: 3rem; text-align: left; display: none;">
            <h2 style="font-size: 1.8rem; margin-bottom: 1.5rem; color: var(--accent-cyan);">2026 Season Awards & Standings</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <h3 style="color: var(--text-main); font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">Top 10 Teams (Win %)</h3>
                    <ol id="award-top10" style="padding-left: 1.2rem; color: var(--text-dim); line-height: 1.6;"></ol>
                </div>
                <div>
                    <h3 style="color: var(--text-main); font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">Bottom 10 Teams (Win %)</h3>
                    <ol id="award-bottom10" style="padding-left: 1.2rem; color: var(--text-dim); line-height: 1.6;"></ol>
                </div>
                <div>
                    <h3 style="color: var(--text-main); font-size: 1.2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem;">Notable Streaks</h3>
                    <ul style="padding-left: 1.2rem; color: var(--text-dim); line-height: 1.6;">
                        <li><strong>Longest Win Streak:</strong> <span id="award-winstreak"></span></li>
                        <li><strong>Longest Losing Streak:</strong> <span id="award-lossstreak"></span></li>
                        <li><strong>Best Run Differential:</strong> <span id="award-bestdiff"></span></li>
                        <li><strong>Worst Run Differential:</strong> <span id="award-worstdiff"></span></li>
                    </ul>
                </div>
            </div>
        </div>
"""
bb_content = bb_content.replace('<div id="chart-container"', awards_html + '\n            <div id="chart-container"')

with open('website/templates/layouts/baseball-trend-analyzer.html', 'w') as f:
    f.write(bb_content)

# 2. Update postseason-baseball-analyzer.html
with open('website/templates/layouts/postseason-baseball-analyzer.html', 'r') as f:
    ps_content = f.read()

ps_content = ps_content.replace('<a href="/tools/">Developer Tools</a>', '<a href="/tools/">Interactive Tools</a>')
ps_content = ps_content.replace('<h1 style="font-size: 3rem; margin-bottom: 2rem;">MLB Postseason Analyzer</h1>', '<h1 style="font-size: 3rem; margin-bottom: 2rem;">MLB Postseason Analyzer</h1>\n' + atlas_blurb.replace('baseball stats', 'postseason baseball stats'))
share_btn_ps = share_btn.replace('Baseball Trend Analyzer', 'MLB Postseason Analyzer').replace('baseball-trend-analyzer.html', 'postseason-baseball-analyzer.html')
ps_content = ps_content.replace('<p style="color: var(--text-muted); margin-bottom: 2rem;">Analyze MLB team momentum during the 2026 Postseason. Select a team to highlight their specific trendline over the playoffs.</p>', '<p style="color: var(--text-muted); margin-bottom: 1rem;">Analyze MLB team momentum during the 2026 Postseason. Select a team to highlight their specific trendline over the playoffs.</p>\n<div style="margin-bottom: 2rem;">' + share_btn_ps + '</div>')
with open('website/templates/layouts/postseason-baseball-analyzer.html', 'w') as f:
    f.write(ps_content)

# 3. Update nhl-trend-analyzer.html
with open('website/templates/layouts/nhl-trend-analyzer.html', 'r') as f:
    nhl_content = f.read()
share_btn_nhl = share_btn.replace('Baseball Trend Analyzer', 'NHL Trend Analyzer').replace('baseball-trend-analyzer.html', 'nhl-trend-analyzer.html').replace('⚾', '🏒')
old_nhl_share = '<a href="https://twitter.com/intent/tweet?text=Check%20out%20this%20interactive%20NHL%20Trend%20Analyzer%20at%20Thoms%20Foolery.%20%F0%9F%8F%92%F0%9F%93%88&url=https://thomsfoolery.com/tools/nhl-trend-analyzer.html" target="_blank" rel="noopener noreferrer" class="btn" style="display: inline-block; padding: 0.4rem 0.8rem; font-size: 0.85rem; text-decoration: none;">[ Share This Tool ]</a>'
nhl_content = nhl_content.replace(old_nhl_share, share_btn_nhl)
with open('website/templates/layouts/nhl-trend-analyzer.html', 'w') as f:
    f.write(nhl_content)

