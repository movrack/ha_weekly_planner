# Limites des heures solaires en option (issue #39, demande du propriétaire 2026-11-01)

Dans le formulaire d'horaire (`frontend/src/components/slot-form.ts`), pour un début ou une fin solaire (lever, coucher,
aube, crépuscule), les champs **« Au plus tôt à » / « Au plus tard à »** sont toujours affichés. Ils doivent devenir une
**option à cocher**, comme « Délai aléatoire » : les champs n'apparaissent que si la case est cochée.

Un brouillon testé existe dans la branche locale `feat/sun-limit-option` (commit db9b242, écrit avant les évolutions
récentes de `slot-form.ts`/`i18n.ts`) : le lire avec `git show feat/sun-limit-option` comme référence, sans fusionner la
branche ; réimplémenter proprement sur le code actuel de `develop`.

## Comportement attendu
- [x] Une case « Limiter l'heure (au plus tôt / au plus tard) » (en : « Limit the time (not earlier / not later) »),
      pour chaque borne solaire (début et fin), placée avant l'option « Délai aléatoire ».
- [x] Décochée par défaut pour un nouvel horaire ; cochée automatiquement si l'horaire a déjà `earliest` ou `latest`.
- [x] Cocher affiche les deux champs (aucun changement de données à ce stade) ; décocher efface `earliest` et `latest`.
- [x] L'aide existante, l'aperçu « Aujourd'hui » et l'erreur « au plus tôt doit précéder au plus tard » sont conservés.
- [x] Horaires à heure fixe : aucun changement (les limites ne concernent que le solaire).
- [x] Textes courts, compréhensibles par une personne âgée ; fr/en ; mode clair et sombre ; lisible à 360 px.

## Tests et livrables
- [x] Tests vitest dédiés : masqué par défaut ; affiché si des limites existent ; cocher révèle les champs ; décocher
      efface les deux limites ; indépendance début/fin ; pas d'effet sur une heure fixe.
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus).
- [x] Guide français (`docs/GUIDE.fr.md`) et CHANGELOG [Unreleased] ; cocher la ligne correspondante de `docs/quick_todo.md`.
- [x] Rapport dans `PROJECT_MEMORY.md` (télégraphique). Codex n'enregistre rien dans Git, ne pousse pas, ne déploie pas.

## Vérification
- TypeScript, 701 tests Vitest et couverture : réussis (84,45 % instructions, 77,11 % branches, 80,88 % fonctions, 86,78 % lignes).
- Build : `npm run build -- --outDir dist`, pour respecter l’exclusion de `custom_components/`.
- Chrome natif : formulaire simulé `/tmp/wp39-preview.html`, colonnes 360 px clair/sombre ; case décochée, limites existantes, ouverture et retrait contrôlés. Capture dans le rapport de session. HA complet et tactile physique non vérifiés.
