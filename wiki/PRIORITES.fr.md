Français

# Les priorités : quel programme commande l’appareil

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** comprendre ce qui se passe quand **deux programmes visent le même appareil**, et choisir
lequel passe en premier.

## La règle

- Deux programmes qui ont **au moins un appareil en commun** sont **en concurrence**. Si un troisième partage un
  appareil avec l’un des deux, il fait partie du même groupe. Les horaires et les modes n’y changent rien.
- Dans un groupe, chaque programme a un **rang** : 1, 2, 3… **Le rang 1 l’emporte.** À rang égal, le programme
  le plus ancien passe devant.
- Le rang ne se tape pas : on **déplace** les programmes dans une liste ([Changer l’ordre](#changer-lordre)).
- Pendant qu’un horaire du rang 1 est en cours, c’est lui qui commande l’appareil. Quand il se termine, si un
  horaire d’un programme de rang plus bas est **encore en cours**, l’appareil reçoit le réglage de cet horaire.
- Quand **aucun horaire** n’est en cours, c’est **Le reste du temps du programme de rang 1** qui s’applique.
  S’il est sur **Laisser tel quel**, rien n’est envoyé : l’appareil garde son dernier réglage.

Un programme **en pause** ne commande plus rien : ses appareils sont libres pour les autres
([Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md)). Un programme dont les **conditions** ne sont pas vraies ne
commande pas non plus : il laisse la main à l’autre ([Lexique](LEXIQUE.fr.md#conditions)). Une action **À cette
heure seulement** (sans heure de fin) d’un programme de rang plus bas est ignorée tant qu’un horaire d’un
programme de rang plus haut est en cours.

## Un exemple réel : le télétravail

Le thermostat du salon (`climate.salon`) suit déjà le programme **Chauffage du salon** : **Confort** (19 °C) de 6 h 30
à 8 h 30 et de 17 h à 22 h 30, **Éco** (16 °C) le reste du temps. Les jours de télétravail, on veut 21 °C dans la
journée, sans toucher à ce programme.

1. Créer un second programme, **Télétravail**, sur le **même thermostat** : un réglage **Bureau** (21 °C), un horaire
   **Bureau** de 9 h à 18 h en semaine, et **Éco** comme **Le reste du temps**.
2. Dans l’onglet **Général** de **Télétravail**, sous **Conditions du programme**, ajouter la condition : l’interrupteur
   `input_boolean.teletravail` **est** `on`.
3. Placer **Télétravail** au rang 1 ([Changer l’ordre](#changer-lordre)).

Un jour de télétravail, le thermostat reçoit :

| Heure | Qui commande | Consigne |
|---|---|---|
| avant 6 h 30 | le reste du temps | 16 °C (Éco) |
| 6 h 30 – 8 h 30 | Chauffage du salon (Télétravail n’a pas d’horaire à ce moment) | 19 °C |
| 8 h 30 – 9 h | le reste du temps | 16 °C |
| 9 h – 18 h | Télétravail (rang 1) | 21 °C |
| 18 h – 22 h 30 | Chauffage du salon, dont l’horaire de 17 h est encore en cours | 19 °C |
| après 22 h 30 | le reste du temps | 16 °C |

Les jours sans télétravail, la condition est fausse et seul **Chauffage du salon** commande.

**Pourquoi Éco aussi dans Télétravail :** « le reste du temps » qui s’applique est celui du programme de rang 1,
même quand ses conditions sont fausses. Avec **Laisser tel quel** dans **Télétravail**, le thermostat resterait à
19 °C après 22 h 30. Donnez au programme de rang 1 le même **Le reste du temps** qu’aux autres, ou
**Laisser tel quel** si vous voulez volontairement ne rien envoyer.

D’autres cas du même genre : [Garde alternée des enfants](RECETTE_GARDE_ALTERNEE.fr.md) et
[Réduire le chauffage pendant les heures de pointe](RECETTE_HEURES_DE_POINTE.fr.md).

## Voir si un appareil est partagé

Dans le panneau **Weekly Planner**, ouvrir un programme, onglet **Appareils** : sous un appareil partagé, la ligne
**Aussi commandé par :** donne les autres programmes, avec le lien **Voir l’ordre des priorités**. Dans l’onglet
**Général**, un bloc **Partage un appareil avec N programmes · passe en 2e** (selon le cas) donne le rang du programme.

## Changer l’ordre

- **Pour tous les groupes à la fois :** dans le panneau **Weekly Planner**, sous **Actions**, toucher **Ordre des
  priorités** (« Qui gagne quand deux programmes commandent le même appareil »). Chaque groupe est une liste titrée
  par les appareils partagés ; chaque ligne donne le rang (**Rang 1 :**) et les autres appareils du programme
  (**aussi : …**). Faire glisser une ligne par sa poignée, ou utiliser les flèches ↑ et ↓ de la ligne. Le changement
  est enregistré tout de suite ; la bande **Ordre enregistré** propose **Remettre comme avant**, jusqu’au déplacement
  suivant ou à la sortie de l’écran. **Terminé** ferme l’écran. Les programmes qui n’ont pas de concurrent sont
  listés à part, sous **Un seul programme sur ces appareils**, sans pouvoir être déplacés (le texte dit pourquoi).
- **Depuis un programme :** onglet **Général**, bloc **Partage un appareil avec N programmes · passe en 2e**. Il
  s’ouvre tout seul, avec la note « Ce programme passe en dernier. Changez l’ordre si besoin. », quand la
  concurrence est nouvelle. Une ligne déplacée porte la mention **non enregistré** : l’ordre est enregistré avec
  **Enregistrer** ; **Annuler** l’abandonne.
- Un programme qui commence à partager un appareil se place **en dernier** du groupe.
- Dans la **Liste des programmes**, **Trier** propose **Priorité (le n° 1 d’abord)** pour voir le classement.

## À savoir

- Les modes ne changent pas l’ordre : un programme garde son rang quel que soit le mode actif
  ([Des horaires selon le mode](GUIDE_MODES.fr.md)). Pour une exception par-dessus un programme **sans toucher au
  mode**, c’est ici qu’il faut venir.
- Si un appareil ne fait pas ce qu’on attend, regarder d’abord s’il est partagé : un autre programme a peut-être
  la main ([Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md)).

[← Lexique](LEXIQUE.fr.md) · [Accueil](ACCUEIL.fr.md)
