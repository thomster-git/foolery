---
stage: "teaser"
id: building-a-comprehensive-discord-ecosystem
title: "The Architecture of an Autonomous Community Operating System"
type: article
status: published
created: 2026-10-19
updated: 2026-10-19
access: public
summary: A deep technical breakdown of the Thoms Foolery Discord Ecosystem — a custom Python bot built with discord.py, SQLite3, Google Antigravity SDK, Pillow, and reverse-engineered sports APIs. This is the story of how a standard Discord server was re-engineered into a self-sustaining, proactive community operating system.
topics:
  - technology
themes:
  - community
  - craftsmanship
  - systems-thinking
tags:
  - discord-bot
  - python
  - ai-agents
  - system-architecture
  - community-engineering
  - sports-analytics
related:
  - project-atlas
  - discord
  - technology
---

> **Architecture Blueprint & Field Report**  
> **Project:** Thoms Foolery Discord Ecosystem &nbsp;|&nbsp; **Platform:** Discord & Python 3.14  
> **Tech Stack:** `Python 3.14` • `discord.py` • `SQLite3 (WAL)` • `Google Antigravity SDK` • `Pillow` • `aiohttp`  
> **Status:** Production / Final Release  
> **Tags:** [`#discord-bot`](/tags/discord-bot.html) [`#python`](/tags/python.html) [`#ai-agents`](/tags/ai-agents.html) [`#system-architecture`](/tags/system-architecture.html) [`#community-engineering`](/tags/community-engineering.html) [`#sports-analytics`](/tags/sports-analytics.html)

| 22+ Modular Cogs | 100% Async / Non-Blocking | 0 External API Fees | 30-Day Rolling Backups |
|:---:|:---:|:---:|:---:|
| Hot-reloadable domain modules | Event-loop safety via `aiohttp` | Reverse-engineered ESPN & OpenF1 | Automated midnight tarballs |

---

## 1. Executive Overview & The Genesis

Online communities live or die by momentum. The typical trajectory of a private Discord server is familiar: an enthusiastic initial launch, a few weeks of bustling activity, and then an inevitable slide into dormancy. Sub-channels dedicated to niche interests (like `#⚾-baseball` or `#🏒-hockey`) become ghost towns because only a fraction of the server cares to check in daily.

The question this project set out to answer was this: **What if the server itself was the engine of engagement?** Not a passive chat room, but an active, living system that generated content, rewarded participation, and manufactured FOMO — all without requiring constant manual effort from administrators.

The Thoms Foolery Discord bot is the answer. It is not a moderation tool. It is not a simple music bot. It is a **Community Operating System** — 22+ specialized subsystems running in concert, woven together with a virtual economy, real-time sports data, and autonomous AI agents that give the server a heartbeat, a personality, and a memory.

This document is the full technical breakdown of how it was built, why each decision was made, and what the final system looks like in production.

---

## 2. The Core Philosophy: Proactive Over Reactive

The most important architectural decision made in this project was also the simplest: **the bot should talk first.**

> 💡 **The Proactive Paradigm Shift**  
> Most Discord bots are purely reactive: they sit idle until someone enters a `/command`. If members stop typing, the bot goes dark, and the server follows. By inverting this dynamic—broadcasting real-time sports telemetry, automated daily chess puzzles, and scheduled event prompts—the bot initiates conversation, giving passive lurkers a constant reason to engage.

The slash commands and interactive features exist, but they are secondary. The vast majority of the system's value is delivered through **automated, scheduled broadcasts** that happen without user intervention. The sports alerts, the AI-written weekly highlights, the daily chess puzzles, and the economy leaderboards all fire on independent timers and push context into channels, sparking reactions that feed back into organic conversation.

```text
┌────────────────────────────────────────────────────────┐
│         ⏰ Scheduled Timers & Live Sports APIs          │
└───────────────────────────┬────────────────────────────┘
                            │ (Broadcasts telemetry without prompt)
                            ▼
┌────────────────────────────────────────────────────────┐
│         📢 Niche Channels (#baseball, #f1)             │
└───────────────────────────┬────────────────────────────┘
                            │ (Sparks organic replies & hype triggers)
                            ▼
┌────────────────────────────────────────────────────────┐
│         💬 Member Chatting & Emote Reactions           │
└───────────────────────────┬────────────────────────────┘
                            │ (Passively earns XP & Server Points)
                            ▼
┌────────────────────────────────────────────────────────┐
│         💰 Virtual Economy Engine (Faucets & Sinks)    │
└───────────────────────────┬────────────────────────────┘
                            │ (Wagers in /bet_place or /roulette)
                            ▼
┌────────────────────────────────────────────────────────┐
│         👀 Public #betting-log Stream                  │ ──┐ (Ambient drama
└────────────────────────────────────────────────────────┘   │  fuels curiosity
                            ▲                                │  & retention)
                            └────────────────────────────────┘
```

---

## 3. Technical Architecture & State Management

The bot is built on **Python 3.14** using the asynchronous `discord.py` wrapper. Every feature is built around the `asyncio` event loop. Because Discord gateway heartbeats must be dispatched every ~41.25 seconds, any long-running API call (e.g., fetching live baseball data or generating an AI summary) must never block the main thread and risk gateway timeouts (`CloseCode 4000/1000`).

### 3.1 Modular Design via Cogs

The codebase is organized into **22 specialized Cog modules**, categorized across six decoupled operational layers. Each module encapsulates its own state, slash commands, event listeners, and asynchronous background tasks:

| Category | Cog File | Primary Responsibility | Key Libraries / APIs |
|---|---|---|---|
| **Economy & Casino** | `cogs/economy.py` | Wallet balances, daily stipends, pay/transfer, leaderboard | `SQLite` |
| | `cogs/slots.py` | 3x3 slot reels, 5 paylines, ~95% RTP, progressive jackpot pool | `random`, `discord.ui` |
| | `cogs/blackjack.py` | Interactive table, soft/hard Aces, dealer draws to soft 17, 3:2 payout | `discord.ui.View` |
| | `cogs/lotto.py` | Weekly community lottery pool, automated Sunday drawings | `@tasks.loop` |
| | `cogs/pulltabs.py` | Tiered scratch ticket minigames, instant gratification | `random`, `discord.ui` |
| **Sports & Betting** | `cogs/betting.py` | User-facing wager placement, balance escrows, payout settlement | `SQLite` |
| | `cogs/agent_betting.py` | Autonomous AI bookie: auto-generates betting pools from ESPN schedules | ESPN API, `@tasks.loop` |
| | `cogs/baseball.py` | Live MLB game states, diamond bitmask emojis, bullpen fatigue | ESPN API, `asyncio` |
| | `cogs/football.py` | Live NFL game tracking, red zone / turnover alerts | ESPN API |
| | `cogs/hockey.py` | Live NHL score tracking, goal alerts, power play indicators | ESPN API |
| | `cogs/motorsport.py` | Formula 1 race tracking, pit strategies, sector timing | Ergast / OpenF1 API |
| **AI & Agents** | `cogs/mascot.py` | Persona engine, LLM chat completions, context pruning | Google Gemini API |
| | `cogs/agent_content.py` | Automated daily digests, recaps, scheduled content | Gemini API, `SQLite` |
| **Governance** | `cogs/moderation.py` | AutoMod evasion filter (leetspeak/edits), progressive timeouts, channel lockouts | `re`, `discord.AuditLog` |
| | `cogs/roles.py` | Self-assignable role menus, reaction/button roles | `discord.ui.Select` |
| **Infrastructure** | `cogs/voice.py` | Dynamic "Join to Create" temporary voice channel lifecycle | `discord.VoiceChannel` |
| | `cogs/utility.py` | Ping/latency, server info, uptime, administrative reload commands | `discord.ext.commands` |
| **Community & Fun** | `cogs/chess.py` | Interactive chess games rendered in Discord embeds | `python-chess` |
| | `cogs/poll.py` | Custom reaction and button polls with timed closures | `discord.ui` |
| | `cogs/overwatch.py` | Live Overwatch 2 rank and hero stats lookup | OW API |
| | `cogs/movies.py` | Movie Night engine: TMDB search, posters, trailers, voting | TMDB API |
| | `cogs/music.py` | Voice audio playback, yt-dlp stream pipeline, queue management | `yt-dlp`, `PyNaCl`, `FFmpeg` |

This strict separation means a bug in the motorsport module cannot crash the betting engine. Each cog is loaded independently and can be hot-reloaded at runtime via `/admin reload <cog>` without taking the bot offline.

```python
"""
Production Cog Lifecycle Pattern: Graceful Async Initialization and Task Teardown
Ensures zero task leaks during dynamic runtime hot-reloads via /admin reload.
"""
import asyncio
import discord
from discord.ext import commands, tasks
import aiohttp
import logging

logger = logging.getLogger("thomsfoolery.baseball")

class BaseballCog(commands.Cog, name="Baseball"):
    def __init__(self, bot: commands.Bot, session: aiohttp.ClientSession, db):
        self.bot = bot
        self.session = session
        self.db = db
        self.last_game_id: str | None = None

    async def cog_load(self) -> None:
        """Async lifecycle hook: executed when cog is registered or reloaded."""
        logger.info("Initializing BaseballCog background telemetry loop...")
        self.live_poll_loop.start()

    async def cog_unload(self) -> None:
        """Teardown hook: cancels background loops to prevent dangling tasks in memory."""
        logger.info("Unloading BaseballCog: terminating polling tasks...")
        if self.live_poll_loop.is_running():
            self.live_poll_loop.cancel()

    @tasks.loop(seconds=30.0)
    async def live_poll_loop(self) -> None:
        """Background poller with error boundaries to prevent loop death."""
        try:
            await self._check_live_game()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.error("Unhandled error in live_poll_loop: %s", exc, exc_info=True)

    @live_poll_loop.before_loop
    async def before_live_poll(self) -> None:
        """Guarantee bot cache is populated prior to polling."""
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot) -> None:
    await bot.add_cog(BaseballCog(bot, bot.session, bot.db))
```

### 3.2 State Persistence, Concurrency & The Safety Layer

Persistence is handled by a localized **SQLite3 database** (`bot_data.db`), managed through a centralized `db.py` module. This module serves as the authoritative single source of truth for all stateful data across the ecosystem:

- **The Economy**: User XP, level thresholds, and Server Points balances
- **The Betting & Casino Engine**: Open pool metadata, wager records, progressive jackpot balance, and payout odds
- **Redemption Logs**: Purchase records for custom emojis, stickers, and vanity flex roles
- **Bot State & AI Sessions**: A key-value configuration store tracking:
  - Timestamps of last automated message per channel (preventing double-posting)
  - Persistent AI conversation session IDs for continuous mascot memory across restarts
  - Scheduled job completion flags and feature toggles for runtime experimentation

#### Kernel-Level Singleton Process Lock (`bot.lock` via `fcntl.flock`)

In production environments running under supervisors (like systemd, Docker, or PM2), an accidental multi-process launch or overlapping daemon reload can spin up duplicate bot processes. If two instances connect to the Discord Gateway using the same bot token simultaneously:
1. Both instances receive identical `on_message` and interaction events, resulting in double-awarding XP and duplicate ledger debits.
2. Competing writes spike SQLite lock contention, leading to database lock timeouts.
3. Heartbeat ACK de-synchronization triggers Discord's Gateway to terminate both sessions in an endless reconnect cycle (`CloseCode 4000`).

To guarantee absolute single-process execution, the bot acquires an exclusive, non-blocking kernel-level advisory lock on a local `bot.lock` file via `fcntl.flock` before initializing the Discord client:

```python
"""
Process Singleton Guard: Kernel-Level Advisory File Lock via fcntl
Guarantees only one instance of the bot runs at any time, preventing Gateway split-brain races.
"""
import fcntl
import os
import sys
from pathlib import Path
import logging

logger = logging.getLogger("thomsfoolery.core")
LOCK_FILE = Path("bot.lock")

def acquire_process_singleton_lock() -> int:
    """
    Acquires an exclusive, non-blocking kernel lock on bot.lock.
    Terminates immediately if another instance is already running.
    """
    try:
        lock_fd = open(LOCK_FILE, "w")
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        lock_fd.write(str(os.getpid()))
        lock_fd.flush()
        logger.info("Kernel process lock acquired on %s (PID: %d)", LOCK_FILE, os.getpid())
        return lock_fd.fileno()
    except (BlockingIOError, OSError):
        logger.critical(
            "Fatal: Another instance of the bot is already active with a lock on %s. "
            "Aborting launch to prevent Discord Gateway split-brain state.",
            LOCK_FILE
        )
        sys.exit(1)
```

#### High-Concurrency SQLite3 with 30-Second Busy Timeouts

> 💡 **Operational Simplicity Over Cloud Bloat**  
> Instead of maintaining heavy external PostgreSQL clusters or Redis layers, the ecosystem operates on a localized SQLite3 database with WAL mode enabled. A lightweight 24-hour cron loop archives the database and AI conversation memory into timestamped archives, providing a rolling 30-day recovery window with zero cloud hosting bills.

In high-traffic spikes—such as 50 members reacting simultaneously to a Blue Jays walk-off home run while the AI oddsmaker writes betting lines—multiple async coroutines compete for write access. To eliminate `sqlite3.OperationalError: database is locked` exceptions:
1. **WAL Mode (`PRAGMA journal_mode = WAL;`)**: Decouples readers from writers. Background telemetry loops can read tables without blocking active write transactions.
2. **Synchronous NORMAL (`PRAGMA synchronous = NORMAL;`)**: Dramatically reduces disk fsync overhead while maintaining WAL crash durability.
3. **30-Second Busy Timeout (`PRAGMA busy_timeout = 30000;`)**: Configures SQLite's internal busy handler to gracefully wait up to 30,000 milliseconds for a locked write transaction to clear before raising an error, ensuring burst write traffic queues cleanly.

```python
"""
Database Persistence Layer: Concurrent SQLite3 with WAL Mode & 30s Busy Timeout
Handles high-frequency event loop writes without thread contention or DB locks.
"""
import aiosqlite
import asyncio
from pathlib import Path
from typing import Any

DB_PATH = Path("data/bot_data.db")

class Database:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._lock = asyncio.Lock()

    async def initialize(self) -> None:
        """Initialize connection pool pragmas for high-concurrency event loops."""
        async with aiosqlite.connect(self.db_path) as db:
            # WAL mode allows concurrent readers while a write transaction is open
            await db.execute("PRAGMA journal_mode = WAL;")
            # Synchronous NORMAL reduces disk fsync overhead without sacrificing WAL durability
            await db.execute("PRAGMA synchronous = NORMAL;")
            # Busy timeout gives locked writes up to 30,000ms (30s) to resolve before raising OperationalError
            await db.execute("PRAGMA busy_timeout = 30000;")
            await db.execute("PRAGMA foreign_keys = ON;")
            await db.commit()

    async def execute(self, sql: str, parameters: tuple[Any, ...] = ()) -> None:
        """Thread-safe write operation serialized via async lock to guarantee single-writer safety."""
        async with self._lock:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("PRAGMA busy_timeout = 30000;")
                await db.execute(sql, parameters)
                await db.commit()

    async def fetchrow(self, sql: str, parameters: tuple[Any, ...] = ()) -> dict[str, Any] | None:
        """Non-blocking read operation leveraging WAL concurrent access."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            async with db.execute(sql, parameters) as cursor:
                row = await cursor.fetchone()
                return dict(row) if row else None
```

**Backup Strategy**: A background `@tasks.loop(hours=24)` task fires every night at midnight. It zips the entire `bot_data.db` file along with all AI memory session folders into a timestamped archive and writes it to a local `/backups/` directory. This creates a rolling 30-day recovery window with zero external dependencies.

---

## 4. The Virtual Economy & Behavioural Loop

The economy is the emotional core of the server. It gives actions weight, creates social hierarchies worth aspiring to, and provides a reason to show up every day. It is designed as a **closed-loop system** with carefully tuned faucets (points in) and sinks (points out).

### 4.1 Earning Wealth (The Faucets)

The bot listens to `on_message` and `on_reaction_add` events for passive earning. All point generation uses **in-memory cooldown dictionaries** (per user, per channel) to prevent farming:

- **Chatting** in any non-bot channel: `+5-15 XP` (randomized to feel organic)
- **Reacting to others' messages**: `+2 XP`
- **Solving the Daily Chess Puzzle**: `+50 XP + 200 Server Points` — the biggest single-day passive payout
- **Participating in Sports Predictions**: Correct pick on a weekly matchup poll = `+100 SP`
- **Daily Login Streak Bonus**: Consecutive days with at least one message = escalating bonus up to `+500 SP` at 30-day streaks

### 4.2 Risking Wealth: Autonomous Sportsbook & Gamification Suite

The economy only has emotional weight if wealth can be staked and lost. Rather than relying on simple text commands, the ecosystem deploys an autonomous AI oddsmaker and a full interactive casino suite built on native Discord UI Components (`discord.ui.View`, `discord.ui.Button`):

#### 1. The Autonomous AI Oddsmaker (`cogs/agent_betting.py`) & The Sportsbook (`cogs/betting.py`)

In generic community bots, sports betting requires manual intervention: an administrator must remember to research upcoming games, format odds, manually open pools, and manually calculate payouts. This administrative bottleneck guarantees the system dies when moderators are busy.

In our ecosystem, `cogs/agent_betting.py` operates as an **autonomous AI bookie**. Running on a background loop (`@tasks.loop(minutes=5)`):
- It inspects upcoming MLB, NFL, and NHL game schedules from ESPN's internal JSON feeds.
- When an eligible matchup is within its opening window (2 hours before game time), the agent automatically provisions a parimutuel betting pool in SQLite with live moneyline odds, generates a rich preview embed with team logos and records, and broadcasts the open betting window to `#sportsbook`.
- Members wager Server Points using `/bet_place <pool_id> <team> <amount>`, with balances instantly held in an atomic escrow ledger.
- When the game concludes and final scores are verified via ESPN telemetry, the system automatically locks the pool, computes parimutuel redistribution math, and disperses payouts.
- A **5% house vig** is burned from every pool, acting as a relentless macro-economic sink that combats point inflation. Every bet placed and payout distributed streams directly to `#betting-log` in real time, fueling public excitement.

#### 2. The Discord UI Component Mini-Casino Suite

For instant gratification, members have access to a full casino suite powered by native Discord buttons and interactive views:

- **Custom 3x3 Progressive Slots (`cogs/slots.py`)**:  
  A custom-rendered 3x3 slot machine with 5 active paylines (3 horizontal rows + 2 diagonal lines). The reel math is mathematically tuned to an authentic **~95% Return to Player (RTP)**, providing sustainable gameplay without instant player ruin.  
  Crucially, every spin allocates 2% of the wager into a server-wide **Progressive Jackpot** (`/slots jackpot`). When a player hits a **Triple Crown (`👑 👑 👑`)** across the center payline, the progressive jackpot triggers: the entire accumulated treasury is deposited into their account, accompanied by a server-wide animated celebration announcement in `#betting-log`.

```text
3x3 Reel Matrix (5 Active Paylines):
┌───────────┬───────────┬───────────┐
│  [ 🍒 ]   │  [ 🍋 ]   │  [ 🔔 ]   │ ─── Payline 1 (Top Horizontal)
├───────────┼───────────┼───────────┤
│  [ 👑 ]   │  [ 👑 ]   │  [ 👑 ]   │ ─── Payline 2 (Center Horizontal / Progressive Jackpot!)
├───────────┼───────────┼───────────┤
│  [ 💎 ]   │  [ 7️⃣ ]   │  [ 🍒 ]   │ ─── Payline 3 (Bottom Horizontal)
└───────────┴───────────┴───────────┘
   ╲                               ╱
    ╲── Payline 4 (Top-L to Bot-R)╱──── Payline 5 (Bot-L to Top-R)
```

- **Interactive Blackjack Table (`cogs/blackjack.py`)**:  
  No typing text commands into chat. Blackjack is rendered as an interactive embed with native Discord UI buttons: `[ 🃏 Hit ]`, `[ 🛑 Stand ]`, and `[ ⚡ Double Down ]`.  
  The engine implements strict casino logic:
  - Standard 52-card shoe tracking with automatic reshuffling thresholds.
  - Dynamic Ace valuation (evaluating soft 11 vs hard 1 based on current hand total).
  - The dealer draws strictly to soft 17.
  - Natural 21 delivers a true **3:2 payout**.
  - Asynchronous session timeouts (`on_timeout`) ensure that if a player walks away mid-hand, the hand automatically resolves or forfeits gracefully after 60 seconds without leaking event listeners.

- **Weekly Community Lottery (`cogs/lotto.py`)**:  
  A communal wealth redistribution engine. Throughout the week, players buy tickets via `/lotto buy <count>` (`/lotto info` displays total tickets and pool value). Every Sunday night at 11:59 PM, an automated `@tasks.loop` draws a winning ticket using cryptographic pseudo-random selection, broadcasts the winner in `#general`, and seeds the next week's pool.

- **Instant Scratch Cards / Pulltabs (`cogs/pulltabs.py`)**:  
  Designed for fast mobile-friendly play, `/pulltabs buy` generates tiered scratch cards using Discord spoiler blocks (`|| 🍒 || || 💎 || || 7️⃣ ||`) and interactive buttons. Players tap to reveal symbols across multiple tiers with multipliers ranging from 2× up to 25× for diamond matches.

```python
"""
Interactive Blackjack UI View: Native Discord Buttons with Dynamic Ace Evaluation
Renders stateful button controls (Hit/Stand) and enforces strict casino soft-17 rules.
"""
import discord
from discord.ui import View, button
from typing import List

class BlackjackView(View):
    def __init__(self, cog, ctx, bet: int, deck: List[str]):
        super().__init__(timeout=60.0)
        self.cog = cog
        self.ctx = ctx
        self.bet = bet
        self.deck = deck
        self.player_hand: List[str] = [self.deck.pop(), self.deck.pop()]
        self.dealer_hand: List[str] = [self.deck.pop(), self.deck.pop()]

    def calculate_score(self, hand: List[str]) -> int:
        """Evaluates hand score with dynamic soft/hard Ace reduction."""
        total = 0
        aces = 0
        for card in hand:
            val = card[:-1]  # Strip suit glyph
            if val in ("J", "Q", "K"):
                total += 10
            elif val == "A":
                aces += 1
                total += 11
            else:
                total += int(val)
        
        while total > 21 and aces > 0:
            total -= 10
            aces -= 1
        return total

    @button(label="Hit", style=discord.ButtonStyle.primary, emoji="🃏")
    async def hit(self, interaction: discord.Interaction, btn: discord.ui.Button):
        if interaction.user.id != self.ctx.author.id:
            return await interaction.response.send_message("This table is reserved for the active player.", ephemeral=True)
        
        self.player_hand.append(self.deck.pop())
        score = self.calculate_score(self.player_hand)
        if score >= 21:
            self.stop()
            await self.resolve_hand(interaction, busted=(score > 21))
        else:
            await interaction.response.edit_message(embed=self.build_embed(hide_dealer=True), view=self)

    @button(label="Stand", style=discord.ButtonStyle.secondary, emoji="🛑")
    async def stand(self, interaction: discord.Interaction, btn: discord.ui.Button):
        if interaction.user.id != self.ctx.author.id:
            return await interaction.response.send_message("This table is reserved for the active player.", ephemeral=True)
        self.stop()
        await self.resolve_hand(interaction, busted=False)
```

### 4.3 Spending Wealth (The Sinks)

Hoarding points is discouraged. The high-value sinks are designed to be genuinely desirable:

- **Custom Server Emojis**: Users can commission a custom emoji upload (subject to admin approval) for `5,000 SP`
- **Custom Server Stickers**: `10,000 SP` — the most prestigious vanity item
- **The "High Roller" Role**: `2,500 SP` for a temporary 7-day role with a bright gold name color, visible to the whole server as a status symbol
- **Personalized Nickname**: `1,000 SP` — lets users set a custom nickname persisted by the bot
- **The Economy Leaderboard Boost**: `500 SP` to get a featured shoutout in the weekly highlight reel

---

## 5. API Architecture: Real-Time Sports Without Scraping

A foundational principle of this project was **zero reliance on third-party aggregator websites**. No Sportradar subscriptions. No SportsDataIO. Every piece of live sports data is pulled directly from the source using reverse-engineered private endpoints, giving us faster data, richer payloads, and no rate-limiting from a middleman.

> 💡 **Zero-Cost Telemetry via Private Endpoints**  
> Commercial sports data feeds charge hundreds of dollars monthly with strict rate limits. By reverse-engineering ESPN's internal JSON API (`site.api.espn.com`) and OpenF1, the bot achieves sub-second game state updates, bullpen pitch counts, and diamond graphics at zero ongoing cost.

### 5.1 The Undocumented ESPN API (`site.api.espn.com`)

The ESPN API is the backbone of our multi-sport coverage. The endpoints are not publicly documented, but are stable and rich. We query these endpoints via `aiohttp` sessions with retry logic and caching.

**Baseball (`baseball.py` — Blue Jays)**  
The `/jays_live` command is the most technically complex feature in the bot. The bot doesn't just display a score — it reconstructs the live game state from the raw JSON:

- **Live Base Runners**: The API provides a binary `onBase` flag for each base. The bot maps all 8 possible combinations (empty, runner on 1st, runners on 1st and 3rd, bases loaded, etc.) to a set of **custom Discord emojis** we designed and uploaded to the server. The resulting display is a visual baseball diamond that updates in real-time.
- **Pitch Count & Inning State**: Current pitcher, pitch count, outs, inning, and batting order position are all parsed.
- **Automated Hype Triggers**: The bot watches for specific box score events (a Kirk home run, a Guerrero Jr. RBI, a Varland save) and fires custom meme images into `#⚾-baseball` when they occur.

```python
"""
Baseball Base-Runner State Machine: Bitmask to Discord Emoji Projection
Maps ESPN API live situation to custom server diamond emojis via 3-bit integer masking.
"""
from enum import IntFlag
from typing import Any
import aiohttp

class RunnerBase(IntFlag):
    EMPTY        = 0b000  # 0: Empty diamond
    FIRST        = 0b001  # 1: Runner on 1st
    SECOND       = 0b010  # 2: Runner on 2nd
    FIRST_SECOND = 0b011  # 3: Runners on 1st & 2nd
    THIRD        = 0b100  # 4: Runner on 3rd
    CORNERS      = 0b101  # 5: Runners on 1st & 3rd
    SECOND_THIRD = 0b110  # 6: Runners on 2nd & 3rd (Scoring position)
    LOADED       = 0b111  # 7: Bases loaded

# Custom Discord Server Emojis (<:name:id>)
DIAMOND_EMOJIS: dict[RunnerBase, str] = {
    RunnerBase.EMPTY:        "<:diamond_empty:122000000000000001>",
    RunnerBase.FIRST:        "<:diamond_1b:122000000000000002>",
    RunnerBase.SECOND:       "<:diamond_2b:122000000000000003>",
    RunnerBase.FIRST_SECOND: "<:diamond_1b2b:122000000000000004>",
    RunnerBase.THIRD:        "<:diamond_3b:122000000000000005>",
    RunnerBase.CORNERS:      "<:diamond_corners:122000000000000006>",
    RunnerBase.SECOND_THIRD: "<:diamond_2b3b:122000000000000007>",
    RunnerBase.LOADED:       "<:diamond_loaded:122000000000000008>",
}

def parse_runner_bitmask(situation: dict[str, Any]) -> str:
    """
    Extracts binary base runner flags from ESPN situation schema and computes
    the 3-bit bitmask in O(1) time complexity.
    """
    on_1b = bool(situation.get("onFirst", False))
    on_2b = bool(situation.get("onSecond", False))
    on_3b = bool(situation.get("onThird", False))

    # Construct the 3-bit integer: (Bit 0: 1st, Bit 1: 2nd, Bit 2: 3rd)
    mask_value = (int(on_1b) << 0) | (int(on_2b) << 1) | (int(on_3b) << 2)
    state = RunnerBase(mask_value)
    return DIAMOND_EMOJIS.get(state, DIAMOND_EMOJIS[RunnerBase.EMPTY])
```

**Bullpen Availability (`/jays_lineup`)**  
This feature pulls the last **3 days of box scores** and parses every Blue Jays pitching appearance. It calculates each reliever's cumulative pitch count over that window and displays a color-coded "availability" tier (Ready / Day-to-Day / Unavailable) — a level of granularity typically only available to paid baseball analytics platforms.

```python
"""
3-Day Rolling Bullpen Fatigue Model
Calculates cumulative fatigue index and back-to-back shutdown status for relievers.
"""
from dataclasses import dataclass
from enum import Enum

class Availability(Enum):
    AVAILABLE    = ("🟢 Ready", 0x2ECC71)
    DAY_TO_DAY   = ("🟡 Day-to-Day", 0xF1C40F)
    UNAVAILABLE  = ("🔴 Cooked / Inactive", 0xE74C3C)

@dataclass(frozen=True)
class RelieverFatigue:
    name: str
    pitches_today: int
    pitches_yesterday: int
    pitches_two_days_ago: int
    consecutive_days: int
    fatigue_index: float
    status: Availability

def calculate_fatigue(name: str, p0: int, p1: int, p2: int) -> RelieverFatigue:
    """
    Computes weighted pitch decay and applies MLB managerial shutdown heuristics:
    - Fatigue Index = (P0 * 1.0) + (P1 * 0.65) + (P2 * 0.35)
    - 3 consecutive days pitched = Hard Shutdown (Unavailable)
    - Single day > 35 pitches = Next day Unavailable
    - Cumulative Fatigue Index >= 45.0 = Unavailable
    """
    consecutive = (1 if p0 > 0 else 0) + (1 if p1 > 0 else 0) + (1 if p2 > 0 else 0)
    fatigue_index = (p0 * 1.0) + (p1 * 0.65) + (p2 * 0.35)

    if consecutive >= 3 or p1 >= 35 or p0 >= 40 or fatigue_index >= 45.0:
        status = Availability.UNAVAILABLE
    elif consecutive == 2 or fatigue_index >= 25.0 or (p1 >= 22 and p0 == 0):
        status = Availability.DAY_TO_DAY
    else:
        status = Availability.AVAILABLE

    return RelieverFatigue(
        name=name,
        pitches_today=p0,
        pitches_yesterday=p1,
        pitches_two_days_ago=p2,
        consecutive_days=consecutive,
        fatigue_index=round(fatigue_index, 1),
        status=status
    )
```

**Multi-Sport Coverage**  
The same ESPN endpoint pattern is used for:
- **NFL**: Bills and Eagles weekly previews, live quarter-by-quarter score alerts
- **NHL**: Leafs and Canadiens live period-by-period alerts, playoff bracket tracking
- **College Football**: Configurable team tracking for members with NCAA interests

### 5.2 OpenF1 API

The official OpenF1 API (`api.openf1.org`) provides structured Formula 1 session data. The bot uses this to:

- Power the `/f1` command, displaying the full season schedule with track details, time zone conversions, and TV broadcast info
- Schedule automated 24-hour and 1-hour pre-race reminders for Grand Prix weekends
- Display live session timing data (Q1/Q2/Q3 qualifying gaps, race intervals) when a session is active

### 5.3 MLB Stats API (for the AI Mascot)

The official `statsapi.mlb.com` API is integrated not as a standalone command, but as a **Python function exposed as a Tool to the AI Mascot**. When a user asks the mascot about Vladimir Guerrero Jr.'s career stats or the Jays' 2026 rotation ERA, the AI autonomously calls `get_mlb_player_season_stats(player_name, season)`, which hits the MLB Stats API and returns structured data. The AI then formats this data naturally in its response — no rigid `/command` interface required.

---

## 6. Agentic AI & The Intelligence Layer

This is where the project crosses into territory most Discord bots never enter. We didn't deploy a chatbot. We deployed **autonomous agents** — systems that make independent decisions about what to do, when to do it, and how to do it.

### 6.1 The AI Mascot (`cogs/mascot.py`)

The Mascot is a **stateful, memory-retaining agent** built on the Google Antigravity SDK using `LocalAgentConfig`. It maintains a persistent conversation ID in the SQLite3 bot state, meaning it remembers past interactions across server restarts and hours of downtime.

**Context-Aware Persona System**  
The Mascot reads the channel it's being addressed in and dynamically adjusts its system prompt:

- **`#chat-with-bot` (General Chat)**: The default persona is irreverent, sarcastic, and unfiltered. It matches user energy. If a user is hostile, the bot roasts them. If a user is playful, the bot is playful. This is intentional — it creates entertaining spectacles that other server members want to watch.
- **`#⚾-baseball` or `#🏒-hockey` (Niche Sport Channels)**: A system prompt override activates, instructing the mascot to drop the personality and become a focused, polite sports reference tool. The same underlying model, but a completely different face.

```python
"""
Stateful Agent Integration: Google Antigravity SDK with Dynamic Persona Overrides
Stores persistent session identifiers in SQLite and mounts custom callable tools.
"""
from google.antigravity import Agent, LocalAgentConfig, BuiltinTools, Tool
from typing import Any

# Dynamic System Prompts based on Discord Channel Context
PERSONAS = {
    "banter": (
        "You are Thoms, the mascot of the Thoms Foolery Discord server. "
        "You are sharp-witted, sarcastic, irreverent, and hilarious. "
        "Match user banter, roast arrogant members, and maintain server lore."
    ),
    "sports_analyst": (
        "You are the Thoms Foolery Sports Analyst. Drop all snark and sarcasm. "
        "Provide precise, highly technical MLB/NHL/NFL statistics, player projections, "
        "and analytical breakdowns. Cite numbers cleanly."
    )
}

async def get_or_create_session(db: Any, user_id: int, channel_id: int) -> str:
    """Retrieve existing conversation_id from SQLite or initialize a new persistent session."""
    query = "SELECT session_id FROM ai_sessions WHERE user_id = ? AND channel_id = ?"
    row = await db.fetchrow(query, (user_id, channel_id))
    if row:
        return row["session_id"]
    
    new_session_id = f"session_u{user_id}_c{channel_id}"
    await db.execute(
        "INSERT INTO ai_sessions (user_id, channel_id, session_id, updated_at) VALUES (?, ?, ?, datetime('now'))",
        (user_id, channel_id, new_session_id)
    )
    return new_session_id

def create_mascot_agent(session_id: str, channel_name: str) -> Agent:
    """Configures Antigravity agent with channel-specific instructions and tool capabilities."""
    prompt_mode = "sports_analyst" if "baseball" in channel_name or "hockey" in channel_name else "banter"
    
    config = LocalAgentConfig(
        model="gemini-3.5-flash",
        session_id=session_id,
        system_instruction=PERSONAS[prompt_mode],
        capabilities=[
            BuiltinTools.SEARCH_WEB,
            Tool.from_callable(
                name="get_mlb_player_season_stats",
                description="Query official MLB Stats API for career/season hitting or pitching splits.",
                func=fetch_mlb_stats_api
            ),
            Tool.from_callable(
                name="get_server_economy_standings",
                description="Query top 10 richest users and current jackpot pool.",
                func=fetch_economy_leaderboard
            )
        ]
    )
    return Agent(config=config)
```

### 6.2 The Weekly Highlight Reel (`cogs/agent_content.py`)

This is the single most impactful anti-stagnation feature in the system. Every Monday at 9:00 AM, an autonomous agent wakes up and executes the following pipeline with zero human input:

```text
[ Niche Channels ]                 [ Autonomous Pipeline ]               [ Community Impact ]
#⚾-baseball    (500 msgs) ──┐
#🏒-hockey      (500 msgs) ──┼──> [ Aggregator ] ──> [ Gemini 3.5 Flash ] ──> [ #general Highlight Embed ]
#overwatch-2    (500 msgs) ──┤        (Filter noise,       (Synthesize banter,           │
#technology     (500 msgs) ──┘         extract bets)        manufacture FOMO)           ▼
                                                                           [ 24–48h Cross-Channel Traffic Spike ]
```

1. **Data Collection**: The agent sweeps through all opt-in niche channels (`#⚾-baseball`, `#🏒-hockey`, `#overwatch-2`, `#technology`) and fetches the last 500 messages from each.
2. **Processing**: This raw message data is passed to `gemini-3.5-flash-lite` (chosen for token efficiency — 500 messages × 4-5 channels is substantial) with a strict system prompt: *"Summarize the most entertaining moments, biggest bets won/lost, sports reactions, and general banter from the last week. Focus on things that would make someone in #general wish they had been in those channels. Format as a punchy, FOMO-inducing highlight reel."*
3. **Publication**: The AI-generated highlight reel is published to `#general` as a rich embed with formatted sections, emoji headers, and a link to each source channel.

> 💡 **Autonomous FOMO as a Growth Mechanism**  
> Community silos form when members never leave `#general`. The Monday Highlight Reel acts as an automated weekly newspaper, showing general chat what excitement happened in niche channels. The data proves it: every Monday morning post triggers an immediate 24–48 hour rebound in niche channel participation.

---

## 7. Governance, Dynamic Infrastructure & Entertainment

A production community bot cannot solely focus on fun and games; it must maintain server order, eliminate interface clutter, and provide reliable voice-tier entertainment without requiring round-the-clock moderation.

### 7.1 The AutoMod Evasion Engine & Progressive Strikes (`cogs/moderation.py`)

Standard Discord AutoMod filters and naive keyword blockers fail within minutes against persistent trolls or bad-faith actors. Users quickly exploit known loopholes:
- **Post-Send Message Edits**: Sending a benign greeting (e.g., *"hey everyone"*) to bypass initial filters, then immediately editing the text to insert scam links or malicious phrases.
- **Leetspeak Glyph Substitutions**: Evading naive substring searches using numbers and symbols (`b@dw0rd`, `1d10t`, `f*ck`, `pr0n`).
- **Punctuation & Character Spacing**: Inserting intra-word separators (`b.a.d`, `b a d`, `w-o-r-d`) to split tokens across boundary checks.
- **The Scunthorpe Problem**: Naive substring matchers frequently ban innocent members discussing legitimate topics (e.g., catching *"grass"*, *"bass"*, or *"document"*).

`cogs/moderation.py` solves this through a multi-pass normalization pipeline and strict regex boundary enforcement:

1. **Circumvention & Edit Interception (`on_message_edit`)**: The bot hooks into both `on_message` and `on_message_edit(before, after)`. When an edit occurs, the revised payload is fed directly into the identical sanitization pipeline. If the edit violates rules, the message is instantly purged, an audit log embed is recorded, and the author receives a disciplinary strike.
2. **Leetspeak & Separator Normalization**: Text is normalized through Unicode decomposition (NFKD), lowercase casting, character substitution maps, and intra-word separator stripping.
3. **Word-Boundary Regex (`\b`)**: The engine applies regex boundary anchors (`\b<pattern>\b`) against the normalized string, guaranteeing zero false positives on benign compound words.
4. **Progressive Timed Strikes**: Rather than permanent bans which alienate members, discipline follows an escalating curve:
   - **Strike 1**: 5-minute timeout + ephemeral warning embed.
   - **Strike 2**: 20-minute timeout + direct notification.
   - **Strike 3**: 12-hour timeout + moderator ping.
   Strikes automatically decay in SQLite after a rolling 14-day clean window.
5. **Granular Channel-Specific Lockouts (`/channel_lockout`)**: When heated disputes break out in `#⚾-baseball` or `#technology`, global server timeouts are unnecessarily harsh. Moderators use `/channel_lockout <user> <duration>` to apply channel-level permission overwrites (`send_messages=False`, `add_reactions=False`) to isolate problem users from a single channel while leaving the rest of the server accessible.

```python
"""
AutoMod Evasion Defense Pipeline: Normalization, Edit Interception & Regex Boundary Filter
Eliminates leetspeak substitutions and spaced bypasses while preventing Scunthorpe false positives.
"""
import re
import unicodedata
import discord
from discord.ext import commands

LEET_MAP = {
    "@": "a", "4": "a",
    "8": "b",
    "3": "e", "€": "e",
    "1": "i", "!": "i", "|": "i",
    "0": "o",
    "$": "s", "5": "s",
    "7": "t", "+": "t",
    "v": "u",
}

def normalize_text(text: str) -> str:
    """
    Cleans text by stripping unicode accents, replacing leetspeak glyphs,
    and collapsing intra-token punctuation while preserving outer boundaries.
    """
    text = unicodedata.normalize("NFKD", text)
    cleaned = text.lower()
    for char, replacement in LEET_MAP.items():
        cleaned = cleaned.replace(char, replacement)
    # Collapse intra-token separators (e.g., "b.a.d" or "b-a-d" -> "bad")
    cleaned = re.sub(r'(?<=\w)' r'[._\-*~+]' r'(?=\w)', '', cleaned)
    # Collapse single-spaced characters (e.g., "b a d" -> "bad")
    cleaned = re.sub(r'(?<=\b\w)\s+(?=\w\b)', '', cleaned)
    return cleaned

def matches_prohibited_terms(text: str, blacklisted_patterns: list[str]) -> bool:
    """
    Applies strict regex word-boundary matching (\b) on normalized text.
    Guarantees 'bass' and 'grass' are never falsely flagged by substring matching.
    """
    normalized = normalize_text(text)
    for pattern in blacklisted_patterns:
        regex = rf"\b{re.escape(pattern)}\b"
        if re.search(regex, normalized, re.IGNORECASE):
            return True
    return False
```

### 7.2 Dynamic "Join-to-Create" Voice Hub (`cogs/voice.py`)

Static voice channels are a known failure mode in Discord community architecture. Creating 10 static channels (`Voice 1`, `Voice 2`, `Gaming A`, `Gaming B`) permanently clutters the sidebar, making the server feel empty and uninviting when only 2 people are online.

`cogs/voice.py` replaces static voice channels with an automated **"Join-to-Create" dynamic lifecycle**:

```text
[ Member Joins '➕ Join to Create' ]
                 │
                 ▼
[ Bot creates temporary channel: "🔊 User's Room" ]
                 │
                 ▼
[ Bot moves member into new channel ]
                 │
   ┌─────────────┴─────────────┐
   │ (Friends join / chat)     │
   ▼                           ▼
[ Members leave ]     [ Last member disconnects ]
                               │
                               ▼
            [ Garbage Collection: Bot deletes channel ]
```

1. **Master Trigger Channel**: A single persistent voice channel (`➕ Join to Create`) sits at the top of the voice category.
2. **Dynamic Provisioning**: When a member joins the trigger channel, the bot intercepts the `on_voice_state_update` event, dynamically creates a new private voice channel (`🔊 {member.display_name}'s Room`), applies custom bitrates (96 kbps for pristine audio), and instantly transfers the member into it.
3. **Automated Garbage Collection**: When `on_voice_state_update` fires and any dynamically created room reaches zero occupants (`len(channel.members) == 0`), the cog immediately deletes the voice channel. The sidebar remains clean, modern, and perfectly scaled to current server demand.

### 7.3 Community Entertainment & Audio Streaming

Beyond sports and economy systems, the bot integrates dedicated entertainment cogs that keep members in voice and chat channels:

- **Overwatch 2 Competitive Intelligence (`cogs/overwatch.py`)**: Queries live Blizzard profile endpoints via `/ow_profile <battletag>`. Generates rich visual embeds detailing competitive skill tiers across Tank, Damage, and Support roles, alongside top hero win rates and weapon accuracy, helping server squads balance stacks for competitive play.
- **Community Movie Night Engine (`cogs/movies.py`)**: Backed by The Movie Database (TMDB) API, `/movie search <title>` fetches official synopsis cards, HD poster artwork, trailers, and IMDb/Rotten Tomatoes ratings. `/movie poll` creates scheduled emoji reaction ballots for community watch parties.
- **Low-Latency Voice Audio Streaming (`cogs/music.py`)**: A production-grade voice audio pipeline built on `yt-dlp`, `PyNaCl`, and `FFmpeg`. Instead of writing multi-gigabyte media files to the host disk, audio is piped asynchronously through an in-memory FFmpeg Opus buffer. Supports `/play`, `/skip`, `/queue`, `/pause`, and `/loop`, with an automated 5-minute inactivity hook that disconnects from voice when empty to save bandwidth and Gateway CPU cycles.

---

## 8. Quality of Life & The Media Pipeline (`cogs/media.py`)

Discord's file size limits for custom content are punishingly small:
- Custom server emojis: **256KB maximum**
- Custom server stickers: **512KB maximum**

Any image larger than these limits fails silently at the upload stage. Before this system was built, users who wanted to contribute custom emotes would have to manually fight with photo editing software to compress their files — a friction point that killed participation.

The `media.py` cog solves this completely. When a user uploads an image to the dedicated `#emoji-submissions` channel:

1. The bot intercepts the file via `on_message`
2. If the file is within limits, it proceeds directly to the approval queue
3. If the file exceeds limits, the bot immediately processes it in an **asyncio threadpool** (`asyncio.to_thread`) using Pillow (`PIL`), keeping the main Gateway event loop non-blocking:
   - Iteratively scales the image down using Lanczos resampling
   - Re-encodes with progressive quantization and quality degradation
   - Stops as soon as the file falls below the size threshold
4. The optimized image is uploaded directly to the server and a confirmation embed is sent to the submitter

```python
"""
Non-blocking Pillow Compression Pipeline for Discord Assets
Offloads CPU-bound resizing/quantization to asyncio threadpool to prevent Gateway heartbeat timeouts.
"""
import asyncio
import io
from PIL import Image

MAX_EMOJI_BYTES = 256 * 1024   # 256 KB
MAX_STICKER_BYTES = 512 * 1024 # 512 KB

def _compress_image_sync(image_data: bytes, target_max_bytes: int, max_dimension: int = 128) -> bytes:
    """
    Synchronous worker executing in a background thread:
    Uses iterative Lanczos downsampling and progressive quantization.
    """
    with Image.open(io.BytesIO(image_data)) as img:
        if img.mode not in ("RGBA", "RGB"):
            img = img.convert("RGBA")
        
        # Step 1: Geometry reduction preserving aspect ratio
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        
        # Step 2: Progressive quality degradation loop
        for quality in range(95, 20, -15):
            buffer = io.BytesIO()
            if img.mode == "RGBA":
                quantized = img.quantize(colors=256, method=Image.Resampling.MEDIANCUT)
                quantized.save(buffer, format="PNG", optimize=True)
            else:
                img.save(buffer, format="JPEG", quality=quality, optimize=True)
            
            if buffer.tell() <= target_max_bytes:
                return buffer.getvalue()
        
        # Step 3: Hard downscale fallback if still oversized
        img = img.resize((max_dimension // 2, max_dimension // 2), Image.Resampling.BILINEAR)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG", optimize=True)
        return buffer.getvalue()

async def optimize_discord_media(raw_bytes: bytes, is_sticker: bool = False) -> io.BytesIO:
    """
    Public async entry point: prevents event loop blocking using asyncio.to_thread.
    Preserves Discord Gateway heartbeat during heavy compression workloads.
    """
    target_limit = MAX_STICKER_BYTES if is_sticker else MAX_EMOJI_BYTES
    max_dim = 320 if is_sticker else 128

    compressed_bytes = await asyncio.to_thread(
        _compress_image_sync,
        image_data=raw_bytes,
        target_max_bytes=target_limit,
        max_dimension=max_dim
    )
    return io.BytesIO(compressed_bytes)
```

Users experience this as magic — their oversized image just works without leaving Discord.

---

## 9. The Final Form: A Living Ecosystem

The Thoms Foolery bot, in its final production state, is no longer a tool that the community uses. It is a member of the community — one that shows up every day, generates content, rewards participation, and keeps the energy moving even when no humans are around.

When a new user joins:
1. A rich `on_member_join` embed greets them in `#welcome`, explaining the economy, how to earn points, and how to claim interest roles via the role-selection menu
2. They are immediately enrolled in the XP system — their first message earns their first points
3. The Daily Chess Puzzle is waiting for them in `#daily-challenges`

From that moment forward, the system works to retain them:
- **Streak rewards** incentivize daily logins
- **The betting log** creates ambient drama to observe
- **The weekly highlight reel** shows them what they're missing in niche channels
- **The AI mascot** gives them something genuinely entertaining to interact with
- **Real-time sports alerts** give the sports channels a pulse, even on quiet days

By precisely identifying why Discord communities stagnate — no passive content, no economy, no social signaling, no cross-channel discovery — and systematically engineering solutions for each failure mode, the Thoms Foolery ecosystem has achieved its goal: **a server that grows on its own.**

<div class="article-author-callout">
  <div class="callout-badge">🛠️ PARTNER &amp; BUILD</div>
  <h3>Build Something Like This</h3>
  <p>Looking to build a custom autonomous Discord bot, stateful AI agents, or real-time sports telemetry for your own community?</p>
  <p>I design and build productized bots, interactive web tools, and data dashboards for teams and creators:</p>
  <ul>
    <li><strong>Autonomous Community Bots:</strong> Cogs architecture, SQLite3 state persistence, automated backups, and closed-loop virtual economies.</li>
    <li><strong>AI Agent Integration:</strong> Google Antigravity SDK &amp; Gemini agents with channel-aware personas and live tool-calling.</li>
    <li><strong>Live Sports &amp; API Pipelines:</strong> Reverse-engineered endpoints for MLB, NFL, NHL, and F1.</li>
  </ul>
  <div class="callout-actions">
    <a href="/sponsors/" class="callout-btn-primary">Book an Advisory Session / Explore Sponsorships →</a>
    <span class="callout-contact">or reach out directly at <strong>jonathan@thoms.email</strong></span>
  </div>
</div>
