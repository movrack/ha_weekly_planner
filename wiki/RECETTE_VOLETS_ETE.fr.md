Français

# Volets d’été anti-chaleur

Testée avec la version 0.30.0. <!-- VERSION : numéro à confirmer à la publication -->

**À quoi ça sert :** de juin à août, les jours chauds, les volets de la façade sud se ferment aux trois quarts à
midi pour garder la maison fraîche, puis se rouvrent à 18 h.

## Ce qu’il faut

- Les volets de la façade sud (`cover.volet_salon` et `cover.volet_chambre_sud` dans l’exemple), dont l’action qui
  règle la position est cochée sous **Actions proposées**.
- Deux réglages : **Mi-fermé** (position 30 %) et **Ouvert** (position 100 %). Dans Home Assistant, 100 % veut dire
  ouvert : un volet fermé aux trois quarts est à 30 %.
- L’intégration **Saison**, réglée sur le type **Météorologique** : son capteur `sensor.season` vaut `summer` du
  1er juin au 31 août.
- Un capteur de température extérieure (`sensor.temperature_exterieure` dans l’exemple) : **le nom est à adapter**.
- Les volets du soir et du matin restent dans leur programme habituel
  ([Volets : lever et coucher du soleil](RECETTE_VOLETS_SOLEIL.fr.md)).

## Étapes

Un mode « Été » ne convient pas ici : un mode change les horaires de **tous** les programmes de la maison. Ces
horaires se règlent donc dans deux programmes séparés, qui ne marchent que l’été.

1. Dans le panneau **Weekly Planner**, **Nouveau programme** : « Volets d’été : fermer », avec les volets de la
   façade sud et leur action de position cochée. Créer le programme.
2. Sur la carte, **Modifier** à droite d’un volet, **Horaires**, **Ajouter un horaire** : **Tous les jours**,
   **Début** 12:00, **À cette heure seulement**, **Réglage** **Mi-fermé**. Cocher l’autre volet sous
   **Aussi pour :**, puis **Enregistrer**.
3. Dans la **Liste des programmes** du panneau, ouvrir « Volets d’été : fermer », onglet **Général**. Sous
   **Conditions du programme**, toucher **Ajouter une condition** deux fois :
   - `sensor.season`, la comparaison **est**, la valeur `summer` ;
   - `sensor.temperature_exterieure`, la comparaison **est supérieur à**, la valeur `24`.

   Toucher **Enregistrer**.
4. Créer de même le programme « Volets d’été : rouvrir » avec les mêmes volets : un horaire **Tous les jours** à
   18:00, **À cette heure seulement**, **Ouvert**. Sa seule condition : `sensor.season` **est** `summer`.

## Résultat

Un jour d’été où il fait plus de 24 °C dehors à midi, les volets sud passent à 30 % à 12 h, puis à 100 % à 18 h. Un
jour d’été plus frais, ou hors de l’été, rien ne se passe. Les volets du matin et du soir continuent de suivre le
soleil.

## À savoir

- Les deux programmes sont séparés exprès : à 18 h, la température peut déjà être retombée sous 24 °C. Avec la
  condition de température sur le programme qui rouvre, les volets resteraient à 30 % jusqu’au coucher du soleil.
- Chaque horaire n’est envoyé qu’une fois, à son heure. Un volet que vous bougez à la main reste là où vous l’avez
  mis jusqu’au prochain horaire.
- Un changement de condition est pris en compte après le délai **Attendre avant d’appliquer un changement de
  condition** des [réglages de l’intégration](CONFIGURATION.fr.md#réglages-de-lintégration) (2 minutes au départ).
  La température lue à 12 h compte : elle est vérifiée à l’heure de l’horaire.
- Gardez **Le reste du temps** sur **Laisser tel quel** dans ces deux programmes : ils n’ont pas d’heure de fin, et
  ils partagent leurs volets avec le programme habituel ([Les priorités](PRIORITES.fr.md#la-règle)).

---

[← Toutes les recettes](RECETTES.fr.md)
