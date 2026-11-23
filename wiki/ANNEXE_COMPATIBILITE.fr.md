Français

# Annexe : compatibilité par type d’appareil

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

Weekly Planner ne connaît ni marque ni modèle. Pour un appareil, **la liste Action d’un réglage montre ce que Home
Assistant sait faire avec cet appareil** : si votre appareil est dans Home Assistant et qu’il a une action, il peut
être programmé ([Ce que peut faire un réglage](REGLAGES.fr.md#ce-que-peut-faire-un-réglage)). Cette annexe donne les
actions habituelles de chaque type, pour savoir à quoi s’attendre. Le détail dépend de l’appareil : un volet sans
position n’offre que l’ouverture et la fermeture, une lampe sans variateur n’a pas de luminosité.

## Les types d’appareil courants

| Type d’appareil | Ce qu’on peut régler (selon l’appareil) | À savoir |
|---|---|---|
| Thermostat, radiateur, climatiseur (`climate`) | La température, un préréglage (Éco, Confort…), le mode (chauffer, refroidir, arrêt), la ventilation | La température et les préréglages sont **vérifiés** après l’envoi ([Renvoyer, vérifier, réessayer](REGLAGES.fr.md#renvoyer-vérifier-réessayer)). Les préréglages viennent de l’appareil. |
| Volet, store, porte de garage (`cover`) | Ouvrir, fermer, arrêter, une position en %, l’inclinaison des lames | 100 % veut dire ouvert. La position est vérifiée. Une « position favorite » est un bouton : [Envoyer le volet à sa position favorite](REGLAGES.fr.md#envoyer-le-volet-à-sa-position-favorite). |
| Lampe (`light`) | Allumer (avec luminosité en %, température de couleur ou couleur), éteindre | La luminosité en % n’est pas vérifiée : si on change la lampe à la main, elle garde ce niveau jusqu’au prochain horaire. |
| Prise, interrupteur, chauffe-eau, vanne (`switch`, `input_boolean`) | Allumer, éteindre | Pas de valeur à lire : aucune vérification après l’envoi. |
| Ventilateur (`fan`) | Allumer, éteindre, la vitesse en %, un préréglage | |
| Chauffe-eau intégré à Home Assistant, humidificateur (`water_heater`, `humidifier`) | La température ou l’humidité visée, le mode, allumer, éteindre | |
| Aspirateur robot (`vacuum`) | Démarrer, retourner à la base, mettre en pause | Utile avec **À cette heure seulement** (un horaire sans fin). |
| Serrure (`lock`) | Verrouiller, déverrouiller | Le droit de la commander est celui de la personne qui enregistre le programme ([Qui peut modifier quoi](CONFIGURATION.fr.md#qui-peut-modifier-quoi)). |
| Lecteur multimédia (`media_player`) | Allumer, éteindre, le volume, la source, lecture et pause | Un contenu à saisir en texte (nom d’une liste de lecture) n’est pas proposé : mettez la suite dans un script. |
| Scène (`scene`) | Appliquer la scène | Une scène n’a pas besoin d’être cochée dans **Actions proposées**. |
| Script (`script`) | Lancer le script | Pour une suite d’actions avec des pauses : [Lancer une suite d’actions avec des pauses](REGLAGES.fr.md#lancer-une-suite-dactions-avec-des-pauses). |
| Automatisation (`automation`) | L’activer, la désactiver, la déclencher | [Activer une automatisation pendant une plage horaire](REGLAGES.fr.md#activer-une-automatisation-pendant-une-plage-horaire). |
| Bouton (`button`, `input_button`) | Appuyer | Pas de valeur : à utiliser avec **À cette heure seulement**. |
| Nombre, liste de choix (`number`, `input_number`, `select`, `input_select`) | Fixer la valeur, choisir un choix | Un choix de liste doit être écrit comme l’appareil le propose. |

## Ce qui n’est pas proposé

- **Un capteur** (température, présence, énergie…) n’a pas d’action : il sert de **condition** d’un programme, de valeur
  à lire dans un réglage ([Lexique](LEXIQUE.fr.md#conditions)) ou de source du graphique.
- **Les actions qui demandent un texte libre ou un objet** (envoyer une commande brute, un message, un code d’alarme)
  ne sont pas proposées dans la liste : leur place est dans un script que le programme lance.
- **Un appareil absent de Home Assistant** (ou sans action) ne peut pas être programmé : Weekly Planner ne parle
  jamais à l’appareil directement, seulement à Home Assistant.
- **Une action de plusieurs appareils d’un coup** : un horaire envoie une seule action à un appareil. Pour plusieurs
  appareils, les réunir dans un programme ([Plusieurs appareils](GUIDE_PLUSIEURS_APPAREILS.fr.md)) ; pour une suite
  d’actions, un script.

[← Accueil](ACCUEIL.fr.md) · [Les réglages et leurs actions](REGLAGES.fr.md)
