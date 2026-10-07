---
type: "project"
id: ocarina-practice-tool
title: Ocarina Practice Tool
status: published
created: 2026-09-21
summary: A 12-hole ocarina practice tool featuring a full fingering chart, a live pitch tuner using the Web Audio API, and a custom Zelda songbook editor.
tags:
  - web-audio-api
  - javascript
  - tools
  - ocarina
  - interactive
related:
  - project-atlas
github_url: https://github.com/JonathanThoms/ocarina-practice-tool
demo_url: /tools/ocarina/
---

The **Ocarina Practice Tool** is an interactive web application designed to help players learn the 12-hole Alto C ocarina. Built entirely using vanilla JavaScript, Web Audio APIs, and dynamic SVGs, this tool solves several common problems for beginner and intermediate players.

## Core Features

### 1. The Real-Time Pitch Tuner
Learning breath control on the ocarina is notoriously difficult, as the pitch bends significantly based on how hard you blow into the instrument. To solve this, I built a live tuner directly into the browser.
- Uses the **Web Audio API** and `navigator.mediaDevices.getUserMedia` to capture microphone input.
- Implements an **autocorrelation algorithm** (similar to YIN) to detect pitch frequencies with high accuracy, even from raw mic input.
- Features a **smoothed rolling average** and hysteresis filter to prevent the needle from jumping erratically.
- Provides visual feedback (cents sharp/flat) so players can adjust their embouchure in real-time.

### 2. Dynamic Fingering Charts
Most ocarina charts online are static images that use standard linear layouts, which don't map well to specific physical instruments (especially those requiring cross-fingering for flattened notes).
- The tool uses a central `FINGERINGS` JavaScript array that serves as a single source of truth for the physical instrument's reality.
- SVGs are generated dynamically via JavaScript `renderHoleSVG()`, turning binary arrays (`[1, 1, 0, ...]`) into beautiful, visually accurate ocarina diagrams.

### 3. The Custom Tab Editor
Rather than manually coding new songs, I built a Custom Tab Editor that allows players to instantly generate sheet music. By typing a sequence of notes like `E4 G4 D4`, the system parses the text, looks up the corresponding fingering arrays, and instantly renders the SVG visual tabs to the screen. 

## Technical Philosophy

This tool perfectly encapsulates my philosophy of building "systems" rather than just static pages. By separating the data layer (the fingering truth table) from the presentation layer (the SVG rendering), any updates to a specific note instantly propagate through the entire application, including the songbook and custom tabs.
