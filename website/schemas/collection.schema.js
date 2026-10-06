export default {

    type: "collection",

    required: [

        "id",
        "title",
        "type",
        "status",
        "summary"

    ],

    arrays: [

        "items",
        "topics",
        "themes",
        "tags"

    ],

    defaults: {}

};
