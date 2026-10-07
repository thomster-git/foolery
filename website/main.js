import fs from "fs";
import path from "path";
import config from "./config/atlas.config.js";

import Loader from "./core/loader.js";
import Parser from "./core/parser.js";
import Normalizer from "./core/normalizer.js";
import Validator from "./core/validator.js";
import Resolver from "./core/resolver.js";
import Router from "./core/router.js";
import Builder from "./core/builder.js";

async function main() {

    console.log("\n======================================");
    console.log(" Project Atlas Build");
    console.log("======================================\n");

    const distPath = path.resolve(process.cwd(), "website/dist");
    if (fs.existsSync(distPath)) {
        console.log("Cleaning up old dist directory...");
        fs.rmSync(distPath, { recursive: true, force: true });
    }

    //--------------------------------------------------
    // Create pipeline
    //--------------------------------------------------

    const loader = new Loader();
    const parser = new Parser();
    const normalizer = new Normalizer();
    const validator = new Validator();
    const resolver = new Resolver();
    const builder = new Builder();

    //--------------------------------------------------
    // Load Markdown Files
    //--------------------------------------------------

    const rawFiles = await loader.loadContent();

    //--------------------------------------------------
    // Parse Front Matter
    //--------------------------------------------------

const parsedFilesRaw = parser.parse(rawFiles);

// Apply Release Phase Filter
const phaseHierarchy = { "teaser": 1, "batch1": 2, "batch2": 3, "full": 4 };
const currentPhaseIndex = phaseHierarchy[config.build.releasePhase || "full"] || 4;

const parsedFiles = parsedFilesRaw.filter(file => {
    // Treat files without a stage as "full" release (last phase)
    const filePhase = file.metadata?.stage || "full";
    const filePhaseIndex = phaseHierarchy[filePhase] || 4;
    return filePhaseIndex <= currentPhaseIndex;
});

console.log(`✓ Parsed ${parsedFilesRaw.length} content objects. Filtered down to ${parsedFiles.length} objects for phase: ${config.build.releasePhase}.`);

    //--------------------------------------------------
    // Normalize Metadata
    //--------------------------------------------------

    let normalizedContent = normalizer.normalize(parsedFiles);

    console.log(`✓ Normalized ${normalizedContent.length} objects.`);

    //--------------------------------------------------
    // Load External Data (Tweets)
    //--------------------------------------------------
    
    try {
        const fs = await import('fs/promises');
        const path = await import('path');
        const tweetsPath = path.resolve(process.cwd(), 'data/tweets.json');
        
        const tweetsData = await fs.readFile(tweetsPath, 'utf8');
        const tweets = JSON.parse(tweetsData);
        
        const validTweets = tweets.filter(t => t.text);
        const tweetObjects = validTweets.map(tweet => ({
            path: `tweet-${tweet.id}`,
            raw: tweet.text || "",
            body: tweet.text || "",
            metadata: {
                id: `tweet-${tweet.id}`,
                title: `Tweet from ${tweet.createdAt ? new Date(tweet.createdAt).toLocaleDateString() : 'Unknown'}`,
                type: 'tweet',
                summary: tweet.summary || (tweet.text ? tweet.text.slice(0, 100) : ""),
                tags: Array.isArray(tweet.tags) ? tweet.tags : [],
                topics: Array.isArray(tweet.topics) ? tweet.topics.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) : [],
                themes: Array.isArray(tweet.themes) ? tweet.themes.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) : [],
                related: Array.isArray(tweet.related) ? tweet.related.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) : [],
                series: Array.isArray(tweet.series) ? tweet.series.map(t => String(t).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")) : [],
                created: tweet.createdAt ? new Date(tweet.createdAt) : new Date(),
                updated: tweet.createdAt ? new Date(tweet.createdAt) : new Date(),
                external_url: tweet.url,
                status: 'published',
                access: 'public',
                author: 'Jonathan Thoms',
                favorites: tweet.favorites || 0,
                retweets: tweet.retweets || 0
            }
        }));

        normalizedContent = normalizedContent.concat(tweetObjects);
        console.log(`✓ Injected ${tweetObjects.length} external tweets.`);
    } catch (err) {
        console.log("No tweets.json found, skipping tweet integration.");
    }

    //--------------------------------------------------
    // Validate Content
    //--------------------------------------------------

    validator.validate(normalizedContent);

    console.log("✓ Validation passed.");

    //--------------------------------------------------
    // Route & Resolve Relationships
    //--------------------------------------------------

    const router = new Router();
    const routedContent = router.build(normalizedContent);
    const resolvedContent = resolver.resolve(routedContent);

    console.log("✓ Routing & relationships resolved.");

    //--------------------------------------------------
    // Build Atlas
    //--------------------------------------------------

    await builder.build(resolvedContent);

    console.log("\n======================================");
    console.log(" Atlas Build Complete");
    console.log("======================================\n");

}

main().catch(error => {

    console.error("\n======================================");
    console.error(" Atlas Build Failed");
    console.error("======================================\n");

    console.error(error);

    process.exit(1);

});
