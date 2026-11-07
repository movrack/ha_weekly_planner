# Weekly Planner — spécification v1

> Statut : version 0.x en route vers la v1 — un seul modèle pour tous les appareils (§ 5 et § 6) ; modes, sources, cibles,
> délais aléatoires et limites solaires : § 5.10, § 6, § 17 à 20.
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

## 2. Glossaire

- **Programme** : ensemble nommé d'entités + une semaine d'horaires + réglages. Un interrupteur par programme.
- **Horaire** (slot) : début (heure ou soleil, avec décalage), fin facultative, jours, **un réglage**.
- **Réglage** (nom affiché ; clés internes `label` / `labels`, comme les étiquettes de Netatmo) : `{id, name, color, action}`, **global** (partagé par tous les programmes),
  stockée par l'intégration. Tout passe par un réglage : un horaire en référence une (`slot.label`), le « reste du
  temps » aussi (`entity.default_label`). Exemple : « Confort » = 19 °C ; les horaires sont « Confort 10:00–12:00 ».
  Nom affiché : « Réglage » (clés internes inchangées).
- **Action** (celle d'un réglage) : un service HA, `{"kind":"service","service":"climate.set_temperature","data":{"temperature":18}}`,
  ou une scène, `{"kind":"scene","scene":"scene.x"}`. Les services proposés viennent du sélecteur générique de la carte
  (services dont la cible accepte l'entité).
- **Valeur propre à un appareil** (`entity.label_overrides: {label_id: action}`) : « Confort » = 19 °C partout, 22 °C dans
  la salle de bain.
- **Réglage compatible** : proposée pour une entité quand la cible de son service accepte l'entité, ou si c'est une
  scène qui la contient. Une entité incompatible avec le réglage d'un horaire est **ignorée** pour cet horaire
  (avertissement dans les contrôles).
- **Action par défaut** (« Le reste du temps » / « Otherwise ») : réglage facultative de chaque entité d'un programme
  (`default_label`, `null` = rien), appliquée quand un horaire **avec fin** se termine.
- **Action ponctuelle** : un horaire **sans fin** ; l'action est lancée une fois, à son début, et n'est jamais refaite.
- **Segment** : occurrence d'un horaire gagnant pour une entité (ou intervalle « le reste du temps »), identifiée par
  (programme, horaire, date) — voir § 5.1.

## 3. Périmètre v1

Inclus : tout ce qui suit. **Hors v1 (v2)** : import des programmes `scheduler-component` et des automatisations HA
à déclencheur horaire (§ 15).

## 4. Décisions validées (référence)

| # | Décision |
|---|---|
| D1 | Un seul dépôt : intégration (moteur) qui embarque sa carte. |
| D2 | Nom « Weekly Planner », interface fr + en (langue du compte HA). |
| D3 | Programmes créés/modifiés uniquement depuis la carte, stockés par l'intégration ; un `switch` par programme. |
| D6 | Action par défaut facultative par entité (« le reste du temps »), envoyée à la fin d'un horaire avec fin. |
| D7 | Pas de chevauchement dans un programme ; entre programmes, **priorité numérotée**, l'autre reprend la main ; conflits signalés. |
| D8 | 7 jours indépendants + copie (raccourcis Lun→Ven, Sam+Dim) ; toute minute ; plages passant minuit ; heures solaires (lever, coucher ± décalage ; aube et crépuscule acceptés par le serveur, non proposés) avec bornes « au plus tôt / au plus tard ». |
| D9 | Conditions simples par programme **et par plage** ; interrupteur global « Vacances / Absence ». Condition devenue fausse = fin de plage. |
| D10 | Réglage par programme « réappliquer en cours de plage » (oui par défaut) : redémarrage, activation, modification. |
| D11 | Dépôt séparé ; dev et tests sur une instance HA locale (Docker) ; prod seulement pour des versions finies, copiées par script tant que le dépôt est privé. |
| D12 | GitHub privé puis public ; licence MIT. Branche de travail `develop`, `main` propre ; PR après la v1. |
| D13 | Toute entité est programmable ; les actions sont les services HA qui l'acceptent (aucune liste de types). |
| D14 | Carte : vue semaine (7 barres + trait « maintenant ») ; éditeur du jour = liste + barre aux bords glissables. |
| D15 | Carte configurable : un programme fixé **ou** liste filtrée (type/zone) avec création. |
| D16 | Option globale de l'intégration « modification réservée aux administrateurs ». |
| D17 | Entité injoignable : au retour, état voulu recalculé (début si encore dans la plage, sinon défaut) ; journal de bord ; notification après X min (30 par défaut). |
| D20 | « Fini » = tests automatiques + test réel + vérification visuelle (§ 13). |
| D22 | Deux visages : consultation très lisible ; configuration **en modales**. |
| D23 | Doc README en anglais + `README.fr.md` ; versions `0.x` puis `1.0.0` ; CHANGELOG ; releases GitHub. |
| D24 | Un seul modèle pour tous les appareils : horaire = début, fin facultative, jours, un réglage ; action par défaut par entité ; aucune détection de réglage manuel ; aucun traitement propre à une intégration. |
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
4. Action voulue = action de le réglage de l'horaire gagnant pour *E* (valeur propre à *E* sinon valeur de le réglage ; `resolve_action`) ; sinon **action par défaut** du programme actif de plus haute priorité qui contient *E* (peut être vide : rien à envoyer).
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

### 5.3 Changements manuels
Le moteur ne détecte aucun changement fait à la main : pas de dérogation, pas de comparaison à une cible, pas de
service `override` ni `resume`. Seul l'**affichage** du graphique montre les changements manuels (§ 10.4).

### 5.4 Action par défaut
- Facultative, par entité d'un programme, choisie avec le même sélecteur que les actions d'un horaire (service ou scène).
- Envoyée à la fin de chaque horaire avec fin ; sans défaut, la fin n'envoie rien.
- Quand aucun horaire n'est en cours, l'action par défaut appliquée est celle du **programme actif de plus haute
  priorité qui contient l'entité**. Un programme **désactivé libère ses entités** : son défaut ne s'applique qu'une
  fois, à sa propre désactivation (§ 5.5), jamais aux fins d'horaire des autres programmes.
- Vacances : au passage en Vacances, chaque entité reçoit une fois le défaut du programme le plus prioritaire qui la contient.
- Reprise de la main entre programmes : si un horaire de priorité plus haute se termine pendant qu'un programme plus
  bas est dans un horaire, l'entité reçoit l'action de cet horaire, pas le défaut.

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
- Fin `24:00` autorisée (= minuit du jour suivant). `00:00 → 00:00` est **accepté** et placé comme un horaire de 24 h
  passant minuit (la fin, avant midi et pas après le début, tombe le lendemain) ; `00:00 → 24:00` reste équivalent.
- Une fin qui n'est pas après le début passe minuit **seulement si elle tombe avant midi** ;
  sinon l'horaire est vide ce jour-là.
- Un horaire passant minuit appartient au jour de son début ; la validation de chevauchement porte sur la semaine entière.
- Heure solaire : `aube | lever | coucher | crépuscule` (`dawn | sunrise | sunset | dusk`) ± décalage (−240 à +240 min),
  bornes `au plus tôt` / `au plus tard` facultatives (`earliest` > `latest` refusé : `earliest_after_latest`, § 20) ;
  calcul pour la date locale avec le **fuseau de HA** ; recalcul chaque jour à minuit. Ordre : événement, décalage,
  bornes, puis **minute exacte** (secondes tronquées : 16:17:12 → 16:17, jamais d'arrondi à un pas), puis délai
  aléatoire (§ 19). Le formulaire ne propose que
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

### 5.9 Vérifier et réessayer (appareil qui ignore un ordre)
- Après un appel réussi d'un segment (pas un one-shot), le moteur compare, **une seule fois**, `VERIFY_SETTLE_S` (8 s) plus
  tard, chaque clé scalaire des `data` de l'action qui est aussi un attribut de l'entité visée (`preset_mode`,
  `temperature`, `brightness`…). Générique : aucune liste de domaines ni de services ; sans clé commune (scène,
  ouvrir/fermer…) il n'y a pas de vérification. Nombres égaux à `VERIFY_TOLERANCE` (0,05) près, texte identique sinon.
- Écart : `verification: pending` (`rt["verify"]`, avec `seen` = valeur réellement lue). Tant que le segment et sa cible
  ne changent pas, à chaque changement d'état de l'entité : attribut égal à `seen` (seuls d'autres attributs ont changé,
  ex. `is_ready`) → l'action est renvoyée (raison `verify_retry`), au plus toutes les `VERIFY_MIN_INTERVAL_S` (60 s) et
  `VERIFY_MAX_TRIES` (10) fois ; attribut devenu égal à la demande → `ok` ; attribut passé à une autre valeur → changement
  **manuel**, `manual`, on ne force jamais (§ 5.3). Changement de segment ou de cible, programme désactivé : état oublié.
- Complète `back_online` (entité `unavailable`, `pending`), sans le remplacer. Un programme sans réapplication ne renvoie
  que ce qu'il avait envoyé. Avertissement `action_not_applied` après le maximum d'essais. Sans entité en attente, aucun
  coût par événement. Statut du programme : `verification` (seulement si présent).

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
- **Vacances est un mode ordinaire**, sans traitement de suspension. L’interrupteur global (`switch.weekly_planner_vacation`) est présenté comme « Suspension de tous les programmes » ;
  son identifiant stable préserve les automatisations existantes.

## 6. Actions (un seul modèle pour toute entité)

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
- Toute action vit dans un **réglage**. `resolve_action(programme, entité, réglage)` est **l'unique endroit** qui la
  résout : valeur propre à l'entité si elle existe, sinon action de le réglage ; `None` si le réglage est absente ou
  incompatible avec l'entité.
- Le **sélecteur d'action** de la carte (`frontend/src/services.ts`) propose les services dont la cible accepte
  l'entité (domaine, fonctionnalités prises en charge), avec leur libellé traduit et un champ `ha-selector` par
  paramètre ; les services « techniques » (texte libre ou objet obligatoire) sont masqués ; les scènes HA qui contiennent
  l'entité sont ajoutées.
- **Actions proposées** : `entities[].allowed_services` (liste d'ids `domaine.service`) restreint ce qu'on peut
  choisir pour un appareil (réglages, onglet Appareils) ; les scènes restent permises. Avec `restrict_services: true`
  (défaut des nouveaux appareils), une liste vide signifie **aucune** commande ; sans ce drapeau
  (configurations existantes), une liste vide ou absente garde **toutes** les commandes. Une
  réglage dont le service n'est pas autorisé pour un appareil est incompatible pour lui (ignorée, avertissement).
- Cadre du réglage choisi : lecture seule ; un crayon ouvre un seul formulaire (nom, couleur, action, valeur pour
  cet appareil). Jamais plus d'une paire Enregistrer / Annuler visible.
- Exemples : chauffage `climate.set_temperature {temperature: 18}` ; volet `cover.set_cover_position {position: 30}` ;
  lampe `light.turn_on {brightness_pct: 60}` ; prise `switch.turn_off` ; aspirateur `vacuum.start`.
- Validation : réglage = service existant (la compatibilité avec l'entité est vérifiée pour les valeurs propres et
  signalée pour les autres) ; un horaire ne peut référencer qu'un réglage qui existe ; un réglage utilisé ne peut
  pas être supprimée (la liste des programmes qui l'utilisent est renvoyée).
- **Couleurs** : chaque réglage a une couleur choisie (palette de 12 couleurs distinctes, choix automatique pour une
  nouvelle réglage) ; barre du jour, barres de la semaine et repères du graphique l'utilisent et affichent le nom si la place le permet.

## 8. Données et stockage

`.storage/weekly_planner` (`Store`, `version` + `minor_version`, `atomic_writes`, écriture différée 1 s, migrations testées).
**Version 2, minor 1** (`STORAGE_VERSION = 2`, `STORAGE_MINOR_VERSION = 1`) ; la version 1 est migrée
automatiquement (voir ci-dessous). Runtime : version 2 (migration depuis la 1), écriture différée 1 s. Journal : version 1,
écriture différée 5 s.

```text
racine
├─ vacation        : bool
├─ labels[]        : id, name (1–30 car.), color, action
└─ programs[]      : id, revision, created_at, name (1–60 car.), icon?, area?, priority (1–100, défaut 10), enabled, reapply,
                     entities[] (1–100) : entity_id, default_label? (id de réglage), label_overrides{ label_id: action },
                                          allowed_services[], restrict_services
                     conditions[] : entity_id, attribute?, op (eq|ne|lt|gt), value
                     mode_source? : entity_id, mappings{ état_brut: id_du_mode }
                     active_profile, profiles[] (1–20) : id, name (1–40 car., unique),
                       days[0..6] : slots[] (≤ 50 par jour) : id, start, end?, conditions[] (≤ 10), color?, label (id de réglage),
                                         entities? (appareils visés, § 8.2), seed? (graine du délai, § 8.2)
runtime (`weekly_planner.runtime`) : par entité → segment courant, action en attente, reprises ; par programme → profil actif,
                     skip_at ; `conditions` → dernières valeurs connues des conditions (persistées pour le démarrage, § 5.5)
journal (`weekly_planner.journal`) : 14 jours glissants, deux sortes d'entrées : segment décidé
                     (`at, entity_id, segment, program_id, slot_id, action`) et action réellement envoyée (`at, entity_id, sent: true, action, reason`)
```
- `start`/`end` : `{"time": "HH:MM"}` (fin jusqu'à `24:00`) ou `{"sun": "sunset", "offset": 15, "earliest": "18:00", "latest": "21:00"}`.
- `action` (d'un réglage ou d'une valeur propre) : `{"kind": "service", "service": "…", "data": {…}}` ou `{"kind": "scene", "scene": "…"}`.
- **Concurrence** : chaque écriture fournit la `revision` lue ; si elle a changé → refus « modifié ailleurs, recharger ».
- **Robustesse** : si le fichier existait mais se charge vide/corrompu (ou version non prise en charge) → **l'entrée ne
  se charge pas** (`ConfigStoreError`, `async_setup_entry` renvoie faux) : aucun programme ne tourne, le fichier n'est
  jamais réécrit, une notification persistante (`weekly_planner_storage`) demande de restaurer
  `.storage/weekly_planner` ; on ne repart jamais de zéro. (Le drapeau interne `read_only` et le bandeau « Lecture
  seule » de la carte existent, mais ce cas n'est pas atteint par une entrée chargée.) **Sauvegarde du fichier avant la
  migration** : copie `weekly_planner.v<N>-backup-<AAAAMMJJHHMMSS>` à côté de l'original ; retour à une version antérieure
  = restaurer la sauvegarde.
- **Renommage / suppression d'entité** : écoute de `entity_registry_updated` → `entity_id` mis à jour partout (y compris
  valeurs propres, cibles explicites, sources de valeurs, scènes et sources de mode, § 17) ; entité supprimée → alerte
  Réparations `missing_entities`, vérifiée au démarrage et à chaque suppression dans le registre (pas à
  l'enregistrement d'un programme, § 21).

### 8.2 Horaires par appareil (`slot.entities`, `slot.seed`) — contrat (#34)

Décisions D1-D7 du 2026-11-01 (`docs/DECISIONS.md`). Pas de migration ni de changement de version de stockage
avant la 1.0 : les deux champs sont facultatifs, les données existantes restent valides telles quelles.

- `entities?: string[]` : appareils (`entity_id` du programme) visés par l'horaire. **Absent = tous les appareils du
  programme**, y compris ceux ajoutés plus tard. Liste vide interdite. Un horaire s'applique à l'appareil E si et
  seulement si le champ est absent ou contient E (`applies(slot, E)` : `slots.py`, `slots.ts`).
- `seed?: string` : graine du délai aléatoire (§ 19), défaut = `id` de l'horaire. Copie à l'écriture : la partie
  gardée garde son `id`, la copie modifiée reçoit un nouvel `id` et le même `seed` (D7).
- **Normalisation (D5)** « ce qu'on voit = ce qui est stocké » : tous les appareils cochés = champ absent, partout
  (enregistrement, retrait d'un appareil, renommage). Retirer un appareil d'un programme le retire de toutes les
  listes dans tous les modes ; un horaire dont la liste devient vide est supprimé. Un programme à un seul appareil
  n'a jamais de liste.
- **Validation serveur** (codes d'erreur) : `empty_slot_entities:<slot>`, `duplicate_slot_entity:<slot>:<eid>`,
  `unknown_slot_entity:<slot>:<eid>`. Chevauchement vérifié **par paires** : refus si deux horaires se chevauchent dans
  le temps ET que leurs appareils visés ont une intersection non vide ; code `overlapping_slots:<eid>` (un appareil de
  l'intersection ; la carte reconnaît toujours le préfixe `overlapping_slots`). Sans aucune liste, le chemin actuel
  est inchangé. `slot_label_incompatible` est un avertissement (`checks.py`), jamais un refus d'enregistrement (D6).
- **Renommage** (`rename_entity`, `registry.py`) : réécrit `slot.entities` dans tous les modes et retire les doublons.
- **Moteur** : `applies` est testé AVANT `resolve` dans `running_slot` (l'arbitrage de priorité ne compare que les
  horaires qui s'appliquent à l'appareil) ; les ponctuels (`_fire_one_shots`, y compris le rattrapage
  `last_tick < start <= now`) parcourent les occurrences rognées PAR APPAREIL ; `_next_action_in` et `used` de
  `checks.py` sont calculés par appareil ; `next_transition` = union des sous-ensembles (`subsets`), aussi pour
  `_program_status` et `skip_next` (la carte dit quel appareil et quelle action sont sautés). Le réglage par défaut
  appartient toujours au programme de plus haute priorité qui contient l'appareil : les listes ne changent que les horaires qui s'exécutent, jamais le réglage par défaut (décision confirmée). Renvoi à
  l'enregistrement limité aux appareils dont le segment ou la cible a changé (D2).
- **Chronologie** (`timeline.py`, API figée) : `place_day(slots, day, tz, sun, *, identity=())` place chaque horaire
  (trié par début, sans rognage) ; `trim(placed)` rogne les chevauchements (le plus tardif perd) ;
  `day_occurrences = trim(place_day(...))`, résultat inchangé pour tous les appelants. Chronologie d'un appareil :
  `trim([o for o in placed if applies(horaire de o, appareil)])`. Cache : occurrences brutes par (mode, programme, jour) ;
  rognage mémorisé par (mode, programme, jour, appareils visés).
- **Aperçu** (`weekly_planner/preview`) : dès qu'un horaire du programme a une liste, la réponse contient un
  `by_entity: {eid: [{slot_id, start, end, ignored, sun}]}` COMPLET (débordement de la veille après minuit compris),
  les horaires portent `entities`, et le niveau principal n'est pas rogné globalement. L'état du programme (`status[pid]`) porte `skip_next_targets: [{entity_id, action, label}]` (appareils et actions sautés par `skip_next`). Un programme sans liste garde
  la forme actuelle (`slots` seul).

### 8.1 Migration 1 → 2 (automatique, testée)
Conversion des anciennes consignes en actions, puis **regroupement en réglages : des actions identiques donnent UNE
seule réglage**, nommée d'après l'action (`18 °C`, `Ouvrir`, `Fermer`, `Position 30 %`, `Allumer` / `Éteindre`
(+ `30 %`), nom de la scène, sinon l'identifiant du service). Couleurs : chaudes pour les températures élevées et
allumer / ouvrir, froides ou grises pour les basses et éteindre / fermer, sinon la palette dans l'ordre.
Quand deux entités d'un même horaire avaient des actions différentes, la première donne le réglage et l'autre garde sa
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

Défauts : genre `setpoint` ou `mode` → réglage de l'action convertie ; `none` → pas de défaut ; `previous` → pas de
défaut, **un avertissement dans le journal** de HA. Les modes, `force_permanent`, `grace_s`, `main_type` sont supprimés. Les
dérogations persistées dans le runtime sont effacées.

Données réelles de production vérifiées par un test : programme « Bureau » sur `climate.thermostat_bureau` (horaires
de 18 °C, défaut 15 °C → réglages « 18 °C » et « 15 °C ») et programme « Volet du bureau » sur
`cover.bureau_volet_low_speed` (horaires ponctuels `by_type` `cover_closed` / `cover_open` → réglages « Fermer » / « Ouvrir »).

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

**Droits**
- `admin_only` (option globale, désactivée par défaut) : si actif, seule l'édition des programmes et réglages est réservée
  aux admins.
- **Toujours réservé aux admins** : toute action visant un domaine sensible (`homeassistant`, `hassio`,
  `alarm_control_panel`, `lock`, `alarmo`, `shell_command`, `python_script`, `pyscript`, `rest_command`).

**Avertissements** affichés dans la carte (jamais bloquants), `{entity_id, code, detail}` : `other_program` (autre programme
actif sur la même entité), `automation` (automatisation active qui la vise), `scheduler` (`switch.schedule_*` actif),
`incompatible_label` (réglages ignorées pour cette entité), `missing` (entité absente).

**Options** : `admin_only` ; délai d'alerte `notify_delay_min` (1–1440 min, 30 par défaut) ; `reapply_default` (valeur
proposée aux nouveaux programmes) ; anti-rebond `debounce_min` (0–60 min, 2 par défaut). Une modification des options recharge
l'entrée. Instance unique.
**Désinstallation** (`async_remove_entry`) : retrait de la ressource Lovelace, des entités et du stockage.

## 10. Carte `weekly-planner-card`

### 10.1 Configuration de la carte (éditeur visuel)
Options réelles : `title` ; `program: <id>` **ou** `filter: {types: [domaines], area: <zone du programme>, programs:
[ids]}` (`programs` absent = tous, futurs compris ; liste vide = aucun ; intersection avec type et zone) ;
`schedule_view: bars | radial | radial_12h | list` (défaut `bars`) ; `show_chart` (défaut vrai).
`chart_collapsed` (défaut vrai) donne l'état initial du graphique. Les clés inconnues ou obsolètes (`show_week`,
`show_advanced`) sont acceptées et ignorées ; la semaine est toujours repliable.
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
  dimanche, chaque nom de jour est un bouton qui ouvre l'écran d'horaires sur ce jour). Aucune commande immédiate (c'est un planificateur).
- La ligne elle-même **n'est pas cliquable** : un appui court au doigt sur une barre ouvre l'écran d'horaires ; un appui
  long (doigt) ou un clic (souris) entre dans l'édition sur place (§ 10.8).
- En-tête : titre, pastille « Tous les programmes suspendus » quand l'interrupteur global est actif. Aucun bouton « Réglages » :
  les réglages se modifient par programme, dans la fenêtre d'horaires (§ 10.3) ; sans titre ni pastille, la carte n'a pas d'en-tête.
- Bandeau « Lecture seule » si le stockage est en lecture seule ; état vide « Aucun programme pour l'instant » ou « Aucun
  programme ne correspond aux filtres » ; bandeau « Modifié · Annuler » 6 s après une édition sur barre.
- Mise à jour : abonnement `subscribe` ; rechargement automatique quand `card_version` change (page au repos), vérifié
  aussi par un `get` toutes les 5 min et au retour de la page visible (`visibilitychange`).

### 10.3 Écran d'horaires et réglages
- **Éditeur visuel Lovelace, onglet « Réglages des programmes »** (administrateurs) : choix du programme à modifier
  (« Nouveau programme » en tête), onglets **Général** (nom, icône, zone, priorité, conditions, réappliquer),
  **Appareils** (défaut, actions proposées par appareil avec descriptions HA) et **Modes** (modes, mode actif, source de
  mode et associations repliables) ; création courte (nom + appareils) avec reprise du brouillon ; Annuler / Rétablir
  (Ctrl/Cmd+Z, Ctrl/Cmd+Maj+Z, Ctrl/Cmd+Y) ; dupliquer, supprimer (confirmé).
- **Écran d'horaires** : schéma des 7 jours (reflète le brouillon), sélecteur du mode à éditer, lignes d'horaires (pastille
  de la couleur du réglage + nom) ; formulaire d'horaire (début, fin facultative, jours, pastilles Lever / Coucher,
  décalage, « Au plus tôt à » / « Au plus tard à », délai aléatoire, pas ±15 min, « Appliquer à d'autres jours ») dont la
  section « Action » liste les réglages compatibles en pastilles colorées ; ligne « Le reste du temps » : un réglage ou
  « Rien » ; interrupteur de pause, dupliquer, supprimer (§ 18, confirmé, bouton rouge isolé) ; fermeture par glissement
  vers le bas sur téléphone.
- **Réglages** : modifiés uniquement par programme, dans la fenêtre d'horaires (pas de fenêtre globale sur la carte).
  « + Nouveau réglage » ouvre un mini-formulaire en ligne (nom, couleur de la palette de 12, action par le sélecteur
  générique ou une scène) qui crée le réglage et le sélectionne ; pour le réglage choisi, « Valeur pour cet appareil »
  modifie la valeur propre de l'appareil (même sélecteur) avec « Revenir à la valeur commune ».
- **Supprimer un réglage** : à côté du crayon du réglage choisi, une corbeille (`mdi:delete-outline`, cible 48 px, clavier
  natif) demande confirmation en phrase simple (« Il disparaît pour tous les appareils », le réglage étant global).
  Tant qu'un horaire, un défaut ou une valeur propre d'un programme l'utilise, aucun bouton de suppression : la phrase
  nomme les programmes concernés (`labelUsers`) ; un refus serveur `in_use` (§ 9) affiche le même message. Après
  suppression, la carte reste à jour par l'abonnement et le formulaire d'horaire n'a plus de réglage choisi (à rechoisir).
  Absente de la bande sous une barre (choisir sans configurer, § 24.1 bis).
- Sélecteurs HA publics (`ha-selector`, icône) si disponibles ; modales maison ; fr + en.

### 10.4 Graphique (tous les appareils)
SVG maison, un jour (précédent / suivant).
- **Données** : historique HA de l'entité sur le jour. Valeur numérique → **courbe** : climat `current_temperature`
  (mesurée) et attribut `temperature` (réglée), volet `current_position`, lumière luminosité en %. Sinon → **bande d'états**.
  Le tracé dépend du **rôle** de la série : une valeur **réglée ou demandée** (position du volet, luminosité, consigne
  « Demandé à l'appareil ») est un **escalier** : l'historique HA n'enregistre qu'un changement, donc la valeur reste
  constante jusqu'au point suivant (horizontale), saute à l'heure du changement (verticale), et la dernière valeur est
  tenue jusqu'à « maintenant » ; jamais d'oblique, elle inventerait un mouvement progressif. Une valeur **mesurée**
  (« Valeur mesurée » : `current_temperature`, capteur numérique) reste une **ligne continue passant par les points
  enregistrés**, puis tenue jusqu'à « maintenant ».
- **Actions prévues** : repères aux heures prévues, avec la valeur quand l'action en contient une
  (`temperature`, `position`, `brightness_pct`).
- **Maintenant** : trait vertical sur le jour courant.
- **Navigation et zoom de l'axe du temps** (état propre à la vue, non mémorisé, remis à zéro au changement de jour ou d'appareil ;
  maths pures dans `chart-zoom.ts`) : fenêtre `[de, à]` en minutes réelles, minimum 30 min, largeur maximale égale à la durée réelle
  du jour initial (23, 24 ou 25 h). Elle peut défiler continûment vers les jours précédents et suivants, à largeur conservée.
  Téléphone : un doigt fait glisser horizontalement, deux doigts pincent pour zoomer ; `touch-action: pan-y` garde le défilement
  vertical de la page. Souris : glisser = parcourir, Maj + glisser = sélectionner une plage à zoomer ; Ctrl + molette zoome autour
  du pointeur ; double clic = retour au jour sélectionné. Pavé tactile : défilement horizontal. Clavier : `+`, `-`, flèches, `0`.
  Dates et boutons période précédente/suivante toujours visibles ; « Revenir au jour sélectionné » (44 px) quand la fenêtre diffère.
  Chaque jour visible charge ses propres prévisions par appareil et son historique plafonné à maintenant ; modèles de jours locaux
  décalés par leurs bornes UTC réelles, caches bornés, réponses obsolètes ignorées. Graduations adaptées, date aux passages de minuit.
  Les données hors fenêtre sont coupées (clip), jamais déformées ; « maintenant » apparaît seulement s'il est dans la fenêtre.
- **Toucher** : ouvre l'historique HA de l'entité pour la période affichée (`/history?entity_id=…&start_date=…&end_date=…`, navigation HA :
  `history.pushState` + événement `location-changed`). Après un geste, aucun historique ouvert ; avec une fenêtre déplacée ou zoomée,
  le clic attend 300 ms pour permettre le double clic.
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
- **Valeur prévue en escalier** : pour toute action numérique, ligne horizontale par palier dans la couleur de son réglage, raccords verticaux fins, retour à la valeur par défaut (aussi avant le premier horaire et jusqu'à la fin du jour) ; point plein + valeur au début de chaque horaire ; cercle creux seulement là où la valeur revient vraiment au défaut (fin d'une suite d'horaires contigus). Actions non numériques : bandes colorées nommées dans une rangée « Programme » sous les courbes, y compris le défaut actif, alignées au zoom et au déplacement multijours ; noms tronqués avec texte complet au survol. Les repères restent.
- **Activité réelle** : pendant chaque période où l'appareil était actif d'après l'historique déjà chargé, et jusqu'à « maintenant », une bande translucide (28 %) sur toute la hauteur du tracé avec un liseré plein de 3 px le long de l'axe des heures, dans une seule couleur (`--wp-active-color`, sinon la couleur principale du thème), dessinée sous les courbes. Indépendante des réglages en vigueur (une activité hors de tout horaire est montrée aussi), au moins 3 px de large. Actif : climat = `hvac_action` (chauffe, refroidit, déshumidifie…) sinon consigne − mesure > 0,3 °C (< −0,3 °C en mode froid) ; lumière, prise, ventilateur, interrupteur = `on` ; volet = `open` / `opening` / `closing` (ouvert ou en mouvement) ; aspirateur = `cleaning` / `returning` ; lecteur = `playing` ; le reste = ni `off`, `idle`, `unavailable`, `unknown`, `docked`. Appareils à bandes : même bande, par-dessus les bandes d'état. Légende « En marche ou ouvert » (même pastille que la bande : bloc translucide + liseré) seulement si une bande est dessinée.
- **Légende minimale** : « Mesuré », « Réglé » (courbes), « Prévu », et « Manuel » en rouge ; aucune couleur inexpliquée.

### 10.5 Exigences transverses
360 px (Galaxy S22) et ≥ 1400 px ; thèmes clair/sombre ; clavier ; fr/en ; zéro erreur console ; le moins de texte possible.
Clavier : les barres se focalisent avec Tab, Entrée ou Espace lance l'édition (ouvre le jour en lecture
seule) ; Échap ferme toujours la fenêtre ouverte la plus récente, même si le focus est retombé sur la page, et le
focus revient à l'élément qui l'avait ouverte ; boutons de jour ≥ 44 px.

### 10.6 Livraison du JS
Lit + TypeScript, bundle `custom_components/weekly_planner/frontend/weekly-planner-card.js` (commité). Servi par
`async_register_static_paths` ; **ressource Lovelace** (mode storage) avec `?v=<hash>` ; `add_extra_js_url` seulement
en mode YAML ; garde `customElements.get()` avant `define`.

### 10.7 Principes d'interface (mode simple)
Persona « Mamy », écran 360 × 780, vocabulaire sans jargon, cibles tactiles ≥ 48 px, suppression toujours confirmée et
séparée d'Enregistrer / Annuler. La carte n'a aucune commande immédiate.

### 10.8 Édition directe sur les barres
Barre « Auj. » et sept barres de la semaine, doigt et souris (événements pointeur, `touch-action` géré, clavier).
- **Entrer** : appui long ~450 ms (doigt) ou clic (souris) ; la barre passe à ~44 px et chaque frontière reçoit une poignée
  (zone ≥ 44 px, la plus proche du doigt gagne). **Sortir** : toucher à côté ou Échap. Un appui court au doigt ouvre toujours l'écran d'horaires.
- **Glisser** : bulle d'heure (pas de 15 min), bornée par les frontières voisines, une frontière solaire devient une heure fixe ;
  un repère ponctuel (sans fin) est une poignée unique. Clavier : flèches ±15 min sur la poignée sélectionnée.
- **Enregistrer** au relâcher, **pour ce jour seulement** (jour de la semaine de la date dans le profil actif) ; changement refait sur les
  données COURANTES, un conflit de révision est retenté une fois, jamais de « rechargez ». Bandeau « Modifié · Annuler » ~6 s ;
  « Annuler » remet les horaires précédents de ces jours. Deux horaires voisins de même réglage (fin == début) sont fusionnés.
- **Sélection** (toucher un horaire ou un trou) : bande sous la barre : « Rien », « Couper en deux »
  (`mdi:arrow-split-vertical`, libellé visible, groupe « dans le temps » ; coupe au milieu, pas de 15 min : la partie gauche garde le réglage, la partie droite devient « Rien ») et « Copier vers… » (`mdi:content-copy`, groupe « sur d'autres jours »), chacun avec `title` / `aria-label` explicites, puis les réglages compatibles (choix seulement, sans crayon). Copie : pastilles Lun…Dim sans le jour courant ;
  sans chevauchement la copie est directe ; sinon petite fenêtre listant les jours en conflit, chacun « Remplacer » (défaut) ou
  « Ne pas copier ce jour ». « Remplacer » rogne ou coupe les horaires existants autour de la plage (mer. 8 h 45–17 h 18 °C + copie de
  12–14 h 19 °C = 8 h 45–12 h 18 °C, 12–14 h 19 °C, 14–17 h 18 °C).
- **Déplacer une plage entière** (mode édition) : glisser le corps d'une plage (ou appui long de 450 ms sans bouger, y compris sur la zone des poignées,
  puis glisser ; ou appui long qui ouvre l'édition puis glisser sans lever le doigt). Même durée, pas de 15 min, bornée au jour et aux plages voisines
  (touche, ne traverse pas), enregistrée au relâcher avec « Annuler ». Sur une autre barre de jour du **même programme et du même appareil** (vue Semaine :
  la bande de sélection est masquée pendant le glisser pour que les autres jours restent visibles ; la barre visée est cernée en pointillé, la bulle
  indique « Jour hh:mm ») : la plage quitte son jour seulement et arrive à la même heure ; chevauchement sur le jour visé = refus avec message, jamais de
  remplacement silencieux. Heure solaire : décalage (`shiftTimeSpec`, devient fixe au-delà de ±240 min) ; refus avec message pour un ponctuel (poignée
  ronde), une plage qui passe minuit, une heure solaire avec limites (`earliest`/`latest`). Hors périmètre : déplacement d'un appareil à l'autre. `moveSlotBy`, `moveToDay`, `moveRefusal`.
- **Logique pure** (`edits.ts`, tests vitest) : `moveBoundary`, `splitAt`, `setLabel`, `removeSlot`, `copyConflicts` / `copyToDays`, `mergeAdjacent`.
- **Icônes solaires** : `mdi:weather-sunset-up` / `-down` à la position de toute frontière ou repère dépendant du soleil.
- **Trait « maintenant »** : icône `mdi:clock-outline` (12–14 px) centrée au-dessus, hors de la barre, `aria-label` « Maintenant » ; aussi sur le graphique.
- **Renommer un réglage sur place** (écran d'horaires) : crayon `mdi:pencil`, nom + couleur + action, `weekly_planner/label/save`, « Partagé » si utilisée ailleurs.
- **Mise à jour automatique de la carte** : `card_version` dans `get` / `subscribe` ; différent de celui du bundle chargé et page au repos → rechargement
  unique (mémorisé dans `sessionStorage`) ; `get` interrogé aussi toutes les 5 min et au retour de la page visible.
- Les éditions sur barre, les reprises de conflit et « Annuler » restent attachées au mode d'origine (§ 17) ; la
  fenêtre de conflit de « Copier vers… » bloque Échap tant qu'elle est ouverte.
- **Astuce** « Restez appuyé pour modifier » : affichée aux 3 premiers appuis courts, compteur par appareil (§ 21.2).

## 11. Compatibilité

Weekly Planner est générique : aucun traitement propre à une intégration (Versatile Thermostat, Evohome et Adaptive
Lighting sont programmés comme n'importe quelle entité). Une entité pilotée par une autre intégration se programme
comme n'importe quelle autre ; les **pilotes concurrents** sont signalés (§ 9).

## 12. Qualité, outillage, publication

- Arborescence : `custom_components/weekly_planner/` (moteur, store, websocket, switch, services, traductions,
  `brand/icon.png`, `frontend/`), `frontend/` (sources TS), `tests/`, `dev/`, `scripts/`, `docs/`.
- Dev : `dev/docker-compose.yml` (`ghcr.io/home-assistant/home-assistant:2026.10.x`), entités `demo` + `template` par
  type (dont un thermostat « lent » qui confirme après 2 min et un volet qui bouge 90 s), montage de l'intégration.
- Python des tests aligné sur HA (3.14, via `uv`) ; `pytest-homeassistant-custom-component` aligné 2026.10 ; temps simulé.
- `manifest.json` : `dependencies` = `http`, `websocket_api` ; `after_dependencies` = `frontend`, `logbook`, `lovelace`,
  `repairs` ; `single_config_entry: true`.
- `scripts/deploy_prod.sh` : copie de l'intégration vers `/config/custom_components/weekly_planner` de la prod
  par SSH/rsync (`WP_HOST`, `WP_CONFIG`) : essai à blanc par défaut, `--apply` pour copier après les tests Python et
  carte ; indique la révision (et l'état non commité) et l'empreinte SHA-256 du bundle. Ne redémarre rien et ne
  sauvegarde pas HA : la sauvegarde avant un changement Python se fait à part (AGENTS.md).
- CI (`.github/workflows`) : `hacs/action`, `hassfest`, pytest, et pour la carte `tsc --noEmit`, vitest, build et
  vérification que le bundle commité est à jour. Pas de test Playwright ni de lint de la carte en CI.
- `hacs.json`, `manifest.json` (`domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`,
  `config_flow`, `iot_class: calculated`, `integration_type: service`, `dependencies: [http, websocket_api]`).
- Docs : README (en) + `README.fr.md`, captures, CHANGELOG ; releases GitHub. Dernière release GitHub : `v0.7.10` ;
  les versions suivantes ne sont ni taguées ni publiées, `main` est derrière `develop` ; pas de `1.0.0` (§ 21).
- Garde-fous de qualité : couverture Python (`pytest --cov`, plancher 85 %, mesuré 87-89 %) et carte
  (vitest, planchers 49 / 78 / 45 / 49 pour instructions / branches / fonctions / lignes) ; tests de mutation
  informatifs (mutmut, StrykerJS, `mutation.yml` hebdomadaire, jamais requis, modules purs seulement) ; budgets de
  performance (`tests/test_performance.py`, `tests/test_latency.py`, `frontend/src/__tests__/performance.test.ts`,
  médianes via `scripts/bench.py`) : comptes d'opérations déterministes et temps jugés sur le meilleur de N essais.
- Contribution assistée : consignes communes dans `AGENTS.md` ; notes de contexte locales facultatives dans
  `PROJECT_MEMORY.md` (ignoré par Git), utilisables avec différents outils d'IA.

## 13. Définition de « fini » (v1)

1. **Tests automatiques verts** : `uv run --group test pytest -q` et, pour la carte, `tsc`, vitest et build. Scénarios du § 14.9 ; tests Python : `test_timeline`,
   `test_resolver`, `test_engine`, `test_engine_more`, `test_actions`, `test_action_sources`, `test_action_targets`,
   `test_mode_sources`, `test_random_times`, `test_migration`, `test_websocket`, `test_config_flow`, `test_qa_regressions`.
2. **Test réel en prod** (copie par script) ≥ 3 jours sur le banc d'essai :
   début, fin, action par défaut, action ponctuelle, changement de mode (manuel et par source), redémarrage de HA (avec
   accord), entité rendue injoignable (désactivation temporaire de l'entité), entrées du journal de bord vérifiées
   une à une.
3. **Vérification visuelle** selon `docs/controle-visuel.md` (360 px et ≥ 1400 px, clair/sombre, chaque modale, glisser,
   copie, modes, graphique, clavier) ; zéro erreur console ; temps de rendu mesuré.
4. CI verte ; puis installation propre via HACS (dépôt personnalisé ; le dépôt est public) et désinstallation propre.

## 14. Tâches

### 14.4 Carte
- [ ] Responsive, thèmes, clavier, fr/en, mesure de rendu

### 14.6 Documentation et publication
- [ ] Refaire toutes les captures d'écran avec l'interface finale avant la v1.0.0 (guide, atlas, wiki)
- [ ] Renuméroter l'atlas des écrans (`wiki/SCREENS.fr.md`, `docs/SCREEN_INVENTORY.md`, noms des images, wiki) au moment de la v1.0.0 (des trous de numérotation sont admis d'ici là)
- [ ] Tags / releases des versions suivant `v0.7.10` (non taguées, `main` derrière `develop`), puis `1.0.0` (§ 21)
- [ ] Installation propre via HACS vérifiée, demande d'inclusion dans la liste HACS par défaut (§ 21)

### 14.7 Validation réelle (banc d'essai)
- [ ] Déploiement en prod par script — *le script existe (§ 12) ; aucun déploiement de version finie n'est consigné
      dans le dépôt, à confirmer par le propriétaire*
- [ ] Test réel déroulé ≥ 3 jours (§ 13, § 21)
      *en cours — le propriétaire indique que les tests réels sont OK à ce jour (2026-10-31) ; durée ≥ 3 jours et version testée non consignées*

## 15. v2 (hors périmètre)
- Import des programmes `scheduler-component` (`.storage/scheduler.storage`, version 3) — nécessite plages ponctuelles et défaut « rien » (présents en v1).
- Import des automatisations HA à déclencheur horaire / solaire (conversion assistée ; l'automatisation d'origine est désactivée, pas supprimée).
- Droits par rôle / utilisateur / profil.

## 16. Décisions de comportement
- Programme activé / HA redémarré **hors plage** : l'action par défaut est appliquée tout de suite (si `reappliquer`, § 5.5, S38).
- Profils (modes) par programme (§ 5.10).
- `admin_only` **désactivé** par défaut ; droits par rôle / utilisateur / profil en v2.

## 16 bis. Comportements entre programmes
- Un programme désactivé libère ses entités (son défaut ne vaut que pour sa propre désactivation) ; Vacances : défaut du plus prioritaire, une fois (§ 5.4). « Vacances » désigne ici l'interrupteur global « Suspension de tous les programmes », pas le mode Vacances (§ 5.10).
- Une action ponctuelle est sautée si un programme plus prioritaire est dans un horaire pour cette entité (§ 5.2).
- Avec `admin_only`, un non-admin garde la lecture, les interrupteurs (`program/set_enabled`) et le mode (`program/set_profile`) ; rôles en v2 (§ 9).

## 17. QA follow-up

- [ ] Complete a browser visual/interaction regression pass on the local test instance; production validation remains separate.

- [ ] Broader architecture/module refactoring remains outside this focused correction batch.

## 19. Daily random time windows

Each start or end TimeSpec may include optional `random_minutes`, an integer from 0 to 240. Absent/zero preserves the existing time exactly. The form offers a per-boundary checkbox and defaults to 15 minutes when enabled; the user can set 1–240 minutes or disable it explicitly. This is a delay after the configured time, never an advance.

Resolve the configured local fixed time or solar event/offset/bounds first, using the existing DST rules; a solar time keeps its exact minute (seconds truncated, no step rounding). Add an integer elapsed-minute delay in UTC. A solar `latest` remains a true cap after the delay. Overnight selection is based on the original boundaries, before jitter; the occurrence retains its original local date even if its delayed action falls on the next day.

The daily draw is derived from stable program, profile, slot, original local occurrence date and boundary identity. Recalculation, preview, restart and all entities of the same slot share the same draw. Different days have independent deterministic draws, which may coincidentally be equal. No additional polling, timer per slot, persistent random state or device-specific rule is introduced.

For fixed-time ranges, reject settings whose maximum start delay would leave less than five minutes before the earliest end. Validate the full possible occupied intervals across the week, including midnight and Sunday/Monday, rather than one sampled draw. Existing seasonal solar/DST invalid-occurrence handling remains in force. The single resolved schedule remains the source for engine and preview.

## 20. Solar time limits

Un début ou une fin solaire (lever / coucher) accepte déjà `earliest` et `latest` (heures `HH:MM`, minute libre). Le formulaire d'horaire les expose : deux champs d'heure facultatifs « Au plus tôt à » / « Au plus tard à » sous les pastilles Lever / Coucher, chacun avec un bouton pour retirer la limite. Ils n'apparaissent que pour une heure solaire. Résolution inchangée : décalage, puis limites, puis délai aléatoire (la limite « après » plafonne aussi le résultat).

Les limites survivent au changement de décalage, au délai aléatoire, au passage lever/coucher, au regroupement et à la duplication ; revenir à une heure fixe ou glisser une barre vers une heure exacte remplace la définition, comme avant. Une limite « avant » postérieure à « après » est refusée dans le formulaire (message clair) et par le serveur (`earliest_after_latest`) ; des limites égales sont acceptées.

## 21. Écarts connus et travaux ouverts

Relevés en comparant cette spec au code ; les points cochés sont clos (§ 22), les autres restent **non faits**. La preuve
indique où le vérifier.
Les cases encore ouvertes du § 17 restent ouvertes et ne sont pas répétées ici, sauf mention.

### 21.3 Publication et validation réelle
- [ ] Installation propre via HACS (dépôt personnalisé) vérifiée, désinstallation propre, puis demande d'inclusion dans
      la liste HACS par défaut.
- [ ] Test réel ≥ 3 jours sur le banc d'essai (§ 13, point 2).
      *en cours — le propriétaire indique que les tests réels sont OK à ce jour (2026-10-31) ; durée ≥ 3 jours et version testée non consignées*
- [ ] Stratégie de tags / releases : dernier tag et dernière release GitHub `v0.7.10` ; `main` est derrière `develop` ; pas de `1.0.0`.
- [ ] Refonte des modules / de l'architecture (`engine.py` ~36 ko, `weekly-planner-card.ts` ~29 ko) : hors du périmètre
      des corrections actuelles (§ 17), à planifier séparément.

## 22. Valeurs par défaut, réparations et nettoyage

- [ ] Passe visuelle (tâches 12/13 de la revue), tags / releases, HACS, test réel, `docs/controle-visuel.md` : hors de cette version.

## 23. Passe visuelle, performance et garde-fous qualité

- [ ] Stratégie de tags / releases, installation HACS, test réel ≥ 3 jours (en cours), icône « maintenant » sur ligne longue à 1440 px, survivants de mutation de `validation.py` : hors de cette version.

## 24. Panneau de la barre et ordre de l'écran d'horaires

Décisions du propriétaire du 2026-10-31, implémentées (§ « décisions » : `docs/DECISIONS.md`).

### 24.2 Écran d'horaires d'un programme (§ 10)
- *Interprétation à confirmer : « réglages » = la ligne « Le reste du temps ».*

## 25. Légende du graphique et modale à deux colonnes

Décisions du propriétaire du 2026-10-31, statut **implémenté** (§ « décisions » : `docs/DECISIONS.md`).

### 25.1 Légende du graphique du jour (§ 10.4)
- [ ] Vérifier en 360 px et ≥ 1400 px, clair et sombre (non testé en navigateur ; tests CSS seulement).

### 25.2 Modale d'horaires sur ordinateur (§ 10.3)
- [ ] Vérifier en navigateur à 360 px, 820 px et ≥ 1400 px, clair et sombre, sans erreur console (non testé en navigateur par l'implémentation ; tests CSS et ordre du DOM seulement).

---

## 26. Corrections du contrôle visuel (écouteur de démarrage, défilement)

Corrections issues de `docs/CONTROLE_VISUEL_0.20.md`.

- [ ] Non testé : ordre de Tab jusqu'à Supprimer ; édition d'un autre mode ; vérification en navigateur de la correction de défilement.

---

## 27. Graphique sous le schéma hebdomadaire

Demande du propriétaire (2026-10-31) : « graphique sous le schéma en mode modal, également dans la vue dashboard (modale fermée) sous le schéma hebdomadaire, avec un bouton collapse ».

- [ ] Vérifier le thème clair et un programme multi-appareils (non testé).

## 28. Anomalies connues du contrôle visuel

Demande du propriétaire (2026-10-31) : « Corrige les bugs connus » (`docs/CONTROLE_VISUEL_RESULTATS.md`).

- [ ] Non rejoué dans le navigateur : toutes ces corrections (pas d'instance de développement isolée pour ce correctif).

## 29. Graphique du jour : bande « En marche ou ouvert »

- [ ] Vérifier sur l'instance réelle (« Volets – Salle de bain », « Bureau »).

## 30. Horaires indépendants par appareil (#34)

Demande de changement : https://github.com/movrack/ha_weekly_planner/issues/34. Contrat : § 8.2 ; décisions D1-D7
(`docs/DECISIONS.md`, 2026-11-01). Ordre : lot 0, puis 1, 2 et 4 en parallèle, puis 3, puis 5, puis 6.

- [ ] À vérifier sur l'instance réelle après déploiement : le cas du propriétaire à 07:00 et 22:00 (heure réelle).

## 31. Édition directe des vues circulaires (#35)

- [ ] Vérification sur téléphone tactile réel et viewport exact 360 × 780 px.

## 32. Navigation continue du graphique (#36)

- [ ] Vérification intégrée Home Assistant complète et téléphone tactile réel (viewport exact 360 × 780 px).

## 33. Sources complémentaires du graphique (#37)

Plan détaillé : [PLAN_CHART_SOURCES.md](PLAN_CHART_SOURCES.md).

- [ ] Navigateur Home Assistant réel en 360 × 780 px et bureau, clair/sombre ; téléphone tactile physique (suivi détaillé dans le plan).

## 35. Alignement du graphique et du schéma

Plan détaillé : [PLAN_CHART_ALIGNMENT.md](PLAN_CHART_ALIGNMENT.md).


## 37. Demandes à clarifier (propriétaire, 2026-11-07)

Ces trois demandes sont **non implémentées**. Chaque point ci-dessous reste une question ouverte : ne rien coder avant la réponse du propriétaire, puis enregistrer la décision dans `docs/DECISIONS.md`.

### 37.1 Mettre un programme en pause (1 jour, 2 jours, 1 semaine, 2 semaines)
- [ ] Bouton « Mettre en pause » avec quatre durées : 1 jour, 2 jours, 1 semaine, 2 semaines.
- Questions :
  - Portée : un programme, un appareil, ou toute la maison ? Quel rapport avec l’interrupteur de pause global existant et avec le mode Vacances ?
  - Début et fin : depuis maintenant, ou jusqu’à minuit ? « 1 jour » = 24 h ou jusqu’à la fin de la journée ? Reprise automatique à l’échéance, avec ou sans réapplication de l’état voulu (§ 5.5) ?
  - Pendant la pause : les appareils restent tels quels, ou une action est appliquée au début ?
  - Annulation anticipée, décompte visible (« reprend le … »), survie à un redémarrage de Home Assistant (échéance stockée, pas un minuteur).
  - Emplacement du bouton (carte, mode simple « mamy », fenêtre du programme) et droits des non-administrateurs.

### 37.2 Sélecteur de mode / saison
- [ ] Sélecteur permettant de choisir le mode (semaine type) ou la saison depuis la carte.
- Questions :
  - Différence entre « mode » et « saison » pour l’utilisateur : un seul sélecteur ou deux ? Libellés pour le mode simple.
  - Que fait-il de plus que le sélecteur de saison/mode déjà proposé (`mode_source`, entité sélecteur) ? Remplace-t-il quelque chose ?
  - Emplacement (en-tête de la carte, tableau de bord, fenêtre du programme), portée (tous les programmes ou un seul), droits des non-administrateurs.
  - Changement manuel ou automatique (calendrier de saisons) ; que se passe-t-il à la prochaine bascule automatique ?

### 37.3 Configuration des programmes par un fichier YAML
- [x] Les programmes se configurent facilement dans un fichier YAML situé dans `/config/www/weekly_planner.yml`.
- [x] Toute modification faite dans l’interface enregistre ou met à jour ce fichier.
- Comportement décidé (2026-11-07, `yaml_file.py`) :
  - Le stockage `.storage` reste la référence ; le fichier est un miroir généré (version, vacances, réglages, programmes ; ni état d’exécution ni journal), réécrit ~2 s après chaque enregistrement de l’interface (commentaires et ordre non conservés), créé au démarrage s’il manque.
  - Modification à la main : relue toutes les 30 s, au démarrage et par `weekly_planner.reload` ; validée avec les règles des commandes websocket avant tout changement, puis importée sans réécriture (hash dans `runtime.yaml_hash`).
  - Fichier vide, non mappé ou invalide : rien ne change, fichier non touché, problème de réparation `yaml_invalid` effacé dès que le fichier est valide ; un enregistrement de l’interface le copie d’abord en `weekly_planner.yml.invalid`.
  - Confidentialité : `/config/www` est public sans authentification (`/local/weekly_planner.yml`) ; avertissement dans l’en-tête du fichier et les README. Supprimer l’intégration supprime le fichier.

## 38. Échelle de qualité Home Assistant — niveau Bronze (2026-11-07)

Objectif du propriétaire : suivre l’échelle de qualité des intégrations de Home Assistant et atteindre le premier niveau, **Bronze** (auto-déclaré : intégration HACS, pas de badge officiel). Recherche complète, état règle par règle et étude Silver / Gold (non visés) : `docs/PLAN_QUALITY_SCALE.md`.

- [ ] Créer `quality_scale.yaml` (règles Bronze `done` ou `exempt` motivé ; Silver et Gold en `todo`).
- [ ] Extraire un socle d’entité commun (`entity.py`) pour `switch.py` et `select.py` (règle `common-modules`), sans changer les identifiants ni les noms.
- [ ] Documenter la désinstallation (README anglais et français) (règle `docs-removal-instructions`).
- [ ] Relire la documentation des actions (champs et exemple de chaque action).
- [ ] Test automatique de cohérence de `quality_scale.yaml` ; `hassfest` et HACS restent verts en CI.
- [ ] Noter le niveau visé et les exemptions dans `docs/DECISIONS.md` et une ligne dans le README.
- Silver et Gold : étudiés seulement, non planifiés.
