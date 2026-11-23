Français

# Garde alternée des enfants

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** chauffer la chambre des enfants à 20 °C seulement les semaines où ils sont là, sans toucher au
programme de base. Les autres semaines, la chambre reste à 16 °C le jour et 14 °C la nuit.

## Ce qu’il faut

- [La règle des priorités](PRIORITES.fr.md), lue une fois.
- Un interrupteur « Enfants présents » : **Paramètres → Appareils et services → Entrées → Créer une entrée →
  Interrupteur**, entité `input_boolean.enfants_presents`. On l’allume le jour de l’arrivée des enfants et on
  l’éteint le jour de leur départ (un tableau de bord ou une automatisation sur un calendrier de garde peuvent le
  faire).
- Le radiateur (ou thermostat) de la chambre : `climate.chambre_enfants` dans l’exemple.

## Étapes

1. Créer trois réglages de température (**Réglages → Nouveau réglage**) : **Confort enfants** (20 °C),
   **Éco** (16 °C) et **Nuit** (14 °C).
2. Créer le programme **Base maison** sur `climate.chambre_enfants` : un horaire **Éco** de 07:00 à 22:00, **Tous les
   jours**. Pour **Le reste du temps**, choisir **Nuit**.
3. Créer le programme **Semaine enfants** sur le **même** radiateur : deux horaires **Confort enfants**, **Tous les
   jours**, de 06:30 à 08:00 et de 16:00 à 22:00. Pour **Le reste du temps**, choisir **Nuit**, comme dans « Base
   maison ».
4. Placer **Semaine enfants** **avant** « Base maison » dans l’**Ordre des priorités**
   ([Les priorités](PRIORITES.fr.md#changer-lordre)).
5. Dans l’onglet **Général** de « Semaine enfants », sous **Conditions du programme**, toucher **Ajouter une
   condition**. Choisir l’entité `input_boolean.enfants_presents`, la comparaison **est** et la valeur attendue
   `on`.

## Résultat

Sans les enfants, seul « Base maison » commande : 16 °C de 7 h à 22 h, 14 °C la nuit. Avec eux, la chambre passe à
20 °C à 6 h 30, revient à 16 °C à 8 h (« Base maison » est alors seul en cours), remonte à 20 °C de 16 h à 22 h, puis
passe à 14 °C pour la nuit.

## À savoir

- Donnez **le même Le reste du temps** aux deux programmes. Le reste du temps qui s’applique est toujours celui du
  programme placé en premier, **même quand ses conditions sont fausses** : avec « Laisser tel quel » dans « Semaine
  enfants », la chambre resterait à sa dernière température la nuit des semaines sans enfants.
- Un changement de l’interrupteur est pris en compte après le délai **Attendre avant d’appliquer un changement de
  condition** des [réglages de l’intégration](CONFIGURATION.fr.md#réglages-de-lintégration) (2 minutes au départ).
- Si vous n’utilisez pas encore les modes, deux modes « Avec enfants » et « Sans enfants » font aussi l’affaire avec
  un seul programme. Les priorités sont préférables quand le mode sert déjà à autre chose (présent, absent,
  vacances) : elles évitent de multiplier les modes.

---

[← Toutes les recettes](RECETTES.fr.md)
