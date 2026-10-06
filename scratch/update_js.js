const fs = require('fs');
const path = '/home/keel/Project-Atlas-main/website/static/tools/skill-building/assets/index-DIy1o7tU.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/1-Year Skill-Building Master Plan/g, 'Sept 14 - Dec 31 Master Plan');
content = content.replace(/1-Year Master Plan \(Aug 2026 - Jul 2027\)/g, 'Master Plan (Sept 14 - Dec 31)');
content = content.replace(/1-Year Master Plan \(Aug 2026/g, 'Master Plan (Sept 14');
content = content.replace(/1-Year Quarterly Roadmap \(Aug 2026 - /g, 'Phase Roadmap (Sept 14 - ');
content = content.replace(/1-Year Quarterly Roadmap \(Aug 2026/g, 'Phase Roadmap (Sept 14');
content = content.replace(/Starting Baseline & 1-Year Target Dashboard \(Aug 2026/g, 'Starting Baseline & Target Dashboard (Sept 14');

fs.writeFileSync(path, content, 'utf8');
console.log("Updated JS successfully.");
