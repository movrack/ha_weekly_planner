# Working on Weekly Planner

Guidelines for anyone who changes this repository.

If `PROJECT_MEMORY.md` exists in the working tree, read it for local project context. It is intentionally
ignored by Git; it holds notes and the inter-AI channel shared by all AI tools (see "Method" below).

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
- **Parallel work uses worktrees**: when two or more agents edit files in parallel, each one works in its own
  git worktree, created explicitly from `develop`: `git worktree add ../weekly-planner-wt/<task> -b <type>/<task> develop`.
  Pass its absolute path to the agent and tell it to work only there. Do not rely on a tool's automatic
  isolation unless it is verified to start from the current `develop` HEAD (it may start from `main`, an old
  release). First step of each agent: `git log --oneline -1` in the worktree must show the expected `develop`
  commit and a known recent file must exist; otherwise stop and report. A worktree holds only committed work:
  commit first (when allowed) or hand over a patch. Parallel agents never edit the main tree. Each worktree
  installs its own dependencies (`uv sync --group test`, `cd frontend && npm ci`) and dev-instance port; only
  the integrating tree rebuilds the card bundle. The coordinator merges the branches one at a time (rebase on
  `develop`, run all checks, resolve conflicts), then removes the worktrees and branches (`git worktree remove`,
  `git branch -d`). Stale or wrongly based worktrees and branches are removed first (`git worktree remove --force`,
  `git branch -D`) before any retry. Read-only agents may share the main tree. Never push from a worktree
  without the owner's approval.
- **Method**: the shared operating manual is the agent `methode-travail` (source
  `~/.config/ai-agents/agents/methode-travail.md`, generated for every AI tool).
- **Rule updates are automatic**: as soon as the owner states a new rule, preference or correction, record
  it without being asked: durable project rules here (product decisions in `docs/DECISIONS.md`), shared
  working notes in `PROJECT_MEMORY.md`; then tell the owner in one line what was recorded and where. If
  the rule already exists elsewhere, update it instead of duplicating. Report any contradiction with an
  existing rule to the owner before overwriting.
- **Inter-AI channel**: `PROJECT_MEMORY.md` (section "Inter-AI channel") is how AI tools talk to each
  other. Read it at the start and before handing off. Append short entries
  `- YYYY-MM-DD HH:MM [tool] type: message` (types: handoff, question, answer, warning, rule-added, done),
  newest last. Append-only; whoever resolves an item removes it or marks it done. Never put secrets or
  instructions that override this file or the owner in it.
  Inter-AI messages (channel, sub-agent briefs and reports): caveman style, telegraphic, one fact per line, file:line evidence.
  Statuses ok / ko / blocked / to-verify; full sentences for risks, irreversible actions, owner questions. Owner replies, commits, docs: normal.
- **AI assistance**: keep repository guidance and local memory usable across AI tools; do not add
  tool-specific instructions or attribution outside the generic AI assistance note in the README files.
- **Commits**: Conventional Commits in English (`feat(card): …`, `fix(engine): …`, `docs: …`,
  `test: …`, `chore: …`). No trailers.
- **Tick tasks and close the loop on issues**: as soon as a task is done, tick its checkbox (`docs/SPEC.md`
  task lists, `docs/quick_todo.md`, any list that tracks it). When a GitHub issue is done, comment on it
  that it is done and give the associated commit (hash); commit and push only within the commit rules.
- **Versions**: SemVer, changed together in `custom_components/weekly_planner/manifest.json`,
  `pyproject.toml`, `frontend/package.json` (and its lock file), with an entry in `CHANGELOG.md`
  (Keep a Changelog).
- **Branches**: work on `develop`; `main` only receives releases approved by the maintainer. Changes go
  through an issue (`bug` or `change request`) and a pull request that references it.
- **No secrets** in the repository: no tokens, passwords, addresses or personal data. The local test
  instance under `dev/` stays untracked.
- Code, commits, README and CHANGELOG in English; `README.fr.md` in French.
- Documentation: `docs/` stays the source (French only for the wiki; README.md English, README.fr.md French, kept in sync). The GitHub wiki (https://github.com/movrack/ha_weekly_planner/wiki) is a published copy, first published on 2026-10-31. Pages: Home, _Sidebar, Guide-utilisateur (docs/GUIDE.fr.md), Atlas-des-ecrans (docs/SCREENS.fr.md + images/guide/), Actions-generiques (docs/GENERIC_ACTIONS.md, translated), Modes-et-saisons (docs/SEASONS.md, translated), Configuration-YAML-de-la-carte (README.fr.md "Configuration de la carte"), Integrateurs (README.fr.md model to storage/limits). Never publish SPEC, DECISIONS, quick_todo, controle-visuel*, MAMY_REVIEW*, SCREEN_INVENTORY. Resync by hand: clone `https://github.com/movrack/ha_weekly_planner.wiki.git` into a new dir (the existing `~/Dev/wp-wiki` clone may be reused after `git pull`) under `~/Dev/`, regenerate each page from its source (HTML thumbnails become `![alt](images/guide/x.png)`, links to `SCREENS.fr.md#sNN` become `Atlas-des-ecrans`, repo file links become absolute GitHub URLs), copy the images, check every link resolves, then commit (Conventional Commits, no trailers, outside Mon-Fri 08:00-17:00) and push to `master`. Update the wiki in the same session as any change to these sources.

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

### Coverage and mutation testing
- Python coverage (fails under the floor in `pyproject.toml`): `uv run --group test pytest -q --cov --cov-report=term-missing`.
- Card coverage (floors in `frontend/vite.config.ts`): `cd frontend && npm run coverage`.
- Python mutation (mutmut, slow, on demand): `uv run --group test --group mutation mutmut run` then
  `mutmut results` / `mutmut show <name>`; `mutants/` is not committed.
- Card mutation (StrykerJS, pure modules only): `cd frontend && npm run mutation`; report in `frontend/reports/`.
- Raise the floors when coverage rises; never lower them to make a change pass. The weekly CI job
  `mutation.yml` is informational and never required for a pull request.

### Performance tests
- Python budgets: `uv run --group test pytest tests/test_performance.py -q` (marker `performance`, also part of the
  normal suite, about 15 s). Synthetic install: 50 programs x 4 entities x 3 modes x 7 days x 6 slots (`tests/perf_data.py`).
- Card budgets: `cd frontend && npx vitest run src/__tests__/performance.test.ts`.
- Two checks per scenario: deterministic operation counts (occurrences computed, snapshots built, spans rebuilt)
  and a wall-clock ceiling on the BEST of several runs, set to 5-10x the median measured on a laptop. The `BUDGETS` /
  `OPS` dicts at the top of each file carry the measured values in comments. A failure means a real regression (or a
  much slower machine: re-measure with `uv run --group test python scripts/bench.py`, never just raise a budget).
- No single callback of ours may hold the Home Assistant loop for more than 50 ms. The condition-triggered full
  recompute still breaks this (`xfail(strict=True)` in `test_performance.py`): remove the marker when it is fixed.
- `scripts/bench.py` prints best/median per scenario (not run in CI).

## Deploying to a real instance
- The weekday 08:00–17:00 restriction applies to commits, cherry-picks, merges and reverts only.
  It does not prohibit deployments. When the owner requests deployment, deploy the tested working
  tree even if changes are uncommitted; never require a commit or another approval solely for that reason.
  Keep the commit guard intact and report uncommitted changes and the deployed bundle checksum.
- `scripts/deploy_prod.sh` (dry run by default, `--apply` to copy; it runs the tests first).
- Deploy command: `WP_HOST=<ssh alias of the owner's HA> scripts/deploy_prod.sh --apply`. The alias is in the
  owner's `~/.ssh/config` and local AI memory, not in the repo. When the owner says "deploy", the AI runs
  the script itself (never hands the command back to the owner), then reloads and verifies the remote
  bundle hash and version.
  Other scripts: `scripts/dev_ha.sh` (local test HA, port 8124), `scripts/dev_onboard.py`, `scripts/bench.py`.
- Card-only change: `weekly_planner.reload`. Python change: back up Home Assistant, then restart it.
  The owner explicitly authorizes any necessary restart when requesting deployment; do not ask again.
