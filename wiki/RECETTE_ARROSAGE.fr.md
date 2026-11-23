Français

# Arrosage du jardin

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** ouvrir l’électrovanne du jardin 20 minutes à 6 h, le lundi, le mercredi et le samedi, sauf s’il
a plu.

## Ce qu’il faut

- L’électrovanne ou la prise qui la commande, une entité `switch` (`switch.electrovanne_jardin` dans l’exemple), avec
  ses actions pour allumer et éteindre cochées sous **Actions proposées**
  ([Premier programme](PREMIER_PROGRAMME.fr.md)).
- Un capteur de pluie cumulée sur 24 heures, en millimètres : un pluviomètre connecté ou un capteur de station
  météo (`sensor.pluviometre_24h` dans l’exemple, **à adapter**).
- Une vanne qui se referme seule après un certain temps, si possible : Weekly Planner envoie l’arrêt à 6 h 20, mais
  si Home Assistant est arrêté à ce moment-là, la vanne resterait ouverte.

## Étapes

1. Dans le panneau **Weekly Planner**, **Nouveau programme** : « Arrosage du jardin », avec la vanne. Créer le
   programme.
2. Sur la carte, **Modifier** à droite de la vanne, ouvrir **Réglages**, puis **Nouveau réglage** : **Arrosage**
   (l’action qui allume), puis **Arrêt** (l’action qui éteint).
3. Ouvrir **Horaires**, toucher **Ajouter un horaire**. Sous **Jours**, toucher lundi, mercredi et samedi. **Début**
   06:00, **Durée** **Jusqu’à une heure**, **Fin** 06:20, **Réglage** **Arrosage**, **Enregistrer**.
4. Toucher la ligne **Le reste du temps**, choisir **Arrêt**, puis **Enregistrer**.
5. Dans la **Liste des programmes** du panneau, ouvrir « Arrosage du jardin », onglet **Général**. Sous **Conditions
   du programme**, toucher **Ajouter une condition** : l’entité `sensor.pluviometre_24h`, la comparaison **est
   inférieur à**, la valeur `2`. Toucher **Enregistrer**.

<!-- CAPTURE: recette-arrosage-condition | La Fiche du programme, onglet Général, avec la condition « sensor.pluviometre_24h est inférieur à 2 » sous Conditions du programme | 360 ; démo : programme « Arrosage du jardin », une électrovanne, un capteur de pluie -->

## Résultat

Le lundi, le mercredi et le samedi, la vanne s’ouvre à 6 h et se ferme à 6 h 20, si moins de 2 mm de pluie sont
tombés ces dernières 24 heures. Sinon, la vanne reste fermée. Les autres jours, rien ne se passe.

## À savoir

- Si la pluie commence pendant l’arrosage, la condition devient fausse, et la vanne reçoit **Arrêt** après le
  délai **Attendre avant d’appliquer un changement de condition** des
  [réglages de l’intégration](CONFIGURATION.fr.md#réglages-de-lintégration) (2 minutes au départ).
- Si le capteur de pluie est indisponible, Weekly Planner garde la dernière valeur connue ([Lexique](LEXIQUE.fr.md#conditions)).
- Pour ne pas arroser un jour précis (des invités au jardin), mettre le programme en pause pour 1 jour :
  [Pause, saut et suspension](GUIDE_PAUSE_SAUT.fr.md#mettre-un-programme-en-pause). Une vanne ouverte à ce moment-là
  reçoit **Arrêt**.
- Pour arroser plus longtemps en été, changer l’heure de **Fin** de l’horaire, ou ajouter un second horaire
  ([Modifier ou copier un horaire](GUIDE_MODIFIER_COPIER.fr.md)).

---

[← Toutes les recettes](RECETTES.fr.md)
