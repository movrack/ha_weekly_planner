Français

# Chauffe-eau en heures creuses

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** chauffer l’eau quand l’électricité coûte le moins cher : chaque nuit de 22 h à 6 h, et toute la
journée du samedi et du dimanche (contrat à deux tarifs, jour et nuit). Les heures de votre contrat sont à
adapter.

| Quand ? | Chauffe-eau |
|---|---|
| Tous les jours, de 22 h à 6 h (jusqu’au lendemain) | En marche |
| Samedi et dimanche, de 6 h à 22 h | En marche |
| Le reste du temps (du lundi au vendredi, de 6 h à 22 h) | Arrêté |

## Ce qu’il faut

- Le contacteur ou la prise qui commande le chauffe-eau, une entité `switch` (`switch.chauffe_eau` dans l’exemple),
  avec ses actions pour allumer et éteindre cochées sous **Actions proposées**
  ([Premier programme](PREMIER_PROGRAMME.fr.md)).
- Deux réglages : **Marche** (l’action qui allume) et **Arrêt** (l’action qui éteint).

## Étapes

1. Dans le panneau **Weekly Planner**, **Nouveau programme** : « Chauffe-eau », avec le contacteur. Créer le
   programme.
2. Sur la carte, **Modifier** à droite du chauffe-eau, ouvrir **Réglages**, puis **Nouveau réglage** : **Marche**,
   puis **Arrêt**.
3. Ouvrir **Horaires**, **Ajouter un horaire** : **Tous les jours**, **Début** 22:00, **Durée** **Jusqu’à une
   heure**, **Fin** 06:00, **Réglage** **Marche**, **Enregistrer**. Une fin plus tôt que le début veut dire « jusqu’au
   lendemain ».
4. **Ajouter un horaire** : sous **Jours**, toucher **Week-end** ; de 06:00 à 22:00, **Marche**, **Enregistrer**.
5. Toucher la ligne **Le reste du temps**, choisir **Arrêt**, puis **Enregistrer**.

## Résultat

Du dimanche soir au lundi matin, et chaque nuit en semaine, le chauffe-eau marche de 22 h à 6 h, puis s’arrête à 6 h.
Le vendredi soir, il marche de 22 h jusqu’au dimanche 22 h sans interruption, puis la nuit suivante jusqu’au lundi
6 h : tout le week-end est couvert. Du lundi au vendredi, de 6 h à 22 h, il reçoit **Arrêt**.

## À savoir

- Un horaire du week-end qui commence à 6 h prend la suite exacte de la nuit précédente : pas de coupure à 6 h le
  samedi et le dimanche.
- Il n’y a pas besoin d’un second programme prioritaire pour le week-end : les deux horaires se suivent sans se
  chevaucher.
- Si vous allumez le chauffe-eau à la main un jour de semaine (invités, bain), il reste allumé : Weekly Planner n’envoie
  rien tant que le prochain changement n’arrive pas, c’est-à-dire l’arrêt de 6 h le lendemain. Après un redémarrage de
  Home Assistant, le réglage en cours est renvoyé et le chauffe-eau est éteint
  ([Renvoyer, vérifier, réessayer](REGLAGES.fr.md#renvoyer-vérifier-réessayer)).
- Si vos heures creuses sont d’autres heures (par exemple 23 h – 7 h, ou deux plages de 2 h dans la journée), seules
  les heures des horaires changent.

---

[← Toutes les recettes](RECETTES.fr.md)
