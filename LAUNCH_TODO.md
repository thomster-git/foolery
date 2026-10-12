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
- [ ] **Phase 1: Seed & Launch (0 – 1,000 views/mo):**
  - Organic growth via *The Monday Dispatch* newsletter and Twitter/Reddit tool sharing.
  - Ocarina recommendation linked authentically to OcarinaWind (direct link without burning Amazon 180-day window).
  - Deploy transparent Canadian/US ticket, merch, and responsible gaming guide under baseball tools.
- [ ] **Phase 2: Early Traction (1,000 – 5,000 views/mo):**
  - Apply for **Amazon Associates** (OcarinaWind conversions easily hit the mandatory 3-sale threshold within 180 days).
  - Apply for **Impact.com** (SeatGeek tickets, Fanatics MLB caps/jerseys) and **CJ Affiliate** (MLB.tv, Stathead).
- [ ] **Phase 3: Boutique Sponsorships (5,000 – 10,000 views/mo):**
  - Active outreach for `/sponsors/` packages ($75/issue newsletter anchor, $125/mo sticky sidebar, $250/mo garden bundle).
  - List direct sidebar inventory on **BuySellAds Marketplace** and explore **EthicalAds**.
- [ ] **Phase 4: The Carbon Ads Milestone (20,000+ views/mo):**
  - **Milestone Trigger:** Submit official publisher application to **Carbon Ads** once reaching ~20,000 monthly page views (~300 core repeat tool users + 600 newsletter regulars + steady search traffic).

