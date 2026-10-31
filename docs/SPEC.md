# Weekly Planner — spécification v1

> Statut : **0.19.0** — un seul modèle pour tous les appareils depuis la 0.6 (§ 5 et § 6 ; les anciennes règles retirées en
> 0.6.0 sont marquées « retiré en 0.6.0 ») ; modes, sources, cibles, délais aléatoires et limites solaires : § 5.10, § 6, § 17 à 20.
> Écarts connus entre cette spec et le code : § 21.
> Dépôt : `ha_weekly_planner` · domaine HA : `weekly_planner` · cible : Home Assistant ≥ 2026.10.
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
| D8 | 7 jours indépendants + copie (raccourcis Lun→Ven, Sam+Dim) ; pas de 5 min ; plages passant minuit ; heures solaires (lever, coucher ± décalage ; aube et crépuscule acceptés par le serveur, non proposés) avec bornes « au plus tôt / au plus tard ». |
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

**Une passe de calcul** décide d'après les entrées lues à son début ; ce qui change pendant qu'elle cède la boucle est
traité par la passe suivante, dans l'ordre d'arrivée (verrou du moteur, § 21.4).

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
- Activation / désactivation **pendant la stabilisation** : la configuration est enregistrée et publiée tout de suite
  (abonnés, switch HA), mais aucune action n'est envoyée aux appareils avant la fin de la stabilisation.
- `apply_now` (§ 9) ne renvoie l'action qu'aux entités dont le segment en cours appartient à ce programme.

### 5.6 Conditions et Vacances (D9)
- Condition = `entité` (+ attribut facultatif) `=`, `≠`, `<`, `>` `valeur` ; toutes vraies (ET) ; niveaux programme et horaire.
- Évaluées à chaque transition et à chaque changement des entités citées.
- Entité citée `unavailable`/`unknown` : la condition garde sa **dernière valeur connue** (inconnue au démarrage → on attend la stabilisation).
- **Anti-rebond** : une condition doit rester dans son nouvel état pendant une durée minimale (réglable, 2 min par défaut) avant de faire commencer ou finir un horaire.
- Condition devenue fausse pendant un horaire = fin d'horaire (défaut) ; redevenue vraie = début d'horaire (si `reapply`).
- Interrupteur global (`switch.weekly_planner_vacation`, nom affiché « Suspension de tous les programmes » / « All
  programs paused ») : suspend tous les programmes et envoie le défaut (§ 5.4) ; à la désactivation, horaires en cours appliqués si `reapply`.

### 5.7 Heures et calendrier
- Saisie des heures à toute minute ; poignées au pas de 15 min ; horaire minimal 5 min ; jours indexés **0 = lundi … 6 = dimanche**.
- Fin `24:00` autorisée (= minuit du jour suivant). `00:00 → 00:00` est **accepté** (décision 0.19.0) et placé comme un horaire de 24 h
  passant minuit (la fin, avant midi et pas après le début, tombe le lendemain) ; `00:00 → 24:00` reste équivalent.
- Une fin qui n'est pas après le début passe minuit **seulement si elle tombe avant midi** (DECISIONS 2026-10-25) ;
  sinon l'horaire est vide ce jour-là.
- Un horaire passant minuit appartient au jour de son début ; la validation de chevauchement porte sur la semaine entière.
- Heure solaire : `aube | lever | coucher | crépuscule` (`dawn | sunrise | sunset | dusk`) ± décalage (−240 à +240 min),
  bornes `au plus tôt` / `au plus tard` facultatives (`earliest` > `latest` refusé : `earliest_after_latest`, § 20) ;
  calcul pour la date locale avec le **fuseau de HA** ; recalcul chaque jour à minuit. Ordre : événement, décalage,
  bornes, puis **arrondi au pas de 5 min inférieur**, puis délai aléatoire (§ 19). Le formulaire ne propose que
  Lever / Coucher (§ 20).
- Délai aléatoire facultatif par frontière : `random_minutes` 0 à 240 (§ 19).
- Si, un jour donné, un horaire ne peut pas être placé, il est **ignoré ce jour-là** avec une raison :
  `sun_event_missing` (pas d'événement solaire ce jour-là), `skipped_by_dst` (entièrement dans l'heure sautée), `empty`
  (vide ou négatif, ex. « coucher → 21:00 » en juin), `too_short` (moins de 5 min), `overlap` (chevauche un horaire
  précédent sans laisser 5 min). Chevauchement calculé un jour donné (heures solaires) : **l'horaire le plus tardif perd** ;
  il est rogné pour commencer à la fin du précédent, ou ignoré (`overlap`) s'il resterait moins de 5 min ou s'il n'a pas de fin.
  La carte le montre barré avec la raison.
- Changement d'heure : heures construites en heure locale puis normalisées par UTC. Heure inexistante → on avance
  (02:30 → 03:30) ; un horaire entièrement dans l'heure sautée est ignoré ce jour-là ; heure ambiguë → première occurrence.

### 5.8 Exécution des actions
- Un service HA est appelé sur l'entité (`target.entity_id`), une scène par `scene.turn_on`. Aucune vérification de l'état
  atteint : un appel qui réussit est un succès.
- Entité `unavailable`/`unknown` : action en attente (sauf ponctuelle) ; au retour de l'entité, l'action voulue est
  **recalculée** et envoyée. Exception : une cible explicite (`target_entity_id`, § 6) n'est en attente que si elle est
  `unavailable` ; `unknown` reste commandable (un bouton jamais pressé n'a pas d'état). Notification persistante si l'entité reste indisponible plus de X min (30 par défaut).
- **Erreur d'appel** (hors `ServiceValidationError`) : reprises après 1, 2, 5, 10 puis 15 min tant que le segment est
  le même, puis notification persistante. `ServiceValidationError` (l'appareil refuse l'action) : **pas de reprise**,
  notification tout de suite.
- Journal de bord : une entrée par **décision** (début, fin, échec définitif), pas par essai. Le journal de bord HA
  affiche ces événements (`weekly_planner_event`) en texte lisible fr / en (`logbook.py` : action lancée, en attente
  d'une entité indisponible, action impossible).
- Notifications persistantes : `weekly_planner_<entity_id>_failed` (échec ou indisponibilité prolongée) et
  `weekly_planner_storage` (stockage illisible, § 8).
- *Retiré en 0.6.0 : grâce, vérification de la cible, essais sur l'état, verrou Versatile Thermostat, contextes Weekly Planner mémorisés.*

### 5.9 Dérogation volontaire — *retiré en 0.6.0*
Service `override`, durée, « Déroger… » : supprimés avec toute notion de dérogation.

### 5.10 Modes du programme (semaines types)
- Un programme a un ou plusieurs **modes** (Maison, Absent, Nuit, Vacances, Hiver…), chacun avec ses 7 jours d’horaires.
  Les entités, défauts, conditions et priorité restent communs. Les clés internes `profiles` et les identifiants HA restent compatibles.
- Le mode actif se choisit manuellement dans la carte ou le sélecteur HA existant, ou suit une entité générique via
  `mode_source: {entity_id, mappings: {état_brut: id_du_mode}}`. Le choix de la source et des associations est enregistré avec le programme.
- Une source inconnue/indisponible ou un état sans association conserve le dernier mode valide (repli initial : mode configuré puis premier mode).
  Le statut expose l’état courant et la correspondance. Les sources Weekly Planner sont refusées pour éviter les boucles.
- Sous contrôle externe, le sélecteur manuel ne peut pas forcer un autre mode. Repasser en manuel conserve le dernier mode actif.
- Au moins un mode ; le mode actif ne peut pas être supprimé. Les associations vers un mode supprimé doivent être retirées.
- L’activation reste un état d’exécution, hors `revision`. Les changements respectent `reapply` et ne rejouent pas les actions ponctuelles passées.
- Les horaires d’un mode inactif sont modifiables sans l’activer. Une édition en cours reste attachée à son mode même si la source change ;
  un mode supprimé à distance ne peut pas recevoir une écriture. Les horaires enregistrés sont conservés lors des modifications des réglages.
- **Vacances est un mode ordinaire**, sans traitement de suspension. L’ancien interrupteur global conserve son identifiant et sa fonction,
  mais est présenté comme « Suspension de tous les programmes » pour préserver les automatisations existantes.

## 6. Actions (un seul modèle pour toute entité)

*Retiré en 0.6.0 : consignes propres à chaque type (température, preset, hvac, position, ouvrir/fermer, allumer/éteindre,
luminosité, température de couleur, effet, `by_type`), lumière « Automatique », Adaptive Lighting, traitement Versatile
Thermostat / Evohome (`force_permanent`, garde « permanent », sous-jacents).*

- Une **action** est :
  - `{"kind": "service", "service": "<domaine>.<service>", "data": {…}, "target_entity_id"?: "…", "data_sources"?: {…}}` :
    le service est appelé avec l'entité en cible ;
  - `{"kind": "scene", "scene": "scene.x"}` : `scene.turn_on`.
- **Cible explicite** : `target_entity_id` (facultatif) fait agir l'action sur une autre entité HA (ex. bouton de position
  favorite via `button.press`) ; services et champs sont découverts sur cette cible réelle ; résumés et journal la nomment.
- **Valeurs dynamiques** : `data_sources[champ] = {entity_id, attribute?, type}` avec `type` ∈ `number | boolean |
  string | native` ; lue juste avant l'appel, prioritaire sur `data[champ]`, sans réaction au changement de la source ;
  source manquante, `unknown` / `unavailable` ou conversion invalide → action refusée, sans repli.
- **Cibles protégées** : `data` ne peut pas contenir `entity_id`, `device_id`, `area_id`, `floor_id`, `label_id`
  (`TARGET_KEYS`), ni `data_sources` ces clés ou `target` (erreur `service_data_target`) ; jamais de redirection de cible
  par les données.
- Toute action vit dans une **étiquette**. `resolve_action(programme, entité, étiquette)` est **l'unique endroit** qui la
  résout : valeur propre à l'entité si elle existe, sinon action de l'étiquette ; `None` si l'étiquette est absente ou
  incompatible avec l'entité.
- Le **sélecteur d'action** de la carte (`frontend/src/services.ts`) propose les services dont la cible accepte
  l'entité (domaine, fonctionnalités prises en charge), avec leur libellé traduit et un champ `ha-selector` par
  paramètre ; les services « techniques » (texte libre ou objet obligatoire) sont masqués ; les scènes HA qui contiennent
  l'entité sont ajoutées.
- **Actions proposées (0.7.3)** : `entities[].allowed_services` (liste d'ids `domaine.service`) restreint ce qu'on peut
  choisir pour un appareil (réglages, onglet Appareils) ; les scènes restent permises. Avec `restrict_services: true`
  (défaut des nouveaux appareils depuis la 0.15), une liste vide signifie **aucune** commande ; sans ce drapeau
  (configurations historiques), une liste vide ou absente garde **toutes** les commandes. Une
  étiquette dont le service n'est pas autorisé pour un appareil est incompatible pour lui (ignorée, avertissement).
- Cadre de l'étiquette choisie : lecture seule ; un crayon ouvre un seul formulaire (nom, couleur, action, valeur pour
  cet appareil). Jamais plus d'une paire Enregistrer / Annuler visible.
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
**Version 2, minor 1 (0.6.0)** (`STORAGE_VERSION = 2`, `STORAGE_MINOR_VERSION = 1`) ; la version 1 est migrée
automatiquement (voir ci-dessous). Runtime : version 2 (migration depuis la 1), écriture différée 1 s. Journal : version 1,
écriture différée 5 s.

```text
racine
├─ vacation        : bool
├─ labels[]        : id, name (1–30 car.), color, action
└─ programs[]      : id, revision, created_at, name (1–60 car.), icon?, area?, priority (1–100, défaut 10), enabled, reapply,
                     entities[] (1–100) : entity_id, default_label? (id d'étiquette), label_overrides{ label_id: action },
                                          allowed_services[], restrict_services
                     conditions[] : entity_id, attribute?, op (eq|ne|lt|gt), value
                     mode_source? : entity_id, mappings{ état_brut: id_du_mode }
                     active_profile, profiles[] (1–20) : id, name (1–40 car., unique),
                       days[0..6] : slots[] (≤ 50 par jour) : id, start, end?, conditions[] (≤ 10), color?, label (id d'étiquette)
runtime (`weekly_planner.runtime`) : par entité → segment courant, action en attente, reprises ; par programme → profil actif,
                     skip_at ; `conditions` → dernières valeurs connues des conditions (persistées pour le démarrage, § 5.5)
journal (`weekly_planner.journal`) : 14 jours glissants, deux sortes d'entrées : segment décidé
                     (`at, entity_id, segment, program_id, slot_id, action`) et action réellement envoyée (`at, entity_id, sent: true, action, reason`)
```
- `start`/`end` : `{"time": "HH:MM"}` (fin jusqu'à `24:00`) ou `{"sun": "sunset", "offset": 15, "earliest": "18:00", "latest": "21:00"}`.
- `action` (d'une étiquette ou d'une valeur propre) : `{"kind": "service", "service": "…", "data": {…}}` ou `{"kind": "scene", "scene": "…"}`.
- **Concurrence** : chaque écriture fournit la `revision` lue ; si elle a changé → refus « modifié ailleurs, recharger ».
- **Robustesse** : si le fichier existait mais se charge vide/corrompu (ou version non prise en charge) → **l'entrée ne
  se charge pas** (`ConfigStoreError`, `async_setup_entry` renvoie faux) : aucun programme ne tourne, le fichier n'est
  jamais réécrit, une notification persistante (`weekly_planner_storage`) demande de restaurer
  `.storage/weekly_planner` ; on ne repart jamais de zéro. (Le drapeau interne `read_only` et le bandeau « Lecture
  seule » de la carte existent, mais ce cas n'est pas atteint par une entrée chargée.) **Sauvegarde du fichier avant la
  migration** : copie `weekly_planner.v<N>-backup-<AAAAMMJJHHMMSS>` à côté de l'original ; retour à une version antérieure
  = restaurer la sauvegarde. (L'ancien `PlannerStore.async_backup`, jamais appelé, a été retiré en 0.19.0.)
- **Renommage / suppression d'entité** : écoute de `entity_registry_updated` → `entity_id` mis à jour partout (y compris
  valeurs propres, cibles explicites, sources de valeurs, scènes et sources de mode, § 17) ; entité supprimée → alerte
  Réparations `missing_entities`, vérifiée au démarrage et à chaque suppression dans le registre (pas à
  l'enregistrement d'un programme, § 21).

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

**Entités** : `switch.weekly_planner_<programme>` (attributs `program_id`, `active_profile`, `mode_source_state` et
`mode_source_status` (`matched | unmapped | unavailable`, seulement avec une source de mode), `current_slots`,
`next_change`, `skip_next`, `next_actions`) ;
interrupteur global `switch.weekly_planner_vacation` (identifiant historique conservé par `suggested_object_id`
« Vacation », nom affiché « Suspension de tous les programmes » / « All programs paused », § 5.6) ; appareil « Weekly
Planner » (`integration_type: service`) ; un `select` par programme nommé « Mode {programme} » / « {program} mode »
(clé de traduction `profile`, identifiant unique `<entry>_profile_<programme>` conservé, § 5.10).

**Services** (`weekly_planner.*`) :
- `apply_now` (programme) : envoie l'action en cours aux entités du programme dont le segment en cours appartient à ce
  programme, quel que soit `reapply` ;
- `skip_next` (programme) : la prochaine transition du programme n'est pas appliquée (persisté, une seule fois, annulable) ;
- `reload` (admin).
- *Retirés en 0.6.0 : `resume`, `override`.*

**API websocket** (`weekly_planner/…`) :
- `get` · `subscribe` : instantané `{vacation, labels, programs, status{programme: attributs du switch}, warnings{programme: […]},
  entities{entité: segment, target, suppressed, pending}, read_only, can_edit, card_version, defaults{reapply, priority}}`
  (`defaults` : champ additif, valeurs par défaut du serveur — option `reapply_default`, `DEFAULT_PRIORITY` = 10 — dont la carte
  initialise les nouveaux programmes, avec repli vrai / 10) ; `get` ajoute `is_admin` ;
  `subscribe` renvoie l'instantané à chaque changement ; `can_edit` est calculé par connexion.
- `program/save` (édition ; `revision` vérifiée) · `program/delete` (édition) · `label/save` · `label/delete` (suppression
  refusée tant qu'un programme l'utilise, erreur `in_use` avec la liste).
- `program/set_enabled` et `program/set_profile` : **ouverts à tous** (comme le switch et le select HA), même avec `admin_only` ;
  `set_profile` est refusé (`invalid`) sous contrôle d'une source de mode.
- `preview {program_id, date? (AAAA-MM-JJ, défaut aujourd'hui), profile_id?}` → `{date, slots: [{slot_id, start, end, ignored, sun}]}`
  (heures résolues, raison d'ignorance § 5.7).
- `journal {entity_id?, days? (1–14, défaut 1)}` → `{segments: […]}` (les deux sortes d'entrées du journal, § 8).
- Codes d'erreur : `conflict` (révision changée), `invalid` (validation), `unauthorized`, `not_found`, `in_use`, `not_loaded`.
- Codes de validation (dans le message de `invalid`) : `unknown_service`, `invalid_service_data`, `service_not_for_entity`,
  `unknown_label`, `unknown_mode_profile`, `empty_mode_state`, `circular_mode_source`, `duplicate_profile_name`,
  `overlapping_slots`, `random_window_too_short`, `earliest_after_latest`, `service_data_target`, `invalid_random_minutes`,
  `invalid_service_data_sources`.
- *Retirés : `mode/save`, `mode/delete`.*

**Droits**
- `admin_only` (option globale, désactivée par défaut) : si actif, seule l'édition des programmes et étiquettes est réservée
  aux admins.
- **Toujours réservé aux admins** : toute action visant un domaine sensible (`homeassistant`, `hassio`,
  `alarm_control_panel`, `lock`, `alarmo`, `shell_command`, `python_script`, `pyscript`, `rest_command`).

**Avertissements** affichés dans la carte (jamais bloquants), `{entity_id, code, detail}` : `other_program` (autre programme
actif sur la même entité), `automation` (automatisation active qui la vise), `scheduler` (`switch.schedule_*` actif),
`incompatible_label` (étiquettes ignorées pour cette entité), `missing` (entité absente).

**Options** : `admin_only` ; délai d'alerte `notify_delay_min` (1–1440 min, 30 par défaut) ; `reapply_default` (proposé,
mais **non utilisé** : § 21) ; anti-rebond `debounce_min` (0–60 min, 2 par défaut). Une modification des options recharge
l'entrée. Instance unique.
**Désinstallation** (`async_remove_entry`) : retrait de la ressource Lovelace, des entités et du stockage.

## 10. Carte `weekly-planner-card`

### 10.1 Configuration de la carte (éditeur visuel)
Options réelles : `title` ; `program: <id>` **ou** `filter: {types: [domaines], area: <zone du programme>, programs:
[ids]}` (`programs` absent = tous, futurs compris ; liste vide = aucun ; intersection avec type et zone) ;
`schedule_view: bars | radial | radial_12h | list` (défaut `bars`) ; `show_chart` (défaut vrai).
`show_week` et `show_advanced` sont encore déclarés dans le type `CardConfig` mais **n'ont aucun effet** (anciennes
options ; la semaine est toujours repliable).
Éditeur visuel Lovelace : onglets « Affichage de la carte » et « Réglages des programmes » (ce dernier pour les
administrateurs) ; filtres de types dynamiques (§ 14.12), zone, programmes à afficher (section repliable), vue, graphique.

### 10.2 Consultation (par défaut)
- Quatre vues : barres (défaut), cadran 24 h, double cadran 12 h, liste compacte (un programme déplié à la fois, chevron).
- Une ligne par appareil : **icône, nom du programme, état traduit** (`formatEntityState`), et
  « → libellé de la prochaine action + heure » (« demain » si c'est demain) ; ligne « Mode : … » quand le programme a
  plusieurs modes ou une source de mode.
- À droite : interrupteur du programme (arrêt confirmé, double envoi bloqué, désactivé en lecture seule), bouton
  calendrier (`mdi:calendar-edit`) qui ouvre l'**écran d'horaires**, badge rouge « Désactivé » sous les contrôles.
- Dessous : barre du jour avec trait « maintenant » (heure du **serveur**), « Semaine » repliable (7 barres, lundi →
  dimanche, chaque nom de jour est un bouton qui ouvre l'écran d'horaires sur ce jour). Aucune ligne de dérogation ;
  aucune commande immédiate (c'est un planificateur).
- La ligne elle-même **n'est pas cliquable** : un appui court au doigt sur une barre ouvre l'écran d'horaires ; un appui
  long (doigt) ou un clic (souris) entre dans l'édition sur place (§ 10.8).
- En-tête : titre, pastille « Tous les programmes suspendus » quand l'interrupteur global est actif, bouton « Étiquettes »
  (`mdi:label-multiple-outline`) pour un administrateur qui peut éditer, si la carte n'est pas fixée sur un programme.
- Bandeau « Lecture seule » si le stockage est en lecture seule ; état vide « Aucun programme pour l'instant » ou « Aucun
  programme ne correspond aux filtres » ; bandeau « Modifié · Annuler » 6 s après une édition sur barre.
- Mise à jour : abonnement `subscribe` ; rechargement automatique quand `card_version` change (page au repos), vérifié
  aussi par un `get` toutes les 5 min et au retour de la page visible (`visibilitychange`).

### 10.3 Écran d'horaires et réglages
*Mise à jour 0.8–0.18 :* l'engrenage a été retiré (0.8.0). Les réglages partagés vivent dans l'éditeur visuel Lovelace,
onglet « Réglages des programmes » : choix du programme à modifier (« Nouveau programme » en tête), onglets
**Général** (nom, icône, zone, priorité, conditions, réappliquer), **Appareils** (défaut, actions proposées par appareil
avec descriptions HA) et **Modes** (modes, mode actif, source de mode et associations repliables) ; création courte
(nom + appareils) avec reprise du brouillon ; Annuler / Rétablir (Ctrl/Cmd+Z, Ctrl/Cmd+Maj+Z, Ctrl/Cmd+Y) ; dupliquer,
supprimer (confirmé). L'écran d'horaires garde : schéma des 7 jours (reflète le brouillon), sélecteur du mode à
éditer, lignes d'horaires, formulaire d'horaire (pastilles Lever / Coucher, décalage, « Pas avant » / « Pas après »,
délai aléatoire, pas ±15 min, « Appliquer à d'autres jours »), dupliquer, supprimer (§ 18), fermeture par glissement
vers le bas sur téléphone. Le texte ci-dessous décrit la 0.6–0.7 ; l'engrenage qui y figure n'existe plus.
- **Écran d'horaires** : lignes d'horaires (pastille de la couleur de l'étiquette + nom) ; formulaire d'horaire (début,
  fin facultative, jours) dont la section « Action » liste les étiquettes compatibles en pastilles colorées ;
  « + Nouvelle étiquette » ouvre un mini-formulaire en ligne (nom, couleur, action par le sélecteur générique ou une
  scène) qui crée l'étiquette et la sélectionne ; pour l'étiquette choisie, un lien « Valeur pour cet appareil »
  modifie la valeur propre de l'appareil (même sélecteur) avec « Revenir à la valeur commune » ; ligne « Le reste du temps » :
  une étiquette ou « Rien » ; interrupteur de pause, dupliquer, supprimer (confirmé, bouton rouge isolé).
- **Écran « Étiquettes »** (administrateurs) : ligne « Étiquettes » au-dessus de la liste des programmes ; liste des
  étiquettes (pastille, nom, résumé de l'action, nombre d'usages) ; renommer, recolorer, changer l'action, supprimer
  (refusé tant qu'elle est utilisée, avec la liste des programmes).
- ~~**Réglages (engrenage, administrateurs)** : nom, icône, priorité, conditions, « refaire l'action en cours au
  redémarrage », appareils, saisons (profils).~~ *Remplacé en 0.8.0 par l'éditeur visuel Lovelace (voir l'encadré
  ci-dessus) ; les « saisons » sont devenues les **modes** en 0.16.0 (§ 5.10).*
- **Étiquettes** : bouton d'en-tête de la carte (§ 10.2) et non plus ligne au-dessus des programmes ; sélecteur
  d'étiquette avec palette de 12 couleurs, valeur propre par appareil et « Revenir à la valeur commune ».
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
Clavier (0.19.1) : les barres se focalisent avec Tab, Entrée ou Espace lance l'édition (ouvre le jour en lecture
seule) ; Échap ferme toujours la fenêtre ouverte la plus récente, même si le focus est retombé sur la page, et le
focus revient à l'élément qui l'avait ouverte ; boutons de jour ≥ 44 px.

### 10.6 Livraison du JS
Lit + TypeScript, bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` (commité). Servi par
`async_register_static_paths` ; **ressource Lovelace** (mode storage) avec `?v=<hash>` ; `add_extra_js_url` seulement
en mode YAML ; garde `customElements.get()` avant `define`.

### 10.7 Mode simple et « Plus d'options » — *retiré* (depuis la 0.3 ; la carte n'a plus de commande immédiate ni de dérogation)
*Note : `frontend/src/components/gestures.ts` cite encore « spec § 10.7 » pour ses aides gestuelles (balayage, appui
long) ; l'appui long des barres est décrit au § 10.8.*
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
  unique (mémorisé dans `sessionStorage`) ; `get` interrogé aussi toutes les 5 min et au retour de la page visible.
- Les éditions sur barre, les reprises de conflit et « Annuler » restent attachées au mode d'origine (§ 17) ; la
  fenêtre de conflit de « Copier vers… » bloque Échap tant qu'elle est ouverte.
- *Non fait :* l'astuce « Restez appuyé pour modifier » après un appui court (§ 14.12, § 21).

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
- `manifest.json` : `dependencies` = `http`, `websocket_api` ; `after_dependencies` = `frontend`, `logbook`, `lovelace`,
  `repairs` ; `single_config_entry: true`.
- `scripts/deploy_prod.sh` : copie de l'intégration vers `/config/custom_components/weekly_planner` de la prod
  par SSH/rsync (`WP_HOST`, `WP_CONFIG`) : essai à blanc par défaut, `--apply` pour copier après les tests Python et
  carte ; indique la révision (et l'état non commité) et l'empreinte SHA-256 du bundle. Ne redémarre rien et ne
  sauvegarde pas HA : la sauvegarde avant un changement Python se fait à part (AGENTS.md).
- CI (`.github/workflows`) : `hacs/action`, `hassfest`, pytest, et pour la carte `tsc --noEmit`, vitest, build et
  vérification que le bundle commité est à jour. *Pas de test Playwright ni de lint de la carte en CI* (prévus
  initialement).
- `hacs.json`, `manifest.json` (`domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`,
  `config_flow`, `iot_class: calculated`, `integration_type: service`, `dependencies: [http, websocket_api]`).
- Docs : README (en) + `README.fr.md`, captures, CHANGELOG ; releases GitHub. Tags et release GitHub seulement jusqu'à
  `v0.7.10` ; les versions 0.8.0 à 0.19.1 ne sont ni taguées ni publiées, `main` est derrière `develop` ; pas de `1.0.0` (§ 21).
- Garde-fous de qualité (0.19.1) : couverture Python (`pytest --cov`, plancher 85 %, mesuré 87-89 %) et carte
  (vitest, planchers 49 / 78 / 45 / 49 pour instructions / branches / fonctions / lignes) ; tests de mutation
  informatifs (mutmut, StrykerJS, `mutation.yml` hebdomadaire, jamais requis, modules purs seulement) ; budgets de
  performance (`tests/test_performance.py`, `tests/test_latency.py`, `frontend/src/__tests__/performance.test.ts`,
  médianes via `scripts/bench.py`) : comptes d'opérations déterministes et temps jugés sur le meilleur de N essais.
- Contribution assistée : consignes communes dans `AGENTS.md` ; notes de contexte locales facultatives dans
  `PROJECT_MEMORY.md` (ignoré par Git), utilisables avec différents outils d'IA.

## 13. Définition de « fini » (v1)

1. **Tests automatiques verts** : `uv run --group test pytest -q` et, pour la carte, `tsc`, vitest et build. Les scénarios
   encore valables du § 14.9 (ceux marqués « retiré en 0.6.0 » sont sans objet) ; tests Python actuels : `test_timeline`,
   `test_resolver`, `test_engine`, `test_engine_more`, `test_actions`, `test_action_sources`, `test_action_targets`,
   `test_mode_sources`, `test_random_times`, `test_migration`, `test_websocket`, `test_config_flow`, `test_qa_regressions`.
2. **Test réel en prod** (copie par script) ≥ 3 jours sur le banc d'essai :
   début, fin, action par défaut, action ponctuelle, changement de mode (manuel et par source), redémarrage de HA (avec
   accord), entité rendue injoignable (désactivation temporaire de l'entité), entrées du journal de bord vérifiées
   une à une. *(Les exigences « dérogation à la main », « Déroger… », Adaptive Lighting et Versatile Thermostat sont
   retirées depuis la 0.6.0.)*
3. **Vérification visuelle** selon `docs/controle-visuel.md` (360 px et ≥ 1400 px, clair/sombre, chaque modale, glisser,
   copie, modes, graphique, clavier) ; zéro erreur console ; temps de rendu mesuré. `controle-visuel.md` décrit encore
   la carte d'avant la 0.6 (dérogations, `show_week`) et doit être remis à jour (§ 21).
4. CI verte ; puis installation propre via HACS (dépôt personnalisé ; le dépôt est public) et désinstallation propre.

## 14. Tâches

### 14.1 Socle
- [x] Squelette du dépôt (arborescence § 12, `hacs.json`, `manifest.json`, `brand/`, README minimal)
- [x] Environnement de dev + entités de démonstration (instance HA locale en Python, Docker Desktop ne télécharge plus d'images ; `scripts/dev_ha.sh`, `scripts/dev_onboard.py`)
- [x] Python 3.14 (`uv`) + dépendances de test
- [x] CI : hacs/action, hassfest, pytest, tsc + vitest + build carte, bundle à jour
- [x] **Prototype** : carte embarquée chargée comme ressource sur HA 2026.10 (vérifié à la main ; test S33 manquant, § 21)

### 14.2 Moteur
- [x] Modèle + `Store` versionné + robustesse + migration (S20, S28)
- [x] Plages d'un jour : fixes, soleil + bornes, minuit, `24:00`, DST, plages ignorées (S2, S3, S4, S26, S27)
- [x] Résolution par entité : priorités, conditions, Vacances, défauts, état hors plage (S9, S10, S11, S12, S16, S24)
- [x] Minuteur unique + recalcul + segments + abandon des actions périmées (S1, S21)
- [x] Exécution : ordre, confirmation, grâce, essais espacés, entités injoignables (S13, S14, S22)
- ~~Dérogation : règles § 5.3, persistance, `resume` (S5, S6, S15, S23, S25)~~ — *sans objet (retiré en 0.6.0)*
- [x] Redémarrage / activation / modification, stabilisation, rattrapage des fins (S7, S8, S29)
- [x] Conditions : dernière valeur connue, anti-rebond (S30)
- [x] Journal de bord, journal des segments, notifications (S31)
- [x] Renommage / suppression d'entités, alertes Réparations (S32)
- ~~Dérogation volontaire avec échéance + service `override` (S35)~~ — *sans objet (retiré en 0.6.0)*
- [x] Profils + `select` du profil actif (S36)
- ~~Adaptive Lighting : contrôle manuel pendant une consigne fixe, repli switch (S37)~~ — *sans objet (retiré en 0.6.0)*
- [x] Activation / redémarrage hors plage : défaut appliqué (S38)

### 14.3 Intégration HA
- [x] Config flow (instance unique) + options flow
- [x] Switchs (programmes, Vacances) + appareil
- [x] Services + API websocket + droits (S19, S34)
- [x] Détection des pilotes concurrents et contrôles VT (`check`) (contrôles VT retirés en 0.6.0)
- [x] Traductions fr / en
- [x] Désinstallation propre (code `async_remove_entry` : ressource Lovelace et stockage retirés ; test S33 manquant, § 21)

### 14.4 Carte
- [x] Outillage Lit/TS + bundle + ressource + cache-busting
- [x] Éditeur visuel de la carte
- [x] Vue consultation
- [x] Modale Programme
- [x] Modale Jour (glisser + loupe + ±5 min, liste, copie)
- [x] Modale Plage
- ~~Modes communs par type (page « Modes »)~~ — *sans objet (retiré en 0.6.0)* ; les **modes de programme** (semaines
  types) sont une autre fonction, revenue en 0.16.0 (§ 5.10, tâche « Modes unifiés » ci-dessous)
- [x] Graphique 24 h
- [ ] Responsive, thèmes, clavier, fr/en, mesure de rendu

### 14.5 Compatibilité
- ~~Versatile Thermostat (requested_state, verrou, avertissements, fenêtre)~~ — *sans objet (retiré en 0.6.0)*
- ~~Evohome (dérogation permanente, grâce 6 min)~~ — *sans objet (retiré en 0.6.0)*
- ~~Adaptive Lighting (Automatique, contextes, switch de zone)~~ — *sans objet (retiré en 0.6.0)*

### 14.6 Documentation et publication
- [x] README en / fr, captures, CHANGELOG, `docs/controle-visuel.md`
- [x] `scripts/deploy_prod.sh`
- [x] Releases `0.1.0` à `0.7.10` taguées (`v0.7.10` = dernière release GitHub, sur `main`)
- [ ] Tags / releases des versions 0.8.0 à 0.19.0 (non taguées, `main` derrière `develop`), puis `1.0.0` (§ 21)
- [x] Dépôt public (GitHub `movrack/ha_weekly_planner`), `hacs.json`, `hacs/action` en CI
- [ ] Installation propre via HACS vérifiée, demande d'inclusion dans la liste HACS par défaut (§ 21)

### 14.7 Validation réelle (banc d'essai)
- [ ] Déploiement en prod par script — *le script existe (§ 12) ; aucun déploiement de version finie n'est consigné
      dans le dépôt, à confirmer par le propriétaire*
- [ ] Test réel déroulé ≥ 3 jours (§ 13, § 21)
      *en cours — le propriétaire indique que les tests réels sont OK à ce jour (2026-10-31) ; durée ≥ 3 jours et version testée non consignées*

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
- ~~S5 dérogation pendant la plage : rien réappliqué, fin appliquée~~ — *sans objet (retiré en 0.6.0)* ; le test marqué S5
  vérifie désormais l'inverse : un changement manuel est ignoré par le moteur
- ~~S6 dérogation puis redémarrage : dérogation conservée~~ — *sans objet (retiré en 0.6.0)*
- [x] S7 redémarrage en cours de plage, `reappliquer` oui / non
- [x] S8 fin de plage manquée pendant l'arrêt → rattrapée
- [x] S9 deux programmes, priorités, reprise de la main
- [x] S10 condition de programme qui bascule en pleine plage
- [x] S11 condition de plage
- [x] S12 Vacances on / off
- [x] S13 entité injoignable puis revenue (dans et hors plage) ; notification après délai, retirée ensuite
- ~~S14 thermostat cloud lent (confirmation à 2 min, rafraîchissement 5 min) : pas de fausse dérogation~~ — *sans objet (retiré en 0.6.0)*
- ~~S15 Adaptive Lighting : pas de fausse dérogation~~ — *sans objet (retiré en 0.6.0)*
- ~~S16 défaut « état d'avant » avec deux programmes qui se croisent~~ — *sans objet (retiré en 0.6.0)*
- ~~S17 modification d'un mode utilisé par plusieurs programmes~~ — *sans objet (retiré en 0.6.0)*
- [x] S18 suppression d'un programme en pleine plage
- [x] S19 `admin_only` ; actions sensibles refusées aux non-admins
- [x] S20 migration du stockage n → n+1 ; sauvegarde
- [x] S21 plage courte + action lente : l'essai périmé n'est pas renvoyé
- ~~S22 VT verrouillé : échec immédiat et alerte~~ — *sans objet (retiré en 0.6.0)*
- ~~S23 VT fenêtre ouverte : pas de dérogation, vérification sur `requested_state`~~ — *sans objet (retiré en 0.6.0)*
- [x] S24 défaut « rien » et plage ponctuelle
- ~~S25 volet lent : pas de fausse dérogation pendant le mouvement~~ — *sans objet (retiré en 0.6.0)*
- [x] S26 plage solaire vide un jour donné (ignorée, signalée)
- [x] S27 fin `24:00`, chevauchement entre jours ; `00:00 → 00:00` accepté comme horaire de 24 h (§ 5.7)
- [x] S28 stockage corrompu : l'entrée ne se charge pas, fichier intact (+ notification, § 8)
- [x] S29 actions ponctuelles jamais réappliquées
- [x] S30 condition sur entité indisponible ; anti-rebond
- [x] S31 journal des segments utilisé pour le passé du graphique
- [x] S32 renommage et suppression d'entité
- [x] S33 ressource Lovelace : création, mise à jour de version, retrait à la désinstallation (`tests/test_frontend_resource.py`)
- [x] S34 `revision` : écriture concurrente refusée
- ~~S35 « Déroger… » : durée, jusqu'à HH:MM, fin de plage, « Reprendre » avant terme, redémarrage pendant~~ — *sans objet (retiré en 0.6.0)*
- [x] S36 changement de profil en pleine plage
- ~~S37 lumière sous Adaptive Lighting avec consigne fixe : pas de réajustement, rendue à AL à la fin~~ — *sans objet (retiré en 0.6.0)*
- [x] S38 activation / redémarrage hors plage : défaut appliqué (et pas appliqué si `reappliquer = non`)
- ~~S39 plages contiguës au même mode / défaut identique : la fin efface un réglage manuel~~ — *sans objet (retiré en 0.6.0)* ;
  les tests marqués S39 vérifient désormais que deux horaires contigus sont deux segments qui envoient chacun leur action
- ~~S40 cible effective : « Déroger… » ne déclenche ni essais ni alerte ; `reappliquer = non` non plus~~ — *sans objet (retiré en 0.6.0)*
- ~~S41 AL oublie le contrôle manuel (bascule du switch de zone, redémarrage) : réaffirmé, pas de fausse dérogation~~ — *sans objet (retiré en 0.6.0)*
- [x] S42 `skip_next` et `apply_now`
- ~~S43 retrait d'une entité Evohome : remise en suivi de programme~~ — *sans objet (retiré en 0.6.0)*
- ~~S44 échéance de dérogation volontaire tombée pendant un arrêt de HA~~ — *sans objet (retiré en 0.6.0)*

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

### 14.10 bis Version 0.7.0
*(Numéro « 14.10 » en double dans l'historique ; renommé « 14.10 bis » pour le distinguer de la 0.6.0.)*
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

### 14.11 Version 0.7.3
- [x] Spec § 6 : « Actions proposées » par appareil (`entities[].allowed_services`), cadre de l'étiquette en lecture seule + un crayon / un formulaire, un seul Enregistrer / Annuler visible
- [x] Réglages (engrenage, onglet Appareils) : liste à cocher « Actions proposées » par appareil, noms traduits ; vide ou absent = toutes ; nouveaux appareils : toutes
- [x] Carte : sélecteur de services (`servicesFor`) et `labelsFor` restreints aux services autorisés (les scènes restent permises)
- [x] Serveur : validation de `allowed_services` (liste de chaînes) ; étiquette dont le service n'est pas autorisé = incompatible pour cet appareil (ignorée, avertissement) ; tests pytest
- [x] Bug : la liste « Mode CVC » (`hvac_mode`) est vide : contexte (`filter_entity`, `filter_attribute`, `entity_id`) transmis à chaque `ha-selector`, options construites depuis l'attribut de l'appareil en repli (`hvac_modes`, `preset_modes`, `fan_modes`, `swing_modes`)
- [x] Cadre de l'étiquette : lecture seule (pastille, nom, « Partagé », résumé de l'action avec valeurs, « Valeur pour cet appareil » seulement si elle existe) ; un crayon ouvre UN formulaire (nom, couleur, action, valeur pour cet appareil + « Revenir à la valeur commune ») ; idem dans l'écran d'horaires et sous une barre
- [x] Jamais plus d'une paire Enregistrer / Annuler : dans une ligne d'horaire dépliée, le formulaire d'étiquette n'a pas de boutons (modifs = brouillon de l'horaire ; Enregistrer enregistre l'étiquette puis l'horaire, Annuler jette les deux ; Dupliquer et Supprimer masqués pendant l'édition) ; sous une barre et dans « Étiquettes », une seule paire
- [x] Info-bulles : icônes soleil (« Coucher du soleil + 30 min · 17 h 55 ») et « maintenant » (« Maintenant · 14 h 05 ») des barres (`day-bar`, `bar-editor`) et du graphique ; survol et focus clavier, toucher = 2 s sans entrer en édition ni sélectionner ; même texte en `aria-label` ; zone tactile ≥ 32 px
- [x] Tests vitest et pytest, vérification navigateur (360 px et ≥ 1400 px), captures
- [x] Version 0.7.3 (manifest, pyproject, package.json, lock), CHANGELOG

### 14.12 À faire et suivi 0.8 → 0.16
*(Liste tenue au fil des versions, sans ordre chronologique ; les éléments datés indiquent leur version.)*
- [x] Première documentation utilisateur française, atlas des 36 écrans actuels et 13 captures complémentaires (49 PNG), liens vérifiés et images versionnables.
- [x] Faire respecter l’option globale `reapply_default` lors de la création d’un programme (serveur et formulaire, `defaults` du snapshot, 0.19.0).

- [x] Déploiement indépendant des commits : arbre de travail testé autorisé en journée, contrôles préservés et empreinte du bundle indiquée, règle clarifiée dans AGENTS.md.

- [x] 0.10.0 : Annuler la modification / Rétablir dans l’éditeur de programme ; 50 étapes locales, saisies regroupées, appareils/conditions/saisons/duplication, historique conservé pendant la navigation puis remis à zéro après enregistrement réussi.

- [x] 0.9.1 : conserver les brouillons par programme durant la session de configuration ; une sauvegarde en arrière-plan ne change pas la sélection courante.
- [x] Cadran visible avec indication de disponibilité ; saison active distincte de celle à gérer, accès direct au sélecteur HA existant.
- [x] Saisons : libellés visibles, une seule action Appliquer pour le nom et le programme, portée partagée près du bouton ; navigation clavier des onglets.

- [x] 0.9.0 : appareils avant l’icône, icône issue des métadonnées HA, programmes concurrents signalés.
- [x] Nouveau programme en tête avec séparateurs ; titre de modale agrandissable.
- [x] Cadran 24 h facultatif (lecture + ouverture des horaires), liste compacte et bascule sur la carte.
- [x] Masquer les étiquettes globales dans la vue un programme ; guides saisons/actions et revue Mamy.

- [x] Filtres de types entièrement dynamiques : domaines de toutes les entités des programmes, sans dépendre de leur disponibilité ; conserver les filtres déjà sélectionnés même sans programme correspondant. Noms traduits par HA, repli sur le domaine brut, tri par libellé. Aucune liste de types supportés ni filtre implicite thermostat pour une nouvelle carte.
- [x] 0.8.0 : déplacer Général / Appareils / Saisons dans l’éditeur visuel Lovelace ; création, duplication et suppression depuis cet écran, retrait de l’engrenage des horaires.
- [x] Réglages partagés appliqués explicitement, indépendamment du widget ; fusion sur données fraîches et une reprise sur conflit, sans perdre les horaires modifiés ailleurs.
- [x] Sélecteur d’action compact : liste déroulante, description HA de l’action choisie visible et infobulle sur les options ; absence de description indiquée.
- [x] Dans le formulaire d’horaire, toucher « Tous les jours » déjà sélectionné désélectionne les sept jours.
- [x] Afficher les sept barres de semaine au-dessus des horaires, conservées pendant l’édition et mises à jour avec le brouillon.
- [x] Barres sur mobile : un simple toucher affiche 2 s « Restez appuyé pour modifier » (les 3 premières fois
      seulement, mémorisé par appareil), puis ouvre l'écran du jour comme aujourd'hui. *(Fait en 0.19.0.)*

## 15. v2 (hors périmètre)
- Import des programmes `scheduler-component` (`.storage/scheduler.storage`, version 3) — nécessite plages ponctuelles et défaut « rien » (présents en v1).
- Import des automatisations HA à déclencheur horaire / solaire (conversion assistée ; l'automatisation d'origine est désactivée, pas supprimée).
- Droits par rôle / utilisateur / profil.

## 16. Questions tranchées (relecture n° 1)
*Historique conservé. Les réponses marquées « dépassé » ne décrivent plus le produit actuel.*
- Q-B Programme activé / HA redémarré **hors plage** : l'état par défaut est appliqué tout de suite (si `reappliquer`).
  — *Dépassé dans sa forme : il n'y a plus d'« état » par défaut mais une **action** par défaut ; le comportement
  reste celui du § 5.5 (S38).*
- Q-C ~~Dérogation depuis la carte : bouton « Déroger… » (§ 5.9). Dérogation externe : jusqu'à la fin de la plage.~~
  — *Dépassé : toute dérogation est retirée en 0.6.0 (§ 5.3, § 5.9).*
- Q-D Profils par programme (§ 5.10).
- Q-E ~~« Automatique » = switch Adaptive Lighting **ou** script / automatisation (§ 6.1).~~ — *Dépassé : retiré en 0.6.0.*
- Q-F `admin_only` **désactivé** par défaut ; droits par rôle / utilisateur / profil en v2.
- Q-G Lumière sous Adaptive Lighting + consigne fixe : `adaptive_lighting.set_manual_control` sur la lumière pendant
  la plage, réaffirmé quand AL l'oublie, rendue à AL à la fin (§ 6.1). Le repli « couper le switch de zone » est
  abandonné (relecture n° 2 : il remet à zéro toute la zone). — *Dépassé : Adaptive Lighting n'est plus connu depuis la 0.6.0 (§ 11).*
- Q-H ~~Toucher une barre de jour : modale de lecture (graphique + liste) puis « Modifier ».~~ — *Dépassé : un appui court
  ouvre l'écran d'horaires, un appui long / clic édite la barre sur place (§ 10.2, § 10.8).*

## 16 bis. Questions produit (relecture n° 2)
*Historique conservé ; voir les notes « dépassé ».*
- Q-I ✅ Vacances, désactivation ou changement de profil annulent la dérogation volontaire. — *Dépassé : plus de dérogation (0.6.0).*
- Q-J ✅ Un programme désactivé libère ses entités (son défaut ne vaut que pour sa propre désactivation) ; Vacances : défaut du plus prioritaire, une fois.
  — *Toujours valable (§ 5.4) ; « Vacances » désigne ici l'interrupteur global « Suspension de tous les programmes », pas le mode Vacances (§ 5.10).*
- Q-K ✅ Le réglage à la main l'emporte et remplace la dérogation volontaire (devient externe, échéance oubliée). — *Dépassé : plus de dérogation ni de détection du réglage à la main (0.6.0).*
- Q-L ✅ Sautée (priorité et dérogation l'emportent). — *En partie dépassé : l'action ponctuelle est toujours sautée si un
  programme plus prioritaire est dans un horaire (§ 5.2) ; la dérogation n'existe plus.*
- Q-M ✅ Oui : avec `admin_only`, un non-admin garde lecture, switchs, Reprendre, Déroger…, profil ; à revoir en v2 (rôles).
  — *« Reprendre » et « Déroger… » n'existent plus ; lecture, interrupteurs (`program/set_enabled`) et mode (`program/set_profile`) restent ouverts (§ 9).*

*Les cases qui suivent sont des tâches livrées entre la 0.9 et la 0.16, ajoutées ici au fil de l'eau : elles prolongent
le § 14.12 (laissées en place pour garder l'historique).*

- [x] Cadrans : fond gris identique aux barres, couleurs des créneaux conservées, traits horaires et icônes soleil avec les mêmes info-bulles. Option deux anneaux 12 h (matin intérieur avec 3/6/9/12, après-midi extérieur avec 15/18/21/24), en plus du 24 h.

- [x] Bascule programme : réabonnement après retour sur une vue conservée par HA ; état partagé entre barres, cadrans, liste, horaires et interrupteur HA. Confirmation annulée sans modification et double envoi bloqué.

- [x] Accès Nouveau programme près du choix du programme de la carte ; raccourci Modifier ce programme ; sélecteur Programme à modifier toujours visible dans les réglages, avec tous les programmes et conservation des brouillons.

- [x] Création sur un écran nom + appareils + Créer le programme, puis retour à l’affichage avec sélection du programme créé. Reprise explicite du brouillon après navigation ; appareils des programmes existants uniquement dans leur onglet. Parcours créé/repris/enregistré testé sur instance locale.

- [x] Liste compacte : clic sur un programme déplie ses barres sur place, second clic replie, autre programme referme le précédent. Bascule indépendante ; calendrier explicite pour ouvrir les horaires.

- [x] Cadrans 24 h et double 12 h utilisables en liste filtrée, sans choix grisés ni obligation de choisir un seul programme.

- [x] Valeurs des actions de service issues d’une entité/helper : `data_sources[field] = {entity_id, attribute?, type}` (nombre, booléen, texte ou valeur native). Priorité sur `data[field]`, lecture uniquement à l’exécution ; aucune réaction automatique au changement de la source. Source inconnue/indisponible ou conversion invalide : action refusée sans ancien défaut. Sélection générique de la source et de son attribut dans les étiquettes, résumés identifiant la source.

- [x] Programme désactivé : badge rouge Désactivé en haut à droite sous les contrôles, commun aux barres, cadrans et liste compacte ; remplace l’icône pause.

- [x] Une étiquette peut appeler une action sur une autre entité : `target_entity_id` explicite, bouton My position via `button.press` ou autre service découvert dans HA. Sélection de cible et action génériques, résumés identifiant la cible, valeurs propres par appareil conservées, protections des cibles dans data/data_sources maintenues.

- [x] Nouvel appareil : aucune commande cochée, liste ouverte et invitation à choisir dès la création du programme. restrict_services=true rend une sélection vide réellement restrictive ; configurations historiques conservées, dernière case décochable et choix disparus conservés.

- [x] Description HA traduite visible sous chaque action à cocher, lisible au toucher et associée à la case pour le lecteur d’écran ; pas de description inventée si absente.

- [x] Modes unifiés, source externe générique avec associations, sélection manuelle, édition inactive isolée et nommage de la suspension globale clarifié ; données et identifiants existants conservés.

- [x] Sélection des programmes affichés par carte dans une section repliable de l’éditeur Lovelace : `filter.programs` absent = tous (futurs compris), liste vide = aucun ; intersection avec type/zone, sans effet sur l’exécution.

- [x] Revue Mamy 0.16.0 : valeurs natives synchronisées après options ; activation immédiate signalée ; ajout appareil supplémentaire facultatif ; aide zéro commande et bouton Définir les horaires après création ; associations repliables et action principale unique accessible pendant le défilement.

- [x] Première revue Mamy : filtre sur les zones des programmes, affectation explicite dans Général et message de filtre sans résultat ; graphique distinguant historique absent, futur ou indisponible et absence d’action prévue.

- [x] Documentation utilisateur et intégrateur 0.16.2 : guide Mamy, atlas distinguant 49 anciennes captures et 9 captures actuelles, modes, commandes, sources et zones.


## 17. QA follow-up — 0.16.3

- [x] Bind bar edits, conflict retries and Undo to the originating mode; refuse Undo over a concurrently changed day.
- [x] Invalidate solar previews on active-mode changes and retry transient failures with a bounded delay.
- [x] Recover the shared subscription after failure with backoff and cancel retries after the last consumer leaves.
- [x] Use consecutive HA-local calendar dates across 23/25-hour days.
- [x] Share a visible-page refresh signal for today's charts; bound history retention per connection and calculate numeric bounds without argument spreading.
- [x] Sort temporal lookup inputs once and use binary searches for chart attribution and interval ends.
- [x] Profile and, if justified, remove the remaining chart render scans per manual interval; deduplicate/lazily load seven-day previews across cards (shared preview cache, 0.19.0).
- [ ] Complete a browser visual/interaction regression pass on the local test instance; production validation remains separate.

- [x] Follow all typed entity references during registry rename, including global/overridden action sources and targets, scenes and mode sources; advance configuration revisions.
- [x] Accept typed minute precision through websocket validation while preserving minimum duration.
- [x] Recheck revision immediately before a save mutation after asynchronous metadata preparation.
- [x] Index condition dependencies by entity and avoid timer reconstruction for ordinary watched state updates without a relevant deadline change.
- [x] Share the derived websocket snapshot within one synchronous notification, with per-connection permissions copied separately.
- [x] Cancel/invalidate obsolete action generations when a segment changes or a replacement target is unavailable; preserve eager task execution and ignore obsolete completions.
- [x] Profile repeated status work outside websocket notification cycles, including switch attributes and version checks, before adding broader caching (status memoised within one notification, 0.19.0).
- [ ] Broader architecture/module refactoring remains outside this focused correction batch.


## 18. Schedule deletion — 0.16.4

- [x] Keep Delete visible in the schedule form, including a pending label draft and a new unsaved slot.
- [x] Confirm existing-slot deletion and apply it to fresh data in the edited mode/day only; ignore unsaved label changes and preserve other slots, days and modes.
- [x] For a new unsaved slot, Delete discards only the local draft without confirmation or a server write.
- [x] Refuse deletion during a save or when editing is forbidden; cancelled confirmation preserves the draft.


## 19. Daily random time windows — 0.17.0

Each start or end TimeSpec may include optional `random_minutes`, an integer from 0 to 240. Absent/zero preserves the existing time exactly. The form offers a per-boundary checkbox and defaults to 15 minutes when enabled; the user can set 1–240 minutes or disable it explicitly. This is a delay after the configured time, never an advance.

Resolve the configured local fixed time or solar event/offset/bounds first, using the existing DST and solar-rounding rules. Add an integer elapsed-minute delay in UTC. A solar `latest` remains a true cap after the delay. Overnight selection is based on the original boundaries, before jitter; the occurrence retains its original local date even if its delayed action falls on the next day.

The daily draw is derived from stable program, profile, slot, original local occurrence date and boundary identity. Recalculation, preview, restart and all entities of the same slot share the same draw. Different days have independent deterministic draws, which may coincidentally be equal. No additional polling, timer per slot, persistent random state or device-specific rule is introduced.

For fixed-time ranges, reject settings whose maximum start delay would leave less than five minutes before the earliest end. Validate the full possible occupied intervals across the week, including midnight and Sunday/Monday, rather than one sampled draw. Existing seasonal solar/DST invalid-occurrence handling remains in force. The single resolved schedule remains the source for engine and preview.

- [x] Validate optional windows and preserve absent/zero behavior and minute precision.
- [x] Verify deterministic per-occurrence draws across recomputation, preview and restart, with independent boundary identities.
- [x] Preserve DST, overnight occurrence identity, solar latest caps, minimum duration and weekly overlap safety.
- [x] Show clear per-boundary controls and preserve settings through time/solar edits, grouping and duplication.
- [x] Display resolved intervals and previous-day tails without inventing nominal random forecasts; dragging a boundary to an exact time removes randomness only from that boundary.
- [x] Complete Python/TypeScript/frontend checks and rebuild the shipped card; local visual verification remains separate from production deployment.

### 19.1 Clear random-delay controls
- [x] Label each boundary option “Délai aléatoire” / “Random delay” and place it after the sunrise/sunset chips.
- [x] Explain the possible interval explicitly: “Aléatoirement entre 16:45 et 17:00”, or “Aléatoirement entre Coucher + 1h et Coucher + 1h15”. Keep the existing daily-delay scheduling semantics.
- [x] In the program-settings selector, place New program immediately after the placeholder, with a native separator above and below; retain creation drafts through the existing creation path.


## 20. Solar time limits — 0.18.0

Un début ou une fin solaire (lever / coucher) accepte déjà `earliest` et `latest` (heures `HH:MM`, minute libre). Le formulaire d'horaire les expose : deux champs d'heure facultatifs « Pas avant » / « Pas après » sous les pastilles Lever / Coucher, chacun avec un bouton pour retirer la limite. Ils n'apparaissent que pour une heure solaire. Résolution inchangée : décalage, puis limites, puis délai aléatoire (la limite « après » plafonne aussi le résultat).

Les limites survivent au changement de décalage, au délai aléatoire, au passage lever/coucher, au regroupement et à la duplication ; revenir à une heure fixe ou glisser une barre vers une heure exacte remplace la définition, comme avant. Une limite « avant » postérieure à « après » est refusée dans le formulaire (message clair) et par le serveur (`earliest_after_latest`) ; des limites égales sont acceptées.

- [x] Champs « Pas avant » / « Pas après » (tactiles, 44 px, bouton retirer) pour chaque début/fin solaire.
- [x] Conserver les limites lors des autres modifications ; glisser vers une heure exacte les remplace.
- [x] Valider earliest <= latest côté carte et côté serveur, avec tests.
- [x] Textes EN/FR, graphique et aperçu via la résolution existante.
- [x] Aube / crépuscule : le modèle et le serveur les acceptent ; le formulaire ne propose toujours que Lever / Coucher (inchangé).


## 21. Écarts connus et travaux ouverts (audit 0.18.0, mis à jour en 0.19.1)

Relevés en comparant cette spec au code de la 0.18.0 ; les points cochés ont été clos en 0.19.0 (§ 22), les autres
restent **non faits**. La preuve indique où le vérifier.
Les cases encore ouvertes du § 17 restent ouvertes et ne sont pas répétées ici, sauf mention.

### 21.1 Moteur et données
- [x] **Option `reapply_default`** : désormais effective. Le serveur renseigne `reapply` s'il manque
      (`validation.with_defaults`), le snapshot porte `defaults` (§ 9) et le formulaire de programme en part.
- [x] **`00:00 → 00:00` accepté** : décision 0.19.0, accepté comme horaire de 24 h passant minuit ; § 5.7 et S27 corrigés,
      code inchangé.
- [x] **Priorité par défaut** : une seule constante `DEFAULT_PRIORITY = 10` (`const.py`) partout ; les priorités
      enregistrées sont inchangées, seule une clé absente passe de 100 à 10.
- [x] **Réparations des entités supprimées** : `missing_entities` recalculée à l'enregistrement, la duplication et la
      suppression d'un programme, à l'enregistrement et la suppression d'une étiquette, au renommage, à la création et au
      retrait dans le registre, au démarrage et à `weekly_planner.reload` (sans scrutation).
- [x] **Test S33** : `tests/test_frontend_resource.py` (création / mise à jour de version / retrait).
- [x] `PlannerStore.async_backup` retiré (la sauvegarde avant migration passe par `_VersionedStore`).

### 21.2 Carte
- [x] **`show_week` / `show_advanced`** : conservés mais obsolètes (acceptés, ignorés) pour ne pas casser les anciennes
      configurations.
- [x] **Astuce « Restez appuyé pour modifier »** (§ 14.12) : affichée aux 3 premiers touchers, compteur par appareil
      (`localStorage`, `frontend/src/hold-hint.ts`).
- [x] **Aube / crépuscule** acceptés par le modèle et le serveur mais non proposés par les pastilles du formulaire
      (`slot-form.ts` : lever / coucher seulement, § 20). Décision : uniquement lever/coucher dans la carte ; aube/crépuscule restent acceptés par le serveur (compatibilité).
- [x] Aperçus (`weekly_planner/preview`) : cache partagé entre cartes et écrans d'horaires, invalidé au changement de
      `revision` ou de `card_version`.
- [x] Passe de régression visuelle / interaction dans le navigateur sur l'instance locale (§ 17) : faite le 2026-10-31
      (tâches 12/13 de la revue), résultats et anomalies dans `docs/CONTROLE_VISUEL_RESULTATS.md` ; corrections en 0.19.1.
- [x] `docs/controle-visuel.md` réécrit pour la carte actuelle et déroulé. Temps de rendu mesuré (20 programmes) :
      rendu de la carte ~2 ms, mise à jour de `hass` peinte en 20-35 ms, page entière 244 ms sans bridage et
      803 ms avec CPU ×4.
- [ ] Reste de la passe : l'icône « maintenant » touche le texte d'une ligne longue à 1440 px (non corrigé).
- [ ] Commentaire de `frontend/src/components/gestures.ts` qui renvoie au § 10.7 retiré (cosmétique).

### 21.3 Publication et validation réelle
- [ ] Installation propre via HACS (dépôt personnalisé) vérifiée, désinstallation propre, puis demande d'inclusion dans
      la liste HACS par défaut.
- [ ] Test réel ≥ 3 jours sur le banc d'essai (§ 13, point 2).
      *en cours — le propriétaire indique que les tests réels sont OK à ce jour (2026-10-31) ; durée ≥ 3 jours et version testée non consignées*
- [ ] Stratégie de tags / releases pour 0.8.0 → 0.19.0 : dernier tag et dernière release GitHub `v0.7.10` ; `main`
      est derrière `develop` ; pas de `1.0.0`.
- [ ] Tests de mutation : des survivants subsistent dans `validation.py` (informatif, non traités).
- [ ] Refonte des modules / de l'architecture (`engine.py` ~36 ko, `weekly-planner-card.ts` ~29 ko) : hors du périmètre
      des corrections actuelles (§ 17), à planifier séparément.

### 21.4 Point lent corrigé en 0.19.1
- [x] **Recalcul de 200 entités** : tenait la boucle d'événements de HA (~180 ms d'un bloc). Un seul cache
      d'occurrences par passe, cession de la boucle au moins toutes les 10 ms entre deux entités (verrou du moteur),
      équivalence avec l'ancien moteur gardée par des tests. Mesuré (médiane, 50 programmes × 4 entités) :
      recalcul 182 → 30 ms, instantané de la carte 123 → 31 ms, démarrage 217 → 55 ms ; statuts des programmes ~4×
      plus rapides. Un rappel de la boucle ne dépasse pas 50 ms (tests de rafale, § 12).

## 22. Release 0.19.0

- [x] `reapply_default` effectif (serveur + carte) ; champ additif `defaults` dans `get` / `subscribe` (§ 9).
- [x] Une seule priorité par défaut (`DEFAULT_PRIORITY = 10`).
- [x] Réparations `missing_entities` recalculées sur les événements de configuration et du registre, sans scrutation.
- [x] `PlannerStore.async_backup` retiré ; statut d'un programme mémorisé pendant une notification, occurrences partagées.
- [x] Carte : astuce « Restez appuyé », cache d'aperçus partagé, `show_week` / `show_advanced` obsolètes.
- [x] Test S33 (ressource Lovelace) et tests associés.
- [x] Spec corrigée : `00:00 → 00:00` accepté comme horaire de 24 h ; Lever / Coucher seulement (déjà décidé).
- [ ] Passe visuelle (tâches 12/13 de la revue), tags / releases, HACS, test réel, `docs/controle-visuel.md` : hors de cette version.

## 23. Release 0.19.1

- [x] Corrections de la passe visuelle : duplication d'un horaire solaire > 4 h (heure fixe au-delà de ±240 min) et message d'erreur d'heure hors limites ; Échap et retour du focus ; barres au clavier ; boutons de jour ≥ 44 px ; sélecteur de l'éditeur ; astuce au-dessus du trait « maintenant » ; pluriel des usages ; heures d'axe selon la langue ; texte du délai aléatoire.
- [x] Performance du moteur : recalcul 182 → 30 ms, instantané 123 → 31 ms, démarrage 217 → 55 ms (§ 21.4).
- [x] Couverture de code avec planchers (Python 85 %, carte 49 / 78 / 45 / 49) (§ 12).
- [x] Tests de mutation informatifs, workflow hebdomadaire `mutation.yml` (§ 12).
- [x] Budgets de performance et `scripts/bench.py` ; tests de rafale sans dépendre du journal « slow callback » (meilleur de 3, marge sous couverture).
- [x] Liste de contrôle visuelle réécrite, tâches 12/13 faites (`docs/CONTROLE_VISUEL_RESULTATS.md`).
- [x] Versions 0.19.1 alignées (manifest, pyproject, carte, verrous), CHANGELOG, décisions.
- [ ] Stratégie de tags / releases, installation HACS, test réel ≥ 3 jours (en cours), icône « maintenant » sur ligne longue à 1440 px, survivants de mutation de `validation.py` : hors de cette version.
