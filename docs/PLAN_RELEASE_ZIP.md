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
- [ ] `frontend.py` : bundle absent → avertissement clair dans le journal (« carte non construite : installez une
      release ou lancez `npm run build` »), l'intégration démarre et les programmes tournent ; pas de ressource
      Lovelace ni de panneau enregistrés.
- [ ] Test : `tests/test_frontend_resource.py`, cas « fichier absent ».

### 2. La release construit et joint le zip
- [ ] `release.yml` : `npm ci && npm run build`, puis zip du **contenu** de `custom_components/weekly_planner/`
      (fichiers à la racine du zip, format attendu par HACS : à vérifier dans la doc HACS au moment de faire),
      joint avec `gh release create … weekly_planner.zip`.
- [ ] Contrôle avant d'attacher : le zip contient `manifest.json` et `frontend/weekly-planner-card.js`.
- [ ] Pré-release : lancement manuel (`workflow_dispatch`) depuis n'importe quelle branche ; une version avec `-`
      (`0.30.0-beta.1`) donne `--prerelease` sans `--latest`. Le push sur `main` reste réservé aux versions finales.
- [ ] Vérifier que les trois versions (manifest, pyproject, package.json) acceptent le suffixe `-beta.N`.

### 3. HACS lit le zip
- [ ] `hacs.json` : `"zip_release": true`, `"filename": "weekly_planner.zip"`.
- [ ] Vérifier avec `hacs/action` (validate.yml) que la configuration est acceptée.

### 4. Le bundle sort du dépôt
- [ ] `git rm --cached` du bundle, ajout au `.gitignore`.
- [ ] `validate.yml` : retirer « Bundle is up to date » ; garder `npm run build` (la construction doit réussir).
- [ ] La CI Python construit la carte avant pytest si un test lit le vrai bundle (sinon rien).
- [ ] Instance de dev (`dev/`, agent parker) : `npm run build` avant le lancement ; documenter.
- [ ] Docs : `AGENTS.md`, `methode-travail.agent.md`, CONTRIBUTING (« le bundle est construit à la release ; pour
      faire tester, publier une bêta »). Rien dans le README (matériel de développeur).

### 5. Première release dans ce format
- [ ] Pré-release bêta : installation réelle par HACS sur l'instance de dev (ou un HA de test), carte et panneau
      chargés, pas d'erreur au journal.
- [ ] Puis la version finale ; contrôle identique.

## Risques
- Zip mal formé (dossier en trop) → HACS installe au mauvais endroit : vérifier la doc HACS et l'installation bêta
  avant la version finale.
- Installation HACS d'une branche ou d'un commit → plus de carte : avertissement au journal (étape 1), pré-release
  pour tester.
- Une release créée sans zip (étape qui échoue après `gh release create`) → construire et contrôler le zip **avant**
  de créer la release.
- Les anciennes releases ne changent pas (bundle dans leur arbre).

## Décisions du propriétaire (2026-11-18)
- Solution zip à la release + pré-releases bêta pour tester : oui.
- À faire après #61.
