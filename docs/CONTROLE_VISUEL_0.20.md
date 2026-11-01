# Contrôle visuel 0.20.1 — 2026-10-31

Instance de dev (port 8124), bundle 0.20.1, Chromium/Playwright. Seul ce qui a été vu est coché.
Captures : `/private/tmp/claude-501/-Users-manuelservais-Dev-weekly-planner/b6633a2d-e4f3-439f-9853-46b4e65eee3e/scratchpad/` (`v-*.png`).

## 1. Fenêtre des horaires
- [x] 1440 px : deux colonnes (448 + 448), fenêtre 960 px ; gauche = interrupteur, mode, reste du temps, liste, Ajouter, Supprimer ; droite = semaine puis graphique.
- [x] 820 px : deux colonnes (362 + 362), pas de défilement horizontal, pas de chevauchement.
- [x] 360 px : une colonne, ordre interrupteur, mode, reste du temps, liste, Ajouter, semaine, graphique, Supprimer ; pas de défilement horizontal.
- [x] Thèmes clair et sombre (360, 820, 1440).
- [x] Ordre de Tab = ordre du DOM.
- [x] Fermeture par Échap et par la croix ; le focus revient sur le bouton Horaires (quand il l'avait avant l'ouverture).
- [ ] Chemin « autre mode » : non testé (un seul mode dans l'instance).
- [ ] Éditeur d'horaire ouvert : à 1440 px le graphique et Supprimer disparaissent, la colonne de droite reste vide sous la semaine, et la semaine est en partie défilée hors de vue (voir bogue 1).
- Échap avec l'éditeur d'horaire ouvert ferme toute la fenêtre.

## 2. Légende du graphique
- [x] « Prévu » : point à gauche puis trait. « Mesuré », « Réglé », « Actif » inchangés (fr et en).

## 3. Panneau sous une barre (mode édition)
- [x] Rien, ciseaux, Copier vers… au-dessus des réglages ; carte du réglage sans crayon, sans « + », sans formulaire (360 et 1440).
- [x] La fenêtre des horaires garde crayon et « + ».
- [x] Couper : la partie gauche garde Allumer (1040–1215), la droite devient vide (reste du temps) ; Annuler restaure 1040–1380.

## 4. Mot « étiquette / label »
- [x] Aucune occurrence visible (fr et en) : carte, bouton d'en-tête « Réglages / Settings », boîte « Réglages », fenêtre des horaires (liste dépliée, éditeur), panneau de barre.
- [ ] Éditeur de carte HA : non parcouru (seule la source i18n a été vérifiée par grep).

## 5. Console
- [x] Aucune erreur (hors 404 de sourcemaps Lit).

## Bogues
1. Éditeur d'horaire ouvert (>= 768 px) : vide à droite sous la semaine, semaine coupée en haut (défilement 128 px dans `.content`). Suspect : `frontend/src/editors/schedule` (grille `.cols`, zones `.area-chart` et `.area-delete` masquées).
