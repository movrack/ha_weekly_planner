# Working on Weekly Planner

Guidelines for anyone who changes this repository.

If `PROJECT_MEMORY.md` exists in the working tree, read it for local project context. It is intentionally
ignored by Git and may contain notes that are useful across different AI tools.

## Project
- Home Assistant integration (domain `weekly_planner`) that ships its own Lovelace card; distributed
  through HACS.
- Read `docs/SPEC.md` (specification and task lists) and `docs/DECISIONS.md` (decisions already made)
  before any change. Deferred ideas: `docs/IDEES.md`. Tick the tasks in the spec as they are done.

## Model
- **Keep discovery generic**: never hardcode a catalogue/allowlist of supported device types, brands,
  integrations or actions to populate selectors or decide what can be scheduled. Derive choices from
  Home Assistant metadata and the entities in configured programs. Keep unknown domains usable and
  preserve configured filter values even when their devices disappear. Use Home Assistant translations
  for domain names, with the raw domain as fallback. Display fallbacks must never restrict support.
- One model for every device: no knowledge of a device type or brand. Actions are the Home Assistant
  services that accept the entity (`hass.services`), optionally restricted per device
  (`entities[i].allowed_services`; new devices use `restrict_services: true`, so empty means none;
  legacy empty/missing selections without this flag keep all). An action may explicitly set `target_entity_id` to
  control another HA entity (for example a favorite-position button); discover services and fields from
  that actual target. Never redirect targets through `data` or `data_sources`.
- **Labels** are global and shared (name, colour, default action), with an optional value per device.
  A slot = start, optional end, days, label. When a slot ends, the device's default label applies
  ("the rest of the time"). A slot without end is a one-shot.
- Service fields follow the device: unsupported fields (`filter.supported_features` / `attribute`)
  are hidden; a service whose fields are all optional requires its first one; an optional field that
  another service of the domain sets on its own (`set_<field>`) is left out.

## Modes
- Program modes are independent weekly schedules (`profiles` internally); Vacation is an ordinary mode.
- Optional `mode_source` maps raw states of any external entity to mode IDs. Keep the last valid mode
  when unavailable/unmapped; never hardcode alarm states or selector types. Editing inactive mode hours
  must not activate it or reapply active actions. The legacy global vacation switch is a separate pause
  control with a clear display name and stable identity.

## Rules
- **Delegation**: when sub-agents are available, delegate suitable independent tasks to agents with
  appropriate expertise. Keep the main conversation available for new instructions, coordinate file
  ownership, review their results and give the owner a consolidated report.
  The main session coordinates only (it does not write code itself): it picks the agent and a model sized
  to the work, checks evidence, and asks the owner before creating a new specialised agent.
- **AI assistance**: keep repository guidance and local memory usable across AI tools; do not add
  tool-specific instructions or attribution outside the generic AI assistance note in the README files.
- **Commits**: Conventional Commits in English (`feat(card): …`, `fix(engine): …`, `docs: …`,
  `test: …`, `chore: …`). No trailers.
- **Versions**: SemVer, changed together in `custom_components/weekly_planner/manifest.json`,
  `pyproject.toml`, `frontend/package.json` (and its lock file), with an entry in `CHANGELOG.md`
  (Keep a Changelog).
- **Branches**: work on `develop`; `main` only receives releases approved by the maintainer. Changes go
  through an issue (`bug` or `change request`) and a pull request that references it.
- **No secrets** in the repository: no tokens, passwords, addresses or personal data. The local test
  instance under `dev/` stays untracked.
- Code, commits, README and CHANGELOG in English; `README.fr.md` in French.

## User interface
- Reference screen: 360 × 780 px CSS (a common phone), then ≥ 1400 px; light and dark themes.
- Keep text to the minimum; a non-technical person must understand every screen. No duplicate or
  ambiguous buttons; never more than one "Save / Cancel" pair visible at a time.
- The card must always stay up to date by itself (`weekly_planner/subscribe`); never ask the user to
  reload. A save is rebuilt on fresh data (one retry on a revision conflict) and must not fail because of
  stale data.
- Icons: standard Home Assistant `mdi:` icons through `<ha-icon>` only, no emoji.
- Bars are editable by touch and mouse (long press or click, 44 px handles, 15-minute steps, saved on
  release with an undo); typed times accept any minute.

## Checks before a commit
- Python: `uv run --group test pytest -q`.
- Card: `cd frontend && npx tsc --noEmit && npx vitest run && npm run build`. The built bundle
  `custom_components/weekly_planner/frontend/weekly-planner-card.js` is committed.
- Try the change in a browser on a test instance: `scripts/dev_ha.sh` (port 8124) then
  `scripts/dev_onboard.py`; after a build, call the `weekly_planner.reload` service — the card reloads
  itself when its version changes.
- Update the spec, the decisions and the CHANGELOG with the change.

## Deploying to a real instance
- The weekday 08:00–17:00 restriction applies to commits, cherry-picks, merges and reverts only.
  It does not prohibit deployments. When the owner requests deployment, deploy the tested working
  tree even if changes are uncommitted; never require a commit or another approval solely for that reason.
  Keep the commit guard intact and report uncommitted changes and the deployed bundle checksum.
- `scripts/deploy_prod.sh` (dry run by default, `--apply` to copy; it runs the tests first).
- Card-only change: `weekly_planner.reload`. Python change: back up Home Assistant, then restart it.
  The owner explicitly authorizes any necessary restart when requesting deployment; do not ask again.
