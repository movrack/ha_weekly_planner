Français

# Un capteur « jour férié ou congé scolaire »

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** savoir **si aujourd’hui est férié ou un jour de congé scolaire**, avec un capteur qui se met à
jour tout seul, et le donner à Weekly Planner comme entité de [jour férié](GUIDE_JOUR_FERIE.fr.md).

## Ce qu’il faut

- L’intégration **Jours fériés** (**Paramètres → Appareils et services → Ajouter une intégration**, puis chercher
  « Jours fériés ») réglée sur **votre pays** (et votre région si elle existe). Elle crée une entité calendrier, `on`
  pendant chaque jour férié. Ici `calendar.belgique` : **le nom dépend de votre pays, à adapter**.
- Un calendrier des vacances scolaires, `on` pendant les vacances : voir [Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md).
  Ici `calendar.vacances_scolaires`.

## Étapes

1. **Paramètres → Appareils et services → Entrées → Créer une entrée → Modèle → Capteur binaire**, nom
   `Jour férié` (entité `binary_sensor.jour_ferie`), modèle d’état :

   ```jinja
   {{ is_state('calendar.belgique', 'on') or is_state('calendar.vacances_scolaires', 'on') }}
   ```

2. Dans les options avancées, ajouter un modèle de disponibilité, pour qu’une panne d’un calendrier ne passe pas pour
   « pas de congé » :

   ```jinja
   {{ states('calendar.belgique') not in ['unavailable', 'unknown']
      and states('calendar.vacances_scolaires') not in ['unavailable', 'unknown'] }}
   ```

3. Choisir `binary_sensor.jour_ferie` dans **Paramètres → Appareils et services → Weekly Planner → Configurer →
   Réglages → Mode et jour férié → Jour férié ou congé (facultatif)**. Laisser **Cette entité est allumée les jours
   travaillés, pas les jours fériés** décoché ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)).

## Résultat

Le capteur est `on` les jours fériés et les jours de congé scolaire, `off` sinon, sans aucune automatisation.
Chaque programme qui a des horaires à part pour les jours fériés les applique ces jours-là.

## À savoir

- Le capteur « Jour ouvré » ne dit pas pourquoi il est `off` (week-end ou jour férié) : d’où ce capteur dédié.
- Pour un capteur **uniquement** férié, retirer la partie `calendar.vacances_scolaires`. Pour un seul calendrier,
  Weekly Planner accepte directement l’entité calendrier : ce capteur n’est utile que pour en réunir plusieurs.
- Le week-end n’est pas compris : les horaires du week-end sont ceux de **Samedi** et **Dimanche** du programme.
- Pour un congé décidé à la main, voir l’[interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md).

---

[← Toutes les recettes](RECETTES.fr.md)
