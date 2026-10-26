# Thoms Foolery Monday Dispatch — Release v1.4.0

**Subject:** Patch Notes: v1.4.0 (Three New Essays, 26 NFL Metrics, Dragonwilds Ch. 8 & Ocarina Upgrades)  
**Description:** Three new essays (CPAP & sleep apnea, surviving Akira ransomware, & the Grade 9 French test), 26 NFL metrics, MLB World Series Fire & Ice math, Dragonwilds Ch. 8 & Ascension Shards, and Ocarina upgrades.  
**Date:** Monday, October 26, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday! Today marks **Release v1.4.0**—rolling up every patch and infrastructure update we shipped across `v1.3.1` through `v1.3.5` alongside this weekend's major tool and editorial upgrades. Since our `v1.3.0` dispatch on October 19, we published three major long-form essays, launched our **All-Access Garden Pass** with Lemon Squeezy and supporter license keys, expanded the **NFL Trend Analyzer** to 26 metrics, overhauled the **MLB Postseason Momentum Analyzer** math and 2026 playoff dataset, added **Chapter 8 (Black Knight's Fortress)** and an **Ascension Shards** tracker to the Dragonwilds compendium, and shipped quality-of-life upgrades across the **Ocarina Practice Tool** and article reading experience.

Here is the full breakdown of everything that has landed in **v1.4.0** (including all `v1.3.1`–`v1.3.5` updates) since October 19.

---

## 1. Three New Long-Form Essays: Healthcare Advocacy, Crisis Triage & The Illusion of Authority ✍️📖

We’ve expanded the `/articles/` library with three deeply personal essays—and restructured our `/articles/` index into four dedicated sections (**Health & Physical Well-being**, **Personal Growth & Reflections**, **AuDHD**, and **Technology**):

### 🫁 The Breath I Didn't Know I Was Missing: Medical Stigma, CPAP Therapy, & The Science of Severe Sleep Apnea *(Free Public Essay)*
For three decades, I normalized waking up exhausted and fighting highway microsleeps—until a Level 3 take-home sleep study revealed an Apnea-Hypopnea Index (AHI) of **60.0 events per hour** and nocturnal oxygen drops into the **mid-60s%**.
* **Breaking Weight Stigma in Medicine:** How "diagnostic overshadowing" and dismissive *"just lose weight"* lectures delay life-saving care by decades.
* **Level 3 Take-Home HSAT vs. Hospital Sleep Labs:** What the weekend home test actually looks like (and why you don't need to wait two years for an overnight hospital ward).
* **The 15-Year Retinal Mystery Solved:** The molecular biology (`HIF-1α` and `VEGF` hypersecretion) of how untreated nocturnal hypoxia caused my chronic cystoid macular edema in 2010—and how starting CPAP therapy resolved it completely without ocular injections.
* 👉 **Read the full essay (Free):** [thomsfoolery.com/articles/my-story-with-medical-stigma-and-advocacy.html](https://thomsfoolery.com/articles/my-story-with-medical-stigma-and-advocacy.html)

### 🚨 Surviving the Akira Ransomware Attack: 14 Days of Bare-Metal Triage, Toxic Leadership, and Rebuilding a Mine from Scratch *(Supporter Exclusive)*
The unfiltered, hour-by-hour chronicle of waking up at **4:43 AM NST** to 200+ Microsoft Defender alerts as the Akira ransomware strain tore through a fluorspar mine’s corporate network:
* **Physical Isolation & Forensics:** Sprinting into the server room to pull fiber and copper uplinks, tracing the breach to unsegmented gatehouse torrenting, and surviving a ransomware group demanding a six-figure Bitcoin payout.
* **Zero-Ransom Recovery:** Rebuilding domain controllers and critical servers from untouched Datto ZFS snapshots and running a 5-station bare-metal workstation imaging assembly line across 14 grueling days.
* **The Human Cost:** Navigating toxic executive leadership and the neurological reality of an acute post-crisis autistic meltdown.
* 👉 **Read the essay:** [thomsfoolery.com/articles/my-story-with-the-akira-ransomware-attack.html](https://thomsfoolery.com/articles/my-story-with-the-akira-ransomware-attack.html)

### 📝 The Grade 9 French Test: Zero Marks, a College Certificate, & The Illusion of Authority *(Supporter Exclusive)*
I scored the highest grade of my entire school year on a Grade 9 French test—yet in the official school ledger, my mark is recorded as an uncompromising **0.0%**:
* **The Recess Vocabulary List:** How a 30-second hallway study pointer before third period turned into an isolated administrative tribunal in the vice principal's office.
* **Standing Up for an Innocent Friend:** Watching school administrators punish a classmate who was literally just standing nearby holding an apple—and the exact moment the illusion of adult infallibility shattered.
* **My Father’s Reassurance:** Why my dad offered to march down and hand back his college certificate if reviewing notes with a buddy before a test was considered cheating.
* 👉 **Read the essay:** [thomsfoolery.com/articles/my-story-with-the-grade-9-french-test.html](https://thomsfoolery.com/articles/my-story-with-the-grade-9-french-test.html)

---

## 2. All-Access Garden Pass, Lemon Squeezy & Supporter Keys (`v1.3.1`–`v1.3.5` Rollup) 🔑🌱

To keep the garden independent, ad-light, and free of invasive tracking scripts, we rolled out a series of point releases (`v1.3.1` through `v1.3.5`) building our new supporter and commerce infrastructure:
* **Dual Unlock Flow on Gated Essays:** Readers can now unlock supporter-exclusive essays directly in the browser using either a **Lemon Squeezy License Key** (sent automatically via email upon subscribing or purchasing an All-Access Garden Pass) or a signed, expiring **Supporter Token (`Atlas-...`)** for Discord patrons, peers, and students.
* **Dragonwilds Dedicated Server Operations Manual (PDF):** Our complete Linux/Docker dedicated server engineering guide is now available as a typeset PDF manual via Lemon Squeezy email delivery right from the tracker page.
* **Documented on `/uses/`:** We added a full **Web Stack, Hosting & Cookieless Data Collection** breakdown on [thomsfoolery.com/uses/](https://thomsfoolery.com/uses/), detailing why we run a zero-database static architecture paired with Buttondown and Lemon Squeezy.

---

## 3. NFL Trend Analyzer: Expanded from 4 to 26 Head-Stat Metrics 🏈📈

You asked for deeper football telemetry—like tracking which offenses are actually moving the chains with **First Downs** versus living on unsustainable big plays. We’ve expanded the **NFL Trend Analyzer** from 4 basic options to **26 per-game and cumulative metrics** organized into 5 categories:

* **Scoring & Standings:** Cumulative Point Differential, Win Percentage, Pythagorean Expected Win % (`PF^2.37 / (PF^2.37 + PA^2.37)`), Points Scored/G, Points Allowed/G, and Current Win/Loss Streak.
* **Chains & Down Efficiency:** First Downs Per Game, First Downs Allowed Per Game, Cumulative First Down Differential, 3rd Down Conversion %, 4th Down Conversion %, and Red Zone TD %.
* **Yardage & Explosive Offense:** Total Yards/G, Passing Yards/G, Rushing Yards/G, Yards Per Play, and Offensive Plays/G.
* **Defense & Trench Warfare:** Total Yards Allowed/G, Sacks Recorded/G, and Sacks Allowed/G.
* **Ball Security, Clock & Discipline:** Cumulative Turnover Differential, Takeaways/G, Giveaways/G, Time of Possession (Mins/G), Penalties/G, and Penalty Yards/G.

👉 **Explore the 26 NFL metrics:** [thomsfoolery.com/tools/nfl-trend-analyzer/](https://thomsfoolery.com/tools/nfl-trend-analyzer/)

---

## 4. MLB Postseason Analyzer: Equal-Area Fire & Ice Quadrants & 2026 World Series Data ⚾🔥❄️

We ran a full mathematical and data audit on the **Postseason Baseball Analyzer** ahead of the World Series:
* **Hard-Set Symmetric Axis Bounds (Equal-Area Quadrants):** Every chart in the analyzer now computes fixed, symmetric `x` and `y` axis limits centered strictly on the league-average split lines. In the **Fire & Ice Quadrants** view, the league-average crosshair (`Avg RS/G`, `Avg RA/G`) is locked at the exact geometric center of the canvas so all four quadrants (*Juggernauts 🔥*, *Pitching Fortress 🛡️*, *Glass Cannons ⚔️*, and *Dead Water ❄️*) always have equal area.
* **Trajectory & PMI Math Fixes:**
  * Computed baseline crosshairs using tournament-wide game-weighted averages so `Avg RS === Avg RA` and crosshairs never drift when filtering to a single team or series.
  * Aligned the 3-game vector comet tail with each team's cumulative scatter coordinates.
  * Calibrated the 4-component **Postseason Momentum Index (`PMI`)** model (35% 3-game WMA run differential, 25% Inning Lead Share, 25% Pythagorean expectation, 15% Win/Loss streak) and fixed Game 2 partial-window WMA weighting (`3:2`).
* **Verified 2026 Playoff Dataset:** Rebuilt the 2026 postseason cache across all 35 completed games through the LCS—including the Milwaukee Brewers' 4–0 NLCS sweep (`7–1` overall, `+42 PMI`) and the Tampa Bay Rays' 4–2 ALCS clincher over Cleveland (`7–2` overall, `+56 PMI`, `67%` inning lead share)—setting up the **Rays vs. Brewers World Series**.
* **Cleaned-Up Tickets, Gear & Regional Wagering Guide:** Rebuilt the bottom companion guide on both the [Postseason Baseball Analyzer](https://thomsfoolery.com/tools/postseason-baseball-analyzer/) and [Baseball Trend Analyzer](https://thomsfoolery.com/tools/baseball-trend-analyzer/) with clean light-theme cards, link chips, regional regulatory badges (*Atlantic Canada / ALC PRO•LINE*, *Ontario / iGaming Ontario*, *Western Canada & Quebec*, *United States*), and responsible-play resources.

👉 **Check the 2026 Postseason trajectories:** [thomsfoolery.com/tools/postseason-baseball-analyzer/](https://thomsfoolery.com/tools/postseason-baseball-analyzer/)

---

## 5. Dragonwilds Compendium: Chapter 8 (Black Knight's Fortress) & Ascension Shards Tab 🐉💎

Our interactive *Runescape: Dragonwilds* progression guide received two major endgame expansions:
* **🏰 Chapter 8: Black Knight's Fortress (Dowdun Reach):** Step-by-step walkthrough from speaking with Death in the Forgotten Temple and forging a Crowbar with Cathan (`5 Steel bars` + `3 Willow logs`), to meeting the Wise Old Man in The Courtyard, tracking down the hidden Fortress Shards using *Windstep*, and defeating **Lord Rasmodel & The Black Knight Titan**.
* **💎 New Tab — Ascension Shards Grinding & Masterwork Upgrades:**
  * Interactive checklist for upgrading Masterwork **Melee**, **Ranged**, **Magic**, and **Shield** equipment.
  * Persistent local-storage **Ascension Shard Stash Counter** (`Shard 4` through `Shard 8`) to track your inventory across sessions.
  * Complete drop-source and drop-rate tables across Power Levels 4–8 (from Velgar and Imaru to the Black Knight Titan, High Druids, and regional bounty packs).
* **Refined Boss Prep:** Updated Chapter 4 Velgar combat tips, Chapter 6 Withering Heights routing, and split Chapter 7 Imaru encounter sub-steps.

👉 **Jump into Chapter 8 or track your Shards:** [thomsfoolery.com/tools/dragonwilds-tracker/](https://thomsfoolery.com/tools/dragonwilds-tracker/)

---

## 6. Ocarina Practice Tool: Direct Tab URLs, Single-Line `x2` Repeats & Diagram Zoom 🎵🔍

Practicing Zelda melodies on a 12-hole ocarina is now much smoother on both desktop and mobile:
* **Deep-Linkable Tab URLs & Direct Aliases:** Just like the Dragonwilds tracker, every tab in the Ocarina tool now updates the URL hash (`#chart`, `#tuner`, `#songs`, `#oot`) with full browser back/forward history support and dedicated direct URL aliases:
  * [thomsfoolery.com/tools/ocarina-chart/](https://thomsfoolery.com/tools/ocarina-chart/) — 12-Hole Fingering Chart
  * [thomsfoolery.com/tools/ocarina-tuner/](https://thomsfoolery.com/tools/ocarina-tuner/) — Live Web Audio Pitch Tuner
  * [thomsfoolery.com/tools/ocarina-songs/](https://thomsfoolery.com/tools/ocarina-songs/) — Zelda & Gaming Songbook
  * [thomsfoolery.com/tools/ocarina-oot/](https://thomsfoolery.com/tools/ocarina-oot/) — Ocarina of Time N64 Melodies
* **Single-Line `⟲ x2` Repeat Notation:** Inside **OoT Melodies**, repeating 6-note and 8-note songs (*Zelda's Lullaby*, *Epona's Song*, *Saria's Song*, *Sun's Song*, *Song of Time*, *Song of Storms*, and *Scarecrow's Song*) now display on a **single horizontal line** with a clean **`⟲ x2`** repeat badge at the end. You no longer need to scroll horizontally while playing—and both Audio Preview and live microphone Practice Mode still step through both passes automatically.
* **Compact / Standard / Jumbo Zoom Bar:** Added a 3-tier zoom selector inside OoT Melodies so you can scale fingering diagrams up to `330px` wide when reading from across your desk or music stand.

👉 **Try the updated Ocarina tool:** [thomsfoolery.com/tools/ocarina/](https://thomsfoolery.com/tools/ocarina/)

---

## 7. Sitewide Polish & Reading Ergonomics 🛠️✨

* **Redesigned Article Footer & Context Cards:** Every essay now finishes with a responsive 2-card Previous/Next navigation grid, one-click social share pills (X, LinkedIn, Facebook, Copy Link), and a unified **Knowledge Context** card linking related topics, themes, and the interactive 3D graph.
* **Markdown Parser & Light-Mode Contrast:** Added native support for numbered lists (`<ol>`) and styled callout boxes (`[!WARNING]`, `[!IMPORTANT]`, `[!NOTE]`, `[!TIP]`), preserved first-line ASCII diagram alignment, and fixed light-mode text contrast across blockquotes and lists.
* **Cleaner `/tools/`, `/interests/`, and `/resume/` Pages:** Removed all `NEW` badges from the `/tools/` directory for a cleaner visual grid, condensed the biographical histories on `/interests/` into punchy overviews with direct explore links, unified the `/resume/` layout, and wired all contact/sponsor inquiries to `social@thomsfoolery.com`.

---

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
