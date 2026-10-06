import re
import os

path = "website/templates/layouts/ocarina.html"
with open(path, "r") as f:
    content = f.read()

# 1. Add tab button
tab_btn = """      <button class="oc-tab" data-tab="songs" onclick="switchTab('songs')">📖 Songbook</button>
      <button class="oc-tab" data-tab="oot" onclick="switchTab('oot')">🎮 OoT Melodies</button>"""
content = content.replace("""      <button class="oc-tab" data-tab="songs" onclick="switchTab('songs')">📖 Songbook</button>""", tab_btn)

# 2. Add tab content
tab_content = """    <!-- ==================== OOT MELODIES TAB ==================== -->
    <div id="tab-oot" class="oc-panel" style="display: none; padding-top: 2rem;">
      <p style="color: var(--text-muted); text-align: center; margin-bottom: 2rem;">
        The short activation melodies used in Ocarina of Time. These are transposed specifically for a 12-hole Alto C Ocarina.
      </p>
      <div id="oot-buttons-container" style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2.5rem;"></div>
      <div id="oot-display" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 2rem;">
        <p style="text-align:center; color:var(--text-muted);">Select a melody above to view its tabs.</p>
      </div>
    </div>

    </div> <!-- end article-content -->"""
content = content.replace("    </div> <!-- end article-content -->", tab_content)

# 3. Add JS definitions and functions
js_oot = """
let OOT_MELODIES = {
  'oot-zelda': { title: "Zelda's Lullaby", info: "◀ ▲ ▶ ◀ ▲ ▶", notes: [{n:'E5'},{n:'G5'},{n:'D5'},{break:true},{n:'E5'},{n:'G5'},{n:'D5'}] },
  'oot-epona': { title: "Epona's Song", info: "▲ ◀ ▶ ▲ ◀ ▶", notes: [{n:'D6'},{n:'B5'},{n:'A5'},{break:true},{n:'D6'},{n:'B5'},{n:'A5'}] },
  'oot-saria': { title: "Saria's Song", info: "▼ ▶ ◀ ▼ ▶ ◀", notes: [{n:'F5'},{n:'A5'},{n:'B5'},{break:true},{n:'F5'},{n:'A5'},{n:'B5'}] },
  'oot-sun': { title: "Sun's Song", info: "▶ ▼ ▲ ▶ ▼ ▲", notes: [{n:'A5'},{n:'F5'},{n:'D6'},{break:true},{n:'A5'},{n:'F5'},{n:'D6'}] },
  'oot-time': { title: "Song of Time", info: "▶ A ▼ ▶ A ▼", notes: [{n:'A5'},{n:'D5'},{n:'F5'},{break:true},{n:'A5'},{n:'D5'},{n:'F5'}] },
  'oot-storms': { title: "Song of Storms", info: "A ▼ ▲ A ▼ ▲", notes: [{n:'D5'},{n:'F5'},{n:'D6'},{break:true},{n:'D5'},{n:'F5'},{n:'D6'}] },
  'oot-minuet': { title: "Minuet of Forest", info: "A ▲ ◀ ▶ ◀ ▶", notes: [{n:'D5'},{n:'D6'},{n:'B5'},{n:'A5'},{n:'B5'},{n:'A5'}] },
  'oot-bolero': { title: "Bolero of Fire", info: "▼ A ▼ A ▶ ▼ ▶ ▼", notes: [{n:'F5'},{n:'D5'},{n:'F5'},{n:'D5'},{n:'A5'},{n:'F5'},{n:'A5'},{n:'F5'}] },
  'oot-serenade': { title: "Serenade of Water", info: "A ▼ ▶ ▶ ◀", notes: [{n:'D5'},{n:'F5'},{n:'A5'},{n:'A5'},{n:'B5'}] },
  'oot-nocturne': { title: "Nocturne of Shadow", info: "◀ ▶ ▶ A ◀ ▶ ▼", notes: [{n:'B5'},{n:'A5'},{n:'A5'},{n:'D5'},{n:'B5'},{n:'A5'},{n:'F5'}] },
  'oot-requiem': { title: "Requiem of Spirit", info: "A ▼ A ▶ ▼ A", notes: [{n:'D5'},{n:'F5'},{n:'D5'},{n:'A5'},{n:'F5'},{n:'D5'}] },
  'oot-prelude': { title: "Prelude of Light", info: "▲ ▶ ▲ ▶ ◀ ▲", notes: [{n:'D6'},{n:'A5'},{n:'D6'},{n:'A5'},{n:'B5'},{n:'D6'}] }
};

function renderOotButtons() {
  const container = document.getElementById('oot-buttons-container');
  if (!container) return;
  let html = '';
  for (const [id, song] of Object.entries(OOT_MELODIES)) {
    html += `<button class="song-btn" data-oot="${id}" onclick="loadOotSong('${id}', this)">${song.title}</button>`;
  }
  container.innerHTML = html;
}

function loadOotSong(id, btn) {
  document.querySelectorAll('#oot-buttons-container .song-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');

  const song = OOT_MELODIES[id];
  if (!song) return;

  const display = document.getElementById('oot-display');
  const notesHtml = song.notes.map((beat) => {
    if (beat.break) {
      return `<div style="flex-basis: 100%; height: 1.5rem; border-bottom: 1px dashed rgba(255,255,255,0.1); margin-bottom: 1rem;"></div>`;
    }
    const f = getFingering(beat.n);
    const svg = f ? renderHoleSVG(f.holes, f.thumbs) : `<div style="color:var(--text-muted);font-size:0.7rem;">(no chart)</div>`;
    return `
      <div class="note-beat">
        <div class="note-name">${beat.n}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">&nbsp;</div>
        ${svg}
      </div>
    `;
  }).join('');

  display.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
      <h3 style="color: var(--text-main); margin: 0;">${song.title}</h3>
      <button class="practice-btn" onclick="startPracticeMode('oot')" style="background: var(--accent-emerald); border: none; color: #000; padding: 0.3rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: background 0.2s;">🎙️ Practice Mode</button>
    </div>
    <p style="color: var(--text-muted); font-size: 1.2rem; font-weight: bold; margin-bottom: 1.75rem;">N64: ${song.info}</p>
    <div class="song-notes">${notesHtml}</div>
  `;
}
"""
content = content.replace("function renderSongButtons() {", js_oot + "\nfunction renderSongButtons() {")

# 4. Update initSongs to call renderOotButtons
init_replace = """function initSongs() {
  try {
    const saved = localStorage.getItem('ocarina_songs');
    if (saved) {
      const parsed = JSON.parse(saved);
      SONGS = { ...SONGS, ...parsed };
    }
  } catch(e) { console.error('Failed to load saved songs', e); }
  renderSongButtons();
  renderOotButtons();
}"""
# Just replace the function
content = re.sub(r"function initSongs\(\) \{.*?\n\}", init_replace, content, flags=re.DOTALL)

# 5. Fix startPracticeMode and stopPracticeMode to support 'oot'
spm_target = "const container = type === 'custom' ? document.getElementById('custom-tab-output') : document.getElementById('song-display');"
spm_replace = "const container = type === 'custom' ? document.getElementById('custom-tab-output') : (type === 'oot' ? document.getElementById('oot-display') : document.getElementById('song-display'));"
content = content.replace(spm_target, spm_replace)

with open(path, "w") as f:
    f.write(content)

print("Done.")
