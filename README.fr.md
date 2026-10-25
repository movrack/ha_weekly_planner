# Weekly Planner

[English](README.md) | Français

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Licence : MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)

Un planificateur hebdomadaire par plages horaires pour Home Assistant. Programmez thermostats, volets,
lumières, prises et ventilateurs avec des semaines colorées, des modes partagés et une gestion raisonnable
des réglages manuels. Une seule installation apporte le moteur (intégration) et la carte.

<!-- screenshot: docs/images/card-overview.png — la carte en consultation (barres de la semaine + mode actuel) -->

## Pourquoi Weekly Planner ?

- **Une plage a un début et une fin.** À la fin, l'entité revient à son **état par défaut** (un mode, l'état
  d'avant la plage, ou rien).
- **Les réglages manuels sont respectés.** Si vous touchez un appareil pendant une plage, Weekly Planner le
  remarque, ne s'y oppose pas et affiche une pastille de dérogation (« Reprendre » remet le planning). La fin
  de plage s'applique quand même.
- **Modes partagés par type d'entité.** « Confort », « Éco », « Fermé »... sont définis une fois par type et
  réutilisés par tous les programmes, avec des exceptions par entité.
- **Profils.** Plusieurs semaines types par programme (Hiver, Été, Télétravail) et un `select` pour changer.
- **Heures solaires bornées.** Aube, lever, coucher, crépuscule, avec décalage, « au plus tôt » et
  « au plus tard ».
- **Priorités et conditions.** Plusieurs programmes peuvent viser la même entité ; la priorité la plus haute
  gagne et l'autre reprend la main à sa fin. Conditions par programme et par plage.
- **Interrupteur Vacances.** Un seul interrupteur suspend tous les programmes et applique les défauts.
- **Résiste aux redémarrages.** L'état voulu est recalculé, les dérogations sont mémorisées, les fins de
  plage manquées sont rattrapées.
- **Graphique prévu / réel.** Un graphique 24 h par entité montre la consigne prévue, ce qui a été appliqué
  et la mesure.
- **Une seule installation.** L'intégration embarque sa carte : pas de second dépôt HACS.

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
| `show_chart` | Afficher le graphique prévu/mesuré dans l'écran des horaires (activé par défaut). |

La carte est un planificateur, pas une télécommande : une ligne compacte par appareil (état, prochaine action
prévue, barre du jour) et un bouton **Horaires**. L'écran des horaires liste les plages une par ligne (toucher
pour modifier sur place : début, fin facultative, jours, action), le reste du temps, un graphique
prévu/mesuré, un interrupteur de pause et une suppression confirmée. L'engrenage (administrateurs
uniquement) ouvre les réglages du propriétaire. Les modes communs (Nuit, Confort...) se modifient dans les
options de l'intégration.

<!-- screenshot: docs/images/card-day-editor.png — l'éditeur du jour avec bords de plage glissables -->
<!-- screenshot: docs/images/card-chart.png — le graphique prévu/réel -->

## Concepts

- **Programme** : ensemble nommé d'entités + une semaine de plages + des réglages. Un interrupteur par
  programme.
- **Plage** : intervalle `[début, fin)` d'un jour (ou plage ponctuelle : début seul). Elle porte une action
  par type d'entité (un mode) ou par entité (une consigne).
- **Mode** : consigne nommée et colorée, partagée par type d'entité (valeur commune + exceptions par entité).
- **Consigne** : l'action concrète sur une entité (`preset = eco`, `position = 30`, une scène...).
- **État par défaut** : ce que reçoit l'entité à la fin d'une plage : un mode/une consigne, l'état d'avant la
  plage, ou rien.
- **Dérogation** : un changement de l'entité qui ne vient pas de Weekly Planner. Elle est conservée jusqu'à la
  prochaine transition du programme gagnant.
- **Profil** : une des semaines types d'un programme. Entités, défauts, conditions et priorité sont communs.
- **Priorité** : quand plusieurs programmes actifs visent la même entité, le plus petit numéro gagne.

En bref : le moteur ne rejoue pas d'événements ; il recalcule l'état voulu et n'agit qu'aux transitions
(début ou fin de plage, condition qui change, programme activé/désactivé, Vacances, modification). Ensuite il
laisse l'entité tranquille.

## Entités créées

| Entité | Rôle |
|---|---|
| `switch.weekly_planner_<programme>` | Active ou désactive un programme. Attributs : mode actuel, plage actuelle, prochain changement, entités en dérogation, conflits, alertes. |
| `switch.weekly_planner_vacances` | Suspend tous les programmes et applique leurs défauts (`switch.weekly_planner_vacation` sur une instance en anglais : les identifiants suivent la langue de l'instance). |
| `select.weekly_planner_profil_<programme>` | Choisit le profil actif. |

Les identifiants d'entité suivent les noms, donc dépendent de la langue du compte à la création.

## Services

```yaml
# Annuler les dérogations et réappliquer le planning (entités ou programme entier)
action: weekly_planner.resume
data:
  program_id: chauffage-bureau
```

```yaml
# Appliquer une consigne pendant un temps, puis revenir au planning
action: weekly_planner.override
data:
  entity_id: climate.office
  setpoint: {kind: preset, preset: boost}
  duration: "02:00:00"      # ou : until: "2026-10-26 18:00:00"
```

```yaml
# Appliquer ce que le programme veut maintenant (entités sans dérogation)
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
| Modification réservée aux administrateurs | désactivé | Verrouille l'édition des programmes et des modes. Lecture, interrupteurs, Reprendre, Déroger et changement de profil restent ouverts. Scripts, actions HA, valeurs avancées et domaines sensibles (`homeassistant`, `hassio`, `alarm_control_panel`, `lock`) restent toujours réservés aux administrateurs. |
| Réappliquer après un redémarrage ou une modification | activé | Valeur par défaut des nouveaux programmes : réappliquer la plage en cours au démarrage, à l'activation ou à la modification. |
| Délai de notification (min) | 30 | Notification persistante si l'état voulu n'est pas atteint après ce délai. |
| Anti-rebond des conditions (min) | 2 | Une condition doit rester dans son état pendant ce temps avant de commencer ou finir une plage. |

## Compatibilité

- **Versatile Thermostat >= 10.6** : programmez l'entité VT elle-même, jamais ses appareils sous-jacents.
  Désactivez son retour manuel automatique (`manual_override_duration_min` = 0), sinon il annule vos
  dérogations. La carte avertit quand vous ajoutez un VT. Les changements de fenêtre, sécurité ou délestage ne
  sont pas traités comme des dérogations.
- **Evohome** : option « dérogation permanente » (preset `permanent`, puis la consigne). Quand une entité
  quitte Weekly Planner, elle repasse en suivi du programme Evohome. Sous un VT, gardez le programme interne
  Evohome de la zone vide ou plat.
- **Adaptive Lighting >= 1.32** : la consigne de lumière « Automatique » active un switch Adaptive Lighting
  (ou lance un script). Pour une consigne fixe sur une lumière couverte par Adaptive Lighting, Weekly Planner
  active le contrôle manuel pour la plage et rend la lumière à la fin.

## Types d'entités et consignes supportés

| Type | Consignes |
|---|---|
| `climate` | température, preset, mode HVAC, arrêt |
| `cover` | ouvrir, fermer, position %, inclinaison %, « favori » (position réglable) |
| `light` | allumer/éteindre, luminosité, couleur/blanc, effet, **Automatique** |
| `switch`, `input_boolean` | allumer, éteindre |
| `fan` | allumer/éteindre, vitesse %, preset |
| `water_heater` | mode d'opération, température |
| `media_player` | allumer/éteindre, volume, source, lire un média |
| `input_number`, `input_select` | valeur, option |
| Autre / tout type | action HA, scène, script (actions ponctuelles), valeur avancée |

Les choix (presets, modes HVAC, effets) sont lus sur l'entité et validés à l'enregistrement.
Les actions ponctuelles (script, scène, action) ne sont jamais réappliquées après un redémarrage.

## FAQ

**Que se passe-t-il au redémarrage de Home Assistant ?**
Après 30 s de stabilisation, l'état voulu est recalculé. Avec « réappliquer » activé, la plage en cours est
appliquée aux entités sans dérogation ; sinon rien n'est envoyé avant la prochaine transition. Les dérogations
sont mémorisées, une fin de plage manquée pendant l'arrêt est rattrapée, et les actions ponctuelles ne sont
pas rejouées.

**Et si je change un appareil à la main ?**
C'est enregistré comme une dérogation : Weekly Planner ne lutte pas contre vous. Elle dure jusqu'à la fin de
la plage (l'état par défaut s'applique alors) ou jusqu'à **Reprendre**.

**Et si un appareil est injoignable ?**
L'action attend. Au retour de l'appareil, l'état voulu est recalculé (début de plage s'il est encore dedans,
sinon le défaut). Passé le délai de notification, une notification persistante apparaît ; elle disparaît
quand la cible est atteinte.

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
