---
stage: "full"
id: my-story-with-home-lab-and-proxmox
title: "My Story with Home Lab and Proxmox"
type: article
status: draft
created: 2026-10-10
updated: 2026-11-20
summary: "How an old desktop tower turned into a Proxmox VE homelab running ZFS mirrors, LXC containers, and Tailscale—and why breaking things at home is the best training for production IT."
topics:
  - technology
themes:
  - systems-thinking
  - craftsmanship
  - curiosity
tags:
  - home-lab
  - proxmox
  - virtualization
  - self-hosting
  - infrastructure
related:
  - sensible-infrastructure-and-white-box-servers
  - project-atlas
  - audhd-and-systems-thinking
---

Every good server build I've ever specced for a client started as an experiment on my own shelf at home.

My homelab didn't begin as a neat rack of matching chassis. It started with spare desktop parts, a couple of drives I wanted to test in a mirror, and the realization that you never really understand a hypervisor or a filesystem until you pull a live drive sled out of a running pool in your own house to see how it recovers.

<div class="photo-slot">
[Photo slot: /images/articles/homelab-proxmox-shelf.jpg — Home lab server shelf showing status LEDs, patch leads, and Proxmox node hardware]
</div>

## Why Proxmox VE and LXC Stuck

When you run services at home—Nextcloud, Jellyfin, internal DNS, monitoring, and test sandboxes for client migrations—you learn very quickly to hate unnecessary overhead. Spinning up a full four-gigabyte virtual machine just to run a tiny Python daemon or reverse proxy wastes memory and power.

Moving my home nodes onto **Proxmox VE** changed how I think about infrastructure:
* **Lightweight LXC Containers:** Internal utilities run in isolated Linux containers sharing the host kernel, idling at a few dozen megabytes of RAM.
* **ZFS Snapshots Before Every Change:** Before testing an upgrade or a firewall rule, a two-second ZFS snapshot gives you an instant rollback point.
* **Tailscale & Cloudflare Tunnels:** No open inbound router ports exposed to automated scanners on the public internet.

When the time came to replace an aging server fleet at an industrial mine site, I didn't have to guess whether Proxmox VE and ZFS mirrors could handle the workload. I had already been running, breaking, and restoring that exact stack at home for years.
