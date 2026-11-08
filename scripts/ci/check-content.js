#!/usr/bin/env node
// Sanity & integrity gate for Markdown frontmatter in content/**/*.md.
// Uses Node built-ins + existing Atlas core Parser/Normalizer.
// Usage: node scripts/ci/check-content.js [--strict] [--all] [contentDir]
//   --strict  treat every warning as an error
//   --all     print every finding instead of the first few per class
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from '../../website/core/parser.js';
import Normalizer from '../../website/core/normalizer.js';

const args = process.argv.slice(2);
const STRICT = args.includes('--strict');
const ALL = args.includes('--all');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const contentDir = path.resolve(args.find(a => !a.startsWith('--')) || path.join(root, 'content'));

const SEVERITY = {
  'frontmatter-missing': 'error',
  'missing-field': 'error',
  'summary-placeholder': 'error',
  'duplicate-id': 'error',
  'id-not-slug': 'error',
  'invalid-array-field': 'error',
  'related-broken': 'error',
  'ref-broken': 'error',
  'missing-summary-draft': 'warn',
  'related-broken-draft': 'warn',
  'ref-broken-draft': 'warn',
  'ref-type-mismatch': 'warn',
  'related-self': 'warn',
};

const SKIP_DIRS = new Set([
  'node_modules',
  'app',
  'hopeful-turing',
  'kdenlive_launch_video_project',
]);

if (!fs.existsSync(contentDir)) {
  console.error(`content directory not found: ${contentDir}`);
  process.exit(2);
}

function walkMarkdown(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkMarkdown(p, out);
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const rel = f => path.relative(root, f).split(path.sep).join('/');
const findings = [];
const add = (cls, fileRel, msg) => findings.push({ cls, fileRel, msg });

const mdFiles = walkMarkdown(contentDir).sort();
const rawObjects = mdFiles.map(f => ({
  path: f,
  raw: fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n'),
}));

const parser = new Parser();
const normalizer = new Normalizer();
const parsed = parser.parse(rawObjects);

const contentById = new Map(); // id -> { fileRel, metadata }
const knownIds = new Set();

// Optional external tweet IDs (matching website/main.js injection)
const tweetsPath = path.join(root, 'data/tweets.json');
if (fs.existsSync(tweetsPath)) {
  try {
    const tweets = JSON.parse(fs.readFileSync(tweetsPath, 'utf8'));
    if (Array.isArray(tweets)) {
      for (const t of tweets) {
        if (t && t.id && t.text) knownIds.add(`tweet-${t.id}`);
      }
    }
  } catch {}
}

const CORE_REQUIRED = ['id', 'title', 'type', 'status'];
const ARRAY_FIELDS = ['related', 'topics', 'themes', 'tags', 'series'];
const REF_FIELDS = ['related', 'topics', 'themes', 'series'];

// Pass 1: Frontmatter structure, required fields, array types, and unique IDs
for (let idx = 0; idx < parsed.length; idx++) {
  const item = parsed[idx];
  const raw = rawObjects[idx].raw;
  const fileRel = rel(item.path);
  const m = item.metadata || {};

  if (!/^---\s*\n[\s\S]*?\n---\s*(?:\n|$)/.test(raw)) {
    add('frontmatter-missing', fileRel, 'missing or malformed YAML frontmatter block (--- ... ---)');
    continue;
  }

  for (const field of CORE_REQUIRED) {
    const val = m[field];
    if (typeof val !== 'string' || !val.trim()) {
      add('missing-field', fileRel, `missing or empty required field "${field}"`);
    }
  }

  const status = typeof m.status === 'string' ? m.status.trim().toLowerCase() : '';
  const isDraft = status === 'draft';

  // summary: strictly required on non-draft content; warning if omitted on drafts
  const summary = typeof m.summary === 'string' ? m.summary.trim() : '';
  if (!summary) {
    add(isDraft ? 'missing-summary-draft' : 'missing-field', fileRel, 'missing or empty "summary"');
  } else if (!isDraft && /^coming soon\.?$/i.test(summary)) {
    add('summary-placeholder', fileRel, 'non-draft content still has placeholder summary "Coming soon."');
  }

  // Validate list fields before Normalizer coerces strings
  for (const field of ARRAY_FIELDS) {
    if (!(field in m)) continue;
    if (!Array.isArray(m[field])) {
      add('invalid-array-field', fileRel, `"${field}" must be a YAML block list ("- item"), got ${JSON.stringify(m[field])}`);
    }
  }

  if (typeof m.id === 'string' && m.id.trim()) {
    const id = m.id.trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      add('id-not-slug', fileRel, `id "${id}" must be lowercase kebab-case to resolve in relationships`);
    }
    if (contentById.has(id)) {
      add('duplicate-id', fileRel, `duplicate id "${id}" (already declared in ${contentById.get(id).fileRel})`);
    } else {
      contentById.set(id, { fileRel, metadata: m });
      knownIds.add(id);
    }
  }
}

// Pass 2: Validate related: and taxonomy references against known content IDs
for (const item of parsed) {
  const fileRel = rel(item.path);
  const m = item.metadata || {};
  const selfId = typeof m.id === 'string' ? m.id.trim() : '';
  const status = typeof m.status === 'string' ? m.status.trim().toLowerCase() : '';
  const isDraft = status === 'draft';

  for (const field of REF_FIELDS) {
    if (!Array.isArray(m[field])) continue;
    const refs = normalizer.toReferenceArray(m[field]);
    for (const refId of refs) {
      if (!refId) continue;
      if (field === 'related' && refId === selfId) {
        add('related-self', fileRel, `self-referential related id "${refId}"`);
        continue;
      }
      if (!knownIds.has(refId)) {
        if (field === 'related') {
          add(isDraft ? 'related-broken-draft' : 'related-broken', fileRel, `related id "${refId}" does not match any content id${isDraft ? ' (draft)' : ''}`);
        } else {
          add(isDraft ? 'ref-broken-draft' : 'ref-broken', fileRel, `${field} id "${refId}" does not match any content id${isDraft ? ' (draft)' : ''}`);
        }
        continue;
      }
      const target = contentById.get(refId);
      const targetType = target && typeof target.metadata.type === 'string' ? target.metadata.type.trim().toLowerCase() : '';
      if (field === 'topics' && targetType && targetType !== 'topic') {
        add('ref-type-mismatch', fileRel, `topics references "${refId}" which has type="${targetType}" (expected "topic")`);
      } else if (field === 'themes' && targetType && targetType !== 'theme') {
        add('ref-type-mismatch', fileRel, `themes references "${refId}" which has type="${targetType}" (expected "theme")`);
      }
    }
  }
}

// Report
const sev = c => STRICT ? 'error' : (SEVERITY[c] || 'error');
const by = new Map();
for (const f of findings) {
  if (!by.has(f.cls)) by.set(f.cls, []);
  by.get(f.cls).push(f);
}
let errors = 0, warnings = 0;
for (const [cls, list] of [...by].sort()) {
  const s = sev(cls);
  if (s === 'error') errors += list.length;
  else warnings += list.length;
  console.log(`\n[${s.toUpperCase()}] ${cls} (${list.length})`);
  for (const f of ALL ? list : list.slice(0, 5)) console.log(`  - ${f.fileRel}: ${f.msg}`);
  if (!ALL && list.length > 5) console.log(`  … ${list.length - 5} more (use --all)`);
}
console.log(`\ncheck-content: ${mdFiles.length} markdown files, ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
