with open('website/static/js/baseball-trend-analyzer.js', 'r') as f:
    js_content = f.read()

js_content = js_content.replace('d.streakData.forEach', 'd.streak.forEach')

with open('website/static/js/baseball-trend-analyzer.js', 'w') as f:
    f.write(js_content)
