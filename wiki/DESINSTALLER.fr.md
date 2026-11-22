Français

# Désinstaller

Testée avec la version 0.29.0.

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner**, puis le menu à trois points et
   **Supprimer**. Les interrupteurs des programmes sont retirés, les programmes enregistrés sont effacés, ainsi
   que le fichier `/config/www/weekly_planner.yml`. Weekly Planner n’envoie plus rien aux appareils : ils
   gardent leur dernier réglage.
2. Retirer la carte **Weekly Planner** de chaque tableau de bord : modifier le tableau de bord, ouvrir la
   carte, la supprimer. Sans l’intégration, la carte ne montre plus rien d’utile.
3. Dans **HACS**, ouvrir **Weekly Planner** et le supprimer, puis redémarrer Home Assistant.

<!-- CAPTURE: desinstall-supprimer | Page de l’intégration Weekly Planner avec le menu à trois points ouvert sur « Supprimer » | instance de démonstration -->

## Où sont les données

Pour vérifier ou nettoyer à la main : les programmes sont dans `/config/.storage/weekly_planner`, avec
`weekly_planner.runtime` et `weekly_planner.journal`. Leur copie en texte est `/config/www/weekly_planner.yml`.

Pour réinstaller plus tard en gardant ses programmes, faire une sauvegarde de Home Assistant avant de
supprimer l’intégration.

[Accueil](ACCUEIL.fr.md) · [Installer et mettre à jour](INSTALLER_METTRE_A_JOUR.fr.md)
