# Réduire le chauffage pendant les heures de pointe

**À quoi ça sert :** baisser tous les radiateurs quand l'électricité coûte le plus cher (jours rouges Tempo, pointe du tarif capacitaire, effacement), puis laisser chaque pièce reprendre son programme.

## Ce qu'il faut

- [la règle des priorités](PRIORITES.fr.md) lue une fois.
- Une entité `on` pendant la pointe : un `binary_sensor` de votre fournisseur, ou un interrupteur `Pointe`
  (`input_boolean.pointe`) allumé par une automatisation.
- Les programmes habituels de chaque pièce.

## Étapes

1. Programme **Heures de pointe**, sur tous les radiateurs : 17 °C de 17 h à 20 h, tous les jours.
   Placez-le **en premier** dans **Ordre des priorités**.
2. Dans **Général**, ajoutez la condition : l'entité de pointe est `on`.
3. Laissez les programmes de chaque pièce tels quels.

## Résultat

Un jour normal, rien ne change. Un jour de pointe, tous les radiateurs passent à 17 °C à 17 h. À 20 h, chacun reprend la consigne de son propre programme à cette heure-là (20 °C au salon, 18 °C dans les chambres…), sans action par défaut entre les deux.

## À savoir

- Si la condition devient fausse au milieu de la pointe, le programme rend la main après le délai
  d'attente des réglages de l'intégration.

---

[← Toutes les recettes](RECETTES.fr.md)
