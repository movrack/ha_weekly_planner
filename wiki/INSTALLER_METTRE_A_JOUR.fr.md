Français

# Installer et mettre à jour

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Il faut Home Assistant **2026.10.0 ou plus récent**. L’installation se fait en quatre temps : installer les
fichiers (par HACS ou à la main), ajouter l’intégration, ouvrir le panneau **Weekly Planner**, puis ajouter la
carte à un tableau de bord.

## Installer avec HACS

[![Ouvrir votre Home Assistant et ce dépôt dans HACS.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=movrack&repository=ha_weekly_planner&category=integration)

1. Toucher le bouton ci-dessus. Sinon, dans HACS, ajouter le dépôt personnalisé
   `https://github.com/movrack/ha_weekly_planner` avec la catégorie **Intégration**.
2. Choisir **Weekly Planner** et le télécharger.
3. Redémarrer Home Assistant.

<!-- CAPTURE: install-hacs-depot | La fenêtre HACS « Dépôt personnalisé » avec l’adresse du dépôt et la catégorie Intégration | HACS de l’instance de démonstration -->

## Installer à la main

1. Ouvrir la [dernière version](https://github.com/movrack/ha_weekly_planner/releases/latest) et télécharger
   le fichier **`weekly_planner.zip`**, dans la liste des fichiers de la version. Ne pas prendre l’archive
   « Source code » : elle ne contient pas la carte.
2. Dans la configuration de Home Assistant, créer le dossier `custom_components/weekly_planner`, puis y
   décompresser `weekly_planner.zip`. Le fichier `manifest.json` doit se trouver directement dans
   `custom_components/weekly_planner`, pas dans un sous-dossier.
3. Redémarrer Home Assistant.

## Ajouter l’intégration

[![Ouvrir votre Home Assistant et commencer la configuration de Weekly Planner.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=weekly_planner)

Toucher le bouton ci-dessus, ou ouvrir **Paramètres → Appareils et services → Ajouter une intégration**, puis
choisir **Weekly Planner**.

Rien n’est demandé : valider suffit. Il n’y a qu’une seule intégration Weekly Planner par Home Assistant ;
elle contient tous les programmes. Si Home Assistant répond « Weekly Planner est déjà configuré. », c’est
qu’elle est déjà ajoutée : n’en ajoutez pas une seconde pour créer un autre programme.

<!-- CAPTURE: install-ajouter-integration | La fenêtre « Weekly Planner » de Paramètres → Appareils et services → Ajouter une intégration | instance de démonstration, intégration pas encore ajoutée -->

## Ouvrir le panneau Weekly Planner

Une fois l’intégration ajoutée, une entrée **Weekly Planner** apparaît dans la barre latérale de Home Assistant.
C’est là que les programmes se créent, se modifient et se suppriment : la suite est dans
[Premier programme](PREMIER_PROGRAMME.fr.md).

Si l’entrée n’apparaît pas, actualiser la page du navigateur. Si elle a été masquée (réglage **Afficher le lien
Weekly Planner dans la barre latérale**, dans **Paramètres → Appareils et services → Weekly Planner →
Configurer → Réglages**), ouvrir **Paramètres → Appareils et services → Weekly Planner → Configurer**, puis
toucher **Ouvrir le panneau Weekly Planner**.

## Ajouter la carte

La carte montre les programmes sur un tableau de bord. Elle ne sert pas à les créer.

1. Ouvrir un tableau de bord et passer en modification.
2. Ajouter une carte, puis choisir **Weekly Planner** dans la liste.
3. Enregistrer la carte.

Aucun autre dépôt ni fichier de carte n’est à ajouter : l’intégration fournit la carte toute seule. Si
**Weekly Planner** n’apparaît pas dans la liste des cartes, actualiser la page du navigateur.

Par défaut, la carte montre **Tous les programmes**, y compris ceux que vous créerez plus tard. Pour n’en
montrer que certains, utiliser **Programmes à afficher** dans la fenêtre de modification de la carte.

Une carte neuve, sans programme, dit **Aucun programme pour l’instant.** et propose **Gérer les programmes**, qui
ouvre le panneau.

<!-- CAPTURE: install-choisir-carte | La liste « Ajouter une carte » avec Weekly Planner trouvée en tapant son nom | tableau de bord en modification -->
<!-- CAPTURE: install-carte-vide | La carte Weekly Planner vide : « Aucun programme pour l’instant. » et le lien « Gérer les programmes » | intégration ajoutée, aucun programme -->

## Mettre à jour

1. Faire une sauvegarde de Home Assistant (**Paramètres → Système → Sauvegardes**). Les programmes sont
   enregistrés dans la configuration de Home Assistant : la sauvegarde les contient.
2. Dans HACS, ouvrir **Weekly Planner** et télécharger la nouvelle version.
3. Redémarrer Home Assistant.

Une carte ou un panneau déjà ouvert se recharge tout seul, une fois au repos, quand son fichier a changé.

Voir aussi : [Premier programme](PREMIER_PROGRAMME.fr.md) · [Désinstaller](DESINSTALLER.fr.md) · [Accueil](ACCUEIL.fr.md)
