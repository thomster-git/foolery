# Thoms Foolery Monday Dispatch — Release v1.6.0

**Subject:** Patch Notes: v1.6.0 (DIY Product Photography Studio, Storefront Launch, 3D Umpire Scorecard Sharing, Full Ocarina Songbook, ESPN Data Resilience & CI Gates)  
**Description:** New DIY tabletop photography article with live store integration, launch of the digital coaster & goods storefront, Umpire Simulator 4:3 overhaul & PNG scorecard clipboard share, full Song of Time & Storms transcriptions, dynamic rolling-window sports analytics with offline test suite, and CI quality gates.  
**Date:** Monday, November 9, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday! Today marks **Release v1.6.0**—rolling up everything we’ve engineered, shipped, and hardened over the past week since our `v1.5.0` milestone on November 2.

This past week has been a huge bridge between the physical workshop and our digital platform. We launched our digital maker storefront at `/store` alongside an exhaustive, open-source technical guide on tabletop product photography using a Sony a6400 and Darktable (featuring real studio shots of our engraved slate, timber, and marble coasters). We overhauled the **3D MLB Umpire Pitch Simulator** with a broadcast 4:3 viewport, responsive Statcast placement, and one-click PNG scorecard clipboard sharing. We added complete multi-phrase transcriptions for the **Song of Time**, **Song of Storms**, and the **Title Theme** to the Ocarina Studio. We added dynamic rolling moving-average windows to our sports analyzers, hardened our ESPN data pipelines with automatic retries and offline testing, expanded the schedule calendar to a 24-hour canvas, and established a production-grade CI quality gate with sitewide SEO and domain unification.

Here is the complete breakdown of everything that has landed in **v1.6.0** since `v1.5.0`.

---

## 1. New Essay: DIY Tabletop Product Photography with a Sony a6400 & Darktable 📸🎨

Setting up our new digital storefront brought an immediate operational challenge: photographing dark charcoal slate with microscopic laser stippling right alongside warm natural wood and polished white marble. Smartphone auto-exposure and living room ceiling lights quickly fall apart when shooting high-contrast materials.

Rather than buying expensive photo tents or paying monthly subscription fees for proprietary editing software, we engineered a simple, highly repeatable studio system using gear already around the workshop.

Our new long-form technical article breaks down the entire process from physical staging to one-click batch export:

### 📐 Physical Staging: Why an Open Sweep Beats a Box
* **The Infinity Sweep:** Why a single sheet of flexible matte white board creates a seamless horizon curve, outperforming rigid cube shelves, wooden lightboxes, and creased fabric backdrops (which cause destructive green color spill on stone and wood).
* **The Physics of Wrap and Grounding:** Using a single 50x70cm softbox close to a 4-inch coaster to create a soft, wrap-around diffuse fill while preserving a subtle, natural contact shadow to anchor the item physically to the surface.

### 📷 Camera Calibration & Memory Recall (MR 1)
* **Optical Sweet Spot (35mm @ f/8.0):** Overcoming the power-zoom kit lens's wide-angle barrel distortion at 16mm and edge-softening at 50mm by locking focal length to 35mm (52.5mm full-frame eq.) and f/8.0 for crisp edge-to-edge depth of field.
* **Locked Studio Baseline:** Fixed ISO 100 on a tripod, 1/15s exposure, custom white balance sampled directly from the illuminated sweep, e-Front Curtain Shutter, and turning SteadyShot off on a tripod to prevent internal gyro drift. Saved into **MR Slot 1** on the mode dial for instant one-second setup recall.

### 🧪 Non-Destructive RAW Mastering in Darktable
* **Optical Weight in 1:1 Cropping:** Constraining crops to square e-commerce tiles while leaving 15% extra headroom above the coaster so products feel grounded rather than sinking.
* **The Two-Mountain Histogram (`rgb levels`):** Sampling the right-hand backdrop mountain to snap off-white paper to clean `#FFFFFF` while protecting the dark slate peak on the left and lifting midtones (~0.38) to reveal natural cleavage and split edges.
* **Carving Laser Stippling (`local contrast`):** Using the Local Laplacian filter (`Detail: 150%`, `Highlights: 75%`) to separate frosty laser-fractured mineral stipples from dark stone without introducing artificial sharpening halos.
* **Erasing Circular Support Stands:** Neutralizing bright blue display stands on round coasters via the 5-second `color equalizer` saturation drop (`-100%`) or the `retouch` clone path tool.
* **Batch Processing & 1200x1200 WebP Exports:** Copying the history stack across 16 product shots in seconds and exporting 1200x1200 WebP assets at 90 quality (~65–95 KB each), delivering instantaneous load times with retina-grade sharpness.

👉 **Read the full photography guide:** [thomsfoolery.com/articles/diy-product-photography-sony-a6400-darktable.html](https://thomsfoolery.com/articles/diy-product-photography-sony-a6400-darktable.html)

---

## 2. Digital Storefront Launch & Maker Catalog (`/store`) ☕🛍️

Alongside the photography guide, we officially opened our digital storefront at `/store`, showcasing our inaugural lineup of laser-engraved goods:

* **Natural Chipped Slate Coasters (Square & Circle):** Heavyweight, tactile dark charcoal stone featuring our Santa, Nativity, Sleigh, and Puppy engravings, complete with natural split-edge borders and protective foam feet.
* **Solid Pine / Timber Coasters:** Warm, natural wood blanks engraved with high-detail illustrations and sealed against condensation.
* **Carrara Marble & Acacia Split Coasters:** Elegant combination blanks pairing cool, veined Carrara marble with rich, grain-matched acacia wood.
* **3-Tier Lemon Squeezy Checkout Integration:** Clean, friction-free overlay purchasing for individual coasters, 4-pack gift sets, and custom bulk batches.
* **Custom Commission Routing:** Built an integrated project inquiry flow routing bespoke corporate, wedding, and event engravings directly to `social@thomsfoolery.com`.

👉 **Browse the inaugural collection:** [thomsfoolery.com/store/](https://thomsfoolery.com/store/)

---

## 3. 3D MLB Umpire Pitch Simulator: 4:3 Broadcast Overhaul & Scorecard Sharing ⚾🥽

Our home-plate umpire simulator received a major layout overhaul and social sharing upgrade this week:

* **Vertical 4:3 Broadcast Viewport:** Shifted the 3D game canvas to a classic vertical 4:3 aspect ratio, faithfully matching standard television behind-the-dish camera angles.
* **Responsive Statcast Sidebar:** Re-architected the layout so the real-time pitch telemetry sidebar sits neatly beside the canvas on desktop screens (`1440x900`) and stacks smoothly below the viewport on mobile devices (`390x844`), eliminating horizontal scrolling.
* **One-Click Scorecard Image Clipboard Share:** Upon ringing up the final batter, players can now click **Share Scorecard** to generate a crisp PNG graphic copied directly to the clipboard (`navigator.clipboard.write`) for effortless pasting into Discord, Twitter/X, and Reddit, backed by an automatic download fallback.
* **Virtual Strike Zone Plane:** Added interactive visual collision feedback that highlights the rulebook pentagonal prism strike zone plane when evaluating borderline pitches.
* **MLB Seasonal Benchmark Footnote:** Added a contextual scorecard footnote benchmarking your game performance against real Major League Baseball umpire averages (~150–160 pitches per game, ~92.5% overall accuracy, and ~88% shadow-zone edge accuracy).
* **Mobile Touch & Scroll Polish:** Added `touch-action: manipulation` to prevent mobile double-tap zoom delays and fixed a grid blowout issue in the recent-pitches history scrollbar.

👉 **Step behind the dish:** [thomsfoolery.com/tools/umpire-simulator/](https://thomsfoolery.com/tools/umpire-simulator/)

---

## 4. Ocarina of Time Practice Studio: Full Song of Time, Song of Storms & Title Theme 🎵🛡️

The Ocarina Practice Tool expanded its repertoire from quick 6-note N64 memory warps to full, multi-phrase acoustic transcriptions for the 12-hole Alto C ocarina:

* **Song of Time (Full Version):** Complete multi-phrase melodic arrangement (`A5 D5 F5 | x2 | A5 C6 B5 G5 | F5 G5 A5 D5 | C5 E5 D5`).
* **Song of Storms (Full Version):** Exhaustive multi-phrase windmill melody with lower/upper octave transitions (`D5 F5 D6 | x2 | E6 F6 E6 F6 E6 C6 A5 | A5 D5 F5 G5 A5 | A5 D5 F5 G5 E5 | D5 F5 D6 | x2 | E6 F6 E6 F6 E6 C6 A5 | A5 D5 F5 G5 A5 A5 D5`).
* **Title Theme (Main Menu):** Added the complete opening arpeggios and soaring high phrases for the iconic Ocarina of Time title screen.
* **Epona's Song & Scale Polish:** Corrected tab accuracy across classic tunes and consolidated 12-hole fingering charts for seamless practice and stream overlay display.

👉 **Practice the full songbook:** [thomsfoolery.com/tools/ocarina/](https://thomsfoolery.com/tools/ocarina/)

---

## 5. Sports Trend Analyzers: Dynamic Rolling Windows & ESPN Data Resilience 📊🏈🏒⚾

Our sports analytics tools (NFL, NHL, MLB) received significant analytical depth and upstream resilience this week:

* **Dynamic Rolling Moving-Average Windows:** Added 3-game, 5-game, and 10-game moving-average smoothing selectors across the NFL, NHL, and MLB trend analyzers, letting you cut through single-game noise to identify true underlying momentum.
* **Smart Context-Aware Visibility:** The rolling window selector dynamically appears only for metrics where moving averages make mathematical sense (such as goal differentials, point pace, scoring rates, and win %) and automatically tucks away for cumulative records.
* **ESPN API Data Resilience Engine (`AtlasFetch`):**
  * Engineered `website/static/js/espn-client.js` featuring bounded retries with exponential backoff, random jitter, and strict payload schema validation.
  * Added `sessionStorage` TTL caching (`TTL_SCHEDULE_MS`, `TTL_COMPLETED_SUMMARY_MS`) and stale-cache fallback so charts render instantaneously on repeat visits or during temporary upstream network hiccups.
  * Resolved an NFL API `rawGamesList` ReferenceError that could stall schedule parsing during edge-case game states.
  * Added user-friendly error banners with working **Retry** buttons, clear offseason/zero-game notices, and subtle partial-data warnings.
* **Automated Upstream Health & Offline Tests:**
  * Added an automated daily GitHub Actions workflow (`.github/workflows/api-health.yml`) running at 09:17 UTC to validate ESPN JSON structures and alert us to upstream schema shifts.
  * Built an offline Node VM test suite (`scripts/api-health/test-analyzers.js`) with 21 unit and integration tests verifying error recovery and chart generation without external network calls.

👉 **Explore the sports analyzers:** [thomsfoolery.com/tools/nfl-trend-analyzer/](https://thomsfoolery.com/tools/nfl-trend-analyzer/) | [thomsfoolery.com/tools/nhl-trend-analyzer/](https://thomsfoolery.com/tools/nhl-trend-analyzer/) | [thomsfoolery.com/tools/baseball-trend-analyzer/](https://thomsfoolery.com/tools/baseball-trend-analyzer/)

---

## 6. Live Stream Schedule: 24-Hour Timeline & Overnight Flow 📺📅

Our broadcast calendar at `/tools/stream-schedule/` received key quality-of-life improvements for multi-timezone and late-night viewing:

* **Full 24-Hour Scrollable Grid:** Expanded the schedule grid to cover a full 12:00 AM to 11:59 PM day, with intelligent initial viewport scrolling that anchors smoothly to 7:00 AM on page load.
* **Overnight Event Continuation:** Late-night coding and gaming sessions crossing past midnight now seamlessly continue into the next day's column rather than cutting off at 11:59 PM.
* **Live Current-Time Indicator:** Added a dynamic red horizontal marker and pulsing timestamp line that continuously tracks current local time across the active day column.

👉 **Check the broadcast schedule:** [thomsfoolery.com/tools/stream-schedule/](https://thomsfoolery.com/tools/stream-schedule/)

---

## 7. Embedded Knowledge Graph & Discord Community Architecture Consolidation 🌐📜

* **Interactive Graph Embedded in Manifesto:** Readers can now interact directly with our 3D force-directed Knowledge Graph inside the Project Atlas Manifesto article ([manifesto.html](https://thomsfoolery.com/articles/manifesto.html)), exploring connected ideas without having to navigate away to the dedicated `/graph/` page.
* **Discord Community OS Consolidation:** Merged our standalone Discord AI Bot architecture notes into our premier long-form systems essay, [The Architecture of an Autonomous Community Operating System](https://thomsfoolery.com/articles/building-a-comprehensive-discord-ecosystem.html) (now 7,148 words), providing a single definitive guide on role structures, webhook pipelines, and automated bot moderation.
* **Graph Cleanliness & Cache Busting:** Removed orphaned topic/theme nodes from `graph.json`, unified node color hierarchies, and implemented versioned cache-busting (`?v=1.5.2`) to prevent stale graphs.

---

## 8. Engineering & CI Quality Gates: Production Hardening 🛡️⚡

To ensure our zero-database, static-first architecture stays rock solid as the site expands, we introduced an automated continuous integration pipeline:

* **GitHub Actions CI Quality Gate (`.github/workflows/ci.yml`):** Automatically executes on all pull requests and pushes to release branches, blocking broken builds before deployment.
* **Automated `npm run check` Pipeline:**
  * **JS Syntax Verification (`check-js-syntax.js`):** Validates AST syntax across 54 client-side and build scripts.
  * **Content & Frontmatter Validation (`check-content.js`):** Enforces schema compliance and verifies relationship links across all 43 markdown documents.
  * **Distribution Verification (`check-dist.js`):** Audits 202 generated HTML files for valid canonical URLs, unescaped tags, and asset integrity.
  * **Pure-Math Unit Test Suite (`test-tool-math.js`):** 12 unit tests verifying core algorithms—including F1 championship clinch scenarios, Ocarina MIDI acoustics, Umpire 3D Statcast kinematics, and Pythagorean expected win calculations.
  * **Headless Browser Smoke Testing (`smoke-tools.js`):** Automatically spins up headless Chromium to verify all 12 interactive tool routes with zero console errors.
* **Sitewide SEO & Domain Unification:**
  * Standardized canonical apex domain `https://thomsfoolery.com` across all 202 HTML pages, sitemaps, and feeds.
  * Expanded `sitemap.xml` to 125 URLs (exact 1-to-1 match with all indexable canonical routes).
  * Hardened 280 Schema.org JSON-LD structured data blocks using safe unicode escaping (`\u003c`).
  * Standardized OpenGraph preview imagery across all tools to high-resolution `og-card.jpg` (1200x670).
* **Repository Cleanup:** Archived 40 root-level codemod scripts into `scripts/archive/`, removed build logs and temporary batch files, and untracked ephemeral scratch directories.

---

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
