# Weekly Planner

Planifier la semaine des appareils d'une maison : quand ils changent d'état, et pour quoi faire. Ce vocabulaire est celui de l'interface (carte, guides, wiki) ; il sert aussi aux humains et aux IA qui travaillent sur le projet.

## Language

**Programme**:
Un ensemble d'appareils avec leurs réglages et leurs horaires par mode. C'est ce que l'on active, met en pause ou règle sur la carte.
_Avoid_: planning, scénario, automatisation

**Appareil**:
Ce qu'un programme commande : un chauffage, un volet, une prise… Un programme peut en réunir plusieurs.
_Avoid_: entité (dans l'interface), device

**Mode**:
Un état global de la maison (Maison, Absent, Vacances, Hiver, Été…), commun à tous les programmes et choisi en dehors de Weekly Planner. Chaque programme a ses propres horaires pour chaque mode.
_Avoid_: profil, saison, semaine type (dans l'interface)

**Mode qui suit un autre** / **Mode source**:
Pour un programme, un mode peut « suivre » un autre mode (son mode source) : ses horaires sont alors ceux du mode source, en permanence (ce qu'on ajoute ou change dans la source se voit aussitôt dans le mode qui suit). Il n'a pas d'horaires propres. Le lien se règle par programme et par mode ; on ne suit qu'un mode source qui ne suit personne (ni chaîne, ni boucle, pas soi-même). Arrêter de suivre donne au mode une copie des horaires de la source.
_Avoid_: copie, lien, héritage, profil parent

**Mode actif**:**Mode actif**:
Le mode en vigueur dans toute la maison en ce moment ; chaque programme applique alors ses horaires de ce mode.
_Avoid_: profil actif, saison en cours

**Sélecteur de mode**:
L'entité externe de Home Assistant dont l'état est le mode actif. Facultatif : sans sélecteur, il n'existe qu'un seul mode, le mode par défaut. Weekly Planner le lit ; il ne le modifie jamais. Les modes disponibles sont ses options.
_Avoid_: source de mode, entité source

**Mode par défaut**:
Le mode utilisé quand le sélecteur n'a pas de choix utilisable, et celui qui reçoit les horaires existants au moment où un sélecteur est choisi. Sans sélecteur, c'est le seul mode. Se choisit parmi les options du sélecteur, dans les options de l'intégration.
_Avoid_: profil par défaut, semaine type

**Sans option**:
Un mode qui a des horaires mais que le sélecteur ne propose plus (option supprimée ou renommée). Il est conservé, inactif, et jamais effacé automatiquement : on le rattache à une nouvelle option ou on le supprime.
_Avoid_: mode orphelin, mode supprimé

**Horaire**:
Une règle « de telle heure à telle heure, tels jours, tel réglage » d'un programme pour un mode. Sans heure de fin, c'est une action unique.
_Avoid_: créneau, plage, slot, planning

**Horaires du jour**:
La vue de lecture de la journée d'aujourd'hui : une ligne par tronçon (heure, réglage, jusqu'à quand). Distincte de la « Liste compacte », qui liste les programmes.
_Avoid_: créneau, planning

**Réglage**:
Ce que les appareils doivent faire, avec un nom et une couleur : par exemple « Confort = 20 °C ». Partagé par tous les modes et tous les programmes ; une valeur propre peut être donnée à un appareil.
_Avoid_: label, étiquette, preset, action (pour le nom donné par l'utilisateur)
_Note_: « Réglages » (pluriel) est aussi le nom du panneau de configuration (« Réglages des programmes ») ; « Réglage » (singulier) est toujours le réglage nommé.

**Le reste du temps**:
Le réglage appliqué à un appareil quand aucun horaire ne s'applique ou qu'un horaire se termine.
_Avoid_: réglage par défaut, état de repos

**Condition**:
Une règle qui doit être vraie pour qu'un programme agisse (par exemple « quelqu'un est présent »).
_Avoid_: garde, filtre

**Priorité**:
Quand plusieurs programmes pilotent le même appareil, le programme au numéro le plus bas l'emporte. Les modes n'ajoutent pas de priorité.
_Avoid_: ordre, importance

**Jour férié** (EN : Day off):
Un jour déclaré spécial par une entité externe de Home Assistant (jour férié ou congé), choisie une fois pour toute la maison. Ce jour-là, dans le mode actif, le réglage « Jour férié » du mode remplace le jour de la semaine : mêmes horaires qu'un autre jour, ou horaires propres. Sans réglage, le jour normal s'applique. Ce n'est ni un mode, ni le mode « Vacances », ni la suspension de tous les programmes ; hier et demain restent des jours normaux.
_Avoid_: vacances, congés (seul), jour spécial, mode férié

## Marche et arrêt

**Pause jusqu'au…**:
Un programme arrêté pour une durée choisie (1 heure, 1 jour, 7 jours, x heures et jours) : il reprend tout seul à la fin. Le badge indique « Pause jusqu'au… » et la date de reprise. Elle n'éteint pas les appareils.
_Avoid_: suspension, mise en veille

**En pause**:
Un programme arrêté sans limite de durée (choix « Jusqu'à la reprise »), jusqu'à ce qu'on le remette en marche. Le badge indique « En pause ». Remplace l'ancien terme « Désactivé ».
_Avoid_: désactivé, inactif, éteint, suspendu

**Suspension de tous les programmes**:
Un interrupteur global qui arrête tous les programmes à la fois, quel que soit le mode, et remet les appareils à leur réglage de repos. Elle prime sur le mode et n'est pas le mode « Vacances ».
_Avoid_: mode vacances, pause générale

**Reprise**:
Le retour d'un programme en marche, à la main (on remet l'interrupteur) ou automatiquement à la fin d'une pause. Elle recalcule l'action du moment sans rejouer le passé.
_Avoid_: réactivation (à la fin d'une pause)

## Source de vérité

**Fichier de configuration**:
Le fichier `weekly_planner.yml` qui reflète les programmes et se relit quand on le modifie à la main.
_Avoid_: fichier YAML (pour l'utilisateur), export
