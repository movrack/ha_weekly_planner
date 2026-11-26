Français

# Recettes

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Des exemples de maison réelle, à recopier : une recette par page, avec ses étapes dans l’ordre. Les noms d’entités
(`climate.salon`, `sensor.pluviometre_24h`…) sont des exemples : mettez ceux de votre installation.

## Chauffage, volets, eau et jardin

- [Chauffage : la semaine et le week-end](RECETTE_CHAUFFAGE_SEMAINE_WEEKEND.fr.md) : 19 °C en semaine, 20 °C le
  week-end, 16 °C la nuit.
- [Volets : lever et coucher du soleil, grasse matinée le week-end](RECETTE_VOLETS_SOLEIL.fr.md)
- [Volets d’été anti-chaleur](RECETTE_VOLETS_ETE.fr.md) : volets sud à 30 % de midi à 18 h les jours chauds.
- [Chauffe-eau en heures creuses](RECETTE_CHAUFFE_EAU.fr.md)
- [Arrosage du jardin](RECETTE_ARROSAGE.fr.md) : trois matins par semaine, pas les jours de pluie.
- [Chambre d’enfant : une veilleuse la nuit](RECETTE_VEILLEUSE_ENFANT.fr.md)
- [Voiture préchauffée le samedi avant le club](RECETTE_VOITURE_CHAUFFEE.fr.md) : à 10 h 30, sous 10 °C dehors.

## Le mode de la maison

Home Assistant choisit le mode à votre place, et tous les programmes suivent. Weekly Planner ne change jamais le mode
lui-même ([Le sélecteur de mode](CONFIGURATION.fr.md#le-sélecteur-de-mode)) : le mode est l’état d’un `input_select`
(ou `select`), et c’est une **automatisation** qui le déplace. Un capteur ne peut pas être le sélecteur : il
**pilote** le sélecteur.

- [Jour travaillé ou jour de congé](RECETTE_JOUR_TRAVAILLE.fr.md)
- [Vacances scolaires](RECETTE_VACANCES_SCOLAIRES.fr.md)
- [Plusieurs capteurs, un seul ordre de priorité](RECETTE_PLUSIEURS_CAPTEURS.fr.md) (avec
  [les pièges des modes](RECETTE_PLUSIEURS_CAPTEURS.fr.md#les-pièges-des-modes))
- [Absent quand personne n’est à la maison](RECETTE_ABSENT.fr.md)
- [Vacances : la maison en veille](RECETTE_VACANCES_VEILLE.fr.md) : hors gel, volets fermés, lumières de présence.

## Jours fériés et congés

- [Un interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md)
- [Un capteur « jour férié ou congé scolaire »](RECETTE_CAPTEUR_JOUR_FERIE.fr.md)

## Plusieurs programmes sur le même appareil

- [Les priorités : quel programme commande l’appareil](PRIORITES.fr.md), avec l’exemple du
  [télétravail](PRIORITES.fr.md#un-exemple-réel--le-télétravail) (le bureau à 21 °C les jours de télétravail).
- [Garde alternée des enfants](RECETTE_GARDE_ALTERNEE.fr.md)
- [Réduire le chauffage pendant les heures de pointe](RECETTE_HEURES_DE_POINTE.fr.md)

## Avant une recette avec les modes

1. Créer le sélecteur : **Paramètres → Appareils et services → Entrées → Créer une entrée → Liste déroulante**.
   Exemple : `input_select.mode_maison` avec les options utilisées dans la recette (ici `Jour travaillé`,
   `Jour de congé`, `Vacances scolaires`).
2. Le choisir dans **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages → Mode et jour
   férié → Sélecteur de mode (facultatif)**, puis le **Mode par défaut**.
3. Sur la carte, pour chaque programme, **Modifier**, **Mode** : donner des horaires à chaque mode. Les noms doivent
   être **exactement** les options du sélecteur ([Des horaires selon le mode](GUIDE_MODES.fr.md)).
4. Créer l’automatisation de la recette. Tester d’abord en changeant le sélecteur à la main : la carte affiche
   **Mode : …** et les appareils suivent.

À savoir : un changement de mode recalcule le réglage de l’heure courante. Il ne rejoue pas le passé, n’active pas un
programme en pause et ne saute pas ses conditions.

[Accueil](ACCUEIL.fr.md) · [Guide : je veux…](GUIDE.fr.md)
