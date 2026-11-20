# Plan de refactorisation : robustesse et maintenabilité (brouillon, à valider par le propriétaire)

Statut : **brouillon pour plus tard** (2026-11-17). Pas encore approuvé pour implémentation, pas d'issue de suivi.
Origine : graphe de connaissances du code (graphify) puis revue adverse par `nemesis` (modèle Fable).
Une refactorisation ne change **aucun comportement** et n'apporte **aucun gain de vitesse** : elle sert la lisibilité
et la robustesse. Pour la vitesse, mesurer d'abord (étape 0).

## Constats (mesurés sur `develop`, HEAD 997c8f4)
| Fichier | Lignes | Remarque |
|---|---|---|
| `custom_components/weekly_planner/engine.py` | 1940 | `PlannerEngine`, 89 méthodes, 14 communautés du graphe, un seul objet d'état |
| `frontend/src/components/schedule-dialog.ts` | 1538 | 12 communautés, le plus couplé de la carte (37 liens avec la liste des programmes) |
| `frontend/src/components/bar-editor.ts` | 1294 | 8 communautés |
| `frontend/src/components/chart.ts` | 1206 | hors plan, déjà au-dessus de 1200 lignes |
| `frontend/src/weekly-planner-card.ts` | 1082 | |
| `frontend/src/i18n.ts` | 1030 | hub normal (`t()`), ne pas toucher |

- Aucun cycle d'imports (4 fichiers ou moins) dans les 77 fichiers sources : l'architecture est saine.
- `types.ts`, `i18n.ts`, `planner.ts` : liens nombreux mais normaux, **ne pas les toucher**.
- Le graphe rate beaucoup d'appels entre fichiers : les « fonctions sans appelant » (133) étaient des faux positifs
  (18 vérifiées par `grep`, toutes utilisées). **Aucune suppression de code mort sur cette base.**
- Le graphe ne voit pas les attributs partagés (`_lock`, `_held`, `store.runtime`, `_pass`) : il ne suffit pas à choisir
  les coupes du moteur.

## Principes
- Aucun changement de comportement ; refactorisation jamais mêlée à une fonctionnalité dans une même version.
- Une étape = une issue + une PR (règle du projet). Une seule à la fois pour les étapes 1 et 2 (elles touchent toutes
  deux `stryker.config.json` et des tests partagés) ; fusion l'une après l'autre, avec rebase.
- Déployer ne signifie pas commiter. Commits uniquement sur demande explicite du propriétaire, jamais du lundi au
  vendredi entre 8h et 17h (dépôt public).
- Deux agents au plus à la fois. Revue `nemesis` avant fusion pour tout ce qui touche le moteur.
- Retour arrière = rétrograder la version dans HACS (aucun schéma de stockage ne change).

## Étape −1 : point de départ propre
- [ ] L'arbre de travail contient plus de 55 fichiers modifiés et des tests `bar-editor-mutants-codex-*` non suivis :
  livrer ou commiter l'état courant (0.29.0 et suites) **sur demande du propriétaire** avant toute mesure de référence.

## Étape 0 : mesurer (lecture seule)
- [ ] `scripts/bench.py` (le banc d'essai du moteur ; il n'est pas dans `tests/`) : relever les médianes actuelles.
- [ ] Hash et taille du bundle `weekly-planner-card.js` après `npm run build`.
- [ ] Ne pas annoncer de « temps de rendu » reproductible : seul `performance.test.ts` existe côté carte, sous jsdom.

## Étape 1 : `schedule-dialog.ts`
- [ ] Extraire la gestion des profils et des lignes d'horaires, **uniquement en fonctions pures** (entrée vers sortie)
  ou en `ReactiveController`. Pas de nouvel élément personnalisé (shadow root, `querySelector`, focus, styles).
- [ ] Interdire `as any` dans le code produit ; garder `experimentalDecorators: true` et
  `useDefineForClassFields: false` (`tsconfig.json`).
- [ ] Les ~449 accès à des membres privés `_x` dans les tests de `schedule-dialog`, `bar-editor` et `hold-hint` seront
  à adapter dans la même PR : décider avant de commencer comment les traiter.
- [ ] Mettre à jour `stryker.config.json` (`mutate`) pour les fichiers extraits ; relancer Stryker sur le fichier
  d'origine et sur l'extrait, score non inférieur avant fusion.
- [ ] Mesurer la couverture par fonction avant la coupe (seuils par fichier 90/80/80/80, on n'abaisse jamais un
  plancher) et prévoir les tests dans la même PR.
- [ ] Critère de fusion : `npm run test:all` + `npm run build` + `git diff` du bundle + captures `parker` 360 et 1440 px,
  clair et sombre + essai sur l'instance de dev.

## Étape 2 : `bar-editor.ts`
- [ ] Même méthode que l'étape 1.
- [ ] Coupes utiles : limites et contexte, zones et segments. **Ne pas faire de PR pour l'indice d'appui long** :
  la logique est déjà dans `hold-hint.ts`, le gain serait presque nul.
- [ ] Essai d'appui long et des poignées de 44 px sur l'instance de dev.

## Étape 2b : filets de robustesse (indépendants du découpage)
- [ ] Test anti-cycle d'imports (il n'y en a aucun aujourd'hui).
- [ ] Garde-fou de taille en **cliquet** : aucun fichier ne grossit au-delà de sa taille actuelle (un seuil fixe de
  1200 lignes échouerait dès le premier jour : `chart.ts` 1206, `engine.py` 1940), ou avertissement avec liste
  d'exceptions datée.
- [ ] Test de cycle de vie du moteur : rechargement pendant un recalcul ou une resynchronisation, timers annulés
  (`async_stop`), aucune tâche orpheline.
- [ ] Plan de revue Codex des tests : la revue n'a pas abouti (réseau) ; à relancer puis à citer par son chemin.
  Ne supprimer aucun test avant accord du propriétaire (couverture et score de mutation).

## Étape 3 : `engine.py` (à n'entamer qu'avec l'accord explicite du propriétaire)
Le moteur pilote des volets et du chauffage réels. Trois blocages relevés par `nemesis`, à lever **avant** toute coupe :

1. **Filet d'équivalence insuffisant.** `test_latency_equivalence.py` compare avec le moteur 0.19.0
   (`tests/legacy_engine.py`), qui ne connaît ni jour férié, ni pause, ni vérification, ni resynchronisation. De plus,
   la couverture Python est un plancher global de 85 % (`pyproject.toml`), et mutmut ne mute pas `engine.py`.
   - [ ] Écrire des tests d'équivalence par traces (appels de service, journal, runtime) enregistrées sur le moteur
     **actuel**, pour chaque rôle : jours fériés, pause, envoi et vérification, resynchronisation et statut.
2. **Patchs de tests qui n'agiraient plus.** Des tests remplacent des noms au niveau du module `engine`
   (`YIELD_SLICE_S`, `checked_values`, `RESYNC_SPACING_S`, `resolve_entity`, `get_astral_event_date` : 26 références
   dans 8 fichiers de `tests/`). Si le code déplacé lit sa propre copie, le test passe en testant moins.
   - [ ] Règle explicite par PR : constantes lues à l'appel via un module unique, ou cibles de patch migrées dans la
     même PR ; ajouter une assertion « le patch a eu un effet » (compteur de `sleep(0)`, de `resolve_entity`).
3. **État partagé et verrou non réentrant.** `_lock` est un `asyncio.Lock` pris à 15 endroits ; les méthodes jours
   fériés supposent le verrou déjà tenu (`_async_holiday_event` appelle `_async_recompute`, `_arm_timer`, `_persist`,
   `_notify_listeners`). Remplacer `_async_recompute` (sans verrou) par `async_recompute` (avec verrou) provoque un
   interblocage silencieux. Les 76 affectations `self._…` montrent un seul objet d'état.
   - [ ] Décider d'abord **mixins ou composition**.
   - [ ] Contrat « verrou tenu / non tenu » par méthode extraite, vérifié par `assert self._lock.locked()`.
   - [ ] Test d'interblocage avec délai maximal.
   - [ ] Carte des couplages établie par `grep` des `self._x` lus et écrits par chaque méthode, pas par le graphe.

Ensuite, un seul rôle par PR : jours fériés, envoi et vérification, resynchronisation et statut, états et anti-rebond.
- [ ] Garder `PlannerEngine` comme façade et réexporter les noms importés de l'extérieur : `MAX_PAUSE_DAYS`,
  `PlannerEngine` (`websocket.py`, `services.py`), `same_value` (tests).
- [ ] Éviter le nom `resync` pour un sous-module : `resync.py` existe déjà (risque de confusion ou d'import circulaire).
- [ ] Le nom du logger change avec `__name__` : adapter `caplog.at_level(logger=...)` (`test_global_mode.py`,
  `test_mode_rename.py`) et prévenir que le logger exact `custom_components.weekly_planner.engine` perd des traces.
- [ ] Après chaque PR : suite pytest complète, équivalence de latence et par traces, revue `nemesis`, niveau Bronze
  revérifié avant livraison de code Python, puis déploiement sur l'instance de dev et observation d'au moins un jour
  avant l'étape suivante.

## Hors plan
- Pas de modification de `types.ts`, `i18n.ts`, `planner.ts`.
- Pas de suppression de « code mort » sur la seule base du graphe.
- Pas de promesse de gain de vitesse : ces découpages n'en apportent pas.
- `chart.ts` (1206 lignes) et `weekly-planner-card.ts` (1082) : à examiner plus tard, après les étapes 1 et 2.

## Décisions à prendre par le propriétaire
- Faire ou non l'étape −1 (livraison de l'état courant) avant tout le reste.
- Ouvrir l'issue de suivi et créer les issues par étape (règle du projet : un plan approuvé a une issue).
- Commencer par les étapes 1 et 2 seulement ; engager l'étape 3 plus tard ou non.
- Mixins ou composition pour le moteur.
