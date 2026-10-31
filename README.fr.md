# Weekly Planner

[English](README.md) | Français

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Licence : MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)

Une intégration Home Assistant avec sa carte Lovelace pour planifier les appels de
service et les scènes. Les horaires utilisent des réglages partagés, une fin
facultative et une action par défaut par entité. La découverte repose sur les
métadonnées Home Assistant, sans catalogue de marques ou d’appareils.

Ce README décrit la version **0.16.2** pour les intégrateurs Home Assistant. Pour les utilisateurs de la
maison : [guide illustré pas à pas](docs/GUIDE.fr.md) et
[atlas des écrans](docs/SCREENS.fr.md).

<a href="docs/GUIDE.fr.md"><img src="docs/images/guide/s01-overview.png" width="300" alt="Vue d’ensemble de Weekly Planner" /></a>

Ce projet a été réalisé avec l’aide d’agents d’intelligence artificielle.

## Installation

- Home Assistant **2026.10.0 ou ultérieur**, conformément à `hacs.json`.
- Une seule instance de l’intégration contient tous les programmes.
- Des entités HA existantes et des services ou scènes compatibles.
- L’historique HA alimente la partie mesurée du graphique, indépendamment du moteur.

1. Dans HACS, ajouter `https://github.com/movrack/ha_weekly_planner` comme dépôt personnalisé de catégorie **Intégration**.
2. Installer Weekly Planner et redémarrer Home Assistant pour charger son code Python.
3. Ouvrir **Paramètres → Appareils et services → Ajouter une intégration → Weekly Planner**.
4. Ajouter une carte **Weekly Planner** au tableau de bord. Créer les programmes dans son éditeur visuel.

Aucun second dépôt de carte n’est nécessaire. En mode Lovelace storage, la
ressource JavaScript est enregistrée et mise à jour automatiquement. En mode YAML,
elle est chargée par le mécanisme des modules JavaScript supplémentaires de HA.
Le module servi est `/weekly_planner_static/weekly-planner-card.js?v=<empreinte>`.

Pour un autre programme, utiliser **Réglages des programmes → Nouveau programme**,
pas une nouvelle instance de l’intégration.

## Configuration de la carte

L’éditeur distingue deux portées :

- **Affichage de la carte** : titre, programme ou filtres, vue et visibilité du graphique. Le bouton Enregistrer de Lovelace conserve ces choix pour cette carte.
- **Réglages des programmes** : données partagées par toutes les cartes. **Appliquer au programme** enregistre immédiatement dans l’intégration. Annuler ensuite l’éditeur Lovelace ne revient pas sur cet enregistrement. Cette section est réservée aux administrateurs.

Les brouillons et leur historique Annuler/Rétablir sont conservés entre les onglets
et les programmes pendant l’édition. Fermer l’éditeur abandonne les modifications
non appliquées. L’historique repart à zéro après un enregistrement réussi ; il ne
rappelle pas une commande déjà envoyée à un appareil. Un programme nouvellement
créé est sélectionné automatiquement et **Définir les horaires** ouvre ses horaires.

Un programme avec double cadran :

```yaml
type: custom:weekly-planner-card
program: YOUR_PROGRAM_ID
title: Salon
schedule_view: radial_12h
show_chart: true
```

Une liste filtrée :

```yaml
type: custom:weekly-planner-card
title: Horaires
schedule_view: list
filter:
  types: [climate, cover]
```

| Option | Comportement |
|---|---|
| `program` | Identifiant interne existant, ou nom de programme (voir ci-dessous). Une valeur non vide affiche ce programme au lieu d’appliquer les filtres. |
| `filter.types` | Domaines d’entités présents dans les programmes. Absent ou vide = tous les domaines. Les domaines inconnus restent utilisables. |
| `filter.area` | Correspondance exacte avec la zone du programme, définie dans Général. Les pièces HA des appareils ne sont pas déduites. |
| `filter.programs` | Liste facultative d’identifiants ou de noms de programmes (voir ci-dessous), croisée avec les autres filtres. Absent = tous, futurs compris ; `[]` = aucun. |
| `title` | Titre facultatif. |
| `schedule_view` | `bars` par défaut, `list`, `radial` pour 24 h, ou `radial_12h` pour deux cercles de 12 h. Disponibles pour un programme ou une liste filtrée. |
| `show_chart` | Graphique dans les horaires, `true` par défaut. |
| `chart_collapsed` | Booléen, `true` par défaut : le graphique du jour sous chaque appareil démarre replié (`false` : déplié). Un choix fait avec le bouton du graphique est mémorisé par navigateur et prime ensuite. |
| `show_week`, `show_advanced` | Obsolètes, acceptés et ignorés. |

**Référence YAML.** Toutes les options de l’éditeur visuel se règlent aussi dans l’éditeur de code YAML,
avec le même effet ; passer de l’un à l’autre conserve toutes les clés (même inconnues). Types : `title`,
`program`, `filter.area` = texte ; `filter.types` et `filter.programs` = listes de textes (un texte seul
vaut une liste d’un élément) ; `schedule_view` = `bars`, `list`, `radial` ou `radial_12h` ; `show_chart` et
`chart_collapsed` = booléens. Une valeur du mauvais type est ignorée et la valeur par défaut s’applique ;
une configuration qui n’est pas un mapping YAML affiche une carte d’erreur explicite. Dans l’éditeur
visuel, les interrupteurs de type et de programme écrivent `filter.programs` (et ne font qu’élargir, ou
retirer pour un type vide, `filter.types`) : une configuration YAML avec seulement `filter.types` continue
de fonctionner. Une liste `filter.programs` écrite par l’éditeur n’ajoute pas automatiquement les futurs
programmes ; utiliser **Tous les programmes** (ou omettre `filter.programs`) pour cela.

`filter.programs` et `program` acceptent un **nom** de programme en plus de son identifiant, par exemple
`filter: { programs: [Bureau, Lampe du salon] }`. Un identifiant exact est prioritaire ; sinon le nom est
comparé sans tenir compte des majuscules, des accents ni des espaces autour, et tous les programmes de ce
nom sont affichés (les doublons correspondent tous). Une entrée sans correspondance est ignorée sans erreur.
Attention : renommer un programme casse une liste basée sur son nom ; l’éditeur visuel réécrit la sélection
en identifiants (stables) au premier changement.

```yaml
type: custom:weekly-planner-card
title: Horaires                 # défaut : aucun
schedule_view: bars             # bars | list | radial | radial_12h
show_chart: true                # défaut true
chart_collapsed: true           # défaut true (replié)
filter:                         # ignoré si `program` est renseigné
  types: [climate, cover]       # défaut : tous
  area: Salon                   # défaut : toutes les zones
  programs: [ID1, Bureau]          # défaut : tous (futurs compris)
```

Un identifiant de programme est généré par l’intégration : ce n’est ni son nom ni
un nom simplifié. Le trouver dans l’attribut `program_id` de son interrupteur ou
dans la réponse WebSocket `weekly_planner/get`. Remplacer `YOUR_PROGRAM_ID` dans
l’exemple. Les identifiants d’entités dépendent aussi de la langue et des renommages.

Le filtre Zone propose les zones existantes et conserve un choix devenu absent.
Définir cette zone dans **Réglages des programmes → Général** : c’est un nom pour
regrouper les programmes, indépendant des pièces des appareils.

Les cadrans partagent les couleurs, repères horaires et marqueurs solaires des
barres. Le double cadran affiche minuit–midi à l’intérieur et midi–minuit à
l’extérieur. Toucher un cadran ouvre les horaires ; ses arcs ne se déplacent pas.
En liste compacte, toucher une ligne déplie sa barre. La semaine se déplie à la
demande ; les anciens champs `show_week` et `show_advanced` ne pilotent plus
l’affichage. Toucher le titre d’une modale agrandit sa largeur sur ordinateur ;
sur téléphone elle occupe déjà l’écran.

## Modèle et exécution

Dans l’interface, « appareil » désigne une entité HA, pas un identifiant du registre
des appareils. Un programme peut en contenir plusieurs.

| Objet | Sens |
|---|---|
| Programme | Entités, priorité, conditions, réapplication et semaines types. |
| Réglage | Nom, couleur et action partagés globalement. |
| Horaire | Début, fin facultative, jours et référence de réglage. |
| Défaut d’entité | `default_label`, appliqué hors des plages bornées selon les règles de priorité. |
| Valeur propre | `label_overrides[label_id]`, action propre à cette entité dans ce programme. |
| Mode (`profile` en interne) | Semaine type indépendante. Un mode actif par programme ; Vacances est un mode ordinaire. Appareils, défauts, conditions et priorité restent communs. |

Le moteur recalcule l’action voulue et agit aux transitions. Il ne force pas en
continu l’état observé et ne détecte pas les réglages manuels pour les corriger.
Leur affichage dans le graphique ne modifie pas cette règle.

- **Avec fin** : action au début, puis défaut éligible ou action du programme qui reprend la main à la fin.
- **Sans fin** : action ponctuelle, aucun événement de fin, jamais rejouée après son heure. Une plage bornée prioritaire peut la supprimer.
- **Priorité** : le plus petit numéro gagne entre les plages éligibles actives ; le programme le plus ancien départage les égalités. Sans plage active, le programme activé le plus prioritaire contenant l’entité fournit son défaut facultatif.
- **Conditions** : toutes les conditions du programme doivent être satisfaites pour ses horaires. Une condition fausse n’est pas une commande d’arrêt générique ; les règles des défauts comptent encore.
- **Redémarrage** : stabilisation de 30 s, puis réapplication facultative de l’action bornée ou du défaut en cours. Les fins manquées sont rattrapées, pas les actions ponctuelles passées.
- **Temps** : construction en heure locale HA, comparaisons en UTC. Une plage passe au lendemain si sa fin est antérieure au début **et avant midi**. `24:00` est accepté en fin.
- **Soleil** : le modèle accepte aube, lever, coucher, crépuscule, décalages et bornes. Le formulaire actuel expose lever et coucher avec décalages.

## Actions des réglages

Un appel de service :

```json
{"kind":"service","service":"climate.set_temperature","data":{"temperature":20}}
```

Une scène : `{"kind":"scene","scene":"scene.example"}`. L’entité doit être
compatible avec la cible du service ou appartenir à la scène. Un réglage peut
ne concerner qu’une partie des entités d’un programme mixte : les autres sont ignorées.

Les services, descriptions et champs viennent de HA. Un nouvel appareil commence
avec `restrict_services: true` et `allowed_services: []` : **aucune commande de
service sélectionnée**. La création invite à les choisir ; le choix reste
modifiable dans **Appareils**. Une liste `allowed_services` non vide limite les
actions à cette liste. Les anciennes listes vides ou absentes sans le drapeau
`restrict_services` restent sans restriction. Les scènes sont distinctes de ce
filtre. Les champs incompatibles et services demandant du texte ou un objet brut
sont masqués. Les presets viennent des attributs de l’entité, sans modes de marque
inventés.

Pour appeler un bouton qui déplace un volet vers son favori enregistré, choisir
**Une autre entité** comme cible de l’action :

```json
{"kind":"service","service":"button.press","target_entity_id":"button.example_favourite"}
```

Les services et champs sont découverts sur cette cible réelle. Le service doit
aussi être autorisé dans les actions proposées pour l’appareil du programme.
`target_entity_id` est le seul remplacement de cible ; `data` et `data_sources`
ne servent pas à rediriger l’action.

Un champ peut lire un état ou attribut d’entité au moment de l’exécution :

```json
{"kind":"service","service":"cover.set_cover_position","data_sources":{"position":{"entity_id":"input_number.example_position","type":"number"}}}
```

Ajouter `attribute` pour lire un attribut ; sinon l’état est utilisé. Les types de
source sont `number`, `boolean`, `string` et `native`. Une source indisponible ou
invalide produit une erreur, sans remplacement silencieux par une valeur fixe.
Changer sa valeur ne déclenche pas à lui seul une action planifiée.

## Modes et sélection externe

**Mode à gérer** choisit la semaine à modifier. Modifier les horaires d’un mode
inactif ne l’active pas et ne réapplique pas les actions du mode actif.
**Mode actif — changement immédiat** est une commande distincte : elle prend
effet sans Appliquer et l’annulation du brouillon ne revient pas dessus. Les
réglages de modes et leurs associations nécessitent toujours **Appliquer au programme**.

Un programme peut suivre toute entité externe via `mode_source`. Associer ses
états bruts aux identifiants de modes, sans catalogue d’états d’alarme ou de types
de sélecteur imposé :

```json
{"mode_source":{"entity_id":"input_select.example_house_mode","mappings":{"Maison":"mode_home_id","Dehors":"mode_away_id","Vacances":"mode_vacation_id"}}}
```

Remplacer ces exemples par les états bruts exacts de la source et les vrais
identifiants de modes. Si la source devient indisponible ou son état n’est pas
associé, le dernier mode valide reste actif. Sous contrôle externe enregistré,
l’activation manuelle est refusée. Les entités de mode de Weekly Planner ne
peuvent pas servir de source pour éviter les boucles. Aucun changement par date
n’est implicite : une automatisation externe peut changer la source.

Le `select` de profil HA reste disponible en sélection manuelle via
`select.select_option`. L’ancien interrupteur global Vacances est devenu une
commande distincte **Suspension de tous les programmes**, avec identité conservée.
Voir la [référence des modes](docs/SEASONS.md) et les
[exemples d’actions natives](docs/GENERIC_ACTIONS.md).

## Entités et services HA

L’intégration crée un interrupteur global de suspension, un interrupteur et un
sélecteur de profil par programme. Inspecter le registre réel : ne pas supposer
un identifiant anglais généré sur une autre installation.

| Entité | Comportement |
|---|---|
| Interrupteur de programme | Active ou suspend. Attributs : `program_id`, profil actif, plages en cours et prochaines actions. |
| Interrupteur global | Suspend les programmes et applique une fois les défauts éligibles. L’ancien identifiant Vacances reste stable. |
| Sélecteur de profil | Choisit le mode actif par son nom exact en sélection manuelle. |

```yaml
# Réappliquer l’action voulue maintenant
action: weekly_planner.apply_now
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Sauter le prochain changement une fois ; cancel: true annule le saut
action: weekly_planner.skip_next
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Recharger l’intégration et enregistrer le bundle courant
action: weekly_planner.reload
```

```yaml
# Choisir un mode enregistré en contrôle manuel
action: select.select_option
target:
  entity_id: select.example_program_profile
data:
  option: Hiver
```

Les interrupteurs utilisent `switch.turn_on` et `switch.turn_off`. Planifier
`automation.turn_on` active les déclencheurs d’une automatisation ; ce n’est pas
`automation.trigger`.

## Permissions et options

**Paramètres → Appareils et services → Weekly Planner → Configurer** :

| Option | Défaut | Comportement actuel |
|---|---|---|
| `admin_only` | `false` | Limite les modifications des programmes et réglages. Interrupteurs et sélection de profil restent des commandes séparées. |
| `reapply_default` | `true` | Présent dans les options, mais la création initialise actuellement `reapply: true` sans le consommer. Régler ce choix dans chaque programme. |
| `notify_delay_min` | `30` | Notification d’entité indisponible, 1 à 1440 minutes. |
| `debounce_min` | `2` | Délai de stabilité des conditions, 0 à 60 minutes. |

Les actions sensibles sont protégées côté serveur indépendamment de `admin_only`
(voir [actions.py](custom_components/weekly_planner/actions.py)). Les réglages
partagés sont affichés aux administrateurs. Horaires et réglages dépendent aussi
de `can_edit` et de l’état du stockage. Le rechargement demandé par un utilisateur
nécessite les droits administrateur.

## Stockage, API et concurrence

Programmes et réglages sont des données de l’intégration, pas du YAML de carte.
Fichiers HA : `.storage/weekly_planner`, `.storage/weekly_planner.runtime` et
`.storage/weekly_planner.journal`. Sauvegarder la configuration HA, y compris
`.storage`, avant une mise à jour Python ou une récupération. Ne pas modifier ces
fichiers à chaud. Les migrations conservent une copie antérieure ; une corruption
ne doit pas remplacer silencieusement les données par une configuration vide.

La carte suit `weekly_planner/subscribe`. `card_version` identifie le bundle ; une
carte obsolète se recharge automatiquement lorsqu’elle est inactive. Pour un
client tiers, [websocket.py](custom_components/weekly_planner/websocket.py) fait foi :

| Commandes | But |
|---|---|
| `weekly_planner/get`, `weekly_planner/subscribe` | État initial et mises à jour. |
| `weekly_planner/program/save`, `program/delete`, `program/set_enabled` | Mutations de programme ; tous les suffixes sont sous `weekly_planner/`. |
| `weekly_planner/label/save`, `label/delete` | Réglages globaux. |
| `weekly_planner/preview` | Résoudre les occurrences d’un programme/mode pour une date. |
| `weekly_planner/journal` | Décisions enregistrées, jusqu’à 14 jours. |

Une modification porte la `revision` courante ; une révision obsolète provoque
`conflict`. La carte reconstruit l’écriture sur des données fraîches et retente
une fois. Les réglages sont fusionnés avec leur base de brouillon pour préserver
les horaires modifiés ailleurs. Un conflit sur le même réglage est signalé plutôt
qu’écrasé. Il n’existe pas de service public `weekly_planner.set_profile`.

## Limites et diagnostic

- Le filtre Zone vise les métadonnées du programme, pas les pièces HA.
- Le modèle accepte des conditions par horaire et des bornes solaires, mais le formulaire n’a pas de constructeur de conditions par horaire ni d’éditeur de bornes solaires.
- `reapply_default` est affiché, mais les nouveaux programmes démarrent encore avec réapplication activée.
- L’historique et les changements manuels dépendent de Recorder/logbook ; l’attribution des modifications d’attributs seuls a des limites.

Le graphique distingue historique absent, futur ou indisponible et absence
d’action prévue. Un échec d’historique ne masque pas les prévisions. Une liste vide
invite à vérifier les types, zones et programmes filtrés. Si une action manque,
vérifier sa cible, les fonctions supportées, les attributs et `allowed_services`.
Utiliser les attributs de l’interrupteur, Repairs, notifications et journaux HA.
Les appels échoués ont des reprises bornées ; une valeur invalide est signalée
sans répétition de la même valeur refusée.

## Développement et déploiement

Python **3.14.2 à 3.14.x**, dépendances de test épinglées dans `pyproject.toml` et
`uv.lock` ; outils frontend dans `frontend/package-lock.json`.

```bash
uv sync --group test
uv run --group test pytest -q
cd frontend
npm ci
npx tsc --noEmit
npx vitest run
npm run build
```

Le bundle compilé est versionné avec les sources sous
`custom_components/weekly_planner/frontend/`. Lancer `scripts/dev_ha.sh` pour HA
local sur le port 8124, puis `scripts/dev_onboard.py` pour l’initialiser. Ce dernier
affiche un jeton de développement : garder sa sortie et les données `dev/` hors de
Git et des journaux publiés.

```bash
WP_HOST=YOUR_SSH_ALIAS scripts/deploy_prod.sh           # aperçu
WP_HOST=YOUR_SSH_ALIAS scripts/deploy_prod.sh --apply   # tests, build, copie
```

Le script accepte un arbre testé non commité, affiche sa révision/son état et le
SHA-256 du bundle, sans redémarrer HA. Carte seule : `weekly_planner.reload`.
Changement Python : sauvegarde HA puis redémarrage autorisé par le propriétaire.
La règle de commit du lundi au vendredi entre 08 h et 17 h n’interdit pas les
déploiements ; les garde-fous de commit restent actifs.

Références : [spécification](docs/SPEC.md), [décisions](docs/DECISIONS.md),
[inventaire des captures](docs/SCREEN_INVENTORY.md), [première revue Mamy](docs/MAMY_REVIEW.md),
[revue de configuration et corrections](docs/MAMY_REVIEW_0.16.0.md),
[journal des modifications](CHANGELOG.md).

## Licence

[MIT](LICENSE)
