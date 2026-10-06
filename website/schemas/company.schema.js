export default {

    type: "company",

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
        "tags"

    ],

    defaults: {}

};
