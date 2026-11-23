Français

# La carte Weekly Planner

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

La carte est ce qu’on voit sur le tableau de bord : ce que fait chaque appareil, ce qui vient ensuite, et les
moyens de changer les horaires. Les programmes eux-mêmes (créer, supprimer, appareils, priorités) se règlent dans le
panneau **Weekly Planner** de la barre latérale ; l’éditeur de la carte ne change que **ce que cette carte montre**
([Changer la présentation](GUIDE_PRESENTATION.fr.md)).

Sur cette page : [Lire la carte](#lire-la-carte) · [Les affichages](#les-affichages) ·
[Le graphique du jour](#le-graphique-du-jour) · [La fenêtre des horaires](#la-fenêtre-des-horaires) ·
[Les options avancées](#les-options-avancées) · [Au téléphone](#au-téléphone) ·
[Au clavier et avec un lecteur d’écran](#au-clavier-et-avec-un-lecteur-décran).

## Lire la carte

De haut en bas :

| Ce que vous voyez | Ce que cela veut dire |
|---|---|
| Le **titre** et, à côté, **Tous les programmes suspendus** | Le titre est facultatif. La mention apparaît quand la **suspension de tous les programmes** est allumée ([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)). |
| **Mode : Maison** | Le mode actif de la maison, une seule fois, au-dessus des programmes. Il est suivi de « (mêmes horaires que Maison) », avec le nom du mode source, quand tous les programmes montrés utilisent les horaires d’un autre mode. Rien ne s’affiche s’il n’y a qu’un seul mode. |
| **Aujourd’hui férié : horaires du …** | Aujourd’hui est un jour férié et il remplace le jour de la semaine ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)). |
| Un **groupe** avec son titre | Quand la carte est triée par type ou par pièce, un titre sépare les groupes. |
| Une **ligne d’appareil** | Une icône, le nom du programme (ou de l’appareil), son état (« 20,5 °C », « Ouvert »), **Ensuite :** et l’heure du prochain changement. Un badge peut s’y ajouter : **En pause**, **Aucun horaire pour ce mode**, **Sauté :**. |
| L’**interrupteur** et **Modifier** | À droite du nom. L’interrupteur met le programme en pause ou en marche. **Modifier** (calendrier avec un crayon) ouvre la [fenêtre des horaires](#la-fenêtre-des-horaires). |
| La **barre du jour** (**Auj.**) | Une barre qui représente les 24 heures d’aujourd’hui, avec un trait pour « maintenant ». Voir les [affichages](#les-affichages). |
| **Semaine** | Un bouton qui déplie les sept jours, un par ligne. |
| **Graphique du jour** | Un bouton qui déplie le [graphique](#le-graphique-du-jour). |

Un programme qui réunit plusieurs appareils montre une rangée d’**onglets**, un par appareil (le choisi porte une
coche) : la ligne et la barre en dessous sont celles de l’appareil choisi.

### Ce qui se plie et se déplie

| Élément | Comment |
|---|---|
| **Semaine** et **Graphique du jour** | Toucher le bouton ouvre ou referme son panneau. L’éditeur de la carte peut les faire démarrer ouverts ou les retirer ([Changer la présentation](GUIDE_PRESENTATION.fr.md)). |
| Un programme de la **Liste compacte** | Toucher son nom déplie ses barres ; toucher de nouveau le replie. |
| Les parties de la **fenêtre des horaires** | **Mode**, **Réglages** et **Horaires** : un seul pli est ouvert à la fois ; les autres montrent un résumé sur une ligne. |
| **Options avancées** | Un pli, fermé au départ, qui range les choix rares d’un formulaire ([Les options avancées](#les-options-avancées)). |
| **Options du graphique** | Un pli de la fenêtre des horaires ([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md)). |

### Quand la carte est vide ou limitée

- **Aucun programme pour l’instant.** : la carte n’a rien à montrer. Le lien **Gérer les programmes** ouvre le panneau ;
  grisé, avec **Lecture seule** écrit dessous, quand vous n’avez pas le droit de modifier.
- **Rien à afficher ici.** : les choix de la carte (types, pièce, programmes) ne retiennent aucun programme.
- **Lecture seule** : vous pouvez regarder mais pas modifier ; les boutons restent affichés, grisés.

## Les affichages

L’éditeur de la carte propose, selon le nombre de programmes montrés :

| Pour… | Affichages |
|---|---|
| **un seul programme** (champ **Affichage d’un programme**) | **Barres** (choisi au départ), **Cadran 24 heures**, **Double cadran 12 heures**, **Horaires du jour** |
| **plusieurs programmes** (champ **Affichage de plusieurs programmes**) | **Liste compacte**, **Comparateur** |

Les couleurs sont celles des réglages ; le gris indique qu’aucune action n’est prévue.

### Barres

Chaque appareil a une barre de 24 heures : une couleur par réglage, un trait pour maintenant. Des repères d’heure sont écrits
sous la barre d’aujourd’hui. Avec la souris, passer sur une couleur montre le nom du réglage et
ses heures. L’icône d’un soleil sur une barre signale une heure de lever ou de coucher : au survol, l’infobulle donne
l’heure calculée pour ce jour, suivie de « + jusqu’à n min au hasard » quand l’horaire a un délai aléatoire.
**dès** indique une action sans fin ; **lendemain**, une fin après minuit.

### Cadran 24 heures et Double cadran 12 heures

Les mêmes informations sur un cercle. Le **Double cadran 12 heures** a deux cercles : l’intérieur va de 0 à 12 h et
l’extérieur de 12 à 24 h (« Intérieur : 0–12 h · Extérieur : 12–24 h »). Les repères du soleil montrent le lever et
le coucher.

<!-- CAPTURE: carte-cadran-24h | Le Cadran 24 heures d’un programme | démo : programme « Chauffage du salon », deux horaires, aujourd’hui au milieu de la journée -->
<!-- CAPTURE: carte-double-cadran | Le Double cadran 12 heures du même programme | démo : même programme -->

### Horaires du jour

Aujourd’hui sous forme de liste : **une ligne par horaire**, avec l’heure de début, le réglage et jusqu’à quand il
dure (**jusqu’à 8 h 30**, **jusqu’à demain 7 h**, **depuis hier 22 h**), et un repère **Maintenant** sur la ligne en
cours. Un horaire déjà passé porte **terminé**. Un horaire solaire donne son lever ou son coucher ; un horaire avec
délai aléatoire dit **vers 6 h 30** et **heure variable, quelques minutes d’écart**.

Quand rien n’est prévu, la liste dit **Rien de prévu aujourd’hui** et rappelle **Le reste du temps : Éco**. Pour un
programme en pause : **En pause : les horaires ne sont pas appliqués.** Cet affichage se lit ; pour changer un
horaire, toucher **Modifier**.

<!-- CAPTURE: carte-horaires-du-jour | La vue Horaires du jour avec la ligne Maintenant | démo : programme « Chauffage du salon », trois horaires, aujourd’hui au milieu de la journée -->

### Liste compacte

Une ligne par programme (rangés comme l’**Ordre de la liste** de la carte) : le nom, puis en petit le prochain changement (« Fermé à 17 h 30 » ou
« Fermé · demain 8 h »). Toucher le nom déplie la barre du jour, **Semaine** et **Graphique du jour** ; un programme
à plusieurs appareils y montre ses onglets. L’interrupteur et **Modifier** sont sur la ligne. C’est aussi ce que
montre **Aperçu** dans le panneau.

<!-- CAPTURE: carte-liste-compacte | La Liste compacte avec un programme déplié | démo : trois programmes de types différents, l’un déplié -->

### Comparateur

Un jour à la fois pour toute la carte : chaque appareil a sa barre, tous les programmes mélangés.

- Une rangée de puces choisit le jour : **Lun** à **Dim**, puis **Jour férié**. Aujourd’hui est choisi au départ ;
  le jour d’aujourd’hui est repéré. La puce **Jour férié** est grisée, avec **Aucun jour férié réglé.** écrit
  dessous, quand aucun programme n’a de jour férié.
- Le nom du jour est en titre (aujourd’hui en gras, avec le repère **Maintenant**). Une barre de programme en pause
  garde ses couleurs, mais hachurées, avec la mention **en pause**. Avec le tri par type, un programme qui commande des appareils de plusieurs types (par exemple un thermostat et un volet) est listé sous chaque type, avec les appareils de ce type.
- Le bouton **Modifier**, en haut, ouvre la fenêtre des horaires ; avec plusieurs programmes, la question
  **Que voulez-vous modifier ?** demande lequel.

<!-- CAPTURE: carte-comparateur | Le Comparateur sur un jour de semaine avec la rangée de puces | démo : trois programmes de volets, le mercredi choisi -->

### L’option « Afficher les horaires »

Pour les barres et les cadrans seulement, l’éditeur de la carte peut ajouter, sous chaque appareil, une liste
**Horaires** : les mêmes lignes que **Horaires du jour**. Les modifier : voir plus bas.

### Modifier avec le doigt, la souris ou le clavier

Un **simple clic ne modifie jamais** : il affiche seulement, pendant quelques secondes, « Gardez le doigt appuyé pour
modifier ». Pour modifier, on garde le doigt (ou le bouton de la souris) appuyé environ une demi-seconde, ou on
utilise le clavier. Les boutons bien visibles (**Modifier**, **Semaine**, le nom d’un jour, **Copier**…) s’activent,
eux, d’un simple clic.

| Geste | Effet | Autre moyen |
|---|---|---|
| **Appui long** sur une barre (aujourd’hui ou un jour de la semaine) ou sur un cadran | La barre passe en **modification** : des poignées apparaissent sur chaque limite, et des boutons dessous. | **Entrée** ou **Espace** sur la barre ; ou le bouton **Modifier** (fenêtre des horaires) |
| **Toucher** un horaire ou un espace vide, en modification | Le choisit (ses heures s’affichent au-dessus de la barre) ; toucher de nouveau le désélectionne. | Tab jusqu’à une poignée |
| **Glisser une poignée** | Change l’heure de la limite, par pas de 15 minutes. C’est enregistré au relâcher, **pour ce jour seulement**. | **←** et **→** sur la poignée choisie : 15 minutes ; enregistré après un court instant |
| **Appui long sur un horaire, puis glisser** | Déplace tout l’horaire, durée gardée, par pas de 15 minutes. Dans la semaine, le déposer sur la barre d’un autre jour le met à ce jour, à la même heure. Si la place est prise, rien ne bouge et un message l’explique. | Fenêtre des horaires |
| **Échap**, ou toucher en dehors de la barre | Quitte la modification. | |
| **Appui long** sur une ligne de la liste **Horaires**, ou sur une barre ou le titre d’un jour du **Comparateur** | Ouvre la fenêtre des horaires sur cet horaire ou ce jour. | **Entrée** ou **Espace** sur la ligne |
| **Clic** sur le nom d’un jour dans **Semaine** | Ouvre la fenêtre des horaires sur ce jour. | — |

Sous la barre, quand quelque chose est choisi : **Supprimer** (après confirmation), **Couper en deux**,
**Copier sur d’autres jours**, et la liste des réglages pour changer le réglage de l’horaire choisi
([Modifier ou copier un horaire](GUIDE_MODIFIER_COPIER.fr.md)). Un bouton qui ne peut pas servir est grisé, avec la
raison écrite dessous (par exemple « Touchez un espace vide ou un horaire dans la barre au-dessus. »).

<!-- CAPTURE: carte-indice-appui-long | Une barre après un simple clic : le message « Gardez le doigt appuyé pour modifier » | démo : programme « Chauffage du salon » -->

Après chaque modification, un message **Horaire modifié**, **Horaire ajouté** ou **Horaire supprimé** reste affiché
20 secondes avec **Annuler**, qui remet les choses comme avant.

Une barre ne se modifie pas ainsi quand le mode utilise les horaires d’un autre mode, ou quand un jour férié remplace
aujourd’hui : un message dit alors quoi faire, et la fenêtre des horaires, elle, s’ouvre toujours.

## Le graphique du jour

Il se déplie avec **Graphique du jour** sous l’appareil, ou se voit dans la fenêtre des horaires. Il met côte à côte
ce qui était **prévu** et ce que l’appareil a fait ([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md) pour les
courbes ajoutées).

### Lire les repères

- **Point plein** : début d’un palier du programme. **Anneau creux** : retour au **Le reste du temps**. Une ligne
  pointillée repère l’heure. Exemple, un lundi : point plein **Confort** à 8 h 45, anneau **Éco** à 17 h.
- À minuit, un point plein montre le réglage déjà en cours, y compris celui commencé la veille.
- Les réglages sans valeur chiffrée (Confort, Éco, Ouvert…) forment des **bandes** colorées au nom du réglage. Un nom
  trop long est raccourci ; le nom complet apparaît au survol.
- La **légende**, sous les flèches et la date, dit ce que représente chaque courbe : d’abord celles de l’appareil
  (**Prévu**, **Valeur mesurée**, **Valeur demandée**…), puis les sources ajoutées. Une échelle en % va de 0 à 100 ;
  les autres s’adaptent aux valeurs. Pour une entité allumée ou éteinte, la légende dit **on = 100, off = 0**. Les
  données manquantes ont un motif distinct.
- Un trait « maintenant » affiche l’heure actuelle au survol ou au clavier.

### Parcourir et zoomer

| Pour… | Téléphone | Ordinateur | Clavier |
|---|---|---|---|
| **Parcourir** le temps | Glisser un doigt horizontalement | Glisser avec la souris | **←** et **→** |
| **Zoomer** | Pincer avec deux doigts | **Maj** + glisser pour entourer la zone ; **Ctrl** + molette | **+** et **-** |
| **Revenir** à la journée | Bouton **Revenir au jour sélectionné** (visible seulement une fois zoomé) | Double clic, ou le bouton | **0** |
| **Ouvrir l’historique** | Toucher le graphique | Cliquer le graphique | **Entrée** |

Le graphique continue dans les jours d’avant et d’après ; les dates s’affichent dessous. Les flèches **Période
précédente** et **Période suivante** déplacent d’une fenêtre, sans changer le zoom. La fenêtre la plus étroite est de
30 minutes. La page défile toujours verticalement. Un simple toucher qui ne termine pas un geste ouvre l’historique de
Home Assistant pour l’appareil.

<!-- CAPTURE: carte-graphique-zoom | Le graphique zoomé sur la matinée, avec la fenêtre de 6 h à 10 h et le bouton « Revenir au jour sélectionné » | démo : thermostat du salon, historique de la veille -->

## La fenêtre des horaires

**Modifier**, le nom d’un jour de **Semaine**, ou un appui long sur une barre ouvrent la **fenêtre des horaires**
(titre : le nom du programme). C’est là qu’on fait tout ce que les barres ne permettent pas.

De haut en bas :

1. **Programme en marche** : l’interrupteur du programme. Éteint, il demande **Jusqu’à quand ?** ([Pause, saut et
   suspension](GUIDE_PAUSE_SAUT.fr.md)).
2. Un avis quand le mode choisi n’est pas le mode actif (**Ce mode n’est pas actif**, avec ce qui se passera).
3. Trois parties, **une seule ouverte à la fois**, chacune avec un résumé sur une ligne quand elle est fermée :
   - **Mode** (seulement si un sélecteur de mode est choisi) : choisir le mode dont on règle les horaires ;
     **Options avancées** : **Mêmes horaires que :** et **Reprendre les horaires d’un autre mode**
     ([Des horaires selon le mode](GUIDE_MODES.fr.md)).
   - **Réglages** : créer, modifier, supprimer les réglages (**Nouveau réglage**). La liste ne montre que les réglages qui concernent les appareils du programme : un réglage qui commande une autre entité (par exemple la position favorite d’un volet) n’apparaît pas pour un programme qui n’a pas cet appareil, sauf s’il y est déjà utilisé.
   - **Horaires** : pour un programme à plusieurs appareils, une pastille par appareil ; la ligne **Le reste du
     temps : Éco** ; la liste des horaires avec **Ajouter un horaire** ; la partie **Jour férié**
     ([Les jours fériés](GUIDE_JOUR_FERIE.fr.md)). Toucher **Toute la semaine** revient de « un jour » à toute la
     semaine.
4. La **semaine** : sept barres, **Lun** à **Dim**, et une ligne **Férié** quand un jour férié est réglé.
5. Le **graphique du jour**, avec **Jour précédent** et **Jour suivant** (jusqu’à 14 jours avant et 7 jours après).
6. **Options du graphique**, puis **Supprimer ce programme** (ou **Supprimer les horaires de cet appareil** pour un
   programme à plusieurs appareils, où seuls les horaires de cet appareil partent).

Tant qu’un horaire est en cours de modification, le reste de l’écran est grisé et le texte **Terminez d’abord
l’horaire.** le dit.

Sur un grand écran, la fenêtre se met sur **deux colonnes** : les parties à gauche, la semaine, le graphique et ses
options à droite. Sur un grand écran aussi, le bouton **Agrandir / réduire** (flèches, à côté de la croix) l’élargit.

<!-- CAPTURE: carte-fenetre-accordeon | La fenêtre des horaires : Programme en marche, les trois parties Mode, Réglages et Horaires dont Horaires ouverte | 360 ; démo : programme « Chauffage du salon », mode Maison actif, deux horaires -->

Fermer la fenêtre : la croix **Fermer**, **Échap**, un toucher en dehors d’elle ou, sur téléphone, un balayage vers
le bas sur son en-tête. S’il reste des changements non enregistrés, une question demande **Oui, les abandonner** ou
**Non, continuer**.

## Les options avancées

**Options avancées** est un pli fermé au départ. Il s’ouvre **tout seul** quand ce qu’il range est déjà utilisé :
rien n’est caché.

| Où | Ce qu’il contient |
|---|---|
| **Formulaire d’horaire**, sous **Début** et sous **Fin** (chacun a le sien) | **Lever du soleil** et **Coucher du soleil** (l’heure suit le soleil) ; **Pas avant / pas après une heure fixe** (**Au plus tôt à**, **Au plus tard à**) ; **Délai aléatoire (quelques minutes au hasard)** avec **Délai maximum (minutes)**, de 1 à 240. Voir [Suivre le soleil](GUIDE_SOLEIL.fr.md). |
| **Éditeur d’un réglage** (partie **Réglages**) | **Appliquer l’action à** : **L’appareil du programme** ou **Une autre entité** (par exemple un bouton de position favorite), avec **Entité à commander** ; les champs rares de l’action ; **Valeur fixe** ou **Valeur d’une entité** (lue au moment où l’horaire s’exécute). En modification d’un réglage existant : **Valeur pour cet appareil** et **Revenir à la valeur commune**. |
| **Partie Mode** de la fenêtre des horaires | **Mêmes horaires que :** (le mode suit un autre mode) et **Reprendre les horaires d’un autre mode** (une copie). Les boutons impossibles sont grisés avec leur raison (« Aucun autre mode à suivre. », « Ce mode suit un autre mode. »). |

## Au téléphone

La carte est pensée pour un écran de 360 pixels de large.

- Les fenêtres (horaires, pause, questions) prennent tout l’écran ; les questions courtes (confirmer, choisir)
  montent du bas. Un **balayage vers le bas** sur l’en-tête d’une fenêtre la ferme.
- Les **appuis longs** remplacent le clic pour modifier : ils font vibrer légèrement le téléphone. Un doigt qui
  bouge pendant l’appui annule l’appui : c’est un défilement, pas une modification.
  La page défile toujours verticalement, même sur un graphique ou une barre.
- Le graphique se parcourt avec un doigt et se zoome en **pinçant**.
- Pas de survol au doigt : les heures d’un horaire s’affichent quand on **choisit** l’horaire (au-dessus de la barre,
  au centre du cadran simple, sous le cercle pour le double cadran), et se mettent à jour pendant le glissé.
- Dans le panneau **Weekly Planner**, **Liste** et **Aperçu** font passer des lignes à la carte
  ([Changer la présentation](GUIDE_PRESENTATION.fr.md)).
- Le bouton **Agrandir / réduire** n’existe pas : la fenêtre est déjà pleine largeur.

## Au clavier et avec un lecteur d’écran

Tout ce qui se fait au toucher a un équivalent au clavier ou un bouton.

| Où | Touches |
|---|---|
| Une **barre** ou un **cadran** | **Tab** pour l’atteindre ; **Entrée** ou **Espace** pour modifier. En modification, **Tab** passe de poignée en poignée ; **←** et **→** déplacent la poignée choisie de 15 minutes (enregistré après un court instant) ; **Échap** quitte. |
| Une **ligne de liste** ou du **Comparateur** | **Entrée** ou **Espace** ouvre la fenêtre des horaires. |
| Les **puces de jour** du Comparateur, les **onglets d’appareils** | **←** **→** (ou **↑** **↓**) changent de choix ; **Début** et **Fin** vont au premier et au dernier. |
| Le **graphique** | **+** et **-** zooment ; **←** et **→** déplacent ; **0** revient à la journée ; **Entrée** ouvre l’historique. |
| Une **fenêtre** | Le focus reste dans la fenêtre. **Échap** ferme d’abord le formulaire ouvert, puis la fenêtre ; à la fermeture, le focus revient à l’endroit d’où l’on est parti. |
| La **Fiche du programme** | Les onglets se parcourent aux flèches, avec **Début** et **Fin**. |

Pour un lecteur d’écran : chaque barre est annoncée avec le nom du programme, le jour, puis chaque horaire (réglage
et heures). Chaque réglage donne son nom et ses heures au survol **et** au focus clavier, pour les barres comme pour
les cercles. Une raison écrite accompagne chaque bouton grisé. Les messages (« … est remis en marche. », **Horaire
modifié**) sont annoncés sans quitter l’endroit où l’on est.

[← Lexique](LEXIQUE.fr.md) · [Accueil](ACCUEIL.fr.md)
