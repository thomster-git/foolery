import re

# 1. Update ocarina.html
with open('website/templates/layouts/ocarina.html', 'r') as f:
    oc_content = f.read()

# Update Share Button
old_oc_share = '<a href="https://twitter.com/intent/tweet?text=Check%20out%20this%20interactive%20Ocarina%20Practice%20Tool%20at%20Thoms%20Foolery.%20%F0%9F%8E%B6&url=https://thomsfoolery.com/tools/ocarina/" target="_blank" rel="noopener noreferrer" class="btn" style="display: inline-block; padding: 0.4rem 0.8rem; font-size: 0.85rem; text-decoration: none;">[ Share This Tool ]</a>'
new_oc_share = '<button class="share-btn" data-title="Ocarina Practice Tool & Tuner" data-text="Check out this interactive Ocarina Practice Tool at Thoms Foolery. 🎵" data-url="https://thomsfoolery.com/tools/ocarina/" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem; font-family: monospace; background: rgba(168, 85, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple); border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'var(--accent-purple)\'; this.style.color=\'white\';" onmouseout="this.style.background=\'rgba(168, 85, 247, 0.1)\'; this.style.color=\'var(--accent-purple)\';"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Tool</button>'
oc_content = oc_content.replace(old_oc_share, new_oc_share)

# Remove Edit Button
old_edit_btn = '<button onclick="editSongInCustomTab(\'${id}\')" style="background: none; border: 1px solid var(--accent-cyan); color: var(--accent-cyan); padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: background 0.2s;">✏️ Edit</button>'
oc_content = oc_content.replace(old_edit_btn, '')

# Update Zelda ending
z_old = "{ n: 'F5', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'F5', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'C5', dur: 'h' }"
z_new = "{ n: 'F5', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'F5', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'B4', dur: 'h' }"
oc_content = oc_content.replace(z_old, z_new)

# Update Epona ending
e_old = "{ n: 'D6', dur: 'q' }, { n: 'B5', dur: 'q' }, { n: 'A5', dur: 'h' }"
e_new = "{ n: 'D6', dur: 'q' }, { n: 'B5', dur: 'q' }, { n: 'A5', dur: 'q' }, { n: 'B5', dur: 'q' }, { n: 'A5', dur: 'h' }"
e_parts = oc_content.split(e_old)
if len(e_parts) > 1:
    # replace the LAST occurrence
    oc_content = e_old.join(e_parts[:-1]) + e_new + e_parts[-1]

# Append share logic
share_js = """  // Share logic
  const shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
          const title = btn.dataset.title;
          const text = btn.dataset.text;
          const url = btn.dataset.url;
          if (navigator.share) {
              try { await navigator.share({ title, text, url }); } 
              catch (err) { console.error('Error sharing', err); }
          } else {
              navigator.clipboard.writeText(url).then(() => {
                  const originalText = btn.innerHTML;
                  btn.innerHTML = "Copied link!";
                  setTimeout(() => btn.innerHTML = originalText, 2000);
              });
          }
      });
  });
"""
oc_content = oc_content.replace('  const firstBtn = document.querySelector(\'.song-btn:not([data-song="custom-tab"])\');', share_js + '\n  const firstBtn = document.querySelector(\'.song-btn:not([data-song="custom-tab"])\');')

with open('website/templates/layouts/ocarina.html', 'w') as f:
    f.write(oc_content)


# 2. Update nfl-trend-analyzer.html
with open('website/templates/layouts/nfl-trend-analyzer.html', 'r') as f:
    nfl_content = f.read()

old_nfl_share = '<a href="https://twitter.com/intent/tweet?text=Check%20out%20this%20interactive%20NFL%20Trend%20Analyzer%20at%20Thoms%20Foolery.%20%F0%9F%8F%88%F0%9F%93%88&url=https://thomsfoolery.com/tools/nfl-trend-analyzer.html" target="_blank" rel="noopener noreferrer" class="btn" style="display: inline-block; padding: 0.4rem 0.8rem; font-size: 0.85rem; text-decoration: none;">[ Share This Tool ]</a>'
new_nfl_share = '<button class="share-btn" data-title="NFL Trend Analyzer" data-text="Check out this interactive NFL Trend Analyzer at Thoms Foolery. 🏈📈" data-url="https://thomsfoolery.com/tools/nfl-trend-analyzer.html" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem; font-family: monospace; background: rgba(168, 85, 247, 0.1); color: var(--accent-purple); border: 1px solid var(--accent-purple); border-radius: 4px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background=\'var(--accent-purple)\'; this.style.color=\'white\';" onmouseout="this.style.background=\'rgba(168, 85, 247, 0.1)\'; this.style.color=\'var(--accent-purple)\';"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg> Share Tool</button>'
nfl_content = nfl_content.replace(old_nfl_share, new_nfl_share)

nfl_script = """<script>
document.addEventListener('DOMContentLoaded', () => {
  const shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
          const title = btn.dataset.title;
          const text = btn.dataset.text;
          const url = btn.dataset.url;
          if (navigator.share) {
              try { await navigator.share({ title, text, url }); } 
              catch (err) { console.error('Error sharing', err); }
          } else {
              navigator.clipboard.writeText(url).then(() => {
                  const originalText = btn.innerHTML;
                  btn.innerHTML = "Copied link!";
                  setTimeout(() => btn.innerHTML = originalText, 2000);
              });
          }
      });
  });
});
</script>
"""
nfl_content = nfl_content + '\n' + nfl_script

with open('website/templates/layouts/nfl-trend-analyzer.html', 'w') as f:
    f.write(nfl_content)

