# Weekly Planner — spécification v1

> Statut : **brouillon 0.4** (relectures n° 1 et 2 intégrées, questions § 16 bis en cours).
> Dépôt : `ha_Weekly_planner` · domaine HA : `weekly_planner` · cible : Home Assistant ≥ 2026.10.
> Les cases `[ ]` / `[x]` suivent l'avancement. Critère de fin de la v1 : **tout fonctionne** (§ 13).

---

## 1. But

Un planificateur hebdomadaire **générique et agréable** pour Home Assistant, installable par HACS :
programmer, jour par jour, des **plages horaires** qui appliquent une action à une ou plusieurs entités
(thermostats, volets, lumières, prises, ventilateurs…), puis remettent l'**état par défaut** à la fin.

| Point faible ailleurs | Réponse de Weekly Planner |
|---|---|
| La fin d'un créneau n'exécute rien | Chaque plage a un début **et** une fin ; la fin applique l'état par défaut |
| Tout est rejoué après une coupure de courant, les réglages manuels sont écrasés | État voulu **recalculé** ; dérogations mémorisées ; réglage « réappliquer » |
| Aucune notion de dérogation manuelle | Dérogation détectée, respectée jusqu'à la fin de la plage, visible dans la carte |
| Une planification = un appareil + une action | Un programme = plusieurs entités, chacune son action ; modes partagés par type |
| Pas de vue semaine lisible | Vue semaine en barres colorées + détail du jour + graphique prévu/réel |
| Deux dépôts HACS (composant + carte) | Un seul dépôt : l'intégration embarque sa carte |

## 2. Glossaire

- **Programme** : ensemble nommé d'entités + une semaine de plages + réglages. Un interrupteur par programme.
- **Plage** : intervalle `[début, fin)` d'un jour (ou **ponctuelle** : début seul), avec une action par type (mode) ou par entité (consigne).
- **Consigne** : action concrète sur une entité (ex. `preset = eco`, `position = 30`, `scène X`).
- **Consigne d'état** : décrit un état à atteindre et vérifiable (température, preset, position…). **Action ponctuelle** : déclenchement sans état vérifiable (script, scène, bouton, action HA).
- **Mode** : consigne nommée, colorée, partagée par **type d'entité** (valeur commune + exceptions par entité).
- **État par défaut** : ce que l'entité reçoit à la fin d'une plage (mode/consigne, état d'avant, ou rien).
- **Dérogation** : changement d'une entité, pendant un segment, vers un état **différent** de l'état voulu, qui ne vient pas de Weekly Planner.
- **Segment** : occurrence d'une plage gagnante pour une entité (ou intervalle hors plage), identifiée par (programme, plage, date) — voir § 5.1.
- **Cible effective** : ce que l'entité doit avoir maintenant, dérogations comprises (§ 5.1).
- **Pilote** : ce qui commande réellement l'entité ; pour un thermostat virtuel (Versatile Thermostat), on compare à son état **demandé** (`requested_state`).

## 3. Périmètre v1

Inclus : tout ce qui suit. **Hors v1 (v2)** : import des programmes `scheduler-component` et des automatisations HA
à déclencheur horaire (§ 15).

## 4. Décisions validées (référence)

| # | Décision |
|---|---|
| D1 | Un seul dépôt : intégration (moteur) qui embarque sa carte. |
| D2 | Nom « Weekly Planner », interface fr + en (langue du compte HA). |
| D3 | Programmes créés/modifiés uniquement depuis la carte, stockés par l'intégration ; un `switch` par programme. |
| D4 | Une plage reçoit soit un **mode par type**, soit des **consignes directes par entité** (presets natifs compris). |
| D5 | Modes = bibliothèque **commune par type d'entité** ; valeur commune + exceptions par entité. |
| D6 | État par défaut au choix (par type ou par entité) : mode/consigne par défaut (proposé) **ou** retour à l'état d'avant la plage. |
| D7 | Pas de chevauchement dans un programme ; entre programmes, **priorité numérotée**, l'autre reprend la main ; conflits signalés. |
| D8 | 7 jours indépendants + copie (raccourcis Lun→Ven, Sam+Dim) ; pas de 5 min ; plages passant minuit ; heures solaires (aube, lever, coucher, crépuscule ± décalage) avec bornes « au plus tôt / au plus tard ». |
| D9 | Conditions simples par programme **et par plage** ; interrupteur global « Vacances / Absence ». Condition devenue fausse = fin de plage. |
| D10 | Réglage par programme « réappliquer en cours de plage » (oui par défaut) : redémarrage, activation, modification. |
| D11 | Dépôt séparé ; dev et tests sur une instance HA locale (Docker) ; prod seulement pour des versions finies, copiées par script tant que le dépôt est privé. |
| D12 | GitHub privé puis public ; licence MIT. Branche de travail `develop`, `main` propre ; PR après la v1. |
| D13 | Types v1 : climate, cover, light, switch, input_boolean, fan, water_heater, media_player, input_number, input_select, « Autre » (action/script). |
| D14 | Carte : vue semaine (7 barres + trait « maintenant ») ; éditeur du jour = liste + barre aux bords glissables. |
| D15 | Carte configurable : un programme fixé **ou** liste filtrée (type/zone) avec création. |
| D16 | Option globale de l'intégration « modification réservée aux administrateurs ». |
| D17 | Entité injoignable : au retour, état voulu recalculé (début si encore dans la plage, sinon défaut) ; journal de bord ; notification après X min (30 par défaut). |
| D18 | Evohome piloté directement : consignes en dérogation **permanente**. |
| D19 | Modes de départ fournis ; page « Modes » ; valeur « avancée » ; action « scène HA » ; lumière « Automatique ». |
| D20 | « Fini » = tests automatiques + test réel + vérification visuelle (§ 13). |
| D21 | Graphique 24 h dans le détail du jour : consigne prévue, consigne appliquée, mesure, zones dérogation / fenêtre / chauffe. |
| D22 | Deux visages : consultation très lisible ; configuration **en modales**. |
| D23 | Doc README en anglais + `README.fr.md` ; versions `0.x` puis `1.0.0` ; CHANGELOG ; releases GitHub. |

## 5. Comportement (règles du moteur)

### 5.1 Principe : état voulu recalculé, actions sur transitions

Le moteur ne « rejoue » pas des événements : à tout instant il calcule, pour chaque entité gérée, l'**état voulu**
et le **segment** en cours. Il agit **seulement aux transitions** de segment (début ou fin de plage, condition qui
bascule, programme activé/suspendu, Vacances, modification), puis laisse l'entité tranquille.

Résolution pour une entité *E* :
1. Programmes **actifs** (switch `on`, Vacances off) qui contiennent *E*.
2. Garder ceux dont les conditions de programme sont vraies et qui ont une plage en cours dont les conditions de plage sont vraies.
3. Gagnant = **priorité** la plus haute (plus petit numéro ; égalité → `cree_le` le plus ancien).
4. État voulu = action de la plage gagnante pour *E* ; sinon **état par défaut** (§ 5.4).
5. Prochaine transition = plus proche début/fin de plage parmi les programmes concernés ; heures solaires recalculées à minuit local et à chaque modification.

**Identité d'un segment** = (programme gagnant, plage, date d'occurrence) — ou (« défaut », programme) hors plage.
Elle ne dépend **pas** de la valeur de la consigne : deux plages contiguës au même mode, ou une plage dont le défaut
est identique, forment deux segments ; la fin de plage s'exécute donc toujours et efface un réglage manuel.
Modifier la valeur d'un mode ne change pas l'identité du segment (la dérogation en cours est conservée).

**Cible effective** d'une entité (ce que vérification, alerte et détection de dérogation utilisent), dans l'ordre :
dérogation volontaire en cours (§ 5.9) → dérogation externe (état constaté) → « non réappliqué » (§ 5.5 : pas de
cible tant que la prochaine transition n'a pas eu lieu) → état voulu du planning.

**Réveils** : une file unique de réveils typés (transition de plage, échéance de dérogation volontaire, fin
d'anti-rebond, essai espacé, délai d'alerte, fin de stabilisation, minuit solaire) ; un seul
`async_track_point_in_time` armé sur le plus proche ; à chaque réveil, recalcul complet (idempotent, rattrape un
réveil en retard). Toute action (appel, essai, attente) porte l'identité du segment qui l'a créée et **est
abandonnée dès que ce segment est périmé** (une seule tâche en vol par entité).

### 5.2 Début et fin de plage
- **Début** : mémoriser l'« état hors plage » de l'entité si elle n'est dans aucune plage (§ 5.4) — l'état réel,
  sauf si une dérogation volontaire est en cours : on mémorise alors la cible du planning — puis appliquer la consigne.
- **Fin** : appliquer l'état par défaut, **même si une dérogation a eu lieu pendant la plage**.
- Exemple de référence : volet, plage 20:00 → 08:00 « Fermé », défaut « Favori ». 20:00 il ferme ; 21:00 la
  télécommande l'ouvre à moitié → il reste à moitié ; 08:00 il passe en favori.
- **Plage ponctuelle** (début seul) : applique la consigne à l'heure dite ; pas de fin, pas de défaut. Elle est
  **sautée** si un programme plus prioritaire est dans une plage pour cette entité ou si une dérogation est en cours.

### 5.3 Dérogation manuelle
Une **dérogation** est déclarée quand, pendant un segment, l'état **stable** des attributs pilotés de *E* devient
**différent de l'état voulu** (hors tolérance du type, § 6) et que ce changement ne vient pas de Weekly Planner.

N'est **jamais** une dérogation :
- un état égal à l'état voulu (quel que soit le contexte) — couvre les rafraîchissements cloud (Evohome) ;
- une transition depuis ou vers `unavailable` / `unknown`, ni l'arrivée du premier état au démarrage ;
- un état intermédiaire : volet `opening`/`closing` (on compare après l'arrêt du mouvement) ; pendant la
  **fenêtre de grâce** après notre appel (réglable par entité ; par défaut 60 s, 6 min pour une intégration
  cloud à scrutation : Evohome) ;
- un changement de contexte Weekly Planner (`context.id` ou `parent_id` dans l'ensemble des contextes émis) ;
- un changement Adaptive Lighting (contexte `:al:`) sur une lumière dont la consigne est « Automatique », ou sur
  une lumière en consigne fixe pendant la grâce qui suit une réaffirmation du contrôle manuel (§ 6.1) ;
- pour un Versatile Thermostat : tout changement de `current_state` (fenêtre, sécurité, délestage) tant que
  `requested_state` reste égal à l'état voulu.

Effet : *E* est marquée « en dérogation » jusqu'à la **prochaine transition de son gagnant** (fin de la plage en
cours, ou début de la prochaine plage si on est hors plage) ; rien n'est réappliqué ; la carte l'affiche
(⚠️ + « Reprendre ») ; le marquage est **persisté** et l'emporte sur `reappliquer` au redémarrage.
Service `weekly_planner.resume` / bouton « Reprendre » : efface la dérogation et réapplique l'état voulu.

### 5.4 État par défaut
- Réglable par type dans le programme, avec exception par entité :
  - `mode` ou `consigne` (proposé) ;
  - `état d'avant` = l'**état hors plage** de l'entité : mémorisé une seule fois par entité, quand elle entre dans
    une plage alors qu'aucune plage d'aucun programme ne la pilotait (indépendant des programmes, ce qui évite de
    restaurer un état intermédiaire quand deux programmes se croisent) ;
  - `rien` : ne rien envoyer à la fin.
- Reprise de la main : si une plage de priorité plus haute se termine pendant qu'un programme plus bas est dans
  une plage, l'entité reçoit l'action de cette plage, pas le défaut.
- Quand aucune plage n'est en cours, le défaut appliqué est celui du **programme actif de plus haute priorité qui
  contient l'entité**. Un programme **désactivé libère ses entités** : son défaut ne s'applique qu'une fois, à sa
  propre désactivation (§ 5.5), jamais aux fins de plage des autres programmes.
- Vacances : au passage en Vacances, chaque entité reçoit une fois le défaut du programme le plus prioritaire qui la
  contient (programmes actifs avant les Vacances).
- Actions ponctuelles (« Autre », scène, script, bouton) : défaut `rien` imposé.

### 5.5 Redémarrage, activation, modification (D10)
- Réglage par programme `reappliquer` (oui par défaut).
- Au démarrage de HA (après une **stabilisation** de 30 s pendant laquelle les entités se chargent), à l'activation
  du programme, ou quand on modifie la plage en cours / ses entités : si `reappliquer = oui`, l'état voulu courant
  est appliqué aux entités **sans dérogation persistée** ; sinon on attend la prochaine transition.
- Les **actions ponctuelles ne sont jamais réappliquées** (pas de script relancé au redémarrage). Une plage
  ponctuelle à **consigne d'état** reste la cible jusqu'à la prochaine transition (le défaut n'est pas réappliqué
  par-dessus au redémarrage).
- Au démarrage, la première valeur connue d'une condition (ou sa dernière valeur persistée) **ne passe pas** par
  l'anti-rebond.
- Fin de plage manquée pendant l'arrêt : **toujours rattrapée** (la fin s'exécute toujours, cf. § 5.2).
- Désactivation d'un programme pendant une plage : l'état par défaut est appliqué (comme une fin de plage).

### 5.6 Conditions et Vacances (D9)
- Condition = `entité` (+ attribut facultatif) `=`, `≠`, `<`, `>` `valeur` ; toutes vraies (ET) ; niveaux programme et plage.
- Évaluées à chaque transition et à chaque changement des entités citées.
- Entité citée `unavailable`/`unknown` : la condition garde sa **dernière valeur connue** (inconnue au démarrage → on attend la stabilisation).
- **Anti-rebond** : une condition doit rester dans son nouvel état pendant une durée minimale (réglable, 2 min par
  défaut) avant de faire commencer ou finir une plage.
- Condition devenue fausse pendant une plage = fin de plage (défaut) ; redevenue vraie pendant la plage = début de plage (si `reappliquer`).
- `switch.weekly_planner_vacances` : suspend tous les programmes et applique le défaut (§ 5.4) ; à la désactivation, plages en cours appliquées si `reappliquer`.

### 5.7 Heures et calendrier
- Pas de 5 min ; plage minimale 5 min ; jours indexés **0 = lundi … 6 = dimanche** (côté serveur et carte).
- Fin `24:00` autorisée (= minuit du jour suivant) ; `00:00 → 00:00` est refusé (utiliser `00:00 → 24:00`).
- Une plage passant minuit appartient au jour de son début ; la validation de chevauchement porte sur la semaine
  entière, y compris dimanche → lundi.
- Heure solaire : `aube | lever | coucher | crépuscule` ± décalage (min), bornes `au plus tôt` / `au plus tard`
  facultatives ; calcul pour la date locale avec le **fuseau de HA** ; recalcul chaque jour à minuit.
- Si, un jour donné, une plage devient vide ou négative (ex. « coucher → 21:00 » en juin) ou plus courte que 5 min,
  elle est **ignorée ce jour-là** ; la carte la montre barrée avec la raison. Si elle chevauche une autre plage, la
  plus tardive est rognée (signalé).
- Changement d'heure : heures construites en heure locale puis normalisées par UTC. Heure inexistante → on avance
  (02:30 → 03:30) ; une plage entièrement dans l'heure sautée est ignorée ce jour-là ; heure ambiguë → première
  occurrence, une seule exécution. Barres et graphique en minutes locales, jour de 23 h / 25 h dessiné à l'échelle réelle.

### 5.8 Exécution des consignes
- Appels de service avec un `Context` dont l'identifiant reste un ULID valide (horodatage + aléa), mémorisé dans
  l'ensemble « contextes émis » (10 min) ; les appels d'un même segment partagent un `parent_id`.
- Ordre : d'abord le mode de fonctionnement (`hvac_mode`, `turn_on`), puis la valeur, après confirmation (≤ 30 s).
- Vérification de la **cible effective** sur l'état **demandé** du pilote (VT : `requested_state`) après la fenêtre de grâce ; si différent :
  nouvel essai, puis essais espacés (1, 2, 5, 10, 15 min…) **tant que le segment est le même**.
- Entité `unavailable`/`unknown` : action en attente ; au retour de l'entité, état voulu **recalculé** et appliqué.
- Notification persistante si l'état voulu n'est pas atteint après X min (option, 30 par défaut) ; retirée quand il l'est.
- Journal de bord : une entrée par **décision** (début, fin, dérogation, échec définitif, reprise), pas par essai ;
  traductions côté carte quand c'est possible.
- Nos contextes ne portent **jamais** de `user_id` (même pour « Déroger… »).
- Versatile Thermostat verrouillé : lire `lock_manager` ; si le verrou bloque les automatisations
  (`lock_automations`), l'action échoue tout de suite avec une alerte claire (pas d'essais) ; un verrou limité aux
  utilisateurs n'empêche rien.

### 5.9 Dérogation volontaire depuis la carte (« Déroger… »)
- Modale : entité(s) du programme (consignes d'état seulement, pas d'actions ponctuelles), consigne (ou mode),
  durée : **jusqu'à la fin de la plage** (= prochaine transition du gagnant ; libellé « jusqu'au prochain
  changement » hors plage) · **pendant X h/min** · **jusqu'à HH:MM** (dans le futur, au plus 7 jours ; une heure
  inexistante au changement d'heure est avancée comme en § 5.7).
- Le moteur applique la consigne, marque l'entité en dérogation volontaire avec une échéance (persistée) ; à
  l'échéance, il applique la cible du planning du moment (plage en cours ou défaut), **même si `reappliquer = non`** ;
  échéance tombée pendant un arrêt de HA : appliquée au démarrage. « Reprendre » l'annule avant terme.
- Les transitions de plage qui tombent pendant la dérogation volontaire ne sont pas appliquées à cette entité.
- Un réglage à la main pendant une dérogation volontaire la **remplace** : elle devient une dérogation externe
  (jusqu'à la prochaine transition du gagnant, § 5.3) et son échéance est oubliée.
- Vacances, désactivation du programme ou changement de profil **annulent** la dérogation volontaire : l'entité reçoit
  aussitôt le nouvel état (défaut ou profil).
- Droits : comme l'édition (§ 9) — les consignes sensibles restent réservées aux administrateurs.
- Service équivalent : `weekly_planner.override` (entity_id, consigne, `duree` ou `jusqu_a`).

### 5.10 Profils (semaines types)
- Un programme a un ou plusieurs **profils** (« Hiver », « Été », « Télétravail »…), chacun avec ses 7 jours de plages ;
  entités, défauts, conditions et priorité sont communs au programme.
- Entité `select.weekly_planner_<programme>_profil` : change le profil actif (carte, automatisation, service).
  Options = noms des profils (uniques dans le programme ; renommer avertit que les automatisations qui utilisent
  l'ancien nom sont à mettre à jour).
- Au moins un profil ; le profil actif ne peut pas être supprimé.
- Le profil actif est un **état d'exécution** (stockage runtime), hors `revision` : le changer n'invalide pas une
  édition ouverte.
- Changer de profil = modification (§ 5.5) : si `reappliquer`, l'état voulu du nouveau profil est appliqué aux
  entités sans dérogation ; sinon on attend la prochaine transition.
- Les profils inactifs comptent pour « utilisé par… », l'interdiction de supprimer un mode et la validation ;
  `preview` et les conflits portent sur le profil actif (option « tous les profils » dans la carte).
- La carte : sélecteur de profil dans l'en-tête du programme ; copie d'un profil, d'un jour vers un autre profil.

## 6. Types d'entités et consignes (D13, D19)

| Type | Consignes proposées | Tolérance (dérogation / vérification) |
|---|---|---|
| `climate` | température ; preset (`preset_modes`) ; `hvac_mode` ; `off` | consigne ±0,2 °C, preset, hvac_mode |
| `cover` | ouvrir ; fermer ; position % ; inclinaison % ; « favori » = position % réglable | position ±3 % après arrêt |
| `light` | allumer/éteindre ; luminosité % ; couleur / blanc ; effet (`effect_list`) ; **Automatique** (§ 6.1) | état, luminosité ±10 %, couleur |
| `switch`, `input_boolean` | allumer / éteindre | état |
| `fan` | allumer/éteindre ; vitesse % ; preset | état, pourcentage |
| `water_heater` | mode d'opération ; température | mode, consigne |
| `media_player` | allumer/éteindre ; volume ; source ; lire un média | état |
| `input_number` / `input_select` | valeur / option | valeur |
| Autre / tout type | **action HA** ; **scène HA** ; **script** (actions ponctuelles) | aucune |
| Valeur avancée | état + attributs saisis dans un éditeur de données (YAML/formulaire) | attributs choisis |

Les choix sont **lus sur l'entité** (`preset_modes`, `hvac_modes`, `effect_list`, `supported_features`…) et
**validés à l'enregistrement** (preset inexistant refusé).

### 6.1 Lumière « Automatique »
Au choix dans la consigne : activer un **switch Adaptive Lighting** (il couvre toute sa zone : avertissement si
d'autres lumières en dépendent), ou lancer un **script / une automatisation** (ex. animation de couleurs).
« Automatique » allume la lumière si elle est éteinte. Fin de plage : le défaut s'applique ; le switch Adaptive
Lighting retrouve l'état qu'il avait au début (état persisté, restauré aussi au déchargement / à la désinstallation).

Lumière couverte par un switch Adaptive Lighting et **consigne fixe** (plage ou défaut) — règle suivie **par segment** :
- au début du segment : `adaptive_lighting.set_manual_control` (`lights: [E]`, `manual_control: true`), puis la consigne ;
- AL oublie ce marquage (redémarrage, rechargement d'AL, bascule d'un switch AL, extinction de la lumière,
  `autoreset`) : Weekly Planner le **réaffirme** au démarrage, à chaque changement d'état d'un switch AL concerné et
  après chaque allumage de *E*, indépendamment de `reappliquer` et des dérogations ;
- `manual_control: false` seulement si le segment suivant est « Automatique » ou si plus rien ne pilote *E* ; sinon
  la consigne suivante est envoyée directement (pas de double changement).
Pas de « repli » qui couperait le switch de toute une zone. Une lumière hors de toute zone AL, ou AL non installé :
aucune action AL.

### 6.2 Versatile Thermostat (pilote)
- Presets `eco`, `comfort`, `boost`, `frost` (+ `none`) ; Weekly Planner pilote l'entité VT, jamais ses sous-jacents.
- À l'ajout dans un programme, la carte **vérifie et avertit** : `manual_override_duration_min` ≠ 0 (retour automatique
  du VT), `follow_underlying_temp_change` actif, verrou actif, sous-jacent présent dans un programme.
- Une consigne en température (pas de preset) fait passer le VT en preset `none` : normal, pas une dérogation.

## 7. Modes (D5, D19)

- Bibliothèque par type ; chaque mode : `nom`, `couleur`, `icône`, `valeur commune` (consigne d'état), `exceptions` (`{entity_id: consigne}`).
- Modes de départ : thermostat Confort 🟧 / Éco 🟦 / Nuit 🟪 / Boost 🟥 / Hors-gel ⬜ ; volet Ouvert / Fermé / Favori ;
  lumière Allumée / Éteinte ; prise Allumé / Éteint. Thermostat ayant le preset correspondant → valeur proposée = preset ; sinon température.
- Modifier un mode met à jour tous les programmes qui l'utilisent (« utilisé par N programmes ») ; suppression
  interdite tant qu'il est utilisé.
- Couleur d'une plage : celle du mode du **type principal** du programme (premier type de la liste, réglable) ;
  les autres types apparaissent en pastilles dans la liste ; plage en consignes directes = couleur choisie ou neutre hachurée.

## 8. Données et stockage

`.storage/weekly_planner` (`Store`, `version` + `minor_version`, `atomic_writes`, écriture différée 1 s, migrations testées).

```text
racine
├─ reglages        : admin_only, delai_notification_min, reappliquer_defaut, anti_rebond_min
├─ vacances        : bool
├─ modes[]         : id, type, nom, couleur, icone, valeur, exceptions{entity_id: consigne}
└─ programmes[]    : id, revision, cree_le, nom, icone, priorite, actif, reappliquer, type_principal,
                     entites[]   : entity_id, type, defaut{genre: mode|consigne|etat_avant|rien, valeur}, grace_s?
                     conditions[]: entity_id, attribut?, op, valeur
                     profil_actif, profils[] : id, nom,
                       jours[0..6] : plages[] : id, debut, fin?, conditions[],
                                                actions{ par_type{type: mode_id} | par_entite{entity_id: consigne} }
runtime (`weekly_planner.runtime`) : par entité → segment courant, dérogation (origine, échéance), état hors plage, action en attente
journal (`weekly_planner.journal`) : segments réellement décidés (début, fin, consigne, raison), 14 jours glissants
(runtime et journal sont versionnés et migrés comme le stockage principal ; runtime contient aussi le profil actif
de chaque programme et l'état des switchs AL modifiés)
```
- `debut`/`fin` : `{"heure": "HH:MM"}` (fin jusqu'à `24:00`) ou `{"soleil": "sunset", "decalage": 15, "au_plus_tot": "18:00", "au_plus_tard": "21:00"}`.
- `consigne` : `{"genre": "preset|temperature|hvac_mode|etat|position|inclinaison|luminosite|couleur|effet|auto|scene|script|action|avancee", ...}`.
- **Concurrence** : chaque écriture fournit la `revision` lue ; si elle a changé → refus « modifié ailleurs, recharger ».
- **Robustesse** : si le fichier existait mais se charge vide/corrompu → l'intégration démarre en lecture seule et
  crée une alerte (Réparations) au lieu de repartir de zéro ; sauvegarde du fichier avant chaque migration ;
  un retour à une version antérieure est documenté (restaurer la sauvegarde).
- **Renommage / suppression d'entité** : écoute de `entity_registry_updated` → `entity_id` mis à jour partout ;
  entité supprimée → programme marqué incomplet + alerte Réparations.

## 9. Entités, services, API, droits

**Entités** : `switch.weekly_planner_<programme>` (attributs `mode_actuel`, `plage_actuelle`, `prochain_changement`,
`entites_en_derogation`, `conflits`, `alertes`) ; `switch.weekly_planner_vacances` ; appareil « Weekly Planner »
(`integration_type: service`).

**Services** (`weekly_planner.*`) :
- `resume` (entité ou programme) : efface dérogations externes et volontaires, applique la cible du planning ;
- `override` (§ 5.9) ;
- `apply_now` (programme) : applique l'état voulu à ses entités **sans dérogation**, quel que soit `reappliquer` ;
- `skip_next` (programme) : la prochaine transition du programme n'est pas appliquée (persisté, une seule fois,
  annulable ; visible dans la carte) ;
- `reload` (admin).
Avec `admin_only`, `resume` reste ouvert à tous ; `override` suit la question § 16.
Entité `select.weekly_planner_<programme>_profil` (§ 5.10).

**API websocket** : `get` · `subscribe` · `program/create|update|delete|duplicate` · `mode/create|update|delete` ·
`preview` (timeline d'un jour à venir : heures solaires résolues, plages ignorées, conflits) · `journal` (passé réel,
pour le graphique) · `check` (avertissements VT, pilotes concurrents).

**Droits**
- `admin_only` (option globale) : si actif, seules la lecture, les switchs et `resume` restent ouverts aux non-admins.
- **Toujours réservé aux admins**, quel que soit `admin_only` : consignes « action HA », « script », « valeur
  avancée », et toute consigne visant un domaine sensible (`homeassistant`, `hassio`, `alarm_control_panel`, `lock`).

**Conflits et pilotes concurrents** (affichés dans la carte, jamais bloquants) : deux programmes actifs qui visent la
même entité au même moment ; entité aussi visée par un `switch.schedule_*` actif, une automatisation qui la cible
(directement, par zone ou par label) ; VT et son sous-jacent tous deux programmés.

**Options** : `admin_only` ; délai d'alerte ; `reappliquer` par défaut ; anti-rebond des conditions. Instance unique.
**Désinstallation** (`async_remove_entry`) : retrait de la ressource Lovelace, des entités et du stockage.

## 10. Carte `weekly-planner-card`

### 10.1 Configuration de la carte (éditeur visuel)
`program: <id>` **ou** `filter: {types: [climate], area: bureau}` ; `title` ; `show_week` ; `show_chart`.

### 10.2 Consultation (par défaut)
- En-tête : titre, pastille Vacances si active, alertes.
- Une ligne par programme : nom, interrupteur, profil actif, **mode actuel** + « jusqu'à 17:00 → Confort », ⚠️ dérogation
  (« Reprendre », échéance) ou conflit ; bouton « Déroger… » (modale § 5.9).
- Barre du jour avec trait « maintenant » (heure du **serveur**), semaine repliable en barres fines ; légende ;
  plage à heure solaire affichée à l'heure calculée du jour avec ☀️ ; plage ignorée ce jour-là barrée.
- Toucher une barre → modale **Jour** en lecture (graphique + liste) avec bouton « Modifier ». ✏️ → configuration.

### 10.3 Configuration (modales, plein écran sur téléphone)
- **Programme** : nom, icône, entités, priorité, conditions, défaut par type/entité, `reappliquer`, type principal, dupliquer/supprimer, avertissements (`check`).
- **Jour** : barre 24 h glissable (poignées ≥ 44 px, **loupe/zoom** pendant le glisser, `touch-action` maîtrisé,
  aimantation 5 min) + boutons ±5 min sur chaque bord (clavier aussi) ; liste des plages ; « Copier vers… ».
- **Plage** : début/fin (heure ou soleil + décalage + bornes) ou ponctuelle, mode par type **ou** consignes par entité, conditions.
- **Modes** : un onglet par type ; nom, couleur, icône, valeur, exceptions ; « utilisé par… ».
- Validation en direct ; annuler/enregistrer ; conflit de `revision` géré.
- Composants : sélecteurs HA publics (`ha-selector` entité/zone/icône) si disponibles, sinon **repli maison** ;
  modales maison (pas de dépendance à `ha-dialog`) ; « valeur avancée » = éditeur de données.

### 10.4 Graphique (D21)
Modale Jour : courbe 24 h par entité, SVG maison.
- Consigne **prévue** : à venir via `preview` ; passé via `journal` (ce qui a réellement été décidé).
- Consigne **appliquée** et **mesure** : `history/history_during_period` (`significant_changes_only: false`).
- Zones : dérogation (journal), fenêtre ouverte (capteur binaire fenêtre du VT s'il existe), chauffe (`hvac_action` si présent).
- Toucher = valeurs ; ◀ ▶ jours précédents (14 jours). Volets/lumières : position/luminosité prévue vs réelle.

### 10.5 Exigences transverses
420 px et ≥ 1400 px ; thèmes clair/sombre ; clavier (tab, flèches, ±5 min) ; fr/en ; zéro erreur console ;
premier rendu < 300 ms pour 20 programmes (mesuré par script Playwright).

### 10.6 Livraison du JS
Lit + TypeScript, bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` (commité). Servi par
`async_register_static_paths` ; **ressource Lovelace** (mode storage) avec `?v=<hash>` ; `add_extra_js_url` seulement
en mode YAML ; garde `customElements.get()` avant `define`. **Prototype de faisabilité** sur HA 2026.10 avant le reste.

## 11. Compatibilité

- **Versatile Thermostat** : § 6.2. Fenêtre ouverte : VT gère, pas de dérogation, la consigne de fin est envoyée au VT.
- **Evohome piloté directement** : option « dérogation permanente » (preset `permanent` puis consigne), proposée si
  l'entité a ce preset ; fenêtre de grâce 6 min. Quand l'entité quitte Weekly Planner (retrait, suppression du
  programme, désinstallation), elle est remise en suivi de programme Evohome (preset `none`). Evohome **sous un VT** : le programme interne Evohome de la zone
  doit être vide ou plat, sinon il reprend la main au point de bascule suivant (documenté, vérifié par `check`).
- **Adaptive Lighting** : § 6.1 et § 5.3.
- **Pilotes concurrents** : § 9.

## 12. Qualité, outillage, publication

- Arborescence : `custom_components/weekly_planner/` (moteur, store, websocket, switch, services, traductions,
  `brand/icon.png`, `frontend/`), `frontend/` (sources TS), `tests/`, `dev/`, `scripts/`, `docs/`.
- Dev : `dev/docker-compose.yml` (`ghcr.io/home-assistant/home-assistant:2026.10.x`), entités `demo` + `template` par
  type (dont un thermostat « lent » qui confirme après 2 min et un volet qui bouge 90 s), montage de l'intégration.
- Python des tests aligné sur HA (3.14, via `uv`) ; `pytest-homeassistant-custom-component` aligné 2026.10 ; temps simulé.
- Versatile Thermostat et Adaptive Lighting : simulés dans pytest par des entités et services factices reproduisant
  les attributs utilisés (`requested_state`, `lock_manager`, `set_manual_control`…) ; installés à version figée
  (VT 10.6.1, AL 1.32.0) dans l'instance Docker ; versions minimales indiquées dans le README.
- `manifest.json` : `after_dependencies` = `frontend`, `lovelace`, `logbook`, `repairs`, `adaptive_lighting`,
  `versatile_thermostat` (à confirmer par hassfest au prototype).
- `scripts/deploy_prod.sh` : copie de l'intégration vers `/config/custom_components/weekly_planner` de la prod
  (sauvegarde HA avant, vérification après) tant que le dépôt est privé.
- CI : `hacs/action`, `hassfest`, pytest, build + lint de la carte, test Playwright de la carte sur l'instance Docker.
- `hacs.json`, `manifest.json` (`domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`,
  `config_flow`, `iot_class: calculated`, `integration_type: service`, `dependencies: [http, frontend, websocket_api]`).
- Docs : README (en) + `README.fr.md`, captures, CHANGELOG ; releases GitHub ; `0.x` puis `1.0.0`.

## 13. Définition de « fini » (v1)

1. **Tests automatiques verts** : scénarios S1–S44 (§ 14.9), chacun relié à une tâche.
2. **Test réel en prod** (copie par script) ≥ 3 jours sur le banc d'essai, procédure écrite (`docs/test-reel.md`) :
   début, fin, dérogation à la main, « Déroger… » avec échéance, changement de profil, redémarrage de HA (avec
   accord), entité rendue injoignable (désactivation temporaire de l'entité), entrées du journal de bord vérifiées
   une à une.
3. **Vérification visuelle** selon `docs/controle-visuel.md` (420 px et ≥ 1400 px, clair/sombre, chaque modale, glisser,
   copie, modes, graphique, clavier) ; zéro erreur console ; temps de rendu mesuré.
4. CI verte ; puis, après passage en public, installation propre via HACS (dépôt personnalisé) et désinstallation propre.

## 14. Tâches

### 14.1 Socle
- [ ] Squelette du dépôt (arborescence § 12, `hacs.json`, `manifest.json`, `brand/`, README minimal)
- [ ] Environnement Docker + entités de démonstration (dont thermostat lent, volet lent)
- [ ] Python 3.14 (`uv`) + dépendances de test
- [ ] CI : hacs/action, hassfest, pytest, build carte
- [ ] **Prototype** : carte embarquée chargée comme ressource sur HA 2026.10 (S33)

### 14.2 Moteur
- [ ] Modèle + `Store` versionné + robustesse + migration (S20, S28)
- [ ] Plages d'un jour : fixes, soleil + bornes, minuit, `24:00`, DST, plages ignorées (S2, S3, S4, S26, S27)
- [ ] Résolution par entité : priorités, conditions, Vacances, défauts, état hors plage (S9, S10, S11, S12, S16, S24)
- [ ] Minuteur unique + recalcul + segments + abandon des actions périmées (S1, S21)
- [ ] Exécution : ordre, confirmation, grâce, essais espacés, entités injoignables (S13, S14, S22)
- [ ] Dérogation : règles § 5.3, persistance, `resume` (S5, S6, S15, S23, S25)
- [ ] Redémarrage / activation / modification, stabilisation, rattrapage des fins (S7, S8, S29)
- [ ] Conditions : dernière valeur connue, anti-rebond (S30)
- [ ] Journal de bord, journal des segments, notifications (S31)
- [ ] Renommage / suppression d'entités, alertes Réparations (S32)
- [ ] Dérogation volontaire avec échéance + service `override` (S35)
- [ ] Profils + `select` du profil actif (S36)
- [ ] Adaptive Lighting : contrôle manuel pendant une consigne fixe, repli switch (S37)
- [ ] Activation / redémarrage hors plage : défaut appliqué (S38)

### 14.3 Intégration HA
- [ ] Config flow (instance unique) + options flow
- [ ] Switchs (programmes, Vacances) + appareil
- [ ] Services + API websocket + droits (S19, S34)
- [ ] Détection des pilotes concurrents et contrôles VT (`check`)
- [ ] Traductions fr / en
- [ ] Désinstallation propre (S33)

### 14.4 Carte
- [ ] Outillage Lit/TS + bundle + ressource + cache-busting
- [ ] Éditeur visuel de la carte
- [ ] Vue consultation
- [ ] Modale Programme
- [ ] Modale Jour (glisser + loupe + ±5 min, liste, copie)
- [ ] Modale Plage
- [ ] Modes
- [ ] Graphique 24 h
- [ ] Responsive, thèmes, clavier, fr/en, mesure de rendu

### 14.5 Compatibilité
- [ ] Versatile Thermostat (requested_state, verrou, avertissements, fenêtre)
- [ ] Evohome (dérogation permanente, grâce 6 min)
- [ ] Adaptive Lighting (Automatique, contextes, switch de zone)

### 14.6 Documentation et publication
- [ ] README en / fr, captures, CHANGELOG, `docs/test-reel.md`, `docs/controle-visuel.md`
- [ ] `scripts/deploy_prod.sh`
- [ ] Release `0.1.0` (prod par copie), puis `1.0.0` sur `main`
- [ ] Dépôt public, installation HACS vérifiée, demande d'inclusion HACS par défaut

### 14.7 Validation réelle (banc d'essai)
- [ ] Déploiement en prod par script
- [ ] Procédure `docs/test-reel.md` déroulée ≥ 3 jours

### 14.8 Revue
- [x] Relecture « avocat du diable » n° 1 (35 points) intégrée dans cette version
- [x] Questions § 16 tranchées
- [x] Relecture n° 2 (24 points) intégrée — questions produit en § 16 bis
- [ ] Questions § 16 bis tranchées

### 14.9 Scénarios de test (automatiques)
- [ ] S1 plage simple : début applique, fin applique le défaut
- [ ] S2 plage passant minuit ; dimanche → lundi
- [ ] S3 heure solaire + décalage + bornes (été / hiver)
- [ ] S4 DST : 02:30 inexistante, 02:30 ambiguë, plage dans l'heure sautée
- [ ] S5 dérogation pendant la plage : rien réappliqué, fin appliquée
- [ ] S6 dérogation puis redémarrage : dérogation conservée
- [ ] S7 redémarrage en cours de plage, `reappliquer` oui / non
- [ ] S8 fin de plage manquée pendant l'arrêt → rattrapée
- [ ] S9 deux programmes, priorités, reprise de la main
- [ ] S10 condition de programme qui bascule en pleine plage
- [ ] S11 condition de plage
- [ ] S12 Vacances on / off
- [ ] S13 entité injoignable puis revenue (dans et hors plage) ; notification après délai, retirée ensuite
- [ ] S14 thermostat cloud lent (confirmation à 2 min, rafraîchissement 5 min) : pas de fausse dérogation
- [ ] S15 Adaptive Lighting : pas de fausse dérogation
- [ ] S16 défaut « état d'avant » avec deux programmes qui se croisent
- [ ] S17 modification d'un mode utilisé par plusieurs programmes
- [ ] S18 suppression d'un programme en pleine plage
- [ ] S19 `admin_only` ; actions sensibles refusées aux non-admins
- [ ] S20 migration du stockage n → n+1 ; sauvegarde
- [ ] S21 plage courte + action lente : l'essai périmé n'est pas renvoyé
- [ ] S22 VT verrouillé : échec immédiat et alerte
- [ ] S23 VT fenêtre ouverte : pas de dérogation, vérification sur `requested_state`
- [ ] S24 défaut « rien » et plage ponctuelle
- [ ] S25 volet lent : pas de fausse dérogation pendant le mouvement
- [ ] S26 plage solaire vide un jour donné (ignorée, signalée)
- [ ] S27 fin `24:00`, refus de `00:00 → 00:00`, chevauchement entre jours
- [ ] S28 stockage corrompu : lecture seule + alerte
- [ ] S29 actions ponctuelles jamais réappliquées
- [ ] S30 condition sur entité indisponible ; anti-rebond
- [ ] S31 journal des segments utilisé pour le passé du graphique
- [ ] S32 renommage et suppression d'entité
- [ ] S33 ressource Lovelace : création, mise à jour de version, retrait à la désinstallation
- [ ] S34 `revision` : écriture concurrente refusée
- [ ] S35 « Déroger… » : durée, jusqu'à HH:MM, fin de plage, « Reprendre » avant terme, redémarrage pendant
- [ ] S36 changement de profil en pleine plage
- [ ] S37 lumière sous Adaptive Lighting avec consigne fixe : pas de réajustement, rendue à AL à la fin
- [ ] S38 activation / redémarrage hors plage : défaut appliqué (et pas appliqué si `reappliquer = non`)
- [ ] S39 plages contiguës au même mode / défaut identique : la fin efface un réglage manuel
- [ ] S40 cible effective : « Déroger… » ne déclenche ni essais ni alerte ; `reappliquer = non` non plus
- [ ] S41 AL oublie le contrôle manuel (bascule du switch de zone, redémarrage) : réaffirmé, pas de fausse dérogation
- [ ] S42 `skip_next` et `apply_now`
- [ ] S43 retrait d'une entité Evohome : remise en suivi de programme
- [ ] S44 échéance de dérogation volontaire tombée pendant un arrêt de HA

## 15. v2 (hors périmètre)
- Import des programmes `scheduler-component` (`.storage/scheduler.storage`, version 3) — nécessite plages ponctuelles et défaut « rien » (présents en v1).
- Import des automatisations HA à déclencheur horaire / solaire (conversion assistée ; l'automatisation d'origine est désactivée, pas supprimée).
- Droits par rôle / utilisateur / profil.

## 16. Questions tranchées (relecture n° 1)
- Q-B Programme activé / HA redémarré **hors plage** : l'état par défaut est appliqué tout de suite (si `reappliquer`).
- Q-C Dérogation depuis la carte : bouton « Déroger… » (§ 5.9). Dérogation externe : jusqu'à la fin de la plage.
- Q-D Profils par programme (§ 5.10).
- Q-E « Automatique » = switch Adaptive Lighting **ou** script / automatisation (§ 6.1).
- Q-F `admin_only` **désactivé** par défaut ; droits par rôle / utilisateur / profil en v2.
- Q-G Lumière sous Adaptive Lighting + consigne fixe : `adaptive_lighting.set_manual_control` sur la lumière pendant
  la plage, réaffirmé quand AL l'oublie, rendue à AL à la fin (§ 6.1). Le repli « couper le switch de zone » est
  abandonné (relecture n° 2 : il remet à zéro toute la zone).
- Q-H Toucher une barre de jour : modale de lecture (graphique + liste) puis « Modifier ».

## 16 bis. Questions produit (relecture n° 2)
- Q-I ✅ Vacances, désactivation ou changement de profil annulent la dérogation volontaire.
- Q-J ✅ Un programme désactivé libère ses entités (son défaut ne vaut que pour sa propre désactivation) ; Vacances : défaut du plus prioritaire, une fois.
- Q-K ✅ Le réglage à la main l'emporte et remplace la dérogation volontaire (devient externe, échéance oubliée).
- Q-L ✅ Sautée (priorité et dérogation l'emportent).
- Q-M Avec `admin_only`, un non-admin peut-il utiliser « Déroger… » et changer de profil ?
