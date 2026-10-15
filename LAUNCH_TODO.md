# Project Atlas Launch Checklist

This file contains manual tasks you need to complete when deploying the site to a live domain.

## SEO & Domain
- [ ] **Buy/Connect Domain:** Ensure your domain (e.g., `thomsfoolery.com`) is connected to your host (Netlify, Vercel, Cloudflare Pages).
- [ ] **Update Robots.txt:** Open `website/static/robots.txt` and replace `https://yourdomain.com` with your actual domain name.
- [ ] **Update .env / Configs:** Ensure any environment variables or hardcoded base URLs in your project are set to the live domain so canonical URLs resolve correctly.
- [ ] **Google Search Console:** 
  1. Go to Google Search Console and add your domain as a property.
  2. Verify domain ownership (usually via DNS TXT record).
  3. Navigate to **Sitemaps** and submit `https://[your-domain]/sitemap.xml`.

## Social & Polish
- [ ] **Verify OG Card:** We generated a placeholder PNG for social sharing (`website/static/images/og-card.png`). If you have a custom logo or design you prefer, overwrite that file.
- [ ] **Test Links:** Paste your URL into Discord or Twitter to ensure the preview card looks correct.

## Content (Post-Launch)
- [ ] Write missing expansions for articles.
- [ ] Continue linking new thoughts using the `[[wikilink]]` syntax to expand the Knowledge Graph.

## Hosting & Deployment Strategy
- [ ] **Choose a Hosting Provider:** Decide between Cloudflare Pages, AWS (S3 + CloudFront), a rented VPS (DigitalOcean/Linode), or a combination.
- [ ] **Configure Build Pipeline:** Set up the host to run `npm run build` whenever you push to your GitHub `main` branch.
- [ ] **Set Output Directory:** Ensure the hosting provider knows to serve the `website/dist` folder.
- [ ] **DNS & SSL:** Point your domain to the new host and ensure a free SSL certificate (Let's Encrypt) is provisioned.

## Monetization Milestones & Roadmap

### Fast Cashflow & Inbound Client Track (Immediate Execution)
- [ ] **"Build Something Like This" Article & Tool CTA:** Add a clean footer card on Project Atlas build logs and tools embedding a 4-question [Tally intake form](https://tally.so) for custom interactive tools and static dashboard builds.
- [ ] **"Work With Me" Header Navigation Pill:** Add `/hire` or "Work With Me" link to site navigation highlighting custom web tools, data visualization dashboards, and static architecture.
- [ ] **Paid "Pick My Brain" Sessions ($75–$150):** Connect a [Cal.com paid booking](https://cal.com) link for 45-min architecture reviews, sports data telemetry consulting, or digital garden advisory calls.
- [ ] **Productized 1-Week Micro-Builds ($500–$1,500):** Offer fixed-scope 5-weekday calculator/dashboard builds with upfront deposits collected via Lemon Squeezy checkout overlays.

### Productized & Passive Revenue Track
- [ ] **Lemon.js Checkout Overlay Integration:** Add lightweight `lemon.js` script to allow slide-over checkout modals without redirecting readers away from tools or articles.
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

