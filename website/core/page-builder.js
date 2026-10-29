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
        await this.buildInterestsPage();
        await this.buildHirePage();
        await this.buildFitnessPage();
        await this.build404Page();
        await this.buildSubscribedPage();
        await this.buildConfirmedPage();
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
        await this.buildPostseasonAnalyzer();
        await this.buildTwitterDb();
        await this.buildOcarinaPage();
        await this.buildTierList();
        await this.buildUmpireSimulator();
        await this.buildF1ChampionshipCalculator();
        await this.buildStreamSchedule();
        await this.buildSponsorsPage();
        await this.buildArticleRedirects();
        
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
            .filter(x => x.metadata.type === "article" && x.metadata.status !== "draft")
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
                newsletter: await this.loadPartial("newsletter.html"),
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
        await fs.writeFile(
            path.join(this.output, "tools", "twitter-db.html"),
            html
        );
    }

    // Ocarina Practice Tool
    async buildOcarinaPage() {
        const folder = path.join(this.output, "tools", "ocarina");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("ocarina.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");

        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "Ocarina Practice Tool",
            { description: "12-hole ocarina fingering chart, live pitch tuner, and Zelda songbook", path: "/tools/ocarina/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "ocarina.html"), html);

        // Dedicated direct URL aliases for each Ocarina tab (matching /tools/dragonwilds-profile/)
        const ocarinaTabs = [
            { slug: "chart", target: "/tools/ocarina/#chart", title: "Ocarina Fingering Chart" },
            { slug: "tuner", target: "/tools/ocarina/#tuner", title: "Ocarina Live Pitch Tuner" },
            { slug: "songs", target: "/tools/ocarina/#songs", title: "Ocarina Songbook" },
            { slug: "songbook", target: "/tools/ocarina/#songs", title: "Ocarina Songbook" },
            { slug: "oot", target: "/tools/ocarina/#oot", title: "Ocarina of Time Melodies" },
            { slug: "overlay", target: "/tools/ocarina/?popout=oot&bg=transparent", title: "OoT Melodies Stream Overlay" },
            { slug: "stream", target: "/tools/ocarina/?popout=oot&bg=transparent", title: "OoT Melodies Stream Overlay" }
        ];

        for (const tab of ocarinaTabs) {
            const targetPath = tab.target || `/tools/ocarina/${tab.hash}`;
            const redirectHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${tab.title} - Thoms Foolery</title><link rel="canonical" href="https://thomsfoolery.com${targetPath}"><meta http-equiv="refresh" content="0; url=${targetPath}"><script>window.location.replace('${targetPath}');</script></head><body><p>Redirecting to <a href="${targetPath}">${tab.title}</a>...</p></body></html>`;

            const aliasName = `ocarina-${tab.slug}`;
            const aliasFolder = path.join(this.output, "tools", aliasName);
            await fs.mkdir(aliasFolder, { recursive: true });
            await fs.writeFile(path.join(aliasFolder, "index.html"), redirectHtml);
            await fs.writeFile(path.join(this.output, "tools", `${aliasName}.html`), redirectHtml);

            const subFolder = path.join(folder, tab.slug);
            await fs.mkdir(subFolder, { recursive: true });
            await fs.writeFile(path.join(subFolder, "index.html"), redirectHtml);
            await fs.writeFile(path.join(folder, `${tab.slug}.html`), redirectHtml);
        }
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
        await fs.writeFile(path.join(this.output, "tools.html"), html);
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
        const cleanFolder = path.join(folder, "sports-betting");
        await fs.mkdir(cleanFolder, { recursive: true });
        await fs.writeFile(path.join(cleanFolder, "index.html"), html);
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
        const cleanFolder = path.join(folder, "blue-jays");
        await fs.mkdir(cleanFolder, { recursive: true });
        await fs.writeFile(path.join(cleanFolder, "index.html"), html);
    }

    // FFX Tracker
    async buildFFXTracker() {
        const folder = path.join(this.output, "tools", "ffx-tracker");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("ffx-tracker.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "FFX 100% Completion Tracker",
            { description: "Comprehensive checklist for Final Fantasy X", path: "/tools/ffx-tracker/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "ffx-tracker.html"), html);
    }

    // Dragonwilds Tracker
    async buildDragonwildsTracker() {
        const folder = path.join(this.output, "tools", "dragonwilds-tracker");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("dragonwilds-tracker.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "Runescape: Dragonwilds Guide",
            { description: "Interactive progression guide for Runescape: Dragonwilds", path: "/tools/dragonwilds-tracker/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "dragonwilds-tracker.html"), html);

        // Dedicated direct URL alias for the profile tool (/tools/dragonwilds-profile/)
        const profileFolder = path.join(this.output, "tools", "dragonwilds-profile");
        await fs.mkdir(profileFolder, { recursive: true });
        const redirectHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Dragonwilds Profile Generator - Thoms Foolery</title><link rel="canonical" href="https://thomsfoolery.com/tools/dragonwilds-tracker/#stats"><meta http-equiv="refresh" content="0; url=/tools/dragonwilds-tracker/#stats"><script>window.location.replace('/tools/dragonwilds-tracker/#stats');</script></head><body><p>Redirecting to <a href="/tools/dragonwilds-tracker/#stats">Dragonwilds Profile Generator</a>...</p></body></html>`;
        await fs.writeFile(path.join(profileFolder, "index.html"), redirectHtml);
        await fs.writeFile(path.join(this.output, "tools", "dragonwilds-profile.html"), redirectHtml);
    }

    // Tier List Creator
    async buildTierList() {
        const folder = path.join(this.output, "tools", "tier-list");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("tier-list.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "Tier List Creator",
            { description: "Interactive Tier List Creator with instant screenshot clipboard pasting, multi-image upload, and snapping drag-and-drop.", path: "/tools/tier-list/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "tier-list.html"), html);
    }

    // Umpire Simulator
    async buildUmpireSimulator() {
        const folder = path.join(this.output, "tools", "umpire-simulator");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("umpire-simulator.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "MLB Umpire Simulator",
            { description: "Interactive 3D baseball umpire simulator behind home plate with realistic pitch physics and Statcast pitch breakdown.", path: "/tools/umpire-simulator/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "umpire-simulator.html"), html);
    }

    // F1 Championship Calculator
    async buildF1ChampionshipCalculator() {
        const folder = path.join(this.output, "tools", "f1-championship-calculator");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("f1-championship-calculator.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "F1 Championship Clinch & Elimination Calculator",
            { description: "Mathematical elimination and championship clinch scenarios calculator for Formula 1 Drivers and Constructors.", path: "/tools/f1-championship-calculator/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "f1-championship-calculator.html"), html);
    }

    // Stream Schedule Calendar
    async buildStreamSchedule() {
        const folder = path.join(this.output, "tools", "stream-schedule");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("stream-schedule.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "Live Stream Schedule",
            { description: "Interactive broadcast schedule calendar for Jonathan Thoms with automatic Newfoundland time conversion and iCal export.", path: "/tools/stream-schedule/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "stream-schedule.html"), html);
    }

    // Consolidated Article Redirects
    async buildArticleRedirects() {
        const redirects = [
            {
                slug: "my-story-with-everything-is-connected",
                target: "/articles/manifesto.html",
                title: "Everything Is Connected: The Project Atlas Manifesto"
            }
        ];

        const articlesDir = path.join(this.output, "articles");
        await fs.mkdir(articlesDir, { recursive: true });

        for (const item of redirects) {
            const redirectHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${item.title} - Thoms Foolery</title><link rel="canonical" href="https://thomsfoolery.com${item.target}"><meta http-equiv="refresh" content="0; url=${item.target}"><script>window.location.replace('${item.target}');</script></head><body><p>Redirecting to <a href="${item.target}">${item.title}</a>...</p></body></html>`;
            
            // Output to /articles/[slug].html
            await fs.writeFile(path.join(articlesDir, `${item.slug}.html`), redirectHtml);
            
            // Output to /articles/[slug]/index.html
            const subFolder = path.join(articlesDir, item.slug);
            await fs.mkdir(subFolder, { recursive: true });
            await fs.writeFile(path.join(subFolder, "index.html"), redirectHtml);
        }
    }

    // NHL Trend Analyzer
    async buildNHLAnalyzer() {
        const folder = path.join(this.output, "tools", "nhl-trend-analyzer");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("nhl-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "NHL Trend Analyzer",
            { description: "NHL team performance and special teams efficiency tracker", path: "/tools/nhl-trend-analyzer/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "nhl-trend-analyzer.html"), html);
    }

    // NFL Trend Analyzer
    async buildNFLAnalyzer() {
        const folder = path.join(this.output, "tools", "nfl-trend-analyzer");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("nfl-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "NFL Trend Analyzer",
            { description: "NFL team performance trend analyzer", path: "/tools/nfl-trend-analyzer/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "nfl-trend-analyzer.html"), html);
    }

    // Baseball Trend Analyzer
    async buildBaseballTrendAnalyzer() {
        const folder = path.join(this.output, "tools", "baseball-trend-analyzer");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("baseball-trend-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "Baseball Trend Analyzer",
            { description: "MLB team performance trendline visualizer", path: "/tools/baseball-trend-analyzer/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "baseball-trend-analyzer.html"), html);
    }

    // MLB Postseason Analyzer
    async buildPostseasonAnalyzer() {
        const folder = path.join(this.output, "tools", "postseason-baseball-analyzer");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("postseason-baseball-analyzer.html");
        const adSidebar = await this.loadPartial("ad-sidebar.html");
        const suggestionsCta = await this.loadPartial("suggestions-cta.html");
        
        let html = await this.wrapPage(
            this.renderer.render(template, { ad_sidebar: adSidebar, "suggestions-cta": suggestionsCta }),
            "MLB Postseason Momentum Analyzer",
            { description: "Interactive MLB Postseason momentum trajectories, velocity swings, and team form analysis", path: "/tools/postseason-baseball-analyzer/", ogType: "website" }
        );

        await fs.writeFile(path.join(folder, "index.html"), html);
        await fs.writeFile(path.join(this.output, "tools", "postseason-baseball-analyzer.html"), html);
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
    // Buttondown Pages
    //--------------------------------------------------

    async buildSubscribedPage() {
        const folder = path.join(this.output, "subscribed");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("subscribed.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Check Your Inbox",
            { description: "Please confirm your subscription to the Thoms Foolery newsletter.", path: "/subscribed/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
    }

    async buildConfirmedPage() {
        const folder = path.join(this.output, "confirmed");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("confirmed.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Subscription Confirmed",
            { description: "You are officially subscribed to the Thoms Foolery newsletter.", path: "/confirmed/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
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
    // Interests & Obsessions Page
    //--------------------------------------------------

    async buildInterestsPage() {
        const folder = path.join(this.output, "interests");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("interests.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Interests & Obsessions - Jonathan Thoms",
            { description: "Jonathan Thoms - Broad interests, deep technical curiosities, and personal obsessions.", path: "/interests/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
        await fs.writeFile(
            path.join(this.output, "interests.html"),
            html
        );
    }

    //--------------------------------------------------
    // Hire / Work With Me Page
    //--------------------------------------------------

    async buildHirePage() {
        const folder = path.join(this.output, "hire");
        await fs.mkdir(folder, { recursive: true });

        const template = await this.loadLayout("hire.html");

        const html = await this.wrapPage(
            this.renderer.render(template, {}),
            "Work With Jonathan Thoms - Pragmatic Systems & Rapid Micro-Builds",
            { description: "Hire Jonathan Thoms for high-density 1-on-1 systems architecture reviews, 5-day custom web tool micro-builds, and autonomous community automation bots.", path: "/hire/", ogType: "website" }
        );

        await fs.writeFile(
            path.join(folder, "index.html"),
            html
        );
        await fs.writeFile(
            path.join(this.output, "hire.html"),
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

            const isAkira = article.metadata.id === "my-story-with-the-akira-ransomware-attack";
            const teaserDesc = isAkira 
              ? "The technical containment was only the beginning. This flagship investigative essay is unlocked for supporters who subscribe—featuring the untouched Datto lifeline, toxic owner remarks, stolen credit, the WiFi Pineapple and night-shift torrenting post-mortem, and the autistic burnout that followed."
              : "Support future independent technical journalism and unlock the full deep-dive essay.";
            const btnText = isAkira 
              ? "Unlock with Supporter Subscription" 
              : "Unlock with Supporter Pass";

            bodyHtml = `
            <div class="article-teaser-section">
              ${this.markdown(teaser)}
            </div>
            
            <div class="paywall-wrapper" style="position: relative; margin-top: 2rem;">
              <!-- Blurred Content Preview -->
              <div class="gated-full-content premium-blur" id="gated-full-content" style="max-height: 480px; overflow: hidden; position: relative; pointer-events: none; user-select: none; filter: blur(6px); opacity: 0.35;">
                ${fullBody}
                <div id="gated-fade-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; height: 260px; background: linear-gradient(to bottom, transparent, var(--bg-main)); pointer-events: none;"></div>
              </div>

              <!-- High-Conversion Glassmorphism Paywall Card -->
              <div class="lock-screen paywall-card-modern" id="paywall-card" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 92%; max-width: 500px; padding: 2.25rem; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(124, 58, 237, 0.4); box-shadow: 0 10px 40px rgba(0,0,0,0.7), 0 0 30px rgba(124, 58, 237, 0.2); border-radius: var(--radius-lg, 14px); text-align: center; backdrop-filter: blur(12px); z-index: 50;">
                <div class="paywall-badge" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; display: inline-flex; align-items: center; gap: 0.35rem; font-weight: 700; padding: 0.3rem 0.85rem; border-radius: 20px; font-size: 0.82rem; margin-bottom: 0.75rem;">
                  ✨ Supporter Exclusive
                </div>
                <h3 style="margin: 0.25rem 0 0.5rem; font-size: 1.45rem; color: var(--text-main); font-weight: 800;">Want to Read the Full Story?</h3>
                <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">
                  ${teaserDesc}
                </p>

                <!-- Lemon Squeezy Supporter Button -->
                <a href="https://thomsfoolery.lemonsqueezy.com/checkout/buy/00a8892a-289a-40dc-acab-1f6cb4a4428b?embed=1" class="btn btn-primary lemonsqueezy-button" id="lemon-supporter-btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; border: none; padding: 0.85rem 1.25rem; font-weight: 700; font-size: 1rem; border-radius: 8px; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.25); transition: opacity 0.2s;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                  <span>${btnText}</span>
                </a>

                <!-- Supporter Token / License Key Unlock -->
                <div style="display: flex; align-items: center; margin: 1.25rem 0 1rem; gap: 0.75rem;">
                  <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
                  <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-dim); font-weight: 600;">Already a member or have a pass?</span>
                  <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
                </div>

                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <input type="text" id="passcode-input" placeholder="Paste License Key or Supporter Token" autocomplete="off" spellcheck="false" style="flex: 1; margin: 0; padding: 0.65rem 0.85rem; background: var(--bg-main); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-main); font-size: 0.9rem;" />
                  <button class="btn" id="passcode-submit-btn" onclick="checkArticlePasscode()" style="padding: 0.65rem 1.1rem; font-weight: 600; white-space: nowrap; cursor: pointer;">Unlock</button>
                </div>
                <p id="auth-error" style="color: #ef4444; display: none; font-size: 0.82rem; margin: 0.4rem 0 0; text-align: left; line-height: 1.4;"></p>

                <p style="font-size: 0.8rem; margin-top: 1.25rem; color: var(--text-dim); text-align: center; line-height: 1.5;">
                  Subscribers receive a key via email. Peer, patron, or student? <a href="/contact/" style="color: var(--accent-cyan); text-decoration: underline;">Request a supporter token</a>.
                </p>
              </div>
            </div>

            <script>
            (function() {
              function getDeviceId() {
                let id = localStorage.getItem('atlas_device_id');
                if (!id) {
                  id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
                  localStorage.setItem('atlas_device_id', id);
                }
                const platform = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || 'Device';
                return 'Atlas Reader (' + platform + ' #' + id.slice(-4) + ')';
              }

              function validateOfflineToken(token) {
                if (!token) return false;
                const cleaned = token.trim();
                if (!cleaned.startsWith("Atlas-")) return false;
                try {
                  const b64 = cleaned.replace("Atlas-", "");
                  const obj = JSON.parse(atob(b64));
                  if (!obj.e || !obj.s) return false;
                  const SECRET = "AtlasPass2026";
                  const cyrb53 = (str, seed = 0) => {
                    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
                    for (let i = 0, ch; i < str.length; i++) {
                      ch = str.charCodeAt(i);
                      h1 = Math.imul(h1 ^ ch, 2654435761);
                      h2 = Math.imul(h2 ^ ch, 1597334677);
                    }
                    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
                    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
                    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
                    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
                    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
                  };
                  if (obj.s !== cyrb53(obj.e.toString() + SECRET).toString(16)) return false;
                  if (Date.now() > obj.e) return false;
                  return true;
                } catch(e) {
                  return false;
                }
              }

              function unlockContent() {
                const gated = document.getElementById('gated-full-content');
                const card = document.getElementById('paywall-card');
                const fade = document.getElementById('gated-fade-overlay');
                if (gated) {
                  gated.classList.remove('premium-blur');
                  gated.style.maxHeight = 'none';
                  gated.style.overflow = 'visible';
                  gated.style.filter = 'none';
                  gated.style.pointerEvents = 'auto';
                  gated.style.userSelect = 'auto';
                  gated.style.opacity = '1';
                }
                if (fade) fade.style.display = 'none';
                if (card) card.style.display = 'none';
              }

              function showError(msg) {
                const err = document.getElementById('auth-error');
                if (err) {
                  err.textContent = msg;
                  err.style.display = 'block';
                }
              }

              function clearError() {
                const err = document.getElementById('auth-error');
                if (err) err.style.display = 'none';
              }

              async function verifyLemonSqueezyLicense(key) {
                const instanceName = getDeviceId();
                const formData = new FormData();
                formData.append('license_key', key);
                formData.append('instance_name', instanceName);

                try {
                  const res = await fetch('https://api.lemonsqueezy.com/v1/licenses/activate', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                  });
                  const data = await res.json();

                  if (data.activated === true) {
                    const expiresAt = data.license_key && data.license_key.expires_at ? new Date(data.license_key.expires_at).getTime() : null;
                    const record = {
                      key: key,
                      instanceId: data.instance && data.instance.id,
                      expiresAt: expiresAt,
                      productName: data.meta && data.meta.product_name,
                      verifiedAt: Date.now()
                    };
                    localStorage.setItem('atlas_ls_license', JSON.stringify(record));
                    return { success: true };
                  } else {
                    // If activate failed because already activated on this instance, check validate
                    const stored = localStorage.getItem('atlas_ls_license');
                    let existingRecord = null;
                    try { existingRecord = stored ? JSON.parse(stored) : null; } catch(e){}

                    const valData = new FormData();
                    valData.append('license_key', key);
                    if (existingRecord && existingRecord.instanceId) {
                      valData.append('instance_id', existingRecord.instanceId);
                    }

                    const valRes = await fetch('https://api.lemonsqueezy.com/v1/licenses/validate', {
                      method: 'POST',
                      headers: { 'Accept': 'application/json' },
                      body: valData
                    });
                    const valJson = await valRes.json();
                    if (valJson.valid === true) {
                      const exp = valJson.license_key && valJson.license_key.expires_at ? new Date(valJson.license_key.expires_at).getTime() : null;
                      const updated = {
                        key: key,
                        instanceId: (existingRecord && existingRecord.instanceId) || (valJson.instance && valJson.instance.id),
                        expiresAt: exp,
                        productName: valJson.meta && valJson.meta.product_name,
                        verifiedAt: Date.now()
                      };
                      localStorage.setItem('atlas_ls_license', JSON.stringify(updated));
                      return { success: true };
                    }

                    return {
                      success: false,
                      error: data.error || valJson.error || 'Invalid or expired license key.'
                    };
                  }
                } catch(err) {
                  return {
                    success: false,
                    error: 'Unable to reach license verification server. Please check your connection.'
                  };
                }
              }

              window.checkArticlePasscode = async function() {
                const input = document.getElementById('passcode-input');
                const btn = document.getElementById('passcode-submit-btn');
                if (!input) return;
                clearError();
                const val = input.value.trim();
                if (!val) {
                  showError('Please enter your license key or supporter token.');
                  return;
                }

                // Check offline token format (Atlas-...)
                if (val.startsWith('Atlas-')) {
                  if (validateOfflineToken(val)) {
                    localStorage.setItem('atlas_unlocked_token', val);
                    unlockContent();
                  } else {
                    showError('Invalid or expired supporter token.');
                  }
                  return;
                }

                // Lemon Squeezy License Key validation
                const originalBtnText = btn ? btn.textContent : 'Unlock';
                if (btn) {
                  btn.textContent = 'Verifying...';
                  btn.disabled = true;
                }

                const result = await verifyLemonSqueezyLicense(val);
                if (btn) {
                  btn.textContent = originalBtnText;
                  btn.disabled = false;
                }

                if (result.success) {
                  unlockContent();
                } else {
                  showError(result.error);
                }
              };

              document.addEventListener('DOMContentLoaded', function() {
                // 1. Check offline Atlas token
                const storedAtlas = localStorage.getItem('atlas_unlocked_token');
                if (storedAtlas && validateOfflineToken(storedAtlas)) {
                  unlockContent();
                  return;
                }

                // 2. Check stored Lemon Squeezy license
                const storedLS = localStorage.getItem('atlas_ls_license');
                if (storedLS) {
                  try {
                    const record = JSON.parse(storedLS);
                    if (record && record.key) {
                      if (!record.expiresAt || Date.now() < record.expiresAt) {
                        unlockContent();
                        return;
                      } else {
                        // Expired 4-week pass: remove expired record
                        localStorage.removeItem('atlas_ls_license');
                      }
                    }
                  } catch(e) {}
                }

                // Attach Enter key handler
                const input = document.getElementById('passcode-input');
                if (input) {
                  input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') window.checkArticlePasscode();
                  });
                }
              });
            })();
            </script>
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

        const prevArticleHtml = article.metadata.prevArticle
            ? `<a href="/articles/${article.metadata.prevArticle.metadata.id}.html" class="article-nav-card prev-card">
                 <div class="nav-card-label">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                   <span>Previous Essay</span>
                 </div>
                 <div class="nav-card-title">${article.metadata.prevArticle.metadata.title}</div>
                 <div class="nav-card-date">${this.formatDate(article.metadata.prevArticle.metadata.created)}</div>
               </a>`
            : `<div class="article-nav-card empty-card">
                 <div class="nav-card-label text-muted">
                   <span>Archive Origin</span>
                 </div>
                 <div class="nav-card-title text-muted">You've reached the earliest article in this series.</div>
                 <a href="/articles/" class="nav-card-action">Browse All Articles →</a>
               </div>`;

        const nextArticleHtml = article.metadata.nextArticle
            ? `<a href="/articles/${article.metadata.nextArticle.metadata.id}.html" class="article-nav-card next-card">
                 <div class="nav-card-label">
                   <span>Next Essay</span>
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                 </div>
                 <div class="nav-card-title">${article.metadata.nextArticle.metadata.title}</div>
                 <div class="nav-card-date">${this.formatDate(article.metadata.nextArticle.metadata.created)}</div>
               </a>`
            : `<div class="article-nav-card empty-card latest-card">
                 <div class="nav-card-label accent-glow">
                   <span>✨ Latest Release</span>
                 </div>
                 <div class="nav-card-title">You're reading the latest publication!</div>
                 <a href="/articles/" class="nav-card-action">Explore Complete Archive →</a>
               </div>`;

        const graphHtml = `
        <div class="article-graph-section">
            <div class="article-graph-header">
                <div class="graph-title-group">
                    <span class="graph-icon">🕸️</span>
                    <span class="graph-title-text">Interactive Knowledge Map</span>
                </div>
                <span class="graph-hint-pill">Click &amp; drag nodes • Scroll to zoom</span>
            </div>
            <div id="graph-canvas" class="graph-canvas" data-focus-id="${article.metadata.id}"></div>
        </div>
        `;

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
                prev_article: prevArticleHtml,
                next_article: nextArticleHtml,
                ad_sidebar: adSidebar,
                graph_html: graphHtml

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
                article.metadata.status !== "draft" &&
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
              <img src="${project.metadata.image}" alt="Screenshot of ${project.metadata.title}" fetchpriority="high" style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
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
                related: this.linksArray(project.links?.related || [])

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
            .filter(article => article.metadata.status !== "draft" && article.metadata.themes?.includes(theme.metadata.id))
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
