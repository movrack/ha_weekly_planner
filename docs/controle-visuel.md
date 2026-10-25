# Contrôle visuel de la carte

Liste à dérouler avant chaque version. À faire sur une instance de développement (`scripts/dev_ha.sh`, puis
`scripts/dev_onboard.py`) avec au moins un programme de chaque type (thermostat, volet, lumière, prise), un
programme à heures solaires, deux programmes en conflit et un programme avec plusieurs profils.

Combinaisons à contrôler : **420 px** et **≥ 1400 px**, thème **clair** et **sombre**. Cocher ✔ pour chacune
des quatre quand la ligne est marquée « ×4 ».

## 1. Mise en place

- [ ] Console du navigateur ouverte et vidée ; compteur d'erreurs noté au départ.
- [ ] Carte rechargée sans cache (`Ctrl/Cmd+Maj+R`) après `npm run build`.
- [ ] Pas de défilement horizontal de la page à 420 px.

## 2. Consultation (×4)

- [ ] En-tête : titre, pastille Vacances si active, alertes.
- [ ] Une ligne par programme : nom, interrupteur, profil actif, mode actuel, « jusqu'à HH:MM → mode suivant ».
- [ ] Barre du jour : trait « maintenant », couleurs des modes, légende lisible.
- [ ] Semaine repliable (`show_week`) : 7 barres fines alignées.
- [ ] Plage à heure solaire affichée à l'heure calculée avec le symbole soleil ; plage ignorée barrée avec la raison.
- [ ] Dérogation : badge visible, « Reprendre » utilisable, échéance affichée.
- [ ] Conflit entre programmes et avertissements signalés, sans bloquer.
- [ ] Textes en français et en anglais (changer la langue du profil).
- [ ] Contrastes suffisants, aucun texte coupé ni chevauchement.

## 3. Modales (×4 pour chacune)

- [ ] **Jour (lecture)** : toucher une barre ouvre graphique + liste, bouton « Modifier ».
- [ ] **Programme** : nom, icône, entités, priorité, conditions, défauts par type/entité, « réappliquer »,
      type principal, dupliquer, supprimer (avec confirmation), avertissements.
- [ ] **Jour (édition)** : barre 24 h, liste des plages, « Copier vers… ».
- [ ] **Plage** : début/fin (heure ou soleil + décalage + bornes), plage ponctuelle, mode par type ou consignes
      par entité, conditions.
- [ ] **Modes** : un onglet par type, nom, couleur, icône, valeur, exceptions, « utilisé par… ».
- [ ] **Déroger…** : entité, consigne ou mode, durée (fin de plage, pendant X, jusqu'à HH:MM).
- [ ] **Éditeur visuel de la carte** (`program`, `filter`, `title`, `show_week`, `show_chart`).
- [ ] À 420 px : modales en plein écran, boutons Annuler/Enregistrer toujours atteignables.
- [ ] Fermeture par Échap, croix et clic extérieur ; le focus revient sur le bouton d'origine.
- [ ] Validation en direct : message clair pour un chevauchement, une plage < 5 min, `00:00 → 00:00`.
- [ ] Conflit de révision (modification dans un autre onglet) : message « modifié ailleurs, recharger ».

## 4. Glisser les bords d'une plage

- [ ] **Doigt** (téléphone ou émulation tactile 420 px) : poignées ≥ 44 px, loupe/zoom pendant le glisser,
      la page ne défile pas pendant le geste.
- [ ] **Souris** (≥ 1400 px) : glisser début et fin, curseur adapté.
- [ ] Aimantation au pas de 5 min ; aucune valeur hors pas.
- [ ] Impossible de rendre une plage < 5 min ni de chevaucher la voisine (ou réaction claire).
- [ ] Boutons **±5 min** sur chaque bord : fonctionnent et mettent la barre à jour.
- [ ] Clavier : Tab atteint chaque poignée, les flèches déplacent de 5 min, le focus est visible.
- [ ] Plage passant minuit (22:00 → 06:00) et fin `24:00` correctement dessinées.

## 5. Copie, modes, dérogation

- [ ] Copie d'un jour vers un autre, vers « Lun→Ven », « Sam+Dim » ; résultat vérifié dans la semaine.
- [ ] Copie d'un jour vers un autre profil.
- [ ] Modification d'un mode (couleur, valeur) : toutes les barres concernées changent ; suppression d'un mode
      utilisé refusée avec explication.
- [ ] Dérogation depuis « Déroger… » : badge, échéance, « Reprendre » l'annule.
- [ ] Changement de profil depuis l'en-tête du programme : barres mises à jour.

## 6. Graphique 24 h (×4)

- [ ] Consigne prévue, consigne appliquée et mesure distinctes (couleur et forme, pas la couleur seule).
- [ ] Zones dérogation / fenêtre ouverte / chauffe visibles quand les données existent.
- [ ] Toucher ou survoler affiche les valeurs ; ◀ ▶ parcourt les jours précédents (jusqu'à 14).
- [ ] Volets et lumières : position ou luminosité prévue vs réelle.
- [ ] Jour de 23 h ou 25 h (changement d'heure) dessiné à l'échelle réelle.
- [ ] Axes et légendes lisibles dans les deux thèmes.

## 7. Clavier et accessibilité

- [ ] Parcours complet au clavier (Tab, Maj+Tab, Entrée, Espace, Échap, flèches).
- [ ] Éléments interactifs nommés (étiquettes lues par un lecteur d'écran ou vérifiées dans l'arbre
      d'accessibilité).
- [ ] Focus toujours visible et jamais piégé hors d'une modale.

## 8. Performance et erreurs

- [ ] **Zéro erreur** dans la console sur tout le parcours (compteur final = compteur de départ).
- [ ] **Premier rendu < 300 ms pour 20 programmes** : créer 20 programmes (script), mesurer (Performance du
      navigateur ou script Playwright), noter la valeur : ______ ms.
- [ ] Pas de scintillement ni de rendu répété inutile quand une entité change d'état.

## 9. Compte rendu

Date : ______  Version : ______  Navigateur : ______
Anomalies (capture, étapes, combinaison taille/thème) : ________________________________
