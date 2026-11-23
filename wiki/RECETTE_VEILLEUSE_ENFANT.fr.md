Français

# Chambre d’enfant : une veilleuse la nuit

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** la lampe de la chambre d’enfant s’allume à 10 % chaque soir à 20 h, et s’éteint le matin : à
7 h les jours d’école, à 8 h le week-end.

## Ce qu’il faut

- La lampe de la chambre (`light.chambre_enfant` dans l’exemple), avec ses actions pour allumer et éteindre cochées
  sous **Actions proposées** ([Premier programme](PREMIER_PROGRAMME.fr.md)). Une lampe qui règle sa luminosité
  convient.
- Deux réglages : **Veilleuse** (l’action qui allume, avec la luminosité à 10 %) et **Éteinte** (l’action qui
  éteint).

## Étapes

1. Dans le panneau **Weekly Planner**, **Nouveau programme** : « Veilleuse de la chambre », avec la lampe. Créer le
   programme.
2. Sur la carte, **Modifier** à droite de la lampe, ouvrir **Réglages**, puis **Nouveau réglage** : **Veilleuse**
   (l’action qui allume, luminosité **10**), puis **Éteinte**.
3. Ouvrir **Horaires**, **Ajouter un horaire** : sous **Jours**, toucher dimanche, lundi, mardi, mercredi et jeudi.
   **Début** 20:00, **Jusqu’à une heure**, **Fin** 07:00, **Réglage** **Veilleuse**, **Enregistrer**.
4. **Ajouter un horaire** : jours vendredi et samedi, de 20:00 à 08:00, **Veilleuse**, **Enregistrer**.
5. Toucher la ligne **Le reste du temps**, choisir **Éteinte**, puis **Enregistrer**.

## Résultat

Chaque soir à 20 h, la lampe passe à 10 %. Le matin, elle reçoit **Éteinte** : à 7 h après les nuits de dimanche à
jeudi (lundi à vendredi matin), à 8 h après les nuits de vendredi et de samedi.

## À savoir

- Un horaire qui finit « plus tôt » que son début va jusqu’au lendemain, et appartient au jour où il commence : c’est
  pourquoi la nuit du dimanche au lundi est dans la première liste de jours.
- La luminosité n’est envoyée qu’à 20 h. Si on allume la lampe plus fort pour une histoire, elle garde ce niveau
  jusqu’au matin.
- Si l’enfant éteint la lampe lui-même, elle reste éteinte jusqu’au prochain horaire.
- Une lampe qui accepte une température de couleur chaude peut la recevoir dans le même réglage : elle apparaît dans
  l’éditeur d’action si la lampe la propose ([Les réglages et leurs actions](REGLAGES.fr.md#ce-que-peut-faire-un-réglage)).

---

[← Toutes les recettes](RECETTES.fr.md)
