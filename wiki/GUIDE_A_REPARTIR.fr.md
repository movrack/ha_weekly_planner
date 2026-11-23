Français

# Reste de l’ancien guide, à répartir (non publié)

Ce fichier garde ce qui n’appartient pas à la section 2 du plan (guide « Je veux… ») : il attend d’être réécrit,
contre l’interface actuelle, dans les sections 3 à 7 (`docs/PLAN_WIKI.md`), puis il sera supprimé. Il n’est pas
dans la barre latérale et aucune page n’y renvoie. Ne rien y ajouter.

Où chaque bloc doit aller :

| Bloc ci-dessous | Section du plan |
|---|---|
| Affichages de la carte, cadrans, gestes | 4.2, 4.7 |
| Délai aléatoire | 5.2 |
| Réglages : modifier, supprimer, valeur pour un appareil, position favorite, valeur d’une entité | 5.1 |
| Si une option du sélecteur change de nom | 5.6 |
| Fiche du programme | 4.5 / 5.4 / 5.5 |
| Graphique : parcourir, zoomer, lire les repères | 4.3 |
| Pour la personne qui installe | 3.3, 3.6, 5.5, 5.6, 6.2, 6.5, 7.3 |

## Affichages de la carte

Selon le choix de la personne qui a préparé la carte, vous pouvez aussi voir un
[cadran de 24 heures](SCREENS.fr.md#s03), un **double cadran de 12 heures**, ou une
[liste compacte](SCREENS.fr.md#s04). Dans le double cadran, le cercle intérieur
va de 0 à 12 h et le cercle extérieur de 12 à 24 h. Les couleurs sont celles des
barres ; le gris indique qu’aucune action n’est prévue. Les repères du soleil
montrent le lever et le coucher.

[Double cadran S44](SCREENS.fr.md#s44).

Deux autres affichages existent. **Horaires du jour** montre aujourd’hui sous forme de liste simple : une ligne par horaire, avec son
réglage, jusqu’à quand il dure et un repère « Maintenant ». Le **Comparateur** montre un jour à la fois pour toute la carte : une rangée de puces (lundi à dimanche, puis **Jour férié**, grisée avec sa raison quand aucun programme n’en a), aujourd’hui choisi par défaut, avec le nom du jour en
titre (aujourd’hui en gras, avec le repère « Maintenant »).
Chaque appareil y a sa barre, tous les programmes mélangés. Pour modifier un jour, gardez le doigt (ou le bouton de la souris) appuyé sur une barre
ou sur le nom du jour, ou utilisez Entrée ou Espace : la fenêtre des horaires s’ouvre sur ce jour. Un simple clic ne l’ouvre pas, il rappelle seulement
comment faire. Une icône en haut à droite ouvre le choix du programme à modifier, et la barre d’un programme en pause est grisée avec la mention
« en pause ».

Toucher une ligne compacte déplie sa barre ; chaque appareil y tient sur deux lignes, groupés par type. Toucher le calendrier ouvre les
horaires. Un simple clic ne modifie jamais : un appui long (doigt ou souris) sur un cadran permet de modifier ses arcs avec les poignées.
Au clavier, une poignée sélectionnée se déplace de 15 minutes avec les flèches gauche et droite ;
le changement est enregistré après un court instant. La touche Échap ferme d’abord l’éditeur
ouvert, puis la fenêtre ; dans une fenêtre, le focus reste à l’intérieur et revient à son point de départ à
la fermeture. Sur téléphone, un balayage vers le bas sur l’en-tête d’une fenêtre la ferme ; sur ordinateur, le bouton
**Agrandir / réduire** (flèches, à côté de la croix) l’élargit.

Quand un réglage est sélectionné, ses heures restent visibles au-dessus de la barre, au centre du cadran simple ou sous le cercle pour le double cadran et les textes longs, même sur téléphone. Elles se mettent à jour pendant le déplacement ou le glissé d’une poignée. Pour un horaire solaire, l’heure calculée est précisée avec le lever ou le coucher du soleil ; au survol de l’icône du soleil sur une barre, l’infobulle donne l’heure du lever ou du coucher calculée par le serveur (la même pour tous les appareils le même jour), suivie de « plus jusqu’à n min au hasard » quand l’horaire a un délai aléatoire. « Dès » indique une action sans fin ; « lendemain » indique une fin après minuit. Au survol ou au focus clavier, chaque réglage affiche son nom et ses heures, sélectionné ou non, dans les barres comme sur les cercles. Le trait « maintenant » affiche l’heure actuelle au survol ou au focus, actualisée chaque minute. Sa zone de survol dépasse le trait pour le rendre facile à viser, sans gêner les poignées. Les mêmes informations sont accessibles aux lecteurs d’écran.

## Délai aléatoire

**Délai aléatoire** (sous **Options avancées**, pour le début et pour la fin) : cocher la case, puis
saisir **Délai maximum (minutes)**, de 1 à 240. L’action part chaque jour à un moment pris au hasard
dans ce délai ; une phrase donne la fenêtre calculée (« Dans les N prochaines minutes »). Il faut que l’horaire
garde au moins 5 minutes : sinon l’écran demande de réduire le délai ou d’allonger l’horaire.

<a href="images/guide/s49-advanced-options.png"><img src="images/guide/s49-advanced-options.png" width="320" alt="L’horaire avec Options avancées ouvertes : soleil, limite d’heure, délai aléatoire." /></a>

## Réglages : modifier, supprimer, valeur pour un appareil

Dans le panneau **Réglages**, le bouton **Modifier** (le crayon) ouvre le réglage choisi.

<a href="images/guide/s50-setting-editor.png"><img src="images/guide/s50-setting-editor.png" width="320" alt="Un réglage avec ses Options avancées ouvertes." /></a>

Pour une exception, ouvrir un réglage existant avec le crayon (panneau **Réglages**), puis **Options avancées** :
**Valeur pour cet appareil** permet une autre valeur pour cet appareil seulement
([S13](SCREENS.fr.md#s13)). **Revenir à la valeur commune** enlève cette exception. Ces deux
choix n’existent que pour la modification d’un réglage déjà créé.

Pour supprimer un réglage, ouvrir le panneau **Réglages**, le choisir puis toucher la corbeille à côté du crayon. Une phrase demande
confirmation : **la suppression vaut pour tous les appareils**. Un réglage encore utilisé par un horaire ou un
programme ne peut pas être supprimé ; la phrase donne les noms des programmes à modifier d’abord.

Si un formulaire a des changements non enregistrés, ouvrir un autre panneau demande d’abord :
**Oui, les abandonner** les perd, **Non, continuer** les garde.

## Position favorite ou valeur qui change

Pour envoyer le volet vers sa position favorite, il faut une commande proposée
par Home Assistant. Si elle existe sous la forme d’un bouton, dans le réglage, ouvrir **Options avancées**
de l’éditeur d’action, puis :

1. Sous **Appliquer l’action à**, choisir **Une autre entité**.
2. Sous **Entité à commander**, choisir le bouton de position favorite.
3. Choisir son action pour l’appuyer.

Exemples : [bouton S42](SCREENS.fr.md#s42) et [valeur venant d’une entité S43](SCREENS.fr.md#s43).

Le nom du bouton dépend de votre installation. Il lance le déplacement ; il ne
sert pas à saisir une nouvelle position favorite.

Pour lire une température ou une position dans un réglage déjà présent : dans **Options avancées**
de l’éditeur d’action, choisir **Valeur d’une entité**, puis **Entité ou entrée à utiliser** et **Valeur à lire**.
Par exemple, une entrée de nombre peut contenir la température souhaitée.
La valeur est lue **quand l’horaire s’exécute**. Si elle n’est pas disponible,
l’action n’est pas envoyée. Choisir **Valeur fixe** pour saisir toujours le même
nombre. La personne qui prépare la carte peut aider à choisir la bonne entrée.

## Si une option du sélecteur change de nom

Si une seule option est renommée, les horaires suivent le nouveau nom dans tous
les programmes ; **Le mode X a été renommé en Y** s’affiche, dans l’écran des horaires
seulement, avec un bouton **Annuler** pendant une semaine et un bouton **OK** qui ferme
l’avis. Dans les autres cas, Weekly Planner ne devine pas : le mode sans option
garde ses horaires, marqué **n’existe plus** (« Le mode X n’existe plus dans la liste des
modes. »), et rien n’est effacé. L’écran des horaires propose chaque nouvelle option
(**Est-ce devenu… ?**) ou **Supprimer ses horaires**, et un message de **Réparations** de Home
Assistant le signale aussi.

## Fiche du programme

Le panneau **Weekly Planner** a trois rubriques : **Actions** (**Nouveau programme**, **Dupliquer un programme**,
**Ordre des priorités**) et la **Liste des programmes**. Ouvrir un programme montre sa **Fiche du programme** avec
deux onglets, **Général** et **Appareils**.

Dans **Général** : **Nom**, **Pièce (facultative)**, **Icône**, la **Priorité** (bloc « Partage un appareil avec N
programmes », voir [Priorités](PRIORITES.fr.md)), sous **Autres paramètres** **Renvoyer le réglage en cours après un
redémarrage ou un changement**, et **Conditions du programme**. **Supprimer ce programme** supprime le programme,
avec ses horaires. Dans **Appareils** : les appareils du programme et leurs **Actions proposées**. Les onglets se
parcourent aux flèches, avec Début et Fin.

**Attention aux deux enregistrements :** l’éditeur de la carte (Home Assistant) ne change que la présentation de cette
carte ; **Enregistrer** dans le panneau change le programme, sur toutes les cartes qui l’utilisent. Annuler l’éditeur
de carte **n’annule pas un programme déjà enregistré**. Avant d’enregistrer, **Annuler la modification** et **Refaire**
parcourent le brouillon. Ils ne reviennent pas sur un enregistrement déjà envoyé.

## Graphique : parcourir, zoomer, lire les repères

Pour parcourir le temps, glissez horizontalement : le graphique continue dans les jours précédents et suivants,
et les dates s’affichent sous lui. Les flèches montrent la période précédente ou suivante, sans changer le zoom.

- **Téléphone** : glissez un doigt pour parcourir ; pincez avec deux doigts pour zoomer ou dézoomer. La page défile toujours verticalement.
- **Ordinateur** : glissez à la souris pour parcourir ; maintenez Maj en glissant pour entourer la zone à zoomer. Ctrl + molette zoome autour du pointeur.
- **Clavier** : `+` et `-` zooment, les flèches déplacent, `0` ou le double clic revient au jour sélectionné.

**Revenir au jour sélectionné** rétablit la journée entière. La fenêtre la plus étroite est de 30 minutes.
La légende est sous les flèches et la date : d’abord les courbes de l’appareil, puis les sources ajoutées.

Les valeurs chiffrées du programme forment une ligne en escalier. Les noms trop longs des bandes sont raccourcis ;
leur nom complet est disponible au survol. Les bandes suivent le zoom et le déplacement dans les jours voisins.

Le point plein indique le début d’un palier du programme ; l’anneau creux indique le retour au « reste du temps ».
Leur ligne pointillée repère l’heure. Par exemple, lundi : point plein Confort à 08:45, anneau Éco à 17:00.
À minuit, un point plein montre le réglage déjà en cours, y compris celui commencé la veille.

Une légende précise la grandeur et son unité quand Home Assistant fournit sa traduction ; sinon elle indique
« Valeur mesurée » ou « Valeur demandée ». Pour un thermostat, la mesure est la température actuelle ; la demande
et le programme correspondent à la température cible. Une échelle en % va toujours de 0 à 100 ; les autres s’adaptent
aux valeurs. Pour une courbe à états on/off, la légende précise **on = 100, off = 0**. Les données manquantes ont un
motif distinct.

[Graphique sans données S45](SCREENS.fr.md#s45).

## Pour la personne qui installe

- Plusieurs programmes peuvent utiliser le même appareil : ils sont **en concurrence** et classés par rang
  (1, 2, 3…). **Le rang 1 l’emporte** ; à égalité, le plus ancien. L’ordre se règle par glisser-déposer
  (bouton **Ordre des priorités** du panneau, ou bloc de l’onglet Général) : [Priorités](PRIORITES.fr.md).
  Un autre programme peut reprendre la main à la fin d’un horaire.
- **Conditions du programme** (onglet **Général**) : elles doivent toutes être vraies pour que les horaires du
  programme s’appliquent. Chaque condition choisit un appareil (**Appareil**), éventuellement **Ce qu’on vérifie
  (facultatif)** (un attribut, par exemple `temperature`), une **Comparaison** (**est**, **n’est pas**, **est
  inférieur à**, **est supérieur à**) et une **Valeur attendue** (par exemple 20, « on » = allumé, « off » =
  éteint). **Ajouter une condition** en ajoute une ; la corbeille la retire. Une condition fausse peut laisser agir
  un autre programme ou le réglage du reste du temps. Les conditions ne se règlent pas par horaire.
- **Actions proposées** (onglet **Appareils**) limite les choix de services. Les modes et favoris
  dépendent de ce que Home Assistant expose : [exemples](GENERIC_ACTIONS.md).
- **Renvoyer le réglage en cours** peut envoyer l’action courante après un changement ou un redémarrage.
  Les fins manquées restent un cas de rattrapage. Les identifiants internes des modes restent stables.
- Les options globales se trouvent dans Paramètres → Appareils et services →
  Weekly Planner → Configurer : [S35](SCREENS.fr.md#s35). L’option de réapplication
  par défaut donne la valeur de départ de **Renvoyer le réglage en cours** à chaque nouveau programme.
  Les autres options : **Seuls les administrateurs peuvent modifier les programmes**, l’alerte si un
  appareil est indisponible (1 à 1440 minutes) et le délai d’attente avant d’appliquer un changement de condition
  (0 à 60 minutes).
- Limites : nom de programme 60 caractères, de réglage 30, de mode 40 ; 20 modes par programme,
  50 horaires par jour, 100 appareils par programme, 10 conditions par horaire ;
  décalage solaire de −240 à +240 minutes ; délai aléatoire de 1 à 240 minutes ; nom affiché d’une source de
  graphique 60 caractères, 100 états mis en évidence.
- Notifications persistantes : « X est indisponible : son action planifiée est toujours en attente »,
  « X : … n’a pas pu être exécuté », et « Le fichier de configuration … n’a pas pu être lu »
  (les programmes sont alors en pause et rien n’est écrasé). Réparations de Home Assistant :
  entités supprimées, fichier YAML ignoré, modes devenus globaux, mode qui ne correspond à aucune option du sélecteur.
- Le fichier YAML `/config/www/weekly_planner.yml` est public : voir l’avertissement de la [référence](REFERENCE.fr.md#fichier-yaml).

[Voir tous les écrans dans l’atlas](SCREENS.fr.md)
