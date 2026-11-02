# Légendes précises et alias des sources du graphique (demande du propriétaire, 2026-11-02, issue #41)

Demande : (1) « Valeur mesurée », « Demandé à l'appareil »… ne disent pas de quoi (température ? position ?) ;
(2) pour chaque source ajoutée dans les options du graphique, pouvoir choisir un **alias** (ex. l'humidité du bureau
s'affiche « Bureau » : on veut « Humidité bureau »). Mise en œuvre confiée à Codex ; vérifications (pytest inclus) par
le coordinateur. Codex n'enregistre rien dans Git, ne pousse pas et ne déploie pas.

## 1. Légendes qui nomment la grandeur
- [x] Remplacer « Valeur mesurée » / « Demandé à l'appareil » par « <grandeur> mesurée » / « <grandeur> demandée »
      (fr/en), la grandeur venant de ce qui est réellement tracé : classe de l'appareil/unité via les traductions de
      Home Assistant (ex. température, humidité, puissance), repli générique « Valeur mesurée / Valeur demandée ».
      **Aucune liste de types d'appareils ou d'unités codée en dur** (règle de découverte générique).
- [x] « Programme » garde un libellé court mais précise la grandeur quand elle est connue. Tests du texte, repli compris.

## 2. Alias par source
- [x] `entities[i].chart_sources[j].alias` facultatif (texte, 1 à 60 caractères, espaces rognés ; absent = nom HA).
      Schéma serveur (`custom_components/weekly_planner/validation.py`, et types si besoin), sauvegarde et échanges
      inchangés par ailleurs ; aucune migration (champ facultatif).
- [x] Panneau « Options du graphique » : champ « Nom affiché » (placeholder = nom HA) sur chaque ligne de source,
      enregistré automatiquement comme le reste (même logique de conflit/lecture seule). Vider le champ retire l'alias.
- [x] Légende, bandes d'états et info-bulles utilisent l'alias s'il existe, sinon le nom HA. Tests TS + tests Python
      du schéma (alias valide, trop long, vide, type invalide) dans `tests/test_chart_sources.py`.

## Livrables
- [x] `cd frontend && npx tsc --noEmit && npx vitest run --coverage && npm run build` (seuils 80/60/60 tenus) ;
      pytest est lancé par le coordinateur (le bac à sable de Codex ne peut pas l'exécuter).
- [x] Guide français, SPEC §33, DECISIONS (alias), CHANGELOG [Unreleased].
- [x] Rapport dans `PROJECT_MEMORY.md` (télégraphique) ; le changement Python impose un redémarrage de HA au déploiement.

## Vérifications de réalisation
- TypeScript : ok ; Vitest : 671 tests, 65 fichiers ; couverture instructions 84,12 %, branches 76,39 %, fonctions 80,45 %, lignes 86,51 %.
- Build : ok, `npm run build -- --outDir dist` ; sortie limitée à `frontend/dist` pour respecter les fichiers autorisés. Bundle distribué non remplacé.
- Python : tests écrits dans `tests/test_chart_sources.py`, non exécutés ; exécution confiée au coordinateur.
- Vérification visuelle navigateur non effectuée. Guide source actualisé ; wiki non publié conformément à l’interdiction de push.
- Aucun commit, push ou déploiement. Au déploiement, le changement du schéma Python nécessite un redémarrage de Home Assistant.

## 3. Retours du propriétaire après déploiement (2026-11-02, capture bureau)
- [x] Vue bureau (fenêtre des horaires à deux colonnes : paramètres à gauche, semaine et graphique à droite) : le panneau
      « Options du graphique » est un réglage ; il doit être dans la colonne de **gauche** (paramètres), sous les réglages
      de l'appareil, et non sous le graphique. En mobile l'ordre actuel (colonne unique) est conservé. L'ordre du DOM reste
      celui du mobile. Le panneau a besoin de l'historique et de l'unité principale que le graphique charge : les faire
      circuler proprement (événement ou propriété partagée), sans doubler les requêtes d'historique.
- [x] Légendes : « Mesure · Température cible (°C) » est faux. La courbe mesurée d'un thermostat est la température
      **actuelle** ; la grandeur de chaque courbe vient de l'attribut réellement tracé (mesurée : température actuelle ;
      demandée/programmée : température cible). Générique, sans liste de types d'appareils. Tests dédiés.
- [x] Alias « impossible d'enregistrer » : cause identifiée = serveur Python de production pas encore redémarré avec le
      nouveau schéma (le champ alias est refusé par l'ancien code). À vérifier après redémarrage ; ajouter un test qui
      enregistre un alias via le chemin complet (carte -> websocket -> relecture) et un message d'erreur plus précis.

### Vérification des retours
- Options : ordre DOM mobile conservé, placement CSS bureau ; événement de contexte sans requête supplémentaire, garde par programme/appareil.
- Alias : test Vitest depuis le champ rendu vers sauvegarde WebSocket simulée et relecture ; test WebSocket Python réel sauvegarde/diffusion/relecture ajouté, non exécuté conformément à la demande.
- Vérification après redémarrage en production : en attente, hors périmètre de cette session.
- Contrôles des retours : TypeScript ok ; 675 tests Vitest / 65 fichiers ; couverture instructions 84,22 %, branches 76,61 %, fonctions 80,54 %, lignes 86,60 % ; build standard ok (bundle distribué reconstruit).
- `git diff --check` ok ; navigateur non vérifié ; aucun pytest, commit, push ou déploiement. Guide source actualisé, wiki non publié (interdiction de push).
