---
stage: "full"
id: audhd-and-systems-thinking
type: article
status: draft
created: 2026-09-14
updated: 2026-11-20
title: "AuDHD and Systems Thinking: Why Friction in a System Is Impossible to Ignore"
date: "2026-09-14"
author: "Jonathan Thoms"
tags:
  - neurodiversity
  - audhd
  - infrastructure
  - systems-thinking
summary: "Why I can't walk past a 100 Mbps switch choking a gigabit line or an undocumented server closet—and the real trade-offs of wiring and debugging infrastructure with an AuDHD brain."
topics:
  - audhd
  - technology
themes:
  - systems-thinking
  - identity
related:
  - keel-systems
  - my-story-with-the-akira-ransomware-attack
  - my-story-with-the-msp-trap-and-broken-infrastructure
  - my-story-with-neurodiversity-and-adult-diagnosis
  - my-story-with-mechanical-engineering-and-systems-thinking
---

If you spend enough time crawling into small-business network closets, you notice how much infrastructure runs on habit. Someone buys the expensive brand-name server because that was on last year's quote. Nobody touches the tangled patch panel because it hasn't caught fire yet. People live with a sluggish network for three years because *"that's just how the building is."*

Living with AuDHD (Autism and ADHD) means my brain doesn't filter out that background friction. I wouldn't call it a "superpower"—because the exact same wiring that lets me trace a network fault for fourteen hours straight also makes performative meetings exhausting and leaves me unable to ignore an unlabelled cable run until it is fixed. It is a specific set of trade-offs.

<div class="photo-slot">
[Photo slot: /images/articles/labelled-patch-panel-before-after.jpg — Close-up of a re-terminated, labelled patch panel next to an old 10/100 Mbps bottleneck switch pulled from a client closet]
</div>

## The 100 Mbps Switch on a Gigabit Line

A good example of how that attention works happened when I was auditing a site that was paying for a full gigabit internet circuit, yet staff complained every afternoon that large file transfers crawled.

For years, people had worked around it. When I physically traced the uplink cable from the ISP handoff into the rack before touching a single software setting, I found the culprit in three minutes: an old, unlabelled 10/100 Mbps Fast Ethernet desktop switch tucked behind a patch shelf that someone had used as a pass-through years earlier. The entire office was being throttled to 94 Mbps by a twenty-dollar plastic box that nobody had bothered to trace from end to end.

Most people can tune out a messy closet if the internet light is blinking green. To me, an undocumented dependency feels like a pebble inside a boot—I have to trace every wire, label both ends, and draw the topology map before my head can let it rest.

## Asking "Why Are We Paying for That?"

The same instinct applies to vendor quotes and workplace rules that only exist because *"that's how we've always done it."*

When an MSP tells a small company with eight virtual machines that they need an $80,000 dual-socket server stack and full bare-metal commercial hypervisor subscriptions, my first question is always: *what is the actual workload?* If a single-socket white-box server running Proxmox VE and a shelf of local warm spares does the job faster and saves $46,000, the brand sticker on the front bezel doesn't matter.

Working this way comes with real costs—you have to manage sensory load, guard against burnout after long crisis sprints, and translate direct technical observations carefully in rooms that prefer polite corporate ambiguity. But when a system is broken and nobody can explain how the pieces actually connect, having a brain that refuses to take the brochure's word for it is the best tool I have.
