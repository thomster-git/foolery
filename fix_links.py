import re

# Fix white-box servers
f1 = "/home/keel/Project-Atlas-main/content/articles/sensible-infrastructure-and-white-box-servers.md"
with open(f1, 'r') as f: content = f.read()
content = content.replace("  - sensible-infrastructure-and-custom-servers\n", "")
with open(f1, 'w') as f: f.write(content)

# Fix self-hosting
f2 = "/home/keel/Project-Atlas-main/content/articles/the-case-for-self-hosting-over-cloud-datacenters.md"
with open(f2, 'r') as f: content = f.read()
content = content.replace("  - sensible-infrastructure-and-custom-servers\n", "  - sensible-infrastructure-and-white-box-servers\n")
with open(f2, 'w') as f: f.write(content)

# Fix technology topic
f3 = "/home/keel/Project-Atlas-main/content/topics/technology.md"
with open(f3, 'r') as f: content = f.read()
content = content.replace("  - sensible-infrastructure-and-custom-servers\n", "")
with open(f3, 'w') as f: f.write(content)

# Fix ocarina
f4 = "/home/keel/Project-Atlas-main/content/projects/ocarina-practice-tool.md"
with open(f4, 'r') as f: content = f.read()
content = content.replace("  - web-development\n", "  - technology\n")
content = content.replace("  - building-systems\n", "  - systems-thinking\n")
with open(f4, 'w') as f: f.write(content)

print("Links fixed.")
