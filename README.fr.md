# Weekly Planner

[English](README.md) | Français

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Licence : MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)

Un planificateur hebdomadaire par plages horaires pour Home Assistant. Programmez n'importe quelle entité
(thermostats, volets, lumières, prises, aspirateurs...) avec des semaines colorées construites à partir
d'étiquettes partagées. Une seule installation apporte le moteur (intégration) et la carte.

<!-- screenshot: docs/images/card-overview.png — la carte en consultation (barres de la semaine + mode actuel) -->

## Pourquoi Weekly Planner ?

- **Un seul fonctionnement pour tous les appareils.** Une plage a un début, une fin facultative, des jours et une
  **étiquette**. Une étiquette est un nom et une couleur pour une action : tout service Home Assistant qui accepte
  l'appareil (`climate.set_temperature`, `cover.close_cover`, `vacuum.start`...) ou une scène. « Confort » = 19 °C,
  défini une fois, utilisé dans toutes les plages.
- **Les étiquettes sont partagées.** Changez ce que fait « Confort » et toutes les plages qui l'utilisent suivent.
  Un appareil peut avoir sa propre valeur pour une étiquette (19 °C partout, 22 °C dans la salle de bain).
- **« Le reste du temps ».** Chaque appareil peut avoir une étiquette appliquée à la fin d'une plage qui a une fin.
  Une plage sans fin est une action ponctuelle : elle s'exécute une fois, à son début, et n'est jamais refaite.
- **Profils.** Plusieurs semaines types par programme (Hiver, Été, Télétravail) et un `select` pour changer.
- **Heures solaires bornées.** Aube, lever, coucher, crépuscule, avec décalage, « au plus tôt » et « au plus tard ».
- **Priorités et conditions.** Plusieurs programmes peuvent viser la même entité ; la priorité la plus haute
  gagne et l'autre reprend la main à sa fin. Conditions par programme et par plage.
- **Interrupteur Vacances.** Un seul interrupteur suspend tous les programmes et applique les défauts.
- **Résiste aux redémarrages.** Au choix, l'action en cours est renvoyée après un redémarrage ou une
  modification (jamais les actions ponctuelles) ; les fins de plage manquées sont rattrapées.
- **Graphique d'historique pour tous les appareils.** L'historique Home Assistant du jour (une courbe pour un
  nombre, une bande d'états sinon), les actions prévues, « maintenant », et les changements faits à la main en
  rouge. Un toucher ouvre l'historique Home Assistant.
- **Une seule installation.** L'intégration embarque sa carte : pas de second dépôt HACS.

> **La 0.6.0 casse la compatibilité.** Consignes par type, modes communs, détection des réglages manuels
> (« dérogations ») et cas particuliers Evohome / Adaptive Lighting / Versatile Thermostat ont disparu. Les
> programmes enregistrés sont convertis automatiquement (une copie de l'ancien fichier est gardée à côté).
> Voir le [journal des modifications](CHANGELOG.md).

## Installation

1. Dans HACS, ouvrez le menu > **Dépôts personnalisés**.
2. Ajoutez `https://github.com/movrack/ha_Weekly_planner` avec la catégorie **Intégration**.
3. Installez **Weekly Planner** puis redémarrez Home Assistant.
4. Allez dans **Paramètres > Appareils et services > Ajouter une intégration** et ajoutez
   **Weekly Planner** (une seule instance est possible).

La carte est enregistrée automatiquement comme ressource Lovelace (mode storage). En mode YAML, elle est
ajoutée comme module JS supplémentaire.

<!-- screenshot: docs/images/install-config-flow.png — ajout de l'intégration -->

## Ajouter la carte

Modifiez un tableau de bord, ajoutez une carte, choisissez **Weekly Planner**, ou utilisez le YAML.

Un programme fixé :

```yaml
type: custom:weekly-planner-card
program: chauffage-bureau
title: Bureau
show_chart: true
```

Une liste filtrée de programmes (avec création de programme depuis la carte) :

```yaml
type: custom:weekly-planner-card
filter:
  types: [climate]
  area: office
title: Chauffage
```

| Option | Description |
|---|---|
| `program` | Identifiant d'un programme unique à afficher. |
| `filter.types` | Types d'entités à lister (`climate`, `cover`, `light`...). |
| `filter.area` | Seulement les programmes qui contiennent des entités de cette zone. |
| `title` | Titre de la carte. |
| `show_chart` | Afficher le graphique d'historique dans l'écran des horaires (activé par défaut). |

La carte est un planificateur, pas une télécommande : une ligne par appareil (icône, nom du programme, état,
prochaine action prévue et heure) avec sa barre du jour, la semaine et un bouton **Horaires**. L'écran des
horaires liste les plages une par ligne (toucher pour modifier sur place : début, fin facultative, jours,
étiquette), « Le reste du temps », le graphique du jour, un interrupteur de pause et une suppression confirmée.
L'engrenage (administrateurs uniquement) ouvre les réglages du programme (nom, icône, priorité, conditions,
« refaire l'action en cours au redémarrage », appareils, saisons) ; le bouton liste de l'en-tête ouvre l'écran
**Étiquettes**.

<!-- screenshot: docs/images/card-overview.png — la carte -->
<!-- screenshot: docs/images/card-chart.png — le graphique d'historique -->

## Concepts

- **Programme** : ensemble nommé d'entités + une semaine de plages + des réglages. Un interrupteur par programme.
- **Plage** : intervalle `[début, fin)` d'un jour, ou plage ponctuelle (début seul), avec une étiquette.
- **Étiquette** : partagée par tous les programmes : un nom, une couleur et une action. L'action est un appel de
  service sur l'appareil (`{"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 19}}`)
  ou une scène. Une étiquette est proposée pour un appareil quand son service l'accepte (ou que la scène le
  contient) ; un appareil qui ne convient pas à l'étiquette d'une plage est ignoré pour cette plage et la carte
  vous avertit.
- **Valeur pour un appareil** : l'action propre d'un appareil pour une étiquette.
- **Le reste du temps** : l'étiquette que reçoit un appareil à la fin d'une plage qui a une fin (ou rien).
- **Profil** : une des semaines types d'un programme. Entités, défauts, conditions et priorité sont communs.
- **Priorité** : quand plusieurs programmes actifs visent la même entité, le plus petit numéro gagne.

En bref : le moteur ne rejoue pas d'événements ; il recalcule l'action voulue et n'agit qu'aux transitions
(début ou fin de plage, condition qui change, programme activé/désactivé, Vacances, modification). Il ne surveille
pas ce que devient l'appareil : un changement fait à la main n'est ni détecté ni corrigé (le graphique le montre
seulement).

## Entités créées

| Entité | Rôle |
|---|---|
| `switch.weekly_planner_<programme>` | Active ou désactive un programme. Attributs : plages en cours, prochain changement, prochaines actions, saut, profil actif. |
| `switch.weekly_planner_vacances` | Suspend tous les programmes et applique leurs défauts (`switch.weekly_planner_vacation` sur une instance en anglais : les identifiants suivent la langue de l'instance). |
| `select.weekly_planner_profil_<programme>` | Choisit le profil actif. |

Les identifiants d'entité suivent les noms, donc dépendent de la langue du compte à la création.

## Services

```yaml
# Envoyer maintenant ce que le programme veut pour ses entités
action: weekly_planner.apply_now
data:
  program_id: chauffage-bureau
```

```yaml
# Sauter le prochain changement d'un programme (une fois) ; ajouter cancel: true pour annuler
action: weekly_planner.skip_next
data:
  program_id: chauffage-bureau
```

```yaml
action: weekly_planner.reload
```

## Options de l'intégration

Paramètres > Appareils et services > Weekly Planner > **Configurer**.

| Option | Défaut | Sens |
|---|---|---|
| Modification réservée aux administrateurs | désactivé | Verrouille l'édition des programmes et des étiquettes. Lecture, interrupteurs et changement de profil restent ouverts. Les actions sur les domaines sensibles (`homeassistant`, `hassio`, `alarm_control_panel`, `lock`) restent toujours réservées aux administrateurs. |
| Réappliquer après un redémarrage ou une modification | activé | Valeur par défaut des nouveaux programmes : renvoyer l'action en cours au démarrage, à l'activation ou à la modification (jamais une action ponctuelle). |
| Délai de notification (min) | 30 | Notification persistante si un appareil reste indisponible après ce délai. |
| Anti-rebond des conditions (min) | 2 | Une condition doit rester dans son état pendant ce temps avant de commencer ou finir une plage. |

## Entités supportées

Toutes. Les actions proposées pour un appareil sont les services Home Assistant dont la cible l'accepte (avec leurs
noms traduits et leurs champs de saisie) et les scènes qui le contiennent ; les services techniques (texte libre ou
objet obligatoire) sont masqués. Si un appel échoue (hors valeur refusée par l'appareil), il est retenté après 1, 2,
5, 10 et 15 minutes, puis une notification persistante apparaît. Une valeur refusée donne tout de suite une
notification. Weekly Planner ne connaît rien de particulier à Versatile Thermostat, Evohome ou Adaptive Lighting :
ils se programment comme n'importe quelle entité.

## FAQ

**Que se passe-t-il au redémarrage de Home Assistant ?**
Après 30 s de stabilisation, l'action voulue est recalculée. Avec « renvoyer l'action en cours » activé, l'action
de la plage en cours (ou « le reste du temps ») est envoyée ; sinon rien n'est envoyé avant la prochaine
transition. Une fin de plage manquée pendant l'arrêt est rattrapée ; les actions ponctuelles ne sont pas rejouées.

**Et si je change un appareil à la main ?**
Rien : Weekly Planner ne le détecte pas. Le prochain début ou la prochaine fin de plage envoie son action comme
prévu. Le graphique montre en rouge les changements faits par une personne (d'après le journal de bord ; un
changement qui ne touche que des attributs, comme la consigne d'un thermostat, est seulement deviné par l'écart
avec ce que Weekly Planner a envoyé).

**Et si un appareil est injoignable ?**
L'action attend. Au retour de l'appareil, l'action voulue est recalculée et envoyée. Passé le délai de
notification, une notification persistante apparaît.

**Et le changement d'heure ?**
Les heures sont construites en heure locale puis normalisées par UTC. Une heure inexistante est avancée
(02:30 devient 03:30), une heure ambiguë s'exécute une seule fois, une plage entièrement dans l'heure sautée
est ignorée ce jour-là.

**Une plage peut-elle passer minuit ?**
Oui (22:00 à 06:00) ; elle appartient au jour de son début. `24:00` est accepté comme fin.

## Développement

```bash
uv sync --group test                      # environnement Python 3.14
uv run pytest                             # tests
cd frontend && npm install && npm run build   # produit custom_components/weekly_planner/frontend/weekly-planner-card.js
scripts/dev_ha.sh                         # Home Assistant local sur http://localhost:8124
python3 scripts/dev_onboard.py            # initialise l'instance locale (utilisateur dev / dev) et ajoute l'intégration
```

`npm run watch` reconstruit à chaque modification, `npm run typecheck` vérifie les types. La spécification
complète est dans [docs/SPEC.md](docs/SPEC.md) ; les procédures manuelles dans
[docs/test-reel.md](docs/test-reel.md) et [docs/controle-visuel.md](docs/controle-visuel.md).

## Licence

[MIT](LICENSE)
