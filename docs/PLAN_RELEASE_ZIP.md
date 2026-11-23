# Plan : le bundle de la carte n'est plus commité, il est construit à la release

Statut : **approuvé** (2026-11-18), à faire **après #61**. Issue : #63.
Origine : le bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` pèse plus de la moitié des
lignes d'un commit de carte (58 % du commit #60) et provoque des conflits à chaque fusion de branches.

## But
- Le dépôt ne contient plus le bundle (`.gitignore`).
- Chaque release (et chaque pré-release `-beta.N`) porte un zip `weekly_planner.zip` construit par la CI ; HACS
  l'installe (`zip_release`).
- Pour faire tester avant une version : une pré-release bêta, plus jamais une branche ou un commit.

## Constat (état au 2026-11-18)
- `hacs.json` : pas de `zip_release` → HACS copie le dossier du dépôt au tag, le bundle doit y être.
- `release.yml` : crée seulement le tag et la release (`--latest`) à chaque push sur `main` ; ne construit rien.
- `validate.yml:67-69` : reconstruit et échoue si le bundle commité diffère.
- `frontend.py:25` : `CARD_FILE.read_bytes` ; sans fichier, l'erreur fait échouer la mise en place de l'intégration.
- `scripts/deploy_prod.sh:86` construit déjà la carte avant la copie : rien à changer pour la production.
- Références à mettre à jour : `AGENTS.md:120-121`, `.github/agents/methode-travail.agent.md:28`, CONTRIBUTING.

## Étapes
### 1. L'intégration supporte l'absence du bundle
- [x] `frontend.py` : bundle absent → avertissement clair dans le journal (« carte non construite : installez une
      release ou lancez `npm run build` »), l'intégration démarre et les programmes tournent ; pas de ressource
      Lovelace ni de panneau enregistrés.
- [x] Test : `tests/test_frontend_resource.py`, cas « fichier absent ».

### 2. La release construit et joint le zip
- [x] `release.yml` : `npm ci && npm run build`, puis zip du **contenu** de `custom_components/weekly_planner/`
      (fichiers à la racine du zip : HACS fait `ZipFile.extractall` dans `custom_components/<domaine>/`, code de
      `hacs/integration` 8a54382, `repositories/base.py` `async_download_zip_file` ; la doc HACS ne décrit pas le contenu),
      joint avec `gh release create … weekly_planner.zip`.
- [x] Contrôle avant d'attacher : le zip contient `manifest.json` et `frontend/weekly-planner-card.js`.
- [x] Pré-release : lancement manuel (`workflow_dispatch`) depuis n'importe quelle branche ; une version avec `-`
      (`0.30.0-beta.1`) donne `--prerelease` sans `--latest`. Le push sur `main` reste réservé aux versions finales.
- [x] Vérifier que les trois versions (manifest, pyproject, package.json) acceptent le suffixe `-beta.N` : oui, le même
      texte `0.30.0-beta.1` partout (AwesomeVersion SEMVER pour HA et hassfest, PEP 440 pour uv, semver pour npm) ;
      `uv.lock` l'écrit `0.30.0b1` après `uv lock`.

### 3. HACS lit le zip
- [x] `hacs.json` : `"zip_release": true`, `"filename": "weekly_planner.zip"`.
- [x] Vérifier avec `hacs/action` (validate.yml) que la configuration est acceptée : vérifié contre le schéma
      `HACS_MANIFEST_JSON_SCHEMA` et la règle `hacsjson.py` du code HACS ; l'exécution réelle de l'action reste à voir sur GitHub.

### 4. Le bundle sort du dépôt
- [x] `git rm --cached` du bundle, ajout au `.gitignore`.
- [x] `validate.yml` : retirer « Bundle is up to date » ; garder `npm run build` (la construction doit réussir).
- [x] La CI Python construit la carte avant pytest si un test lit le vrai bundle (sinon rien) : aucun ; les tests
      utilisent un faux bundle (`tests/conftest.py`, `built_card`).
- [x] Instance de dev (`dev/`, agent parker) : `npm run build` avant le lancement ; documenter.
- [x] Docs : `AGENTS.md`, `methode-travail.agent.md`, CONTRIBUTING (« le bundle est construit à la release ; pour
      faire tester, publier une bêta »). README : seule l'installation manuelle change (elle disait de copier le dossier
      du dépôt, qui n'a plus la carte : elle dit maintenant de décompresser `weekly_planner.zip`).

### 5. Première release dans ce format
- [ ] Pré-release bêta : installation réelle par HACS sur l'instance de dev (ou un HA de test), carte et panneau
      chargés, pas d'erreur au journal.
- [ ] Puis la version finale ; contrôle identique.

## Risques
- Zip mal formé (dossier en trop) → HACS installe au mauvais endroit : vérifier la doc HACS et l'installation bêta
  avant la version finale.
- Installation HACS d'une branche ou d'un commit → plus de carte : avertissement au journal (étape 1), pré-release
  pour tester. D'après le code HACS, avec `zip_release` HACS cherche toujours le zip ; installer la branche par
  défaut (`main`) échoue probablement au téléchargement (non vérifié).
- Une release créée sans zip (étape qui échoue après `gh release create`) → construire et contrôler le zip **avant**
  de créer la release.
- Les anciennes releases ne changent pas (bundle dans leur arbre).

## Décisions du propriétaire (2026-11-18)
- Solution zip à la release + pré-releases bêta pour tester : oui.
- À faire après #61.

## Décisions du propriétaire (2026-11-21)
- Pré-releases bêta : lancées à la main depuis **n'importe quelle branche**, marquées pré-release, jamais latest.
  Versions finales : seulement depuis `main`, après la PR de release.
- Le propriétaire lance la première bêta et l'installe par HACS.

## Procédure du propriétaire : première bêta (à faire après la fusion de cette branche dans `develop`)
1. Sur `develop` (ou une branche), mettre `0.30.0-beta.1` dans `manifest.json`, `pyproject.toml`, `frontend/package.json`,
   puis `uv lock` et `cd frontend && npm install --package-lock-only` ; commiter, pousser.
2. GitHub, Actions, « Release », « Run workflow » sur cette branche : la pré-release `v0.30.0-beta.1` apparaît avec
   `weekly_planner.zip` (marquée pré-release, pas « Latest »).
3. HACS, Weekly Planner : activer l'entité « Pre-release » (appareil HACS de Weekly Planner, désactivée par défaut) ou
   choisir `v0.30.0-beta.1` avec « Redownload » ; redémarrer Home Assistant.
4. Contrôler : `custom_components/weekly_planner/manifest.json` (pas de sous-dossier en trop), carte et panneau chargés,
   aucun « card not built » ni erreur au journal. Puis cocher l'étape 5 et préparer la version finale (PR vers `main`).
