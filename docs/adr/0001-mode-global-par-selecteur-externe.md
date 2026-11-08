# Le mode est global et choisi par un sélecteur externe

Un mode (Maison, Absent, Vacances…) décrit l'état de toute la maison, pas d'un programme : il est donc **commun à tous les programmes** et choisi en dehors de Weekly Planner, par un sélecteur Home Assistant (`input_select` ou `select`) indiqué une seule fois dans les réglages de l'intégration. Les modes sont les options de ce sélecteur ; sans sélecteur, il n'y a qu'un mode. Chaque programme garde ses propres horaires pour chaque mode.

Choisi plutôt qu'un mode par programme (déjà en place : chaque programme avait ses profils, son `mode_source` et une entité `select`) parce que l'utilisateur change de mode pour toute la maison à la fois, depuis un endroit qu'il possède déjà (tableau de bord, alarme, automatisation), et qu'un seul mode à afficher suffit à la carte.

## Consequences

- L'entité `select` de chaque programme est supprimée, de même que la gestion des modes dans les réglages du programme et le `mode_source` par programme (breaking change, annoncée dans le CHANGELOG et par une réparation).
- Un mode se rattache à une option par son **nom** ; renommage détecté seulement sans ambiguïté, sinon l'ancien mode reste « sans option » et une correspondance est proposée. Jamais d'effacement automatique.
- Une option par défaut (réglage global) reçoit les horaires du mode par défaut et sert de mode de secours quand aucun mode valide n'est connu.
- La suspension globale reste distincte du mode et prime sur lui.
- Le fichier de configuration gagne `mode_selector` et, par programme, `modes:` rangés par nom.
