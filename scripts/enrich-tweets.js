import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function enrichTweets() {
    // Load from .env
    try {
        const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
        for (const line of envContent.split('\n')) {
            if (line.startsWith('GEMINI_API_KEY=')) {
                process.env.GEMINI_API_KEY = line.split('=')[1].replace(/"/g, '').trim();
            }
        }
    } catch(e) {}

    const apiKey = process.env.GEMINI_API_KEY;
    const useAI = false; // Bypass AI due to rate limits and use massive dictionary

    const dataPath = path.join(__dirname, '../data/tweets.json');
    if (!fs.existsSync(dataPath)) {
        console.log("No tweets.json found to enrich.");
        return;
    }

    const tweets = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    const fallbackKeywords = {
        'cfi': 'career',
        'fluorspar': 'career',
        'mining': 'career',
        'job': 'career',
        'work': 'career',
        'quit': 'career',
        'resilience': 'resilience',
        'burnout': 'neurodiversity',
        'adhd': 'neurodiversity',
        'audhd': 'neurodiversity',
        'autism': 'neurodiversity',
        'neurodivergent': 'neurodiversity',
        '3d printing': '3d-printing',
        'prusa': '3d-printing',
        'ender': '3d-printing',
        'print': '3d-printing',
        'laser': 'laser-engraving',
        'xtool': 'laser-engraving',
        'engrave': 'laser-engraving',
        'engraving': 'laser-engraving',
        'buildinpublic': 'project-atlas',
        'project atlas': 'project-atlas',
        'code': 'technology',
        'software': 'technology',
        'tech': 'technology',
        'web': 'technology',
        'javascript': 'technology',
        'hockey': 'sports',
        'baseball': 'sports',
        'leafs': 'sports',
        'blue jays': 'sports',
        'game': 'sports'
    };

    let updated = 0;
    for (let tweet of tweets) {
        if (tweet.summary && tweet.tags && tweet.tags.length > 0 && tweet.topics && tweet.topics.length > 0) {
            continue; // Already fully enriched
        }

        if (!tweet.tags) tweet.tags = [];
        if (!tweet.topics) tweet.topics = [];
        
        if (useAI) {
            console.log(`Enriching tweet via Gemini AI: ${tweet.id}`);
            try {
                const prompt = `
You are a tagging assistant. Analyze this tweet: "${tweet.text}"
Return ONLY a JSON object with this exact format:
{
    "summary": "A 1-sentence summary of the tweet",
    "tags": ["array", "of", "relevant", "tags"],
    "topics": ["array", "of", "relevant", "topics"]
}
Limit tags and topics to 2-3 maximum. Keep topics broad (e.g. neurodiversity, technology, life) and tags specific.`;
                
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                
                const aiData = await res.json();
                console.log(`AI Response for ${tweet.id}:`, JSON.stringify(aiData).slice(0, 200));
                if (aiData.error) {
                    throw new Error(aiData.error.message);
                }
                if (aiData.candidates && aiData.candidates[0]) {
                    const textResp = aiData.candidates[0].content.parts[0].text;
                    const jsonStr = textResp.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(jsonStr);
                    
                    tweet.summary = parsed.summary || tweet.summary || tweet.text.slice(0, 50) + '...';
                    tweet.tags = [...new Set([...tweet.tags, ...(parsed.tags || [])])];
                    tweet.topics = [...new Set([...tweet.topics, ...(parsed.topics || [])])];
                    updated++;
                }
            } catch (e) {
                console.error(`AI Enrichment failed for ${tweet.id}:`, e.message);
                fallbackEnrich(tweet, fallbackKeywords);
                updated++;
            }
            // Sleep for 4 seconds to respect the 15 RPM rate limit
            await new Promise(resolve => setTimeout(resolve, 4000));
        } else {
            console.log(`Using keyword fallback for ${tweet.id}`);
            fallbackEnrich(tweet, fallbackKeywords);
            updated++;
        }
    }

    if (updated > 0) {
        fs.writeFileSync(dataPath, JSON.stringify(tweets, null, 2));
        console.log(`Enriched ${updated} tweets with new metadata.`);
    } else {
        console.log("All tweets are already enriched. No new metadata needed.");
    }
}

function fallbackEnrich(tweet, keywords) {
    if (!tweet.summary) tweet.summary = tweet.text.slice(0, 50) + '...';
    const textLower = tweet.text.toLowerCase();
    for (const [kw, topic] of Object.entries(keywords)) {
        if (textLower.includes(kw) && !tweet.topics.includes(topic)) {
            tweet.topics.push(topic);
        }
    }
}

enrichTweets();
