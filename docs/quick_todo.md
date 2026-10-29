# Todo
Idées ou instructions que je dois donner à l'IA mai que je n'ai pas pu suite à un quote token dépassé.
Chaque fois que tu termine une des actions ci dessous de mon plan, coche là. Noublie pas que tu peux spawn des sous agent pour realiser les différentes taches.
Tu peux paralleliser, mais uniquement 2 à la fois sinon tu risque de peter la session de token.
Si besoin tu peux utiliser la skill grill-me, mais avant de l'utiliser termine toutes les actions que tu sais deja faire, et tu me posera les questions ensuite. Fais les dans l'ordre.

- [x] deploie la version actuelle
- [x] dans la définition d'un programme, je veux le choix de des appareils avant celui de l'icone. L'icone est celle par defaut du premier appareil selectionné
- [x] il y une prioritéé. Est-il possible quand on selectionne un appareil d'afficher un message comme quoi cet appareil a deja un programme et donner son nom ?
- [x] explique en detaills comment fonctionne saison
- [x] continue et termine mes demande de la derniere session (voir ./captures/session.png)
-> [x] fait moi ca, je ne veux pas de liste hardcodée, sinon ce n'est pas générique. Enregistre ca aussi pour les agent IA
-> [x] quand tu sais, utilise des sous agent pour effectuer les tâches et ensuite donne moi le feedback. Comme ca je peux continuer a te donner des instructions pendant que les autres travail. Attribue le meilleur agent à chaque fois pour la tache concernée
-> [x] dans le selecteur 'novueau programme' doit être en premiere position (après chosir un programme, je veux une ligne au dessus et une en dessous

- [x] Quand on clique sur le titre de la modale, je sohaite que celle ci prenne plus de place, soit plus large à l'écran

- [x] dans ./captures/cercle.png, un exemple que j'ai trouvé. Je pense que dans le cas d'une vue "Un programme", on peux proposer cette vue radia du schema actuel. Arrange toi pour faire fonctionner.

- [x] tu connais l'agent mamy ? Si pas, claude connait. Regarde comment il fait. Si tu veux que je te l'explique pour que tu le crée: "Mamy c'est ma mamy, elle a 80 ans et ne comprend pas toujours comment fonctionne une appli. Il lui faut donc des choses simples et facile. Si mamy sait utilisé, ma fille de 10 ans sait utiliser et tout le monde sait utiliser. Cet agent en tant qu'avocat du diable cherche les problèmes, les incohérence, les difficultés, les doublons, les manque d'explication, de peu de clarté, etc et fait un rapport pour expliquer ce qu'il faut changer, pourquoi et parfois même comment pour améliorer l'interface." Spawn Mamy et demande de vérifier la configuration pour setter la card au niveau du dashboard.

- [x] La position du toggle se trouve à l'interieure du petit calendrier, en bas de la modale. Peut-être qu'il peut etre directement affiché sur le dashboard...

- [x] verstile thermostat possède des "mode" comme eco, boost, hors gel, confort, etc. Est-ce possible de les récuparer "automatiquement" et de pouvoir les choisir ?
- [x] dans le même ordre d'idée, pour les volet, il ya une position favorite, est-ce possible de définir une etiquette pour que le volet se mette en position favorite ? (integration somfy quobuzz) voir ./captures/position.png

- [x] le scheduleur devrait permettre d'activer ou desactiver des plage horaire pour des automatisations exemple, automatisation qui gère un capteur de présence

- [x]pourquoi sur une vue 1 programme j'ai l'icone liste des etiquette de tous les programmes ? est-ce utile ? Il y a déjà 2 autres endroits pour définir les etiquettes ..



- [x] deploie la version après les modifs demandée ci dessus

## Résultats du 2026-10-29

- Commit initial `bd415eb`, issue #2 ; 0.8.0 sauvegardée, déployée et rechargée.
- Guides : `docs/SEASONS.md`, `docs/GENERIC_ACTIONS.md`, `docs/MAMY_REVIEW.md`.
- Références consultées dans `docs/captures/` (ignorées par Git).
- Cadran en lecture avec ouverture de l’éditeur ; liste compacte utilisable dans le choix de vue.
- Presets/favori/automatisations : découverte générique testée. Le favori nécessite une action réellement exposée par HA ; aucun test physique revendiqué.

- Validation : 85 tests Python et 121 tests carte, TypeScript et build verts ; cadran/liste/formulaire contrôlés à 360 × 780, absence de débordement et d’erreur console.

- Grand écran 1440 px : titre de modale 560 → 1400 px, aucun débordement ni erreur console. Revue finale : préserver les bascules des non-administrateurs lorsque la configuration est réservée aux admins.

- Déploiement final : 0.9.0 (`6675a9b`), copie et `weekly_planner.reload` réussis ; pas de redémarrage HA nécessaire (aucune source Python modifiée).


## Revue Mamy — correctif 0.9.1 (issue #4)

- [x] Vérifier le choix du cadran ; le rendre repérable même en mode liste avec une indication vers Un programme.
- [x] Préserver les brouillons entre programmes, modes de carte et onglets ; une sauvegarde en arrière-plan ne change pas la sélection.
- [x] Distinguer saison active et saison à gérer ; ouvrir directement le vrai sélecteur HA pour l’activation.
- [x] Libeller les actions de saison, un seul Appliquer pour le nom et le programme ; validation invalide sans écriture.
- [x] Préciser la portée partagée près d’Appliquer, confirmer la mise à jour partout et signaler les modifications non appliquées.
- [x] Navigation clavier, validation navigateur 360 × 780 clair / 1440 sombre, 85 tests Python et 121 tests carte, TypeScript et build.


## Annuler / Rétablir — 0.10.0 (issue #5)

- [x] Historique du brouillon de programme : appareils, réglages, conditions, saisons et duplication.
- [x] Boutons explicites, raccourcis hors texte, conservation durant la navigation, 50 étapes et regroupement des saisies.
- [x] Réinitialisation après enregistrement réussi ; aucune commande HA lors d’Annuler/Rétablir.

- [x] Validation : 85 tests Python, 127 tests carte, TypeScript et build ; navigateur 360 × 780 clair / 1440 sombre. Annulation/rétablissement des champs, formulaires et duplication, nouvelle branche, navigation et remise à zéro après sauvegarde simulée vérifiés ; zéro écriture programme réelle.
- Correction de cette interprétation : la plage ouvrée 08:00–17:00 interdit uniquement les commits, pas les déploiements. Le propriétaire autorise le déploiement de l’arbre de travail testé sans commit.

- [x] Déploiement 0.10.0 sans commit demandé par le propriétaire : tests Python, TypeScript, tests carte et build réussis ; copie et `weekly_planner.reload` réussis. Empreinte locale/distante identique : `2ac1194d7034211d385dea9add96262744ae14e31bf9b0f922d3821479f64242`. Aucun commit ni redémarrage HA effectué.


## Première documentation illustrée (issue #6)

- [x] Inventaire des écrans actuels, sans les anciens modes et dérogations retirés.
- [x] 36 écrans principaux, 2 suites et 11 variantes : 49 captures dans `docs/images/guide/`.
- [x] Guide français `docs/GUIDE.fr.md`, atlas `docs/SCREENS.fr.md`, inventaire `docs/SCREEN_INVENTORY.md`, liens depuis les README.
- [x] Exemples de démonstration, historique local réel, aucune modification de programme réel ou de production ; enregistrement de barre simulé en mémoire pour S21.
- [x] Limite du réglage global de réapplication documentée, sans annoncer un effet actuellement absent.

## Documentation reprise — 0.16.2

- [x] Actualiser guide Mamy et README intégrateurs.
- [x] Ajouter neuf captures actuelles S37–S45 et distinguer les archives 0.10.0.
- [x] Documenter modes externes, choix des actions, boutons cibles, valeurs dynamiques, zones et graphique vide.
