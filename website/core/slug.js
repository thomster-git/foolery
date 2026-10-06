export default class Slug {

    static make(text) {

        return text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");

    }

}
