export default function topicTemplate(data) {

return `---
id: ${data.id}

title: ${data.title}

type: topic

status: active

summary: ${data.summary}

icon:

color:

related:

updated: ${data.date}
---

# ${data.title}

Describe this topic.

`;

}
