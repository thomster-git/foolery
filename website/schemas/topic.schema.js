export default {

    type: "topic",

    required: [

        "id",
        "title",
        "type",
        "status",
        "summary"

    ],

    arrays: [

        "related"

    ],

    defaults: {}

};
