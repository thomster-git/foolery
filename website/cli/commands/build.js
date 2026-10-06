import Loader from "../../core/loader.js";
import Parser from "../../core/parser.js";
import Normalizer from "../../core/normalizer.js";
import Resolver from "../../core/resolver.js";
import Validator from "../../core/validator.js";
import Builder from "../../core/builder.js";

export default async function buildCommand() {

    console.log("\n======================================");
    console.log(" Project Atlas Build");
    console.log("======================================\n");

    const loader = new Loader();
    const parser = new Parser();
    const normalizer = new Normalizer();
    const resolver = new Resolver();
    const validator = new Validator();
    const builder = new Builder();

    //--------------------------------------------------
    // Load
    //--------------------------------------------------

    const rawFiles = await loader.loadContent();

    console.log(`✓ Loaded ${rawFiles.length} markdown files.`);

    //--------------------------------------------------
    // Parse
    //--------------------------------------------------

    const parsed = parser.parse(rawFiles);

    console.log(`✓ Parsed ${parsed.length} objects.`);

    //--------------------------------------------------
    // Normalize
    //--------------------------------------------------

    const normalized = normalizer.normalize(parsed);

    console.log(`✓ Normalized ${normalized.length} objects.`);

    //--------------------------------------------------
    // Resolve
    //--------------------------------------------------

    const routed = router.build(normalized);
    const resolved = resolver.build(routed);

    console.log(`✓ Linked ${resolved.length} objects.`);

    //--------------------------------------------------
    // Validate
    //--------------------------------------------------

    validator.validate(resolved);

    console.log("✓ Validation passed.");

    //--------------------------------------------------
    // Build
    //--------------------------------------------------

    await builder.build(resolved);

    console.log("\n✔ Build complete.\n");

}
