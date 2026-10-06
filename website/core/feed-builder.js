export default class FeedBuilder {

    build(content) {

        const feed = [];

        for (const object of content) {

            feed.push({

                id: object.metadata.id,

                title: object.metadata.title,

                type: object.metadata.type,

                status: object.metadata.status,

                created: object.metadata.created,

                updated: object.metadata.updated,

                url: object.url

            });

        }

        feed.sort((a, b) => {

            const dateA =
                new Date(a.updated || a.created || 0);

            const dateB =
                new Date(b.updated || b.created || 0);

            return dateB - dateA;

        });

        return feed;

    }

}
