Français

# Annexe : messages et réparations

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Les messages que Weekly Planner montre dans Home Assistant, tels qu’ils s’écrivent, avec ce qu’il faut faire. Les messages de la carte et du panneau sont expliqués dans les pages où ils apparaissent ([Les réglages et leurs actions](REGLAGES.fr.md), [Entités, services et automatisations](ENTITES_SERVICES.fr.md)). Cette page est générée à partir des fichiers de traduction de l’intégration.

Sur cette page : [Réglages de l’intégration](#réglages-de-lintégration) · [Réparations](#réparations) · [Notifications](#notifications) · [Messages des actions et des valeurs lues](#messages-des-actions-et-des-valeurs-lues).

## Réglages de l’intégration

Affichés dans **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages**.

| Message | Que faire |
|---|---|
| Choisissez un input_select ou un select. | Choisir une liste déroulante (`input_select`) ou une liste de choix (`select`). |
| Cette entité appartient à Weekly Planner. Choisissez-en une autre. | Choisir une entité qui n’est pas un interrupteur de Weekly Planner. |
| Saisissez un nom de Mode de 1 à 40 caractères. | Saisir le nom d’un mode, de 1 à 40 caractères. |
| Ce Mode n'est pas une option du sélecteur. Choisissez-en un dans la liste. | Choisir un des choix du sélecteur, écrit exactement pareil. |
| Choisissez un binary_sensor, un input_boolean, un switch ou un calendar. | Choisir un capteur, un interrupteur ou un calendrier. |
| Cette entité appartient à Weekly Planner. Choisissez-en une autre. | Choisir une entité qui n’est pas un interrupteur de Weekly Planner. |
| Un programme commande cette entité. Choisissez-en une autre. | Choisir une entité qu’aucun programme ne commande. |
| Cochez la case ou laissez-la vide. | Cocher la case ou la laisser vide. |

## Réparations

Affichées dans **Paramètres → Système → Réparations**. `{…}` est remplacé par les noms concernés.

| Titre et message | Que faire |
|---|---|
| **Weekly Planner : entités supprimées** : Des programmes utilisent des entités qui n'existent plus : {details}. Modifiez ces programmes dans le panneau Weekly Planner. | Ouvrir le panneau **Weekly Planner**, modifier le programme et retirer l’appareil absent (ou le remettre dans Home Assistant). |
| **Weekly Planner : fichier YAML ignoré** : Le fichier weekly_planner.yml de /config/www n'a pas été importé et rien n'a été modifié : {error}. Corrigez le fichier ; il est relu dans les 30 secondes. | Corriger le fichier `weekly_planner.yml` : il est relu dans les 30 secondes ([Le fichier de configuration YAML](CONFIGURATION.fr.md#le-fichier-de-configuration-yaml)). |
| **Weekly Planner : un mode ne correspond à aucune option** : Ces modes ont des horaires mais ne sont plus une option du sélecteur de mode : {modes}. Ils sont conservés, inactifs, et rien n'a été effacé. Options qu'aucun programme n'utilise encore : {options}. Ouvrez l'écran des horaires pour rattacher chaque mode à une option, ou le supprimer. | Dans l’écran des horaires, rattacher le mode à une option du sélecteur, ou supprimer ses horaires ([Modes, lecture seule et limites](REGLAGES.fr.md#modes-lecture-seule-et-limites)). |
| **Weekly Planner : entité de jour férié absente** : L'entité de jour férié {entity} n'existe pas. Les réglages Jour férié sont gardés, mais chaque jour est un jour normal. Choisissez une autre entité dans les réglages de Weekly Planner, ou rétablissez-la. | Choisir une autre entité dans **Configurer → Réglages**, ou remettre celle-ci dans Home Assistant ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)). |

## Notifications

Affichées dans la cloche de Home Assistant.

| Message | Que faire |
|---|---|
| {entity} est indisponible : son action planifiée est toujours en attente. | L’appareil recevra son réglage dès qu’il reviendra. S’il reste indisponible, vérifier l’appareil lui-même. |
| {entity} : {action} n'a pas pu être exécuté. | Home Assistant a refusé la commande après plusieurs essais. Vérifier l’appareil, puis **Appliquer maintenant** ([Après une panne](GUIDE_APRES_PANNE.fr.md)). |
| Le fichier de configuration de Weekly Planner n'a pas pu être lu. Les programmes sont en pause et rien ne sera écrasé. Restaurez `.storage/weekly_planner` depuis une sauvegarde. | Restaurer la sauvegarde de `.storage/weekly_planner` ([Sauvegarde et restauration](CONFIGURATION.fr.md#sauvegarde-et-restauration)). |

Avant un renvoi de l’état aux appareils ([Après une panne](GUIDE_APRES_PANNE.fr.md)), la liste dit pourquoi un appareil est laissé tel quel :

- « tous les programmes sont suspendus »
- « son programme est en pause »
- « son programme est éteint »
- « rien à envoyer »
- « son dernier horaire « À cette heure seulement » date de plus de 24 h »
- « modifié par une personne depuis »
- « indisponible »
- « même commande déjà envoyée à cet appareil »
- « piloté par un autre programme »

## Messages des actions et des valeurs lues

Affichés quand une action de Weekly Planner est lancée avec de mauvaises données, ou quand une valeur lue sur une entité ne peut pas servir ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)).

| Message | Que faire |
|---|---|
| Weekly Planner n'est pas chargé | Attendre la fin du chargement de Weekly Planner, ou le recharger. |
| Un programme se met en pause de 1 heure à {max_days} jours | Donner une durée de 1 heure à 365 jours ([Entités et services](ENTITES_SERVICES.fr.md#services-pour-vos-automatisations)). |
| Programme inconnu | Relire l’identifiant du programme ([Où trouver l’identifiant](CONFIGURATION.fr.md#où-trouver-lidentifiant-dun-programme)). |
| La source de la valeur est indisponible | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur est absente ou indisponible | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur n'est pas un nombre | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur n'est pas un nombre fini | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur n'est pas un booléen | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur n'est pas du texte | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| La source de la valeur n'est pas finie | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| Type de source de valeur inconnu | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| Source de valeur native non prise en charge | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| Les sources de valeur nécessitent l'accès aux états de Home Assistant | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |
| Source de valeur non valide pour {key} | Vérifier l’entité choisie sous **Valeur d’une entité** dans le réglage ([Lire la valeur dans une autre entité](REGLAGES.fr.md#lire-la-valeur-dans-une-autre-entité)). |

[← Accueil](ACCUEIL.fr.md) · [Entités, services et automatisations](ENTITES_SERVICES.fr.md)
