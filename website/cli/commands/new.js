import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function newCommand(args) {

    const type = args[0] || "article";
    const title = args[1] || "Untitled Object";
    const isPaid = args.includes("--access") && args[args.indexOf("--access") + 1] === "paid";

    const id = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const folderMap = {
        article: "articles",
        topic: "topics",
        theme: "themes",
        project: "projects",
        collection: "collections",
        book: "library/books",
        tool: "library/tools",
        game: "library/games"
    };

    const targetFolder = folderMap[type.toLowerCase()] || "articles";
    const targetDir = path.resolve(__dirname, `../../../content/${targetFolder}`);
    const filePath = path.join(targetDir, `${id}.md`);

    await fs.mkdir(targetDir, { recursive: true });

    const today = new Date().toISOString().split("T")[0];

    const content = `---
id: ${id}
title: ${title}
type: ${type}
access: ${isPaid ? "paid" : "public"}
status: draft
author: Jonathan Thoms
summary: A brief summary of ${title}.
topics: []
themes: []
tags: []
created: ${today}
updated: ${today}
---

# ${title}

Write your content here...
`;

    await fs.writeFile(filePath, content, "utf8");

    console.log("\n======================================");
    console.log(" Created New Atlas Object");
    console.log("======================================");
    console.log(`✓ Type:    ${type}`);
    console.log(`✓ Title:   ${title}`);
    console.log(`✓ Access:  ${isPaid ? "paid" : "public"}`);
    console.log(`✓ File:    ${filePath}\n`);

}
