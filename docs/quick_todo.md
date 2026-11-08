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
