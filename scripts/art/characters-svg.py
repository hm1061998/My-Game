"""Generate direction-A character sprite sheets and dedicated dialogue portraits.

Original SVG art authored in-repo for Office Case Files, refined in T31.
Sheet layout: rows down/up/side (side faces right; runtime mirrors for left),
columns idle 0-3, walk 4-9, run 10-15. Frame 80x120, foot at (40, 112).
Outputs are committed; the runtime never depends on this script.
"""
from math import pi, sin
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / 'apps/web/public/assets/characters'
INK = '#1d3b3a'
FW, FH, FOOT = 80, 120, 112
ROWS = ['down', 'up', 'side']
STATES = [('idle', 4), ('walk', 6), ('run', 6)]

CHARACTERS = {
    'player': dict(jacket='#d65b45', shade='#a9453c', accent='#f3bd72', hair='#433536', skin='#f0bd91', pants='#2f4858', hair_style='short', coat=True),
    'maya': dict(jacket='#4a7da2', shade='#335b7b', accent='#9fd2e5', hair='#302c3e', skin='#d99c72', pants='#2b3a4a', hair_style='bob'),
    'leo': dict(jacket='#4e8c6b', shade='#356b55', accent='#b8df9b', hair='#593b2e', skin='#e6ad7e', pants='#3a3a48', hair_style='spiky', glasses=True),
    'nora': dict(jacket='#8b62a4', shade='#67447d', accent='#e4b4e8', hair='#3f3036', skin='#f0bd91', pants='#34304a', hair_style='bun', clipboard=True),
}


def st(w=2.5):
    return f'stroke="{INK}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'


def pose(state, i, n):
    if state == 'idle':
        return dict(bob=[0, -1, -2, -1][i], stride=0.0, arm=0.0, lean=0)
    ph = i / n * 2 * pi
    k = 1 if state == 'walk' else 1.7
    return dict(bob=-abs(sin(ph)) * 2 * k, stride=6 * k * sin(ph), arm=5 * k * sin(ph), lean=0 if state == 'walk' else 3)


def hair_back(c, row, b):
    h, s = c['hair'], c['hair_style']
    out = ''
    if s == 'bob':
        out += f'<path d="M22 {27+b} Q21 {9+b} 40 {10+b} Q60 {9+b} 58 {28+b} L61 {45+b} Q55 {51+b} 49 {43+b} L31 {43+b} Q24 {51+b} 19 {44+b}Z" fill="{h}" {st()}/>'
    if s == 'bun':
        out += f'<circle cx="{40 if row != "side" else 30}" cy="{10 + b}" r="9" fill="{h}" {st()}/><circle cx="{40 if row != "side" else 30}" cy="{10+b}" r="4" fill="#65505a"/>'
    return out


def hair_front(c, row, b):
    h, s = c['hair'], c['hair_style']
    if row == 'up':
        return f'<circle cx="40" cy="{30 + b}" r="16" fill="{h}" {st()}/>'
    if row == 'side':
        cap = f'<path d="M24 {30 + b} a16 16 0 0 1 30 -8 q-10 -2 -14 6 q-6 8 -16 2z" fill="{h}" {st()}/>'
        if s == 'spiky':
            cap += f'<path d="M26 {18 + b} l4 -8 l4 6 l5 -8 l4 7 l5 -6 l2 8" fill="{h}" {st(2)}/>'
        return cap
    if s == 'spiky':
        return f'<path d="M24 {26 + b} l3 -12 l5 6 l4 -10 l4 9 l5 -10 l4 10 l5 -6 l2 13 q-16 -6 -32 0z" fill="{h}" {st(2)}/>'
    if s == 'bob':
        return f'<path d="M24 {28 + b} q2 -16 16 -16 q14 0 16 16 q-8 -8 -16 -6 q-8 -2 -16 6z" fill="{h}" {st(2)}/>'
    return f'<path d="M24 {28 + b} q0 -16 16 -16 q16 0 16 16 q-6 -6 -16 -5 q-10 -1 -16 5z" fill="{h}" {st(2)}/>'


def face(c, row, b):
    if row == 'up':
        return ''
    if row == 'side':
        out = f'<path d="M45 {25+b} l5 -1" {st(1.3)}/><circle cx="48" cy="{30 + b}" r="1.8" fill="{INK}"/><path d="M55 {32 + b} l3 2 l-3 1 M49 {39+b} q4 2 6 -1" fill="none" {st(1.3)}/>'
        if c.get('glasses'):
            out += f'<circle cx="48" cy="{30 + b}" r="4.5" fill="none" {st(1.6)}/><path d="M44 {29 + b} H34" {st(1.6)}/>'
        return out
    out = (f'<path d="M30 {26+b} q4 -2 7 0 M43 {26+b} q4 -2 7 0" fill="none" {st(1.3)}/>'
           f'<circle cx="34" cy="{31 + b}" r="1.8" fill="{INK}"/><circle cx="46" cy="{31 + b}" r="1.8" fill="{INK}"/>'
           f'<path d="M40 {32+b} l-1 3 l2 0 M36 {39 + b} q4 3 8 0" fill="none" {st(1.35)}/>')
    if c.get('glasses'):
        out += (f'<circle cx="34" cy="{31 + b}" r="4.5" fill="none" {st(1.6)}/>'
                f'<circle cx="46" cy="{31 + b}" r="4.5" fill="none" {st(1.6)}/><path d="M38.5 {31 + b} H41.5" {st(1.6)}/>')
    return out


def frame(c, row, state, i, n):
    p = pose(state, i, n)
    b, s, a, lean = p['bob'], p['stride'], p['arm'], p['lean']
    body_bottom = 90 if c.get('coat') else 82
    parts = []
    # legs
    if row == 'side':
        for dx, col in ((s, c['pants']), (-s, c['pants'])):
            parts.append(f'<path d="M40 {80 + b} L{40 + dx} {FOOT - 4}" stroke="{INK}" stroke-width="12" stroke-linecap="round"/>'
                         f'<path d="M40 {80 + b} L{40 + dx} {FOOT - 4}" stroke="{col}" stroke-width="7" stroke-linecap="round"/>'
                         f'<ellipse cx="{43 + dx}" cy="{FOOT - 2}" rx="7" ry="3.5" fill="{INK}"/>')
    else:
        for x, lift in ((33, max(0, s)), (47, max(0, -s))):
            parts.append(f'<rect x="{x - 5}" y="{78 + b}" width="10" height="{FOOT - 80 - b - lift * .7}" rx="4" fill="{c["pants"]}" {st(2)}/>'
                         f'<path d="M{x-3} {86+b} v16" stroke="#77919a" stroke-width="1.4" opacity=".55"/>'
                         f'<ellipse cx="{x}" cy="{FOOT - 2 - lift * .7}" rx="6.5" ry="3.5" fill="{INK}"/>')
    # back arm (side view)
    if row == 'side':
        parts.append(f'<path d="M40 {52 + b} L{40 - a + lean} {76 + b}" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>'
                     f'<path d="M40 {52 + b} L{40 - a + lean} {76 + b}" stroke="{c["jacket"]}" stroke-width="5.5" stroke-linecap="round" opacity=".8"/>')
    parts.append(hair_back(c, row, b))
    if c.get('coat'):
        sway = s * .28
        parts.append(f'<path d="M27 {72+b} L{24-sway} {96+b} Q31 {99+b} 40 {91+b} Q49 {99+b} {56+sway} {96+b} L53 {72+b}Z" fill="{c["shade"]}" {st(2)}/>')
    # torso
    tx = 23 + (lean if row == 'side' else 0)
    tw = 34 if row != 'side' else 28
    if row == 'side':
        tx = 26 + lean
    parts.append(f'<rect x="{tx}" y="{46 + b}" width="{tw}" height="{body_bottom - 46}" rx="9" fill="{c["jacket"]}" {st()}/>')
    parts.append(f'<path d="M{tx+tw-9} {48+b} q8 1 7 8 v{body_bottom-63} q-5 3 -9 1z" fill="{c["shade"]}" opacity=".7"/>')
    if row == 'down':
        parts.append(f'<path d="M31 {47+b} L40 {58+b} L49 {47+b} L45 {61+b} L40 {58+b} L35 {61+b}Z" fill="{c["accent"]}" {st(1.8)}/>')
        if c.get('coat'):
            parts.append(f'<path d="M40 {58+b} V{body_bottom-2+b} M34 {65+b} h2 M34 {74+b} h2" {st(1.6)}/>'
                         f'<rect x="45" y="{64+b}" width="8" height="11" rx="1.5" fill="#fff6e6" {st(1.4)}/>'
                         f'<path d="M47 {67+b} h4 M47 {70+b} h3" {st(1)}/>'
                         f'<path d="M28 {47+b} Q40 {53+b} 52 {47+b} l1 5 Q40 {58+b} 27 {52+b}Z" fill="{c["accent"]}" {st(1.5)}/>')
        elif c.get('glasses'):
            parts.append(f'<path d="M40 {59+b} l-3 10 l3 5 l3 -5z" fill="{c["accent"]}" {st(1.3)}/>'
                         f'<path d="M27 {65+b} h8 M45 {65+b} h8" stroke="{c["shade"]}" stroke-width="2"/>')
        elif c.get('clipboard'):
            parts.append(f'<path d="M32 {57+b} Q40 {68+b} 48 {57+b}" fill="none" stroke="{c["accent"]}" stroke-width="3"/>'
                         f'<circle cx="40" cy="{69+b}" r="2.3" fill="{c["accent"]}" {st(1)}/>')
        else:
            parts.append(f'<path d="M28 {59+b} L35 {51+b} L40 {59+b} L45 {51+b} L52 {59+b}" fill="none" stroke="{c["shade"]}" stroke-width="2"/>'
                         f'<path d="M45 {71+b} h7" stroke="{c["accent"]}" stroke-width="2"/>')
    if row == 'up' and c.get('coat'):
        parts.append(f'<path d="M40 {50+b} V{body_bottom-2+b} M30 {58+b} h20" {st(1.8)}/>')
    # front arms
    if row == 'side':
        parts.append(f'<path d="M42 {52 + b} L{42 + a + lean} {76 + b}" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>'
                     f'<path d="M42 {52 + b} L{42 + a + lean} {76 + b}" stroke="{c["jacket"]}" stroke-width="5.5" stroke-linecap="round"/>'
                     f'<circle cx="{42 + a + lean}" cy="{78 + b}" r="4" fill="{c["skin"]}" {st(1.8)}/>')
    else:
        for x, dy in ((19, a), (61, -a)):
            parts.append(f'<rect x="{x - 4}" y="{50 + b + dy * .4}" width="8" height="26" rx="4" fill="{c["jacket"]}" {st(2)}/>'
                         f'<path d="M{x-3} {70+b+dy*.4} h6" stroke="{c["shade"]}" stroke-width="2"/>'
                         f'<circle cx="{x}" cy="{78 + b + dy * .4}" r="4" fill="{c["skin"]}" {st(1.8)}/>')
        if row == 'down' and c.get('clipboard'):
            parts.append(f'<rect x="54" y="{60 + b}" width="16" height="20" rx="2" fill="{c["accent"]}" {st(2)}/>'
                         f'<path d="M58 {66 + b} h8 M58 {71 + b} h6" {st(1.4)}/>')
    # head
    hx = 40 + (lean if row == 'side' else 0)
    parts.append(f'<circle cx="{hx}" cy="{30 + b}" r="16" fill="{c["skin"]}" {st()}/>'
                 f'<path d="M{hx-11} {37+b} q11 10 22 0" fill="none" stroke="#b77e65" stroke-width="1.3" opacity=".55"/>')
    head = hair_front(c, row, b) + face(c, row, b)
    if lean and row == 'side':
        head = f'<g transform="translate({lean} 0)">{head}</g>'
    parts.append(head)
    return ''.join(parts)


def sheet(c):
    body = []
    for r, row in enumerate(ROWS):
        col = 0
        for state, n in STATES:
            for i in range(n):
                body.append(f'<g transform="translate({col * FW} {r * FH})">{frame(c, row, state, i, n)}</g>')
                col += 1
    w, h = FW * 16, FH * len(ROWS)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{"".join(body)}</svg>\n'


def portrait(cid, c):
    """Editorial shoulder-up illustration; never upscale a gameplay frame."""
    hair = c['hair']
    back = ''
    front = ''
    if cid == 'maya':
        back = f'<path d="M47 63 Q41 18 79 18 Q117 19 114 64 L121 112 Q113 125 102 108 L57 108 Q43 122 39 107Z" fill="{hair}" {st(3)}/>'
        front = f'<path d="M49 60 Q42 28 77 22 Q105 22 110 51 Q96 42 89 40 Q70 57 49 60Z" fill="{hair}" {st(2.5)}/><path d="M55 51 Q73 49 89 35" fill="none" stroke="#615269" stroke-width="2.5"/>'
    elif cid == 'leo':
        front = f'<path d="M50 55 L50 35 L61 42 L64 25 L73 35 L83 21 L90 34 L102 27 L101 45 L111 44 L109 58 Q86 46 50 55Z" fill="{hair}" {st(2.5)}/><path d="M63 37 L66 46 M84 35 L86 44" stroke="#8b684b" stroke-width="2"/>'
    elif cid == 'nora':
        back = f'<circle cx="84" cy="22" r="17" fill="{hair}" {st(3)}/><path d="M49 60 Q48 23 80 24 Q115 24 111 64 L106 95 L54 95Z" fill="{hair}" {st(2.5)}/>'
        front = f'<path d="M50 59 Q47 29 77 28 Q107 28 110 58 Q93 49 85 39 Q72 56 50 59Z" fill="{hair}" {st(2.5)}/><path d="M79 32 Q92 33 100 44" fill="none" stroke="#66505d" stroke-width="2"/>'
    else:
        front = f'<path d="M49 56 Q46 28 73 24 Q99 19 110 46 L109 55 Q101 45 90 46 L84 39 Q68 53 49 56Z" fill="{hair}" {st(2.5)}/><path d="M53 43 Q68 35 76 30 M84 32 Q94 35 98 42" fill="none" stroke="#795a55" stroke-width="2.5"/>'

    accessory = ''
    if cid == 'player':
        accessory = ('<path d="M44 103 L65 118 L79 132 L59 121Z M116 103 L95 118 L81 132 L101 121Z" fill="#f3bd72" '
                     f'{st(2)}/><path d="M80 114 V158 M68 135 h3 M68 145 h3" {st(2)}/>'
                     '<rect x="100" y="126" width="13" height="20" rx="2" fill="#fff6e6" '
                     f'{st(1.8)}/><path d="M103 131 h7 M103 135 h5" {st(1)}/>')
    elif cid == 'maya':
        accessory = (f'<path d="M48 108 L66 132 L80 115 L94 132 L112 108" fill="none" stroke="{c["shade"]}" stroke-width="4"/>'
                     f'<path d="M99 133 h15" stroke="{c["accent"]}" stroke-width="4"/>')
    elif cid == 'leo':
        accessory = (f'<path d="M64 109 L80 123 L96 109 L83 141 L80 153 L77 141Z" fill="{c["accent"]}" {st(2)}/>'
                     f'<path d="M46 118 Q58 124 62 150 M114 118 Q102 124 98 150" fill="none" stroke="{c["shade"]}" stroke-width="3"/>')
    else:
        accessory = (f'<path d="M59 111 Q80 130 101 111" fill="none" stroke="{c["accent"]}" stroke-width="5"/>'
                     f'<circle cx="80" cy="137" r="4" fill="{c["accent"]}" {st(1.5)}/>'
                     '<g transform="rotate(-8 126 134)"><rect x="113" y="112" width="31" height="47" rx="3" fill="#e8d6ae" '
                     f'{st(2)}/><path d="M118 123 h20 M118 130 h17 M118 137 h19" {st(1.4)}/></g>')

    brows = ('<path d="M61 66 l11 -4 M90 62 l10 4"' if cid == 'player' else
             '<path d="M61 64 q6 -3 12 -1 M89 63 q6 -2 12 1"' if cid == 'maya' else
             '<path d="M60 63 q7 -2 12 0 M89 63 q7 -2 12 0"' if cid == 'leo' else
             '<path d="M60 65 q6 -5 12 -3 M89 62 q6 -2 12 3"')
    mouth = ('M72 90 Q80 93 88 89' if cid == 'player' else
             'M72 89 Q80 96 89 89' if cid == 'maya' else
             'M72 89 Q80 95 88 89' if cid == 'leo' else
             'M74 90 Q80 87 87 90')
    eyes = (f'<path d="M62 71 q5 -3 10 0 M89 71 q5 -3 10 0" {st(2)}/>'
            f'<circle cx="67" cy="72" r="2.7" fill="{INK}"/><circle cx="94" cy="72" r="2.7" fill="{INK}"/>'
            '<circle cx="68" cy="71" r=".8" fill="#fff8e8"/><circle cx="95" cy="71" r=".8" fill="#fff8e8"/>')
    glasses = (f'<rect x="57" y="65" width="22" height="16" rx="7" fill="none" {st(2.5)}/>'
               f'<rect x="83" y="65" width="22" height="16" rx="7" fill="none" {st(2.5)}/>'
               f'<path d="M79 69 h4 M57 69 l-7 -3 M105 69 l7 -3" {st(2)}/>' if cid == 'leo' else '')
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">'
            '<defs><clipPath id="c"><circle cx="80" cy="80" r="76"/></clipPath></defs>'
            f'<circle cx="80" cy="80" r="76" fill="#efe3cc" {st(4)}/>'
            f'<g clip-path="url(#c)"><circle cx="80" cy="80" r="76" fill="{c["accent"]}" opacity=".27"/>'
            '<path d="M-2 113 Q75 76 164 35 M-3 131 Q83 91 170 52" fill="none" stroke="#fff8e8" stroke-width="8" opacity=".27"/>'
            f'{back}<path d="M13 161 Q20 111 61 106 L80 119 L99 106 Q141 111 148 161Z" fill="{c["jacket"]}" {st(3)}/>'
            f'<path d="M88 118 Q126 114 138 153 L147 162 L81 162Z" fill="{c["shade"]}" opacity=".55"/>'
            f'<path d="M68 99 L68 113 Q80 126 92 113 L92 99" fill="{c["skin"]}" {st(2.5)}/>'
            f'<path d="M49 59 Q49 32 80 29 Q111 32 111 59 L109 81 Q106 106 80 110 Q54 106 51 81Z" fill="{c["skin"]}" {st(3)}/>'
            '<path d="M56 84 Q62 99 80 102 Q98 99 104 84" fill="none" stroke="#b77e65" stroke-width="2" opacity=".55"/>'
            f'{front}{brows} fill="none" {st(2.1)}/>{eyes}{glasses}'
            f'<path d="M80 73 l-3 11 q3 2 7 0" fill="none" {st(1.6)}/>'
            f'<path d="{mouth}" fill="none" {st(1.8)}/>'
            f'<circle cx="59" cy="83" r="5" fill="#d98977" opacity=".23"/><circle cx="103" cy="83" r="5" fill="#d98977" opacity=".23"/>'
            f'{accessory}</g><circle cx="80" cy="80" r="76" fill="none" {st(4)}/></svg>\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for cid, c in CHARACTERS.items():
        (OUT / f'{cid}-sheet.svg').write_text(sheet(c), encoding='utf-8')
        (OUT / f'{cid}-portrait.svg').write_text(portrait(cid, c), encoding='utf-8')
    print(f'wrote {len(CHARACTERS) * 2} files to {OUT}')


if __name__ == '__main__':
    main()
