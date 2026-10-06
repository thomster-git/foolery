export default function bookTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: book

status: active

summary: ${data.summary}

author:

isbn:

rating:

topics:

themes:

updated: ${data.date}
---

`;

}
