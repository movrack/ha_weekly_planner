# Captures du wiki à prendre (interne, jamais publié)

Une ligne par repère `<!-- CAPTURE: id | ... -->` des pages du wiki. Données fictives, version de `develop` (panneau
« Weekly Planner », éditeur de carte refait). Les captures de HACS et des pages de Home Assistant (hors carte et hors
panneau) se prennent à 1440 ; celles de la carte et du panneau à 360, sauf mention contraire.
Clair/sombre : le clair par défaut ; ajouter la version sombre seulement si la page la montre.

| id | page | à montrer | taille | clair/sombre | état de la démo | statut |
|---|---|---|---|---|---|---|
| accueil-carte-ensemble | ACCUEIL.fr.md | La carte Weekly Planner avec plusieurs programmes (vue Barres) | 360 | clair | maison de démonstration, aujourd’hui au milieu de la journée | à prendre |
| install-hacs-depot | INSTALLER_METTRE_A_JOUR.fr.md | La fenêtre HACS « Dépôt personnalisé » avec l’adresse du dépôt et la catégorie Intégration | 1440 | clair | HACS de l’instance de démonstration | à prendre |
| install-ajouter-integration | INSTALLER_METTRE_A_JOUR.fr.md | La fenêtre « Weekly Planner » de Paramètres → Appareils et services → Ajouter une intégration | 1440 | clair | instance de démonstration, intégration pas encore ajoutée | à prendre |
| install-choisir-carte | INSTALLER_METTRE_A_JOUR.fr.md | La liste « Ajouter une carte » avec Weekly Planner trouvée en tapant son nom | 1440 | clair | tableau de bord en modification | à prendre |
| install-carte-vide | INSTALLER_METTRE_A_JOUR.fr.md | La carte Weekly Planner vide : « Aucun programme pour l’instant. » et le lien « Gérer les programmes » | 360 | clair | intégration ajoutée, aucun programme | à prendre |
| prog-panneau-nouveau | PREMIER_PROGRAMME.fr.md | Panneau Weekly Planner, « Fiche du programme » d’un nouveau programme remplie (Nom, un chauffage, Actions proposées cochées) avant « Créer le programme » | 360 | clair | démo : programme « Chauffage du salon », entité climate | à prendre |
| prog-panneau-liste | PREMIER_PROGRAMME.fr.md | Panneau après la création : entrée « Weekly Planner » de la barre latérale, message « Chauffage du salon » enregistré, programme dans la « Liste des programmes » | 1440 | clair | démo : programme venant d’être créé | à prendre |
| prog-carte-ajouter-horaire | PREMIER_PROGRAMME.fr.md | La carte avec le programme sans horaire et le bouton « Ajouter un horaire » sous l’appareil | 360 | clair | démo : programme « Chauffage du salon », aucun horaire encore | à prendre |
| prog-reglage-nouveau | PREMIER_PROGRAMME.fr.md | Fenêtre des horaires, section « Réglages » : formulaire du nouveau réglage Confort (Nom, Couleur du réglage, « Que doit faire ce réglage ? », 20) avant « Enregistrer » | 360 | clair | démo : programme « Chauffage du salon », aucun réglage encore | à prendre |
| prog-premier-horaire | PREMIER_PROGRAMME.fr.md | Section « Horaires » : formulaire d’horaire rempli (Jours Tous les jours, Début 06:30, Durée « Jusqu’à une heure », Fin 08:30, Réglage Confort) | 360 | clair | démo : réglage Confort créé, aucun horaire encore | à prendre |
| prog-semaine | PREMIER_PROGRAMME.fr.md | La carte avec la semaine ouverte (bouton « Semaine ») : la barre Confort chaque jour | 360 | clair | démo : un horaire enregistré | à prendre |
| desinstall-supprimer | DESINSTALLER.fr.md | Page de l’intégration Weekly Planner avec le menu à trois points ouvert sur « Supprimer » | 1440 | clair | instance de démonstration | à prendre |
| guide-carte-ligne | GUIDE_VOIR_PREVU.fr.md | La carte : une ligne d’appareil avec « Ensuite : … », la barre du jour, l’interrupteur et le bouton Modifier | 360 | clair | démo : programme « Chauffage du salon » avec deux horaires, aujourd’hui au milieu de la journée | à prendre |
| guide-reglages | GUIDE_MATIN_ET_SOIR.fr.md | Fenêtre des horaires, partie « Réglages » : les réglages Confort et Éco et le bouton « Nouveau réglage » | 360 | clair | démo : programme « Chauffage du salon », réglages Confort et Éco créés | à prendre |
| guide-horaires-liste | GUIDE_MATIN_ET_SOIR.fr.md | Partie « Horaires » : la ligne « Le reste du temps : Éco », deux horaires Confort et « Ajouter un horaire » | 360 | clair | démo : programme « Chauffage du salon », deux horaires Confort | à prendre |
| guide-barre-edition | GUIDE_MODIFIER_COPIER.fr.md | La barre d’un jour en modification : un horaire choisi avec ses poignées et les boutons dessous (Supprimer, Couper en deux, Copier sur d’autres jours) | 360 | clair | démo : un horaire Confort choisi | à prendre |
| guide-copier-jours | GUIDE_MODIFIER_COPIER.fr.md | La barre en modification avec la rangée de jours de « Copier sur d’autres jours » et le bouton Copier | 360 | clair | démo : un horaire Confort choisi, Mar et Mer cochés | à prendre |
| guide-appareils-onglets | GUIDE_PLUSIEURS_APPAREILS.fr.md | La carte d’un programme à deux appareils avec la rangée d’onglets (un appareil coché) | 360 | clair | démo : programme « Volets du rez-de-chaussée », deux volets | à prendre |
| guide-soleil-debut | GUIDE_SOLEIL.fr.md | Formulaire d’horaire : Début sur « Coucher du soleil », Options avancées ouvertes, limite « Au plus tard à » 21:30 | 360 | clair | démo : programme « Volet du salon », réglages Ouvert et Fermé | à prendre |
| guide-mode-panneau | GUIDE_MODES.fr.md | Partie « Mode » de la fenêtre des horaires : la liste Mode avec « Maison (Actif) » et un autre mode, l’avis « Ce mode n’est pas actif » | 360 | clair | démo : modes Maison (actif) et Absent, sélecteur choisi | à prendre |
| guide-jour-ferie | GUIDE_JOUR_FERIE.fr.md | Partie « Jour férié » ouverte : « Horaires à part les jours fériés », « Prendre les horaires de : » sur dimanche | 360 | clair | démo : entité jour férié choisie dans les réglages | à prendre |
| guide-pause | GUIDE_PAUSE_SAUT.fr.md | La fenêtre « Pause » : « Jusqu’à quand ? », « Pour une durée » et « 1 jour » choisis, bouton « Confirmer » | 360 | clair | démo : programme « Volet du salon » | à prendre |
| guide-editeur-carte | GUIDE_PRESENTATION.fr.md | Éditeur de la carte : Titre, « Programmes à afficher » ouvert avec Pièce et Type, « Ordre de la liste », « Affichage » | 1440 | clair | démo : trois programmes de types différents | à prendre |
| guide-graphique-sources | GUIDE_COMPRENDRE.fr.md | Fenêtre des horaires à deux colonnes : graphique du jour avec une courbe de température et une bande « Ouvert », « Options du graphique » ouvertes | 1440 | clair | démo : thermostat du salon, capteur de température et capteur de fenêtre ajoutés | à prendre |
| guide-renvoyer-etat | GUIDE_APRES_PANNE.fr.md | Écran « Renvoyer l’état aux appareils » : listes « Sera envoyé maintenant » et « Laissé tel quel », bouton Valider | 1440 | clair | démo : trois appareils dont un volet à renvoyer et un programme en pause | à prendre |
