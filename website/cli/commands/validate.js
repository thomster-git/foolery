import Loader from "../../core/loader.js";
import Parser from "../../core/parser.js";
import Normalizer from "../../core/normalizer.js";
import Resolver from "../../core/resolver.js";
import Validator from "../../core/validator.js";

export default async function validateCommand() {

    const loader = new Loader();
    const parser = new Parser();
    const normalizer = new Normalizer();
    const resolver = new Resolver();
    const validator = new Validator();

    const raw = await loader.loadContent();

    const parsed = parser.parse(raw);

    const normalized = normalizer.normalize(parsed);

    const resolved = resolver.build(normalized);

    validator.validate(resolved);

    console.log("\n✔ Atlas validation passed.\n");

}
