const fs = require('fs');
let content = fs.readFileSync('website/static/js/atlas.js', 'utf8');
content = content.replaceAll('n.radius + 6', 'n.radius + 20');
fs.writeFileSync('website/static/js/atlas.js', content);
