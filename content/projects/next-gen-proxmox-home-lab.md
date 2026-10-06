---
id: next-gen-proxmox-home-lab
title: "Next-Gen Proxmox Home Lab"
type: project
status: drawing-board
author: Jonathan Thoms
summary: The architectural plan for my next-generation Proxmox VE home lab — born out of a bent-pin incident that took the original server offline. New CPU, new mobo, same goal — a self-hosted powerhouse running GPU passthrough, Nextcloud, Jellyfin, and a Windows 11 VM simultaneously.
topics:
  - home-lab
  - technology
themes:
  - systems-thinking
  - craftsmanship
related:
  - my-story-with-home-lab-and-proxmox
  - proxmox-ve
  - 13900k
  - msi-z690
tags:
  - proxmox
  - gpu-passthrough
  - virtualization
  - self-hosting
  - hardware
created: 2026-08-09
updated: 2026-09-22
---

The original home lab ran for a while without major incident. 64GB of RAM, a Proxmox VE hypervisor, Nextcloud, Jellyfin, a Windows 11 VM — the whole stack. It worked. Then it didn't.

## The Incident

During a RAM upgrade from 64GB to 128GB, the spring-tensioned Noctua NH-D15 cooler jolted during reseating and made contact with the LGA 1700 socket. Several pins bent. After the incident, only the A1 and B1 DIMM slots appeared functional. The system hasn't booted since.

That's the real home lab experience — not the clean documentation, but the moment a hardware surprise turns your self-hosted infrastructure into a very expensive brick. The lesson: never rush a spring-tensioned cooler installation, have an anti-static workspace, and always fully unseat the CPU cooler before touching RAM.

The bent-pin incident forced an upgrade that was already on the roadmap. The original plan was iterative. Now it's accelerated.

## What Was Running Before

The previous build, documented in full in [My Story With Home Labs & Proxmox VE](/articles/my-story-with-home-lab-and-proxmox/):

- **Nextcloud** — Self-hosted cloud storage accessible remotely over a secure login
- **Jellyfin** — Media server pointing at the Nextcloud storage pool
- **Ubuntu LTS / SOC VM** — An in-progress Security Operations Center instance for network monitoring
- **Windows 11 VM** — Running on Proxmox with the GPU not yet fully passed through

The Windows 11 setup worked but was constrained. Without onboard graphics, the 2080 Super was serving double duty: rendering Proxmox's own display output while also running the VM. Proper GPU passthrough requires the host to use something else for display, so the GPU can be completely handed off to the VM.

That's what this build solves.

## The Upgrade Plan

**New Components:**

| Part | Model | Price |
|------|-------|-------|
| CPU | Intel Core i9-13900K (24C, 8P+16E, LGA 1700, 125W, Intel UHD 770) | $653.72 |
| Motherboard | MSI MAG Z690 TOMAHAWK WIFI DDR4 LGA 1700 ATX | $838.01 |

The i9-13900K's **Intel UHD 770 integrated graphics** is the key unlock. With onboard graphics handling Proxmox's own display output, the NVIDIA RTX 2080 Super can be completely passed through to the Windows 11 VM using IOMMU. This is GPU passthrough done properly — the VM gets native hardware access, not a virtualized framebuffer.

**Carried Over:**

- **Power Supply:** EVGA G3 750W Gold — handles the 2080 Super + i9-13900K with room to spare at current load
- **GPU:** NVIDIA RTX 2080 Super — dedicated to the Windows 11 passthrough VM
- **RAM:** 128GB DDR4 3200 MHz — fully supported, filling all 4 DIMM slots on the Z690
- **CPU Cooler:** Noctua NH-D15 — LGA 1700 compatible, reinstalling with proper precautions this time
- **Case:** Corsair Carbide Series Air 540 High Airflow ATX Cube — excellent airflow layout for a high-wattage build

## What Will Run on the New Build

The services from the original build return, plus cleaner architecture:

- **Nextcloud** (LXC container, onboard graphics handles any HW transcoding)
- **Jellyfin** (LXC container, pointing at Nextcloud storage)
- **Windows 11 VM** (full GPU passthrough via 2080 Super — native gaming performance from a VM)
- **Ubuntu SOC VM** (network monitoring and security logging, continuing where it left off)

## Future Expansion Note

If I eventually move into running local LLMs at scale, multiple high-VRAM GPUs (like RTX 3060 12GB cards) would be the play — they pack dense VRAM per dollar. That configuration would push well beyond what a 750W supply can handle and would require a significant PSU upgrade before proceeding.

That's a future problem. For now, the 2080 Super stays and the focus is getting the core stack back online.
