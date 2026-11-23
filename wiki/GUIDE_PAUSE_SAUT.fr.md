Français

# Pause, saut et suspension

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** arrêter les horaires pour un moment, sans les supprimer. Trois outils, du plus petit au plus
grand :

| Je veux… | Outil |
|---|---|
| Arrêter un programme, un jour ou plus | **Pause** (l’interrupteur du programme) |
| Ne pas envoyer le prochain changement d’un programme | **Sauter le prochain changement** (un service) |
| Arrêter tous les programmes à la fois | **Suspension de tous les programmes** |

## Mettre un programme en pause

Exemple : le volet du salon reste ouvert samedi, pour une fête.

1. Sur la carte, toucher l’**interrupteur** à droite du nom du programme. (Dans la fenêtre des horaires, c’est
   l’interrupteur **Programme en marche**.)
2. La fenêtre **Pause** s’ouvre avec le nom du programme et la question **Jusqu’à quand ?** Choisir :
   - **Pour une durée** (choisi au départ), puis sous **Durée de la pause** : **1 heure**, **1 jour** (choisi au
     départ), **7 jours**, ou saisir un **Nombre d’heures** et un **Nombre de jours**. La durée va de 1 heure à
     365 jours au total ;
   - ou **Jusqu’à ce que je la reprenne** : les horaires restent arrêtés jusqu’à ce que vous les remettiez en marche.
3. Toucher **Confirmer**.

<!-- CAPTURE: guide-pause | La fenêtre Pause : « Jusqu’à quand ? », Pour une durée choisi, 1 jour choisi, bouton Confirmer | démo : programme « Volet du salon » -->

Le programme affiche alors un badge **En pause jusqu’au** suivi de la date et de l’heure de reprise, ou **En pause
(sans date de reprise)**. Il reprend tout seul à la fin d’une pause de durée choisie.

**Reprendre plus tôt :** toucher l’interrupteur de nouveau. Il n’y a pas de confirmation ; le message
« … est remis en marche. » le dit.

Mettre un programme en pause arrête ses horaires. Cela ne veut pas forcément dire éteindre l’appareil.

## Sauter le prochain changement

Exemple : des invités dorment au salon, les volets ne doivent pas se fermer ce soir à l’heure prévue.

Il n’y a pas de bouton sur la carte : **Sauter le prochain changement** est un service de Home Assistant. On le
lance à la main, ou on le met dans un script ou une automatisation.

1. Trouver l’identifiant du programme : **Outils de développement → États**, chercher l’interrupteur du
   programme (il porte son nom) et lire l’attribut `program_id`.
2. Ouvrir **Outils de développement → Actions** et choisir **Weekly Planner : Sauter le prochain changement**.
3. Dans **Programme**, saisir l’identifiant. Lancer l’action.

En YAML, pour une automatisation ou un script :

```yaml
action: weekly_planner.skip_next
data:
  program_id: "l-identifiant-du-programme"
```

La carte écrit alors **Sauté :** suivi du réglage et de l’heure du changement sauté. Le changement suivant se
passe comme prévu. Pour annuler un saut en attente, lancer la même action avec **Annuler** coché (`cancel: true`).

Les services **Mettre en pause** (`weekly_planner.pause`, avec des jours ou des heures) et **Reprendre**
(`weekly_planner.resume`) font la même chose que l’interrupteur, depuis une automatisation.

## Suspendre tous les programmes

Exemple : vous partez trois semaines et tout doit s’arrêter d’un coup.

1. Ouvrir **Paramètres → Appareils et services → Weekly Planner**.
2. Ouvrir l’entité **Suspension de tous les programmes** et l’allumer. Pour reprendre, l’éteindre.

La carte affiche **Tous les programmes suspendus**. Chaque appareil reçoit une fois le réglage de **Le reste du
temps** de son programme, puis plus rien n’est envoyé. En éteignant l’interrupteur, le réglage prévu à ce moment
est recalculé : le passé n’est pas rejoué.

La suspension passe avant le mode, et n’est pas le mode **Vacances** : le mode **Vacances** est un mode comme les
autres, avec ses horaires ([Des horaires selon le mode](GUIDE_MODES.fr.md)). La carte affiche la suspension, mais
ne la change pas.

## À savoir

- Si les boutons sont grisés ou si **Lecture seule** s’affiche, vous n’avez pas le droit de modifier : voir avec la
  personne qui a installé Weekly Planner.
- Une pause ne change aucun horaire : les horaires sont là, ils ne sont simplement pas envoyés.
- Pour savoir pourquoi un appareil n’a pas bougé : [Comprendre ce qui s’est passé](GUIDE_COMPRENDRE.fr.md).

[← Guide](GUIDE.fr.md) · [Accueil](ACCUEIL.fr.md)
