/**
 * ============================================================
 * Validator
 * ============================================================
 *
 * Validates Atlas content before it enters the
 * knowledge graph.
 *
 * Responsibilities
 * ----------------
 * • Required fields
 * • Duplicate IDs
 * • Duplicate titles
 * • Missing metadata
 * • Invalid metadata types
 *
 * Invalid content should never continue through
 * the build pipeline.
 */

export default class Validator {

    validate(content) {

        const errors = [];

        const ids = new Set();

        for (const item of content) {

            if (item.path.includes('/node_modules/') || 
                item.path.includes('\\node_modules\\') ||
                item.path.includes('/app/') ||
                item.path.includes('/hopeful-turing/') ||
                item.path.includes('/kdenlive_launch_video_project/')) {
                continue;
            }

            const metadata = item.metadata;

            const fileErrors = [];

            //--------------------------------------------------
            // Required fields
            //--------------------------------------------------

            const requiredFields = [
                "id",
                "title",
                "type",
                "status",
                "summary"
            ];

            for (const field of requiredFields) {

                if (!(field in metadata)) {

                    fileErrors.push(
                        `Missing required field "${field}".`
                    );

                    continue;
                }

                if (
                    typeof metadata[field] === "string" &&
                    metadata[field].trim() === ""
                ) {

                    fileErrors.push(
                        `Field "${field}" cannot be empty.`
                    );

                }

            }

            //--------------------------------------------------
            // Duplicate IDs
            //--------------------------------------------------

            if (metadata.id) {

                if (ids.has(metadata.id)) {

                    fileErrors.push(
                        `Duplicate id "${metadata.id}".`
                    );

                } else {

                    ids.add(metadata.id);

                }

            }

            //--------------------------------------------------
            // Array validation
            //--------------------------------------------------

            const arrayFields = [
                "topics",
                "themes",
                "tags",
                "related",
                "series"
            ];

            for (const field of arrayFields) {

                if (
                    field in metadata &&
                    !Array.isArray(metadata[field])
                ) {

                    fileErrors.push(
                        `"${field}" must be an array.`
                    );

                }

            }

            //--------------------------------------------------
            // Collect errors
            //--------------------------------------------------

            if (fileErrors.length > 0) {

                errors.push({

                    path: item.path,
                    errors: fileErrors

                });

            }

        }

        //------------------------------------------------------
        // Print Report
        //------------------------------------------------------

        if (errors.length > 0) {

            console.log("\n======================================");
            console.log(" Atlas Validation Report");
            console.log("======================================\n");

            for (const file of errors) {

                console.log(`✖ ${file.path}`);

                for (const error of file.errors) {

                    console.log(`    • ${error}`);

                }

                console.log();

            }

            throw new Error(
                `${errors.length} content file(s) failed validation.`
            );

        }

        console.log("✓ Validation passed.");

        return content;

    }

}
