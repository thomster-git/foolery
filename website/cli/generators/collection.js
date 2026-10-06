export default function collectionTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: collection

status: active

summary: ${data.summary}

updated: ${data.date}
---

# ${data.title}

Describe this collection.

`;

}
