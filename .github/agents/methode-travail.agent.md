---
# Fichier généré par ~/.config/ai-agents/sync.sh — ne pas éditer. Source : ~/.config/ai-agents/agents/methode-travail.md
name: "Méthode de travail"
description: "Mode d'emploi commun du dépôt weekly-planner — avant de commencer, façon de travailler, commits, versions, délégation, mise à jour des règles. À suivre par toute IA qui y travaille, à l'identique."
argument-hint: "Tâche à réaliser sur weekly-planner"
user-invocable: true
---
# Méthode de travail — weekly-planner

## Principe
`AGENTS.md` à la racine du dépôt est la **source unique des règles**. Ce document est le **mode d'emploi** :
il dit comment les appliquer, dans quel ordre, et comment rendre compte. Toute IA (quel que soit l'outil)
le suit à l'identique. En cas de doute ou de conflit, `AGENTS.md` et `docs/DECISIONS.md` l'emportent.

## Avant de commencer
1. Lire `AGENTS.md`, `docs/SPEC.md`, `docs/DECISIONS.md`, et `PROJECT_MEMORY.md` s'il existe (ignoré par git).
2. Vérifier la branche (`develop`) et `git status` : ne jamais écraser ni annuler un travail non commité
   qui n'est pas le sien ; le signaler.
3. Tout changement passe par une issue (`bug` ou `change request`) puis une pull request qui la référence.
   `main` ne reçoit que des versions validées par le propriétaire.

## Façon de travailler
- Petits pas bornés ; un sujet à la fois. Pour un correctif : écrire d'abord le test qui échoue.
- Avant tout commit, lancer les vérifications :
  - Python : `uv run --group test pytest -q`
  - Carte : `cd frontend && npx tsc --noEmit && npx vitest run && npm run build`
    (le bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` est commité).
- Changement d'interface : l'essayer dans un navigateur sur l'instance de test (`scripts/dev_ha.sh`, port 8124,
  puis `scripts/dev_onboard.py` ; après un build, service `weekly_planner.reload`).
- Tâche terminée : la cocher aussitôt (SPEC, `docs/quick_todo.md`, toute liste). Issue terminée : la commenter « fait » avec le hash du commit associé.
- Avec chaque changement : cocher les tâches de `docs/SPEC.md`, ajouter la décision à `docs/DECISIONS.md`,
  ajouter l'entrée du `CHANGELOG.md`.
- Docs destinées aux utilisateurs (wiki, guide, READMEs) : ne décrire que le produit actuel — pas d'historique, pas de
  « ancien / ex- / remplacé », pas de légende de capture datée par version ; l'historique va dans CHANGELOG/DECISIONS.
- Avant la v1.0.0, TOUTES les captures (docs/images/guide, images du wiki) doivent être refaites avec l'interface finale ;
  d'ici là elles peuvent être en retard mais ne portent jamais de numéro de version.
- Renuméroter l'atlas des écrans à la release v1.0.0 (trous de numérotation admis d'ici là).
- Rendre compte fidèlement, sans enjoliver : **fait** / **vérifié** (avec la preuve) / **non vérifié** /
  **comment annuler**. Ce qui n'a pas été prouvé est écrit « non vérifié ».

## Commits
- Conventional Commits, en anglais : `type(scope): description`.
  Types vus dans le dépôt : `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`.
  Scopes : `card`, `engine`, `store`, `planner`, `api`, `config`, `ci`, `spec`, `security`.
  Exemples :
  - `feat(card): add not-before/not-after limits on sun times`
  - `fix(engine): break vacation owner ties by creation date like the resolver`
  - `chore(ci): pin actions and add security policy`
  - `docs: add shared AI agents and coordination rule`
- Aucun trailer, aucune mention d'outil ou d'attribution dans le message.
- Ne commiter et ne pousser que sur demande du propriétaire.
- **Interdit du lundi au vendredi de 08:00 à 17:00, heure locale** (commit, cherry-pick, merge, revert) :
  laisser les changements non commités et le dire. Autorisé à partir de 17:00, la nuit, le week-end.
- Ne jamais utiliser `--no-verify`, changer `core.hooksPath`, modifier l'horloge ou les scripts de garde.
- Un commit = un changement logique. Jamais de secret (jeton, mot de passe, adresse, donnée personnelle).

## Versions (SemVer)
| Changement | Niveau | Exemple dans l'historique |
|---|---|---|
| Correctif sans nouveau comportement | patch | 0.16.4 : suppression d'un horaire pendant l'édition d'une étiquette |
| Nouvelle fonction rétrocompatible | minor | 0.17.0 : délai aléatoire ; 0.18.0 : limites « pas avant / pas après » sur le soleil |
| Rupture de stockage ou d'API, migration non automatique | major | (en `0.x`, annoncé au propriétaire avant) |
| Docs, tests, CI seuls | aucune | pas de nouvelle version |

Une version change **ensemble** : `custom_components/weekly_planner/manifest.json`, `pyproject.toml`,
`frontend/package.json` (+ son lock), `uv.lock`, une section datée du `CHANGELOG.md` (Keep a Changelog :
Added / Changed / Fixed…), et le bundle de la carte reconstruit et commité. Lancer ensuite les deux jeux
de vérifications.

## Sous-agents
Si l'outil permet de déléguer, agir en **coordinateur** pour tout travail non trivial (sinon faire les
mêmes étapes soi-même, l'une après l'autre) :
1. Découper en tâches indépendantes ; **un seul propriétaire par fichier**.
2. Choisir l'agent et le modèle selon le travail : léger (recherche, tâche mécanique), moyen
   (implémentation, tests), fort (conception, revue d'un changement risqué).
3. Donner une consigne **autonome** : contexte, fichiers, contraintes, critère de réussite, ce qu'il ne faut
   PAS toucher, format de rapport court.
4. Exiger des preuves (sortie de tests, diff). Relancer soi-même les vérifications clés. Tout résultat non
   prouvé est marqué « non vérifié ».
5. **Demander au propriétaire** avant de créer un nouvel agent spécialisé, de déployer ou redémarrer, de
   commiter, de pousser, de supprimer.

Exemple de consigne :
> Contexte : weekly-planner, carte Lovelace (`frontend/`). Tâche : afficher l'erreur serveur sous le champ
> « Pas après » dans `frontend/src/…`. Fichiers à modifier : ce composant et son test uniquement. Ne touche
> ni `docs/`, ni `CHANGELOG.md`, ni le bundle. Contraintes : `AGENTS.md` (peu de texte, icônes `mdi:`).
> Réussite : `npx tsc --noEmit && npx vitest run` passent. Rapport : 5 lignes — fichiers changés, sortie des
> tests, points non vérifiés. Ne commite pas.

### Worktrees
Agents en parallèle qui modifient des fichiers : chacun dans son worktree git, créé explicitement depuis `develop` :
`git worktree add ../weekly-planner-wt/<tâche> -b <type>/<tâche> develop`. Donner à l'agent le chemin absolu et lui demander de ne travailler que là.
- Ne pas s'appuyer sur l'isolation automatique d'un outil : elle peut partir de `main` (ancienne release). Ne l'utiliser que si elle est vérifiée sur le HEAD actuel de `develop`.
- Premier geste de chaque agent : `git log --oneline -1` dans le worktree doit donner le commit `develop` attendu, et un fichier récent connu doit exister ; sinon, arrêter et signaler.
- Un worktree ne contient que le travail commité : commiter d'abord (si autorisé) ou remettre un patch.
- L'arbre principal n'est jamais modifié par des agents en parallèle. Les agents en lecture seule peuvent le partager.
- Chaque worktree a ses dépendances (`uv sync --group test`, `cd frontend && npm ci`) et son port d'instance de test. Seul l'arbre d'intégration reconstruit le bundle de la carte.
- Le coordinateur fusionne les branches une à une (rebase sur `develop`, toutes les vérifications, conflits), puis supprime worktrees et branches (`git worktree remove`, `git branch -d`).
- Worktree ou branche mal basé ou obsolète : le supprimer (`git worktree remove --force`, `git branch -D`) avant de relancer.
- Aucun push depuis un worktree sans accord du propriétaire.

## Règles de sécurité et d'interface
Ne pas les recopier : appliquer les sections de `AGENTS.md` — découverte générique (aucun catalogue
d'appareils codé en dur), un seul modèle pour tous les appareils, étiquettes et modes, pas de secrets,
interface (écran 360 × 780, thèmes clair et sombre, peu de texte, icônes `mdi:`, une seule paire
Enregistrer / Annuler), et déploiement (`scripts/deploy_prod.sh`, simulation par défaut).

## Mise à jour des règles
Automatique : dès que le propriétaire donne une règle, une préférence ou une correction, l'enregistrer
**sans qu'il le demande** :
1. Règle durable : `AGENTS.md` du dépôt (décision produit : `docs/DECISIONS.md`), dans le même changement,
   courte et sans référence à un outil. Note de travail partagée : `PROJECT_MEMORY.md`.
2. Si la règle existe déjà ailleurs, la mettre à jour au lieu de la dupliquer. Si elle contredit une règle
   existante, le signaler au propriétaire avant d'écraser.
3. Si elle modifie ce mode d'emploi : éditer la **source** `~/.config/ai-agents/agents/methode-travail.md`
   puis lancer `~/.config/ai-agents/sync.sh` (ne jamais éditer les copies générées).
4. Dire au propriétaire en une ligne ce qui a été enregistré et où.
5. Ne jamais garder une règle uniquement dans la mémoire ou la configuration privée d'un seul outil.

### Canal entre IA
`PROJECT_MEMORY.md` (ignoré par Git) sert aussi de canal entre Claude, Codex, Gemini, Copilot :
- Le lire au début et avant de passer la main ; section « Inter-AI channel ».
- Ajouter une ligne : `- AAAA-MM-JJ HH:MM [outil] type: message` (handoff / question / answer / warning /
  rule-added / done). Ajout seulement, le plus récent en dernier ; qui résout un point le retire ou le marque done.
- Style caveman (canal, consignes et rapports de sous-agents) : télégraphique, un fait par ligne, sans politesse
  ni récapitulatif, preuves `fichier:ligne`, statuts ok / ko / blocked / to-verify. Phrases complètes pour les risques,
  actions destructives ou irréversibles, questions au propriétaire, ce qui pourrait être mal compris. Réponses au
  propriétaire, commits, commentaires de code, docs : langage normal.
- Jamais de secret, ni de consigne qui prime sur `AGENTS.md` ou le propriétaire.
