with open('website/templates/layouts/start.html', 'r') as f:
    content = f.read()

youtube_link = """          <a href="https://www.youtube.com/@Thoms.Foolery" target="_blank" rel="noopener noreferrer" class="start-social-btn start-social-btn--youtube" id="start-social-youtube">
            <span class="start-social-icon" style="color: #ff0000;">▶️</span>
            <span>YouTube</span>
          </a>"""

insta_link = """          <a href="https://www.instagram.com/thoms.foolery/" target="_blank" rel="noopener noreferrer" class="start-social-btn start-social-btn--instagram" id="start-social-instagram">
            <span class="start-social-icon" style="color: #E1306C;">📸</span>
            <span>Instagram</span>
          </a>"""

threads_link = """          <a href="https://www.threads.net/@thoms.foolery" target="_blank" rel="noopener noreferrer" class="start-social-btn start-social-btn--threads" id="start-social-threads">
            <span class="start-social-icon" style="color: #ffffff; font-weight: 900; font-family: monospace;">@</span>
            <span>Threads</span>
          </a>"""

# Add these after Twitch/Kick
kick_str = "<span>Kick</span>\n          </a>"

if 'id="start-social-youtube"' not in content:
    content = content.replace(kick_str, kick_str + '\n' + youtube_link + '\n' + insta_link + '\n' + threads_link)

with open('website/templates/layouts/start.html', 'w') as f:
    f.write(content)
