Français

# Suivre le soleil

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** ouvrir le volet du salon au lever du soleil, sans que ce soit avant 7 h, et le fermer à la
tombée du jour, sans que ce soit après 21 h 30 en été. L’heure change chaque jour avec le soleil ; vous n’avez
rien à refaire.

## Ce qu’il faut

- Un programme avec le volet du salon, dont l’action qui règle la position est cochée sous **Actions proposées**.
- Deux réglages : **Ouvert** (position 100 %) et **Fermé** (position 0 %). Pour créer un réglage :
  [Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md).
- Le lieu de la maison réglé dans Home Assistant : l’heure du lever et du coucher en vient.

## Étapes

### Fermer au coucher du soleil

1. Sur la carte, toucher **Modifier** à droite du volet, ouvrir **Horaires**, puis **Ajouter un horaire**.
2. Sous **Jours**, toucher **Tous les jours**.
3. Sous **Début**, ouvrir **Options avancées**, puis toucher **Coucher du soleil**. Les boutons **−** et **+**
   avancent ou retardent l’action de 15 minutes, de −240 à +240 minutes. Toucher **+** une fois : l’action part
   15 minutes après le coucher.
4. Cocher **Pas avant / pas après une heure fixe**, puis saisir **21:30** sous **Au plus tard à**. Le bouton
   **Retirer la limite** (une croix) enlève une limite ; décocher la case retire les deux.
5. Sous **Durée**, choisir **À cette heure seulement** : l’action est envoyée une seule fois, à l’heure du coucher.
6. Sous **Réglage**, choisir **Fermé**, puis toucher **Enregistrer**.

<!-- CAPTURE: guide-soleil-debut | Le formulaire d’horaire : Début sur Coucher du soleil, Options avancées ouvertes, la case de limite cochée avec Au plus tard à 21:30 | démo : programme « Volet du salon », réglages Ouvert et Fermé -->

### Ouvrir au lever du soleil

Refaire les mêmes gestes : **Début** sur **Lever du soleil**, **Au plus tôt à** **07:00**, **À cette heure
seulement**, **Réglage** **Ouvert**, puis **Enregistrer**.

## Résultat

Chaque jour, le volet s’ouvre au lever du soleil, mais pas avant 7 h, et se ferme 15 minutes après le coucher,
mais pas après 21 h 30. Sous le formulaire, une phrase donne l’heure du jour (« Heure réelle : … » et
« Aujourd’hui : … »), et la carte montre le prochain changement à l’heure exacte calculée.

## À savoir

- Toucher de nouveau **Lever du soleil** ou **Coucher du soleil** revient à une heure fixe.
- L’heure suit le soleil du lieu enregistré dans Home Assistant ; elle est la même pour tous les appareils le même
  jour. Sur une barre, l’icône du soleil donne cette heure au survol.
- Les options de **Début** et de **Fin** sont séparées : une limite posée sur le début ne vaut pas pour la fin.
- Une heure de soleil avec limites ne se déplace pas en glissant la barre : la modifier dans le formulaire.

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
