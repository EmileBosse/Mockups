"""Génère les maquettes statiques de l'app « Plans » (iPhone, 390 × 844).

Chaque écran est un fichier HTML autonome à la racine du dépôt : CSS en ligne,
dessin en SVG, aucun JavaScript. index.html est la galerie publiée par GitHub Pages.

    python source/generer-maquettes.py
"""
import math
import random
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

K, GRAY, RED, BLUE, GREEN = '#1c2230', '#667085', '#d92d20', '#2563eb', '#16a34a'
COLORS = [(K, 'Noir'), (GRAY, 'Gris'), (RED, 'Rouge'), ('#f97316', 'Orange'), ('#eab308', 'Jaune'),
          (GREEN, 'Vert'), (BLUE, 'Bleu'), ('#7c3aed', 'Violet'), ('#92400e', 'Brun'), ('#ffffff', 'Blanc (efface)')]
WIDTHS = [(2, 'Fin'), (4, 'Moyen'), (8, 'Épais')]
SHAPES = [('line', 'Ligne', None), ('dim', 'Cote', None), ('arrow', 'Flèche', None), ('rect', 'Rectangle', 'Rect.'),
          ('circle', 'Cercle', None), ('hole', 'Trou', None), ('triangle', 'Triangle', None),
          ('diamond', 'Losange', None), ('cube', 'Cube', None), ('sphere', 'Sphère', None)]
VIEW_W, VIEW_H, AREA_TOP = 390, 658, 76   # zone de dessin entre la barre du haut et la barre d'outils

# ---------------------------------------------------------------- icônes
I = {
    'chevDown': '<path d="M6 9l6 6 6-6"/>', 'chevUp': '<path d="M6 15l6-6 6 6"/>',
    'grid': '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 4v16M4 12h16"/>',
    'undo': '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 010 11H11"/>',
    'redo': '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 000 11H13"/>',
    'pen': '<path d="M4 20l4.2-1L19 8.2 15.8 5 5 15.8 4 20z"/><path d="M13.5 7.3l3.2 3.2"/>',
    'line': '<path d="M5 19L19 5"/>',
    'dim': '<path d="M3 14h18M6 11l-3 3 3 3M18 11l3 3-3 3M3 9v10M21 9v10"/><path d="M10 8h4" stroke-width="1.6"/>',
    'arrow': '<path d="M5 19L19 5M10 5h9v9"/>',
    'rect': '<rect x="3.5" y="6" width="17" height="12" rx="1"/>', 'circle': '<circle cx="12" cy="12" r="8.5"/>',
    'hole': '<circle cx="12" cy="12" r="6"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5" stroke-width="1.4"/>',
    'triangle': '<path d="M12 4l9 16H3z"/>', 'diamond': '<path d="M12 3l9 9-9 9-9-9z"/>',
    'cube': '<path d="M4 9h11v11H4zM4 9l5-5h11v11l-5 5M15 9l5-5"/>',
    'sphere': '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12c0 1.9 3.8 3.3 8.5 3.3s8.5-1.4 8.5-3.3"/>'
              '<path d="M20.5 12c0-1.9-3.8-3.3-8.5-3.3S3.5 10.1 3.5 12" stroke-dasharray="2 2.2"/>',
    'text': '<path d="M5 7V5h14v2M12 5v14M9 19h6"/>',
    'move': '<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
    'fileNew': '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>',
    'folder': '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    'download': '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    'share': '<path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"/>',
    'trash': '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    'copy': '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h8"/>',
    'x': '<path d="M6 6l12 12M18 6L6 18"/>',
    'image': '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    'file': '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5"/>',
}


def icon(name):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[name]}</svg>')


# ---------------------------------------------------------------- objets de dessin
def line(x1, y1, x2, y2, c=K, w=4): return dict(t='line', c=c, w=w, x1=x1, y1=y1, x2=x2, y2=y2)
def arrow(x1, y1, x2, y2, c=BLUE, w=2): return dict(t='arrow', c=c, w=w, x1=x1, y1=y1, x2=x2, y2=y2)
def dim(x1, y1, x2, y2, label='', c=RED, w=2, size=15): return dict(t='dim', c=c, w=w, x1=x1, y1=y1, x2=x2, y2=y2, label=label, size=size)
def rect(x1, y1, x2, y2, c=K, w=4): return dict(t='rect', c=c, w=w, x1=x1, y1=y1, x2=x2, y2=y2)
def circle(cx, cy, r, c=K, w=4): return dict(t='circle', c=c, w=w, x1=cx - r, y1=cy - r, x2=cx + r, y2=cy + r)
def hole(cx, cy, r, c=K, w=2): return dict(t='hole', c=c, w=w, x1=cx - r, y1=cy - r, x2=cx + r, y2=cy + r)
def shape(t, x1, y1, x2, y2, c=K, w=4): return dict(t=t, c=c, w=w, x1=x1, y1=y1, x2=x2, y2=y2)
def text(s, x, y, c=K, size=16): return dict(t='text', c=c, w=0, text=s, size=size, x1=x, y1=y)
def pen(pts, c=K, w=4): return dict(t='pen', c=c, w=w, pts=pts)


def f(v): return f'{v:.1f}'.rstrip('0').rstrip('.')


def P(*pts): return 'M' + ' L'.join(f'{f(x)} {f(y)}' for x, y in pts)


def bbox(o):
    if o['t'] == 'pen':
        xs, ys = [p[0] for p in o['pts']], [p[1] for p in o['pts']]
        l, t, r, b = min(xs), min(ys), max(xs), max(ys)
    elif o['t'] == 'text':
        lines = o['text'].split('\n')
        l, t = o['x1'], o['y1']
        r, b = l + max(len(s) for s in lines) * o['size'] * .56, t + len(lines) * o['size'] * 1.25
    else:
        l, r = sorted((o['x1'], o['x2']))
        t, b = sorted((o['y1'], o['y2']))
    m = o['w'] / 2 + {'arrow': 6, 'dim': 26}.get(o['t'], 0) + ((r - l) * .3 if o['t'] == 'hole' else 0)
    return l - m, t - m, r + m, b + m


def union(objs):
    bs = [bbox(o) for o in objs]
    return min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs)


def draw(o):
    """Un objet → éléments SVG (même rendu que le prototype canvas)."""
    c, w, t = o['c'], o['w'], o['t']
    st = f'stroke="{c}" stroke-width="{f(w)}" fill="none"'
    dash = f'stroke-dasharray="{f(w * 2)} {f(w * 2.2)}" opacity=".55"'
    if t == 'text':
        return ''.join(f'<text x="{f(o["x1"])}" y="{f(o["y1"] + i * o["size"] * 1.25 + o["size"] * .92)}" '
                       f'font-size="{o["size"]}" font-weight="600" fill="{c}">{escape(s)}</text>'
                       for i, s in enumerate(o['text'].split('\n')))
    if t == 'pen':
        p = o['pts']
        d = f'M{f(p[0][0])} {f(p[0][1])}'
        for i in range(1, len(p) - 1):
            d += f' Q{f(p[i][0])} {f(p[i][1])} {f((p[i][0] + p[i + 1][0]) / 2)} {f((p[i][1] + p[i + 1][1]) / 2)}'
        d += f' L{f(p[-1][0])} {f(p[-1][1])}'
        return f'<path d="{d}" {st}/>'
    x1, y1, x2, y2 = o['x1'], o['y1'], o['x2'], o['y2']
    l, r = sorted((x1, x2)); tp, b = sorted((y1, y2)); W, H = r - l, b - tp
    if t == 'line':
        return f'<path d="{P((x1, y1), (x2, y2))}" {st}/>'
    if t == 'arrow':
        a, ln, sp = math.atan2(y2 - y1, x2 - x1), 10 + w * 2.5, .45
        head = P((x2 - ln * math.cos(a - sp), y2 - ln * math.sin(a - sp)), (x2, y2),
                 (x2 - ln * math.cos(a + sp), y2 - ln * math.sin(a + sp)))
        return f'<path d="{P((x1, y1), (x2, y2))} {head}" {st}/>'
    if t == 'dim':
        a, ln, sp, e = math.atan2(y2 - y1, x2 - x1), 9 + w * 2, .42, 10
        nx, ny = -math.sin(a), math.cos(a)
        d = P((x1, y1), (x2, y2))
        for x, y, bb in ((x1, y1, a), (x2, y2, a + math.pi)):
            d += ' ' + P((x + ln * math.cos(bb - sp), y + ln * math.sin(bb - sp)), (x, y),
                         (x + ln * math.cos(bb + sp), y + ln * math.sin(bb + sp)))
            d += ' ' + P((x - nx * e, y - ny * e), (x + nx * e, y + ny * e))
        out = f'<path d="{d}" {st}/>'
        if o['label']:
            ang = math.degrees(a)
            if ang > 90 or ang < -90:
                ang += 180
            s = o['size']; tw = len(o['label']) * s * .56
            out += (f'<g transform="translate({f((x1 + x2) / 2)} {f((y1 + y2) / 2)}) rotate({f(ang)})">'
                    f'<rect x="{f(-tw / 2 - 4)}" y="{f(-s - 6)}" width="{f(tw + 8)}" height="{s + 2}" fill="#fff"/>'
                    f'<text x="0" y="-5" text-anchor="middle" font-size="{s}" font-weight="600" fill="{c}">{escape(o["label"])}</text></g>')
        return out
    if t == 'rect':
        return f'<rect x="{f(l)}" y="{f(tp)}" width="{f(W)}" height="{f(H)}" {st}/>'
    if t == 'circle':
        return f'<ellipse cx="{f(l + W / 2)}" cy="{f(tp + H / 2)}" rx="{f(W / 2)}" ry="{f(H / 2)}" {st}/>'
    if t == 'hole':
        cx, cy, ext = l + W / 2, tp + H / 2, W * .3
        ax = f'stroke="{c}" stroke-width="{f(max(1, w * .45))}" fill="none" stroke-dasharray="{f(w * 3)} {f(w * 1.2)} {f(w * .6)} {f(w * 1.2)}"'
        return (f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(W / 2)}" ry="{f(H / 2)}" {st}/>'
                f'<path d="{P((cx, tp - ext), (cx, b + ext))} {P((l - ext, cy), (r + ext, cy))}" {ax}/>')
    if t == 'triangle':
        return f'<path d="{P((l + W / 2, tp), (r, b), (l, b))} Z" {st}/>'
    if t == 'diamond':
        return f'<path d="{P((l + W / 2, tp), (r, tp + H / 2), (l + W / 2, b), (l, tp + H / 2))} Z" {st}/>'
    if t == 'cube':
        dd = min(W, H) * .32
        vis = (f'<rect x="{f(l)}" y="{f(tp + dd)}" width="{f(W - dd)}" height="{f(H - dd)}" {st}/>'
               f'<path d="{P((l, tp + dd), (l + dd, tp), (r, tp), (r, b - dd), (r - dd, b))} {P((r - dd, tp + dd), (r, tp))}" {st}/>')
        hid = f'<path d="{P((l + dd, tp), (l + dd, b - dd), (r, b - dd))} {P((l + dd, b - dd), (l, b))}" {st} {dash}/>'
        return vis + hid
    if t == 'sphere':
        cx, cy, rx, ry = l + W / 2, tp + H / 2, W / 2, H * .14
        return (f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="{f(rx)}" ry="{f(H / 2)}" {st}/>'
                f'<path d="M{f(cx - rx)} {f(cy)} A{f(rx)} {f(ry)} 0 0 0 {f(cx + rx)} {f(cy)}" {st}/>'
                f'<path d="M{f(cx - rx)} {f(cy)} A{f(rx)} {f(ry)} 0 0 1 {f(cx + rx)} {f(cy)}" {st} {dash}/>')
    raise ValueError(t)


GRID_DEFS = ('<defs><pattern id="g1" width="20" height="20" patternUnits="userSpaceOnUse">'
             '<path d="M20 0H0V20" fill="none" stroke="#e8edf3" stroke-width="1"/></pattern>'
             '<pattern id="g5" width="100" height="100" patternUnits="userSpaceOnUse">'
             '<rect width="100" height="100" fill="url(#g1)"/><path d="M100 0H0V100" fill="none" stroke="#c9d3e0" stroke-width="1"/></pattern></defs>')


def board(objs, grid=False, sel=None, center=None):
    """Zone de dessin : SVG à l'échelle 1 dans une vue de 390 × 658."""
    if center is None:
        l, t, r, b = union(objs) if objs else (0, 0, 0, 0)
        center = ((l + r) / 2, (t + b) / 2)
    vx, vy = center[0] - VIEW_W / 2, center[1] - VIEW_H / 2
    body = ''
    if grid:
        gx, gy = math.floor(vx / 100) * 100 - 400, math.floor(vy / 100) * 100 - 400
        body += f'{GRID_DEFS}<rect x="{gx}" y="{gy}" width="{VIEW_W + 800}" height="{VIEW_H + 800}" fill="url(#g5)"/>'
    body += ''.join(draw(o) for o in objs)
    if sel is not None:
        l, t, r, b = bbox(sel)
        body += (f'<rect x="{f(l - 6)}" y="{f(t - 6)}" width="{f(r - l + 12)}" height="{f(b - t + 12)}" fill="none" '
                 f'stroke="{BLUE}" stroke-width="1.5" stroke-dasharray="6 4"/>')
    return (f'<svg class="board" viewBox="{f(vx)} {f(vy)} {VIEW_W} {VIEW_H}" preserveAspectRatio="xMidYMid meet" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-label="Dessin">{body}</svg>')


def thumb(objs):
    l, t, r, b = union(objs)
    w, h = r - l, b - t
    pad = max(w, h) * .06
    return (f'<svg viewBox="{f(l - pad)} {f(t - pad)} {f(w + 2 * pad)} {f(h + 2 * pad)}" preserveAspectRatio="xMidYMid meet" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{"".join(draw(o) for o in objs)}</svg>')


def wobble(pts, seed, amp=2.2, step=14):
    """Densifie une polyligne et ajoute un léger tremblement de main levée."""
    rnd, out = random.Random(seed), []
    for (x1, y1), (x2, y2) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(x2 - x1, y2 - y1) / step))
        for i in range(n):
            k = i / n
            out.append([x1 + (x2 - x1) * k + rnd.uniform(-amp, amp), y1 + (y2 - y1) * k + rnd.uniform(-amp, amp)])
    out.append([pts[-1][0] + rnd.uniform(-amp, amp), pts[-1][1] + rnd.uniform(-amp, amp)])
    return out


def ring(cx, cy, rx, ry, seed, turns=1.08):
    rnd = random.Random(seed)
    n = 36
    return [[cx + math.cos(a) * rx * (1 + rnd.uniform(-.03, .03)), cy + math.sin(a) * ry * (1 + rnd.uniform(-.03, .03))]
            for a in (i / n * math.pi * 2 * turns - .5 for i in range(n + 1))]


# ---------------------------------------------------------------- plans d'exemple (unités ≈ px)
def plaque():
    holes = [hole(x, y, 11) for x in (-105, 105) for y in (-50, 50)]
    return [rect(-140, -85, 140, 85), *holes, rect(-45, -18, 45, 18, w=3),
            dim(-140, -120, 140, -120, '280 mm'), dim(170, -85, 170, 85, '170 mm'), dim(-105, 120, 105, 120, '210 mm'),
            arrow(-18, -62, -88, -54), text('4 × Ø 12', -12, -72, BLUE, 15),
            text('Oblong 90 × 36', -50, 26, BLUE, 13), text('Acier 1/4 po — Qté : 4', -140, 150, K, 17)]


def gabarit():
    return [rect(-120, -160, 120, 160), *[hole(x, y, 10) for x in (-80, 80) for y in (-120, 120)], hole(0, 0, 30),
            hole(-80, 0, 8), hole(80, 0, 8),
            dim(-120, -200, 120, -200, '240 mm'), dim(160, -160, 160, 160, '320 mm'), dim(-80, 200, 80, 200, '160 mm'),
            text('Gabarit de perçage — alu 1/2 po', -120, 228, K, 16)]


def profil_chanfrein():
    pts = [(-150, -80), (110, -80), (150, -40), (150, 80), (-110, 80), (-150, 40), (-150, -80)]
    return [*[line(*a, *b) for a, b in zip(pts, pts[1:])],
            line(-150, 0, 150, 0, GRAY, 1),
            dim(-150, -115, 150, -115, '300 mm'), dim(185, -80, 185, 80, '160 mm'),
            arrow(-60, 118, -124, 66), text('Chanfrein 40 × 45° (2 coins)', -60, 112, BLUE, 15),
            text('Plat 1/2 × 6 po — Qté : 2', -150, 160, K, 17)]


def croquis():
    return [pen(wobble([(-110, -170), (-110, 110), (130, 110)], 1), K, 4),
            pen(wobble([(-80, -170), (-80, 80), (130, 80)], 2), K, 4),
            pen(wobble([(-80, -40), (10, 80)], 3), K, 3),
            pen(ring(-95, -120, 9, 9, 4, 1.02), K, 3), pen(ring(60, 95, 9, 9, 5, 1.02), K, 3),
            pen(ring(30, 150, 120, 26, 6), RED, 3),
            text('≈ 250', -160, -30, BLUE, 16), text('≈ 220', 10, 128, BLUE, 16),
            text('Longueur à valider', -55, 184, RED, 15),
            text('Support moteur — croquis', -160, -215, K, 17)]


def arbre():
    return [line(-185, 0, 185, 0, GRAY, 1),
            rect(-170, -30, -70, 30, w=3), rect(-70, -42, 80, 42, w=3), rect(80, -25, 170, 25, w=3),
            rect(-155, -8, -90, 8, w=2),
            dim(-20, -42, -20, 42, 'Ø 84'),
            arrow(-130, -104, -122, -14), text('Rainure de clavette\n8 × 4 × 60', -175, -150, BLUE, 15),
            arrow(150, -104, 168, -28), text('Chanfrein\n1 × 45°', 90, -150, BLUE, 15),
            arrow(120, 106, 122, 30), text('Portée roulement 6205', 10, 112, BLUE, 15),
            dim(-170, 170, 170, 170, '340 mm'),
            text('Arbre de moteur — acier 4140', -170, 200, K, 17)]


def porte_panneau():
    return [rect(-140, -210, 140, 210),
            rect(-100, -170, 100, -120, w=3), text('Disjoncteurs', -44, -153, BLUE, 13),
            rect(-60, -90, 60, -10, w=3), text('Écran 120 × 80', -52, -58, BLUE, 13),
            *[hole(x, 45, 11) for x in (-70, 0, 70)], text('3 × Ø 22,5 (boutons)', -72, 72, BLUE, 13),
            hole(0, 140, 15), text('Sélecteur Ø 30', -48, 168, BLUE, 13),
            dim(-140, -245, 140, -245, '280 mm'), dim(172, -210, 172, 210, '420 mm'),
            text('Porte de panneau — tôle 14 ga', -140, 240, K, 17)]


def bride():
    bolts = [hole(95 * math.cos(a), 95 * math.sin(a), 10) for a in (i * math.pi / 3 + math.pi / 6 for i in range(6))]
    return [circle(0, 0, 130), hole(0, 0, 45), *bolts,
            dim(-130, -170, 130, -170, 'Ø 260'),
            arrow(100, -130, 30, -36), text('Alésage Ø 90', 60, -150, BLUE, 15),
            text('6 × Ø 20 sur Ø 190', -80, 150, BLUE, 15), text('Bride — acier 3/4 po', -130, 185, K, 17)]


def gousset():
    return [shape('triangle', -150, -110, 150, 110), hole(0, -40, 9), hole(-95, 80, 9), hole(95, 80, 9),
            dim(-150, 145, 150, 145, '300 mm'), dim(175, -110, 175, 110, '220 mm'),
            arrow(-100, -80, -18, -44), text('3 × Ø 11', -165, -100, BLUE, 15),
            text('Gousset — plat 3/8 po — Qté : 8', -150, 175, K, 17)]


def losange():
    return [shape('diamond', -150, -100, 150, 100), hole(-95, 0, 10), hole(95, 0, 10), hole(0, -58, 10), hole(0, 58, 10),
            hole(0, 0, 20),
            dim(-150, -135, 150, -135, '300 mm'), dim(178, -100, 178, 100, '200 mm'),
            arrow(-120, 110, -95, 18), text('4 × Ø 14 + centre Ø 40', -150, 118, BLUE, 15),
            text('Plaque de jonction — galv. 1/4 po', -150, 155, K, 17)]


def boitier():
    return [shape('cube', -130, -110, 130, 110, w=3), hole(-35, 35, 22), rect(10, 10, 42, 70, w=2),
            dim(-130, 140, 60, 140, '190 mm'), dim(-160, -40, -160, 110, '150 mm'), dim(80, 128, 150, 58, '70 mm'),
            arrow(-110, -132, -44, 14), text('Connecteur Ø 22', -150, -160, BLUE, 15),
            text('Boîtier — inox 16 ga', -130, 172, K, 17)]


def rotule():
    threads = [line(-18, y, 18, y + 6, K, 1.5) for y in range(112, 168, 9)]
    return [shape('sphere', -75, -165, 75, -15, w=3), rect(-18, -15, 18, 170, w=3), *threads,
            dim(-75, -195, 75, -195, 'Ø 50'), dim(62, -15, 62, 170, '120 mm'),
            arrow(-70, 150, -24, 138), text('Filet\nM20 × 1,5', -160, 120, BLUE, 15),
            text('Rotule de vérin — acier trempé', -140, 205, K, 17)]


# ---------------------------------------------------------------- chrome de l'app
CSS = """
:root{--ink:#1c2230;--muted:#667085;--line:#e4e7ec;--chrome:#fff;--soft:#f2f4f7;--accent:#2563eb;--danger:#d92d20;
  --shadow:0 4px 14px rgba(16,24,40,.14),0 1px 3px rgba(16,24,40,.08);
  --safe-t:env(safe-area-inset-top,0px);--safe-b:env(safe-area-inset-bottom,0px);--tb-h:72px}
*{box-sizing:border-box}
html,body{margin:0;height:100%;overflow:hidden;background:#fff;color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;-webkit-user-select:none;user-select:none}
button{font-family:inherit;color:inherit;cursor:default}
.board{position:fixed;left:0;right:0;top:76px;bottom:110px;width:100%;height:calc(100% - 186px);overflow:visible;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif}
.fab{position:fixed;width:52px;height:52px;border-radius:50%;background:var(--chrome);border:1px solid var(--line);box-shadow:var(--shadow);display:grid;place-items:center;padding:0}
.fab svg{width:24px;height:24px}
.fab.on{background:var(--accent);border-color:var(--accent);color:#fff}
.menu-btn{top:calc(var(--safe-t) + 12px);left:14px}
.top-right{position:fixed;top:calc(var(--safe-t) + 12px);right:14px;display:flex;gap:10px}
.top-right .fab{position:static}
.pill{display:flex;background:var(--chrome);border:1px solid var(--line);border-radius:26px;box-shadow:var(--shadow);height:52px;padding:0 2px}
.pill button{width:48px;height:50px;border:0;background:none;display:grid;place-items:center;padding:0}
.pill svg{width:22px;height:22px}
.pill .off{opacity:.3}
.toolbar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--safe-b) + 16px);display:flex;gap:4px;padding:6px;
  background:var(--chrome);border:1px solid var(--line);border-radius:40px;box-shadow:var(--shadow)}
.tool{width:60px;height:60px;border-radius:50%;border:0;background:transparent;padding:0;position:relative;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:3px;font-size:10.5px;font-weight:600}
.tool svg{width:24px;height:24px}
.tool.on{background:var(--accent);color:#fff}
.tool .more{position:absolute;right:10px;bottom:10px;width:0;height:0;border-left:6px solid transparent;border-bottom:6px solid currentColor;opacity:.55}
.sw{width:24px;height:24px;border-radius:50%;box-shadow:0 0 0 2px #fff,0 0 0 3.5px var(--line)}
.pop{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--safe-b) + 16px + var(--tb-h) + 12px);background:var(--chrome);
  border:1px solid var(--line);border-radius:22px;box-shadow:var(--shadow);padding:12px}
.pop h3{margin:2px 6px 10px;font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
.shape-grid{display:grid;grid-template-columns:repeat(5,60px);gap:6px}
.shape-grid button{height:64px;padding:0;border:0;border-radius:16px;background:var(--soft);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:11px;font-weight:600}
.shape-grid svg{width:26px;height:26px}
.shape-grid .on{background:var(--accent);color:#fff}
.colors{display:grid;grid-template-columns:repeat(5,44px);gap:8px;padding:0 4px}
.colors span{width:44px;height:44px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}
.colors .on{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ink)}
.widths{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:4px}
.widths button{height:52px;border:0;border-radius:14px;background:var(--soft);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:11.5px;font-weight:600}
.widths i{display:block;width:34px;border-radius:9px}
.widths .on{background:var(--ink);color:#fff}
.sep{height:1px;background:var(--line);margin:12px 2px}
.menu{position:fixed;top:calc(var(--safe-t) + 12px);left:14px;width:min(300px,calc(100vw - 28px));background:var(--chrome);border:1px solid var(--line);
  border-radius:22px;box-shadow:var(--shadow);overflow:hidden;z-index:5}
.menu-head{display:flex;align-items:center;gap:8px;padding:16px 16px 2px}
.menu-head b{font-size:17px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.menu-head svg{width:18px;height:18px;color:var(--muted)}
.menu-status{padding:0 16px 12px;font-size:12.5px;color:var(--muted);display:flex;align-items:center;gap:6px}
.menu-status::before{content:"";width:7px;height:7px;border-radius:50%;background:#12b76a}
.menu-item{display:flex;align-items:center;gap:14px;min-height:56px;border-top:1px solid var(--line);padding:0 18px;font-size:16.5px;font-weight:500}
.menu-item svg{width:22px;height:22px;color:var(--muted)}
.menu-foot{border-top:1px solid var(--line);padding:6px 8px}
.menu-foot span{width:48px;height:44px;display:grid;place-items:center}
.menu-foot svg{width:26px;height:26px}
.selbar{position:fixed;top:calc(var(--safe-t) + 78px);left:50%;transform:translateX(-50%);display:flex;gap:6px}
.selbar button{height:44px;border:0;border-radius:22px;padding:0 16px 0 12px;display:flex;align-items:center;gap:6px;font-size:14.5px;font-weight:600;background:var(--ink);color:#fff;box-shadow:var(--shadow);white-space:nowrap}
.selbar .danger{background:var(--danger)}
.selbar svg{width:18px;height:18px}
.scrim{position:fixed;inset:0;background:rgba(16,24,40,.38)}
.sheet{position:fixed;left:0;right:0;bottom:0;max-height:88%;display:flex;flex-direction:column;background:#fff;border-radius:24px 24px 0 0;
  box-shadow:0 -8px 30px rgba(16,24,40,.18);padding-bottom:var(--safe-b)}
.grab{width:40px;height:5px;border-radius:3px;background:#d0d5dd;margin:8px auto 0}
.sheet-head{display:flex;align-items:center;padding:8px 10px 8px 20px}
.sheet-head h2{flex:1;margin:0;font-size:20px}
.sheet-head span{width:44px;height:44px;border-radius:50%;background:var(--soft);display:grid;place-items:center}
.sheet-head svg{width:20px;height:20px}
.sheet-body{overflow:hidden;padding:4px 16px 20px}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.card{position:relative;border:1px solid var(--line);border-radius:16px;overflow:hidden;background:#fff}
.card.current{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.card svg.th{display:block;width:100%;aspect-ratio:4/3;border-bottom:1px solid var(--line);background:#fff;font-family:inherit}
.card-name{display:block;padding:9px 44px 0 11px;font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-date{display:block;padding:2px 44px 10px 11px;font-size:12px;color:var(--muted)}
.card .del{position:absolute;right:2px;bottom:2px;width:44px;height:44px;display:grid;place-items:center;color:var(--muted)}
.card .del svg{width:19px;height:19px}
.opt{display:flex;align-items:center;gap:14px;min-height:72px;border:1px solid var(--line);border-radius:16px;padding:12px 16px;margin-bottom:10px}
.opt>svg{width:28px;height:28px;flex:none;color:var(--accent)}
.opt b{display:block;font-size:16.5px}
.opt span{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.dlg-wrap{position:fixed;inset:0;background:rgba(16,24,40,.38);display:flex;justify-content:center;align-items:flex-start;padding:calc(var(--safe-t) + 70px) 16px 0}
.dlg{width:min(420px,100%);background:#fff;border-radius:20px;box-shadow:var(--shadow);padding:16px}
.dlg label{display:block;font-weight:600;font-size:16px;margin:2px 2px 10px}
.dlg .field{font-size:18px;border:1.5px solid var(--accent);border-radius:12px;padding:10px 12px;min-height:48px}
.dlg .field::after{content:"";display:inline-block;width:2px;height:21px;background:var(--accent);vertical-align:-4px;margin-left:1px}
.dlg .help{font-size:13px;color:var(--muted);margin:8px 2px 0}
.dlg-actions{display:flex;gap:10px;margin-top:12px}
.dlg-actions span{flex:1;height:48px;border-radius:14px;background:var(--soft);font-size:16px;font-weight:600;display:grid;place-items:center}
.dlg-actions .primary{background:var(--accent);color:#fff}
.kb{position:fixed;left:0;right:0;bottom:0;background:#d1d4db;padding:8px 3px calc(var(--safe-b) + 30px)}
.kb-row{display:flex;justify-content:center;gap:6px;margin-bottom:11px}
.kb-row span{flex:1;max-width:33px;height:43px;background:#fff;border-radius:5px;box-shadow:0 1px 0 #898a8d;display:grid;place-items:center;font-size:21px}
.kb-row .fn{max-width:44px;background:#abb0ba;font-size:15px}
.kb-row .space{max-width:none;flex:5;font-size:15px}
.kb-row .ret{max-width:88px;flex:2;background:#abb0ba;font-size:15px}
.hint{position:fixed;left:50%;top:44%;transform:translate(-50%,-50%);text-align:center;color:#98a2b3;width:260px}
.hint svg{width:44px;height:44px;margin-bottom:8px}
.hint b{display:block;color:#667085;font-size:17px;margin-bottom:4px}
.hint span{font-size:14.5px;line-height:1.4}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--safe-b) + 16px + var(--tb-h) + 14px);width:max-content;max-width:calc(100vw - 32px);
  background:var(--ink);color:#fff;border-radius:14px;padding:11px 16px;font-size:14.5px;line-height:1.35;text-align:center;box-shadow:var(--shadow)}
"""


def top(grid=False, menu=None, undo=True, redo=False):
    left = menu if menu else f'<button class="fab menu-btn" aria-label="Menu">{icon("chevDown")}</button>'
    return (left + '<div class="top-right"><div class="pill">'
            f'<button class="{"" if undo else "off"}" aria-label="Annuler">{icon("undo")}</button>'
            f'<button class="{"" if redo else "off"}" aria-label="Rétablir">{icon("redo")}</button></div>'
            f'<button class="fab{" on" if grid else ""}" aria-label="Quadrillage">{icon("grid")}</button></div>')


def toolbar(tool='pen', shape_id='line', color=K):
    sid, label, short = next(s for s in SHAPES if s[0] == shape_id)
    b = lambda t, ico, lbl, extra='': f'<button class="tool{" on" if tool == t else ""}">{ico}{lbl}{extra}</button>'
    return ('<nav class="toolbar" aria-label="Outils">'
            + b('pen', icon('pen'), 'Crayon')
            + b('shape', icon(sid), short or label, '<i class="more"></i>')
            + b('text', icon('text'), 'Texte')
            + b('move', icon('move'), 'Déplacer')
            + f'<button class="tool"><span class="sw" style="background:{color}"></span>Couleur</button></nav>')


def pop_shapes(active):
    items = ''.join(f'<button class="{"on" if s == active else ""}">{icon(s)}{lbl}</button>' for s, lbl, _ in SHAPES)
    return f'<div class="pop"><h3>Formes</h3><div class="shape-grid">{items}</div></div>'


def pop_colors(active, width):
    cs = ''.join(f'<span class="{"on" if c == active else ""}" style="background:{c}" title="{n}"></span>' for c, n in COLORS)
    ws = ''.join(f'<button class="{"on" if w == width else ""}"><i style="height:{w}px;background:{active}"></i>{n}</button>' for w, n in WIDTHS)
    return f'<div class="pop"><h3>Couleur</h3><div class="colors">{cs}</div><div class="sep"></div><h3>Épaisseur</h3><div class="widths">{ws}</div></div>'


def menu(name):
    items = [('fileNew', 'Nouveau dessin'), ('folder', 'Mes dessins'), ('download', 'Importer un dessin'), ('share', 'Exporter le dessin')]
    return (f'<div class="menu"><div class="menu-head"><b>{escape(name)}</b>{icon("pen")}</div>'
            '<div class="menu-status">Enregistré sur cet iPhone à 14 h 32</div>'
            + ''.join(f'<div class="menu-item">{icon(i)}{t}</div>' for i, t in items)
            + f'<div class="menu-foot"><span>{icon("chevUp")}</span></div></div>')


def sheet(title, body):
    return (f'<div class="scrim"></div><section class="sheet"><div class="grab"></div>'
            f'<div class="sheet-head"><h2>{title}</h2><span>{icon("x")}</span></div><div class="sheet-body">{body}</div></section>')


def dialog(title, value, ok, help_text=''):
    helper = f'<div class="help">{help_text}</div>' if help_text else ''
    return (f'<div class="dlg-wrap"><div class="dlg"><label>{title}</label><div class="field">{escape(value)}</div>{helper}'
            f'<div class="dlg-actions"><span>Annuler</span><span class="primary">{ok}</span></div></div></div>')


def keyboard(numeric=False):
    rows = ([list('1234567890'), list('-/:;()$&@"'), ['#+=', '.', ',', '?', '!', "'", '⌫']] if numeric else
            [list('qwertyuiop'), list('asdfghjkl'), ['⇧', *'zxcvbnm', '⌫']])
    fn = {'⇧', '⌫', '#+='}
    html = ''.join('<div class="kb-row">' + ''.join(f'<span class="{"fn" if k in fn else ""}">{escape(k)}</span>' for k in r) + '</div>'
                   for r in rows)
    html += (f'<div class="kb-row"><span class="fn">{"ABC" if numeric else "123"}</span><span class="fn">🌐</span>'
             '<span class="space">espace</span><span class="ret">retour</span></div>')
    return f'<div class="kb">{html}</div>'


def page(title, body):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#ffffff">
<title>Plans — {escape(title)}</title>
<!-- Généré par source/generer-maquettes.py — ne pas modifier à la main. -->
<style>{CSS}</style>
</head>
<body>
{body}
</body>
</html>
"""


# ---------------------------------------------------------------- écrans
DOCS = [('Plaque de fixation', plaque, 'Ouvert maintenant'), ('Bride Ø 260', bride, '22 sept.'),
        ('Porte de panneau', porte_panneau, '21 sept.'), ('Gousset', gousset, '19 sept.'),
        ('Boîtier inox', boitier, '15 sept.'), ('Arbre de moteur', arbre, '12 sept.')]


def mes_dessins():
    th = lambda fn: thumb(fn()).replace('<svg ', '<svg class="th" ', 1)
    cards = ''.join(f'<div class="card{" current" if i == 0 else ""}">{th(fn)}'
                    f'<span class="card-name">{escape(n)}</span><span class="card-date">{d}</span>'
                    f'<span class="del">{icon("trash")}</span></div>' for i, (n, fn, d) in enumerate(DOCS))
    return sheet('Mes dessins', f'<div class="cards">{cards}</div>')


def exporter():
    return sheet('Exporter le dessin',
                 f'<div class="opt">{icon("image")}<div><b>Image (PNG)</b><span>Pour l’envoyer par texto, courriel ou l’imprimer</span></div></div>'
                 f'<div class="opt">{icon("file")}<div><b>Fichier modifiable (.plan)</b><span>Pour le rouvrir plus tard avec « Importer un dessin »</span></div></div>')


def plaque_sans_cote():
    objs = plaque()
    for o in objs:
        if o['t'] == 'dim' and o['label'] == '170 mm':
            o['label'] = ''
    return objs


pl = plaque()
slot = pl[5]
SCREENS = [
    # (fichier, titre, légende, html)
    ('Ecran-Dessin', 'Écran de dessin',
     'Fond blanc, menu en haut à gauche, quadrillage en haut à droite, les 5 outils en bas.',
     board(pl) + top() + toolbar()),
    ('Ecran-Menu', 'Menu',
     'Le chevron ouvre le menu : nouveau, mes dessins, importer, exporter. On touche le nom pour renommer le dessin.',
     board(pl) + top(menu=menu('Plaque de fixation')) + toolbar()),
    ('Ecran-Formes', 'Choix de la forme',
     'Un appui long sur « Ligne » ouvre les formes. Le bouton prend ensuite l’icône de la forme choisie.',
     board(pl) + top() + toolbar('shape', 'dim') + pop_shapes('dim')),
    ('Ecran-Couleur', 'Couleur et épaisseur',
     'Dix couleurs (le blanc sert de gomme) et trois épaisseurs. L’épaisseur règle aussi la taille du texte.',
     board(pl) + top() + toolbar('pen', 'line', RED) + pop_colors(RED, 4)),
    ('Ecran-Quadrillage', 'Quadrillage',
     'Le bouton en haut à droite affiche la grille. Les formes, les trous et les cotes s’alignent dessus.',
     board(gabarit(), grid=True) + top(grid=True) + toolbar('shape', 'hole')),
    ('Ecran-Deplacer', 'Déplacer un élément',
     'Avec « Déplacer », on touche un élément pour le glisser, le dupliquer ou le supprimer.',
     board(pl, sel=slot) + top() + toolbar('move')
     + f'<div class="selbar"><button>{icon("copy")}Dupliquer</button><button class="danger">{icon("trash")}Supprimer</button></div>'),
    ('Ecran-Cote', 'Valeur d’une cote',
     'Après avoir tiré une cote, on tape sa valeur. Elle s’affiche au milieu de la cote.',
     board(plaque_sans_cote()) + top() + toolbar('shape', 'dim')
     + dialog('Valeur de la cote', '170 mm', 'Ajouter', 'Ex. : 120 mm, 4 1/2 po, Ø 12') + keyboard(numeric=True)),
    ('Ecran-Texte', 'Ajouter du texte',
     'On touche la feuille à l’endroit voulu, puis on tape le texte (matériau, quantité, note).',
     board(pl) + top() + toolbar('text') + dialog('Ajouter du texte', 'Acier 1/4 po — Qté : 4', 'Ajouter') + keyboard()),
    ('Ecran-Mes-dessins', 'Mes dessins',
     'Tous les plans gardés sur l’iPhone, avec un aperçu. L’enregistrement se fait tout seul à chaque trait.',
     board(pl) + top() + toolbar() + mes_dessins()),
    ('Ecran-Exporter', 'Exporter',
     'En image pour la partager, ou en fichier modifiable à rouvrir plus tard.',
     board(pl) + top() + toolbar() + exporter()),
    ('Ecran-Vide', 'Premier lancement',
     'Une feuille vide avec une courte consigne.',
     top(undo=False) + toolbar()
     + f'<div class="hint">{icon("pen")}<b>Nouveau dessin</b><span>Dessinez avec le doigt.<br>Deux doigts pour zoomer ou vous déplacer.</span></div>'),
]

EXAMPLES = [
    ('Exemple-Crayon', 'Crayon — croquis à main levée', 'Un croquis rapide d’un support, avec une note entourée en rouge.',
     'pen', 'line', croquis),
    ('Exemple-Ligne', 'Ligne — profil découpé', 'Un plat aux coins chanfreinés. Les lignes se redressent seules à 0°, 45° et 90°.',
     'shape', 'line', profil_chanfrein),
    ('Exemple-Fleche-Texte', 'Flèche et texte — annotations', 'Un arbre de moteur avec ses notes : clavette, chanfrein, roulement.',
     'shape', 'arrow', arbre),
    ('Exemple-Rectangle', 'Rectangle — découpes', 'La porte d’un panneau électrique : ouvertures pour les disjoncteurs, l’écran et les boutons.',
     'shape', 'rect', porte_panneau),
    ('Exemple-Cercle-Trou', 'Cercle et trou — bride', 'Une bride avec son alésage et 6 trous de boulons, chacun avec ses axes.',
     'shape', 'hole', bride),
    ('Exemple-Triangle', 'Triangle — gousset', 'Un gousset de renfort percé de 3 trous.',
     'shape', 'triangle', gousset),
    ('Exemple-Losange', 'Losange — plaque de jonction', 'Une plaque de jonction en losange avec 5 trous.',
     'shape', 'diamond', losange),
    ('Exemple-Cube', 'Cube — boîtier en 3D', 'Un boîtier en tôle vu en 3D, avec ses trois cotes et la découpe du connecteur.',
     'shape', 'cube', boitier),
    ('Exemple-Sphere', 'Sphère — rotule', 'Une rotule de vérin : la sphère et sa tige filetée.',
     'shape', 'sphere', rotule),
]


def gallery():
    def fig(name, title, desc):
        return (f'<figure><div class="phone"><div class="clip"><iframe src="{name}.html" title="{escape(title)}" loading="lazy"></iframe></div></div>'
                f'<figcaption><b>{escape(title)}</b>{escape(desc)} <a href="{name}.html">Plein écran</a></figcaption></figure>')
    screens = ''.join(fig(n, t, d) for n, t, d, _ in SCREENS)
    examples = ''.join(fig(n, t, d) for n, t, d, *_ in EXAMPLES)
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Plans — maquettes</title>
<!-- Généré par source/generer-maquettes.py — ne pas modifier à la main. -->
<style>
:root{{--ink:#1c2230;--muted:#667085;--bg:#f2f4f7;--accent:#2563eb}}
*{{box-sizing:border-box}}
body{{margin:0;background:var(--bg);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}}
header,section{{max-width:1240px;margin:0 auto;padding:0 16px}}
header{{padding-top:40px}}
h1{{margin:0 0 8px;font-size:30px}}
h2{{margin:44px 0 4px;font-size:22px}}
p{{margin:0;color:var(--muted);max-width:760px;line-height:1.5}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:32px 24px;padding:22px 0 10px}}
figure{{margin:0}}
.phone{{width:300px;height:650px;margin:0 auto;border-radius:44px;background:#111;padding:10px;box-shadow:0 12px 30px rgba(16,24,40,.18)}}
.clip{{width:280px;height:630px;border-radius:34px;overflow:hidden;background:#fff}}
.clip iframe{{width:390px;height:877px;border:0;transform:scale(.718);transform-origin:0 0;pointer-events:none}}
figcaption{{max-width:300px;margin:14px auto 0;font-size:14.5px;line-height:1.45;color:var(--muted)}}
figcaption b{{display:block;color:var(--ink);font-size:15.5px;margin-bottom:2px}}
figcaption a{{color:var(--accent);white-space:nowrap}}
footer{{max-width:1240px;margin:0 auto;padding:40px 16px 60px;color:var(--muted);font-size:13.5px}}
</style>
</head>
<body>
<header>
  <h1>Plans — maquettes de l’application</h1>
  <p>Une application simple pour iPhone pour dessiner des plans de coupe et les garder. Ce sont des maquettes : elles montrent l’apparence et le fonctionnement prévus, elles ne sont pas encore interactives.</p>
</header>
<section>
  <h2>Les écrans</h2>
  <p>Le dessin prend tout l’écran. Le menu est en haut à gauche, le quadrillage en haut à droite, et les outils en bas : crayon, ligne (et autres formes), texte, déplacer, couleur.</p>
  <div class="grid">{screens}</div>
</section>
<section>
  <h2>Exemples avec chaque forme</h2>
  <p>Le même écran de dessin, avec un exemple de plan pour chaque outil ou forme. Les cotes (en rouge) et les notes (en bleu) se font avec les outils Cote et Texte.</p>
  <div class="grid">{examples}</div>
</section>
<footer>Maquettes Plans — BossLabs</footer>
</body>
</html>
"""


def main():
    for name, title, _, html in SCREENS:
        (ROOT / f'{name}.html').write_text(page(title, html), encoding='utf-8')
    for name, title, _, tool, sid, fn in EXAMPLES:
        (ROOT / f'{name}.html').write_text(page(title, board(fn()) + top() + toolbar(tool, sid)), encoding='utf-8')
    (ROOT / 'index.html').write_text(gallery(), encoding='utf-8')
    print(f'{len(SCREENS) + len(EXAMPLES)} maquettes + index.html')


if __name__ == '__main__':
    main()
