Français

# Réduire le chauffage pendant les heures de pointe

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** baisser tous les radiateurs à 17 °C de 17 h à 20 h quand l’électricité coûte le plus cher
(jour rouge Tempo, pointe du tarif capacitaire, effacement demandé par le fournisseur), puis laisser chaque pièce
reprendre son programme.

## Ce qu’il faut

- [La règle des priorités](PRIORITES.fr.md), lue une fois.
- Une entité allumée (`on`) les jours de pointe : un `binary_sensor` fourni par votre fournisseur ou son intégration,
  ou un interrupteur « Pointe » (`input_boolean.pointe`) qu’une automatisation allume la veille au soir. Le nom est
  **à adapter**.
- Les programmes habituels de chaque pièce, avec leur réglage **Le reste du temps** (par exemple **Éco**, 16 °C).

## Étapes

1. Créer le réglage **Pointe** (17 °C).
2. Créer le programme **Heures de pointe** avec **tous** les radiateurs. Un horaire **Pointe** de 17:00 à 20:00,
   **Tous les jours**.
3. Pour **chaque** radiateur du programme, choisir comme **Le reste du temps** le même réglage que dans le
   programme de sa pièce (par exemple **Éco**). Pour changer d’appareil, toucher sa pastille sous **Appareil**.
4. Placer **Heures de pointe** **en premier** dans l’**Ordre des priorités**
   ([Les priorités](PRIORITES.fr.md#changer-lordre)).
5. Dans l’onglet **Général** de « Heures de pointe », sous **Conditions du programme**, toucher **Ajouter une
   condition** : l’entité de pointe **est** `on`.
6. Laisser les programmes de chaque pièce tels quels.

## Résultat

Un jour normal, rien ne change : la condition est fausse. Un jour de pointe, tous les radiateurs passent à 17 °C à
17 h. À 20 h, chacun reprend le réglage de l’horaire de sa pièce s’il y en a un en cours (20 °C au salon, par
exemple), sinon son **Le reste du temps**.

## À savoir

- **Le reste du temps de « Heures de pointe » compte tous les jours**, pointe ou non : c’est celui du programme placé
  en premier qui s’applique quand aucun horaire n’est en cours, même quand ses conditions sont fausses. Avec
  « Laisser tel quel », les radiateurs ne recevraient plus leur **Le reste du temps** habituel et gardent leur
  dernier réglage. D’où l’étape 3.
- Un changement de l’entité de pointe est pris en compte après le délai **Attendre avant d’appliquer un changement de
  condition** des [réglages de l’intégration](CONFIGURATION.fr.md#réglages-de-lintégration) (2 minutes au départ).
  Si la condition devient fausse au milieu de la pointe, le programme rend la main après ce délai.

---

[← Toutes les recettes](RECETTES.fr.md)
