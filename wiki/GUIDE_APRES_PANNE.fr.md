Français

# Après une panne

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** après une coupure de courant, un redémarrage ou une panne du réseau des appareils, remettre
chaque appareil dans l’état que ses programmes prévoient maintenant. Exemple : les volets sont restés ouverts
toute la nuit parce que la box Zigbee était hors ligne.

## Ce qui se fait tout seul

- Quand un appareil indisponible revient, son réglage lui est renvoyé tout seul.
- Si un appareil piloté par un horaire reste indisponible trop longtemps, Home Assistant affiche une
  notification : « … est indisponible : son action planifiée est toujours en attente. » La durée se règle dans
  **Paramètres → Appareils et services → Weekly Planner → Configurer → Réglages**, sous **Alerte si un appareil
  est indisponible depuis**.
- Pour qu’un programme renvoie son réglage tout seul après un redémarrage de Home Assistant ou une modification,
  cocher **Renvoyer le réglage en cours après un redémarrage ou un changement** dans sa **Fiche du programme**,
  onglet **Général**, sous **Autres paramètres**.

## Tout remettre d’aplomb, après vérification

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner → Configurer**.
2. Choisir **Renvoyer l’état aux appareils**.
3. Lire le plan. Rien n’est encore envoyé. L’écran montre :
   - **Sera envoyé maintenant** et le nombre, puis une ligne par appareil : l’appareil, l’action, et « depuis »
     la date et l’heure du début de l’horaire en cours ;
   - **Laissé tel quel** et le nombre, puis une ligne par appareil avec la raison.
4. Appuyer sur **Valider** pour envoyer réellement les commandes, un appareil à la fois ; les appareils agissent
   tout de suite.

L’écran finit par **Terminé : N commande(s) envoyée(s).** ou **Rien à envoyer : tous les appareils sont laissés
tels quels.**

<!-- CAPTURE: guide-renvoyer-etat | L’écran « Renvoyer l’état aux appareils » avec les deux listes « Sera envoyé maintenant » et « Laissé tel quel » et le bouton Valider | 1440 ; démo : trois appareils dont un volet à renvoyer et un programme en pause -->

Les appareils laissés tels quels, et pourquoi :

| Raison affichée | Cela veut dire |
|---|---|
| tous les programmes sont suspendus | La **Suspension de tous les programmes** est allumée. |
| son programme est en pause, son programme est éteint | Un programme en pause n’envoie rien. |
| rien à envoyer | Aucune action n’est prévue pour cet appareil maintenant. |
| son dernier ponctuel date de plus de 24 h | Un horaire **À cette heure seulement** plus ancien que 24 heures n’est pas rejoué. |
| modifié par une personne depuis | Quelqu’un a changé l’appareil à la main depuis : on ne l’écrase pas. |
| indisponible | L’appareil ne répond pas encore. |
| même commande déjà envoyée à cet appareil | Un autre horaire lui envoie déjà la même chose. |
| piloté par un autre programme | Un programme plus prioritaire commande cet appareil ([Priorités](PRIORITES.fr.md)). |

## Renvoyer un seul programme

Le service **Appliquer maintenant** envoie tout de suite ce que les appareils d’un programme doivent faire, même
s’ils sont déjà dans cet état. Il envoie aussi le dernier horaire **À cette heure seulement** commencé il y a moins de 24 heures, sauf si une
personne a modifié l’appareil depuis.

1. Trouver l’identifiant du programme : voir [Sauter le prochain changement](GUIDE_PAUSE_SAUT.fr.md#sauter-le-prochain-changement).
2. Ouvrir **Outils de développement → Actions** et choisir **Weekly Planner : Appliquer maintenant**.
3. Dans **Programme**, saisir l’identifiant, puis lancer l’action.

En YAML : `action: weekly_planner.apply_now` avec `program_id`.

## À savoir

- Après une panne, vous pouvez aussi simplement attendre : le prochain changement d’horaire remet l’appareil dans
  l’état prévu.
- Un appareil qui n’a pas bougé alors qu’aucune panne n’a eu lieu : [Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
