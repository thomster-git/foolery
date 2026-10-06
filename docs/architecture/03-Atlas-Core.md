# 03 - Atlas Core

> **Defining the software engine that powers Project Atlas.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.2.0 |
| **Status** | Active Design |
| **Milestone** | Milestone 4 – Atlas Core |
| **Last Updated** | July 2026 |

---

# Purpose

Atlas Core is the software engine responsible for transforming structured knowledge into an interactive digital experience.

It serves as the bridge between content and presentation.

Rather than manually building webpages, Atlas Core understands the relationships between knowledge objects and assembles the website automatically.

Every article, project, topic, theme, collection, and library item becomes part of a connected knowledge graph.

The website is simply one way of viewing that graph.

---

# Philosophy

Atlas Core exists to make the philosophy of Atlas executable.

> **Everything is connected.**

Knowledge should never exist in isolation.

Instead of organizing content into independent pages, Atlas Core reveals the relationships between them, allowing visitors to discover ideas naturally through exploration.

Connections are not decorative.

They are the product.

---

# Responsibilities

Atlas Core is responsible for:

- Discovering content
- Loading structured data
- Validating metadata
- Parsing knowledge objects
- Building relationships
- Constructing the knowledge graph
- Generating routes
- Creating search indexes
- Producing recommendations
- Rendering pages
- Publishing the website

Atlas Core does **not** contain the content itself.

Its responsibility is to understand, organize, and expose knowledge.

---

# Atlas Engine Cycle

Every Atlas build follows the same lifecycle.

```text
Discover
    ↓
Load
    ↓
Validate
    ↓
Normalize
    ↓
Connect
    ↓
Index
    ↓
Render
    ↓
Publish
```

Each stage performs a single responsibility before passing structured data to the next stage.

---

# Data Flow

```text
Markdown Files
        │
        ▼
Content Loader
        │
        ▼
Validator
        │
        ▼
Parser
        │
        ▼
Knowledge Objects
        │
        ▼
Graph Builder
        │
        ▼
Knowledge Graph
        │
        ├──────────────┐
        ▼              ▼
Router         Search Index
        │              │
        └──────┬───────┘
               ▼
Recommendation Engine
               │
               ▼
Renderer
               │
               ▼
Generated Website
```

Atlas Core is entirely data-driven.

Every module transforms structured knowledge into a richer representation before passing it to the next stage.

---

# Core Modules

Atlas Core is intentionally modular.

Each module should have exactly one responsibility.

---

## 1. Content Loader

The Loader discovers and reads every supported content file.

Responsibilities:

- Locate content
- Read files
- Extract front matter
- Extract Markdown body

**Input**

Repository files

**Output**

Raw content objects

---

## 2. Validator

The Validator ensures every content object follows the Atlas Content Schema.

Validation includes:

- Required fields
- Duplicate IDs
- Duplicate slugs
- Broken references
- Invalid Topics
- Invalid Themes
- Invalid metadata
- Missing relationships

Invalid content should never be published.

---

## 3. Parser

The Parser converts validated metadata into structured Atlas objects.

Example:

```yaml
topics:
  - music
```

becomes

```
Topic Object
```

rather than a plain string.

This allows Atlas to reason about relationships rather than text.

---

## 4. Graph Builder

The Graph Builder creates the Atlas Knowledge Graph.

Relationships may be:

- Explicit
- Shared Topics
- Shared Themes
- Shared Technologies
- Shared Skills
- Shared Series
- Manual recommendations

Relationship quality is always more important than quantity.

---

## 5. Routing Engine

The Router generates every public URL automatically.

Examples include:

```
/articles/

/projects/

/topics/

/themes/

/library/
```

Routes should always be generated from metadata rather than hardcoded.

---

## 6. Search Index

The Search module builds a searchable index of Atlas knowledge.

Search should consider:

- Title
- Summary
- Topics
- Themes
- Tags
- Relationships
- Series
- Library references

Future versions may introduce semantic search.

---

## 7. Recommendation Engine

Recommendations encourage exploration.

Rather than popularity, Atlas should prioritize meaningful relationships.

Signals include:

- Shared Themes
- Shared Topics
- Shared Projects
- Shared Library Items
- Relationship strength
- Learning progression

Recommendations should make visitors curious.

---

## 8. Rendering Engine

The Renderer transforms knowledge into webpages.

Responsibilities include:

- Selecting layouts
- Selecting components
- Injecting content
- Building navigation
- Building HTML

Rendering should remain completely data-driven.

Atlas Core should never depend on visual implementation details.

---

## 9. Public API

Every other system communicates with Atlas Core through a single interface.

Example:

```javascript
atlas.load();

atlas.search();

atlas.getArticle();

atlas.getProject();

atlas.getTopic();

atlas.getTheme();

atlas.getRecommendations();
```

Internal modules should never be accessed directly.

---

# The Knowledge Object

Every piece of content becomes a standardized Knowledge Object before entering the graph.

```text
Knowledge Object

• id
• title
• slug
• type
• summary
• content
• topics
• themes
• tags
• relationships
• metadata
```

Whether the source is an article, project, topic, library item, or collection, Atlas Core processes it through the same model.

This provides consistency across the entire platform.

---

# Atlas Core Principles

Every module should follow these principles.

- One responsibility per module.
- Knowledge before presentation.
- Data over hardcoded logic.
- Relationships over hierarchy.
- Simplicity over cleverness.
- Framework independence.
- Progressive enhancement.
- Long-term maintainability.

These principles should guide every engineering decision.

---

# Inputs

Atlas Core consumes:

- Markdown content
- Metadata
- Media assets
- Configuration
- Design tokens

---

# Outputs

Atlas Core produces:

- Static HTML
- Navigation
- Search indexes
- RSS feeds
- XML sitemaps
- Structured metadata
- Knowledge graph
- Build reports

Future versions may additionally expose public APIs.

---

# Future Capabilities

Atlas Core is intentionally designed for long-term growth.

Potential future capabilities include:

- Plugin architecture
- Atlas Studio
- Interactive knowledge graph visualization
- Semantic search
- AI-assisted recommendations
- Multi-site support
- Static site generation
- Progressive Web App (PWA)
- Automated testing
- Continuous deployment

New capabilities should extend Atlas Core rather than require architectural redesign.

---

# Relationship to Atlas

Atlas Core is the software heart of Project Atlas.

The Blueprint defines the philosophy.

The Knowledge Model defines the structure.

Atlas Core brings both to life.

Its responsibility is not simply to generate webpages.

Its responsibility is to understand knowledge, reveal relationships, and make exploration possible.

Every build should reinforce one belief:

> **Everything is connected.**
