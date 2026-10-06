const fs = require('fs');
const path = require('path');

const projectDir = './content/projects';
const statuses = {
    'project-atlas.md': 'active',
    'personal-digital-garden-creator.md': 'completed',
    'keel-systems.md': 'completed',
    'etchcentric-creations.md': 'completed',
    'battery-dispenser.md': 'drawing-board',
    'next-gen-proxmox-home-lab.md': 'drawing-board'
};

fs.readdirSync(projectDir).filter(f => f.endsWith('.md') && f !== 'README.md').forEach(file => {
    let content = fs.readFileSync(path.join(projectDir, file), 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return;

    let frontmatter = match[1];
    if (!frontmatter.includes('status:')) {
        const status = statuses[file] || 'active';
        frontmatter += `\nstatus: ${status}`;
        content = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
        fs.writeFileSync(path.join(projectDir, file), content);
        console.log(`Updated ${file} with status ${status}`);
    } else {
        const status = statuses[file] || 'active';
        frontmatter = frontmatter.replace(/status:.*?\n/, `status: ${status}\n`);
        content = content.replace(/^---\n([\s\S]*?)\n---/, `---\n${frontmatter}\n---`);
        fs.writeFileSync(path.join(projectDir, file), content);
        console.log(`Updated existing status ${file} with status ${status}`);
    }
});
