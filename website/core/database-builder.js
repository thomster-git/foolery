/**
 * ============================================================
 * Database Builder
 * ============================================================
 */

export default class DatabaseBuilder {

    build(content) {

        return {

            generated:
                new Date().toISOString(),

            version: "0.1.0",

            objectCount: content.length,

            objects: content

        };

    }

}
