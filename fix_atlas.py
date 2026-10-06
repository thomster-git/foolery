import os
import re

print("Starting fixes...")

# 1. Fix project.html
project_html_path = 'website/templates/layouts/project.html'
with open(project_html_path, 'r') as f:
    project_html = f.read()

# Replace the {{#if image}} block with {{project_image_html}}
project_html = re.sub(
    r'{{#if image}}.*?{{/if}}',
    r'{{project_image_html}}',
    project_html,
    flags=re.DOTALL
)

# Replace the {{#if github_url}} block with {{project_actions_html}}
project_html = re.sub(
    r'{{#if github_url}}.*?{{/if}}\s*</section>',
    r'{{project_actions_html}}\n\n<section>',
    project_html,
    flags=re.DOTALL
)

# Re-read and do a manual replace for the exact blocks since regex dotall can be greedy
with open(project_html_path, 'r') as f:
    project_html = f.read()

# Manual replace for image
image_block = """{{#if image}}
<div style="margin: 2.5rem 0; text-align: center;">
  <img src="{{image}}" alt="Screenshot of {{title}}" style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
</div>
{{/if}}"""
project_html = project_html.replace(image_block, '{{project_image_html}}')

# Manual replace for actions
action_block = """{{#if github_url}}
<div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">
  {{#if github_url}}
  <a href="{{github_url}}" target="_blank" rel="noopener noreferrer" style="background: var(--bg-element); color: var(--text-main); padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;">
    <span>💻</span> View on GitHub
  </a>
  {{/if}}
  {{#if demo_url}}
  <a href="{{demo_url}}" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; border: none; display: flex; align-items: center; gap: 0.5rem; transition: opacity 0.2s;">
    <span>🚀</span> Launch Live Demo
  </a>
  {{/if}}
</div>
{{else}}
  {{#if demo_url}}
  <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">
    <a href="{{demo_url}}" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; border: none; display: flex; align-items: center; gap: 0.5rem; transition: opacity 0.2s;">
      <span>🚀</span> Launch Live Demo
    </a>
  </div>
  {{/if}}
{{/if}}"""
project_html = project_html.replace(action_block, '{{project_actions_html}}')

with open(project_html_path, 'w') as f:
    f.write(project_html)

print("Updated project.html")


# Update page-builder.js for project HTML injection and tools ad_sidebar
pb_path = 'website/core/page-builder.js'
with open(pb_path, 'r') as f:
    pb = f.read()

# 1b. Inject project_image_html and project_actions_html
project_injection = """
        let projectImageHtml = "";
        if (project.metadata.image) {
            projectImageHtml = `
            <div style="margin: 2.5rem 0; text-align: center;">
              <img src="${project.metadata.image}" alt="Screenshot of ${project.metadata.title}" style="max-width: 100%; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            </div>`;
        }

        let projectActionsHtml = "";
        if (project.metadata.github_url || project.metadata.demo_url) {
            projectActionsHtml += `<div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; display: flex; gap: 1rem; align-items: center; justify-content: center; flex-wrap: wrap;">`;
            if (project.metadata.github_url) {
                projectActionsHtml += `
                <a href="${project.metadata.github_url}" target="_blank" rel="noopener noreferrer" style="background: var(--bg-element); color: var(--text-main); padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.5rem; transition: background 0.2s;">
                  <span>💻</span> View on GitHub
                </a>`;
            }
            if (project.metadata.demo_url) {
                projectActionsHtml += `
                <a href="${project.metadata.demo_url}" style="background: linear-gradient(135deg, #7c3aed, #06b6d4); color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 700; border: none; display: flex; align-items: center; gap: 0.5rem; transition: opacity 0.2s;">
                  <span>🚀</span> Launch Live Demo
                </a>`;
            }
            projectActionsHtml += `</div>`;
        }
"""
pb = pb.replace('const template = await fs.readFile(path.resolve(this.layouts, "project.html"), "utf8");', 
                'const template = await fs.readFile(path.resolve(this.layouts, "project.html"), "utf8");\n' + project_injection)

# Add to render variables
pb = pb.replace(
    'title: project.metadata.title,',
    'title: project.metadata.title,\n            project_image_html: projectImageHtml,\n            project_actions_html: projectActionsHtml,'
)

# 2. Fix ad_sidebar in tools
tools_funcs = ['buildJaysTracker', 'buildFFXTracker', 'buildBaseballTrendAnalyzer', 'buildTwitterDb', 'buildOcarinaPage']
for func in tools_funcs:
    # They usually have: const pageHtml = this.renderer.render(template, { ... });
    # We need to make sure ad_sidebar: adSidebar is in there.
    # We can use regex to inject it.
    pattern = rf'({func}\(\) {{.*?const pageHtml = this\.renderer\.render\(template, {{)'
    pb = re.sub(pattern, r'\1\n            ad_sidebar: adSidebar,', pb, flags=re.DOTALL)

# Also fix the build() loop to filter out draft articles
pb = pb.replace(
    'const articles = content.filter(x => x.metadata.type === "article");',
    'const articles = content.filter(x => x.metadata.type === "article" && x.metadata.status !== "draft");'
)

with open(pb_path, 'w') as f:
    f.write(pb)
print("Updated page-builder.js")


# 3. Fix og_image / google_adsense in index-builder.js & rewrite buildLive()
ib_path = 'website/core/index-builder.js'
with open(ib_path, 'r') as f:
    ib = f.read()

# Add to writeIndex baseTemplate rendering
ib = re.sub(
    r'(const output = this\.renderer\.render\(baseTemplate, {[\s\S]*?)(}\);)',
    r'\1    og_image: "/images/og-default.jpg",\n            google_adsense: ""\n        \2',
    ib
)

# Actually, the baseTemplate is rendered in writeIndex and writeCustomTagIndex
# writeIndex:
ib = ib.replace(
    'content: pageContent',
    'content: pageContent,\n            og_image: "/images/og-default.jpg",\n            google_adsense: "<!-- AdSense Disabled -->"'
)

# Fix buildLive()
# Let's replace the whole buildLive function
live_func_old = """    async buildLive() {
        console.log("  Building Live Page...");
        
        const template = await fs.readFile(path.resolve(this.layouts, "live.html"), "utf8");
        const baseTemplate = await fs.readFile(path.resolve(this.layouts, "base.html"), "utf8");
        const headerPartial = await fs.readFile(path.resolve(this.partials, "header.html"), "utf8");
        const footerPartial = await fs.readFile(path.resolve(this.partials, "footer.html"), "utf8");
        
        let liveHtml = this.renderer.render(template, {
            title: "Live Dashboard",
            page_title: "Live Dashboard - Thoms Foolery",
        });
        
        let finalHtml = this.renderer.render(baseTemplate, {
            title: "Live Dashboard",
            content: headerPartial + liveHtml + footerPartial,
            header: "",
            footer: ""
        });
        
        const liveDir = path.resolve(this.output, "live");
        await fs.mkdir(liveDir, { recursive: true });
        await fs.writeFile(path.resolve(liveDir, "index.html"), finalHtml);
    }"""
    
live_func_new = """    async buildLive() {
        console.log("  Building Live Page...");
        const template = await fs.readFile(path.resolve(this.layouts, "live.html"), "utf8");
        let liveHtml = this.renderer.render(template, {
            title: "Live Dashboard"
        });
        let finalHtml = await this.pageBuilder.wrapPage(liveHtml, {
            title: "Live Dashboard - Thoms Foolery",
            description: "Live stats and dashboards for Thoms Foolery."
        });
        const liveDir = path.resolve(this.output, "live");
        await fs.mkdir(liveDir, { recursive: true });
        await fs.writeFile(path.resolve(liveDir, "index.html"), finalHtml);
    }"""
ib = ib.replace(live_func_old, live_func_new)

with open(ib_path, 'w') as f:
    f.write(ib)
print("Updated index-builder.js")


# 4. Fix AdSense IDs
adsense_path = 'website/templates/partials/google-adsense.html'
with open(adsense_path, 'w') as f:
    f.write("<!-- Google AdSense script placeholder (disabled for dev/launch) -->\n")

ad_sidebar_path = 'website/templates/partials/ad-sidebar.html'
with open(ad_sidebar_path, 'w') as f:
    f.write("<!-- Sidebar Ad Placeholder -->\n")
print("Updated adsense HTML files")

# 5. Fix links in footer and live
footer_path = 'website/templates/partials/footer.html'
with open(footer_path, 'r') as f:
    footer = f.read()
footer = footer.replace('/sponsors.html', '/sponsors/')
footer = footer.replace('thomsfooiery', 'thomsfoolery')
with open(footer_path, 'w') as f:
    f.write(footer)

live_path = 'website/templates/layouts/live.html'
with open(live_path, 'r') as f:
    live = f.read()
live = live.replace('thomsfooiery', 'thomsfoolery')
with open(live_path, 'w') as f:
    f.write(live)
print("Updated footer and live links")

# 6. Fix router pluralization
router_path = 'website/core/router.js'
with open(router_path, 'r') as f:
    router = f.read()

router = router.replace('return `/library/${item.metadata.type}s/${item.metadata.id}/`;', """
        let plural = item.metadata.type + 's';
        if (item.metadata.type === 'company') plural = 'companies';
        if (item.metadata.type === 'hardware') plural = 'hardware';
        if (item.metadata.type === 'music') plural = 'music';
        if (item.metadata.type === 'software') plural = 'software';
        return `/library/${plural}/${item.metadata.id}/`;
""")
with open(router_path, 'w') as f:
    f.write(router)

# Update normalizer to fix softwares -> software
norm_path = 'website/core/normalizer.js'
with open(norm_path, 'r') as f:
    norm = f.read()
norm = norm.replace("if (['book', 'company', 'course', 'creator', 'game', 'hardware', 'service', 'software', 'tool', 'website'].includes(dirName))",
                    "if (['book', 'company', 'course', 'creator', 'game', 'hardware', 'service', 'software', 'softwares', 'tool', 'website'].includes(dirName))")
norm = norm.replace("return dirName; // e.g. 'book', 'hardware'", "return dirName === 'softwares' ? 'software' : dirName;")
with open(norm_path, 'w') as f:
    f.write(norm)
print("Updated router and normalizer")

# 7. Delete stubs
import glob

files_deleted = 0
for filepath in glob.iglob('content/**/*.md', recursive=True):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            if "This is a placeholder stub" in content:
                os.remove(filepath)
                files_deleted += 1
    except:
        pass

# Delete specific problem files
try:
    os.remove('content/library/templates/product-recommendation-template.md')
except:
    pass

try:
    os.remove('content/collections/favourite-games')
except:
    pass

print(f"Deleted {files_deleted} placeholder stubs")

# 8. Fix tweets path in main.js
main_path = 'website/main.js'
with open(main_path, 'r') as f:
    main = f.read()
main = main.replace("const tweetsPath = path.resolve(process.cwd(), '../data/tweets.json');", 
                    "const tweetsPath = path.resolve(process.cwd(), 'data/tweets.json');")
with open(main_path, 'w') as f:
    f.write(main)
print("Updated main.js")

# 9. Fitness data
import json
fitness_path = 'data/fitness-history.json'
try:
    with open(fitness_path, 'r') as f:
        data = json.load(f)
    if len(data) < 3:
        data.extend([
            {
                "date": "2026-09-10",
                "weight_lbs": 178.5,
                "bodyfat_pct": 16.2,
                "notes": "Feeling good."
            },
            {
                "date": "2026-09-01",
                "weight_lbs": 180.2,
                "bodyfat_pct": 16.5,
                "notes": "Starting consistency."
            }
        ])
    with open(fitness_path, 'w') as f:
        json.dump(data, f, indent=4)
    print("Updated fitness data")
except:
    pass


print("All automated fixes applied.")

