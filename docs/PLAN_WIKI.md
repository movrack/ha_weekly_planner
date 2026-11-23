# Plan du wiki Weekly Planner, version 3 (structure seule, #56)

Reprend le plan v2 (corrigé de la revue `nemesis`) et applique les décisions du propriétaire du 2026-11-22
(`docs/DECISIONS.md` : « Wiki (#56) : réponses… » et « Livre de recettes… »). Aucun texte de page ici : seulement
la table des matières. Supprimer ce fichier quand le wiki est écrit ; les décisions restent dans `DECISIONS.md`.

## Règles de fabrication
- **Source unique** : `wiki/` du dépôt. Le wiki GitHub est une copie publiée, **modifiable par les collaborateurs
  seulement** (réglage du dépôt à vérifier) ; on n'y écrit jamais directement.
- **Pas de doublon** : une option, un service ou un réglage est décrit à un seul endroit ; le README renvoie vers le wiki.
- **Version** : le wiki décrit la **dernière version publiée** (aujourd'hui 0.29.0) ; une fonction non publiée n'y
  figure pas (pas d'encadré « bientôt »). Les liens ne pointent jamais vers `develop`. Les pages qui dépendent d'une
  fonction non publiée (jour férié #54, vue « Horaires du jour », ordre de la liste…) sont écrites et publiées avec
  la version qui les livre.
- **Noms** : ceux de `GLOSSARY.md` et de l'interface uniquement (« Réglage », « Le reste du temps », « Pause »,
  « Suspension de tous les programmes », « Sauter le prochain changement », « Jour férié »). Mots de la liste
  « à éviter » bannis ; pas de « mode simple / avancé » (l'interface dit « Options avancées »).
- **Public** : rien d'interne (horaires de commit, déploiement, agents, rapports, Relais, `docs/`).
- **Histoire** : aucune page d'historique, aucun « ancien / remplacé » ; `CHANGELOG.md` et `DECISIONS.md` suffisent.
- **Retour à une ancienne version** : non pris en charge, **non documenté** (ni page, ni phrase). « Mettre à jour »
  dit seulement de sauvegarder avant.
- **Exemples réels** (règle `AGENTS.md`) : chaque recette est un besoin réel d'un foyer, avec de vrais types
  d'entités et de vraies valeurs, vérifiée sur la version publiée.
- **Entretien** : en-tête « testée avec la version X » ; liste de contrôle « pages et captures à revoir » à chaque
  version (`heimdall`) ; captures par `parker`, données fictives. Un script publie `wiki/` vers le wiki GitHub et
  échoue sur un lien ou une ancre cassés (remplace la resynchronisation à la main).
- **Ordre** : guide par tâches (« Je veux… ») d'abord, vocabulaire ensuite.

## Langues : français d'abord, anglais ensuite
- **Nommage des fichiers** : suffixe de langue sur **toutes** les pages, `NOM.fr.md` maintenant, `NOM.en.md` plus
  tard. Les fichiers sans suffixe (`MODES.md`, `GENERIC_ACTIONS.md`, `REFERENCE.md`) disparaissent du wiki.
- **Noms de pages GitHub** : une clé stable et neutre, sans accent, identique dans les deux langues ; la langue est
  un préfixe de nom (`Accueil` / `Home`) seulement pour les deux pages d'entrée. Exemples : `Guide-utilisateur`
  (fr), `User-guide` (en) ; `Recette-jour-travaille` (fr), `Recipe-workday` (en). Les pages françaises gardent les
  noms actuels (liens existants).
- **Navigation** : `_Sidebar.fr.md` (une barre par langue, chacune ne liste que sa langue) et, en tête de chaque
  page, une ligne « Français · English » (le lien anglais est ajouté seulement quand la page existe). Les ancres
  restent identiques d'une langue à l'autre.
- **Ajouter l'anglais ne change rien à la structure** : on ajoute des fichiers `*.en.md` et une barre latérale.
- **Premières pages en anglais** (parce que le README anglais y renvoie) : Accueil, Installer et mettre à jour,
  Désinstaller, Premier programme, Dépannage, Options de la carte (référence), Entités et services. Ensuite le
  guide par tâches, puis les recettes. L'atlas des écrans en dernier (captures : l'interface existe déjà en anglais).
- Tant que l'anglais manque : le README anglais le dit (« wiki en français pour l'instant »).
- Vérification de parité FR/EN par `c3po` à chaque ajout.

## Plan (une page par entrée numérotée de premier niveau ; sous-points = sections de la page)

### 0. Accueil
0.1 Ce que fait Weekly Planner. 0.2 Par où commencer selon mon besoin. 0.3 Version décrite, compatibilité (Home
Assistant, HACS).

### 1. Démarrage
1.1 Installer par HACS. 1.2 Installer à la main. 1.3 Ajouter l'intégration. 1.4 Ajouter la carte. 1.5 Créer mon
premier programme. 1.6 Mettre à jour (sauvegarder avant ; rien sur un retour en arrière). 1.7 Désinstaller (niveau
Bronze).

### 2. Guide par tâches (« Je veux… »), point d'entrée
2.1 Voir ce qui est prévu. 2.2 Régler matin et soir. 2.3 Modifier ou copier un horaire. 2.4 Plusieurs appareils dans
un programme. 2.5 Fermer le volet au coucher du soleil. 2.6 Des horaires différents selon le mode. 2.7 D'autres
horaires les jours fériés (**avec la version qui livre #54**). 2.8 Sauter le prochain changement, mettre en pause,
suspendre tous les programmes. 2.9 Changer la présentation, l'ordre de la liste, le format de l'heure. 2.10
Comprendre ce qui s'est passé (journal, historique de 14 jours, comparer avec une autre entité). 2.11 Après une
panne (resynchroniser, `apply_now`).

Pages de la section 2 (fichier, entrée du plan) : `GUIDE_VOIR_PREVU` 2.1, `GUIDE_MATIN_ET_SOIR` 2.2,
`GUIDE_MODIFIER_COPIER` 2.3, `GUIDE_PLUSIEURS_APPAREILS` 2.4, `GUIDE_SOLEIL` 2.5, `GUIDE_MODES` 2.6 (avec
« mêmes horaires que »), `GUIDE_JOUR_FERIE` 2.7, `GUIDE_PAUSE_SAUT` 2.8, `GUIDE_PRESENTATION` 2.9, `GUIDE_COMPRENDRE`
2.10, `GUIDE_APRES_PANNE` 2.11 (tous en `.fr.md`).

### 3. Vocabulaire
Page « Lexique » (générée du glossaire) ; 3.1 Programme, appareil, réglage. 3.2 Horaire, fin d'horaire, le reste du
temps. 3.3 Priorité. 3.4 Mode et mode qui en suit un autre. 3.5 Jour férié (une entité pour la maison, un jour réglé
par programme et par mode). 3.6 Conditions. 3.7 Pause, sauter le prochain changement, suspension de tous les
programmes (distincte du mode Vacances).

### 4. La carte
4.1 Lire la carte. 4.2 Affichages. 4.3 Graphique du jour. 4.4 Fenêtre des horaires. 4.5 Options avancées. 4.6 Au
téléphone. 4.7 Clavier et lecteur d'écran.

### 5. Réglages (**fait** : `REGLAGES.fr.md`)
5.1 Créer et modifier un réglage et ses actions (consigne, position, valeur d'une entité, automatisation,
séquence). 5.2 Horaires aléatoires. 5.3 Soleil et limites. 5.4 Zone du programme. 5.5 Réappliquer, vérifier et
réessayer. 5.6 Renommer un mode (avec « Annuler »), modes sans option, état en lecture seule, limites.

### 6. Configuration (référence, un seul endroit chacune) (**fait** : `CONFIGURATION.fr.md`)
6.1 Options de la carte (tableau unique, YAML et éditeur). 6.2 Réglages de l'intégration. 6.3 Sélecteur de mode.
6.4 Qui peut modifier quoi. 6.5 Fichier de configuration YAML (export, import, confidentialité). 6.6 Sauvegarde et
restauration. 6.7 Où trouver `program_id`.

### 7. Entités, services et automatisations (pour l'utilisateur) (**fait** : `ENTITES_SERVICES.fr.md`)
7.1 Entités. 7.2 Services utiles à une automatisation (ce qu'on envoie, ce qu'on reçoit). 7.3 Notifications et liste
des réparations.

### 8. Recettes
Index + une page par recette (gabarit existant : « À quoi ça sert », « Ce qu'il faut », « Étapes », « Résultat »,
« À savoir », retour à l'index). Liste dans la section suivante.

### 9. Dépannage (**reporté**, décision du propriétaire du 2026-11-23 : ne pas écrire, ne lier depuis aucune page)
9.1 Mon appareil n'a pas bougé. 9.2 La carte ne s'affiche pas ou est ancienne. 9.3 Heures décalées. 9.4 Messages
d'erreur. 9.5 Journaux. 9.6 Signaler un bug (lien vers les issues).

### Annexes
A. Atlas des écrans (à renuméroter et à refaire à la version 1.0.0). B. Codes d'erreur et de réparation (générés
de `translations/*.json`). C. Compatibilité par type d'appareil.

**Il n'y a plus de section 10 « Intégrateurs » dans le wiki.** Ce qui la composait reste dans le dépôt (voir
« Correspondance »).

## Livre de recettes : revue des 9 recettes existantes
Règle : un besoin réel d'un foyer, de vrais types d'entités et de vraies valeurs. Les exemples actuels utilisent des
entités réelles (`binary_sensor.workday_sensor` de l'intégration Jour ouvré, `calendar.*` de l'intégration Jours
fériés, `input_select`, `input_boolean`, `zone.home`, `person`) : le fond est bon. Les noms d'entités et la
Belgique doivent être présentés comme « à adapter ».

| Fichier | Besoin réel | Décision |
|---|---|---|
| RECETTE_JOUR_TRAVAILLE | Chauffage, volets et lumières suivent semaine travaillée ou congé (capteur Jour ouvré) | **Garder** (vérifier les noms de menus sur 0.29.0) |
| RECETTE_VACANCES_SCOLAIRES | Horaires de vacances quand un calendrier scolaire est `on` | **Garder**, préciser une source réelle de calendrier (le nom `binary_sensor.vacances_scolaires` est inventé : dire que l'utilisateur le crée ou l'adapte) |
| RECETTE_PLUSIEURS_CAPTEURS | Un seul ordre de priorité quand plusieurs capteurs décident du mode | **Garder**, fusionner les « pièges des modes » dans cette page |
| RECETTE_ABSENT | Maison vide : baisser chauffage et lumières | **Garder** (`zone.home` à 0 : cas réel) ; ajouter l'avertissement « entités `person` » déjà présent |
| RECETTE_MEMES_HORAIRES | Deux modes presque identiques partagent une semaine | **Fait** : fusionnée dans `GUIDE_MODES.fr.md` (2.6, « Utiliser les mêmes horaires qu’un autre mode »), fichier supprimé |
| RECETTE_INTERRUPTEUR_JOUR_FERIE | Un jour de congé décidé à la main (pont, congé posé) | **Garder, publier avec #54** (dépend de l'entité jour férié) |
| RECETTE_CAPTEUR_JOUR_FERIE | Jours fériés officiels et congés scolaires dans un seul capteur modèle | **Garder, publier avec #54** ; dire que le calendrier dépend du pays |
| RECETTE_GARDE_ALTERNEE | Chauffer les chambres des enfants seulement les semaines de garde | **Garder** (priorités, `input_boolean` ou calendrier) |
| RECETTE_HEURES_DE_POINTE | Baisser le chauffage en pointe tarifaire (Tempo, effacement) | **Garder** ; vérifier la phrase sur le délai d'attente avant publication |
| PRIORITES (page de règle, pas recette) | Comprendre les priorités | **Garder** comme page de concept (3.3), hors du livre |

Fichiers sans recette : l'index `RECETTES.fr.md` garde « Avant une recette avec les modes » (devient la page
« Préparer le sélecteur de mode ») ; les « pièges des modes » se répartissent dans les recettes concernées.

### Recettes à ajouter (cas réels de foyer ; chacune à vérifier sur la carte avant écriture)
- **Chauffage semaine / week-end** : thermostat `climate.*` à 19 °C le matin et le soir en semaine, 20 °C toute la
  journée le week-end, 16 °C la nuit (« le reste du temps »).
- **Volets au lever et au coucher du soleil** : `cover.*` qui s'ouvre au lever, se ferme au coucher
  (limites du soleil, 5.3 ; position favorite en %).
- **Volets d'été anti-chaleur** : volets d'une façade sud fermés à 70 % de 12 h à 18 h de juin à août (mode « Été »).
- **Arrosage du jardin** : `switch.*` d'électrovanne ouvert 20 min à 6 h, 3 jours par semaine, pas les jours de pluie
  (condition sur un capteur de pluie ou une entité météo).
- **Chauffe-eau en heures creuses** : `switch.*` du chauffe-eau allumé de 22 h à 6 h (contrat jour/nuit),
  remis en marche forcée le week-end (priorité).
- **Vacances : maison en veille** : mode « Vacances » avec chauffage hors gel (8 à 10 °C), volets fermés, lumières
  de présence aléatoires (horaires aléatoires, 5.2), sans confondre avec la suspension de tous les programmes.
- **Lumière de présence** : `light.*` qui s'allume entre 18 h et 23 h avec un décalage aléatoire quand on est absent
  (à fusionner avec la recette « Vacances » si trop proche).
- **Chambre d'enfant et nuit** : `light.*` à 10 % de 20 h à 7 h (veilleuse), tous les jours.
- **Télétravail** : bureau chauffé à 21 °C les jours où un `input_boolean.teletravail` est allumé, par-dessus le
  programme de base (priorités).

Chaque nouvelle recette est vérifiée contre la carte publiée (menus, noms de réglages) avec une capture de `parker`.

## Correspondance avec les pages existantes
| Existant | Place |
|---|---|
| Home | 0 Accueil |
| Guide utilisateur (`GUIDE.fr.md`) | **Section 2 faite** : `GUIDE.fr.md` est l'index « Je veux… » et les 11 tâches sont les pages `GUIDE_*.fr.md` (liste en fin de section 2). Les sections 4 à 7 sont écrites (`CARTE`, `REGLAGES`, `CONFIGURATION`, `ENTITES_SERVICES`) ; `GUIDE_A_REPARTIR.fr.md` est vidé et supprimé |
| Atlas des écrans (`SCREENS.fr.md` + `images/guide/`) | Annexe A |
| Modes (`MODES.md`, anglais) | 3.4, 5.6, 6.3, 2.6 ; **fait** : texte repris en français (`GUIDE_MODES`, `REGLAGES`, `CONFIGURATION`), fichier sans suffixe supprimé du wiki |
| Recettes (`RECETTES.fr.md`) et 9 `RECETTE_*.fr.md` | 8 (voir revue ci-dessus) |
| Priorités (`PRIORITES.fr.md`) | 3.3 |
| Actions génériques (`GENERIC_ACTIONS.md`, anglais) | **parties utiles à l'utilisateur** en 5.1 (choisir les commandes, préréglages, position favorite, valeur d'une entité, automatisation, séquence) ; la partie purement technique reste dans le dépôt (README, `AGENTS.md` « Model ») ; **fait** : repris dans `REGLAGES.fr.md`, fichier supprimé du wiki |
| Configuration-YAML-de-la-carte (`REFERENCE.fr.md` « Configuration de la carte », « Sources complémentaires du graphique ») | 6.1 |
| Intégrateurs (`REFERENCE.fr.md` depuis « Modèle et exécution », `REFERENCE.md`, README.fr.md « Entités et actions ») | **retiré du wiki** : `REFERENCE*.md` restent dans le dépôt comme référence d'intégrateur (README les relie), jamais publiés comme guide. Y sont aussi les parties « Stockage, API et concurrence », « Modèle et exécution », « Limites ». Ne passent au wiki que les parties utilisateur : permissions (6.4), fichier YAML (6.5), services pour automatisations (7.2), jour férié (3.5), limites visibles (5.6) |
| Page `Recettes-pour-les-modes` (ancienne) | supprimée du wiki publié ; redirection vers Recettes |

## Réponses aux revues
B1 règles « Source unique », « Pas de doublon ». B2 règle « Version ». B3 3.5, 6.2. M1 règle « Noms ». M2 5.1.
M3 1.7, 2.10, 5.5, 5.6, 6.7, 7.3. M4 règle « Public ». M5 règle « Histoire ». M6 section 2 avant 3. M7 règle
« Entretien ». M8 section « Langues ». Mineurs : « plusieurs maisons » retiré ; « revenir en arrière » retiré
(non pris en charge, non documenté) ; « coupure du cloud » devient « panne » (2.11).

## Décisions du propriétaire sur les 5 derniers points (2026-11-22)
1. Les README (EN et FR) renvoient vers le **wiki**, pas vers `REFERENCE*.md` comme référence d'intégrateur.
2. `RECETTE_MEMES_HORAIRES` est fusionnée dans le guide (2.6) ; la recette est supprimée (recommandation suivie).
3. Les deux recettes « jour férié » sont écrites tout de suite, sans attendre la sortie de #54.
4. Les neuf recettes à ajouter sont validées (chacune reste un cas réel et utile, règle du livre de recettes).
5. Pas de script de publication du wiki pour l'instant : la resynchro reste manuelle (AGENTS.md).

Plus aucune question ouverte sur le plan. Étape suivante : écrire les pages, une section à la fois.
