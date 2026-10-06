export default {

    type: "project",

    required: [

        "id",
        "title",
        "type",
        "status",
        "summary"

    ],

    arrays: [

        "topics",
        "themes",
        "articles",
        "related",
        "tags"

    ],

    defaults: {

        featured: false

    }

};
