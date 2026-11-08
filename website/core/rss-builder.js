import config from "../config/atlas.config.js";

export default class RSSBuilder {

    build(content) {

        console.log("  Building RSS Feed...");

        const siteUrl = config.site.url.replace(/\/$/, "");

        const items = content
            .filter(x => x.metadata.type === "article" && x.metadata.status !== "draft")
            .sort((a,b) => new Date(b.metadata.created || 0) - new Date(a.metadata.created || 0))
            .slice(0, 20);

        const xmlItems = items.map(item => `
    <item>
      <title>${escapeXml(item.metadata.title)}</title>
      <link>${siteUrl}/articles/${item.metadata.id}.html</link>
      <guid>${siteUrl}/articles/${item.metadata.id}.html</guid>
      <description>${escapeXml(item.metadata.summary || "")}</description>
      <pubDate>${item.metadata.created ? new Date(item.metadata.created).toUTCString() : new Date().toUTCString()}</pubDate>
    </item>`).join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Project Atlas — Thoms Foolery</title>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>An open, data-driven platform for building interconnected digital gardens.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${xmlItems}
  </channel>
</rss>`;

        return { items, xml };

    }

}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
