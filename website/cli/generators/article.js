export default function articleTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: article

status: draft

author: Jonathan Thoms

summary: ${data.summary}

topics:

themes:

series:

related:

tags:

featured: false

created: ${data.date}

updated: ${data.date}
---

Write your article here.

`;

}
