# Corrections du graphique du jour (demande du propriétaire, 2026-11-02, issue #40)

Contexte : fenêtre des horaires d'un thermostat avec deux sources complémentaires (« Fenêtre bureau » en %, capteur
on/off tracé à 100/0, et « Bureau » en %). Fichiers concernés : `frontend/src/components/chart.ts`,
`chart-sources.ts`, `chart-options.ts`, `i18n.ts`, tests, `docs/GUIDE.fr.md`, `CHANGELOG.md`.
Mise en œuvre confiée à Codex (gpt-6.1-sol) ; relecture et vérifications par le coordinateur. Pas de commit, de push
ni de déploiement par Codex.

## 1. Une seule légende
- [x] Rassembler toutes les légendes (sources complémentaires, « Programme », « Valeur mesurée », « Demandé à l'appareil »)
      en un seul bloc placé **sous** la barre précédent/suivant (date), au lieu de deux endroits.
- [x] Ordre stable : courbes de l'appareil d'abord, puis sources complémentaires. Tests de placement et d'ordre.

## 2. Échelle des pourcentages fixe
- [x] Toute échelle d'unité « % » va de 0 à 100 (plus de mise à l'échelle automatique, ex. 70–100), graduations
      lisibles à 360 px. Les autres unités gardent leurs bornes automatiques. Tests des bornes.

## 3. Description des états on/off
- [x] Une source binaire tracée en courbe porte dans la légende la correspondance réelle : « on = 100, off = 0 »
      (traductions fr/en ; seulement pour les sources concernées ; aucune liste de types d'appareils en dur).
      Vérifier dans `chart-sources.ts` quand un état est tracé en courbe ou en bande.

## 4. Marqueurs de début et de fin du programme demandé
- [x] Expliquer ce que montrent aujourd'hui le point plein (début d'un palier) et l'anneau creux (fin / retour au
      « reste du temps ») avec leur ligne pointillée ; lundi : Comfort 08:45–17:00 après un défaut Eco.
- [x] Vérifier si le début du palier en cours à gauche du graphique (commencé la veille ou à 00:00) manque : si oui,
      l'afficher (point + ligne au bord gauche ou à son heure réelle) ; sinon garder la règle et la documenter en
      trois lignes dans le guide. Tests de la règle.

## Livrables et contrôles
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus).
- [x] Guide français et CHANGELOG [Unreleased] à jour ; décision datée dans `docs/DECISIONS.md` si une règle change.
- [x] Rapport final dans `PROJECT_MEMORY.md` (style télégraphique) : ce qui est fait, l'explication du point 4, ce qui reste.

## Résultat de validation (2026-11-02)
- TypeScript : ok ; Vitest : 664 tests, 64 fichiers, ok.
- Couverture : instructions 84,06 %, branches 76,20 %, fonctions 80,32 %, lignes 86,44 % ; seuils conservés.
- Build : `npm run build -- --outDir dist`, ok. Destination limitée à `frontend/dist` pour respecter le périmètre autorisé ; bundle distribué hors frontend inchangé.
- Point 4 : début initial absent confirmé ; points pleins ajoutés à minuit pour le défaut et les créneaux commencés la veille. Lundi testé : Eco 00:00 plein, Comfort 08:45 plein, Eco 17:00 creux. Ligne pointillée = repère horaire. En zoom, repères à leur heure réelle si visible.
- `chart-options.ts` : vérifié, classification générique conservée ; on/off sans métadonnées numériques reste en bande.
- Rendu navigateur 360 px / thèmes : non vérifié dans cette session. Aucun commit, push, déploiement, changement de production ni test Python.
