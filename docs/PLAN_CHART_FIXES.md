# Corrections du graphique du jour (demande du propriétaire, 2026-11-02, issue #40)

Contexte : fenêtre des horaires d'un thermostat avec deux sources complémentaires (« Fenêtre bureau » en %, capteur
on/off tracé à 100/0, et « Bureau » en %). Fichiers concernés : `frontend/src/components/chart.ts`,
`chart-sources.ts`, `chart-options.ts`, `i18n.ts`, tests, `docs/GUIDE.fr.md`, `CHANGELOG.md`.
Mise en œuvre confiée à Codex (gpt-6.1-sol) ; relecture et vérifications par le coordinateur. Pas de commit, de push
ni de déploiement par Codex.

## 1. Une seule légende
- [ ] Rassembler toutes les légendes (sources complémentaires, « Programme », « Valeur mesurée », « Demandé à l'appareil »)
      en un seul bloc placé **sous** la barre précédent/suivant (date), au lieu de deux endroits.
- [ ] Ordre stable : courbes de l'appareil d'abord, puis sources complémentaires. Tests de placement et d'ordre.

## 2. Échelle des pourcentages fixe
- [ ] Toute échelle d'unité « % » va de 0 à 100 (plus de mise à l'échelle automatique, ex. 70–100), graduations
      lisibles à 360 px. Les autres unités gardent leurs bornes automatiques. Tests des bornes.

## 3. Description des états on/off
- [ ] Une source binaire tracée en courbe porte dans la légende la correspondance réelle : « on = 100, off = 0 »
      (traductions fr/en ; seulement pour les sources concernées ; aucune liste de types d'appareils en dur).
      Vérifier dans `chart-sources.ts` quand un état est tracé en courbe ou en bande.

## 4. Marqueurs de début et de fin du programme demandé
- [ ] Expliquer ce que montrent aujourd'hui le point plein (début d'un palier) et l'anneau creux (fin / retour au
      « reste du temps ») avec leur ligne pointillée ; lundi : Comfort 08:45–17:00 après un défaut Eco.
- [ ] Vérifier si le début du palier en cours à gauche du graphique (commencé la veille ou à 00:00) manque : si oui,
      l'afficher (point + ligne au bord gauche ou à son heure réelle) ; sinon garder la règle et la documenter en
      trois lignes dans le guide. Tests de la règle.

## Livrables et contrôles
- [ ] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus).
- [ ] Guide français et CHANGELOG [Unreleased] à jour ; décision datée dans `docs/DECISIONS.md` si une règle change.
- [ ] Rapport final dans `PROJECT_MEMORY.md` (style télégraphique) : ce qui est fait, l'explication du point 4, ce qui reste.
