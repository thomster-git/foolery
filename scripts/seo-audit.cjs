#!/usr/bin/env node
// Audits website/dist for SEO: domain consistency, robots.txt, bidirectional sitemap coverage,
// JSON-LD validity, unique titles/descriptions, canonical/OG/Twitter tags, and social card dimensions.
// Usage: node scripts/seo-audit.cjs [distDir]
const fs = require('fs');
const path = require('path');

const distArg = process.argv.slice(2).find((a) => !a.startsWith('--'));
const DIST = path.resolve(distArg || process.env.SEO_AUDIT_DIST || path.join(__dirname, '..', 'website', 'dist'));
const SITE = 'https://thomsfoolery.com';
const issues = [];
const bad = (m) => issues.push(m);

if (!fs.existsSync(DIST)) {
  console.error(`dist directory not found: ${DIST}`);
  process.exit(2);
}

function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const decodeEnt = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/gi, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x2F;/gi, '/');

const getAttr = (tag, attrName) => {
  const m = tag.match(new RegExp(`\\s${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>"']+))`, 'i'));
  return m ? decodeEnt(m[1] ?? m[2] ?? m[3] ?? '') : null;
};

function readRasterDims(buf) {
  if (!buf || buf.length < 24) return null;
  // PNG
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  }
  // WebP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP' && buf.length >= 30) {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L') {
      const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
      return {
        width: 1 + (((b1 & 0x3f) << 8) | b0),
        height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
      };
    }
    if (chunk === 'VP8X') {
      return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    }
  }
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) { offset++; continue; }
      while (offset < buf.length && buf[offset] === 0xff) offset++;
      if (offset >= buf.length) break;
      const marker = buf[offset++];
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) continue;
      if (offset + 2 > buf.length) break;
      const segLen = buf.readUInt16BE(offset);
      if (segLen < 2 || offset + segLen > buf.length) break;
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        if (offset + 7 <= buf.length) {
          return { height: buf.readUInt16BE(offset + 3), width: buf.readUInt16BE(offset + 5) };
        }
        break;
      }
      offset += segLen;
    }
  }
  return null;
}

const files = walk(DIST).sort();
const html = files.filter((f) => f.endsWith('.html'));
const urlOf = (f) => {
  let r = '/' + path.relative(DIST, f).replace(/\\/g, '/');
  r = r.replace(/(^|\/)index\.html$/, '$1');
  return r || '/';
};

function resolveDistHtml(urlPath) {
  const clean = decodeURI(urlPath.split('?')[0].split('#')[0]);
  const target = path.join(DIST, clean);
  if (target !== DIST && !target.startsWith(DIST + path.sep)) return null;
  const candidates = clean.endsWith('/')
    ? [path.join(target, 'index.html')]
    : [target, target + '.html', path.join(target, 'index.html')];
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile() && c.endsWith('.html')) return c;
    } catch {}
  }
  return null;
}

const imgDimCache = new Map();
function verifyImageUrl(label, imgUrl, pageUrl, declWidth, declHeight) {
  if (!imgUrl || !imgUrl.startsWith('https://')) {
    bad(`${label} missing/relative: ${pageUrl} (${imgUrl || 'empty'})`);
    return;
  }
  if (!imgUrl.startsWith(SITE + '/')) return;

  const relImg = decodeURI(imgUrl.slice(SITE.length).split('?')[0].split('#')[0]).replace(/^\/+/, '');
  const imgFile = path.join(DIST, relImg);
  if (!imgDimCache.has(imgFile)) {
    if (!fs.existsSync(imgFile) || !fs.statSync(imgFile).isFile()) {
      imgDimCache.set(imgFile, { missing: true });
    } else {
      const dims = readRasterDims(fs.readFileSync(imgFile));
      imgDimCache.set(imgFile, dims ? { dims } : { invalid: true });
    }
  }
  const info = imgDimCache.get(imgFile);
  if (info.missing) {
    bad(`${label} file missing: ${pageUrl} -> /${relImg}`);
    return;
  }
  if (info.invalid || !info.dims) {
    bad(`${label} not a valid raster image: ${pageUrl} -> /${relImg}`);
    return;
  }
  if (declWidth || declHeight) {
    const w = Number(declWidth);
    const h = Number(declHeight);
    if (w !== info.dims.width || h !== info.dims.height) {
      bad(`${label} dims mismatch: ${pageUrl} declared ${declWidth}x${declHeight} != actual ${info.dims.width}x${info.dims.height}`);
    }
  }
}

// 1. robots.txt validation
const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) {
  bad('robots.txt missing');
} else {
  const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
  if (!/^User-agent:\s*\*/im.test(robotsTxt)) bad('robots.txt missing "User-agent: *"');
  if (!new RegExp(`^Sitemap:\\s*${SITE.replace(/\./g, '\\.')}/sitemap\\.xml\\s*$`, 'im').test(robotsTxt)) {
    bad(`robots.txt missing "Sitemap: ${SITE}/sitemap.xml"`);
  }
}

// 2. Domain consistency across text outputs (excluding raw content JSON)
for (const f of files.filter((x) => /\.(html|xml|txt|json)$/.test(x) && !/(database|content|search|graph)\.json$/.test(x))) {
  const t = fs.readFileSync(f, 'utf8');
  if (/https?:\/\/www\.thomsfoolery\.com/i.test(t)) bad(`www ref: ${urlOf(f)}`);
  if (/yourdomain\.com/i.test(t)) bad(`placeholder: ${urlOf(f)}`);
}

// 3. Sitemap parsing
const smPath = path.join(DIST, 'sitemap.xml');
const smUrls = new Set();
if (!fs.existsSync(smPath)) {
  bad('sitemap.xml missing');
} else {
  const sm = fs.readFileSync(smPath, 'utf8');
  for (const m of sm.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    const loc = decodeEnt(m[1].trim());
    if (smUrls.has(loc)) bad(`dup sitemap loc: ${loc}`);
    smUrls.add(loc);
    if (!loc.startsWith(SITE + '/') && loc !== SITE) {
      bad(`sitemap off-domain loc: ${loc}`);
    }
  }
}

// 4. HTML head, JSON-LD, canonical, OG/Twitter, and uniqueness checks
const titles = new Map();
const descs = new Map();
const canonicalOwners = new Map();
const pageStatusByFile = new Map();
let ld = 0;
let indexableCount = 0;

for (const f of html) {
  const u = urlOf(f);
  const t = fs.readFileSync(f, 'utf8');
  const head = (t.match(/<head\b[\s\S]*?<\/head>/i) || [t])[0];
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);

  const findMeta = (attrKey, attrVal) => {
    const tag = metas.find((x) => (getAttr(x, attrKey) || '').toLowerCase() === attrVal.toLowerCase());
    return tag ? getAttr(tag, 'content') : null;
  };
  const findLinkHref = (relVal) => {
    const tag = links.find((x) => (getAttr(x, 'rel') || '').toLowerCase() === relVal.toLowerCase());
    return tag ? getAttr(tag, 'href') : null;
  };

  // Validate all JSON-LD blocks on every HTML file
  for (const m of t.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/type\s*=\s*["']?application\/ld\+json/i.test(m[1])) {
      ld++;
      try {
        JSON.parse(m[2]);
      } catch (e) {
        bad(`bad JSON-LD: ${u}: ${e.message}`);
      }
    }
  }

  const isRedirect = metas.some((x) => (getAttr(x, 'http-equiv') || '').toLowerCase() === 'refresh');
  const robotsContent = findMeta('name', 'robots') || '';
  const isNoindex = /\bnoindex\b/i.test(robotsContent);
  const is404 = u === '/404.html';
  const canon = findLinkHref('canonical');

  pageStatusByFile.set(f, { u, isRedirect, isNoindex, is404, canon });

  if (isRedirect) {
    if (!isNoindex) bad(`redirect missing noindex: ${u}`);
    if (smUrls.has(`${SITE}${u}`)) bad(`redirect in sitemap: ${u}`);
    continue;
  }

  const ogImg = findMeta('property', 'og:image');
  const ogImgW = findMeta('property', 'og:image:width');
  const ogImgH = findMeta('property', 'og:image:height');
  const twImg = findMeta('name', 'twitter:image') || findMeta('property', 'twitter:image');

  if (isNoindex || is404) {
    if (smUrls.has(`${SITE}${u}`)) bad(`noindex/404 in sitemap: ${u}`);
    if (ogImg) verifyImageUrl('og:image', ogImg, u, ogImgW, ogImgH);
    if (twImg) verifyImageUrl('twitter:image', twImg, u, null, null);
    continue;
  }

  indexableCount++;

  const titleMatch = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEnt(titleMatch[1].trim()) : '';
  const desc = (findMeta('name', 'description') || '').trim();

  if (!title) bad(`no title: ${u}`);
  else (titles.get(title) || titles.set(title, []).get(title)).push(u);

  if (!desc) bad(`no description: ${u}`);
  else (descs.get(desc) || descs.set(desc, []).get(desc)).push(u);

  if (!canon) {
    bad(`no canonical: ${u}`);
  } else {
    if (!canon.startsWith(SITE + '/') && canon !== SITE) bad(`canonical off-domain: ${u} -> ${canon}`);
    if (canonicalOwners.has(canon)) {
      bad(`dup canonical "${canon}": ${canonicalOwners.get(canon)}, ${u}`);
    } else {
      canonicalOwners.set(canon, u);
    }
    if (!smUrls.has(canon)) bad(`not in sitemap: ${u} (${canon})`);
  }

  const ogTitle = (findMeta('property', 'og:title') || '').trim();
  const ogDesc = (findMeta('property', 'og:description') || '').trim();
  const ogUrl = (findMeta('property', 'og:url') || '').trim();
  const twCard = (findMeta('name', 'twitter:card') || findMeta('property', 'twitter:card') || '').trim();

  if (!ogTitle) bad(`no og:title: ${u}`);
  if (!ogDesc) bad(`no og:description: ${u}`);
  if (!ogUrl) bad(`no og:url: ${u}`);
  else if (canon && ogUrl !== canon) bad(`og:url != canonical: ${u} (${ogUrl} != ${canon})`);

  verifyImageUrl('og:image', ogImg, u, ogImgW, ogImgH);

  if (!twCard) bad(`no twitter:card: ${u}`);
  verifyImageUrl('twitter:image', twImg, u, null, null);
}

// 5. Reverse sitemap check: every sitemap URL must resolve to an indexable file whose canonical == loc
for (const loc of smUrls) {
  let parsed;
  try {
    parsed = new URL(loc);
  } catch {
    bad(`invalid sitemap URL: ${loc}`);
    continue;
  }
  const resolved = resolveDistHtml(parsed.pathname);
  if (!resolved) {
    bad(`sitemap URL missing file: ${loc}`);
    continue;
  }
  const st = pageStatusByFile.get(resolved);
  if (!st) continue;
  if (st.isRedirect) bad(`sitemap URL points to redirect stub: ${loc}`);
  else if (st.isNoindex || st.is404) bad(`sitemap URL points to noindex/404 page: ${loc}`);
  else if (st.canon !== loc) bad(`sitemap URL != page canonical: ${loc} (page canonical: ${st.canon})`);
}

// 6. Global duplicate title & description checks across all indexable pages
for (const [k, v] of titles) {
  if (v.length > 1) bad(`dup title "${k}": ${v.join(', ')}`);
}
for (const [k, v] of descs) {
  if (v.length > 1) bad(`dup desc "${k.slice(0, 60)}": ${v.join(', ')}`);
}

console.log(`html=${html.length} indexable=${indexableCount} sitemapUrls=${smUrls.size} ldBlocks=${ld}`);
console.log(issues.length ? issues.join('\n') : 'OK: no issues');
process.exit(issues.length ? 1 : 0);
