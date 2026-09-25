"""Generate T27 V3 direction-A character sprite sheets and dialogue portraits.

Original art authored by Claude (AI-assisted) for Office Case Files.
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
    'player': dict(jacket='#e76f51', accent='#f4a261', hair='#433536', skin='#f0bd91', pants='#2f4858', hair_style='short', coat=True),
    'maya': dict(jacket='#4a7da2', accent='#9fd2e5', hair='#302c3e', skin='#d99c72', pants='#2b3a4a', hair_style='bob'),
    'leo': dict(jacket='#4e8c6b', accent='#b8df9b', hair='#593b2e', skin='#e6ad7e', pants='#3a3a48', hair_style='spiky', glasses=True),
    'nora': dict(jacket='#8b62a4', accent='#e4b4e8', hair='#3f3036', skin='#f0bd91', pants='#34304a', hair_style='bun', clipboard=True),
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
        out += f'<rect x="{21 if row != "side" else 19}" y="{12 + b}" width="38" height="32" rx="14" fill="{h}" {st()}/>'
    if s == 'bun':
        out += f'<circle cx="{40 if row != "side" else 30}" cy="{9 + b}" r="8" fill="{h}" {st()}/>'
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
        out = f'<circle cx="48" cy="{30 + b}" r="2" fill="{INK}"/><path d="M55 {32 + b} l3 2 l-3 1" fill="none" {st(1.5)}/>'
        if c.get('glasses'):
            out += f'<circle cx="48" cy="{30 + b}" r="4.5" fill="none" {st(1.6)}/><path d="M44 {29 + b} H34" {st(1.6)}/>'
        return out
    out = (f'<circle cx="34" cy="{31 + b}" r="2" fill="{INK}"/><circle cx="46" cy="{31 + b}" r="2" fill="{INK}"/>'
           f'<path d="M36 {38 + b} q4 3 8 0" fill="none" {st(1.6)}/>')
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
                         f'<ellipse cx="{x}" cy="{FOOT - 2 - lift * .7}" rx="6" ry="3.5" fill="{INK}"/>')
    # back arm (side view)
    if row == 'side':
        parts.append(f'<path d="M40 {52 + b} L{40 - a + lean} {76 + b}" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>'
                     f'<path d="M40 {52 + b} L{40 - a + lean} {76 + b}" stroke="{c["jacket"]}" stroke-width="5.5" stroke-linecap="round" opacity=".8"/>')
    parts.append(hair_back(c, row, b))
    # torso
    tx = 23 + (lean if row == 'side' else 0)
    tw = 34 if row != 'side' else 28
    if row == 'side':
        tx = 26 + lean
    parts.append(f'<rect x="{tx}" y="{46 + b}" width="{tw}" height="{body_bottom - 46}" rx="9" fill="{c["jacket"]}" {st()}/>')
    if row == 'down':
        parts.append(f'<path d="M35 {47 + b} L40 {58 + b} L45 {47 + b}" fill="{c["accent"]}" {st(1.8)}/>')
        if c.get('coat'):
            parts.append(f'<path d="M40 {58 + b} V{body_bottom - 2 + b}" {st(1.8)}/>'
                         f'<rect x="44" y="{62 + b}" width="8" height="10" rx="2" fill="#fff6e6" {st(1.5)}/>')
            parts.append(f'<path d="M30 {46 + b} q10 6 20 0 l2 5 q-12 6 -24 0z" fill="{c["accent"]}" {st(1.8)}/>')
    if row == 'up' and c.get('coat'):
        parts.append(f'<path d="M40 {50 + b} V{body_bottom - 2 + b}" {st(1.8)}/>')
    # front arms
    if row == 'side':
        parts.append(f'<path d="M42 {52 + b} L{42 + a + lean} {76 + b}" stroke="{INK}" stroke-width="10" stroke-linecap="round"/>'
                     f'<path d="M42 {52 + b} L{42 + a + lean} {76 + b}" stroke="{c["jacket"]}" stroke-width="5.5" stroke-linecap="round"/>'
                     f'<circle cx="{42 + a + lean}" cy="{78 + b}" r="4" fill="{c["skin"]}" {st(1.8)}/>')
    else:
        for x, dy in ((19, a), (61, -a)):
            parts.append(f'<rect x="{x - 4}" y="{50 + b + dy * .4}" width="8" height="26" rx="4" fill="{c["jacket"]}" {st(2)}/>'
                         f'<circle cx="{x}" cy="{78 + b + dy * .4}" r="4" fill="{c["skin"]}" {st(1.8)}/>')
        if row == 'down' and c.get('clipboard'):
            parts.append(f'<rect x="54" y="{60 + b}" width="16" height="20" rx="2" fill="{c["accent"]}" {st(2)}/>'
                         f'<path d="M58 {66 + b} h8 M58 {71 + b} h6" {st(1.4)}/>')
    # head
    hx = 40 + (lean if row == 'side' else 0)
    parts.append(f'<circle cx="{hx}" cy="{30 + b}" r="16" fill="{c["skin"]}" {st()}/>')
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


def portrait(c):
    inner = frame(c, 'down', 'idle', 0, 4)
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">'
            '<defs><clipPath id="c"><circle cx="80" cy="80" r="76"/></clipPath></defs>'
            f'<circle cx="80" cy="80" r="76" fill="#efe3cc" {st(4)}/>'
            f'<g clip-path="url(#c)"><circle cx="80" cy="80" r="76" fill="{c["accent"]}" opacity=".35"/>'
            f'<g transform="translate(-16 -10) scale(2.4)">{inner}</g></g>'
            f'<circle cx="80" cy="80" r="76" fill="none" {st(4)}/></svg>\n')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for cid, c in CHARACTERS.items():
        (OUT / f'{cid}-sheet.svg').write_text(sheet(c), encoding='utf-8')
        (OUT / f'{cid}-portrait.svg').write_text(portrait(c), encoding='utf-8')
    print(f'wrote {len(CHARACTERS) * 2} files to {OUT}')


if __name__ == '__main__':
    main()
