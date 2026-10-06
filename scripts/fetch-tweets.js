import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchTweets() {
    // Load from .env if possible (very basic parser since we don't have dotenv)
    try {
        const envContent = await fs.readFile(path.join(__dirname, '../.env'), 'utf-8');
        for (const line of envContent.split('\n')) {
            if (line.startsWith('TWITTER_BEARER_TOKEN=')) {
                process.env.TWITTER_BEARER_TOKEN = line.split('=')[1].replace(/"/g, '').trim();
            }
        }
    } catch(e) {}

    const bearerToken = process.env.TWITTER_BEARER_TOKEN;
    if (!bearerToken || bearerToken === 'your_twitter_bearer_token_here') {
        console.error("No valid TWITTER_BEARER_TOKEN found. Please configure it in .env. Skipping API fetch.");
        return;
    }

    console.log("Fetching tweets using Twitter API...");
    try {
        // Step 1: Get User ID for @ThomsFoolery
        const username = 'ThomsFoolery';
        const userRes = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
        });
        const userData = await userRes.json();
        
        if (!userData || !userData.data) {
            throw new Error(`Could not find user ${username}: ${JSON.stringify(userData)}`);
        }
        const userId = userData.data.id;

        // Step 2: Fetch recent tweets
        const tweetsRes = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,text&max_results=10`, {
            headers: { 'Authorization': `Bearer ${bearerToken}` }
        });
        const tweetsData = await tweetsRes.json();

        if (!tweetsData || !tweetsData.data) {
            throw new Error(`Failed to fetch tweets: ${JSON.stringify(tweetsData)}`);
        }

        // Step 3: Format and save
        const formattedTweets = tweetsData.data.map(t => ({
            id: t.id,
            text: t.text,
            createdAt: t.created_at,
            url: `https://x.com/${username}/status/${t.id}`,
            tags: [],
            topics: [],
            summary: ""
        }));

        const outPath = path.join(__dirname, '../data/tweets.json');
        
        // Merge with existing so we don't overwrite tags/summaries already done
        let existing = [];
        try {
            existing = JSON.parse(await fs.readFile(outPath, 'utf-8'));
        } catch(e) {}
        
        const existingMap = new Map(existing.map(e => [e.id, e]));
        formattedTweets.forEach(t => {
            if (!existingMap.has(t.id)) {
                existingMap.set(t.id, t);
            }
        });

        await fs.writeFile(outPath, JSON.stringify(Array.from(existingMap.values()), null, 2));
        console.log(`Successfully fetched and merged tweets. Total stored: ${existingMap.size}`);

    } catch (e) {
        console.error("Failed to fetch tweets:", e);
    }
}

fetchTweets();
