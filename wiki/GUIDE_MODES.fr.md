Français

# Des horaires selon le mode

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** chauffer et ouvrir les volets autrement quand la maison est en mode **Maison**, **Absent**
ou **Vacances**. Un **mode** est l’état de toute la maison : le même pour tous les programmes. Chaque programme a
ses propres horaires pour chaque mode. **Vacances** fonctionne comme les autres : son nom ne choisit pas une date
et ne suspend pas les autres programmes.

## Ce qu’il faut

- Un sélecteur Home Assistant (une **liste déroulante**, ou entité `select`) dont les choix sont vos modes :
  Maison, Absent, Vacances… Pour le créer :
  [Avant une recette avec les modes](RECETTES.fr.md#avant-une-recette-avec-les-modes).
- Le droit d’administrateur pour le choisir dans les réglages (les autres personnes peuvent ensuite modifier
  les horaires de chaque mode).

## Étapes

### 1. Faire connaître le sélecteur

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner → Configurer**, puis **Réglages**.
2. Dans la section **Mode et jour férié**, choisir le **Sélecteur de mode (facultatif)**, puis valider.
3. Choisir le **Mode par défaut** parmi les choix du sélecteur : c’est le mode utilisé quand le sélecteur n’a
   aucun choix utilisable.

Les choix du sélecteur sont les modes. Weekly Planner le lit et ne le modifie jamais : pour changer de mode,
changer le sélecteur (un bouton du tableau de bord, une alarme, une automatisation). Si le sélecteur est
indisponible, le dernier mode valide reste actif. Des [recettes](RECETTES.fr.md) changent le mode selon un
capteur. Sur la carte, la ligne **Mode : Maison** indique le mode actif ; ce n’est pas un bouton.

### 2. Donner des horaires à un mode

1. Sur la carte, toucher **Modifier** à droite du programme.
2. Ouvrir **Mode** : le titre rappelle le mode affiché, avec **pas actif** s’il ne l’est pas. La liste **Mode**
   propose chaque mode ; le mode actif porte **(Actif)** et la liste s’ouvre dessus.
3. Choisir le mode voulu. **Horaires** s’ouvre sur les horaires de ce mode : les ajouter ou les modifier comme
   d’habitude ([Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md)).

<!-- CAPTURE: guide-mode-panneau | La partie Mode de la fenêtre des horaires : la liste Mode avec « Maison (Actif) » et un autre mode, et l’avis « Ce mode n’est pas actif » | démo : programme « Chauffage du salon », modes Maison (actif) et Absent -->

- Pour un autre mode que l’actif, l’écran dit **Ce mode n’est pas actif**. Modifier ses horaires ne l’active pas
  et n’envoie aucune commande aux appareils ; l’interrupteur **Programme en marche** et les réglages sont
  grisés, avec la raison écrite (« Ce n’est pas le mode actif. »).
- Un programme qui n’a pas d’horaire pour le mode actif affiche **Aucun horaire pour ce mode** : ses appareils
  suivent alors **Le reste du temps**. Un mode vide ne veut donc pas dire que l’appareil sera éteint.
- Un mode qui n’est plus un choix du sélecteur est marqué **(n’existe plus)** ; ses horaires sont gardés.

### 3. Recopier les horaires d’un autre mode

Pour partir d’une copie, puis l’adapter :

1. Dans **Mode**, ouvrir **Options avancées**, puis **Reprendre les horaires d’un autre mode**.
2. Sous **Copier les horaires de :**, toucher le mode source.
3. Si le mode ouvert a déjà des horaires, l’écran demande de les remplacer : **Remplacer** ou **Non**.

Le message « Horaires copiés depuis … » confirme. C’est une copie : les deux modes évoluent ensuite chacun de
leur côté. Le bouton reste grisé, avec la raison, s’il n’y a aucun autre mode qui a des horaires ou si le mode
ouvert suit déjà un autre mode.

### 4. Utiliser les mêmes horaires qu’un autre mode

Exemple : le mode **Jour de congé** et le mode **Vacances scolaires** ont la même semaine. Au lieu d’écrire deux
fois les mêmes horaires, **Jour de congé** reprend ceux de **Vacances scolaires**.

1. Ouvrir le mode qui doit reprendre l’autre (ici **Jour de congé**) dans **Mode**.
2. Ouvrir **Options avancées**, puis choisir **Vacances scolaires** sous **Mêmes horaires que :**. Choisir
   **Aucun** pour ne plus rien suivre.
3. Si le mode ouvert a déjà des horaires, l’écran demande confirmation : ils sont supprimés et remplacés par ceux
   de la source (**Suivre Vacances scolaires**).
4. Recommencer pour chaque programme concerné : le réglage se fait par programme.

À la différence d’une copie, ce qui change dans **Vacances scolaires** se voit tout de suite dans **Jour de
congé**. La liste **Mode** écrit **(comme Vacances scolaires)** à côté du mode qui suit, et la carte écrit
**Mode : Jour de congé (mêmes horaires que Vacances scolaires)**.

Pour modifier les horaires d’un mode qui en suit un autre, l’écran propose :

- **Modifier Vacances scolaires (vaut aussi pour ce mode)** ;
- **Arrêter de suivre** : le mode garde une copie et devient indépendant. Vous pouvez la modifier tout de suite.

Règles : seul un mode qui ne suit personne peut être suivi, et un mode suivi ne peut pas suivre. Si la source
disparaît, le mode qui la suivait garde une copie de ses derniers horaires et un message le dit.

## Résultat

Chaque mode a sa semaine. Quand le sélecteur change, les appareils reçoivent tout de suite le réglage prévu
pour l’heure courante dans le nouveau mode. Le passé n’est pas rejoué ; un programme en pause reste en pause.

## À savoir

- La **Suspension de tous les programmes** n’est pas un mode : elle arrête tout, quel que soit le mode
  ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)).
- Les noms des modes sont ceux des choix du sélecteur, écrits exactement pareil : `Jour de Congé` n’est pas
  `Jour de congé`.
- Pour des exceptions par-dessus un programme sans toucher au mode : [Priorités](PRIORITES.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
