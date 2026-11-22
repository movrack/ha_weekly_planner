Français

# Premier programme

Testée avec la version 0.29.0.

Pour suivre cette page, Weekly Planner est installé et sa carte est sur un tableau de bord
([Installer et mettre à jour](INSTALLER_METTRE_A_JOUR.fr.md)). Il faut être administrateur de Home Assistant.

L’exemple : le chauffage du salon est à **Confort = 20 °C** tous les jours de 6 h 30 à 8 h 30. Vous pouvez
prendre un autre appareil : volet, lumière, prise…

## 1. Créer le programme

1. Ouvrir le tableau de bord, passer en modification, puis ouvrir la carte **Weekly Planner**.
2. Ouvrir l’onglet **Réglages des programmes**.
3. Dans **Programme à modifier**, choisir **Nouveau programme**.
4. Saisir le **Nom** du programme, par exemple « Chauffage du salon ».
5. Sous **Appareils**, choisir l’appareil avec **Ajouter un appareil**. On peut en ajouter d’autres.
6. Pour chaque appareil, cocher les **Actions proposées** utiles : ce sont les commandes que Home Assistant
   lui connaît. Pour un chauffage, cocher celle qui règle la température.
7. Toucher **Créer le programme**. Il est enregistré tout de suite, pour toutes les cartes qui le montrent.
8. Toucher **Enregistrer** dans la fenêtre de modification de la carte pour garder son affichage.

La carte annonce que le programme est créé et choisi pour cette carte.

<!-- CAPTURE: prog-nouveau-programme | Onglet « Réglages des programmes » : formulaire Nouveau programme rempli (nom, un chauffage, actions cochées) avant « Créer le programme » | démo : programme « Chauffage du salon », entité climate -->
<!-- CAPTURE: prog-programme-cree | Onglet « Affichage de la carte » après la création : message de confirmation et bouton « Définir les horaires » | démo : programme venant d’être créé -->

## 2. Ajouter le premier horaire

1. Toucher **Définir les horaires**. Plus tard, le crayon du calendrier à droite du nom de l’appareil sur la
   carte ouvre la même fenêtre.
2. Sous **Horaires**, toucher **Créer un réglage**. Si des horaires existent déjà, le bouton s’appelle
   **Ajouter un horaire**.
3. Sous **Jours**, choisir **Tous les jours**.
4. Sous **Début**, saisir **06:30**. Sous **Fin**, choisir **Jusqu’à…**, puis saisir **08:30**.
5. Sous **Réglage**, toucher **Nouveau réglage** : nommer **Confort**, choisir une couleur, choisir ce que
   le réglage doit faire (régler la température), saisir **20**, puis **Enregistrer**.
6. Toucher **Enregistrer** sous l’horaire.

La semaine de l’appareil montre maintenant une barre colorée de 6 h 30 à 8 h 30, chaque jour.

<!-- CAPTURE: prog-premier-horaire | Le formulaire d’horaire rempli : Jours, Début 06:30, Fin 08:30, réglage Confort | démo : programme « Chauffage du salon », aucun horaire encore -->
<!-- CAPTURE: prog-semaine | La fenêtre des horaires avec la barre Confort chaque jour | démo : un horaire enregistré -->

## Et ensuite

- Un réglage pour le reste de la journée, d’autres horaires, des copies sur d’autres jours :
  [Guide utilisateur](GUIDE.fr.md).
- Un exemple complet à recopier : [Recettes](RECETTES.fr.md).
- Si une liste d’actions est vide, ou si une action manque : voir **Appareils → Actions proposées** dans
  l’onglet **Réglages des programmes** de la carte.

[Accueil](ACCUEIL.fr.md)
