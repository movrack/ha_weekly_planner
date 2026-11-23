Français

# Plusieurs appareils dans un programme

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** fermer ensemble les volets du rez-de-chaussée le soir, tout en ouvrant celui de la cuisine
plus tôt le matin. Un programme peut réunir plusieurs appareils ; chacun a ses propres horaires, et certains
horaires peuvent être communs.

## Ce qu’il faut

- Deux appareils de même sorte, par exemple **Volet salon** et **Volet cuisine**.
- Un réglage qu’ils savent tous les deux faire, par exemple **Fermé** (position 0 %) : voir
  [Régler le matin et le soir](GUIDE_MATIN_ET_SOIR.fr.md) pour créer un réglage.

## Étapes

### 1. Réunir les appareils dans un programme

1. Ouvrir **Weekly Planner** dans la barre latérale.
2. Pour un nouveau programme : **Nouveau programme**, saisir le **Nom** (par exemple « Volets du rez-de-chaussée »),
   toucher **Ajouter un appareil** puis **Choisir un appareil**. Pour un programme qui existe, l’ouvrir dans la
   **Liste des programmes**, onglet **Appareils**.
3. Toucher **Ajouter un autre appareil (facultatif)** et choisir le second appareil.
4. Cocher, pour chaque appareil, ses **Actions proposées**.
5. Toucher **Créer le programme** (ou **Enregistrer** pour un programme qui existe).

Un appareil ajouté plus tard suit tout de suite les horaires communs à tous les appareils : l’écran le dit
(« Suit les N horaires communs à tous les appareils. »).

### 2. Passer d’un appareil à l’autre

- Sur la carte, une rangée d’onglets montre un appareil à la fois. Toucher un onglet change d’appareil ; celui
  qui est choisi porte une coche. Au clavier : flèches gauche et droite, **Début** et **Fin**. L’onglet choisi est
  retenu pour chaque programme tant que la carte reste ouverte.
- Dans la fenêtre des horaires, la ligne **Appareil** propose une pastille par appareil. Elles sont grisées
  tant qu’un horaire est en cours de modification.

<!-- CAPTURE: guide-appareils-onglets | La carte d’un programme à deux appareils avec la rangée d’onglets (un appareil coché) | démo : programme « Volets du rez-de-chaussée », deux volets -->

### 3. Donner le même horaire aux deux appareils

1. Ouvrir la fenêtre des horaires de l’appareil (bouton **Modifier**), puis **Horaires** → **Ajouter un horaire**.
2. Remplir **Jours**, **Début** (par exemple 21:00), **Durée** (**À cette heure seulement**) et **Réglage**
   (**Fermé**).
3. Sous **Aussi pour :**, toucher l’autre appareil pour qu’il suive le même horaire. Seuls les appareils que le
   réglage choisi sait commander sont proposés (pas de volet pour « 15 °C ») ; s’il n’y en a aucun, la ligne
   n’apparaît pas. Choisir d’abord le **Réglage**, puis cocher.
4. Toucher **Enregistrer**.

Si tous les appareils sont cochés, l’horaire vaut pour tout le programme, y compris pour un appareil ajouté plus
tard.

### 4. Garder un horaire pour un seul appareil

Pour que le volet de la cuisine s’ouvre à 7 h alors que celui du salon reste fermé : choisir l’appareil (onglet
ou pastille), puis **Ajouter un horaire** sans cocher d’autre appareil sous **Aussi pour :**.

### 5. Modifier ou supprimer un horaire commun

Un horaire qui sert à plusieurs appareils porte **Aussi :** suivi de leurs noms. Pour le modifier ou le
supprimer, l’écran demande **Modifier pour :**

- **Seulement** et le nom de l’appareil : seul cet appareil change ; les autres gardent l’horaire tel quel ;
- **Tous les appareils (N)** : le changement vaut pour tous.

Il faut choisir avant d’enregistrer : sinon l’écran dit « Choisissez pour quels appareils vaut ce changement. »
La même question se pose sur la barre après un glissement ou un choix de réglage ; **Aucun changement** abandonne
la modification.

### 6. Retirer un appareil du programme

1. Dans le panneau **Weekly Planner**, ouvrir le programme, onglet **Appareils**.
2. Toucher la corbeille à droite de l’appareil, puis confirmer.
3. Toucher **Enregistrer**.

Les horaires propres à cet appareil sont supprimés aussi ; un message dit combien. Si vous décochez une action
d’un appareil, l’écran signale les horaires qui l’utilisent encore et propose **Les retirer de cet appareil**.

## À savoir

- En bas de la fenêtre des horaires, le bouton **Supprimer ce programme** agit selon le programme. Dans un
  programme à **plusieurs appareils**, il supprime les horaires de l’appareil affiché, dans tous les modes (les
  autres appareils gardent les leurs), après la question « Supprimer les horaires de « X » ? ». Dans un programme
  à **un seul appareil**, il supprime le programme entier avec tous ses horaires. Il est grisé pendant la
  modification d’un horaire.
- Le panneau **Weekly Planner** supprime aussi un programme entier : bouton **Supprimer ce programme** de la
  **Fiche du programme**.
- Deux programmes qui visent le même appareil sont en concurrence : voir les [Priorités](PRIORITES.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
