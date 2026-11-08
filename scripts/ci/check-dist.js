#!/usr/bin/env node
// Quality gate for built output (website/dist). Node built-ins only.
// Usage: node scripts/ci/check-dist.js [--strict] [--all] [distDir]
//   --strict  treat every warning as an error
//   --all     print every finding instead of the first few per class
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const ALL = args.includes('--all');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.resolve(args.find(a => !a.startsWith('--')) || path.join(root, 'website/dist'));

// Severity per finding class. 'error' = gate fails; 'warn' = reported only.
// Classes currently clean are errors (regression guard). Legacy-failing classes are warnings;
// promote them to 'error' once cleaned up.
const SEVERITY = {
  'jsonld-invalid': 'error',
  'placeholder-leak': 'error',
  'sitemap-missing-file': 'error',
  'sitemap-bad-url': 'error',
  'sitemap-missing': 'error',
  'canonical-relative': 'error',
  'title-missing': 'error',
  'broken-link': 'error',
  'broken-asset': 'error',
  'not-in-sitemap-content': 'error', // articles/ + projects/ pages
  'anchor-missing': 'error',
  'noindex-in-sitemap': 'error',
  'not-in-sitemap': 'warn', // legacy: tags/, library/, hubs and tool pages absent from sitemap
  'canonical-missing': 'warn', // legacy: a few tools/* pages
  'description-missing': 'warn', // legacy: a few tools/* pages
  'h1-count': 'warn', // legacy: labyrinth*, some tools/*
};
const OVERRIDES = {}; // filled in below after triage

const findings = [];
const add = (cls, page, msg) => findings.push({ cls, page, msg });

if (!fs.existsSync(dist)) { console.error(`dist not found: ${dist} (run npm run build)`); process.exit(2); }

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const files = walk(dist).sort();
const htmlFiles = files.filter(f => f.endsWith('.html'));
const rel = f => path.relative(dist, f).split(path.sep).join('/');

function resolves(urlPath) {
  // urlPath: decoded, absolute, no query/hash. Returns file path or null.
  const p = path.join(dist, urlPath);
  if (p !== dist && !p.startsWith(dist + path.sep)) return null;
  const cands = [p, p + '.html', path.join(p, 'index.html')];
  for (const c of cands) {
    try { if (fs.statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : null;
};
const decodeEnt = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'").replace(/&#x2F;/gi, '/');
const stripTags = s => s.replace(/<[^>]*>/g, '').trim();

const idCache = new Map();
function idsOf(file) {
  if (!idCache.has(file)) {
    const h = fs.readFileSync(file, 'utf8');
    const ids = new Set();
    for (const m of h.matchAll(/\s(?:id|name)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi)) {
      ids.add(m[1] ?? m[2] ?? m[3]);
    }
    // Interactive tool pages with a window.location.hash router deep-link directly to data-tab="<key>".
    if (/\blocation\.hash\b/.test(h)) {
      for (const m of h.matchAll(/\sdata-tab\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/gi)) {
        ids.add(m[1] ?? m[2] ?? m[3]);
      }
    }
    idCache.set(file, ids);
  }
  return idCache.get(file);
}

const indexable = new Map(); // normalized url key -> { u, file }
const noindexPages = new Set();

for (const file of htmlFiles) {
  const page = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  // Strip script/style bodies for text-level checks; keep for ld+json separately.
  const body = html.replace(/<script\b[\s\S]*?<\/script>/gi, m => /<script[^>]*src=/i.test(m.split('>')[0]) ? m : '')
                   .replace(/<style\b[\s\S]*?<\/style>/gi, '')
                   .replace(/<!--[\s\S]*?-->/g, '');
  // Documentation that shows template syntax inside <code>/<pre> is not leakage.
  const visibleText = body.replace(/<(code|pre)\b[\s\S]*?<\/\1>/gi, '');

  // --- JSON-LD
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type\s*=\s*["']?application\/ld\+json/i.test(m[1])) {
      try { JSON.parse(m[2]); } catch (e) { add('jsonld-invalid', page, e.message); }
    }
  }

  // --- Template leakage (HTML markup + text only; JS/CSS bodies excluded)
  const leakRes = [
    ['{{placeholder}}', /\{\{[^}]*\}\}/],
    ['${...}', /\$\{[^}]*\}/],
    ['[object Object]', /\[object Object\]/],
    ['undefined', /(?<![\w.\-/])undefined(?![\w\-])/],
  ];
  for (const [label, re] of leakRes) {
    const m = visibleText.match(re);
    if (m) {
      const i = m.index;
      add('placeholder-leak', page, `${label}: …${visibleText.slice(Math.max(0, i - 30), i + 50).replace(/\s+/g, ' ')}…`);
    }
  }

  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) || [html])[0];
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
  const robots = metas.find(t => /name\s*=\s*["']robots["']/i.test(t));
  const noindex = robots && /noindex/i.test(attr(robots, 'content') || '');
  // Redirect stubs (meta refresh) are not real pages.
  const isRedirect = metas.some(t => /http-equiv\s*=\s*["']refresh["']/i.test(t));
  if (isRedirect) continue;
  if (noindex) noindexPages.add(page);

  // --- Canonical
  const canon = [...head.matchAll(/<link\b[^>]*>/gi)].map(m => m[0]).find(t => /rel\s*=\s*["']canonical["']/i.test(t));
  let canonUrl = null;
  if (!canon) add('canonical-missing', page, 'no <link rel="canonical">');
  else {
    canonUrl = decodeEnt(attr(canon, 'href') || '');
    if (!/^https?:\/\/[^/]+/i.test(canonUrl)) add('canonical-relative', page, `canonical not absolute: "${canonUrl}"`);
  }

  // --- title / description / h1
  const t = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!t || !stripTags(t[1])) add('title-missing', page, 'missing/empty <title>');
  const d = metas.find(x => /name\s*=\s*["']description["']/i.test(x));
  if (!d || !(attr(d, 'content') || '').trim()) add('description-missing', page, 'missing/empty meta description');
  const h1s = (body.match(/<h1\b/gi) || []).length;
  if (h1s !== 1) add('h1-count', page, `${h1s} <h1> elements`);

  // --- Indexable registry (deduplicate <slug>.html + <slug>/index.html alias pairs)
  if (!noindex && page !== '404.html') {
    const u = '/' + page.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
    const k = u.replace(/(.)\/$/, '$1');
    if (!indexable.has(k) || u.endsWith('/')) indexable.set(k, { u, file });
  }

  // --- Links & assets
  const refs = [];
  for (const m of body.matchAll(/<(a|link|script|img|source|iframe|video|audio)\b[^>]*>/gi)) {
    const tag = m[0], name = m[1].toLowerCase();
    if (name === 'link' && /rel\s*=\s*["'](?:canonical|alternate)["']/i.test(tag)) continue;
    const v = (name === 'a' || name === 'link') ? attr(tag, 'href') : attr(tag, 'src');
    if (v) refs.push({ v: decodeEnt(v.trim()), kind: (name === 'a') ? 'link' : 'asset' });
    const ss = attr(tag, 'srcset');
    if (ss) for (const part of ss.split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) refs.push({ v: decodeEnt(u), kind: 'asset' }); }
  }
  for (const { v, kind } of refs) {
    if (!v || v === '#' || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(v)) continue;
    if (/\{\{|\$\{/.test(v)) continue;
    let [pathPart, hash] = [v, ''];
    const hi = v.indexOf('#'); if (hi >= 0) { pathPart = v.slice(0, hi); hash = v.slice(hi + 1); }
    pathPart = pathPart.split('?')[0];
    let target;
    if (!pathPart) target = file;
    else {
      let up = pathPart;
      try { up = decodeURI(pathPart); } catch {}
      if (!up.startsWith('/')) up = path.posix.join('/' + path.posix.dirname(page), up);
      target = resolves(path.posix.normalize(up));
      if (!target) { add(kind === 'link' ? 'broken-link' : 'broken-asset', page, v); continue; }
    }
    if (hash && target.endsWith('.html') && !idsOf(target).has(decodeURIComponent(hash)) && !/^(?:top|!.*)$/.test(hash))
      add('anchor-missing', page, v);
  }
}

// --- Sitemap
const smFile = path.join(dist, 'sitemap.xml');
if (!fs.existsSync(smFile)) add('sitemap-missing', 'sitemap.xml', 'sitemap.xml not found');
else {
  const xml = fs.readFileSync(smFile, 'utf8');
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m => decodeEnt(m[1]));
  const inMap = new Set();
  for (const loc of locs) {
    let u;
    try { u = new URL(loc); } catch { add('sitemap-bad-url', 'sitemap.xml', loc); continue; }
    const p = decodeURI(u.pathname);
    const f = resolves(p);
    if (!f) { add('sitemap-missing-file', 'sitemap.xml', loc); continue; }
    inMap.add(p.replace(/\/index\.html$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1'));
    if (noindexPages.has(rel(f))) add('noindex-in-sitemap', 'sitemap.xml', loc);
  }
  for (const [k, { u }] of indexable) {
    // Core content pages (articles/projects) are held to a stricter standard than legacy hubs/tags/library pages.
    if (!inMap.has(k)) add(/^\/(articles|projects)\/[^/]+$/.test(k) ? 'not-in-sitemap-content' : 'not-in-sitemap', u, 'indexable page missing from sitemap');
  }
}

// --- Report
const sev = c => STRICT ? 'error' : (OVERRIDES[c] || SEVERITY[c] || 'error');
const by = new Map();
for (const f of findings) { if (!by.has(f.cls)) by.set(f.cls, []); by.get(f.cls).push(f); }
let errors = 0, warnings = 0;
for (const [cls, list] of [...by].sort()) {
  const s = sev(cls);
  if (s === 'error') errors += list.length; else warnings += list.length;
  console.log(`\n[${s.toUpperCase()}] ${cls} (${list.length})`);
  for (const f of ALL ? list : list.slice(0, 5)) console.log(`  - ${f.page}: ${f.msg}`);
  if (!ALL && list.length > 5) console.log(`  … ${list.length - 5} more (use --all)`);
}
console.log(`\ncheck-dist: ${htmlFiles.length} html files, ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
