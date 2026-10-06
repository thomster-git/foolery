const fs = require('fs');
const execSync = require('child_process').execSync;

const graph = JSON.parse(fs.readFileSync('website/dist/graph.json', 'utf8'));

// Build a path lookup using find
const paths = execSync('find content -name "*.md"').toString().trim().split('\n');
const pathMap = {};
paths.forEach(p => {
    const filename = p.split('/').pop().replace('.md', '');
    pathMap[filename] = p;
});

const themes = graph.nodes.filter(n => n.type === 'theme').map(n => n.id);
const topics = graph.nodes.filter(n => n.type === 'topic').map(n => n.id);
const allIds = graph.nodes.filter(n => n.type !== 'tag').map(n => n.id);

fs.writeFileSync('taxonomy.json', JSON.stringify({ themes, topics, allIds }, null, 2));

const contentNodes = graph.nodes.filter(n => n.type !== 'tag' && n.type !== 'theme' && n.type !== 'topic' && n.type !== 'library-category' && n.type !== 'collection');

const BATCH_SIZE = 40;
let batchIndex = 1;
for (let i = 0; i < contentNodes.length; i += BATCH_SIZE) {
    const chunk = contentNodes.slice(i, i + BATCH_SIZE).map(n => {
        const filePath = pathMap[n.id] || `content/${n.id}.md`;
        
        const edges = graph.edges.filter(e => e.source === n.id);
        const currentThemes = edges.filter(e => e.relation === 'themes').map(e => e.target);
        const currentTopics = edges.filter(e => e.relation === 'topics').map(e => e.target);
        const currentRelated = edges.filter(e => e.relation === 'related').map(e => e.target);
        
        return {
            id: n.id,
            path: filePath,
            title: n.label,
            summary: n.summary,
            type: n.type,
            currentThemes,
            currentTopics,
            currentTags: n.tags || [],
            currentRelated,
            missing: ["themes", "topics", "tags", "related"]
        };
    });
    
    fs.writeFileSync(`batch${batchIndex}.json`, JSON.stringify(chunk, null, 2));
    batchIndex++;
}

console.log(`Generated taxonomy.json and ${batchIndex - 1} batches for ${contentNodes.length} items.`);
