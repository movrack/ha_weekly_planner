Français

# Changer la présentation

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** choisir ce que montre la carte (quels programmes, quelle vue, dans quel ordre), retrouver un
programme dans le panneau, et régler l’heure affichée.

Ces réglages sont pour la personne qui prépare le tableau de bord. Si les boutons manquent, lui demander de les
ouvrir. La carte ne change rien aux programmes eux-mêmes : ils se règlent dans le panneau **Weekly Planner**.

## Ouvrir l’éditeur de la carte

1. Dans Home Assistant, ouvrir le tableau de bord où se trouve Weekly Planner.
2. Ouvrir le menu **⋮**, en haut à droite, puis **Modifier le tableau de bord**.
3. Sur la carte Weekly Planner, choisir **Modifier**.

Les intitulés de Home Assistant peuvent varier un peu d’une version à l’autre. En haut de l’éditeur, le lien
**Gérer les programmes** ouvre le panneau **Weekly Planner**.

<!-- CAPTURE: guide-editeur-carte | L’éditeur de la carte : Titre, Programmes à afficher ouvert avec Pièce et Type, Ordre de la liste, Affichage | 1440 ; démo : trois programmes de types différents -->

## Choisir les programmes montrés

1. Sous **Titre**, saisir un titre (facultatif).
2. Ouvrir **Programmes à afficher**. La ligne rappelle ce qui est choisi (**Tous les programmes**, ou « 2 sur 5 »).
3. Réduire la liste en touchant :
   - une **Pièce** (une pastille par pièce, ou **Toutes les pièces**) ; la pièce d’un programme se règle dans sa
     **Fiche du programme**, onglet **Général**, sous **Pièce (facultative)** ;
   - un **Type** (**Tous les types**, puis une pastille par type : Climatisation, Ouverture…) : cela choisit ou
     retire d’un coup tous les programmes qui ont un appareil de ce type.
4. Affiner dans la liste **Programmes**. **Tous les programmes** (allumé) montre aussi les programmes créés plus
   tard. Éteint, seuls les programmes allumés en dessous sont montrés. Les programmes sont rangés par type, un
   pli par type avec son compte (« 1 sur 3 »), et un interrupteur par programme.

Une carte qui ne montre rien affiche « Rien à afficher ici » : vérifier ces choix.

## Choisir la vue et l’ordre

- **Affichage d’un programme** (si un seul programme est montré) : **Barres**, **Cadran 24 heures**, **Double
  cadran 12 heures** ou **Horaires du jour**.
- **Affichage de plusieurs programmes** (deux ou plus) : **Liste compacte** ou **Comparateur**.
  Si le choix enregistré ne convient plus après un changement de programmes, il est remplacé par le premier
  choix proposé et une note le dit.
- **Ordre de la liste** n’apparaît qu’avec deux programmes ou plus : **Type (puis A→Z)** (choisi au départ),
  **Pièce (puis A→Z)**, **Nom (A→Z)** ou **Personnalisé**. Avec **Personnalisé**, la liste **Ordre personnalisé**
  se règle avec les flèches **Monter** et **Descendre** (ou en glissant la poignée) ; l’écran annonce la
  nouvelle position.
- **Afficher les horaires** ajoute sous chaque barre ou cadran la liste des horaires d’aujourd’hui. Il est grisé,
  avec la raison, pour les autres vues.

## Montrer ou cacher la semaine et le graphique

- **Semaine** : **Bouton Semaine** (allumé au départ) ajoute sous chaque appareil le bouton qui ouvre les sept
  jours. **Semaine ouverte par défaut** (sous le bouton) fait démarrer la semaine ouverte ; chacun peut ensuite
  l’ouvrir ou la fermer.
- **Graphique** : **Bouton Graphique** (allumé au départ) ajoute le bouton du graphique du jour.
  **Graphique ouvert par défaut** le fait démarrer ouvert.

Éteindre un bouton retire seulement son bouton de la carte : la semaine reste dans la fenêtre des horaires.
Quand vous changez **Semaine ouverte par défaut** ou **Graphique ouvert par défaut**, le nouveau choix vaut pour
tous les appareils, même s’ils avaient été ouverts ou fermés avant.

Terminer avec **Enregistrer** : seule la présentation de cette carte change. Les autres cartes ne changent pas.

## Retrouver un programme dans le panneau

Dans le panneau **Weekly Planner**, la **Liste des programmes** a deux boutons :

- **Trier** : **Ordre de création** (au départ), **Nom** ou **Priorité (le n° 1 d’abord)**, puis **Terminé**.
- **Filtrer** : par **Type**, **Pièce** (avec **Sans pièce**) et **Appareil**. Chaque filtre est une section d’un
  accordéon ; un programme est affiché s’il correspond à l’une des valeurs choisies dans chaque filtre. Le texte
  dit « N programmes affichés sur M ». **Réinitialiser** efface les filtres et garde le tri.

Sur un téléphone, **Liste** et **Aperçu** (au-dessus des boutons) font passer des lignes à la carte, avec les
mêmes programmes dans le même ordre ; on peut y modifier les horaires. Sur un grand écran, l’**Aperçu** occupe la
partie de droite tant qu’aucun programme n’est ouvert. Ce tri et ces filtres ne changent pas la carte du tableau
de bord.

## Le format de l’heure

Weekly Planner n’a pas de réglage d’heure à lui : il suit votre profil Home Assistant (réglage de format de
l’heure : 12 heures, 24 heures ou selon la langue). En français, la carte écrit « 6 h 30 » et « 23 h » ; en
12 heures, elle écrit « 6:30 am », et « midi » et « minuit » pour 12 h et 0 h. Dans les champs d’heure, l’aspect
(12 ou 24 heures) vient du navigateur ; en 12 heures, la forme lue s’affiche à côté du champ.

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
