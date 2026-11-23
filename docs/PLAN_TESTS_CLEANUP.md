# Plan : nettoyage des tests

Statut : **approuvé** (2026-11-18), à faire **après #60**.
Origine : le propriétaire trouve qu'il y a trop de tests ; garder tous les tests utiles, les simplifier ou les
fusionner. Données : `reports/ai/tests-analyse-2026-11-18.md` (local). Règles : `AGENTS.md`, « Writing tests » et
« Killing mutants ».

## But
- Un fichier de test par module (ou par comportement d'un gros module), aucun fichier nommé d'après un outil.
- Zéro test qui ne peut pas échouer, zéro doublon de comportement, cas multiples en tableaux.
- **Même protection** : planchers par fichier 90/80/80/80 (carte) et 85 % (Python) tenus, score de mutation de
  chaque module non inférieur.

## Point de départ
- Carte : 132 fichiers, 1 676 tests, 21 129 lignes (14 393 lignes de code). Dont `*-mutants-*` 36 fichiers,
  `*-codex-*` 17, `coverage-floors-*` 4.
- Python : 57 fichiers, 881 cas, 12 793 lignes (6 564 lignes de code). Dont `test_mutation_*` 9 fichiers.
- 26 fichiers de la carte n'apportent aucune couverture seuls ; 39 sont indispensables aux planchers.

## Méthode, pour chaque module
1. **Mesure avant** : couverture par fichier (`npm run coverage` / `pytest --cov`) et mutation du module (Stryker
   `--mutate <fichier>` / mutmut sur le module). Noter les chiffres dans la PR.
2. **Regrouper** tous les tests du module dans son fichier (ou 2-3 fichiers par comportement), un seul jeu de
   helpers.
3. **Dédoublonner** : un test par comportement ; cas multiples en `it.each` / `parametrize` ; renommer chaque test
   d'après le comportement.
4. **Corriger** les tests qui ne peuvent pas échouer, remplacer les accès `_x` évitables par la surface publique.
5. **Mesure après** : mêmes commandes. Couverture ou score plus bas → le test retiré revient (ou l'assertion est
   renforcée).
6. **Une PR par module**, type `test:`, aucun changement de code de production (sinon PR séparée `refactor:`).

## Étapes
### Étape 0 : préparation
- [ ] Ouvrir l'issue de suivi (règle du projet : un plan approuvé a une issue).
- [ ] Script local de mesure avant/après (couverture par fichier + liste des tests), hors dépôt ou sous `scripts/`
      si le propriétaire le veut public.
- [ ] Corriger les deux inutiles prouvés : bloc mort `card-list-mutants.test.ts:221-225`, attendu dérivé de la
      sortie `:228`.

### Étape 1 : pilote bar-editor (validation du propriétaire avant la suite)
- [ ] `bar-editor-mutants-codex-1..11`, `bar-editor-flow-mutants`, `bar-editor-view-mutants` et les tests
      bar-editor existants → `bar-editor.test.ts` (+ découpe par comportement si > ~600 lignes).
- [ ] Helpers `editor()`, `slot()` dans `helpers/`.
- [ ] Mesures avant/après, nombre de tests et de lignes avant/après dans la PR.

### Étape 2 : modules de la carte, du plus gros gain au plus petit
- [ ] compare (`compare-mutants`, `compare-view`, `compare-mode-row`).
- [ ] edits (`edits`, `dayedits`, `edits-mutants`).
- [ ] card-editor (`card-editor-mutants`, `-codex-1..4`).
- [ ] label-picker (`-mutants`, `-mutants-3`, `-codex-1/2`; le formulaire de réglage fait partie du cadre Réglages, #75).
- [ ] card (`card-guards/main/lifecycle/list-mutants` et tests de la carte), par thème.
- [ ] `mutants-0-28`, `mutation-survivors` → répartis dans hold-hint, time, actions, times-list, list-order,
      slots, chart-zoom.
- [ ] `coverage-floors-*` → chart, chart-history, holiday, confirm, select-value.
- [ ] Fichiers mono-module restants (`bar-zone-mutants`, `chart-options-mutants`, `planner-config-mutants`,
      `actions-mutants`, `filter-editor-mutants`, `preview-cache-mutants`, `schedule-dialog-mutants-1`) :
      fusion dans le fichier du module ou renommage.
- [ ] Fichiers datés ou vagues (`polish-0211`, `qa-regressions`, `logic`, `ui-visual-pass`) : chaque test va dans
      le fichier de son module.

### Étape 3 : Python
- [ ] `test_mutation_survivors` (76 micro-tests) → `test_resolver*`, `test_engine*`, en tableaux.
- [ ] `test_mutation_{config_flow,engine_holiday,modes,resolver,resync,validation,yaml,yaml_sync}` → le fichier
      du module.
- [ ] `legacy_engine.py` + `test_latency_equivalence.py` : supprimer s'ils sont inutiles (aucune couverture ni
      mutant tué en propre, comparaison avec un moteur qui n'existe plus) ; sinon garder et dire pourquoi.

### Étape 4 : fragiles
- [ ] Tests de performance (carte et Python) : hors de la suite par défaut (décidé), commande dédiée, toujours
      lancés avant une version et dans la CI de version.
- [ ] Horloge réelle : vérifier les 11 fichiers signalés, passer en faux minuteurs.
- [ ] CSS exact : ne garder que les contrats (cibles 44/48 px, jetons de contraste).

### Étape 5 : garde-fous dans le temps
- [ ] Faire lire « Writing tests » et « Killing mutants » à l'agent `stryker` (dépôt partagé `movrack/AI`) : un
      mutant se tue en renforçant le test existant du module.
- [ ] Rapport final : avant/après (fichiers, tests, lignes, couverture, score de mutation).

## Risques
- Un doublon retiré tuait seul un mutant → mesure de mutation par module obligatoire (lente : sur demande).
- Deux fichiers sans apport individuel peuvent se couvrir l'un l'autre → jamais deux retraits sur une même mesure.
- Grosses PR difficiles à relire → une PR par module, diff de tests seulement.
- Conflits avec le travail en cours (#59, #60) → commencer par des modules que ces issues ne touchent pas
  (bar-editor, compare, edits) ; program-editor et programs-panel en dernier.

## Décisions du propriétaire (2026-11-18)
- Plan validé ; à faire après #60.
- Tests de performance hors de la suite par défaut : oui.
- Contrôle des noms de fichiers en CI : non (on ne teste pas les tests) ; les règles d'`AGENTS.md` suffisent.
- `legacy_engine.py` : supprimé s'il est inutile (étape 3).
- `legacy_engine.py` + `test_latency_equivalence.py` (≈ 1 200 lignes pour 5 lignes couvertes en propre) : remplacés
  par des tests ciblés sur ces lignes, puis supprimés. Règle générale ajoutée à `AGENTS.md` (« Targeted tests,
  proportionate size »).
