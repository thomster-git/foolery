---
id: systems-thinking
title: Systems Thinking
type: theme
status: active
summary: Understanding complex structures by analyzing how their constituent parts interact as a whole.
tags:
  - architecture
  - engineering
  - complexity
topics:
  - technology
  - audhd
related:
  - audhd-and-systems-thinking
  - my-story-with-mechanical-engineering-and-systems-thinking
  - my-story-with-keel-systems-and-honest-kpis
  - my-story-with-the-msp-trap-and-broken-infrastructure
---

Mechanical Engineering taught me something that I keep applying in contexts it was never explicitly meant for: you have to account for failure at the foundation before you build anything on top of it. Load paths, failure modes, tolerances — these aren't afterthoughts you bolt on at the end, they're embedded in the design from the first sketch. When I moved into IT work, I found that almost nobody was thinking this way. Infrastructure had been assembled piece by piece as needs arose, with no one ever asking what happens when the worst-case scenario hits the oldest, most load-bearing part. The ransomware attack confirmed what I already suspected: the attack surface wasn't the result of negligence, it was the result of never modeling the system as a whole.

On one MSP audit, I found a misconfigured firewall that had been quietly throttling traffic for long enough that the client had adjusted their entire workflow around the slowness. Nobody had diagnosed it because nobody was looking at the system — they were looking at the symptoms and patching around them. That's the failure mode that systems thinking is specifically designed to catch. When you understand how the parts relate to each other, slowness in one place stops being a mystery and starts being a signal you can trace back to a source. Keel Systems is built around exactly this principle: honest KPIs derived from actually understanding the infrastructure, not dashboards that make things look healthy while something corrodes underneath.

The core manifesto behind everything I build is that everything is connected. That isn't mysticism — it's an engineering observation. The decisions you made about backup architecture three years ago determine whether your company survives a ransomware event today. The way you configure a firewall in month two of an engagement shapes the performance complaints you'll be fielding in year three. The knowledge graph at the center of this project is a literal attempt to make those connections visible: not to impose order on complexity, but to acknowledge that the complexity was always there, and that seeing it clearly is the first step toward working with it honestly.
