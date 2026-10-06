# Build Pipeline Architecture

> **Transforming raw markdown files into an optimized static site & knowledge graph.**

---

## Pipeline Stages

```text
Loader -> Parser -> Normalizer -> Validator -> Resolver -> Builder -> Exporter
```

1. **Loader**: Recursively discovers all markdown files in `/content`.
2. **Parser**: Separates YAML front matter from markdown body text.
3. **Normalizer**: Infers missing fields (`id`, `title`, `type`, `summary`) and standardizes data structures.
4. **Validator**: Enforces schema rules and prevents invalid objects from entering the pipeline.
5. **Resolver**: Resolves string references into bidirectional graph links (`links.related`, `links.topics`).
6. **Builder**: Constructs output indexes, JSON databases, feeds, and HTML static pages.
7. **Exporter**: Writes compiled static files and copies assets to `/dist`.
