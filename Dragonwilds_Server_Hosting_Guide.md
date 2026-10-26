# RuneScape: Dragonwilds Dedicated Server Operations Manual

> **Project Atlas Technical Companion Series • Field Operations Manual**  
> *Author:* Jonathan Thoms • Founder, Thoms Foolery  
> *Edition:* Second Edition • Version 1.4.1 (October 2026) • Pay-What-You-Want Digital Companion  
> *Companion Tools:* [Live 72-Minute Vault Timers & Tracker](https://www.thomsfoolery.com/tools/dragonwilds-tracker/)

---

## Executive Architecture & Hosting Options

Deploying an authoritative dedicated server for *RuneScape: Dragonwilds* gives persistent world progression, enabling elite vault cores, regional wilderness bosses, and resource nodes to tick and respawn continuously while players are offline.

```text
  [ Remote Internet Clients / LAN Players ]
                     |
                     v  (UDP Ports 7777, 7778+, 27015)
     [ Router Firewall / NAT / ISP Routing ]
                     |
                     v
     [ 64-bit OS: Linux (Ubuntu/Debian) or Windows Server ]
         |
         +--> [ Dedicated Server: RSDragonwilds / Unreal Engine ]
         |         |-- Launch Flags: -log -NewConsole
         |         |-- RAM: 2 GB Base + 1 GB per Player (Max 6 Players in v0.11)
         |         \-- Config: DedicatedServer.ini (Owner ID, Server & World Name)
         |
         +--> [ System Isolation: systemd daemon or Service Runner ]
         |         \-- Auto-Restart & Sandboxed User (steam)
         |
         +--> [ Rolling Backups & Save Management ]
                   \-- Savegames (*.sav) & 4:00 AM Daily Retention Crons
```

### Hosting Strategy Comparison

Before provisioning hardware, choose the deployment model that best matches your technical capacity and uptime requirements:

| Hosting Option | Operational Difficulty | Cost Profile | Progression & Backup Resilience |
| :--- | :--- | :--- | :--- |
| **Shockbyte (Official Partner)** | **Easiest** (Web GUI configuration) | Set monthly subscription | Managed, automated rolling backups |
| **At Home (Self-Hosted PC/Homelab)** | **Hard** (Port forwarding & OS setup) | Hardware & electricity costs | Manual backup scripts required |
| **Cloud (VPS / Bare Metal Linux)** | **Hardest** (Full Linux CLI & networking) | Scalable hourly/monthly billing | Manual snapshot & cron scripting |

---

## 1. Hardware Sizing & Official Jagex Memory Formula

Dedicated servers operate headless—rendering is stripped, leaving the CPU focused on single-thread simulation ticks (physics, mob AI behavior trees, player inventory replication, and chunk state serialization).

### Operating System Requirements
- **64-bit Architecture Only:** 32-bit operating systems are completely unsupported.
- **Supported Platforms:** Linux (Ubuntu 22.04/24.04 LTS, Debian 12, RHEL/Rocky) and Windows (Windows 10/11 64-bit, Windows Server 2019/2022).

### The Official Jagex RAM Formula
As of **Version 0.11 (March 2026)**, dedicated servers support up to **6 concurrent players**. RAM provisioning follows a strict sizing baseline:

$$\text{Minimum RAM} = 2\text{ GB (Base Engine)} + \left(1\text{ GB} \times \text{Players}\right)$$

| Target Concurrent Players | Base RAM Requirement | Recommended Production Provisioning |
| :--- | :--- | :--- |
| **Solo / Admin Testing (1 Player)** | 3 GB RAM | 4 GB RAM |
| **Co-op Pair (2 Players)** | 4 GB RAM | 6 GB RAM |
| **Small Group (4 Players)** | 6 GB RAM | 8 GB RAM |
| **Full Guild Realm (6 Players - Max)** | **8 GB RAM** | **12–16 GB RAM (Headroom)** |

> [!TIP]
> **Single-Core Frequency Precedence:** Unreal Engine dedicated servers heavily load a primary tick thread. Prioritize high single-core CPU boost clock speeds (3.8 GHz+) over high core counts. A modern 4-core 4.2 GHz machine significantly outperforms an 8-core 2.4 GHz processor.

---

## 2. Networking, Port Forwarding & Routing Rules

For remote players to discover and connect to your dedicated server, inbound network routing must be correctly configured across all firewalls, routers, and ISPs.

### Port Allocation Rules
- **Primary Game Port:** Dedicated servers use UDP port **7777** by default.
- **Multi-Instance Stacking:** If running multiple instances on a single physical host, the second server uses UDP **7778**, the third uses UDP **7779**, and so on.
- **Steam Master Query:** UDP port **27015** is utilized for Steam browser indexing.

```bash
# Linux (UFW Firewall)
sudo ufw allow 7777:7779/udp comment "Dragonwilds Game Traffic"
sudo ufw allow 27015/udp comment "Dragonwilds Steam Query"
sudo ufw reload
```

```powershell
# Windows Defender Firewall (PowerShell as Administrator)
New-NetFirewallRule -DisplayName "Dragonwilds Server UDP" -Direction Inbound `
    -LocalPort 7777,7778,27015 -Protocol UDP -Action Allow
```

> [!WARNING]
> **Port Forwarding Diagnostic:**
> If your server appears in the public in-game server list but players receive connection timeouts or handshake failures, **UDP port forwarding has failed**. Verify:
> 1. Inbound UDP rules on every hardware router between your host machine and your ISP modem.
> 2. That your ISP does not enforce Carrier-Grade NAT (CGNAT, IP range `100.64.0.0/10`). If your router's WAN IP does not match `curl -4 ifconfig.me`, you must request a static public IP from your ISP or tunnel via WireGuard/VPS proxy.
> 3. Consult [portforward.com](https://portforward.com/) for router-specific configuration details.

---

## 3. Installation via Steam & SteamCMD Automation

The server software is distributed freely via Steam under the product name **"RuneScape: Dragonwilds - Dedicated Servers"** (Steam App ID **4019830**).

### Automated SteamCMD Deployment (Linux or Windows)
Deploy or update the server using this headless SteamCMD command string:

```bash
steamcmd +force_install_dir /home/steam/dragonwilds-server +login anonymous +app_update 4019830 validate +quit
```

### Essential Launch Options
Whether running on Windows via `RSDragonwilds.exe` or on Linux via `DragonwildsServer.sh`, always append the official telemetry flags:

```bash
-log -NewConsole
```

- **`-log`**: Streams engine output, player connection GUIDs, and world chunk loads to disk.
- **`-NewConsole`**: Spawns an interactive CLI telemetry window showing live server status and tick health.

### Version Matching & Hotfix Synchronization
If your dedicated server suddenly disappears from the public browser following an update, **the client and server versions no longer match**:
1. Check the server version at the **very top of its boot logs**.
2. Check the game client version in the **top-left corner of the title screen**.
3. Re-run the SteamCMD update command to download the latest server build. (Shockbyte partner instances automatically update upon restart).

---

## 4. Configuration Reference: `DedicatedServer.ini`

Configuration variables dictate server discovery, world generation, and security permissions.

> [!CAUTION]
> **Modify Configs ONLY When Server is Stopped:**
> Changing values in `DedicatedServer.ini` while the server process is running will cause your changes to be **permanently overwritten and lost** when the server shuts down or autosaves. Always stop the server before editing!

### File Paths
- **Linux:** `Files/RSDragonwilds/Saved/Config/Linux/DedicatedServer.ini`
- **Windows Server:** `Files/RSDragonwilds/Saved/Config/WindowsServer/DedicatedServer.ini`  
  *(Note: On Windows, copy or create the configuration file in the `WindowsServer` directory matching the Linux structure).*

### Configuration Parameters
```ini
[DedicatedServer]
; MANDATORY: Your in-game Player ID (Settings Menu -> bottom -> Copy ID)
; The server will NOT boot without a valid Owner ID!
OwnerID=3849102847591029

; MANDATORY: Display name shown in public server browser
ServerName=Project Atlas Community Realm

; MANDATORY: Name of default world loaded or created on first startup
DefaultWorldName=GielinorWilds

; MANDATORY: Admin password for in-game Server Management screen
AdminPassword=SuperSecureAdminPassword2026!

; OPTIONAL: Password required for clients to connect (leave empty for public)
WorldPassword=
```

---

## 5. World Management, Custom Difficulty & Save Migration

When a Dedicated Server boots, it scans `RSDragonwilds/Saved/Savegames` and automatically mounts the newest `.sav` file. If the folder is empty, the server initializes a clean **Standard** world using `DefaultWorldName`.

### Migrating a Local World to Dedicated Server
To move a personal local game world to your dedicated server:
1. Stop the dedicated server daemon.
2. Back up all existing files in `RSDragonwilds/Saved/Savegames/` to a secure folder.
3. Empty `RSDragonwilds/Saved/Savegames/`.
4. Copy your local world `.sav` file from your workstation:
   - **Windows Client Path:** `C:\Users\<username>\AppData\Local\RSDragonwilds\Saved\SaveGames\`
5. Paste the `.sav` file into the server's `RSDragonwilds/Saved/Savegames/` directory.
6. Start the server. Done!

### Creating a World with Custom Rules (Standard, Custom, Creative)
Dedicated servers create Standard difficulty worlds by default. To host custom world modifiers:
1. Launch *RuneScape: Dragonwilds* locally on your desktop.
2. Select **New World**, configure your custom game rules, XP scaling, or creative settings.
3. Enter the world once to generate terrain, then exit to main menu.
4. Copy the newly generated `.sav` from `%LOCALAPPDATA%\RSDragonwilds\Saved\SaveGames\` over to the server's `RSDragonwilds/Saved/Savegames/`.
5. Start the dedicated server.

---

## 6. User Roles & Permission Hierarchy

Dedicated servers partition user access into three tiers:

| Tier | Eligibility | Capabilities |
| :--- | :--- | :--- |
| **Owner** | Player ID matches `OwnerID` in `DedicatedServer.ini`. | Root administrative control; immune to admin demotion. |
| **Admin** | Any player who enters the `AdminPassword` in Settings. | In-game Server Management tab (kicking, banning, difficulty adjustments). |
| **Player** | Any connected client authenticated with `WorldPassword`. | Standard gameplay and progression. |

> [!NOTE]
> Server hosts can inspect which players have entered the admin password by viewing the authenticated sessions section in `DedicatedServer.ini`.

---

## 7. Production Systemd Daemon (Linux)

To ensure high uptime, isolated security, and automatic crash recovery on Linux, wrap the server in a `systemd` service.

Create `/etc/systemd/system/dragonwilds.service`:

```ini
[Unit]
Description=RuneScape: Dragonwilds Dedicated Server
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=steam
Group=steam
WorkingDirectory=/home/steam/dragonwilds-server
ExecStart=/home/steam/dragonwilds-server/DragonwildsServer.sh -log -NewConsole

# Fault Resilience
Restart=always
RestartSec=10

# Security Hardening Sandbox
ProtectSystem=full
PrivateTmp=true
NoNewPrivileges=true
LimitNOFILE=65536

# Resource Governance
MemoryMax=14G
CPUQuota=400%

[Install]
WantedBy=multi-user.target
```

```bash
# Reload, enable on boot, and start
sudo systemctl daemon-reload
sudo systemctl enable dragonwilds.service
sudo systemctl start dragonwilds.service

# Stream live console logs
journalctl -u dragonwilds.service -f -o cat
```

---

## 8. Automated 4:00 AM Rolling Backups & Retention

Power failures or operating system panics during write flushes can corrupt `.sav` files. Automated rolling backups prevent progression loss.

Save to `/home/steam/scripts/backup-dragonwilds.sh` (`chmod +x backup-dragonwilds.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

SAVE_DIR="/home/steam/dragonwilds-server/RSDragonwilds/Saved/Savegames"
BACKUP_DIR="/home/steam/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="dragonwilds_save_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

# 1. Compress save state
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${SAVE_DIR}" .

# 2. Verify archive integrity
tar -tzf "${BACKUP_DIR}/${ARCHIVE_NAME}" > /dev/null

# 3. Prune backups older than 7 days
find "$BACKUP_DIR" -name "dragonwilds_save_*.tar.gz" -mtime +7 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created: ${ARCHIVE_NAME}"
```

Schedule in `crontab -e`:
```bash
0 4 * * * /home/steam/scripts/backup-dragonwilds.sh >> /home/steam/backups/backup.log 2>&1
```

---

## 9. Engine Tuning & The 72-Minute Vault Cadence

Regional boss vaults (**Bramblemead Kara**, **Morrigan Kara**, **Vertentis Kara**) operate on a strict **3 in-game day** respawn cycle. 

With default settings where an in-game day equals **24 real-world minutes**:

$$\text{Vault Core Respawn Cadence} = 3 \times 24\text{ mins} = \mathbf{72\ \text{Minutes}}$$

Dedicated "always-on" servers allow this clock to advance continuously, ensuring vaults and wilderness loot caches are ready to harvest whenever your players log in.

---

## 10. Troubleshooting Diagnostic Matrix

| Observed Symptom | Probable Root Cause | Resolution Procedure |
| :--- | :--- | :--- |
| **Server missing from public browser** | Outdated server version or port 27015 UDP blocked. | Verify server version matches client. Allow 5 mins for Steam master browser indexing. |
| **Server visible but connection refused** | UDP port 7777 forwarding failed on router/ISP. | Check router UDP port forwarding and verify host is not behind CGNAT. |
| **Server process fails to boot** | Missing `OwnerID` in `DedicatedServer.ini`. | Enter your valid player ID from in-game Settings menu into config. |
| **Configuration changes not taking effect** | Config edited while server was running. | Stop server, edit `DedicatedServer.ini`, save, and restart. |
| **Crash with Exit Code 137** | Linux Out-Of-Memory (OOM) killer triggered. | Provision at least 8 GB RAM for 6 players or configure a 4 GB swapfile. |

---

## 11. Colophon & Digital Companion Resources

This manual is maintained by **Jonathan Thoms** as part of the **Project Atlas** open-access technical initiative.

### Interactive Tools on Project Atlas
- **72-Minute Vault Respawn Timers:** Live countdowns, audio notifications, and loot tracking:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#timers](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#timers)
- **Comprehensive Progression Checklist:** Quest tracking, Urn locations, and gear tiers:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#guide](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#guide)
- **Official Server Hosting Web Manual:** On-page interactive server ops guide:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#server](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#server)

---
*Published by Thoms Foolery Digital Press • Distributed under Pay-What-You-Want Terms via Lemon Squeezy*  
*Copyright © 2026 Jonathan Thoms. All rights reserved.*
