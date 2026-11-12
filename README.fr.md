# Weekly Planner

[English](README.md) | Français

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Licence : MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)
[![Échelle de qualité : Bronze (auto-déclaré)](https://img.shields.io/badge/Échelle%20de%20qualité-Bronze%20(auto--déclaré)-cd7f32.svg)](custom_components/weekly_planner/quality_scale.yaml)

Une intégration Home Assistant avec sa carte Lovelace pour planifier les appels de
service et les scènes. Les horaires utilisent des réglages partagés, une fin
facultative et une action par défaut par entité. La découverte repose sur les
métadonnées Home Assistant, sans catalogue de marques ou d’appareils.

Ce README s’adresse aux intégrateurs Home Assistant. Pour les utilisateurs de la
maison : [guide illustré pas à pas](wiki/GUIDE.fr.md) et
[atlas des écrans](wiki/SCREENS.fr.md).

<a href="wiki/SCREENS.fr.md#s01"><img src="wiki/images/guide/s01-overview.png" width="300" alt="Vue d’ensemble de Weekly Planner" /></a>
<a href="wiki/SCREENS.fr.md#s03"><img src="wiki/images/guide/s03-radial.png" width="300" alt="Cadran de 24 heures d’un programme" /></a>

Ce projet a été réalisé avec l’aide d’agents d’intelligence artificielle.

Niveau de qualité : Bronze auto-déclaré sur l’échelle de qualité des intégrations Home Assistant (intégration personnalisée, sans badge officiel) ; voir `custom_components/weekly_planner/quality_scale.yaml`.

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
pas une nouvelle instance de l’intégration. Voir [S36](wiki/SCREENS.fr.md#s36).

## Sources complémentaires du graphique

Dans la fenêtre des horaires, ouvrez **Options du graphique** sous le graphique d’un appareil pour ajouter une entité Home Assistant. Un état numérique
donne une courbe ; les autres états apparaissent sur une bande nommée, avec des cases pour les états à mettre en évidence.
Plusieurs états peuvent être cochés. Les observations inconnues ou indisponibles laissent des interruptions ; aucune donnée
réelle n’est dessinée dans le futur. Les sources suivent le déplacement et le zoom du graphique.

Les choix s’enregistrent automatiquement dans Home Assistant pour ce programme et cet appareil, et sont partagés par ses
cartes et la fenêtre des horaires, indépendamment du jour ou du mode. Replier les options laisse les tracés visibles.
Retirer une source enlève seulement son affichage. Ces options ne commandent jamais un appareil et sont verrouillées en lecture seule.

Les courbes de même unité partagent une échelle. Trois unités différentes au plus : l’échelle principale à gauche et deux à
droite, chacune dans la couleur de sa première courbe. Retirez une source d’une autre unité avant d’ajouter une quatrième unité.
Seul l’état de l’entité complémentaire est lu ; ses attributs ne sont pas proposés comme sources numériques.

## Configuration de la carte

L’éditeur distingue deux portées :

- **Affichage de la carte** : titre, programme ou filtres, vue et visibilité du graphique. Le bouton Enregistrer de Lovelace conserve ces choix pour cette carte.
- **Réglages des programmes** : données partagées par toutes les cartes. **Appliquer au programme** enregistre immédiatement dans l’intégration. Annuler ensuite l’éditeur Lovelace ne revient pas sur cet enregistrement. Cette section est réservée aux administrateurs.

Les brouillons et leur historique Annuler/Rétablir sont conservés entre les onglets
et les programmes pendant l’édition. Fermer l’éditeur abandonne les modifications
non appliquées. L’historique repart à zéro après un enregistrement réussi ; il ne
rappelle pas une commande déjà envoyée à un appareil. Un programme nouvellement
créé est sélectionné automatiquement et **Définir les horaires** ouvre ses horaires.

Un programme avec vue d’ensemble radiale :

```yaml
type: custom:weekly-planner-card
program: YOUR_PROGRAM_ID
title: Salon
schedule_view: radial
show_chart: true
```

La journée d’aujourd’hui en liste d’horaires :

```yaml
type: custom:weekly-planner-card
program: ID_DU_PROGRAMME
schedule_view: times
```

La semaine et le graphique sous chaque appareil restent en barres. Un ancien fichier de la carte qui ne connaît pas `times` affiche des barres.

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
| `type` | `custom:weekly-planner-card`. |
| `program` | Identifiant interne existant, ou nom de programme (voir ci-dessous). Une valeur non vide affiche ce programme au lieu d’appliquer les filtres. |
| `filter.types` | Domaines d’entités présents dans les programmes. Absent ou vide = tous les domaines. Les domaines inconnus restent utilisables. |
| `filter.area` | Correspondance exacte avec la pièce du programme, définie dans Général. Les pièces HA des appareils ne sont pas déduites. |
| `filter.programs` | Liste facultative d’identifiants ou de noms de programmes (voir ci-dessous), croisée avec les autres filtres. Absent = tous, futurs compris ; `[]` = aucun. |
| `title` | Titre facultatif. |
| `schedule_view` | `bars` par défaut, `list`, `radial` pour 24 h, `radial_12h` pour deux cercles de 12 h, ou `times` (**Horaires du jour** : la journée d’aujourd’hui en liste, une ligne par période avec son réglage, sa fin et un repère « Maintenant » ; le bouton « Modifier la journée », ou un appui sur une ligne, ouvre la journée dans la fenêtre des horaires). Disponibles pour un programme ou une liste filtrée. |
| `sort` | Ordre de la liste : `type` (défaut : par type A→Z puis par nom ; types nommés par Home Assistant, avec un petit titre chacun), `area` (par pièce A→Z avec titres, programmes sans pièce sous « Autres »), `name` (A→Z) ou `custom` (la liste `order`). Le premier appareil d’un programme donne son type. |
| `order` | Avec `sort: custom` : identifiants de programmes dans l’ordre voulu. Réglé dans l’éditeur (poignée ou boutons monter/descendre). Un programme absent de la liste passe à la fin (par type puis nom) ; un identifiant inconnu est ignoré. |
| Format de l’heure | Pas d’option : la carte suit le réglage 12 h ou 24 h de votre profil Home Assistant (12 h affiche am/pm, « minuit » et « midi » ; les champs d’heure de l’éditeur de créneau affichent l’heure choisie, par exemple « = 10:30 pm », en dessous). |
| `show_chart` | Booléen, `true` par défaut. Actif : un bouton **Graphique du jour** sous chaque appareil sur la carte, et le graphique dans la fenêtre des horaires. Éteint : ni bouton ni graphique nulle part sur cette carte. Dans l’éditeur : « Bouton Graphique sous chaque appareil ». |
| `chart_collapsed` | Booléen, `true` par défaut : le graphique sous chaque appareil démarre fermé (`false` : ouvert). N’a d’effet que si `show_chart` est actif. Dans l’éditeur : l’interrupteur « Graphique ouvert d’office » (l’inverse). Un choix fait avec le bouton du graphique est mémorisé par navigateur, par carte et par appareil, et prime ensuite. |

**Référence YAML.** Toutes les options de l’éditeur visuel se règlent aussi dans l’éditeur de code YAML,
avec le même effet ; passer de l’un à l’autre conserve toutes les clés (même inconnues). Types : `title`,
`program`, `filter.area` = texte ; `filter.types` et `filter.programs` = listes de textes (un texte seul
vaut une liste d’un élément) ; `schedule_view` = `bars`, `list`, `radial`, `radial_12h` ou `times` ; `sort` = `type`, `area`, `name` ou `custom` ; `order` = liste de textes ; `show_chart` et
`chart_collapsed` = booléens. Une valeur du mauvais type est ignorée et la valeur par défaut s’applique ;
une configuration qui n’est pas un mapping YAML affiche une carte d’erreur explicite. Dans l’éditeur
visuel, les interrupteurs de type et de programme écrivent `filter.programs` (et ne font qu’élargir, ou
enlever pour un type vide, `filter.types`) : une configuration YAML avec seulement `filter.types` continue
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
schedule_view: bars             # bars | list | radial | radial_12h | times
sort: type                      # type | area | name | custom (défaut type)
order: []                       # identifiants de programmes, si sort vaut custom
show_chart: true                # défaut true
chart_collapsed: true           # défaut true (replié)
filter:                         # ignoré si `program` est renseigné
  types: [climate, cover]       # défaut : tous
  area: Salon                   # défaut : toutes les pièces
  programs: [ID1, Bureau]          # défaut : tous (futurs compris)
```

Un identifiant de programme est généré par l’intégration : ce n’est ni son nom ni
un nom simplifié. Le trouver dans l’attribut `program_id` de son interrupteur ou
dans la réponse WebSocket `weekly_planner/get`. Remplacer `YOUR_PROGRAM_ID` dans
l’exemple. Les identifiants d’entités dépendent aussi de la langue et des renommages.

Le filtre Pièce propose les pièces existantes et conserve un choix devenu absent.
Définir cette pièce dans **Réglages des programmes → Général** : c’est un nom pour
regrouper les programmes, indépendant des pièces des appareils.

Les cadrans partagent les couleurs, repères horaires et marqueurs solaires des
barres. Le double cadran affiche minuit–midi à l’intérieur et midi–minuit à
l’extérieur. Un clic ou un appui long sur un cadran permet de modifier ses arcs avec les poignées.
En liste compacte, toucher une ligne déplie sa barre. La semaine se déplie à la
demande. Une modale a un bouton **Agrandir / réduire** (flèches, à côté de la croix)
qui élargit sa largeur sur ordinateur ; sur téléphone elle occupe déjà l’écran et
un balayage vers le bas sur son en-tête la ferme.

## Modèle et exécution

Dans l’interface, « appareil » désigne une entité HA, pas un identifiant du registre
des appareils. Un programme peut en contenir plusieurs.

| Objet | Sens |
|---|---|
| Programme | Entités, priorité, conditions, réapplication et une semaine d’horaires par mode. |
| Réglage | Nom, couleur et action partagés globalement. |
| Horaire | Début, fin facultative, jours, référence de réglage et, au besoin, les appareils visés (`entities` ; absent = tous les appareils du programme, y compris ceux ajoutés plus tard). |
| Défaut d’entité | `default_label`, appliqué hors des horaires bornés selon les règles de priorité. |
| Valeur propre | `label_overrides[label_id]`, action propre à cette entité dans ce programme. |
| Mode | L’état de toute la maison (Maison, Absent, Vacances…), le même pour tous les programmes et choisi en dehors de Weekly Planner. Chaque programme a sa propre semaine d’horaires pour chaque mode ; Vacances est un mode ordinaire. Appareils, défauts, conditions et priorité restent communs. |

Deux horaires d’un programme ne peuvent se chevaucher que s’ils visent des
appareils différents. Chaque appareil n’exécute que les horaires qui le visent ;
enregistrer un programme ne renvoie une action qu’aux appareils dont le réglage
en cours ou la cible a changé.

Le moteur recalcule l’action voulue et agit aux transitions. Il ne force pas en
continu l’état observé et ne détecte pas les réglages manuels pour les corriger.
Leur affichage dans le graphique ne modifie pas cette règle.

- **Avec fin** : action au début, puis défaut éligible ou action du programme qui reprend la main à la fin.
- **Sans fin** : action ponctuelle, aucun événement de fin, jamais rejouée après son heure. Un horaire borné prioritaire peut la supprimer.
- **Priorité** : le plus petit numéro gagne entre les horaires éligibles actifs ; le programme le plus ancien départage les égalités. Sans horaire actif, le programme activé le plus prioritaire contenant l’entité fournit son défaut facultatif.
- **Conditions** : toutes les conditions du programme doivent être satisfaites pour ses horaires. Une condition fausse n’est pas une commande d’arrêt générique ; les règles des défauts comptent encore.
- **Redémarrage** : stabilisation de 30 s, puis réapplication facultative de l’action bornée ou du défaut en cours. Les fins manquées sont rattrapées, pas les actions ponctuelles passées.
- **Temps** : construction en heure locale HA, comparaisons en UTC. Un horaire passe au lendemain si sa fin est antérieure au début **et avant midi**. `24:00` est accepté en fin.
- **Soleil** : le modèle accepte aube, lever, coucher, crépuscule, décalages et bornes. Le formulaire actuel expose lever et coucher avec décalages et des limites facultatives (au plus tôt / au plus tard), sous **Options avancées**.

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
actions à cette liste. Les listes vides ou absentes sans le drapeau
`restrict_services` restent sans restriction. Les scènes sont distinctes de ce
filtre. Les champs incompatibles et services demandant du texte ou un objet brut
sont masqués. Les presets viennent des attributs de l’entité, sans modes de marque
inventés.

Pour appeler un bouton qui déplace un volet vers son favori enregistré, choisir
**Une autre entité** (sous **Options avancées** de l’éditeur d’action) comme cible de l’action :

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

## Modes et sélecteur de mode

Le mode est global : une entité Home Assistant `input_select` ou `select`, facultative, choisie une seule fois dans
**Paramètres → Appareils et services → Weekly Planner → Configurer → Sélecteur de mode**, donne le mode actif de
tous les programmes. Ses options sont les modes ; un **mode par défaut** (une des options) est demandé juste après.
Weekly Planner ne fait que la lire et ne la modifie jamais. Vide : un seul mode, le mode par défaut, que la carte
n’affiche pas.

- **Rattachement par le nom** : les horaires d’un programme appartiennent au mode qui porte le même nom qu’une option.
- **Sélecteur indisponible ou état inconnu** : le dernier mode valide est gardé ; sans mode connu, le mode par
  défaut s’applique. Un programme sans horaires pour le mode actif applique « le reste du temps ».
- **Option renommée** : si une seule option est renommée, les horaires la suivent dans tous les programmes (avec
  un bouton pour défaire pendant une semaine). Sinon l’ancien mode reste, marqué « n’existe plus », rien n’est effacé et
  l’écran des horaires propose les nouvelles options (ou la suppression du mode). L’avis de renommage
  (boutons **Annuler** et **OK**) n’apparaît que dans l’écran des horaires.
- **Écran des horaires** : une liste **Mode** en haut, ouverte sur le mode actif (marqué « Actif ») ; modifier un autre mode ne l’active jamais.
  Sous **Options avancées**, « Reprendre les horaires d’un autre mode » recopie ses horaires, et
  « Mêmes horaires que » fait suivre un autre mode : il utilise alors les horaires de ce mode, qui restent
  partagés (modifier l’un change les deux), jusqu’à **Arrêter de suivre** (le mode garde une copie).
- **Changer de mode** = changer l’entité sélecteur (tableau de bord, alarme, automatisation). L’interrupteur global
  **Suspension de tous les programmes** est une commande distincte et l’emporte sur le mode.

```yaml
# Passer la maison en mode Absent (utiliser votre sélecteur et le nom exact d’une option)
action: input_select.select_option
target:
  entity_id: input_select.house_mode
data:
  option: Absent
```

Voir les [exemples de modes](wiki/MODES_COOKBOOK.fr.md) et les
[exemples d’actions natives](wiki/GENERIC_ACTIONS.md).

## Entités et services HA

L’intégration crée un interrupteur global de suspension, et un interrupteur
par programme. Il n’y a pas de `select` de mode : le mode vient de votre sélecteur. Inspecter le registre réel : ne pas supposer
un identifiant anglais généré sur une autre installation.

| Entité | Comportement |
|---|---|
| Interrupteur de programme | Active ou suspend. Attributs : `program_id`, `no_schedule_for_mode`, `current_slots`, `next_change`, `skip_next`, `skip_next_targets`, `next_actions` et, selon le cas, `paused_until` et `verification`. Il n’y a pas d’attribut du mode actif : le mode se lit sur l’entité sélecteur. |
| Interrupteur global | Suspend les programmes et applique une fois les défauts éligibles. |

| Action | Champs | Qui peut l’appeler |
|---|---|---|
| `weekly_planner.apply_now` | `program_id` (obligatoire) ; renvoie `sent` et `skipped` (avec la raison) ; renvoie aussi le dernier ponctuel de moins de 24 h sauf intervention d'une personne depuis | Tout le monde ; administrateurs seulement si `admin_only` est actif |
| `weekly_planner.skip_next` | `program_id` (obligatoire), `cancel` (facultatif, `false` par défaut) | Comme `apply_now` |
| `weekly_planner.pause` | `program_id` (obligatoire), `days` et/ou `hours` (entiers, au moins un ; de 1 heure à 365 jours au total) | Comme `apply_now` |
| `weekly_planner.resume` | `program_id` (obligatoire) ; annule seulement une pause temporisée (un programme arrêté avec son interrupteur reste arrêté) | Comme `apply_now` |
| `weekly_planner.reload` | aucun | Administrateurs |

`program_id` est l’attribut `program_id` de l’interrupteur du programme.

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
# Mettre un programme en pause de 1 heure à 365 jours (`days`, `hours` ou les deux) ; il reprend tout seul (même après un redémarrage)
action: weekly_planner.pause
data:
  program_id: YOUR_PROGRAM_ID
  days: 7
```

```yaml
# Reprendre tout de suite un programme en pause
action: weekly_planner.resume
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Recharger l’intégration et enregistrer le bundle courant
action: weekly_planner.reload
```

Les interrupteurs utilisent `switch.turn_on` et `switch.turn_off`. Planifier
`automation.turn_on` active les déclencheurs d’une automatisation ; ce n’est pas
`automation.trigger`.

## Permissions et options

**Paramètres → Appareils et services → Weekly Planner → Configurer** :

| Option | Défaut | Comportement actuel |
|---|---|---|
| `admin_only` | `false` | Limite les modifications des programmes et réglages. Les interrupteurs restent des commandes séparées ; le mode se choisit sur l’entité sélecteur, pas dans Weekly Planner. |
| `mode_selector` | aucun | Entité `input_select` ou `select` facultative dont l’état est le mode actif, puis un mode par défaut parmi ses options. Réservé aux administrateurs. |
| `reapply_default` | `true` | Valeur de départ de **Réappliquer** pour tout nouveau programme (carte, WebSocket, programme d’un fichier YAML sans `reapply`). |
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
fichiers à chaud. Une copie des fichiers précédents est conservée ; une corruption
ne doit pas remplacer silencieusement les données par une configuration vide.

La carte suit `weekly_planner/subscribe`. `card_version` identifie le bundle ; une
carte obsolète se recharge automatiquement lorsqu’elle est inactive. Pour un
client tiers, [websocket.py](custom_components/weekly_planner/websocket.py) fait foi :

| Commandes | But |
|---|---|
| `weekly_planner/get`, `weekly_planner/subscribe` | État initial et mises à jour. |
| `weekly_planner/program/save`, `program/delete`, `program/set_enabled`, `program/pause`, `program/mode_follow` | Mutations de programme ; tous les suffixes sont sous `weekly_planner/`. |
| `weekly_planner/mode/set`, `mode/resolve`, `mode/undo_rename`, `mode/dismiss_rename` | Réponses sur les modes et avis de renommage. |
| `weekly_planner/label/save`, `label/delete` | Réglages globaux. |
| `weekly_planner/preview` | Résoudre les occurrences d’un programme (pour un mode) pour une date. |
| `weekly_planner/journal` | Décisions enregistrées, jusqu’à 14 jours. |

Une modification porte la `revision` courante ; une révision obsolète provoque
`conflict`. La carte reconstruit l’écriture sur des données fraîches et retente
une fois. Les réglages sont fusionnés avec leur base de brouillon pour préserver
les horaires modifiés ailleurs. Un conflit sur le même réglage est signalé plutôt
qu’écrasé. Aucune action ne change le mode : changer l’entité sélecteur.

## Fichier YAML

Les programmes peuvent aussi se modifier comme du texte. Weekly Planner garde une copie de sa
configuration (vacances, sélecteur de mode, réglages et programmes, sans l'état d'exécution) dans
`/config/www/weekly_planner.yml`. Les données `.storage` restent la référence pendant que Home
Assistant tourne ; le fichier est une copie lisible que vous pouvez modifier.

```yaml
version: 1
vacation: false
mode_selector: input_select.house_mode   # null = un seul mode
default_mode: Maison                     # une option du sélecteur
labels:
  - id: comfort
    name: Confort
    color: "#ff9800"
    action: {kind: service, service: climate.set_temperature, data: {temperature: 21}}
programs:
  - id: living
    name: Salon
    entities: [{entity_id: climate.living, default_label: comfort, label_overrides: {}}]
    modes:            # les horaires de chaque mode, rangés par nom de mode
      Maison: {mon: [...], tue: [...]}   # 7 listes de jours ; le premier mode est celui utilisé sans sélecteur
```

- **Modification dans la carte** : le fichier est écrit environ 2 secondes après l'enregistrement
  (et créé au démarrage s'il manque). Commentaires et ordre sont réécrits à chaque fois. Supprimer le
  fichier le recrée.
- **Modification à la main** : un fichier modifié est relu dans les 30 secondes, au démarrage et par
  l'action `weekly_planner.reload`. Il est validé avec les mêmes règles que la carte ; seul un fichier
  entièrement valide remplace les programmes, réglages et l'état vacances (un programme absent du
  fichier est supprimé).
- **Fichier invalide** (syntaxe, réglage inconnu, chevauchement, fichier vide...) : rien ne change, le
  fichier n'est pas touché et un problème de réparation affiche l'erreur ; il disparaît quand le
  fichier redevient valide. Si vous enregistrez dans la carte entre-temps, le fichier invalide est
  d'abord conservé sous `weekly_planner.yml.invalid`.
- La suppression de l'intégration supprime le fichier.

> **Attention :** `/config/www` est servi **sans authentification** à l'adresse
> `http://<votre-ha>/local/weekly_planner.yml`. Les horaires révèlent quand la maison est occupée ou
> vide. N'exposez pas cette adresse sur Internet (reverse proxy, redirection de port).

## Pour les agents IA

Une version installée contient sa propre documentation pour agents dans `custom_components/weekly_planner/` :
[`AI_GUIDE.md`](custom_components/weekly_planner/AI_GUIDE.md) (découvrir, configurer par le fichier YAML,
vérifier, précautions), [`example.yml`](custom_components/weekly_planner/example.yml) (annoté, validé par
les tests) et `services.yaml`. [`llms.txt`](llms.txt) les indexe pour les agents qui parcourent le web.
Les agents qui travaillent sur ce dépôt lisent [`AGENTS.md`](AGENTS.md).

## Désinstallation

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner**, puis le menu à trois points → **Supprimer**.
   Cela retire les interrupteurs et efface les programmes enregistrés ainsi que le
   fichier `/config/www/weekly_planner.yml` (et ses restes `.invalid` et `.tmp`).
2. Retirer la carte **Weekly Planner** de chaque tableau de bord (modifier le tableau de bord, ouvrir la carte, la supprimer).
   Sans l’intégration, la carte n’affiche plus rien d’utile.
3. Dans **HACS → Intégrations → Weekly Planner → ⋮ → Supprimer**, puis redémarrer Home Assistant.

Où sont les données, pour vérifier ou nettoyer à la main (Home Assistant arrêté, ou intégration retirée du
disque avant son entrée) : les programmes sont dans `/config/.storage/weekly_planner` (avec `weekly_planner.runtime` et `weekly_planner.journal`) et le miroir YAML dans
`/config/www/weekly_planner.yml`. Supprimer ces fichiers ne laisse rien. Les sauvegarder d’abord si une
réinstallation est possible : les remettre en place rétablit les programmes.

## Limites et diagnostic

- Le filtre Pièce vise les métadonnées du programme, pas les pièces HA.
- Le modèle accepte des conditions par horaire, mais le formulaire n’a pas de constructeur de conditions par horaire (les conditions du programme se règlent dans **Général**).
- Limites de validation : nom de programme 60 caractères, de réglage 30, de mode 40 ; 20 modes par programme, 50 horaires par jour, 100 appareils par programme, 10 conditions par horaire ; priorité de 1 à 100 ; décalage solaire de −240 à +240 minutes ; délai aléatoire de 0 à 240 minutes ; 100 états mis en évidence et un nom affiché de 60 caractères au plus par source de graphique.
- L’historique et les changements manuels dépendent de Recorder/logbook ; l’attribution des modifications d’attributs seuls a des limites.

Le graphique distingue historique absent, futur ou indisponible et absence
d’action prévue. Un échec d’historique ne masque pas les prévisions. Une liste vide
invite à vérifier les types, pièces et programmes filtrés. Si une action manque,
vérifier sa cible, les fonctions supportées, les attributs et `allowed_services`.
Utiliser les attributs de l’interrupteur, Repairs, notifications et journaux HA. Réparations créées par l’intégration : `missing_entities`, `yaml_invalid`, `modes_now_global` et `mode_option_missing`. Les notifications persistantes signalent une entité indisponible dont l’action reste en attente, une action qui n’a pas pu être exécutée et un fichier de configuration illisible (programmes en pause, rien n’est écrasé).
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


### Agents de revue (facultatif)

Le projet utilise des agents de revue partagés, gardés dans leur propre dépôt,
[`movrack/AI`](https://github.com/movrack/AI) : `john-117` (chef d’orchestre), `nemesis` (avocat du diable des
specs et des plans), `mamy` (testeur d’écrans novice), `ally` (accessibilité), `stryker` (mutation testing),
`heimdall` (gardien de livraison), `parker` (captures d’écran), `iris` (CSS et cohérence visuelle) et `c3po` (traductions). Ils travaillent sur demande seulement, ne
modifient aucun code de production et écrivent leurs rapports dans `reports/ai/<agent>/` (ignoré par Git). Pour
les utiliser :

```bash
git clone https://github.com/movrack/AI.git ~/Dev/AI
```

Les fichiers d’agents utilisent des noms d’outils neutres (`read`, `search`, `execute`, `edit`,
`mcp:<serveur>/<outil>`) : un simple lien symbolique dans le dossier d’agents de l’assistant ne suffit pas. Il
faut traduire la ligne `tools` vers les noms de l’assistant (pour Claude Code : `Read`, `Grep`/`Glob`, `Bash`,
`Edit`/`Write`, `mcp__<serveur>__<outil>`) et copier le fichier dans `~/.claude/agents/` (tous vos projets) ou
`.claude/agents/` (ce projet seulement), ou les générer avec un script de synchronisation qui fait la traduction.
Le README du dépôt `AI` décrit les deux méthodes (« Install »). `mamy`, `ally` et `parker` demandent le serveur
MCP Chrome DevTools. Ne pas ajouter de copie de ces agents à ce dépôt : les modifier dans `movrack/AI`.

Références : [spécification](docs/SPEC.md), [décisions](docs/DECISIONS.md),
[inventaire des captures](docs/SCREEN_INVENTORY.md),
[journal des modifications](CHANGELOG.md).

## Licence

[MIT](LICENSE)
