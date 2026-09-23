# Maquettes — dossier de transfert

Tout ce qu'il faut pour travailler les maquettes ailleurs, sans ce dépôt sous la main.
Rédigé le 22 septembre 2026.

> **Ce que je n'ai pas pu vérifier.** Le dossier `mockups/` n'était pas dans l'arbre de
> travail au moment d'écrire : tout ce qui décrit *le contenu des fichiers de maquette*
> (noms exacts, nombre d'écrans par option) vient de la mémoire de la session et demande
> une vérification rapide dans le dossier. Tout ce qui décrit **l'application construite**
> (variables CSS, clés de modules, contrat du manifeste, routes, règles) a été relu dans le
> code aujourd'hui et est exact.

---

## 1. Le produit

PWA de gestion de temps pour petites compagnies d'excavation et de construction, vendue à
plusieurs compagnies (multi-compagnies). Client pilote : **Excavation J2B** (Jordan Boucher).
Éditeur : BossLabs.

Les opérateurs saisissent sur un téléphone, **avec des gants, au soleil, souvent sans réseau**.
C'est la contrainte qui prime sur toute considération esthétique.

### Les rôles

| Rôle | Ce qu'il fait |
|---|---|
| **bluehat** (opérateur) | saisit du temps, des voyages, des matériaux, des photos et des notes sur des chantiers **déjà existants** et **qui lui sont assignés** |
| **whitehat** (contremaître) | tout ce qui précède, plus : voit le calendrier, crée des chantiers et des clients, voit tout ce qui a été saisi sur un chantier |
| **admin** | tout ce qui précède, plus : configure les types de voyage, les véhicules, les matériaux, les réglages, et exporte un chantier en CSV |
| **vendeur** | hors compagnie. Console PC réservée à l'éditeur : ouvrir des compagnies, leur vendre des modules, changer leurs couleurs, voir leur usage |

### Deux règles de fonctionnement qui se voient à l'écran

1. **Rien ne part tout seul.** Une saisie est gardée sur l'appareil ; c'est un bouton
   **Synchroniser** explicite qui l'envoie. L'écran doit donc montrer en permanence
   *combien de saisies attendent* et *quand a eu lieu la dernière synchro*.
2. **Un chantier reçoit quatre natures de saisie** : temps, voyages, photos et « autre »
   (majoritairement des matériaux), plus les notes de chantier.

---

## 2. Les trois options de design

| Option | Direction |
|---|---|
| **A** | inspirée du croquis à la main du client : écran sombre, **boutons circulaires**, logo de la compagnie au centre |
| **B** | direction différente, libre |
| **C** | direction différente, libre |

Aucune décision n'a été prise. L'application a été construite avec un **habillage
volontairement brut** pour que le choix puisse s'appliquer sans toucher à la logique.

### Inventaire (à vérifier dans le dossier)

27 écrans au total, soit **9 par option**, présentés en 3 rangées (A, B, C) sur le canevas :

1. accueil bluehat
2. accueil whitehat
3. accueil admin
4. calendrier (whitehat)
5. ajout d'un voyage
6. saisie de temps
7. ajout d'un chantier
8. configuration admin (mobile)
9. configuration admin (**version PC**)

Le bouton **Synchroniser** et la saisie « autre / matériaux » ont été ajoutés *dans* ces
écrans lors d'une deuxième passe, pas comme écrans supplémentaires.

Canevas d'origine (27 plans de travail) :
<https://claude.ai/artifact/76HFQjZZTuyxzbLzecufRN>

---

## 3. Organisation du dossier `mockups/`

```
mockups/
  index.html                  galerie qui lie tous les écrans
  <écran>.html                27 pages autonomes
  assets/logo_transparent.png logo J2B, fond transparent  ← à utiliser
  assets/logo.jpeg            logo J2B d'origine, fond noir
  source/*.dc.html            sources
  source/canvas.json          disposition du canevas
  source/export-standalone.py régénère les pages autonomes
```

**Règle apprise à la dure** : dans les pages publiées, les chemins d'images s'écrivent
`assets/...` et **jamais** `../assets/...`. Le `../` fonctionne en local et casse une fois
publié sur GitHub Pages. Le logo doit rester **dans** le dossier publié, pas à la racine du
dépôt.

### Les maquettes vendeur — à ne jamais publier

```
mockups-vendeur-prive/
  A-Vendeur-PC.html   B-Vendeur-PC.html   C-Vendeur-PC.html
  D-Vendeur-PC.html   ← thématique bosslabs.ca
  index.html   README.md   .gitignore (contenant « * »)
```

Demande explicite du client : *« ne la mets pas avec les autres, je ne veux pas la publier
par mégarde »*. Le `.gitignore` contenant `*` exclut le dossier entier du dépôt. **Toute
reprise de ces fichiers doit conserver cette exclusion.**

---

## 4. Ce qui a changé depuis : l'application existe

Les maquettes ne sont plus des images libres. L'application est construite et fonctionne ;
le design choisi devra s'y brancher. Ces éléments sont **vérifiés dans le code**.

### Les couleurs viennent du serveur, pas du CSS

Chaque compagnie a sa marque. À la connexion, le manifeste redescend ses couleurs et le
front les écrit sur `document.documentElement` :

```js
root.setProperty('--color-primary', branding.colorPrimary)
root.setProperty('--color-surface', branding.colorSurface)
root.setProperty('--color-text',    branding.colorText)
```

**Conséquence pour le design : aucune couleur en dur.** Une maquette qui suppose du doré sur
du noir ne tient pas — la compagnie suivante est bleue sur blanc. Les trois couleurs
ci-dessus sont les seules pilotées par le client ; les autres sont au design.

Variables actuelles (`web/app/assets/base.css`) :

```css
--color-surface: #0b0b0c;   /* piloté par la compagnie */
--color-panel:   #141310;
--color-text:    #f4f2ee;   /* piloté par la compagnie */
--color-muted:   #a7a7a7;
--color-line:    #2a2823;
--color-primary: #e9a82c;   /* piloté par la compagnie */
--color-on-primary: #14100a;
--color-danger:  #d98a6a;
--color-ok:      #7fa88a;

--radius: 6px;
--gap: 12px;
--touch: 44px;              /* cible tactile minimale, on travaille avec des gants */
--font: system-ui, …
```

Valeurs de J2B : primaire `#E9A82C`, fond `#0B0B0C`, texte `#F4F2EE`, mode sombre.
Construction Delta : primaire `#2F6FD0`.

**Le contraste texte/fond est refusé par l'API sous 4,5:1.** Ce n'est pas une
recommandation : la console vendeur renvoie une erreur avec le rapport exact. Une palette
proposée doit passer ce seuil.

### Les modules sont des données, pas du code

Ce qui apparaît dans l'interface vient du manifeste de la compagnie. Clés réelles :

`time` · `trip` · `material` · `photo` · `note` · `calendar` · `client` · `export_csv` ·
`client_signature`

- Une compagnie de construction **n'a pas** le module `trip` (Voyages).
- Une compagnie de paysagement l'appelle **« Livraisons »**.
- Chez Delta, `note` s'appelle **« Rapport »**.

**Conséquence pour le design : l'accueil opérateur porte au maximum quatre bulles, et leur
nombre, leur libellé et leur ordre changent d'un client à l'autre.** Une maquette d'accueil
doit tenir avec 2, 3 ou 4 bulles, et avec des libellés plus longs que prévu.

Contrat du manifeste :

```json
{
  "tenantId": "…", "tenantName": "Excavation J2B", "version": 3,
  "timeZone": "America/Toronto", "locale": "fr-CA",
  "branding": {
    "appDisplayName": "J2B — Temps",
    "colorPrimary": "#E9A82C", "colorSurface": "#0B0B0C", "colorText": "#F4F2EE",
    "themeMode": "dark", "logoUrl": null
  },
  "modules":     [{ "key": "time", "label": "Temps", "showOnHome": true, "sortOrder": 1, "iconKey": null }],
  "homeActions": [ /* les mêmes, filtrés sur showOnHome, 4 au maximum */ ],
  "settings":    { "hour_increment": "0.5", "week_start": "\"monday\"", "require_vehicle": "true" }
}
```

`logoUrl` est encore `null` partout : le téléversement du logo par compagnie n'est pas
livré (il attend le stockage Supabase). **Les maquettes qui posent un logo au centre de
l'écran doivent prévoir le cas où il n'y en a pas** — le repli actuel est le nom affiché.

### Les écrans qui existent déjà

Routes du front (`web/app/pages/`) :

```
/login                  connexion
/                       accueil, tuiles pilotées par le manifeste
/saisie/[type]          une seule page pour time, trip, material, note
/journee                mes saisies du jour, envoyées et en attente
/chantiers              liste + recherche
/chantiers/[id]         fiche : totaux, équipe, saisies par jour
/chantiers/nouveau      création (whitehat)
/calendrier             mois + détail d'une journée
/clients                clients (whitehat)
/config                 configuration (admin)
/export                 export CSV (admin)
/vendeur                console vendeur (PC, ≥ 1024 px)
```

Plus une **barre du bas permanente** (`SyncBar`) : nombre de saisies en attente, état de la
dernière synchro, bouton **Synchroniser**. Elle est présente sur toutes les pages de
l'application de compagnie.

Deux écrans des maquettes **n'ont pas encore d'équivalent** : la **prise de photo** (attend
le stockage) et la **correction d'une saisie** (l'API existe, aucun écran ne l'appelle).

### La console vendeur existe aussi

`/vendeur`, **refusée sous 1024 px** avec un message explicite. Elle liste les compagnies
avec leur usage, en ouvre de nouvelles à partir d'un secteur, change les couleurs, active ou
coupe des modules, suspend un compte. Les maquettes vendeur A/B/C/D peuvent donc être
comparées à quelque chose de réel — l'habillage actuel est brut.

---

## 5. Ce que le design pourra changer, et ce qu'il ne touchera pas

| Change | Ne change pas |
|---|---|
| `web/app/assets/base.css` — couleurs, rayons, espacements, typographie | `web/app/composables/*` — session, file d'attente, synchronisation |
| `web/app/components/SyncBar.vue` et les classes d'habillage (`.tile`, `.list`, `.badge`, `.notice`, `.calendar`) | `web/app/utils/types.ts` — contrats de l'API |
| La mise en page des pages (`web/app/pages/**`) | `web/app/utils/idb.ts` — file hors ligne |
| Les icônes (`iconKey` est prévu dans le manifeste, inutilisé) | Les routes et les clés de modules |

Contraintes non négociables, héritées du terrain :

- cible tactile **≥ 44 px** ;
- contraste texte/fond **≥ 4,5:1**, vérifié par l'API ;
- l'état de synchronisation ne doit **pas** reposer sur la couleur seule (il est écrit en
  toutes lettres aujourd'hui) ;
- l'application doit ouvrir et permettre la saisie **sans réseau**.

---

## 6. Ce qui reste à trancher

- **Le design lui-même** : A, B ou C — c'est la décision qui bloque la suite.
- **Le nom du produit et le domaine** : `gestiontemps.ca` n'est qu'un exemple dans les
  maquettes. À trancher avant le premier déploiement (le domaine entre dans les URL signées
  et la configuration CORS).
- **Les icônes PWA** : `web/public/icon-192.png` et `icon-512.png` sont des carrés
  provisoires. Idéalement générées depuis le logo de chaque compagnie.
- **Le logo par compagnie** : prévu dans le modèle (`logoUrl`), pas encore téléversable.

---

## 7. Pour reprendre le travail ailleurs

À emporter : le dossier `mockups/` complet (y compris `source/` et `assets/`), le dossier
`mockups-vendeur-prive/` **en conservant son `.gitignore`**, et ce fichier.

Pour régénérer les pages autonomes après modification des sources :

```bash
python mockups/source/export-standalone.py
```

Vérifier ensuite qu'aucun `../assets/` n'est réapparu dans les pages publiées :

```bash
grep -rn "\.\./assets/" mockups/*.html
```

Documents de référence restés dans le dépôt : [plan technique](plan-technique.md),
[schéma de base](db-schema.md), [backlog](backlog.md) (état PBI par PBI).
