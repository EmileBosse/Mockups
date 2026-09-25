# Notes techniques — prototype « Plans » (retiré)

Un prototype interactif (`Dessin.html`) a existé sur cette branche avant d'être retiré au profit de maquettes statiques. Il reste consultable dans l'historique git :

```bash
git show 2c910be:Dessin.html > Dessin-prototype.html
```

Ces notes résument les choix techniques qu'il validait, pour la vraie application.

## Plateforme

- **PWA** en un seul fichier HTML (CSS + JS en ligne, aucun framework, aucune compilation). Tourne dans Safari iOS et une fois ajoutée à l'écran d'accueil.
- Balises iOS : `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `theme-color`, `viewport-fit=cover`, `user-scalable=no`.
- Encoches et barre d'accueil de l'iPhone gérées avec `env(safe-area-inset-*)`.
- Il manque, pour une vraie PWA : un `manifest.webmanifest` avec icônes PNG (dont `apple-touch-icon`) et un **service worker** pour le hors-ligne.

## Dessin

- **Canvas 2D** plein écran, redimensionné selon `devicePixelRatio` (max 3) pour rester net sur Retina.
- Transformation de vue `{x, y, s}` (écran = monde × s + décalage). Le zoom à deux doigts garde fixe le point monde sous le milieu des doigts. Zoom borné à 20 %–800 %. La molette zoome aussi, pour tester sur ordinateur.
- **Pointer Events** (`pointerdown/move/up/cancel` + `setPointerCapture`) avec une `Map` des pointeurs actifs : 1 pointeur = outil courant, 2 pointeurs = geste zoom/déplacement (le trait en cours est annulé). `touch-action: none` sur le canvas.
- Crayon : points ajoutés quand le doigt bouge de plus de 1,5 px écran, lissés au rendu par des courbes quadratiques passant par les milieux des segments.
- Aimantation : avec le quadrillage (pas de 20 unités), les points des formes s'arrondissent à la grille. Sans quadrillage, lignes, flèches et cotes se redressent à 0/45/90° si elles en sont à moins d'environ 5°.
- Cercle, sphère et trou restent ronds (on prend le plus grand de |dx| et |dy|).
- **Cote** : ligne + pointes de flèche aux deux bouts + petits traits perpendiculaires. La valeur est saisie après le tracé, puis dessinée au milieu, tournée dans l'axe (jamais à l'envers), sur un fond blanc.
- **Trou** : cercle + axes en trait mixte (`setLineDash`) qui dépassent de 30 % du diamètre.
- Cube et sphère : fausse 3D (projection oblique pour le cube, ellipse d'équateur pour la sphère), arêtes cachées en pointillé à 55 % d'opacité.
- Sélection (Déplacer) : test de distance au segment pour les traits et lignes, rectangle englobant pour le reste. Le plus récent gagne.
- Appui long sur « Ligne » : minuteur de 450 ms sur `pointerdown`, annulé sur `pointerup/leave/cancel`. Le `click` qui suit est ignoré, et `navigator.vibrate(10)` donne un retour quand c'est supporté.

## Données

- Un dessin est une liste d'objets JSON simples :
  `{t, c, w, x1, y1, x2, y2}` pour les formes, `{t:'pen', pts:[[x,y]…]}` pour le crayon,
  `{t:'text', text, size}`, `{t:'dim', label, size}`, `{t:'image', src}`.
  Ce même format sert à l'annulation, à l'enregistrement et à l'export.
- Annuler/rétablir : deux piles d'instantanés JSON (100 au maximum).
- Enregistrement automatique 400 ms après chaque modification, et aussi sur `pagehide`/`visibilitychange`. Le prototype utilisait `localStorage` (`plans.v1`). **La vraie app doit utiliser IndexedDB**, car les photos importées dépassent vite la limite d'environ 5 Mo.
- Aperçus « Mes dessins » : rendu hors écran en 320 × 240, JPEG qualité 0,72.

## Import / export

- Export PNG : rendu hors écran du rectangle englobant (×2, 4000 px au maximum), puis `canvas.toBlob`.
- Export `.plan.json` : `{app:'plans', version:1, name, objs}`, réimportable.
- Partage : **Web Share API** avec fichiers (`navigator.canShare({files})`), qui ouvre la feuille de partage iOS (Messages, Courriel, Fichiers…). Sinon, repli sur un lien `<a download>`.
- Import : `<input type="file" accept="image/*,.json">` + `FileReader`. Une image est réduite à 1600 px au maximum (JPEG 0,82) et placée en arrière-plan, pour décalquer une photo de plan existant.

## Pistes pour la suite

- Grille à l'échelle (1 carreau = x mm) pour remplir la valeur des cotes automatiquement.
- Mode quadrillage **isométrique** (axes à 30°) pour les croquis 3D. C'est peu coûteux et ça reste dans le moteur 2D.
- La vraie 3D (extrusion d'un plan en pièce qu'on fait tourner) demanderait Three.js et un modèle de contours fermés avec trous. C'est un chantier de plusieurs semaines.
- Export DXF si les plans doivent aller vers une table de découpe ou un atelier.
