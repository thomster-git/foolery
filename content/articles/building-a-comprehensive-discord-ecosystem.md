---
stage: "teaser"
id: building-a-comprehensive-discord-ecosystem
title: "Building a Self-Sustaining Discord Community with Python, SQLite & Live Sports Feeds"
type: article
status: published
author: Jonathan Thoms
created: 2026-10-19
updated: 2026-11-20
access: public
summary: How I turned a quiet Discord server into an active community hub using 23 hot-reloadable Python cogs, SQLite WAL persistence, live ESPN and OpenF1 feeds, a parimutuel sportsbook, and channel-aware AI agents—with collapsible technical deep-dives for every module.
topics:
  - technology
themes:
  - community
  - craftsmanship
  - creativity
  - systems-thinking
tags:
  - discord-bot
  - python
  - ai-agents
  - antigravity-sdk
  - automation
  - system-architecture
  - community-engineering
  - sports-analytics
related:
  - discord-vs-corporate-comms
  - manifesto
  - sensible-infrastructure-and-white-box-servers
  - project-atlas
  - discord
---

Most private Discord servers follow the exact same arc: an enthusiastic launch, two weeks of busy conversation, and then a slow slide into silence.

When I first set up our server, we had channels for everything—baseball, hockey, Formula 1, tech, gaming—and yet the same five people talked in `#general` while every topical channel sat empty. Adding more channels didn't fix it. The problem was that most Discord bots sit completely silent until someone remembers to type a `/command`. If nobody types, nothing happens.

I wanted to see what would happen if we inverted that rule: **the bot talks first.**

Instead of waiting for commands, the server runs on scheduled background loops that push live Blue Jays base-runner states, three-day bullpen fatigue tables, automated parimutuel betting windows before kickoff, daily chess puzzles, and a Monday morning newspaper that summarizes the best banter from the niche channels. Below is the story of how it works in practice—with collapsible technical and code dropdowns if you want to inspect the Python and SQLite internals.

<div class="photo-slot">
[Photo slot: /images/articles/discord-bot-sportsbook-desk.jpg — Over-the-shoulder shot of a live Blue Jays game on the main screen with the Discord sportsbook and base-runner diamond embed updating on the second monitor]
</div>

---

## Decoupled Cogs & Surviving Two Real Bugs

The bot runs on **Python 3.14** and `discord.py` around a single `asyncio` event loop. Because Discord's Gateway drops your connection if you miss a ~41-second heartbeat (`CloseCode 4000`), no slow HTTP fetch, image resize, or AI call can ever block the main thread.

To keep one broken sport API from taking down the whole server, I split the bot into **23 independent cog modules**. Each cog owns its own slash commands, event listeners, and background polling loops, and any single module can be hot-reloaded in production (`/admin reload baseball`) while a blackjack hand is being played in another channel.

<details class="code-rollup">
<summary><strong>View Full 23-Cog Module Directory &amp; Domain Architecture</strong></summary>
<div class="rollup-body">

| Domain | Cog File | What It Does | Libraries / Feeds |
|---|---|---|---|
| **Economy & Casino** | `cogs/economy.py` | Wallets, daily streaks, peer transfers, leaderboards | `SQLite3` |
| | `cogs/slots.py` | 3×3 slot reels, 5 paylines, ~95% RTP, progressive jackpot | `random`, `discord.ui` |
| | `cogs/blackjack.py` | Button-driven table, soft-17 dealer logic, 3:2 naturals | `discord.ui.View` |
| | `cogs/lotto.py` | Weekly community lottery drawing every Sunday at 11:59 PM | `@tasks.loop` |
| | `cogs/pulltabs.py` | Spoiler-block scratch tickets with 2×–25× tiers | `discord.ui` |
| **Sports & Betting** | `cogs/betting.py` | Wager placement, custom meta-bets, `/roulette`, escrow ledger | `SQLite3` |
| | `cogs/agent_betting.py` | Autonomous bookie: opens pools 2h before MLB/NFL/NHL games | ESPN JSON, `@tasks.loop` |
| | `cogs/baseball.py` | Live MLB diamond bitmask emojis, 3-day bullpen fatigue | ESPN JSON, `asyncio` |
| | `cogs/football.py` | NFL live tracking, red-zone and turnover alerts | ESPN JSON |
| | `cogs/hockey.py` | NHL period scores, goal alerts, power-play indicators | ESPN JSON |
| | `cogs/motorsport.py` | Formula 1 calendar, pre-race alerts, qualifying gaps | OpenF1 API |
| **AI & Digests** | `cogs/mascot.py` | Channel-aware persona engine with MLB Stats API tool-calling | Google Antigravity SDK |
| | `cogs/agent_content.py` | Monday 9:00 AM highlight reel summarizing niche channels | Gemini 3.5 Flash-Lite |
| **Moderation** | `cogs/moderation.py` | Edit-interception AutoMod, leetspeak normalization, channel lockouts | `re`, `unicodedata` |
| | `cogs/roles.py` | Self-assignable role menus | `discord.ui.Select` |
| **Infrastructure** | `cogs/voice.py` | Dynamic "Join to Create" voice rooms with auto-cleanup | `discord.VoiceChannel` |
| | `cogs/media.py` | Threadpool Pillow downsampling for <256 KB emojis & <512 KB stickers | `Pillow`, `asyncio.to_thread` |
| | `cogs/utility.py` | Latency, uptime, and runtime cog hot-reloading | `discord.ext.commands` |
| **Community** | `cogs/chess.py` | Daily chess puzzle broadcasts and FEN parser | `python-chess` |
| | `cogs/poll.py` | Timed button and reaction ballots | `discord.ui` |
| | `cogs/overwatch.py` | Overwatch 2 role tiers and hero win rates | Blizzard API |
| | `cogs/movies.py` | Movie night search, posters, trailers, and watch ballots | TMDB API |
| | `cogs/music.py` | In-memory FFmpeg Opus voice streaming with 5-min idle disconnect | `yt-dlp`, `PyNaCl`, `FFmpeg` |

</div>
</details>

<details class="code-rollup">
<summary><strong>View Code: Graceful Cog Lifecycle &amp; Non-Blocking Poll Loop (cogs/baseball.py)</strong></summary>

```python
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
        self.live_poll_loop.start()

    async def cog_unload(self) -> None:
        if self.live_poll_loop.is_running():
            self.live_poll_loop.cancel()

    @tasks.loop(seconds=30.0)
    async def live_poll_loop(self) -> None:
        try:
            await self._check_live_game()
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            logger.error("Unhandled error in live_poll_loop: %s", exc, exc_info=True)

    @live_poll_loop.before_loop
    async def before_live_poll(self) -> None:
        await self.bot.wait_until_ready()

async def setup(bot: commands.Bot) -> None:
    await bot.add_cog(BaseballCog(bot, bot.session, bot.db))
```

</details>

Two early production headaches shaped how state and process management work today:

1. **The Split-Brain Duplicate Daemon Bug:** One afternoon a process supervisor restart overlapped with an existing bot process, resulting in two instances connected to Discord with the same token at the same time. Every message awarded double XP, every bet debited twice, and SQLite started throwing lock errors. I fixed it permanently by acquiring a non-blocking kernel advisory lock on `bot.lock` via `fcntl.flock` before the Discord client ever initializes.
2. **Walk-Off Home Run Write Spikes:** I didn't want to babysit a separate PostgreSQL or Redis container for a single-server community bot, so all state lives in a local SQLite database (`bot_data.db`) backed up nightly into a 30-day rolling archive. Early on, when 40+ people reacted at once to a Blue Jays walk-off while the betting cog was settling payouts, standard SQLite threw `database is locked`. Enabling **Write-Ahead Logging (`PRAGMA journal_mode = WAL`)** alongside a 30-second busy timeout (`PRAGMA busy_timeout = 30000`) and an async writer lock eliminated lock errors completely.

<details class="code-rollup">
<summary><strong>View Code: Kernel Process Lock (core.py) &amp; WAL SQLite Engine (db.py)</strong></summary>

```python
import fcntl
import os
import sys
from pathlib import Path
import aiosqlite
import asyncio
from typing import Any

LOCK_FILE = Path("bot.lock")
DB_PATH = Path("data/bot_data.db")

def acquire_process_singleton_lock() -> int:
    """Acquires an exclusive kernel lock on bot.lock; exits if another process holds it."""
    try:
        lock_fd = open(LOCK_FILE, "w")
        fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        lock_fd.write(str(os.getpid()))
        lock_fd.flush()
        return lock_fd.fileno()
    except (BlockingIOError, OSError):
        sys.exit(1)

class Database:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._lock = asyncio.Lock()

    async def initialize(self) -> None:
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA journal_mode = WAL;")
            await db.execute("PRAGMA synchronous = NORMAL;")
            await db.execute("PRAGMA busy_timeout = 30000;")
            await db.execute("PRAGMA foreign_keys = ON;")
            await db.commit()

    async def execute(self, sql: str, parameters: tuple[Any, ...] = ()) -> None:
        async with self._lock:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute("PRAGMA busy_timeout = 30000;")
                await db.execute(sql, parameters)
                await db.commit()
```

</details>

---

## The Autonomous Bookie & Parimutuel Economy

A virtual currency only matters if there is something fun to risk it on and a real sink to keep inflation under control. Members earn points passively through chatting (with in-memory cooldowns so nobody can spam-farm), daily login streaks, and solving the morning chess puzzle.

In most servers, a sportsbook dies after two weeks because a human moderator has to manually create pools, enter odds, and settle payouts after work. To remove ourselves from the loop, `cogs/agent_betting.py` runs every five minutes against ESPN's schedule JSON:
* Two hours before an MLB, NHL, or NFL matchup starts, the bot opens a parimutuel betting pool in `#sportsbook` with team logos and current records.
* Members place wagers via `/bet_place`, and the bot also lets us spin up custom inside-joke prop markets (*"Will Joey answer Ryan today?"*).
* When the final whistle blows, the bot locks the pool, burns a **5% house vig** to keep the server economy deflationary, distributes winnings proportionally, and posts every win and wipeout to a public `#betting-log` feed.
* Points can be redeemed for permanent server perks: uploading custom server emojis (`5,000 SP`), custom stickers (`10,000 SP`), or a 7-day gold **High Roller** name color (`2,500 SP`).

<details class="code-rollup">
<summary><strong>View Details &amp; Code: Discord UI Mini-Casino (Slots, Roulette, Lotto &amp; Blackjack View)</strong></summary>
<div class="rollup-body">

Between innings or periods, members can also play quick table games built with native `discord.ui.View` buttons instead of clunky text commands:
* **3×3 Progressive Slots (`cogs/slots.py`):** 5 active paylines tuned to ~95% RTP. 2% of every spin feeds a server-wide progressive jackpot triggered by hitting triple crowns across the center line.
* **Button-Driven Blackjack (`cogs/blackjack.py`):** Renders `[Hit]`, `[Stand]`, and `[Double Down]` buttons with soft/hard Ace reduction, dealer draws to soft 17, 3:2 naturals, and a 60-second idle cleanup hook.
* **Weekly Sunday Lottery & Spoiler-Tag Pulltabs (`cogs/lotto.py`, `cogs/pulltabs.py`):** Automated Sunday 11:59 PM raffle draw and mobile-friendly spoiler-tag scratch cards.

```python
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
        total, aces = 0, 0
        for card in hand:
            val = card[:-1]
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

    @button(label="Hit", style=discord.ButtonStyle.primary)
    async def hit(self, interaction: discord.Interaction, btn: discord.ui.Button):
        if interaction.user.id != self.ctx.author.id:
            return await interaction.response.send_message("This table belongs to the active player.", ephemeral=True)
        self.player_hand.append(self.deck.pop())
        score = self.calculate_score(self.player_hand)
        if score >= 21:
            self.stop()
            await self.resolve_hand(interaction, busted=(score > 21))
        else:
            await interaction.response.edit_message(embed=self.build_embed(hide_dealer=True), view=self)
```

</div>
</details>

---

## Live Baseball Diamonds & Bullpen Fatigue Without Paid APIs

Commercial sports data feeds charge hundreds of dollars a month. Instead, we query ESPN's public scoreboard JSON (`site.api.espn.com`), `statsapi.mlb.com`, and `api.openf1.org` directly over `aiohttp` with local caching.

For Blue Jays games (`/jays_live`), the bot does two things that make the `#baseball` channel feel like a live dugout monitor:
1. **3-Bit Base-Runner Diamond Emojis:** The live `situation` object reports three booleans (`onFirst`, `onSecond`, `onThird`). We pack those three flags into a 3-bit integer (`0b000` through `0b111`) and map all eight base-runner states to custom diamond emojis uploaded to the server, alongside automated reaction triggers whenever community favorites like Alejandro Kirk or Vladimir Guerrero Jr. drive in a run.
2. **Three-Day Rolling Bullpen Fatigue (`/jays_lineup`):** Before first pitch, the bot pulls the last three days of box scores, weights each reliever's recent pitch counts (`P0 * 1.0 + P1 * 0.65 + P2 * 0.35`), and flags who is fresh, day-to-day, or unavailable after back-to-back outings.

<details class="code-rollup">
<summary><strong>View Code: 3-Bit Base-Runner Bitmask &amp; 3-Day Bullpen Fatigue Calculator (cogs/baseball.py)</strong></summary>

```python
from dataclasses import dataclass
from enum import IntFlag, Enum
from typing import Any

class RunnerBase(IntFlag):
    EMPTY        = 0b000
    FIRST        = 0b001
    SECOND       = 0b010
    FIRST_SECOND = 0b011
    THIRD        = 0b100
    CORNERS      = 0b101
    SECOND_THIRD = 0b110
    LOADED       = 0b111

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
    on_1b = bool(situation.get("onFirst", False))
    on_2b = bool(situation.get("onSecond", False))
    on_3b = bool(situation.get("onThird", False))
    mask_value = (int(on_1b) << 0) | (int(on_2b) << 1) | (int(on_3b) << 2)
    return DIAMOND_EMOJIS.get(RunnerBase(mask_value), DIAMOND_EMOJIS[RunnerBase.EMPTY])

class Availability(Enum):
    AVAILABLE   = ("Ready", 0x2ECC71)
    DAY_TO_DAY  = ("Day-to-Day", 0xF1C40F)
    UNAVAILABLE = ("Unavailable", 0xE74C3C)

def calculate_fatigue(p0: int, p1: int, p2: int) -> tuple[float, Availability]:
    consecutive = (1 if p0 > 0 else 0) + (1 if p1 > 0 else 0) + (1 if p2 > 0 else 0)
    fatigue_index = round((p0 * 1.0) + (p1 * 0.65) + (p2 * 0.35), 1)
    if consecutive >= 3 or p1 >= 35 or p0 >= 40 or fatigue_index >= 45.0:
        return fatigue_index, Availability.UNAVAILABLE
    if consecutive == 2 or fatigue_index >= 25.0 or (p1 >= 22 and p0 == 0):
        return fatigue_index, Availability.DAY_TO_DAY
    return fatigue_index, Availability.AVAILABLE
```

</details>

---

## Channel-Aware AI & The Monday Morning Newspaper

Two modules use the Google Antigravity SDK and Gemini models, and both were designed to avoid the annoying "generic chatbot" feel:
* **Channel-Switched Persona (`cogs/mascot.py`):** In `#chat-with-bot`, the mascot is sarcastic, remembers server lore via a persistent SQLite session ID, and roasts members back. If you tag the exact same bot inside `#baseball` or `#hockey`, a channel-name check swaps its system prompt into a straight, numbers-first sports analyst that queries `statsapi.mlb.com` via a Python tool function.
* **The Monday 9:00 AM Highlight Reel (`cogs/agent_content.py`):** To keep people in `#general` from missing what happened in the smaller channels, a Monday morning job pulls the last 500 messages from `#baseball`, `#hockey`, `#overwatch-2`, and `#technology` and distills the biggest bad-beat wagers, arguments, and game reactions into a weekly digest posted in `#general`. Every Monday digest reliably drives a two-day wave of activity back into the niche rooms.

<details class="code-rollup">
<summary><strong>View Code: Channel-Switched Mascot Persona &amp; MLB Tool Binding (cogs/mascot.py)</strong></summary>

```python
from google.antigravity import Agent, LocalAgentConfig, BuiltinTools, Tool

PERSONAS = {
    "banter": (
        "You are Thoms, the mascot of the Thoms Foolery Discord server. "
        "You are sharp-witted, sarcastic, and irreverent. Match user banter and maintain server lore."
    ),
    "sports_analyst": (
        "You are the Thoms Foolery Sports Analyst. Drop all snark. "
        "Provide precise MLB/NHL/NFL statistics and splits."
    )
}

def create_mascot_agent(session_id: str, channel_name: str, fetch_mlb_stats_api, fetch_economy_leaderboard) -> Agent:
    prompt_mode = "sports_analyst" if ("baseball" in channel_name or "hockey" in channel_name) else "banter"
    config = LocalAgentConfig(
        model="gemini-3.5-flash",
        session_id=session_id,
        system_instruction=PERSONAS[prompt_mode],
        capabilities=[
            BuiltinTools.SEARCH_WEB,
            Tool.from_callable(
                name="get_mlb_player_season_stats",
                description="Query official MLB Stats API for hitting or pitching splits.",
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

</details>

---

## Fixing Everyday Discord Friction: AutoMod, Voice & 256 KB Emojis

Three smaller infrastructure cogs rounded out the server:
* **Edit-Intercepting AutoMod (`cogs/moderation.py`):** Standard keyword filters break down when someone posts *"hey everyone"* and edits it ten seconds later, or uses leetspeak (`b@dw0rd`, `b.a.d`), while naive substring matchers accidentally flag normal words like *"bass"* or *"grass"* (the Scunthorpe problem). Our filter hooks both `on_message` and `on_message_edit`, normalizes Unicode and leetspeak separators, checks strict regex word boundaries (`\b`), and applies decaying 14-day strikes or single-channel timeouts (`/channel_lockout`) instead of heavy-handed server bans.
* **Join-to-Create Voice Rooms (`cogs/voice.py`):** Instead of ten empty voice channels cluttering the sidebar, a single `➕ Join to Create` room spawns a personal 96 kbps voice channel on join and deletes it the moment the last person leaves.
* **Automatic Emoji & Sticker Compression (`cogs/media.py`):** Discord silently rejects custom emojis over 256 KB and stickers over 512 KB. When someone drops an oversized PNG into `#emoji-submissions`, the bot offloads a Pillow Lanczos resize and 256-color median-cut quantization pass to `asyncio.to_thread` so the image uploads cleanly without ever blocking the Gateway loop.

<details class="code-rollup">
<summary><strong>View Code: AutoMod Leetspeak Normalizer (cogs/moderation.py) &amp; Async Pillow Compressor (cogs/media.py)</strong></summary>

```python
import asyncio
import io
import re
import unicodedata
from PIL import Image

LEET_MAP = {
    "@": "a", "4": "a", "8": "b", "3": "e", "€": "e",
    "1": "i", "!": "i", "|": "i", "0": "o", "$": "s",
    "5": "s", "7": "t", "+": "t", "v": "u",
}

def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).lower()
    for char, replacement in LEET_MAP.items():
        text = text.replace(char, replacement)
    text = re.sub(r'(?<=\w)[._\-*~+](?=\w)', '', text)
    text = re.sub(r'(?<=\b\w)\s+(?=\w\b)', '', text)
    return text

def matches_prohibited_terms(text: str, blacklisted_patterns: list[str]) -> bool:
    normalized = normalize_text(text)
    return any(re.search(rf"\b{re.escape(p)}\b", normalized, re.IGNORECASE) for p in blacklisted_patterns)

def _compress_image_sync(image_data: bytes, target_max_bytes: int, max_dimension: int = 128) -> bytes:
    with Image.open(io.BytesIO(image_data)) as img:
        if img.mode not in ("RGBA", "RGB"):
            img = img.convert("RGBA")
        img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        for quality in range(95, 20, -15):
            buf = io.BytesIO()
            if img.mode == "RGBA":
                img.quantize(colors=256, method=Image.Resampling.MEDIANCUT).save(buf, format="PNG", optimize=True)
            else:
                img.save(buf, format="JPEG", quality=quality, optimize=True)
            if buf.tell() <= target_max_bytes:
                return buf.getvalue()
        img = img.resize((max_dimension // 2, max_dimension // 2), Image.Resampling.BILINEAR)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

async def optimize_discord_media(raw_bytes: bytes, is_sticker: bool = False) -> io.BytesIO:
    limit = 512 * 1024 if is_sticker else 256 * 1024
    dim = 320 if is_sticker else 128
    out = await asyncio.to_thread(_compress_image_sync, raw_bytes, limit, dim)
    return io.BytesIO(out)
```

</details>

---

If you want to see the sportsbook, the base-runner diamonds, or the Monday highlight reel running live, you can drop into the server at **[discord.gg/84c7ut6cg6](https://discord.gg/84c7ut6cg6)**.
