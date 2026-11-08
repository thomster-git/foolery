const fs = require('fs');
const path = require('path');

const articlesDir = './content/articles';
const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.md'));

let articles = [];

// Read all articles
files.forEach(file => {
    let content = fs.readFileSync(path.join(articlesDir, file), 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

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

    const idMatch = frontmatter.match(/id:\s*([^\n]+)/);
    if (!idMatch) return;
    const id = idMatch[1].trim();

    articles.push({
        file,
        id,
        content,
        frontmatter,
        tags: parseList(/tags:\n([\s\S]*?)(?=\n\w+:|$)/),
        themes: parseList(/themes:\n([\s\S]*?)(?=\n\w+:|$)/)
    });
});

// Calculate similarities and inject connections
articles.forEach(article => {
    let scores = [];

    articles.forEach(other => {
        if (article.id === other.id) return;

        let score = 0;
        const sharedTags = article.tags.filter(t => other.tags.includes(t)).length;
        const sharedThemes = article.themes.filter(t => other.themes.includes(t)).length;

        score += sharedTags * 2; // Tags are more specific
        score += sharedThemes * 1; // Themes are broader

        if (score > 0) {
            scores.push({ id: other.id, score });
        }
    });

    // Sort by score and take top 3
    scores.sort((a, b) => b.score - a.score);
    const topConnections = scores.slice(0, 3).map(s => s.id);

    if (topConnections.length > 0) {
        let frontmatter = article.frontmatter;

        const formatYamlList = (key, list) => {
            if (list.length === 0) return `${key}: []`;
            return `${key}:\n` + list.map(item => `  - ${item}`).join('\n');
        };

        if (frontmatter.match(/connections:\n[\s\S]*?(?=\n\w+:$|$)/m)) {
            frontmatter = frontmatter.replace(/connections:\n[\s\S]*?(?=\n\w+:$|$)/m, formatYamlList('connections', topConnections) + '\n');
        } else if (frontmatter.match(/connections:.*\n/)) {
            frontmatter = frontmatter.replace(/connections:.*\n/, formatYamlList('connections', topConnections) + '\n');
        } else {
            frontmatter += `\n${formatYamlList('connections', topConnections)}`;
        }

        const newContent = article.content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
        fs.writeFileSync(path.join(articlesDir, article.file), newContent);
    }
});

console.log('Connections built and injected.');
