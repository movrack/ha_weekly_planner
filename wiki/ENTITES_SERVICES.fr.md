Français

# Entités, services et automatisations

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Cette page dit ce que Weekly Planner met à votre disposition dans Home Assistant et comment s’en servir dans vos
automatisations, vos scripts et vos tableaux de bord.

Sur cette page : [Entités](#entités) · [Services pour vos automatisations](#services-pour-vos-automatisations) ·
[Exemples d’automatisations](#exemples-dautomatisations) · [Notifications et réparations](#notifications-et-réparations).

## Entités

Weekly Planner crée un seul appareil, **Weekly Planner** (**Paramètres → Appareils et services → Weekly Planner**),
avec des interrupteurs, et rien d’autre : pas de capteur, et **pas d’entité pour le mode**, qui est celui de votre
propre sélecteur ([Le sélecteur de mode](CONFIGURATION.fr.md#le-sélecteur-de-mode)). Les identifiants d’entités
dépendent de la langue et des renommages : les lire dans la liste des entités, ne pas les deviner.

| Entité | À quoi elle sert |
|---|---|
| **Un interrupteur par programme**, qui porte le nom du programme | Allumé : le programme est en marche. Éteint : il est arrêté (**En pause** sur la carte). L’allumer ou l’éteindre fait la même chose que l’interrupteur de la carte ; une action manuelle met fin à une pause avec durée. |
| **Suspension de tous les programmes** | Allumé : tous les programmes sont suspendus et chaque appareil reçoit une fois le réglage de **Le reste du temps** de son programme ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)). |

### Les attributs d’un interrupteur de programme

On les lit dans **Outils de développement → États**, dans un modèle (`state_attr(…)`) ou comme condition
d’automatisation.

| Attribut | Ce qu’il contient |
|---|---|
| `program_id` | L’identifiant du programme, à donner aux services ([Où trouver l’identifiant](CONFIGURATION.fr.md#où-trouver-lidentifiant-dun-programme)). |
| `current_slots` | Pour chaque appareil, l’horaire du programme en cours maintenant (rien pour un appareil qui n’en a pas). |
| `next_change` | La date et l’heure du prochain changement du programme, ou rien s’il n’y en a pas. |
| `next_actions` | Pour chaque appareil, la prochaine action prévue. |
| `skip_next`, `skip_next_targets` | Le changement sauté ([Sauter le prochain changement](GUIDE_PAUSE_SAUT.fr.md#sauter-le-prochain-changement)) et les appareils qu’il concerne ; vides sans saut. |
| `no_schedule_for_mode` | Vrai quand le programme n’a aucun horaire pour le mode actif (ses appareils suivent **Le reste du temps**). |
| `paused_until` | La date de reprise d’une pause avec durée ; absent sinon. |
| `holiday` | Présent seulement un jour férié qui remplace le jour de la semaine : `copy` (numéro du jour copié, 0 = lundi) ou `own` (horaires propres). |
| `verification` | Présent seulement quand un appareil n’a pas pris la valeur demandée : `pending` (il sera renvoyé), `manual` (changé à la main, on ne force pas), `ok` (repris) ([Vérifier](REGLAGES.fr.md#renvoyer-vérifier-réessayer)). |

## Services pour vos automatisations

Dans **Outils de développement → Actions**, ces actions s’appellent **Weekly Planner : …**. Tous demandent
l’identifiant du programme (champ **Programme**, `program_id`), sauf **Recharger**.

| Action | Champs | Ce qu’elle fait |
|---|---|---|
| `weekly_planner.apply_now`, **Appliquer maintenant** | `program_id` | Envoie tout de suite ce que les appareils du programme doivent faire, même s’ils sont déjà dans cet état. Envoie aussi le dernier horaire **À cette heure seulement** commencé il y a moins de 24 heures, sauf si une personne a modifié l’appareil depuis. Renvoie la liste des appareils envoyés (`sent`) et laissés tels quels (`skipped`, avec la raison). |
| `weekly_planner.skip_next`, **Sauter le prochain changement** | `program_id` ; **Annuler** (`cancel`, faux au départ) | N’applique pas le prochain changement du programme. Avec `cancel: true`, annule un saut en attente. |
| `weekly_planner.pause`, **Mettre en pause** | `program_id` ; **Jours** (`days`) et/ou **Heures** (`hours`), au moins un | Met le programme en pause, puis le reprend tout seul, même après un redémarrage. Jours et heures s’ajoutent ; la durée totale va de 1 heure à 365 jours. À la mise en pause, **Le reste du temps** du programme est envoyé une fois aux appareils qu’aucun autre programme en marche ne commande. |
| `weekly_planner.resume`, **Reprendre** | `program_id` | Reprend tout de suite un programme en pause avec durée. Un programme arrêté avec son interrupteur reste arrêté. |
| `weekly_planner.reload`, **Recharger** | aucun | Recharge Weekly Planner et relit le [fichier YAML](CONFIGURATION.fr.md#le-fichier-de-configuration-yaml). Réservé aux administrateurs. |

**Qui peut les lancer.** Une automatisation ou un script, toujours. Une personne : tout le monde, ou seulement les
administrateurs si **Seuls les administrateurs peuvent modifier les programmes** est coché
([Qui peut modifier quoi](CONFIGURATION.fr.md#qui-peut-modifier-quoi)). Un identifiant inconnu donne « Programme
inconnu » ; une durée hors de 1 heure à 365 jours donne « Un programme se met en pause de 1 heure à 365 jours ».

Pour **changer le mode**, il n’y a pas d’action Weekly Planner : on change le sélecteur
([Le sélecteur de mode](CONFIGURATION.fr.md#le-sélecteur-de-mode)). Pour allumer ou éteindre un programme ou la
suspension, on utilise `switch.turn_on` et `switch.turn_off` sur l’interrupteur.

## Exemples d’automatisations

Dans chaque exemple, remplacez les identifiants (`binary_sensor.…`, `program_id`) par les vôtres.

**Couper le chauffage quand une fenêtre reste ouverte.** Le chauffage du salon se met en pause une heure quand la
fenêtre est ouverte depuis 5 minutes, et reprend dès qu’elle est refermée.

```yaml
- alias: Chauffage du salon en pause, fenêtre ouverte
  triggers:
    - trigger: state
      entity_id: binary_sensor.fenetre_salon
      to: "on"
      for: "00:05:00"
  actions:
    - action: weekly_planner.pause
      data:
        program_id: "l-identifiant-du-programme"
        hours: 1

- alias: Chauffage du salon repart, fenêtre fermée
  triggers:
    - trigger: state
      entity_id: binary_sensor.fenetre_salon
      to: "off"
  actions:
    - action: weekly_planner.resume
      data:
        program_id: "l-identifiant-du-programme"
```

**Des invités dorment au salon : les volets ne se ferment pas ce soir.** Un interrupteur « Invités » du tableau de
bord saute le prochain changement du programme des volets.

```yaml
- alias: Volets du salon, invités
  triggers:
    - trigger: state
      entity_id: input_boolean.invites
      to: "on"
  actions:
    - action: weekly_planner.skip_next
      data:
        program_id: "l-identifiant-du-programme"
```

**Un bouton « Tout remettre au programme ».** Après avoir réglé des volets à la main avec la télécommande, un seul
bouton renvoie à chaque appareil ce que ses programmes prévoient maintenant.

```yaml
script:
  tout_remettre_au_programme:
    alias: Tout remettre au programme
    sequence:
      - action: weekly_planner.apply_now
        data:
          program_id: "identifiant-des-volets"
      - action: weekly_planner.apply_now
        data:
          program_id: "identifiant-du-chauffage"
```

**Afficher l’heure du prochain changement.** Un modèle donne l’heure à laquelle le chauffage change :

```yaml
{{ (state_attr('switch.chauffage_du_salon', 'next_change') | as_datetime | as_local).strftime('%H:%M')
   if state_attr('switch.chauffage_du_salon', 'next_change') else 'rien de prévu' }}
```

Les automatisations qui changent le **mode** de la maison (jour travaillé, vacances scolaires, maison vide) sont
dans les [Recettes](RECETTES.fr.md).

## Notifications et réparations

**Notifications** (la cloche de Home Assistant, titre **Weekly Planner**) :

- « … est indisponible : son action planifiée est toujours en attente. » : un appareil commandé par un horaire reste
  indisponible plus longtemps que le délai des [réglages de l’intégration](CONFIGURATION.fr.md#réglages-de-lintégration).
  Son réglage lui est renvoyé tout seul à son retour.
- « … : … n’a pas pu être exécuté. » : Home Assistant a refusé la commande malgré les nouveaux essais
  ([Renvoyer, vérifier, réessayer](REGLAGES.fr.md#renvoyer-vérifier-réessayer)).
- « Le fichier de configuration de Weekly Planner n’a pas pu être lu. Les programmes sont en pause et rien ne sera
  écrasé. » : voir [Sauvegarde et restauration](CONFIGURATION.fr.md#sauvegarde-et-restauration).

**Réparations** (**Paramètres → Système → Réparations**). Elles informent et disparaissent toutes seules quand le
problème est réglé :

| Titre | Ce que cela dit |
|---|---|
| **Weekly Planner : entités supprimées** | Des programmes utilisent des entités qui n’existent plus. La réparation les nomme : les modifier dans le panneau **Weekly Planner**. |
| **Weekly Planner : fichier YAML ignoré** | Le fichier `weekly_planner.yml` n’a pas été importé, rien n’a changé, et l’erreur est écrite ([Le fichier de configuration YAML](CONFIGURATION.fr.md#le-fichier-de-configuration-yaml)). |
| **Weekly Planner : un mode ne correspond à aucune option** | Des horaires appartiennent à un mode qui n’est plus une option du sélecteur : ils sont gardés, inactifs. L’écran des horaires propose de les rattacher à une option ou de les supprimer ([Modes, lecture seule et limites](REGLAGES.fr.md#modes-lecture-seule-et-limites)). |
| **Weekly Planner : entité de jour férié absente** | L’entité de jour férié choisie dans les réglages n’existe pas : les réglages **Jour férié** sont gardés, et chaque jour est un jour normal. |
| **Weekly Planner : les modes sont maintenant globaux** | Le mode est le même pour tous les programmes et vient d’un seul sélecteur ; la réparation nomme les programmes qui avaient un choix de mode propre. |

Ce que Weekly Planner a envoyé, décision par décision, se lit dans le **Journal** de Home Assistant
([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md)).

[Accueil](ACCUEIL.fr.md) · [Configuration](CONFIGURATION.fr.md) · [Les réglages et leurs actions](REGLAGES.fr.md)
