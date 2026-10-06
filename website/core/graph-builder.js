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

        content.forEach(object => {

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

                        graph.edges.push({

                            source:
                                object.metadata.id,

                            target:
                                target.metadata.id,

                            relation

                        });

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
                const pluralType = object.metadata.type + "s";
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

        // Add Library Category Hub nodes
        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];
        libraryTypes.forEach(type => {
            const plural = type.charAt(0).toUpperCase() + type.slice(1) + "s";
            graph.nodes.push({
                id: `hub-${type}`,
                label: plural,
                type: 'library-category',
                url: `/library/${type}s/`,
                summary: `Collection of ${plural} in the Library`,
                isLibrary: true
            });
        });

        return graph;

    }

}
