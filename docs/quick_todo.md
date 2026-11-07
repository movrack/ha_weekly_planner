# À faire

Idées et instructions du propriétaire en attente. Cocher chaque ligne une fois faite, puis la supprimer au prochain nettoyage ;
les détails et questions ouvertes sont dans `docs/SPEC.md` § 37 et le travail terminé dans `CHANGELOG.md` / `docs/DECISIONS.md`.

## À clarifier avec le propriétaire (2026-11-07), voir SPEC § 37

- [ ] Bouton « Mettre en pause » d’un programme : 1 jour, 2 jours, 1 semaine, 2 semaines (§ 37.1).
- [ ] Sélecteur de mode / saison (§ 37.2).
- [x] Programmes configurables par un fichier YAML `/config/www/weekly_planner.yml`, mis à jour à chaque modification dans l’interface (§ 37.3). Attention : `/config/www` est public.

## Échelle de qualité Home Assistant (SPEC § 38, `docs/PLAN_QUALITY_SCALE.md`)

- [ ] Atteindre le niveau Bronze (auto-déclaré) : `quality_scale.yaml`, socle d’entité commun, désinstallation documentée, actions documentées, test de cohérence.
- Silver et Gold : étudiés dans le plan, pas un objectif.

## À finir avant la v1.0.0

- [ ] Refaire les captures de `wiki/images/guide`, renuméroter l’atlas, tags/releases, HACS, test réel ≥ 3 jours (SPEC § 14.6, § 14.7).
