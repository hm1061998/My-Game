"""Generate T27 direction-A office SVG textures into apps/web/public/assets/office.

Original art authored by Claude (AI-assisted) for Office Case Files. Re-run after
editing; outputs are committed so the runtime never depends on this script.
"""
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / 'apps/web/public/assets/office'
INK = '#1d3b3a'
LW = 3

def svg(w, h, body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<defs>{defs}</defs>{body}</svg>\n')

HALFTONE = (f'<pattern id="ht" width="8" height="8" patternUnits="userSpaceOnUse">'
            f'<circle cx="2" cy="2" r="1.1" fill="{INK}" opacity=".10"/></pattern>')

def stroke(extra='', w=LW):
    return f'stroke="{INK}" stroke-width="{w}" stroke-linejoin="round" {extra}'

def shadow(cx, cy, rx, ry):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{INK}" opacity=".22"/>'

A = {}

# ---- floor tiles (128 px, seamless) ----
A['floor-lobby'] = svg(128, 128, (
    '<rect width="128" height="128" fill="#e9cfa3"/>'
    + ''.join(f'<rect x="0" y="{y}" width="128" height="32" fill="{c}"/>'
              for y, c in [(0, '#e6c898'), (32, '#edd5ab'), (64, '#e3c492'), (96, '#ebd1a5')])
    + ''.join(f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y + 32}" stroke="#c9a56f" stroke-width="2"/>'
              for x, y in [(40, 0), (104, 32), (20, 64), (84, 96)])
    + ''.join(f'<line x1="0" y1="{y}" x2="128" y2="{y}" stroke="#c9a56f" stroke-width="2"/>' for y in (0, 32, 64, 96))
    + '<path d="M10 14 q20 -4 40 0 M70 78 q16 -3 34 0" stroke="#d3b17c" stroke-width="1.5" fill="none"/>'))

A['floor-office'] = svg(128, 128, (
    '<rect width="128" height="128" fill="#bfe3d8"/>'
    '<rect x="0" y="0" width="64" height="64" fill="#b6ddd1"/><rect x="64" y="64" width="64" height="64" fill="#b6ddd1"/>'
    '<path d="M0 0H128V128H0Z M64 0V128 M0 64H128" stroke="#9fcabd" stroke-width="2" fill="none"/>'
    '<rect width="128" height="128" fill="url(#ht)"/>'), HALFTONE)

A['floor-archive'] = svg(128, 128, (
    '<rect width="128" height="128" fill="#efe3cc"/>'
    '<path d="M0 0H128V128H0Z M0 64H128 M64 0V64 M32 64V128 M96 64V128" stroke="#d8c7a6" stroke-width="2" fill="none"/>'
    '<rect width="128" height="128" fill="url(#ht)"/>'
    '<circle cx="90" cy="30" r="3" fill="#d8c7a6"/>'), HALFTONE)

A['floor-meeting'] = svg(128, 128, (
    '<rect width="128" height="128" fill="#cfe9dc"/>'
    + ''.join(f'<path d="M{x} 0 L{x + 64} 128" stroke="#b9dccb" stroke-width="10"/>' for x in (-64, 0, 64, 128))
    + '<rect width="128" height="128" fill="url(#ht)"/>'), HALFTONE)

# ---- furniture (bottom edge = footprint front; shadow band below) ----
# desk: footprint 250 wide; canvas 280x176, foot line y=160, footprint x 15..265
A['desk'] = svg(280, 176, (
    shadow(140, 162, 140, 14)
    + f'<rect x="15" y="92" width="250" height="68" rx="4" fill="#c7794f" {stroke()}/>'
    f'<rect x="25" y="104" width="100" height="44" rx="3" fill="#b0653f" {stroke(w=2)}/>'
    f'<rect x="155" y="104" width="100" height="18" rx="3" fill="#b0653f" {stroke(w=2)}/>'
    f'<rect x="155" y="128" width="100" height="20" rx="3" fill="#b0653f" {stroke(w=2)}/>'
    f'<circle cx="205" cy="113" r="3" fill="{INK}"/><circle cx="205" cy="138" r="3" fill="{INK}"/>'
    f'<path d="M5 92 L25 50 H255 L275 92 Z" fill="#e8a877" {stroke()}/>'
    f'<rect x="52" y="10" width="78" height="50" rx="4" fill="#2f6f6a" {stroke()}/>'
    '<rect x="60" y="18" width="62" height="34" rx="2" fill="#8fd3c1"/>'
    '<path d="M64 26h40M64 34h30M64 42h44" stroke="#1d3b3a" stroke-width="2" opacity=".5"/>'
    f'<rect x="84" y="60" width="14" height="10" fill="#3f5c5a" {stroke(w=2)}/>'
    f'<rect x="56" y="72" width="80" height="12" rx="3" fill="#fff6e6" {stroke(w=2)}/>'
    f'<g transform="rotate(-8 190 68)"><rect x="160" y="56" width="56" height="26" fill="#fff6e6" {stroke(w=2)}/>'
    '<path d="M166 64h40M166 71h30" stroke="#1d3b3a" stroke-width="1.5" opacity=".5"/></g>'
    f'<rect x="228" y="58" width="16" height="20" rx="3" fill="#e76f51" {stroke(w=2)}/>'))

# cabinet: footprint 120 wide; canvas 150x320, foot y=304, footprint x 15..135
A['cabinet'] = svg(150, 320, (
    shadow(75, 306, 75, 12)
    + f'<rect x="15" y="40" width="120" height="264" rx="4" fill="#4f8f88" {stroke()}/>'
    f'<path d="M15 40 L27 22 H123 L135 40" fill="#6fb1a6" {stroke()}/>'
    + ''.join(f'<rect x="27" y="{y}" width="96" height="54" rx="3" fill="#5ea39a" {stroke(w=2)}/>'
              f'<rect x="57" y="{y + 10}" width="36" height="14" fill="#fff6e6" {stroke(w=1.5)}/>'
              f'<rect x="65" y="{y + 32}" width="20" height="6" rx="3" fill="{INK}"/>' for y in (54, 118, 182, 246) if y + 54 <= 300)
    + f'<g transform="rotate(-4 75 20)"><rect x="40" y="2" width="70" height="26" fill="#e9c58f" {stroke(w=2)}/>'
    '<text x="75" y="20" font-family="Georgia,serif" font-size="11" font-weight="700" fill="#1d3b3a" text-anchor="middle">FILES</text></g>'))

# planter: footprint 130x70; canvas 170x200, foot y=186
A['planter'] = svg(170, 200, (
    shadow(85, 188, 80, 12)
    + '<ellipse cx="85" cy="82" rx="70" ry="60" fill="#3f8a67" stroke="#1d3b3a" stroke-width="3"/>'
    '<ellipse cx="55" cy="64" rx="38" ry="42" fill="#5aa469" stroke="#1d3b3a" stroke-width="3"/>'
    '<ellipse cx="118" cy="58" rx="36" ry="40" fill="#6fbf7a" stroke="#1d3b3a" stroke-width="3"/>'
    '<path d="M60 60 q10 -14 22 -4 M110 48 q10 -10 18 0" stroke="#1d3b3a" stroke-width="2" fill="none" opacity=".45"/>'
    f'<path d="M20 124 H150 L140 186 H30 Z" fill="#f4a261" {stroke()}/>'
    f'<rect x="14" y="116" width="142" height="16" rx="4" fill="#e76f51" {stroke()}/>'))

# meeting table: footprint 225x106; canvas 265x200, foot y=186, footprint x 20..245
A['meeting-table'] = svg(265, 200, (
    shadow(132, 188, 130, 14)
    + ''.join(f'<rect x="{x}" y="{y}" width="34" height="30" rx="8" fill="#2f6f6a" {stroke(w=2)}/>'
              for x, y in [(40, 30), (115, 22), (190, 30)])
    + f'<rect x="30" y="112" width="205" height="74" rx="6" fill="#4f8f88" {stroke()}/>'
    f'<ellipse cx="132" cy="96" rx="122" ry="50" fill="#8fd3c1" {stroke()}/>'
    '<ellipse cx="132" cy="92" rx="100" ry="36" fill="#a6e0cf"/>'
    f'<g transform="rotate(6 132 90)"><rect x="104" y="76" width="56" height="30" fill="#fff6e6" {stroke(w=2)}/>'
    '<path d="M110 85h40M110 93h28" stroke="#1d3b3a" stroke-width="1.5" opacity=".5"/></g>'
    f'<circle cx="70" cy="96" r="8" fill="#e76f51" {stroke(w=2)}/>'))

# ---- non-colliding decor ----
A['lamp'] = svg(60, 150, (
    shadow(30, 142, 22, 6)
    + f'<rect x="27" y="40" width="6" height="96" fill="#3f5c5a" {stroke(w=2)}/>'
    f'<ellipse cx="30" cy="138" rx="18" ry="6" fill="#3f5c5a" {stroke(w=2)}/>'
    f'<path d="M10 42 L18 8 H42 L50 42 Z" fill="#f4a261" {stroke()}/>'
    '<ellipse cx="30" cy="44" rx="18" ry="5" fill="#fff6e6" opacity=".8"/>'))

A['plant-small'] = svg(64, 100, (
    shadow(32, 94, 24, 6)
    + '<path d="M32 58 q-26 -20 -18 -50 q14 14 18 50 q4 -36 18 -50 q8 30 -18 50" fill="#5aa469" stroke="#1d3b3a" stroke-width="2.5"/>'
    f'<path d="M14 58 H50 L46 92 H18 Z" fill="#e76f51" {stroke(w=2.5)}/>'))

A['papers'] = svg(90, 50, (
    f'<g transform="rotate(-10 30 28)"><rect x="8" y="12" width="40" height="28" fill="#fff6e6" {stroke(w=2)}/></g>'
    f'<g transform="rotate(12 60 26)"><rect x="42" y="10" width="40" height="28" fill="#fff6e6" {stroke(w=2)}/>'
    '<path d="M48 18h26M48 25h20" stroke="#1d3b3a" stroke-width="1.5" opacity=".5"/></g>'))

A['water-cooler'] = svg(60, 140, (
    shadow(30, 134, 24, 6)
    + f'<rect x="12" y="56" width="36" height="76" rx="4" fill="#fff6e6" {stroke()}/>'
    f'<path d="M16 56 V20 q14 -16 28 0 V56 Z" fill="#9fd6ea" {stroke()}/>'
    f'<rect x="24" y="72" width="12" height="8" fill="#2f6f9f" {stroke(w=1.5)}/>'))

A['rug-lobby'] = svg(240, 150, (
    f'<ellipse cx="120" cy="75" rx="116" ry="70" fill="#e76f51" {stroke()}/>'
    '<ellipse cx="120" cy="75" rx="96" ry="54" fill="none" stroke="#fff6e6" stroke-width="4" stroke-dasharray="10 8"/>'
    '<text x="120" y="84" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#fff6e6" text-anchor="middle">WELCOME</text>'))

A['restricted-tape'] = svg(128, 16, (
    '<rect width="128" height="16" fill="#f4a261"/>'
    + ''.join(f'<path d="M{x} 16 L{x + 16} 0 H{x + 28} L{x + 12} 16 Z" fill="{INK}"/>' for x in range(-16, 128, 32))))

# ---- affordances ----
A['checkpoint-pad'] = svg(140, 80, (
    f'<ellipse cx="70" cy="46" rx="66" ry="30" fill="#2f8f6b" opacity=".25" {stroke("stroke-dasharray=\"10 6\"")}/>'
    f'<ellipse cx="70" cy="46" rx="40" ry="17" fill="#fff6e6" {stroke()}/>'
    f'<path d="M56 46 l10 9 l20 -18" fill="none" stroke="#2f8f6b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'))

A['scanner-drone'] = svg(80, 80, (
    f'<circle cx="40" cy="40" r="26" fill="#2f6f6a" {stroke()}/>'
    f'<path d="M4 34 H18 M62 34 H76" {stroke("stroke-linecap=\"round\"", w=4)}/>'
    f'<circle cx="40" cy="40" r="13" fill="#fff6e6" {stroke(w=2)}/>'
    '<circle cx="40" cy="40" r="6" fill="#c8442f"/>'
    '<path d="M40 8 V2" stroke="#1d3b3a" stroke-width="3"/><circle cx="40" cy="2" r="2.5" fill="#f4a261"/>'))

A['evidence-card'] = svg(56, 56, (
    f'<rect x="6" y="8" width="44" height="40" rx="5" fill="#fff6e6" {stroke()}/>'
    f'<path d="M6 16 H50" {stroke(w=2)}/>'
    '<rect x="10" y="4" width="18" height="8" rx="2" fill="#f4a261" stroke="#1d3b3a" stroke-width="2"/>'))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, text in A.items():
        (OUT / f'{name}.svg').write_text(text, encoding='utf-8')
    print(f'wrote {len(A)} assets to {OUT}')


if __name__ == '__main__':
    main()
