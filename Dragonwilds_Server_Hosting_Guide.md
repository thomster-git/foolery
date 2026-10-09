# Dragonwilds Dedicated Server Hosting Guide

Welcome to the official Dragonwilds server hosting guide. This document covers everything you need to know to deploy, maintain, and optimize your own dedicated Dragonwilds server across Windows and Linux environments.

---

## 1. Installation Prerequisites

Dragonwilds dedicated servers are deployed and maintained using **SteamCMD**, the command-line version of the Steam client. Ensure you have SteamCMD installed for your operating system before proceeding.

- **Windows:** Download the SteamCMD zip from Valve, extract it to a dedicated folder (e.g., `C:\steamcmd`), and run `steamcmd.exe` once to let it initialize.
- **Linux (Ubuntu/Debian):** Run `sudo apt install steamcmd` in your terminal.
- **Mac:** macOS is not natively supported for dedicated servers. Running a lightweight Linux or Windows Virtual Machine is highly recommended.

---

## 2. Download & Update the Server

To download the server files (or update an existing server), open your terminal or command prompt and run the following command. This will anonymously connect to Steam, download the latest Dragonwilds server files (App ID: `4019830`), validate them, and safely exit. 

*Replace `~/dragonwilds-server` or `C:\dragonwilds-server` with your preferred installation path.*

**Windows / Linux:**
```bash
steamcmd +force_install_dir ~/dragonwilds-server +login anonymous +app_update 4019830 validate +quit
```

> **Pro-Tip:** Create a simple script (`update.bat` for Windows or `update.sh` for Linux) containing the command above. You can execute this script to easily update your server before every session!

---

## 3. Running the Server

Once the download is fully validated (you should see `Success! App '4019830' fully installed.`), navigate to your installation directory and execute the server binary:

- **Windows:** Run `DragonwildsServer.exe -log`
- **Linux:** Run `./DragonwildsServer.sh -log`

The `-log` parameter opens a console window (or prints to stdout in Linux) so you can monitor server activity and ensure it has started successfully.

---

## 4. Networking & Firewall Configuration

For players outside your local network to connect to your server, you **must** forward the necessary ports on your router and configure your host machine's firewall. 

### Port Forwarding
Access your router's admin panel and forward the following UDP ports to your host machine's local IP address:
- **7777 (UDP)** - Default game port
- **27015 (UDP)** - Steam query port

### Firewall Configuration
Ensure your operating system allows traffic through these ports:

**Windows Defender Firewall:**
Run PowerShell as Administrator and execute:
```powershell
New-NetFirewallRule -DisplayName "Dragonwilds Server" -Direction Inbound -LocalPort 7777,27015 -Protocol UDP -Action Allow
```

**Linux (UFW - Ubuntu/Debian):**
```bash
sudo ufw allow 7777/udp
sudo ufw allow 27015/udp
```

---

## 5. Setting Up a Systemd Service (Linux Only)

To ensure your server stays online and automatically restarts if it crashes or the machine reboots, we highly recommend setting up a `systemd` service on Linux.

1. Create a new service file:
   ```bash
   sudo nano /etc/systemd/system/dragonwilds.service
   ```

2. Paste the following configuration (adjust paths and `User` as needed):
   ```ini
   [Unit]
   Description=Dragonwilds Dedicated Server
   After=network.target

   [Service]
   Type=simple
   User=steam
   WorkingDirectory=/home/steam/dragonwilds-server
   ExecStart=/home/steam/dragonwilds-server/DragonwildsServer.sh -log
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable dragonwilds.service
   sudo systemctl start dragonwilds.service
   ```

You can view live server logs anytime using: `journalctl -u dragonwilds.service -f`

---

## 6. Automated Backups

Protecting your players' progress is critical. We recommend setting up automated backups of your `Saved` directory, which contains all world data and player profiles.

**Linux (Using Cron):**
Add a daily backup job using `crontab -e`:
```bash
0 4 * * * tar -czf /home/steam/backups/dragonwilds_$(date +\%F).tar.gz /home/steam/dragonwilds-server/Dragonwilds/Saved/
```
*This compresses your save folder every day at 4:00 AM.*

**Windows (Using Task Scheduler):**
Create a batch script (`backup.bat`) that uses `Robocopy` or PowerShell to copy the `Saved` folder to a designated backup directory, and trigger it daily via the Windows Task Scheduler.

---

## 7. Mod Installation Basics

Enhance your server experience with community-created mods!

1. Download the desired mod files (usually ending in `.pak`).
2. Navigate to your server installation path and locate the mod directory:
   `Dragonwilds/Content/Paks/Mods/`
3. Place the `.pak` files inside this directory.
4. Restart your server. The game will automatically detect and load valid mods on startup.

> **Important:** Ensure that all connecting players have the exact same versions of the mods installed locally, otherwise they may be unable to join the server.

---

*Thank you for hosting with Dragonwilds! If you encounter any technical issues, please reach out to our premium support team.*
