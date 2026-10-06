# 01 - Content Schema

> **Defining the structure of every content object within Project Atlas.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Draft |
| **Milestone** | Milestone 2 – Architecture |
| **Last Updated** | July 2026 |

---

# Purpose

The Content Schema defines how knowledge is represented within Atlas.

Every page displayed on the website is generated from structured content.

Rather than manually designing individual pages, Atlas renders Topics, Articles, Projects, Collections, Galleries, and future content types using reusable templates driven by metadata.

The schema provides consistency, scalability, and long-term maintainability.

---

# Design Principles

Every content object should be:

- Human-readable
- Easy to edit
- Version controlled
- Self-describing
- Relationship-driven
- Framework independent

Content should remain valuable even if the website is rebuilt using different technologies.

---

# Storage Format

Atlas stores content as **Markdown** with **YAML Front Matter**.

This separates structured metadata from written content.

Example:

```yaml
---
id: article-learning-piano

title: Learning Piano Again

type: article

status: published

topics:
  - music

themes:
  - growth
  - identity

created: 2026-07-12

updated: 2026-07-15
---
```

The body of the Markdown file contains the actual content.

---

# Universal Schema

Every content object inherits the following fields.

| Field | Required | Description |
| :--- | :---: | :--- |
| id | ✅ | Permanent unique identifier |
| slug | ✅ | URL slug |
| title | ✅ | Display title |
| summary | ✅ | Short description |
| description | | Longer overview |
| type | ✅ | Content type |
| status | ✅ | draft, published, archived |
| created | ✅ | Creation date |
| updated | ✅ | Last modified date |
| author | ✅ | Content author |
| topics | ✅ | Related Topics |
| themes | ✅ | Related Themes |
| tags | | Keywords |
| relationships | | Connected content |
| featured | | Homepage promotion |
| heroImage | | Primary image |
| seoTitle | | SEO title |
| seoDescription | | SEO description |

These fields form the foundation of every object within Atlas.

---

# Content Types

Atlas currently defines the following content types.

## Article

Purpose:

Stories, essays, guides, tutorials, reflections, and educational content.

Additional fields:

- readingTime
- difficulty
- series
- references

---

## Project

Purpose:

Document work that has been designed, built, or maintained.

Additional fields:

- status
- technologies
- repository
- liveDemo
- screenshots
- milestones

---

## Topic

Purpose:

Knowledge hub for a subject area.

Additional fields:

- icon
- colour
- featuredContent
- relatedTopics
- relatedThemes

---

## Theme

Purpose:

Connect unrelated content through shared meaning.

Additional fields:

- icon
- philosophy
- relatedThemes
- featuredContent

---

## Collection

Purpose:

Group meaningful physical or digital items.

Additional fields:

- itemCount
- acquisitionDate
- collectionStatus

---

## Gallery

Purpose:

Display visual media.

Additional fields:

- images
- captions
- camera
- location

---

## Timeline

Purpose:

Present chronological events.

Additional fields:

- events
- startDate
- endDate

---

# Relationships

Relationships are one of Atlas's defining features.

Each relationship should include:

| Field | Description |
| :--- | :--- |
| target | Connected object ID |
| type | Relationship type |
| description | Why the relationship exists |
| strength | Optional weighting |

Example:

```yaml
relationships:

- target: photography

  type: related-topic

  description: Learning composition improved video editing.

- target: growth

  type: shared-theme

  description: Both focus on long-term improvement.
```

Relationships should always communicate *why* two objects are connected.

---

# Taxonomy

Atlas uses three primary classification systems.

## Topics

Describe **what** content is about.

Examples:

- Music
- Baseball
- Photography
- Technology

---

## Themes

Describe **why** the content matters.

Examples:

- Growth
- Curiosity
- Creativity
- Identity
- Nostalgia

---

## Tags

Describe specific concepts.

Examples:

- Canon
- Docker
- Billy Talent
- Raspberry Pi
- Autism
- Blue Jays

Tags provide precision without replacing Topics or Themes.

---

# File Organization

Example structure:

```text
content/

├── articles/
├── projects/
├── topics/
├── themes/
├── collections/
├── galleries/
└── media/
```

Each folder contains Markdown files following the appropriate schema.

---

# Naming Conventions

Identifiers should be:

- lowercase
- hyphen-separated
- stable
- descriptive

Examples:

```
project-atlas

learning-piano

home-lab

video-editing
```

Avoid abbreviations unless universally recognized.

---

# Validation Rules

Every content object should satisfy the following requirements.

- Unique ID.
- Unique slug.
- Valid content type.
- At least one Topic.
- At least one Theme.
- Valid publication status.
- Valid relationships.
- Required title.
- Required summary.

Validation should occur before publishing.

---

# Extensibility

Future content types may include:

- Person
- Place
- Event
- Technology
- Skill
- Course
- Podcast
- Book

New types should inherit the Universal Schema wherever practical.

---

# Relationship to Atlas

The Content Schema provides the blueprint for every piece of knowledge within Atlas.

It ensures that stories, projects, collections, media, and future content types share a consistent structure while remaining flexible enough to evolve over time.

A well-designed schema allows Atlas to remain scalable, searchable, and interconnected without sacrificing readability or maintainability.

Every object should support the project's guiding philosophy:

> **Everything is connected.**
