# RuneScape: Dragonwilds Dedicated Server Operations Manual

> **Project Atlas Technical Companion Series • Field Operations Manual**  
> *Author:* Jonathan Thom • Founder, Thom's Foolery & Keel Systems  
> *Edition:* First Edition • Version 1.4.0 (October 2026) • Pay-What-You-Want Digital Companion  
> *Companion Tools:* [Live 72-Minute Vault Timers & Tracker](https://www.thomsfoolery.com/tools/dragonwilds-tracker/)

---

## Executive Architecture Topology

Deploying a dedicated production server for *RuneScape: Dragonwilds* requires balancing single-threaded CPU tick replication with asynchronous disk serialization and resilient network routing.

```text
  [ WAN Internet Clients / Remote LAN Players ]
                        |
                        v  (UDP Ports 7777 & 27015)
     [ Router Firewall / NAT / CGNAT Relay ]
                        |
                        v
     [ Linux Host OS (Ubuntu / Debian / RHEL) ]
         |
         +--> [ systemd Service: dragonwilds.service ]
         |         \-- Auto-Restart (10s delay) & Sandboxed User (steam)
         |
         +--> [ SteamCMD Auto-Update Script: update.sh ]
         |         \-- Anonymous Validation of App ID 4019830
         |
         +--> [ DragonwildsServer-Linux-Shipping (Unreal Engine) ]
         |         |-- RAM: Entity Replication & Tick Loop (30/60 Hz)
         |         \-- NVMe: Saved/Config & World Chunk Database
         |
         +--> [ Automated 4:00 AM Rolling Backup Cron: backup-dragonwilds.sh ]
                   \-- 7-Day Rolling Retention & Gzip Verification
```

---

## 1. Hardware Sizing & Scaling Matrix

Unlike client game engines that heavily utilize multithreading for rendering pipelines, the Unreal Engine dedicated server executable runs completely headless. Game logic, physics simulation, mob AI state trees, and entity synchronization execute primarily across a single primary tick thread, with asynchronous helper threads managing disk I/O and networking.

> [!TIP]
> **Single-Core Frequency Precedence:** When selecting server hardware or VPS instances, prioritize high single-core clock speeds (3.8 GHz+ boost) over large quantities of lower-clocked cores. A 4-core 4.2 GHz instance will significantly outperform an 8-core 2.4 GHz machine under heavy player loads.

| Scale Tier | Target Concurrent Users | Recommended CPU | Minimum RAM | Storage / Uplink |
| :--- | :--- | :--- | :--- | :--- |
| **Co-op Squad** | 2 – 4 Active Players | 2 vCPU (3.2+ GHz) | 4 GB DDR4 | 10 GB SSD / 10 Mbps |
| **Guild Outpost** | 5 – 10 Active Players | 4 vCPU (3.6+ GHz) | 8 GB DDR4 | 20 GB NVMe / 25 Mbps |
| **Community Realm** | 10 – 20 Active Players | 6 vCPU (3.8+ GHz) | 16 GB DDR4 | 40 GB NVMe / 50 Mbps |
| **Public Hub** | 20+ Players (Max Capacity) | 8 vCPU (4.0+ GHz) | 32 GB DDR5 | 80 GB NVMe / 100 Mbps |

### Memory Leaks & Headroom
Dedicated survival servers accumulate memory usage over prolonged uptimes due to chunk caching and mob pathing grids. Always allocate at least 2 GB of memory headroom beyond the baseline requirement, and schedule a graceful daily restart.

---

## 2. Host Operating System Preparation & User Isolation

Running dedicated game servers under the `root` user or an Administrator account is a severe security risk. A remote code execution exploit in the engine or mod loader could grant full kernel-level access to your machine. Always isolate the server under an unprivileged system user.

### Linux User Creation (Ubuntu / Debian / RHEL)
```bash
# 1. Create a dedicated system user with a home directory
sudo useradd -m -s /bin/bash steam

# 2. Assign appropriate directory permissions
sudo chmod 750 /home/steam

# 3. Increase max open file descriptors for the steam user
sudo bash -c 'cat << EOF >> /etc/security/limits.d/99-steam.conf
steam soft nofile 65536
steam hard nofile 65536
EOF'
```

### Windows Server Directory Structuring
On Windows environments, avoid deploying to user desktop folders or `Program Files` (which often causes permission collisions during automated patching). Create a clean root directory such as `C:\Servers\Dragonwilds\` and ensure the target user account has full read/write rights.

---

## 3. SteamCMD Deployment & Update Automation

Dragonwilds dedicated server binaries are distributed through Valve's SteamCMD content delivery system under Dedicated Server App ID **4019830**.

### SteamCMD Installation
- **Ubuntu / Debian:** `sudo apt-get update && sudo apt-get install -y steamcmd`
- **AlmaLinux / Rocky / Fedora:** `sudo dnf install -y steamcmd`
- **Windows:** Download `steamcmd.zip` from Valve, extract to `C:\steamcmd\`, and run `steamcmd.exe` once to self-update.

### Production Update Script (`update.sh`)
Save this script to `/home/steam/scripts/update.sh` and make it executable (`chmod +x update.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="/home/steam/dragonwilds-server"
STEAMCMD_PATH="/usr/games/steamcmd"
APP_ID="4019830"
LOG_FILE="/home/steam/logs/update_$(date +%F).log"

mkdir -p /home/steam/logs

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Dragonwilds server update..." | tee -a "$LOG_FILE"

"$STEAMCMD_PATH" \
    +force_install_dir "$SERVER_DIR" \
    +login anonymous \
    +app_update "$APP_ID" validate \
    +quit | tee -a "$LOG_FILE"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Update completed successfully." | tee -a "$LOG_FILE"
```

> [!NOTE]
> The `validate` flag verifies file checksums against Steam master manifests, automatically repairing any corrupted binaries or assets before boot.

---

## 4. Networking, Port Forwarding & Firewall Hardening

For external players to discover and connect to your dedicated server, two essential UDP ports must be routed through your network stack:

| Port | Protocol | Purpose | Firewall Scope |
| :--- | :--- | :--- | :--- |
| **7777** | UDP | Game Replication, Entity Physics & RPCs | Public Inbound |
| **27015** | UDP | Steam Master Server Query & Server Browser | Public Inbound |

### Firewall Configuration Commands
**Linux (UFW):**
```bash
sudo ufw allow 7777/udp comment "Dragonwilds Game Replication"
sudo ufw allow 27015/udp comment "Dragonwilds Steam Query"
sudo ufw reload
```

**Windows Defender Firewall (PowerShell as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Dragonwilds Server Ports" -Direction Inbound `
    -LocalPort 7777,27015 -Protocol UDP -Action Allow
```

### Carrier-Grade NAT (CGNAT) Diagnostic
Many residential Internet Service Providers (ISPs) utilize CGNAT, which assigns customers a shared private IP address within the `100.64.0.0/10` range. If your host is behind CGNAT, traditional router port forwarding will fail.

> [!WARNING]
> **CGNAT Verification Procedure:**
> 1. Check the WAN/Internet IP displayed on your router admin dashboard.
> 2. Query your public IP from terminal: `curl -4 ifconfig.me`
> 
> *Result:* If the router's WAN IP does NOT match `curl ifconfig.me`, you are behind CGNAT. Contact your ISP to request a static public IPv4, or tunnel through a VPS reverse proxy (using WireGuard, Tailscale, or Cloudflare Tunnels).

---

## 5. Production Systemd Daemon Configuration (Linux)

To guarantee continuous availability, automatic restart upon crashes, and seamless system reboot recovery, configure the server as a native `systemd` unit.

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
ExecStart=/home/steam/dragonwilds-server/DragonwildsServer.sh -log

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

### Service Management Commands
```bash
# Reload systemd configuration
sudo systemctl daemon-reload

# Enable service to launch on system boot
sudo systemctl enable dragonwilds.service

# Start the server daemon
sudo systemctl start dragonwilds.service

# Stream real-time production logs
journalctl -u dragonwilds.service -f -o cat
```

---

## 6. Automated Rolling Backups & Disaster Recovery

Player progression, quest states, inventory containers, and building coordinates reside inside the `Dragonwilds/Saved/` directory. Power outages or server panics during disk write cycles can corrupt world databases. Automated rolling backups are vital.

### Automated Backup Script (`backup-dragonwilds.sh`)
Save to `/home/steam/scripts/backup-dragonwilds.sh` (`chmod +x backup-dragonwilds.sh`):

```bash
#!/usr/bin/env bash
set -euo pipefail

SAVE_DIR="/home/steam/dragonwilds-server/Dragonwilds/Saved"
BACKUP_DIR="/home/steam/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="dragonwilds_save_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

# 1. Compress save state
tar -czf "${BACKUP_DIR}/${ARCHIVE_NAME}" -C "${SAVE_DIR}" .

# 2. Verify archive integrity
tar -tzf "${BACKUP_DIR}/${ARCHIVE_NAME}" > /dev/null

# 3. Prune archives older than 7 days
find "$BACKUP_DIR" -name "dragonwilds_save_*.tar.gz" -mtime +7 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created: ${ARCHIVE_NAME}"
```

### Crontab Automation
Schedule daily backups at 4:00 AM by adding this entry to `crontab -e` under the `steam` user:
```bash
0 4 * * * /home/steam/scripts/backup-dragonwilds.sh >> /home/steam/backups/backup.log 2>&1
```

### Disaster Recovery Procedure
1. Stop the running server: `sudo systemctl stop dragonwilds.service`
2. Archive the corrupted state: `mv /home/steam/dragonwilds-server/Dragonwilds/Saved /home/steam/Saved_corrupt`
3. Re-create clean folder: `mkdir -p /home/steam/dragonwilds-server/Dragonwilds/Saved`
4. Extract known good archive: `tar -xzf /home/steam/backups/dragonwilds_save_YYYYMMDD.tar.gz -C /home/steam/dragonwilds-server/Dragonwilds/Saved/`
5. Restart server daemon: `sudo systemctl start dragonwilds.service`

---

## 7. Engine Tuning, `ServerSettings.ini` & The 72-Minute Vault Cadence

Server runtime variables are stored in:
`Dragonwilds/Saved/Config/LinuxServer/ServerSettings.ini`

```ini
[ServerSettings]
ServerName="Project Atlas Official Dedicated"
ServerPassword=""
AdminPassword="ChangeThisSecurePass123"
MaxPlayers=20
TickRate=30
AutoSaveIntervalMinutes=15
DifficultyMultiplier=1.0
DayCycleMinutes=24
```

> [!IMPORTANT]
> **The 72-Minute Vault Respawn Mechanic:**
> In *RuneScape: Dragonwilds*, elite regional vaults (such as **Bramblemead Kara**, **Morrigan Kara**, and **Vertentis Kara**) operate on a strict **3 in-game day** respawn cycle. With default `DayCycleMinutes=24`, exactly $3 \times 24 = \mathbf{72\ \text{minutes}}$ elapses between vault resets.
> 
> Admins should avoid changing `DayCycleMinutes` arbitrarily, as community tracker tools (including our Project Atlas Live Vault Timers) synchronize player loot expeditions to this exact 72-minute cadence!

---

## 8. Mod Management & Client Version Synchronization

Community modifications (QoL adjustments, custom textures, extended building kits) are distributed as Unreal Engine package archives (`.pak`).

### Mod Installation Path
`Dragonwilds/Content/Paks/Mods/`

1. Create the `Mods` subfolder inside `Paks` if it does not already exist.
2. Upload mod archives: `rs_dragonwilds_hud_v2_P.pak`.
3. Ensure proper file ownership:
   ```bash
   sudo chown -R steam:steam /home/steam/dragonwilds-server/Dragonwilds/Content/Paks/Mods
   ```
4. Restart the daemon: `sudo systemctl restart dragonwilds.service`

> [!WARNING]
> **Client-Server Hash Mismatch:** Any mod containing custom gameplay logic, entity attributes, or altered item recipes must be installed on **both** the server and all client machines. If pak checksums diverge, connecting clients will be booted back to the main menu with a silent handshake drop.

---

## 9. Production Troubleshooting Matrix

| Observed Symptom | Probable Root Cause | Resolution Procedure |
| :--- | :--- | :--- |
| **Server missing from Steam browser** | Port 27015 UDP blocked or Steam master server query delay. | Verify `sudo ufw status`. Allow 5–10 minutes after initial boot for Steam global indexing. |
| **Address already in use (Port 7777)** | Zombie server instance running from prior manual launch. | Run `fuser -k 7777/udp` or `killall -9 DragonwildsServer` before restarting. |
| **Daemon crashes with Exit 137** | Linux Out-Of-Memory (OOM) killer terminated the process. | Provision additional RAM or configure a 4 GB swapfile (`fallocate -l 4G /swapfile`). |
| **SteamCMD Error 0x202** | Disk volume full or read-only filesystem mount. | Run `df -h` to verify disk capacity. Check directory write permissions for `steam` user. |
| **Player rubberbanding & tick drops** | Single-thread CPU saturation or disk I/O bottlenecks. | Check server tick rate using `top`. Ensure saves are on NVMe media, not mechanical HDDs. |

---

## 10. Colophon & Companion Resources

This field guide is published by **Thom's Foolery** as an open-access companion manual for the **Project Atlas** ecosystem.

### Interactive Live Tools on Project Atlas
- **72-Minute Vault Respawn Timers:** Live countdowns, audio alerts, and loot cycling for all six regional vaults:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#timers](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#timers)
- **Interactive Progression Checklist:** Real-time chapter task completion, quest logs, and step tracking:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#guide](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#guide)
- **Best-in-Slot Fishing & Bait Guide:** Regional rod crafting materials and fish requirements:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#fishing](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#fishing)
- **Shareable Stats Profile Canvas Generator:** Export your total skill levels to high-resolution PNG:  
  [https://www.thomsfoolery.com/tools/dragonwilds-tracker/#stats](https://www.thomsfoolery.com/tools/dragonwilds-tracker/#stats)

### About the Author
**Jonathan Thom** is a software architect, homelab enthusiast, and the creator of Project Atlas and Keel Systems. When he isn't managing Proxmox clusters or laser engraving at EtchCentric Creations, he deconstructs retro game mechanics and builds tools for communities.

---
*Published by Thom's Foolery Digital Press • Distributed under Pay-What-You-Want Terms*  
*Copyright © 2026 Jonathan Thom. All rights reserved.*
