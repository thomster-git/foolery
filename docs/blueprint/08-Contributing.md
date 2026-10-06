# 08 - Contributing

> **Defining how Project Atlas is developed, documented, and improved over time.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Draft |
| **Milestone** | Milestone 0 – Atlas Blueprint |
| **Last Updated** | July 2026 |

---

# Purpose

Project Atlas is designed as a long-term project.

This document establishes the standards, conventions, and development practices that help keep Atlas consistent, maintainable, and faithful to its philosophy.

Whether a contribution involves documentation, code, design, or content, the goal remains the same:

Leave Atlas better than you found it.

---

# Contribution Philosophy

Every contribution should support one or more of the following goals:

- Improve understanding.
- Improve exploration.
- Improve maintainability.
- Improve accessibility.
- Improve performance.
- Improve documentation.
- Strengthen relationships between ideas.

Features should never be added simply because they are possible.

Every addition should have a clear purpose.

---

# Guiding Principle

Before making any significant change, ask:

> **Does this help visitors discover meaningful connections?**

If the answer is yes, it probably belongs in Atlas.

If the answer is no, reconsider whether the feature aligns with the project's philosophy.

---

# Development Workflow

General workflow:

```
Research

↓

Plan

↓

Document

↓

Prototype

↓

Implement

↓

Review

↓

Refine

↓

Publish
```

Planning should always precede implementation.

Documentation should evolve alongside the code.

---

# Repository Standards

Project files should remain organized according to their purpose.

```
docs/
```

Project documentation.

```
website/
```

Website source code.

```
content/
```

Articles, projects, and media.

```
branding/
```

Visual assets and identity resources.

```
scripts/
```

Automation and utility scripts.

```
archive/
```

Historical resources retained for reference.

New directories should only be introduced when they solve a clear organizational problem.

---

# Coding Standards

General principles:

- Prefer readability over cleverness.
- Keep functions focused.
- Avoid unnecessary complexity.
- Write descriptive names.
- Remove dead code.
- Comment *why*, not *what*.
- Reuse components whenever practical.

Code should be understandable months or years after it is written.

---

# Documentation Standards

Documentation is considered part of the product.

Every significant feature should include updated documentation.

Major architectural decisions should be recorded as Architecture Decision Records (ADRs).

Whenever documentation and implementation disagree, they should be reconciled as quickly as possible.

---

# Design Standards

Design decisions should remain consistent with the Design System.

New components should:

- Be reusable.
- Be accessible.
- Support exploration.
- Maintain visual consistency.
- Reinforce Atlas's identity.

Visual novelty should never outweigh usability.

---

# Content Standards

Published content should:

- Be accurate.
- Be authentic.
- Be well organized.
- Connect to related ideas.
- Encourage curiosity.
- Remain valuable over time.

Content should be maintained and improved as the project evolves.

---

# Git Standards

General Git practices include:

- Small, focused commits.
- Clear commit messages.
- Meaningful pull requests.
- Logical version history.

Example commit messages:

```
Add article metadata system

Refactor navigation component

Update Project Vision

Improve accessibility of article cards

Document relationship engine
```

Commit history should tell the story of Atlas's development.

---

# Versioning

Atlas follows Semantic Versioning.

```
Major.Minor.Patch

1.0.0
```

Examples:

- Patch releases fix issues or improve documentation.
- Minor releases introduce new capabilities.
- Major releases represent significant architectural or user-facing changes.

Every release should include an updated `CHANGELOG.md`.

---

# Code Review Checklist

Before merging significant work, consider:

- Does it follow the Project Vision?
- Does it align with the Brand Identity?
- Does it support the Information Architecture?
- Does it respect the Technical Architecture?
- Does it improve the Content Strategy?
- Does it follow the Design System?
- Is it documented?
- Is it maintainable?
- Is it accessible?
- Is it consistent?

If the answer to any of these questions is no, additional refinement may be appropriate.

---

# Decision Making

When multiple solutions are available, prefer the one that is:

- Simpler.
- Better documented.
- Easier to maintain.
- More accessible.
- More reusable.
- More consistent with Atlas's philosophy.

Long-term maintainability should always outweigh short-term convenience.

---

# Looking Ahead

Project Atlas is expected to evolve over many years.

Future contributors should feel empowered to improve the project while respecting its core principles.

The implementation may change.

Technologies may change.

Design trends may change.

The philosophy should remain constant.

---

# Relationship to Atlas

The Contributing guide brings together every document within the Atlas Blueprint.

It defines how future work should preserve the philosophy established in the Project Vision, express the identity defined in the Brand Identity, respect the relationships described in the Information Architecture, follow the Technical Architecture, support the Content Strategy, and remain consistent with the Design System.

Every contribution should strengthen Atlas's guiding belief:

> **Everything is connected.**
