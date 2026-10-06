# 02 - Component Architecture

> **Defining the reusable building blocks that compose every Atlas page.**

| Property | Value |
| :--- | :--- |
| **Version** | v0.1.0 |
| **Status** | Draft |
| **Milestone** | Milestone 2 – Architecture |
| **Last Updated** | July 2026 |

---

# Purpose

Atlas is built from reusable components rather than unique webpages.

Every page is assembled from a shared library of components that present structured content in a consistent, accessible, and maintainable way.

The goal is to minimize duplication while maximizing flexibility.

---

# Philosophy

Components should be:

- Reusable
- Independent
- Accessible
- Responsive
- Data-driven
- Composable

A component should have one clear responsibility.

Complex interfaces should emerge from combining simple components.

---

# Architecture Overview

Atlas is organized into four layers.

```text
Content

↓

Layout

↓

Components

↓

Pages
```

Content provides the information.

Layouts provide the structure.

Components provide the interface.

Pages simply assemble everything together.

---

# Component Hierarchy

Components exist at different levels of complexity.

## Level 1 — Primitives

The smallest reusable elements.

Examples:

- Button
- Link
- Icon
- Badge
- Divider
- Avatar
- Tag
- Pill
- Tooltip

These should never contain business logic.

---

## Level 2 — UI Components

Small combinations of primitives.

Examples:

- Card
- Quote
- Alert
- Breadcrumb
- Navigation Item
- Search Bar
- Hero Banner
- Timeline Event
- Relationship Chip

These introduce presentation while remaining reusable.

---

## Level 3 — Feature Components

Groups of UI components with a specific responsibility.

Examples:

- Featured Topics
- Continue Exploring
- Related Articles
- Topic Overview
- Theme Explorer
- Search Results
- Collection Grid
- Article Metadata

Feature components understand Atlas content.

---

## Level 4 — Page Sections

Large composable sections.

Examples:

- Hero
- Featured Content
- Explore Paths
- Knowledge Connections
- Timeline
- Footer

These organize feature components into complete experiences.

---

# Layout System

Layouts define page structure but contain no content.

Examples include:

- Homepage Layout
- Topic Layout
- Article Layout
- Project Layout
- Collection Layout

Layouts position components without controlling the data they display.

---

# Core Components

Atlas should begin with a small, well-designed component library.

## Navigation

Responsible for helping visitors understand:

- Where they are
- Where they can go
- What is related

---

## Hero

Introduces a page.

Should communicate:

- Title
- Summary
- Primary action

---

## Card

The primary reusable content container.

Cards should support multiple content types including:

- Articles
- Projects
- Topics
- Collections
- Themes

Cards should adapt their appearance based on content rather than requiring different implementations.

---

## Knowledge Connections

One of Atlas's defining components.

Displays meaningful relationships between content.

Each relationship should explain why the connection exists.

---

## Continue Exploring

Suggests the next step in a visitor's journey.

Recommendations should prioritize meaningful relationships over chronological order.

---

## Timeline

Displays chronological information.

Used for:

- Personal growth
- Projects
- Learning
- History

---

## Quote

Highlights memorable thoughts or guiding ideas.

Should be used sparingly to create moments of reflection.

---

# Component Communication

Components should receive data through clearly defined interfaces.

They should not retrieve or manage data directly.

Responsibilities should remain separated.

```
Content

↓

Component

↓

Rendered Interface
```

This keeps components reusable across the platform.

---

# State Management

Components should remain as stateless as practical.

Temporary interface state (expanded cards, open menus, filters) should remain localized.

Application-wide state should be minimized.

---

# Responsive Design

Every component should function across:

- Desktop
- Tablet
- Mobile

Responsive behavior should be designed alongside the component rather than added afterward.

---

# Accessibility

Every component should support:

- Semantic HTML
- Keyboard navigation
- Screen readers
- High contrast
- Reduced motion
- Visible focus indicators

Accessibility is a core design requirement.

---

# Animation

Animation should communicate.

Examples include:

- Revealing relationships
- Expanding cards
- Smooth transitions
- Navigation feedback

Animation should never distract from content.

Visitors who prefer reduced motion should receive an equally complete experience.

---

# Styling

Components should consume design tokens rather than defining their own values.

Examples include:

- Colours
- Typography
- Border radius
- Shadows
- Spacing
- Animation durations

This ensures visual consistency throughout Atlas.

---

# Future Components

Potential additions include:

- Knowledge Graph Explorer
- Interactive Timeline
- Theme Map
- Reading Progress
- Search Suggestions
- Breadcrumb Graph
- Random Discovery
- Journey Builder

New components should solve recurring problems rather than isolated use cases.

---

# Relationship to Atlas

The Component Architecture defines the reusable interface library that powers Atlas.

It enables every page to be assembled from consistent, accessible, and data-driven building blocks.

As Atlas evolves, new experiences should emerge through composition rather than duplication.

Every component should support Atlas's central belief:

> **Everything is connected.**
