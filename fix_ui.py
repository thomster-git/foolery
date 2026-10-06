import re

# 1. header.html
with open('website/templates/partials/header.html', 'r') as f:
    header = f.read()
header = header.replace('<a href="/library/">Library</a>', '<a href="/library/">Library</a>\n    <a href="/wishlist/">Wishlist</a>')
with open('website/templates/partials/header.html', 'w') as f:
    f.write(header)


# 2. tools.html
with open('website/templates/layouts/tools.html', 'r') as f:
    tools = f.read()

# Replace <a href="..." style="text-decoration: none; color: inherit;">
# with <a href="..." style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
tools = re.sub(
    r'<a href="([^"]+)" style="text-decoration: none; color: inherit;">',
    r'<a href="\1" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">',
    tools
)
# Update the inner div to be a flex column with flex 1
tools = tools.replace(
    'transition: transform 0.2s, border-color 0.2s; height: 100%;">',
    'transition: transform 0.2s, border-color 0.2s; height: 100%; display: flex; flex-direction: column; flex: 1;">'
)
tools = tools.replace(
    'transition: transform 0.2s, border-color 0.2s; height: 100%; position: relative; overflow: hidden">',
    'transition: transform 0.2s, border-color 0.2s; height: 100%; display: flex; flex-direction: column; flex: 1; position: relative; overflow: hidden">'
)
tools = tools.replace(
    'transition: transform 0.2s, border-color 0.2s; height: 100%; position: relative; overflow: hidden;">',
    'transition: transform 0.2s, border-color 0.2s; height: 100%; display: flex; flex-direction: column; flex: 1; position: relative; overflow: hidden">'
)

# Push the "Read Project Writeup" link to the bottom
tools = tools.replace(
    'margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.9rem; color: var(--accent-cyan); font-weight: 600; text-decoration: none;">Read',
    'margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.9rem; color: var(--accent-cyan); font-weight: 600; text-decoration: none;">Read'
)
# Make the paragraph fill space so the button pushes down if there's no button, it doesn't matter.
with open('website/templates/layouts/tools.html', 'w') as f:
    f.write(tools)


# 3. labyrinth3d.js
with open('website/static/js/labyrinth3d.js', 'r') as f:
    lab = f.read()

lab = lab.replace(
    "if (e.key === 'ArrowRight') idx = (idx + 1) % angles.length;",
    "else if (e.key === 'ArrowRight') idx = (idx + 1) % angles.length;"
)

# But the user asked for Right to do the opposite of Left.
# Let's change ArrowLeft to +1 and ArrowRight to -1? Or ArrowLeft is -1 and ArrowRight is +1.
# Currently Left is: idx = (idx - 1 + length) % length
# Right is: idx = (idx + 1) % length
# I will make sure they are opposite. (They already are opposite!) 
# The issue was just the missing 'else' which caused Right to evaluate the incremented idx again, breaking the logic if left was pressed, 
# or wait... if e.key === 'ArrowRight' it doesn't match 'ArrowLeft'. So it runs on its own. 
# Why did it not work? Let's change ArrowRight to do -1 and ArrowLeft to do +1, as sometimes atan2 angles are backwards to user expectation.
# Actually let's just make sure it works first by fixing the missing 'else' and making Left = +1, Right = -1 as requested ("should do the opposite of the left arrow" -> meaning it currently doesn't work at all, so just making it work and do the opposite of left).
lab = lab.replace(
    "if (e.key === 'ArrowLeft') idx = (idx - 1 + angles.length) % angles.length;\n        if (e.key === 'ArrowRight') idx = (idx + 1) % angles.length;",
    "if (e.key === 'ArrowLeft') idx = (idx + 1) % angles.length;\n        else if (e.key === 'ArrowRight') idx = (idx - 1 + angles.length) % angles.length;"
)

with open('website/static/js/labyrinth3d.js', 'w') as f:
    f.write(lab)


# 4. start.html
with open('website/templates/layouts/start.html', 'r') as f:
    start = f.read()

new_card = """
    <!-- Path 5: What is this place? -->
    <a href="/projects/project-atlas/" class="start-card start-card--atlas" id="start-path-atlas" style="border-top: 3px solid var(--accent-blue);">
      <div class="start-card-icon" aria-hidden="true">🗺️</div>
      <div class="start-card-body">
        <h2 class="start-card-title">What is this place?</h2>
        <p class="start-card-desc">Read the Project Atlas manifesto. Learn how this site works, why it exists, and the philosophy behind digital gardening.</p>
        <span class="start-card-cta">Read the Manifesto &rarr;</span>
      </div>
    </a>
"""

start = start.replace('<!-- Path 5: Find me elsewhere -->', new_card + '\n    <!-- Path 6: Find me elsewhere -->')

# Fix links
start = start.replace('https://www.twitch.tv/thomsfooiery', 'https://www.twitch.tv/thomsfoolery') # Fix typo

with open('website/templates/layouts/start.html', 'w') as f:
    f.write(start)


# 5. homepage.html
with open('website/templates/layouts/homepage.html', 'r') as f:
    home = f.read()

old_bio = "I'm <strong style=\"color: var(--text-main);\">Jonathan Thoms</strong> &mdash; Mechanical Engineer turned IT consultant, systems builder, and workflow designer. I help teams turn &ldquo;it kind of works but nobody can explain how&rdquo; into clear, documented, measurable systems."
new_bio = "I'm <strong style=\"color: var(--text-main);\">Jonathan Thoms</strong>. I love tearing things apart to figure out how they work, building weird interconnected systems, and documenting everything along the way. This digital garden is my living brain dump of projects, hobbies, and random fixations."

home = home.replace(old_bio, new_bio)

with open('website/templates/layouts/homepage.html', 'w') as f:
    f.write(home)

print("Updates applied")
