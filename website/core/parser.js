/**
 * ============================================================
 * Front Matter Parser
 * ============================================================
 *
 * Converts raw Markdown files into structured Atlas objects.
 *
 * Responsibilities
 * ----------------
 * • Detect front matter
 * • Parse metadata
 * • Extract Markdown body
 *
 * Input
 * -----
 * Array of raw content objects
 *
 * Output
 * ------
 * Array of parsed content objects
 *
 * Validation is NOT performed here.
 */

export default class Parser {

    parse(contentObjects) {

        return contentObjects.map(content => {

            const result = {
                path: content.path,
                metadata: {},
                body: content.raw.trim()
            };

            // Only parse front matter if the file begins with ---
            if (!content.raw.startsWith("---")) {
                return result;
            }

            const frontMatterMatch = content.raw.match(
                /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/m
            );

            if (!frontMatterMatch) {
                return result;
            }

            const frontMatter = frontMatterMatch[1];
            const body = frontMatterMatch[2];

            result.metadata = this.parseFrontMatter(frontMatter);
            result.body = body.trim();

            return result;

        });

    }

    parseFrontMatter(frontMatter) {

        const metadata = {};

        let currentKey = null;

        const lines = frontMatter.split("\n");

        for (const line of lines) {

            if (!line.trim()) {
                continue;
            }

            if (line.trim().startsWith("- ")) {

                if (!currentKey) {
                    continue;
                }

                let val = line.replace("- ", "").trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                metadata[currentKey].push(val);

                continue;
            }

            const parts = line.split(":");

            const key = parts.shift().trim();
            let value = parts.join(":").trim();
            
            // Remove surrounding double or single quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            if (value === "") {

                metadata[key] = [];
                currentKey = key;

            } else {

                metadata[key] = value;
                currentKey = null;

            }

        }

        return metadata;

    }

}
