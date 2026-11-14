# Contributing

The working rules (model, UI, checks, deployment) are in [AGENTS.md](AGENTS.md); read them first.

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

## Development setup

Python development targets **3.14.2–3.14.x**; tests use the HA dependency pinned in
`pyproject.toml`/`uv.lock`. Frontend tooling is in `frontend/package-lock.json`.

```bash
uv sync --group test
uv run --group test pytest -q
cd frontend
npm ci
npx tsc --noEmit
npx vitest run
npm run build
```

The bundle under `custom_components/weekly_planner/frontend/` is versioned with
its sources. Run `scripts/dev_ha.sh` for the local HA instance on port 8124, then
`scripts/dev_onboard.py` to initialize it. The onboarding helper prints a development
token: keep its output and `dev/` runtime data out of Git and published logs.

Further references: [specification](docs/SPEC.md), [decisions](docs/DECISIONS.md),
[screen inventory](docs/SCREEN_INVENTORY.md), [changelog](CHANGELOG.md).

## Review agents (optional)

The project uses shared review agents kept in their own repository,
[`movrack/AI`](https://github.com/movrack/AI): `john-117` (orchestrator), `nemesis` (devil's advocate of specs and
plans), `mamy` (novice screen tester), `ally` (accessibility), `stryker` (mutation testing), `heimdall`
(delivery gatekeeper), `parker` (screenshots), `iris` (CSS and visual consistency) and `c3po` (translations). They work on request only, change no production code and write
their reports to `reports/ai/<agent>/` (git-ignored). To use them:

```bash
git clone https://github.com/movrack/AI.git ~/Dev/AI
```

The agent files use neutral tool names (`read`, `search`, `execute`, `edit`, `mcp:<server>/<tool>`), so a plain
symlink into your assistant's agents folder is not enough: translate the `tools` line to the names of your
assistant (for Claude Code, `Read`, `Grep`/`Glob`, `Bash`, `Edit`/`Write`, `mcp__<server>__<tool>`) and copy the
file into `~/.claude/agents/` (all your projects) or `.claude/agents/` (this project only), or generate them with
a sync script that does the translation. The `AI` repository explains both ways in its README ("Install").
`mamy`, `ally` and `parker` need the Chrome DevTools MCP server. Do not add copies of these agents to this
repository: change them in `movrack/AI`.
