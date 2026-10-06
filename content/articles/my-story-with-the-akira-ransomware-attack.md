---
id: my-story-with-the-akira-ransomware-attack
title: Surviving the Akira Ransomware Attack & Autistic Meltdown
type: article
access: paid
status: published
author: Jonathan Thoms
summary: How I became the sole person standing between a ransomware gang and a fluorspar mine's complete operational collapse — and how the pressure triggered a massive Autistic Meltdown.
topics:
  - technology
  - audhd
themes:
  - resilience

related:
  - my-story-with-the-msp-trap-and-broken-infrastructure
  - my-story-with-autistic-burnout-and-sensory-regulation
tags:
  - ransomware
  - cybersecurity
  - meltdown
  - mining
created: 2026-09-14
updated: 2026-08-24
connections:
  - my-story-with-the-7-year-waitlist
  - my-story-with-autistic-burnout-and-sensory-regulation
  - leaving-cfi
---

I woke up on the morning of April 10, 2025, with a plan. We'd received a full server audit report that week at the mine where I worked as IT Coordinator, and I was going to spend the day working through the remediation checklist.

Instead, my phone was blowing up.

**Hundreds of Microsoft Defender alerts — in the span of minutes.** The kind of volume that isn't a false positive. Something had already happened.

I drove in and found the site in silence. No internet. When I reached the server room and checked the domain controllers and file servers, the reality hit: **the drives had been encrypted**. Akira ransomware had been inside the network, likely for some time, and had executed its payload overnight.

### What Saved Us

One thing, and one thing only: **our Datto backup appliance was untouched.**

Akira had encrypted the primary infrastructure but had not reached the backup device. That isolated, immutable backup became the foundation of the entire recovery.

### The Two-Week Recovery

Our incoming security firm flew in immediately to assist. The recovery process:

1. **Firewall deployment**: The new firewalls we had already ordered were configured and deployed on-site.
2. **Datto restoration**: Bare-metal restores were initiated from the backup appliance, prioritizing critical servers.
3. **Forensic imaging**: I took forensic disk fingerprints of every affected workstation for criminal examination and evidence preservation.
4. **Full machine reimaging**: Every employee workstation was wiped and given a clean Windows 11 image from scratch.

We were back up and running within **two weeks**. For an organization of that scale, that's a genuinely fast recovery — entirely because of the backup infrastructure.

### The Part Nobody Talks About: User Behavior

During the recovery, I issued explicit, site-wide instructions: **do not boot your work device, do not connect to the network until cleared.**

Multiple employees ignored this.

Booting an encrypted or compromised machine doesn't just risk your own data — it **destroys forensic log files** that investigators need to trace the attack vector, understand dwell time, and potentially identify the threat actor. It also risks re-introducing compromised endpoints back onto a network in recovery.

I will never forget discovering that people had done this. It was the clearest possible illustration of why security culture is not a technology problem. It is a human behavior problem. And no firewall or endpoint agent fixes willful disregard of instructions during an active incident.

### The Owner's "Joke"

Second-hand, I heard that the mine's owner had made a joke that I should be locked in my office with food shoved through a slot like a prisoner until the servers were restored.

I understand the pressure that comes from business-critical systems going down. But this illustrated a systemic attitude problem: IT is often treated as invisible maintenance until something breaks, at which point the person doing the work becomes a scapegoat rather than a professional managing a complex crisis. I was a team of one, no budget, inheriting years of deferred infrastructure investment, during a sophisticated ransomware attack.

### The Monday After & The Meltdown

The following Monday, my fiancée was severely ill with a gastro bug and I couldn't leave her home alone. I couldn't go into work. I couldn't make progress on the recovery.

The combination of that — being physically unable to do the one thing my nervous system was screaming at me to do — with the sustained high-stakes pressure of the entire recovery, and the absence of any organizational empathy, triggered one of the worst **Autistic Meltdowns** I've experienced as an adult.

Not a tantrum. Not frustration. A full neurological shutdown under pressure that I couldn't regulate or prevent with willpower.

That meltdown taught me something important: I had been operating without supports, without accommodations, without anyone around me even knowing I was autistic. And that's an unsustainable situation in a high-stakes environment.

### What I Learned

**On backups**: One immutable, offline or segmented backup device is worth more than any enterprise security suite. Akira didn't get our Datto. That one fact is the reason CFI survived. The rule is simple: **3-2-1 backup minimum, and test your restores before you need them.**

**On people**: Security culture is not an IT project. It's a human behavior project. Policies without accountability mean nothing. If your incident response plan doesn't account for the fact that some employees will ignore instructions during a crisis, your incident response plan is incomplete.
