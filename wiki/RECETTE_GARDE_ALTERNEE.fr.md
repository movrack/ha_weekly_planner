# Garde alternée des enfants

**À quoi ça sert :** chauffer les chambres des enfants seulement les semaines où ils sont là, sans toucher au programme de base.

## Ce qu'il faut

- [la règle des priorités](PRIORITES.fr.md) lue une fois.
- Un interrupteur `Enfants présents` (**Paramètres → Appareils et services → Entrées → Créer une entrée →
  Interrupteur**, entité `input_boolean.enfants_presents`), ou un calendrier de garde.

## Étapes

1. Programme **Base maison**, sur les radiateurs des chambres des enfants : 16 °C de
   7 h à 22 h, tous les jours.
2. Programme **Semaine enfants**, sur les **mêmes** radiateurs : 20 °C de 6 h 30 à 8 h et
   de 16 h à 21 h. Placez-le **avant** « Base maison » dans **Ordre des priorités**.
3. Dans **Général** de « Semaine enfants », ajoutez la condition : `input_boolean.enfants_presents` est `on`.

## Résultat

Sans les enfants, seul « Base maison » commande (16 °C). Avec eux, les chambres passent à 20 °C à 6 h 30, reviennent à 16 °C à 8 h parce que « Base maison » est encore dans son horaire, puis à 20 °C de 16 h à 21 h et 16 °C jusqu'à 22 h.

## À savoir

- Si vous n'utilisez pas encore les modes, deux modes « Avec enfants » et « Sans enfants » font aussi
  l'affaire avec un seul programme. Les priorités sont préférables quand le mode sert déjà à autre chose
  (présent, absent, vacances) : elles évitent de multiplier les modes.

---

[← Toutes les recettes](RECETTES.fr.md)
