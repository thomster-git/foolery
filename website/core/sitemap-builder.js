import config from "../config/atlas.config.js";
import { slugifyTag } from "./seo-helpers.js";

const LIBRARY_TYPES = [
    "book",
    "company",
    "course",
    "creator",
    "game",
    "hardware",
    "service",
    "software",
    "tool",
    "website",
    "documentation",
    "music",
    "tv-show"
];

function getPlural(type) {
    if (type === "company") return "companies";
    if (["hardware", "software", "music", "documentation"].includes(type)) return type;
    return `${type}s`;
}

export default class SitemapBuilder {

    build(content) {

        console.log("  Building Sitemap...");

        const siteUrl = config.site.url.replace(/\/$/, "");
        const now = new Date().toISOString();
        const urlMap = new Map();

        const addEntry = (urlPath, updated = now) => {
            if (!urlPath || urlPath.includes("#")) return;
            const absoluteUrl = urlPath.startsWith("http") ? urlPath : `${siteUrl}${urlPath}`;
            if (!urlMap.has(absoluteUrl)) {
                urlMap.set(absoluteUrl, { url: urlPath, absoluteUrl, updated });
            }
        };

        // 1. Structural static pages & public interactive tools
        const staticRoutes = [
            "/",
            "/start/",
            "/store/",
            "/contact/",
            "/resume/",
            "/hire/",
            "/interests/",
            "/uses/",
            "/sponsors/",
            "/live/",
            "/fitness/",
            "/labyrinth/",
            "/labyrinth3d/",
            "/graph/",
            "/wishlist/",
            "/tools/",
            "/tools/f1-championship-calculator/",
            "/tools/umpire-simulator/",
            "/tools/ocarina/",
            "/tools/dragonwilds-tracker/",
            "/tools/ffx-tracker/",
            "/tools/tier-list/",
            "/tools/postseason-baseball-analyzer/",
            "/tools/baseball-trend-analyzer/",
            "/tools/sports-betting/",
            "/tools/nhl-trend-analyzer/",
            "/tools/nfl-trend-analyzer/",
            "/tools/stream-schedule/",
            "/tools/runescape-bond-tracker/",
            "/tools/fitness/",
            "/tools/skill-building/"
        ];
        for (const route of staticRoutes) {
            addEntry(route, now);
        }

        // 2. Dynamic hub indexes (included iff non-draft item count > 0, matching IndexBuilder noindex rules)
        const published = content.filter(page => page.metadata?.status !== "draft");
        const countByType = (type) => published.filter(p => p.metadata?.type === type).length;

        const hubTypePairs = [
            ["/articles/", "article"],
            ["/projects/", "project"],
            ["/topics/", "topic"],
            ["/themes/", "theme"],
            ["/collections/", "collection"],
            ["/tweets/", "tweet"],
            ["/shit-list/", "shit-list"]
        ];
        for (const [hubRoute, type] of hubTypePairs) {
            if (countByType(type) > 0) {
                addEntry(hubRoute, now);
            }
        }

        const publishedLibraryItems = published.filter(p => LIBRARY_TYPES.includes(p.metadata?.type));
        if (publishedLibraryItems.length > 0) {
            addEntry("/library/", now);
        }
        for (const type of LIBRARY_TYPES) {
            if (countByType(type) > 0) {
                addEntry(`/library/${getPlural(type)}/`, now);
            }
        }

        // 3. Individual published content items (excluding wishlist fragment entries)
        for (const page of published) {
            if (page.metadata?.type === "wishlist") continue;
            const pageUrl = page.url || `/${getPlural(page.metadata.type)}/${page.metadata.id}.html`;
            const updated = page.metadata.updated || page.metadata.created || now;
            addEntry(pageUrl, updated);
        }

        // 4. Tag directory & individual tag pages for published content
        const tagLatestDate = new Map();
        for (const item of published) {
            const itemDate = item.metadata?.updated || item.metadata?.created || now;
            for (const tag of (item.metadata?.tags || [])) {
                const slug = slugifyTag(tag);
                if (!slug) continue;
                const prev = tagLatestDate.get(slug);
                if (!prev || String(itemDate) > String(prev)) {
                    tagLatestDate.set(slug, itemDate);
                }
            }
        }
        if (tagLatestDate.size > 0) {
            addEntry("/tags/", now);
            for (const [slug, latestDate] of [...tagLatestDate.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
                addEntry(`/tags/${slug}.html`, latestDate);
            }
        }

        const pages = Array.from(urlMap.values()).map(({ url, updated }) => ({ url, updated }));

        const xmlUrls = Array.from(urlMap.values()).map(p => {
            let dateStr;
            try {
                const parsed = new Date(p.updated);
                dateStr = isNaN(parsed.getTime())
                    ? new Date().toISOString().split("T")[0]
                    : parsed.toISOString().split("T")[0];
            } catch {
                dateStr = new Date().toISOString().split("T")[0];
            }
            return `
  <url>
    <loc>${escapeXml(p.absoluteUrl)}</loc>
    <lastmod>${dateStr}</lastmod>
  </url>`;
        }).join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xmlUrls}
</urlset>
`;

        return { pages, xml };

    }

}

function escapeXml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
