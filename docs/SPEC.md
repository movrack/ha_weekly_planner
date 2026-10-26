# Weekly Planner — spécification v1

> Statut : **0.6 — un seul modèle pour tous les appareils** (voir § 5 et § 6 ; les anciennes règles retirées en 0.6.0 sont marquées « retiré en 0.6.0 »).
> Dépôt : `ha_Weekly_planner` · domaine HA : `weekly_planner` · cible : Home Assistant ≥ 2026.10.
> Les cases `[ ]` / `[x]` suivent l'avancement. Critère de fin de la v1 : **tout fonctionne** (§ 13).

---

## 1. But

Un planificateur hebdomadaire **générique et agréable** pour Home Assistant, installable par HACS :
programmer, jour par jour, des **horaires** qui appliquent **une action** (un service HA ou une scène) à une
entité, puis une **action par défaut** à la fin.

| Point faible ailleurs | Réponse de Weekly Planner |
|---|---|
| La fin d'un créneau n'exécute rien | Chaque horaire avec fin déclenche, à sa fin, l'**action par défaut** de l'appareil (« le reste du temps ») |
| Tout est rejoué après une coupure de courant | État voulu **recalculé** ; réglage « refaire l'action en cours au redémarrage » |
| Un type d'appareil = un vocabulaire à apprendre | **Un seul fonctionnement** : toute entité, mêmes écrans, actions = services HA |
| Une planification = un appareil + une action | Un programme = plusieurs entités, chacune son action |
| Pas de vue semaine lisible | Vue semaine en barres + liste + graphique (historique HA et actions prévues) |
| Deux dépôts HACS (composant + carte) | Un seul dépôt : l'intégration embarque sa carte |

*Retiré en 0.6.0 : « dérogation détectée, respectée jusqu'à la fin de la plage » et « modes partagés par type ».*

## 2. Glossaire

- **Programme** : ensemble nommé d'entités + une semaine d'horaires + réglages. Un interrupteur par programme.
- **Horaire** (slot) : début (heure ou soleil, avec décalage), fin facultative, jours, **une étiquette**.
- **Étiquette** (label, comme chez Netatmo) : `{id, name, color, action}`, **globale** (partagée par tous les programmes),
  stockée par l'intégration. Tout passe par une étiquette : un horaire en référence une (`slot.label`), le « reste du
  temps » aussi (`entity.default_label`). Exemple : « Confort » = 19 °C ; les horaires sont « Confort 10:00–12:00 ».
- **Action** (celle d'une étiquette) : un service HA, `{"kind":"service","service":"climate.set_temperature","data":{"temperature":18}}`,
  ou une scène, `{"kind":"scene","scene":"scene.x"}`. Les services proposés viennent du sélecteur générique de la carte
  (services dont la cible accepte l'entité).
- **Valeur propre à un appareil** (`entity.label_overrides: {label_id: action}`) : « Confort » = 19 °C partout, 22 °C dans
  la salle de bain.
- **Étiquette compatible** : proposée pour une entité quand la cible de son service accepte l'entité, ou si c'est une
  scène qui la contient. Une entité incompatible avec l'étiquette d'un horaire est **ignorée** pour cet horaire
  (avertissement dans les contrôles).
- **Action par défaut** (« Le reste du temps » / « Otherwise ») : étiquette facultative de chaque entité d'un programme
  (`default_label`, `null` = rien), appliquée quand un horaire **avec fin** se termine.
- **Action ponctuelle** : un horaire **sans fin** ; l'action est lancée une fois, à son début, et n'est jamais refaite.
- **Segment** : occurrence d'un horaire gagnant pour une entité (ou intervalle « le reste du temps »), identifiée par
  (programme, horaire, date) — voir § 5.1.
- ~~Mode, consigne d'état, dérogation, cible effective, pilote~~ (retiré en 0.6.0).

## 3. Périmètre v1

Inclus : tout ce qui suit. **Hors v1 (v2)** : import des programmes `scheduler-component` et des automatisations HA
à déclencheur horaire (§ 15).

## 4. Décisions validées (référence)

| # | Décision |
|---|---|
| D1 | Un seul dépôt : intégration (moteur) qui embarque sa carte. |
| D2 | Nom « Weekly Planner », interface fr + en (langue du compte HA). |
| D3 | Programmes créés/modifiés uniquement depuis la carte, stockés par l'intégration ; un `switch` par programme. |
| D4 | Une plage reçoit soit un **mode par type**, soit des **consignes directes par entité** (presets natifs compris). — **(retiré en 0.6.0 : plus de mode par type ni de consignes par type)** |
| D5 | Modes = bibliothèque **commune par type d'entité** ; valeur commune + exceptions par entité. — **(retiré en 0.6.0 : plus de modes communs)** |
| D6 | État par défaut au choix (par type ou par entité) : mode/consigne par défaut (proposé) **ou** retour à l'état d'avant la plage. — **(remplacé en 0.6.0 : action par défaut facultative, plus d'« état d'avant »)** |
| D7 | Pas de chevauchement dans un programme ; entre programmes, **priorité numérotée**, l'autre reprend la main ; conflits signalés. |
| D8 | 7 jours indépendants + copie (raccourcis Lun→Ven, Sam+Dim) ; pas de 5 min ; plages passant minuit ; heures solaires (aube, lever, coucher, crépuscule ± décalage) avec bornes « au plus tôt / au plus tard ». |
| D9 | Conditions simples par programme **et par plage** ; interrupteur global « Vacances / Absence ». Condition devenue fausse = fin de plage. — **(« dérogation » retirée en 0.6.0 ; conditions et Vacances conservées)** |
| D10 | Réglage par programme « réappliquer en cours de plage » (oui par défaut) : redémarrage, activation, modification. |
| D11 | Dépôt séparé ; dev et tests sur une instance HA locale (Docker) ; prod seulement pour des versions finies, copiées par script tant que le dépôt est privé. |
| D12 | GitHub privé puis public ; licence MIT. Branche de travail `develop`, `main` propre ; PR après la v1. |
| D13 | Types v1 : climate, cover, light, switch, input_boolean, fan, water_heater, media_player, input_number, input_select, « Autre » (action/script). — **(remplacé en 0.6.0 : toute entité, actions = services HA)** |
| D14 | Carte : vue semaine (7 barres + trait « maintenant ») ; éditeur du jour = liste + barre aux bords glissables. |
| D15 | Carte configurable : un programme fixé **ou** liste filtrée (type/zone) avec création. |
| D16 | Option globale de l'intégration « modification réservée aux administrateurs ». |
| D17 | Entité injoignable : au retour, état voulu recalculé (début si encore dans la plage, sinon défaut) ; journal de bord ; notification après X min (30 par défaut). |
| D18 | Evohome piloté directement : consignes en dérogation **permanente**. — **(retiré en 0.6.0 : plus de traitement Evohome)** |
| D19 | Modes de départ fournis ; page « Modes » ; valeur « avancée » ; action « scène HA » ; lumière « Automatique ». — **(retiré en 0.6.0 : plus de modes ni d'« Automatique » / Adaptive Lighting)** |
| D20 | « Fini » = tests automatiques + test réel + vérification visuelle (§ 13). |
| D21 | Graphique 24 h dans le détail du jour : consigne prévue, consigne appliquée, mesure, zones dérogation / fenêtre / chauffe. — **(remplacé en 0.6.0 : voir § 10.4)** |
| D22 | Deux visages : consultation très lisible ; configuration **en modales**. |
| D23 | Doc README en anglais + `README.fr.md` ; versions `0.x` puis `1.0.0` ; CHANGELOG ; releases GitHub. |

| D24 | **0.6.0** : un seul modèle pour tous les appareils (Versatile Thermostat compris) : horaire = début, fin facultative, jours, une action ; action par défaut par entité ; aucune détection de réglage manuel ; Weekly Planner ne connaît ni Adaptive Lighting ni Evohome. |
| D25 | Graphique pour **tous** les appareils : historique HA (courbe ou bande d'états) + actions prévues + « maintenant » ; un toucher ouvre l'historique HA ; les **changements manuels** apparaissent en rouge, **affichage seulement** (§ 10.4). |

## 5. Comportement (règles du moteur)

### 5.1 Principe : état voulu recalculé, actions sur transitions

Le moteur ne « rejoue » pas des événements : à tout instant il calcule, pour chaque entité gérée, l'**action voulue**
et le **segment** en cours. Il agit **seulement aux transitions** de segment (début ou fin d'horaire, condition qui
bascule, programme activé/suspendu, Vacances, modification), puis laisse l'entité tranquille. **Il ne surveille pas
ce que l'entité devient** : aucun réglage fait à la main n'est détecté, compté ni corrigé.

Résolution pour une entité *E* :
1. Programmes **actifs** (switch `on`, Vacances off) qui contiennent *E*.
2. Garder ceux dont les conditions de programme sont vraies et qui ont un horaire **avec fin** en cours dont les conditions sont vraies.
3. Gagnant = **priorité** la plus haute (plus petit numéro ; égalité → `created_at` le plus ancien).
4. Action voulue = action de l'étiquette de l'horaire gagnant pour *E* (valeur propre à *E* sinon valeur de l'étiquette ; `resolve_action`) ; sinon **action par défaut** du programme actif de plus haute priorité qui contient *E* (peut être vide : rien à envoyer).
5. Prochaine transition = plus proche début/fin d'horaire ; heures solaires recalculées à minuit local et à chaque modification.

**Identité d'un segment** = (programme gagnant, horaire, date d'occurrence) — ou (« défaut », programme) hors horaire.
Deux horaires contigus qui font la même action forment deux segments : la fin d'un horaire envoie toujours le défaut.

**Réveils** : une file unique de réveils typés (transition d'horaire, fin d'anti-rebond, reprise après erreur, délai
d'alerte, minuit solaire) ; un seul `async_track_point_in_time` armé sur le plus proche ; à chaque réveil, recalcul
complet (idempotent, rattrape un réveil en retard). Toute action porte l'identité du segment qui l'a créée et **est
abandonnée dès que ce segment est périmé** (une seule tâche en vol par entité).

### 5.2 Début et fin d'horaire
- **Début** : l'action de l'horaire est envoyée à l'entité.
- **Fin** (horaire avec fin) : l'**action par défaut** de l'entité est envoyée, s'il y en a une.
- **Horaire sans fin** (action ponctuelle) : l'action est lancée **une fois** à l'heure dite ; pas de fin, pas de défaut,
  **jamais refaite** (ni au redémarrage, ni après modification). Elle est **sautée** si un programme plus prioritaire
  est dans un horaire pour cette entité.
- Exemple de référence : volet, horaire 20:00 → 08:00 « Fermer » (`cover.close_cover`), défaut « Ouvrir »
  (`cover.open_cover`). À 20:00 il ferme ; à 08:00 il s'ouvre ; ce qui arrive entre les deux n'est pas surveillé.

### 5.3 Réglage manuel — *retiré en 0.6.0*
Plus de détection de changement à la main, plus de dérogation (externe ou volontaire), plus de « Réglé à la main »,
plus de comparaison à une cible effective, plus de service `override` ni `resume`. Seul l'**affichage** du graphique
montre les changements manuels (§ 10.4) ; le moteur n'en sait rien.

### 5.4 Action par défaut
- Facultative, par entité d'un programme, choisie avec le même sélecteur que les actions d'un horaire (service ou scène).
- Envoyée à la fin de chaque horaire avec fin ; sans défaut, la fin n'envoie rien.
- Quand aucun horaire n'est en cours, l'action par défaut appliquée est celle du **programme actif de plus haute
  priorité qui contient l'entité**. Un programme **désactivé libère ses entités** : son défaut ne s'applique qu'une
  fois, à sa propre désactivation (§ 5.5), jamais aux fins d'horaire des autres programmes.
- Vacances : au passage en Vacances, chaque entité reçoit une fois le défaut du programme le plus prioritaire qui la contient.
- Reprise de la main entre programmes : si un horaire de priorité plus haute se termine pendant qu'un programme plus
  bas est dans un horaire, l'entité reçoit l'action de cet horaire, pas le défaut.
- *Retiré en 0.6.0 : défauts « mode », « consigne » et « état d'avant ».*

### 5.5 Redémarrage, activation, modification (D10)
- Réglage par programme `reapply` (« refaire l'action en cours au redémarrage », oui par défaut).
- Au démarrage de HA (après une **stabilisation** de 30 s), à l'activation du programme, au changement de profil,
  à la fin de Vacances ou **après une modification du programme** : si `reapply = oui`, l'action du **segment en cours**
  (l'action de l'horaire, ou l'action par défaut hors horaire) est renvoyée ; sinon on attend la prochaine transition.
- Les **actions ponctuelles ne sont jamais renvoyées**.
- Au démarrage, la première valeur connue d'une condition (ou sa dernière valeur persistée) **ne passe pas** par l'anti-rebond.
- Fin d'horaire manquée pendant l'arrêt : **toujours rattrapée** (l'action par défaut est envoyée).
- Désactivation d'un programme pendant un horaire : l'action par défaut est envoyée (comme une fin d'horaire).

### 5.6 Conditions et Vacances (D9)
- Condition = `entité` (+ attribut facultatif) `=`, `≠`, `<`, `>` `valeur` ; toutes vraies (ET) ; niveaux programme et horaire.
- Évaluées à chaque transition et à chaque changement des entités citées.
- Entité citée `unavailable`/`unknown` : la condition garde sa **dernière valeur connue** (inconnue au démarrage → on attend la stabilisation).
- **Anti-rebond** : une condition doit rester dans son nouvel état pendant une durée minimale (réglable, 2 min par défaut) avant de faire commencer ou finir un horaire.
- Condition devenue fausse pendant un horaire = fin d'horaire (défaut) ; redevenue vraie = début d'horaire (si `reapply`).
- `switch.weekly_planner_vacances` : suspend tous les programmes et envoie le défaut (§ 5.4) ; à la désactivation, horaires en cours appliqués si `reapply`.

### 5.7 Heures et calendrier
- Pas de 5 min ; horaire minimal 5 min ; jours indexés **0 = lundi … 6 = dimanche**.
- Fin `24:00` autorisée (= minuit du jour suivant) ; `00:00 → 00:00` est refusé (utiliser `00:00 → 24:00`).
- Un horaire passant minuit appartient au jour de son début ; la validation de chevauchement porte sur la semaine entière.
- Heure solaire : `aube | lever | coucher | crépuscule` ± décalage (min), bornes `au plus tôt` / `au plus tard`
  facultatives ; calcul pour la date locale avec le **fuseau de HA** ; recalcul chaque jour à minuit.
- Si, un jour donné, un horaire devient vide ou négatif (ex. « coucher → 21:00 » en juin) ou plus court que 5 min,
  il est **ignoré ce jour-là** ; la carte le montre barré avec la raison.
- Changement d'heure : heures construites en heure locale puis normalisées par UTC. Heure inexistante → on avance
  (02:30 → 03:30) ; un horaire entièrement dans l'heure sautée est ignoré ce jour-là ; heure ambiguë → première occurrence.

### 5.8 Exécution des actions
- Un service HA est appelé sur l'entité (`target.entity_id`), une scène par `scene.turn_on`. Aucune vérification de l'état
  atteint : un appel qui réussit est un succès.
- Entité `unavailable`/`unknown` : action en attente (sauf ponctuelle) ; au retour de l'entité, l'action voulue est
  **recalculée** et envoyée. Notification persistante si l'entité reste indisponible plus de X min (30 par défaut).
- **Erreur d'appel** (hors `ServiceValidationError`) : reprises après 1, 2, 5, 10 puis 15 min tant que le segment est
  le même, puis notification persistante. `ServiceValidationError` (l'appareil refuse l'action) : **pas de reprise**,
  notification tout de suite.
- Journal de bord : une entrée par **décision** (début, fin, échec définitif), pas par essai.
- *Retiré en 0.6.0 : grâce, vérification de la cible, essais sur l'état, verrou Versatile Thermostat, contextes Weekly Planner mémorisés.*

### 5.9 Dérogation volontaire — *retiré en 0.6.0*
Service `override`, durée, « Déroger… » : supprimés avec toute notion de dérogation.

### 5.10 Profils (semaines types)
- Un programme a un ou plusieurs **profils** (« Hiver », « Été », « Télétravail »…), chacun avec ses 7 jours d'horaires ;
  entités, défauts, conditions et priorité sont communs au programme.
- Entité `select.weekly_planner_<programme>_profil` : change le profil actif (carte, automatisation, service).
  Options = noms des profils (uniques dans le programme).
- Au moins un profil ; le profil actif ne peut pas être supprimé.
- Le profil actif est un **état d'exécution** (stockage runtime), hors `revision`.
- Changer de profil = modification (§ 5.5) : si `reapply`, l'action du nouveau profil est envoyée ; sinon on attend la prochaine transition.
- La carte : sélecteur de profil dans l'en-tête du programme ; copie d'un profil.

## 6. Actions (un seul modèle pour toute entité)

*Retiré en 0.6.0 : consignes propres à chaque type (température, preset, hvac, position, ouvrir/fermer, allumer/éteindre,
luminosité, température de couleur, effet, `by_type`), lumière « Automatique », Adaptive Lighting, traitement Versatile
Thermostat / Evohome (`force_permanent`, garde « permanent », sous-jacents).*

- Une **action** est :
  - `{"kind": "service", "service": "<domaine>.<service>", "data": {…}}` : le service est appelé avec l'entité en cible ;
  - `{"kind": "scene", "scene": "scene.x"}` : `scene.turn_on`.
- Toute action vit dans une **étiquette**. `resolve_action(programme, entité, étiquette)` est **l'unique endroit** qui la
  résout : valeur propre à l'entité si elle existe, sinon action de l'étiquette ; `None` si l'étiquette est absente ou
  incompatible avec l'entité.
- Le **sélecteur d'action** de la carte (`frontend/src/services.ts`) propose les services dont la cible accepte
  l'entité (domaine, fonctionnalités prises en charge), avec leur libellé traduit et un champ `ha-selector` par
  paramètre ; les services « techniques » (texte libre ou objet obligatoire) sont masqués ; les scènes HA qui contiennent
  l'entité sont ajoutées.
- Exemples : chauffage `climate.set_temperature {temperature: 18}` ; volet `cover.set_cover_position {position: 30}` ;
  lampe `light.turn_on {brightness_pct: 60}` ; prise `switch.turn_off` ; aspirateur `vacuum.start`.
- Validation : étiquette = service existant (la compatibilité avec l'entité est vérifiée pour les valeurs propres et
  signalée pour les autres) ; un horaire ne peut référencer qu'une étiquette qui existe ; une étiquette utilisée ne peut
  pas être supprimée (la liste des programmes qui l'utilisent est renvoyée).
- **Couleurs** : chaque étiquette a une couleur choisie (palette de 12 couleurs distinctes, choix automatique pour une
  nouvelle étiquette) ; barre du jour, barres de la semaine et repères du graphique l'utilisent et affichent le nom si la place le permet.
- Versatile Thermostat est traité comme n'importe quelle entité `climate`.

## 7. Modes — *retiré en 0.6.0*

La bibliothèque de modes communs, ses exceptions par entité, la page « Modes » et le menu d'options de l'intégration
correspondant sont supprimés. Les modes stockés sont convertis en actions à la migration (§ 8).

## 8. Données et stockage

`.storage/weekly_planner` (`Store`, `version` + `minor_version`, `atomic_writes`, écriture différée 1 s, migrations testées).
**Version 2 (0.6.0)** ; la version 1 est migrée automatiquement (voir ci-dessous).

```text
racine
├─ vacation        : bool
├─ labels[]        : id, name, color, action
└─ programs[]      : id, revision, created_at, name, icon, priority, enabled, reapply,
                     entities[]   : entity_id, default_label? (id d'étiquette), label_overrides{ label_id: action }
                     conditions[] : entity_id, attribute?, op, value
                     active_profile, profiles[] : id, name,
                       days[0..6] : slots[] : id, start, end?, conditions[], label (id d'étiquette)
runtime (`weekly_planner.runtime`) : par entité → segment courant, action en attente, reprises ; par programme → profil actif, skip_at
journal (`weekly_planner.journal`) : segments et actions réellement envoyés (début, entité, action), 14 jours glissants
```
- `start`/`end` : `{"time": "HH:MM"}` (fin jusqu'à `24:00`) ou `{"sun": "sunset", "offset": 15, "earliest": "18:00", "latest": "21:00"}`.
- `action` (d'une étiquette ou d'une valeur propre) : `{"kind": "service", "service": "…", "data": {…}}` ou `{"kind": "scene", "scene": "…"}`.
- **Concurrence** : chaque écriture fournit la `revision` lue ; si elle a changé → refus « modifié ailleurs, recharger ».
- **Robustesse** : si le fichier existait mais se charge vide/corrompu → l'intégration démarre en lecture seule et
  crée une alerte au lieu de repartir de zéro ; **sauvegarde du fichier avant la migration** ; retour à une version
  antérieure = restaurer la sauvegarde.
- **Renommage / suppression d'entité** : écoute de `entity_registry_updated` → `entity_id` mis à jour partout ;
  entité supprimée → alerte Réparations.

### 8.1 Migration 1 → 2 (automatique, testée)
Conversion des anciennes consignes en actions, puis **regroupement en étiquettes : des actions identiques donnent UNE
seule étiquette**, nommée d'après l'action (`18 °C`, `Ouvrir`, `Fermer`, `Position 30 %`, `Allumer` / `Éteindre`
(+ `30 %`), nom de la scène, sinon l'identifiant du service). Couleurs : chaudes pour les températures élevées et
allumer / ouvrir, froides ou grises pour les basses et éteindre / fermer, sinon la palette dans l'ordre.
Quand deux entités d'un même horaire avaient des actions différentes, la première donne l'étiquette et l'autre garde sa
valeur dans `label_overrides`. Conversion des actions :

| Avant | Après |
|---|---|
| climate température | `climate.set_temperature` `{temperature}` |
| climate preset | `climate.set_preset_mode` `{preset_mode}` |
| climate hvac / off | `climate.set_hvac_mode` `{hvac_mode}` (`off` → `off`) |
| cover open / close | `cover.open_cover` / `cover.close_cover` |
| cover position | `cover.set_cover_position` `{position}` |
| light on | `light.turn_on` avec `brightness_pct`, `color_temp_kelvin`, `effect` quand ils sont définis |
| light off | `light.turn_off` |
| switch, input_boolean, fan on / off | `<domaine>.turn_on` / `<domaine>.turn_off` |
| scène | inchangée |
| mode référencé par un horaire (`by_type`, ex. `cover_closed`, `climate_eco`) | résolu par les modes stockés (exception de l'entité, sinon valeur), puis converti comme ci-dessus |

Défauts : genre `setpoint` ou `mode` → étiquette de l'action convertie ; `none` → pas de défaut ; `previous` → pas de
défaut, **un avertissement dans le journal** de HA. Les modes, `force_permanent`, `grace_s`, `main_type` sont supprimés. Les
dérogations persistées dans le runtime sont effacées.

Données réelles de production vérifiées par un test : programme « Bureau » sur `climate.thermostat_bureau` (horaires
de 18 °C, défaut 15 °C → étiquettes « 18 °C » et « 15 °C ») et programme « Volet du bureau » sur
`cover.bureau_volet_low_speed` (horaires ponctuels `by_type` `cover_closed` / `cover_open` → étiquettes « Fermer » / « Ouvrir »).

## 9. Entités, services, API, droits

**Entités** : `switch.weekly_planner_<programme>` (attributs `current_slots`, `next_change`, `next_actions`, `skip_next`, `active_profile`) ;
`switch.weekly_planner_vacances` ; appareil « Weekly Planner » (`integration_type: service`) ;
`select.weekly_planner_<programme>_profil` (§ 5.10).

**Services** (`weekly_planner.*`) :
- `apply_now` (programme) : envoie l'action en cours aux entités du programme, quel que soit `reapply` ;
- `skip_next` (programme) : la prochaine transition du programme n'est pas appliquée (persisté, une seule fois, annulable) ;
- `reload` (admin).
- *Retirés en 0.6.0 : `resume`, `override`.*

**API websocket** : `get` · `subscribe` · `program/save|delete|set_enabled` · `preview` (heures solaires résolues, horaires
ignorés) · `label/save|delete` (suppression refusée tant qu'un programme l'utilise) · `journal` (actions et segments
réellement décidés, pour le graphique). *Retirés : `mode/save`, `mode/delete`.*

**Droits**
- `admin_only` (option globale, désactivée par défaut) : si actif, seule l'édition des programmes est réservée aux admins.
- **Toujours réservé aux admins** : toute action visant un domaine sensible (`homeassistant`, `hassio`,
  `alarm_control_panel`, `lock`, `alarmo`).

**Avertissements** affichés dans la carte (jamais bloquants) : deux programmes actifs sur la même entité ; entité aussi
visée par un `switch.schedule_*` actif ou par une automatisation ; entité manquante.

**Options** : `admin_only` ; délai d'alerte ; `reapply` par défaut ; anti-rebond des conditions. Instance unique.
**Désinstallation** (`async_remove_entry`) : retrait de la ressource Lovelace, des entités et du stockage.

## 10. Carte `weekly-planner-card`

### 10.1 Configuration de la carte (éditeur visuel)
`program: <id>` **ou** `filter: {types: [climate], area: bureau}` ; `title` ; `show_week` ; `show_chart`.

### 10.2 Consultation (par défaut)
- Une ligne par appareil : **icône, nom du programme, état traduit** (`formatEntityState`), et
  « → libellé de la prochaine action + heure » (« demain » si c'est demain).
- Dessous : barre du jour avec trait « maintenant » (heure du **serveur**), liste de la semaine, bouton calendrier.
  Aucune ligne de dérogation ; aucune commande immédiate (c'est un planificateur).
- Toucher la ligne ouvre l'**écran d'horaires** de l'appareil.

### 10.3 Écran d'horaires et réglages
- **Écran d'horaires** : lignes d'horaires (pastille de la couleur de l'étiquette + nom) ; formulaire d'horaire (début,
  fin facultative, jours) dont la section « Action » liste les étiquettes compatibles en pastilles colorées ;
  « + Nouvelle étiquette » ouvre un mini-formulaire en ligne (nom, couleur, action par le sélecteur générique ou une
  scène) qui crée l'étiquette et la sélectionne ; pour l'étiquette choisie, un lien « Valeur pour cet appareil »
  modifie la valeur propre de l'appareil (même sélecteur) avec « Revenir à la valeur commune » ; ligne « Le reste du temps » :
  une étiquette ou « Rien » ; interrupteur de pause, dupliquer, supprimer (confirmé, bouton rouge isolé).
- **Écran « Étiquettes »** (administrateurs) : ligne « Étiquettes » au-dessus de la liste des programmes ; liste des
  étiquettes (pastille, nom, résumé de l'action, nombre d'usages) ; renommer, recolorer, changer l'action, supprimer
  (refusé tant qu'elle est utilisée, avec la liste des programmes).
- **Réglages (engrenage, administrateurs)** : nom, icône, priorité, conditions, « refaire l'action en cours au
  redémarrage », appareils, saisons (profils). Plus de modes, plus de « permanent ».
- Sélecteurs HA publics (`ha-selector`, icône) si disponibles ; modales maison ; fr + en.

### 10.4 Graphique (tous les appareils)
SVG maison, un jour (précédent / suivant).
- **Données** : historique HA de l'entité sur le jour. Valeur numérique → **courbe** : climat `current_temperature`
  (mesurée) et attribut `temperature` (réglée), volet `current_position`, lumière luminosité en %. Sinon → **bande d'états**.
- **Actions prévues** : repères aux heures prévues, avec la valeur quand l'action en contient une
  (`temperature`, `position`, `brightness_pct`).
- **Maintenant** : trait vertical sur le jour courant.
- **Toucher** : ouvre l'historique HA de l'entité pour ce jour (`/history?entity_id=…&start_date=…&end_date=…`, navigation HA :
  `history.pushState` + événement `location-changed`).
- **Changements manuels (affichage seulement)** : en **rouge** (`var(--error-color)`). Source : le journal de bord HA
  (`logbook/get_events` sur l'entité et le jour). Un changement d'état est **manuel** quand l'entrée porte un
  `context_user_id` (action d'une personne dans l'interface), ou n'a aucun contexte et ne correspond à aucune
  décision ou action de Weekly Planner (`weekly_planner/journal`, même entité, ± 1 min ; les anciennes entrées de décision comptent aussi) : action sur l'appareil lui-même.
  Les changements venant d'une automatisation ou d'un script ne sont pas manuels.
  Courbes : le tronçon réglé à la main, du changement jusqu'à la prochaine action prévue ou au changement suivant, est tracé en rouge.
  Bandes : la période manuelle est une bande rouge.
  **Limite** : le journal de bord ne contient que les changements d'**état** ; un réglage qui ne change que
  les attributs (consigne d'un thermostat resté en « chauffe », luminosité d'une lampe déjà allumée) n'y figure pas :
  ils sont repérés seulement par l'écart avec les actions de Weekly Planner (± 1 min), sans pouvoir dire qui les a faits.
  **Le moteur n'est pas concerné.**
- **Valeur prévue en escalier (0.7.0)** : pour toute action numérique, ligne horizontale par palier dans la couleur de son étiquette, raccords verticaux fins, retour à la valeur par défaut (aussi avant le premier horaire et jusqu'à la fin du jour) ; point plein + valeur au début de chaque horaire ; cercle creux seulement là où la valeur revient vraiment au défaut (fin d'une suite d'horaires contigus). Actions non numériques : repères seuls.
- **Activité réelle (0.7.0)** : sous l'escalier prévu, zone translucide (~25 %) dans la couleur de l'étiquette en vigueur, seulement pendant les périodes où l'appareil était actif d'après l'historique déjà chargé, et jusqu'à « maintenant ». Actif : climat = `hvac_action` (chauffe, refroidit, déshumidifie…) sinon consigne − mesure > 0,3 °C (< −0,3 °C en mode froid) ; lumière, prise, ventilateur, interrupteur = `on` ; volet = `opening` / `closing` ; aspirateur = `cleaning` / `returning` ; lecteur = `playing` ; le reste = ni `off`, `idle`, `unavailable`, `unknown`, `docked`. Appareils à bandes : même règle, bande translucide. Légende « Actif » seulement si une zone est visible.
- **Légende minimale** : « Mesuré », « Réglé » (courbes), « Prévu », et « Manuel » en rouge ; aucune couleur inexpliquée.

### 10.5 Exigences transverses
360 px (Galaxy S22) et ≥ 1400 px ; thèmes clair/sombre ; clavier ; fr/en ; zéro erreur console ; le moins de texte possible.

### 10.6 Livraison du JS
Lit + TypeScript, bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` (commité). Servi par
`async_register_static_paths` ; **ressource Lovelace** (mode storage) avec `?v=<hash>` ; `add_extra_js_url` seulement
en mode YAML ; garde `customElements.get()` avant `define`.

### 10.7 Mode simple et « Plus d'options » — *retiré* (depuis la 0.3 ; la carte n'a plus de commande immédiate ni de dérogation)
Conservé de cette revue : persona « Mamy », écran 360 × 780, vocabulaire sans jargon, cibles tactiles ≥ 48 px,
suppression toujours confirmée et séparée d'Enregistrer / Annuler.

### 10.8 Édition directe sur les barres (0.7.0)
Barre « Auj. » et sept barres de la semaine, doigt et souris (événements pointeur, `touch-action` géré, clavier).
- **Entrer** : appui long ~450 ms (doigt) ou clic (souris) ; la barre passe à ~44 px et chaque frontière reçoit une poignée
  (zone ≥ 44 px, la plus proche du doigt gagne). **Sortir** : toucher à côté ou Échap. Un appui court au doigt ouvre toujours l'écran d'horaires.
- **Glisser** : bulle d'heure (pas de 15 min), bornée par les frontières voisines, une frontière solaire devient une heure fixe ;
  un repère ponctuel (sans fin) est une poignée unique. Clavier : flèches ±15 min sur la poignée sélectionnée.
- **Enregistrer** au relâcher, **pour ce jour seulement** (jour de la semaine de la date dans le profil actif) ; changement refait sur les
  données COURANTES, un conflit de révision est retenté une fois, jamais de « rechargez ». Bandeau « Modifié · Annuler » ~6 s ;
  « Annuler » remet les horaires précédents de ces jours. Deux horaires voisins de même étiquette (fin == début) sont fusionnés.
- **Sélection** (toucher un horaire ou un trou) : bande sous la barre avec les étiquettes compatibles, « Rien », ciseaux
  (`mdi:content-cut`, coupe au milieu, pas de 15 min) et « Copier vers… » (`mdi:content-copy`) : pastilles Lun…Dim sans le jour courant ;
  sans chevauchement la copie est directe ; sinon petite fenêtre listant les jours en conflit, chacun « Remplacer » (défaut) ou
  « Ne pas copier ce jour ». « Remplacer » rogne ou coupe les horaires existants autour de la plage (mer. 8 h 45–17 h 18 °C + copie de
  12–14 h 19 °C = 8 h 45–12 h 18 °C, 12–14 h 19 °C, 14–17 h 18 °C).
- **Logique pure** (`edits.ts`, tests vitest) : `moveBoundary`, `splitAt`, `setLabel`, `removeSlot`, `copyConflicts` / `copyToDays`, `mergeAdjacent`.
- **Icônes solaires** : `mdi:weather-sunset-up` / `-down` à la position de toute frontière ou repère dépendant du soleil.
- **Trait « maintenant »** : icône `mdi:clock-outline` (12–14 px) centrée au-dessus, hors de la barre, `aria-label` « Maintenant » ; aussi sur le graphique.
- **Renommer une étiquette sur place** (écran d'horaires) : crayon `mdi:pencil`, nom + couleur + action, `weekly_planner/label/save`, « Partagé » si utilisée ailleurs.
- **Mise à jour automatique de la carte** : `card_version` dans `get` / `subscribe` ; différent de celui du bundle chargé et page au repos → rechargement
  unique (mémorisé dans `sessionStorage`).

## 11. Compatibilité

Weekly Planner est générique : il ne connaît **ni Versatile Thermostat, ni Evohome, ni Adaptive Lighting** (retirés en
0.6.0 : garde « permanent », sous-jacents, contexte `:al:`, verrou VT, `requested_state`). Une entité pilotée par
une autre intégration se programme comme n'importe quelle autre ; les **pilotes concurrents** sont signalés (§ 9).

## 12. Qualité, outillage, publication

- Arborescence : `custom_components/weekly_planner/` (moteur, store, websocket, switch, services, traductions,
  `brand/icon.png`, `frontend/`), `frontend/` (sources TS), `tests/`, `dev/`, `scripts/`, `docs/`.
- Dev : `dev/docker-compose.yml` (`ghcr.io/home-assistant/home-assistant:2026.10.x`), entités `demo` + `template` par
  type (dont un thermostat « lent » qui confirme après 2 min et un volet qui bouge 90 s), montage de l'intégration.
- Python des tests aligné sur HA (3.14, via `uv`) ; `pytest-homeassistant-custom-component` aligné 2026.10 ; temps simulé.
- *Versatile Thermostat et Adaptive Lighting : plus simulés ni cités depuis la 0.6.0.*
- `manifest.json` : `after_dependencies` = `frontend`, `lovelace`, `logbook`, `repairs`.
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
- [x] Squelette du dépôt (arborescence § 12, `hacs.json`, `manifest.json`, `brand/`, README minimal)
- [x] Environnement de dev + entités de démonstration (instance HA locale en Python, Docker Desktop ne télécharge plus d'images ; `scripts/dev_ha.sh`, `scripts/dev_onboard.py`)
- [x] Python 3.14 (`uv`) + dépendances de test
- [x] CI : hacs/action, hassfest, pytest, build carte
- [x] **Prototype** : carte embarquée chargée comme ressource sur HA 2026.10 (S33)

### 14.2 Moteur
- [x] Modèle + `Store` versionné + robustesse + migration (S20, S28)
- [x] Plages d'un jour : fixes, soleil + bornes, minuit, `24:00`, DST, plages ignorées (S2, S3, S4, S26, S27)
- [x] Résolution par entité : priorités, conditions, Vacances, défauts, état hors plage (S9, S10, S11, S12, S16, S24)
- [x] Minuteur unique + recalcul + segments + abandon des actions périmées (S1, S21)
- [x] Exécution : ordre, confirmation, grâce, essais espacés, entités injoignables (S13, S14, S22)
- [x] Dérogation : règles § 5.3, persistance, `resume` (S5, S6, S15, S23, S25) (retiré en 0.6.0)
- [x] Redémarrage / activation / modification, stabilisation, rattrapage des fins (S7, S8, S29)
- [x] Conditions : dernière valeur connue, anti-rebond (S30)
- [x] Journal de bord, journal des segments, notifications (S31)
- [x] Renommage / suppression d'entités, alertes Réparations (S32)
- [x] Dérogation volontaire avec échéance + service `override` (S35) (retiré en 0.6.0)
- [x] Profils + `select` du profil actif (S36)
- [x] Adaptive Lighting : contrôle manuel pendant une consigne fixe, repli switch (S37) (retiré en 0.6.0)
- [x] Activation / redémarrage hors plage : défaut appliqué (S38)

### 14.3 Intégration HA
- [x] Config flow (instance unique) + options flow
- [x] Switchs (programmes, Vacances) + appareil
- [x] Services + API websocket + droits (S19, S34)
- [x] Détection des pilotes concurrents et contrôles VT (`check`) (contrôles VT retirés en 0.6.0)
- [x] Traductions fr / en
- [x] Désinstallation propre (S33)

### 14.4 Carte
- [x] Outillage Lit/TS + bundle + ressource + cache-busting
- [x] Éditeur visuel de la carte
- [x] Vue consultation
- [x] Modale Programme
- [x] Modale Jour (glisser + loupe + ±5 min, liste, copie)
- [x] Modale Plage
- [x] Modes (retiré en 0.6.0)
- [x] Graphique 24 h
- [ ] Responsive, thèmes, clavier, fr/en, mesure de rendu

### 14.5 Compatibilité
- [x] Versatile Thermostat (requested_state, verrou, avertissements, fenêtre) (retiré en 0.6.0)
- [x] Evohome (dérogation permanente, grâce 6 min) (retiré en 0.6.0)
- [x] Adaptive Lighting (Automatique, contextes, switch de zone) (retiré en 0.6.0)

### 14.6 Documentation et publication
- [x] README en / fr, captures, CHANGELOG, `docs/test-reel.md`, `docs/controle-visuel.md`
- [x] `scripts/deploy_prod.sh`
- [ ] Release `0.1.0` (prod par copie), puis `1.0.0` sur `main`
- [ ] Dépôt public, installation HACS vérifiée, demande d'inclusion HACS par défaut

### 14.7 Validation réelle (banc d'essai)
- [ ] Déploiement en prod par script
- [ ] Procédure `docs/test-reel.md` déroulée ≥ 3 jours

### 14.8 Revue
- [x] Relecture « avocat du diable » n° 1 (35 points) intégrée dans cette version
- [x] Questions § 16 tranchées
- [x] Relecture n° 2 (24 points) intégrée — questions produit en § 16 bis
- [x] Questions § 16 bis tranchées

### 14.9 Scénarios de test (automatiques)
- [x] S1 plage simple : début applique, fin applique le défaut
- [x] S2 plage passant minuit ; dimanche → lundi
- [x] S3 heure solaire + décalage + bornes (été / hiver)
- [x] S4 DST : 02:30 inexistante, 02:30 ambiguë, plage dans l'heure sautée
- [x] S5 dérogation pendant la plage : rien réappliqué, fin appliquée (retiré en 0.6.0)
- [x] S6 dérogation puis redémarrage : dérogation conservée (retiré en 0.6.0)
- [x] S7 redémarrage en cours de plage, `reappliquer` oui / non
- [x] S8 fin de plage manquée pendant l'arrêt → rattrapée
- [x] S9 deux programmes, priorités, reprise de la main
- [x] S10 condition de programme qui bascule en pleine plage
- [x] S11 condition de plage
- [x] S12 Vacances on / off
- [x] S13 entité injoignable puis revenue (dans et hors plage) ; notification après délai, retirée ensuite
- [x] S14 thermostat cloud lent (confirmation à 2 min, rafraîchissement 5 min) : pas de fausse dérogation (retiré en 0.6.0)
- [x] S15 Adaptive Lighting : pas de fausse dérogation (retiré en 0.6.0)
- [x] S16 défaut « état d'avant » avec deux programmes qui se croisent (retiré en 0.6.0)
- [x] S17 modification d'un mode utilisé par plusieurs programmes (retiré en 0.6.0)
- [x] S18 suppression d'un programme en pleine plage
- [x] S19 `admin_only` ; actions sensibles refusées aux non-admins
- [x] S20 migration du stockage n → n+1 ; sauvegarde
- [x] S21 plage courte + action lente : l'essai périmé n'est pas renvoyé
- [x] S22 VT verrouillé : échec immédiat et alerte (retiré en 0.6.0)
- [x] S23 VT fenêtre ouverte : pas de dérogation, vérification sur `requested_state` (retiré en 0.6.0)
- [x] S24 défaut « rien » et plage ponctuelle
- [x] S25 volet lent : pas de fausse dérogation pendant le mouvement (retiré en 0.6.0)
- [x] S26 plage solaire vide un jour donné (ignorée, signalée)
- [x] S27 fin `24:00`, refus de `00:00 → 00:00`, chevauchement entre jours
- [x] S28 stockage corrompu : lecture seule + alerte
- [x] S29 actions ponctuelles jamais réappliquées
- [x] S30 condition sur entité indisponible ; anti-rebond
- [x] S31 journal des segments utilisé pour le passé du graphique
- [x] S32 renommage et suppression d'entité
- [x] S33 ressource Lovelace : création, mise à jour de version, retrait à la désinstallation
- [x] S34 `revision` : écriture concurrente refusée
- [x] S35 « Déroger… » : durée, jusqu'à HH:MM, fin de plage, « Reprendre » avant terme, redémarrage pendant (retiré en 0.6.0)
- [x] S36 changement de profil en pleine plage
- [x] S37 lumière sous Adaptive Lighting avec consigne fixe : pas de réajustement, rendue à AL à la fin (retiré en 0.6.0)
- [x] S38 activation / redémarrage hors plage : défaut appliqué (et pas appliqué si `reappliquer = non`)
- [x] S39 plages contiguës au même mode / défaut identique : la fin efface un réglage manuel (retiré en 0.6.0)
- [x] S40 cible effective : « Déroger… » ne déclenche ni essais ni alerte ; `reappliquer = non` non plus (retiré en 0.6.0)
- [x] S41 AL oublie le contrôle manuel (bascule du switch de zone, redémarrage) : réaffirmé, pas de fausse dérogation (retiré en 0.6.0)
- [x] S42 `skip_next` et `apply_now`
- [x] S43 retrait d'une entité Evohome : remise en suivi de programme (retiré en 0.6.0)
- [x] S44 échéance de dérogation volontaire tombée pendant un arrêt de HA (retiré en 0.6.0)

### 14.10 Version 0.6.0 — un seul modèle pour tous les appareils
- [x] Spec réécrite (§ 1 à 12) et cette liste de tâches
- [x] Moteur : un horaire = début, fin facultative, jours, une **étiquette** ; action résolue en **un seul endroit** (`resolve_action`)
- [x] Étiquettes globales (`labels`), valeurs propres par appareil (`label_overrides`), compatibilité (entité incompatible ignorée + avertissement), suppression refusée tant qu'utilisée (`label/save`, `label/delete`)
- [x] Action par défaut par entité (`default_label`), envoyée à la fin d'un horaire avec fin ; horaire sans fin = ponctuel, jamais refait
- [x] Option `reapply` : renvoyer l'action du segment en cours au démarrage et après modification (jamais les ponctuels)
- [x] Retrait de toute détection de réglage manuel (dérogations, service `override` et `resume`, comparaison d'état, essais sur l'état) ; reprises sur erreur d'appel (1/2/5/10/15 min, pas pour `ServiceValidationError`) et notification conservées
- [x] Retrait des consignes par type, des modes communs (et de leur options flow), d'Adaptive Lighting, d'Evohome / « permanent » / sous-jacents VT, avec tests et traductions
- [x] Migration automatique du stockage (version 1 → 2) avec sauvegarde : actions converties puis regroupées en étiquettes (doublons fusionnés), testée sur les formes de production (« Bureau » : « 18 °C » / « 15 °C » ; « Volet du bureau » : « Fermer » / « Ouvrir »)
- [x] Carte : ligne icône + nom du programme + état traduit + « → prochaine action + heure » (« demain »), barre du jour, semaine, calendrier, sans ligne de dérogation
- [x] Carte : écran d'horaires (lignes colorées, formulaire d'horaire avec pastilles d'étiquettes compatibles, « + Nouvelle étiquette » en ligne, « Valeur pour cet appareil », « Le reste du temps » = étiquette ou « Rien », pause, dupliquer, supprimer)
- [x] Carte : écran « Étiquettes » (admins) : liste, renommer, recolorer, changer l'action, supprimer (refusé si utilisée)
- [x] Couleurs des étiquettes (palette de 12, choix automatique) sur la barre du jour, les barres de la semaine et les repères du graphique
- [x] Carte : réglages (engrenage) sans modes ni « permanent »
- [x] Graphique pour tous les appareils : historique HA (courbe ou bande d'états), repères des actions prévues avec valeur, trait « maintenant », toucher → historique HA du jour, légende minimale
- [x] Graphique : changements **manuels** en rouge (`var(--error-color)`) d'après le journal de bord HA et le journal Weekly Planner, légende « Manuel » / « Manual » ; affichage seulement, le moteur ne change pas
- [x] Tests pytest (migration, défaut à la fin, ponctuels jamais refaits, `reapply` oui / non, aucune dérogation) et tests de la carte verts
- [x] Instance de test locale : programmes migrés (Bureau, Lampe, Prise, Volet, Rocky) ; captures 360 × 780
- [x] Version 0.6.0 (manifest, pyproject, package.json), CHANGELOG « BREAKING », deux README

### 14.10 Version 0.7.0
- [x] Logique pure d'édition de journée dans `edits.ts` + tests (`moveBoundary`, `splitAt`, `setLabel`, `removeSlot`, `copyConflicts`, `copyToDays`, `mergeAdjacent`)
- [x] Composant d'édition des barres (appui long / clic, poignées, bulle, enregistrement au relâcher, clavier)
- [x] Bande de sélection (étiquettes, « Rien », ciseaux), « Copier vers… » et fenêtre de conflits
- [x] Bandeau « Modifié · Annuler » (enregistrement sur les données courantes, une reprise)
- [x] Icônes solaires sur les barres (dont le volet bureau)
- [x] Icône « maintenant » au-dessus du trait (barres et graphique)
- [x] Renommer une étiquette sur place (crayon, « Partagé »)
- [x] `card_version` (serveur + test pytest) et rechargement automatique de la carte
- [x] Graphique : valeur PRÉVUE en escalier (couleur de l'étiquette par palier), cercle creux seulement au vrai retour au défaut, légende « Prévu » en trait + tests du constructeur d'escalier
- [x] Graphique : zone ombrée sous l'escalier prévu, seulement quand l'appareil était réellement ACTIF (jusqu'à maintenant), légende « Actif », constructeur testé
- [x] Version 0.7.0, CHANGELOG, vérification dans le navigateur (360 px tactile, ≥ 1400 px souris), captures

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
- Q-M ✅ Oui : avec `admin_only`, un non-admin garde lecture, switchs, Reprendre, Déroger…, profil ; à revoir en v2 (rôles).
