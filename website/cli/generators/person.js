export default function personTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: person

status: active

summary: ${data.summary}

website:

related:

updated: ${data.date}
---

`;

}
