Français

# Jour travaillé ou jour de congé

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** le chauffage, les volets et les lumières suivent une semaine « Jour travaillé » les jours où
l’on travaille, et une semaine « Jour de congé » le week-end et les jours fériés, sans rien faire à la main.

## Ce qu’il faut

- [Le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les choix `Jour travaillé` et
  `Jour de congé`. Prenez `Jour travaillé` comme **Mode par défaut** : les horaires que vos programmes ont déjà lui
  sont donnés.
- L’intégration **Jour ouvré** (**Paramètres → Appareils et services → Ajouter une intégration**, puis chercher
  « Jour ouvré »), réglée sur votre pays ou votre région. Elle crée un capteur (`binary_sensor`) allumé (`on`) un jour
  travaillé, éteint (`off`) le week-end et les jours fériés. Ci-dessous il s’appelle `binary_sensor.workday_sensor` :
  **le nom de votre capteur peut être différent, à adapter**.

## Étapes

1. Sur la carte, pour chaque programme, toucher **Modifier**, ouvrir **Mode**, choisir `Jour travaillé`, puis
   donner ses horaires dans **Horaires**. Faire de même avec `Jour de congé`
   ([Des horaires selon le mode](GUIDE_MODES.fr.md)). Si les deux semaines se ressemblent, une semaine peut
   reprendre l’autre (**Mêmes horaires que :**).
2. Dans **Paramètres → Automatisations et scènes**, créer cette automatisation (en YAML) :

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

3. Tester : changer le sélecteur à la main. La carte affiche **Mode : …** et les appareils suivent.

## Résultat

Un jour travaillé, les programmes suivent la semaine « Jour travaillé ». Le week-end et les jours fériés, ils suivent
la semaine « Jour de congé ». Le changement se fait quand le capteur change, en général à minuit.

## À savoir

- Le déclencheur `homeassistant: start` remet le bon mode après un redémarrage de Home Assistant.
- La condition évite de changer de mode quand le capteur est indisponible
  ([Les pièges des modes](RECETTE_PLUSIEURS_CAPTEURS.fr.md#les-pièges-des-modes)).
- Pour seulement donner **les horaires d’un dimanche aux jours fériés**, sans mode : [Les jours fériés](GUIDE_JOUR_FERIE.fr.md).
- Avec plusieurs capteurs (vacances scolaires, maison vide) : une seule automatisation, voir
  [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md).

---

[← Toutes les recettes](RECETTES.fr.md)
