# Revue Mamy — Weekly Planner 0.16.0

Revue du 29 octobre 2026, référence `70520e5`. Point de vue : une personne de
80 ans qui utilise occasionnellement Home Assistant et ne connaît pas son vocabulaire.

## Méthode et limites

Revue visuelle des composants réels de la carte, chargés depuis le bundle 0.16.0
dans Home Assistant local (`localhost:8124`). Le navigateur a été piloté par
l’agent principal ; Mamy a examiné ses captures partagées et les sources pour
préciser certains comportements. L’accès direct du sous-agent au même profil
Chrome était indisponible. Il ne s’agit donc pas d’une navigation autonome de Mamy.

Les écrans de configuration sont montés sous le composant Home Assistant afin
d’utiliser ses vrais sélecteurs. Ce montage ne comprend pas le pied de fenêtre
natif de l’éditeur Lovelace : la coexistence avec ses boutons Enregistrer/Annuler
n’est pas validée. Aucune sauvegarde de programme, activation de mode ou commande
d’appareil n’a été effectuée pour cette revue. Les programmes utilisés sont locaux.
Un bouton d’entrée de démonstration a été créé uniquement sur cette instance
locale pour afficher le choix d’une autre cible ; son action n’a pas été appelée.

## Points à améliorer

Les observations ci-dessous distinguent le rendu visible des comportements
confirmés uniquement par lecture du code. Les anciens constats corrigés ne sont
pas réouverts. Le point 1 est un défaut confirmé ; les points 2 à 5 sont des
risques de compréhension ou des améliorations ergonomiques.

| Priorité | Écran / difficulté | Conséquence pour Mamy |
|---|---|---|
| P1 | Plusieurs menus affichent la première option au lieu de la valeur du brouillon. | On lit un réglage faux et on ne peut plus se fier au formulaire. |
| P1 | Modes : « Mode actif » agit dès le choix, au milieu d’un formulaire à appliquer. | On peut changer les commandes réellement exécutées en croyant préparer un brouillon. |
| P2 | Création : l’ajout d’un appareil supplémentaire affiche une étoile de champ obligatoire. | Avec un appareil déjà choisi, on croit devoir encore en ajouter un avant de créer. |
| P2 | Création : zéro action proposée ne donne pas d’explication sur la suite. | On peut croire avoir terminé un programme utilisable alors qu’aucune commande de service n’est proposée. |
| P3 | Modes externes : deux associations suffisent à éloigner les horaires et Appliquer de plusieurs écrans. | On perd le contexte et cherche comment terminer. |

1. **Afficher les valeurs réelles dans les menus. Priorité absolue.** Trois cas
   sont confirmés par captures et inspection DOM du navigateur local :

   - Modes externes : le brouillon contient `{Maison: "home", Vacances:
     "holiday"}`, mais le menu « Mode du programme » de Vacances affiche Maison
     (`mode-target-1.value === "home"`). Captures `10-modes-external-top.png`,
     `11-modes-external-middle.png` et `16-mapping-model-display-mismatch.png`.
   - Action avec valeur d’une entité : le brouillon lit l’attribut `temperature`,
     mais « Valeur à lire » affiche « État de l’entité »
     (`attribute-temperature.value === ""`). L’aperçu 15 provient bien de
     l’attribut ; le menu annonce une autre source. Capture
     `15-label-entity-value.png`.
   - Mode actif manuel : avec le statut Vacances injecté uniquement dans la
     fixture locale (aucune activation envoyée), `_activeId()` vaut `holiday`,
     mais `mode-active.value` vaut `home`. La même vue annonce alors « Actif
     actuellement : Vacances » et « Mode actif : Maison ». Capture
     `17-manual-mode-display-mismatch.png`.

   Les données du brouillon restent présentes : aucune perte de configuration
   n’est démontrée. En revanche, le formulaire raconte autre chose. Choisir
   Maison alors que Maison est déjà affiché peut même ne déclencher aucun
   changement vers la valeur voulue. Synchroniser les menus après création de
   leurs options et vérifier les autres menus dynamiques du même type.
   **Acceptation :** rouvrir Modes affiche Vacances pour l’association Vacances ;
   rouvrir une action lisant `temperature` affiche cet attribut ; le menu Mode
   actif concorde avec le statut actif, y compris pour un autre mode que le premier.
   La valeur visible, la sélection DOM, le brouillon et l’aperçu concordent au premier affichage,
   après navigation entre onglets et après changement d’entité. Ajouter une
   vérification navigateur portant sur la sélection réellement affichée.

2. **Annoncer l’effet immédiat de l’activation.** Dans Modes, choisir
   Manuellement fait apparaître « Mode actif », juste au-dessus de « Mode à
   modifier ». La capture `09-modes-manual.png` explique que le second n’active
   rien, mais ne prévient pas que le premier agit immédiatement. Le code
   `_changeActiveMode` envoie directement `weekly_planner/program/set_profile` ;
   cette commande n’a pas été exécutée pendant la revue. Écrire « Mode actif —
   changement immédiat », avec une courte aide indiquant qu’Appliquer n’est pas
   nécessaire. Séparer visuellement cette commande des réglages du brouillon.
   **Acceptation :** avant de toucher le menu, on sait s’il prépare un changement
   ou s’il commande le programme ; Annuler la modification ne laisse pas croire
   qu’il rétablira un mode déjà activé.

3. **Présenter l’ajout d’un autre appareil comme facultatif.** Sur la création,
   choisir un appareil puis descendre : « Ajouter un appareil » précède encore
   « Sélectionner une entité * ». Capture `04-create-bottom.png` ; le même
   sélecteur est employé dans Appareils. Retirer l’étoile pour cette action
   d’ajout et écrire « Ajouter un autre appareil (facultatif) ». Conserver un
   message de validation si aucun appareil n’a été choisi. **Acceptation :**
   avec un appareil, aucun champ vide marqué obligatoire ne reste devant le
   bouton Créer ; sans appareil, l’erreur indique quoi choisir.

4. **Expliquer le cas zéro commande et la prochaine étape.** La capture
   `04-create-bottom.png` montre « Actions proposées · 0/5 » et un bouton
   Créer actif. Le code de validation autorise ce cas ; aucun enregistrement
   n’a été tenté. Le texte explique où le programme est enregistré, mais pas
   comment obtenir son premier horaire. Ajouter une aide brève près du compteur
   zéro (« Aucune commande de service proposée pour cet appareil »), puis un
   chemin explicite vers les horaires après création. Ne pas imposer de commande
   choisie automatiquement et conserver le cas des scènes. **Acceptation :** une
   débutante distingue les commandes disponibles des actions effectivement
   planifiées et trouve la prochaine étape sans chercher dans les réglages.

5. **Raccourcir le parcours des modes externes.** Les captures
   `10-modes-external-top.png` à `12-modes-external-bottom.png` montrent les deux
   associations, puis les horaires, les boutons de gestion des modes et enfin
   Appliquer. La hauteur mesurée dans le navigateur est de 1 744 px à 360 × 780,
   pour seulement deux associations. Regrouper les associations dans une section
   repliable et laisser un résumé (« 2 états associés »). Garder une seule action
   Appliquer repérable sans multiplier les paires de boutons. **Acceptation :**
   sur téléphone, on retrouve le mode à modifier et l’action finale sans devoir
   relire toute la liste des associations ; aucune commande n’est masquée sans
   intitulé clair pour la retrouver.

## Parcours lisibles vérifiés visuellement

- Affichage d’un programme : boutons distincts « Nouveau programme » et
  « Modifier ce programme », choix de vue et graphique repérables.
- Liste filtrée : les programmes ont des cases avec leur nom ; le texte précise
  la portée locale à la carte, le cumul des filtres et l’inclusion des futurs
  programmes lorsque Tous est choisi.
- Création : nom, appareils et commandes passent avant les options secondaires ;
  aucune commande n’est cochée par défaut, les descriptions sont visibles.
- Un appareil déjà utilisé indique les programmes concurrents et leurs priorités.
- Le brouillon de création est signalé en revenant à Affichage et se retrouve
  avec « Continuer la création ».
- Général : explication de la priorité et de la réapplication, message de portée
  partagée près d’Appliquer ; Suppression est visuellement séparée.
- Modes : choix du mode à modifier distinct du mode actif, actions Ajouter,
  Renommer et Copier nommées ; l’éditeur d’horaires Vacances affiche clairement
  « Modifier ces horaires n’active pas ce mode ».
- Actions : description du service sélectionné et distinction entre valeur fixe
  et valeur d’une entité ; aperçu actuel et moment de lecture explicités. Cette
  bonne présentation ne valide pas la fidélité des menus signalée au point 1.
- Cible différente : « Une autre entité », nom du bouton local à commander et
  description de son action sont présentés ensemble
  (`18-label-another-entity.png`). Aucun appui n’a été déclenché.

## Dette déjà connue

Le filtre Zone reste une saisie libre (`02-appearance-filtered.png`). Il s’agit
du constat encore ouvert de [la première revue](MAMY_REVIEW.md), pas d’une nouvelle
régression. Les anciens problèmes de brouillons perdus, d’actions de saison sans
libellé et de portée d’Appliquer ne sont pas répétés ici.

## Couverture visuelle

Captures temporaires : `/tmp/mamy-0.16/`, non livrées comme documentation stable.

| Format | Couverture |
|---|---|
| 360 × 780, sombre | Affichage simple/filtré, création, reprise de brouillon, Général, Appareils, Modes manuels/externes, horaires d’un mode inactif, fragments d’action fixe/source/autre cible (01–18). |
| 1 440 × 900, clair | Modes et Appareils, éditeur de 732 px de large (19–20). Pas de débordement horizontal visible. |
| 1 440 × 900, conteneur sombre | Associations externes (21). Les sélecteurs HA restent clairs sur ce montage : contraste non validé comme thème sombre natif. |

Le téléphone en thème clair n’a pas été couvert. Les fragments d’action ne
comprennent pas le formulaire complet d’étiquette (nom, couleur, portée et
boutons) : sa sauvegarde et l’ensemble du parcours des étiquettes ne sont pas
validés. Les captures ne permettent pas de juger la portée globale d’une
modification d’étiquette. La revue ne valide ni les commandes physiques, ni les
sauvegardes réelles, ni l’éditeur Lovelace complet. La navigation clavier complète,
les boîtes de sélection ouvertes et les lecteurs d’écran n’ont pas fait l’objet
d’une nouvelle validation.

Sources complémentaires : `frontend/src/editors/program-editor.ts`
(`_validate`, `_renderEntities`, `_renderModeSource`, `_changeActiveMode`) et
`frontend/src/components/action-picker.ts` (`_field`).

## Corrections 0.16.1

Les cinq constats de cette revue sont corrigés dans la version 0.16.1 :

- [x] Les menus affichent la valeur enregistrée après le rendu des options, y compris après navigation ou réorganisation des choix.
- [x] Le changement immédiat du mode actif est explicitement distingué des réglages à appliquer.
- [x] L’ajout d’un appareil supplémentaire est facultatif, sans astérisque obligatoire.
- [x] L’absence de commande sélectionnée est expliquée ; après création, « Définir les horaires » ouvre le programme créé.
- [x] Les associations externes sont repliables avec leur nombre ; le bouton principal reste accessible pendant le défilement.

Vérifications sur l’instance locale : 12 assertions DOM dans
`frontend/qa/configuration-regression.js`, exécutées sur ordinateur et téléphone
360 × 780 sombre ; création réelle d’un programme désactivé, sélection automatique,
ouverture de ses horaires puis suppression du programme de test. Le sélecteur natif
HA confirme que le deuxième appareil est facultatif et le bouton principal tient
dans la hauteur mobile. Aucune commande physique n’a été testée. Cette vérification
ne remplace pas les limites de couverture visuelle indiquées ci-dessus.
