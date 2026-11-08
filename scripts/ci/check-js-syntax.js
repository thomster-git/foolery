#!/usr/bin/env node
// Syntax-checks website/static/**/*.js and inline <script> blocks in website/templates/**/*.html
// and website/static/**/*.html. Node built-ins only. Exit 1 on any syntax error.
// Usage: node scripts/ci/check-js-syntax.js [--strict]
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const STRICT = process.argv.slice(2).includes('--strict');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const staticDir = path.join(root, 'website/static');
const templateDir = path.join(root, 'website/templates');

// Legacy static files with pre-existing broken inline JS; promote by removing once fixed.
const LEGACY_WARN_FILES = new Set([
]);

let checked = 0;
const errors = [];
const warnings = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const rel = f => path.relative(root, f).split(path.sep).join('/');

const recordFailure = (fileRel, label, detail) => {
  const msg = `${label}: ${detail}`;
  if (!STRICT && LEGACY_WARN_FILES.has(fileRel)) warnings.push(msg);
  else errors.push(msg);
};

for (const file of walk(staticDir).filter(f => f.endsWith('.js')).sort()) {
  checked++;
  const fileRel = rel(file);
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (r.status !== 0) {
    const detail = (r.stderr || '').trim().split('\n').slice(0, 4).join(' | ');
    recordFailure(fileRel, fileRel, detail);
  }
}

const htmlFiles = [
  ...walk(templateDir).filter(f => f.endsWith('.html')),
  ...walk(staticDir).filter(f => f.endsWith('.html')),
].sort();

for (const file of htmlFiles) {
  const fileRel = rel(file);
  const isTemplate = file.startsWith(templateDir + path.sep);
  const html = fs.readFileSync(file, 'utf8');
  let i = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    i++;
    const a = m[1];
    if (/\bsrc\s*=/i.test(a) || !m[2].trim()) continue;
    const tm = a.match(/\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const type = (tm ? (tm[1] ?? tm[2] ?? tm[3]) : '').trim();
    if (type && !/^(?:text\/javascript|module|application\/javascript)$/i.test(type)) continue; // json, ld+json, templates
    // Neutralise template placeholders ({{x}}) in template HTML so they parse cleanly.
    const code = isTemplate ? m[2].replace(/\{\{\{?[^}]*\}?\}\}/g, '0') : m[2];
    const label = `${fileRel} <script #${i}>`;
    checked++;
    if (/^module$/i.test(type)) {
      const r = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: code, encoding: 'utf8' });
      if (r.status !== 0) {
        const detail = (r.stderr || '').trim().split('\n').slice(0, 4).join(' | ');
        recordFailure(fileRel, label, detail);
      }
    } else {
      try { new vm.Script(code, { filename: label }); }
      catch (e) { recordFailure(fileRel, label, e.message); }
    }
  }
}

if (warnings.length) {
  console.log(`\n[WARN] js-syntax-legacy (${warnings.length})`);
  warnings.forEach(x => console.log('  - ' + x));
}
if (errors.length) {
  console.error(`\n[ERROR] js-syntax (${errors.length})`);
  errors.forEach(x => console.error('  - ' + x));
}
console.log(`check-js-syntax: ${checked} script(s) checked, ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
