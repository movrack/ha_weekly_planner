Français

# Plusieurs capteurs, un seul ordre de priorité

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** choisir le mode de la maison à partir de plusieurs capteurs (vacances, jour travaillé…) sans que
deux automatisations se disputent le sélecteur.

## Ce qu’il faut

- [Le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les choix `Vacances scolaires`,
  `Jour travaillé` et `Jour de congé`.
- Les capteurs des recettes [Jour travaillé ou jour de congé](RECETTE_JOUR_TRAVAILLE.fr.md) et
  [Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md) (les noms sont ceux de ces pages : à adapter).

## Étapes

1. Supprimer ou désactiver les automatisations qui changent déjà ce sélecteur.
2. Créer une seule automatisation. Le premier test vrai gagne : mettez le plus important en premier.

   ```yaml
   alias: Weekly Planner – mode de la maison
   mode: restart
   triggers:
     - trigger: state
       entity_id:
         - calendar.vacances_scolaires
         - binary_sensor.workday_sensor
     - trigger: homeassistant
       event: start
   conditions:   # ne rien changer si un capteur est indisponible
     - condition: template
       value_template: >-
         {{ states('calendar.vacances_scolaires') in ['on', 'off']
            and states('binary_sensor.workday_sensor') in ['on', 'off'] }}
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Vacances scolaires' if is_state('calendar.vacances_scolaires', 'on')
              else 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on')
              else 'Jour de congé' }}
   ```

## Résultat

Pendant les vacances scolaires, même un jour travaillé, le mode est « Vacances scolaires ». Sinon un jour travaillé
donne « Jour travaillé », et tout le reste donne « Jour de congé ».

## Les pièges des modes

- **Les noms ne correspondent pas.** Une option écrite `Jour de Congé` n’utilise pas les horaires de
  `Jour de congé`. Copiez les noms.
- **Deux automatisations sur le même sélecteur.** La dernière qui s’exécute gagne. Gardez une automatisation par
  sélecteur.
- **Un changement manuel est écrasé** au prochain changement d’un capteur. Pour garder un choix manuel, ajoutez une
  condition à l’automatisation (par exemple un interrupteur `input_boolean.mode_manuel`).
- **Un capteur `unavailable` ou `unknown` change le mode.** Weekly Planner ne garde le dernier mode valide que
  lorsque c’est le **sélecteur** qui est indisponible. Un capteur qui passe à `unavailable` déclenche
  l’automatisation, et dans les modèles ci-dessus il n’est pas `on` : la branche « sinon » est choisie et le sélecteur
  change réellement (par exemple vers « Jour de congé »). C’est le rôle de la condition `conditions:` des
  recettes : elle ne laisse passer que les états utiles. Au démarrage, la branche `homeassistant: start` peut
  s’exécuter avant que les capteurs soient prêts : la même condition évite un mauvais mode jusqu’au prochain
  changement du capteur. Avec un seul capteur, la condition ne porte que sur lui ; avec plusieurs, elle les teste tous.
- **Un mode sans horaires ne veut pas dire « éteint ».** Un programme qui n’a pas d’horaire pour le mode actif suit
  **Le reste du temps** ([Des horaires selon le mode](GUIDE_MODES.fr.md)).

## À savoir

- Pour ajouter une maison vide (mode « Absent »), voir [Absent quand personne n’est à la maison](RECETTE_ABSENT.fr.md).
- Le mode est celui du sélecteur : Weekly Planner ne le change jamais
  ([Le sélecteur de mode](CONFIGURATION.fr.md#le-sélecteur-de-mode)).

---

[← Toutes les recettes](RECETTES.fr.md)
