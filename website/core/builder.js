import Resolver from "./resolver.js";
import Router from "./router.js";

import SearchBuilder from "./search-builder.js";
import GraphBuilder from "./graph-builder.js";
import NavigationBuilder from "./navigation-builder.js";
import RecommendationBuilder from "./recommendation-builder.js";
import StatisticsBuilder from "./statistics-builder.js";
import SitemapBuilder from "./sitemap-builder.js";
import RSSBuilder from "./rss-builder.js";
import DatabaseBuilder from "./database-builder.js";
import PageBuilder from "./page-builder.js";
import IndexBuilder from "./index-builder.js";
import FeedBuilder from "./feed-builder.js";
import Exporter from "./exporter.js";
import LLMBuilder from "./llm-builder.js";

export default class Builder {

    constructor() {

        this.resolver = new Resolver();
        this.router = new Router();

        this.searchBuilder = new SearchBuilder();
        this.graphBuilder = new GraphBuilder();
        this.navigationBuilder = new NavigationBuilder();
        this.recommendationBuilder = new RecommendationBuilder();
        this.statisticsBuilder = new StatisticsBuilder();
        this.sitemapBuilder = new SitemapBuilder();
        this.rssBuilder = new RSSBuilder();
        this.databaseBuilder = new DatabaseBuilder();

        this.pageBuilder = new PageBuilder();
        this.indexBuilder = new IndexBuilder();
        this.feedBuilder = new FeedBuilder();
        this.llmBuilder = new LLMBuilder();

        this.exporter = new Exporter();

    }

    async build(content) {

        console.log("\n======================================");
        console.log(" Building Atlas");
        console.log("======================================");

        //--------------------------------------------------
        // Relationships
        //--------------------------------------------------

        const routed = this.router.build(content);
        const resolved = this.resolver.build(routed);
        console.log("✓ Relationships");

        //--------------------------------------------------
        // Routing
        //--------------------------------------------------

        console.log("✓ Routing");

        //--------------------------------------------------
        // Data Builders
        //--------------------------------------------------

        const search = this.searchBuilder.build(routed);
        console.log("✓ Search");

        const graph = this.graphBuilder.build(routed);
        console.log("✓ Graph");

        const navigation = this.navigationBuilder.build(routed);
        console.log("✓ Navigation");

        const recommendations =
            this.recommendationBuilder.build(routed);

        console.log("✓ Recommendations");

        const statistics =
            this.statisticsBuilder.build(routed);

        console.log("✓ Statistics");

        const sitemap =
            this.sitemapBuilder.build(routed);

        console.log("✓ Sitemap");

        const rss =
            this.rssBuilder.build(routed);

        console.log("✓ RSS");

        const database =
            this.databaseBuilder.build(routed);

        console.log("✓ Database");

        //--------------------------------------------------
        // Website Generation
        //--------------------------------------------------

        await this.pageBuilder.build(routed);
        console.log("✓ Pages");

        await this.indexBuilder.build(routed);
        await this.indexBuilder.buildLive(routed);
        console.log("✓ Index Pages");

        const feed =
            this.feedBuilder.build(routed);

        console.log("✓ Feed");

        //--------------------------------------------------
        // Export
        //--------------------------------------------------

        const llm = this.llmBuilder.build(routed);
        console.log("✓ LLM Exporter");

        await this.exporter.export({

            content: routed,

            search,
            graph,
            navigation,
            recommendations,
            statistics,
            sitemap,
            rss,
            database,
            feed,
            llm

        });

        console.log("✓ Export");

    }

}
