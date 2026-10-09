with open('website/static/js/baseball-trend-analyzer.js', 'r') as f:
    js_content = f.read()

js_content = js_content.replace('d.winPctData[d.winPctData.length - 1].y', 'd.winPct[d.winPct.length - 1].y')
js_content = js_content.replace('d.runDiffData[d.runDiffData.length - 1].y', 'd.runDiff[d.runDiff.length - 1].y')
js_content = js_content.replace('d.teamId', 'd.id')

with open('website/static/js/baseball-trend-analyzer.js', 'w') as f:
    f.write(js_content)
