import Loader from "../website/core/loader.js";
import Parser from "../website/core/parser.js";

async function main() {
    const loader = new Loader();
    const parser = new Parser();
    const rawFiles = await loader.loadContent();
    const parsedFiles = parser.parse(rawFiles);
    
    for (const f of parsedFiles) {
        if (f.path.includes("from-rocks")) {
            console.log(f);
        }
    }
}
main().catch(console.error);
