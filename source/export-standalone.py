# -*- coding: utf-8 -*-
"""Regenere les maquettes autonomes (*.html + index.html a la racine du depot)
a partir des sources .dc.html de ce dossier.

Usage, depuis le dossier source :
    python export-standalone.py

Les pages produites sont autonomes : le logo est lu dans assets/ par un chemin
relatif (assets/...), donc la racine du depot peut etre publiee telle quelle
sur GitHub Pages sans rien casser. Ne jamais remettre ../assets/ : le parent du
depot publie n'existe pas sur le site.
"""
import io
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
ACCENT = '#E9A82C'
BLOBS = {
    '/_blob/596b240c49e10ca4df94cc5b5bd56ddd': 'assets/logo_transparent.png',
    '/_blob/b23e621c791ab60aae98a65e07646345': 'assets/logo.jpeg',
}
CANVAS_URL = 'https://claude.ai/artifact/76HFQjZZTuyxzbLzecufRN'


def standalone(text):
    """Retire le runtime de l'editeur et fige les valeurs pour un fichier autonome."""
    t = text.replace('<script src="./support.js"></script>\n', '')
    m = re.search(r'<helmet>(.*?)</helmet>\s*', t, re.S)
    head_extra = m.group(1).strip() if m else ''
    if m:
        t = t[:m.start()] + t[m.end():]
    t = t.replace('<x-dc>\n', '').replace('</x-dc>\n', '')
    t = re.sub(r'<script data-dc-script.*?</script>\s*', '', t, flags=re.S)
    t = t.replace('</head>', head_extra + '\n</head>')
    t = t.replace('{{accent}}', ACCENT)
    for blob, path in BLOBS.items():
        t = t.replace(blob, path)
    return re.sub(r'href="([A-Za-z0-9_-]+)\.dc\.html"', r'href="\1.html"', t)


def main():
    canvas = json.load(io.open(os.path.join(HERE, 'canvas.json'), encoding='utf-8'))
    order, boards = canvas['order'], canvas['boards']

    for name in order:
        html = standalone(io.open(os.path.join(HERE, name), encoding='utf-8').read())
        io.open(os.path.join(OUT, name.replace('.dc.html', '.html')), 'w', encoding='utf-8').write(html)

    figures = []
    for name in order:
        board = boards[name]
        fn, title, w, h = name.replace('.dc.html', '.html'), board.get('title', name), board['w'], board['h']
        scale = 0.62 if w > 500 else 1.0
        figures.append(
            u'      <figure style="margin:0;flex:0 0 auto;">\n'
            u'        <figcaption style="font:600 12px/1.4 system-ui,sans-serif;letter-spacing:.06em;color:#A7A7A7;padding:0 0 8px 2px;text-transform:uppercase;">%s</figcaption>\n'
            u'        <div style="width:%dpx;height:%dpx;border:1px solid #2A2823;border-radius:10px;overflow:hidden;background:#000;">\n'
            u'          <iframe src="%s" title="%s" style="width:%dpx;height:%dpx;border:0;transform:scale(%s);transform-origin:top left;"></iframe>\n'
            u'        </div>\n'
            u'        <a href="%s" target="_blank" rel="noopener" style="display:inline-block;margin-top:8px;font:500 12px system-ui,sans-serif;color:#E9A82C;">Ouvrir en plein ecran</a>\n'
            u'      </figure>' % (title, int(w * scale), int(h * scale), fn, title, w, h, scale, fn))

    section = (
        u'    <section style="padding:0 0 48px 0;">\n'
        u'      <div style="display:flex;flex-wrap:wrap;gap:28px;align-items:flex-start;padding-bottom:10px;">\n%s\n      </div>\n'
        u'    </section>' % '\n'.join(figures))

    index = (
        u'<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        u'<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        u'<title>J2B - Maquettes PWA Gestion de temps</title>\n'
        u'<style>body{margin:0;background:#0B0B0C;color:#F4F2EE;font-family:system-ui,sans-serif;}</style>\n'
        u'</head>\n<body>\n'
        u'  <header style="padding:40px 40px 28px 40px;border-bottom:1px solid #1C1A16;">\n'
        u'    <img src="assets/logo_transparent.png" alt="Excavation J2B" style="display:block;width:220px;height:124px;object-fit:contain;">\n'
        u'    <h1 style="font:600 28px/1.2 system-ui,sans-serif;margin:18px 0 6px 0;">Maquettes - PWA de gestion de temps</h1>\n'
        u'    <p style="font:400 14px/1.6 system-ui,sans-serif;color:#A7A7A7;margin:0;max-width:70ch;">Direction retenue (cadran, boutons ronds, accueil sombre) : saisie du temps, des voyages, du materiel et des photos, calendrier, ajout de chantier, configuration admin en mobile et en version PC, plus la synchronisation manuelle. Version en ligne&nbsp;: <a href="%s" style="color:#E9A82C;">canvas Claude</a>.</p>\n'
        u'  </header>\n'
        u'  <main style="padding:32px 40px;">\n' % CANVAS_URL
        + section + u'\n  </main>\n</body>\n</html>\n')

    io.open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(index)
    print('ecrans exportes :', len(order))


if __name__ == '__main__':
    main()
