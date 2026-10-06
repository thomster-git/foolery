---
id: my-story-with-home-lab-and-proxmox
title: My Story With Home Labs & Proxmox VE
type: article
access: public
status: published
author: Jonathan Thoms
summary: The home lab was built around a Proxmox VE server with 64GB of RAM — LXC containers, self-hosted services, and the beginning of real infrastructure ownership. Currently on pause after upgrading RAM bent several motherboard sockets and I haven't booted it since.
topics:
  - home-lab
  - technology
themes:
  - systems-thinking
  - craftsmanship
related:
  - proxmox-ve
  - keel-systems
  - my-story-with-cfi
  - next-gen-proxmox-home-lab
tags:
  - proxmox
  - virtualization
  - linux
  - self-hosting
  - hardware
created: 2026-09-14
updated: 2026-08-06
connections:
  - my-story-with-mechanical-engineering-and-systems-thinking
  - the-case-for-self-hosting-over-cloud-datacenters
  - my-story-with-keel-systems-and-honest-kpis
---


> **Owning your infrastructure is a completely different mindset from renting it. Once you go down the self-hosting path, it's hard to trust cloud services the same way again.**

---

## Why a Home Lab

The pull toward a home lab started from the same place a lot of my technical interest does: professional frustration. Working at CFI and watching our MSP operate as a black box — where we had no real visibility into our own infrastructure, no documentation, and no internal ownership — made me want the opposite of that at home.

A home lab is the controlled environment where you can learn without consequences. Break a VM configuration? Rebuild it. Misconfigure a firewall rule? Learn exactly why, on your own time, with no one getting billed for your learning curve.

Proxmox VE was the obvious choice. It's enterprise-grade hypervisor software that's genuinely free and open source. You get KVM virtualization and LXC containers in a single web interface, with ZFS storage support, cluster management, and backup integration. It's what you'd find in a real datacenter, running on hardware you own.

---

## What Was Running

The setup was built around a dedicated server with **64GB of RAM** — enough headroom to run multiple services simultaneously without contention. I really enjoyed using this stack for practical, daily-driver services:

- **Nextcloud:** Hosted my own cloud storage, accessible both at home and on the web with a secure login.
- **Jellyfin:** Hosted my media library directly from the Nextcloud server.
- **Ubuntu LTS / SOC:** I was in the process of setting up a Security Operations Center (SOC) on an Ubuntu LTS instance to monitor the network.
- **Windows 11:** I hold my Windows 11 license on this Proxmox box, though it needs some architectural tweaks to function exactly how I want it to.

---

## The Bent Pin Problem & The Next-Gen Build

Currently, the server is down. 

When attempting to upgrade the RAM from **64GB to 128GB**, the cooler — held on by springs — jolted during the process and made contact with the motherboard in a way that bent several CPU socket pins. After the incident, I discovered only the A1 and B1 RAM slots appear to be functional. The system hasn't been booted since.

But the plan for the **Next-Gen Build** is already mapped out. I want to get a new processor with onboard graphics so that my 2080 Super isn't getting bottlenecked. The onboard graphics will handle Nextcloud and Jellyfin, while I completely pass through the 2080 Super GPU so I can boot Windows 11 with full graphical acceleration at the same time. Paired with a new motherboard and the 128GB of DDR4 RAM, it's going to be an absolute powerhouse.

---

## What It's Teaching Me

Even paused, the home lab project is instructive. The bent pin incident is a direct lesson in the cost of not having a proper anti-static workspace, rushing a RAM installation, and underestimating spring-tensioned cooler designs.

More broadly: **home labs fail in the same ways that production infrastructure fails** — hardware surprises, undocumented configurations, incomplete migrations, and the reality that "I'll fix it later" becomes months of downtime.

That's not a failure. That's the most realistic possible training environment.
