Français

# Régler le matin et le soir

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** chauffer le salon à 20 °C le matin et le soir, et à 16 °C le reste du temps.

| Quand ? | Ce que je veux |
|---|---|
| Tous les jours, de 6 h 30 à 8 h 30 | Confort : 20 °C |
| Tous les jours, de 17 h à 22 h | Confort : 20 °C |
| Le reste du temps | Éco : 16 °C |

## Ce qu’il faut

- Un programme avec un thermostat dont l’action qui règle la température est cochée sous **Actions proposées**
  ([Premier programme](PREMIER_PROGRAMME.fr.md)).
- Vous pouvez prendre un autre appareil : volet, lumière, prise… Seules les valeurs changent.

## Étapes

### 1. Créer les réglages Confort et Éco

1. Sur la carte, sous le thermostat, toucher **Modifier** (ou **Ajouter un horaire** si rien n’est encore réglé).
   La fenêtre des horaires s’ouvre. Elle a trois parties qui s’ouvrent une à la fois : **Réglages**, **Horaires**
   et, si vous avez choisi un sélecteur de mode, **Mode**.
2. Ouvrir **Réglages**, puis toucher **Nouveau réglage** (déjà ouvert si le programme n’a aucun réglage).
3. Sous **Nom**, saisir **Confort**. Choisir une **Couleur du réglage**.
4. Sous **Que doit faire ce réglage ?**, choisir l’action qui règle la température, puis saisir **20**.
5. Toucher **Enregistrer**.
6. Toucher **Nouveau réglage** de nouveau : nom **Éco**, température **16**, **Enregistrer**.

<!-- CAPTURE: guide-reglages | La partie Réglages de la fenêtre des horaires : les réglages Confort et Éco et le bouton Nouveau réglage | démo : programme « Chauffage du salon », réglages Confort et Éco créés -->

### 2. Régler le matin

1. Ouvrir **Horaires**, puis toucher **Ajouter un horaire**.
2. Sous **Jours**, toucher **Tous les jours**.
3. Sous **Début**, saisir **06:30**. Les boutons **−** et **+** déplacent l’heure de 15 minutes.
4. Sous **Durée**, choisir **Jusqu’à une heure**, puis saisir **08:30** sous **Fin**.
5. Sous **Réglage**, choisir **Confort**.
6. Toucher **Enregistrer**.

### 3. Régler le soir

Refaire les mêmes gestes avec **17:00**, **22:00** et **Confort**, puis **Enregistrer**.

### 4. Choisir Éco pour le reste du temps

1. Dans **Horaires**, toucher la ligne **Le reste du temps** (elle est au-dessus de la liste des horaires).
2. Choisir **Éco**, puis **Enregistrer**.

<!-- CAPTURE: guide-horaires-liste | La partie Horaires : la ligne « Le reste du temps : Éco », deux horaires Confort et le bouton Ajouter un horaire | démo : programme « Chauffage du salon » -->

## Résultat

À 6 h 30 et à 17 h, le thermostat reçoit Confort (20 °C). À 8 h 30 et à 22 h, il reçoit Éco (16 °C). La carte
montre les barres colorées et, sous **Ensuite :**, le prochain changement.

## À savoir

- **Tous les jours** touché une seconde fois enlève tous les jours : il faut alors en choisir à nouveau. **En
  semaine** et **Week-end** choisissent d’un coup les jours correspondants. On peut aussi toucher les jours un à
  un.
- **À cette heure seulement** (sous **Durée**) envoie le réglage une seule fois, à l’heure du début. Rien n’est
  envoyé à la fin, puisqu’il n’y a pas d’heure de fin.
- **Laisser tel quel**, choisi pour **Le reste du temps**, veut dire qu’aucune action n’est envoyée à la fin d’un
  horaire. Cela ne veut dire ni éteindre l’appareil, ni retrouver le réglage précédent.
- Deux horaires du même appareil ne peuvent pas se chevaucher le même jour : l’écran dit lesquels et propose de
  changer une heure ou un jour.
- Un réglage peut servir à plusieurs programmes. Si c’est le cas, la mention **Attention : modifier ce réglage
  modifie aussi…** nomme les autres programmes : changer Confort de 20 à 21 °C change aussi leurs horaires.
- Si aucune action de température n’apparaît sous **Que doit faire ce réglage ?**, cocher d’abord ses commandes :
  panneau **Weekly Planner**, ouvrir le programme dans la **Liste des programmes**, onglet **Appareils**,
  **Actions proposées**.
- Pour modifier un horaire, le copier sur d’autres jours ou le supprimer :
  [Modifier ou copier un horaire](GUIDE_MODIFIER_COPIER.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
