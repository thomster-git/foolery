# 07 - Knowledge Graph

> **Defining how knowledge is represented, connected, and explored throughout Atlas.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Active Design |
| **Milestone** | Milestone 4 – Atlas Core |
| **Last Updated** | July 2026 |

---

# Purpose

The Atlas Knowledge Graph is the conceptual model that connects every piece of knowledge within Project Atlas.

Rather than treating articles, projects, resources, or ideas as isolated pages, Atlas represents them as interconnected knowledge objects.

The Knowledge Graph is the foundation for:

- Navigation
- Discovery
- Recommendations
- Search
- Learning pathways
- Related content
- Future AI features

The website is simply one way of viewing the graph.

---

# Philosophy

Project Atlas is built on one fundamental belief.

> **Everything is connected.**

The purpose of the Knowledge Graph is not merely to organize information.

Its purpose is to reveal relationships.

Visitors should be encouraged to discover ideas they were not originally searching for.

The graph exists to reward curiosity.

---

# Core Concepts

The Knowledge Graph is composed of three primary concepts.

```text
Knowledge Objects
        │
Relationships
        │
Knowledge Graph
```

Everything in Atlas is ultimately represented through these concepts.

---

# Knowledge Objects

Every piece of content becomes a standardized Knowledge Object before entering the graph.

Examples include:

- Articles
- Projects
- Topics
- Themes
- Collections
- Library Items
- Galleries
- Series
- Media

Regardless of origin, Atlas treats them consistently.

---

## Knowledge Object Structure

Every object should contain structured metadata.

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

Additional fields may exist depending on the object type.

---

# Object Types

Atlas currently recognizes the following object types.

```text
Article

Project

Topic

Theme

Collection

Library Item

Gallery

Media

Series
```

Future object types should extend the model rather than replace it.

---

# Relationships

Relationships are first-class citizens within Atlas.

A relationship is more valuable than a category.

Examples include:

- Article references Project
- Project uses Technology
- Book inspired Article
- Theme appears in Project
- Topic connects multiple Articles
- Collection contains Library Items

Relationships should describe meaning rather than hierarchy.

---

# Relationship Types

Atlas supports several kinds of relationships.

## Explicit

Defined directly within content.

Example:

```yaml
related:
  - project-atlas
```

---

## Shared Topics

Objects sharing Topics are automatically connected.

Example:

```text
Music
```

---

## Shared Themes

Objects sharing Themes become related.

Example:

```text
Curiosity
```

---

## Shared Technologies

Projects and Articles may connect through common technologies.

Example:

```text
JavaScript
```

---

## Shared Skills

Learning resources may connect through skills.

Example:

```text
Networking
```

---

## Manual Relationships

Authors may intentionally create meaningful links that cannot be inferred automatically.

These relationships should always take precedence over automatic suggestions.

---

# Relationship Strength

Not all relationships are equally meaningful.

Atlas may assign relationship scores based on signals such as:

- Shared Topics
- Shared Themes
- Shared Technologies
- Shared Skills
- Shared Collections
- Manual references
- Reciprocal links

Manual relationships should receive the highest priority.

---

# Graph Construction

Atlas Core constructs the graph after content validation.

```text
Markdown
        │
        ▼
Knowledge Objects
        │
        ▼
Relationship Engine
        │
        ▼
Knowledge Graph
```

The graph exists before pages are generated.

Pages are views of the graph.

---

# Graph Principles

The Knowledge Graph should remain:

- Connected
- Extensible
- Understandable
- Predictable
- Framework independent

The graph should describe knowledge rather than implementation.

---

# Navigation

Navigation should emerge naturally from the graph.

Visitors may move between objects using:

- Topics
- Themes
- Related Articles
- Related Projects
- Library References
- Collections
- Recommendations
- Learning Paths

Navigation should encourage exploration rather than linear progression.

---

# Discovery

Atlas is designed for discovery.

Every page should expose meaningful opportunities to continue exploring.

Discovery methods include:

- Related content
- Shared Themes
- Shared Topics
- Recommended reading
- Collections
- Library references
- "Surprise Me"

Discovery should never rely solely on chronological order.

---

# Search

Search should operate on the Knowledge Graph rather than individual files.

Search results should consider:

- Titles
- Summaries
- Metadata
- Relationships
- Topics
- Themes
- Tags
- Relationship strength

The objective is to find the most meaningful knowledge, not simply matching words.

---

# Recommendations

Recommendations are generated from the graph.

Signals may include:

- Shared Themes
- Shared Topics
- Shared Technologies
- Shared Skills
- Manual recommendations
- Relationship scores
- Learning progression

Recommendations should reinforce curiosity rather than popularity.

---

# Learning Paths

Future versions of Atlas may generate learning paths automatically.

Example:

```text
Home Lab Basics

↓

Networking

↓

Virtualization

↓

Proxmox

↓

Automation

↓

Infrastructure as Code
```

Learning paths should emerge naturally from the graph.

---

# Visualization

Future versions of Atlas may visualize the Knowledge Graph.

Possible views include:

- Interactive graph
- Topic map
- Theme map
- Timeline
- Network explorer
- Relationship heat map

These visualizations are optional representations of the graph, not the graph itself.

---

# AI Integration

Future Atlas features may use the Knowledge Graph to support:

- Intelligent recommendations
- Personalized learning
- Semantic search
- Knowledge summarization
- Relationship discovery
- Atlas Studio

The graph provides structured context for future AI capabilities.

---

# Relationship to Atlas Core

Atlas Core is responsible for building and maintaining the Knowledge Graph.

The graph becomes the authoritative source for:

- Navigation
- Routing
- Recommendations
- Search
- Discovery

The renderer simply presents the graph to visitors.

---

# Relationship to the Content Schema

The Content Schema defines how knowledge is authored.

The Knowledge Graph defines how knowledge is connected.

Together they form the conceptual foundation of Atlas.

---

# Guiding Principle

Atlas does not exist to publish pages.

It exists to build understanding.

Every article, project, library item, topic, theme, and collection should strengthen the web of knowledge surrounding it.

When visitors leave Atlas, they should not only know more.

They should see more connections than when they arrived.

> **Everything is connected.**
