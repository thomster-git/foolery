# Thoms Foolery Monday Dispatch — Release v1.2.0

**Subject:** Patch Notes: v1.2.0 (The Update)  
**Date:** Monday, October 12, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday! Over the past couple of weeks, **Project Atlas** has grown from a raw collection of personal essays and scratch tools into an interconnected digital garden. What started as minor post-launch tweaks quickly snowballed into our biggest milestone release yet: **v1.2.0**.

Grab a coffee. We’ve got new interactive tools, a retro gaming easter egg, a brand overhaul, and a transparent look at where the site is heading next.

---

## 1. The Headliner: MLB Postseason Momentum Analyzer ⚾🔥

If you've been following baseball in October, you know standard regular-season stats fall apart in the playoffs. Teams don't play 162 games; series are won and lost in volatile 3-to-7 game knife fights.

Our previous postseason tool was handcuffed by regular-season math (which required 10-game minimums and broke on short sample sizes). We went back to the drawing board and completely re-architected it:

* **Powered by Apache ECharts 5.5:** Built natively for our dark obsidian theme with zero bundle bloat, smooth mobile touch zooms, and lightning-fast rendering.
* **Dual Visualization Views:**
  * **Trajectory Stream:** Follow cumulative round-by-round momentum curves from the Wild Card through the World Series, rendered with dynamic color gradients (cyan surge vs ruby drop-off).
  * **Fire & Ice Quadrants:** A scatter matrix pitting acute 3-game run differential velocity against overall tournament form, complete with directional vector tails that expose whether a team is accelerating into peak form or running out of gas.
* **The Postseason Momentum Index (PMI):** A custom sabermetric model combining weighted moving average run differential, inning lead share, and Pythagorean luck gap.
* **Live Inning Telemetry:** Tap any game to expand an interactive box score drawer with linescores, winning/losing pitchers, and save decisions.

👉 **Check it out live:** [thomsfoolery.com/tools/postseason-baseball-analyzer/](https://thomsfoolery.com/tools/postseason-baseball-analyzer/)

---

## 2. Interactive N64 Ocarina Controller 🎮🎶

In our Ocarina Practice Suite, we updated our *Ocarina of Time* melodies with authentic phrase breaks. But we couldn't stop there.

We built a full, interactive **N64 Controller Layout** right into the browser:

* **Authentic Button Pitch Mappings:**
  * **Cobalt Blue A Button:** `D5`
  * **C-Up (▲):** `D6`
  * **C-Left (◀):** `B5`
  * **C-Right (▶):** `A5`
  * **C-Down (▼):** `F5`
* **Real-Time Sound Synthesis:** Powered by the Web Audio API with a warm sine-wave envelope that mimics the timbre of a real sweet-potato ocarina.
* **Full Keyboard Playability:** You can play with your mouse, your phone screen, or your keyboard using `[A]` and `[Arrow Keys]` (or `[W/A/S/D]`).
* **Melody Recognition Easter Egg:** Play the authentic button combinations on the pad (like `◀ ▲ ▶ ◀ ▲ ▶` for *Zelda's Lullaby* or `▼ ▶ ◀ ▼ ▶ ◀` for *Saria's Song*) and the retro green LCD screen will glow gold, chime, and automatically pull up the song sheet!
* **Melody Preview:** Click **"▶ Preview Melody"** on any song card to watch the N64 buttons light up in tempo as the song plays.

👉 **Play it here:** [thomsfoolery.com/tools/ocarina/](https://thomsfoolery.com/tools/ocarina/)

---

## 3. The Visual Polish: Brand Identity v2 🔷

When Project Atlas launched, the navbar featured a temporary AI-generated origami monogram stuck on a white square background. While cool in isolation, it clashed with our dark-mode glass aesthetics.

Today, we rolled out **Option C: The Hybrid Knowledge Graph Ligature**:
* An ultra-sharp, scalable SVG vector combining the **"TF"** initials with the interconnected nodes of our knowledge graph.
* Cyan and royal indigo lines on the left spine transitioning into warm amber-gold stars on the crossbars.
* Seamlessly unified across the desktop navbar, mobile header, and our new browser favicon.

---

## 4. Retrospective: Everything Shipped Since v1.0.1 🚀

If you missed our micro-updates throughout the week, here is the highlight reel of what landed:

* **Dragonwilds Gear Progression Tracker:** Added comprehensive regional gear tables, rarity tiers, stat calculators, and craftable sets for our Dragonwilds guide.
* **Ocarina Scale Practice & Tuner:** Practice C Major, F Major, and G Major scales with a live autocorrelation microphone pitch tuner providing sub-cent accuracy.
* **Clean Tool URLs:** Upgraded all tool routes to permanent canonical directories (`/tools/ocarina/`, `/tools/baseball-trend-analyzer/`, etc.) with backward compatibility.
* **Homepage Polish & Birthday Mode:** Added interactive confetti explosions and retro celebratory sound effects to the homepage.
* **Personal Systems & AuDHD Deep Dives:** Polished essays on sensory regulation, adult diagnosis, and mechanical systems thinking.
* **Dynamic Sitemap & Search Console Verification:** Successfully verified site ownership in Google Search Console and rebuilt `sitemap.xml` with dynamic `<lastmod>` timestamps across all 15 core routes.

---

## 5. The Road Ahead: What We’re Building Next 🗺️

Now that the core technical foundations are solid, our immediate priority shifts to **growing the audience and unlocking passive income**:

1. **Monetization Engine Setup:**
   * **Ethical Developer Ads:** Activating dedicated sponsorship cards via Carbon Ads / BuySellAds in our new sidebar slot (`ad-sidebar.html`).
   * **Sportsbook Odds Comparison:** Adding high-value, legal sportsbook affiliate widgets (DraftKings, FanDuel, BetMGM) beneath our baseball and sports betting analytics tools.
   * **Instrument & Music Affiliates:** Partnering with trusted makers (Songbird, STL) for beginners looking to buy a 12-hole Alto C ocarina.
   * **Direct Sponsorships:** Welcoming brand partners to our newly minted [Sponsorships Page](https://thomsfoolery.com/sponsors/).
2. **Songbook Expansion:**
   * Fixing rhythm and octave fingerings for *Littleroot Town* and *Blue Bird*.
   * Charting and releasing the full arrangement of *Saria's Song (Lost Woods)*.
   * Charting a brand-new custom tab for the *Ocarina of Time Main Intro Theme / Title Lullaby*.
3. **Resume & Career History Overhaul:**
   * Adding our comprehensive industrial engineering chronicles—managing IT across 8 departments at a remote fluorspar mine, orchestrating the zero-ransom Akira disaster recovery, and navigating healthcare milestones.

---

### Give the New Tools a Spin!

Hop onto the site, test out the new **Postseason Analyzer**, play a tune on the **N64 Ocarina Pad**, and hit reply to let me know what songs or sports models you want to see next!

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
