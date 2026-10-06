# 04 - Technical Architecture

> **Defining how Project Atlas is engineered, organized, and evolved.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.2.0 |
| **Status** | Active |
| **Milestone** | Milestone 3 – Software Architecture |
| **Last Updated** | July 2026 |

---

# Purpose

The Technical Architecture defines how Atlas is engineered.

Its purpose is not to prescribe specific technologies, but to establish engineering principles that enable Atlas to remain maintainable, extensible, accessible, and enjoyable to build for many years.

Where the Project Vision explains **why** Atlas exists, the Technical Architecture explains **how** that vision becomes software.

---

# Technical Philosophy

Technology exists to support the experience.

Not the other way around.

Every technical decision should reinforce Atlas's central philosophy:

> **Everything is connected.**

The architecture should encourage relationships between ideas, not simply render webpages.

Knowledge should remain independent from presentation.

Software should remain independent from content.

Implementation should remain independent from individual technologies whenever practical.

---

# Architectural Layers

Atlas is organized into four conceptual layers.

```text
Blueprint
(Why Atlas exists)

        ↓

Experience
(How visitors interact)

        ↓

Architecture
(How Atlas is engineered)

        ↓

Implementation
(The software itself)
```

Each layer builds upon the previous one.

Changes should generally flow downward rather than upward.

---

# Architecture Goals

Atlas prioritizes:

- Simplicity
- Maintainability
- Accessibility
- Performance
- Documentation
- Extensibility
- Predictability
- Portability
- Longevity

Software should remain understandable to a single developer while being structured well enough for future contributors.

---

# High-Level System Architecture

Atlas transforms structured knowledge into interactive experiences.

```text
Structured Content

        ↓

Content Schema

        ↓

Atlas Core

        ↓

Component Library

        ↓

Generated Website

        ↓

Visitor Experience
```

Every layer has a single responsibility.

---

# Atlas Core

Atlas Core is the software engine at the centre of Project Atlas.

Its responsibility is to transform structured knowledge into interactive experiences.

Atlas Core should remain independent from presentation.

It should understand relationships between knowledge objects without knowing how those relationships will ultimately be displayed.

Its responsibilities include:

- Loading content
- Validating content
- Building the knowledge graph
- Resolving relationships
- Routing
- Rendering
- Search indexing
- Recommendation generation
- Static site generation

Atlas Core is not the website.

Atlas Core creates the website.

---

# Repository Architecture

```text
Project-Atlas/

README.md
PROJECT_ATLAS.md
MANIFESTO.md
CHANGELOG.md
LICENSE
.gitignore

docs/
    blueprint/
    experience/
    architecture/
    branding/
    decisions/
    meetings/

website/
    assets/
    components/
    layouts/
    pages/
    data/

content/
    articles/
    projects/
    topics/
    themes/
    collections/
    galleries/
    media/

scripts/

archive/
```

Documentation explains the system.

Content powers the system.

Software connects the system.

---

# Technology Strategy

Atlas intentionally favours mature, widely supported technologies.

Current technologies include:

- HTML5
- CSS3
- Vanilla JavaScript
- Markdown
- JSON
- Git
- GitHub

Additional technologies should only be adopted when they provide meaningful long-term benefits.

Popularity alone is never sufficient justification.

---

# Content Architecture

Knowledge is Atlas's primary asset.

Content should remain entirely independent from presentation.

Every article, project, topic, collection, or gallery should exist as structured content rather than hard-coded webpages.

Atlas Core determines how that knowledge is presented by selecting layouts and reusable components during the build process.

The same content should be capable of appearing in multiple contexts without duplication.

---

# Knowledge Model

Every piece of content is treated as a first-class knowledge object.

Knowledge objects may include:

- Articles
- Projects
- Topics
- Themes
- Collections
- Galleries
- Media

Atlas Core builds a knowledge graph from these objects.

That graph powers:

- Navigation
- Search
- Recommendations
- Discovery
- Related Content
- "Surprise Me"

Relationships are considered first-class citizens of the platform.

---

# Component Architecture

Atlas is assembled from reusable components rather than handcrafted pages.

Examples include:

- Header
- Footer
- Navigation
- Search
- Cards
- Timelines
- Galleries
- Metadata Panels
- Relationship Explorer
- Recommendation Panels

Atlas Core assembles webpages from these reusable building blocks.

Components should remain modular, predictable, and reusable.

---

# Routing

Routing should be generated automatically.

Public URLs should be derived from structured metadata rather than manually maintained.

URLs should remain:

- Human-readable
- Stable
- Predictable
- Search-friendly

Routing logic should remain independent from page layouts.

---

# Performance

Performance should be designed into Atlas from the beginning.

Priorities include:

- Fast page loads
- Minimal JavaScript
- Responsive media
- Efficient CSS
- Progressive enhancement
- Lazy loading
- Static generation where practical

Every feature should justify its performance cost.

---

# Accessibility

Accessibility is a fundamental architectural requirement.

Atlas should support:

- Semantic HTML
- Keyboard navigation
- Screen readers
- High colour contrast
- Responsive layouts
- Reduced motion preferences
- Accessible typography
- Meaningful alternative text

Accessibility should never be treated as an optional enhancement.

---

# Security

Although Atlas is primarily a content platform, engineering best practices still apply.

These include:

- Secure dependency management
- Minimal third-party services
- Principle of least privilege
- Input validation
- Regular maintenance
- Version control

Security should scale alongside the platform as Atlas evolves.

---

# Documentation Strategy

Documentation is part of the product.

Every significant architectural decision should be documented.

Major engineering decisions should be recorded as Architecture Decision Records (ADRs).

Documentation should evolve alongside implementation rather than following it.

---

# Future Architecture

Atlas is intentionally designed for growth.

Potential future capabilities include:

- Atlas Framework
- Atlas Studio
- Plugin architecture
- Public APIs
- AI-assisted authoring
- Interactive knowledge graph
- Visual relationship explorer
- Progressive Web App (PWA)
- Automated testing
- Continuous Integration (CI)
- Continuous Deployment (CD)
- Multi-site support

New capabilities should extend the architecture rather than requiring it to be redesigned.

---

# Guiding Principle

Every engineering decision should support one simple idea.

> **Everything is connected.**

If a technical decision makes Atlas easier to understand, easier to extend, and better at revealing relationships between ideas, it is probably the right decision.
