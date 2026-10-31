# Atlas des écrans

[Lire le guide pas à pas](GUIDE.fr.md)

Les captures de Weekly Planner ont été réalisées le 29 octobre 2026,
avec des programmes et appareils de démonstration du salon. Les écrans utilisent
les vrais composants de l’application ; leurs données sont préparées pour
expliquer les fonctions. Les vues d’historique, de profil et d’options sont celles
de Home Assistant local. Le sélecteur natif porte le nom « Profil Bureau » : il
illustre le mécanisme réel avec un programme de test distinct des exemples du
salon. Aucune configuration de production n’a été modifiée.

Les modifications de programme n’ont pas été enregistrées pour réaliser cet
atlas. Le bandeau de la capture S21 utilise un enregistrement simulé en mémoire,
sans appel d’écriture au serveur. Les images documentent les écrans ; elles ne
prouvent pas à elles seules le fonctionnement d’un appareil réel.

Les captures principales sont prises sur un téléphone de **360 × 780 pixels CSS**,
en thème clair, sauf la fenêtre agrandie sur ordinateur. Cliquer sur une miniature
permet d’ouvrir l’image complète. Les écrans longs disposent de captures de suite.

## Création, pièce, filtres et graphique

S37 à S45 ont été capturés le 29 octobre 2026 à 360 × 780 pixels CSS, sur
l’instance locale, avec les vrais composants et des données préparées en mémoire.
Aucune sauvegarde ni commande d’appareil n’a été exécutée. Les sélecteurs natifs
utilisent les appareils de test. Les images d’action, de cadran et de graphique
sont des fragments. Le fond clair du montage ne valide pas tous les thèmes.

<a id="s37"></a>

### S37 — Créer un programme

Donner un nom, ajouter un appareil, puis cocher les commandes utiles. Aucune commande n’est sélectionnée au départ.

<a href="images/guide/s37-create-actions.png"><img src="images/guide/s37-create-actions.png" width="320" alt="Créer un programme" /></a>

<a id="s38"></a>

### S38 — Choisir ou préparer un mode

Mode actif agit immédiatement. Mode à modifier prépare les horaires sans les activer.

<a href="images/guide/s38-modes-manual.png"><img src="images/guide/s38-modes-manual.png" width="320" alt="Choisir ou préparer un mode" /></a>

<a id="s39"></a>

### S39 — Suivre une entité

Associer chaque état à un mode. Ici, Présence activée correspond à Maison et désactivée à Vacances : exemple à adapter, sans règle imposée.

<a href="images/guide/s39-modes-external.png"><img src="images/guide/s39-modes-external.png" width="320" alt="Suivre une entité" /></a>

<a id="s40"></a>

### S40 — Zone du programme

Définir la pièce dans Général (« Pièce du programme ») puis Appliquer au programme. Elle ne vient pas automatiquement des pièces des appareils.

<a href="images/guide/s40-program-area.png"><img src="images/guide/s40-program-area.png" width="320" alt="Zone du programme" /></a>

<a id="s41"></a>

### S41 — Filtres et présentation

Choisir la pièce, les programmes à afficher et la présentation de la journée. Les interrupteurs « Bouton Graphique sous chaque appareil » et « Graphique ouvert d’office » règlent le graphique.

<a href="images/guide/s41-card-filter.png"><img src="images/guide/s41-card-filter.png" width="320" alt="Filtres et présentation" /></a>

<a id="s42"></a>

### S42 — Appuyer sur un autre bouton

Fragment du réglage d’action. Le bouton de test s’appelle Push ; choisir le vrai bouton de position favorite de son installation. Aucune commande n’a été exécutée.

<a href="images/guide/s42-action-target.png"><img src="images/guide/s42-action-target.png" width="320" alt="Appuyer sur un autre bouton" /></a>

<a id="s43"></a>

### S43 — Lire une valeur dans une entité

Fragment du réglage d’action. Ici temperature est la consigne du thermostat de démonstration, pas sa température mesurée. La valeur sera lue au moment de l’exécution.

<a href="images/guide/s43-action-source.png"><img src="images/guide/s43-action-source.png" width="320" alt="Lire une valeur dans une entité" /></a>

<a id="s44"></a>

### S44 — Double cadran de 12 heures

Fragment du cadran. Intérieur : 0–12 h ; extérieur : 12–24 h. Confort : 6 h 30–8 h 30 et 17–22 h. Le gris indique ici qu’aucune action n’est prévue.

<a href="images/guide/s44-radial-double.png"><img src="images/guide/s44-radial-double.png" width="320" alt="Double cadran de 12 heures" /></a>

<a id="s45"></a>

### S45 — Graphique sans données

Fragment du graphique pour une journée future sans horaires. Les messages distinguent l’historique futur de l’absence d’action prévue.

<a href="images/guide/s45-chart-empty.png"><img src="images/guide/s45-chart-empty.png" width="320" alt="Graphique sans données" /></a>

## Autres écrans

<a id="s01"></a>

## S01 — Vue d’ensemble

Les programmes du salon montrent leur état, leur prochaine action, leur interrupteur et la barre du jour ; le bouton **Graphique du jour** est ouvert sous la lampe.

<a href="images/guide/s01-overview.png"><img src="images/guide/s01-overview.png" width="320" alt="S01 — Vue d’ensemble" /></a>

<a id="s02"></a>

## S02 — Un seul programme

Une carte fixée sur le chauffage du salon donne accès à ses horaires sans ouvrir la bibliothèque globale des réglages.

<a href="images/guide/s02-one-program.png"><img src="images/guide/s02-one-program.png" width="320" alt="S02 — Un seul programme" /></a>

<a id="s03"></a>

## S03 — Cadran de 24 heures

Le cadran présente les plages du jour et leur légende. Un clic ouvre les horaires ; les arcs ne se déplacent pas directement.

<a href="images/guide/s03-radial.png"><img src="images/guide/s03-radial.png" width="320" alt="S03 — Cadran de 24 heures" /></a>

<a id="s04"></a>

## S04 — Liste compacte

La liste rassemble les programmes, leurs prochaines actions et leurs interrupteurs dans des lignes courtes.

<a href="images/guide/s04-compact-list.png"><img src="images/guide/s04-compact-list.png" width="320" alt="S04 — Liste compacte" /></a>

<a id="s05"></a>

## S05 — Semaine dépliée

Le bouton Semaine affiche les sept jours. Le nom d’un jour ouvre ses horaires.

<a href="images/guide/s05-week-expanded.png"><img src="images/guide/s05-week-expanded.png" width="320" alt="S05 — Semaine dépliée" /></a>

<a id="s06"></a>

## S06 — Tous les horaires

La fenêtre des horaires rassemble le schéma de la semaine, les plages et le réglage du reste du temps.

<a href="images/guide/s06-schedules.png"><img src="images/guide/s06-schedules.png" width="320" alt="S06 — Tous les horaires" /></a>

<a id="s07"></a>

## S07 — Horaires d’un jour

Le jour sélectionné limite la liste affichée. Le retour à la semaine permet de retrouver l’ensemble.

<a href="images/guide/s07-one-day.png"><img src="images/guide/s07-one-day.png" width="320" alt="S07 — Horaires d’un jour" /></a>

<a id="s08"></a>

## S08 — Modifier une plage

Le formulaire contient le début, la fin facultative, les jours et le réglage. La suite de la capture montre les contrôles placés plus bas.

<a href="images/guide/s08-slot-form.png"><img src="images/guide/s08-slot-form.png" width="320" alt="S08 — Modifier une plage" /></a>

Suite de l’écran :

<a href="images/guide/s08-slot-form-suite.png"><img src="images/guide/s08-slot-form-suite.png" width="320" alt="S08 — suite" /></a>

<a id="s09"></a>

## S09 — Utiliser le soleil

Les choix Lever et Coucher remplacent l’heure fixe par un événement solaire. Les boutons − et + changent son décalage. Les champs facultatifs **Au plus tôt à** et **Au plus tard à** empêchent l’heure de sortir d’une plage ; une phrase dessous donne l’heure réelle (« coucher du soleil + 30 min, mais pas avant 18:00 ni après 19:00 ») et le résultat d’aujourd’hui.

<a href="images/guide/s09-solar-slot.png"><img src="images/guide/s09-solar-slot.png" width="320" alt="S09 — Utiliser le soleil" /></a>

<a id="s10"></a>

## S10 — Action sans fin

Sans fin crée une action ponctuelle : elle est lancée au début, sans retour automatique au réglage par défaut.

<a href="images/guide/s10-one-shot.png"><img src="images/guide/s10-one-shot.png" width="320" alt="S10 — Action sans fin" /></a>

<a id="s11"></a>

## S11 — Créer un réglage

Le formulaire intégré définit le nom, la couleur et l’action. L’enregistrement se fait avec celui de l’horaire.

<a href="images/guide/s11-new-label.png"><img src="images/guide/s11-new-label.png" width="320" alt="S11 — Créer un réglage" /></a>

<a id="s12"></a>

## S12 — Modifier un réglage partagé

Le crayon ouvre le réglage sélectionné. La mention Partagé indique qu’une modification peut concerner d’autres programmes.

<a href="images/guide/s12-edit-shared-label.png"><img src="images/guide/s12-edit-shared-label.png" width="320" alt="S12 — Modifier un réglage partagé" /></a>

<a id="s13"></a>

## S13 — Valeur propre à un appareil

Une valeur propre adapte l’action pour cet appareil. Revenir à la valeur commune supprime cette exception.

<a href="images/guide/s13-device-value.png"><img src="images/guide/s13-device-value.png" width="320" alt="S13 — Valeur propre à un appareil" /></a>

<a id="s14"></a>

## S14 — Le reste du temps

Ce choix définit l’action par défaut de l’appareil. Ne rien changer signifie qu’aucune action par défaut n’est envoyée.

<a href="images/guide/s14-rest-of-time.png"><img src="images/guide/s14-rest-of-time.png" width="320" alt="S14 — Le reste du temps" /></a>

<a id="s15"></a>

## S15 — Graphique du jour

Le bouton **Graphique du jour** ouvre le graphique sous l’appareil, avec sa légende (Programme, Actif). Le graphique rapproche les actions prévues et l’historique disponible.

<a href="images/guide/s15-chart.png"><img src="images/guide/s15-chart.png" width="320" alt="S15 — Graphique du jour" /></a>

<a id="s16"></a>

## S16 — Historique Home Assistant

Un toucher du graphique ouvre l’historique natif de l’entité dans Home Assistant.

<a href="images/guide/s16-ha-history.png"><img src="images/guide/s16-ha-history.png" width="320" alt="S16 — Historique Home Assistant" /></a>

<a id="s17"></a>

## S17 — Fenêtre agrandie sur ordinateur

Un clic sur le titre élargit la fenêtre. Sur téléphone, la fenêtre utilise déjà tout l’écran.

<a href="images/guide/s17-expanded-dialog.png"><img src="images/guide/s17-expanded-dialog.png" width="900" alt="S17 — Fenêtre agrandie sur ordinateur" /></a>

<a id="s18"></a>

## S18 — Édition directe sur une barre

Un clic à la souris ou un appui long au doigt affiche les poignées et les actions de la plage sélectionnée.

<a href="images/guide/s18-bar-edit.png"><img src="images/guide/s18-bar-edit.png" width="320" alt="S18 — Édition directe sur une barre" /></a>

<a id="s19"></a>

## S19 — Copier vers d’autres jours

Choisir les jours de destination prépare la copie de la plage sélectionnée.

<a href="images/guide/s19-copy-days.png"><img src="images/guide/s19-copy-days.png" width="320" alt="S19 — Copier vers d’autres jours" /></a>

<a id="s20"></a>

## S20 — Chevauchement lors d’une copie

Les aperçus Avant et Après montrent le résultat. Chaque jour en conflit peut être remplacé ou exclu de la copie.

<a href="images/guide/s20-copy-conflict.png"><img src="images/guide/s20-copy-conflict.png" width="320" alt="S20 — Chevauchement lors d’une copie" /></a>

<a id="s21"></a>

## S21 — Annuler une modification de barre

Après l’enregistrement au relâcher, le bandeau Modifié · Annuler permet de revenir brièvement en arrière.

<a href="images/guide/s21-bar-undo.png"><img src="images/guide/s21-bar-undo.png" width="320" alt="S21 — Annuler une modification de barre" /></a>

<a id="s22"></a>

## S22 — Bibliothèque des réglages

L’écran global liste les réglages, leurs actions et leur utilisation. Il s’ouvre depuis une carte avec plusieurs programmes.

<a href="images/guide/s22-label-library.png"><img src="images/guide/s22-label-library.png" width="320" alt="S22 — Bibliothèque des réglages" /></a>

<a id="s23"></a>

## S23 — Modifier dans la bibliothèque

Nom, couleur et action se règlent dans une seule fiche. La suite de la capture montre les commandes inférieures.

<a href="images/guide/s23-label-library-edit.png"><img src="images/guide/s23-label-library-edit.png" width="320" alt="S23 — Modifier dans la bibliothèque" /></a>

Suite de l’écran :

<a href="images/guide/s23-label-library-edit-suite.png"><img src="images/guide/s23-label-library-edit-suite.png" width="320" alt="S23 — suite" /></a>

<a id="s24"></a>

## S24 — Affichage : liste filtrée

Choix de la pièce, présentation de la journée et réglages du graphique pour « Plusieurs appareils ».

<a href="images/guide/s24-card-filter-settings.png"><img src="images/guide/s24-card-filter-settings.png" width="320" alt="S24 — Affichage : liste filtrée" /></a>

<a id="s25"></a>

## S25 — Affichage : un programme

Le programme fixé à la carte peut être présenté en barres, en cadran de 24 heures ou en liste compacte.

<a href="images/guide/s25-card-one-settings.png"><img src="images/guide/s25-card-one-settings.png" width="320" alt="S25 — Affichage : un programme" /></a>

<a id="s26"></a>

## S26 — Choisir le programme à configurer

Le menu est fermé sur cette capture : sa liste native n’est pas exportée par la capture du navigateur. Son ordre est Choisir un programme, Nouveau programme, puis les programmes existants, avec des séparateurs.

<a href="images/guide/s26-program-selector.png"><img src="images/guide/s26-program-selector.png" width="320" alt="S26 — Choisir le programme à configurer" /></a>

<a id="s27"></a>

## S27 — Créer un programme

Choisir les appareils avant l’icône. Les réglages ne sont envoyés qu’avec Appliquer au programme.

<a href="images/guide/s27-new-program.png"><img src="images/guide/s27-new-program.png" width="320" alt="S27 — Créer un programme" /></a>

<a id="s28"></a>

## S28 — Réglages généraux et historique local

Les boutons Annuler la modification et Rétablir parcourent le brouillon local. Les avertissements indiquent les autres programmes utilisant les appareils sélectionnés.

<a href="images/guide/s28-program-general-history.png"><img src="images/guide/s28-program-general-history.png" width="320" alt="S28 — Réglages généraux et historique local" /></a>

<a id="s29"></a>

## S29 — Conditions du programme

Une condition compare l’état ou un attribut d’une entité. Toutes les conditions du programme doivent être satisfaites pour ses plages.

<a href="images/guide/s29-program-conditions.png"><img src="images/guide/s29-program-conditions.png" width="320" alt="S29 — Conditions du programme" /></a>

<a id="s30"></a>

## S30 — Actions proposées par appareil

La liste limite les services proposés pour cet appareil. Toutes signifie que les actions compatibles restent disponibles.

<a href="images/guide/s30-device-actions.png"><img src="images/guide/s30-device-actions.png" width="320" alt="S30 — Actions proposées par appareil" /></a>

<a id="s31"></a>

## S31 — Gérer les modes

Le mode actif et le mode à gérer sont distingués. Ajouter, renommer, copier et supprimer modifient le brouillon.

<a href="images/guide/s31-season-management.png"><img src="images/guide/s31-season-management.png" width="320" alt="S31 — Gérer les modes" /></a>

<a id="s32"></a>

## S32 — Nom de mode en cours

Le nom est enregistré avec Appliquer au programme. Le bouton de changement de mode actif reste indisponible tant que les changements de mode ne sont pas appliqués.

<a href="images/guide/s32-season-name-draft.png"><img src="images/guide/s32-season-name-draft.png" width="320" alt="S32 — Nom de mode en cours" /></a>

<a id="s33"></a>

## S33 — Changer le mode actif

Le bouton ouvre le véritable sélecteur de profil Home Assistant du programme, trouvé dans le registre des entités.

<a href="images/guide/s33-active-season-ha.png"><img src="images/guide/s33-active-season-ha.png" width="320" alt="S33 — Changer le mode actif" /></a>

<a id="s34"></a>

## S34 — Confirmation

Les opérations concernées demandent confirmation. Cette capture montre la boîte avant toute validation.

<a href="images/guide/s34-confirmation.png"><img src="images/guide/s34-confirmation.png" width="320" alt="S34 — Confirmation" /></a>

<a id="s35"></a>

## S35 — Options de l’intégration

Ces options Home Assistant concernent l’intégration entière : droits d’édition, réapplication par défaut, notifications et délai des conditions.

<a href="images/guide/s35-integration-options.png"><img src="images/guide/s35-integration-options.png" width="320" alt="S35 — Options de l’intégration" /></a>

<a id="s36"></a>

## S36 — Une seule intégration suffit

Home Assistant refuse une seconde configuration de Weekly Planner. Pour ajouter un programme, utiliser Réglages des programmes dans la carte ; il n’est pas nécessaire d’ajouter une autre intégration. Cette capture est prise sur l’instance de test déjà configurée, sans supprimer l’intégration pour simuler une première installation.

<a href="images/guide/s36-single-instance.png"><img src="images/guide/s36-single-instance.png" width="320" alt="S36 — Une seule intégration suffit" /></a>

<a id="variantes"></a>

## Variantes utiles

Ces états complètent les mêmes écrans sans ajouter une nouvelle façon de programmer.

### Vue d’ensemble en thème sombre

<a href="images/guide/s01-dark.png"><img src="images/guide/s01-dark.png" width="320" alt="Vue d’ensemble en thème sombre" /></a>

### Cadran en thème sombre

<a href="images/guide/s03-dark.png"><img src="images/guide/s03-dark.png" width="320" alt="Cadran en thème sombre" /></a>

### Formulaire d’horaire en thème sombre

<a href="images/guide/s08-dark.png"><img src="images/guide/s08-dark.png" width="320" alt="Formulaire d’horaire en thème sombre" /></a>

### Graphique en thème sombre

<a href="images/guide/s15-dark.png"><img src="images/guide/s15-dark.png" width="320" alt="Graphique en thème sombre" /></a>

### Carte sans programme

<a href="images/guide/s01-empty.png"><img src="images/guide/s01-empty.png" width="320" alt="Carte sans programme" /></a>

### Programme en pause

<a href="images/guide/s02-paused.png"><img src="images/guide/s02-paused.png" width="320" alt="Programme en pause" /></a>

### Indicateur Vacances

<a href="images/guide/s01-vacation.png"><img src="images/guide/s01-vacation.png" width="320" alt="Indicateur Vacances" /></a>

### Horaires en lecture seule

<a href="images/guide/s06-read-only.png"><img src="images/guide/s06-read-only.png" width="320" alt="Horaires en lecture seule" /></a>

### Suppression refusée d’un réglage utilisé

<a href="images/guide/s23-label-in-use.png"><img src="images/guide/s23-label-in-use.png" width="320" alt="Suppression refusée d’un réglage utilisé" /></a>

### Validation d’un nouveau programme incomplet

<a href="images/guide/s27-validation.png"><img src="images/guide/s27-validation.png" width="320" alt="Validation d’un nouveau programme incomplet" /></a>

### Validation d’un nom de mode

<a href="images/guide/s32-validation.png"><img src="images/guide/s32-validation.png" width="320" alt="Validation d’un nom de mode" /></a>

[Retour au guide pas à pas](GUIDE.fr.md) · [Inventaire des captures](SCREEN_INVENTORY.md)
