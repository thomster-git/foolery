---
status: "published"
id: sensible-infrastructure-and-white-box-servers
title: White-Box Servers & Sensible Infrastructure
description: Why I planned a $34,000 custom server build for a remote mine site instead of spending $80,000 on enterprise hardware.
summary: Why I planned a $34,000 custom server build for a remote mine site instead of spending $80,000 on enterprise hardware.
author: Jonathan Thoms
created: 2026-09-14
type: article
access: paid
topics:
  - technology
- self-hosting
- home-lab
themes:
  - systems-thinking
tags:
  - servers
  - proxmox
  - mining
  - cost-savings
- proxmox
- servers
- infrastructure
- networking
- canada-fluorspar
related:
  - canada-fluorspar
  - my-story-with-the-msp-trap-and-broken-infrastructure
  - my-story-with-the-msp-trap-and-broken-infrastructure
---
When I was working at Canada Fluorspar—a remote mining operation in St. Lawrence—I faced a massive learning curve. The server room was a black box to me, so I did what any systems thinker would do: I started mapping it. I created a comprehensive network diagram to figure out what each piece of equipment was for, how data flowed, and what the heck a "server" actually was in practice. 

We were running an environment of Microsoft 2021 servers. After a comprehensive IT audit, the verdict was clear: we were in desperate need of new infrastructure. 

The plan handed to me by our Managed Service Provider (MSP) was to migrate to Microsoft 2026 perpetual license servers. If you've looked at enterprise licensing recently, you know that you pay by the processor core. The prices were sky-high, and as a company, we weren't generating the capital to justify it. 

I needed to explore other options.

## The White-Box Revelation

Around this time, I was diving deep into Linux and hypervisors. I discovered Proxmox Virtual Environment (PVE) and realized the free tier offered essentially the same core functionality as paid enterprise hypervisors. I also realized a hard truth about the enterprise hardware market: prebuilt servers are extraordinarily expensive for the amount of compute power you actually get. 

I had already turned my home PC into a PVE node, so I knew that a "server" could literally just be standard PC components in a tower if designed correctly. 

So, I designed one for the mine. 

With carefully selected parts, I mapped out a server build that would have cost $80,000 if bought prebuilt from a major vendor. My white-box design? **$34,000**. That price tag included my own labor to assemble it, *and* a complete inventory of critical spare parts kept on-site.

My design featured two GPUs:
1. One dedicated to the heavy lifting required by the mining department's specialized software.
2. The second dedicated to running a localized AI model. (Our in-house lawyer admitted to putting sensitive company information into ChatGPT because it was so useful. A local AI would allow everyone to use LLMs with zero data-privacy risks—a huge win for due diligence).

Instead of massive Windows virtual environments, I planned to use Proxmox as the base hypervisor, allowing me to use much cheaper tiers of Microsoft 2026 for the specific applications that couldn't be containerized or shared via a terminal session.

## Why Independence Matters in Remote Environments

The cost savings were obvious:
*   **Capital Savings:** ~$46,000 saved on hardware.
*   **License Savings:** Avoiding the massive MS perpetual core-license trap.
*   **Accountability:** Bringing AI in-house for legal and data security.

But the biggest reason I championed the white-box approach wasn't just financial. It was logistical.

When you operate a remote mining location, you are at the mercy of geography. The turnaround time for enterprise repairs or dispatching remote help is agonizingly slow. We were constantly bottlenecked by airplane schedules, driving times, and vendor availability. 

Building the hardware in-house meant we were completely independent. Because we had the critical spares on the shelf and built the machine ourselves, if a stick of RAM died or a power supply failed, we could swap it in 15 minutes. No support tickets. No waiting for flights. 

## The F250 vs. The Toyota Yaris

Unfortunately, sensible infrastructure is a hard sell to corporate layers that prefer brand-name safety nets over practical solutions. 

Before I left the company, I had another battle regarding our Sage 300 software. We found a great deal with a company specializing in virtual cloud hosting for Sage. It was the perfect solution. The parent company put a hard stop to it, dictating instead that we use an old 2016 Windows Server they had. It wasn't a suitable replacement in any capacity. 

I used this analogy at the time: We asked for a Ford F250 to haul heavy equipment, and corporate asked, *"Why can't you just use this Toyota Yaris?"*

It was the same mentality that led to our domain controller fans screaming off the charts during the summer. I fought endlessly to get a requisition approved to install a simple heat pump in the server room. It never got approved, despite the catastrophic risk of our domain controller melting down. 

These experiences cemented my IT philosophy. I don't care about the badge on the front of the server rack. I care about what works, what can be fixed locally at 2 AM on a Sunday, and what actually solves the problem without bankrupting the department.
