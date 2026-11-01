# Entités complémentaires dans le graphique du jour

## Objectif et décisions approuvées

Ajouter un panneau « Options du graphique », replié par défaut, sur la carte et dans la fenêtre des horaires.
Les choix sont partagés dans Home Assistant par appareil et programme, indépendamment du mode et de la date.
Les entités numériques donnent des courbes ; les autres donnent des bandes d’états. Au plus trois échelles numériques :
principale à gauche et deux à droite ; les courbes de même unité partagent une échelle. Les états affichés sont sélectionnables.

Hypothèses : seule la valeur `entity.state` des sources est tracée (pas d’attribut numérique) ; la limite porte sur les
échelles, pas sur le nombre de courbes ; les bandes ne prennent aucune échelle. Consultation uniquement : aucune action sur
un appareil. Conserver les travaux non commités 0.24/0.25. Implémentation par l’agent existant, coordination et relecture séparées ;
worktrees si plusieurs agents modifient en parallèle. Aucun commit, push ou déploiement dans cette livraison.

## 1. Stockage

- [x] Créer une issue de changement dédiée.
- [x] Ajouter `chart_sources` facultatif à chaque appareil du programme : entité, nature numérique/états et états sélectionnés.
- [x] Étendre les types, schémas serveur et échanges ; absence = aucune source, sans migration.
- [x] Sauvegarder automatiquement sur les données fraîches, réessayer une fois sur conflit et synchroniser les clients.
- [x] Garantir qu’une modification des sources ne commande aucun appareil et respecte la lecture seule.

## 2. Panneau

- [x] Sélecteur HA recherchable, générique, sans liste de domaines ; interdire les doublons.
- [x] Lignes des sources avec nom, couleur, unité/états et suppression.
- [x] Déterminer la nature depuis les métadonnées et l’état ; proposer les états connus par métadonnées, état courant et historique.
- [x] Choix multiple d’états, traductions HA avec repli brut, conservation des états et entités disparus.
- [x] Afficher les états de sauvegarde/erreur ; replier laisse les tracés visibles.

## 3. Historique

- [x] Charger les dates visibles ; partager le déplacement et le zoom du graphique principal.
- [x] Cache partagé borné, protection contre les réponses obsolètes et actualisation du jour courant.
- [x] Valeurs inconnues = interruptions, jamais zéro ; aucune donnée réelle dans le futur ; jours de 23/25 h respectés.
- [x] Une source en échec ne masque pas le graphique principal.

## 4. Axes

- [x] Échelle principale à gauche ; nouvelles unités à droite dans l’ordre d’ajout ; même unité = même échelle.
- [x] Bornes indépendantes, couleurs stables ; couleur de l’axe = première courbe associée ; unités lisibles.
- [x] Refuser clairement la quatrième unité ; marges adaptées au téléphone.
- [x] Distinguer les courbes de source du prévu et des changements manuels.

## 5. Bandes

- [x] Une ligne nommée par entité, périodes des états sélectionnés en couleur.
- [x] Plusieurs états = couleurs et légende distinctes ; états non sélectionnés neutres, données manquantes distinctes.
- [x] Reprendre l’état initial et aligner les bandes sur le déplacement/zoom.
- [x] Distinguer les bandes complémentaires de la bande d’activité de l’appareil principal.

## 6. Tests

- [x] Température + humidité ; troisième unité ; même unité ; refus de la quatrième.
- [x] États de fenêtre sélectionnés, choix multiple, état initial.
- [x] Historique manquant, indisponibilité, entité supprimée et valeur non numérique.
- [x] Déplacement/zoom, minuit, changements d’heure, réponses obsolètes et cache.
- [x] Persistance, conflit, lecture seule, absence de commandes et performances avec plusieurs sources.
- [ ] Navigateur Home Assistant réel : viewport 360 × 780 px et bureau, thèmes clair/sombre.
- [ ] Téléphone physique : gestes tactiles, pincement, défilement vertical et horizontal.
- [x] Suite Python, TypeScript, Vitest et bundle complets.

## 7. Documentation et livraison

- [x] Cocher SPEC, consigner DECISIONS, CHANGELOG, versions et bundle.
- [x] Mettre à jour le guide et les README anglais/français.
- [x] Préparer la synchronisation du wiki dans la même session ; publication en attente de l’autorisation de commit/push.
- [x] Fournir les preuves de vérification et les limites restantes.

## Preuves et points restants

- Issue : [#37](https://github.com/movrack/ha_weekly_planner/issues/37).
- Validation finale : 654 tests frontend, TypeScript et build ; 361 tests Python (dont sauvegarde et diffusion sans recalcul/commande).
- Navigateur avec données simulées : 10 contrôles DOM, cadres 360 × 780 et 1400 px, clair/sombre ; repli et sélection des états vérifiés. L’intégration HA complète et le tactile physique restent à vérifier : la préparation de la vue locale a été annulée au stade de l’autorisation.
- Wiki : copie préparée dans `/tmp/wp-wiki-chart-sources/Guide-utilisateur.md`, liens vérifiés contre la copie locale du wiki ; publication non effectuée.
- Aucun commit, push ou déploiement ; modifications 0.24/0.25 conservées.
