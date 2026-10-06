export default function websiteTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: website

status: active

summary: ${data.summary}

url:

tags:

updated: ${data.date}
---

`;

}
