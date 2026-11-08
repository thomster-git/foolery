const fs = require('fs');
const path = require('path');

const articlesDir = './website/content/articles';
const files = fs.readdirSync(articlesDir);

const tagCounts = {};
const themeCounts = {};
const connCounts = {};

files.forEach(file => {
  if (file.endsWith('.md')) {
    const content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const match = content.match(/---\n([\s\S]*?)\n---/);
    if (match) {
      const frontmatter = match[1];
      
      const parseList = (regex) => {
        const result = [];
        const m = frontmatter.match(regex);
        if (m) {
          const lines = m[1].split('\n');
          for (const line of lines) {
            const val = line.trim().replace(/^- /, '').trim().replace(/['"]/g, '');
            if (val) result.push(val);
          }
        }
        return result;
      };

      const tags = parseList(/tags:\n([\s\S]*?)(?=\n\w+:|$)/);
      const themes = parseList(/themes:\n([\s\S]*?)(?=\n\w+:|$)/);
      const conns = parseList(/connections:\n([\s\S]*?)(?=\n\w+:|$)/);

      tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
      themes.forEach(t => themeCounts[t] = (themeCounts[t] || 0) + 1);
      conns.forEach(c => connCounts[c] = (connCounts[c] || 0) + 1);
    }
  }
});

console.log('--- THEMES ---');
Object.entries(themeCounts).sort((a,b) => b[1]-a[1]).forEach(e => console.log(`${e[0]}: ${e[1]}`));
console.log('\n--- TAGS ---');
Object.entries(tagCounts).sort((a,b) => b[1]-a[1]).forEach(e => console.log(`${e[0]}: ${e[1]}`));
console.log('\n--- CONNECTIONS (Top 20) ---');
Object.entries(connCounts).sort((a,b) => b[1]-a[1]).slice(0, 20).forEach(e => console.log(`${e[0]}: ${e[1]}`));
