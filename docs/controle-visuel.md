# Contrôle visuel de la carte (0.18.x)

Liste à dérouler avant chaque version. À faire sur l'instance de développement (`scripts/dev_ha.sh`, port 8124,
puis `scripts/dev_onboard.py` ; le script d'intégration échoue en 404 quand l'instance est déjà configurée, c'est
normal). Après un `npm run build`, appeler le service `weekly_planner.reload`. **Après un changement Python,
redémarrer l'instance** (sinon l'ancien code valide encore les enregistrements).

Jeu de données minimal : un programme par type (thermostat, volet, lumière à heure solaire, prise, aspirateur),
un programme à plusieurs modes, et 20 programmes pour la mesure de temps (§ 9).

Combinaisons : **360 × 780 px** (téléphone courant) et **≥ 1400 px**, thèmes **clair** et **sombre**, français et
anglais. Les lignes marquées « ×4 » se cochent pour les quatre combinaisons taille × thème.
Cocher uniquement ce qui a été vu ; sinon laisser vide et le noter dans le compte rendu.
Résultats datés : `docs/CONTROLE_VISUEL_RESULTATS.md`.

## 1. Mise en place

- [x] Console vidée au départ ; compteur d'erreurs noté (attendu : 0).
- [x] Bundle à jour (`weekly-planner-card.js` contient « Restez appuyé ») et instance redémarrée.
- [x] Pas de défilement horizontal de la page à 360 px (carte, vues, modales).

## 2. Consultation de la carte (×4)

- [x] Barres (vue par défaut) : icône, nom du programme, état traduit, « → action suivante + heure ».
- [x] Barre « Auj. » : trait « maintenant » avec icône horloge, couleurs des réglages, icône soleil sur une
      frontière solaire, légende des heures 0 / 6 / 12 / 18 / 24 h.
- [x] Interrupteur du programme et bouton calendrier : cibles ≥ 44 px.
- [x] Semaine repliable : sept barres, jour courant en gras, trait « maintenant » sur le jour courant seulement.
- [x] Cadran 24 h (`radial`), double cadran 12 h (`radial_12h`), liste compacte (`list`) : lisibles, sans
      défilement horizontal.
- [ ] Liste compacte : chevron dépliant un programme à la fois (non déroulé).
- [x] Bouton « Réglages » dans l'en-tête ; ouvre la liste des réglages.
- [x] Français et anglais (jours, état, « Today / Week », heures « 5:20 pm »).
- [x] Contrastes corrects en clair et en sombre.
- [ ] Bandeau « Lecture seule », état vide, filtres sans résultat (non déroulé).

## 3. Écran d'horaires et formulaire d'horaire

- [x] Ouvrir par le bouton calendrier : sélecteur de mode, 7 barres, lignes d'horaires, « Ajouter un horaire »,
      « Le reste du temps », graphique du jour avec ◀ ▶, interrupteur « Horaires actifs », Supprimer isolé.
- [x] Ouvrir une ligne : un seul « Enregistrer / Annuler », « Dupliquer » et « Supprimer » sous le formulaire.
- [x] Début : pas ±15 min, pastilles Lever / Coucher, décalage affiché (« Coucher +30 min »).
- [x] « Pas avant » / « Pas après » : saisie libre ; si l'ordre est inversé, message
      « « Pas avant » doit précéder « Pas après » » et l'enregistrement est refusé.
- [x] Délai aléatoire (début et fin) : case + « Délai maximum (minutes) » ; l'horaire est enregistré avec
      `random_minutes` et réaffiché (« Dans les 20 prochaines minutes »).
- [x] **Dupliquer** un horaire avec délai aléatoire : le brouillon garde le délai ; une fois enregistré et rouvert, il
      est conservé.
- [x] Supprimer : confirmation plein écran « Oui / Non », puis la ligne disparaît.
- [x] Modifier la fin, enregistrer, rétablir ; la barre se met à jour.
- [ ] Dupliquer un horaire solaire de plus de 4 h : l'enregistrement échoue (voir résultats, bug n° 1).
- [ ] Ajouter un horaire avec « Ajouter un horaire » (non déroulé en entier).
- [ ] « Appliquer à d'autres jours », copie vers Lun→Ven, Sam+Dim (non déroulé).
- [ ] Chevauchement : message précis (aujourd'hui : message générique, voir résultats).
- [ ] Conflit de révision (modification dans un autre onglet).
- [ ] Jour de 23 h / 25 h (changement d'heure) ; horaire passant minuit ; fin `24:00`.

## 4. Barres : édition directe

- [x] **Souris (≥ 1400 px)** : un clic entre dans l'édition ; deux poignées 44 × 44 px ; Échap sort.
- [x] **Doigt (émulation tactile 360 px)** : appui long ~0,5 s entre dans l'édition (barre 64 px, poignées
      44 × 44 px) ; glisser 8 h → 8 h 45 par pas de 15 min avec bulle d'heure ; la page ne défile pas ;
      relâcher enregistre ; « Modifié · Annuler » remet 8 h.
- [x] **Clavier** sur une poignée : flèches ±15 min, enregistrement, « Annuler » du bandeau.
- [x] **Astuce « Restez appuyé pour modifier »** : un appui court au doigt sur une barre l'affiche ~2 s, puis ouvre
      l'écran d'horaires ; trois fois seulement par appareil (compteur `weekly_planner.hold_hint`), ensuite l'écran
      s'ouvre sans astuce.
- [ ] Entrer dans l'édition **au clavier** : la barre n'est pas atteignable par Tab (voir résultats, bug n° 6).
- [ ] Sélection d'un horaire ou d'un trou, ciseaux, « Copier vers… », fenêtre de conflit.

## 5. Éditeur visuel Lovelace (×4)

- [x] Ouvrir par le mode édition du tableau de bord : onglets « Affichage de la carte » / « Réglages des
      programmes ».
- [x] Affichage : titre, un programme ou liste filtrée, types dynamiques (noms traduits par HA), zone, programmes
      à afficher, vue des horaires, graphique ; aucun défilement horizontal, cibles ≥ 44 px.
- [x] Réglages : choisir un programme ; onglets Général, Appareils, Modes ; Annuler / Rétablir ; Dupliquer,
      Supprimer.
- [x] « Nouveau programme » : formulaire court (nom + appareils) ; valeurs par défaut du serveur : priorité 10,
      « Réappliquer » coché.
- [x] Dans le sélecteur, l'entrée devient « Continuer la création » dès qu'un brouillon existe (voir résultats,
      bug n° 8 : elle apparaît aussi juste après avoir choisi « Nouveau programme »).
- [ ] Reprise du brouillon après changement de programme, création réelle d'un programme.

## 6. Réglages

- [x] Liste : pastille, nom, résumé de l'action, nombre d'usages ; cibles ≥ 44 px (360 px clair, 1440 px sombre,
      360 px sombre anglais).
- [ ] Renommer, recolorer, changer l'action, suppression refusée si utilisée.

## 7. Graphique du jour

- [x] Graphique visible dans l'écran d'horaires (repères prévus, « maintenant »), lisible en clair.
- [ ] Courbes mesuré / réglé, activité, manuel en rouge, ◀ ▶ vers les jours précédents, jour de 23 h / 25 h.

## 8. Clavier et accessibilité

- [x] Tab dans la carte : réglages, interrupteur, horaires, icône « maintenant » / soleil (infobulle), Semaine,
      programme suivant.
- [x] Interrupteurs, boutons et poignées nommés (`aria-label`, `role="switch"`, `role="slider"`).
- [x] Échap ferme l'écran d'horaires quand le focus est dans la fenêtre, et le clic extérieur aussi.
- [ ] Échap après avoir ouvert une ligne d'horaire (le focus tombe sur `body`, voir résultats, bug n° 4).
- [ ] Le focus revient sur le bouton d'origine à la fermeture (aujourd'hui : sur `body`, bug n° 5).
- [ ] Cibles tactiles ≥ 44 px partout : jours du formulaire (40 px) et noms de jours de la semaine (36 px) en
      dessous (bugs n° 3 et 7).

## 9. Performance et erreurs

- [x] **Zéro erreur** dans la console sur tout le parcours (hors 404 de sourcemaps de Lit servis par HA).
- [x] **Premier rendu avec 20 programmes** et **rendu après mise à jour** : mesurés (voir
      `docs/CONTROLE_VISUEL_RESULTATS.md`).
- [ ] Pas de rendu répété inutile quand une entité change d'état (non profilé).

## 10. Compte rendu

Reporter dans `docs/CONTROLE_VISUEL_RESULTATS.md` : date, version, navigateur, mesures, anomalies (étapes, capture,
combinaison taille / thème).
