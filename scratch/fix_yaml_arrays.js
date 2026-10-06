import fs from 'fs';
import path from 'path';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.md')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const arrayRegex = /^(tags|topics|themes|related):\s*\[(.*?)\]/gm;
            
            content = content.replace(arrayRegex, (match, key, arrayStr) => {
                modified = true;
                
                // Parse the array contents
                // Handle formats like "a", "b" or a, b
                const items = arrayStr
                    .split(',')
                    .map(s => s.trim().replace(/^["'](.*)["']$/, '$1'))
                    .filter(s => s.length > 0);
                
                if (items.length === 0) return `${key}:`;
                
                let replacement = `${key}:`;
                for (const item of items) {
                    replacement += `\n- ${item}`;
                }
                
                return replacement;
            });
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed tags in ${fullPath}`);
            }
        }
    }
}

processDir('/home/keel/Project-Atlas-main/content');
console.log("Finished parsing.");
