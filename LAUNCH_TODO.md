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
