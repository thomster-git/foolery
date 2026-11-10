# Project Atlas Launch Checklist

This file contains manual tasks you need to complete when deploying the site to a live domain.

## SEO & Domain
- [ ] **Buy/Connect Domain:** Ensure your domain (e.g., `thomsfoolery.com`) is connected to your host (Netlify, Vercel, Cloudflare Pages).
- [x] **Update Robots.txt:** Open `website/static/robots.txt` and replace `https://yourdomain.com` with your actual domain name.
- [x] **Update .env / Configs:** Ensure any environment variables or hardcoded base URLs in your project are set to the live domain so canonical URLs resolve correctly.
- [ ] **Google Search Console:** 
  1. Go to Google Search Console and add your domain as a property.
  2. Verify domain ownership (usually via DNS TXT record).
  3. Navigate to **Sitemaps** and submit `https://[your-domain]/sitemap.xml`.

## Social & Polish
- [ ] **Verify OG Card:** We generated a placeholder PNG for social sharing (`website/static/images/og-card.png`). If you have a custom logo or design you prefer, overwrite that file.
- [ ] **Test Links:** Paste your URL into Discord or Twitter to ensure the preview card looks correct.

## Release 1.7.0 Whiteboard & Feature Pipeline
- [x] **OSRS Bank Skilling & Magic/Alch Profit Calculator (`/tools/osrs-bank-skilling/`):** Standalone real-time GE profit calculator for Fletching, Herblore, Crafting, Magic (High Alch & Superheat), Smithing, and Cooking. Integrated with OSRS Wiki API, 2% GE tax logic, GP/XP metrics, and 4h buy limits. Added upgrade banner to `/tools/runescape-bond-tracker/` for staged decommissioning.
- [ ] **"Next Time I Go Up/Down" Hardware & App Spec:** IoT BLE RSSI proximity + directional break-beam sensor logic for stairway micro-task notifications.
- [ ] **Async Question & Opinion Queue ("Async Sync"):** Lightweight, zero-account, low-friction opinion queue for non-urgent decision batching.
- [ ] **Disability Awareness Front-Facing License Plates:** 12"x6" physical plate specs, clear communication icons, and in-vehicle emergency cards.

## Content & Guides Roadmap (Post-Launch)
- [ ] Write missing expansions for articles.
- [x] **Option A: Corporate Communication vs. Organic Communities (`discord-vs-corporate-comms.md`):** Why modern enterprise communication suites produce asynchronous burnout and fragmentation, contrasted with how modular Discord architectures enable low-friction community operations.
- [x] **Option C: Digital Garden Philosophy (`manifesto.md` / `my-story-with-everything-is-connected.md`):** The foundational essay behind Project Atlas—why chronological blogging fails associative thinking, and how an interconnected digital garden models systems-first exploration.
- [ ] Continue linking new thoughts using the `[[wikilink]]` syntax to expand the Knowledge Graph.
- [ ] **Ocarina of Time Remake Progression Guide & Audio Hub (Target: Nov 5):**
  - [ ] Playthrough notes, dungeon pathing, and authentic in-game screenshots along the journey.
  - [ ] Melody tab integration with our interactive N64 web player and printable PDF companion.
  - [ ] **Ocarina Practice Hub Audio/SVG Backlog:** Tracked in [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) (Littleroot & Blue Bird corrections, SVG medallion additions, and full OoT songbook arrangements).
- [ ] **Dragonwilds Compendium Expansion:**
  - [x] **Vault Timer Tool:** Countdown timer tracking the 3 in-game days (1h 12m / 72 mins) vault core respawn cycle for dedicated server players. *(Completed in v1.4.0)*
  - [x] **Skill Guide #1 — Comprehensive Fishing Guide:** Regional fishing spots, rod tiers, 15-species bait harvesting & pairing hierarchy, interactive species checklist, and cooking/alchemy recipe crossover. *(Expanded for v1.5.0)*
  - [x] **Dedicated Server Operations Manual:** On-page technical guide integrating official Jagex dedicated server specs, SteamCMD, UDP 7777 forwarding, and save transfer paths. *(Completed for v1.5.0)*
  - [ ] **Sharable Collection Goal / Supply Log:** Input required crafting materials -> generate greyed-out checklist -> shareable sync URL (overwrites `localStorage` via hash, matching profile card mechanics).
  - [ ] **Missing-Step Discovery Log:** Select discovered materials/recipes to grey out unobtained nodes and instantly reveal missed progression (e.g. Fractured Planes fishing before Fellhollow, blurite ore, missed recipes).
  - [ ] **Area-Based Quest Regrouping:** Re-organize all quests by physical area, with prerequisite gating warnings (e.g. quests started in early zones that require later-game unlocks).
  - [ ] **ADHD/Autistic-Friendly Lore Summaries:** Clear, executive-summary breakdowns of the opening lore and the first two core questlines (Valgar and Imaru).
  - [ ] **Vault Revisit Guides:** Optimal routing and checklists for efficient vault core collection and law rune siphoning.
- [x] **Resume & Profile Polish:**
  - [x] **Interests Taxonomy & Progressive Dropdowns:** Add hierarchical, multi-level dropdown accordion under Resume or dedicated tab:
    - *Sports:* Baseball / MLB Sabermetrics, NFL, NHL, Formula 1
    - *Video Games:* Zelda (OoT), Final Fantasy X, Dragonwilds, Retro / N64
    - *Music:* Ocarina practice, ear training, phrase transcription, Web Audio synth
    - *Electronics:* EtchCentric laser engraving, homelab rack, Proxmox, custom white-box builds
    - *Digital Tools:* Project Atlas static generator, Obsidian graphs, Antigravity AI agents, automation
    - *Entertainment:* Chess puzzles, community gamification, trivia engineering

## Hosting & Deployment Strategy
- [x] **Choose a Hosting Provider:** Decide between Cloudflare Pages, AWS (S3 + CloudFront), a rented VPS (DigitalOcean/Linode), or a combination.
- [x] **Configure Build Pipeline:** Set up the host to run `npm run build` whenever you push to your GitHub `main` branch.
- [x] **Set Output Directory:** Ensure the hosting provider knows to serve the `website/dist` folder.
- [ ] **DNS & SSL:** Point your domain to the new host and ensure a free SSL certificate (Let's Encrypt) is provisioned.

## Monetization Milestones & Roadmap

### Fast Cashflow & Inbound Client Track (Immediate Execution)
- [ ] **"Build Something Like This" Article & Tool CTA:** Add a clean footer card on Project Atlas build logs and tools embedding a 4-question [Tally intake form](https://tally.so) for custom interactive tools and static dashboard builds.
- [ ] **"Work With Me" Header Navigation Pill:** Add `/hire` or "Work With Me" link to site navigation highlighting custom web tools, data visualization dashboards, and static architecture.
- [ ] **Paid "Pick My Brain" Sessions ($75–$150):** Connect a [Cal.com paid booking](https://cal.com) link for 45-min architecture reviews, sports data telemetry consulting, or digital garden advisory calls.
- [ ] **Productized 1-Week Micro-Builds ($500–$1,500):** Offer fixed-scope 5-weekday calculator/dashboard builds with upfront deposits collected via Lemon Squeezy checkout overlays.

### Productized & Passive Revenue Track
- [x] **Lemon.js Checkout Overlay Integration:** Add lightweight `lemon.js` script to allow slide-over checkout modals without redirecting readers away from tools or articles. *(Initialized in v1.5.0)*
- [ ] **Companion PWYW PDFs for Live Tools:**
  - [ ] Printable Ocarina Songbook & Finger Chart PDF ($0 min / $5 suggested on Lemon Squeezy).
  - [ ] Offline FFX 100% Checklist & Stat Guide ($0 min / $5 suggested).
  - [ ] Dragonwilds Progression Reference Guide ($0 min / $5 suggested).
- [ ] **"Project Atlas" Starter Kit ($29–$49):** Clean turnkey repo / zip of the static site generator, 3D graph, and Obsidian-dark layout sold at the conclusion of the build-log series.
- [ ] **All-Access "Garden Token" ($3–$5/mo):** Single subscription license key validated client-side via Lemon Squeezy License Keys API and cached in `localStorage` to unlock Vault articles, bonus tool filters, and monthly PDF drops.
- [ ] **Affiliate & Advertising Milestones:**
  - [ ] **Seed & Launch (0 – 1,000 views/mo):** Ocarina direct link to OcarinaWind; transparent ticket, merch, and responsible gaming guide.
  - [ ] **Early Traction (1,000 – 5,000 views/mo):** Amazon Associates, Impact.com (SeatGeek, Fanatics), CJ Affiliate (MLB.tv, Stathead).
  - [ ] **Boutique Sponsorships (5,000 – 10,000 views/mo):** Direct outreach for `/sponsors/` packages ($75/issue newsletter anchor, $125/mo sticky sidebar, $250/mo bundle).
  - [ ] **Ethical Developer Ads (10,000+ views/mo):** Apply for EthicalAds sidebar placement (zero tracking cookies).
  - [ ] **Carbon Ads Milestone (20,000+ views/mo):** Submit publisher application to Carbon Ads.

