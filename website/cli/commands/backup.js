import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function backupCommand(args) {

    console.log(`
======================================
 Project Atlas Content Backup Utility
======================================
`);

    const contentDir = path.resolve(__dirname, "../../../content");
    const backupsDir = path.resolve(__dirname, "../../../backups");

    await fs.mkdir(backupsDir, { recursive: true });

    const files = await getAllFiles(contentDir);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupsDir, `atlas-backup-${timestamp}.json`);

    const backupData = {
        created_at: new Date().toISOString(),
        total_files: files.length,
        files: []
    };

    for (const filePath of files) {
        const relativePath = path.relative(contentDir, filePath);
        const content = await fs.readFile(filePath, "utf8");
        backupData.files.push({
            path: relativePath,
            content: content
        });
    }

    await fs.writeFile(backupFile, JSON.stringify(backupData, null, 2), "utf8");

    console.log(`✓ Successfully backed up ${files.length} markdown content files!`);
    console.log(`  Backup location: ${backupFile}\n`);

}

async function getAllFiles(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files = files.concat(await getAllFiles(fullPath));
        } else if (entry.name.endsWith(".md")) {
            files.push(fullPath);
        }
    }
    return files;
}
