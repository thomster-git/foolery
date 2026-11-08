import re

filepath = "/home/keel/Project-Atlas-main/website/core/page-builder.js"
with open(filepath, 'r') as f:
    content = f.read()

# We need to add `const adSidebar = await this.loadPartial("ad-sidebar.html");`
# to buildOcarinaPage, buildJaysTracker, buildFFXTracker, buildBaseballTrendAnalyzer, buildTwitterDb
# and pass it to `this.renderer.render(template, { ad_sidebar: adSidebar })`

def update_tool(func_name, content):
    pattern = rf"(async {func_name}\(\) {{.*?const template = await this\.loadLayout\(\".*?\"\);)"
    match = re.search(pattern, content, flags=re.DOTALL)
    if match:
        replacement = match.group(1) + "\n        const adSidebar = await this.loadPartial(\"ad-sidebar.html\");"
        content = content.replace(match.group(1), replacement)
        
        # Now find the this.renderer.render(template, {}) and replace it
        # Need to be careful to only replace within the function body
        start_idx = content.find(replacement)
        end_idx = content.find("async build", start_idx) if "async build" in content[start_idx:] else len(content)
        func_body = content[start_idx:end_idx]
        
        if "this.renderer.render(template, {})" in func_body:
            new_func_body = func_body.replace("this.renderer.render(template, {})", "this.renderer.render(template, { ad_sidebar: adSidebar })")
            content = content[:start_idx] + new_func_body + content[end_idx:]
            
    return content

content = update_tool("buildOcarinaPage", content)
content = update_tool("buildJaysTracker", content)
content = update_tool("buildFFXTracker", content)
content = update_tool("buildBaseballTrendAnalyzer", content)
content = update_tool("buildTwitterDb", content)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated page-builder.js")
