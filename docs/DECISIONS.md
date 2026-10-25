# Journal des décisions

Décisions prises pendant le développement, à relire avec le propriétaire du projet. Chaque entrée : date,
décision, raison, comment revenir en arrière. Les décisions marquées **à valider** attendent un accord.

| Date | Décision | Raison | Retour arrière |
|---|---|---|---|
| 2026-10-25 | Clés de stockage et de code en **anglais** (`start`, `end`, `time`, `sun`, `offset`, `earliest`, `latest`…), la spec garde des libellés français. | Intégration publique, conventions HA. | Renommage + migration de stockage. |
| 2026-10-25 | `frontend` et `lovelace` en `after_dependencies` (pas `dependencies`). | Les tests ne peuvent pas charger le frontend ; la carte s'enregistre seulement si Lovelace est présent. | Repasser en `dependencies`. |
| 2026-10-25 | Une plage dont la fin tombe avant le début passe minuit **seulement si la fin est avant midi** (22:00 → 06:00, coucher → 07:00) ; sinon elle est ignorée ce jour-là (ex. « coucher → 21:00 » en juin). | Lever l'ambiguïté des plages solaires (spec § 5.7). Conséquence : une plage fixe 13:00 → 12:00 (23 h) n'est pas possible. | Ajouter un drapeau explicite « passe minuit ». |
| 2026-10-25 | Heures solaires arrondies au pas de 5 min inférieur. | Barres et comparaisons alignées sur le pas de 5 min. | Supprimer l'arrondi. |
| 2026-10-25 | Toutes les actions en production (redémarrage HA, Versatile Thermostat, Evohome, tableau de bord) sont **préparées mais pas exécutées** tant que le propriétaire est absent. | Sécurité : chauffage et redémarrage demandent son accord. | — |
| 2026-10-25 | Toutes les heures du moteur sont manipulées en **UTC** ; l'heure locale ne sert qu'à construire les plages et à l'affichage. | En Python, comparer ou soustraire deux datetimes du même fuseau utilise l'heure murale : faux au changement d'heure (test S4). | — |
| 2026-10-25 | Banc d'essai : le radiateur Evohome sous Versatile Thermostat est remis à la main en preset `permanent` ; à surveiller pendant le test réel (un passage en `temporary` ferait reprendre le programme Evohome au créneau suivant). Piste si ça se reproduit : option « dérogation permanente » appliquée aussi au sous-jacent d'un VT. | Weekly Planner ne pilote que l'entité VT. | — |
