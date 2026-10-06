export default function toolTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: tool

status: active

summary: ${data.summary}

website:

price:

affiliate:

topics:

projects:

rating:

updated: ${data.date}
---

`;

}
