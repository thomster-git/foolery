---
stage: "full"
id: my-story-with-the-msp-trap-and-broken-infrastructure
title: "My Story with the MSP Trap and Broken Infrastructure"
type: article
status: draft
created: 2026-10-10
updated: 2026-11-20
summary: "What happens when a small business hands the keys to an absentee Managed Service Provider—and what I found when I started physically tracing the cables in the server closet."
topics:
  - technology
themes:
  - systems-thinking
  - resilience
tags:
  - msp
  - infrastructure
  - technical-debt
  - cybersecurity
  - keel-systems
related:
  - my-story-with-the-akira-ransomware-attack
  - sensible-infrastructure-and-white-box-servers
  - keel-systems
  - manifesto
---

The first thing I did when I started as an IT technician at a remote industrial site wasn't logging into a cloud dashboard. It was opening the server closet door with a label maker and a notepad to figure out where the cables actually went.

There was no current network diagram. The incumbent Managed Service Provider (MSP) had been billing a monthly retainer for years, yet nobody on site could tell you which switch port fed which building, why dozens of old administrator accounts were still active in Active Directory, or why laptops were being billed at a $500 markup per unit with five-thousand-dollar setup fees tacked onto the invoice.

<div class="photo-slot">
[Photo slot: /images/articles/msp-unlabelled-closet-before-after.jpg — Unlabelled patch cables and legacy hardware in the closet before tracing and re-terminating]
</div>

## How the Retainer Trap Works

Most small and mid-sized businesses don't hire an MSP because they want vendor lock-in; they hire one because they don't have a full-time systems person in-house and want someone to call when email stops working.

The problem starts when the provider realizes that clean, simple, well-documented infrastructure doesn't generate billable project hours. Over time, temporary workarounds become permanent. Rules get added to firewalls without removing the old ones. Admin accounts created for a weekend migration five years ago never get disabled. And when a hardware refresh comes due, the quote that lands on your desk is an $80,000 stack of proprietary hardware and per-core licensing that nobody on site is allowed to touch.

## Taking the Keys Back

Untangling that environment meant doing the unglamorous work first: physically tracing every copper and fiber run to draw the first accurate network map the site had seen in years, bringing laptop procurement and imaging in-house, exiting the old provider, and working with a local partner who actually respected documentation.

If you don't hold your own admin credentials, an up-to-date topology map, and an offline backup appliance you can test yourself, you aren't outsourcing your IT—you're renting your own company back by the month.
