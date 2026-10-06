# 04 - Routing

> **Defining how knowledge becomes navigable throughout Atlas.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Active Design |
| **Milestone** | Milestone 4 – Atlas Core |
| **Last Updated** | July 2026 |

---

# Purpose

The Routing system is responsible for transforming Atlas knowledge into a predictable, discoverable website.

Rather than manually defining pages, Atlas Core generates routes automatically from structured content.

Every published knowledge object should have a stable, human-readable URL.

Routing exists to support exploration, not merely navigation.

---

# Philosophy

URLs are part of the user experience.

A visitor should be able to understand where they are simply by looking at the address bar.

Routes should be:

- Predictable
- Human-readable
- Stable
- Descriptive
- Independent of implementation

A route should never expose how Atlas is built internally.

Instead, it should describe the knowledge being viewed.

---

# Routing Principles

Atlas follows several guiding principles.

1. One canonical URL per knowledge object.
2. URLs should be generated automatically.
3. Slugs should remain stable whenever possible.
4. Content determines routes, not page templates.
5. Routes should reflect knowledge, not file structure.
6. Every route should support exploration.

---

# Route Generation

Atlas Core generates every public route from metadata.

Example:

```yaml
title: My Story With Billy Talent

slug: my-story-with-billy-talent

type: article
```

Automatically becomes:

```text
/articles/my-story-with-billy-talent/
```

Developers should never manually create URLs for individual content.

---

# Route Hierarchy

Atlas organizes knowledge into top-level route collections.

```text
/

├── articles/
├── projects/
├── topics/
├── themes/
├── collections/
├── library/
├── galleries/
├── search/
├── about/
└── explore/
```

Additional sections may be introduced over time without affecting existing routes.

---

# Canonical Route Patterns

## Homepage

```text
/
```

The interactive entry point into Atlas.

---

## Explore

```text
/explore/
```

Discovery-focused browsing.

Supports multiple filtering methods.

---

## Articles

```text
/articles/{slug}/
```

Example:

```text
/articles/my-story-with-billy-talent/
```

---

## Projects

```text
/projects/{slug}/
```

Example:

```text
/projects/project-atlas/
```

---

## Topics

```text
/topics/{slug}/
```

Example:

```text
/topics/music/
```

---

## Themes

```text
/themes/{slug}/
```

Example:

```text
/themes/curiosity/
```

---

## Collections

```text
/collections/{slug}/
```

Example:

```text
/collections/favourite-games/
```

---

## Library

Library entries are grouped by category.

```text
/library/software/proxmox-ve/

/library/books/atomic-habits/

/library/hardware/logitech-mx-master/

/library/websites/wikipedia/
```

Grouping improves organization while keeping URLs intuitive.

---

## Galleries

```text
/galleries/{slug}/
```

---

## Search

```text
/search/
```

Search results are generated dynamically.

---

# Slugs

Every published object requires a unique slug.

Slug rules:

- Lowercase
- Hyphen-separated
- ASCII characters where practical
- No dates
- No file extensions
- No unnecessary words

Example:

Good

```text
my-story-with-billy-talent
```

Bad

```text
BillyTalentArticleFinalV3
```

---

# Canonical URLs

Every knowledge object should have exactly one canonical URL.

Example:

Correct

```text
/articles/my-story-with-billy-talent/
```

Avoid

```text
/blog/music/billy-talent/
```

or

```text
/posts/123/
```

Canonical URLs improve maintainability and search indexing.

---

# Navigation

Routes should support multiple forms of exploration.

Visitors may navigate through:

- Main navigation
- Topics
- Themes
- Related content
- Search
- Collections
- Recommendations
- Library references
- Breadcrumbs

Navigation should encourage curiosity rather than funnel visitors toward a single destination.

---

# Breadcrumbs

Every route should generate breadcrumbs automatically.

Example:

```text
Home

↓

Articles

↓

My Story With Billy Talent
```

Or

```text
Home

↓

Library

↓

Software

↓

Proxmox VE
```

Breadcrumbs should reflect the visitor's current location within Atlas.

---

# URL Stability

Published URLs should remain stable.

If a slug changes:

- Redirects should be generated automatically.
- Existing links should continue functioning.
- Search indexes should update automatically.

Atlas should prioritize permanence.

---

# Reserved Routes

Certain routes are reserved for Atlas itself.

```text
/

about/

explore/

search/

404/

feed/

sitemap.xml

robots.txt
```

Content may never generate these routes.

---

# Future Routing

Future versions of Atlas may introduce:

```text
/series/

/people/

/places/

/timelines/

/maps/

/learning/

/random/

/today/
```

These should extend the routing model without requiring changes to existing URLs.

---

# Relationship to Atlas Core

Routing is built entirely from the Atlas Knowledge Graph.

Atlas Core determines:

- What exists
- How it is connected
- Which route it receives
- Which navigation elements reference it

Routing should never duplicate knowledge.

It should simply expose it.

---

# Guiding Principle

A visitor should never feel lost.

Every URL should communicate where they are, how they got there, and where they can explore next.

Atlas routes exist to make curiosity effortless.
