with open('website/templates/layouts/start.html', 'r') as f:
    content = f.read()

resume_card = """
    <a href="/resume/" class="start-card start-card--resume" id="start-path-resume" style="border-top: 3px solid var(--accent-cyan);">
      <div class="start-card-icon" aria-hidden="true">📄</div>
      <div class="start-card-body">
        <h2 class="start-card-title">Professional Resume</h2>
        <p class="start-card-desc">My professional timeline, consulting experience, and a dynamic resume builder to tailor my skills for specific projects.</p>
        <span class="start-card-cta">View Resume &rarr;</span>
      </div>
    </a>
"""

# Add resume card before the socials card
if 'id="start-path-resume"' not in content:
    content = content.replace('    <div class="start-card start-card--socials" id="start-path-socials">', resume_card + '\n    <div class="start-card start-card--socials" id="start-path-socials">')

kick_link = """
          <a href="https://kick.com/thomsfoolery" target="_blank" rel="noopener noreferrer" class="start-social-btn start-social-btn--kick" id="start-social-kick">
            <span class="start-social-icon" style="color: #53fc18; font-weight: 900; font-family: monospace; font-size: 0.8rem;">K</span>
            <span>Kick</span>
          </a>"""

twitch_link = """          <a href="https://www.twitch.tv/thomsfoolery" target="_blank" rel="noopener noreferrer" class="start-social-btn start-social-btn--twitch" id="start-social-twitch">
            <span class="start-social-icon">🎮</span>
            <span>Twitch</span>
          </a>"""

# Add Kick link after Twitch link
if 'id="start-social-kick"' not in content:
    content = content.replace(twitch_link, twitch_link + kick_link)

with open('website/templates/layouts/start.html', 'w') as f:
    f.write(content)
