/**
 * ============================================================
 * Router
 * ============================================================
 *
 * Generates canonical URLs and breadcrumbs.
 */

export default class Router {

    getPlural(type) {
        if (type === "company") return "companies";
        if (["hardware", "software", "music", "documentation"].includes(type)) return type;
        return `${type}s`;
    }

    build(content) {

        return content.map(object => {

            const type =
                object.metadata.type || "unknown";

            const id =
                object.metadata.id ||
                "unknown";

            object.slug = id;

            object.url = this.getUrl(type, id);

            object.breadcrumbs = [

                {
                    title: "Home",
                    url: "/"
                },

                this.getBreadcrumbParent(type),

                {
                    title:
                        object.metadata.title || id,
                    url: object.url
                }

            ];

            return object;

        });

    }

    getUrl(type, id) {
        if (type === "shit-list") {
            return `/shit-list/${id}.html`;
        }
        if (type === "wishlist") {
            return `/wishlist/#${id}`;
        }
        if (type === "tv-show") {
            return `/tv-shows/${id}.html`;
        }
        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music", "tv-show"];
        if (libraryTypes.includes(type)) {
            return `/library/${this.getPlural(type)}/${id}.html`;
        }
        return `/${this.getPlural(type)}/${id}.html`;
    }

    getBreadcrumbParent(type) {
        const map = {
            "shit-list": { title: "The Shit List", url: "/shit-list/" },
            "wishlist":  { title: "Wishlist",       url: "/wishlist/" },
            "tv-show":   { title: "TV Shows",       url: "/tv-shows/" },
            "article":   { title: "Articles",       url: "/articles/" },
            "project":   { title: "Projects",       url: "/projects/" },
            "topic":     { title: "Topics",         url: "/topics/" },
            "theme":     { title: "Themes",         url: "/themes/" },
            "collection":{ title: "Collections",   url: "/collections/" },
            "tweet":     { title: "Tweets",         url: "/tweets/" },
        };
        if (map[type]) return map[type];
        const libraryTypes = ["book", "company", "course", "creator", "game", "hardware", "service", "software", "tool", "website", "documentation", "music"];
        if (libraryTypes.includes(type)) {
            return { title: "Library", url: "/library/" };
        }
        return { title: this.capitalize(this.getPlural(type)), url: `/${this.getPlural(type)}/` };
    }

    capitalize(text) {

        if (!text) return "";

        return text.charAt(0).toUpperCase()
            + text.slice(1);

    }

}
