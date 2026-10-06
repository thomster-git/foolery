import re
import os
import glob

template_dir = "/home/keel/Project-Atlas-main/website/templates/layouts"
files = glob.glob(os.path.join(template_dir, "*.html"))

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace minmax(XXXpx, 1fr) with minmax(min(100%, XXXpx), 1fr)
    # Only if it's not already using min()
    new_content = re.sub(r'minmax\(\s*(\d+px)\s*,\s*1fr\s*\)', r'minmax(min(100%, \1), 1fr)', content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed grid in {os.path.basename(filepath)}")

