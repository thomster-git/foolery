import re

with open('website/templates/layouts/dragonwilds-tracker.html', 'r') as f:
    content = f.read()

# 1. Update Tabs
content = content.replace(
    '<button class="dw-tab-btn" data-tab="stats" style="background: none; border: none; border-bottom: 3px solid transparent; color: var(--text-muted); font-size: 1rem; font-weight: bold; padding: 0.75rem 1.5rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;">📊 Stats Profile</button>',
    '<button class="dw-tab-btn" data-tab="stats" style="background: none; border: none; border-bottom: 3px solid transparent; color: var(--text-muted); font-size: 1rem; font-weight: bold; padding: 0.75rem 1.5rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;">📊 Stats Profile</button>\n            <button class="dw-tab-btn" data-tab="server" style="background: none; border: none; border-bottom: 3px solid transparent; color: var(--text-muted); font-size: 1rem; font-weight: bold; padding: 0.75rem 1.5rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;">🖥️ Server Hosting</button>'
)

# 2. Update Share Button to use Web Share API
old_share = '<a href="https://twitter.com/intent/tweet?text=Everything%20is%20connected.%20I%20found%20the%20pattern%20at%20Thoms%20Foolery.%20Can%20you%20see%20it%3F%20%F0%9F%91%81%EF%B8%8F%F0%9F%95%B8%EF%B8%8F&url=https://thomsfoolery.com/tools/dragonwilds-tracker.html" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 0.4rem 0.8rem; font-size: 0.85rem; font-family: monospace; background: rgba(168, 85, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple); border-radius: 4px; text-decoration: none; transition: all 0.2s; margin-right: 0.5rem;" onmouseover="this.style.background=\'var(--accent-purple)\'; this.style.color=\'white\';" onmouseout="this.style.background=\'rgba(168, 85, 247, 0.1)\'; this.style.color=\'var(--accent-purple)\';">[ Transmit Findings ]</a>'
new_share = '<button class="share-btn" data-title="Runescape: Dragonwilds Progression Guide" data-text="Everything is connected. I found the pattern at Thoms Foolery. Can you see it? 👁️🕷️" data-url="https://thomsfoolery.com/tools/dragonwilds-tracker.html" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem; font-family: monospace; background: rgba(168, 85, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple); border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-right: 0.5rem;" onmouseover="this.style.background=\'var(--accent-purple)\'; this.style.color=\'white\';" onmouseout="this.style.background=\'rgba(168, 85, 247, 0.1)\'; this.style.color=\'var(--accent-purple)\';"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Guide</button>'
content = content.replace(old_share, new_share)

# 3. Chapter 3 Add Gear
chapter3 = """            <h2>Chapter 3: Fractured Plains</h2>
            <p>This is where the old guide breaks. With the Smithing Anvil removed, you now use the updated crafting benches to process your metals.</p>
            <ul>
                <li class="task-item"><label for="dw-check-21"><input type="checkbox" id="dw-check-21" class="ffx-checkbox"> <span class="task-text"><strong>1. Establish a Foothold:</strong> Scout the plains for Copper and Tin deposits, and build a Lodestone nearby.</span></label></li>
                <li class="task-item"><label for="dw-check-22"><input type="checkbox" id="dw-check-22" class="ffx-checkbox"> <span class="task-text"><strong>2. Smelt Bronze Bars:</strong> The Smithing Anvil replacement step. Use your Furnace to smelt Bronze Bars. Instead of a Smithing Anvil, use these bars to construct/upgrade your primary Metalworking Station/Workbench to unlock bronze-tier recipes.</span></label></li>
                <li class="task-item"><label for="dw-check-gear-set-2"><input type="checkbox" id="dw-check-gear-set-2" class="ffx-checkbox"> <span class="task-text"><strong>3. Craft Gear Set 2:</strong> Use your Armour Bench to craft the Bronze helmet, platebody, and platelegs. (Hybrid Strategy: Swap the helmet for the Wizard hat).</span></label></li>
                <li class="task-item"><label for="dw-check-23"><input type="checkbox" id="dw-check-23" class="ffx-checkbox"> <span class="task-text"><strong>4. Farm Anima Infused Bark:</strong> Harvest this from the Anima Trees located near the center of the Fractured Plains.</span></label></li>"""
content = re.sub(r'            <h2>Chapter 3: Fractured Plains</h2>.*?<li class="task-item"><label for="dw-check-23">', chapter3, content, flags=re.DOTALL)

# 4. Merge Chapter 4 and 5, add New Chapter 5
old_chapters_4_5 = re.search(r'            <h2>Chapter 4: Bloodblight Swamp</h2>.*?<hr>\s*<h2>Finale: General Velgar</h2>', content, flags=re.DOTALL).group(0)

new_chapters_4_5 = """            <h2>Chapter 4: Bloodblight Swamp & Stormtouched Highlands</h2>
            <ul>
                <li class="task-item"><label for="dw-check-29"><input type="checkbox" id="dw-check-29" class="ffx-checkbox"> <span class="task-text"><strong>1. Brew Weak Antipoison Potions:</strong> Requires Chapter 2 forage. Combine Harralander, Bittercap Mushrooms, and Clay Vessels to create Antipoison. Do not enter the deep swamp without this.</span></label></li>
                <li class="task-item"><label for="dw-check-30"><input type="checkbox" id="dw-check-30" class="ffx-checkbox"> <span class="task-text"><strong>2. Craft the Anti-Dragon Shield:</strong> Requires 12 Blightwood. Set up a Lodestone. Harvest at least 12 Blightwood from the local trees to craft the shield using the recipe you unlocked in Chapter 2.</span></label></li>
            </ul>
            <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <strong>⚠️ Safe spotting tactic:</strong> Camp on top of the nearby ruins where the demon's melee attacks can't reach you.
            </div>
            <ul>
                <li class="task-item"><label for="dw-check-31"><input type="checkbox" id="dw-check-31" class="ffx-checkbox"> <span class="task-text"><strong>3. Hunt the Abyssal Demon:</strong> Defeat it to obtain an Abyssal Spine.</span></label></li>
                <li class="task-item"><label for="dw-check-32"><input type="checkbox" id="dw-check-32" class="ffx-checkbox"> <span class="task-text"><strong>4. Gather Snapdragon:</strong> Harvest this herb to unlock and brew stronger Healing Potions.</span></label></li>
                <li class="task-item"><label for="dw-check-33"><input type="checkbox" id="dw-check-33" class="ffx-checkbox"> <span class="task-text"><strong>5. Harvest Bloodwood Sap:</strong> For the Challenge Horn. Head southeast, clear the Garou camp, and extract Bloodwood Sap from the massive tree in the center of the camp.</span></label></li>
                <li class="task-item"><label for="dw-check-34"><input type="checkbox" id="dw-check-34" class="ffx-checkbox"> <span class="task-text"><strong>6. Raid the Bloodblight Swamp Vault:</strong> Clear the vault for more Vault Shards and Vault Cores.</span></label></li>
                <li class="task-item"><label for="dw-check-35"><input type="checkbox" id="dw-check-35" class="ffx-checkbox"> <span class="task-text"><strong>7. Establish the Final Outpost:</strong> Navigate to the Highlands and build a Lodestone near the Iron Ore deposits.</span></label></li>
                <li class="task-item"><label for="dw-check-36"><input type="checkbox" id="dw-check-36" class="ffx-checkbox"> <span class="task-text"><strong>8. Build the Loom Harness:</strong> Prerequisite for Iron Armor. Mine Iron Ore, smelt Iron Bars, and use them to construct the Loom Harness upgrade at your camp.</span></label></li>
                <li class="task-item"><label for="dw-check-37"><input type="checkbox" id="dw-check-37" class="ffx-checkbox"> <span class="task-text"><strong>9. Craft the Iron Armor Set (Optional):</strong> Requires the Loom Harness. Combine 20 Iron Bars, 6 Padded Cloth, 14 Hard Leather (from the Tanner's Kit), and 6 Vault Shards to craft your endgame armor.</span></label></li>
                <li class="task-item"><label for="dw-check-38"><input type="checkbox" id="dw-check-38" class="ffx-checkbox"> <span class="task-text"><strong>10. Craft the Abyssal Whip:</strong> The ultimate melee weapon. Combine 12 Vault Shards, 1 Vault Core, 8 Hard Leather, your Abyssal Spine (from Chapter 4), and 4 Ram Horns (hunted from Rams in the Highlands).</span></label></li>
                <li class="task-item"><label for="dw-check-39"><input type="checkbox" id="dw-check-39" class="ffx-checkbox"> <span class="task-text"><strong>11. Upgrade to Iron Tools:</strong> Craft the Iron Pickaxe and Iron Logging Axe.</span></label></li>
                <li class="task-item"><label for="dw-check-40"><input type="checkbox" id="dw-check-40" class="ffx-checkbox"> <span class="task-text"><strong>12. Brew Attack Potions:</strong> Requires Granite. Mine Granite in the Highlands to brew at least 10 Attack Potions for the final boss.</span></label></li>
                <li class="task-item"><label for="dw-check-41"><input type="checkbox" id="dw-check-41" class="ffx-checkbox"> <span class="task-text"><strong>13. Mine the Dragon Tooth:</strong> For the Challenge Horn. Head to the southwestern part of the Highlands and mine the giant dragon skull to extract a Dragon Tooth.</span></label></li>
            </ul>

            <hr>

            <h2>Chapter 5: The Northern Expanse</h2>
            <p>Heading into the next area north by continuing the main quest line. This is where you prepare for mid-to-late game grinding.</p>
            <ul>
                <li class="task-item"><label for="dw-check-gear-set-3"><input type="checkbox" id="dw-check-gear-set-3" class="ffx-checkbox"> <span class="task-text"><strong>1. Craft Gear Set 3:</strong> Use your Armour Bench to craft the Iron/Paladin's platebody and platelegs. (Hybrid Strategy: Swap the helmet for the Dark mage hood or Dragonkin mage hood).</span></label></li>
                <li class="task-item"><label for="dw-check-mount"><input type="checkbox" id="dw-check-mount" class="ffx-checkbox"> <span class="task-text"><strong>2. Obtain Your Mount:</strong> Complete the local quest line to acquire your first ridable mount, greatly improving overland travel speed.</span></label></li>
                <li class="task-item"><label for="dw-check-gear-set-4"><input type="checkbox" id="dw-check-gear-set-4" class="ffx-checkbox"> <span class="task-text"><strong>3. Grind towards Gear Set 4:</strong> Upgrade to the Steel/Fallen Hoplite's armour. (Hybrid Strategy: Swap the helmet for the Splitbark helm or Necromancer's crown).</span></label></li>
            </ul>

            <hr>

            <h2>Finale: General Velgar</h2>"""
content = content.replace(old_chapters_4_5, new_chapters_4_5)

# 5. Add Server Hosting Tab Content
server_html = """        <!-- Tab: Server Hosting -->
        <div id="dw-tab-server" class="dw-tab-panel" style="display: none;">
            <h2 style="color: var(--accent-cyan); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Dedicated Server Hosting Guide</h2>
            <p style="color: var(--text-muted); margin-bottom: 1.5rem;">The complete guide to hosting your own dedicated Dragonwilds server, setting up mods, and configuring admin permissions.</p>

            <div class="lock-screen" id="paywall-server-guide">
              <div class="paywall-badge">🔒 Premium Content</div>
              <h3>Unlock the Server Guide</h3>
              <p style="color: var(--text-dim); font-size: 0.9rem;">Pay what you want (or get it for free). Just enter your email to access the full hosting guide.</p>
              <div style="margin: 1rem 0;">
                <input type="email" id="email-input" placeholder="Your Email Address" style="width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-main);" />
              </div>
              <div style="margin: 1rem 0;">
                <input type="number" id="price-input" placeholder="$0.00" min="0" step="1" style="width: 100%; padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.2); color: var(--text-main);" />
              </div>
              <button class="btn btn-primary" style="width: 100%; justify-content: center;" onclick="alert('Thanks for your support! Check your email for the unlock link.')">Unlock Guide</button>
            </div>
            
        </div>
        <!-- End Server Tab -->
"""
content = content.replace('        <!-- End Stats Tab -->', '        <!-- End Stats Tab -->\n\n' + server_html)

# 6. Update Stats Profile Generator JS
old_js = """        const skillMeta = [
            { id: 'attack', icon: '⚔️', name: 'Attack' },
            { id: 'magic', icon: '🔮', name: 'Magic' },
            { id: 'ranged', icon: '🏹', name: 'Ranged' },
            { id: 'mining', icon: '⛏️', name: 'Mining' },
            { id: 'woodcutting', icon: '🪓', name: 'Woodcutting' },
            { id: 'artisan', icon: '🔨', name: 'Artisan' },
            { id: 'construction', icon: '🏗️', name: 'Construction' },
            { id: 'cooking', icon: '🍳', name: 'Cooking' },
            { id: 'runecrafting', icon: '🪨', name: 'Runecrafting' },
            { id: 'farming', icon: '🌾', name: 'Farming' },
            { id: 'fishing', icon: '🎣', name: 'Fishing' },
            { id: 'agility', icon: '🏃', name: 'Agility' }
        ];

        let savedStats = {};"""

new_js = """        const skillMeta = [
            { id: 'attack', iconUrl: '/images/skills/Attack.png', name: 'Attack' },
            { id: 'magic', iconUrl: '/images/skills/Magic.png', name: 'Magic' },
            { id: 'ranged', iconUrl: '/images/skills/Ranged.png', name: 'Ranged' },
            { id: 'mining', iconUrl: '/images/skills/Mining.png', name: 'Mining' },
            { id: 'woodcutting', iconUrl: '/images/skills/Woodcutting.png', name: 'Woodcutting' },
            { id: 'artisan', iconUrl: '/images/skills/Artisan.png', name: 'Artisan' },
            { id: 'construction', iconUrl: '/images/skills/Construction.png', name: 'Construction' },
            { id: 'cooking', iconUrl: '/images/skills/Cooking.png', name: 'Cooking' },
            { id: 'runecrafting', iconUrl: '/images/skills/Runecrafting.png', name: 'Runecrafting' },
            { id: 'farming', iconUrl: '/images/skills/Farming.png', name: 'Farming' },
            { id: 'fishing', iconUrl: '/images/skills/Fishing.png', name: 'Fishing' },
            { id: 'agility', iconUrl: '/images/skills/Agility.png', name: 'Agility' }
        ];

        let imagesLoaded = 0;
        skillMeta.forEach(skill => {
            const img = new Image();
            img.src = skill.iconUrl;
            img.onload = () => {
                skill.img = img;
                imagesLoaded++;
                if (imagesLoaded === skillMeta.length) {
                    drawProfile();
                }
            };
        });

        let savedStats = {};"""
content = content.replace(old_js, new_js)

old_draw = """                // Draw icon & name
                ctx.font = '16px "Segoe UI Emoji", sans-serif';
                ctx.fillText(skill.icon, x + 10, y + 2);
                
                // Draw level"""
new_draw = """                // Draw icon
                if (skill.img) {
                    ctx.drawImage(skill.img, x + 5, y - 12, 24, 24);
                } else {
                    ctx.font = '16px "Segoe UI Emoji", sans-serif';
                    ctx.fillText('❓', x + 10, y + 2);
                }
                
                // Draw level"""
content = content.replace(old_draw, new_draw)


# 7. Add Web Share API JS
share_js = """        // Share logic
        const shareBtns = document.querySelectorAll('.share-btn');
        shareBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const title = btn.dataset.title;
                const text = btn.dataset.text;
                const url = btn.dataset.url;
                if (navigator.share) {
                    try {
                        await navigator.share({ title, text, url });
                    } catch (err) {
                        console.error('Error sharing', err);
                    }
                } else {
                    // Fallback
                    navigator.clipboard.writeText(url).then(() => {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = "Copied link!";
                        setTimeout(() => btn.innerHTML = originalText, 2000);
                    });
                }
            });
        });
"""
content = content.replace('updateProgress();\n        drawProfile();\n    }', 'updateProgress();\n        drawProfile();\n\n' + share_js + '    }')

with open('website/templates/layouts/dragonwilds-tracker.html', 'w') as f:
    f.write(content)

