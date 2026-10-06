/**
 * ============================================================
 * Content Loader
 * ============================================================
 *
 * Discovers and loads every supported content file.
 *
 * Responsibilities
 * ----------------
 * • Discover Markdown files
 * • Read file contents
 * • Extract front matter
 * • Extract Markdown body
 *
 * Input
 * -----
 * Repository content
 *
 * Output
 * ------
 * Raw Content Objects
 *
 * The Loader performs no validation.
 * It only loads data.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Loader {

    constructor(contentDirectory = path.resolve(__dirname, "../../content")) {
    this.contentDirectory = contentDirectory;
}

    /**
     * Entry point.
     */
    async loadContent() {

        const markdownFiles = await this.discoverMarkdownFiles(
            this.contentDirectory
        );

        const objects = [];

        for (const file of markdownFiles) {
            const object = await this.readMarkdownFile(file);
            objects.push(object);
        }

        return objects;

    }

    /**
     * Recursively discovers every Markdown file.
     */
    async discoverMarkdownFiles(directory) {

        const entries = await fs.readdir(directory, {
            withFileTypes: true
        });

        let files = [];

        for (const entry of entries) {

            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === "node_modules" || entry.name.startsWith(".")) {
                    continue;
                }

                files.push(
                    ...(await this.discoverMarkdownFiles(fullPath))
                );

            } else if (
                entry.isFile() &&
                entry.name.endsWith(".md")
            ) {

                files.push(fullPath);

            }

        }

        return files;

    }

    /**
     * Reads a Markdown file.
     */
    async readMarkdownFile(filePath) {

        const content = await fs.readFile(filePath, "utf8");

        return {

            path: filePath,

            raw: content

        };

    }

}
