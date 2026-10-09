import os
import glob

files = [
    'content/topics/technology.md',
    'content/topics/audhd.md',
    'content/themes/connection.md',
    'content/themes/systems-thinking.md',
    'content/projects/project-atlas.md'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        # Insert stage: teaser right after the first ---
        if len(lines) > 0 and lines[0].strip() == '---':
            lines.insert(1, 'stage: "teaser"\n')
            
        with open(filepath, 'w') as f:
            f.writelines(lines)
            
