export default class ContentIndex {

    constructor(content) {

        this.byId = new Map();

        this.byType = new Map();

        this.content = content;

        this.build();

    }

    build() {

        for (const object of this.content) {

            this.byId.set(
                object.metadata.id,
                object
            );

            if (!this.byType.has(object.metadata.type))
                this.byType.set(object.metadata.type, []);

            this.byType
                .get(object.metadata.type)
                .push(object);

        }

    }

    get(id) {

        return this.byId.get(id);

    }

    getType(type) {

        return this.byType.get(type) ?? [];

    }

}
