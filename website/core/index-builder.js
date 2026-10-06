import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Renderer from "./renderer.js";
import ComponentBuilder from "./component-builder.js";
import config from "../config/atlas.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class IndexBuilder {

    constructor() {

        this.layouts = path.resolve(__dirname, "../templates/layouts");
        this.partials = path.resolve(__dirname, "../templates/partials");
        this.output = path.resolve(__dirname, "../dist");

        this.renderer = new Renderer();
        this.components = new ComponentBuilder();

    }

    getPlural(type) {
        if (type === "company") return "companies";
        if (["hardware", "software", "music", "documentation"].includes(type)) return type;
        return `${type}s`;
    }

    async build(content) {

        await this.buildArticles(content);
        await this.buildProjects(content);
        await this.buildTopics(content);
        await this.buildThemes(content);
        await this.buildCollections(content);
        await this.buildLibraryIndexes(content);
        await this.buildTagIndexes(content);
        await this.buildTweets(content);
        await this.buildShitList(content);

    }

    //--------------------------------------------------

    async buildArticles(content) {

        const articles = content.filter(x => x.metadata.type === "article");
        const topics = content.filter(x => x.metadata.type === "topic");

        let cardsHtml = "";
        const categorizedIds = new Set();

        for (const topic of topics) {
            const relatedArticles = articles.filter(a => a.metadata.topics && a.metadata.topics.includes(topic.metadata.id));
            if (relatedArticles.length > 0) {
                cardsHtml += `<h3>${topic.metadata.title}</h3><div class="card-grid" style="margin-bottom: 2rem;">${relatedArticles.map(a => this.components.articleCard(a)).join("\n")}</div>`;
                relatedArticles.forEach(a => categorizedIds.add(a.metadata.id));
            }
        }

        const uncategorized = articles.filter(a => !categorizedIds.has(a.metadata.id));
        if (uncategorized.length > 0) {
            cardsHtml += `<h3>Other Articles</h3><div class="card-grid" style="margin-bottom: 2rem;">${uncategorized.map(a => this.components.articleCard(a)).join("\n")}</div>`;
        }

        await this.writeIndex(
            "articles",
            "Articles",
            "article",
            "Long-form essays, personal stories, technical reflections, and gated member content.",
            articles.length,
            cardsHtml
        );

    }

    //--------------------------------------------------

    async buildLive(content) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const liveHtml = await fs.readFile(path.join(this.layouts, "live.html"), "utf8");
        const headerPartial = await fs.readFile(path.join(this.partials, "header.html"), "utf8");
        const footerPartial = await fs.readFile(path.join(this.partials, "footer.html"), "utf8");
        const baseTemplate = await fs.readFile(path.join(this.layouts, "base.html"), "utf8");
        
        const title = "Live Stream";
        const description = "Thoms Foolery Live Stream";
        
        const fullHtml = this.renderer.render(baseTemplate, {
            page_title:       `${title} — ${config.site.title}`,
            site_title:       config.site.title,
            site_url:         config.site.url,
            site_author:      config.site.author,
            lang:             config.site.language || "en",
            meta_description: description,
            og_title:         title,
            og_type:          "website",
            canonical_url:    `${config.site.url}/live/`,
            og_image:         `${config.site.url}/images/og-card.jpg`,
            google_adsense:   "",
            header: headerPartial,
            footer: footerPartial,
            content: liveHtml
        });
        
        const dir = path.join(this.output, "live");
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, "index.html"), fullHtml);
    }

    //--------------------------------------------------

    async buildShitList(content) {

        const shitListItems = content.filter(x => x.metadata.type === "shit-list");
        
        // Let's create a custom styling for the Shit List card grid that looks grungier and darker
        const customStyles = `
            <style>
                .shit-list-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                    margin-top: 2rem;
                }
                .shit-card {
                    background: #1a0f0f;
                    border: 1px solid #ff4444;
                    border-radius: var(--radius-md);
                    padding: 1.5rem;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(255, 0, 0, 0.1);
                    transition: all 0.2s ease-in-out;
                }
                .shit-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(255, 0, 0, 0.2);
                    border-color: #ff6b6b;
                }
                .shit-card::before {
                    content: "⚠️";
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    opacity: 0.2;
                    font-size: 2rem;
                }
                .shit-card h3 {
                    color: #ff6b6b;
                    margin-top: 0;
                    margin-bottom: 0.5rem;
                    font-size: 1.25rem;
                }
                .shit-card p {
                    color: #e0e0e0;
                    font-size: 0.95rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }
                .shit-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1.5rem;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 68, 68, 0.2);
                }
                .shit-card-footer a {
                    color: #ff8888;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: color 0.2s;
                }
                .shit-card-footer a:hover {
                    color: #ffaaaa;
                }
            </style>
        `;

        const cards = shitListItems.map(item => `
            <div class="shit-card">
                <h3>${item.metadata.title}</h3>
                <p>${item.metadata.description || item.metadata.summary}</p>
                <div class="shit-card-footer">
                    <a href="${item.url}">Read Why &rarr;</a>
                </div>
            </div>
        `).join("");

        const fullHtml = customStyles + '<div class="shit-list-grid">' + cards + '</div>';

        await this.writeIndex(
            "shit-list",
            "The Shit List",
            "shit-list",
            "Companies, products, software, and services that I explicitly do NOT recommend, and exactly why they failed me.",
            shitListItems.length,
            fullHtml
        );

    }

    //--------------------------------------------------

    async buildProjects(content) {

        const projects = content.filter(x => x.metadata.type === "project");
        
        const active = projects.filter(p => p.metadata.status === 'active');
        const drawingBoard = projects.filter(p => p.metadata.status === 'drawing-board');
        const completed = projects.filter(p => p.metadata.status === 'completed');

        let cardsHtml = "";
        
        if (active.length > 0) {
            cardsHtml += `<h3>Active Projects</h3><div class="card-grid" style="margin-bottom: 2rem;">${active.map(project => this.components.projectCard(project)).join("\n")}</div>`;
        }
        if (drawingBoard.length > 0) {
            cardsHtml += `<h3>The Drawing Board</h3><div class="card-grid" style="margin-bottom: 2rem;">${drawingBoard.map(project => this.components.projectCard(project)).join("\n")}</div>`;
        }
        if (completed.length > 0) {
            cardsHtml += `<h3>Completed Case Studies</h3><div class="card-grid" style="margin-bottom: 2rem;">${completed.map(project => this.components.projectCard(project)).join("\n")}</div>`;
        }

        await this.writeIndex(
            "projects",
            "Projects",
            "project",
            "Active technical projects, hardware builds, laser craftsmanship, and software developments.",
            projects.length,
            cardsHtml
        );

    }

    //--------------------------------------------------

    async buildTopics(content) {

        const topics = content.filter(x => x.metadata.type === "topic");
        const cards = topics.map(topic => this.components.topicCard(topic)).join("\n");

        await this.writeIndex(
            "topics",
            "Topics",
            "topic",
            "Subjects and domains organizing knowledge across the Project Atlas network.",
            topics.length,
            cards
        );

    }

    //--------------------------------------------------

    async buildThemes(content) {

        const themes = content.filter(x => x.metadata.type === "theme");
        const cards = themes.map(t => this.components.themeCard(t)).join("\n");

        await this.writeIndex(
            "themes",
            "Themes",
            "theme",
            "Overarching philosophical and personal themes shaping thought and writing.",
            themes.length,
            cards
        );

    }

    //--------------------------------------------------

    async buildTweets(content) {
        const tweets = content
            .filter(x => x.metadata.type === "tweet")
            .sort((a, b) => new Date(b.metadata.created) - new Date(a.metadata.created));
            
        const feedHtml = this.components.twitterFeed(tweets);

        await this.writeIndex(
            "tweets",
            "Twitter Archive",
            "tweet",
            "A complete archive of extracted tweets, threads, and connected ideas from the digital garden.",
            tweets.length,
            feedHtml
        );
    }

    //--------------------------------------------------

    async buildCollections(content) {

        const collections = content.filter(x => x.metadata.type === "collection");
        const cards = collections.map(c => this.components.collectionCard(c)).join("\n");

        await this.writeIndex(
            "collections",
            "Collections",
            "collection",
            "Physical and digital collections owned, curated, and cataloged.",
            collections.length,
            cards
        );

    }

    //--------------------------------------------------

    async buildLibraryIndexes(content) {

        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];

        let shelfBooks = "";
        let shelfContents = "";
        
        let colors = ["var(--accent-blue)", "var(--accent-green)", "var(--accent-purple)", "var(--accent-cyan)", "var(--accent-orange)", "var(--accent-red)"];
        let colorIndex = 0;

        for (const type of libraryTypes) {
            const items = content.filter(x => x.metadata.type === type);
            if (items.length === 0) continue;
            
            const plural = type === 'tv-show' ? 'TV Shows' : this.capitalize(this.getPlural(type));
            
            const categories = {};
            items.forEach(item => {
                let cat = "Other";
                if (item.path) {
                    const match = item.path.replace(/\\/g, "/").match(new RegExp(`/content/library/${this.getPlural(type)}/([^/]+)/`));
                    if (match) {
                        cat = match[1];
                    }
                }
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(item);
            });

            let contentHtml = "";
            const catNames = Object.keys(categories).sort((a, b) => {
                if (a === "Other") return 1;
                if (b === "Other") return -1;
                return a.localeCompare(b);
            });
            
            if (catNames.length === 1 && catNames[0] === "Other") {
                const cards = categories["Other"].map(item => this.components.card(item)).join("\n");
                contentHtml = `<div class="card-grid">${cards}</div>`;
            } else {
                for (const cat of catNames) {
                    const cards = categories[cat].map(item => this.components.card(item)).join("\n");
                    const catTitle = this.capitalize(cat.replace(/-/g, " "));
                    contentHtml += `<h3 style="margin-top: 1rem; margin-bottom: 1rem; color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">${catTitle}</h3>\n`;
                    contentHtml += `<div class="card-grid" style="margin-bottom: 2rem;">${cards}</div>\n`;
                }
            }
            
            const bookColor = colors[colorIndex % colors.length];
            colorIndex++;
            
            shelfBooks += `
                <div class="bookshelf-book" data-tooltip="${plural}" onclick="toggleShelfContent('shelf-content-${type}', this)" style="border-left-color: ${bookColor};">
                    <span class="book-title">${plural}</span>
                    <span class="book-count">${items.length}</span>
                </div>
            `;
            
            shelfContents += `
                <div id="shelf-content-${type}" class="shelf-content-panel" style="display: none;">
                    <h2 style="color: ${bookColor}; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        ${plural} Library
                    </h2>
                    ${contentHtml}
                </div>
            `;
        }

        const allLibraryItems = content.filter(x => libraryTypes.includes(x.metadata.type));

        const fullBookshelfHtml = `
            <style>
                .graph-container, .index-content-section .index-section-header {
                    display: none !important;
                }
                .bookshelf-container {
                    width: 100vw;
                    margin-left: calc(50% - 50vw);
                    margin-top: 2rem;
                    margin-bottom: 2rem;
                    padding: 0 2rem;
                    box-sizing: border-box;
                }
                .bookshelf-shelf {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 1rem;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 8px solid var(--border-color);
                    border-radius: 4px;
                    justify-content: center;
                    margin-bottom: 2rem;
                    max-width: 1400px;
                    margin: 0 auto 2rem auto;
                }
                #shelf-contents-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .bookshelf-book {
                    width: 60px;
                    height: 260px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-left-width: 8px;
                    border-radius: 2px 6px 6px 2px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    align-items: center;
                    padding-bottom: 1rem;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative;
                }
                .bookshelf-book::before {
                    content: attr(data-tooltip);
                    position: absolute;
                    top: -45px;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: var(--bg-element);
                    color: var(--text-main);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    font-weight: bold;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: 0.2s ease;
                    border: 1px solid var(--border-color);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                    z-index: 20;
                }
                .bookshelf-book::after {
                    content: '';
                    position: absolute;
                    top: -12px;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    border: 6px solid transparent;
                    border-top-color: var(--border-color);
                    opacity: 0;
                    pointer-events: none;
                    transition: 0.2s ease;
                    z-index: 20;
                }
                .bookshelf-book:hover::before, .bookshelf-book:hover::after {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                .bookshelf-book:hover, .bookshelf-book.active {
                    transform: translateY(-10px);
                    box-shadow: 0 10px 15px rgba(0,0,0,0.3);
                    z-index: 10;
                }
                .bookshelf-book .book-title {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    transform: rotate(180deg);
                    font-weight: bold;
                    color: var(--text-main);
                    letter-spacing: 1.5px;
                    font-size: 1.2rem;
                    margin-bottom: 1rem;
                }
                .bookshelf-book .book-count {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    background: rgba(255,255,255,0.1);
                    padding: 2px 6px;
                    border-radius: 10px;
                }
                .shelf-content-panel {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    animation: fadeIn 0.3s ease;
                }
            </style>
            
            <div class="bookshelf-container">
                <p style="text-align: center; color: var(--text-muted); margin-bottom: 1rem;">Select a book from the shelf to browse recommendations.</p>
                
                <div class="bookshelf-shelf" id="bookshelf-main">
                    ${shelfBooks}
                </div>
                
                <div id="shelf-contents-container">
                    ${shelfContents}
                </div>
            </div>

            <script>
                function toggleShelfContent(targetId, bookEl) {
                    // Hide all panels
                    document.querySelectorAll('.shelf-content-panel').forEach(el => el.style.display = 'none');
                    // Remove active state from all books
                    document.querySelectorAll('.bookshelf-book').forEach(el => el.classList.remove('active'));
                    
                    // Show target panel
                    document.getElementById(targetId).style.display = 'block';
                    // Add active state to clicked book
                    bookEl.classList.add('active');
                    
                    // Scroll to content
                    document.getElementById('shelf-contents-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            </script>
        `;

        await this.writeIndex(
            "library",
            "Library & Recommended Gear",
            "library",
            "Curated sensory tools, books, hardware, software, YouTube creators, and recommended products with affiliate links.",
            allLibraryItems.length,
            fullBookshelfHtml
        );

        // Individual type indexes
        for (const type of libraryTypes) {
            const items = content.filter(x => x.metadata.type === type);
            if (items.length === 0) continue;
            
            const plural = this.getPlural(type);
            const categories = {};
            
            items.forEach(item => {
                let cat = "Other";
                if (item.path) {
                    const match = item.path.replace(/\\/g, "/").match(new RegExp(`/content/library/${plural}/([^/]+)/`));
                    if (match) {
                        cat = match[1];
                    }
                }
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(item);
            });

            let contentHtml = "";
            const catNames = Object.keys(categories).sort((a, b) => {
                if (a === "Other") return 1;
                if (b === "Other") return -1;
                return a.localeCompare(b);
            });
            
            if (catNames.length === 1 && catNames[0] === "Other") {
                const cards = categories["Other"].map(item => this.components.card(item)).join("\n");
                contentHtml = `<div class="card-grid">${cards}</div>`;
            } else {
                for (const cat of catNames) {
                    const cards = categories[cat].map(item => this.components.card(item)).join("\n");
                    const catTitle = this.capitalize(cat.replace(/-/g, " "));
                    contentHtml += `<h3 style="margin-top: 3rem; margin-bottom: 1.5rem; color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">${catTitle}</h3>\n`;
                    contentHtml += `<div class="card-grid" style="margin-bottom: 2rem;">${cards}</div>\n`;
                }
            }

            await this.writeIndex(
                `library/${plural}`,
                this.capitalize(plural),
                type,
                `Catalog of ${plural} reference items in the Project Atlas library.`,
                items.length,
                contentHtml
            );
        }

    }

    //--------------------------------------------------

    async buildTagIndexes(content) {

        const tagMap = new Map();

        content.forEach(item => {
            const tags = item.metadata.tags || [];
            tags.forEach(tag => {
                const slug = tag.toLowerCase().trim();
                if (!tagMap.has(slug)) {
                    tagMap.set(slug, []);
                }
                tagMap.get(slug).push(item);
            });
        });

        // Build main /tags/ index directory page
        const tagEntries = Array.from(tagMap.entries()).sort((a, b) => b[1].length - a[1].length);
        const tagCards = tagEntries.map(([tag, items]) => `
            <article class="card tag-directory-card">
              <h2><a href="/tags/${tag}.html">#${tag}</a></h2>
              <p>Contains <strong>${items.length}</strong> connected articles, projects, topics, and library items.</p>
            </article>
        `).join("\n");

        await this.writeIndex(
            "tags",
            "Tag Directory",
            "tag",
            "Browse knowledge connections grouped by specific tags.",
            tagEntries.length,
            tagCards
        );

        // Build individual /tags/<tag>.html pages
        for (const [tag, items] of tagMap.entries()) {
            const cards = items.map(item => this.components.card(item)).join("\n");
            await this.writeCustomTagIndex(
                tag,
                `#${tag}`,
                "tag",
                `All content items tagged with #${tag}.`,
                items.length,
                cards
            );
        }

    }

    async writeCustomTagIndex(tagSlug, title, type, description, count, cards) {
        await fs.mkdir(path.join(this.output, "tags"), { recursive: true });

        const layoutTemplate = await fs.readFile(path.join(this.layouts, "index.html"), "utf8");
        const baseTemplate = await fs.readFile(path.join(this.layouts, "base.html"), "utf8");
        const headerPartial = await fs.readFile(path.join(this.partials, "header.html"), "utf8");
        const footerPartial = await fs.readFile(path.join(this.partials, "footer.html"), "utf8");

        const contentHtml = this.renderer.render(layoutTemplate, {
            title,
            type,
            description,
            count,
            cards,
            focus_tag: tagSlug
        });

        const fullHtml = this.renderer.render(baseTemplate, {
            page_title:       `${title} — ${config.site.title}`,
            site_title:       config.site.title,
            site_url:         config.site.url,
            site_author:      config.site.author,
            lang:             config.site.language || "en",
            meta_description: description || config.site.description,
            og_title:         title,
            og_type:          "website",
            canonical_url:    `${config.site.url}/tags/${tagSlug}.html`,
            og_image:         `${config.site.url}/images/og-card.jpg`,
            google_adsense:   "",
            focus_tag:        tagSlug,
            header: headerPartial,
            footer: footerPartial,
            content: contentHtml
        });

        await fs.writeFile(path.join(this.output, "tags", `${tagSlug}.html`), fullHtml);
    }

    capitalize(str) {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //--------------------------------------------------

    async writeIndex(folder, title, type, description, count, cards) {

        await fs.mkdir(path.join(this.output, folder), { recursive: true });

        const layoutTemplate = await fs.readFile(path.join(this.layouts, "index.html"), "utf8");
        const baseTemplate = await fs.readFile(path.join(this.layouts, "base.html"), "utf8");
        const headerPartial = await fs.readFile(path.join(this.partials, "header.html"), "utf8");
        const footerPartial = await fs.readFile(path.join(this.partials, "footer.html"), "utf8");

        const cardsHtml = (type === "library" || folder === "shit-list" || folder === "projects" || folder === "articles") ? cards : `<div class="card-grid">${cards}</div>`;

        const graphHtml = folder === "shit-list" ? "" : `
<section class="graph-container">
    <h2>Interactive ${title} Knowledge Graph</h2>
    <div id="graph-canvas" class="graph-canvas" data-focus-type="${type}" data-focus-tag=""></div>
</section>`;

        const contentHtml = this.renderer.render(layoutTemplate, {
            title,
            type,
            description,
            count,
            cards: cardsHtml,
            graph_html: graphHtml
        });

        const fullHtml = this.renderer.render(baseTemplate, {
            page_title:       `${title} — ${config.site.title}`,
            site_title:       config.site.title,
            site_url:         config.site.url,
            site_author:      config.site.author,
            lang:             config.site.language || "en",
            meta_description: description || config.site.description,
            og_title:         title,
            og_type:          "website",
            canonical_url:    `${config.site.url}/${folder}/`,
            og_image:         `${config.site.url}/images/og-card.jpg`,
            google_adsense:   "",
            header: headerPartial,
            footer: footerPartial,
            content: contentHtml
        });

        await fs.writeFile(path.join(this.output, folder, "index.html"), fullHtml);

    }

}
