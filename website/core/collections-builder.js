/**
 * ============================================================
 * Collections Builder
 * ============================================================
 *
 * Automatically groups Atlas objects by metadata.
 *
 */

export default class CollectionsBuilder {

    build(content) {

        const collections = {

            topics: {},

            themes: {},

            types: {}

        };

        for (const item of content) {

            for (const topic of item.metadata.topics) {

                collections.topics[topic] ??= [];

                collections.topics[topic].push(item.metadata.id);

            }

            for (const theme of item.metadata.themes) {

                collections.themes[theme] ??= [];

                collections.themes[theme].push(item.metadata.id);

            }

            const type = item.metadata.type;

            collections.types[type] ??= [];

            collections.types[type].push(item.metadata.id);

        }

        return collections;

    }

}
