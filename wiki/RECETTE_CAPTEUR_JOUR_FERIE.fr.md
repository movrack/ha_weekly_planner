# Un capteur « jour férié ou congé scolaire »

**À quoi ça sert :** savoir **si aujourd'hui est férié ou un jour de congé scolaire**, avec un capteur qui se met à jour tout seul.

## Ce qu'il faut

- L'intégration **Jours fériés** (Holiday : Paramètres → Appareils et services → Ajouter une
  intégration) avec votre pays. Elle crée une entité calendrier (ici `calendar.belgique`), `on` pendant
  chaque jour férié.
- Un calendrier des vacances scolaires (ici `calendar.vacances_scolaires_fwb`), `on` pendant les vacances
  ([Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md)).

## Étapes

1. **Paramètres → Appareils et services → Entrées → Créer une entrée → Modèle → Capteur binaire**, nom
   `Jour férié` (entité `binary_sensor.jour_ferie`), modèle d'état :

   ```jinja
   {{ is_state('calendar.belgique', 'on') or is_state('calendar.vacances_scolaires_fwb', 'on') }}
   ```

2. Dans les options avancées, ajoutez un modèle de disponibilité, pour qu'une panne d'un calendrier ne
   passe pas pour « pas de congé » :

   ```jinja
   {{ states('calendar.belgique') not in ['unavailable', 'unknown']
      and states('calendar.vacances_scolaires_fwb') not in ['unavailable', 'unknown'] }}
   ```

3. Utilisez `binary_sensor.jour_ferie` comme déclencheur ou condition d'une recette, ou choisissez-le
   comme entité **Jour férié ou congé** de Weekly Planner
   ([Un interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md), étape 1).

## Résultat

Le capteur est `on` les jours fériés et les jours de congé scolaire, `off` sinon, sans aucune automatisation.

## À savoir

- Le capteur « Jour ouvré » ne dit pas pourquoi il est `off` (week-end ou jour férié) : d'où ce capteur dédié.
- Pour un capteur **uniquement** férié, retirez la partie `calendar.vacances_scolaires_fwb`.
- Le week-end n'est pas compris : ajoutez-le avec « Jour ouvré » si besoin.
- Pour un congé décidé à la main, gardez l'[interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md).

---

[← Toutes les recettes](RECETTES.fr.md)
