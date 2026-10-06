import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../");
const archivePath = path.join(rootDir, "data/tweets.js");
const dbPath = path.join(rootDir, "data/tweets.json");
const USERNAME = "ThomsFoolery"; // Update if different

async function importArchive() {
    console.log("======================================");
    console.log(" Twitter Archive Importer");
    console.log("======================================");

    try {
        console.log(`Looking for Twitter archive at: ${archivePath}`);
        const fileContent = await fs.readFile(archivePath, "utf8");

        // The Twitter archive file starts with `window.YTD.tweet.part0 = `
        const jsonStart = fileContent.indexOf("[");
        if (jsonStart === -1) {
            throw new Error("Could not find JSON array in tweets.js");
        }

        const jsonString = fileContent.substring(jsonStart);
        const archiveData = JSON.parse(jsonString);
        console.log(`✓ Parsed ${archiveData.length} tweets from archive.`);

        // Load existing tweets if they exist
        let existingTweets = [];
        try {
            const existingData = await fs.readFile(dbPath, "utf8");
            existingTweets = JSON.parse(existingData);
        } catch (e) {
            console.log("No existing tweets.json found, creating a new database.");
        }

        const existingIds = new Set(existingTweets.map(t => t.id));
        let addedCount = 0;

        for (const item of archiveData) {
            const tweet = item.tweet;
            if (!tweet) continue;

            // Skip Retweets
            if (tweet.full_text && tweet.full_text.startsWith("RT @")) continue;

            // Skip Replies to other people (keep threads / self-replies if possible, but for simplicity skip all replies for now)
            if (tweet.in_reply_to_user_id_str && tweet.in_reply_to_user_id_str !== "31743265") {
                if (tweet.in_reply_to_status_id_str) continue; 
            }

            if (!existingIds.has(tweet.id_str)) {
                existingTweets.push({
                    id: tweet.id_str,
                    text: tweet.full_text,
                    url: `https://x.com/${USERNAME}/status/${tweet.id_str}`,
                    createdAt: new Date(tweet.created_at).toISOString(),
                    favorites: parseInt(tweet.favorite_count || 0),
                    retweets: parseInt(tweet.retweet_count || 0),
                    // Leave Gemini tags blank so the enricher picks them up
                    summary: null,
                    tags: [],
                    topics: [],
                    themes: []
                });
                addedCount++;
                existingIds.add(tweet.id_str);
            } else {
                // Update existing tweet with engagement stats
                const existing = existingTweets.find(t => t.id === tweet.id_str);
                if (existing) {
                    existing.favorites = parseInt(tweet.favorite_count || 0);
                    existing.retweets = parseInt(tweet.retweet_count || 0);
                }
            }
        }

        // Sort chronologically (newest first)
        existingTweets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        await fs.writeFile(dbPath, JSON.stringify(existingTweets, null, 2));

        console.log(`✓ Added ${addedCount} new tweets to data/tweets.json.`);
        console.log(`\nNext Step: Run 'npm run enrich-tweets' to let Gemini summarize and tag your new archive!`);
        
    } catch (err) {
        if (err.code === "ENOENT") {
            console.error("❌ Error: Could not find data/tweets.js.");
            console.error("Please download your Twitter Archive, extract it, and copy the 'tweets.js' file into the 'data' folder.");
        } else {
            console.error("❌ Error importing archive:", err);
        }
    }
}

importArchive();
