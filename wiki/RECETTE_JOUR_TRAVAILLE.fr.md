# Jour travaillé ou jour de congé

**À quoi ça sert :** le chauffage, les volets et les lumières suivent une semaine « Jour travaillé » ou « Jour de congé », sans rien faire à la main.

## Ce qu'il faut

- [le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les options `Jour travaillé` et `Jour de congé`.
- L'intégration **Jour ouvré** (Workday : Paramètres → Appareils et services → Ajouter une intégration).
  Elle fournit un `binary_sensor` à `on` un jour travaillé et à `off` le week-end et les jours fériés de
  votre pays ou région. Ci-dessous, il s'appelle `binary_sensor.workday_sensor`.

## Étapes

1. Dans l'écran des horaires de chaque programme, donnez des horaires aux modes `Jour travaillé` et
   `Jour de congé`.
2. Créez cette automatisation :

   ```yaml
   alias: Weekly Planner – mode jour travaillé / jour de congé
   mode: restart
   triggers:
     - trigger: state
       entity_id: binary_sensor.workday_sensor
     - trigger: homeassistant
       event: start
   conditions:   # ne rien changer si le capteur est indisponible
     - condition: template
       value_template: >-
         {{ states('binary_sensor.workday_sensor') in ['on', 'off'] }}
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on') else 'Jour de congé' }}
   ```

3. Testez en changeant le sélecteur à la main : la carte affiche **Mode : …** et les appareils suivent.

## Résultat

Un jour travaillé, les programmes suivent la semaine « Jour travaillé » ; le week-end et les jours fériés, la semaine « Jour de congé ».

## À savoir

- Le déclencheur `homeassistant: start` remet le bon mode après un redémarrage.
- La condition évite de changer de mode quand le capteur est indisponible ([pièges](RECETTES.fr.md#pièges-des-modes)).

---

[← Toutes les recettes](RECETTES.fr.md)
