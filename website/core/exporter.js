/**
 * ============================================================
 * Exporter
 * ============================================================
 *
 * Writes compiled Atlas data into /dist.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/atlas.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class Exporter {

    constructor(outputDirectory = path.resolve(__dirname, "../dist")) {

        this.outputDirectory = outputDirectory;

    }

    async export(data) {

        await fs.mkdir(
            this.outputDirectory,
            {
                recursive: true
            }
        );

        for (const [name, value] of Object.entries(data)) {

            if (value && typeof value === "object" && value.xml) {
                const xmlFile = path.join(this.outputDirectory, `${name}.xml`);
                await fs.writeFile(xmlFile, value.xml);
            }
            
            if (value && typeof value === "object" && value.text) {
                const txtFile = path.join(this.outputDirectory, `${name}.txt`);
                await fs.writeFile(txtFile, value.text);
                continue;
            }

            const file = path.join(

                this.outputDirectory,

                `${name}.json`

            );

            const serializable = this.sanitize(value);

            await fs.writeFile(

                file,

                JSON.stringify(
                    serializable,
                    null,
                    2
                )

            );

        }

        await this.copyStaticAssets();
        await this.writeRobotsTxt();

    }

    async copyStaticAssets() {
        const staticDir = path.resolve(__dirname, "../static");
        try {
            await fs.cp(staticDir, this.outputDirectory, { recursive: true });
        } catch (err) {
            console.warn("Could not copy static assets:", err.message);
        }
    }

    async writeRobotsTxt() {
        const siteUrl = config.site.url.replace(/\/$/, "");
        const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
        await fs.writeFile(path.join(this.outputDirectory, "robots.txt"), robots);
    }

    sanitize(obj, seen = new WeakSet()) {

        if (obj === null || typeof obj !== "object") {
            return obj;
        }

        if (seen.has(obj)) {
            return obj.metadata?.id || null;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitize(item, seen)).filter(x => x !== null);
        }

        seen.add(obj);
        const res = {};
        for (const [key, val] of Object.entries(obj)) {
            if (key === "links" && val && typeof val === "object") {
                const cleanLinks = {};
                for (const [linkType, linkItems] of Object.entries(val)) {
                    cleanLinks[linkType] = Array.isArray(linkItems)
                        ? linkItems.map(item => (item && typeof item === "object" ? item.metadata?.id || item.id : item)).filter(Boolean)
                        : [];
                }
                res[key] = cleanLinks;
            } else {
                res[key] = this.sanitize(val, seen);
            }
        }

        return res;
    }

}
