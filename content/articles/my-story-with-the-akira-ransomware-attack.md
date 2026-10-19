---
stage: "teaser"
id: my-story-with-the-akira-ransomware-attack
title: "Surviving the Akira Ransomware Attack: 14 Days of Bare-Metal Triage, Toxic Leadership, and Rebuilding a Mine from Scratch"
type: article
status: published
author: "Jonathan Thoms"
created: 2026-10-19
updated: 2026-10-19
access: paid
summary: The true story of how a single IT Coordinator stood between the Akira ransomware gang and the total operational collapse of an isolated fluorspar mine in Newfoundland. From waking up to 200 Defender alert emails at 4:43 AM and discovering our Datto backups untouched, to enduring toxic executive pressure, assembly-line endpoint reimaging, and forensic analysis of a rushed, sloppy adversary.
topics:
  - technology
  - audhd
themes:
  - resilience
  - systems-thinking
tags:
  - ransomware
  - cybersecurity
  - incident-response
  - datto
  - audhd
  - autistic-burnout
  - mining
  - disaster-recovery
related:
  - building-a-comprehensive-discord-ecosystem
  - project-atlas
---

I had a clear plan for what I was going to do that day.

At the time, I was working as the sole IT Coordinator for Canada Fluorspar Inc. (CFI), an industrial fluorspar mining operation located in St. Lawrence on the rugged, isolated Burin Peninsula of Newfoundland. We were in the middle of a high-stakes transition: preparing to exit an underperforming, legacy Managed Service Provider (MSP) that had left our infrastructure riddled with technical debt, and onboarding a much stronger local MSP to take over coverage.

Before the new MSP would officially take us under their contract, they required a comprehensive network and infrastructure audit. They handed me a thick, alarming report detailing critical vulnerabilities left behind by the old provider: flat subnets, unmonitored endpoints, obsolete firewall rules, and dozens of dormant domain administrator accounts quietly sitting active in Active Directory.

We had already taken the first proactive steps. We had ordered brand-new enterprise firewalls, were preparing to roll out SentinelOne endpoint detection and response (EDR), and I had prioritized the audit's critical punch list. My plan for that morning was to sit down at my workbench and begin systematically eliminating those glaring vulnerabilities one by one.

That plan never happened. It was completely derailed before I could even make my morning coffee.

At **4:43 AM Newfoundland Standard Time**, long before my alarm was set to go off, my phone on the nightstand erupted with a violent, non-stop vibration.

| Incident Telemetry | Tactical Reading | Operational Impact |
|---|---|---|
| **First Payload Trigger** | `04:43:18 NST` | Pre-dawn detonation window before site staff arrived |
| **Defender Alert Storm** | `200+ Critical Alerts` | Synchronized mass file renames & shadow copy deletions |
| **Physical Containment** | `< 45 Minutes` | 100% of core copper/fiber uplinks manually severed |
| **Backup Appliance Integrity** | `100% Intact / Zero Breach` | Datto BCDR ZFS immutable snapshot chain untouched |
| **Ransom Extortion** | `$0 Paid` | Zero crypto transacted; 100% enterprise recovery |
| **Total Fleet Rebuild** | `14 Days Bare-Metal Sprint` | 5 production servers + 60+ endpoints imaged and sanitized |

---

## Act I: The 4:43 AM Alert Storm

The volume of notifications hitting my phone wasn't a standard false positive or an errant disk threshold alert. It was a torrential, synchronized flood: **over 200 critical Microsoft Defender security alerts in the span of minutes.**

Earlier that same week, I had made an administrative decision that ultimately saved the entire company: I had upgraded my Microsoft 365 licensing from Business Standard to **Business Premium (Professional)**. 

Under Business Standard, Microsoft provides basic anti-spam and basic antivirus definitions. But Business Premium silently enables **Microsoft Defender for Endpoint**—introducing behavioral heuristics, automated attack disruption, and real-time email telemetry for suspicious process execution. 

Had I not pushed that license upgrade days prior, the attack would have executed in absolute silence until morning shift arrived.

```text
[04:43:12 NST] CRITICAL - Ransom:Win32/Akira.A detected on SRV-FILE01 (192.168.1.12)
[04:43:15 NST] SUSPICIOUS - powershell.exe -enc <Base64Payload> executed by NT AUTHORITY\SYSTEM
[04:43:17 NST] CRITICAL - Shadow copy deletion: vssadmin.exe delete shadows /all /quiet
[04:43:21 NST] ALERT    - High-frequency file modification: 4,812 files appended with '.akira'
[04:43:28 NST] BLOCKED  - Outbound connection to C2 IP 185.220.101.42:443 interrupted by Defender Heuristics
```

Instead, my phone screen was lit up with notifications of mass file renames, suspicious PowerShell invocations, and unauthorized shadow copy deletion attempts across our server fleet. The ransomware payload had detonated overnight. 

I threw on my work boots and drove to the mine site in the pre-dawn dark.

---

## Act II: Physical Containment vs. The Human Factor

When I arrived at the mine site, the silence was eerie. The administrative offices were dark, but the fans in the server room were screaming at maximum RPM. 

I didn't wait to inspect operating systems or attempt remote management. When a network is actively encrypting, software-defined isolation is a luxury you cannot afford. I walked straight into the network core and **physically unplugged every network uplink, fiber transceiver, and patch cable** from the switches. I severed the site’s connection to the internet and broke the physical pathways between subnets. The entire facility was air-gapped.

```text
[ THREAT ACTOR INGRESS ] (Compromised Dormant AD Admin / Rogue Perimeter)
             │
             ▼
[ FLAT CORPORATE SUBNET (192.168.1.0/24) ]
├── 💻 Security Guard Laptop (Night-shift torrenting vector)
├── 🖥️ Finance & Admin Desktops (Encrypted with .akira payload)
└── 🖧 Production Server Cluster (Active Directory, File Share, ERP)
             │
             ├───❌ [ 04:43 AM Alert Storm ] ───> [ Phone Vibrates ]
             │                                         │
             ▼                                         ▼
[ PHYSICAL CORE CABLE PULL ] ─────────────────> [ Total Facility Airgap ]
             │
             ├───🛡️ [ Datto BCDR Appliance ] ───> [ 100% UNTOUCHED ]
             │     (Isolated Linux Kernel, ZFS Immutable Snapshots)
             │
             ▼
[ 14-Day Bare-Metal Recovery: 0 Satoshis Paid, Zero Operational Data Lost ]
```

Next came the operational mandate. I issued an immediate, unambiguous emergency directive to all department leads and staff:

> *"Turn off your computers immediately. Do not attempt to log in. Do not plug into ethernet. Do not turn them back on under any circumstances, and bring every physical laptop to the IT office for forensic imaging."*

This is where I learned the most brutal, unforgiving lesson in all of cybersecurity:

> [!WARNING]
> **The Human Behavior Fallacy:** Your cybersecurity posture is only ever as good as your end-users' willingness to cooperate. Policies and incident response plans look pristine in PDF binders, but when a real crisis hits, human friction can destroy your forensics.

Despite clear, repeated instructions, **multiple employees ignored the directive**. 

People walked into their offices, saw their screens locked or behaving strangely, and repeatedly power-cycled their machines. Some bypassed instructions entirely and kept working on local documents. 

In an active cyber incident, booting an infected endpoint doesn't just risk re-propagating malware across unsegmented broadcast domains—it **violently erases volatile RAM artifacts, corrupts memory dumps, and overwrites Windows Event Viewer logs** that incident responders need to determine weaponization and dwell time.

To make matters worse, the mine had zero cold-spare laptops sitting on a shelf. There was no reserve fleet of pre-imaged, offline machines for essential personnel. The moment we pulled the network plugs, the administrative backbone of the company ceased to exist.

<!-- more -->

---

## Act III: The Lifeline: The Datto Appliance & The "Sloppy" Hackers

I began surveying the blast radius across our server room. 

The domain controllers, file servers, and our enterprise resource planning (ERP) workloads were compromised. File extensions had been appended with `.akira`, and ransom notes titled `akira_readme.txt` were deposited in directories across the network. Akira is a notorious ransomware family that leverages compromised credentials to establish persistence, dump LSASS credentials, and execute multi-threaded encryption routines.

```text
======================= [ AKIRA RANSOMWARE ] =======================
Dealing with Akira is your only way to recover your encrypted data.
All your documents, databases, hypervisors, and backups are encrypted.
Do not modify, rename, or run third-party decryptors on any files.
It will lead to permanent cryptographic data loss.

To regain access, contact our negotiation portal via Tor:
hxxp://akira[redacted].onion
====================================================================
```

Then I checked our last line of defense: our **Datto BCDR (Business Continuity and Disaster Recovery) appliance**.

My breath caught in my throat. **The Datto device was completely untouched.**

Akira had torn through our primary Windows Server infrastructure, but they never discovered, accessed, or compromised the dedicated backup appliance. The local immutable snapshot chain remained 100% intact, healthy, and isolated. 

That single piece of hardware was the razor-thin boundary between recovering our entire enterprise for free and facing a multi-million-dollar extortion demand that would have shuttered the mine.

As I dug deeper into the compromised endpoints, a surprising technical reality emerged: **the threat actor’s execution was remarkably rushed and sloppy.**

| Adversary Dimension | Sophisticated APT Target | Akira's Actual Execution at CFI |
|---|---|---|
| **Active Directory Schema** | Immediate Domain Admin lockout & Kerberos wipe | **FAILED:** My admin credentials remained fully operational |
| **BCDR & Hypervisor Target** | Targeted NAS wiping & ESXi snapshot destruction | **FAILED:** Missed Datto appliance completely |
| **Local File Encryption** | Deep multi-pass overwrite & partition corruption | **INCOMPLETE:** We authenticated locally and salvaged unencrypted files |
| **Event Log Evaporation** | Automated wevtutil cl log purging | **PARTIAL:** Over 200 telemetry alerts captured in M365 cloud |
| **Lateral Movement Pace** | Patient weeks-long reconnaissance & dwell time | **RUSHED:** Script-kiddie automated spray within hours of ingress |

* **No Domain Lockout:** Sophisticated ransomware gangs typically compromise the Active Directory schema, wipe or reset Domain Admin passwords, and lock legitimate administrators out of their own directory. Akira had not locked me out. My administrator credentials remained functional.
* **Surface-Level Encryption:** While thousands of files had been hit, the encryption routine appeared rushed. In many instances, we were still able to authenticate locally to infected machines, mount unencrypted partitions, and extract critical operational databases and loose files that the ransomware binary had missed or skipped.
* **No Backup Annihilation:** Competent extortionists spend days hunting backup servers, deleting Volume Shadow Copies across the hypervisor level, and destroying NAS repositories. Akira missed our Datto entirely.

Later on, during joint briefings with our cyber-insurance legal counsel and third-party forensic investigators, they confirmed my exact assessment: **this was a hasty, automated smash-and-grab.** The adversary had found an open vector, hastily sprayed an automated script across reachable subnets, and triggered encryption before establishing true deep persistence.

---

## Act IV: The 14-Day Recovery Sprint

With the Datto appliance verified, we had a recovery path. The new incoming MSP mobilized with incredible speed, flying a senior network engineer directly to Newfoundland to assist me on-site for three days.

Together, we executed a rapid, emergency architectural pivot:

1. **Bare-Metal Firewall Deployment:** We unboxed and racked our newly arrived enterprise firewalls, configuring strict VLAN segmentation, blocking outbound unauthorized DNS/NTP, and creating isolated recovery zones.
2. **Server Restoration from Immutable Snapshots:** We initiated bare-metal restores from the Datto device, spinning up our clean server images in a sandbox before connecting them to the hardened network.
3. **The "One Laptop Per Department" Strategy:** Because we had zero spare machines and re-imaging 60+ endpoints takes dozens of hours, I implemented a surgical triage protocol. I built a clean workstation image, sanitized, wiped, and deployed **one dedicated, verified laptop to each critical department** (Mine Operations, Site Safety, Payroll, and Environmental Water Pumping). This kept essential industrial operations functioning while the site was technically in blackout.
4. **The Endpoint Assembly Line:** Once the critical servers and departmental nodes were stable, the fly-in engineer returned, and I was left to handle the remaining fleet alone. I turned my office into an imaging triage bay.

```text
[ CONTAMINATED ENDPOINT ]
           │
           ▼
[ STATION 1: FORENSIC ACQUISITION ]
Raw Bit-Stream Disk Image (dd / FTK Imager via physical SATA/USB3 bridge)
           │
           ▼
[ STATION 2: CRYPTOGRAPHIC DISK SANITATION ]
Full Zero-Fill / ATA Secure Erase (Guarantees zero dormant rootkits survive)
           │
           ▼
[ STATION 3: BARE-METAL OS ROLLOUT ]
Fresh Windows 10/11 Enterprise base image injected via offline USB media
           │
           ▼
[ STATION 4: HARDENED AGENT STACK ]
Deploy SentinelOne EDR + Defender for Endpoint + Local Admin LAPS
           │
           ▼
[ STATION 5: ISOLATED DOMAIN ENROLLMENT ]
Rejoin hardened Active Directory over restricted staging VLAN (VLAN 99)
```

I worked 16-to-18-hour days, straight through the weekend, with zero overtime compensation. I pulled hard drives, ran forensic image captures, wiped partitions to bare metal, laid down fresh Windows images, joined machines to the hardened domain, and deployed modern EDR agents.

Within **14 days**, our entire enterprise—over 60 endpoints and 5 core production servers—was fully restored, operational, and running cleaner than it had in the prior five years. Not a single penny of ransom was paid.

### The 14-Day Tactical Incident Timeline

| Incident Day | Operational Phase | Threat Actor Activity | Defensive Engineering Response |
|---|---|---|---|
| **Day 0 (04:43 AM)** | Detonation & Containment | Automated Akira encryption spray | 200+ Defender alerts; physical cable pull; total site airgap |
| **Day 1** | BCDR Verification | C2 beacon attempts blocked | Datto appliance inspected: 100% snapshots verified intact |
| **Day 2–3** | Firewall Deployment | Perimeter blocked | Fly-in MSP engineer arrives; enterprise firewalls racked & VLANs built |
| **Day 4–5** | Departmental Triage | Lateral spread dead | "One Laptop Per Department" deployed to keep mine pumping water & payroll running |
| **Day 6–7** | Core Server Restoration | Zero foothold remaining | Datto bare-metal restores spun up in isolated sandbox; AD verified clean |
| **Day 8–10** | Assembly-Line Reimaging | None | Solo bench shifts: Bit-stream forensic imaging, DBAN wipes, fresh OS rollout |
| **Day 11–13** | EDR & LAPS Rollout | None | SentinelOne + Defender for Endpoint pushed to every endpoint; LAPS enabled |
| **Day 14** | Enterprise Go-Live | Extortion defeated | All 60+ endpoints operational; production switches un-isolated; $0 ransom paid |

---

## Act V: Toxic Leadership, Stolen Credit & The "Food Tray" Slit

The technical recovery was a textbook success. The organizational environment, however, was an absolute nightmare.

As an AuDHD (Autistic/ADHD) systems engineer, high-intensity crisis scenarios unlock an incredible, hyper-focused state of flow. My brain ignores panic and laser-focuses on system state machines, dependencies, and logical order. But that hyperfocus requires massive energy reserves, and the environment around me was toxic.

The pressure from upper management was suffocating. Mine executives saw the incident not as a sophisticated criminal extortion event that I was actively saving them from, but as an infuriating operational inconvenience caused by "IT."

During one particularly tense head-of-department meeting, the owner of the mine made a comment that I will never forget. Looking around the boardroom, he sneered that management should:

> *"Lock Jonathan in his office, cut a slit in the bottom of the door to shove food trays in, and don't let him out until everything is fixed."*

People in the room chuckled. I sat there in silence. I had been working 18-hour shifts without extra pay, sacrificing my sleep, health, and sanity to resurrect their multi-million-dollar mine from bare metal, and the owner was joking about treating me like an animal in a cage.

The humiliation didn't stop with the owner. Shortly after I drafted the comprehensive architectural recovery roadmap—the phased restore plan, the departmental loaner strategy, and the segmentation layout—my direct manager at the time took my documentation, removed my name, **presented it to executive leadership as his own original strategy**, and then walked back into my office to "command" me to execute the very plan I had authored.

Then came the investigation farce. I had been designated as the technical representative to interface with cyber-insurance lawyers and external forensic specialists. I was tasked with capturing forensic bit-stream disk images of primary patient-zero endpoints for legal evidence. 

Forensic imaging over USB/SATA bridges on failing mechanical drives takes hours per machine. Management quickly grew impatient. They refused to attend the investigative legal calls and became openly hostile when they realized the forensic imaging process was delaying the return of computers to administrative staff.

The final straw occurred when the external legal team sent their initial invoice. The moment upper management realized the legal retainer limit had been reached, **they pulled the plug on the investigation entirely.**

They told me to stop taking forensic images, hurry up, and just wipe the machines so employees could get back to work. To this day, management never followed up, never concluded the post-mortem, and never shared the results of the investigation with me.

---

## Act VI: The Post-Mortem: How Did They Get In?

Even with the investigation prematurely killed by corporate leadership, the forensic telemetry I preserved allowed me to piece together the likely attack vectors.

```text
[ PRIMARY INGRESS SUSPECTS ]
┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
│  Vector A: Rogue WiFi Pineapple      │     │  Vector B: Gatehouse Shadow IT       │
│  - Investors & tours on site         │     │  - Security officer night shifts     │
│  - High RF beacon anomalies          │     │  - Torrenting client on personal PC  │
│  - MITM credential harvesting        │     │  - Unsegmented gatehouse ethernet    │
└──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘
                   │                                            │
                   └──────────────────┬─────────────────────────┘
                                      ▼
                   [ THE WEAPON: DORMANT AD ADMINS ]
                   - Legacy NTLM authentication enabled
                   - Abandoned by old MSP without offboarding
                   - Direct domain dominance without brute-force
                                      ▼
                   [ LATERAL EXECUTION ACROSS FLAT LAN ]
```

### 1. The Dormant Admin Accounts (The Weapon)
The previous MSP had been dangerously negligent with Active Directory hygiene. They had left multiple dormant administrator accounts active on the domain with legacy authorization methods enabled. 

Akira frequently exploits known authorization flaws (such as legacy NTLM relay or unpatched license/auth service bypasses) to hijack inactive administrative credentials without ever needing to brute-force a password. Once inside, they inherit the keys to the kingdom.

### 2. The Rogue IP Anomaly (Ingress Suspect #1: Physical Proximity)
On the days leading up to the attack, the mine hosted a high volume of outside foot traffic: investors and potential buyers touring the surface facilities and administrative buildings. 

While reviewing the Microsoft Defender connection telemetry from that window, I spotted an anomalous private IP address behaving erratically on our wireless perimeter. Its network signature and packet broadcast behavior bore a striking resemblance to a **WiFi Pineapple**—a rogue penetration-testing access point used to perform man-in-the-middle credential harvesting against nearby corporate devices.

### 3. The Security Guard's Workstation (Ingress Suspect #2: Internal Shadow IT)
There was a competing, equally plausible theory. A security officer at the front gate had been connecting his personal laptop to the corporate network to **download torrents** during night shifts. 

The Defender alert timelines indicated that the lateral scan and initial credential staging appeared to emanate directly from the security station’s subnet early that morning before spreading to the core servers. The mine’s unsegmented flat network meant that an infected personal laptop on the perimeter had direct, unfiltered line-of-sight to production domain controllers.

Both vulnerabilities existed because of years of deferred maintenance and absent security boundaries: legacy dormant credentials provided the privilege, and an unsegmented network provided the runway.

---

## Act VII: The Monday After & The Autistic Meltdown

You cannot run on pure adrenaline, 18-hour workdays, sensory overload, and emotional abuse indefinitely without paying a catastrophic neurological price.

By the second week, the critical systems were back online. The mine was producing, payroll cleared, and the servers were stable. 

Then came the following Monday. 

My fiancée woke up violently ill with an incapacitating gastrointestinal bug. She was bedridden, severely dehydrated, and unable to care for herself. I could not leave her alone. For the first time in two weeks, I couldn't go into the office. I couldn't sit at my workbench. 

My nervous system, which had been trapped in a state of high-alert, life-or-death crisis mode for fourteen straight days, slammed into a concrete wall.

My brain was screaming that the mine was still vulnerable, that I had to finish hardening the infrastructure, that management was waiting to blame me for anything that went wrong—while my heart and duty were at home caring for the person I love. 

The collision of those two unstoppable forces, compounded by profound physical exhaustion and weeks of absorbing toxic hostility, triggered **one of the most severe Autistic Meltdowns of my adult life.**

An autistic meltdown is not a temper tantrum. It is not an emotional outburst. It is a **full neurological shutdown**—an involuntary crisis response where the nervous system loses the ability to regulate incoming sensory and cognitive input. You cannot "willpower" your way out of it. Your brain simply trips the main breaker to protect itself from burning out completely.

I lay on the floor, completely non-verbal, overwhelmed by the realization that I had spent two weeks saving a multi-million-dollar corporation that viewed me as a disposable cog, while neglecting the only things in life that actually mattered.

---

## Lessons from the Rubble: What Matters When the Ransom Note Drops

Surviving Akira taught me more about enterprise architecture, human nature, and systems engineering than any certification ever could. If you are responsible for keeping infrastructure alive, here are the truths that matter:

### 1. One Immutable Backup Device Beats a $50,000 Security Stack
Every single software defense we had failed or was in transition. The only reason Canada Fluorspar survived without paying ransom was our isolated, immutable Datto BCDR appliance. Follow the **3-2-1 backup rule** religiously: three copies of your data, on two different media types, with at least **one copy completely immutable, offsite, and air-gapped**. Test your bare-metal restores before you need them.

### 2. Upgrading Licensing Is an Operational Decision
Upgrading from Microsoft 365 Business Standard to Business Premium days prior gave us the Defender for Endpoint telemetry that caught Akira at 4:43 AM. If you are running an organization on baseline licensing without EDR or centralized email alerting, you are operating blind.

### 3. Clean Your Active Directory Regularly
Dormant admin accounts are open doors with welcome mats. Implement strict privileged access workstations (PAWs), enforce multi-factor authentication (MFA) everywhere, and run monthly audits to disable or delete orphaned accounts left behind by contractors and former MSPs.

### 4. Technical Controls Must Enforce What User Trust Cannot
You cannot rely on end-user compliance during an incident. If you tell users not to boot their computers, someone will boot their computer. Design your network so that compromise containment is enforced at the managed switch and VLAN level, not by trusting humans to follow written warnings.

### 5. Recognize When Adversaries Are Rushed
Ransomware operators are human beings under operational pressure. When you discover an intrusion, look closely: did they lock out your domain admins? Did they touch your backups? Did they clean up their logs? Akira’s sloppy, rushed execution gave us the leverage and unencrypted files we needed to rebuild without panicking.

### 6. Protect Your Engineers Before They Break
Servers can be wiped, re-imaged, and brought back from bare metal in fourteen days. A human nervous system, shattered by around-the-clock burnout, lack of accommodations, and toxic leadership, takes months or years to heal. 

Cybersecurity is not just about defending data. It’s about building resilient, humane systems that honor both the hardware and the people who keep it running.
