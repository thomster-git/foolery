---
id: modular-custom-e-drum-architecture
title: Modular Custom E-Drum Architecture
type: project
status: active
author: Jonathan Thoms
summary: Engineering a custom, low-profile electronic drum kit from the ground up, focusing on space efficiency, modularity, and solving niche triggering limitations.
topics:
  - music
  - technology
  - making
themes:
  - systems-thinking
  - craftsmanship
created: 2026-09-22
updated: 2026-09-22
tags:
  - e-drums
  - engineering
  - laser-cutting
  - fabrication
  - music
related:
---
This project aims to engineer a custom, low-profile electronic drum kit from the ground up. Rather than relying on bulky acoustic shell conversions or buying into locked-down, proprietary hardware ecosystems, this build focuses on space efficiency, modularity, and solving niche triggering limitations.

## The Core Architecture

The foundation of the kit relies on isolating the processing from the physical triggers. By using a mid-tier commercial module featuring individual 1/4" inputs as the central processing unit, the physical hardware can be engineered and calibrated without being bottlenecked by custom software logic.

* **Low-Profile Mesh Pads**: Instead of acoustic shells, the drum pads utilize stackable frames cut via the xTool S1 diode laser. The design consists of a solid base plate for jack mounting, a spacer ring for depth, and a top tension ring. This clamps down dual-ply fiberglass mesh over a central piezo and foam cone, delivering an authentic acoustic bounce in a frame only a couple of inches thick.

* **Sensor Foundation**: Standard 35mm piezoelectric ceramic discs capture the transient voltage spikes of impacts, wired to female 1/4" TRS jacks built directly into the custom frames.

## Technical Innovations & Overcoming Proprietary Limits

Commercial e-kits heavily restrict advanced functionality to upsell top-tier gear. This project bypasses those roadblocks through custom wiring and alternative sensor logic.

### 1. The 3-Zone Ride Hack

Most commercial drum brains require complex, brand-specific resistor networks to achieve a 3-zone ride cymbal (Bow, Bell, and Edge Choke) on a single cable. This build bypasses that proprietary trap using a parallel-wiring method across two 1/4" TRS jacks:

* **Jack 1 (Main Ride Channel)**: Bow Piezo (Tip), Edge Membrane Switch (Ring), Ground (Sleeve).
* **Jack 2 (Aux/Bell Channel)**: Bell Piezo (Tip), Jumper to the exact same Edge Membrane Switch (Ring), Ground (Sleeve).
* **The Result**: A squeeze on the copper-tape membrane switch instantly shorts the Ring on both jacks, sending a choke command to both the ride and bell channels simultaneously, utilizing highly sensitive standard piezos without complex circuitry.

### 2. Solving the "Brush Sweep" Problem

Traditional piezos only detect sharp impacts, making smooth brush swirls impossible to track dynamically. To capture the friction and nuance of wire brushes, standard impact piezos will be supplemented with custom R&D using one of two methods:

* **Capacitive Sensing (MIDI Trackpad)**: A copper grid laser-cut under the snare mesh, wired to a microcontroller. As the conductive wire brushes sweep, capacitive changes are translated into continuous MIDI CC data via a custom Python script, dynamically mapping hand speed to sweep volume.
* **Audio Bridge (Hybrid Acoustic)**: Mounting a high-impedance contact mic inside the snare to capture the literal analog audio of the friction. This bypasses the drum module entirely, blending the live analog sweep sound with the module's digital impact triggers.

## Development Roadmap

* **Phase 1: The Snare Prototype**  
  Design and laser-cut the stackable hoop system. Mount the center crossbar, piezo, and foam cone. Establish baseline triggering, mesh tension, and physical durability.

* **Phase 2: Cymbal Fabrication**  
  Cut polycarbonate cymbal blanks with plywood mounting hubs. Construct the perforated foam and copper tape membrane edge switches. Wire the 2-zone crash and execute the parallel-wired 3-zone ride.

* **Phase 3: Calibration & Kit Expansion**  
  Connect prototypes to the module, balance sensitivity, and eliminate physical crosstalk. Once the logic is perfectly stable, scale production for the remaining toms, the kick drum pad, and the hi-hat assembly.

* **Phase 4: Modular Sensor R&D**  
  Begin prototyping the brush sweep solution—using either the capacitive grid or the contact mic bridge—to expand the kit's dynamic capabilities beyond standard commercial e-drums.
