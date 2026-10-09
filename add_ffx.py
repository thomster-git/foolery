with open('website/templates/layouts/tools.html', 'r') as f:
    content = f.read()

ffx_card = """
            <a href="/tools/ffx-tracker.html" class="tool-card">
                <div class="tool-card-inner" style="position: relative; overflow: hidden;">
                    <div class="tool-badge">NEW</div>
                    <div class="tool-icon">🗡️</div>
                    <h2 class="tool-title">FFX 100% Tracker</h2>
                    <p class="tool-desc">A comprehensive step-by-step checklist to achieving true 100% completion in Final Fantasy X.</p>
                </div>
            </a>
"""

if "ffx-tracker.html" not in content:
    content = content.replace('        </div>\n\n    </div>', ffx_card + '\n        </div>\n\n    </div>')
    with open('website/templates/layouts/tools.html', 'w') as f:
        f.write(content)

