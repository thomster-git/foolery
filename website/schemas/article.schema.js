export default {

    type: "article",

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
        "related",
        "tags",
        "series"

    ],

    defaults: {

        featured: false,
        author: "Jonathan Thoms"

    }

};
