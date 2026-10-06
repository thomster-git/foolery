# Search Architecture

> **Fast, zero-dependency client-side search engine.**

---

## Data Structure

Search indexing is generated during build time as `search.json`. Each entry contains pre-computed search tokens:

```json
{
  "id": "my-story-with-billy-talent",
  "title": "My Story With Billy Talent",
  "type": "article",
  "summary": "How Billy Talent shaped my taste in music...",
  "tokens": ["billy", "talent", "music", "identity", "nostalgia"],
  "url": "/articles/my-story-with-billy-talent.html"
}
```

---

## Query Execution

Client-side JavaScript (`atlas.js`) performs token matching over `search.json`, scoring matches based on title weight, summary matches, and exact tag alignment.
