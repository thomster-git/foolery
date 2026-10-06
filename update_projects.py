import os
import glob
import re

projects_dir = "/home/keel/Project-Atlas-main/content/projects"
files = glob.glob(os.path.join(projects_dir, "*.md"))

def inject_frontmatter(content, fields):
    # Find the end of the frontmatter
    parts = content.split('---')
    if len(parts) >= 3:
        frontmatter = parts[1]
        for key, val in fields.items():
            if f"\n{key}:" not in frontmatter:
                # insert before the closing ---
                frontmatter = frontmatter.rstrip() + f"\n{key}: {val}\n"
        
        parts[1] = frontmatter
        return '---'.join(parts)
    return content

for filepath in files:
    filename = os.path.basename(filepath)
    with open(filepath, 'r') as f:
        content = f.read()
    
    basename = filename.replace('.md', '')
    
    fields_to_add = {
        'github_url': f"https://github.com/JonathanThoms/{basename}"
    }
    
    # Map specific demo URLs
    if basename == 'baseball-trend-analyzer':
        fields_to_add['demo_url'] = "/tools/baseball-trend-analyzer.html"
        fields_to_add['image'] = "/images/projects/baseball.jpg"
    elif basename == 'personal-digital-garden-creator':
        fields_to_add['demo_url'] = "/tools/content-creator/"
        fields_to_add['image'] = "/images/projects/atlas.jpg"
    elif basename == 'discord-ai-bot':
        fields_to_add['image'] = "/images/projects/discord.jpg"
        
    new_content = inject_frontmatter(content, fields_to_add)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

print("Updated all project files with github and demo URLs.")
