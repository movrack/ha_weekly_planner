# Alignement du graphique du jour sur le schéma des horaires (demande du propriétaire, 2026-11-02)

Constat (capture de la carte « Thermostat Bureau » sur le tableau de bord) : le graphique du jour n'est pas aligné sur
la barre du schéma du dessus. Sur la capture, 0 h de la barre (« Auj. ») est à x ≈ 68 et 24 h à x ≈ 1022, alors que le
tracé du graphique commence à x ≈ 62 et se termine à x ≈ 975 (l'échelle de droite en % occupe la marge). Les heures ne
tombent donc pas aux mêmes endroits. Même défaut dans la fenêtre des horaires (barres Lun–Dim au-dessus du graphique).

Décision : **0 h et 24 h du graphique doivent tomber exactement à la verticale de 0 h et 24 h de la barre du schéma**,
avec la même graduation horizontale, sur le tableau de bord et dans la fenêtre des horaires, mobile (360 px) et bureau.
Mise en œuvre confiée à Codex ; vérifications par le coordinateur.

## Comportement attendu
- [x] Mesurer dans le code la géométrie de la barre du schéma (colonne d'étiquette « Auj. »/jours, piste, marges) et celle
      du graphique (marges gauche/droite, échelles) ; faire coïncider le début et la fin de la piste avec les extrémités
      0 h et 24 h du tracé (axe du temps) pour la vue « aujourd'hui » non zoomée. Une seule source de vérité pour ces
      marges (variable CSS ou constante partagée), pas deux valeurs recopiées.
- [x] Les étiquettes d'axe (°C à gauche, % et autres unités à droite) restent lisibles sans décaler le tracé : les placer
      dans les marges existantes alignées sur la colonne d'étiquette à gauche, et à droite en les superposant au bord
      intérieur du tracé (ou dans une marge réservée aussi côté barre) — choisir la solution la plus lisible à 360 px.
- [x] La rangée des bandes du programme et celles des sources complémentaires suivent le même alignement.
- [x] Zoom / déplacement : l'alignement s'applique à l'état non zoomé ; zoomé, les graduations restent celles du graphique
      (pas de régression des gestes). Les jours de semaine de la fenêtre des horaires gardent leur alignement actuel.
- [x] Tests vitest : positions de 0 h et 24 h du graphique égales à celles de la barre (calcul pur de la géométrie) à
      360 px et en bureau ; thèmes clair/sombre sans régression.

## Livrables
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus).
- [x] Guide français si une description change, CHANGELOG [Unreleased], décision datée dans `docs/DECISIONS.md`.
- [x] Rapport dans `PROJECT_MEMORY.md` (télégraphique). Codex n'enregistre rien dans Git, ne pousse pas, ne déploie pas.

Note de validation : guide inchangé (aucune description fonctionnelle modifiée). Build dirigé vers `frontend/dist` avec `npm run build -- --outDir dist` pour respecter l’exclusion de `custom_components/`. Vérification visuelle navigateur clair/sombre réservée au coordinateur ; les tests vérifient la géométrie et les couleurs de thème.
