import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../../");
const contentDir = path.join(rootDir, "content");
const distDir = path.join(rootDir, "website/dist");
const adminDir = path.join(rootDir, "website/admin");

const PORT = process.env.PORT || 3001;

// Load .env if present
try {
    const envContent = await fs.readFile(path.join(rootDir, ".env"), "utf8");
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^#\s=]+)="(.*)"$/);
        if (match) process.env[match[1]] = match[2];
    });
} catch(e) {}


const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml"
};

async function getAllMarkdownFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getAllMarkdownFiles(fullPath));
        } else if (entry.name.endsWith(".md") && entry.name !== "README.md") {
            files.push(fullPath);
        }
    }
    return files;
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    // CORS Headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // REST API Endpoints
    if (pathname === "/api/files" && req.method === "GET") {
        try {
            const filePaths = await getAllMarkdownFiles(contentDir);
            const filesData = filePaths.map(p => ({
                fullPath: p,
                relPath: path.relative(contentDir, p),
                name: path.basename(p)
            }));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", files: filesData }));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: err.message }));
        }
        return;
    }

    if (pathname === "/api/file" && req.method === "GET") {
        const relPath = url.searchParams.get("path");
        if (!relPath) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: "Missing path parameter" }));
            return;
        }
        try {
            const targetPath = path.resolve(contentDir, relPath);
            if (!targetPath.startsWith(contentDir)) {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: "Forbidden path" }));
                return;
            }
            const content = await fs.readFile(targetPath, "utf8");
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", path: relPath, content }));
        } catch (err) {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: "File not found" }));
        }
        return;
    }

    if (pathname === "/api/save" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const data = JSON.parse(body);
                const { relPath, content } = data;
                if (!relPath || !content) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "Missing relPath or content" }));
                    return;
                }
                const targetPath = path.resolve(contentDir, relPath);
                if (!targetPath.startsWith(contentDir)) {
                    res.writeHead(403, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "Forbidden path" }));
                    return;
                }

                await fs.mkdir(path.dirname(targetPath), { recursive: true });
                await fs.writeFile(targetPath, content, "utf8");

                // Trigger Atlas build pipeline
                const { stdout } = await execAsync("npm run build", { cwd: rootDir });

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", message: "File saved and site rebuilt successfully!", output: stdout }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            }
        });
        return;
    }

    if (pathname === "/api/add-tweets" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const newTweets = JSON.parse(body);
                if (!Array.isArray(newTweets)) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "Payload must be an array of tweets" }));
                    return;
                }
                const tweetsPath = path.resolve(rootDir, "data/tweets.json");
                let existingTweets = [];
                try {
                    const content = await fs.readFile(tweetsPath, "utf8");
                    existingTweets = JSON.parse(content);
                } catch (e) {
                    existingTweets = [];
                }
                
                // Merge and remove duplicates
                const existingMap = new Map(existingTweets.map(t => [t.id, t]));
                newTweets.forEach(t => existingMap.set(t.id, t));
                const updatedTweets = Array.from(existingMap.values()).sort((a, b) => new Date(b.added || b.createdAt || 0) - new Date(a.added || a.createdAt || 0));

                await fs.writeFile(tweetsPath, JSON.stringify(updatedTweets, null, 2), "utf8");

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", message: `Successfully added ${newTweets.length} tweets!` }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            }
        });
        return;
    }

    if (pathname === "/api/build" && req.method === "POST") {
        try {
            const { stdout } = await execAsync("npm run build", { cwd: rootDir });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok", output: stdout }));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", message: err.message }));
        }
        return;
    }

    if (pathname === "/api/parse-tape" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const { imageBase64, mimeType } = JSON.parse(body);
                if (!imageBase64) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "Missing imageBase64" }));
                    return;
                }

                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "GEMINI_API_KEY not configured" }));
                    return;
                }

                const payload = {
                    contents: [{
                        parts: [
                            { text: "Extract the numeric measurement reading from this tape measure in inches. Return ONLY the numeric value." },
                            { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }
                        ]
                    }]
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
                text = text.trim();
                const numMatches = text.match(/\d+(\.\d+)?/);
                const value = numMatches ? numMatches[0] : "";
                
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", value }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            }
        });
        return;
    }

    if (pathname === "/api/parse-nutrition-label" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const { imageBase64, mimeType } = JSON.parse(body);
                if (!imageBase64) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "Missing imageBase64" }));
                    return;
                }

                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ status: "error", message: "GEMINI_API_KEY not configured" }));
                    return;
                }

                const payload = {
                    contents: [{
                        parts: [
                            { text: "Extract the nutritional information from this nutrition label. Return a JSON object ONLY with the following numeric keys (use 0 if missing): calories, protein (in g), fat (in g), carbs (in g), servingSize (just the number), servingUnit (e.g. 'g', 'ml', 'each'). Do NOT use markdown code blocks, just raw JSON." },
                            { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }
                        ]
                    }]
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);
                
                let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
                text = text.replace(/```json/g, "").replace(/```/g, "").trim();
                
                let parsed = {};
                try {
                    parsed = JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse Gemini JSON:", text);
                }
                
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", data: parsed }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            }
        });
        return;
    }

    if (pathname === "/api/sync-fitness" && req.method === "POST") {
        let body = "";
        req.on("data", chunk => body += chunk.toString());
        req.on("end", async () => {
            try {
                const newLog = JSON.parse(body);
                const dataPath = path.join(rootDir, "website/static/data/fitness-history.json");
                
                let history = [];
                try {
                    const content = await fs.readFile(dataPath, "utf8");
                    history = JSON.parse(content);
                } catch(e) {}

                // Merge or add new log based on date
                const existingIdx = history.findIndex(l => l.date === newLog.date);
                if (existingIdx >= 0) {
                    history[existingIdx] = newLog;
                } else {
                    history.push(newLog);
                }
                
                // Sort by date ascending
                history.sort((a, b) => new Date(a.date) - new Date(b.date));

                await fs.writeFile(dataPath, JSON.stringify(history, null, 2), "utf8");

                // Trigger site rebuild
                const { stdout } = await execAsync("npm run build", { cwd: rootDir });

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", message: "Saved and rebuilt successfully", output: stdout }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "error", message: err.message }));
            }
        });
        return;
    }

    // Serve Static Admin UI or Static Dist Files
    let filePath = "";
    if (pathname.startsWith("/admin")) {
        let reqFile = pathname.replace("/admin", "");
        if (reqFile === "" || reqFile === "/") reqFile = "/index.html";
        filePath = path.join(adminDir, reqFile);
    } else {
        filePath = path.join(distDir, pathname === "/" ? "/index.html" : pathname);
    }

    try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) filePath = path.join(filePath, "index.html");

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const content = await fs.readFile(filePath);

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
    } catch (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Not Found</h1><p>Project Atlas Admin Server</p>");
    }
});

server.listen(PORT, () => {
    console.log(`
======================================
 Project Atlas Admin & Writing Studio
======================================
  ✓ Admin UI:    http://localhost:${PORT}/admin/
  ✓ Preview UI:  http://localhost:${PORT}/
  ✓ REST API:    http://localhost:${PORT}/api/files
======================================
`);
});
