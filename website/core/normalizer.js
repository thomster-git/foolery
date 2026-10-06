/**
 * ============================================================
 * Content Normalizer
 * ============================================================
 *
 * Converts parsed metadata into a consistent internal format.
 *
 * Responsibilities
 * ----------------
 * • Normalize booleans
 * • Normalize numbers
 * • Normalize dates
 * • Normalize arrays
 * • Normalize strings
 * • Provide defaults
 *
 * Validation is NOT performed here.
 */

import path from "path";

export default class Normalizer {

    normalize(contentObjects) {

        return contentObjects.map(object => {

            const metadata = { ...object.metadata };
            const filePath = object.path || "";
            const bodyText = object.body || "";

            //--------------------------------------------------
            // Inferences for Missing Metadata
            //--------------------------------------------------

            if (!metadata.id || metadata.id.trim() === "") {
                metadata.id = path.basename(filePath, ".md").toLowerCase();
            }

            if (!metadata.type || metadata.type.trim() === "" || metadata.type === "unknown") {
                metadata.type = this.inferType(filePath);
            }

            if (!metadata.title || metadata.title.trim() === "") {
                metadata.title = this.inferTitle(metadata.id, bodyText);
            }

            if (!metadata.summary || metadata.summary.trim() === "") {
                metadata.summary = this.inferSummary(bodyText, metadata.title, metadata.type);
            }

            metadata.status ??= "draft";
            metadata.access = (metadata.access || "public").toLowerCase();
            metadata.author ??= "Jonathan Thoms";

            //--------------------------------------------------
            // Boolean
            //--------------------------------------------------

            metadata.featured =
                metadata.featured === true ||
                metadata.featured === "true";

            //--------------------------------------------------
            // Arrays
            //--------------------------------------------------

            metadata.topics = this.toReferenceArray(metadata.topics);
            metadata.themes = this.toReferenceArray(metadata.themes);
            metadata.tags = this.toArray(metadata.tags);
            metadata.related = this.toReferenceArray(metadata.related);
            metadata.series = this.toReferenceArray(metadata.series);

            //--------------------------------------------------
            // Dates
            //--------------------------------------------------

            metadata.created = this.toDate(metadata.created);
            metadata.updated = this.toDate(metadata.updated);

            return {
                ...object,
                metadata
            };

        });

    }

    inferType(filePath) {
        const lower = filePath.toLowerCase().replace(/\\/g, "/");
        if (lower.includes("/content/topics/")) return "topic";
        if (lower.includes("/content/themes/")) return "theme";
        if (lower.includes("/content/collections/")) return "collection";
        if (lower.includes("/content/articles/")) return "article";
        if (lower.includes("/content/projects/")) return "project";
        if (lower.includes("/content/library/books/")) return "book";
        if (lower.includes("/content/library/companies/")) return "company";
        if (lower.includes("/content/library/courses/")) return "course";
        if (lower.includes("/content/library/creators/")) return "creator";
        if (lower.includes("/content/library/games/")) return "game";
        if (lower.includes("/content/library/hardware/")) return "hardware";
        if (lower.includes("/content/library/services/")) return "service";
        if (lower.includes("/content/library/tools/")) return "tool";
        if (lower.includes("/content/library/websites/")) return "website";
        if (lower.includes("/content/shit-list/")) return "shit-list";
        return "unknown";
    }

    inferTitle(id, bodyText) {
        // Look for # Heading in body
        const match = bodyText.match(/^#\s+(.+)$/m);
        if (match && match[1]) {
            return match[1].trim();
        }

        const customTitles = {
            "audhd": "AuDHD",
            "cfi": "CFI",
            "ps2-expansion": "PS2 Expansion",
            "tcg-cards": "TCG Cards"
        };

        if (customTitles[id]) {
            return customTitles[id];
        }

        // Convert slug to Title Case
        return id
            .split(/[-_]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    inferSummary(bodyText, title, type) {
        if (bodyText && bodyText.trim().length > 0) {
            const firstLine = bodyText
                .split("\n")
                .map(l => l.trim())
                .find(l => l.length > 0 && !l.startsWith("#"));

            if (firstLine) {
                const chars = Array.from(firstLine);
                return chars.slice(0, 160).join("") + (chars.length > 160 ? "..." : "");
            }
        }

        return `Exploration and notes on ${title} (${type}).`;
    }

    toArray(value) {

        if (!value)
            return [];

        if (Array.isArray(value))
            return value;

        return [value];

    }

    toReferenceArray(value) {
        if (!value) return [];
        let arr = Array.isArray(value) ? value : [value];
        return arr.map(v => String(v).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-"));
    }

    toDate(value) {

        if (!value)
            return null;

        const date = new Date(value);

        return Number.isNaN(date.getTime())
            ? null
            : date;

    }

}
