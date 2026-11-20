# Plan : gestion des programmes dans un panneau de l'intégration (brouillon, à valider par le propriétaire)

Statut : **brouillon** (2026-11-17). Pas encore approuvé, pas d'issue de suivi.
Origine : le propriétaire trouve étrange de gérer les programmes dans les paramètres de la carte.

## Constat
- Les programmes vivent dans l'intégration (store, WebSocket `weekly_planner/program/save` et `/delete`). Aujourd'hui, c'est
  pourtant l'éditeur de carte (`card-editor.ts`, 501 lignes) qui les crée, les modifie et les supprime, via
  `wp-program-editor` (`editors/program-editor.ts`, 691 lignes).
- Deux cartes peuvent modifier les mêmes programmes ; ce qu'on règle dans une carte n'a aucun lien avec ce que fait la carte.
- `wp-program-editor` est **déjà un élément autonome** (propriétés `hass`, `data`, `program`, `embedded` ; événements
  `program-saved`, `program-deleted`) : il peut être hébergé ailleurs sans réécriture.
- Les options de l'intégration (`config_flow.py`, `WeeklyPlannerOptionsFlow`) ne portent que des réglages globaux
  (paramètres, mode par défaut, resynchronisation).

## Décision proposée
- **Un panneau « Programmes » dans la barre latérale**, enregistré par l'intégration, réservé aux administrateurs, qui héberge
  la liste des programmes et `wp-program-editor`.
- Les **options natives** gardent les réglages globaux.
- **La carte ne garde que l'affichage** : titre, programme ou filtre montré, type de vue, couleurs et options de lecture.
- Rejeté : tout mettre dans le flux d'options natif. Les formulaires par étapes ne gèrent pas bien les listes d'appareils,
  les modes, les icônes ni le réordonnancement ; il faudrait réécrire chaque écran avec moins de fonctions.

## Principes
- Aucune donnée ni sauvegarde ne change : retour arrière = version précédente dans HACS.
- Une étape = une issue + une PR ; refactorisation et fonctionnalité jamais mêlées dans une même PR.
- Déployer ne signifie pas commiter. Commits uniquement sur demande, jamais du lundi au vendredi entre 8h et 17h (dépôt public).
- Écran de référence 360 × 780 px, mode simple « mamy » par défaut, icônes `mdi:` seulement, EN et FR.

## Étape 1 : le panneau (ajout, rien n'est retiré)
- [ ] `frontend.py` : enregistrer le panneau (`panel_custom`, titre « Programmes », icône `mdi:calendar-clock`,
  `require_admin=True`), servi par le même bundle ; décider si le bundle est chargé aussi hors du tableau de bord.
- [ ] Nouvel élément `wp-programs-panel` : liste des programmes (nom, icône, appareils, état actif), bouton « Nouveau
  programme », ouverture de `wp-program-editor` (non `embedded`), suppression, abonnement `weekly_planner/subscribe` pour rester
  à jour.
- [ ] Le panneau passe `hass`, `data` et gère les événements `program-saved` et `program-deleted` sans toucher à la carte.
- [ ] Écran étroit (360 px) : liste puis éditeur en plein écran ; écran large : liste à gauche, éditeur à droite.
- [ ] Lecture seule (`data.read_only`, `can_edit`) et non-administrateur : message clair, aucun bouton d'écriture.
- [ ] Tests (Lit sans DOM, seuils 90/80/80/80 par fichier) et test Python d'enregistrement du panneau ; niveau Bronze
  revérifié avant livraison.
- [ ] Critère : créer, modifier et supprimer un programme depuis le panneau seul, sur l'instance de dev ; captures `parker` 360 et
  1440 px, clair et sombre.

## Étape 2 : la carte n'a plus la gestion
- [ ] `card-editor.ts` : retirer la section « réglages du programme » et le code de création, remplacer par un lien
  « Gérer les programmes » vers le panneau (`/weekly-planner`).
- [ ] Cas « aucun programme » dans la carte : le bouton de création mène au panneau ; le sélecteur de programme de la carte
  reste.
- [ ] Supprimer le code devenu inutile (`_programEditor`, `_saved`, `selectCreated`… à vérifier un par un) et leurs tests, sans
  abaisser aucun plancher de couverture.
- [ ] YAML de la carte inchangé (`program:` et `filter:` restent valides) : aucune migration pour les tableaux existants.
- [ ] Mutation : relancer Stryker sur les fichiers touchés, score non inférieur.

## Étape 3 : documentation
- [ ] `wiki/GUIDE.fr.md`, `wiki/SCREENS.fr.md` et captures `images/guide/`, `docs/SCREEN_INVENTORY.md`, `docs/SPEC.md`,
  `docs/DECISIONS.md` (pourquoi un panneau et pas le flux d'options), CHANGELOG, README EN et FR (une ligne), puis resynchro du
  wiki publié.
- [ ] `AI_GUIDE.md` de l'intégration si le chemin de gestion y est cité.

## Risques à lever avant de commencer
1. **Chargement du bundle dans le panneau** : aujourd'hui il est une ressource de tableau de bord ; un panneau doit le charger
   lui-même (module du panneau) sans le charger deux fois.
2. **Éditeur et `ha-selector`** : `wp-program-editor` charge les sélecteurs HA à la demande (`ensureHaSelector`) ; à vérifier
   dans un panneau où aucune carte n'a été montée.
3. **Mises à jour simultanées** : le panneau et une carte ouverte écoutent le même abonnement ; la révision des programmes
   (conflits) doit rester le seul arbitre.
4. **Découvrabilité** : un utilisateur qui cherche « Ajouter un programme » dans la carte doit trouver le lien ; prévoir le message.
5. **Installations sans administrateur** : le panneau est invisible ; la carte doit l'expliquer au lieu de rester muette.

## Décisions à prendre par le propriétaire
- Panneau dédié (recommandé) ou flux d'options natif.
- Faire les étapes 1 et 2 en deux versions (ajout d'abord, retrait ensuite) ou en une seule.
- Nom et icône du panneau dans la barre latérale.
- Ouvrir l'issue de suivi et une issue par étape (règle du projet : un plan approuvé a une issue).
