const fs = require('fs');
const path = require('path');

const dirs = ['./content/articles', './content/projects'];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return;

        let frontmatter = match[1];
        
        const topicsMatch = frontmatter.match(/topics:\n([\s\S]*?)(?=\n\w+:|$)/);
        let topics = [];
        
        if (topicsMatch) {
            topics = topicsMatch[1].split('\n')
                .map(line => line.trim().replace(/^- /, '').trim().replace(/['"]/g, ''))
                .filter(val => val !== '');
        } else {
            // Also check single-line topics array if someone used [topic1]
            const singleLineMatch = frontmatter.match(/topics:\s*\[(.*?)\]/);
            if (singleLineMatch) {
                topics = singleLineMatch[1].split(',').map(t => t.trim().replace(/['"]/g, '')).filter(t => t !== '');
            }
        }

        if (topics.length === 0) {
            console.log(`Missing topic: ${filePath}`);
            // Add a default topic "technology"
            const formatYamlList = (key, list) => {
                return `${key}:\n` + list.map(item => `  - ${item}`).join('\n');
            };
            
            if (frontmatter.match(/topics:\s*\[\]/)) {
                frontmatter = frontmatter.replace(/topics:\s*\[\]/, formatYamlList('topics', ['technology']) + '\n');
            } else if (frontmatter.match(/topics:\n/)) {
                // empty topics list
                frontmatter = frontmatter.replace(/topics:\n/, formatYamlList('topics', ['technology']) + '\n');
            } else {
                frontmatter += `\n${formatYamlList('topics', ['technology'])}`;
            }

            const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
            fs.writeFileSync(filePath, newContent);
            console.log(`-> Fixed: ${filePath}`);
        }
    });
});
console.log('Topic audit complete.');
