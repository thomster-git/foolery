#!/usr/bin/env python3
"""Patch ocarina.html with:
  1. Organic teardrop SVG body that looks like the reference image
  2. Fixed Zelda's Lullaby note durations
  3. Fixed Saria's Song (G4→A4, eighth-note rhythms)
"""

PATH = '/home/keel/Project-Atlas-main/website/templates/layouts/ocarina.html'

with open(PATH, 'r') as f:
    content = f.read()

# ─────────────────────────────────────────────────────────────────────────────
# 1. REPLACE renderHoleSVG — organic teardrop body + drop shadow
# ─────────────────────────────────────────────────────────────────────────────
OLD_FN_START = 'function renderHoleSVG(holes) {'
OLD_FN_END   = '  return `<svg width="160" height="90" viewBox="0 0 160 90" style="display:block;margin:0 auto;">${parts}</svg>`;\n}'

start = content.find(OLD_FN_START)
end   = content.find(OLD_FN_END)
assert start != -1, "Could not find renderHoleSVG start"
assert end   != -1, "Could not find renderHoleSVG end"
end += len(OLD_FN_END)

NEW_FN = r"""function renderHoleSVG(holes) {
  // holes = [L1,L2,L3,L4, R1,R2,R3,R4, LS,RS]
  // Teardrop body — mouthpiece on LEFT, wider/rounder on RIGHT.
  // ViewBox 190 x 100.  Body: smooth bezier teardrop ~x:32-178, y:14-86
  // All 10 hole positions verified inside the body path.

  const BODY      = '#4e9463';   // medium forest green
  const BSTROKE   = '#2a5c35';   // dark green outline
  const SHADOW    = 'rgba(0,0,0,0.22)';
  const COVERED   = '#111827';   // near-black — hole blocked
  const OPEN      = '#ffffff';   // white      — hole open
  const SUBPART   = '#7c3aed';   // purple     — partial sub-hole
  const HSTROKE   = '#1a3d24';   // ring around every hole

  // Teardrop body path (left side tighter, right side rounder)
  const BODY_PATH = 'M 34,50 C 34,24 70,14 114,14 C 158,14 178,30 178,50 C 178,70 158,86 114,86 C 70,86 34,76 34,50 Z';
  // Shadow version: shift right+down 2px, slightly larger
  const SHAD_PATH = 'M 36,52 C 36,26 72,16 116,16 C 160,16 180,32 180,52 C 180,72 160,88 116,88 C 72,88 36,78 36,52 Z';
  // Mouthpiece: small oval pill extending from left tip of body
  const MP_PATH   = 'M 34,44 C 20,44 8,47 8,50 C 8,53 20,56 34,56 Z';
  const MP_SHAD   = 'M 36,46 C 22,46 10,49 10,52 C 10,55 22,58 36,58 Z';

  function hole(cx, cy, val, r) {
    r = r || 5.5;
    var fill = val === 1 ? COVERED : (val === 0.5 ? SUBPART : OPEN);
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + fill + '" stroke="' + HSTROKE + '" stroke-width="1.4"/>';
  }

  var parts = [
    // Drop shadows (drawn first, behind everything)
    '<path d="' + MP_SHAD   + '" fill="' + SHADOW + '"/>',
    '<path d="' + SHAD_PATH + '" fill="' + SHADOW + '"/>',

    // Mouthpiece
    '<path d="' + MP_PATH   + '" fill="' + BODY + '" stroke="' + BSTROKE + '" stroke-width="1.5"/>',
    // Body
    '<path d="' + BODY_PATH + '" fill="' + BODY + '" stroke="' + BSTROKE + '" stroke-width="2"/>',

    // Specular gleam — top-left arc gives a slight 3-D lift
    '<ellipse cx="92" cy="30" rx="32" ry="12" fill="rgba(255,255,255,0.13)" transform="rotate(-8,92,30)"/>',

    // ── LEFT HAND  L1(index,top) → L4(pinky,bottom) ──
    hole(79, 28, holes[0]),   // L1
    hole(79, 40, holes[1]),   // L2
    hole(79, 52, holes[2]),   // L3
    hole(79, 64, holes[3]),   // L4

    // ── RIGHT HAND ──
    hole(136, 28, holes[4]),  // R1
    hole(136, 40, holes[5]),  // R2
    hole(136, 52, holes[6]),  // R3
    hole(136, 64, holes[7]),  // R4

    // ── SUB-HOLES (small, between columns, lower body) ──
    hole(98,  76, holes[8], 4.2),   // LS
    hole(116, 76, holes[9], 4.2),   // RS

    // Subtle centre divider between hands
    '<line x1="108" y1="16" x2="108" y2="71" stroke="' + BSTROKE + '" stroke-width="0.65" stroke-dasharray="2,3.5" opacity="0.4"/>',

    // L / R labels
    '<text x="79"  y="15" font-size="8" fill="rgba(255,255,255,0.65)" text-anchor="middle" font-family="sans-serif" font-weight="600">L</text>',
    '<text x="136" y="15" font-size="8" fill="rgba(255,255,255,0.65)" text-anchor="middle" font-family="sans-serif" font-weight="600">R</text>',
  ].join('');

  return '<svg width="190" height="100" viewBox="0 0 190 100" style="display:block;margin:0 auto;">' + parts + '</svg>';
}"""

content = content[:start] + NEW_FN + content[end:]
assert 'Teardrop body' in content, "SVG replacement failed"
print("✓ renderHoleSVG replaced")

# ─────────────────────────────────────────────────────────────────────────────
# 2. FIX ZELDA'S LULLABY — A4 should be quarter note, not half
# ─────────────────────────────────────────────────────────────────────────────
OLD_ZELDA = """      { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'A4', dur: 'h' },
      { n: 'G4', dur: 'q' }, { n: 'A4', dur: 'q' }, { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' },
      { n: 'B4', dur: 'h' },
      { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'A4', dur: 'h' },
      { n: 'G4', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'D5', dur: 'h' },"""

NEW_ZELDA = """      // Phrase 1
      { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'A4', dur: 'q' },
      { n: 'G4', dur: 'q' }, { n: 'A4', dur: 'q' }, { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' },
      { n: 'B4', dur: 'h' },
      // Phrase 2
      { n: 'B4', dur: 'q' }, { n: 'D5', dur: 'q' }, { n: 'A4', dur: 'q' },
      { n: 'G4', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'D5', dur: 'h' },"""

assert OLD_ZELDA in content, "Zelda's Lullaby block not found"
content = content.replace(OLD_ZELDA, NEW_ZELDA)
print("✓ Zelda's Lullaby durations fixed")

# ─────────────────────────────────────────────────────────────────────────────
# 3. FIX SARIA'S SONG — G4→A4, add eighth-note rhythms for triplet motif
# ─────────────────────────────────────────────────────────────────────────────
OLD_SARIA = """      { n: 'F4', dur: 'q' }, { n: 'A4', dur: 'q' }, { n: 'B4', dur: 'q' },
      { n: 'F4', dur: 'q' }, { n: 'A4', dur: 'q' }, { n: 'B4', dur: 'q' },
      { n: 'F4', dur: 'q' }, { n: 'A4', dur: 'q' }, { n: 'B4', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'D5', dur: 'h' },
      { n: 'B4', dur: 'q' }, { n: 'C5', dur: 'q' }, { n: 'B4', dur: 'q' }, { n: 'G4', dur: 'q' },
      { n: 'E4', dur: 'h' },"""

NEW_SARIA = """      // The F-A-B motif is a quick triplet (eighth notes)
      { n: 'F4', dur: 'e' }, { n: 'A4', dur: 'e' }, { n: 'B4', dur: 'e' },
      { n: 'F4', dur: 'e' }, { n: 'A4', dur: 'e' }, { n: 'B4', dur: 'e' },
      { n: 'F4', dur: 'e' }, { n: 'A4', dur: 'e' }, { n: 'B4', dur: 'q' }, { n: 'E5', dur: 'q' }, { n: 'D5', dur: 'q' },
      // G4 corrected → A4
      { n: 'B4', dur: 'q' }, { n: 'C5', dur: 'q' }, { n: 'B4', dur: 'q' }, { n: 'A4', dur: 'q' },
      { n: 'E4', dur: 'h' },"""

assert OLD_SARIA in content, "Saria's Song block not found"
content = content.replace(OLD_SARIA, NEW_SARIA)
print("✓ Saria's Song corrected (G4→A4, eighth notes)")

# ─────────────────────────────────────────────────────────────────────────────
# 4. WIDEN CARD GRID to fit the larger 190px SVG
# ─────────────────────────────────────────────────────────────────────────────
content = content.replace(
    'minmax(175px, 1fr)',
    'minmax(210px, 1fr)'
)
print("✓ Card grid width updated")

with open(PATH, 'w') as f:
    f.write(content)
print("✓ File written")
