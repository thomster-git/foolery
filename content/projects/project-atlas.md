---
id: project-atlas
title: "Project Atlas"
type: project
status: active
author: Jonathan Thoms
summary: A self-hosted personal knowledge platform built from scratch in Node.js. It parses hundreds of markdown files, automatically builds entity relationships, generates a searchable knowledge graph, and compiles the entire site into static HTML — no CMS, no framework, no compromise.
topics:
  - technology
themes:
  - systems-thinking
  - connection
  - craftsmanship
related:
  - manifesto
  - keel-systems
  - my-story-with-everything-is-connected
tags:
  - knowledge-graph
  - digital-garden
  - static-site
  - markdown
  - node-js
featured: true
created: 2026-07-10
updated: 2026-09-22
---

Most personal websites are digital brochures — a bio, a portfolio section, a contact form. I didn't want to build that. I wanted to build the thing behind the thing: a system that turns everything I think, build, and care about into a connected, queryable, navigable web of ideas.

That's Project Atlas.

## The Problem With Normal Websites

Standard portfolio sites treat content as isolated pages. An article about systems thinking has no mechanical connection to the book that inspired it, the project it influenced, or the theme it keeps returning to. You lose the web of relationships — the part that actually makes ideas interesting.

I also didn't want to depend on a CMS like Ghost or WordPress. I didn't want a framework that owns my content schema. I wanted to own the entire pipeline: from raw markdown files on disk, to the HTML page someone reads on thomsfoolery.com.

## The Architecture

Project Atlas is a **custom Node.js static site generator** with a relational layer on top. Every piece of content — articles, projects, books, tools, library items, topics, themes — is written as a markdown file with a YAML frontmatter header. That frontmatter is the data model.

The build pipeline works in several stages:

**1. Load** — The `Loader` walks the entire `content/` directory tree and reads every `.md` file into memory.

**2. Parse** — The `Parser` splits the raw text into `metadata` (frontmatter) and `body` (markdown). It handles the YAML structure, type coercion, and multi-value fields like arrays of related IDs.

**3. Normalize** — The `Normalizer` infers missing fields. If a file lives in `content/library/books/`, it's a `book`. If it's in `content/articles/`, it's an `article`. Slugs, canonical URLs, and display titles are all resolved here.

**4. Relate** — The `Relationship Engine` is where the magic happens. It walks every entity's `related`, `topics`, `themes`, and `tags` arrays and builds a bidirectional graph of connections. An article that references a book automatically shows up on that book's page, and vice versa. This is never manually maintained — it emerges from the content itself.

**5. Route** — The `Router` assigns each entity a stable URL based on its type and ID. Library items get clean URLs like `/library/books/the-pragmatic-programmer/`. Articles get `/articles/systems-thinking-is-a-lens/`.

**6. Render** — The `PageBuilder` reads HTML layout templates, injects rendered content, and writes the final output files to `website/dist/`. Templates use a simple `{{variable}}` placeholder syntax backed by a lightweight `Renderer` class.

**7. Index** — The `IndexBuilder` generates all index pages (`/articles/`, `/projects/`, `/topics/`), the sitemap, the RSS feed, and a machine-readable JSON export.

## The Knowledge Graph

The graph isn't decorative. Every node in the `data/graph.json` file represents a real entity with real edges drawn from actual `related` links in content files. The interactive visualizer on the homepage renders this live — you can click any node and jump directly to that page.

The 3D Labyrinth is a spatial interpretation of the same data: topics become towers, and the doors on each floor are the articles and items connected to that topic.

## The Content Creator Tool

Authoring new content in raw YAML gets old fast. I built a GUI tool at `/devtools/content-creator/` that presents a form for each content type (article, book, project, etc.), validates required fields, and generates the exact markdown frontmatter format Atlas expects. You paste the output into a new `.md` file and the next build picks it up automatically.

This started as a separate project idea called the "Digital Garden Creator" — but it was inseparable from how Atlas works, so it lives here now.

## The Scope

As of the latest build:
- **52 published articles** across technology, systems thinking, neurodiversity, gaming, and life
- **9 project writeups** with automatic cross-linking
- **96 library items** — books, tools, software, hardware, games, music, creators
- **30 topics** and **20 themes** forming the relational taxonomy
- **4 tweet thread archives** integrated into the knowledge graph
- **8 interactive tools** across two deployment surfaces (public and internal)

Atlas is as much a long-term record of how I think as it is a software project. Every article I write, every book I finish, every project I complete becomes part of it.

## Launch & Rollout Strategy

**Milestone 1: The "Teaser" Launch (Oct 20 - Oct 27, 2026)**
- **Focus**: Bare-bones deployment to secure indexing and capture initial interest.
- **Actions**: Deploy a minimalist landing page featuring a static preview of the knowledge graph and an email waitlist signup form. No deep content unlocked yet.
- **Target KPI**: 100+ email list signups, initial Google Search Console indexing.

**Milestone 2: Core Content Drip & SEO Seeding (Nov 15, 2026)**
- **Focus**: Establishing the foundation of the digital garden.
- **Actions**: Release the first structured batch of high-value content (e.g., top 10 foundational articles, core 20 library items). Enable basic site navigation, taxonomy (`/topics/`, `/themes/`), and RSS feeds.
- **Target KPI**: 500 organic monthly visits, 5% email conversion rate.

**Milestone 3: The Interactive Graph Unlock (Dec 10, 2026)**
- **Focus**: Showcasing technical differentiation and driving engagement.
- **Actions**: Activate the interactive 3D Labyrinth and live relationship graph navigation. All related edges between articles and library items go live.
- **Target KPI**: 1,500 monthly visits, 3+ minutes average session duration.

**Milestone 4: Tooling Expansion & Developer Outreach (Jan 20, 2027)**
- **Focus**: Attracting the technical and creator niches.
- **Actions**: Publish technical deep-dives on the custom Node.js architecture and release the "Content Creator" GUI and other interactive tools to the public.
- **Target KPI**: 3,000 monthly visits, significant backlink generation from developer communities.

**Milestone 5: Monetization & Premium Offerings (Mar 1, 2027)**
- **Focus**: Converting audience engagement into revenue.
- **Actions**: Introduce premium offerings—such as paid access to the full source code of the custom static site generator, an in-depth course on building personal knowledge graphs, or exclusive technical content.
- **Target KPI**: First 50 paying customers, sustainable monthly recurring revenue (MRR) baseline.
