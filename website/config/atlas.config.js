/**
 * ============================================================
 * Project Atlas Configuration
 * ============================================================
 */

export default {

    site: {

        title: "Thoms Foolery",

        subtitle: "Everything is Connected.",

        description:
            "A personal knowledge base exploring technology, creativity, engineering, autism, gaming, projects and curiosity.",

        url: "https://thomsfoolery.com",

        language: "en",

        author: "Jonathan Thoms"

    },

    build: {

        // Controls which content is compiled to the public site based on frontmatter stage
        releasePhase: "teaser",

        output: "./dist",

        prettyUrls: true,

        generateRSS: true,

        generateSearch: true,

        generateSitemap: true

    },

    search: {

        minimumWordLength: 3,

        removeStopWords: true

    }

};
