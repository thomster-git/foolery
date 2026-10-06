export default function themeTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: theme

status: active

summary: ${data.summary}

updated: ${data.date}
---

# ${data.title}

Describe this theme.

`;

}
