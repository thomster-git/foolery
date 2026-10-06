# 10 - Data Model

> **Defining how knowledge is represented, stored, and connected within Project Atlas.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Draft |
| **Milestone** | Milestone 1 – Experience Design |
| **Last Updated** | July 2026 |

---

# Purpose

The Data Model defines how the concepts described in the Knowledge Model are represented within Atlas.

While the Knowledge Model describes *what* exists, the Data Model defines *how* those objects are identified, connected, validated, and maintained.

The goal is to create a flexible, scalable foundation that supports Atlas for many years.

---

# Design Philosophy

The Atlas data model should be:

- Human-readable
- Machine-readable
- Portable
- Extensible
- Versionable
- Technology-agnostic

Knowledge should exist independently of any single programming language, framework, or database.

---

# Core Design Principles

Every data object should:

- Have a unique identity.
- Be independently addressable.
- Support meaningful relationships.
- Contain descriptive metadata.
- Be easy to maintain.
- Remain understandable without specialized tools.

The structure should prioritize clarity over cleverness.

---

# Core Object Types

Atlas currently defines the following primary object types:

- Topic
- Theme
- Article
- Project
- Collection
- Media
- Timeline (future)
- Person (future)
- Place (future)
- Technology (future)

Each object type should follow a consistent structure while allowing type-specific fields.

---

# Universal Fields

Every Atlas object should include the following core fields.

| Field | Purpose |
| :--- | :--- |
| id | Permanent unique identifier |
| slug | Human-friendly URL identifier |
| title | Display name |
| summary | Short description |
| description | Longer overview (optional) |
| created | Creation date |
| updated | Last modified date |
| status | Draft, Published, Archived |
| topics | Related Topics |
| themes | Related Themes |
| relationships | Connected objects |

These fields establish consistency across the entire platform.

---

# Object Identity

Every object should have a permanent identifier.

Example:

```
topic-photography

article-learning-piano

project-atlas

theme-growth
```

Identifiers should never change once published.

Human-readable names may evolve without breaking references.

---

# Slugs

Slugs define public-facing URLs.

Examples:

```
photography

project-atlas

learning-piano-again

growth
```

Slugs should:

- Use lowercase letters.
- Separate words with hyphens.
- Avoid special characters.
- Remain stable whenever possible.

---

# Metadata

Metadata powers discovery throughout Atlas.

Recommended metadata includes:

- Topics
- Themes
- Tags
- Reading Time
- Difficulty
- Technologies
- Skills
- People
- Places
- Series
- Published Date
- Updated Date

Metadata should describe content rather than duplicate it.

---

# Relationships

Relationships are a defining feature of Atlas.

Every relationship should contain:

- Target object
- Relationship type
- Optional description

Example:

```
Photography

↓

Related Topic

↓

Video Editing

Reason:

Developing visual storytelling skills.
```

Relationships should explain *why* two objects are connected whenever practical.

---

# Taxonomy

Atlas organizes knowledge through multiple dimensions.

## Topics

Describe what something is about.

---

## Themes

Describe why it matters.

---

## Tags

Describe specific keywords or attributes.

Tags should remain lightweight and flexible.

---

## Content Types

Describe what kind of object it is.

Examples include:

- Article
- Project
- Gallery
- Collection
- Guide
- Video

---

# Folder Organization

The repository should separate content from implementation.

Example:

```text
content/

articles/

projects/

collections/

media/

website/

pages/

components/

data/
```

Implementation details should never dictate how knowledge is organized.

---

# Validation

Every object should satisfy basic validation rules.

Examples include:

- Unique ID.
- Unique slug.
- Required title.
- Required status.
- Valid relationship targets.
- Valid metadata.

Validation should catch inconsistencies early.

---

# Search Model

Search should consider:

- Titles
- Summaries
- Topics
- Themes
- Tags
- Relationships
- Content Type

Results should prioritize relevance rather than exact keyword matches.

---

# Recommendation Model

Recommendations should consider multiple factors.

Examples include:

- Shared Topics
- Shared Themes
- Shared Technologies
- Shared Skills
- Shared Time Period
- Relationship Strength

Recommendations should feel intentional rather than random.

---

# Versioning

Knowledge evolves over time.

Every object should support:

- Creation date
- Last updated date
- Revision history
- Status changes

Atlas values continuous refinement over one-time publication.

---

# Future Evolution

The Data Model should accommodate future capabilities without requiring structural redesign.

Examples include:

- Graph databases
- Headless CMS integration
- Public API
- AI-assisted search
- Knowledge visualization
- Interactive timelines
- Community contributions

The underlying model should remain stable even as implementation changes.

---

# Relationship to Atlas

The Data Model translates the conceptual Knowledge Model into a structure that software can understand.

It provides the foundation for content management, navigation, search, recommendations, and future application development.

Every object should be designed to strengthen Atlas's defining principle:

> **Everything is connected.**
