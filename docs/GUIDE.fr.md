# Weekly Planner — mes horaires, simplement

Les captures montrent une maison de démonstration, sans commande d’un
appareil réel. Voir aussi les [captures S37 à S45](SCREENS.fr.md#s37).

Un **programme** réunit les appareils et leurs horaires. Un **réglage** donne
un nom à ce qu’ils doivent faire : par exemple **Confort = 20 °C**.
Un **horaire** dit quand utiliser ce réglage.

## Je veux regarder ce qui est prévu

Sur le tableau de bord, repère le nom du programme. En dessous, la flèche indique
la prochaine action et son heure. La barre colorée représente la journée ; le
petit trait avec une horloge indique maintenant.

<a href="images/guide/s01-overview.png"><img src="images/guide/s01-overview.png" width="320" alt="La carte montre les programmes du salon et leurs prochaines actions." /></a>

À droite du nom :

- Le petit **interrupteur** active ou met en pause le programme.
- Le bouton en forme de **calendrier avec un crayon** ouvre les horaires.

L’interrupteur ne commande pas directement l’appareil. Mettre un programme en
pause arrête ses horaires ; cela ne veut pas forcément dire éteindre l’appareil.
Une confirmation s’affiche avant la pause : [S34](SCREENS.fr.md#s34).
Quand le programme est arrêté, un badge rouge **Désactivé** apparaît sous les
icônes, en haut à droite. Son interrupteur se met à jour sur les autres cartes.

**Semaine** déplie les sept jours. Toucher le nom d’un jour permet de regarder ses
horaires. **Toute la semaine** revient ensuite à l’ensemble.

Selon le choix de la personne qui a préparé la carte, tu peux aussi voir un
[cadran de 24 heures](SCREENS.fr.md#s03), un **double cadran de 12 heures**, ou une
[liste compacte](SCREENS.fr.md#s04). Dans le double cadran, le cercle intérieur
va de 0 à 12 h et le cercle extérieur de 12 à 24 h. Les couleurs sont celles des
barres ; le gris indique qu’aucune action n’est prévue. Les repères du soleil
montrent le lever et le coucher.

[Double cadran actuel S44](SCREENS.fr.md#s44).

Toucher une ligne compacte déplie sa barre. Toucher le calendrier ouvre les
horaires. Toucher un cadran ouvre aussi les horaires ; ses arcs ne se déplacent pas.

## Je veux du confort le matin et le soir

Prenons cet exemple pour le chauffage du salon :

| Quand ? | Ce que je veux |
|---|---|
| Tous les jours, de 6 h 30 à 8 h 30 | Confort : 20 °C |
| Tous les jours, de 17 h à 22 h | Confort : 20 °C |
| Le reste du temps | Éco : 16 °C |

### 1. Ouvrir les horaires

Toucher le **calendrier avec un crayon**, à droite de Chauffage du salon.
Les horaires déjà créés apparaissent sous les sept barres de la semaine.
Si rien n'est encore réglé pour un appareil, la carte affiche sur sa ligne un bouton **Créer un réglage** à la place des barres : il ouvre directement le formulaire d'un premier horaire pour cet appareil.

<a href="images/guide/s06-schedules.png"><img src="images/guide/s06-schedules.png" width="320" alt="Les horaires du chauffage : Confort le matin et le soir, Éco le reste du temps." /></a>

### 2. Régler le matin

1. Toucher **Ajouter un horaire** (**Créer un réglage** s'il n'y en a aucun), ou la ligne du matin si elle existe déjà.
2. Sous **Début**, saisir **06:30**.
3. Sous **Fin**, choisir **Jusqu’à…**, puis saisir **08:30**.
4. Choisir **Tous les jours**.
5. Sous **Action**, choisir **Confort**.
6. Faire défiler jusqu’en bas et toucher **Enregistrer**.

<a href="images/guide/s08-slot-form.png"><img src="images/guide/s08-slot-form.png" width="320" alt="Le formulaire du matin, avec les heures, les jours et Confort." /></a>

[Voir le bas du formulaire et ses boutons](images/guide/s08-slot-form-suite.png).

Les boutons **−** et **+** déplacent l’heure de 15 minutes. Tu peux saisir une
heure plus précise. Si **Tous les jours** est déjà sélectionné, le toucher une
seconde fois enlève tous les jours : il faut alors en choisir à nouveau.

### 3. Régler le soir

Refaire les mêmes gestes avec **17:00**, **22:00** et **Confort**, puis
**Enregistrer**.

### 4. Choisir Éco entre ces horaires

Sous les horaires, toucher **Le reste du temps**, choisir **Éco**, puis
**Enregistrer**. À 8 h 30 et à 22 h, le chauffage reçoit ainsi la demande de 16 °C.

<a href="images/guide/s14-rest-of-time.png"><img src="images/guide/s14-rest-of-time.png" width="320" alt="Choisir le réglage à utiliser le reste du temps." /></a>

**Ne rien changer** signifie qu’aucune action n’est envoyée à la fin.
Cela ne veut dire ni éteindre ni retrouver le réglage précédent.

## Je ne trouve pas Confort ou Éco

Dans le formulaire d’horaire, toucher **Nouveau réglage** :

1. Donner le nom **Confort**.
2. Choisir une couleur.
3. Dans **Action**, choisir l’action proposée par Home Assistant pour régler la
   température de cet appareil. Son nom dépend de ton installation.
4. Saisir **20** dans la température, puis enregistrer l’horaire.

Pour créer **Éco**, ouvrir plutôt **Le reste du temps**, puis **Nouvelle
réglage**. Donner le nom Éco, choisir la température **16**, puis enregistrer.
Si aucune action de température n’apparaît, demander à la personne qui a installé
le chauffage de vérifier **Appareils → Actions proposées** dans les réglages
du programme. Les commandes doivent d’abord y être cochées.

Un réglage peut servir à plusieurs programmes. **Changer Confort de 20 à
21 °C peut donc changer leurs horaires aussi.** Le crayon ouvre son réglage ; la
mention **Aussi utilisé par :** nomme les autres programmes qui s’en servent.

Pour une exception, **Valeur pour cet appareil** permet un autre réglage pour
cet appareil seulement : [S13](SCREENS.fr.md#s13). **Revenir à la valeur commune**
enlève cette exception.

Pour supprimer un réglage, le choisir puis toucher la corbeille à côté du crayon. Une phrase demande
confirmation : **la suppression vaut pour tous les appareils**. Un réglage encore utilisé par un horaire ou un
programme ne peut pas être supprimé ; la phrase donne les noms des programmes à modifier d’abord.

## Je veux utiliser une position favorite ou une valeur qui change

Pour envoyer le volet vers sa position favorite, il faut une commande proposée
par Home Assistant. Si elle existe sous la forme d’un bouton, dans le réglage :

1. Sous **Appliquer l’action à**, choisir **Une autre entité**.
2. Sous **Entité à commander**, choisir le bouton de position favorite.
3. Choisir son action pour l’appuyer.

Exemples actuels : [bouton S42](SCREENS.fr.md#s42) et [valeur venant d’une entité S43](SCREENS.fr.md#s43).

Le nom du bouton dépend de ton installation. Il lance le déplacement ; il ne
sert pas à saisir une nouvelle position favorite.

Pour lire une température ou une position dans un réglage déjà présent : choisir
**Valeur d’une entité**, puis **Entité ou entrée à utiliser** et **Valeur à lire**.
Par exemple, une entrée de nombre peut contenir la température souhaitée.
La valeur est lue **quand l’horaire s’exécute**. Si elle n’est pas disponible,
l’action n’est pas envoyée. Choisir **Valeur fixe** pour saisir toujours le même
nombre. La personne qui prépare la carte peut aider à choisir la bonne entrée.

## Je veux modifier un horaire ou le copier

Le chemin le plus simple est d’ouvrir le calendrier, toucher la ligne concernée,
changer ses heures ou ses jours, puis **Enregistrer**. **Annuler** abandonne la
modification en cours. Pour enlever un horaire, ouvrir sa ligne, toucher
**Supprimer**, puis confirmer.

Tu peux aussi modifier la barre directement : faire un **appui long au doigt**, ou
un clic à la souris, puis sélectionner la plage. Déplacer ses poignées change
les heures. **C’est enregistré dès que tu relâches**, pour ce jour seulement.
Le bandeau **Enregistré · Annuler** permet de revenir en arrière pendant quelques
secondes : [S21](SCREENS.fr.md#s21).

Sous la barre, quand une plage est sélectionnée, deux boutons à ne pas confondre :

- **Couper en deux** (icône « fente au milieu ») coupe la plage en deux parties,
  l’une après l’autre dans le temps ; la partie de droite devient « Rien ».
- **Copier vers…** (icône « deux feuilles ») recopie la plage sur d’autres jours.

**Déplacer toute la plage** : appui long sur la plage puis, sans lever le doigt,
glisser de gauche à droite. Elle garde sa durée et avance par pas de 15 minutes ;
elle s’arrête contre les plages voisines et aux bords du jour. En glissant sur la
barre d’un autre jour (vue Semaine), elle quitte son jour et passe à celui-là, à la
même heure ; si une plage s’y trouve déjà, rien n’est déplacé et un message
l’explique. Une heure de lever ou de coucher du soleil reste liée au soleil et
garde son décalage. Un horaire ponctuel (utiliser sa poignée ronde), une plage qui
passe minuit ou une heure solaire avec limites ne se déplacent pas ainsi : un message
le dit. C’est enregistré au relâchement, avec **Annuler**.

**Copier vers…** permet de choisir d’autres jours. Si une plage existe déjà à cet
endroit, l’écran montre l’avant et l’après :

- **Remplacer** ajuste la partie qui se chevauche et garde le reste.
- **Ne pas copier ce jour** laisse ce jour intact.

Voir les [jours de copie](SCREENS.fr.md#s19) et les [choix de remplacement](SCREENS.fr.md#s20).
Pour un horaire commencé la veille, utiliser le formulaire plutôt que la barre.

## J’ai plusieurs appareils dans un programme

Chaque appareil a ses propres horaires. Exemple : dans le programme du salon, le
thermostat est à 15 °C de 7 h à 22 h et le volet se ferme à 7 h. Sur la carte, la
ligne du volet ne montre que « Fermer », celle du thermostat que « 15 °C ».

- Toucher la barre ou le calendrier d’un appareil ouvre **ses** horaires. En haut
  de l’écran, une pastille par appareil permet de passer à un autre.
- Un nouvel horaire est créé pour cet appareil. Sous **Aussi pour :**, toucher un
  autre appareil pour qu’il suive le même horaire. Seuls les appareils que le
  réglage choisi sait piloter sont proposés (pas de volet pour « 15 °C ») ; s’il n’y
  en a aucun, la ligne n’apparaît pas. Tous cochés : l’horaire vaut pour tout le
  programme, y compris un appareil ajouté plus tard.
- Un horaire qui sert à plusieurs appareils porte « Aussi : » suivi de leurs noms.
  Pour le modifier, l’écran demande toujours **Modifier pour :**
  **Seulement** (le nom de l’appareil) ou **Tous les appareils (N)**. **Seulement**
  ne change que cet appareil ; les autres gardent l’horaire tel quel. Même question
  sur la barre, après un glissement ou un choix de réglage ; **Ne rien changer**
  abandonne la modification. Une modification enregistrée sur la barre affiche
  **Enregistré · Annuler**.
- **Supprimer**, en bas de l’écran, n’enlève que les horaires de cet appareil.
- Dans **Réglages des programmes > Appareils**, retirer un appareil supprime aussi
  ses horaires propres (un message dit combien). Un appareil ajouté suit les
  horaires communs à tous les appareils. Retirer une commande d’un appareil
  propose de lui retirer les horaires qui l’utilisent.

## Je veux fermer le volet au coucher du soleil

Dans son horaire, sous Début, choisir **Coucher du soleil**. Les boutons − et + avancent ou
retardent l’action. Choisir une fin à **07:30** et le réglage de fermeture ;
dans **Le reste du temps**, choisir le réglage d’ouverture.

L’heure du coucher suit le soleil du lieu enregistré dans Home Assistant.
L’action part à la minute exacte calculée (par exemple 17 h 17), décalage compris.
**Au plus tôt à** et **Au plus tard à** (facultatifs) l’empêchent de sortir d’une plage.
Voir [l’écran solaire S09](SCREENS.fr.md#s09).

**Sans fin** sert à lancer une action une seule fois à son début, sans action de
fin : [S10](SCREENS.fr.md#s10). Une action ponctuelle passée n’est pas rejouée après
un redémarrage.

## Je veux des horaires différents pour Maison ou Vacances

Un **mode** est une autre semaine d’horaires : Maison, Dehors, Vacances, Été…
Vacances fonctionne comme les autres. **Le nom ne choisit pas une date et ne
suspend pas les autres programmes.**

Voir [le choix manuel S38](SCREENS.fr.md#s38) et [le suivi d’une entité S39](SCREENS.fr.md#s39).

Dans les réglages de carte, ouvrir **Réglages des programmes**, choisir le
programme, puis **Modes**. **Mode à modifier** choisit les horaires à préparer.
**Modifier les horaires de ce mode** permet de les changer sans activer ce mode.

Pour créer un mode : **Ajouter un mode**, saisir son nom, puis **Appliquer au
programme**. Les boutons Renommer et Copier préparent aussi une modification à
appliquer. Le mode actif ne peut pas être supprimé : en activer un autre d’abord.

Sous **Choisir le mode**, deux possibilités :

- **Manuellement** : **Mode actif — changement immédiat** choisit celui qui
  fonctionne maintenant. Une action peut partir tout de suite. **Annuler la
  modification** ne remet pas le mode précédent.
- **Depuis une entité** : choisir le sélecteur ou l’entité déjà présent dans Home
  Assistant, puis associer chacun de ses états à un mode. Par exemple, le choix
  Vacances de ton sélecteur peut utiliser les horaires Vacances du programme.
  Toucher **États associés** pour voir ou changer les associations, puis
  **Appliquer au programme**.

Si l’entité suivie est indisponible, ou si son état n’a pas d’association,
le dernier mode reste actif. Un mode contrôlé de cette façon ne se choisit plus
manuellement ici : changer le sélecteur habituel de la maison.

Les appareils et **Le reste du temps** restent communs aux modes. Un mode vide
ne signifie donc pas forcément que l’appareil sera éteint. 

## Je veux changer la présentation ou créer un programme

Ces réglages sont destinés à la personne autorisée à préparer la carte.
Si les boutons manquent, demander à cette personne de les ouvrir.

1. Dans Home Assistant, ouvrir le tableau de bord où se trouve Weekly Planner.
2. Ouvrir le menu **⋮**, en haut à droite, puis **Modifier le tableau de bord**.
3. Sur la carte Weekly Planner, choisir **Modifier**.

Les intitulés de Home Assistant peuvent varier légèrement selon sa version.

**Affichage de la carte** permet de choisir **Un seul programme** ou **Plusieurs programmes**.
Dans **Programmes à afficher**, un interrupteur par programme choisit ce que la carte montre ; sous chaque
programme figurent ses appareils. Les boutons **Tout sélectionner par type** (Climatisation, Ouverture…) cochent
d’un coup tous les programmes qui ont un appareil de ce type. Sous **Présentation de la journée**, choisir **Barres**, **Cadran 24 heures**, **Double
cadran 12 heures** ou **Liste compacte**. Les cadrans sont aussi possibles en
liste filtrée. Enregistrer la carte et terminer l’édition du tableau de bord.


Voir [la création S37](SCREENS.fr.md#s37), [la pièce S40](SCREENS.fr.md#s40) et [les filtres S41](SCREENS.fr.md#s41).

Pour commencer, toucher **Nouveau programme**, donner un nom et ajouter un
appareil. **Aucune commande n’est cochée au départ** : choisir celles que l’on veut
retrouver dans les réglages. Lire leur description si le nom n’est pas clair.
Ajouter un deuxième appareil est facultatif. Toucher **Créer le programme**. Si le nom
ou l’appareil manque, le message s’affiche juste sous le champ concerné et le champ
est mis en évidence ; il disparaît dès qu’on le corrige.

Le nouveau programme est alors sélectionné automatiquement : en mode **Un seul
programme**, la carte le montre ; en **liste filtrée**, il est ajouté à la liste
affichée. **Programme à modifier** le désigne. Toucher **Définir
les horaires** pour continuer directement. Si aucune commande n’a encore été
choisie, les régler plus tard dans **Réglages des programmes → Appareils →
Actions proposées**. Enregistrer aussi la carte pour garder sa présentation.

Dans **Général**, **Pièce du programme** permet de le ranger, par exemple dans
Salon. Choisir un nom existant ou en écrire un nouveau. Cette pièce est propre
au programme : elle n’est pas reprise automatiquement de la pièce d’un appareil.
Dans **Affichage de la carte → Plusieurs programmes**, choisir ensuite cette pièce ou
**Toutes les pièces**. Si la carte est vide, vérifier ses filtres.

**Attention aux deux enregistrements :**

| Je touche… | Ce qui change |
|---|---|
| Enregistrer la carte, dans Home Assistant | La présentation de cette carte. |
| Appliquer au programme | Le programme, sur toutes les cartes qui l’utilisent. |

Annuler l’éditeur de carte **n’annule pas un programme déjà appliqué**.
Avant d’appliquer, **Annuler la modification** et **Rétablir** parcourent le
brouillon. Ils ne reviennent pas sur un enregistrement déjà envoyé.
Changer d’onglet ou de programme conserve le brouillon pendant cette édition ;
fermer l’éditeur abandonne ce qui n’a pas été appliqué.

## Je veux comprendre ce qui s’est passé

Sur la carte, toucher **Graphique du jour** sous un appareil ouvre ou ferme son graphique
(réglable : `show_chart`, `chart_collapsed`, voir le README). Dans la fenêtre des horaires, le graphique
est sous les horaires. Ses flèches changent le jour. Il compare ce
qui était prévu avec les données disponibles de l’appareil. Toucher le graphique
ouvre l’historique de Home Assistant : [S15 et S16](SCREENS.fr.md#s15).

Pour parcourir le temps, glissez horizontalement : le graphique continue dans les jours précédents et suivants,
et les dates s’affichent sous lui. Les flèches montrent la période précédente ou suivante, sans changer le zoom.

- **Téléphone** : glissez un doigt pour parcourir ; pincez avec deux doigts pour zoomer ou dézoomer. La page défile toujours verticalement.
- **Ordinateur** : glissez à la souris pour parcourir ; maintenez Maj en glissant pour entourer une plage à zoomer. Ctrl + molette zoome autour du pointeur.
- **Clavier** : `+` et `-` zooment, les flèches déplacent, `0` ou le double clic revient au jour sélectionné.

**Revenir au jour sélectionné** rétablit la journée entière. La fenêtre la plus étroite est de 30 minutes.

### Comparer avec une autre entité

Ouvrez **Options du graphique**, puis **Ajouter une entité** et recherchez son nom. Le panneau est replié au départ.
Une mesure numérique apparaît en courbe : par exemple, comparez température et humidité. Chaque unité a son échelle colorée,
avec trois unités différentes au plus. Des courbes de même unité partagent la même échelle.

Pour une entité à états, cochez les états qui vous intéressent : par exemple « Ouvert » pour une fenêtre.
Vous pouvez en cocher plusieurs, chacun a sa couleur. Les autres états restent neutres ; les données manquantes
ont un motif distinct. La bande porte le nom de l’entité et suit exactement la période du graphique.

Les choix s’enregistrent automatiquement et sont partagés pour cet appareil dans ce programme, sur la carte et dans la
fenêtre des horaires. Replier les options ne masque pas les tracés. La croix retire seulement une source du graphique,
sans agir sur l’appareil. Une entité disparue et les états enregistrés restent dans les options pour pouvoir les retrouver ou les retirer.
En lecture seule, les sources se consultent mais ne se modifient pas.

[Graphique sans données S45](SCREENS.fr.md#s45).

Le texte sous le graphique distingue **Aucun historique enregistré** et
**Aucune action prévue**. Pour une journée future, l’historique n’est pas encore
connu. Si son chargement échoue, les actions prévues restent affichées.
S’il manque des mesures, cela ne prouve pas que l’horaire n’a pas fonctionné.
Un repère rouge peut indiquer un changement manuel ; le programme ne corrige pas
automatiquement un réglage fait à la main.

Si **Tous les programmes suspendus** apparaît, tous les horaires sont en pause.
Ce réglage est distinct d’un mode appelé Vacances et n’équivaut pas à tout éteindre. Si les boutons sont grisés, vérifier les
droits de modification avec la personne qui a installé la carte.

## Pour la personne qui installe

- Plusieurs programmes peuvent utiliser le même appareil. **Le plus petit numéro
  de priorité l’emporte** ; à égalité, le plus ancien. Un autre programme peut
  reprendre la main à la fin d’une plage.
- Général contient les conditions du programme ; elles doivent toutes être
  satisfaites pour ses plages. Une condition fausse peut laisser agir le défaut.
  Le formulaire actuel n’édite pas les conditions par plage.
- Appareils → Actions proposées limite les choix de services. Les modes et favoris
  dépendent de ce que Home Assistant expose : [exemples](GENERIC_ACTIONS.md).
- Réappliquer peut envoyer l’action courante après un changement ou un redémarrage.
  Les fins manquées restent un cas de rattrapage. Les identifiants de profils restent stables pour les automatisations.
- La pièce du programme se définit dans Général ; le filtre de carte propose les
  pièces existantes. Les cadrans fonctionnent aussi dans une liste filtrée.
- Les options globales se trouvent dans Paramètres → Appareils et services →
  Weekly Planner → Configurer : [S35](SCREENS.fr.md#s35). L’option de réapplication
  par défaut est affichée, mais n’est pas encore utilisée lors de la création ;
  régler chaque programme explicitement.
- Les captures sont locales : programmes synthétiques du salon et écrans natifs
  de test, dont **Profil Bureau**. S21 utilise un enregistrement simulé en mémoire,
  sans écriture de programme ni commande d’appareil. Ce n’est pas un essai physique.

[Voir tous les écrans dans l’atlas](SCREENS.fr.md) · [Inventaire](SCREEN_INVENTORY.md)
