Français

# Lexique : les mots de Weekly Planner

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Chaque mot est écrit comme dans l’interface (la carte, le panneau **Weekly Planner**, les réglages de
l’intégration). Une page pour le détail est indiquée à chaque fois.

## Programme, appareil, réglage

| Mot | Ce que c’est |
|---|---|
| **Programme** | Un ensemble d’appareils avec leurs réglages et leurs horaires. C’est ce qu’on met en marche, en pause, ou qu’on règle sur la carte. Exemple : **Chauffage du salon**. |
| **Appareil** | Ce qu’un programme commande : un chauffage, un volet, une lampe, une prise… Un programme peut en réunir plusieurs ([Plusieurs appareils dans un programme](GUIDE_PLUSIEURS_APPAREILS.fr.md)). |
| **Réglage** | Ce que les appareils doivent faire, avec un nom et une couleur. Exemple : **Confort = 20 °C**, ou **Fermé = volet à 0 %**. Un réglage sert à tous les horaires, de tous les modes et de tous les programmes : le modifier le change partout (l’écran prévient : « Attention : modifier ce réglage modifie aussi… »). On peut donner à un appareil sa propre valeur avec **Valeur pour cet appareil**. |
| **Action** | Dans l’éditeur d’un réglage, la commande que Home Assistant sait envoyer à l’appareil (allumer, fixer une température, ouvrir…). Un programme limite ses choix avec **Actions proposées** (onglet **Appareils** de la **Fiche du programme**). |

« **Réglages** » au pluriel est aussi le nom de la rubrique où l’on crée, modifie et supprime les réglages, dans la
fenêtre des horaires. Un **Réglage** au singulier est toujours l’un de ces réglages nommés.

Premiers pas : [Premier programme](PREMIER_PROGRAMME.fr.md). Réglages en détail :
[Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md).

## Horaire, fin d’horaire, le reste du temps

| Mot | Ce que c’est |
|---|---|
| **Horaire** | Une règle « de telle heure à telle heure, tels jours, tel réglage », pour un programme et un mode. Exemple : **Confort** de 6 h 30 à 8 h 30, **Tous les jours**. |
| **Début** et **Fin** | Les deux heures d’un horaire. Sous **Durée**, on choisit **Jusqu’à une heure** (il a une fin) ou **À cette heure seulement** (il n’a pas de fin : l’action part à cette heure, une fois). |
| **Le reste du temps** | Le réglage envoyé à un appareil quand **aucun horaire** ne s’applique, et à la **fin** d’un horaire. Exemple : **Éco** le reste du temps. S’il est sur **Laisser tel quel**, rien n’est envoyé : l’appareil garde son dernier réglage. |
| **Horaires du jour** | Une façon de voir aujourd’hui, en liste : une ligne par horaire. Voir [La carte](CARTE.fr.md#les-affichages). |

Un horaire qui se termine après minuit est affiché avec « lendemain » ; un horaire sans fin est affiché avec « dès »
suivi de l’heure.

Détail : [Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md), [Modifier ou copier un horaire](GUIDE_MODIFIER_COPIER.fr.md).

## Priorité

Quand **plusieurs programmes** commandent le **même appareil**, celui qui est placé le plus haut dans **l’ordre
des priorités** l’emporte : c’est le **rang 1**. Les modes n’ajoutent aucune priorité. On ne tape pas un rang :
on déplace les programmes dans une liste.

Détail et exemple : [Les priorités](PRIORITES.fr.md).

## Mode et mode qui en suit un autre

| Mot | Ce que c’est |
|---|---|
| **Mode** | Un état global de la maison (**Maison**, **Absent**, **Vacances**, **Hiver**, **Été**…), le même pour tous les programmes et choisi **en dehors** de Weekly Planner. Chaque programme a ses propres horaires pour chaque mode. |
| **Mode actif** | Le mode en vigueur dans toute la maison en ce moment. La liste des modes montre « (Actif) » à côté de lui ; la carte écrit **Mode : Maison**. |
| **Sélecteur de mode** | La liste de choix de Home Assistant (`input_select` ou `select`) dont l’état est le mode actif. Il est facultatif : sans lui, il n’y a qu’un seul mode. Weekly Planner le lit, il ne le change jamais. Les modes sont ses options. |
| **Mode par défaut** | Le mode utilisé quand le sélecteur n’a pas de choix utilisable. |
| **Mêmes horaires que :** | Un mode peut utiliser en permanence les horaires d’un autre mode (sa source) : ce qu’on change dans la source se voit aussitôt dans l’autre. Ce mode n’a pas d’horaires à lui. Le lien se règle par programme et par mode, sous **Options avancées** de la partie **Mode**. **Arrêter de suivre** donne au mode une copie des horaires de la source. |
| **n’existe plus** | Un mode qui a des horaires mais que le sélecteur ne propose plus (option supprimée ou renommée). Il n’est jamais effacé tout seul : on le rattache à une nouvelle option (**Est-ce devenu… ?**) ou on le supprime (**Supprimer ses horaires**). |

Le mode **Vacances** est un mode comme les autres. Il n’est pas la **suspension de tous les programmes**
([Pause, saut, suspension](#pause-saut-suspension)).

Détail : [Des horaires selon le mode](GUIDE_MODES.fr.md).

## Jour férié

Un **Jour férié** est un jour déclaré spécial par une entité de Home Assistant (jour férié ou congé), **choisie une
seule fois pour toute la maison** dans les réglages de l’intégration (**Jour férié ou congé**). Ce jour-là, dans le
mode actif, le réglage **Jour férié** du mode remplace le jour de la semaine : mêmes horaires qu’un autre jour
(**Prendre les horaires de :**), ou **Mes propres horaires**. Il se règle **par programme et par mode**. Sans
réglage, le jour normal s’applique. Hier et demain restent des jours normaux.

Ce n’est ni un mode, ni le mode **Vacances**, ni la suspension de tous les programmes.

Détail : [Les jours fériés](GUIDE_JOUR_FERIE.fr.md).

## Conditions

Une **condition** est une règle qui doit être vraie pour qu’un programme agisse. Exemple : « le capteur de présence
de la maison est `on` », ou « la température extérieure est inférieure à 5 ». Elles se règlent dans la **Fiche du
programme**, onglet **Général**, sous **Conditions du programme** ; **toutes** doivent être vraies.

Chaque condition a :

- un **Appareil** (une entité de Home Assistant : capteur, interrupteur, entrée…) ;
- **Ce qu’on vérifie (facultatif)** : un attribut, par exemple `temperature` ; sans lui, c’est l’état de l’appareil ;
- une **Comparaison** : **est**, **n’est pas**, **est inférieur à**, **est supérieur à** ;
- une **Valeur attendue** : par exemple `20`, `on` (allumé) ou `off` (éteint).

**Ajouter une condition** en ajoute une ; **Supprimer cette condition** la retire. Une condition fausse ne fait
rien perdre : le programme ne commande pas, et un autre programme ou **Le reste du temps** peut s’appliquer
([Les priorités](PRIORITES.fr.md)). Les conditions se règlent par programme, pas par horaire.

Deux précisions :

- Si l’appareil de la condition devient `unavailable` ou `unknown`, la condition **garde sa dernière valeur
  connue**.
- Un changement n’est pris en compte qu’après une attente, pour ignorer les oscillations brèves : 2 minutes au
  départ, réglable dans les réglages de l’intégration (**Attendre avant d’appliquer un changement de condition**,
  de 0 à 60 minutes).

## Pause, saut, suspension

Trois façons d’arrêter, de la plus petite à la plus grande :

| Mot | Ce que c’est |
|---|---|
| **En pause** | Un programme arrêté **sans limite de durée** (choix **Jusqu’à ce que je la reprenne**), jusqu’à ce qu’on le remette en marche. Le badge dit **En pause (sans date de reprise)**. |
| **En pause jusqu’au…** | Un programme arrêté pour une **durée choisie** (1 heure, 1 jour, 7 jours, ou des heures et des jours). Il **reprend tout seul**. Le badge donne la date de reprise. |
| **Sauter le prochain changement** | Le prochain changement d’un programme n’est pas envoyé ; le suivant se passe comme prévu. C’est un service, sans bouton sur la carte. |
| **Suspension de tous les programmes** | Un interrupteur général qui arrête **tous** les programmes à la fois, quel que soit le mode. Chaque appareil reçoit une fois son **Le reste du temps**, puis plus rien. La carte écrit **Tous les programmes suspendus**. Elle prime sur le mode et n’est pas le mode **Vacances**. |

Une **Reprise** est le retour d’un programme en marche : à la main (on remet l’interrupteur) ou tout seul à la fin
d’une pause. Elle recalcule ce qui est prévu à ce moment, sans rejouer le passé. Une pause n’éteint pas les
appareils.

Détail : [Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md).

## Les mots de l’écran

| Mot | Où et à quoi il sert |
|---|---|
| **Fiche du programme** | L’écran d’un programme dans le panneau, avec les onglets **Général** (nom, pièce, icône, priorité, conditions) et **Appareils** (appareils et **Actions proposées**). |
| **Liste des programmes** | La liste du panneau, avec **Trier** et **Filtrer**. |
| **Aperçu** | Dans le panneau, la carte elle-même en liste compacte, pour les programmes de la liste. |
| **Options avancées** | Un pli qui range les choix rares d’un formulaire (soleil, délai aléatoire, autre entité à commander, mode qui suit un autre). Voir [La carte](CARTE.fr.md#les-options-avancées). |
| **Lecture seule** | Vous pouvez regarder mais pas modifier. Les boutons restent affichés, grisés, avec la raison. |
| **Renvoyer le réglage en cours après un redémarrage ou un changement** | Une case de la **Fiche du programme** (sous **Autres paramètres**) : le réglage en cours est renvoyé aux appareils après un redémarrage de Home Assistant ou une modification. |
| **Fichier de configuration** | Le fichier `weekly_planner.yml`, qui reflète les programmes et se relit quand on le modifie à la main. |

Pour tout voir à l’écran : [Atlas des écrans](SCREENS.fr.md).

[Accueil](ACCUEIL.fr.md)
