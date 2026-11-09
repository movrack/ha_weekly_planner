# Heures de début et de fin du réglage sélectionné (demande du propriétaire, 2026-11-03)

Demande : quand un réglage est sélectionné dans le schéma des horaires (barres) ou dans les vues circulaires (poignées
visibles), afficher ses **heures de début et de fin**, soit dedans, soit par une infobulle. Aujourd'hui seule la poignée
blanche apparaît (capture : « Comfort » sélectionné sur la carte du tableau de bord, aucune heure lisible).

## Comportement attendu
- [x] Barres (`frontend/src/components/bar-editor.ts`, carte tableau de bord et fenêtre des horaires) : tant qu'un réglage est
      sélectionné, afficher « début – fin » (ex. « 8 h 45 – 17 h »), dans le format d'heure de l'utilisateur déjà utilisé
      ailleurs, dans une pastille lisible placée contre le réglage (au-dessus de la barre, centrée sur le segment, sans
      masquer le curseur « maintenant » ni les graduations) ; si le segment est étroit, la pastille reste lisible
      (déborde du segment sans sortir de la carte, jamais tronquée).
- [x] Pendant un glissé de poignée ou un déplacement du réglage, la pastille se met à jour en direct (pas de 15 minutes).
- [x] Heures solaires : afficher l'heure réellement calculée (aperçu du serveur) avec une courte précision, ex.
      « 17 h 17 (coucher du soleil) » ; réglage sans fin : « dès 8 h 45 » ; réglage qui passe minuit : « 22 h – 6 h (lendemain) ».
- [x] Vues circulaires (`frontend/src/components/radial-day.ts`, issue #35) : la même information pour le réglage
      sélectionné, au centre du cercle ou contre l'arc, lisible à 360 px, sans chevaucher les heures du cadran.
- [x] Infobulle (`title`) et `aria-label` avec le même texte pour souris et lecteurs d'écran ; sur écran tactile, la
      pastille reste affichée tant que le réglage est sélectionné (pas besoin de survol).
- [x] Générique : aucune liste de types d'appareils ; texte court en français et en anglais ; thèmes clair et sombre ;
      contraste suffisant ; aucune régression des gestes existants (poignées 44 px, déplacement, sélection, zoom).

## Tests et livrables
- [x] Tests vitest : texte du libellé pour une heure fixe, solaire, sans fin, passant minuit ; mise à jour pendant un glissé ;
      affichage uniquement quand un réglage est sélectionné ; vue circulaire ; segment étroit.
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build -- --outDir dist` (seuils 80/60/60 tenus).
- [x] Preuve de rendu : formulaire/page de test dans Chrome à 360 px et en bureau, clair et sombre, avec capture ou
      mesures (règle « vérification avant déploiement » d'AGENTS.md).
- [x] Guide français, CHANGELOG [Unreleased], décision datée dans `docs/DECISIONS.md`.
- [x] Rapport dans `PROJECT_MEMORY.md` (télégraphique). Codex n'enregistre rien dans Git, ne pousse pas, ne déploie pas.

## Vérification du rendu — 2026-11-03

Page locale synthétique `/tmp/wp-selected-preview.html`, composants réels du build `frontend/dist`, ouverte dans Chrome natif. Captures conservées dans le rapport de session : cadres CSS 360 px et 1400 px, clair et sombre, barres et deux cadrans. Le cadre bureau est affiché à 85 % pour tenir dans la fenêtre native ; sa largeur de mise en page reste 1400 px.

- À 360 px, contenu de 336 px : pastille fixe x=136,84–240,13 px ; segment étroit à 23 h 50–23 h 55, pastille x=216,39–346,92 px, bord du contenu x=348 px. Texte complet, indépendant de la largeur du segment.
- Solaire : « 17 h 17 (Coucher du soleil) – 20 h », lisible au-dessus de la barre et au centre du cadran simple ; trait maintenant et graduations dégagés.
- Double cadran : deux frontières solaires et lendemain lisibles sous le cercle, aucun chiffre masqué. Même placement pour un texte long du cadran simple. Correction décidée après observation du premier rendu.
- Bureau : barres sur 1376 px de contenu ; pastilles contenues, thèmes lisibles. Les cadrans restent limités à 360 px.
- `tsc` réussi ; 713 tests / 69 fichiers ; couverture instructions 84,85 %, branches 77,95 %, fonctions 81,22 %, lignes 87,24 % ; build `--outDir dist` réussi.
- Gestes : handlers de glissé de frontière et déplacement testés dans Vitest ; tactile physique et instance HA complète non vérifiés. Aucun pytest, commit, push ou déploiement.

## 4. Infobulles au survol (demande complémentaire du propriétaire, 2026-11-03)
- [x] Au **survol (hover)** d'un réglage dans la barre (et pour l'arc d'un réglage dans les vues circulaires) : infobulle
      avec son nom et ses heures « début – fin » (même texte et mêmes règles que la pastille : solaire calculé, sans fin,
      passant minuit), qu'un réglage soit sélectionné ou non. Aussi au focus clavier ; sur écran tactile la pastille du
      réglage sélectionné reste le moyen d'affichage.
- [x] Au **survol (hover)** de la ligne « maintenant » (curseur horloge) : infobulle avec **l'heure actuelle** (ex. « Maintenant :
      14 h 52 »), mise à jour à chaque minute, y compris quand l'infobulle est ouverte ; même chose pour le marqueur
      « maintenant » des vues circulaires. La ligne reste facile à survoler (zone de survol plus large que le trait, sans
      gêner les poignées ni les gestes).
- [x] Mêmes contraintes : texte court fr/en, thèmes clair/sombre, `aria-label`/`title` équivalents, pas de régression des
      gestes. Tests vitest (texte, mise à jour de l'heure, survol réglage, survol maintenant) et preuve de rendu Chrome.


### Preuve section 4 — 2026-11-03

Page synthétique `/tmp/wp-hover-preview.html`, générée par `/tmp/wp-hover-harness.py` depuis le build final `frontend/dist`, ouverte dans Chrome natif. Événements `PointerEvent` souris simulés sur les surfaces réelles et focus sur les cibles clavier ; captures conservées dans le rapport de session. Cadres CSS de 360 et 1400 px, clair et sombre ; bureau affiché à 80 %, cadrans limités à 360 px.

- Barre 360 px claire, sélectionnée ou non : « Comfort · 8 h 45 – 17 h », x=103,16–256,84 px, contenu jusqu’à 348 px ; texte complet et title/aria identiques.
- Barre sombre 360 px : survol à 6 px du trait ; infobulle ouverte de « Maintenant : 14 h 52 » à « Maintenant : 14 h 53 » après changement de minute. Zone observée de 16 px, aucun élément intercepte les pressions.
- Bureau clair : même passage de minute, x=504,58–615,41 px, contenu jusqu’à 1110,41 px après zoom CSS. Bureau sombre : focus réglage, texte identique et contour visible.
- Cercle simple clair mobile : survol maintenant et passage de minute. Cercle solaire clair bureau : nom, heure résolue et lendemain complets. Double cercle sombre mobile : texte solaire sur deux lignes x=12–348 px, sans troncature ; double cercle sombre bureau : focus maintenant et passage de minute.
- Contrôles finaux : TypeScript réussi ; 722 tests / 70 fichiers ; couverture instructions 84,93 %, branches 78,12 %, fonctions 81,24 %, lignes 87,35 % ; build `--outDir dist` réussi. Aucun pytest.
- Tests de gestes et de focus simulés ; instance HA complète et tactile physique non vérifiés. Fichiers de l’issue #39 et bundle distribué inchangés depuis le début de cette session ; aucun commit, push ou déploiement.
