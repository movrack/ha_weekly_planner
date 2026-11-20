# À faire

Idées et instructions du propriétaire en attente. Cocher chaque ligne une fois faite, puis la supprimer au prochain nettoyage ;
les détails et questions ouvertes sont dans `docs/SPEC.md` § 37 et le travail terminé dans `CHANGELOG.md` / `docs/DECISIONS.md`.

## À clarifier avec le propriétaire (2026-11-07), voir SPEC § 37

- [x] Bouton « Mettre en pause » d’un programme : 1 jour, 7 jours, x jours (§ 37.1) (done).
- [x] Mode global choisi par un sélecteur externe (§ 37.2, ADR 0001) : fait (moteur, migration, options, carte, écran des horaires, fichier de configuration, documentation). Reste : droits identiques à l’interrupteur de programme (réglages réservés aux administrateurs pour l’instant) et captures du guide à refaire.
- [x] Programmes configurables par un fichier YAML `/config/www/weekly_planner.yml`, mis à jour à chaque modification dans l’interface (§ 37.3). Attention : `/config/www` est public.

## Échelle de qualité Home Assistant (SPEC § 38, `docs/PLAN_QUALITY_SCALE.md`)

- [x] Atteindre le niveau Bronze (auto-déclaré) : `quality_scale.yaml`, socle d’entité commun, désinstallation documentée, actions documentées, test de cohérence.
- Silver et Gold : étudiés dans le plan, pas un objectif.

## À finir avant la v1.0.0

- [ ] Refaire les captures de `wiki/images/guide`, renuméroter l’atlas, tags/releases, HACS, test réel ≥ 3 jours (SPEC § 14.6, § 14.7).


## Nouveau, à réécrire: (faire des issues)

- Dans chaque vue d'édition des horaires il y a la description du réglage avec un bouton modifier. pour modifier le réglage. Toute la gestion de ces réglages (ajout/suppréssion et modification) doit être déplacer dans un fieldset entre Mode et Horaire. Par défaut juste montrer ceux qui existe, mais via un collapse avoir les paramètre d'édition. Le plus improtant dans l'écran reste la configuration d'horaires.

- Si je ne me trompe pas, lorsqu'un evenement extérieure arrive, il a la main. Donc si le weekly planner dit chauffe a 18degres entre 10h et 20h. Puis de 20h a 21h on demande 17° via le planner.Si depuis l'extérieure, à 12h on passe à 20degre, cela va déroger le planner et la temperature va etre à 20°. Par contre ma question, à 20h, est-ce que cela va rester sur 20 ou est-ce que le planner va reprendre la main? Je souhaite qu'il reprenne la main, que la température passe à 17 et je veux que ce soit documenter.


- Supprime "Qui pilote le chauffage" depuis Thermostat/settings
- Prio 1 :Vérifier que tous les thermostats fonctionne avec versatile thermostat et le weekly planner
  - Empecher que evohome n'applique ces programme, on donne la main totale à versatile thermostat
  - Verifier tous les écrans pour utiliser versatile thermostat et plus les climate d'evohome. Verifier les cartes et utiliser celle de versatile en suivant l'exemple de celle pour bureau. Ceci dans les vues thermostats mais aussi pour toutes les autres vue de pieces comme les chambres


- verifie et met à jour toutes les issues. Regarde celle qui peuvent être cloturée
- Pour les mutations, je veux que pour les prochaines fois, tu enregistre les evolutions dans l'issue comme un journal de bord (ou propose moi une autre maniere pour avoir un suivit)
- fais une revue des issues, fais le triage, mets des tag (aussi par contenu ex nouvelle feature; bug fix; testing; configuration, ...) je ne sais pas quel label tu as et tu utilise
