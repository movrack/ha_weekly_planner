Français

# Vacances : la maison en veille

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** pendant un voyage de quelques semaines, le chauffage tient hors gel (8 °C), les volets restent
fermés et deux lampes s’allument le soir à des heures un peu différentes chaque jour, pour que la maison ait l’air
habitée. Un seul geste, au départ : choisir le mode **Vacances**.

## Ce qu’il faut

- [Le sélecteur de mode préparé](RECETTES.fr.md#avant-une-recette-avec-les-modes), avec les choix `Maison` et
  `Vacances`. Prenez `Maison` comme **Mode par défaut** : les horaires que vos programmes ont déjà lui sont donnés.
- Trois programmes (les noms sont des exemples) :
  - « Chauffage » : `climate.salon` et `climate.chambre`, avec leur action de température cochée ;
  - « Volets » : `cover.volet_salon` et `cover.volet_cuisine`, avec leur action de position cochée ;
  - « Lumières de présence » : `light.salon` et `light.chambre_etage`, avec les actions pour allumer et éteindre
    cochées.
- Les réglages : **Hors gel** (8 °C), **Fermé** (position 0 %), **Présence** (allumer, luminosité 40 %) et
  **Éteinte** (éteindre). **8 °C est une valeur courante : choisissez au moins la température minimale que
  votre thermostat accepte.**

## Étapes

Pour chaque programme, sur la carte : **Modifier**, ouvrir **Mode**, choisir **Vacances**, puis régler **Horaires**
([Des horaires selon le mode](GUIDE_MODES.fr.md)). Le mode **Maison** garde ses horaires habituels.

1. **Chauffage** : un horaire **Tous les jours**, **Début** 00:00, **Durée** **Jusqu’à une heure**, **Fin** 00:00
   (minuit : toute la journée), **Réglage** **Hors gel**. Cocher les deux thermostats sous **Aussi pour :**.
2. **Volets** : le même horaire de 00:00 à 00:00, **Réglage** **Fermé**, pour les deux volets.
3. **Lumières de présence** : deux horaires **Tous les jours**, avec **À cette heure seulement** :
   - **Début** 18:30, **Réglage** **Présence** ; sous **Début**, **Options avancées**, cocher **Délai aléatoire
     (quelques minutes au hasard)** et saisir **30** sous **Délai maximum (minutes)** ;
   - **Début** 23:00, **Réglage** **Éteinte**, avec le même délai aléatoire de 30 minutes.

   Pour chacun, cocher les deux lampes sous **Aussi pour :**. Laisser **Le reste du temps** sur **Laisser tel quel**.
4. Le jour du départ, passer le sélecteur sur **Vacances** (par exemple avec une carte « Entités » du tableau de
   bord). Au retour, le remettre sur **Maison**.

## Résultat

Dès que le mode est **Vacances**, les thermostats reçoivent 8 °C et les volets se ferment à 0 %. Chaque soir, les
lampes s’allument au hasard entre 18 h 30 et 19 h, et s’éteignent entre 23 h et 23 h 30 (l’heure change d’un jour à
l’autre). Au retour, en repassant sur **Maison**, le chauffage reprend ses horaires
habituels.

## À savoir

- La **Suspension de tous les programmes** est autre chose : elle arrête tout, sans aucun horaire de vacances
  ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)). Ici les programmes continuent, avec les horaires du mode
  **Vacances**.
- Le mode **Vacances** n’est pas choisi par une date. Pour qu’un calendrier de voyage le choisisse, ajoutez-le en
  tête de l’ordre de priorité de l’automatisation de [Plusieurs capteurs](RECETTE_PLUSIEURS_CAPTEURS.fr.md).
- Les **lumières** n’ont pas d’horaire en mode **Maison**, et **Le reste du temps** reste sur **Laisser tel quel** :
  sinon le retour en mode **Maison** éteindrait les lampes.
- Au retour, les volets restent fermés jusqu’au prochain lever du soleil prévu par le mode **Maison** (voir
  [Volets : lever et coucher du soleil](RECETTE_VOLETS_SOLEIL.fr.md)) : ouvrez-les à la main si besoin.
- Un programme qui n’a pas d’horaire pour le mode **Vacances** suit son **Le reste du temps** : donnez un horaire
  **Vacances** à chaque programme qui doit changer.

---

[← Toutes les recettes](RECETTES.fr.md)
