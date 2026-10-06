import re

with open('website/templates/layouts/ffx-tracker.html', 'r') as f:
    content = f.read()

# 1. Remove CHAPTER 1 and rename CHAPTER 2
content = re.sub(
    r'<h2>CHAPTER 1: CRITICAL WARNINGS & PERMANENT MISSABLES</h2>.*?<h2>CHAPTER 2: CHRONOLOGICAL STORY WALKTHROUGH & CHECKLIST</h2>',
    r'<h2>CHAPTER 1: CHRONOLOGICAL STORY WALKTHROUGH & CHECKLIST</h2>',
    content,
    flags=re.DOTALL
)

# 2. Rename Chapter 3 and 4
content = content.replace('<h2>CHAPTER 3: AIRSHIP ERA & SECRET DISCOVERIES</h2>', '<h2>CHAPTER 2: AIRSHIP ERA & SECRET DISCOVERIES</h2>')
content = content.replace('<h2>CHAPTER 4: ALL 7 CELESTIAL WEAPONS & UPGRADES</h2>', '<h2>CHAPTER 3: ALL 7 CELESTIAL WEAPONS & UPGRADES</h2>')

# Helper to inject after a specific line
def inject_after(target, injection):
    global content
    content = content.replace(target, target + '\n' + injection)

def inject_before(target, injection):
    global content
    content = content.replace(target, injection + '\n' + target)

# Besaid
inject_after(
    '<li class="task-item"><label for="ffx-check-15"><input type="checkbox" id="ffx-check-15" class="ffx-checkbox"> <span class="task-text"><strong>Besaid Village:</strong> Enter the Crusaders Lodge to pick up <strong>[ ] Al Bhed Primer Vol. II</strong> on the counter.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-besaid-1"><input type="checkbox" id="ffx-check-besaid-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Speak to the Crusaders in the lodge and villagers around town to receive Potions, Phoenix Downs, and 400 Gil.</span></label></li>'
)
inject_after(
    '<li class="task-item"><label for="ffx-check-16"><input type="checkbox" id="ffx-check-16" class="ffx-checkbox"> <span class="task-text"><strong>Valefor\'s Second Overdrive (Energy Blast):</strong> Speak to the shopkeeper in the item shop, then find the dog in the middle-right tent (or near the weaver) to learn <strong>Energy Blast</strong>. <em>(Crucial before leaving!)</em></span></label></li>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>⚠️ Dark Valefor Blockade:</strong> Obtain the Destruction Sphere in the temple and Valefor\'s Energy Blast <em>before</em> boarding the S.S. Liki! If you leave Besaid, Dark Valefor will block the entrance upon your return.\n  </div>'
)

# S.S. Liki & Kilika
inject_after(
    '<li class="task-item"><label for="ffx-check-19"><input type="checkbox" id="ffx-check-19" class="ffx-checkbox"> <span class="task-text"><strong>S.S. Liki:</strong> Go below deck into the Engine Room (past the chocobo) to pick up <strong>[ ] Al Bhed Primer Vol. III</strong> on the floor.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-liki-1"><input type="checkbox" id="ffx-check-liki-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Kick the suitcase in O\'aka\'s cabin repeatedly for up to 20 Potions, and lend O\'aka some Gil to help him out.</span></label></li>'
)
inject_after(
    '<li class="task-item"><label for="ffx-check-21"><input type="checkbox" id="ffx-check-21" class="ffx-checkbox"> <span class="task-text"><strong>Kilika Port:</strong> Enter the tavern/bar to pick up <strong>[ ] Al Bhed Primer Vol. IV</strong> on the counter.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-kilika-1"><input type="checkbox" id="ffx-check-kilika-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Rescue the little girl trapped in the collapsed tavern ruins, then speak to her family later to receive a Red Armlet.</span></label></li>'
)

# Luca
inject_after(
    '<li class="task-item"><label for="ffx-check-27"><input type="checkbox" id="ffx-check-27" class="ffx-checkbox"> <span class="task-text"><strong>Blitzball Tournament:</strong> Win the final match against the Luca Goers to receive a <strong>Strength Sphere</strong>.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-luca-1"><input type="checkbox" id="ffx-check-luca-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Check the docks (specifically Number 1 and 2 docks) to find chests containing 600 Gil and a Tidal Spear.</span></label></li>'
)

# Mi'ihen
inject_after(
    '<li class="task-item"><label for="ffx-check-31"><input type="checkbox" id="ffx-check-31" class="ffx-checkbox"> <span class="task-text"><strong>Mi\'ihen Highroad - Newroad North:</strong> Pick up <strong>[ ] Al Bhed Primer Vol. IX</strong> on the path.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-miihen-1"><input type="checkbox" id="ffx-check-miihen-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Make sure to speak to all the traveling NPCs walking along the Highroad. They give you free weapons and armor (Hunter\'s Spear, Ice Brand, Red Ring, etc.).</span></label></li>'
)

# Mushroom Rock
inject_after(
    '<li class="task-item"><label for="ffx-check-37"><input type="checkbox" id="ffx-check-37" class="ffx-checkbox"> <span class="task-text">Defeat Sinspawn Gui.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-mush-1"><input type="checkbox" id="ffx-check-mush-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Speak to the Crusaders along the path leading up to the command center to receive a Tough Bangle, Serene Bracer, and Mega-Potion.</span></label></li>'
)

# Macalania
inject_after(
    '<li class="task-item"><label for="ffx-check-48"><input type="checkbox" id="ffx-check-48" class="ffx-checkbox"> <span class="task-text"><strong>Macalania Travel Agency:</strong> Grab <strong>[ ] Al Bhed Primer Vol. XVI</strong> sitting on the ground outside the agency.</span></label></li>',
    '  <li class="task-item"><label for="ffx-check-mac-1"><input type="checkbox" id="ffx-check-mac-1" class="ffx-checkbox"> <span class="task-text"><strong>Free Items:</strong> Speak to Tromell repeatedly before fighting Seymour to receive several free items.</span></label></li>'
)
inject_after(
    '  - [ ] Open the Destruction Sphere chest to obtain the <strong>Luck Sphere</strong> <em>(Required for Anima)</em>.',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>⚠️ Dark Shiva Blockade:</strong> Ensure you complete the Destruction Sphere puzzle and grab the Luck Sphere <em>before</em> leaving the temple, otherwise Dark Shiva will ambush you at the entrance later.\n  </div>'
)

# Home
inject_after(
    '<h3>10. Al Bhed Home (🔴 STRICTLY MISSABLE ZONE)</h3>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>🔴 Permanent Missables:</strong> Once you evacuate Home, you <strong>can never return</strong>. You must grab Primers XIX, XX, and XXI right now.\n  </div>'
)

# Bevelle
inject_after(
    '<h3>11. Bevelle & Via Purifico (🔴 STRICTLY MISSABLE ZONE)</h3>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>🔴 Permanent Missables:</strong> You only have one chance to grab Primer XXII on the priests\' passage, and the Destruction Sphere in the Cloister of Trials is required but impossible to skip if you open the chest.\n  </div>'
)

# Calm Lands
inject_after(
    '<h3>12. Calm Lands (🔴 CRITICAL ITEMS)</h3>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>🔴 Permanent Missables:</strong> You <strong>must</strong> buy the Magic Counter Buckler from the hovercraft merchant on your <em>very first entry</em> to the Calm Lands. Also recruit Blitzball Player Durren in the gorge before progressing past Mt. Gagazet.\n  </div>\n  <li class="task-item"><label for="ffx-check-calm-1"><input type="checkbox" id="ffx-check-calm-1" class="ffx-checkbox"> <span class="task-text"><strong>Chests:</strong> Check the perimeter of the Calm Lands to find chests containing Farplane Winds and other valuable items.</span></label></li>'
)

# Mt Gagazet
inject_after(
    '<h3>13. Mt. Gagazet (🔴 CRITICAL NPC)</h3>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>🔴 Permanent Missable:</strong> You <strong>must</strong> speak to Wantz on the mountain path during your first ascent. If you skip talking to him, he will never appear in Macalania Woods later to sell empty 4-slot gear.\n  </div>\n  <li class="task-item"><label for="ffx-check-gagazet-1"><input type="checkbox" id="ffx-check-gagazet-1" class="ffx-checkbox"> <span class="task-text"><strong>Chests:</strong> Open the chests on the mountain trail to find a Defending Bracer and an HP Sphere.</span></label></li>'
)
# Make sure to remove the old wantz task since we added the big warning.
content = content.replace('<li class="task-item"><label for="ffx-check-70"><input type="checkbox" id="ffx-check-70" class="ffx-checkbox"> <span class="task-text"><strong>[ ] Speak to Wantz (Missable):</strong> Talk to Wantz on the mountain path before fighting Seymour Flux. This guarantees he will open his 4-slot shop in Macalania Woods later!</span></label></li>', '')


# Zanarkand
inject_after(
    '<li class="task-item"><label for="ffx-check-79"><input type="checkbox" id="ffx-check-79" class="ffx-checkbox"> <span class="task-text"><strong>[ ] Sun Crest (CRITICAL):</strong> Do <strong>NOT</strong> leave the arena! Walk down the staircase at the back of the chamber. The chest will materialize at the top. Open it to receive the <strong>Sun Crest</strong> for Tidus.</span></label></li>',
    '  <div class="critical-warning" style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1rem; border-radius: 8px; margin: 1rem 0;">\n    <strong>⚠️ Dark Bahamut Blockade:</strong> If you leave the Zanarkand Dome without grabbing the Sun Crest, Dark Bahamut will guard the arena upon your return.\n  </div>'
)

with open('website/templates/layouts/ffx-tracker.html', 'w') as f:
    f.write(content)

print("Done")
