import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.resolve(__dirname, "../static");
const PUBLIC_DIR = path.resolve(__dirname, "../public");

const imageDimCache = new Map();

/**
 * Escapes text for safe insertion into HTML attribute values and <title>.
 * Preserves existing valid HTML entities so strings are never double-escaped.
 */
export function escapeHtmlAttr(str) {
    return String(str ?? "")
        .replace(/&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Serializes a JSON-LD object safely inside a <script type="application/ld+json"> block,
 * escaping "<" as \u003c so "</script>" or "<!--" can never break out of the script tag.
 */
export function safeJsonLd(schemaObj, indent = 2) {
    const json = JSON.stringify(schemaObj, null, indent)
        .replace(/</g, "\\u003c")
        .replace(/\u2028/g, "\\u2028")
        .replace(/\u2029/g, "\\u2029");
    return `<script type="application/ld+json">\n${json}\n</script>`;
}

/**
 * Builds the global WebSite + Person publisher JSON-LD block.
 */
export function buildWebSiteSchema(siteUrl, description) {
    const base = String(siteUrl || "https://thomsfoolery.com").replace(/\/$/, "");
    return safeJsonLd({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${base}/#website`,
                "url": `${base}/`,
                "name": "Thoms Foolery",
                "description": String(description || ""),
                "publisher": {
                    "@type": "Person",
                    "@id": `${base}/#author`,
                    "name": "Jonathan Thoms",
                    "url": `${base}/`,
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${base}/images/logo.svg`
                    },
                    "image": `${base}/images/logo-512.png`
                }
            }
        ]
    });
}

/**
 * Canonical tag slugifier shared across page-builder, index-builder, and sitemap-builder.
 */
export function slugifyTag(tag) {
    return String(tag || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Parses PNG, JPEG, WebP, or GIF pixel dimensions from binary header bytes.
 */
export function readRasterDimensionsFromBuffer(buf) {
    if (!buf || buf.length < 24) return null;

    // PNG: 89 50 4E 47 0D 0A 1A 0A + IHDR width/height at bytes 16..23
    if (
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47 &&
        buf[4] === 0x0d &&
        buf[5] === 0x0a &&
        buf[6] === 0x1a &&
        buf[7] === 0x0a
    ) {
        return {
            width: buf.readUInt32BE(16),
            height: buf.readUInt32BE(20)
        };
    }

    // GIF87a / GIF89a
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
        return {
            width: buf.readUInt16LE(6),
            height: buf.readUInt16LE(8)
        };
    }

    // WebP: RIFF....WEBP
    if (
        buf.toString("ascii", 0, 4) === "RIFF" &&
        buf.toString("ascii", 8, 12) === "WEBP" &&
        buf.length >= 30
    ) {
        const chunk = buf.toString("ascii", 12, 16);
        if (chunk === "VP8 " && buf.length >= 30) {
            return {
                width: buf.readUInt16LE(26) & 0x3fff,
                height: buf.readUInt16LE(28) & 0x3fff
            };
        }
        if (chunk === "VP8L" && buf.length >= 25) {
            const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
            return {
                width: 1 + (((b1 & 0x3f) << 8) | b0),
                height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6))
            };
        }
        if (chunk === "VP8X" && buf.length >= 30) {
            return {
                width: 1 + buf.readUIntLE(24, 3),
                height: 1 + buf.readUIntLE(27, 3)
            };
        }
    }

    // JPEG: FF D8 ... scan for SOF markers (C0..CF except C4, C8, CC)
    if (buf[0] === 0xff && buf[1] === 0xd8) {
        let offset = 2;
        while (offset + 9 < buf.length) {
            if (buf[offset] !== 0xff) {
                offset++;
                continue;
            }
            while (offset < buf.length && buf[offset] === 0xff) offset++;
            if (offset >= buf.length) break;
            const marker = buf[offset];
            offset++;

            if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
                continue;
            }
            if (offset + 2 > buf.length) break;
            const segLen = buf.readUInt16BE(offset);
            if (segLen < 2 || offset + segLen > buf.length) break;

            if (
                marker >= 0xc0 &&
                marker <= 0xcf &&
                marker !== 0xc4 &&
                marker !== 0xc8 &&
                marker !== 0xcc
            ) {
                if (offset + 7 <= buf.length) {
                    return {
                        height: buf.readUInt16BE(offset + 3),
                        width: buf.readUInt16BE(offset + 5)
                    };
                }
                break;
            }
            offset += segLen;
        }
    }

    return null;
}

/**
 * Resolves a site image URL (e.g. "https://thomsfoolery.com/images/og-card.jpg" or "/images/og-card.jpg")
 * to its local file in website/static or website/public and returns { width, height } or null.
 */
export function getLocalImageDimensions(imageUrl, siteUrl = "https://thomsfoolery.com") {
    if (!imageUrl) return null;
    const base = String(siteUrl).replace(/\/$/, "");
    let relPath = String(imageUrl).trim();
    if (relPath.startsWith(base)) {
        relPath = relPath.slice(base.length);
    } else if (/^https?:\/\//i.test(relPath)) {
        return null;
    }
    relPath = relPath.split("?")[0].split("#")[0].replace(/^\/+/, "");
    if (!relPath) return null;

    if (imageDimCache.has(relPath)) {
        return imageDimCache.get(relPath);
    }

    const candidates = [
        path.join(STATIC_DIR, relPath),
        path.join(PUBLIC_DIR, relPath)
    ];

    let dims = null;
    for (const filePath of candidates) {
        try {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const buf = fs.readFileSync(filePath);
                dims = readRasterDimensionsFromBuffer(buf);
                if (dims) break;
            }
        } catch {
            // ignore unreadable candidate
        }
    }

    imageDimCache.set(relPath, dims);
    return dims;
}

/**
 * Generates a lightweight HTML redirect stub for non-canonical URL aliases.
 */
export function buildRedirectStub(targetPath, title, siteUrl = "https://thomsfoolery.com") {
    const base = String(siteUrl).replace(/\/$/, "");
    const cleanCanonicalPath = String(targetPath).split("#")[0].split("?")[0] || "/";
    const canonicalUrl = `${base}${cleanCanonicalPath.startsWith("/") ? "" : "/"}${cleanCanonicalPath}`;
    const safeTitle = escapeHtmlAttr(`${title} — Thoms Foolery`);
    const safeTargetAttr = escapeHtmlAttr(targetPath);
    const hasQueryOrHash = targetPath.includes("?") || targetPath.includes("#");
    const jsRedirect = hasQueryOrHash
        ? `window.location.replace(${JSON.stringify(targetPath)});`
        : `window.location.replace(${JSON.stringify(targetPath)} + window.location.search + window.location.hash);`;

    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${safeTitle}</title><link rel="canonical" href="${escapeHtmlAttr(canonicalUrl)}"><meta http-equiv="refresh" content="0; url=${safeTargetAttr}"><script>${jsRedirect}</script></head><body><p>Redirecting to <a href="${safeTargetAttr}">${escapeHtmlAttr(title)}</a>...</p></body></html>`;
}
