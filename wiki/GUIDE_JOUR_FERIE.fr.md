Français

# Les jours fériés

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** un jour férié ou un jour de congé, le chauffage et les volets suivent le même programme
qu’un dimanche, au lieu de celui du jour de la semaine.

## Ce qu’il faut

- Une entité Home Assistant qui est allumée (« on ») un jour férié ou de congé : un calendrier des jours fériés,
  un capteur, un interrupteur que vous allumez vous-même… Pour la créer, voir
  [Un interrupteur « Jour férié »](RECETTE_INTERRUPTEUR_JOUR_FERIE.fr.md) ou
  [Un capteur « jour férié ou congé scolaire »](RECETTE_CAPTEUR_JOUR_FERIE.fr.md).
- Le droit d’administrateur pour la choisir dans les réglages.

## Étapes

### 1. Choisir l’entité, une fois pour toute la maison

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner → Configurer**, puis **Réglages**.
2. Dans la section **Mode et jour férié**, choisir **Jour férié ou congé (facultatif)**.
3. Cocher **Cette entité est allumée les jours travaillés, pas les jours fériés** seulement si c’est le cas
   (capteur Jour ouvré). Dans le doute, laisser décoché : une coche à tort échange les jours fériés et les jours
   normaux. Avec un capteur Jour ouvré, les week-ends comptent aussi comme jours fériés : un calendrier des jours
   fériés convient mieux.
4. Valider.

Tant qu’aucune entité n’est choisie, la section **Jour férié** de la fenêtre des horaires n’apparaît pas.

### 2. Choisir quoi faire un jour férié, pour chaque programme et chaque mode

Le réglage est propre à chaque mode : le jour férié de **Maison** peut être différent de celui de **Vacances**
([Des horaires selon le mode](GUIDE_MODES.fr.md)).

1. Sur la carte, toucher **Modifier** à droite du programme, puis ouvrir **Horaires**.
2. À la fin de **Horaires**, ouvrir **Jour férié**. Sa ligne rappelle le choix en cours (**jour normal**,
   **comme dimanche**, **ses propres horaires**).
3. Activer **Horaires à part les jours fériés**.
4. Choisir :
   - **Prendre les horaires de :** puis un jour de la semaine (dimanche au départ) ; ou
   - **Mes propres horaires** : toucher **Ajouter un horaire**, régler **Début**, **Durée** et **Réglage** (il n’y
     a pas de **Jours**), puis **Enregistrer**.

<!-- CAPTURE: guide-jour-ferie | La partie Jour férié ouverte : l’interrupteur « Horaires à part les jours fériés », « Prendre les horaires de : » sur dimanche | démo : programme « Chauffage du salon », entité jour férié choisie -->

Le choix de « Prendre les horaires de » s’enregistre tout de suite : l’écran dit **Enregistré**.

## Résultat

Un jour férié, le programme suit les horaires du jour choisi, ou les vôtres. La fenêtre des horaires montre une
ligne **Férié** sous le dimanche de la semaine, et la carte écrit **Aujourd’hui férié : horaires du dimanche**
quand c’est le cas. Les jours de la veille et du lendemain restent des jours normaux.

## À savoir

- Éteindre **Horaires à part les jours fériés** ne supprime rien : le jour normal s’applique, et le réglage
  revient tel quel quand on le rallume. Passer de **Prendre les horaires de** à **Mes propres horaires** garde
  aussi l’autre choix en mémoire.
- Le mode l’emporte sur le jour férié, et un jour férié ne s’applique qu’au mode actif : quand le mode change, le
  nouveau mode applique son propre réglage de jour férié.
- Un jour férié, la barre d’aujourd’hui ne se modifie pas directement sur la carte si ses horaires sont remplacés :
  l’écran dit « Pour changer ces horaires, touchez Modifier (icône du calendrier), puis « Jour férié ». »
- Un horaire de jour férié qui passe minuit s’arrête à 24 h ; l’écran le dit.
- Un mode qui prend les mêmes horaires qu’un autre mode suit aussi son jour férié : dans ce cas, la section dit
  **Ce mode a les mêmes horaires que …, jour férié compris.**
- Un jour férié n’est ni un mode, ni le mode **Vacances**, ni la **Suspension de tous les programmes**
  ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
