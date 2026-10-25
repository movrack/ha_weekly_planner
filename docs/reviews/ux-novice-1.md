# Revue d'ergonomie n° 1 — utilisatrice novice (2026-10-25)

Écran : Samsung Galaxy S22 (360 × 780 px), thème sombre, carte version de `develop` du 25/10.
Persona : 80 ans, ne connaît pas Home Assistant, veut seulement avoir plus chaud ou changer l'heure du matin.

## Verdict
La consultation est presque lisible mais ne répond pas à « il fait froid ». L'éditeur est
inutilisable pour elle.

## Constats principaux
1. Aucune température visible (ni actuelle ni voulue) ; libellés anglais (« home ») ; titre « Weekly Planner ».
2. « Déroger… » est la seule action utile mais le mot est incompris ; le formulaire mélange appareils,
   consignes, modes, durée et date.
3. Jargon partout : Entités, Consigne, Préréglage, Hors plage, Profil, Priorité, Conditions,
   Réappliquer, Type principal, identifiants techniques.
4. Mise en page à 360 px : rangée de boutons du bas rognée (« upprimer »), libellés de plages tronqués,
   onglets coupés, bouton flottant sur le graphique, titre du jour sur 3 lignes, cibles < 48 px
   (poignées ~8 px, icônes ~40 px).
5. Actions destructrices (supprimer programme, profil, mode, plage, entité) sans confirmation et
   collées aux boutons d'enregistrement.

## Mode simple proposé
1. Titre « Chauffage du bureau » + phrase d'état : « Il fait 19 °C. Prévu : 21 °C jusqu'à 22:00. »
2. Deux gros boutons « Plus chaud » / « Moins chaud » (≥ 56 px).
3. Choix de durée en une ligne (1 h · 2 h · ce soir · jusqu'au prochain horaire), puis « C'est fait ».
4. « Changer les horaires » : liste en phrases, un jour à la fois, une plage = de / à / mode.
5. « Mode avancé » discret en bas.

## Derrière « Mode avancé »
Nouveau programme, nom/icône/priorité, conditions, réappliquer, type principal, appareils et défauts,
profils (saisons), bibliothèque des modes, graphique, volets/lumières, horaires solaires, ±5 min,
supprimer/dupliquer, date de fin de dérogation.

## Les 5 changements les plus utiles
1. « Plus chaud / Moins chaud » avec durée simple et confirmation (remplace « Déroger… »).
2. Température actuelle, voulue et état (chauffe / repos) en clair.
3. Tout traduire et vulgariser, aucun identifiant technique.
4. Corriger la mise en page 360 px et les cibles tactiles.
5. Mode avancé pour les écrans techniques ; confirmations pour toutes les suppressions, éloignées
   des boutons d'enregistrement.
