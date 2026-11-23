Français

# Chauffage : la semaine et le week-end

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** chauffer le salon à 19 °C le matin et le soir en semaine, à 20 °C toute la journée le
week-end (on est à la maison), et à 16 °C la nuit.

| Quand ? | Consigne |
|---|---|
| Du lundi au vendredi, de 6 h 30 à 8 h 30 et de 17 h à 22 h 30 | 19 °C |
| Samedi et dimanche, de 8 h à 22 h 30 | 20 °C |
| Le reste du temps | 16 °C |

## Ce qu’il faut

- Un programme avec le thermostat du salon (`climate.salon` dans l’exemple), dont l’action qui règle la température
  est cochée sous **Actions proposées** ([Premier programme](PREMIER_PROGRAMME.fr.md)).
- Trois réglages de température : **Semaine** (19 °C), **Week-end** (20 °C) et **Nuit** (16 °C). Pour créer un
  réglage : [Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md).

## Étapes

1. Sur la carte, toucher **Modifier** à droite du thermostat, ouvrir **Réglages**, puis **Nouveau réglage** pour
   chacun des trois : l’action qui règle la température, avec 19, 20 et 16.
2. Ouvrir **Horaires**, puis **Ajouter un horaire** : sous **Jours**, toucher **En semaine** ; **Début** 06:30,
   **Durée** **Jusqu’à une heure**, **Fin** 08:30 ; **Réglage** **Semaine** ; **Enregistrer**.
3. Ajouter un second horaire de la même façon : **En semaine**, de 17:00 à 22:30, **Semaine**.
4. Ajouter l’horaire du week-end : sous **Jours**, toucher **Week-end** ; de 08:00 à 22:30, **Week-end**.
5. Toucher la ligne **Le reste du temps** (au-dessus de la liste des horaires), choisir **Nuit**, puis **Enregistrer**.

<!-- CAPTURE: recette-chauffage-semaine | La carte avec la semaine ouverte (bouton Semaine) : du lundi au vendredi deux barres, samedi et dimanche une longue barre | 360 ; démo : programme « Chauffage du salon », réglages Semaine, Week-end et Nuit -->

## Résultat

Du lundi au vendredi, le thermostat reçoit 19 °C à 6 h 30 et à 17 h, et 16 °C à 8 h 30 et à 22 h 30. Le samedi et le
dimanche, il reçoit 20 °C à 8 h et 16 °C à 22 h 30. Le bouton **Semaine** de la carte montre la différence.

## À savoir

- Hors des horaires (la nuit, et en semaine de 8 h 30 à 17 h), c’est **Le reste du temps** (16 °C) qui s’applique. Le
  thermostat reçoit cette consigne à la fin de chaque horaire.
- Pour modifier un horaire ou le copier sur d’autres jours : [Modifier ou copier un horaire](GUIDE_MODIFIER_COPIER.fr.md).
- Pour les jours fériés comme un dimanche : [Les jours fériés](GUIDE_JOUR_FERIE.fr.md).
- Le même principe marche avec d’autres chauffages (radiateur électrique, vanne de radiateur) : seule l’action change.

---

[← Toutes les recettes](RECETTES.fr.md)
