# Recettes pour les modes

Des recettes pour que Home Assistant choisisse le mode à votre place, et que tous les programmes
suivent. Weekly Planner ne change jamais le mode lui-même ([Modes](Modes)) : le mode est l'état d'un
`input_select` (ou `select`), et c'est une **automatisation** qui le déplace. Un capteur ne peut pas
être le sélecteur : il **pilote** le sélecteur.

## Avant toute recette

1. Créez le sélecteur : **Paramètres → Appareils et services → Entrées → Créer une entrée → Liste
   déroulante**. Exemple : `input_select.mode_maison` avec les options utilisées dans la recette
   (ici `Jour travaillé`, `Jour de congé`, `Vacances scolaires`).
2. Choisissez-le dans **Paramètres → Appareils et services → Weekly Planner → Configurer →
   Sélecteur de mode**, puis le mode par défaut.
3. Dans l'écran des horaires de chaque programme, donnez des horaires à chaque mode. Les noms
   doivent être **exactement** les options du sélecteur.
4. Créez l'automatisation de la recette. Testez d'abord en changeant le sélecteur à la main : la
   carte affiche **Mode : …** et les appareils suivent.

À savoir : un changement de mode recalcule le réglage de l'heure courante. Il ne rejoue pas le
passé, n'active pas un programme désactivé et ne saute pas ses conditions.

## Recette 1 : jour travaillé ou jour de congé

L'intégration **Jour ouvré** (Workday : Paramètres → Appareils et services → Ajouter une
intégration) fournit un `binary_sensor` à `on` un jour travaillé et à `off` le week-end et les jours
fériés de votre pays ou région. Donnez-lui le nom que vous voulez ; ci-dessous c'est
`binary_sensor.workday_sensor`.

```yaml
alias: Weekly Planner – mode jour travaillé / jour de congé
mode: restart
triggers:
  - trigger: state
    entity_id: binary_sensor.workday_sensor
  - trigger: homeassistant
    event: start
conditions:   # ne rien changer si le capteur est indisponible (voir Pièges)
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

Le déclencheur `homeassistant: start` remet le bon mode après un redémarrage. Résultat : le chauffage,
les volets et les lumières suivent la semaine « Jour travaillé » un jour travaillé et la semaine
« Jour de congé » un jour férié, sans rien faire à la main.

## Recette 2 : vacances scolaires

Toute entité qui est `on` pendant les vacances scolaires convient : une intégration de vacances
scolaires (par exemple via HACS), ou un **calendrier** dont les événements sont les vacances (une
entité calendrier est `on` pendant un événement). La recette est la même, avec cette entité :

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

## Recette 3 : plusieurs capteurs, un seul ordre de priorité

Avec un seul sélecteur, **une** automatisation doit décider, sinon deux automatisations se
disputent. Le premier test vrai gagne : mettez le plus important en premier.

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

Lecture : pendant les vacances scolaires, même un jour travaillé, le mode est « Vacances scolaires ».
Sinon un jour travaillé donne « Jour travaillé », et tout le reste donne « Jour de congé ».

## Recette 4 : absent quand personne n'est à la maison

Ajoutez un test en tête de l'ordre de priorité, par exemple avec l'entité `zone.home` (son état est
le nombre de personnes présentes) :

```yaml
      option: >-
        {{ 'Absent' if is_state('zone.home', '0')
           else 'Vacances scolaires' if is_state('binary_sensor.vacances_scolaires', 'on')
           else 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on')
           else 'Jour de congé' }}
```

Ajoutez `zone.home` à la liste `entity_id` du déclencheur, et `Absent` aux options du sélecteur
(avec ses horaires). `zone.home` compte les entités `person` présentes : une maison sans aucune
entité `person` serait toujours « Absent ».

## Recette 5 : ne pas écrire deux fois la même semaine

Deux modes presque identiques n'ont pas besoin de deux copies des horaires. Dans l'écran des
horaires, **Options avancées → Mêmes horaires que** permet à « Jour de congé » d'utiliser les horaires de
« Vacances scolaires » (ou l'inverse), pour chaque programme ; une modification faite dans la source
se voit tout de suite ([Modes](Modes)).

## Pièges

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

  Avec plusieurs capteurs (recette 3), testez chacun de la même façon. Au démarrage, la branche
  `homeassistant: start` peut s'exécuter avant que les capteurs soient prêts : la même condition évite
  alors un mauvais mode jusqu'au prochain changement du capteur.
