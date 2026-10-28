# Project Atlas — Known Issues & Content Backlog

This document tracks active bugs, pending note corrections, UI modernization plans, and songbook expansions across Project Atlas interactive tools and assets.

---

## 1. 🎵 Ocarina Practice Hub (`/tools/ocarina/`)

**Primary Source File:** [`website/templates/layouts/ocarina.html`](file:///home/keel/Project-Atlas-main/website/templates/layouts/ocarina.html)  
**Assets Directory:** [`website/static/images/website-assets/`](file:///home/keel/Project-Atlas-main/website/static/images/website-assets/)

### 1.1 Songbook Melodic Corrections (High Priority)
- [ ] **`littleroot` — Littleroot Town (Pokémon R/S/E)**
  - *Location:* `ocarina.html` (lines ~1396–1409, `SONGS['littleroot']`)
  - *Issue:* Note pitches and measure groupings in the opening phrases do not accurately match the original Hoenn town theme.
  - *Action Required:* Transcribe authentic GBA soundfont melody into 12-hole Alto C range ($C_5$ to $F_6$), fixing accidentals and note durations.
- [ ] **`blue-bird` — Blue Bird (Naruto Shippuden OP 3)**
  - *Location:* `ocarina.html` (lines ~1411–1427, `SONGS['blue-bird']`)
  - *Issue:* Vocal cadence and rhythmic subdivisions in the chorus hook need realignment to match Ikimono-gakari's vocal melody.
  - *Action Required:* Audit note values (`dur: 'q'`, `'e'`, `'h'`) and adjust octave leaps for smooth 12-hole breath pressure.

---

### 1.2 Visual UI & Asset Modernization

#### A. Emoji to Vector SVG Replacement Plan
- [ ] Replace raw Unicode emojis across the tool navigation with crisp, dark-mode-optimized inline/linked SVGs:
  - Finger Chart tab: Replace `📊` with custom fingering / ocarina grid icon.
  - Live Tuner tab: Replace `🎙️` with a microphone / audio wave SVG.
  - Songbook tab: Replace `📖` with a music book / sheet score SVG.
  - OoT Melodies tab: Replace `🎮` with an N64 controller / Triforce emblem.
  - Practice mode & audio triggers: Replace `▶` and `🎙️` with clean stroke SVGs.

#### B. OoT Melodies Missing SVG Medallions & Symbols
Currently, only 5 melodies have visual badge artwork mapped in `loadOotSong()` (lines ~1646–1652):
- `oot-zelda`: `/images/website-assets/royal-crest.svg` ✅
- `oot-epona`: `/images/website-assets/epona.svg` ✅
- `oot-saria`: `/images/website-assets/sarias-Song.svg` ✅
- `oot-minuet`: `/images/website-assets/forest-medal.svg` ✅
- `oot-bolero`: `/images/website-assets/fire-medal.svg` ✅

**Assets Needed to Create / Source in `website/static/images/website-assets/`:**
- [x] **`water-medallion.svg`**: Water Medallion (for `oot-serenade` / Serenade of Water) ✅
- [x] **`shadow-medallion.svg`**: Shadow Medallion (for `oot-nocturne` / Nocturne of Shadow) ✅
- [ ] **`spirit-medallion.svg`**: Spirit Medallion (for `oot-requiem` / Requiem of Spirit)
- [x] **`light-medallion.svg`**: Light Medallion (for `oot-prelude` / Prelude of Light) ✅
- [ ] **`sun-symbol.svg`**: Sun emblem / dawn icon (for `oot-sun` / Sun's Song)
- [ ] **`time-symbol.svg`**: Ocarina of Time / Temple of Time icon (for `oot-time` / Song of Time)
- [ ] **`storms-symbol.svg`**: Windmill / storm cloud icon (for `oot-storms` / Song of Storms)
- [ ] **`scarecrow.svg`**: Pierre & Bonooru straw hat icon (for `oot-scarecrow` / Scarecrow's Song)

---

### 1.3 Full Songbook Versions (Ocarina of Time Thematic Arrangements)
The current `OOT_MELODIES` dictionary (lines ~1610–1624) stores only the brief 6-to-8 note warp cue inputs played in-game to trigger warp teleports or cutscenes. 

The goal is to compose/add **complete, multi-measure playable pieces** in the main **📖 Songbook tab** for each iconic theme:

- [ ] **Ocarina of Time Start Menu / Title Screen Theme**
  - *Structure:* The iconic introductory piano & ocarina duet that plays when the N64 game boots up. Needs full A and B melodies arranged for Alto C.
- [ ] **Saria's Song (Lost Woods Theme)**
  - *Structure:* Extended beyond the opening `F5-A5-B5 F5-A5-B5` cue to include the playful syncopated bridge and looping chorus.
- [ ] **Song of Time (Temple of Time Choral Theme)**
  - *Structure:* Extended beyond the 6-note cue into the full solemn Dorian hymn.
- [ ] **Song of Storms (Windmill Hut Waltz)**
  - *Structure:* Complete 3/4 waltz arrangement with the rising minor arpeggio loop and harmonic resolve.
- [ ] **Minuet of Forest (Sacred Forest Meadow Theme)**
  - *Structure:* Complete peaceful pastoral progression leading up to the Forest Temple entrance.
- [ ] **Sun's Song (Hyrule Field Daybreak)**
  - *Structure:* Full sunrise fanfare with morning pastoral transition.
- [ ] **Bolero of Fire (Death Mountain Crater)**
  - *Structure:* Full rhythmic bolero movement incorporating the Spanish-style triplet pulses and bass accompaniment line.
- [ ] **Serenade of Water (Water Temple / Lake Hylia Theme)**
  - *Structure:* Arpeggiated flowing cadence reflecting the lake's revival.
- [ ] **Nocturne of Shadow** *(Review needed)*
  - *Evaluation:* Determine if an extended arrangement provides strong musical value, or if the 8-note warp melody is the canonical standalone motif.
- [ ] **Requiem of Spirit** *(Review needed)*
  - *Evaluation:* Determine if a full Gerudo desert / Colossus theme expansion is desired or if keeping the 6-note haunting cue is cleaner.
- [ ] **Prelude of Light** *(Review needed)*
  - *Evaluation:* Determine if an extended 2nd verse arrangement is needed, or if the canonical fanfare cue is self-contained.

---

## 2. 🐉 Dragonwilds Tracker (`/tools/dragonwilds-tracker/`)

- [ ] **Dedicated Server Vault Respawn Timer:** Build real-time countdown tracking the 72-minute (3 in-game days) core respawn cadence with audio/visual notification.
- [ ] **Interactive Regional Fishing Map:** Sourcing and embedding interactive spot coordinates matching the 5 rod tiers.
- [ ] **Shareable Collection Goal / Supply Log:** Sync URL state mechanism via URL hash / localStorage.

---

## 3. 🌐 Project Atlas Infrastructure & Polish

- [ ] **Lemon.js Checkout Overlay Integration:** Wire PWYW PDF checkouts directly into tools/articles without page redirects.
- [ ] **Full Autobiography Access Flow:** Transition the `/contact/` mailto gate into an automated Supporter Token / Tally vetting flow.
- [ ] **Mobile Performance & View Transitions:** Audit scroll-driven animations and CWV metrics on low-powered mobile devices.
