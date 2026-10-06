import re
import os

print("Updating blue-jays.js math...")
bj_path = 'website/static/js/blue-jays.js'
with open(bj_path, 'r') as f:
    bj = f.read()

# Update top odds
old_odds_calc = """            if (gamesRemaining <= 0) {
                odds = 0;
            } else {
                let estimatedOdds = 50 - (gb * (100 / gamesRemaining));
                odds = Math.max(0.1, Math.min(49.9, estimatedOdds)); 
            }"""
new_odds_calc = """            if (gamesRemaining <= 0 || gb > gamesRemaining) {
                odds = 0;
            } else {
                let estimatedOdds = 50 * Math.pow(0.7, gb * (30 / Math.max(1, gamesRemaining)));
                odds = Math.max(0.1, Math.min(49.9, estimatedOdds)); 
            }"""
bj = bj.replace(old_odds_calc, new_odds_calc)

# Update simulator calcProb
old_calc_prob = """            function calcProb(projectedFinalWins) {
                return 1 / (1 + Math.exp(-0.3 * (projectedFinalWins - WC_THRESHOLD)));
            }"""
new_calc_prob = """            function calcProb(projectedFinalWins, projectedGB) {
                let probBase = 1 / (1 + Math.exp(-0.3 * (projectedFinalWins - WC_THRESHOLD)));
                let probGB = 1 / (1 + Math.exp(1.5 * (projectedGB - 0.5)));
                return probBase * probGB;
            }"""
bj = bj.replace(old_calc_prob, new_calc_prob)

# Update the call to calcProb
old_prob_call = "const rawProb = calcProb(projectedFinalWins);"
new_prob_call = "const rawProb = calcProb(projectedFinalWins, newGB);"
bj = bj.replace(old_prob_call, new_prob_call)

with open(bj_path, 'w') as f:
    f.write(bj)

print("Writing markdown content...")

# 1. Project Atlas
pa_path = 'content/projects/project-atlas.md'
with open(pa_path, 'r') as f:
    pa = f.read()
# Remove github_url
pa = re.sub(r'github_url:.*\n', '', pa)
# Expand body
pa_body = """
Project Atlas is my attempt to build a personal knowledge platform instead of a traditional website.

Rather than organizing information into isolated pages, Atlas treats every article, project, topic, theme, and recommendation as part of a connected network.

### The Build System and Digital Garden Creator

This entire platform is statically generated using a custom Node.js pipeline. My `build` and `preview` scripts parse hundreds of markdown files, extract metadata, and automatically construct relationships between entities (like linking an article to a specific book, tool, or overarching theme).

I initially started building a standalone GUI tool called **Digital Garden Creator** to help author these markdown files efficiently, but realized its functionality was intrinsically tied to how Project Atlas manages content. Thus, the concept was merged directly into the Atlas ecosystem. 

The long-term vision is to create a system that can:
- Build relationships automatically.
- Generate related content and dynamic dashboards.
- Power comprehensive search.
- Visualize a personal knowledge graph.
- Serve as the foundation for future websites and applications.

Atlas is as much a software project as it is a long-term record of my interests, experiences, and ideas. Everything I create has the potential to become part of Atlas.
"""
pa_new = re.sub(r'---\n\n.*', '---\n' + pa_body, pa, flags=re.DOTALL)
with open(pa_path, 'w') as f:
    f.write(pa_new)

# 2. Baseball Trend Analyzer
ba_path = 'content/projects/baseball-trend-analyzer.md'
with open(ba_path, 'r') as f:
    ba = f.read()
ba_body = """
The **Baseball Trend Analyzer** started purely as a developer experiment: a simple script to check if the Toronto Blue Jays were going to make the post-season. 

As I pulled more data from the live MLB API, my curiosity expanded into tracking other team metrics. I realized that while major stat sites provide endless tables of numbers, they often lack intuitive visualizations for per-game momentum and trend prediction.

This tool now tracks MLB team performance on a per-game basis, rendering a unique visualization graph that predicts trend lines based on upcoming matchups—giving a different perspective on team momentum than traditional standings.
"""
ba_new = re.sub(r'---\n\n.*', '---\n' + ba_body, ba, flags=re.DOTALL)
with open(ba_path, 'w') as f:
    f.write(ba_new)

# 3. Next-Gen Proxmox Home Lab
pl_path = 'content/projects/next-gen-proxmox-home-lab.md'
with open(pl_path, 'r') as f:
    pl = f.read()
pl = pl.replace('i7-13700k', 'i9-13900k')
pl = pl.replace('msi-z690-a', 'msi-z690')
pl_body = """
### The Incident

During a recent hardware operation, my previous motherboard sustained physical damage, forcing an accelerated upgrade cycle. 

### The Upgrade Plan

With the core system needing a replacement, I am upgrading the foundation of the home lab to support heavier virtualization workloads and a seamless native Windows 11 VM experience with GPU passthrough.

**New Components:**
- **CPU:** Intel Core i9-13900K (13th Gen 24-Core). The onboard Intel UHD 770 graphics will handle lightweight passthrough and transcodes for services like Nextcloud and Jellyfin.
- **Motherboard:** MSI MAG Z690 TOMAHAWK WIFI DDR4.

**Reused Components:**
- **Power Supply:** EVGA G3 750W Gold.
- **GPU:** NVIDIA RTX 2080 Super (dedicated to the Windows 11 VM).
- **RAM:** 128GB DDR4 3200 MHz.
- **Cooling & Chassis:** Noctua NH-D15 inside the Corsair Carbide Series Air 540 High Airflow ATX Cube Case.

*Note on future expansion:* I am considering adding multiple high-VRAM RTX 3060s in the future for local LLM inference and AI workloads. This would exceed the current 750W capacity and require a significant power supply boost.
"""
pl_new = re.sub(r'---\n\n.*', '---\n' + pl_body, pl, flags=re.DOTALL)
with open(pl_path, 'w') as f:
    f.write(pl_new)

# 4. EtchCentric
ec_path = 'content/projects/etchcentric-creations.md'
with open(ec_path, 'r') as f:
    ec = f.read()
ec_body = """
EtchCentric Creations is a custom laser engraving and design business specializing in personalized gifts, technical schematics, and functional art.

What started as an exploration into CNC lasers and material science quickly grew into a fully operational storefront. The business acts as a physical manifestation of my digital design work, bridging the gap between CAD/vector software and tangible, tactile objects.

From slate coasters to anodized aluminum enclosures, EtchCentric is my sandbox for physical manufacturing.
"""
ec_new = re.sub(r'---\n\n.*', '---\n' + ec_body, ec, flags=re.DOTALL)
with open(ec_path, 'w') as f:
    f.write(ec_new)

# 5. Keel Systems
ks_path = 'content/projects/keel-systems.md'
with open(ks_path, 'r') as f:
    ks = f.read()
ks_body = """
Keel Systems was originally conceived as an umbrella entity for IT consulting and enterprise workflow architecture.

However, over time, I realized it served more as a conceptual vision—a guiding philosophy for how I approach systems design—rather than a fully-fledged, active commercial project. While the branding and ideas remain influential in my work, the focus has shifted entirely to integrating these concepts directly into **Project Atlas**.
"""
ks_new = re.sub(r'---\n\n.*', '---\n' + ks_body, ks, flags=re.DOTALL)
with open(ks_path, 'w') as f:
    f.write(ks_new)

# 6. Delete Digital Garden Creator
try:
    os.remove('content/projects/personal-digital-garden-creator.md')
except:
    pass

# 7. Wishlist updates
w_13900k = """---
id: 13900k
title: "Intel Core i9-13900K"
type: wishlist
status: active
price: 650.00
priority: 1
url: https://www.newegg.ca/intel-core-i9-13th-gen-core-i9-13900k-raptor-lake-lga-1700-desktop-cpu-processor/p/N82E16819118412?Item=9SIC7XMM1U0265&cm_sp=product-_-from-price-options
image: /images/wishlist/13900k.jpg
created: 2026-09-22
updated: 2026-09-22
---

Core i9 13th Gen 24-Core (8P+16E) LGA 1700 125W Intel UHD Graphics 770 Desktop CPU Processor. Needed for the home lab upgrade.
"""
with open('content/wishlist/13900k.md', 'w') as f:
    f.write(w_13900k)
try:
    os.remove('content/wishlist/13700k.md')
except:
    pass

# Read msi-z690 to preserve its frontmatter mostly
mz_path = 'content/wishlist/msi-z690.md'
with open(mz_path, 'r') as f:
    mz = f.read()
mz = re.sub(r'url:.*', 'url: https://www.newegg.ca/msi-mag-z690-tomahawk-wifi-ddr4-atx-intel-motherboard-intel-z690-lga-1700-dedicated-lga1700-mounting-bracket-is-required/p/N82E16813144487?Item=9SIC6E2M4H9844&cm_sp=product-_-from-price-options', mz)
with open(mz_path, 'w') as f:
    f.write(mz)

print("Done.")
