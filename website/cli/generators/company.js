export default function companyTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: company

status: active

summary: ${data.summary}

website:

location:

industry:

related:

updated: ${data.date}
---

`;

}
