import re

filepath = "/home/keel/Project-Atlas-main/website/templates/layouts/tools.html"
with open(filepath, 'r') as f:
    content = f.read()

# Revert the flex stuff that broke the layout
content = content.replace('; display: flex; flex-direction: column;"', '"')
content = content.replace('; flex-grow: 1;"', '"')

with open(filepath, 'w') as f:
    f.write(content)

print("Reverted flex layout on tools.html")
