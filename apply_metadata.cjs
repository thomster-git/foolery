const fs = require('fs');
const path = require('path');

function applyMetadata(outputFile) {
    if (!fs.existsSync(outputFile)) return;
    
    console.log(`Processing ${outputFile}...`);
    const data = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    
    for (const item of data) {
        if (!fs.existsSync(item.path)) {
            console.error(`File not found: ${item.path}`);
            continue;
        }
        
        let content = fs.readFileSync(item.path, 'utf8');
        
        // Find frontmatter
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        if (!match) {
            console.error(`No frontmatter found in ${item.path}`);
            continue;
        }
        
        let fm = match[1];
        
        // Helper to replace or add a yaml array
        function updateArrayField(field, array) {
            if (!array || array.length === 0) return;
            
            const yamlStr = `${field}:\n` + array.map(v => `  - ${v}`).join('\n');
            const regex = new RegExp(`^${field}:\\s*\\n(?:\\s+-.*\\n)*`, 'm');
            
            if (regex.test(fm)) {
                fm = fm.replace(regex, yamlStr + '\n');
            } else {
                fm += `\n${yamlStr}`;
            }
        }
        
        updateArrayField('topics', item.topics);
        updateArrayField('themes', item.themes);
        updateArrayField('tags', item.tags);
        updateArrayField('related', item.related);
        
        // Clean up multiple newlines that might have been introduced
        fm = fm.replace(/\n{3,}/g, '\n\n');
        
        const newContent = content.replace(/^---\n[\s\S]*?\n---/, `---\n${fm}\n---`);
        
        if (content !== newContent) {
            fs.writeFileSync(item.path, newContent);
            console.log(`Updated ${item.id}`);
        }
    }
}

['output1.json', 'output2.json', 'output3.json', 'output4.json'].forEach(applyMetadata);
