# Test réel sur un thermostat (≥ 3 jours)

Procédure à dérouler sur un vrai appareil (banc d'essai : thermostat du bureau, Versatile Thermostat posé
sur Evohome). Objectif : vérifier en conditions réelles ce que les tests automatiques simulent. Cocher
chaque case et noter l'heure et le résultat.

Règles : rien de bruyant ou de gênant la nuit ; le **redémarrage de Home Assistant** et la **désactivation
d'une entité** ne se font qu'avec l'accord du propriétaire.

## 1. Préparation

- [ ] Sauvegarde complète de Home Assistant faite et vérifiée (note : nom de la sauvegarde).
- [ ] Weekly Planner installé (copie par script), intégration ajoutée, carte visible sur un tableau de bord.
- [ ] Thermostat de test identifié : `climate.________` (VT sur Evohome). Programme noté sur papier avant le test
      (réglages actuels du VT et du programme Evohome de la zone).
- [ ] VT : `manual_override_duration_min` = 0, pas de verrou actif ; programme interne Evohome de la zone vide ou plat.
      L'avertissement de la carte est vérifié.
- [ ] Aucune autre automatisation ni `switch.schedule_*` ne pilote ce thermostat (voir « conflits » dans la carte).
- [ ] Programme « Bureau (test) » créé : entité = le thermostat, deux profils (« Normal » et « Court »), priorité 1,
      état par défaut = Éco, « réappliquer » activé. Plages du jour : une plage **Confort** commençant dans
      ~30 min et finissant ~1 h plus tard, plus une plage de nuit (22:00 → 06:00 en Nuit/Éco).
- [ ] Journal de bord ouvert dans un onglet (filtre sur Weekly Planner).
- [ ] Début de la période de 3 jours : date et heure ________.

## 2. Scénarios

### Début de plage
- [ ] À l'heure de début, le thermostat passe en Confort (preset ou consigne attendue) en moins de 2 min.
- [ ] La carte affiche « Confort jusqu'à HH:MM » ; l'attribut `mode_actuel` du switch est juste.
- [ ] Journal de bord : **une** entrée « début » pour ce segment.

### Fin de plage
- [ ] À l'heure de fin, le thermostat revient à l'état par défaut (Éco) en moins de 2 min.
- [ ] Journal : **une** entrée « fin » ; la carte affiche l'état par défaut.
- [ ] Même chose pour la plage de nuit (passage de minuit) : début à 22:00, fin à 06:00.

### Dérogation à la main
- [ ] Pendant une plage, changer la consigne ou le preset à la main (application Evohome, VT ou HA).
- [ ] Après la fenêtre de grâce (≈ 6 min pour Evohome), la carte affiche la dérogation avec « Reprendre » ;
      Weekly Planner ne réapplique rien.
- [ ] Un rafraîchissement cloud d'Evohome ne crée pas de fausse dérogation.
- [ ] À la fin de la plage, l'état par défaut est appliqué malgré la dérogation.
- [ ] « Reprendre » avant la fin : l'état voulu est réappliqué ; journal : entrée « reprise ».
- [ ] Journal : **une** entrée « dérogation » (pas une par rafraîchissement).

### « Déroger… » avec échéance
- [ ] Depuis la carte : preset Boost « pendant 30 min ». Le thermostat passe en Boost, aucune alerte ni essai.
- [ ] À l'échéance, la cible du planning du moment est appliquée.
- [ ] Refaire avec « jusqu'à HH:MM » (dans le futur) puis « jusqu'à la fin de la plage ».
- [ ] « Reprendre » avant terme annule la dérogation volontaire.
- [ ] Une transition de plage pendant une dérogation volontaire n'est pas appliquée au thermostat.

### Changement de profil
- [ ] Pendant une plage, passer de « Normal » à « Court » avec le `select` : l'état voulu du nouveau profil est
      appliqué (si « réappliquer » et pas de dérogation).
- [ ] Revenir à « Normal ». Journal : entrée(s) cohérente(s), pas de rafale.

### Redémarrage de Home Assistant (avec accord du propriétaire)
- [ ] Accord obtenu : ________ (date, heure).
- [ ] Redémarrage **en cours de plage**, sans dérogation : après ~30 s de stabilisation, la plage est réappliquée
      (si « réappliquer ») ou rien n'est envoyé (sinon).
- [ ] Redémarrage **avec dérogation en cours** : la dérogation est conservée, rien n'est réappliqué.
- [ ] Redémarrage **pendant une fin de plage** (si possible : HA arrêté avant l'heure de fin) : la fin est rattrapée
      au démarrage.
- [ ] Aucune fausse dérogation ni action en double après le redémarrage.

### Entité injoignable (désactivation temporaire, avec accord)
- [ ] Accord obtenu : ________.
- [ ] Désactiver temporairement l'entité thermostat avant un début de plage.
- [ ] La carte signale l'entité ; l'action attend. Notification persistante après le délai réglé (le réduire à
      5 min pour le test, puis le remettre à 30).
- [ ] Réactiver l'entité : l'état voulu est recalculé et appliqué (début si encore dans la plage, sinon défaut).
      La notification disparaît.
- [ ] Remettre les réglages d'origine (entité activée, délai de notification).

### Journal de bord : une entrée par décision
- [ ] Sur toute la période, relire le journal ligne par ligne : chaque début, fin, dérogation, échec définitif et
      reprise apparaît **une seule fois**, à la bonne heure, avec une raison lisible.
- [ ] Aucune entrée par essai ou par rafraîchissement.
- [ ] Journaux de HA : aucune erreur ni avertissement venant de `weekly_planner` (hors scénarios provoqués).

## 3. Critères de réussite

- Tous les scénarios ci-dessus cochés, sur au moins 3 jours complets, dont une nuit et un passage de minuit.
- Aucune action manquée : chaque début et chaque fin a eu lieu à ±2 min.
- Aucun réglage manuel écrasé en dehors d'une fin de plage ou d'une action de l'utilisateur.
- Aucune fausse dérogation, aucune boucle d'essais.
- Journal de bord conforme (une entrée par décision) ; pas d'erreur dans les journaux.
- Le confort réel est satisfaisant (pas de chauffage inattendu).

Résultat : ☐ réussi ☐ à corriger. Observations : ________________________________

## 4. Retour arrière

1. Désactiver le switch du programme (le défaut s'applique une fois), ou activer `switch.weekly_planner_vacation`
   pour tout suspendre.
2. Remettre le VT et le programme Evohome dans l'état noté en préparation ; réactiver le retour manuel
   automatique du VT si besoin.
3. Si nécessaire, supprimer le programme, puis l'intégration (Paramètres > Appareils et services > Weekly
   Planner > Supprimer) : la ressource de la carte, les entités et le stockage sont retirés.
4. En dernier recours, restaurer la sauvegarde faite en préparation.
