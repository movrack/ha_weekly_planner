# Résultats du contrôle visuel

Date : 2026-10-31 · Version : 0.18.0 (arbre de travail non commité) · Navigateur : Chromium 156 (Playwright,
sans fenêtre), macOS, Apple M4 · Instance : `scripts/dev_ha.sh` (port 8124), redémarrée pour charger le code Python
actuel · Tailles 360 × 780 et 1440 × 900, thèmes clair et sombre, fr et en.

Captures : `/private/tmp/claude-501/-Users-manuelservais-Dev-weekly-planner/b6633a2d-e4f3-439f-9853-46b4e65eee3e/scratchpad/`
(hors dépôt).

## Mesures de rendu (20 programmes, carte vue « barres »)

| Mesure | 1440 px | 360 px | 360 px, CPU ×4 | 360 px, CPU ×6 |
|---|---|---|---|---|
| Carte avec 20 blocs affichés, depuis le début de la navigation | 244 ms | 230 ms | 803 ms | 1203 ms |
| Nouvelle carte (création jusqu'à 20 blocs) | 16 ms | 7 ms | 32 ms | 46 ms |
| Nouveau rendu de la carte (`requestUpdate`) | 1,3 à 3 ms | 1,2 à 3 ms | 1,7 à 2,7 ms | 2,1 à 5,1 ms |
| Mise à jour de `hass` (une entité), carte seule | 0,5 à 1,3 ms | 0,5 à 1,4 ms | 1,7 à 2,9 ms | 2,2 à 5,5 ms |
| Enregistrement d'un programme jusqu'au changement dans le DOM | 28 ms | 27 ms | 41 ms | 55 ms |

Mesure avec les 40 sous-composants (`wp-bar-editor`, `wp-day-bar`) et deux images affichées : mise à jour de `hass`
→ peint 20 à 35 ms (CPU ×1 et ×4, borné par les deux images), enregistrement → peint 50 ms (×1) et 69 ms (×4).
Le but « premier rendu < 300 ms pour 20 programmes » est atteint sans bridage ; il ne l'est plus qu'avec un CPU
bridé ×4 (803 ms) sur la page entière, qui comprend le démarrage de Home Assistant.
Les 15 programmes de mesure ont été supprimés ensuite.

## Cases (voir `docs/controle-visuel.md`)

Réussi : consultation en barres, cadrans 24 h et 12 h, liste, semaine, étiquettes, écran d'horaires (ouvrir, modifier,
dupliquer, supprimer), pastilles solaires, décalage, « Pas avant / Pas après » avec erreur d'ordre inversé, délai
aléatoire conservé à la duplication, glisser au doigt et à la souris, clavier sur les poignées, astuce « Restez
appuyé pour modifier » (3 fois puis plus), éditeur de carte et de programme, valeurs par défaut d'un nouveau programme
(priorité 10, réappliquer), fr et en, deux thèmes, aucun défilement horizontal, zéro erreur console, cibles ≥ 44 px
sauf bugs n° 3 et 7.
Non vérifié : conflit de révision, jour de 23 h / 25 h, copie vers d'autres jours, lecture seule, courbes du
graphique, renommage d'étiquette, création réelle d'un programme.

## Anomalies, par gravité

1. **Dupliquer un horaire solaire de plus de 4 h ne s'enregistre pas.** Étapes : écran d'horaires de « Lampe du
   salon », ouvrir l'horaire « Coucher – 23 h », Dupliquer, Enregistrer. Le brouillon décale le début de la durée
   (+ 340 min) ; le serveur refuse `start.offset` > 240 (« value must be at most 240 ») et la carte affiche
   seulement « Impossible d'enregistrer ces horaires. Réessayez. ». Même message générique pour un doublon qui
   chevauche l'original. Fichier : `frontend/src/components/schedule-dialog.ts` (`_duplicate`), message dans le
   même fichier.
2. **Instance de développement obsolète** : le processus lancé le 29/10 refusait l'enregistrement d'un horaire
   solaire avec délai aléatoire (« not a valid option at start.sun ») ; l'ancien code Python n'avait pas été
   rechargé. Après redémarrage, plus d'erreur. Sans bug de code, mais à noter dans le guide de test.
3. **Jours du formulaire d'horaire : 40 × 48 px à 360 px** (< 44). Fichier : `frontend/src/components/slot-form.ts`
   (`.day`).
4. **Échap ne ferme plus l'écran d'horaires après avoir ouvert une ligne** : le focus tombe sur `body`. Étapes : ouvrir
   l'écran, cliquer une ligne, Échap. Fichier : `schedule-dialog.ts` / `dialog.ts`.
5. **Le focus ne revient pas au bouton « Horaires »** à la fermeture (il reste sur `body`). Fichier : `dialog.ts`.
6. **Les barres ne sont pas atteignables au clavier** : Tab passe de « Horaires » à l'icône « maintenant » puis à
   « Semaine » ; on ne peut pas entrer dans l'édition sans souris ni doigt. Les poignées elles-mêmes sont
   utilisables au clavier. Fichier : `frontend/src/components/bar-editor.ts`.
7. **Noms de jours de la semaine : 36 × 48 px** (< 44). Fichier : `frontend/src/weekly-planner-card.ts` (styles de
   `.wname` / bouton du jour) ou `day-bar.ts`.
8. **Sélecteur de l'éditeur** : juste après avoir choisi « Nouveau programme », l'option affiche déjà « Continuer la
   création » alors que le titre dit « Nouveau programme ». Fichier : `frontend/src/card-editor.ts` ligne ~145.
9. **Trait « maintenant » dessiné au-dessus de la bulle « Restez appuyé pour modifier »** (texte barré par le trait),
   capture `hint1.png`. Fichier : `frontend/src/components/bar-editor.ts` (empilement de `.hint`).
10. **Textes** : « 1 usage(s) » / « 1 use(s) » dans les étiquettes (pluriel non traité) ; « 18.5 °C » (nom) et
    « 18,5 °C » (résumé) ; l'icône « maintenant » touche le texte de la ligne suivante sur une ligne longue
    (« À la station d'accueil → vacuum.start 23 h » à 1440 px) ; la description du délai aléatoire répète les bornes
    deux fois (`slot-form.ts`) ; heures d'axe « 0 h » en anglais.
11. Un premier chargement a laissé l'écran d'horaires sans ouvrir après un clic sur « Horaires » (une fois sur
    quatre environ, juste après le redémarrage de l'instance), non reproduit ensuite ; à surveiller.

Autre remarque : une erreur `Cannot read properties of undefined (reading 'localize')` n'est apparue que dans mon
essai où j'insérais l'éditeur à la main dans la page, jamais dans l'éditeur réel de Home Assistant.
