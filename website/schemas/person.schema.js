export default {

    type: "person",

    required: [

        "id",
        "title",
        "type",
        "status",
        "summary"

    ],

    arrays: [

        "topics",
        "projects",
        "articles",
        "related",
        "tags"

    ],

    defaults: {}

};
