Français

# Installer et mettre à jour

Testée avec la version 0.29.0.

Il faut Home Assistant **2026.10.0 ou plus récent**. L’installation se fait en trois temps : installer les
fichiers (par HACS ou à la main), ajouter l’intégration, puis ajouter la carte à un tableau de bord.

## Installer avec HACS

[![Ouvrir votre Home Assistant et ce dépôt dans HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=movrack&repository=ha_weekly_planner&category=integration)

1. Toucher le bouton ci-dessus. Sinon, dans HACS, ajouter le dépôt personnalisé
   `https://github.com/movrack/ha_weekly_planner` avec la catégorie **Intégration**.
2. Choisir **Weekly Planner** et le télécharger.
3. Redémarrer Home Assistant.

<!-- CAPTURE: install-hacs-depot | La fenêtre HACS « Dépôt personnalisé » avec l’adresse du dépôt et la catégorie Intégration | HACS de l’instance de démonstration -->
<!-- CAPTURE: install-hacs-telecharger | La page Weekly Planner dans HACS avec le bouton de téléchargement | HACS de l’instance de démonstration -->

## Installer à la main

1. Télécharger la [dernière version](https://github.com/movrack/ha_weekly_planner/releases/latest)
   (le code source, en archive zip).
2. Dans l’archive, copier le dossier `custom_components/weekly_planner` dans le dossier `custom_components`
   de votre configuration Home Assistant. Le fichier `manifest.json` doit se trouver directement dans
   `custom_components/weekly_planner`.
3. Redémarrer Home Assistant.

## Ajouter l’intégration

[![Ouvrir votre Home Assistant et commencer la configuration de Weekly Planner.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=weekly_planner)

Toucher le bouton ci-dessus, ou ouvrir **Paramètres → Appareils et services → Ajouter une intégration**, puis
choisir **Weekly Planner**.

Rien n’est demandé : valider suffit. Il n’y a qu’une seule intégration Weekly Planner par Home Assistant ;
elle contient tous les programmes. Si Home Assistant répond « Weekly Planner est déjà configuré », c’est
qu’elle est déjà ajoutée : n’en ajoutez pas une seconde pour créer un autre programme.

<!-- CAPTURE: install-ajouter-integration | La fenêtre « Weekly Planner » de Paramètres → Appareils et services → Ajouter une intégration | instance de démonstration, intégration pas encore ajoutée -->

## Ajouter la carte

1. Ouvrir un tableau de bord et passer en modification.
2. Ajouter une carte, puis choisir **Weekly Planner** dans la liste.
3. Enregistrer la carte.

Aucun autre dépôt ni fichier de carte n’est à ajouter : l’intégration fournit la carte toute seule. Si
**Weekly Planner** n’apparaît pas dans la liste des cartes, actualiser la page du navigateur.

Une carte neuve dit **Aucun programme pour l’instant.** La suite est dans
[Premier programme](PREMIER_PROGRAMME.fr.md).

<!-- CAPTURE: install-choisir-carte | La liste « Ajouter une carte » avec Weekly Planner trouvée en tapant son nom | tableau de bord en modification -->
<!-- CAPTURE: install-carte-vide | La carte Weekly Planner vide : « Aucun programme pour l’instant. » | intégration ajoutée, aucun programme -->

## Mettre à jour

1. Faire une sauvegarde de Home Assistant (**Paramètres → Système → Sauvegardes**). Les programmes sont
   enregistrés dans la configuration de Home Assistant : la sauvegarde les contient.
2. Dans HACS, ouvrir **Weekly Planner** et télécharger la nouvelle version.
3. Redémarrer Home Assistant.

Une carte déjà ouverte se recharge toute seule, une fois au repos, quand son fichier a changé.

<!-- CAPTURE: maj-hacs-mise-a-jour | HACS : Weekly Planner avec une mise à jour disponible | HACS de l’instance de démonstration -->

Voir aussi : [Premier programme](PREMIER_PROGRAMME.fr.md) · [Désinstaller](DESINSTALLER.fr.md) · [Accueil](ACCUEIL.fr.md)
