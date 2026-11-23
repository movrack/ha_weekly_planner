Français

# Volets : lever et coucher du soleil, grasse matinée le week-end

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** les trois volets du rez-de-chaussée (salon, cuisine, bureau) s’ouvrent au lever du soleil, mais
pas avant 7 h en semaine ni avant 9 h le week-end, et se ferment 15 minutes après le coucher du soleil, mais pas
après 21 h 30. Les heures suivent les saisons toutes seules.

## Ce qu’il faut

- Un programme « Volets du rez-de-chaussée » avec les trois volets (`cover.volet_salon`, `cover.volet_cuisine`,
  `cover.volet_bureau` dans l’exemple), dont l’action qui règle la position est cochée sous **Actions proposées**
  ([Plusieurs appareils dans un programme](GUIDE_PLUSIEURS_APPAREILS.fr.md)).
- Deux réglages : **Ouvert** (position 100 %) et **Fermé** (position 0 %). Dans Home Assistant, 100 % veut dire
  ouvert.
- Le lieu de la maison réglé dans Home Assistant : l’heure du lever et du coucher en vient.

## Étapes

1. Sur la carte, toucher **Modifier** à droite d’un volet, ouvrir **Horaires**, puis **Ajouter un horaire**.
2. Sous **Jours**, toucher **En semaine**. Sous **Début**, ouvrir **Options avancées** et toucher **Lever du soleil**.
   Cocher **Pas avant / pas après une heure fixe** et saisir **07:00** sous **Au plus tôt à**
   ([Suivre le soleil](GUIDE_SOLEIL.fr.md)).
3. Sous **Durée**, choisir **À cette heure seulement**. Sous **Réglage**, choisir **Ouvert**.
4. Sous **Aussi pour :**, toucher les deux autres volets, puis **Enregistrer**
   ([Plusieurs appareils](GUIDE_PLUSIEURS_APPAREILS.fr.md#3-donner-le-même-horaire-aux-deux-appareils)).
5. Refaire le même horaire pour **Week-end**, avec **Au plus tôt à** **09:00**.
6. Ajouter l’horaire du soir : **Tous les jours**, **Début** sur **Coucher du soleil**, un appui sur **+**
   (15 minutes après), **Au plus tard à** **21:30**, **À cette heure seulement**, **Réglage** **Fermé**, les trois
   volets, **Enregistrer**.

## Résultat

Chaque jour, les trois volets se ferment 15 minutes après le coucher du soleil, au plus tard à 21 h 30 (en été,
quand le soleil se couche très tard). Ils s’ouvrent au lever du soleil, mais pas avant 7 h du lundi au vendredi, ni
avant 9 h le samedi et le dimanche. Sous le formulaire, une phrase donne l’heure du jour.

## À savoir

- Les horaires **À cette heure seulement** envoient la position une fois, à l’heure. Si vous ouvrez un volet à la
  main, il y reste jusqu’au prochain horaire.
- Ces horaires n’ont pas d’heure de fin : laissez **Le reste du temps** sur **Laisser tel quel**, rien n’est
  envoyé entre deux horaires.
- Pour des volets qui ne partent pas tous ensemble, ajoutez un **Délai aléatoire** : [Horaires aléatoires](REGLAGES.fr.md#horaires-aléatoires).
- Pour fermer en plein été les volets de la façade sud l’après-midi : [Volets d’été anti-chaleur](RECETTE_VOLETS_ETE.fr.md).

---

[← Toutes les recettes](RECETTES.fr.md)
