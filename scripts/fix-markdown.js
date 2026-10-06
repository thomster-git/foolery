import fs from "fs/promises";
import path from "path";

const contentDir = "/home/keel/Project-Atlas-main/content/articles";

async function fixMarkdown() {
    const files = await fs.readdir(contentDir);

    for (const file of files) {
        if (!file.endsWith(".md")) continue;
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, "utf8");

        const lines = content.split("\n");
        let frontmatter = false;
        let bodyStart = -1;
        let modified = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === "---") {
                if (!frontmatter) {
                    frontmatter = true;
                } else {
                    frontmatter = false;
                    bodyStart = i + 1;
                }
                continue;
            }

            if (frontmatter) {
                if (line.startsWith("title:")) {
                    let titleVal = line.substring(6).trim();
                    if (titleVal.startsWith('"') && titleVal.endsWith('"')) {
                        titleVal = titleVal.substring(1, titleVal.length - 1);
                        lines[i] = `title: ${titleVal}`;
                        modified = true;
                        console.log(`[Fix] Stripped quotes from title in ${file}`);
                    } else if (titleVal.startsWith("'") && titleVal.endsWith("'")) {
                        titleVal = titleVal.substring(1, titleVal.length - 1);
                        lines[i] = `title: ${titleVal}`;
                        modified = true;
                        console.log(`[Fix] Stripped quotes from title in ${file}`);
                    }
                }
            } else if (bodyStart !== -1 && i >= bodyStart) {
                if (line.startsWith("# ")) {
                    // Remove this line
                    lines.splice(i, 1);
                    modified = true;
                    console.log(`[Fix] Removed H1 tag from body in ${file}`);
                    
                    // If the next line is blank, remove it too for clean formatting
                    if (lines[i] && lines[i].trim() === "") {
                        lines.splice(i, 1);
                    }
                    
                    break; // Only remove the first H1
                }
            }
        }

        if (modified) {
            await fs.writeFile(filePath, lines.join("\n"));
        }
    }
    console.log("Done fixing markdown files.");
}

fixMarkdown();
