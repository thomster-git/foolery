---
id: my-story-with-the-msp-trap-and-broken-infrastructure
title: The MSP Trap: Inheriting Broken IT Infrastructure
type: article
access: paid
status: published
author: Jonathan Thoms
summary: How I went from a mechanical engineering grad to the sole person managing industrial IT at a fluorspar mine — exposing MSP incompetence, broken firewalls, and the reality of undocumented infrastructure.
topics:
  - technology
themes:
  - systems-thinking
related:
  - sensible-infrastructure-and-white-box-servers
  - my-story-with-mechanical-engineering-and-systems-thinking
  - canada-fluorspar
tags:
  - it-coordination
  - msp
  - mining
  - networking
created: 2026-09-14
updated: 2026-08-24
connections:
  - my-story-with-cfi
  - my-story-with-keel-systems-and-honest-kpis
  - my-story-with-the-nicu-and-corporate-coldness
---

I joined Canada Fluorspar Inc. (CFI) as an IT Technician with a mandate that sounded straightforward on paper: handle tier-1 helpdesk requests and serve as the on-site physical liaison for our Managed Service Provider (MSP).

But my actual technical background wasn't built in a classroom. I had been **chronically online since 2002** — learning to install torrents and clean infections off my own machine before anyone taught me how, hosting LAN parties, building my first PC with a friend's help and spec'ing my second completely solo. I had that specific kind of IT literacy that only comes from years of breaking things and fixing them yourself.

This wasn't a Mechanical Engineering curriculum. It was self-taught digital survival. And it didn't take long to see what was happening with our MSP.

## The MSP Problem: Being Taken for a Ride

The stories accumulated fast. Aging company laptops were declared "no longer useful" by the MSP — and they graciously offered to "take them off our hands." Whether those laptops were wiped and resold, I can't say for certain. But I know we never saw a dime.

The bigger crisis was a **firewall rule** they had quietly configured. Whenever any machine on the network attempted to download a Windows update, the rule triggered and throttled the **entire company's internet connection to a crawl**. This also blocked certain Microsoft programs from installing entirely.

Employees were filing ticket after ticket about slowdowns. The MSP's tier-1 techs would work the problem for hours, charge for every minute, never escalate, and never fix it. **The root cause was their own misconfiguration and they never diagnosed it.** Eventually I traced it back to a Vision 33 firewall rule. We flagged it, fixed it, and watched months of unexplained slowdowns disappear overnight.

That was the moment I realized: if you don't have someone in the room who understands even the basics of IT, managed service providers can operate indefinitely without accountability. The relationship is designed to create dependency, not competence.

## The Inherited Infrastructure

The site I walked into was a documentation nightmare. Switch racks installed backwards, radio repeaters with no paper trail, lockboxes whose keys no one could locate, eight departments across a mine site with no centralized cable management or network diagram.

![IT Equipment - Messy Rack 1](/images/articles/PXL_20240819_124948894.jpg)
*One of the chaotic server racks I inherited.*

![IT Equipment - Messy Rack 2](/images/articles/PXL_20240821_141934105.jpg)
*More undocumented network infrastructure.*

I want to be transparent here: **I didn't fix most of it.** Not because I didn't know what needed to be done, but because I was never given the proper support, budget, or staffing to do it. This is a reality that rarely gets discussed in IT war stories — sometimes the chaos persists not from a lack of skill or will, but from a lack of organizational backing.

That frustration became a lesson in itself: **documentation and infrastructure investment are not IT problems, they're organizational leadership problems.** If the person at the top doesn't see it as a priority, the person at the keyboard can't unilaterally fix it.

## What I Learned

**On MSPs**: If you're a small or mid-sized organization signing an MSP contract, you need at minimum one internal person who understands IT well enough to audit what the MSP is doing. A helpdesk ticket that keeps getting reopened and billed for is a red flag. An MSP that "takes old hardware off your hands" with no formal inventory is a red flag. Escalation resistance is a red flag. The relationship should build your internal capability, not replace it with dependency.

**On organizational honesty**: I was given a role without the resources to do it properly. The infrastructure I inherited should have had years of investment behind it. None of that was on me — but the consequences landed on me anyway. That's a KPI problem at the leadership level, and it's one I'll carry forward into everything I build next with Keel Systems.
