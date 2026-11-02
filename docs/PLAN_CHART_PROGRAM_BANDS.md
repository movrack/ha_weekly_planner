# Bandes du programme pour les réglages non numériques (demande du propriétaire, 2026-11-02)

Constat : dans le graphique du jour d'un thermostat dont les réglages Comfort/Eco sont des préréglages
(`climate.set_preset_mode`, aucune température dans l'action), la ligne en escalier « Programme » n'existe pas :
`frontend/src/planned.ts` écarte les paliers dont la valeur n'est pas numérique. Il ne reste que les points de début
(point plein) et de fin (anneau creux) avec leur ligne pointillée.

Décision : afficher ces paliers comme des **bandes colorées nommées** (le nom du réglage, ex. « Comfort », « Eco »),
sans changer le programme de l'utilisateur. Mise en œuvre confiée à Codex ; vérifications par le coordinateur.

## Comportement attendu
- [x] Pour chaque zone du programme (`planned.zones`, y compris le « reste du temps » quand il agit sur l'appareil)
      dont la valeur n'est pas numérique, dessiner une bande horizontale dans la couleur du réglage, avec son nom
      lisible (tronqué proprement si la bande est étroite), alignée sur l'axe du temps du graphique (zoom, déplacement et
      jours multiples inclus). Les zones numériques gardent la ligne en escalier actuelle, sans bande.
- [x] Emplacement lisible à 360 px : une rangée « Programme » distincte sous la zone des courbes (même logique et même
      style que les bandes d'états des sources complémentaires), sans cacher les courbes ni le curseur « maintenant ».
- [x] La légende « Programme » décrit ce qui est affiché (ligne pour les valeurs chiffrées, bande pour les réglages
      sans chiffre) ; pas de doublon avec les points de début/fin existants, qui restent.
- [x] Générique : aucune liste de types d'appareils, d'actions ou de services en dur ; le nom et la couleur viennent du
      réglage. Thèmes clair et sombre ; contrastes lisibles.
- [x] Tests vitest : zone non numérique → bande avec le bon nom/couleur/position ; zone numérique → pas de bande ;
      mélange des deux ; zoom/fenêtre ; zone de bord (commencée la veille, finie le lendemain) ; programme vide.

## Livrables
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus).
- [x] Guide français (description de la rangée « Programme »), CHANGELOG [Unreleased], décision datée dans
      `docs/DECISIONS.md`.
- [x] Rapport dans `PROJECT_MEMORY.md` (télégraphique). Codex n'enregistre rien dans Git, ne pousse pas, ne déploie pas.

## Vérification finale (2026-11-02)

TypeScript, 682 tests Vitest et couverture validés (84,40 % instructions, 76,84 % branches,
80,83 % fonctions, 86,73 % lignes). Build : `npm run build -- --outDir dist`, afin de préserver
`custom_components/` comme demandé. Contrôle visuel Chrome sur données simulées, cadres
360 × 780 px clair/sombre : noms lisibles, courbes et maintenant dégagés ; zoom clavier
04:00–20:00 puis déplacement 08:00–24:00 depuis la rangée Programme.
Home Assistant complet et téléphone tactile physique non vérifiés ; wiki non publié.
Aucun pytest, commit, push, déploiement ni accès actif à la production.
