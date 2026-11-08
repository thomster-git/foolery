with open('website/templates/layouts/resume.html', 'r') as f:
    content = f.read()

old_bullet = '<li>Registering domains, configuring DNS, and building small business sites with custom HTML/CSS and graphics to match each brand.</li>'
new_bullet = '<li>Registering domains, configuring DNS, and building custom digital experiences—including <strong>Project Atlas</strong>, a modern static-generated digital garden built from the ground up alongside autonomous AI-agent orchestration.</li>'

content = content.replace(old_bullet, new_bullet)

with open('website/templates/layouts/resume.html', 'w') as f:
    f.write(content)
