Français

# Comprendre ce qui s’est passé

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** savoir ce que Weekly Planner a demandé à un appareil, ce qui était prévu, et ce que
l’appareil a vraiment fait. Exemple : le salon était froid hier soir, pourquoi ?

## Ce qu’il faut

- Un programme avec au moins un horaire.
- L’historique de Home Assistant (Recorder) pour la partie « enregistré » du graphique. Les horaires fonctionnent
  sans lui.

## Voir ce que Weekly Planner a envoyé : le Journal

1. Ouvrir **Journal** dans la barre latérale de Home Assistant.
2. Chercher l’appareil, ou les lignes nommées **Weekly Planner**.

Chaque envoi laisse une ligne rattachée à l’appareil :

- **action lancée :** et l’action (par exemple `climate.set_temperature`) ;
- **indisponible : sera appliqué à son retour** : l’appareil ne répondait pas, l’action part dès qu’il revient ;
- **action impossible :** et l’action : Home Assistant a refusé la commande.

Il y a une ligne par décision, pas une par tentative.

## Voir le graphique du jour

1. Sur la carte, sous l’appareil, toucher **Graphique du jour**. Un second toucher le referme. Dans la fenêtre
   des horaires, le graphique est sous les horaires.
2. Dans la fenêtre des horaires, les flèches **Jour précédent** et **Jour suivant** changent de jour : jusqu’à 14
   jours en arrière et 7 jours en avant. Entre les flèches, le texte dit **Aujourd’hui** ou la date du jour
   affiché.
3. Toucher le graphique ouvre l’historique de Home Assistant pour l’appareil.

Le graphique met côte à côte ce qui était prévu (**Prévu**) et les données de l’appareil (par exemple
**Valeur mesurée**). Les réglages qui n’ont pas de valeur chiffrée (Confort, Éco…) apparaissent dans une rangée
**Programme** sous les courbes : chaque bande porte le nom et la couleur du réglage, y compris le reste du temps.

Le texte sous le graphique distingue :

- **Aucun historique enregistré pour cette journée.** : l’appareil n’a rien enregistré ce jour-là ;
- **Aucun réglage prévu pour cet appareil ce jour-là.** : aucun horaire ne s’appliquait ;
- **L’historique apparaîtra quand l’appareil aura communiqué son état.** : pour une journée à venir ;
- **Impossible de charger l’historique. Les réglages prévus restent affichés.**

S’il manque des mesures, cela ne prouve pas que l’horaire n’a pas fonctionné.

Un repère rouge, nommé **Manuel** dans la légende, indique un changement fait à la main. Le programme ne corrige
pas un réglage fait à la main : il reste jusqu’au prochain changement d’horaire, où le programme reprend la main.
Exemple : 18 °C de 10 h à 20 h, puis 17 °C de 20 h à 21 h ; un réglage à 20 °C à 12 h reste jusqu’à 20 h, puis
17 °C est envoyé.

## Comparer avec une autre entité

Exemple : pour voir si une fenêtre ouverte explique le froid du salon, ajouter le capteur d’ouverture de la
fenêtre et le capteur de température de la pièce au graphique du thermostat.

1. Ouvrir la fenêtre des horaires de l’appareil (**Modifier**). Les **Options du graphique** sont dans la colonne
   de gauche sur ordinateur, sous le graphique sur téléphone. Elles n’existent pas sur la carte du tableau de
   bord, mais les courbes choisies y restent affichées.
2. Ouvrir **Options du graphique** (replié au départ), puis toucher **Ajouter une entité** et chercher son nom.
3. Facultatif : saisir un **Nom affiché** (60 caractères au plus) pour la légende. Le vider reprend le nom de Home
   Assistant.
4. Pour un capteur chiffré (température, humidité), une courbe s’ajoute. Chaque unité a son échelle colorée ; trois
   unités différentes au plus. Au-delà, l’écran dit « Trois unités sont déjà affichées. Retirez d’abord une courbe
   d’une autre unité. »
5. Pour une entité à états (fenêtre, porte, présence), cocher les **États à mettre en évidence**, par exemple
   **Ouvert** : chaque état coché a sa couleur et les autres restent neutres.

<!-- CAPTURE: guide-graphique-sources | La fenêtre des horaires à deux colonnes : le graphique du jour avec une courbe de température et une bande « Ouvert » d’une fenêtre, et les Options du graphique ouvertes | 1440 ; démo : thermostat du salon, capteur de température et capteur de fenêtre -->

Les choix s’enregistrent tout seuls (« Enregistrement… » puis « Enregistré ») et valent pour cet appareil dans ce
programme, sur la carte comme dans la fenêtre. La croix **Retirer … du graphique** retire seulement la source du
graphique, sans rien changer à l’appareil. Une entité qui a disparu reste dans les options, signalée, pour la
retrouver ou la retirer. En **Lecture seule**, les sources se consultent mais ne se modifient pas.

## À savoir

- Un appareil qui n’a pas bougé : vérifier d’abord que le programme est en marche, que le mode actif est celui qui a
  des horaires et qu’aucune pause n’est en cours ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)).
- Pour le faire repartir après une panne : [Après une panne](GUIDE_APRES_PANNE.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
