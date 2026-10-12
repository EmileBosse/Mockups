/* ==========================================================================
   Municipalité de Biencourt — Option B « Portail citoyen »
   recherche.js : données partagées, index de contenu et moteur de recherche
   côté client (résultats live groupés, surlignage, suggestions, raccourci « / »,
   navigation clavier), + petits comportements communs (menu, alerte, toast).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Utilitaires de date (aujourd'hui = jeudi 8 octobre 2026) ---------- */
  var TODAY = new Date(2026, 9, 8);
  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  var MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  function parseD(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function fmtLong(s) { var d = parseD(s); return JOURS[d.getDay()] + ' ' + (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function fmtShort(s) { var d = parseD(s); return (d.getDate() === 1 ? '1er' : d.getDate()) + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear(); }
  function daysFrom(s) { return Math.round((parseD(s) - TODAY) / 86400000); }

  /* ---------- Stockage local tolérant aux erreurs ---------- */
  var store = {
    get: function (k, def) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  };

  /* ---------- Catégories d'événements ---------- */
  var CATS = {
    loisirs: { label: 'Loisirs', color: '#1F6FA8' },
    communautaire: { label: 'Communautaire', color: '#3E7F22' },
    municipal: { label: 'Municipal', color: '#0E2A52' },
    culture: { label: 'Culture', color: '#7A3FA0' },
    sport: { label: 'Sport et plein air', color: '#B4521A' }
  };

  /* ---------- Données ---------- */
  var DATA = {
    events: [
      { id: 'ev-souper-spaghetti', date: '2026-10-10', time: '17 h 30', title: 'Souper spaghetti du Club des 50 ans et plus', lieu: 'Salle communautaire, 2, rue St-Marc', cat: 'communautaire', org: 'Club des 50 ans et plus', desc: 'Souper, tirages et musique. 15 $ adulte, 8 $ enfant. Billets auprès de Marc Pelletier.' },
      { id: 'ev-cuisines-collectives', date: '2026-10-14', time: '9 h', title: 'Cuisines collectives du Haut-Pays', lieu: 'Salle communautaire, 2, rue St-Marc', cat: 'communautaire', org: 'Cuisines collectives du Haut-Pays', desc: 'Cuisiner ensemble des plats économiques à rapporter à la maison. Tous les mercredis.' },
      { id: 'ev-encombrants', date: '2026-10-17', time: 'Dès 7 h', title: 'Collecte des encombrants', lieu: 'Tout le territoire', cat: 'municipal', org: 'Municipalité / RIDT', desc: 'Déposez vos gros objets en bordure de rue la veille au soir. Pas de pneus, ni de matériaux de construction.' },
      { id: 'ev-randonnee-lac', date: '2026-10-18', time: '10 h', title: 'Randonnée des couleurs autour du lac Biencourt', lieu: 'Halte de la piste cyclable, lac Biencourt', cat: 'sport', img: 'Pont_saut.png', org: 'Comité des loisirs', desc: 'Marche familiale de 6 km, chocolat chaud au retour. Gratuit.' },
      { id: 'ev-taxes-6', date: '2026-10-19', time: 'Avant 16 h 30', title: 'Échéance du 6e versement de taxes', lieu: 'Bureau municipal ou en ligne', cat: 'municipal', org: 'Municipalité', desc: 'Dernier versement des taxes municipales 2026. Référence de paiement : votre matricule à 10 chiffres.' },
      { id: 'ev-bingo-halloween', date: '2026-10-24', time: '13 h 30', title: 'Bingo de l\'Halloween pour les familles', lieu: 'Salle communautaire, 2, rue St-Marc', cat: 'loisirs', org: 'Comité des loisirs', desc: 'Bingo costumé pour petits et grands, prix de présence et collations.' },
      { id: 'ev-parcours-halloween', date: '2026-10-31', time: '17 h', title: 'Parcours d\'Halloween', lieu: 'Centre des loisirs', cat: 'loisirs', org: 'Comité des loisirs', desc: 'Sentier hanté, distribution de bonbons et feu de joie. Apportez votre lampe de poche!' },
      { id: 'ev-seance-2026-11-02', date: '2026-11-02', time: '19 h 30', title: 'Séance ordinaire du conseil', lieu: 'Salle du conseil, 5, rue Berger', cat: 'municipal', org: 'Conseil municipal', desc: 'Séance publique. Ordre du jour disponible le 30 octobre. Période de questions.' },
      { id: 'ev-concert-chorale', date: '2026-11-14', time: '19 h 30', title: 'Concert de la Chorale de Biencourt', lieu: 'Église de Biencourt', cat: 'culture', org: 'Chorale de Biencourt', desc: 'Répertoire d\'automne et chants traditionnels. Contribution volontaire.' },
      { id: 'ev-marche-noel', date: '2026-11-28', time: '10 h à 16 h', title: 'Marché de Noël artisanal', lieu: 'Salle communautaire, 2, rue St-Marc', cat: 'culture', org: 'Comité Solidarité, partage', desc: 'Une vingtaine d\'artisans du Haut-Pays : tricots, produits de l\'érable, bijoux, pâtisseries.' },
      { id: 'ev-ouverture-mont', date: '2026-12-06', time: '9 h', title: 'Ouverture prévue du Mont Biencourt', lieu: 'Mont Biencourt (à 3 km du village)', cat: 'sport', img: 'centre_de_ski_vue_de_la_trois_automne.png', org: 'Mont Biencourt', desc: 'Selon les conditions de neige naturelle. 13 pentes, 4 sous-bois, glissade sur tube.' },
      { id: 'ev-seance-2026-12-07', date: '2026-12-07', time: '19 h 30', title: 'Séance ordinaire du conseil', lieu: 'Salle du conseil, 5, rue Berger', cat: 'municipal', org: 'Conseil municipal', desc: 'Dernière séance de l\'année. Adoption du calendrier des séances 2027.' },
      { id: 'ev-noel-enfants', date: '2026-12-13', time: '13 h', title: 'Fête de Noël des enfants 0-12 ans', lieu: 'Centre des loisirs', cat: 'loisirs', img: 'centre_de_ski_cours_motoneige.png', org: 'Comité des loisirs', desc: 'Visite du père Noël, bricolages et cadeaux. Inscription requise avant le 1er décembre.' }
    ],
    pv: [
      { date: '2026-01-13', type: 'Ordinaire', size: '412 Ko' },
      { date: '2026-02-02', type: 'Ordinaire', size: '388 Ko' },
      { date: '2026-02-19', type: 'Extraordinaire', size: '146 Ko' },
      { date: '2026-03-02', type: 'Ordinaire', size: '455 Ko' },
      { date: '2026-03-30', type: 'Extraordinaire', size: '131 Ko' },
      { date: '2026-04-14', type: 'Ordinaire', size: '402 Ko' },
      { date: '2026-05-04', type: 'Ordinaire', size: '437 Ko' },
      { date: '2026-05-25', type: 'Extraordinaire', size: '158 Ko' },
      { date: '2026-06-01', type: 'Ordinaire', size: '421 Ko' },
      { date: '2026-07-06', type: 'Ordinaire', size: '376 Ko' },
      { date: '2026-08-18', type: 'Ordinaire', size: '398 Ko' },
      { date: '2026-09-15', type: 'Ordinaire', size: '446 Ko' }
    ],
    news: [
      { id: 'avis-ebullition-leve', date: '2026-10-06', type: 'Avis', title: 'Avis d\'ébullition préventif levé', desc: 'Les analyses confirment que l\'eau du réseau d\'aqueduc (secteur rue Principale Est) est de nouveau propre à la consommation.', kw: 'eau potable aqueduc' },
      { id: 'avis-seance-nov', date: '2026-10-07', type: 'Avis public', title: 'Séance ordinaire du conseil le 2 novembre', desc: 'La séance se tiendra à 19 h 30 à la salle du conseil. L\'ordre du jour sera publié le 30 octobre.', kw: 'reunion conseil municipal' },
      { id: 'avis-encombrants', date: '2026-10-02', type: 'Avis', title: 'Collecte des encombrants le 17 octobre', desc: 'Déposez vos gros objets en bordure de rue la veille. Les pneus et matériaux de construction sont refusés.', kw: 'ordures vidanges gros rebuts ridt' },
      { id: 'nouv-abris', date: '2026-10-01', type: 'Nouvelle', title: 'Abris d\'auto temporaires permis dès le 15 octobre', desc: 'Les abris temporaires sont autorisés du 15 octobre au 30 avril, à 1,5 m de la chaussée.', kw: 'urbanisme tempo garage hiver' },
      { id: 'nouv-emploi-patinoire', date: '2026-09-30', type: 'Nouvelle', title: 'Offre d\'emploi : préposé·e à la patinoire', desc: 'Poste saisonnier de décembre à mars, environ 20 h par semaine. CV au bureau municipal avant le 23 octobre.', kw: 'emploi job travail loisirs' },
      { id: 'nouv-budget-2027', date: '2026-09-28', type: 'Nouvelle', title: 'Budget 2027 : vos idées sont les bienvenues', desc: 'Le conseil prépare le budget 2027. Faites part de vos priorités d\'ici le 30 octobre.', kw: 'consultation taxes finances' },
      { id: 'avis-feux', date: '2026-09-22', type: 'Avis', title: 'Feux à ciel ouvert : permis obligatoire', desc: 'Un permis gratuit est requis pour tout brûlage. Vérifiez l\'indice SOPFEU avant d\'allumer.', kw: 'sopfeu incendie brulage' }
    ]
  };

  /* Pages et services du site (les URL "#" sont des pages hors maquette) */
  var PAGES = [
    { title: 'Payer mes taxes municipales', desc: 'Six versements en 2026. Paiement à l\'institution financière, au guichet, par téléphone ou par Internet avec votre matricule à 10 chiffres.', url: 'accueil.html#taxes', kw: 'taxes compte paiement versement matricule echeance impot foncier', meta: 'Service' },
    { title: 'Dates d\'échéance des taxes 2026', desc: '23 mars, 4 mai, 15 juin, 27 juillet, 7 septembre et 19 octobre. Un seul versement si le compte est inférieur à 300 $.', url: 'accueil.html#taxes', kw: 'taxes echeance versements calendrier', meta: 'Administration' },
    { title: 'Conseil municipal', desc: 'Le maire, les six conseillères et conseillers, et leurs dossiers.', url: 'conseil.html', kw: 'maire elus conseillers dumont', meta: 'Municipalité' },
    { title: 'Calendrier des séances du conseil 2026', desc: 'Séances ordinaires à 19 h 30 à la salle du conseil. Prochaine : lundi 2 novembre.', url: 'conseil.html#calendrier', kw: 'seances reunion assemblee horaire', meta: 'Conseil' },
    { title: 'Procès-verbaux', desc: 'Tous les procès-verbaux des séances ordinaires et extraordinaires, 2023 à 2026.', url: 'conseil.html#proces-verbaux', kw: 'pv proces verbaux compte rendu resolutions', meta: 'Conseil' },
    { title: 'Avis publics', desc: 'Avis de séances, d\'entrée en vigueur de règlements, de dérogations mineures et d\'appels d\'offres.', url: 'conseil.html#avis', kw: 'avis public appel offres derogation', meta: 'Conseil' },
    { title: 'Règlements municipaux', desc: 'Consultez les règlements en vigueur : taxation, nuisances, zonage, éthique.', url: 'conseil.html#reglements', kw: 'reglement reglementation zonage', meta: 'Conseil' },
    { title: 'Code d\'éthique et de déontologie', desc: 'Code d\'éthique des élus et des employés municipaux.', url: '#', kw: 'ethique deontologie elus employes', meta: 'Administration' },
    { title: 'Politique de gestion contractuelle', desc: 'Règles d\'octroi des contrats municipaux.', url: '#', kw: 'contrats gestion contractuelle appel offres', meta: 'Administration' },
    { title: 'Contrats de plus de 25 000 $', desc: 'Liste publique des contrats octroyés par la Municipalité.', url: '#', kw: 'contrats liste depenses', meta: 'Administration' },
    { title: 'Eau potable', desc: 'Qualité de l\'eau, avis d\'ébullition, économie d\'eau et réseau d\'aqueduc.', url: '#', kw: 'eau aqueduc ebullition puits qualite', meta: 'Administration' },
    { title: 'Déposer une plainte ou une requête', desc: 'Nid-de-poule, lampadaire, déneigement, nuisance : signalez-le en ligne.', url: '#', kw: 'plainte requete signaler probleme deneigement lampadaire', meta: 'Service' },
    { title: 'Urbanisme et permis', desc: 'Permis de construction, rénovation, piscine, abri temporaire et dérogation mineure.', url: '#', kw: 'permis construction renovation zonage inspecteur piscine cabanon', meta: 'Service' },
    { title: 'Office municipal d\'habitation', desc: '13 logements pour personnes de 50 ans et plus, 4, rue St-Marc.', url: '#', kw: 'logement habitation omh aines', meta: 'Municipalité' },
    { title: 'Politiques municipales', desc: 'Politique familiale et des aînés (MADA), politique de dons et commandites.', url: '#', kw: 'politique familiale mada aines', meta: 'Municipalité' },
    { title: 'Infos RIDT — collectes et matières résiduelles', desc: 'Calendrier des collectes d\'ordures, de recyclage et de compost, écocentre.', url: '#', kw: 'ridt collecte ordures vidanges poubelle recyclage compost bac ecocentre dechets', meta: 'Service' },
    { title: 'Station de lavage et débarcadère', desc: 'Lavage obligatoire des embarcations avant la mise à l\'eau au lac Biencourt.', url: '#', kw: 'bateau embarcation lavage debarcadere lac quai', meta: 'Service' },
    { title: 'Cartes et rôle d\'évaluation', desc: 'Rôle d\'évaluation foncière et cartographie de la MRC de Témiscouata.', url: '#', kw: 'evaluation role foncier carte cadastre mrc', meta: 'Municipalité' },
    { title: 'Liens utiles', desc: 'MRC de Témiscouata, SOPFEU, Info-Santé 811, Québec 511.', url: '#', kw: 'liens mrc sante', meta: 'Municipalité' },
    { title: 'Danger d\'incendie SOPFEU', desc: 'Indice du jour pour la zone Kamouraska–RDL–Témis–Les Basques.', url: 'accueil.html#sopfeu', kw: 'sopfeu feu incendie foret brulage', meta: 'Service' },
    { title: 'Camping municipal et chalets', desc: '18 chalets dont 10 à l\'année, terrains pour roulottes, buanderie et douches. 1, chemin du Camping · 418-499-2353.', url: 'accueil.html#camping', kw: 'camping chalet roulotte location lac vacances', meta: 'Vivre à Biencourt' },
    { title: 'Mont Biencourt', desc: '13 pentes, 4 sous-bois, glissade sur tube, parc à neige, 185 m de dénivelé. À 3 km du village.', img: 'centre_de_ski_vue_de_la_trois_automne.png', url: 'accueil.html#mont', kw: 'ski glisse snowboard planche montagne hiver tube', meta: 'Vivre à Biencourt' },
    { title: 'Lac Biencourt', desc: 'Villégiature, nautisme, pêche et piste cyclable près du lac.', img: 'Cascade_saut.png', url: '#', kw: 'lac peche bateau velo plage', meta: 'Vivre à Biencourt' },
    { title: 'Centre des loisirs', desc: 'Terrain de baseball, patinoire et deck hockey.', url: '#', kw: 'loisirs patinoire hockey baseball sport', meta: 'Vivre à Biencourt' },
    { title: 'Album photo', desc: 'Les plus belles images de Biencourt au fil des saisons.', img: 'Pont_saut.png', url: '#', kw: 'photos images galerie', meta: 'Vivre à Biencourt' },
    { title: 'Un brin d\'histoire', desc: 'Érigée en 1947, Biencourt honore le baron Charles de Biencourt de Saint-Just, commandant de Port-Royal en 1611.', img: 'vue_biencourt_montagne_de_la_tour.png', url: '#', kw: 'histoire fondation 1947 acadie patrimoine', meta: 'Municipalité' },
    { title: 'Nous joindre', desc: '5, rue Berger, C.P. 70 · 418-499-2423 · info@biencourt.ca · Lun-jeu 8 h 30-12 h, 13 h-16 h 30.', url: '#nous-joindre', kw: 'contact telephone courriel adresse heures bureau', meta: 'Municipalité' },
    { title: 'Événements et activités à venir', desc: 'Tout ce qui se passe à Biencourt : loisirs, culture, vie communautaire.', url: 'evenements.html', kw: 'activites calendrier agenda', meta: 'Événements' }
  ];

  var JOURNAL = [
    { title: 'Le Biencourtois — Octobre 2026', desc: 'Vol. 12, no 10 · Fête des récoltes, saison du Mont Biencourt, mot du maire. PDF, 16 pages.', img: 'centre_de_ski_cours_motoneige.png', url: 'journal.html#edition-courante', kw: 'edition courante pdf journal', meta: 'Édition courante', date: '2026-10-01' },
    { title: 'Retour sur la Fête des récoltes', desc: 'Plus de 250 personnes ont célébré l\'automne au Centre des loisirs.', img: 'vue_biencourt_montagne_de_la_tour.png', url: 'journal.html#article-recoltes', kw: 'fete recoltes automne', meta: 'Article · oct. 2026' },
    { title: 'Le Mont Biencourt prépare sa saison 2026-2027', desc: 'Nouveau tapis magique et sentier de raquette balisé au programme.', img: 'centre_de_ski_vue_de_la_trois_automne.png', url: 'journal.html#article-mont', kw: 'ski mont saison hiver', meta: 'Article · oct. 2026' },
    { title: 'Mot du maire : budget 2027 en préparation', desc: 'Daniel Dumont présente les grandes priorités du prochain budget.', url: 'journal.html#article-maire', kw: 'maire dumont budget taxes', meta: 'Article · oct. 2026' },
    { title: 'Portrait : 40 ans d\'acériculture chez les Beaulieu', desc: 'Trois générations, 12 000 entailles et beaucoup de passion.', url: 'journal.html#article-acericulture', kw: 'erable sirop cabane sucre acericulture', meta: 'Article · oct. 2026' },
    { title: 'Collecte des encombrants le 17 octobre', desc: 'Ce qui est accepté, ce qui ne l\'est pas, et à quelle heure sortir vos objets.', url: 'journal.html#article-encombrants', kw: 'collecte ordures encombrants', meta: 'Article · oct. 2026' },
    { title: 'Chronique nature : les chevreuils sortent du bois', desc: 'Conseils pour cohabiter avec le cerf de Virginie à l\'approche de l\'hiver.', img: 'chevreuille.png', url: 'journal.html#article-chevreuils', kw: 'chevreuil cerf faune nature chasse', meta: 'Article · oct. 2026' },
    { title: 'Sentier du Saut : la passerelle a été rénovée', desc: 'La passerelle au-dessus de la rivière est rouverte aux marcheurs.', img: 'Pont_saut.png', url: 'journal.html#article-saut', kw: 'sentier pont passerelle cascade chute riviere randonnee', meta: 'Article · sept. 2026' },
    { title: 'Le Biencourtois — Septembre 2026', desc: 'Vol. 12, no 9 · Rentrée scolaire, bilan de la saison au camping. PDF, 12 pages.', url: 'journal.html#archives', kw: 'archives pdf', meta: 'Archive' },
    { title: 'Le Biencourtois — Juillet-août 2026', desc: 'Vol. 12, no 7-8 · Édition double estivale. PDF, 20 pages.', url: 'journal.html#archives', kw: 'archives pdf ete', meta: 'Archive' },
    { title: 'Le Biencourtois — Juin 2026', desc: 'Vol. 12, no 6 · Fête nationale, ouverture du camping. PDF, 12 pages.', url: 'journal.html#archives', kw: 'archives pdf', meta: 'Archive' }
  ];

  var REGLEMENTS = [
    { title: 'Règlement 2026-01 — Taux de taxes et tarifs 2026', desc: 'Fixe les taux de la taxe foncière, des services et les modalités de paiement.', kw: 'taxes taxation tarifs' },
    { title: 'Règlement 2026-02 — Code d\'éthique des élus (révisé)', desc: 'Adopté le 2 février 2026, à la suite des élections générales.', kw: 'ethique deontologie elus' },
    { title: 'Règlement 2026-03 — Nuisances et paix publique', desc: 'Bruit, feux extérieurs, animaux, entretien des terrains.', kw: 'nuisances bruit chiens animaux feux' },
    { title: 'Règlement 2025-04 — Amendement au règlement de zonage', desc: 'Usages permis en bordure du lac Biencourt.', kw: 'zonage urbanisme lac riverain' },
    { title: 'Règlement 2025-02 — Gestion contractuelle', desc: 'Mesures de saine concurrence dans l\'octroi des contrats.', kw: 'contrats gestion contractuelle' },
    { title: 'Règlement 2024-05 — Circulation des VTT et motoneiges', desc: 'Tronçons de chemins municipaux autorisés.', kw: 'vtt quad motoneige circulation sentier' }
  ];

  var COMMERCES = [
    { title: 'Épicerie Chez Lelou', desc: '19, Principale Est · Épicerie, dépanneur, comptoir de mets préparés.', kw: 'epicerie depanneur nourriture lelou' },
    { title: 'Coiffure Karo', desc: '20, rue Berger · Salon de coiffure.', kw: 'coiffure coiffeuse salon cheveux' },
    { title: 'Coiffure Linda', desc: '4, de la Nativité · Salon de coiffure.', kw: 'coiffure coiffeuse salon cheveux' },
    { title: 'Bureau de poste', desc: '14, Principale Ouest · Postes Canada.', kw: 'poste courrier colis postes canada' },
    { title: 'Camping municipal de Biencourt', desc: '1, chemin du Camping · 418-499-2353.', kw: 'camping chalets' }
  ];

  var ORGANISMES = [
    { title: 'Comité des loisirs', desc: 'Responsable : Yvan Beaulieu · Activités familiales et Centre des loisirs.', kw: 'loisirs activites beaulieu' },
    { title: 'Comité Solidarité, partage', desc: 'Responsable : Linda Lavoie · Entraide et dépannage alimentaire.', kw: 'entraide solidarite partage aide alimentaire lavoie' },
    { title: 'Chorale de Biencourt', desc: 'Responsable : Monique Thériault · Répétitions le mardi soir.', kw: 'chorale chant musique theriault' },
    { title: 'Organisme de participation des parents (OPP)', desc: 'Responsable : Weena Beaulieu · École primaire.', kw: 'opp ecole parents beaulieu' },
    { title: 'Club de motoneige', desc: 'Entretien des sentiers et relais pour motoneigistes.', kw: 'motoneige sentiers hiver' },
    { title: 'Fabrique de Biencourt', desc: 'Paroisse, église et cimetière.', kw: 'fabrique eglise paroisse messe cimetiere' },
    { title: 'Club des 50 ans et plus', desc: 'Responsable : Marc Pelletier · Soupers, cartes et sorties.', kw: 'aines fadoq 50 ans pelletier' },
    { title: 'Cuisines collectives du Haut-Pays', desc: 'Les mercredis à la salle communautaire, 2, rue St-Marc.', kw: 'cuisine repas collectives' }
  ];

  var CONSEIL = [
    { title: 'Daniel Dumont, maire', desc: 'Représentant à la MRC de Témiscouata. Administration générale.', kw: 'maire dumont' },
    { title: 'Daniel Rioux, conseiller poste 1', desc: 'Voirie et déneigement.', kw: 'conseiller rioux voirie' },
    { title: 'Sébastien Beaulieu, conseiller poste 2', desc: 'Loisirs et Mont Biencourt.', kw: 'conseiller beaulieu loisirs' },
    { title: 'Kathleen Lebel, conseillère poste 3', desc: 'Famille, aînés et politique MADA.', kw: 'conseillere lebel famille' },
    { title: 'Francis Godin, conseiller poste 4', desc: 'Hygiène du milieu, eau potable et matières résiduelles.', kw: 'conseiller godin eau' },
    { title: 'Sylvie Jacques, conseillère poste 5', desc: 'Culture, patrimoine et communications.', kw: 'conseillere jacques culture' },
    { title: 'Linda Lavoie, conseillère poste 6', desc: 'Développement communautaire et camping.', kw: 'conseillere lavoie camping' }
  ];

  /* ---------- Types de résultats ---------- */
  var ICONS = {
    page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    nouvelle: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
    evenement: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    pv: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    reglement: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
    journal: '<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v10a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 17h3"/>',
    commerce: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    organisme: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    conseil: '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.page) + '</svg>';
  }

  var TYPES = {
    page: { label: 'Pages et services' },
    evenement: { label: 'Événements' },
    nouvelle: { label: 'Avis et nouvelles' },
    pv: { label: 'Procès-verbaux' },
    reglement: { label: 'Règlements' },
    journal: { label: 'Le Biencourtois' },
    conseil: { label: 'Membres du conseil' },
    commerce: { label: 'Commerces' },
    organisme: { label: 'Organismes' }
  };

  /* ---------- Normalisation ---------- */
  function norm1(c) { return c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function stem(w) { return w.length > 3 && /s$/.test(w) ? w.slice(0, -1) : (w.length > 4 && /x$/.test(w) ? w.slice(0, -1) : w); }
  function words(s) { return norm(s).split(/[^a-z0-9œæ]+/).filter(Boolean).map(stem); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  var STOP = {};
  'a au aux de des du d en et l la le les un une pour par sur mon ma mes ou que qui quoi comment je j est ce se y'.split(' ').forEach(function (w) { STOP[w] = 1; });

  var BASE_SYN = {
    pv: ['proce', 'verbal', 'verbaux'],
    impot: ['taxe', 'versement'],
    compte: ['taxe'],
    ski: ['mont', 'glissade', 'pente'],
    planche: ['mont'],
    vidange: ['collecte', 'ridt', 'encombrant'],
    poubelle: ['collecte', 'ridt', 'ordure'],
    dechet: ['collecte', 'ridt', 'ordure'],
    ordure: ['collecte', 'ridt'],
    recyclage: ['collecte', 'ridt'],
    reunion: ['seance'],
    assemblee: ['seance'],
    feu: ['sopfeu', 'incendie'],
    maire: ['dumont'],
    chalet: ['camping'],
    hockey: ['patinoire', 'loisir'],
    job: ['emploi'],
    travail: ['emploi'],
    eglise: ['fabrique'],
    messe: ['fabrique', 'eglise'],
    contact: ['joindre', 'telephone'],
    telephone: ['joindre'],
    horaire: ['heure', 'joindre'],
    halloween: ['halloween'],
    journal: ['biencourtoi'],
    sirop: ['acericulture', 'erable'],
    piscine: ['permis'],
    garage: ['abri']
  };
  var userSyn = store.get('bc-synonymes', []); // [{de:'x', vers:'y'}]

  function synFor(tk) {
    var alts = (BASE_SYN[tk] || []).slice();
    userSyn.forEach(function (s) {
      var de = stem(norm(s.de)), vers = words(s.vers);
      if (de === tk) alts = alts.concat(vers);
    });
    return alts;
  }

  /* ---------- Construction de l'index ---------- */
  var INDEX = [];
  function prep(item) {
    item._t = words(item.title);
    item._k = words(item.kw || '');
    item._d = words(item.desc || '');
    item._m = words((item.meta || '') + ' ' + (TYPES[item.t] ? TYPES[item.t].label : ''));
    return item;
  }
  function eventItem(e) {
    return prep({ t: 'evenement', id: e.id, title: e.title, desc: e.desc + ' — ' + e.lieu + ', ' + e.time + '.', url: 'evenements.html#' + e.id, kw: (CATS[e.cat] ? CATS[e.cat].label : '') + ' ' + e.org + ' ' + e.lieu + ' ' + MOIS[parseD(e.date).getMonth()], meta: fmtShort(e.date), date: e.date, added: e.added, img: e.img });
  }
  function buildIndex() {
    INDEX = [];
    PAGES.forEach(function (p) { INDEX.push(prep({ t: 'page', title: p.title, desc: p.desc, url: p.url, kw: p.kw, meta: p.meta, img: p.img })); });
    DATA.events.forEach(function (e) { INDEX.push(eventItem(e)); });
    DATA.news.forEach(function (n) { INDEX.push(prep({ t: 'nouvelle', title: n.title, desc: n.desc, url: 'conseil.html#avis', kw: n.kw + ' ' + n.type, meta: n.type + ' · ' + fmtShort(n.date), date: n.date })); });
    DATA.pv.forEach(function (p) {
      INDEX.push(prep({ t: 'pv', title: 'Procès-verbal — séance ' + p.type.toLowerCase() + ' du ' + fmtShort(p.date), desc: 'Document PDF, ' + p.size + '. Résolutions adoptées et période de questions.', url: 'conseil.html#pv-' + p.date, kw: 'pv proces verbal ' + MOIS[parseD(p.date).getMonth()] + ' 2026 seance', meta: 'PDF · ' + p.size, date: p.date }));
    });
    ['2025', '2024', '2023'].forEach(function (y) { INDEX.push(prep({ t: 'pv', title: 'Procès-verbaux ' + y + ' (archives)', desc: 'Toutes les séances de l\'année ' + y + '.', url: 'conseil.html#proces-verbaux', kw: 'pv proces verbaux archives ' + y, meta: 'Archives' })); });
    JOURNAL.forEach(function (j) { INDEX.push(prep({ t: 'journal', title: j.title, desc: j.desc, url: j.url, kw: j.kw + ' biencourtois journal', meta: j.meta, img: j.img })); });
    REGLEMENTS.forEach(function (r, i) { INDEX.push(prep({ t: 'reglement', title: r.title, desc: r.desc, url: 'conseil.html#reglements', kw: r.kw, meta: 'En vigueur' })); });
    CONSEIL.forEach(function (c) { INDEX.push(prep({ t: 'conseil', title: c.title, desc: c.desc, url: 'conseil.html#membres', kw: c.kw + ' elu conseil', meta: 'Conseil municipal' })); });
    COMMERCES.forEach(function (c) { INDEX.push(prep({ t: 'commerce', title: c.title, desc: c.desc, url: '#', kw: c.kw + ' commerce', meta: 'Commerce local' })); });
    ORGANISMES.forEach(function (o) { INDEX.push(prep({ t: 'organisme', title: o.title, desc: o.desc, url: '#', kw: o.kw + ' organisme', meta: 'Organisme' })); });
    // Contenu ajouté depuis l'administration (persisté localement pour la démo)
    store.get('bc-ajouts', []).forEach(function (a) {
      if (a.t === 'evenement') { INDEX.push(eventItem(a)); }
      else { a.added = a.added || Date.now(); INDEX.push(prep(a)); }
    });
    buildVocab();
  }

  // Événements ajoutés via l'admin : on les injecte aussi dans les données
  store.get('bc-ajouts', []).forEach(function (a) { if (a.t === 'evenement') DATA.events.push(a); });
  DATA.events.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

  var VOCAB = [];
  function buildVocab() {
    var seen = {};
    INDEX.forEach(function (it) { it._t.concat(it._k).forEach(function (w) { if (w.length >= 4 && !seen[w]) { seen[w] = 1; VOCAB.push(w); } }); });
  }

  /* ---------- Recherche ---------- */
  function matchField(arr, tk) {
    var best = 0;
    for (var i = 0; i < arr.length; i++) {
      var w = arr[i];
      if (w === tk) return 2;
      if (w.indexOf(tk) === 0) best = Math.max(best, 1.4);
      else if (tk.length >= 5 && w.indexOf(tk) > 0) best = Math.max(best, 0.6);
    }
    return best;
  }
  function scoreToken(it, tk) {
    var s = 0;
    s += matchField(it._t, tk) * 10;
    s += matchField(it._k, tk) * 5;
    s += matchField(it._d, tk) * 2.5;
    s += matchField(it._m, tk) * 1.5;
    return s;
  }
  function tokenize(q) {
    var raw = norm(q).split(/[^a-z0-9œæ]+/).filter(Boolean);
    var toks = raw.filter(function (w) { return !STOP[w]; }).map(stem);
    if (!toks.length) toks = raw.map(stem);
    return toks;
  }

  function search(q, opts) {
    opts = opts || {};
    var toks = tokenize(q);
    var res = { query: q, tokens: toks, terms: [], items: [], partial: false, suggestion: null };
    if (!toks.length) return res;
    var terms = {};
    function run(requireAll) {
      var out = [];
      INDEX.forEach(function (it) {
        var total = 0, hits = 0;
        toks.forEach(function (tk) {
          var s = scoreToken(it, tk);
          if (!s) {
            var alts = synFor(tk), bs = 0;
            alts.forEach(function (a) { bs = Math.max(bs, scoreToken(it, a) * 0.5); if (scoreToken(it, a)) terms[a] = 1; });
            s = bs;
          }
          if (s) { hits++; total += s; }
        });
        if (requireAll ? hits === toks.length : hits > 0) {
          if (it.t === 'page') total += 10;
          if (it.date && it.t === 'evenement') total += daysFrom(it.date) >= 0 ? 2 : -4;
          if (it.date && it.t === 'pv') total += parseD(it.date).getTime() / 1e12; // plus récent d'abord
          if (norm(it.title).indexOf(norm(q.trim())) === 0) total += 8;
          out.push({ item: it, score: total });
        }
      });
      return out;
    }
    var found = run(true);
    if (!found.length && toks.length > 1) { found = run(false); res.partial = found.length > 0; }
    found.sort(function (a, b) { return b.score - a.score; });
    res.items = found;
    toks.forEach(function (t) { terms[t] = 1; });
    res.terms = Object.keys(terms);
    if (!found.length) res.suggestion = didYouMean(toks);
    return res;
  }

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 99;
    var m = [], i, j;
    for (i = 0; i <= b.length; i++) m[i] = [i];
    for (j = 0; j <= a.length; j++) m[0][j] = j;
    for (i = 1; i <= b.length; i++) for (j = 1; j <= a.length; j++)
      m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    return m[b.length][a.length];
  }
  function didYouMean(toks) {
    var changed = false;
    var out = toks.map(function (tk) {
      if (INDEX.some(function (it) { return scoreToken(it, tk); })) return tk;
      var best = null, bd = tk.length > 5 ? 3 : 2;
      VOCAB.forEach(function (w) { var d = lev(tk, w); if (d < bd) { bd = d; best = w; } });
      if (best) { changed = true; return best; }
      return tk;
    });
    return changed ? out.join(' ') : null;
  }

  /* ---------- Surlignage insensible aux accents ---------- */
  function highlight(text, terms) {
    text = String(text);
    var n = '', map = [];
    for (var i = 0; i < text.length; i++) { var c = norm1(text[i]); for (var j = 0; j < c.length; j++) { n += c[j]; map.push(i); } }
    var ranges = [];
    terms.forEach(function (t) {
      if (!t || t.length < 2) return;
      var idx = 0;
      while ((idx = n.indexOf(t, idx)) !== -1) {
        var prev = n.charAt(idx - 1);
        if (idx === 0 || !/[a-z0-9]/.test(prev) || t.length >= 4) ranges.push([map[idx], map[idx + t.length - 1] + 1]);
        idx += t.length;
      }
    });
    if (!ranges.length) return esc(text);
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [ranges[0]];
    for (var k = 1; k < ranges.length; k++) { var last = merged[merged.length - 1]; if (ranges[k][0] <= last[1]) last[1] = Math.max(last[1], ranges[k][1]); else merged.push(ranges[k]); }
    var out = '', pos = 0;
    merged.forEach(function (r) { out += esc(text.slice(pos, r[0])) + '<mark>' + esc(text.slice(r[0], r[1])) + '</mark>'; pos = r[1]; });
    return out + esc(text.slice(pos));
  }
  function snippet(desc, terms, max) {
    max = max || 120;
    if (desc.length <= max) return desc;
    var n = norm(desc), at = -1;
    terms.some(function (t) { var i = n.indexOf(t); if (i >= 0) { at = i; return true; } return false; });
    if (at < 60) return desc.slice(0, max).replace(/\s+\S*$/, '') + '…';
    var start = Math.max(0, at - 40);
    return '…' + desc.slice(start, start + max).replace(/^\S*\s/, '').replace(/\s+\S*$/, '') + '…';
  }

  /* ---------- Journal des requêtes (analytique de démo pour l'admin) ---------- */
  function logQuery(q, count) {
    q = q.trim().toLowerCase(); if (q.length < 2) return;
    var key = count ? 'bc-requetes' : 'bc-sans-resultat';
    var st = store.get(key, {}); st[q] = (st[q] || 0) + 1; store.set(key, st);
  }
  function saveRecent(q) {
    q = q.trim(); if (q.length < 2) return;
    var r = store.get('bc-recentes', []).filter(function (x) { return x.toLowerCase() !== q.toLowerCase(); });
    r.unshift(q); store.set('bc-recentes', r.slice(0, 4));
  }

  var POPULAR = ['taxes', 'procès-verbaux', 'collecte', 'camping', 'séance du conseil'];

  /* ---------- Composant de recherche ---------- */
  var uid = 0;
  function mount(form) {
    var input = form.querySelector('input[type="search"]');
    if (!input || form._bc) return; form._bc = true;
    var id = 'sb' + (++uid);
    var panel = document.createElement('div');
    panel.className = 'sb-panel'; panel.id = id + '-panel'; panel.hidden = true;
    panel.setAttribute('role', 'listbox'); panel.setAttribute('aria-label', 'Résultats de recherche');
    form.appendChild(panel);
    var live = document.createElement('div'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); form.appendChild(live);
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', panel.id);
    input.setAttribute('autocomplete', 'off'); input.setAttribute('spellcheck', 'false');
    var limit = parseInt(form.getAttribute('data-limit'), 10) || 4;
    var expanded = {}, active = -1, logTimer = null, lastRes = null;

    function open() { panel.hidden = false; input.setAttribute('aria-expanded', 'true'); form.classList.add('is-open'); }
    function close() { panel.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); form.classList.remove('is-open'); active = -1; }
    function opts() { return panel.querySelectorAll('[data-opt]'); }

    function chip(q) { return '<button type="button" class="sb-chip" data-opt data-q="' + esc(q) + '">' + esc(q) + '</button>'; }

    function renderEmpty() {
      return '<div class="sb-sec"><p class="sb-label">Recherches fréquentes</p><div class="sb-chips">' + POPULAR.map(chip).join('') + '</div></div>';
    }
    function renderResults(q, r) {
      var groups = {}, order = [];
      r.items.forEach(function (x) { var t = x.item.t; if (!groups[t]) { groups[t] = []; order.push(t); } groups[t].push(x.item); });
      var n = r.items.length;
      var h = '<div class="sb-head">' + n + ' résultat' + (n > 1 ? 's' : '') + '</div>';
      if (r.partial) h += '<p class="sb-note">Résultats les plus proches.</p>';
      order.forEach(function (t) {
        var list = groups[t], show = expanded[t] ? list : list.slice(0, limit);
        h += '<div class="sb-group" role="group" aria-label="' + esc(TYPES[t].label) + '"><p class="sb-label">' + esc(TYPES[t].label) + '</p><ul>';
        show.forEach(function (it) {
          var demo = it.url === '#';
          h += '<li><a class="sb-item" data-opt role="option" href="' + esc(demo ? '#' : it.url) + '"' + (demo ? ' data-demo' : '') + '>';
          h += '<span class="sb-txt"><span class="sb-title">' + highlight(it.title, r.terms) + '</span>';
          h += '<span class="sb-desc">' + highlight(snippet(it.desc || '', r.terms), r.terms) + '</span></span>';
          h += '<span class="sb-meta">' + esc(it.meta || '') + '</span></a></li>';
        });
        h += '</ul>';
        if (list.length > show.length) h += '<button type="button" class="sb-more" data-opt data-more="' + t + '">Voir ' + (list.length - show.length) + ' de plus</button>';
        h += '</div>';
      });
      return h;
    }
    function renderNone(q, r) {
      var h = '<div class="sb-none"><p class="sb-none-title">Aucun résultat pour « ' + esc(q.trim()) + ' »</p>';
      if (r.suggestion) h += '<p class="sb-dym">Vouliez-vous dire <button type="button" class="sb-dym-btn" data-opt data-q="' + esc(r.suggestion) + '">' + esc(r.suggestion) + '</button> ?</p>';
      h += '<p class="sb-help">Essayez un mot plus général, ou appelez-nous au <a data-opt href="tel:4184992423">418-499-2423</a>.</p></div>';
      return h;
    }

    function render() {
      var q = input.value;
      active = -1; input.removeAttribute('aria-activedescendant');
      if (!q.trim()) { panel.innerHTML = renderEmpty(); live.textContent = ''; lastRes = null; }
      else {
        var r = search(q); lastRes = r;
        panel.innerHTML = r.items.length ? renderResults(q, r) : renderNone(q, r);
        live.textContent = r.items.length ? r.items.length + ' résultats disponibles.' : 'Aucun résultat.';
      }
      var o = opts(); for (var i = 0; i < o.length; i++) o[i].id = id + '-o' + i;
      open();
    }
    function setActive(i) {
      var o = opts(); if (!o.length) return;
      if (active >= 0 && o[active]) { o[active].classList.remove('is-active'); o[active].removeAttribute('aria-selected'); }
      active = (i + o.length) % o.length;
      o[active].classList.add('is-active'); o[active].setAttribute('aria-selected', 'true');
      input.setAttribute('aria-activedescendant', o[active].id);
      o[active].scrollIntoView({ block: 'nearest' });
    }
    function choose(el) {
      if (!el) return;
      if (el.hasAttribute('data-q')) { input.value = el.getAttribute('data-q'); render(); input.focus(); return; }
      if (el.hasAttribute('data-more')) { expanded[el.getAttribute('data-more')] = true; var a = active; render(); setActive(Math.max(a, 0)); return; }
      if (input.value.trim()) { saveRecent(input.value); logQuery(input.value, 1); }
      if (el.hasAttribute('data-demo')) { BC.toast('Page hors maquette — dans le site final, ce lien ouvrirait la page correspondante.'); close(); return; }
      var href = el.getAttribute('href');
      close();
      if (href && href.charAt(0) === '#' || (href && samePage(href))) { input.blur(); }
      window.location.href = href;
      if (samePage(href)) flashHash();
    }

    input.addEventListener('input', function () {
      expanded = {}; render();
      clearTimeout(logTimer);
      logTimer = setTimeout(function () { if (lastRes && !lastRes.items.length) logQuery(input.value, 0); }, 1200);
    });
    input.addEventListener('focus', function () {
      render();
      // Sur mobile, remonter la barre pour laisser la place aux résultats
      if (window.innerWidth < 700 && !form.closest('.site-header, .a-top')) {
        var hdr = document.querySelector('.site-header'), off = hdr ? hdr.getBoundingClientRect().height + 12 : 12;
        var top = form.getBoundingClientRect().top;
        if (top > off + 40 || top < off) window.scrollBy({ top: top - off, behavior: 'smooth' });
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (panel.hidden) render(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        var o = opts();
        if (active >= 0) choose(o[active]);
        else if (lastRes && lastRes.items.length) choose(panel.querySelector('.sb-item'));
      } else if (e.key === 'Escape') {
        if (!panel.hidden) { e.preventDefault(); close(); } else if (input.value) { input.value = ''; } else { input.blur(); }
      } else if (e.key === 'Tab') { close(); }
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    panel.addEventListener('mousedown', function (e) { e.preventDefault(); });
    panel.addEventListener('click', function (e) {
      var el = e.target.closest('[data-opt]'); if (!el) return;
      e.preventDefault(); choose(el);
    });
    var clear = form.querySelector('[data-clear]');
    if (clear) clear.addEventListener('click', function () { input.value = ''; input.focus(); render(); });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) close(); });
    form._bcApi = { input: input, render: render, close: close };
  }
  function samePage(href) {
    if (!href) return false;
    var file = location.pathname.split('/').pop() || 'accueil.html';
    return href.charAt(0) === '#' || href.split('#')[0] === file;
  }

  /* ---------- Raccourci clavier « / » ---------- */
  function focusSearch(q) {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var visible = forms.filter(function (f) {
      if (!f.offsetParent) return false;
      var r = f.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight;
    });
    var target = visible.filter(function (f) { return f.hasAttribute('data-primary'); })[0] || visible[0] || forms[0];
    if (!target) return;
    var inp = target.querySelector('input');
    if (!visible.length) target.scrollIntoView({ block: 'center' });
    if (typeof q === 'string') inp.value = q;
    inp.focus();
    if (target._bcApi) target._bcApi.render();
  }
  document.addEventListener('keydown', function (e) {
    var t = e.target, tag = (t.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return;
    if ((e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault(); focusSearch();
    }
  });

  /* ---------- Mise en évidence de la cible d'une ancre ---------- */
  function flashHash(scroll) {
    setTimeout(function () {
      var h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
      var el = document.getElementById(h); if (!el) return;
      if (scroll === true) el.scrollIntoView({ block: 'start' });
      el.classList.remove('is-target'); void el.offsetWidth; el.classList.add('is-target');
      setTimeout(function () { el.classList.remove('is-target'); }, 2600);
    }, 60);
  }
  window.addEventListener('hashchange', function () { flashHash(); });

  /* ---------- Toast ---------- */
  var toastEl, toastTimer;
  function toast(msg, kind) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.className = 'toast is-on' + (kind ? ' toast-' + kind : '');
    toastEl.innerHTML = msg;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, 4200);
  }

  /* ---------- Bandeau d'alerte (modifiable depuis l'admin) ---------- */
  function applyAlert() {
    var bar = document.querySelector('[data-alert]'); if (!bar) return;
    var a = store.get('bc-alerte', null);
    if (a) {
      bar.hidden = !a.active;
      bar.className = 'alert-bar alert-' + (a.level || 'info');
      var lbl = bar.querySelector('[data-alert-label]'), txt = bar.querySelector('[data-alert-text]');
      if (lbl) lbl.textContent = a.label || 'Avis';
      if (txt) txt.textContent = a.text;
    }
    var x = bar.querySelector('[data-alert-close]');
    if (x) x.addEventListener('click', function () { bar.hidden = true; });
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var btn = document.querySelector('[data-menu-toggle]'), nav = document.querySelector('[data-nav-panel]');
    if (!btn || !nav) return;
    btn.addEventListener('click', function () {
      var o = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    });
  }

  /* ---------- Liens de démonstration ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href="#"]');
    if (a && !a.closest('.sb-panel') && !a.hasAttribute('data-no-toast')) {
      e.preventDefault();
      toast('Lien de démonstration — cette page ne fait pas partie de la maquette.');
    }
    var f = e.target.closest && e.target.closest('[data-search-fill]');
    if (f) { e.preventDefault(); focusSearch(f.getAttribute('data-search-fill')); }
  });

  /* ---------- API publique ---------- */
  var BC = window.BC = {
    TODAY: TODAY, MOIS: MOIS, MOIS_C: MOIS_C, JOURS: JOURS, CATS: CATS, DATA: DATA, TYPES: TYPES,
    parseD: parseD, fmtLong: fmtLong, fmtShort: fmtShort, daysFrom: daysFrom, esc: esc, icon: icon, store: store,
    search: search, highlight: highlight, toast: toast, flashHash: flashHash, focusSearch: focusSearch,
    index: function () { return INDEX; },
    /* Ajoute un contenu à l'index (et le conserve pour les autres pages de la maquette) */
    add: function (item) {
      item.added = Date.now();
      var list = store.get('bc-ajouts', []); list.push(item); store.set('bc-ajouts', list);
      if (item.t === 'evenement') { DATA.events.push(item); INDEX.push(eventItem(item)); }
      else INDEX.push(prep(item));
      buildVocab();
      return item;
    },
    resetAjouts: function () { store.set('bc-ajouts', []); },
    addSynonym: function (de, vers) { userSyn.push({ de: de, vers: vers }); store.set('bc-synonymes', userSyn); },
    synonyms: function () { return { base: BASE_SYN, user: userSyn }; },
    mount: mount
  };

  buildIndex();

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-search]'), mount);
    applyAlert(); initMenu(); flashHash(true);
    var k = document.querySelectorAll('[data-kbd-hint]');
    Array.prototype.forEach.call(k, function (el) { el.title = 'Raccourci : appuyez sur / pour rechercher'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
