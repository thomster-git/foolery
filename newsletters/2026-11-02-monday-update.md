# Thoms Foolery Monday Dispatch — Release v1.5.0

**Subject:** Patch Notes: v1.5.0 (White-Box Servers & Corporate Comms Essays, F1 2026 Title Calculator, 3D MLB Umpire Sim & Dragonwilds Ch. 9–11)  
**Description:** Three new & consolidated essays (the $34k Proxmox white-box blueprint, Discord vs. Slack/Teams, and the Project Atlas Manifesto), F1 2026 Championship Calculator, 3D MLB Umpire Simulator, Live Stream Schedule, 25 NHL & 20 MLB metrics (2016–2026), and Dragonwilds Chapters 7–11.  
**Date:** Monday, November 2, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday, and welcome to November! Today marks **Release v1.5.0**—rolling up our `v1.4.1` infrastructure patch alongside a massive wave of new essays, interactive simulators, sports telemetry expansions, and endgame compendium updates shipped over the past week.

Since our `v1.4.0` dispatch on October 26, we published two new systems architecture essays and consolidated our core Project Atlas Manifesto, launched **three brand-new interactive tools** (**F1 2026 Championship Calculator**, **3D MLB Umpire Pitch Simulator**, and **Live Stream Schedule**), expanded the **NHL Trend Analyzer** to 25 metrics and the **Baseball Trend Analyzer** across 11 seasons (2016–2026), engineered round-synchronized rest bridges for the **MLB Postseason Momentum Analyzer**, expanded the **Dragonwilds Compendium** through **Chapter 11 (Regicide)** plus a new **Fishing Guide**, upgraded the **Ocarina of Time Songbook & Stream Overlay**, and overhauled our **3D Knowledge Graph** and sitewide SEO architecture.

Here is the full breakdown of everything that has landed in **v1.5.0** since `v1.4.0`.

---

## 1. Three New & Consolidated Essays: White-Box Server Economics, Corporate Comms & The Atlas Manifesto ✍️🖥️

We’ve added two brand-new technical essays to `/articles/` and consolidated our foundational philosophy into a single definitive manifesto:

### 🖥️ The $34,000 White-Box Blueprint: How to Slay Enterprise MSP Markups with Proxmox & Common Sense *(Supporter Exclusive)*
When an enterprise Managed Service Provider (MSP) hands you an **$80,000+ quote** for a multi-node proprietary cluster locked behind per-core hypervisor taxes and annual support ransom—just to run six virtual machines at a remote industrial mine site—something is fundamentally broken.
* **PC Gaming Literacy in the Server Room:** Why high-frequency single-socket workstation/server silicon beats bloated dual-socket vendor configurations while slashing per-core licensing traps.
* **The $34,000 Proxmox VE Architecture:** How I specced a screaming single-socket custom server running open-source **Proxmox VE** with ZFS storage and zero hypervisor licensing fees, saving nearly **$50,000 upfront**.
* **Cold-Shelf Hardware Resiliency & The 3:00 AM Runbook:** Why keeping physical warm spares on the shelf beats waiting on a "4-hour Mission Critical SLA" courier in rural Newfoundland—plus a step-by-step disaster recovery checklist that anyone on site can execute at 3:00 AM.
* 👉 **Read the essay:** [thomsfoolery.com/articles/sensible-infrastructure-and-white-box-servers.html](https://thomsfoolery.com/articles/sensible-infrastructure-and-white-box-servers.html)

### 💬 Rethinking Corporate Communication: Why Discord Beats Slack & Teams *(Free Public Essay)*
Most organizations default to Microsoft Teams, Slack, or chaotic WhatsApp threads without ever questioning the friction those tools introduce:
* **The Enterprise Comms Audit:** An honest systems breakdown of MS Teams' memory bloat and clunky channel threading, Slack's per-seat history paywalls, and the boundary-eroding chaos of WhatsApp/iMessage group chats.
* **Why Discord Wins for Agile Teams:** Always-on low-latency voice rooms ("drop-in watercooler" channels), granular role-based permission matrices, zero per-seat message history taxes, and first-class webhook/bot extensibility.
* **How We Build It at Keel Systems:** How we decouple core community/team architecture from custom automation bots (`v1.4.1`) to turn Discord into a structured operational headquarters.
* 👉 **Read the full essay (Free):** [thomsfoolery.com/articles/discord-vs-corporate-comms.html](https://thomsfoolery.com/articles/discord-vs-corporate-comms.html)

### 🌐 Everything Is Connected: The Project Atlas Manifesto *(Consolidated & Expanded — Free Public Essay)*
We merged *"My Story with Everything Is Connected"* and the *"Project Atlas Manifesto"* into one cohesive, definitive essay (with automatic redirects from the legacy URL):
* **Determinism & Associative Memory:** Why your present decisions are the mechanical product of every circumstance that came before—and why traditional reverse-chronological blogs fail to capture how human memory actually links ideas across health, engineering, music, and gaming.
* **The Architecture of a Digital Garden:** How Project Atlas replaces isolated folders with a living, interconnected graph of raw data, essays, and interactive tools.
* 👉 **Read the consolidated Manifesto (Free):** [thomsfoolery.com/articles/manifesto.html](https://thomsfoolery.com/articles/manifesto.html)

---

## 2. Three Brand-New Interactive Tools: F1 2026 Title Calculator, 3D MLB Umpire Sim & Live Stream Schedule 🚀🛠️

Our `/tools/` suite grew to **11 interactive web applications** this week with three major launches:

### 🏎️ F1 2026 Championship Calculator (`/tools/f1-championship-calculator/`)
Built for the 2026 Formula 1 regulation era featuring the full **11-team, 22-driver grid** (including Audi and Cadillac F1 Team) after **Round 18 (Austin)** heading into the final 6 Grand Prix weekends + 2 Sprints (`164 max points` remaining for drivers, `310 max points` for constructors):
* **Live 2026 Title Fight Standings:** Rookie sensation **Kimi Antonelli** leads the World Drivers' Championship (`365 pts`, `9 wins`) by 123 points over Mercedes teammate **George Russell** (`242 pts`) and Ferrari's **Lewis Hamilton** (`241 pts`), while **Mercedes** (`607 pts`) leads **Ferrari** (`474 pts`) by 133 points in the Constructors' Championship.
* **Interactive Driver (WDC) & Constructor (WCC) Clinch Scenario Engine:** Select any contender and rival from the **Championship Mode**, **Target Driver/Team**, and **Challenger** dropdowns—or click the one-click **🏆 Mercedes vs Ferrari (WCC)** and **👑 Kimi Antonelli (WDC)** presets—to calculate exact Round 19 (Mexico City GP) clinch thresholds, required point swings, and what Ferrari or chasing drivers must do to keep the championship alive.
* **Remaining Calendar Simulator:** Adjust race and sprint finishes across Mexico City, São Paulo, Las Vegas, Lusail, Yas Marina, and the season finale to watch title probabilities and clinch math update in real time.
* 👉 **Run the 2026 F1 clinch math:** [thomsfoolery.com/tools/f1-championship-calculator/](https://thomsfoolery.com/tools/f1-championship-calculator/)

### ⚾🥽 3D MLB Umpire Pitch Simulator (`/tools/umpire-simulator/`)
Ever yelled at a home-plate umpire from your couch? Step behind the dish yourself in our new first-person 3D perspective pitch trainer:
* **Statcast 3D Kinematics & Pitch Arsenal:** Face 97+ MPH **4-Seam Fastballs**, sweeping **Sliders**, **12-6 Curveballs**, and fading **Circle Changeups** modeled with realistic release extension, spin-induced Magnus break, and gravity drop across the 60 ft 6 in flight path.
* **Realistic 3D Batter, Pitcher & Catcher Mitt Mechanics:** Upgraded with a 3D inverse-kinematics pitcher windup, realistic batter stance on the chalk box, late-flight catcher glove tracking (so the mitt doesn't give away the pitch location early), instant ball pocket capture upon impact, and synthesized Web Audio leather mitt pop sound effects.
* **True 3D Pentagonal Prism Rulebook Evaluation & Scorecard:** Evaluates whether the 1.45-inch baseball radius clips any part of the 17-inch 3D strike-zone volume, grading your calls across Overall Accuracy, Strike/Ball Accuracy, and **Shadow Zone (Edge) Accuracy**.
* 👉 **Step behind home plate:** [thomsfoolery.com/tools/umpire-simulator/](https://thomsfoolery.com/tools/umpire-simulator/)

### 📺 Live Stream Schedule (`/tools/stream-schedule/`)
A dedicated broadcast calendar for tracking upcoming gaming, coding, and music streams across **Twitch**, **YouTube**, and **Kick**:
* **Automatic Viewer Local Timezone:** Every broadcast slot automatically converts and locks to your browser's local timezone—no manual timezone math required.
* **High-Visibility View Modes & Date Navigation:** Switch seamlessly between **Weekly Grid**, **Month View**, and **Upcoming List** using high-contrast view tabs, step forward and backward across upcoming weeks and months (with a floor locked at `Today` so you never get lost in past weeks), and export `.ics` calendar reminders.
* **Global Holiday Cancellation Sync:** Built a password-protected Streamer Admin interface with one-click `✕` stream cancellation that writes directly to `stream-schedule.json` so holiday cancellations update globally for every visitor.
* 👉 **Check the broadcast schedule:** [thomsfoolery.com/tools/stream-schedule/](https://thomsfoolery.com/tools/stream-schedule/)

---

## 3. Sports Analytics Suite Expansion: 25 NHL Metrics, 11 MLB Seasons (2016–2026) & Postseason Rest Slopes 📊🏒⚾

We brought our hockey and baseball analyzers up to full parity with last week's NFL upgrade:

* **🏒 NHL Trend Analyzer Expanded to 25 Metrics:** Upgraded from 6 basic charts to **25 deep hockey telemetry metrics** across 5 categories:
  * *Standings & Scoring:* Cumulative Goal Diff, Points %, 82-Game Points Pace, Pythagorean Win % (`GF^2.05 / (GF^2.05 + GA^2.05)`), Regulation Wins (RW), Goals For/G, Goals Against/G, and 5-Game Rolling Goal Diff.
  * *Special Teams & Discipline:* Power Play %, Penalty Kill %, **Special Teams Index (`PP% + PK%`)**, Net Special Teams Goal Diff, and Net Penalty Differential.
  * *Shots & Possession Control:* Shot Share (`Shots For %`), Shots on Goal/G, Shots Allowed/G, and Cumulative Shot Differential.
  * *Goaltending, Finishing & Puck Luck:* Team Save %, Shooting %, and **PDO (`Shooting % + Save %`)** with a `100.0` regression baseline.
  * *Clutch & Game Script:* 1-Goal Game Points %, 3+ Goal Blowout Wins, Scoring First Win %, Leading After 1st Period Win %, and OT/Shootout Win %.
  * 👉 **Compare all 32 NHL teams:** [thomsfoolery.com/tools/nhl-trend-analyzer/](https://thomsfoolery.com/tools/nhl-trend-analyzer/)

* **⚾ MLB Baseball Trend Analyzer: 11 Seasons (2016–2026) & 20 Sabermetric Metrics:**
  * **Multi-Season Historical Selector (2016–2026):** Compare a full decade of MLB team trajectories across all 30 franchises.
  * **Expanded to 20 Metrics:** Added Pythagorean Expected Win % (`RS^1.83`), **Pythagorean Luck Gap** (actual vs. expected wins), Playoff Odds Trajectory, 10-Game Rolling Win %, 1-Run Game Win %, Blowout Win % (`5+ runs`), Scoring First Win %, Comeback Wins, Shutouts Pitched, and Home/Road Win %.
  * **Cleaner Layout & Export (`v1.4.1`–`v1.5.0`):** Moved *Season Awards & Standings* below the main trajectory chart so you jump straight into the visuals, and added crisp light-theme PNG downloads and one-click clipboard copy.
  * 👉 **Explore 2016–2026 MLB trends:** [thomsfoolery.com/tools/baseball-trend-analyzer/](https://thomsfoolery.com/tools/baseball-trend-analyzer/)

* **⚾🔥 MLB Postseason Momentum Analyzer: Round-Synchronized Rest Recovery Bridges:**
  * Solved the visual desynchronization that happens when one team sweeps a playoff series in 3 or 4 games while their opponent battles to Game 5 or Game 7.
  * All teams now align on a unified **22-slot Postseason Round Timeline** (`WC G1–G3`, `DS G1–G5`, `LCS G1–G7`, `WS G1–G7`). When a team clinches early, their trajectory renders a dashed **Rest & Bullpen Reset Bridge** with a slight positive recovery slope (`+2.0 PMI` / `+0.35 Run Diff` per rest slot) connecting cleanly into Game 1 of the next series.
  * 👉 **View synchronized playoff momentum:** [thomsfoolery.com/tools/postseason-baseball-analyzer/](https://thomsfoolery.com/tools/postseason-baseball-analyzer/)

---

## 4. Dragonwilds Compendium: Chapters 7–11, 13 Dreaming Stone Shards, Fishing Guide & Server Manual 🐉🎣

Our *RuneScape: Dragonwilds* progression tracker received its biggest content expansion yet:
* **⚔️ Streamlined Chapter 7 (Imaru) & Overhauled Chapter 8 (Black Knight's Fortress):** Trimmed redundant pre-boss quest/loadout bloat in Chapter 7 to focus on the high-survival **melee belly-camping safe zone**, updated Chapter 8 with the complete **13 Dreaming Stone Shards** location & requirement table across *The Cathedral*, *The Garrison*, *The Grand Hall*, *The Dungeons*, *The Armoury*, and *The Botanical Gardens*, and removed outdated Avisk dialogue warnings.
* **🏜️ Chapters 9, 10 & 11 Added:** Full step-by-step progression walkthroughs for **Chapter 9 (Umbral Sands)**, **Chapter 10 (Fuzan Trials)**, and **Chapter 11 (Regicide)**.
* **🎣 New Tab — Complete Fishing Guide & Enemy HP Toggle:** Added a dedicated Fishing Guide tab (`#fishing` / `/tools/dragonwilds-fishing/`) covering rod progression, bait tiers, and cooking buffs, plus an interactive toggle to show/hide enemy HP values across the walkthrough.
* **🖧 Dedicated Server Operations Manual (`v1.4.1`):** Updated both our on-page server guide and downloadable PDF manual with the latest official Jagex dedicated server configuration parameters.

👉 **Explore Chapters 1–11 & the Fishing Guide:** [thomsfoolery.com/tools/dragonwilds-tracker/](https://thomsfoolery.com/tools/dragonwilds-tracker/)

---

## 5. Ocarina of Time Practice Studio: Full Saria's Song, Custom Sage Medallion SVGs & Stream Popout Scaling 🎵🛡️

* **Full Multi-Phrase Saria's Song (Lost Woods):** Expanded Saria's Song in the main Songbook to include the complete multi-phrase melody (`F5 A5 B5 | x2 | F5 A5 B5 E6 D6 | B5 C6 B5 G5 E5 | D5 E5 G5 E5`) alongside the quick N64 6-note warp version.
* **Custom Vector SVGs for All 6 Sage Medallions & Song Emblems:** Hand-crafted crisp vector SVG icons for the *Forest, Fire, Water, Spirit, Shadow,* and *Light Medallions* plus custom emblems for *Zelda's Lullaby, Epona's Song, Sun's Song, Song of Time,* and *Song of Storms*.
* **Resized OoT Songbook & OBS Stream Popout (`?popout=oot`):** Scaled up the OoT Songbook titles (`1.55rem`), medallion emblems (`68px`), N64 controller sequence banner, and SVG fingering charts so they command proper visual presence both on the standard page and inside the transparent OBS stream overlay.

👉 **Play the updated Ocarina Songbook:** [thomsfoolery.com/tools/ocarina-oot/](https://thomsfoolery.com/tools/ocarina-oot/)

---

## 6. Restructured 4-Pillar Knowledge Graph & Sitewide SEO Architecture 🌐🔍

* **4-Pillar Knowledge Graph Architecture (`Articles`, `Tools`, `Interests`, `Professional Resume`):** Re-engineered the interactive Knowledge Graph on the homepage and `/graph/` so the central **Thoms Foolery** hub branches cleanly into the four pillars that make up the site: **Articles (7)**, **Tools (11)**, **Interests (6)**, and **Professional Resume (6)**. Click any pillar bubble to sprout its connected items outward—and expand multiple pillars to visualize cross-pillar connections (such as how *Mine IT Coordinator* and *Electronics & Homelab* link to *The $34,000 White-Box Blueprint*, or how *Sports & Team Backings* connects to our *MLB, NHL, NFL,* and *F1* analyzers).
* **Streamlined Homepage Layout:** Removed the oversized top feature banners and elevated **Published Essays & Technical Case Studies** (sorted newest-first) directly above **Interactive Tools & Compendiums**.
* **Sitewide Discoverability & Schema.org Markup:** Expanded `sitemap.xml` to 44 canonical URLs, added 331 validated JSON-LD structured data blocks (`WebApplication`, `TechArticle`, `FAQPage`, and `BreadcrumbList`), added crawlable methodology reference tables below every interactive tool, and added a direct `/articles/` link to the global header navigation.

---

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
