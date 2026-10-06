import PageTemplate from "./page-template.js";

export default function ProjectTemplate(project) {

return PageTemplate({

...project,

body: `

<h2>Status</h2>

<p>${project.metadata.status}</p>

${project.body}

`

});

}
