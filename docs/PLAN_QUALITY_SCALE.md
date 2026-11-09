# Échelle de qualité des intégrations Home Assistant — recherche et plan (2026-11-07)

Source : <https://developers.home-assistant.io/docs/core/integration-quality-scale/> (règles de `script/hassfest/quality_scale.py`).
**But du propriétaire : atteindre le niveau Bronze.** Silver et Gold : étudiés seulement, ce n’est pas un objectif.

## Ce que cela implique (conséquences)
- Les niveaux s’empilent : Bronze < Silver < Gold < Platinum. Il faut remplir **toutes** les règles du niveau et des niveaux inférieurs.
- Weekly Planner est une **intégration personnalisée (HACS)** : Home Assistant ne lui attribue pas de niveau officiel et n’affiche aucun badge. Le niveau est **auto-déclaré** et sert de discipline de qualité.
- Le suivi se fait par un fichier `quality_scale.yaml` à côté du `manifest.json` (chaque règle : `done`, `todo` ou `exempt` avec la raison). Pour une intégration personnalisée, `hassfest` ne le valide pas : c’est à nous de le tenir à jour. Le champ `quality_scale` du manifeste est réservé au cœur de HA : ne pas l’ajouter.
- Une demande d’intégration au cœur de HA exigerait au minimum Bronze, mais l’intégration livre sa propre carte Lovelace (bundle JS) et son panneau, ce qui n’est pas le modèle du cœur : **le cœur n’est pas un objectif**.
- Bronze est le niveau de base : coût raisonnable, aucun changement de comportement pour l’utilisateur.

## Bronze — règles (20) et état actuel
| Règle | État | Remarque |
|---|---|---|
| `config-flow` | fait | `config_flow: true`, instance unique |
| `config-flow-test-coverage` | fait | `config_flow.py` à 100 % (lignes et branches) |
| `unique-config-entry` | fait | `single_config_entry: true` |
| `test-before-configure` | exempt | aucune connexion à un appareil ou service |
| `test-before-setup` | exempt | idem |
| `runtime-data` | fait | `entry.runtime_data = engine` |
| `action-setup` | fait | services enregistrés dans `async_setup` |
| `entity-unique-id` | fait | identifiants basés sur `entry_id` |
| `has-entity-name` | fait | `_attr_has_entity_name = True` |
| `entity-event-setup` | fait | écouteurs dans `async_added_to_hass` + `async_on_remove` |
| `appropriate-polling` | fait | pas de scrutation (`_attr_should_poll = False`, `iot_class: calculated`) |
| `dependency-transparency` | exempt | `requirements: []` |
| `brands` | fait | dossier `brand/` |
| `common-modules` | **à faire** | `switch.py` et `select.py` répètent le même socle d’entité (nom, appareil, écouteur du moteur) : l’extraire dans `entity.py` |
| `docs-high-level-description` | fait | début du README |
| `docs-installation-instructions` | fait | « Requirements and installation » (HACS) |
| `docs-removal-instructions` | **à faire** | aucune section de désinstallation dans `README.md` / `README.fr.md` |
| `docs-actions` | fait | « Created entities and HA actions » (à relire : paramètres de chaque action) |
| `docs-triggers`, `docs-conditions` | exempt | aucun déclencheur ni condition fournis |
| fichier de suivi | **à faire** | créer `custom_components/weekly_planner/quality_scale.yaml` |

## Tâches Bronze (à valider par le propriétaire avant de coder)
- [x] Créer `quality_scale.yaml` avec les 20 règles Bronze (`done` / `exempt` motivé), puis l’étendre aux niveaux supérieurs en `todo`.
- [x] Extraire un socle d’entité commun (`entity.py` : `has_entity_name`, `device_info`, abonnement au moteur) utilisé par `switch.py` et `select.py` ; tests inchangés verts.
- [x] Ajouter la section de désinstallation (retirer l’entrée dans Appareils et services, supprimer la carte du tableau de bord, désinstaller via HACS, ce qui reste dans `.storage`) en anglais et en français.
- [ ] Relire « HA actions » : chaque action (`apply_now`, `skip_next`, `reload`) avec ses champs et un exemple.
- [ ] Vérifier `hassfest` et HACS en CI (déjà présents dans `validate.yml`) ; ajouter un test qui échoue si `quality_scale.yaml` est incohérent (règle inconnue, `exempt` sans commentaire).
- [x] Conserver le résultat dans `docs/DECISIONS.md` (niveau visé, exemptions, auto-déclaration) et dans le README (une ligne).

## Silver — étude (pas un objectif)
Règles supplémentaires : `action-exceptions`, `config-entry-unloading`, `docs-configuration-parameters`, `docs-installation-parameters`, `entity-unavailable`, `integration-owner`, `log-when-unavailable`, `parallel-updates`, `reauthentication-flow`, `test-coverage`.
- Déjà couvert : `config-entry-unloading` (`async_unload_entry`), `integration-owner` (`codeowners`).
- Exempt probable : `reauthentication-flow` (aucune authentification).
- À faire : `test-coverage` **> 95 % sur chaque module** (actuellement 91 % au total ; `services.py` 55 %, `select.py` 82 %), `parallel-updates` (constante `PARALLEL_UPDATES` dans `switch.py` et `select.py`), `action-exceptions` (les actions lèvent `ServiceValidationError` / `HomeAssistantError` plutôt que d’échouer en silence), `entity-unavailable` et `log-when-unavailable` (un appareil ciblé indisponible : un seul message au passage, un seul au retour), documentation des paramètres d’installation et des options.

## Gold — étude (pas un objectif)
Règles : `devices`, `diagnostics`, `discovery`, `discovery-update-info`, `docs-data-update`, `docs-examples`, `docs-known-limitations`, `docs-supported-devices`, `docs-supported-functions`, `docs-troubleshooting`, `docs-use-cases`, `dynamic-devices`, `entity-category`, `entity-device-class`, `entity-disabled-by-default`, `entity-translations`, `exception-translations`, `icon-translations`, `reconfiguration-flow`, `repair-issues`, `stale-devices`.
- Déjà couvert : `devices` (appareil unique), `repair-issues` (réparations existantes), traductions en/fr.
- À faire : `diagnostics.py` (téléchargement des diagnostics, avec données masquées), `icons.json` (remplacer `_attr_icon`), traductions des exceptions, `entity-category`, `disabled-by-default`, documentation étendue (cas d’usage, limites, dépannage, exemples d’automatisations).
- Exempt probable : `discovery`, `discovery-update-info`, `docs-supported-devices` (aucun appareil propre), à justifier ; `reconfiguration-flow` à arbitrer (les options existent déjà).
- Gold exige aussi une **couverture de tests complète** du code de l’intégration.

## Platinum (pour mémoire)
`strict-typing` (mypy strict sur tout le code), `async-dependency`, `inject-websession` (exempt probable). Le typage strict est le plus coûteux.

## Risques
- Le refactor `entity.py` touche les entités visibles par l’utilisateur : garder les identifiants uniques et les noms (aucune entité recréée).
- `quality_scale.yaml` n’est pas validé par HA pour une intégration personnalisée : un test local évite la dérive.
