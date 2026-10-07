import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Renderer from "./renderer.js";
import ComponentBuilder from "./component-builder.js";
import Router from "./router.js";
import parseMarkdown from "./markdown-parser.js";
import config from "../config/atlas.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class PageBuilder {

    constructor() {

        this.layouts = path.resolve(__dirname, "../templates/layouts");
        this.partials = path.resolve(__dirname, "../templates/partials");
        this.output = path.resolve(__dirname, "../dist");

        this.renderer = new Renderer();
        this.components = new ComponentBuilder();
        this.router = new Router();

    }

    //--------------------------------------------------
    // Entry Point
    //--------------------------------------------------

    getPlural(type) {
        if (type === "company") return "companies";
        if (["hardware", "software", "music", "documentation"].includes(type)) return type;
        return `${type}s`;
    }

    async build(content) {

        console.log("Generating HTML...");

        await fs.mkdir(this.output, { recursive: true });

        await this.buildHomepage(content);
        await this.buildStartPage();
        await this.buildUsesPage();
        await this.buildToolsPage();
        await this.buildDevToolsPage();
        await this.buildResumePage();
        await this.buildFitnessPage();
        await this.build404Page();
        await this.buildGraphPage();
        await this.buildLabyrinthPage();
        await this.buildLabyrinth3dPage();
        // await this.buildJaysTracker(); // Hidden until next year
        await this.buildFFXTracker();
        await this.buildDragonwildsTracker();
        await this.buildNHLAnalyzer();
        await this.buildNFLAnalyzer();
        await this.buildSportsBettingTracker();
        await this.buildBaseballTrendAnalyzer();
        await this.buildPostseasonBaseballAnalyzer();
        await this.buildTwitterDb();
        await this.buildOcarinaPage();
        await this.buildSponsorsPage();
        
        await this.buildWishlistPage(content.filter(x => x.metadata.type === "wishlist"));

        const articles = content.filter(x => x.metadata.type === "article" && x.metadata.status !== "draft");
        articles.sort((a, b) => new Date(b.metadata.created || 0) - new Date(a.metadata.created || 0));
        articles.forEach((article, i) => {
            article.metadata.nextArticle = articles[i - 1] || null;
            article.metadata.prevArticle = articles[i + 1] || null;
        });

        await this.buildCollection(
            articles,
            article => this.buildArticle(article)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "topic"),
            topic => this.buildTopic(topic, content)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "project"),
            project => this.buildProject(project)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "theme"),
            theme => this.buildTheme(theme, content)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "collection"),
            col => this.buildCustomCollection(col)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "tweet"),
            tweet => this.buildTweet(tweet)
        );

        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];
        await this.buildCollection(
            content.filter(x => libraryTypes.includes(x.metadata.type)),
            item => this.buildLibraryItem(item)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "tv-show"),
            item => this.buildTvShowItem(item)
        );

        await this.buildCollection(
            content.filter(x => x.metadata.type === "shit-list"),
            item => this.buildShitListItem(item)
        );

        console.log("✓ HTML Generated");

        return true;

    }

    //--------------------------------------------------
    // Generic Collection Builder
    //--------------------------------------------------

    async buildCollection(collection, callback) {

        for (const item of collection) {

            await callback(item);

        }

    }

    //--------------------------------------------------
    // Homepage
    //--------------------------------------------------

    async buildHomepage(content) {

        const template = await this.loadLayout("homepage.html");

        const recentArticles = content
            .filter(x => x.metadata.type === "article")
            .slice(0, 6)
            .map(article => this.components.articleCard(article))
            .join("\n");

        const projects = content
            .filter(x => x.metadata.type === "project")
            .slice(0, 4)
            .map(project => this.components.projectCard(project))
            .join("\n");

        const topics = content
            .filter(x => x.metadata.type === "topic")
            .slice(0, 6)
            .map(topic => this.components.topicCard(topic))
            .join("\n");

        const adSidebarHtml = await this.loadPartial("ad-sidebar.html");
        const tweets = content
            .filter(x => x.metadata.type === "tweet")
            .sort((a, b) => {
                const aScore = (a.metadata.favorites || 0) + (a.metadata.retweets || 0);
                const bScore = (b.metadata.favorites || 0) + (b.metadata.retweets || 0);
                return bScore - aScore;
            })
            .slice(0, 8);
        const twitterFeedHtml = this.components.twitterFeed(tweets);

        const html = await this.wrapPage(

            this.renderer.render(template, {

                recent_articles: recentArticles,
                projects: projects,
                topics: topics,
                ad_sidebar: adSidebarHtml,
                twitter_feed: "" // Hiding for now until spreadsheet is ready

            }),

            config.site.title,
            { description: config.site.description, path: "/", ogType: "website" }

        );

        await fs.writeFile(

            path.join(this.output, "index.html"),

            html

        );

    }

    //--------------------------------------------------
    //--------------------------------------------------
    // Twitter DB Tool
    //--------------------------------------------------

    async buildTwitterDb() {
        const folder = path.join(this.output, "tools", "twitter-db");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("twitter-db.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        const contentHtml = this.renderer.render(
            template,
            { ad_sidebar: adSidebar }
        );

        let html = await this.wrapPage(
            contentHtml,
            "Twitter DB Tool | Thoms Foolery",
            { description: "Generate JSON structure for tweet ingestion", path: "/tools/twitter-db/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    // Ocarina Practice Tool
    async buildOcarinaPage() {
        const folder = path.join(this.output, "tools", "ocarina");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("ocarina.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");

        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "Ocarina Practice Tool",
            { description: "12-hole ocarina fingering chart, live pitch tuner, and Zelda songbook", path: "/tools/ocarina/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
    }

    //--------------------------------------------------
    // Tools Page
    //--------------------------------------------------

    
    async buildDevToolsPage() {
        console.log("  Building Dev Tools Page...");
        const template = await this.loadLayout("devtools.html");
        const html = await this.wrapPage(
            this.renderer.render(template, { title: "Dev Tools" }),
            "Dev Tools - Thoms Foolery"
        );
        const dir = path.resolve(this.output, "devtools");
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.resolve(dir, "index.html"), html);
    }

    async buildToolsPage() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("tools.html");
        
        const contentHtml = this.renderer.render(
            template,
            "Developer Tools",
            { description: "Interactive tools and applications by Jonathan Thoms", path: "/tools/", ogType: "website" }
        );

        let html = await this.wrapPage(
            contentHtml,
            "Developer Tools",
            { description: "Interactive tools and applications by Jonathan Thoms", path: "/tools/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
    }

    // Sports Betting Tracker
    async buildSportsBettingTracker() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("sports-betting.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Sports Betting Tracker",
            { description: "Tracking sports betting slips and bankroll.", path: "/tools/sports-betting.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "sports-betting.html"), html);
    }

    // Jays Tracker
    async buildJaysTracker() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("blue-jays.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "Blue Jays Postseason Tracker",
            { description: "Live tracker for the Toronto Blue Jays postseason hopes", path: "/tools/blue-jays.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "blue-jays.html"), html);
    }

    // FFX Tracker
    async buildFFXTracker() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("ffx-tracker.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "FFX 100% Completion Tracker",
            { description: "Comprehensive checklist for Final Fantasy X", path: "/tools/ffx-tracker.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "ffx-tracker.html"), html);
    }

    // Dragonwilds Tracker
    async buildDragonwildsTracker() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("dragonwilds-tracker.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "Runescape: Dragonwilds Guide",
            { description: "Interactive progression guide for Runescape: Dragonwilds", path: "/tools/dragonwilds-tracker.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "dragonwilds-tracker.html"), html);
    }

    // NHL Trend Analyzer
    async buildNHLAnalyzer() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("nhl-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "NHL Trend Analyzer",
            { description: "NHL team performance and special teams efficiency tracker", path: "/tools/nhl-trend-analyzer.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "nhl-trend-analyzer.html"), html);
    }

    // NFL Trend Analyzer
    async buildNFLAnalyzer() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("nfl-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "NFL Trend Analyzer",
            { description: "NFL team performance trend analyzer", path: "/tools/nfl-trend-analyzer.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "nfl-trend-analyzer.html"), html);
    }

    // Baseball Trend Analyzer
    async buildBaseballTrendAnalyzer() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("baseball-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "Baseball Trend Analyzer",
            { description: "MLB team performance trendline visualizer", path: "/tools/baseball-trend-analyzer.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "baseball-trend-analyzer.html"), html);
    }

    async buildPostseasonBaseballAnalyzer() {
        const folder = path.join(this.output, "tools");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("postseason-baseball-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar }),
            "MLB Postseason Analyzer",
            { description: "MLB team performance trendline visualizer for the playoffs", path: "/tools/postseason-baseball-analyzer.html", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "postseason-baseball-analyzer.html"), html);
    }

    //--------------------------------------------------
    // Sponsors Page
    //--------------------------------------------------

    async buildSponsorsPage() {
        const folder = path.join(this.output, "sponsors");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("sponsors.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Sponsorships & Partnerships",
            { description: "Partner with Thoms Foolery", path: "/sponsors/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    //--------------------------------------------------
    // 404 Page
    //--------------------------------------------------

    async build404Page() {
        const template = await this.loadLayout("404.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Page Not Found",
            { description: "Signal Lost - Room 404", path: "/404.html", ogType: "website" }
        );

        await fs.writeFile(
            path.join(this.output, "404.html"),
            html
        );
    }

    //--------------------------------------------------
    // Graph Page
    //--------------------------------------------------

    async buildGraphPage() {
        const folder = path.join(this.output, "graph");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("graph.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Interactive Map | Thoms Foolery",
            { description: "Visualizing the entire digital garden", path: "/graph/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    //--------------------------------------------------
    // Mind Labyrinth Page
    //--------------------------------------------------

    async buildLabyrinthPage() {
        const folder = path.join(this.output, "labyrinth");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("labyrinth.html");

        // The labyrinth operates as a full-screen app, so we don't use wrapPage (which includes the standard header/footer)
        // We just write it wrapped in a basic HTML shell to ensure styles load.
        const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Labyrinth | Thoms Foolery</title>
    <link rel="stylesheet" href="/css/atlas.css">
    <style>body, html { margin: 0; padding: 0; overflow: hidden; background: #0b0f19; }</style>
</head>
<body>
    ${template}
</body>
</html>`;

        await fs.writeFile(
            path.join(folder, "index.html"),
            baseHTML
        );
    }

    async buildLabyrinth3dPage() {
        const folder = path.join(this.output, "labyrinth3d");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("labyrinth3d.html");

        const baseHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mind Labyrinth 3D | Thoms Foolery</title>
    <link rel="stylesheet" href="/css/atlas.css">
    <style>body, html { margin: 0; padding: 0; overflow: hidden; background: #0b0f19; }</style>
</head>
<body>
    ${template}
</body>
</html>`;

        await fs.writeFile(
            path.join(folder, "index.html"),
            baseHTML
        );
    }

    //--------------------------------------------------
    // Resume Page
    //--------------------------------------------------

    async buildResumePage() {
        const folder = path.join(this.output, "resume");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("resume.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Resume & Experience",
            { description: "Jonathan Thoms - Professional Experience & Resume", path: "/resume/", ogType: "profile" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    //--------------------------------------------------
    // Fitness Page
    //--------------------------------------------------

    async buildFitnessPage() {
        const folder = path.join(this.output, "fitness");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("fitness.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Fitness Lock-In Dashboard",
            { description: "Jonathan Thoms - Fitness & Body Recomposition Progress", path: "/fitness/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    //--------------------------------------------------
    // Wishlist Page
    //--------------------------------------------------

    async buildWishlistPage(items) {
        const folder = path.join(this.output, "wishlist");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("wishlist.html");
        
        // Sort items: Active first, then by Date (descending)
        items.sort((a, b) => {
            if (a.metadata.status !== b.metadata.status) {
                return a.metadata.status === "active" ? -1 : 1;
            }
            return new Date(b.metadata.created || 0) - new Date(a.metadata.created || 0);
        });

        const activeItems = items.filter(i => i.metadata.status === "active");
        const draftItems = items.filter(i => i.metadata.status === "draft");

        let generateCards = (list) => {
            return list.map(item => `
                <div id="${item.metadata.id}" class="wishlist-card ${item.metadata.status === 'draft' ? 'wishlist-card-draft' : ''}">
                    <div class="wishlist-header">
                        <h2 class="wishlist-title">${item.metadata.title}</h2>
                        <span class="wishlist-price">${item.metadata.price || 'TBD'}</span>
                    </div>
                    <div class="wishlist-category">
                        <span class="tag-pill">${item.metadata.category || 'Misc'}</span>
                    </div>
                    <div class="wishlist-body">
                        ${this.markdown(item.body || "")}
                    </div>
                    <div class="wishlist-footer">
                        ${item.metadata.url && item.metadata.url !== '#' ? 
                            `<a href="${item.metadata.url}" target="_blank" class="wishlist-btn">View / Purchase ↗</a>` : 
                            `<span class="wishlist-btn disabled">Researching</span>`}
                    </div>
                </div>
            `).join('\n');
        };

        const html = await this.wrapPage(
            this.renderer.render(template, {
                active_items: generateCards(activeItems),
                draft_items: generateCards(draftItems)
            }),
            "The Wishlist",
            { description: "Jonathan's project and gear wishlist.", path: "/wishlist/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
    }

    //--------------------------------------------------
    // Article
    //--------------------------------------------------

    async buildArticle(article) {

        const folder = path.join(this.output, "articles");

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("article.html");

        let bodyHtml = this.markdown(article.body);
        if (article.metadata.access === "paid" || article.metadata.access === "members") {
            let teaser = "";
            let fullBody = "";
            if (article.body.includes("<!-- more -->")) {
                const parts = article.body.split("<!-- more -->");
                teaser = parts[0];
                fullBody = this.markdown(parts.slice(1).join("<!-- more -->"));
            } else {
                const paragraphs = article.body.split("\n\n");
                teaser = paragraphs.slice(0, 2).join("\n\n") || paragraphs[0] || "";
                fullBody = this.markdown(paragraphs.slice(2).join("\n\n"));
            }
            bodyHtml = `
            <div class="teaser-gradient">
              ${this.markdown(teaser)}
            </div>
            
            <div class="lock-screen" id="paywall-card">
              <div class="paywall-badge">🔒 Members Only</div>
              <h3>Gated Content</h3>
              <p style="color: var(--text-dim); font-size: 0.9rem;">Please enter the Master Passcode to unlock.</p>
              <div style="margin: 1rem 0;">
                <input type="password" id="passcode-input" placeholder="Passcode" />
              </div>
              <button class="btn" style="width: 100%; justify-content: center;" onclick="checkPasscode(this)">Unlock</button>
              <p id="auth-error" style="color: #ef4444; display: none; font-size: 0.8rem; margin-top: 0.5rem;">Incorrect Passcode</p>
                    <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-dim);">
                        Don't have a token? <a href="/contact/" style="color: var(--accent); text-decoration: underline;">Contact us to request access</a>.
                    </p>
            </div>
            
            <div class="gated-full-content premium-blur" id="gated-full-content" style="display:block;">
              ${fullBody}
            </div>
            `;
        }

        let audioPlayerHtml = "";
        if (article.metadata.audio) {
            audioPlayerHtml = `
            <div class="audio-player-card" data-audio-src="${article.metadata.audio}">
              <div class="audio-player-header">
                <span class="audio-badge">🎙️ Voice Narration / Podcast</span>
                <span class="audio-title">${article.metadata.title}</span>
              </div>
              <div class="audio-controls">
                <button class="btn-audio-play" aria-label="Play Narration">▶</button>
                <div class="audio-progress-container">
                  <div class="audio-progress-bar" style="width: 0%;"></div>
                </div>
                <span class="audio-time">0:00 / 0:00</span>
                <button class="btn-audio-speed">1x</button>
              </div>
              <audio src="${article.metadata.audio}" preload="metadata"></audio>
            </div>
            `;
        }

        const cleanText = article.body.replace(/---[\s\S]*?---/, "").replace(/<[^>]+>/g, "");
        const wordsCount = cleanText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const readMinutes = Math.max(1, Math.ceil(wordsCount / 200));
        const readingTimeStr = `${readMinutes} min read`;

        const rawDate = article.metadata.created || "2026-09-14";
        let dateStringForIso = rawDate;
        if (rawDate instanceof Date) {
            dateStringForIso = rawDate.toISOString().split('T')[0];
        }
        const createdIso = `${dateStringForIso}T08:00:00-02:30`;
        const createdFormatted = this.formatDate(rawDate);

        const articleTags = article.metadata.tags || [];
        const tagsJson = articleTags.map(t => `"${t.replace(/"/g, '\'')}"`).join(", ");

        const articlePath = `/articles/${article.metadata.id}.html`;
        const canonicalUrl = `${config.site.url}${articlePath}`;

        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const newsletterSignup = await this.loadPartial("newsletter.html");

        const html = await this.wrapPage(

            this.renderer.render(template, {

                id: article.metadata.id,
                title: article.metadata.title,
                summary: article.metadata.summary,
                created: rawDate,
                created_formatted: createdFormatted,
                created_iso: createdIso,
                canonical_url: canonicalUrl,
                word_count: wordsCount,
                tags_json: tagsJson,
                author: "Jonathan Thoms",
                reading_time: readingTimeStr,
                body: bodyHtml,
                access: article.metadata.access,
                audio_player: audioPlayerHtml,
                newsletter_signup: newsletterSignup,
                topics: this.linksArray(article.links.topics),
                themes: this.linksArray(article.links.themes),
                related: this.linksArray(article.links.related),
                tags: this.tagsPills(article.metadata.tags),
                prev_article: article.metadata.prevArticle ? `<a href="/articles/${article.metadata.prevArticle.metadata.id}.html">← ${article.metadata.prevArticle.metadata.title}</a>` : "",
                next_article: article.metadata.nextArticle ? `<a href="/articles/${article.metadata.nextArticle.metadata.id}.html">${article.metadata.nextArticle.metadata.title} →</a>` : "",
                ad_sidebar: adSidebar,
                graph_html: `
        <section class="graph-container">
            <h2>Article Knowledge Connections</h2>
            <div id="graph-canvas" class="graph-canvas" data-focus-id="${article.metadata.id}"></div>
        </section>
                `

            }),

            article.metadata.title,
            {
                description: article.metadata.summary,
                path: `/articles/${article.metadata.id}.html`,
                ogType: "article",
                image: article.metadata.image
            }

        );

        await fs.writeFile(

            path.join(folder, `${article.metadata.id}.html`),

            html

        );

    }

    //--------------------------------------------------
    // Topic
    //--------------------------------------------------

    async buildTopic(topic, content) {

        const folder = path.join(this.output, "topics");

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("topic.html");

        const articleCards = content

            .filter(article =>
                article.metadata.topics?.includes(topic.metadata.id)
            )

            .map(article =>
                this.components.articleCard(article)
            )

            .join("\n");

        const html = await this.wrapPage(

            this.renderer.render(template, {

                id: topic.metadata.id,
                title: topic.metadata.title,
                summary: topic.metadata.summary,
                body: this.markdown(topic.body || ""),
                articles: articleCards,
                projects: "",
                related: ""

            }),

            topic.metadata.title,
            {
                description: topic.metadata.summary,
                path: `/topics/${topic.metadata.id}.html`,
                ogType: "website"
            }

        );

        await fs.writeFile(

            path.join(folder, `${topic.metadata.id}.html`),

            html

        );

    }

    //--------------------------------------------------
    // Project
    //--------------------------------------------------

    async buildProject(project) {

        const folder = path.join(this.output, "projects");

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("project.html");

        let projectImageHtml = "";
        if (project.metadata.image) {
            projectImageHtml = `
            <div style="margin: 2.5rem 0; text-align: center;">
              <img src="${project.metadata.image}" alt="Screenshot of ${project.metadata.title}" style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            </div>`;
        }

        let projectActionsHtml = "";
        if (project.metadata.github_url || project.metadata.demo_url) {
            projectActionsHtml += `<div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">`;
            if (project.metadata.github_url) {
                projectActionsHtml += `
                <a href="${project.metadata.github_url}" target="_blank" rel="noopener noreferrer" style="background: var(--bg-element); color: var(--text-main); padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;">
                  <span>💻</span> View on GitHub
                </a>`;
            }
            if (project.metadata.demo_url) {
                projectActionsHtml += `
                <a href="${project.metadata.demo_url}" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; border: none; display: flex; align-items: center; gap: 0.5rem; transition: opacity 0.2s;">
                  <span>🚀</span> Launch Live Demo
                </a>`;
            }
            projectActionsHtml += `</div>`;
        }

        const html = await this.wrapPage(

            this.renderer.render(template, {

                title: project.metadata.title,
                project_image_html: projectImageHtml,
                project_actions_html: projectActionsHtml,
                summary: project.metadata.summary,
                body: this.markdown(project.body),
                articles: "",
                software: ""

            }),

            project.metadata.title,
            {
                description: project.metadata.summary,
                path: `/projects/${project.metadata.id}.html`,
                ogType: "website",
                image: project.metadata.image
            }

        );

        await fs.writeFile(

            path.join(folder, `${project.metadata.id}.html`),

            html

        );

    }

    //--------------------------------------------------
    // Theme
    //--------------------------------------------------

    async buildTheme(theme, content) {

        const folder = path.join(this.output, "themes");

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("theme.html");

        const articleCards = content
            .filter(article => article.metadata.themes?.includes(theme.metadata.id))
            .map(article => this.components.articleCard(article))
            .join("\n");

        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: theme.metadata.id,
                title: theme.metadata.title,
                summary: theme.metadata.summary,
                body: this.markdown(theme.body || ""),
                articles: articleCards,
                topics: ""
            }),
            theme.metadata.title,
            {
                description: theme.metadata.summary,
                path: `/themes/${theme.metadata.id}.html`,
                ogType: "website"
            }
        );

        await fs.writeFile(
            path.join(folder, `${theme.metadata.id}.html`),
            html
        );

    }

    //--------------------------------------------------
    // Custom Collection Page
    //--------------------------------------------------

    async buildCustomCollection(col) {

        const folder = path.join(this.output, "collections");

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("collection.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: col.metadata.id,
                title: col.metadata.title,
                summary: col.metadata.summary,
                items: this.markdown(col.body)
            }),
            col.metadata.title,
            {
                description: col.metadata.summary,
                path: `/collections/${col.metadata.id}.html`,
                ogType: "website"
            }
        );

        await fs.writeFile(
            path.join(folder, `${col.metadata.id}.html`),
            html
        );

    }

    async buildTweet(tweet) {
        const folder = path.join(this.output, "tweets");
        await fs.mkdir(folder, { recursive: true });
        const template = await this.loadLayout("article.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: tweet.metadata.id,
                title: tweet.metadata.title,
                summary: tweet.metadata.summary,
                body: this.markdown(tweet.body),
                access: "public",
                topics: this.linksArray(tweet.links.topics),
                themes: this.linksArray(tweet.links.themes),
                related: this.linksArray(tweet.links.related),
                ad_sidebar: adSidebar,
                graph_html: `
        <section class="graph-container">
            <h2>Tweet Knowledge Connections</h2>
            <div id="graph-canvas" class="graph-canvas" data-focus-id="${tweet.metadata.id}"></div>
        </section>
                `
            }),
            tweet.metadata.title,
            {
                description: tweet.metadata.summary,
                path: `/tweets/${tweet.metadata.id}.html`,
                ogType: "article"
            }
        );
        await fs.writeFile(path.join(folder, `${tweet.metadata.id}.html`), html);
    }

    //--------------------------------------------------
    // Library Item
    //--------------------------------------------------

    async buildLibraryItem(item) {

        const folder = path.join(this.output, "library", this.getPlural(item.metadata.type));

        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("library-item.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: item.metadata.id,
                title: item.metadata.title,
                type: item.metadata.type,
                summary: item.metadata.summary,
                body: this.markdown(item.body),
                related: this.linksArray(item.links.related),
                tags: this.tagsPills(item.metadata.tags)
            }),
            item.metadata.title,
            {
                description: item.metadata.summary,
                path: `/library/${this.getPlural(item.metadata.type)}/${item.metadata.id}.html`,
                ogType: "website"
            }
        );

        await fs.writeFile(
            path.join(folder, `${item.metadata.id}.html`),
            html
        );

    }

    //--------------------------------------------------
    // Shit List Item
    //--------------------------------------------------

    async buildShitListItem(item) {

        const folder = path.join(this.output, "shit-list");
        await fs.mkdir(folder, { recursive: true });

        // Let's use the standard article template for these items, but we can customize the styling via the generated HTML
        const template = await this.loadLayout("article.html");

        // We wrap the body in a warning-themed container
        let contentHtml = this.markdown(item.body || "");
        if (item.metadata.access === "paid" || item.metadata.access === "members") {
            let teaser = "";
            const bodyStr = item.body || "";
            if (bodyStr.includes("<!-- more -->")) {
                teaser = bodyStr.split("<!-- more -->")[0];
            } else {
                const paragraphs = bodyStr.split("\n\n");
                teaser = paragraphs.slice(0, 1).join("\n\n") || paragraphs[0] || "";
            }
            
            contentHtml = `
            <div class="teaser-gradient" id="teaser-content">
              ${this.markdown(teaser)}
            </div>
            
            <div class="lock-screen" id="paywall-card" style="margin-top: 1rem; border: 1px solid #ff4444; background: rgba(26, 15, 15, 0.9);">
              <div class="paywall-badge" style="background: #ff4444; color: white;">🔒 Top Tier Only</div>
              <h3 style="color: #ff6b6b;">Gated Anti-Recommendation</h3>
              <p style="color: #ffaaaa; font-size: 0.9rem;">Please enter the Master Passcode to unlock the full reasons.</p>
              <div style="margin: 1rem 0;">
                <input type="password" id="passcode-input" placeholder="Passcode" style="border-color: #ff4444;" />
              </div>
              <button class="btn" style="width: 100%; justify-content: center; background: #ff4444; color: #111;" onclick="checkPasscode(this)">Unlock</button>
              <p id="auth-error" style="color: #ffaaaa; display: none; font-size: 0.8rem; margin-top: 0.5rem;">Incorrect Passcode</p>
                    <p style="font-size: 0.8rem; margin-top: 1rem; color: var(--text-dim);">
                        Don't have a token? <a href="/contact/" style="color: #fff; text-decoration: underline;">Contact to request access</a>.
                    </p>
            </div>
            
            <div class="gated-full-content premium-blur" id="gated-full-content" style="display:block;">
              ${this.markdown(bodyStr)}
            </div>
            `;
        }

        const customBodyHtml = `
            <div style="background: #1a0f0f; border-left: 4px solid #ff4444; padding: 2rem; border-radius: 8px; margin-top: 2rem;">
                <h3 style="color: #ff6b6b; margin-top: 0;">⚠️ SHIT LIST: ${item.metadata.title}</h3>
                <p style="color: #ffaaaa; font-style: italic; margin-bottom: 2rem;">
                    The following product, service, or organization is explicitly NOT recommended.
                </p>
                ${contentHtml}
            </div>
        `;

        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: item.metadata.id,
                title: item.metadata.title,
                summary: item.metadata.summary,
                body: customBodyHtml,
                created: item.metadata.created || new Date().toISOString().split('T')[0],
                author: item.metadata.author,
                tags: this.tagsPills(item.metadata.tags),
                content_type: "Anti-Recommendation",
                graph_html: ""
            }),
            item.metadata.title,
            {
                description: item.metadata.summary,
                path: `/shit-list/${item.metadata.id}.html`,
                ogType: "article"
            }
        );

        await fs.writeFile(
            path.join(folder, `${item.metadata.id}.html`),
            html
        );

    }

    //--------------------------------------------------
    // TV Show Item
    //--------------------------------------------------

    async buildTvShowItem(item) {

        const folder = path.join(this.output, "tv-shows");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("library-item.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {
                id: item.metadata.id,
                title: item.metadata.title,
                type: "tv-show",
                summary: item.metadata.summary,
                body: this.markdown(item.body || ""),
                related: this.linksArray(item.links.related),
                tags: this.tagsPills(item.metadata.tags)
            }),
            item.metadata.title,
            {
                description: item.metadata.summary,
                path: `/tv-shows/${item.metadata.id}.html`,
                ogType: "website"
            }
        );

        await fs.writeFile(
            path.join(folder, `${item.metadata.id}.html`),
            html
        );

    }



    async wrapPage(content, title, meta = {}) {

        const layout = await this.loadLayout("base.html");
        const header = await this.loadPartial("header.html");
        const footer = await this.loadPartial("footer.html");
        const google_adsense = await this.loadPartial("google-adsense.html");

        const siteTitle   = config.site.title;
        const siteUrl     = config.site.url;
        const siteDesc    = config.site.description;
        const siteAuthor  = config.site.author;
        const siteLanguage = config.site.language || "en";

        const pageTitle        = title || siteTitle;
        const fullPageTitle    = title && title !== siteTitle ? `${title} — ${siteTitle}` : siteTitle;
        const metaDescription  = meta.description || siteDesc;
        const ogTitle          = pageTitle;
        const ogType           = meta.ogType || "website";
        const pagePath         = meta.path || "/";
        const canonicalUrl     = `${siteUrl}${pagePath}`;
        const ogImage          = meta.image ? (meta.image.startsWith('http') ? meta.image : `${siteUrl}${meta.image.startsWith('/') ? '' : '/'}${meta.image}`) : `${siteUrl}/images/og-card.jpg`;

        return this.renderer.render(layout, {

            page_title:      fullPageTitle,
            site_title:      siteTitle,
            site_url:        siteUrl,
            site_author:     siteAuthor,
            lang:            siteLanguage,
            meta_description: metaDescription,
            og_title:        ogTitle,
            og_type:         ogType,
            og_image:        ogImage,
            canonical_url:   canonicalUrl,
            google_adsense:  google_adsense,
            header,
            footer,
            content

        });

    }

    //--------------------------------------------------
    // Start Page
    //--------------------------------------------------

    async buildStartPage() {

        const folder = path.join(this.output, "start");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("start.html");

        const html = await this.wrapPage(
            template,
            "Start Here",
            {
                description: "New to Thoms Foolery? Read the Project Atlas manifesto and explore early experiments in systems mapping.",
                path: "/start/",
                ogType: "website"
            }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);

    }

    //--------------------------------------------------
    // Uses Page
    //--------------------------------------------------

    async buildUsesPage() {

        const folder = path.join(this.output, "uses");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("uses.html");

        const html = await this.wrapPage(
            template,
            "What I Use | Thoms Foolery",
            {
                description: "A curated list of the hardware, software, and everyday carry that powers Thoms Foolery.",
                path: "/uses/",
                ogType: "website"
            }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);

    }

    //--------------------------------------------------
    // Date Helpers
    //--------------------------------------------------

    formatDate(dateVal) {
        if (!dateVal) return "";
        let d = dateVal;
        if (!(d instanceof Date)) {
            d = new Date(`${dateVal}T12:00:00Z`);
        }
        if (isNaN(d.getTime())) return String(dateVal);
        return d.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC"
        });
    }

    //--------------------------------------------------
    // File Helpers
    //--------------------------------------------------

    async loadLayout(file) {

        return fs.readFile(

            path.join(this.layouts, file),

            "utf8"

        );

    }

    async loadPartial(file) {

        return fs.readFile(

            path.join(this.partials, file),

            "utf8"

        );

    }

    //--------------------------------------------------
    // Rendering Helpers
    //--------------------------------------------------

    array(values = []) {

        if (!values.length) {

            return "<em>None</em>";

        }

        return values.join(", ");

    }

    linksArray(objects = []) {
        if (!objects || !objects.length) return "<em>None</em>";
        return objects.map(obj => {
            const url = this.router.getUrl(obj.metadata.type, obj.metadata.id);
            return `<a href="${url}" class="link-pill">${obj.metadata.title || obj.metadata.id}</a>`;
        }).join("");
    }

    tagsPills(tags = []) {
        if (!tags || !tags.length) {
            return "<em>None</em>";
        }
        return tags.map(tag => {
            const slug = String(tag).toLowerCase().trim().replace(/[^a-z0-9-_]+/g, "-");
            return `<a href="/tags/${slug}.html" class="tag-pill">#${tag}</a>`;
        }).join(" ");
    }

    markdown(text = "") {
        return parseMarkdown(text);
    }

}
