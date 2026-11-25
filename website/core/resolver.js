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

        //--------------------------------------------------
        // Propagate symmetric backlinks for related items
        //--------------------------------------------------

        content.forEach(source => {
            if (source.metadata?.status === "draft") return;
            const relatedTargets = source.links?.related || [];
            relatedTargets.forEach(target => {
                if (!target || target === source || target.metadata?.status === "draft") return;
                if (!target.links) target.links = {};
                if (!Array.isArray(target.links.related)) target.links.related = [];
                const alreadyLinked = target.links.related.some(
                    existing => existing.metadata?.id === source.metadata?.id
                );
                if (!alreadyLinked) {
                    target.links.related.push(source);
                }
            });
        });

        return content;

    }

    resolve(content) {

        return this.build(content);

    }

}
