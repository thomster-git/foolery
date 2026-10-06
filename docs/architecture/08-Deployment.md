# Deployment Architecture

> **Continuous Integration and static edge distribution.**

---

## Target Architecture

Project Atlas compiles to a pure static build directory (`/dist`). Because it requires no server-side runtime database, it can be deployed to any static host or CDN edge network.

---

## Deployment Strategy

1. **Build Step**: Executed via `npm run build` (`node website/main.js`).
2. **Artifact Verification**: Validate that `/dist/index.html`, `/dist/graph.json`, and all HTML pages are present.
3. **Edge Hosting**: Deployed to platforms like Cloudflare Pages, GitHub Pages, or Netlify with HTTP caching headers.
