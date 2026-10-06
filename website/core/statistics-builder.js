/**
 * ============================================================
 * Statistics Builder
 * ============================================================
 *
 * Generates statistics about Atlas.
 */

export default class StatisticsBuilder {

    build(content) {

        const stats = {

            total: content.length,

            types: {},

            status: {},

            topics: {},

            themes: {}

        };

        for (const object of content) {

            this.increment(
                stats.types,
                object.metadata.type
            );

            this.increment(
                stats.status,
                object.metadata.status
            );

            for (const topic of object.metadata.topics)
                this.increment(stats.topics, topic);

            for (const theme of object.metadata.themes)
                this.increment(stats.themes, theme);

        }

        return stats;

    }

    increment(dictionary, key) {

        dictionary[key] ??= 0;

        dictionary[key]++;

    }

}
