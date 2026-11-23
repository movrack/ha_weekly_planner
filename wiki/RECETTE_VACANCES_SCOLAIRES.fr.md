Français

# Vacances scolaires

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** pendant les vacances scolaires, tous les programmes passent sur leurs horaires « Vacances
scolaires » (volets ouverts plus tard, chauffage de la journée…), et reviennent à « Jour travaillé » ensuite.

## Ce qu’il faut

- [Le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les choix `Vacances scolaires`
  et `Jour travaillé`.
- **Un calendrier des vacances de l’école.** Une entité calendrier (`calendar.…`) est allumée (`on`) pendant un
  événement. Deux façons de l’avoir, à votre choix :
  - l’intégration **Calendrier local** : vous créez les événements « Vacances » avec leurs dates (l’école ou le
    ministère publie les dates de l’année scolaire) ;
  - l’intégration **Calendrier distant**, si votre école ou votre région publie ses dates dans un calendrier au
    format `.ics`.

  Ci-dessous, l’entité s’appelle `calendar.vacances_scolaires` : **c’est un nom d’exemple, à adapter** à ce que vous
  avez créé.

## Étapes

1. Sur la carte, pour chaque programme, toucher **Modifier**, ouvrir **Mode**, choisir `Vacances scolaires`, puis
   donner ses horaires dans **Horaires** ([Des horaires selon le mode](GUIDE_MODES.fr.md)).
2. Dans **Paramètres → Automatisations et scènes**, créer cette automatisation (en YAML) :

   ```yaml
   alias: Weekly Planner – mode vacances scolaires
   mode: restart
   triggers:
     - trigger: state
       entity_id: calendar.vacances_scolaires
     - trigger: homeassistant
       event: start
   conditions:   # ne rien changer si le calendrier est indisponible
     - condition: template
       value_template: >-
         {{ states('calendar.vacances_scolaires') in ['on', 'off'] }}
   actions:
     - action: input_select.select_option
       target:
         entity_id: input_select.mode_maison
       data:
         option: >-
           {{ 'Vacances scolaires' if is_state('calendar.vacances_scolaires', 'on') else 'Jour travaillé' }}
   ```

## Résultat

Pendant les vacances, le mode est « Vacances scolaires » ; le reste du temps, « Jour travaillé ».

## À savoir

- Un événement qui dure toute la journée allume le calendrier jusqu’à minuit : le dernier jour des vacances compte
  donc comme un jour de vacances.
- Pour combiner avec le jour travaillé et le jour de congé, utilisez une seule automatisation :
  [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md).
- Le sélecteur ne doit être changé que par cette automatisation
  ([Les pièges des modes](RECETTE_PLUSIEURS_CAPTEURS.fr.md#les-pièges-des-modes)).

---

[← Toutes les recettes](RECETTES.fr.md)
