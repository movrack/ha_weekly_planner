# Weekly Planner : référence pour intégrateurs

[English](REFERENCE.md) | Français

Référence pour les intégrateurs Home Assistant : options de la carte, modèle et exécution, modes et
jour férié, options de l’intégration, stockage et API, fichier YAML, limites. L’installation, les
entités créées, les actions et la désinstallation sont dans le [README](../README.fr.md).

## Configuration de la carte

L’éditeur distingue deux portées :

- **Affichage de la carte** : titre, programme ou filtres, vue et visibilité du graphique. Le bouton Enregistrer de Lovelace conserve ces choix pour cette carte.
- **Réglages des programmes** : données partagées par toutes les cartes. **Appliquer au programme** enregistre immédiatement dans l’intégration. Annuler ensuite l’éditeur Lovelace ne revient pas sur cet enregistrement. Cette section est réservée aux administrateurs.

Les brouillons et leur historique Annuler/Rétablir sont conservés entre les onglets
et les programmes pendant l’édition. Fermer l’éditeur abandonne les modifications
non appliquées. L’historique repart à zéro après un enregistrement réussi ; il ne
rappelle pas une commande déjà envoyée à un appareil. Un programme nouvellement
créé est sélectionné automatiquement et **Définir les horaires** ouvre ses horaires.

Les exemples de cartes sont dans le [README](../README.fr.md#exemples).

| Option | Comportement |
|---|---|
| `type` | `custom:weekly-planner-card`. |
| `program` | Identifiant interne existant, ou nom de programme (voir ci-dessous). Une valeur non vide affiche ce programme au lieu d’appliquer les filtres. |
| `filter.types` | Domaines d’entités présents dans les programmes. Absent ou vide = tous les domaines. Les domaines inconnus restent utilisables. |
| `filter.area` | Correspondance exacte avec la pièce du programme, définie dans Général. Les pièces HA des appareils ne sont pas déduites. |
| `filter.programs` | Liste facultative d’identifiants ou de noms de programmes (voir ci-dessous), croisée avec les autres filtres. Absent = tous, futurs compris ; `[]` = aucun. |
| `title` | Titre facultatif. |
| `schedule_view` | `bars` par défaut, `list`, `radial` pour 24 h, `radial_12h` pour deux cercles de 12 h, ou `times` (**Horaires du jour** : la journée d’aujourd’hui en liste, une ligne par période avec son réglage, sa fin et un repère « Maintenant » ; l’icône calendrier de l’en-tête, ou un appui sur une ligne, ouvre la journée dans la fenêtre des horaires). Disponibles pour un programme ou une liste filtrée. |
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
- **Soleil** : le modèle accepte aube, lever, coucher, crépuscule, décalages et bornes. Le formulaire actuel expose lever et coucher avec décalages et des limites facultatives (au plus tôt / au plus tard), sous **Options avancées** (le formulaire présente les jours, puis les heures, puis les options avancées).

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

Voir les [exemples de modes](MODES_COOKBOOK.fr.md) et les
[exemples d’actions natives](GENERIC_ACTIONS.md).

### Jour férié

Une entité facultative, une seule pour toute la maison, dit si aujourd’hui est un jour férié ou de congé : un
`binary_sensor`, `input_boolean`, `switch` ou `calendar` (par exemple l’intégration Holiday), choisie par un
administrateur dans **Configurer → Réglages → Mode et jour férié**. Cochez **Cette entité est allumée les jours travaillés, pas les jours fériés** seulement pour un
capteur Workday ; avec ses options par défaut, les week-ends comptent alors aussi comme jours fériés : préférez un
calendrier des jours fériés (intégration Holiday). Les entités de Weekly Planner et celles qu’un programme commande
sont refusées, aussi lors de l’enregistrement d’un programme ou d’un réglage.

- Le mode est prioritaire sur le jour férié. Le jour férié ne s’applique qu’au mode actuel : quand le mode change, le nouveau mode applique son propre réglage de jour férié. (Cette phrase figure dans les options de l’intégration.)
- Chaque mode peut avoir un réglage « Jour férié » : les mêmes horaires qu’un jour de la semaine (lien vivant vers ce
  jour) ou des horaires propres. Un jour férié, il **remplace** le jour de la semaine du mode actif ; un mode sans
  réglage garde son jour normal, et un mode qui en suit un autre utilise le jour férié de sa source. Les priorités ne
  changent pas.
- Un jour férié va de 00:00 à 24:00 : à côté d’un jour férié, les horaires s’arrêtent à minuit. Hier et demain sont
  toujours des jours normaux. **Conséquence :** un horaire de nuit (par exemple « Fermé 21:00 → 07:00 ») est coupé à
  minuit la veille et le lendemain d’un jour férié ; « le reste du temps » (volets ouverts, température de jour) est
  alors envoyé vers 00:00. Donnez au jour férié des horaires propres qui commencent à 00:00 avec le réglage de nuit,
  et vérifiez le réglage du lendemain matin.
- Seul « on » ou « off » compte. Indisponible ou inconnu garde la valeur du jour ; sans valeur connue, le jour est
  normal. Un changement attend 30 secondes (un retour en arrière dans ce délai est ignoré), puis s’applique comme un
  changement de mode. Juste après minuit, les programmes qui ont un réglage attendent l’entité jusqu’à 2 minutes.
- Une entité absente ouvre un problème dans Réparations ; les réglages sont gardés et chaque jour est normal.
- Revenir à la 0.28 ou avant : restaurez `.storage/weekly_planner` depuis la sauvegarde faite avant la mise à jour
  (cette version ne connaît pas le jour férié et refuse d’enregistrer un programme qui en a un).
- **Sur la carte** : quand aujourd’hui est un jour férié qui change un programme, une ligne sous « Mode » dit « Aujourd’hui férié : horaires du dimanche » ou « Aujourd’hui férié : horaires propres » (masquée si le jour copié est le vrai jour). La barre d’aujourd’hui, la ligne d’aujourd’hui de la semaine et la vue Horaires du jour montrent ce qui tourne vraiment ; elles ne se modifient pas directement ce jour-là (utilisez la section **Jour férié** de la fenêtre des horaires ; l’icône calendrier de l’en-tête ouvre toujours la fenêtre). « Ensuite : demain … » ignore un éventuel jour férié demain.
- **Dans la fenêtre des horaires** : une section repliable **Jour férié** sous le schéma de la semaine, fermée par défaut et masquée sans entité, avec un interrupteur *Horaires différents les jours fériés* (désactivé = jour normal, et le réglage reste en mémoire : le réactiver le fait revenir ; activé pour la première fois = horaires du dimanche), puis deux choix : *Mêmes horaires que :* un jour de la semaine, ou *Mes propres horaires* (une journée réglée comme les autres, horaires par appareil permis ; un horaire qui passe minuit est coupé à 24 h). Choisir *Mêmes horaires que :* garde vos propres horaires en mémoire. La section s’affiche pour chaque mode, actif ou non : chaque mode a son propre réglage. Un mode qui en suit un autre montre le jour férié de sa source, en lecture seule.

## Permissions et options

**Paramètres → Appareils et services → Weekly Planner → Configurer** :

| Option | Défaut | Comportement actuel |
|---|---|---|
| `admin_only` | `false` | Limite les modifications des programmes et réglages. Les interrupteurs restent des commandes séparées ; le mode se choisit sur l’entité sélecteur, pas dans Weekly Planner. |
| `mode_selector` | aucun | Dans la sous-section **Mode et jour férié** du formulaire. Entité `input_select` ou `select` facultative dont l’état est le mode actif, puis un mode par défaut parmi ses options. Réservé aux administrateurs. |
| `holiday_entity`, `holiday_invert` | aucune, `false` | Dans la même sous-section **Mode et jour férié** (le mode est prioritaire sur le jour férié, qui ne s’applique qu’au mode actuel). Entité jour férié facultative de la maison et la case « Cette entité est allumée les jours travaillés, pas les jours fériés ». Réservé aux administrateurs ; rangé avec le sélecteur de mode, pas dans les options de l’entrée. |
| `reapply_default` | `true` | Valeur de départ de **Réappliquer** pour tout nouveau programme (carte, WebSocket, programme d’un fichier YAML sans `reapply`). |
| `notify_delay_min` | `30` | Notification d’entité indisponible, 1 à 1440 minutes. |
| `debounce_min` | `2` | Délai de stabilité des conditions, 0 à 60 minutes. |

Les actions sensibles sont protégées côté serveur indépendamment de `admin_only`
(voir [actions.py](../custom_components/weekly_planner/actions.py)). Les réglages
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
client tiers, [websocket.py](../custom_components/weekly_planner/websocket.py) fait foi :

| Commandes | But |
|---|---|
| `weekly_planner/get`, `weekly_planner/subscribe` | État initial et mises à jour. |
| `weekly_planner/program/save`, `program/delete`, `program/set_enabled`, `program/pause`, `program/mode_follow`, `program/holiday` | Mutations de programme ; tous les suffixes sont sous `weekly_planner/`. `program/holiday` règle (`{copy: 0..6}` ou `{day: [...]}`, avec `off: true` facultatif qui garde le réglage sans l’appliquer, et `day` facultatif à côté de `copy` pour des horaires propres gardés en mémoire) ou efface (`null`) le jour férié d’un mode ; un profil enregistré sans `holiday` le garde. |
| `weekly_planner/mode/set`, `mode/resolve`, `mode/undo_rename`, `mode/dismiss_rename` | Réponses sur les modes et avis de renommage. |
| `weekly_planner/label/save`, `label/delete` | Réglages globaux. |
| `weekly_planner/preview` | Résoudre les occurrences d’un programme (pour un mode) pour une date ; `holiday` dit si cette date est le jour férié d’aujourd’hui. L’instantané porte `holiday_entity`, `holiday_invert` et `holiday_today`. |
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
holiday_entity: binary_sensor.workday    # null = pas de jour férié
holiday_invert: true                     # l’entité est « on » un jour travaillé
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
      Maison: {mon: [...], tue: [...], holiday: {copy: sun}}   # 7 listes de jours ; holiday : {copy: <jour>} ou {day: [...]}, off: true facultatif (gardé, non appliqué)
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
- Un fichier sans `holiday_entity` ou `holiday_invert` laisse ces réglages tels quels. Un mode sans `holiday` n’a
  pas de réglage « Jour férié » ; un mode avec `follows` ne peut pas en avoir.
- La suppression de l'intégration supprime le fichier.

> **Attention :** `/config/www` est servi **sans authentification** à l'adresse
> `http://<votre-ha>/local/weekly_planner.yml`. Les horaires, y compris ceux des jours fériés, révèlent
> quand la maison est occupée ou vide. N'exposez pas cette adresse sur Internet (reverse proxy, redirection de port).

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
