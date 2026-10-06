/**
 * ============================================================
 * Relationship Builder
 * ============================================================
 *
 * Automatically creates relationships between
 * Atlas objects.
 *
 * Relationships may be formed from:
 *
 * • shared topics
 * • shared themes
 * • shared tags
 * • explicit related field
 * • shared series
 *
 */

export default class RelationshipBuilder {

    build(content) {

        const map = new Map();

        for (const item of content) {

            map.set(item.metadata.id, {

                id: item.metadata.id,

                related: new Set()

            });

        }

        for (const item of content) {

            for (const other of content) {

                if (item === other)
                    continue;

                if (this.shareTopic(item, other))
                    map.get(item.metadata.id).related.add(other.metadata.id);

                if (this.shareTheme(item, other))
                    map.get(item.metadata.id).related.add(other.metadata.id);

                if (this.shareSeries(item, other))
                    map.get(item.metadata.id).related.add(other.metadata.id);

            }

            for (const explicit of item.metadata.related) {
                map.get(item.metadata.id).related.add(explicit);
            }
            if (item.metadata.topics) {
                for (const t of item.metadata.topics) {
                    map.get(item.metadata.id).related.add(t);
                }
            }
            if (item.metadata.themes) {
                for (const t of item.metadata.themes) {
                    map.get(item.metadata.id).related.add(t);
                }
            }
            if (item.metadata.series) {
                for (const t of item.metadata.series) {
                    map.get(item.metadata.id).related.add(t);
                }
            }

        }

        return [...map.values()].map(item => ({

            id: item.id,

            related: [...item.related]

        }));

    }

    shareTopic(a, b) {

        return a.metadata.topics.some(topic =>
            b.metadata.topics.includes(topic)
        );

    }

    shareTheme(a, b) {

        return a.metadata.themes.some(theme =>
            b.metadata.themes.includes(theme)
        );

    }

    shareSeries(a, b) {

        return a.metadata.series.some(series =>
            b.metadata.series.includes(series)
        );

    }

}
