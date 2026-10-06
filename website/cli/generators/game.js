export default function gameTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: game

status: active

summary: ${data.summary}

developer:

publisher:

platforms:

rating:

updated: ${data.date}
---

`;

}
