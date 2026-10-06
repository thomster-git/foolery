/**
 * ============================================================
 * Resolver
 * ============================================================
 *
 * Converts string references into actual Atlas object references.
 *
 * Example:
 *
 * related:
 *   - project-atlas
 *
 * becomes
 *
 * object.links.related = [
 *      {...Project Atlas Object...}
 * ]
 *
 * Every builder after this should work from resolved objects.
 */

export default class Resolver {

    build(content) {

        const lookup = new Map();

        //--------------------------------------------------
        // Build lookup table
        //--------------------------------------------------

        content.forEach(object => {

            const id = object.metadata.id;

            if (id) {

                lookup.set(id, object);

            }

        });

        //--------------------------------------------------
        // Resolve references
        //--------------------------------------------------

        content.forEach(object => {

            object.links = {};

            const relationshipFields = [

                "topics",
                "themes",
                "related",
                "projects",
                "articles",
                "series",
                "collections",
                "recommended_for",
                "alternatives"

            ];

            relationshipFields.forEach(field => {

                const values =
                    object.metadata[field] || [];

                object.links[field] = values
                    .map(id => {
                        const link = lookup.get(id);
                        if (!link) {
                            console.warn(`\x1b[33m[WARNING] Missing Link:\x1b[0m '${object.metadata.id}' references non-existent ID '${id}' in field '${field}'`);
                        }
                        return link;
                    })
                    .filter(Boolean);

            });

        });

        return content;

    }

    resolve(content) {

        return this.build(content);

    }

}
