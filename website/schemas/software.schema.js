export default {

    type: "software",

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
        "projects",
        "articles",
        "alternatives",
        "recommended_for",
        "tags"

    ],

    defaults: {}

};
