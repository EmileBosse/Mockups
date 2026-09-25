# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this branch is

Branch `PaintAlexisBP` holds **static mockups** for **Plans**, a simple French-language drawing PWA for a single client (Alexis BP) who uses an **iPhone**. He's an electromechanic, and his drawings are mostly **cutting plans for metal parts**: plates, flanges, brackets, gussets, panel doors, with dimensions (mm or inches), hole callouts, and material/quantity notes. The mockups get shared with him directly, so all visible text is in French.

Other branches in this repo (`main`, `GestionTempsJordanBoucher`) hold unrelated mockups for other clients. `private-mockups/` is a local, git-ignored folder belonging to the time-tracking project, so leave it alone.

**Mockups only, no prototype.** The client asked for mockups at this stage, so don't add interactive JavaScript to the pages. An earlier interactive prototype was removed. Its technical notes are in [NOTES-TECHNIQUES.md](NOTES-TECHNIQUES.md), and its code is still in git history (commit `2c910be`, `Dessin.html`).

## Files

- `source/generer-maquettes.py` is the **source of truth**. Run it to regenerate every page:
  ```bash
  python source/generer-maquettes.py
  ```
- `Ecran-*.html` are the app screens: drawing, menu, shape picker, colour, grid, move/selection, dimension value, text, Mes dessins, export, first launch.
- `Exemple-*.html` are one screen per tool/shape, each showing a realistic metal-part plan (crayon, ligne, flèche+texte, rectangle, cercle+trou, triangle, losange, cube, sphère).
- `index.html` is the gallery GitHub Pages serves, with two sections (écrans, exemples).
- These `*.html` files are **generated, so don't hand-edit them**. Change the script and re-run it.

How the script works:
- Plans are lists of shape dicts built with small helpers (`rect`, `hole`, `dim`, `arrow`, `text`, `pen`, `shape('cube', …)`…).
- `draw()` renders each shape to SVG, in the same way the prototype's canvas did.
- `board()` places the drawing at 1 unit = 1 CSS px, in a 390 × 658 view between the top bar and the toolbar. Keep new example plans within about ±180 × ±300 units so stroke and text sizes stay consistent across screens.
- To add a screen, add an entry to `SCREENS` or `EXAMPLES`. The gallery picks it up automatically.

## Layout (from the client's sketch; keep it)

- Top left: a round chevron button that opens the menu (Nouveau dessin, Mes dessins, Importer, Exporter; closed with a chevron-up).
- Top right: the grid toggle (quadrillage), with undo/redo next to it.
- Bottom: a pill toolbar with 5 round tools: Crayon, Ligne, Texte, Déplacer, Couleur.
- **Long-press on Ligne** opens the shape picker: ligne, cote, flèche, rectangle, cercle, trou, triangle, losange, cube, sphère. The Ligne button then shows the chosen shape's icon and label.
- White drawing background. Conventions in the examples: plan outlines are black, dimensions (cotes) are red, notes and callouts are blue.

## Conventions

- All UI text is in French (Québec: « courriel », « texto », dates like « 22 sept. »).
- Touch targets must be at least 44px, and pages must respect the iPhone safe areas (`env(safe-area-inset-*)`).
- Pages are self-contained: inline CSS and inline SVG, no external fonts (the iOS system font), no JS.
