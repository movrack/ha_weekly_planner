# Weekly Planner — spécification v1

> Statut : **brouillon 0.1** (en relecture). Langue de travail : français.
> Dépôt : `ha_Weekly_planner` · domaine HA : `weekly_planner` · cible : Home Assistant ≥ 2026.10.
> Les cases `[ ]` / `[x]` suivent l'avancement. Critère de fin de la v1 : **tout fonctionne** (§ 13).

---

## 1. But

Un planificateur hebdomadaire **générique et agréable** pour Home Assistant, installable par HACS :
programmer, jour par jour, des **plages horaires** qui appliquent une action à une ou plusieurs entités
(thermostats, volets, lumières, prises, ventilateurs…), puis remettent l'**état par défaut** à la fin.

Il remplace les planificateurs existants (helper `schedule` natif, `scheduler-component`) sur leurs points
faibles relevés au benchmark :

| Point faible ailleurs | Réponse de Weekly Planner |
|---|---|
| La fin d'un créneau n'exécute rien | Chaque plage a un début **et** une fin ; la fin applique l'état par défaut |
| Tout est rejoué après une coupure de courant, les réglages manuels sont écrasés | État voulu **recalculé** au démarrage ; dérogations mémorisées ; réglage « réappliquer » |
| Aucune notion de dérogation manuelle | Dérogation détectée, respectée jusqu'à la fin de la plage, visible dans la carte |
| Une planification = un appareil + une action | Un programme = plusieurs entités, chacune son action ; modes partagés par type |
| Pas de vue semaine lisible | Vue semaine en barres colorées + détail du jour + graphique prévu/réel |
| Deux dépôts HACS (composant + carte) | Un seul dépôt : l'intégration embarque sa carte |

## 2. Glossaire

- **Programme** : ensemble nommé d'entités + une semaine de plages + réglages. Un interrupteur par programme.
- **Plage** : intervalle `[début, fin)` d'un jour, avec une action par type (mode) ou par entité (consigne).
- **Consigne** : action concrète sur une entité (ex. `preset = eco`, `position = 30`, `scène X`).
- **Mode** : consigne nommée, colorée, partagée par **type d'entité** (valeur commune + exceptions par entité).
- **Type** : famille d'entités (`climate`, `cover`, `light`, `switch`…), voir § 6.
- **État par défaut** : ce que l'entité reçoit à la fin d'une plage (mode/consigne par défaut, ou état d'avant).
- **Dérogation** : changement de l'entité fait par quelqu'un ou quelque chose d'autre que Weekly Planner pendant une plage.
- **Segment** : période continue pendant laquelle l'état voulu d'une entité ne change pas (plage ou intervalle par défaut).

## 3. Périmètre v1

Inclus : tout ce qui suit dans ce document. **Hors v1 (v2)** : import automatique des programmes
`scheduler-component` et des automatisations HA à déclencheur horaire (§ 15).

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
| D11 | Dépôt séparé ; tests via une instance HA locale (Docker) ; prod seulement pour des versions finies. |
| D12 | GitHub privé puis public ; licence MIT. Branche de travail `develop`, `main` propre ; PR après la v1. |
| D13 | Types v1 : climate, cover, light, switch, input_boolean, fan, water_heater, media_player, input_number, input_select, « Autre » (action/script). |
| D14 | Carte : vue semaine (7 barres + trait « maintenant ») ; éditeur du jour = liste + barre aux bords glissables. |
| D15 | Carte configurable : un programme fixé **ou** liste filtrée (type/zone) avec création. |
| D16 | Option globale de l'intégration « modification réservée aux administrateurs » (désactivée par défaut). |
| D17 | Entité injoignable : réessai à son retour ; journal de bord ; notification après X min (30 par défaut). |
| D18 | Pour Evohome : consignes en dérogation **permanente**. |
| D19 | Modes de départ fournis ; page « Modes » ; valeur « avancée » (tout état/attribut) ; action « scène HA » ; lumière « Automatique » (Adaptive Lighting / effet). |
| D20 | « Fini » = tests automatiques + test réel + vérification visuelle (§ 13). |
| D21 | Graphique 24 h dans le détail du jour : consigne prévue, consigne appliquée, mesure, zones dérogation / fenêtre / chauffe. |
| D22 | Deux visages : consultation très lisible ; configuration **en modales**. |
| D23 | Doc README en anglais + `README.fr.md` ; versions `0.x` puis `1.0.0` ; CHANGELOG ; releases GitHub. |

## 5. Comportement (règles du moteur)

### 5.1 Principe : état voulu recalculé, actions sur transitions

Le moteur ne « rejoue » pas des événements : à tout instant il sait calculer, pour chaque entité gérée,
l'**état voulu** et le **segment** en cours. Il agit **seulement aux transitions** de segment
(début ou fin de plage, condition qui bascule, programme activé/suspendu, Vacances, modification),
puis laisse l'entité tranquille. C'est ce qui permet de respecter une dérogation.

Algorithme (pour chaque entité *E*) :
1. Lister les programmes **actifs** (switch `on`, Vacances off) qui contiennent *E*.
2. Garder ceux dont les conditions de programme sont vraies et qui ont une plage en cours
   (dont les conditions de plage sont vraies).
3. Le programme gagnant est celui de **priorité** la plus haute (plus petit numéro ; égalité → le plus ancien).
4. État voulu = action de cette plage pour *E* ; s'il n'y a aucune plage gagnante, état voulu = **état par
   défaut** du dernier programme qui a piloté *E* (voir 5.4).
5. Prochaine transition = plus proche début/fin de plage de tous les programmes concernés, recalcul des heures
   solaires à minuit local et à chaque modification.

Un seul minuteur `async_track_point_in_time` est armé sur la prochaine transition globale ; à chaque réveil, le
moteur recalcule tout (idempotent, rattrape un réveil en retard).

### 5.2 Début et fin de plage
- **Début** : on mémorise l'état courant de l'entité (pour un éventuel « retour à l'état d'avant »), puis on applique la consigne.
- **Fin** : on applique l'état par défaut, **même si une dérogation a eu lieu pendant la plage**.
- Exemple de référence : volet, plage 20:00 → 08:00 « Fermé », défaut « Favori ». 20:00 il ferme ; 21:00 la
  télécommande l'ouvre à moitié → il reste à moitié ; 08:00 il passe en favori.

### 5.3 Dérogation manuelle
- Est une dérogation tout changement **des attributs pilotés** de *E* (état, preset, consigne, position,
  luminosité, couleur…) qui ne vient pas de Weekly Planner, détecté pendant un segment.
- « Vient de Weekly Planner » : le `context.id` de l'événement (ou son `parent_id`) appartient à l'ensemble des
  contextes émis par le moteur (identifiants marqués `…:wp:…`, conservés 10 min), **et** l'état obtenu
  correspond à l'état demandé (tolérance par type). Raison : HA garde notre contexte 5 s sur l'entité.
- Ne sont **pas** des dérogations : les changements faits par Adaptive Lighting (contexte `:al:`) quand la
  consigne de *E* est « Automatique » ; les retours d'état intermédiaires pendant 60 s après notre appel
  (volet en mouvement, thermostat cloud qui confirme) ; les changements internes de Versatile Thermostat
  (fenêtre, sécurité) visibles seulement dans ses attributs `current_state` alors que `requested_state` est inchangé.
- Effet : l'entité est marquée « en dérogation » jusqu'à la fin du segment ; rien n'est réappliqué ; la carte
  l'affiche (⚠️ + « Reprendre ») ; le marquage est **persisté** (survit au redémarrage).
- Service `weekly_planner.resume` / bouton « Reprendre » : efface la dérogation et réapplique l'état voulu.

### 5.4 État par défaut
- Réglable par type dans le programme, avec exception par entité : `mode`/`consigne` par défaut (proposé),
  ou `état d'avant` (restaure l'état mémorisé au début de la plage, avec ses attributs pilotés).
- Entre deux programmes : si un programme de priorité plus haute se termine pendant qu'un programme plus bas est
  dans une plage, l'entité reçoit l'action de cette plage (reprise de la main) et pas le défaut.
- Si aucune plage n'est en cours, c'est le défaut du **programme dont la plage vient de finir** qui s'applique.

### 5.5 Redémarrage, activation, modification (D10)
- Réglage par programme `reappliquer` (oui par défaut).
- Au démarrage de HA, à l'activation du programme, ou quand on modifie la plage en cours / ses entités :
  si `reappliquer = oui`, l'état voulu courant est appliqué aux entités **sans dérogation persistée** ;
  sinon on attend la prochaine transition.
- Au démarrage, une fin de plage manquée pendant l'arrêt (plage terminée entre l'arrêt et le redémarrage) est
  toujours rattrapée : l'état par défaut est appliqué (sauf si l'entité a été modifiée depuis).
- Désactivation d'un programme pendant une plage : l'état par défaut est appliqué (comme une fin de plage).

### 5.6 Conditions et Vacances (D9)
- Condition = `entité` (+ attribut facultatif) `=`, `≠`, `<`, `>` `valeur` ; toutes doivent être vraies (ET).
- Niveau programme et niveau plage. Évaluées à chaque transition **et** à chaque changement des entités citées.
- Condition qui devient fausse pendant une plage = fin de plage (état par défaut). Qui redevient vraie pendant
  la plage = début de plage (si `reappliquer`).
- `switch.weekly_planner_vacances` : suspend tous les programmes et applique leur état par défaut ; à la
  désactivation, les plages en cours sont appliquées si `reappliquer`.

### 5.7 Heures et calendrier
- Pas de 5 min ; plage minimale 5 min ; une plage peut passer minuit (elle appartient au jour de son début).
- Heure solaire : `aube | lever | coucher | crépuscule` ± décalage (min), bornes facultatives `au plus tôt`,
  `au plus tard`. Calcul `homeassistant.helpers.sun.get_astral_event_date` pour la date locale ; recalcul chaque
  jour à minuit. Si une heure solaire fait chevaucher deux plages, la plus tardive est rognée et la carte l'indique.
- Changement d'heure (Europe/Brussels) : heures construites en heure locale puis normalisées par UTC. Heure
  inexistante (printemps) → on avance (02:30 → 03:30). Heure ambiguë (automne) → première occurrence, une seule
  exécution par plage et par jour. Graphique et barres en minutes locales 0–1440.

### 5.8 Exécution des consignes
- Appels de service avec un `Context` marqué Weekly Planner (`<10 car. ULID>:wp:<hash programme>:<n>`).
- Ordre : d'abord le mode de fonctionnement (`hvac_mode`, `turn_on`), puis la valeur (consigne, preset,
  position…) après confirmation de l'état (attente ≤ 30 s).
- Vérification : si l'état obtenu ne correspond pas après 60 s → nouvel essai (3 au maximum), puis échec.
- Entité `unavailable`/`unknown` ou échec : l'action est mise en attente et rejouée au retour de l'entité si le
  segment est toujours le même ; notification persistante si toujours en échec après X min (option, 30 par défaut).
- Journal de bord HA : une entrée par action (« Weekly Planner : Bureau → Confort (19 °C) ») et par dérogation détectée.

## 6. Types d'entités et consignes (D13, D19)

| Type | Consignes proposées | Comparaison (dérogation) |
|---|---|---|
| `climate` | température ; preset (`preset_modes`) ; `hvac_mode` ; `off` | consigne ±0,2 °C, preset, hvac_mode |
| `cover` | ouvrir ; fermer ; position % ; inclinaison % ; « favori » (`my_position`/bouton favori si dispo) | position ±3 % |
| `light` | allumer/éteindre ; luminosité % ; couleur / température de blanc ; effet (`effect_list`) ; **Automatique** (allumer + activer le switch Adaptive Lighting choisi) | état, luminosité ±10 %, couleur |
| `switch`, `input_boolean` | allumer / éteindre | état |
| `fan` | allumer/éteindre ; vitesse % ; preset | état, pourcentage |
| `water_heater` | mode d'opération ; température | mode, consigne |
| `media_player` | allumer/éteindre ; volume ; source ; lire un média | état |
| `input_number` | valeur | valeur |
| `input_select` | option | option |
| Autre / tout type | **action HA au choix** (sélecteur d'actions HA) ; **scène HA** ; **script** | aucune (pas de détection) |
| Valeur avancée | tout état + attributs, comme l'éditeur de scènes | attributs choisis |

Les choix proposés sont **lus sur l'entité** (`preset_modes`, `hvac_modes`, `effect_list`, `supported_features`…).
Versatile Thermostat : presets `eco`, `comfort`, `boost`, `frost` (+ `none`) ; Weekly Planner n'utilise **pas**
`manual_override_duration_min` ni `set_timed_preset` (il gère lui-même la fin des plages).

## 7. Modes (D5, D19)

- Bibliothèque par type ; chaque mode : `nom`, `couleur`, `icône`, `valeur commune` (une consigne), `exceptions`
  (`{entity_id: consigne}`).
- Modes de départ : thermostat Confort 🟧 / Éco 🟦 / Nuit 🟪 / Boost 🟥 / Hors-gel ⬜ ; volet Ouvert / Fermé /
  Favori ; lumière Allumée / Éteinte ; prise Allumé / Éteint. Pour un thermostat qui a le preset correspondant
  (Versatile Thermostat), la valeur proposée est le **preset** ; sinon une température.
- Modifier un mode met à jour tous les programmes qui l'utilisent (signalé à l'enregistrement : « utilisé par N programmes »).
- Suppression d'un mode utilisé : interdite tant qu'il est utilisé (la modale liste les programmes concernés).
- Les barres de la carte prennent la couleur du mode ; une plage en consignes directes prend une couleur neutre
  hachurée (ou la couleur choisie pour la plage).

## 8. Données et stockage

`.storage/weekly_planner` (classe `Store`, `version` + `minor_version`, migrations testées, écriture différée 1 s).

```text
racine
├─ version_schema
├─ reglages        : admin_only, delai_notification_min, reappliquer_defaut
├─ vacances        : bool
├─ modes[]         : id, type, nom, couleur, icone, valeur, exceptions{entity_id: consigne}
└─ programmes[]    : id, nom, icone, priorite, actif, reappliquer, zone?, 
                     entites[]   : entity_id, type, defaut{genre: mode|consigne|etat_avant, valeur}
                     conditions[]: entity_id, attribut?, op, valeur
                     jours[0..6] : plages[] : id, debut, fin, conditions[], 
                                              actions{ par_type{type: mode_id} | par_entite{entity_id: consigne} }
runtime (store séparé `weekly_planner.runtime`) : par entité → segment courant, dérogation, état d'avant, actions en attente
```
- `debut`/`fin` : `{"heure": "HH:MM"}` ou `{"soleil": "sunset", "decalage": 15, "au_plus_tot": "18:00", "au_plus_tard": "21:00"}`.
- `consigne` : `{"genre": "preset|temperature|hvac_mode|etat|position|inclinaison|luminosite|couleur|effet|auto|scene|action|avancee", ...}`.
- Les identifiants sont stables (UUID courts) ; la carte n'envoie que des diffs validés côté serveur.

## 9. Entités, services, API

**Entités**
- `switch.weekly_planner_<programme>` : actif/suspendu ; attributs `mode_actuel`, `plage_actuelle`,
  `prochain_changement`, `entites_en_derogation`, `conflits`.
- `switch.weekly_planner_vacances`.
- Appareil HA « Weekly Planner » regroupant ces entités (`integration_type: service`).

**Services** (`weekly_planner.*`) : `resume` (entity_id ou programme), `apply_now` (programme),
`skip_next` (programme : ignorer la prochaine transition), `reload`.

**API websocket** (pour la carte ; refus si `admin_only` et utilisateur non admin, sauf lecture et switch) :
`weekly_planner/get` · `subscribe` (pousse les changements) · `program/create|update|delete|duplicate` ·
`mode/create|update|delete` · `preview` (calcule la timeline d'un jour, heures solaires résolues, conflits) ·
`history` (timeline prévue d'une période passée, pour le graphique).

**Options (options flow)** : modification réservée aux admins ; délai d'alerte (min) ; `reappliquer` par défaut.
Instance unique (`single_config_entry`).

## 10. Carte `weekly-planner-card`

### 10.1 Configuration de la carte (éditeur visuel)
`program: <id>` **ou** `filter: {types: [climate], area: bureau}` ; `title` ; `show_week: true` ; `show_chart: true`.

### 10.2 Consultation (par défaut)
- En-tête : titre, pastille Vacances si active.
- Une ligne par programme : nom, interrupteur, **mode actuel** (pastille colorée) + « jusqu'à 17:00 → Confort »,
  ⚠️ si dérogation (avec « Reprendre ») ou conflit.
- Barre du jour avec trait « maintenant », semaine repliable en barres fines ; légende des modes.
- Toucher une barre → modale **Jour** en lecture (graphique + liste). ✏️ discret → mode configuration.

### 10.3 Configuration (modales, plein écran sur téléphone)
- **Programme** : nom, icône, entités (sélecteur HA), priorité, conditions, état par défaut par type/entité, `reappliquer`, supprimer/dupliquer.
- **Jour** : barre 24 h aux bords glissables (pas 5 min, aimantation), liste des plages (✏️, +, supprimer), « Copier vers… » (Lun→Ven, Sam+Dim, jours au choix).
- **Plage** : début/fin (heure ou soleil + décalage + bornes), mode par type **ou** consignes par entité, conditions.
- **Modes** : un onglet par type ; nom, couleur, icône, valeur commune, exceptions ; « utilisé par… ».
- Validation en direct (chevauchements, plage trop courte, entité inconnue), annuler/enregistrer, aucune perte
  silencieuse.

### 10.4 Graphique (D21)
Dans la modale Jour : courbe 24 h par entité, dessin SVG intégré (aucune dépendance).
- Consigne **prévue** (escalier coloré par mode, passé + à venir, via `preview`/`history`).
- Consigne **appliquée** et **mesure** (`history/history_during_period`, `significant_changes_only: false`).
- Zones : dérogation, fenêtre ouverte (`window_state` VT), chauffe (`hvac_action` si dispo).
- Toucher = valeurs à cette heure ; ◀ ▶ jours précédents. Volets/lumières : position/luminosité prévue vs réelle.

### 10.5 Exigences transverses
Lisible à 420 px et ≥ 1400 px ; thème clair/sombre HA ; accessible au clavier ; textes fr/en ; aucune erreur console ;
chargement < 300 ms pour 20 programmes.

### 10.6 Livraison du JS
Lit + TypeScript, bundle unique `custom_components/weekly_planner/frontend/weekly-planner-card.js` (commité).
Servi par `async_register_static_paths` ; déclaré comme **ressource Lovelace** (mode storage) avec `?v=<hash>`,
`add_extra_js_url` seulement en mode YAML ; garde `customElements.get()` avant `define`.

## 11. Compatibilité et intégrations tierces

- **Versatile Thermostat** : piloter l'entité VT (presets), jamais ses sous-jacents. Fenêtre ouverte : VT gère ; le
  moteur ne réapplique rien et n'y voit pas de dérogation ; la consigne de fin est envoyée à VT qui l'applique à la fermeture.
- **Evohome** : option par entité « forcer la dérogation permanente » (`preset permanent` avant la consigne) ;
  proposée automatiquement si l'entité a ce preset.
- **Adaptive Lighting** : consigne « Automatique » = allumer + activer son switch ; ses changements ne sont pas des dérogations.
- **Scheduler existant** : la carte avertit si une entité est aussi pilotée par un `switch.schedule_*` actif.

## 12. Qualité, outillage, publication

- Arborescence : `custom_components/weekly_planner/` (moteur, store, websocket, switch, services, traductions,
  `brand/icon.png`, `frontend/`), `frontend/` (sources TS), `tests/`, `dev/` (Docker), `docs/`.
- Dev : `dev/docker-compose.yml` (image `ghcr.io/home-assistant/home-assistant:2026.10.x`), entités `demo` +
  `template` pour chaque type, montage de `custom_components/weekly_planner`.
- Tests : `pytest-homeassistant-custom-component` (aligné 2026.10) ; temps simulé (`freezer`, `async_fire_time_changed`).
- CI GitHub Actions : `hacs/action`, `hassfest`, pytest, build + lint de la carte.
- `hacs.json`, `manifest.json` (`domain`, `name`, `version`, `documentation`, `issue_tracker`, `codeowners`,
  `config_flow`, `iot_class: calculated`, `integration_type: service`, `dependencies: [http, frontend, websocket_api]`).
- Docs : README (en) + `README.fr.md`, captures, CHANGELOG ; releases GitHub ; `0.x` puis `1.0.0`.

## 13. Définition de « fini » (v1)

1. **Tests automatiques verts** couvrant au minimum les scénarios S1–S20 (§ 14.9).
2. **Test réel** : programme du bureau pendant ≥ 3 jours en prod, dont : début, fin, dérogation à la main, redémarrage
   de HA, entité injoignable, journal de bord correct.
3. **Vérification visuelle** de la carte à 420 px et ≥ 1400 px, clair/sombre : consultation, toutes les modales,
   glisser, copie, modes, graphique ; zéro erreur console.
4. CI verte (HACS, hassfest, tests, build) ; installation propre via HACS depuis le dépôt.

## 14. Tâches

### 14.1 Socle
- [ ] Squelette du dépôt (arborescence § 12, `hacs.json`, `manifest.json`, `brand/`, licence, README minimal)
- [ ] Environnement Docker de dev + entités de démonstration de chaque type
- [ ] CI : hacs/action, hassfest, pytest, build carte

### 14.2 Moteur
- [ ] Modèle de données + `Store` versionné + migration de test
- [ ] Calcul des plages d'un jour (heures fixes, soleil + bornes, passage de minuit, changement d'heure)
- [ ] Résolution par entité (priorités, conditions programme/plage, Vacances, défaut)
- [ ] Minuteur unique + recalcul idempotent + recalcul quotidien
- [ ] Exécution des consignes (ordre, confirmation, réessais, attente d'entité, contexte marqué)
- [ ] Détection de dérogation (contextes, tolérances, AL, VT) + persistance + `resume`
- [ ] Redémarrage / activation / modification avec `reappliquer` ; rattrapage des fins manquées
- [ ] Journal de bord + notification d'échec

### 14.3 Intégration HA
- [ ] Config flow (instance unique) + options flow
- [ ] Switch par programme + switch Vacances + appareil
- [ ] Services `resume`, `apply_now`, `skip_next`, `reload`
- [ ] API websocket (+ droits admin) + abonnement
- [ ] Traductions fr / en

### 14.4 Carte
- [ ] Outillage Lit/TS + bundle + enregistrement ressource + cache-busting
- [ ] Éditeur visuel de la carte (programme fixé / filtre)
- [ ] Vue consultation (lignes, mode actuel, barres jour/semaine, trait maintenant, dérogations, Reprendre)
- [ ] Modale Programme
- [ ] Modale Jour (barre glissable, liste, copie)
- [ ] Modale Plage (heures/soleil/bornes, modes par type, consignes par entité, conditions)
- [ ] Page / modale Modes
- [ ] Graphique 24 h (prévu, appliqué, mesure, zones, navigation)
- [ ] Responsive, thèmes, accessibilité, fr/en

### 14.5 Compatibilité
- [ ] Versatile Thermostat (presets, fenêtre)
- [ ] Evohome (dérogation permanente)
- [ ] Adaptive Lighting (consigne Automatique, contextes)
- [ ] Avertissement Scheduler existant

### 14.6 Documentation et publication
- [ ] README en / fr, captures, CHANGELOG
- [ ] Release `0.1.0` (prod de test), puis `1.0.0` sur `main`
- [ ] Dépôt public + demande d'inclusion HACS par défaut (après 1.0.0)

### 14.7 Validation réelle (banc d'essai)
- [ ] Installation en prod via HACS (dépôt personnalisé)
- [ ] Programme réel ≥ 3 jours, scénarios § 13.2 cochés un à un

### 14.8 Revue
- [ ] Relecture « avocat du diable » de cette spec et intégration des retours

### 14.9 Scénarios de test (automatiques)
- [ ] S1 plage simple : début applique, fin applique le défaut
- [ ] S2 plage passant minuit
- [ ] S3 heure solaire + décalage + bornes (été / hiver)
- [ ] S4 changement d'heure printemps (02:30 inexistante) et automne (02:30 ambiguë)
- [ ] S5 dérogation pendant la plage : rien réappliqué, fin appliquée
- [ ] S6 dérogation puis redémarrage : dérogation conservée
- [ ] S7 redémarrage en cours de plage, `reappliquer` oui / non
- [ ] S8 fin de plage manquée pendant l'arrêt → rattrapée
- [ ] S9 deux programmes, priorités, reprise de la main
- [ ] S10 condition de programme qui bascule en pleine plage
- [ ] S11 condition de plage
- [ ] S12 Vacances on / off
- [ ] S13 entité injoignable puis revenue ; notification après délai
- [ ] S14 confirmation lente (thermostat cloud) : pas de fausse dérogation
- [ ] S15 Adaptive Lighting : pas de fausse dérogation
- [ ] S16 état par défaut « état d'avant »
- [ ] S17 modification d'un mode utilisé par plusieurs programmes
- [ ] S18 suppression d'un programme en pleine plage (défaut appliqué, nettoyage)
- [ ] S19 droits : `admin_only` refuse l'écriture à un non-admin
- [ ] S20 migration du stockage (schéma n → n+1)

## 15. v2 (hors périmètre)
- Import des programmes `scheduler-component` (`.storage/scheduler.storage`, version 3).
- Import des automatisations HA à déclencheur horaire / solaire (conversion assistée, l'automatisation d'origine est désactivée, pas supprimée).

## 16. Questions ouvertes
- Q-A Dérogation pendant une plage puis redémarrage : la dérogation l'emporte-t-elle sur `reappliquer = oui` ? (proposé : oui)
- Q-B Programme activé (ou HA redémarré) **entre deux plages** : appliquer l'état par défaut tout de suite ? (proposé : oui si `reappliquer`)
- Q-C Faut-il un bouton « Reprendre » et une dérogation à durée (Tado) en plus de « jusqu'à la fin de la plage » ?
- Q-D Profils saisonniers (hiver / été) à bascule unique ?
- Q-E Vitrine : quel système « automatique » de changement de couleur faut-il rendre disponible ?
