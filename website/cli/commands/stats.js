import Loader from "../../core/loader.js";
import Parser from "../../core/parser.js";
import Normalizer from "../../core/normalizer.js";

export default async function statsCommand() {

    const loader = new Loader();
    const parser = new Parser();
    const normalizer = new Normalizer();

    const raw = await loader.loadContent();
    const parsed = parser.parse(raw);
    const content = normalizer.normalize(parsed);

    const byType = {};

    for (const object of content) {

        const type = object.metadata.type ?? "unknown";

        byType[type] ??= 0;

        byType[type]++;

    }

    console.log("\n======================================");
    console.log(" Atlas Statistics");
    console.log("======================================\n");

    console.log(`Total Objects : ${content.length}\n`);

    Object.entries(byType)
        .sort()
        .forEach(([type, count]) => {

            console.log(type.padEnd(20) + count);

        });

    console.log();

}
