# Contributing

## Versions
The project follows [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.
`0.x` while the first version is being built, `1.0.0` once everything works. The version lives in
`custom_components/weekly_planner/manifest.json`, `pyproject.toml` and `frontend/package.json`.

## Commit messages
[Conventional Commits](https://www.conventionalcommits.org/), in English:

```
feat(card): drag slot edges on touch screens
fix(engine): keep a manual override after a restart
docs: explain overrides in the README
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `ci`, `build`.
A breaking change adds `!` (`feat!: …`) and a `BREAKING CHANGE:` footer.

## Branches
Work happens on `develop`; `main` only receives released versions. After 1.0.0, every change goes
through a pull request.

## Checks
```
uv run --group test pytest -q
cd frontend && npx tsc --noEmit && npm run build
```
