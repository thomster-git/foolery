# Thoms Foolery Monday Dispatch — Release v1.7.0

**Subject:** Patch Notes: v1.7.0 (OSRS Bank Skilling & Overnight GE Flip Engine, NFL Matchup & Score Predictor, 3D Umpire Statcast Batters & Full Catcher Rig)  
**Description:** Launch of the standalone OSRS Bank Skilling & Overnight 8-Slot GE Flip Calculator with exact integer listing prices, new 4-pillar NFL Head-to-Head Matchup & Score Predictor, 9 authentic MLB Statcast batter strike zones, and upgraded 3D pitcher, batter, and crouched catcher anatomy in the Umpire Simulator.  
**Date:** Monday, November 16, 2026  
**From:** Jonathan Thoms (thomsfoolery.com)

---

Hey everyone,

Happy Monday! Today marks **Release v1.7.0**—rolling up everything we’ve engineered, shipped, and refined across the garden since our `v1.6.0` milestone on November 9.

This past week focused heavily on real-time market mathematics, predictive sports modeling, and 3D biomechanical rendering. We launched a brand-new standalone **OSRS Bank Skilling & Overnight GE Flip Engine** at `/tools/osrs-bank-skilling/` featuring live OSRS Wiki API telemetry, exact integer Grand Exchange listing prices, 65+ multi-ingredient skilling recipes, and an automated **8-Slot Overnight "Sleep Flip" Portfolio Optimizer**. In our sports suite, we built a **4-Pillar Head-to-Head Matchup & Score Predictor** directly into the **NFL Trend Analyzer**, combining season vs. recent rolling form, direct head-to-head results, common-opponent transitive margins, and trench/turnover efficiency. Finally, we gave the **3D MLB Umpire Pitch Simulator** a huge realism upgrade with **9 authentic MLB Statcast batter profiles** (scaling dynamically from 5'6" Jose Altuve to 6'7" Aaron Judge) alongside overhauled 3D inverse-kinematics models for the pitcher, batter, and a full crouched catcher behind the plate.

Here is the complete breakdown of everything that has landed in **v1.7.0** since `v1.6.0`.

---

## 1. New Interactive Tool: OSRS Bank Skilling & Overnight GE Flip Engine (`/tools/osrs-bank-skilling/`) ⚖️💰🌙

What started as a simple Grand Exchange tax tracker has evolved into a full-fledged, standalone market analytics and arbitrage engine for *Old School RuneScape* at `/tools/osrs-bank-skilling/` (with an upgrade banner added to `/tools/runescape-bond-tracker/`):

### 📊 Real-Time OSRS Wiki Telemetry & Exact Integer Listing Prices
* **Live Wiki Prices API Sync (`prices.runescape.wiki`):** Pulls live `mapping`, `latest` instant-buy/sell quotes, and `1h` trade volume data on load with one-click manual refresh, connection status indicators, and auto-synced Nature Rune pricing (with manual GP override).
* **Exact Integer GP Listing Prices:** Replaced abbreviated `k`/`m` summaries with **exact integer GP prices** across all recipe inputs, unit outputs, and flip targets so players know the exact number to type into Grand Exchange offer slots.
* **Capped 2% GE Tax & 0% High Alch Math:** Automatically deducts the 2% Grand Exchange tax (capped at `5,000,000 GP` per item) on all market sales while properly applying **0% GE tax** to High Alchemy casts.
* **⚡ Instant vs. ⏳ Patient Pricing Modes:** Toggle instantaneously between **Instant (Fast / Dump)** pricing (buying materials at instant-buy high and selling outputs at instant-sell low) and **Patient (Margin Orders)** pricing (slow-buy low to slow-sell high for maximum merchant margins).
* **Liquidity & Profitability Controls:** Filter methods by minimum 1-hour trade volume (`≥ 50/hr`, `≥ 250/hr`, `≥ 1,000/hr`), filter between **Profitable Only (`Net > 0`)** and **Training Losses (XP Focused)**, and click any row to open an interactive **Batch Profit Calculator** drawer.

### 🛠️ 65+ Multi-Ingredient Recipes Across 6 Bank-Standing Skills
* **🏹 Fletching (15 methods):** Bow stringing (Willow through Magic longbows/shortbows at `1,800/hr`), log cutting (`1,400/hr`), bolt fletching & gem-tipping (Broad, Ruby, Diamond, and Dragonstone bolts at `20,000/hr`), and dart fletching (Adamant & Rune darts at `15,000/hr`).
* **🌿 Herblore (14 methods):** Grimy herb cleaning (Ranarr, Snapdragon, Torstol, Toadflax, Kwuarm, Cadantine, Avantoe at `3,500/hr`), unfinished potions (`2,400/hr`), and finished potions (Prayer, Super Restore, and Saradomin Brews at `2,400/hr`).
* **💎 Crafting (10 methods):** Gem cutting (Sapphire through Dragonstone at `2,500/hr`), gold & gem bracelets (`1,200/hr`), and Air/Fire battlestaves (`2,000/hr`).
* **🪄 Magic & High Alchemy (23 targets):** Tracks high-volume alch staples (`1,200 casts/hr`, `65 XP`) including Rune armor/weapons, dragonhide bodies, Magic bows, enchanted bolts, Dragon med helms, and elemental battlestaves.
* **⚒️ Smithing (5 methods):** Blast Furnace bar smelting (Steel, Mithril, Adamantite, Runite at `4,000/hr`) and Double Mould Cannonballs (`4,400 cannonballs/hr`).
* **🍲 Cooking (4 methods):** 1-tick Raw Karambwans (`4,000/hr`), Sharks, Anglerfish (`1,300/hr`), and Jugs of Wine (`2,200/hr`).

### 🌙 Overnight "Sleep Flip" Scanner & 8-Slot Portfolio Optimizer
* **44 Overnight Dip Candidates:** Added a dedicated **🌙 Overnight GE Flips** tab scanning 32 high-liquidity consumables (Blood, Death, Soul, Wrath, and Nature runes; Dragon, Superior, and Dagannoth bones; Zulrah's scales; Revenant ether; 4-dose potions; herbs; bars; Black chinchompas) and 12 high-margin equipment pieces (Abyssal whip, Dragon boots, Amulet of fury, Berserker ring, Occult necklace, Toxic blowpipe, Dark bow, and Barrows armor sets).
* **Automated 8-Slot Cash Stack Optimizer:** Enter your available gold stack (or click quick `5M`, `10M`, `25M`, `50M`, and `100M GP` presets) and the engine automatically generates an optimal **8-Slot GE Overnight Setup**—calculating exact low-ball overnight buy offers, morning target sell prices, 4-hour buy limit quantities, capital allocation per slot, ROI %, and total estimated morning profit.

👉 **Run live GE margins & overnight flips:** [thomsfoolery.com/tools/osrs-bank-skilling/](https://thomsfoolery.com/tools/osrs-bank-skilling/)

---

## 2. NFL Trend Analyzer: Head-to-Head Matchup & Score Predictor (`/tools/nfl-trend-analyzer/`) 🏈📊

We expanded the **NFL Team Performance & Momentum Analyzer** from a historical trajectory visualizer into an interactive game-projection studio with the launch of the **Head-to-Head Matchup & Score Predictor**:

* **4-Pillar Predictive Scoring Model (`computeNflMatchupPrediction`):** Select any two NFL teams to generate a projected final score, point spread, Over/Under total, and logistic win probability synthesized from four distinct analytical layers:
  1. **Weighted Scoring Baseline (Season vs. Recent Form):** Blends each team's full-season offensive PPG and defensive PAPG with their recent 4-game rolling averages, normalized against the live NFL league-average scoring environment. Includes a 3-mode **Overall vs. Recent Weight** selector:
     * **Balanced:** `55% Full Season / 45% Last 4 Games`
     * **Momentum Heavy:** `30% Full Season / 70% Last 4 Games`
     * **Full-Season Baseline:** `80% Full Season / 20% Last 4 Games`
  2. **Direct Season Head-to-Head (H2H) History:** Automatically detects all completed games already played between the two teams during the current season, displaying exact game scores, venues, overtime flags, and applying a bounded H2H pull adjustment (`±4.5 pts` max).
  3. **Common-Opponent Transitive Margin:** Identifies every shared opponent both teams have played this season, comparing each team's win-loss record, average points scored/allowed, and net scoring margin edge against that common schedule (`±4.0 pts` max spread shift).
  4. **Trench, Down Efficiency & Regressed Turnover Modifiers:** Factors in Yards Per Play (`YPP`), 3rd Down conversion %, Red Zone touchdown %, Sack differential per game, and regressed Turnover Margin per game (`±3.5 pts` max shift), plus selectable **Venue / Home-Field Advantage** (`Team 2 Home +1.8 pts`, `Team 1 Home +1.8 pts`, or `Neutral Site 0.0 pts`).
* **Realistic NFL Score Snapping (`snapFootballScore`):** Prevents impossible or scorigami-rare football scores (`1, 2, 4, 5, 11`), resolves regulation ties cleanly via fractional edge tie-breaking, and outputs a transparent **Math Ledger Summary** showing the exact point contribution of every factor.
* **One-Click Chart Synchronization:** Added a **⇄ Swap Sides** button and a **📈 Highlight Matchup on Chart** button that immediately locks and highlights both matchup teams on the primary Chart.js trend graph above.
* **Expanded Offline Test Coverage:** Added comprehensive unit tests in `scripts/api-health/test-analyzers.js` verifying `summarizeTeamGames`, H2H rematch detection, common-opponent transitive math, weighting modes, HFA shifts, and `snapFootballScore` invariants.

👉 **Simulate NFL matchups:** [thomsfoolery.com/tools/nfl-trend-analyzer/](https://thomsfoolery.com/tools/nfl-trend-analyzer/)

---

## 3. 3D MLB Umpire Simulator: Statcast Batter Profiles & Full 3D Anatomy Overhaul (`/tools/umpire-simulator/`) ⚾🥽

Our 3D behind-the-plate umpire simulator received two major physics and visual realism upgrades this week:

### 📏 Authentic MLB Statcast Batter Profiles & Dynamic Strike Zones
* **9 Real-World MLB Hitter Profiles:** Replaced the static generic strike zone with 9 calibrated MLB star profiles featuring authentic heights, handedness (`RHH`/`LHH`), jersey numbers, and real Statcast vertical strike-zone limits (`sz_bot` to `sz_top`):
  * **Aaron Judge (NYY #99):** `6'7" RHH` • Elevated Zone (`1.72 ft – 3.94 ft`)
  * **Jose Altuve (HOU #27):** `5'6" RHH` • Compact Low Zone (`1.34 ft – 3.16 ft`)
  * **Shohei Ohtani (LAD #17):** `6'4" LHH` • Tall Dynamic Zone (`1.54 ft – 3.68 ft`)
  * **Oneil Cruz (PIT #15):** `6'7" LHH` • Ultra-Tall Zone (`1.70 ft – 3.92 ft`)
  * **Juan Soto (NYY #22):** `6'2" LHH` • Prototypical Zone (`1.48 ft – 3.52 ft`)
  * **Mike Trout (LAA #27):** `6'2" RHH` • Calibrated Zone (`1.50 ft – 3.56 ft`)
  * **Bobby Witt Jr. (KC #7):** `6'1" RHH` • Standard Zone (`1.48 ft – 3.50 ft`)
  * **Mookie Betts (LAD #50):** `5'9" RHH` • Mid-Compact Zone (`1.42 ft – 3.36 ft`)
  * **Steven Kwan (CLE #38):** `5'9" LHH` • Compact Zone (`1.38 ft – 3.28 ft`)
* **Dynamic Lineup Rotation & Proportional Scaling:** Set the batter selector to **Dynamic MLB Lineup** to automatically rotate hitters after every walk or strikeout, or lock in a specific matchup. The 3D batter's height/stance, the 3D pentagonal strike-zone prism, the 2D live Statcast zone map, the post-game scorecard, and the 3D ball-in-zone collision math all adapt dynamically to the active batter's knees and chest midpoint (verified by new unit tests in `scripts/ci/test-tool-math.js`).

### 🧍‍♂️ Upgraded 3D Pitcher Delivery, Batter Anatomy & Full Crouched Catcher Model
* **Biomechanical Pitcher Windup & Delivery:** Upgraded the 3D inverse-kinematics (`ik3`) pitcher model on the mound with a grounded pivot foot that kicks up in follow-through, a high lead-knee lift (`legLiftBell`) driving forward into a firm stride plant, bridged pelvis/hip geometry, sculpted torso shading, red undershirt placket and belt buckle details, high red stirrup socks, white-striped cleats, and a stitched 4-seam baseball held in the throwing hand until the exact moment of release (`t = 1.0`).
* **Sculpted 3D Batter Anatomy:** Enhanced the batter model with proportional torso/leg scaling, bridged hip geometry, leather belt with brass buckle, V-neck jersey trim, a protective lead-arm elbow guard, a gloss-highlighted ear-flap batting helmet, sculpted neck/face profile, and batting gloves gripping the wood bat.
* **Full Crouched Catcher Behind the Plate:** Replaced the standalone floating leather mitt with a complete 3D crouched catcher framed right in front of the umpire camera—complete with deep-squat thighs and calves, knee savers and shin guards, a navy chest-protector back harness with rib straps and brass buckles, a rear skull cap with a 5-point elastic mask harness, an articulated IK left receiving arm that tracks the pitch target and recoils dynamically on impact, and rawhide cross-lacing on the mitt.

👉 **Call the dynamic Statcast zone:** [thomsfoolery.com/tools/umpire-simulator/](https://thomsfoolery.com/tools/umpire-simulator/)

---

## 4. Live Stream Schedule: Holiday Calendar Updates (`/tools/stream-schedule/`) 📺📅

* **Holiday Cancellation Metadata (`stream-schedule.json`):** Updated our live broadcast schedule configuration with November holiday cancellation dates and status reasons (`Holiday / No Stream`), ensuring the 24-hour local-time schedule grid clearly flags off-days alongside our recurring weekday morning review streams.

👉 **View the live stream schedule:** [thomsfoolery.com/tools/stream-schedule/](https://thomsfoolery.com/tools/stream-schedule/)

---

Until next Monday,  
**Jonathan Thoms**  
[thomsfoolery.com](https://thomsfoolery.com)
