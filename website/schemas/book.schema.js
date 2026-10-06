export default {

    type: "book",

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
        "authors",
        "tags"

    ],

    defaults: {}

};
