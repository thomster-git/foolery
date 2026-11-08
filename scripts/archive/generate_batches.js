const fs = require('fs');
const graph = JSON.parse(fs.readFileSync('website/dist/graph.json'));

const themes = graph.nodes.filter(n => n.type === 'theme').map(n => n.id);
const topics = graph.nodes.filter(n => n.type === 'topic').map(n => n.id);
const allIds = graph.nodes.filter(n => n.type !== 'tag').map(n => n.id);

fs.writeFileSync('taxonomy.json', JSON.stringify({ themes, topics, allIds }, null, 2));

const contentNodes = graph.nodes.filter(n => n.type !== 'tag' && n.type !== 'theme' && n.type !== 'topic');

// Let's filter out 'collection', 'library-category' if they are structural.
// Wait, we just want to review everything. Let's just do all articles, projects, and library items.
const reviewNodes = contentNodes.filter(n => ['article', 'project', 'book', 'company', 'creator', 'game', 'hardware', 'music', 'service', 'software', 'tool', 'website'].includes(n.type));

const BATCH_SIZE = 40;
let batchIndex = 1;
for (let i = 0; i < reviewNodes.length; i += BATCH_SIZE) {
    const chunk = reviewNodes.slice(i, i + BATCH_SIZE).map(n => {
        // Find the actual file path
        let filePath = '';
        if (n.type === 'article') filePath = `content/articles/${n.id}.md`;
        else if (n.type === 'project') filePath = `content/projects/${n.id}.md`;
        else filePath = `content/library/creators/youtube/${n.id}.md`; // Need a better way to find the path
        
        // Let's just use the current tags/themes/topics/related from edges
        const edges = graph.edges.filter(e => e.source === n.id);
        const currentThemes = edges.filter(e => e.relation === 'themes').map(e => e.target);
        const currentTopics = edges.filter(e => e.relation === 'topics').map(e => e.target);
        const currentRelated = edges.filter(e => e.relation === 'related').map(e => e.target);
        
        return {
            id: n.id,
            title: n.label,
            summary: n.summary,
            type: n.type,
            currentThemes,
            currentTopics,
            currentTags: n.tags || [],
            currentRelated,
            missing: ["themes", "topics", "tags", "related"] // Tell agent to review all of them
        };
    });
    
    fs.writeFileSync(`batch${batchIndex}.json`, JSON.stringify(chunk, null, 2));
    batchIndex++;
}

console.log(`Generated taxonomy.json and ${batchIndex - 1} batches for ${reviewNodes.length} items.`);
