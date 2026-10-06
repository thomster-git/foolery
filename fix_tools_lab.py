import re
import os

# 1. Labyrinth Arrow Right
js_path = 'website/static/js/labyrinth3d.js'
with open(js_path, 'r') as f:
    js = f.read()

# Make sure OrbitControls doesn't eat keys
js = js.replace('controls = new THREE.OrbitControls(camera, renderer.domElement);', 
                'controls = new THREE.OrbitControls(camera, renderer.domElement);\ncontrols.enableKeys = false;\ncontrols.listenToKeyEvents = function(){}; // Disable default arrow panning')

# Fix right arrow logic explicitly just in case
# Ensure we have the right block
target = """        if (e.key === 'ArrowLeft') idx = (idx + 1) % angles.length;
        else if (e.key === 'ArrowRight') idx = (idx - 1 + angles.length) % angles.length;"""
replacement = """        if (e.key === 'ArrowLeft') {
            idx = (idx + 1) % angles.length;
        } else if (e.key === 'ArrowRight') {
            idx = (idx - 1 + angles.length) % angles.length;
        }"""
js = js.replace(target, replacement)
with open(js_path, 'w') as f:
    f.write(js)

# 2. Tools Masonry Layout
tools_path = 'website/templates/layouts/tools.html'
with open(tools_path, 'r') as f:
    tools_html = f.read()

# We need to split into tools.html and devtools.html
# Let's write the CSS block for masonry
masonry_css = """
<style>
    .masonry-grid {
        column-count: 1;
        column-gap: 2rem;
    }
    @media (min-width: 768px) {
        .masonry-grid { column-count: 2; }
    }
    @media (min-width: 1024px) {
        .masonry-grid { column-count: 3; }
    }
    .masonry-item {
        break-inside: avoid;
        margin-bottom: 2rem;
        display: block;
        text-decoration: none;
        color: inherit;
    }
    div[style*="background: var(--bg-card)"]:hover {
        transform: translateY(-5px);
        border-color: var(--accent-cyan) !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
</style>
"""

import copy

def extract_cards(html):
    cards = []
    # Find all <a href=...>...</a> tags inside the grid
    matches = re.finditer(r'<a href="[^"]+".*?</a>', html, flags=re.DOTALL)
    for m in matches:
        cards.append(m.group(0))
    return cards

cards = extract_cards(tools_html)

# Tools to keep in public:
public_slugs = ['ocarina', 'baseball-trend', 'blue-jays']
public_cards = []
dev_cards = []

for card in cards:
    is_public = False
    for slug in public_slugs:
        if slug in card:
            is_public = True
            break
    
    # modify card to have masonry class
    card = re.sub(r'<a href="([^"]+)" style=".*?"', r'<a href="\1" class="masonry-item"', card)
    
    if is_public:
        public_cards.append(card)
    else:
        dev_cards.append(card)

# Build public tools
public_html = tools_html.split('<div style="display: grid;')[0] + '<div class="masonry-grid">\n' + '\n'.join(public_cards) + '\n</div>\n</div>\n</div>\n' + masonry_css
with open(tools_path, 'w') as f:
    f.write(public_html)

# Build devtools
dev_html = tools_html.split('<div style="display: grid;')[0] + '<div class="masonry-grid">\n' + '\n'.join(dev_cards) + '\n</div>\n</div>\n</div>\n' + masonry_css
dev_html = dev_html.replace('Developer Tools', 'Developer & Internal Tools').replace('<span>Developer Tools</span>', '<span>Dev Tools</span>')
with open('website/templates/layouts/devtools.html', 'w') as f:
    f.write(dev_html)

# Update page-builder.js
pb_path = 'website/core/page-builder.js'
with open(pb_path, 'r') as f:
    pb = f.read()

dev_builder = """
    async buildDevToolsPage() {
        console.log("  Building Dev Tools Page...");
        const template = await this.loadLayout("devtools.html");
        const html = await this.wrapPage(
            this.renderer.render(template, { title: "Dev Tools" }),
            "Dev Tools - Thoms Foolery"
        );
        const dir = path.resolve(this.output, "devtools");
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.resolve(dir, "index.html"), html);
    }
"""
if "buildDevToolsPage" not in pb:
    pb = pb.replace('async buildToolsPage() {', dev_builder + '\n    async buildToolsPage() {')
    pb = pb.replace('await this.buildToolsPage();', 'await this.buildToolsPage();\n        await this.buildDevToolsPage();')

with open(pb_path, 'w') as f:
    f.write(pb)

print("Finished Task 1 and 2.")
