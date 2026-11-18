# Vacances scolaires

**À quoi ça sert :** pendant les vacances scolaires, tous les programmes passent sur leurs horaires « Vacances scolaires ».

## Ce qu'il faut

- [le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les options `Vacances scolaires` et `Jour travaillé`.
- Une entité `on` pendant les vacances scolaires : une intégration de vacances scolaires (par exemple via
  HACS), ou un **calendrier** dont les événements sont les vacances (une entité calendrier est `on`
  pendant un événement). Ci-dessous, `binary_sensor.vacances_scolaires`.

## Étapes

1. Dans l'écran des horaires de chaque programme, donnez des horaires au mode `Vacances scolaires`.
2. Créez cette automatisation :

   ```yaml
   alias: Weekly Planner – mode vacances scolaires
   mode: restart
   triggers:
     - trigger: state
       entity_id: binary_sensor.vacances_scolaires   # ou calendar.vacances_scolaires
     - trigger: homeassistant
       event: start
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Vacances scolaires' if is_state('binary_sensor.vacances_scolaires', 'on') else 'Jour travaillé' }}
   ```

## Résultat

Pendant les vacances, le mode est « Vacances scolaires » ; le reste du temps, « Jour travaillé ».

## À savoir

- Pour combiner avec le jour travaillé et le jour de congé, utilisez une seule automatisation :
  [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md).
- Ajoutez une condition contre un capteur indisponible ([pièges](RECETTES.fr.md#pièges-des-modes)).

---

[← Toutes les recettes](RECETTES.fr.md)
