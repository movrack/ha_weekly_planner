Français

# Configuration

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Cette page est la référence des réglages : chaque option est décrite **ici, une seule fois**. Pour la faire
pas à pas, les pages du [Guide](GUIDE.fr.md) disent comment.

Sur cette page : [Options de la carte](#options-de-la-carte) ·
[Réglages de l’intégration](#réglages-de-lintégration) · [Le sélecteur de mode](#le-sélecteur-de-mode) ·
[Qui peut modifier quoi](#qui-peut-modifier-quoi) · [Le fichier de configuration YAML](#le-fichier-de-configuration-yaml) ·
[Sauvegarde et restauration](#sauvegarde-et-restauration) · [Où trouver l’identifiant d’un programme](#où-trouver-lidentifiant-dun-programme).

## Options de la carte

Elles ne changent que **ce que cette carte montre** : les programmes, leurs réglages et leurs horaires se
modifient dans le panneau **Weekly Planner** et sont communs à toutes les cartes
([La fiche du programme](REGLAGES.fr.md#la-fiche-du-programme-et-sa-pièce)). Chaque option se règle dans
l’éditeur visuel de la carte ([Changer la présentation](GUIDE_PRESENTATION.fr.md) dit comment l’ouvrir) ou dans
l’éditeur de code YAML, avec le même effet. On peut passer de l’un à l’autre : les clés que la carte ne connaît pas
sont ignorées mais conservées.

| Option YAML | Dans l’éditeur | Défaut | Ce que ça fait |
|---|---|---|---|
| `type` | | | Toujours `custom:weekly-planner-card`. |
| `title` | **Titre** | aucun | Un titre facultatif au-dessus de la carte. |
| `program` | | aucun | Un identifiant ou un nom de programme. Non vide : la carte montre ce programme seul et ignore `filter`. |
| `filter.programs` | **Programmes à afficher** : **Tous les programmes** et la liste **Programmes** | tous, ceux créés plus tard aussi | Liste d’identifiants ou de noms de programmes. Absente : tous. `[]` : aucun. |
| `filter.types` | **Type** | tous | Les types d’appareils (`climate`, `cover`, `light`…). Absent ou vide : tous. |
| `filter.area` | **Pièce** | toutes | Une pièce (un texte) ou plusieurs (une liste). |
| `schedule_view` | **Affichage d’un programme** / **Affichage de plusieurs programmes** | `bars` | `bars` (Barres), `radial` (Cadran 24 heures), `radial_12h` (Double cadran 12 heures), `times` (Horaires du jour), `list` (Liste compacte), `compare` (Comparateur) : [La carte](CARTE.fr.md#les-affichages). |
| `sort` | **Ordre de la liste** | `type` | `type` (Type puis A→Z), `area` (Pièce puis A→Z), `name` (Nom A→Z) ou `custom` (Personnalisé). |
| `order` | **Ordre personnalisé** | vide | Avec `sort: custom` : les identifiants des programmes dans l’ordre voulu. Un programme qui n’y est pas passe à la fin ; un identifiant inconnu est ignoré. |
| `show_schedule_list` | **Afficher les horaires** | `false` | Ajoute sous les barres, le cadran 24 heures et le double cadran la liste des horaires d’aujourd’hui. Sans effet pour les autres affichages. |
| `show_week_button` | **Bouton Semaine** | `true` | Le bouton **Semaine** sous chaque appareil. Éteint, la semaine reste dans la fenêtre des horaires. |
| `week_collapsed` | **Semaine ouverte par défaut** (l’inverse) | `true` | `true` : la semaine démarre repliée ; `false` : ouverte. Sans effet si le bouton Semaine est éteint. |
| `show_chart` | **Bouton Graphique** | `true` | Le bouton **Graphique du jour** sous chaque appareil. Éteint : ni bouton ni graphique sur cette carte. |
| `chart_collapsed` | **Graphique ouvert par défaut** (l’inverse) | `true` | `true` : le graphique démarre fermé ; `false` : ouvert. Sans effet si le bouton Graphique est éteint. |
| `chart_epoch`, `week_epoch` | | | Écrites par l’éditeur à chaque changement de **Graphique ouvert par défaut** ou **Semaine ouverte par défaut**. Ne pas les modifier à la main. |

Détails utiles :

- **Le choix de chacun l’emporte.** Quand quelqu’un ouvre ou ferme la semaine ou le graphique d’un appareil avec
  son bouton, son navigateur s’en souvient, pour cette carte et cet appareil. Quand vous changez **Graphique ouvert
  par défaut** ou **Semaine ouverte par défaut** dans l’éditeur, le nouveau choix vaut pour tous les appareils, même
  ceux qui avaient été ouverts ou fermés avant.
- **Le format de l’heure** n’est pas une option de la carte : elle suit le réglage 12 h ou 24 h de votre profil Home
  Assistant ([Changer la présentation](GUIDE_PRESENTATION.fr.md#le-format-de-lheure)).
- **La pièce** est le nom donné au programme, pas la pièce de ses appareils. Les écritures d’une même pièce sont
  regroupées (majuscules, accents, `_` et `-` ignorés) : `bureau`, `Bureau` et `chambre_celine_manu` s’affichent
  **Bureau** et **Chambre Céline Manu**. Un texte qui est l’identifiant ou le nom d’une pièce de Home Assistant
  affiche le nom de cette pièce.
- **Un nom à la place d’un identifiant.** `program` et `filter.programs` acceptent le nom du programme. Un
  identifiant exact est prioritaire ; sinon le nom est comparé sans tenir compte des majuscules, des accents ni des
  espaces autour, et tous les programmes de ce nom sont montrés. Une entrée sans correspondance est ignorée.
  Renommer un programme casse une liste écrite avec son nom ; l’éditeur visuel réécrit alors la sélection en
  identifiants, qui ne changent pas.
- **Valeur invalide.** Une valeur du mauvais type est ignorée et la valeur par défaut s’applique. Une
  configuration qui n’est pas une suite de « clé : valeur » affiche une carte d’erreur qui le dit.
- **YAML et éditeur.** Les listes d’un seul élément peuvent s’écrire comme un texte (`area: Salon`). L’éditeur
  visuel écrit `filter.programs` ; une liste écrite par lui n’ajoute pas les programmes créés plus tard : pour cela,
  laisser **Tous les programmes** allumé (ou ne pas écrire `filter.programs`).
- **Affichage et nombre de programmes.** L’éditeur propose **Barres**, **Cadran 24 heures**, **Double cadran 12
  heures** et **Horaires du jour** pour un seul programme, **Liste compacte** et **Comparateur** pour plusieurs.
  Le YAML accepte les six pour n’importe quelle sélection.

Exemples réels de cartes :

```yaml
# Une tablette dans l’entrée : tous les volets de la maison, un jour à la fois
type: custom:weekly-planner-card
title: Volets
schedule_view: compare
filter:
  types: [cover]
```

```yaml
# Le chauffage de la chambre des enfants, en cadran, avec la liste des horaires d’aujourd’hui
type: custom:weekly-planner-card
program: Chauffage chambres enfants
schedule_view: radial
show_schedule_list: true
```

```yaml
# Le tableau de bord du rez-de-chaussée : les programmes du salon et de la cuisine, rangés par nom
type: custom:weekly-planner-card
title: Rez-de-chaussée
sort: name
filter:
  area: [Salon, Cuisine]
```

Les courbes ajoutées au graphique d’un appareil ne se règlent pas dans la carte : elles se choisissent dans la
fenêtre des horaires, **Options du graphique**, et sont enregistrées pour le programme et l’appareil
([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md#comparer-avec-une-autre-entité)).

## Réglages de l’intégration

**Paramètres → Appareils et services → Weekly Planner → Configurer** ouvre un menu : **Réglages** et **Renvoyer
l’état aux appareils** ([Après une panne](GUIDE_APRES_PANNE.fr.md)), avec en tête le lien vers le panneau
**Weekly Planner**. Cet écran est réservé aux administrateurs de Home Assistant. **Réglages** contient :

<!-- CAPTURE: config-options-integration | La fenêtre Réglages de l’intégration : les cinq premiers réglages et la section « Mode et jour férié » | 1440 ; démo : instance de démonstration, un sélecteur de mode choisi -->

| Réglage | Défaut | Ce que ça fait |
|---|---|---|
| **Seuls les administrateurs peuvent modifier les programmes** | éteint | Les autres personnes voient **Lecture seule** ([Qui peut modifier quoi](#qui-peut-modifier-quoi)). |
| **Renvoyer le réglage en cours après un redémarrage ou un changement (valeur par défaut des nouveaux programmes)** | coché | Donne la valeur de départ de la case de la fiche de chaque **nouveau** programme ; les programmes existants ne changent pas ([Renvoyer, vérifier, réessayer](REGLAGES.fr.md#renvoyer-vérifier-réessayer)). |
| **Afficher le lien Weekly Planner dans la barre latérale** | coché | Décoché, le lien de la barre latérale disparaît. Le panneau reste ouvert depuis le lien en tête du menu de l’intégration. |
| **Alerte si un appareil est indisponible depuis** | 30 min | De 1 à 1440 minutes. Au-delà, une notification dit que l’action planifiée attend ; le réglage est renvoyé tout seul au retour de l’appareil. |
| **Attendre avant d’appliquer un changement de condition** | 2 min | De 0 à 60 minutes (0 : tout de suite). Quand une condition d’un programme change, Weekly Planner attend ce délai pour ignorer les oscillations brèves. |
| **Mode et jour férié → Sélecteur de mode (facultatif)** | aucun | Voir [Le sélecteur de mode](#le-sélecteur-de-mode). Après l’avoir choisi, l’écran demande le **Mode par défaut**. |
| **Mode et jour férié → Jour férié ou congé (facultatif)** | aucun | Une entité de la maison, `binary_sensor`, `input_boolean`, `switch` ou `calendar`, allumée un jour férié ou de congé ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)). Les entités de Weekly Planner et celles qu’un programme commande sont refusées. |
| **Mode et jour férié → Cette entité est allumée les jours travaillés, pas les jours fériés** | décoché | À cocher seulement pour un capteur Jour ouvré ; avec lui, les week-ends comptent aussi comme jours fériés : un calendrier des jours fériés convient mieux. |

Le mode est prioritaire sur le jour férié, qui ne s’applique qu’au mode actuel : quand le mode change, le nouveau
mode applique son propre réglage de jour férié.

## Le sélecteur de mode

Le mode de toute la maison est l’état d’**une** entité `input_select` ou `select` que vous avez déjà ou que vous
créez ([Avant une recette avec les modes](RECETTES.fr.md#avant-une-recette-avec-les-modes)). Les étapes pour la
choisir sont dans [Des horaires selon le mode](GUIDE_MODES.fr.md). Ce qu’il faut savoir :

- **Weekly Planner ne fait que lire le sélecteur.** Il ne le change jamais et n’a aucune action pour changer de
  mode : pour changer de mode, changer le sélecteur (un bouton du tableau de bord, une alarme, une
  automatisation). Sans sélecteur, il y a un seul mode, le mode par défaut, que la carte n’affiche pas.
- **Les noms doivent être identiques.** Les horaires d’un programme appartiennent au mode qui porte **le même nom**
  qu’une option du sélecteur, lettre pour lettre.
- **Sélecteur indisponible ou état inconnu :** le dernier mode valide reste actif. Si aucun mode valide n’a jamais
  été connu, le **Mode par défaut** s’applique. Il reçoit aussi les horaires d’un programme qui n’avait qu’une seule
  semaine avant le choix d’un sélecteur.
- **Un changement de mode** recalcule le réglage de l’heure courante. Il ne rejoue pas le passé, ne remet pas en
  marche un programme en pause et ne contourne pas ses conditions. La **Suspension de tous les programmes** passe
  avant le mode.
- **Une option renommée ou supprimée :** [Modes, lecture seule et limites](REGLAGES.fr.md#modes-lecture-seule-et-limites).

Passer la maison en mode Absent, dans une automatisation ou un script (avec votre sélecteur et le nom exact d’une
option) :

```yaml
action: input_select.select_option
target:
  entity_id: input_select.mode_maison
data:
  option: Absent
```

Des automatisations complètes (capteur Jour ouvré, vacances scolaires, maison vide) sont dans les
[Recettes](RECETTES.fr.md).

## Qui peut modifier quoi

- **Par défaut**, toute personne qui utilise Home Assistant peut créer et modifier des programmes, des réglages et
  des horaires. Avec **Seuls les administrateurs peuvent modifier les programmes** coché, les autres personnes
  voient **Lecture seule** : les boutons restent affichés, grisés, avec la raison écrite.
- **Des droits qui restent ceux de Home Assistant.** Weekly Planner n’en ajoute aucun : on ne peut enregistrer une
  action que si son propre compte pourrait faire ce même appel (contrôle des appareils visés, pas de service réservé
  aux administrateurs pour quelqu’un qui n’en est pas un). Sinon : « Vos droits Home Assistant ne permettent pas
  cette action. »
- **Réservé aux administrateurs, toujours :** l’écran **Configurer** (choix du sélecteur de mode et de l’entité de
  jour férié) et le service **Recharger**.
- **Les interrupteurs** (un par programme et **Suspension de tous les programmes**) sont des interrupteurs ordinaires de
  Home Assistant, avec les droits habituels.
- **Le mode** se change sur le sélecteur, avec ses droits à lui, pas dans Weekly Planner.
- **Les services** `weekly_planner.…` ([Entités et services](ENTITES_SERVICES.fr.md#services-pour-vos-automatisations)) sont ouverts à tous ;
  avec la case cochée, seulement aux administrateurs, sauf pour une automatisation ou un script, qui passent toujours.
- Les sources du graphique ([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md)) se consultent mais ne se
  modifient pas en **Lecture seule**.

## Le fichier de configuration YAML

Weekly Planner garde une copie lisible de ses réglages dans **`/config/www/weekly_planner.yml`** : le mode et le jour
férié, les réglages et les programmes avec leurs horaires par mode (pas l’état en cours). Pendant que Home Assistant
tourne, ce sont ses propres données qui font foi ; le fichier est une copie que vous pouvez aussi modifier.

Exemple réel : régler le confort à 20 °C pour tous les programmes en un seul endroit. Dans le fichier :

```yaml
labels:
  - id: comfort
    name: Confort
    color: "#ff9800"
    action: {kind: service, service: climate.set_temperature, data: {temperature: 20}}
```

- **Quand le fichier est écrit.** Environ 2 secondes après chaque enregistrement dans l’interface, et à
  l’installation. Il est réécrit à chaque fois : vos commentaires et l’ordre des lignes ne sont pas conservés.
  Supprimé, il est recréé.
- **Quand il est relu.** Dans les 30 secondes qui suivent un changement fait à la main, au démarrage et quand on lance
  le service **Recharger**. Il est contrôlé avec les mêmes règles que l’interface ; seul un fichier **entièrement
  valide** remplace les programmes et les réglages. Un programme absent du fichier est supprimé.
- **Fichier invalide** (syntaxe, réglage inconnu, horaires qui se chevauchent, fichier vide…) : rien ne change, le
  fichier n’est pas touché, et une réparation « Weekly Planner : fichier YAML ignoré » dit l’erreur ; elle disparaît
  quand le fichier redevient valide. Si vous enregistrez dans l’interface entre-temps, le fichier invalide est
  d’abord gardé sous `weekly_planner.yml.invalid`.
- **Le nom `vacation`.** La clé `vacation: false` du fichier est l’état de la **Suspension de tous les programmes**
  (`true` : tous les programmes sont suspendus). Ce n’est pas un mode « Vacances » : les modes sont dans `modes`.
- **Un mode qui en suit un autre** s’écrit `follows: Maison` à la place de ses jours. Une clé de mode sans
  `holiday` n’a pas de réglage de jour férié.
- Désinstaller l’intégration supprime le fichier ([Désinstaller](DESINSTALLER.fr.md)).

> **Attention :** `/config/www` est servi **sans authentification** à l’adresse
> `http://<votre-ha>/local/weekly_planner.yml`. Les horaires, jours fériés compris, révèlent quand la maison est
> occupée ou vide. N’exposez pas cette adresse sur Internet (reverse proxy, redirection de port).

## Sauvegarde et restauration

Les programmes et les réglages sont des données de Weekly Planner dans le dossier de configuration de Home
Assistant : `.storage/weekly_planner` (la configuration), `.storage/weekly_planner.runtime` (l’état en cours) et
`.storage/weekly_planner.journal` (ce qui a été décidé, sur 14 jours).

- **Sauvegarder.** Une sauvegarde complète de Home Assistant contient tout. **Faites-en une avant chaque mise à
  jour** ([Installer et mettre à jour](INSTALLER_METTRE_A_JOUR.fr.md)).
- **Restaurer.** Restaurez la sauvegarde de Home Assistant, ou au moins le fichier `.storage/weekly_planner`
  quand Home Assistant est arrêté. Ne modifiez pas ces fichiers pendant qu’il tourne.
- **Un fichier illisible n’est jamais remplacé par une configuration vide.** L’intégration ne démarre pas, une
  notification dit « Le fichier de configuration de Weekly Planner n’a pas pu être lu. Les programmes sont en pause et
  rien ne sera écrasé. », et il suffit de restaurer le fichier depuis une sauvegarde.
- **La copie YAML** ([plus haut](#le-fichier-de-configuration-yaml)) est une deuxième sauvegarde lisible des
  programmes : mettre un fichier valide à sa place les remplace dans les 30 secondes.

## Où trouver l’identifiant d’un programme

Les services ([Entités et services](ENTITES_SERVICES.fr.md#services-pour-vos-automatisations)) et le YAML de la carte
demandent l’**identifiant** du programme. Ce n’est ni son nom ni un nom simplifié : il est créé par l’intégration et
ne change pas quand on renomme le programme.

1. Ouvrir **Outils de développement → États**.
2. Chercher l’interrupteur du programme (il porte le nom du programme).
3. Lire l’attribut **`program_id`**.

<!-- CAPTURE: config-trouver-program-id | Outils de développement → États : l’interrupteur d’un programme et ses attributs, `program_id` en tête | 1440 ; démo : programme « Volet du salon » -->

Pour une carte, `program` et `filter.programs` acceptent aussi le **nom** du programme.

[Accueil](ACCUEIL.fr.md) · [Les réglages et leurs actions](REGLAGES.fr.md) · [Entités et services](ENTITES_SERVICES.fr.md)
