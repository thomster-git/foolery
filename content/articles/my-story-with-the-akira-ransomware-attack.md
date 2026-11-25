---
stage: "teaser"
id: my-story-with-the-akira-ransomware-attack
title: "Surviving the Akira Ransomware Attack: 14 Days of Bare-Metal Triage and Rebuilding a Mine from Scratch"
type: article
status: published
author: "Jonathan Thoms"
created: 2026-10-19
updated: 2026-11-20
access: paid
summary: The story of how a single IT Coordinator stood between an Akira ransomware detonation and the shutdown of an isolated fluorspar mine in Newfoundland. From waking up to 200 Defender alert emails at 4:43 AM and pulling the fiber uplinks by hand, to finding our Datto backups untouched and reimaging 60 machines on an office bench.
topics:
  - technology
themes:
  - resilience
  - systems-thinking
tags:
  - ransomware
  - cybersecurity
  - incident-response
  - datto
  - mining
  - disaster-recovery
  - newfoundland
  - systems-thinking
related:
  - building-a-comprehensive-discord-ecosystem
  - project-atlas
---

I had a clear plan for what I was going to do that morning.

At the time, I was the sole IT Coordinator for Canada Fluorspar Inc. (CFI), an industrial fluorspar mine in St. Lawrence on the southern tip of Newfoundland's Burin Peninsula. We were in the middle of exiting an underperforming Managed Service Provider (MSP) and onboarding a stronger local partner.

Before the new MSP would take over the environment, they had run an intake audit. Their report sat on my desk: flat `/24` subnets with no internal segmentation, unmonitored endpoints, stale firewall rules, and dormant domain administrator accounts left active in Active Directory by previous contractors. We had ordered new Palo Alto perimeter firewalls and were getting ready to push SentinelOne across the fleet. My plan for that day was to sit down with coffee and start closing those audit findings one by one.

I never made the coffee.

At **4:43 AM Newfoundland Standard Time**, my phone started vibrating across the nightstand and didn't stop.

---

## 4:43 AM

It wasn't a single disk-space warning or a flaky UPS ping. Within a few minutes, my inbox had filled with **more than 200 critical Microsoft Defender alerts**.

A few days earlier, I had upgraded our Microsoft 365 tenant from Business Standard to Business Premium. Under Business Standard, we wouldn't have had Defender for Endpoint behavioral heuristics or real-time email alerts for suspicious process trees. If I had waited another week to flip that license switch, the payload would have finished encrypting the site in silence before the day shift clocked in.

Instead, my screen was scrolling with mass `.akira` file renames, encoded PowerShell invocations under `NT AUTHORITY\SYSTEM`, and `vssadmin.exe` commands trying to wipe Volume Shadow Copies across our servers.

I pulled on my work boots and drove to the mine in the dark.

---

## Pulling the Cables

When I unlocked the administrative building, the offices were quiet, but down the hall the server room cooling fans were running flat out.

When a network is actively encrypting, you don't sit down at a console and try to write firewall rules while packets are moving. I walked straight up to the core racks and unplugged every physical uplink, fiber patch, and switch trunk by hand. Within forty-five minutes of that first 4:43 AM alert, the facility was physically air-gapped from the internet and broken into isolated islands.

<div class="photo-slot">
[Photo slot: /images/articles/severed-switch-uplinks.jpg — Bundle of unplugged patch cables and SFP+ fiber leads hanging loose from the switch rack during physical containment]
</div>

Next, I sent an emergency message to every department head and supervisor:

> *"Turn off your computers immediately. Do not log in, do not plug into ethernet, do not turn them back on, and bring every physical laptop to the IT office."*

That morning taught me a lesson no policy binder prepares you for: you cannot build an incident response plan that relies on everyone following instructions when they walk into work. Several people came into their offices, saw strange text files or locked screens, and power-cycled their laptops three or four times trying to check their email. Every reboot on an affected machine risks wiping volatile memory artifacts and rotating event logs before you can image the disk.

And because the site had zero spare laptops sitting in reserve, the moment we pulled the network cables and collected the fleet, the administrative side of the mine went dark.

<!-- more -->

---

## The Datto Box They Missed

Back in the server room, I checked the blast radius. The domain controllers, file shares, and ERP hosts had `.akira` extensions across their data volumes and `akira_readme.txt` notes dropped in every folder pointing to a Tor negotiation portal.

Then I logged into our local **Datto BCDR backup appliance**.

I actually let out a breath I didn't realize I was holding. The Datto box was completely untouched.

Akira had torn through the Windows volumes on the flat LAN, but they never touched the isolated Linux-based backup appliance or its immutable ZFS snapshot chain. Every server snapshot from the night before the detonation was healthy and verifiable.

<div class="photo-slot">
[Photo slot: /images/articles/datto-bcdr-appliance.jpg — Front bezel and status LEDs of the local backup appliance in the server room]
</div>

As I inspected the affected servers, it also became clear that the attackers had been in a hurry. They hadn't locked out my Domain Admin credentials or destroyed the Active Directory schema. On several machines, the encryption script had skipped open or unmounted partitions, allowing us to pull recent operational files locally before wiping. When we later briefed cyber-insurance counsel and external forensic investigators, they confirmed what the logs showed: it wasn't a months-long nation-state operation. Someone had found an open door, sprayed an automated encryption script across the flat subnet at 4:40 AM, and bolted.

---

## Fourteen Days on the Bench

With clean snapshots on the Datto appliance, we had a way back. The incoming MSP flew a senior network engineer into Newfoundland for three days to work alongside me in the server room.

We didn't restore the old flat network; we built the new one on the spot:
1. **Racking the New Firewalls:** We unboxed the new perimeter firewalls, built strict VLAN boundaries, and blocked unauthorized outbound traffic before bringing a single server back up.
2. **Sandboxed Server Restores:** We spun up bare-metal restores from the Datto snapshots inside an isolated staging VLAN and verified Active Directory hygiene before opening internal routes.
3. **One Laptop Per Department:** Reimaging sixty endpoints takes days, and the mine still had to keep water pumps running, meet safety compliance, and process payroll. I wiped and hardened one clean laptop for each critical department—Mine Operations, Safety, Environmental Pumping, and Payroll—so essential work could continue while the rest of the fleet waited in line.
4. **The Office Assembly Line:** After the fly-in engineer headed home, I turned my office workbench into a one-man imaging line.

<div class="photo-slot">
[Photo slot: /images/articles/laptop-reimaging-bench.jpg — Row of laptops on the IT workbench running disk sanitation and clean OS deployment from offline USB media]
</div>

For the next two weeks I worked sixteen-to-eighteen-hour days straight through the weekend. Pull the drive or bridge it for a raw forensic bit-stream capture, run a full zero-fill erase, lay down a clean Windows image from offline USB media, install SentinelOne and Defender for Endpoint, enable LAPS for local admin passwords, and join the hardened domain.

| Days | What Happened on the Ground |
|---|---|
| **Day 0 (04:43 AM)** | 200+ Defender alerts fire; drive to site; physically pull core switch uplinks and air-gap the mine. |
| **Day 1** | Inspect the Datto BCDR appliance—confirm 100% of immutable ZFS snapshots are intact. |
| **Days 2–3** | Fly-in MSP engineer arrives; rack new perimeter firewalls and segment the network into isolated VLANs. |
| **Days 4–5** | Wipe and deploy one verified laptop per critical department (Operations, Safety, Water Pumping, Payroll). |
| **Days 6–7** | Restore core servers from Datto snapshots into a clean staging sandbox and scrub dormant AD accounts. |
| **Days 8–10** | Solo night-and-weekend bench shifts: forensic disk captures, cryptographic wipes, and bare-metal OS installs. |
| **Days 11–13** | Roll out SentinelOne EDR, Defender for Endpoint, and LAPS across the remaining workstation fleet. |
| **Day 14** | All 60+ endpoints and 5 production servers back online; $0 ransom paid. |

---

## The Boardroom & The Food-Tray Comment

Technically, the recovery worked. Environmentally, those two weeks were brutal.

In a real infrastructure emergency, my brain locks into the dependency tree: power, switching, firewall rules, storage pools, domain trust, endpoints. The panic fades out and the work becomes purely sequential. That focus got the servers back up, but the atmosphere upstairs made every day heavier than it needed to be.

Some of the leadership team treated the outage not as a criminal attack we were pulling them out of without paying a cent of ransom, but as an annoyance that "IT" was taking too long to clear up. During one department-head meeting while I was running on four hours of sleep and working unpaid 18-hour shifts, a senior figure at the table joked to the room:

> *"We ought to lock Jonathan in his office, cut a slit in the bottom of the door to slide food trays through, and not let him out until everything is working."*

People around the table laughed. I just sat there looking at my notebook.

Not long after I wrote out the phased recovery roadmap—the departmental loaner sequence, the VLAN staging, and the server restore order—a manager above me stripped my name off the document, presented it upstairs as his own plan, and then walked back down to instruct me to follow it.

Even the forensic handoff was cut short. Cyber-insurance counsel had asked me to capture raw bit-stream disk images of the earliest affected machines. Cloning failing drives over USB bridges takes hours per machine, and executives quickly tired of waiting for hardware to clear forensics. The day the outside legal and forensic team notified management that the initial retainer cap had been reached, leadership shut the investigation down and told me to stop imaging disks and just wipe them so staff could have their desks back.

---

## How They Likely Got In

Even though the formal external post-mortem was halted once the retainer ran out, the Defender logs and AD audit trails pointed to two pieces that came together:
* **Orphaned Admin Credentials:** The previous MSP had left dormant administrator accounts active in Active Directory with legacy authentication enabled—giving an intruder who landed anywhere on the network an easy privilege escalation path.
* **An Unsegmented Perimeter:** In the days before the attack, the site had hosted outside tours where Defender logged an erratic rogue wireless device on the perimeter, while initial lateral scanning early that morning traced back toward an unsegmented peripheral subnet where an unauthorized personal machine had been plugged in overnight. Because the legacy network was completely flat, a single foothold on the edge had a straight line to the domain controllers.

---

## The Monday After

By the end of day fourteen, the mine was running, payroll had cleared, the new firewalls were humming, and all five servers and sixty endpoints were clean.

Then came Monday morning.

My fiancée woke up violently ill and severely dehydrated. I couldn't leave her alone to drive down the peninsula. For the first morning in two weeks, I wasn't standing at the workbench with a stack of laptops and a USB drive.

Two weeks of running on adrenaline, sensory overload, eighteen-hour shifts, and boardroom hostility caught up with my nervous system all at once. Half of my head was still spinning on firewall rules and whether management would blame me if a printer misfired, while everything that actually mattered in my life needed me at home. My body simply tripped the main breaker—a full, non-verbal autistic shutdown on the living room floor.

You can wipe and rebuild sixty computers and five servers from bare metal in fourteen days. A human nervous system takes a lot longer. Keep an immutable backup appliance off your Windows domain, segment your flat networks before you have to do it at 5:00 AM, and never forget that the hardware isn't the most fragile thing in the server room.
