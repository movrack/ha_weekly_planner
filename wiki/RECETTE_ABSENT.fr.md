Français

# Absent quand personne n’est à la maison

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** quand la maison est vide, tous les programmes passent sur leurs horaires « Absent » : chauffage
baissé, lumières éteintes.

## Ce qu’il faut

- [Le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec en plus le choix `Absent`.
- L’automatisation de la recette [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md).
- Une entité **Personne** (`person`) par habitant, suivie par un téléphone (application Home Assistant) ou un autre
  suivi de présence. L’état de `zone.home` est le nombre de personnes présentes à la maison.

## Étapes

1. Sur la carte, pour chaque programme, toucher **Modifier**, ouvrir **Mode**, choisir `Absent`, puis donner ses
   horaires dans **Horaires**. Exemple pour un chauffage : **Éco** (16 °C) toute la journée, avec la durée
   « Jusqu’à une heure » de 00:00 à 00:00 ([Des horaires selon le mode](GUIDE_MODES.fr.md)).
2. Dans l’automatisation, ajouter `zone.home` à la liste `entity_id` du déclencheur et à la condition.
3. Mettre le test `Absent` en tête de l’ordre de priorité :

   ```yaml
   conditions:
     - condition: template
       value_template: >-
         {{ states('calendar.vacances_scolaires') in ['on', 'off']
            and states('binary_sensor.workday_sensor') in ['on', 'off']
            and states('zone.home') not in ['unavailable', 'unknown'] }}
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Absent' if is_state('zone.home', '0')
              else 'Vacances scolaires' if is_state('calendar.vacances_scolaires', 'on')
              else 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on')
              else 'Jour de congé' }}
   ```

## Résultat

Dès que la dernière personne part, le mode passe à « Absent ». Au retour de quelqu’un, le mode suivant de la liste
reprend.

## À savoir

- Une maison sans aucune entité `person` serait toujours « Absent ».
- Un téléphone qui perd son signal quelques minutes fait passer la maison en « Absent » : si cela arrive, regardez
  la fiabilité du suivi de présence avant d’ajouter des délais.
- Pour une absence longue (voyage), le mode « Vacances » et ses lumières de présence :
  [Vacances : la maison en veille](RECETTE_VACANCES_VEILLE.fr.md).

---

[← Toutes les recettes](RECETTES.fr.md)
