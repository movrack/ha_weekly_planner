Français

# Premier programme

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Pour suivre cette page, Weekly Planner est installé, l’entrée **Weekly Planner** est dans la barre latérale et
sa carte est sur un tableau de bord ([Installer et mettre à jour](INSTALLER_METTRE_A_JOUR.fr.md)). Par défaut,
tous les utilisateurs de Home Assistant peuvent créer et modifier des programmes ; si **Seuls les
administrateurs peuvent modifier les programmes** est coché dans les réglages de l’intégration, les autres voient
**Lecture seule**.

L’exemple : le chauffage du salon est à **Confort = 20 °C** tous les jours de 6 h 30 à 8 h 30. Vous pouvez
prendre un autre appareil : volet, lumière, prise…

## 1. Créer le programme dans le panneau

1. Ouvrir **Weekly Planner** dans la barre latérale. Le panneau s’appelle **Programmes**.
2. Sous **Actions**, toucher **Nouveau programme**. La **Fiche du programme** s’ouvre.
3. Saisir le **Nom**, par exemple « Chauffage du salon ».
4. Sous **Appareils**, toucher **Ajouter un appareil** et **Choisir un appareil**. On peut en ajouter d’autres.
5. Pour chaque appareil, cocher les **Actions proposées** utiles : ce sont les commandes que Home Assistant
   lui connaît. Pour un chauffage, cocher celle qui règle la température.
6. Toucher **Créer le programme**. Il est enregistré tout de suite, pour toutes les cartes qui le montrent.

Le panneau revient à la **Liste des programmes** et dit : « Chauffage du salon » enregistré.

<!-- CAPTURE: prog-panneau-nouveau | Panneau Weekly Planner, Fiche du programme d’un nouveau programme remplie (nom, un chauffage, actions cochées) avant « Créer le programme » | démo : programme « Chauffage du salon », entité climate -->
<!-- CAPTURE: prog-panneau-liste | Panneau Weekly Planner après la création : barre latérale, message « Chauffage du salon » enregistré, programme dans la Liste des programmes | démo : programme venant d’être créé -->

## 2. Régler les horaires sur la carte

Les horaires se règlent depuis la carte du tableau de bord (ou depuis **Aperçu** dans le panneau, qui montre la
même carte).

1. Sur la carte, sous l’appareil, toucher **Ajouter un horaire**. La fenêtre des horaires s’ouvre sur la section
   **Réglages**, prête à créer un réglage. (Plus tard, le bouton **Modifier**, un calendrier avec un crayon,
   rouvre cette fenêtre.)
2. Sous **Nom**, saisir **Confort**. Choisir une **Couleur du réglage**. Sous **Que doit faire ce réglage ?**,
   choisir de régler la température, saisir **20**, puis toucher **Enregistrer**.
3. Ouvrir la section **Horaires** et toucher **Ajouter un horaire**.
4. Sous **Jours**, choisir **Tous les jours**.
5. Sous **Début**, saisir **06:30**. Sous **Durée**, choisir **Jusqu’à une heure**, puis saisir **08:30** sous
   **Fin**.
6. Sous **Réglage**, choisir **Confort**.
7. Toucher **Enregistrer** sous l’horaire.

La carte montre maintenant une barre colorée de 6 h 30 à 8 h 30. Le bouton **Semaine** montre chaque jour.

<!-- CAPTURE: prog-carte-ajouter-horaire | La carte Weekly Planner avec le programme sans horaire et le bouton « Ajouter un horaire » sous l’appareil | démo : programme « Chauffage du salon », aucun horaire encore -->
<!-- CAPTURE: prog-reglage-nouveau | La fenêtre des horaires, section Réglages : formulaire du nouveau réglage Confort rempli avant « Enregistrer » | démo : programme « Chauffage du salon », aucun réglage encore -->
<!-- CAPTURE: prog-premier-horaire | La section Horaires : formulaire d’horaire rempli (Jours, Début 06:30, Durée Jusqu’à une heure, Fin 08:30, Réglage Confort) | démo : réglage Confort créé, aucun horaire encore -->
<!-- CAPTURE: prog-semaine | La carte avec la semaine ouverte (bouton Semaine) : la barre Confort chaque jour | démo : un horaire enregistré -->

## Et ensuite

- Un réglage pour le reste de la journée, d’autres horaires, des copies sur d’autres jours :
  [Guide utilisateur](GUIDE.fr.md).
- Un exemple complet à recopier : [Recettes](RECETTES.fr.md).
- Si une liste d’actions est vide, ou si une action manque : voir **Appareils → Actions proposées** dans la
  **Fiche du programme**, ouverte depuis la **Liste des programmes** du panneau.

[Accueil](ACCUEIL.fr.md)
