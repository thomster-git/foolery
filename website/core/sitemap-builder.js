import config from "../config/atlas.config.js";

export default class SitemapBuilder {

    build(content) {

        console.log("  Building Sitemap...");

        const siteUrl = config.site.url.replace(/\/$/, "");

        const pages = content.map(page => ({
            url: page.url || `/${page.metadata.type}s/${page.metadata.id}.html`,
            updated: page.metadata.updated || page.metadata.created || new Date().toISOString()
        }));

        // Manually inject structural static pages
        const now = new Date().toISOString();
        pages.push({ url: "/", updated: now });
        pages.push({ url: "/start/", updated: now });
        pages.push({ url: "/tools/", updated: now });
        pages.push({ url: "/tools/ocarina/", updated: now });
        pages.push({ url: "/tools/nhl-trend-analyzer.html", updated: now });
        pages.push({ url: "/tools/nfl-trend-analyzer.html", updated: now });
        pages.push({ url: "/tools/dragonwilds-tracker.html", updated: now });

        const xmlUrls = pages.map(p => {
          let dateStr;
          try {
            dateStr = new Date(p.updated).toISOString().split('T')[0];
          } catch (e) {
            dateStr = new Date().toISOString().split('T')[0];
          }
          const absoluteUrl = p.url.startsWith('http') ? p.url : `${siteUrl}${p.url}`;
          return `
  <url>
    <loc>${escapeXml(absoluteUrl)}</loc>
    <lastmod>${dateStr}</lastmod>
  </url>`;
        }).join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`;

        return { pages, xml };

    }

}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
