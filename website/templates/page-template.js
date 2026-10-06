import Header from "./components/header.js";
import Footer from "./components/footer.js";

export default function PageTemplate(page) {

return `<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<title>${page.metadata.title}</title>

<meta
name="description"
content="${page.metadata.summary}"
>

</head>

<body>

${Header(page)}

<main>

<h1>${page.metadata.title}</h1>

<p>${page.metadata.summary}</p>

${page.body}

</main>

${Footer()}

</body>

</html>`;

}
