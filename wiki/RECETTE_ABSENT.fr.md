# Absent quand personne n'est à la maison

**À quoi ça sert :** quand la maison est vide, tous les programmes passent sur leurs horaires « Absent ».

## Ce qu'il faut

- [le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec en plus l'option `Absent`.
- L'automatisation de la recette [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md).
- Une entité `person` par habitant : l'état de `zone.home` est le nombre de personnes présentes.

## Étapes

1. Dans l'écran des horaires de chaque programme, donnez des horaires au mode `Absent`.
2. Dans l'automatisation, ajoutez `zone.home` à la liste `entity_id` du déclencheur.
3. Ajoutez le test `Absent` en tête de l'ordre de priorité :

   ```yaml
         option: >-
           {{ 'Absent' if is_state('zone.home', '0')
              else 'Vacances scolaires' if is_state('binary_sensor.vacances_scolaires', 'on')
              else 'Jour travaillé' if is_state('binary_sensor.workday_sensor', 'on')
              else 'Jour de congé' }}
   ```

## Résultat

Dès que la dernière personne part, le mode passe à « Absent » ; au retour de quelqu'un, le mode suivant de la liste reprend.

## À savoir

- Une maison sans aucune entité `person` serait toujours « Absent ».

---

[← Toutes les recettes](RECETTES.fr.md)
