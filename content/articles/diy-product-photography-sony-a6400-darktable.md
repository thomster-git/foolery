---
stage: "teaser"
id: "diy-product-photography-sony-a6400-darktable"
title: "DIY Product Photography: Shooting Laser-Engraved Slate with a Sony a6400 and Darktable"
type: "article"
status: "published"
access: "public"
author: "Jonathan Thoms"
created: 2026-11-02
updated: 2026-11-20
date: "2026-11-02"
summary: "How I built a repeatable tabletop photography setup for our laser-engraved slate and wood coasters using a matte poster-board sweep, one softbox, locked manual settings on a Sony a6400 kit lens, and an open-source batch RAW pipeline in Darktable."
topics:
  - technology
themes:
  - craftsmanship
  - systems-thinking
  - creativity
tags:
  - photography
  - sony-a6400
  - darktable
  - open-source
  - product-photography
  - ecommerce
  - workflow
  - maker
related:
  - manifesto
  - sensible-infrastructure-and-white-box-servers
  - building-a-comprehensive-discord-ecosystem
  - project-atlas
---

When we put together the storefront at [thomsfoolery.com/store](/store/), we immediately hit a photography problem: the first batch of laser-engraved coasters and bottle openers spanned the widest possible contrast range. We were shooting dark charcoal riven slate right next to warm bamboo, walnut, and white Carrara marble.

If you shoot dark slate and white marble with a phone on auto-exposure under living room lights, the camera fights you on every frame. Auto-exposure hunts, white stone blows out, and dark slate turns into a flat, noisy gray smudge where you cannot see the laser stippling at all.

Before settling on our final setup, I tried four things we already had around the house—and threw out the first three.

---

## Three Setups That Failed (and the Poster-Board Sweep That Worked)

When you want clean product shots, the first instinct is usually to build or buy an enclosed box. In practice, enclosing a small item makes lighting it much harder:

* **The Daylight Window:** Natural window light looks fine for a single casual shot, but over a 45-minute session the Newfoundland sky shifts constantly. Passing clouds changed both brightness and Kelvin color temperature between frames, and the window screen cast a faint grid shadow across the stone.
* **Fabric Sheets:** We tried draping white, black, and green fabric over chairs. Under angled light, every microscopic weave and fold showed up behind the coaster—and the green cloth bounced an ugly green cast onto the beveled edges of the wood and marble.
* **An IKEA Kallax Cube & a Painted Wooden Box:** Clearing out a 13×13 Kallax cubby (and testing a small white-painted plywood box) blocked all side lighting. You could only blast light straight in from the front, which flattened the laser texture and reflected the paint roller stipple directly into the lens.

<div class="photo-slot">
[Photo slot: /images/workshop/photography-setup-sweep-and-failures.jpg — Behind-the-scenes shot of the open matte poster-board sweep, Mount Dog 50x70cm softbox at 45 degrees, and Sony a6400 on the tripod]
</div>

What actually worked cost about three dollars: an **open tabletop infinity sweep** made from a single sheet of matte white poster board taped to an upright backing board and curved gently onto the table with no crease.

We turned off the overhead room lights, closed the blackout blinds, and placed a single 50×70 cm continuous softbox at a 45-degree angle close to the left side of the table. Because a 20×28-inch diffuser face is huge relative to a 4-inch coaster, the light wraps softly across the cleaved slate ridges while leaving a natural contact shadow on the right side so the coaster looks like a real object sitting on a surface rather than a floating cutout.

![Stacked 4-pack of square slate coasters resting on the seamless white tabletop sweep](/store/images/coasters/slate/square/slate-square-set.jpg)
*Figure 1: A 4-pack stack of square natural slate coasters (`DSC02050`) on the poster-board sweep. The curve removes the rear horizon line while keeping the soft contact shadow on the right.*

---

## Locking the Sony a6400 & 16–50mm Kit Lens

You don't need an expensive prime lens for catalog shots if you lock the Sony a6400 and its 16–50mm `f/3.5–5.6` kit zoom into manual mode at its optical sweet spot:

* **35mm Focal Length (`52.5mm` full-frame equivalent):** Shooting wide at 16mm introduces barrel distortion that warps square coasters into trapezoids, while 50mm softens slightly at the edges. Thirty-five millimeters gives flat, natural geometry.
* **`f/8.0` Aperture, `ISO 100`, `1/15s` Shutter:** At `f/3.5` or `f/5.6`, the rear edge of an angled coaster falls out of focus. Stopping down to `f/8.0` keeps the front engraving and rear stone bevel sharp corner-to-corner before diffraction sets in around `f/11`. Because the camera sits on a tripod, we keep `ISO 100` for clean shadows and let a `1/15s` shutter expose the white sweep to `+0.3` to `+0.7 EV`.
* **Custom White BalanceSampled Off the Sweep:** Auto White Balance sees a dark slate coaster and shifts the whole frame warm, then sees a bamboo coaster and shifts it cool. Sampling the lit poster board once under `Custom 1` locks every frame to the exact same color temperature.
* **SteadyShot Off + 2-Second Timer:** On a locked tripod, Optical SteadyShot (`OSS`) gyros hunt for movement that isn't there and can introduce micro-blur during a `1/15s` exposure. Turn SteadyShot **Off**, enable `e-Front Curtain Shutter`, use a 2-second self-timer so finger vibration dies out before the shutter opens, and save the whole profile to **Memory Recall Slot 1 (`MR 1`)** on the top dial.

| Parameter | Setting | Why |
|:---|:---|:---|
| **Focal Length** | `35mm` (52.5mm eq.) | Avoids wide-angle barrel distortion; sharpest range of the kit zoom. |
| **Aperture** | `f/8.0` | Keeps front engraving and rear bevels in focus without diffraction. |
| **ISO & Shutter** | `ISO 100` · `1/15s` | Zero shadow noise on dark slate; exposes the sweep to +0.3 to +0.7 EV. |
| **White Balance** | `Custom 1` (sampled sweep) | Prevents color drift when switching between dark stone and warm wood. |
| **Autofocus** | `AF-S` · `Flexible Spot: S` | Face/Eye AF Off so the camera doesn't hunt inside engraved illustrations. |
| **Stabilization** | `SteadyShot Off` + `2s Timer` | Prevents tripod gyro drift and finger-press shake. |
| **Format** | `14-bit RAW (.ARW)` | Preserves full highlight and shadow latitude for Darktable. |

---

## Batch Processing in Darktable

Once sixteen coasters are shot under identical light from a fixed tripod, you don't need to edit sixteen photos one by one in Photoshop. We develop the `.ARW` files in **Darktable**, dial in the history stack on the first coaster, and paste it across the batch.

### 1. Square Crop with Optical Headroom (`crop`)
We crop to **1:1 (Square)**, pulling the bottom edge up past the front of the table. Instead of centering the coaster dead-center vertically—which makes an upright object look like it is sinking—we leave roughly 15% more white space above the coaster than below it.

### 2. The Two-Mountain Histogram (`rgb levels`)
If you try to make the background pure `#FFFFFF` white by cranking global exposure or contrast, you either wash out the dark slate or crush its grain into an ink blot.

Opening `rgb levels` shows two distinct peaks on the histogram: a wide mountain on the right (the white poster board) and a narrow peak on the left (the dark slate). By pulling the white point slider just to the edge of the right mountain—without going far enough to erase the soft contact shadow under the coaster—the backdrop snaps to pure `#FFFFFF`. Shifting the middle-gray slider slightly left (`~0.35–0.40`) opens up the diagonal stone cleavage while keeping the black point anchored.

![Laser-engraved Nativity scene on natural chipped-edge slate](/store/images/coasters/slate/square/slate-square-nativity.jpg)
*Figure 2: Nativity slate coaster. Lifting middle gray in `rgb levels` to ~0.38 brings out the split stone edge while the background snaps to `#FFFFFF`.*

### 3. Bringing Out the Laser Stippling (`local contrast`)
Laser engraving on slate works by micro-fracturing the dark mineral surface into frosty white stipples. In Darktable's `local contrast` module (set to **Local Laplacian** at `150% Detail`, `75% Highlights`, `50% Shadows`), those frosted stipples separate cleanly from the dark stone without the white edge halos you get from regular sharpening.

![Laser-engraved Santa slate coaster showing micro-stippling detail](/store/images/coasters/slate/square/slate-square-santa.jpg)
*Figure 3: Santa slate coaster with Local Laplacian contrast isolating the fine stippling in the beard and snowflakes.*

### 4. Removing the Plastic Stand on Round Coasters (`color equalizer` & `retouch`)
Square coasters stand up on their own bottom edge, but round coasters roll unless you prop them on a small stand. In our shoot, two bright blue plastic stand corners peeked out underneath the round slate blanks.

Because the coasters themselves contain zero blue, pulling **Blue Saturation to `-100%`** and **Blue Luminance to `-50%`** in `color equalizer` turns the blue plastic into a neutral gray shadow in five seconds. Where a corner poked out onto the white sweep, tracing a quick path with the `retouch` module in **Clone** mode (sampling clean adjacent poster board rather than Heal, which smudges blue tint) erased it completely.

![Circular laser-engraved sleigh coaster with support stand erased](/store/images/coasters/slate/circle/slate-circle-sleigh.jpg)
*Figure 4: Round sleigh coaster after cloning out the two lower plastic stand corners against the adjacent white sweep.*

---

## From Three Hours a Batch to Fifteen Minutes

Once the first square and round coasters were dialed in, we switched to Darktable's **Lighttable** view, copied `crop`, `rgb levels`, and `local contrast` from the history stack, pasted them onto the remaining fourteen RAW files in one click, and exported the batch as `1200×1200` sRGB WebP files at quality 90.

| Natural Slate | Solid Timber | Carrara Marble & Acacia |
|:---:|:---:|:---:|
| ![Laser-engraved puppy on square natural slate](/store/images/coasters/slate/square/slate-square-puppy.jpg) | ![Laser-engraved puppy on solid wood](/store/images/coasters/wood/square/wood-square-puppy.jpg) | ![Polished Carrara marble and acacia wood coaster](/store/images/coasters/marble+acacia/square/marble-acacia-square-blank.jpg) |
| **Natural Chipped Slate**<br>1200×1200 WebP (88 KB) | **Solid Pine / Timber**<br>1200×1200 WebP (72 KB) | **Marble & Acacia Split**<br>1200×1200 WebP (68 KB) |

Each finished storefront image weighs between **68 KB and 88 KB** instead of 24 megabytes, and shooting a new batch of sixteen coasters now takes about fifteen minutes from unrolling the poster board to pushing the WebP files live.
