const fs = require('fs');
const path = require('path');

const contentDir = './content';

function processDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.md')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We only process if there's frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

    let frontmatter = match[1];

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

    let tags = parseList(/tags:\n([\s\S]*?)(?=\n\w+:|$)/);
    let themes = parseList(/themes:\n([\s\S]*?)(?=\n\w+:|$)/);
    
    let originalTags = [...tags];
    let originalThemes = [...themes];

    // Tag migrations to themes
    const tagsToThemes = ['parenting', 'systems-thinking', 'childhood', 'mental-health', 'creativity', 'philosophy', 'bottom-up-thinking', 'bottom-up-systems-thinking'];
    
    for (const t of tagsToThemes) {
        if (tags.includes(t)) {
            tags = tags.filter(tag => tag !== t);
            if (!themes.includes(t === 'bottom-up-systems-thinking' ? 'bottom-up-thinking' : t)) {
                themes.push(t === 'bottom-up-systems-thinking' ? 'bottom-up-thinking' : t);
            }
        }
    }

    // Tag consolidations
    const consolidations = {
        'neurodivergence': 'neurodiversity',
        'burnout': 'autistic-burnout',
        'live-music': 'music',
        'concerts': 'music'
    };

    tags = tags.map(t => consolidations[t] || t);
    
    // Deduplicate
    tags = [...new Set(tags)];
    themes = [...new Set(themes)];

    if (JSON.stringify(tags) !== JSON.stringify(originalTags) || JSON.stringify(themes) !== JSON.stringify(originalThemes)) {
        
        // Build new yaml sections
        const formatYamlList = (key, list) => {
            if (list.length === 0) return `${key}: []`;
            return `${key}:\n` + list.map(item => `  - ${item}`).join('\n');
        };

        // Replace tags
        if (frontmatter.match(/tags:\n[\s\S]*?(?=\n\w+:$|$)/m)) {
            frontmatter = frontmatter.replace(/tags:\n[\s\S]*?(?=\n\w+:$|$)/m, formatYamlList('tags', tags) + '\n');
        } else if (frontmatter.match(/tags:.*\n/)) {
            frontmatter = frontmatter.replace(/tags:.*\n/, formatYamlList('tags', tags) + '\n');
        }

        // Replace themes
        if (frontmatter.match(/themes:\n[\s\S]*?(?=\n\w+:$|$)/m)) {
            frontmatter = frontmatter.replace(/themes:\n[\s\S]*?(?=\n\w+:$|$)/m, formatYamlList('themes', themes) + '\n');
        } else if (frontmatter.match(/themes:.*\n/)) {
            frontmatter = frontmatter.replace(/themes:.*\n/, formatYamlList('themes', themes) + '\n');
        } else {
            // append themes if missing
            frontmatter += `\n${formatYamlList('themes', themes)}`;
        }

        const newContent = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated: ${filePath}`);
    }
}

processDirectory(contentDir);
console.log('Metadata update complete.');
