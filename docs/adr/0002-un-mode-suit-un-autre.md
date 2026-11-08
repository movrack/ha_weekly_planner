# Un mode peut en suivre un autre (renvoi dynamique)

Pour un programme, le mode B peut « suivre » le mode A : les horaires effectifs de B sont ceux de A en permanence. C'est un renvoi, pas une copie : un ajout ou une modification dans A se voit aussitôt dans B. Le lien se règle **par programme et par mode** (champ `follows: <nom du mode>` du profil du mode ; la clé de stockage `profiles` est conservée, `follows` est facultatif : aucune migration de stockage).

Choisi plutôt qu'une copie (déjà possible avec « Copier depuis un autre mode ») parce que l'usage visé est « Congé maison = comme Présent » sans devoir tenir deux listes à jour.

## Consequences

- Pas de chaînes ni de boucles : on ne suit qu'un mode source qui ne suit personne ; un mode déjà suivi ne peut pas suivre ; on ne se suit pas soi-même. La résolution (`profile_for_mode`) ne fait qu'un cran. Le backend refuse avec un message clair ; l'interface ne propose que les sources valides.
- Un mode qui suit n'a pas d'horaires propres (jours vides). Activer le suivi sur un mode qui en a demande confirmation dans la carte : ses horaires propres sont supprimés.
- Modifier un mode qui suit n'est jamais silencieux : la carte demande « Modifier <source> (vaut aussi pour ce mode) » ou « Arrêter de suivre » (le mode reçoit une copie des horaires de la source et devient indépendant). Les barres de la carte sont en lecture seule pour un mode actif qui suit.
- Commande `weekly_planner/program/mode_follow {program_id, mode, follows: str|null}` ; `null` = arrêter de suivre avec copie (nouveaux identifiants d'horaires, graine de l'heure aléatoire conservée). Mêmes droits que l'enregistrement d'un programme.
- Source qui disparaît (suppression via mode/resolve) : les modes qui la suivaient gardent une copie de ses derniers horaires et cessent de suivre ; un avertissement (`mode.follow_lost`, une semaine) s'affiche via `wp-mode-notice`. Un mode « sans option » reste une source tant qu'on ne l'a pas supprimé (jamais d'effacement automatique). Un renommage (automatique, résolu ou défait) met à jour les `follows` qui pointaient l'ancien nom.
- Fichier de configuration : `modes: {Congé maison: {follows: Present}}` ; export et import symétriques ; refus si `follows` coexiste avec des horaires, si la cible n'existe pas, si elle suit déjà un autre mode ou si c'est soi-même.
