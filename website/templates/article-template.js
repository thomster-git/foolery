import PageTemplate from "./page-template.js";

export default function ArticleTemplate(article) {

return PageTemplate({

...article,

body: `

<p>

<strong>Author:</strong>

${article.metadata.author ?? "Unknown"}

</p>

${article.body}

`

});

}
