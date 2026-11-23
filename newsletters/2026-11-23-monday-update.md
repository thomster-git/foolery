# Thoms Foolery Monday Dispatch — Release v1.8.0

**Subject:** Patch Notes: v1.8.0 (The Case for Permanent Standard Time, GTA V 100% & Achievements Tracker, Graph-First Homepage & Site-Wide Editorial Overhaul, /now Page, Pixel-Exact ABS Umpire Zone)  
**Description:** Publication of The Great Clock Mistake (with an inline SVG Canadian winter-solstice daylight chart), launch of the 279-step GTA V 100% & Achievements Checklist, pixel-exact ABS strike-zone alignment in the 3D MLB Umpire Simulator, a new /now living snapshot page, and a graph-first homepage and editorial layout overhaul.  
**Date:** Monday, November 23, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday! Today marks **Release v1.8.0**—rolling up everything we’ve written, built, play-tested, and redesigned across the garden since our `v1.7.0` release on November 16.

This week brought a major shift in both how the site reads and how you navigate it. On the writing front, we published a new long-form public policy and circadian science essay—***The Great Clock Mistake: Why We Should Wait Until Spring for Permanent Standard Time***—complete with an inline SVG winter-solstice daylight comparison across six Canadian cities. On the tools front, we shipped the **GTA V 100% & Achievements Checklist** (279 chronological steps across 6 chapters and 34 parts, refined directly through live playthrough testing) and calibrated the **3D MLB Umpire Pitch Simulator** so visual pitch trails match Automated Ball-Strike (ABS) border challenges pixel-for-pixel. Finally, we launched a dedicated **/now** living status page, stripped the essay and tool card directories off the homepage so the **Interactive Knowledge Graph** and top header navigation take center stage, and completed a site-wide editorial and visual symmetry overhaul across every layout and published article.

Here is the complete breakdown of everything that has landed in **v1.8.0** since `v1.7.0`.

---

## 1. New Published Essay: *The Great Clock Mistake: Why We Should Wait Until Spring for Permanent Standard Time* (`/articles/the-case-for-permanent-standard-time.html`) 🕰️☀️📉

Every November and March, the debate over abolishing clock changes resurfaces—almost always framed as a push for "Permanent Daylight Saving Time." Our newest essay examines why locking clocks into summer time year-round is a biological and historical mistake, and why waiting until spring to adopt **Permanent Standard Time** is the only durable fix:

* **The Survey Framing Trap (B.C. 2019 & Alberta 2021):** Deconstructs how public consultations in British Columbia (93% support in 2019) and Alberta's 2021 referendum (50.2% No / 49.8% Yes) conflated *hating the twice-yearly clock switch* with *wanting permanent summer time*—without showing voters what 9:30 AM winter sunrises actually feel like.
* **The Acute Toll of "Spring Forward":** Reviews the peer-reviewed epidemiological evidence on the March transition, including the **24% spike in Monday heart attacks** reported by Sandhu et al. (*Open Heart*, 2014) and the **6% surge in fatal U.S. traffic crashes** documented by Fritz et al. (*Current Biology*, 2020).
* **Inline SVG Canadian Winter-Solstice Daylight Chart (Dec 21):** Embeds a custom responsive SVG visual comparing sunrise and sunset windows under Permanent Standard Time vs. Permanent DST across six Canadian cities—**St. John's (`NT`)**, **Toronto (`ET`)**, **Vancouver (`PT`)**, **Winnipeg (`CT`)**, **Calgary (`MT`)**, and **Edmonton (`MT`)**—showing how Permanent DST pushes mid-winter sunrise past **9:30 AM** in Calgary and **9:48 AM** in Edmonton.
* **Circadian Biology & Solar Noon Alignment:** Explains how the suprachiasmatic nucleus (SCN) requires morning blue-spectrum sunlight to suppress melatonin and anchor cortisol rhythms, why longitudinal position on the western edge of a time zone compounds social jetlag (Gu et al., 2017; Giuntella & Mazzonna, 2019), and why sleep societies (AASM, SRBR, and the Canadian Sleep Society) unanimously endorse Permanent Standard Time.
* **Three Historical Permanent-DST Rollbacks:** Traces the real-world experiments where governments tried Permanent DST and repealed it after dark winter mornings sparked public backlash: the **1974 U.S. Emergency Daylight Saving Time Energy Conservation Act** (support plunged from 79% to 42% in three months), the **1968–1971 British Standard Time experiment**, and **Russia's 2011–2014 permanent summer time law**.

👉 **Read the full essay:** [thomsfoolery.com/articles/the-case-for-permanent-standard-time.html](https://thomsfoolery.com/articles/the-case-for-permanent-standard-time.html)

---

## 2. New Interactive Tool: GTA V 100% & Achievements Checklist (`/tools/gta-v-tracker/`) 🎮📋🏆

We built a comprehensive, spoiler-free, chronological **GTA V 100% & All Story Achievements Tracker** at `/tools/gta-v-tracker/` designed to take a fresh playthrough from *Prologue* to *Career Criminal* (`100%`) and `$2.14B` max cash in a single run without missing a single time-sensitive event:

* **279 Chronological Steps Across 6 Chapters & 34 Parts:** Every step is tagged with its exact completion requirements (`100%`, `ACH`, `RE (14)` Random Events, `PREP` setup tips, and `GOLD?` easy mission medals for *Solid Gold, Baby!*) alongside character/map blip badges (`M`, `F`, `T`, `S`, `?`) and prerequisite dependencies.
* **Overall & Category Sub-Progress Trackers:** Tracks your live overall completion percentage alongside four dedicated sub-progress bars: **100% Checklist Steps**, **Achievement Milestones**, **Random Events (Goal: 14)**, and **Easy Gold Medal Targets (Goal: 70)**—all persisted locally in `localStorage` with one-click JSON backup export and import.
* **Multi-Dimensional Filtering & Search:** Filter the 279-step route in real time by status (**All**, **Remaining**, **Completed**), requirement type (**100% Required Only**, **Achievements Only**, **Gold Medal Targets**), chapter jump selector, or instant keyword search.
* **4 Collapsible Quick-Reference Strategy Drawers:**
  1. **⚠️ Critical Rules & Missables:** Ending C (*The Third Way*), holding Lester's four optional assassinations until after *The Big Score*, the missable **Altruist Cult** (*Altruist Acolyte*) and **Simeon Yetarian** (*Random Event: Simeon Yetarian*) windows, and clean-save protection against cheats.
  2. **👥 Optimal Heist Crew (Max Payout & Skill Growth):** Exact low-cut crew picks (*Karim Denz*, *Packie McReary*, *Taliana Martinez*, *Chef*, *Rickie Lukens*) so specialists level up across heists without dropping a single dollar of take.
  3. **📈 Lester Stock Market Cheat Sheet (`$2.14B` Cap):** Step-by-step **LCN** and **BAWSAQ** buy/sell timings, target peak return percentages (`~50%` to `~300%`), and rebound investments across *The Hotel Assassination*, *The Multi Target Assassination*, *The Vice Assassination*, *The Bus Assassination*, and *The Construction Assassination* (plus the *Hitch Lift 1* **Tinkle** bonus tip).
  4. **✂️ Notable Cut Content & Trivia:** Highlights beta/cut story elements including *The Sharmoota Job*, playable Lamar post-game concepts, and cut wildlife missions.
* **Play-Tested Chapter 1 Routing Refinements:** Refined the Chapter 1 Part A & Part B sequence from live playthrough testing—moving *Chop* before *Complications*, storing the mission-spawned **Bullet GT** right after Lamar rides off in *Repossession* (saving an extra garage trip before *Street Race 1: South Los Santos*), verifying all Simeon (`S`) vs. Strangers & Freaks (`?`) map icons, and grouping stubborn RNG spawns (*Mugging 1*, *Security Van 1*, *Construction Accident*, *Graham the Zombie*, and *Impotent Rage*) as non-blocking catch-up items so they never stall main story momentum.

👉 **Track your 100% playthrough:** [thomsfoolery.com/tools/gta-v-tracker/](https://thomsfoolery.com/tools/gta-v-tracker/)

---

## 3. 3D MLB Umpire Pitch Simulator: Pixel-Exact ABS Strike-Zone Alignment (`/tools/umpire-simulator/`) ⚾🎯📏

Following last week's Statcast batter profile release, we noticed a subtle parallax and border discrepancy where a pitch trail could visually clip the white strike-zone line on screen while the Automated Ball-Strike (ABS) challenge system ruled it a ball by a fraction of an inch. We overhauled the cross-plate rendering and evaluation math so the visual trail and ABS physics match **100% pixel-for-pixel**:

* **Unified Front-of-Plate Evaluation Plane (`Z = 0`):** Synchronized `isStrike()` in `umpire-pitch-data.js`, the 3D canvas renderer, and the 3D replay trail termination time (`t = trajectory.tf`) to evaluate and freeze the ball at the exact front plane of home plate (`Z = 0`, `17 inches` wide).
* **Physical Baseball Radius Projections (`rBallPx`):** Replaced the fixed pixel dot at plate crossing with the ball's exact physical `1.45-inch` radius (`BALL_RADIUS = 1.45 / 12 ft`) projected into perspective screen space (`rBallPx = BALL_RADIUS * crossProj.scale`).
* **Inset Zone Border Geometry:** Changed the 3D strike-zone prism border stroke so its outer edge aligns with the true rulebook boundary (`[-HALF_W, +HALF_W] × [sz_bot, sz_top]`) rather than bleeding outward by half the stroke width. If any pixel of the baseball's perimeter touches any pixel of the white zone border, it is mathematically and visually a strike.

👉 **Test your eye on the calibrated ABS zone:** [thomsfoolery.com/tools/umpire-simulator/](https://thomsfoolery.com/tools/umpire-simulator/)

---

## 4. New `/now/` Living Snapshot Page & Expanded `/uses/` Stack (`/now/` & `/uses/`) 📍🛠️🔒

* **New `/now/` Living Snapshot Page (`/now/`):** Inspired by Derek Sivers' `/now` movement, we added a dedicated `/now/` page (linked directly in the top navigation bar) featuring a dated November 2026 snapshot from Carbonear, Newfoundland—covering current workshop and homelab builds, what I'm playing (*GTA V* 100% routing and *RuneScape: Dragonwilds*), photography & engraving practice, and off-season Blue Jays & Atlantic Standard Time notes.
* **"What I Deliberately Don't Self-Host" on `/uses/`:** Added a concise footnote breakdown on `/uses/` explaining the three external services I deliberately outsource rather than running on my own bare-metal rack: **NordVPN** for off-site encrypted tunneling ([refer-nordvpn.com/YBErCviqfRb](https://refer-nordvpn.com/YBErCviqfRb)), **Buttondown** for newsletter delivery and reputation management, and **Lemon Squeezy** as Merchant of Record for global tax compliance.

👉 **See what I'm working on right now:** [thomsfoolery.com/now/](https://thomsfoolery.com/now/)

---

## 5. Graph-First Homepage & Site-Wide Editorial Overhaul (`/`, `/interests/`, `/tools/`, `/resume/`, `/uses/`) 🕸️✍️🎨

We completed a comprehensive design and editorial pass across the entire site to strip away repetitive card templates and formulaic essay scaffolding:

* **Graph-First Homepage (`/`):** Removed the redundant **Published Essays & Technical Case Studies** and **Interactive Tools & Compendiums** card directories from the homepage. The homepage now opens with a left-aligned editorial intro, leads directly into the **540px Interactive Knowledge Graph** (so visitors explore topics spatially or jump via the top navigation bar), and closes with a clean **Changelog & Roadmap**.
* **Asymmetric Page Layouts & CSS Architecture (`atlas.css`):**
  * Eliminated duplicate legacy stylesheet copies, unified hardcoded cyan accents to match the site's warm ember palette, removed gradient-clipped hero headings and universal `h2::before` bars, and split the generic `.card` component into `.card--feature`, `.card--plain`, and `.note`.
  * **Interests (`/interests/`):** Replaced 18 identical badge/pill cards and accordion drawers with 3 large narrative feature essays (Blue Jays scorebook, *Ocarina of Time* on original N64 hardware, and workshop laser engraving) paired with compact text notes across varied asymmetric grids.
  * **Tools (`/tools/`), Resume (`/resume/`) & Uses (`/uses/`):** Reorganized `/tools/` into 3 primary daily-driver feature cards followed by a scannable directory table; streamlined `/resume/` with prose introductions, targeted skill badges on key roles, and single-line early career entries; and stripped decorative emoji bloat across all headers.
* **First-Person Essay & Draft Polish:** Removed theatrical "Act I / Act II" headings, repetitive callout boxes, and redundant diagrams across all 9 published essays and 14 upcoming draft previews, added collapsible `<details class="code-rollup">` drawers for heavy Python/YAML blocks in *Building a Production Discord Ecosystem*, and grounded technical and medical claims with verified primary citations.

👉 **Explore the new graph-first homepage:** [thomsfoolery.com](https://thomsfoolery.com)

---

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
