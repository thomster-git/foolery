/**
 * ============================================================
 * Search Builder
 * ============================================================
 *
 * Generates a lightweight search index for Atlas.
 *
 * The search index is intentionally small and contains
 * only the information required for searching.
 *
 * Future versions may include:
 *
 * • stemming
 * • weighting
 * • fuzzy search
 * • tf-idf
 * • full text ranking
 *
 */

export default class SearchBuilder {

    build(content) {

        return content.map(item => ({

            id: item.metadata.id,

            title: item.metadata.title,

            summary: item.metadata.summary,

            type: item.metadata.type,

            url: item.url,

            topics: item.metadata.topics,

            themes: item.metadata.themes,

            tags: item.metadata.tags,

            path: item.path,

            body: item.body

        }));

    }

}
