Français

# Un interrupteur « Jour férié »

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** appliquer d’autres horaires un jour de congé décidé à la main (un pont, un jour posé), **sans
changer de mode**, en allumant un interrupteur.

## Ce qu’il faut

- Un interrupteur « Jour férié » : **Paramètres → Appareils et services → Entrées → Créer une entrée →
  Interrupteur** (entité `input_boolean.jour_ferie`).

## Étapes

1. Le choisir dans **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages → Mode et jour
   férié → Jour férié ou congé (facultatif)**. Laisser **Cette entité est allumée les jours travaillés, pas les jours
   fériés** décoché : interrupteur allumé veut dire « aujourd’hui est férié ».
2. Sur la carte, pour chaque programme concerné, toucher **Modifier**, ouvrir **Horaires**, puis **Jour férié** à la
   fin de la partie, et activer **Horaires à part les jours fériés** : les mêmes horaires qu’un jour de la semaine
   (dimanche au départ) ou des horaires propres ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)).
3. Ajouter l’interrupteur à un tableau de bord.
4. Pour ne pas l’oublier allumé, créer cette automatisation qui l’éteint chaque nuit :

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

## Résultat

Allumé, l’interrupteur applique les horaires du jour férié environ 30 secondes plus tard. Éteint, le jour normal
revient. Un programme sans ce réglage garde son jour normal.

## À savoir

- Avec l’automatisation de minuit, allumez l’interrupteur le jour même, pas la veille.
- Pour les jours fériés officiels en plus, utilisez un
  [capteur « jour férié ou congé scolaire »](RECETTE_CAPTEUR_JOUR_FERIE.fr.md) avec ce modèle d’état, et choisissez-le à
  l’étape 1 à la place de l’interrupteur :

  ```jinja
  {{ is_state('calendar.belgique', 'on') or is_state('input_boolean.jour_ferie', 'on') }}
  ```

- Le mode est prioritaire sur le jour férié. Le jour férié ne s’applique qu’au mode actuel : quand le mode change, le
  nouveau mode applique son propre réglage de jour férié.

---

[← Toutes les recettes](RECETTES.fr.md)
