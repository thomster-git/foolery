import re

filepath = "/home/keel/Project-Atlas-main/website/templates/layouts/tools.html"
with open(filepath, 'r') as f:
    content = f.read()

# Replace <div style="... position: relative; overflow: hidden;"> with <div style="... position: relative; overflow: hidden; display: flex; flex-direction: column;">
# And add flex-grow: 1 to the <p> tags inside.
content = content.replace('overflow: hidden;">', 'overflow: hidden; display: flex; flex-direction: column;">')
content = content.replace('height: 100%;">', 'height: 100%; display: flex; flex-direction: column;">')
content = content.replace('line-height: 1.5;">', 'line-height: 1.5; flex-grow: 1;">')

# For each </a>, we inject the link before it if it's not already there.
# It's easier to just do a regex replace on the <p> tag closing.
def inject_link(match):
    return match.group(0) + '\n                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.9rem; color: var(--accent-cyan); font-weight: 600;">Read Project Writeup &rarr;</div>'

# Only do it for cards that don't have it yet
content = re.sub(r'(<p style="color: var\(--text-muted\); line-height: 1.5; flex-grow: 1;">.*?</p>)(?!\s*<div style="margin-top: 1.5rem;)', inject_link, content, flags=re.DOTALL)

# But wait, not all tools have a writeup. 
# Writeups exist for: baseball-trend-analyzer, discord-ai-bot, etchcentric-creations, battery-dispenser, keel-systems, next-gen-proxmox-home-lab, personal-digital-garden-creator, project-atlas, ocarina-practice-tool
# Skill Building, RS Bond Tracker, FFX 100% Tracker, Blue Jays Wild Card DO NOT have writeups right now in content/projects!
# Okay, let me write a script that specifically targets the ones with writeups.
