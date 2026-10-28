/**
 * ============================================================
 * Graph Builder
 * ============================================================
 *
 * Builds the Atlas knowledge graph.
 *
 * Output:
 * {
 *   nodes: [],
 *   edges: []
 * }
 */

export default class GraphBuilder {

    build(content) {

        const graph = {
            nodes: [],
            edges: []
        };
        
        const tags = new Set();

        // Exclude library items from the knowledge graph for the time being
        const libraryTypes = new Set(["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "tv-show"]);
        const publishedContent = content.filter(obj => obj.metadata?.status !== "draft" && !libraryTypes.has(obj.metadata?.type));
        const publishedIds = new Set(publishedContent.map(obj => obj.metadata.id));

        publishedContent.forEach(object => {

            graph.nodes.push({
                id: object.metadata.id,
                label: object.metadata.title,
                type: object.metadata.type,
                url: object.url,
                summary: object.metadata.summary,
                tags: object.metadata.tags || []
            });

            Object.entries(object.links || {})
                .forEach(([relation, targets]) => {

                    targets.forEach(target => {
                        // Only add edge if target is also published
                        if (target.metadata?.id && publishedIds.has(target.metadata.id)) {
                            graph.edges.push({
                                source: object.metadata.id,
                                target: target.metadata.id,
                                relation
                            });
                        }

                    });

                });
                
            // Synthesize tag edges
            if (object.metadata.tags && Array.isArray(object.metadata.tags)) {
                object.metadata.tags.forEach(tag => {
                    tags.add(tag);
                    graph.edges.push({
                        source: object.metadata.id,
                        target: `tag-${tag}`,
                        relation: 'tags'
                    });
                });
            }

        });
        
        // Add tag nodes
        tags.forEach(tag => {
            graph.nodes.push({
                id: `tag-${tag}`,
                label: `#${tag}`,
                type: 'tag',
                url: `/tags/${tag}.html`,
                summary: `Content tagged with ${tag}`
            });
        });

        return graph;

    }

}
