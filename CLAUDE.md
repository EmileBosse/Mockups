# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this branch is

Branch `PaintAlexisBP`: mockups for **Plans**, a simple French-language drawing PWA for a single client (Alexis BP) who uses an **iPhone**. He is an electromechanic: his drawings are mostly **cutting plans for metal parts** (plates, flanges, brackets, with dimensions in mm/inches, hole callouts, material and quantity notes). The app must stay simple.

Other branches in this repo (`main`, `GestionTempsJordanBoucher`) hold unrelated mockups for other clients. `private-mockups/` is a local, git-ignored folder belonging to the time-tracking project. Leave it alone.

## Files

- `Dessin.html` is the working prototype: one self-contained page (inline CSS + JS, no build, no framework) that actually draws on a `<canvas>`. Edit this file directly. There is no export step on this branch.
- `index.html` is the gallery GitHub Pages serves. It embeds `Dessin.html?demo&etat=<state>` in phone frames. Adding a state means adding a `case` in the `ETAT` switch at the bottom of `Dessin.html` and a row in `screens` in `index.html`.
- `?demo` loads sample metal-part plans and disables saving. `?demo=vide` shows the empty first-run screen. Without `?demo`, drawings persist in `localStorage` (`plans.v1`, `plans.current`).

## Layout (from the client's sketch; keep it)

- Top left: round chevron button that opens the menu (Nouveau dessin, Mes dessins, Importer, Exporter; close with the chevron-up).
- Top right: grid toggle (quadrillage). Undo/redo sits next to it (added, not in the sketch).
- Bottom: a pill toolbar with 5 round tools: Crayon, Ligne, Texte, Déplacer, Couleur. **Long-press on Ligne** (or tap it again once it's active) opens the shape picker: ligne, cote, flèche, rectangle, cercle, trou, triangle, losange, cube, sphère.
- White drawing background. Two fingers pinch/pan in every tool.

## Conventions

- All UI text is in French (Québec: « Courriel », « texto », `fr-CA` dates).
- Touch targets must be at least 44px and the layout must respect the iPhone safe areas (`env(safe-area-inset-*)`).
- Drawing objects are plain JSON (`{t, c, w, x1, y1, x2, y2 | pts | text | label}`) so the `.plan.json` export and undo history can serialise them. Keep new shapes in that form. Add the drawing code in `drawObj`, the hit-testing in `hitTest`/`bbox`, and the icon in `I` + `SHAPES`.
- `localStorage` is a mockup shortcut. A real build should use IndexedDB (photos/imports quickly exceed ~5 MB) plus a service worker + manifest for offline and home-screen install.
