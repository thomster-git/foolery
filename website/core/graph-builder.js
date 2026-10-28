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

        // Only include non-draft content in the knowledge graph
        const publishedContent = content.filter(obj => obj.metadata?.status !== "draft");
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

            // Synthesize Library Category edges
            const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];
            if (libraryTypes.includes(object.metadata.type)) {
                graph.edges.push({
                    source: `hub-${object.metadata.type}`,
                    target: object.metadata.id,
                    relation: 'category'
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

        // Add Library Category Hub nodes only if they have published items
        const activeLibraryTypes = new Set(
            publishedContent
                .filter(obj => ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"].includes(obj.metadata.type))
                .map(obj => obj.metadata.type)
        );

        const getLibraryPlural = (t) => {
            if (t === "company") return "companies";
            if (["hardware", "software", "music", "documentation"].includes(t)) return t;
            return `${t}s`;
        };

        activeLibraryTypes.forEach(type => {
            const slug = getLibraryPlural(type);
            const label = slug.charAt(0).toUpperCase() + slug.slice(1);
            graph.nodes.push({
                id: `hub-${type}`,
                label: label,
                type: 'library-category',
                url: `/library/${slug}/`,
                summary: `Collection of ${label} in the Library`,
                isLibrary: true
            });
        });

        return graph;

    }

}
