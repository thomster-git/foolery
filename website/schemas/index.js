import article from "./article.schema.js";
import project from "./project.schema.js";
import topic from "./topic.schema.js";
import theme from "./theme.schema.js";
import collection from "./collection.schema.js";
import software from "./software.schema.js";
import person from "./person.schema.js";
import company from "./company.schema.js";
import book from "./book.schema.js";

const schemas = new Map();

[
    article,
    project,
    topic,
    theme,
    collection,
    software,
    person,
    company,
    book
].forEach(schema => {

    schemas.set(schema.type, schema);

});

export default schemas;
