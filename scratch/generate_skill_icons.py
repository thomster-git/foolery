import os

skills = {
    "Attack": {
        "color": "#ef4444",
        "bg": "#450a0a",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="atkGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="#200d0d" stroke="#ef4444" stroke-width="2"/>
  <!-- Crossed Swords -->
  <path d="M16 16 L48 48 M48 16 L16 48" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
  <path d="M12 12 L20 20 M44 44 L52 52 M52 12 L44 20 M20 44 L12 52" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="5" fill="#fca5a5"/>
  <polygon points="12,12 10,16 16,10" fill="#f87171"/>
  <polygon points="52,12 54,16 48,10" fill="#f87171"/>
</svg>"""
    },
    "Magic": {
        "color": "#3b82f6",
        "bg": "#0f172a",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="magGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="#0b1329" stroke="#3b82f6" stroke-width="2"/>
  <!-- Wizard Hat / Spark -->
  <path d="M32 10 L48 46 L16 46 Z" fill="url(#magGrad)" stroke="#93c5fd" stroke-width="2"/>
  <ellipse cx="32" cy="46" rx="20" ry="6" fill="#1e40af" stroke="#93c5fd" stroke-width="2"/>
  <circle cx="32" cy="26" r="3" fill="#ffffff"/>
  <polygon points="46,18 48,22 52,22 49,25 50,29 46,27 42,29 43,25 40,22 44,22" fill="#fbbf24"/>
</svg>"""
    },
    "Ranged": {
        "color": "#22c55e",
        "bg": "#052e16",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#072211" stroke="#22c55e" stroke-width="2"/>
  <!-- Bow and Arrow -->
  <path d="M20 48 C 12 36, 12 28, 20 16" fill="none" stroke="#ca8a04" stroke-width="4" stroke-linecap="round"/>
  <line x1="20" y1="16" x2="20" y2="48" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="2,2"/>
  <!-- Arrow -->
  <line x1="16" y1="32" x2="48" y2="32" stroke="#f8fafc" stroke-width="3" stroke-linecap="round"/>
  <polygon points="48,26 56,32 48,38" fill="#22c55e"/>
  <line x1="16" y1="28" x2="19" y2="32" stroke="#ef4444" stroke-width="2"/>
  <line x1="16" y1="36" x2="19" y2="32" stroke="#ef4444" stroke-width="2"/>
</svg>"""
    },
    "Mining": {
        "color": "#f59e0b",
        "bg": "#451a03",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#241407" stroke="#f59e0b" stroke-width="2"/>
  <!-- Pickaxe -->
  <path d="M18 18 C 30 14, 42 20, 48 30" fill="none" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
  <polygon points="48,28 54,34 46,36" fill="#cbd5e1"/>
  <line x1="32" y1="20" x2="16" y2="50" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
  <!-- Ore chunk -->
  <polygon points="42,46 50,42 54,48 48,54 40,52" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
</svg>"""
    },
    "Woodcutting": {
        "color": "#10b981",
        "bg": "#064e3b",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#09291e" stroke="#10b981" stroke-width="2"/>
  <!-- Wood axe -->
  <line x1="20" y1="48" x2="44" y2="20" stroke="#92400e" stroke-width="5" stroke-linecap="round"/>
  <path d="M38 16 C 46 14, 52 22, 46 30 C 42 32, 40 24, 38 16 Z" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
  <circle cx="22" cy="48" r="4" fill="#78350f"/>
  <path d="M14 44 C 18 42, 22 46, 26 44" stroke="#10b981" stroke-width="2" fill="none"/>
</svg>"""
    },
    "Artisan": {
        "color": "#ea580c",
        "bg": "#431407",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#230d07" stroke="#ea580c" stroke-width="2"/>
  <!-- Anvil and Hammer -->
  <path d="M16 38 L48 38 L44 48 L20 48 Z" fill="#64748b" stroke="#94a3b8" stroke-width="2"/>
  <rect x="24" y="32" width="16" height="6" fill="#475569"/>
  <!-- Hammer -->
  <line x1="22" y1="18" x2="38" y2="30" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
  <polygon points="18,14 26,20 22,24 14,18" fill="#ea580c"/>
  <circle cx="34" cy="34" r="2" fill="#fed7aa"/>
</svg>"""
    },
    "Construction": {
        "color": "#d97706",
        "bg": "#451a03",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#241305" stroke="#d97706" stroke-width="2"/>
  <!-- Saw & Planks -->
  <rect x="14" y="36" width="36" height="12" rx="2" fill="#b45309" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="20" cy="42" r="2" fill="#78350f"/>
  <!-- Saw Blade -->
  <path d="M22 18 L46 32 L42 36 L18 22 Z" fill="#94a3b8"/>
  <polygon points="46,32 50,30 48,35 44,34" fill="#cbd5e1"/>
  <circle cx="20" cy="20" r="4" fill="#d97706"/>
</svg>"""
    },
    "Cooking": {
        "color": "#f97316",
        "bg": "#431407",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#260f06" stroke="#f97316" stroke-width="2"/>
  <!-- Chef hat / Pot -->
  <path d="M20 36 L44 36 C 44 46, 20 46, 20 36 Z" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <path d="M22 34 C 18 26, 26 20, 32 24 C 38 20, 46 26, 42 34 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Fire / Steam -->
  <path d="M30 46 Q 32 52 34 46" stroke="#f97316" stroke-width="3" fill="none"/>
  <circle cx="32" cy="50" r="2" fill="#fbbf24"/>
</svg>"""
    },
    "Runecrafting": {
        "color": "#8b5cf6",
        "bg": "#2e1065",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#170933" stroke="#8b5cf6" stroke-width="2"/>
  <!-- Rune Stone -->
  <circle cx="32" cy="32" r="18" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
  <!-- Arcane Rune Sigil -->
  <path d="M32 20 L32 44 M24 28 L40 28 M26 38 L38 38" stroke="#c084fc" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="4" fill="#e9d5ff"/>
</svg>"""
    },
    "Farming": {
        "color": "#84cc16",
        "bg": "#1a2e05",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#0d1f03" stroke="#84cc16" stroke-width="2"/>
  <!-- Sprout / Wheat -->
  <path d="M32 48 L32 26" stroke="#65a30d" stroke-width="4" stroke-linecap="round"/>
  <path d="M32 34 C 24 30, 20 22, 28 20 C 32 26, 32 30, 32 34 Z" fill="#84cc16"/>
  <path d="M32 28 C 40 24, 44 16, 36 14 C 32 20, 32 24, 32 28 Z" fill="#a3e635"/>
  <ellipse cx="32" cy="48" rx="14" ry="4" fill="#3f2305"/>
</svg>"""
    },
    "Fishing": {
        "color": "#06b6d4",
        "bg": "#083344",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#041b24" stroke="#06b6d4" stroke-width="2"/>
  <!-- Fish -->
  <path d="M18 32 C 26 22, 42 24, 48 32 C 42 40, 26 42, 18 32 Z" fill="#22d3ee" stroke="#0891b2" stroke-width="2"/>
  <polygon points="18,32 12,24 12,40" fill="#06b6d4"/>
  <circle cx="42" cy="30" r="2" fill="#083344"/>
  <!-- Hook -->
  <path d="M44 26 C 46 22, 50 26, 48 32" stroke="#f1f5f9" stroke-width="2" fill="none"/>
</svg>"""
    },
    "Agility": {
        "color": "#a855f7",
        "bg": "#3b0764",
        "svg": """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#1e0433" stroke="#a855f7" stroke-width="2"/>
  <!-- Winged Boot / Runner -->
  <path d="M22 36 L34 36 L44 44 L20 44 Z" fill="#c084fc" stroke="#e9d5ff" stroke-width="2"/>
  <!-- Wings -->
  <path d="M26 34 C 20 24, 32 22, 38 28 C 32 30, 28 32, 26 34 Z" fill="#a855f7"/>
  <path d="M34 28 C 30 18, 42 16, 48 22 C 42 24, 38 26, 34 28 Z" fill="#d8b4fe"/>
  <circle cx="44" cy="44" r="2" fill="#f3e8ff"/>
</svg>"""
    }
}

target_dir = "/home/keel/Project-Atlas-main/website/static/images/skills"
os.makedirs(target_dir, exist_ok=True)

for name, data in skills.items():
    filepath = os.path.join(target_dir, f"{name}.svg")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(data["svg"])
    print(f"Generated {filepath}")

print("All 12 skill icons generated successfully!")
