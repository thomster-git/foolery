#!/usr/bin/env node
// Lightweight offline a11y audit of built output (Node built-ins only, no browser).
// Usage: node scripts/ci/a11y-audit.js [distDir] [--all] [--strict]
// Checks: lang, title, single <main>, h1 count/heading skips, img alt, unlabeled
// form controls, icon-only buttons/links, generic link text, theme contrast.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const ALL = args.includes('--all');
const STRICT = args.includes('--strict');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.resolve(args.find(a => !a.startsWith('--')) || path.join(root, 'website/dist'));

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const findings = [];
const add = (cls, page, msg) => findings.push({ cls, page, msg });
const text = s => s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, ' ').trim();

// ---- contrast ----
const lum = hex => {
  const n = parseInt(hex.slice(1), 16);
  return [16, 8, 0].map(sh => ((n >> sh) & 255) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
function vars(css, selector) {
  const m = css.match(new RegExp(selector.replace(/[[\]"]/g, '\\$&') + '\\s*{([^}]*)}'));
  const o = {};
  if (m) for (const [, k, v] of m[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b/g)) o[k] = v;
  return o;
}
const cssPath = path.join(dist, 'css/atlas.css');
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const light = vars(css, ':root');
  const dark = { ...light, ...vars(css, '[data-theme="dark"]') };
  for (const [name, t] of [['light', light], ['dark', dark]]) {
    for (const fg of ['--text-main', '--text-muted', '--text-dim', '--accent-cyan']) {
      for (const bg of ['--bg-dark', '--bg-card']) {
        if (!t[fg] || !t[bg]) continue;
        const r = ratio(t[fg], t[bg]);
        if (r < 4.5) add('contrast', `css:${name}`, `${fg} on ${bg} = ${r.toFixed(2)}:1 (<4.5)`);
      }
    }
    if (t['--accent-indigo']) {
      const r = ratio('#FFFFFF', t['--accent-indigo']);
      if (r < 4.5) add('contrast', `css:${name}`, `white on --accent-indigo = ${r.toFixed(2)}:1`);
    }
  }
  if (!/prefers-reduced-motion/.test(css)) add('reduced-motion', 'css', 'no prefers-reduced-motion rule');
  if (!/:focus-visible/.test(css)) add('focus', 'css', 'no :focus-visible rule');
} else add('css-missing', 'css', cssPath);

// ---- pages ----
const pages = fs.existsSync(dist) ? walk(dist) : [];
for (const f of pages) {
  const rel = path.relative(dist, f);
  const html = fs.readFileSync(f, 'utf8');
  if (/http-equiv=["']refresh/i.test(html)) continue; // skip redirect stubs
  if (!/<html[^>]*\slang="[a-z]/i.test(html)) add('lang', rel, 'missing html lang');
  if (!/<title>[^<]+<\/title>/i.test(html)) add('title', rel, 'missing title');
  const mains = (html.match(/<main[\s>]/gi) || []).length;
  if (mains !== 1) add('main-count', rel, `${mains} <main> elements`);
  const hs = [...html.matchAll(/<h([1-6])[\s>]/gi)].map(m => +m[1]);
  if (hs.filter(h => h === 1).length !== 1) add('h1-count', rel, `${hs.filter(h => h === 1).length} h1`);
  for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) { add('heading-skip', rel, `h${hs[i - 1]} -> h${hs[i]}`); break; }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) if (!/\salt=/.test(tag)) add('img-alt', rel, tag.slice(0, 80));
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const a = m[2];
    if (/type="(hidden|submit|button|checkbox-hidden)"/i.test(a)) continue;
    const id = (a.match(/\sid="([^"]+)"/) || [])[1];
    const labelled = /aria-label(ledby)?=|\btitle=/.test(a) || (id && new RegExp(`for="${id}"`).test(html));
    if (!labelled) add('form-label', rel, m[0].slice(0, 80));
  }
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    if (!text(m[2]) && !/aria-label(ledby)?=/.test(m[1])) add('button-name', rel, m[0].slice(0, 80));
    else if (!/aria-label(ledby)?=/.test(m[1]) && /^[^\w]{1,4}$/u.test(text(m[2]))) add('button-name', rel, 'symbol-only: ' + m[0].slice(0, 80));
  }
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const t = text(m[2]).toLowerCase();
    if (!t && !/aria-label|<img[^>]+alt="[^"]+"/.test(m[1] + m[2])) add('link-name', rel, m[0].slice(0, 80));
    if (['click here', 'here', 'read more', 'more'].includes(t) && !/aria-label/.test(m[1])) add('link-text', rel, t);
  }
}

const byClass = {};
for (const f of findings) (byClass[f.cls] ||= []).push(f);
for (const [cls, list] of Object.entries(byClass)) {
  console.log(`\n[${cls}] ${list.length}`);
  for (const f of ALL ? list : list.slice(0, 5)) console.log(`  ${f.page}: ${f.msg}`);
}
console.log(`\na11y-audit: ${pages.length} pages, ${findings.length} findings`);
process.exit(STRICT && findings.length ? 1 : 0);
