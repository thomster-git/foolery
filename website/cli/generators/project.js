export default function projectTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: project

status: active

summary: ${data.summary}

topics:

themes:

articles:

tags:

repository:

website:

started: ${data.date}

updated: ${data.date}
---

# Overview

Describe the project.

`;

}
