# Plusieurs capteurs, un seul ordre de priorité

**À quoi ça sert :** choisir le mode à partir de plusieurs capteurs sans que deux automatisations se disputent le sélecteur.

## Ce qu'il faut

- [le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les options `Vacances scolaires`, `Jour travaillé` et `Jour de congé`.
- Les capteurs des recettes [Jour travaillé ou jour de congé](RECETTE_JOUR_TRAVAILLE.fr.md) et
  [Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md).

## Étapes

1. Supprimez ou désactivez les automatisations qui changent déjà ce sélecteur.
2. Créez une seule automatisation. Le premier test vrai gagne : mettez le plus important en premier.

   ```yaml
   alias: Weekly Planner – mode de la maison
   mode: restart
   triggers:
     - trigger: state
       entity_id:
         - binary_sensor.vacances_scolaires
         - binary_sensor.workday_sensor
     - trigger: homeassistant
       event: start
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Vacances scolaires' if is_state('binary_sensor.vacances_scolaires', 'on')
              else 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on')
              else 'Jour de congé' }}
   ```

## Résultat

Pendant les vacances scolaires, même un jour travaillé, le mode est « Vacances scolaires ». Sinon un jour travaillé donne « Jour travaillé », et tout le reste donne « Jour de congé ».

## À savoir

- Deux automatisations sur le même sélecteur : la dernière qui s'exécute gagne. Gardez-en une seule.
- Testez chaque capteur contre `unavailable` et `unknown` ([pièges](RECETTES.fr.md#pièges-des-modes)).

---

[← Toutes les recettes](RECETTES.fr.md)
