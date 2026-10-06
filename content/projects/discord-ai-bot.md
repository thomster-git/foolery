---
id: discord-ai-bot
title: "The Thoms Foolery Discord Bot"
type: project
status: active
author: Jonathan Thoms
summary: A custom Python bot that transformed a standard Discord server into a self-sustaining ecosystem — complete with a virtual economy, real-time sports APIs, automated meme triggers, and stateful AI agents powered by the Google Antigravity SDK.
topics:
  - technology
themes:
  - systems-thinking
  - craftsmanship
  - creativity
related:
  - building-a-comprehensive-discord-ecosystem
  - discord-vs-corporate-comms
  - discord
  - project-atlas
tags:
  - discord-bot
  - python
  - automation
  - baseball
  - ai
  - antigravity-sdk
created: 2026-09-14
updated: 2026-09-22
---

Most Discord servers follow the same arc: initial excitement, then silence. The same five people talk in `#general`, every niche channel becomes a graveyard, and eventually people stop checking in altogether.

This project was built to solve that problem — specifically, for my own community, Thoms Foolery.

## The Problem

The server had all the right channels: baseball, hockey, F1, tech, gaming. But without a reason to interact with them, people defaulted to `#general` or left entirely. The solution wasn't adding more channels. It was adding stakes, automation, and the right kind of friction.

## Architecture

The bot is built in **Python 3.14** using the async `discord.py` framework, organized into a strict **Cogs** architecture. Each Cog is an isolated, hot-reloadable module:

- `economy.py` — XP, leveling, and Server Points engine
- `baseball.py` — Live Blue Jays data, bullpen tracking, and automated game alerts
- `football.py` / `hockey.py` — Bills, Eagles, Canadiens, Maple Leafs live scoreboards
- `mascot.py` — The stateful AI agent with channel-aware persona switching
- `agent_content.py` — The automated Weekly Highlight Reel generator
- `db.py` — SQLite3 data layer, backups, and state persistence

A background task fires daily at midnight to zip the entire database and AI memory folders into `/backups/` so nothing is ever lost.

## The Economy

The server runs on a closed-loop virtual economy called **Server Points**.

**Earning:** The bot listens to `on_message` and `on_reaction_add` events. Just participating earns XP and points passively. Solving the automated Daily Chess Puzzle earns a bonus. In-memory cooldown dictionaries prevent spam gaming.

**Risking:** Points have weight because they can be lost. `/bet_place` lets users wager on real-world games or admin-created meta-bets ("Will Joey answer Ryan today?"). `/roulette` offers an instant 2x or 14x payout, with all results logged to a public `#betting-log` so the community watches wins and losses in real time.

**Spending:** To prevent point inflation, the economy has sinks. Users can spend points to upload custom server stickers, emojis, or buy a temporary "High Roller" role to publicly flex their balance.

## Real-Time Sports Integration

Rather than scraping, the bot reverse-engineered the hidden `site.api.espn.com` endpoints to get live, richly structured JSON data for every sport.

**Baseball (Blue Jays):** The most sophisticated integration. The bot parses live base-runner state (e.g., runners on 1st and 3rd, 2 outs) and maps each unique state to custom base-graphic emojis uploaded to the server. It also calculates bullpen availability by parsing the last 3 days of box scores to track each reliever's pitch counts.

**Meme triggers:** Specific player events fire automated image drops. If Alejandro Kirk hits a home run, the bot immediately posts a custom reaction image to `#⚾-baseball`. If Louis Varland gets a Win or Save, same thing. These aren't generic alerts — they're targeted to players the community actually cares about.

**F1:** OpenF1 API drives `/f1` schedule commands and automated 24-hour Grand Prix weekend reminders with track details and timing.

## AI Agents (Antigravity SDK)

The intelligence layer is powered by the **Google Antigravity SDK**, running two distinct agents:

**The AI Mascot (`mascot.py`):** A stateful, memory-retaining agent configured via `LocalAgentConfig`. It reads channel context to switch persona. In `#chat-with-bot` it matches user energy — if someone's being rude, it roasts them back. In `#⚾-baseball` or `#🏒-hockey`, a system override fires and it drops the snark entirely to provide polite, focused sports stats. Tool calling via `CapabilitiesConfig` lets it route questions — general queries go to `BuiltinTools.SEARCH_WEB`, MLB player stat queries go through a custom `get_mlb_player_season_stats` function.

**The Weekly Highlight Reel (`agent_content.py`):** A background agent that wakes every Monday, sweeps the last 500 messages from every opt-in channel, processes them through `gemini-3.5-flash-lite` (chosen for token efficiency), and generates a FOMO-inducing "What You Missed" summary posted to `#general`. Users who never check `#⚾-baseball` see something interesting happening there and click over.

## Quality of Life Details

Discord enforces strict file size limits on custom emojis (256KB) and stickers (512KB). The bot includes a **Pillow-based image processor** that intercepts files exceeding these limits, runs a compression loop in an async thread, and uploads the result seamlessly. No more fighting with image editors just to add a reaction image.

## The Result

The Thoms Foolery bot is the server's heartbeat. When a new member joins, an `on_member_join` embed immediately explains the economy and role selection. From that point forward they're pulled into a world of daily chess puzzles, live sports tracking, high-stakes betting, and an AI that actually has a personality.

The niche channels stopped being ghost towns. The economy creates reasons to keep coming back. The automation makes the server feel alive even when nobody's actively posting.
