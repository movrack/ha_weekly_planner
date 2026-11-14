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

## Recette 6 : un interrupteur « Jour férié »

Weekly Planner peut appliquer d'autres horaires les jours fériés ou de congé, **sans changer de mode** :
une entité lui dit si aujourd'hui est un tel jour. La plus simple est un interrupteur (`input_boolean`)
que vous allumez vous-même, par exemple pour un jour de congé.

1. Créez l'interrupteur : **Paramètres → Appareils et services → Entrées → Créer une entrée →
   Interrupteur**, nom `Jour férié` (entité `input_boolean.jour_ferie`).
2. Choisissez-le dans **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages →
   Mode et jour férié → Jour férié ou congé**. Laissez **Cette entité est allumée les jours travaillés, pas les jours fériés**
   décoché : interrupteur allumé veut dire « aujourd'hui est férié ».
3. Dans la fenêtre des horaires de chaque programme concerné, ouvrez **Jour férié** sous la semaine et
   activez **Horaires différents les jours fériés** : les mêmes horaires qu'un jour de la semaine
   (dimanche au départ) ou des horaires propres. Un programme sans ce réglage garde son jour normal.
4. Ajoutez l'interrupteur à un tableau de bord. Allumez-le le jour de congé : les horaires du jour férié
   s'appliquent après 30 secondes. Éteignez-le pour revenir au jour normal.

Pour ne pas l'oublier allumé, cette automatisation l'éteint chaque nuit :

```yaml
alias: Weekly Planner – éteindre « Jour férié » à minuit
triggers:
  - trigger: time
    at: "00:00:00"
actions:
  - action: input_boolean.turn_off
    target:
      entity_id: input_boolean.jour_ferie
```

Avec elle, allumez l'interrupteur le jour même, pas la veille.

**Jours fériés officiels en plus, sans y penser** : gardez l'interrupteur pour vos congés et créez le
capteur de la [note ci-dessous](#note--un-capteur--jour-férié-ou-congé-scolaire--seul), nommé par exemple
`Férié ou congé`, avec ce modèle d'état :

```jinja
{{ is_state('calendar.belgique', 'on') or is_state('input_boolean.jour_ferie', 'on') }}
```

Choisissez alors ce capteur à l'étape 2, à la place de l'interrupteur.

À savoir : le mode est prioritaire sur le jour férié. Le jour férié ne s'applique qu'au mode actuel :
quand le mode change, le nouveau mode applique son propre réglage de jour férié.

## Note : un capteur « jour férié ou congé scolaire » seul

Le capteur « Jour ouvré » ne dit pas pourquoi il est `off` (week-end ou jour férié). Pour savoir **si
aujourd'hui est férié ou un jour de congé scolaire**, créez un capteur dédié, `on` ces jours-là et
`off` sinon :

1. Ajoutez l'intégration **Jours fériés** (Holiday : Paramètres → Appareils et services → Ajouter une
   intégration) avec votre pays. Elle crée une entité calendrier (ici `calendar.belgique`) qui est `on`
   pendant le jour férié, car chaque jour férié y est un événement sur la journée entière.
2. Ayez aussi un calendrier des vacances scolaires (ici `calendar.vacances_scolaires_fwb`), `on` pendant
   les vacances ([recette 2](#recette-2--vacances-scolaires)).
3. **Paramètres → Appareils et services → Entrées → Créer une entrée → Modèle → Capteur binaire**,
   nom `Jour férié` (entité `binary_sensor.jour_ferie`), modèle d'état :

   ```jinja
   {{ is_state('calendar.belgique', 'on') or is_state('calendar.vacances_scolaires_fwb', 'on') }}
   ```

   Dans les options avancées, ajoutez un modèle de disponibilité pour qu'une panne d'un calendrier ne
   passe pas pour « pas de congé » (voir Pièges) :

   ```jinja
   {{ states('calendar.belgique') not in ['unavailable', 'unknown']
      and states('calendar.vacances_scolaires_fwb') not in ['unavailable', 'unknown'] }}
   ```

Pour un capteur **uniquement** férié, retirez la partie `calendar.vacances_scolaires_fwb`. Utilisez
ensuite `binary_sensor.jour_ferie` comme déclencheur ou condition d'une recette, ou choisissez-le comme
entité **Jour férié ou congé** de Weekly Planner ([recette 6](#recette-6--un-interrupteur--jour-férié-),
étape 2). Pour des jours qui se calculent seuls, un capteur binaire est préférable à une entrée
« interrupteur » (`input_boolean`) : aucune automatisation ne doit le mettre à jour. L'interrupteur
reste utile pour un congé décidé à la main (recette 6). Le week-end n'est pas compris : ajoutez-le avec
« Jour ouvré » si besoin.

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
