# Recettes

Des exemples prêts à recopier, une recette par page.

## Le mode de la maison

Home Assistant choisit le mode à votre place, et tous les programmes suivent. Weekly Planner ne change
jamais le mode lui-même ([Modes](MODES.md)) : le mode est l'état d'un `input_select` (ou `select`), et
c'est une **automatisation** qui le déplace. Un capteur ne peut pas être le sélecteur : il **pilote** le
sélecteur.

- [Jour travaillé ou jour de congé](RECETTE_JOUR_TRAVAILLE.fr.md)
- [Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md)
- [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md)
- [Absent quand personne n'est à la maison](RECETTE_ABSENT.fr.md)

## Jours fériés et congés

- [Un interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md)
- [Un capteur « jour férié ou congé scolaire »](RECETTE_CAPTEUR_JOUR_FERIE.fr.md)

## Plusieurs programmes sur le même appareil

- [Superposer deux programmes : les priorités](PRIORITES.fr.md)
- [Garde alternée des enfants](RECETTE_GARDE_ALTERNEE.fr.md)
- [Réduire le chauffage pendant les heures de pointe](RECETTE_HEURES_DE_POINTE.fr.md)

## Avant une recette avec les modes

1. Créez le sélecteur : **Paramètres → Appareils et services → Entrées → Créer une entrée → Liste
   déroulante**. Exemple : `input_select.mode_maison` avec les options utilisées dans la recette
   (ici `Jour travaillé`, `Jour de congé`, `Vacances scolaires`).
2. Choisissez-le dans **Paramètres → Appareils et services → Weekly Planner → Configurer →
   Réglages → Mode et jour férié → Sélecteur de mode**, puis le mode par défaut.
3. Dans l'écran des horaires de chaque programme, donnez des horaires à chaque mode. Les noms
   doivent être **exactement** les options du sélecteur.
4. Créez l'automatisation de la recette. Testez d'abord en changeant le sélecteur à la main : la
   carte affiche **Mode : …** et les appareils suivent.

À savoir : un changement de mode recalcule le réglage de l'heure courante. Il ne rejoue pas le
passé, n'active pas un programme en pause et ne saute pas ses conditions.

## Pièges des modes

- **Les noms ne correspondent pas** : une option écrite `Jour de Congé` n'utilise pas les horaires
  de `Jour de congé`. Copiez les noms.
- **Deux automatisations sur le même sélecteur** : la dernière qui s'exécute gagne. Gardez une
  automatisation par sélecteur.
- **Un changement manuel est écrasé** au prochain changement d'un capteur. Pour garder un choix
  manuel, ajoutez une condition à l'automatisation (par exemple un `input_boolean` « mode manuel »).
- **Un capteur `unavailable` ou `unknown` change le mode** : Weekly Planner ne garde le dernier mode
  valide que lorsque c'est le **sélecteur** qui est indisponible. Un capteur qui passe à `unavailable`
  déclenche l'automatisation, et dans les modèles ci-dessus il n'est pas `on` : la branche « sinon » est
  choisie et le sélecteur change réellement (par exemple vers « Jour de congé »). Pour l'éviter, ajoutez
  une condition qui laisse passer seulement les états utiles, après `triggers:` :

  ```yaml
  conditions:
    - condition: template
      value_template: >-
        {{ not is_state('binary_sensor.workday_sensor', 'unavailable')
           and not is_state('binary_sensor.workday_sensor', 'unknown') }}
  ```

  Avec plusieurs capteurs ([Plusieurs capteurs](RECETTE_PLUSIEURS_CAPTEURS.fr.md)), testez chacun de la même façon. Au démarrage, la branche
  `homeassistant: start` peut s'exécuter avant que les capteurs soient prêts : la même condition évite
  alors un mauvais mode jusqu'au prochain changement du capteur.
