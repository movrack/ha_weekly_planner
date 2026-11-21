# Working on Weekly Planner

Guidelines for anyone who changes this repository.

If `PROJECT_MEMORY.md` exists in the working tree, read it for local project context. It is intentionally
ignored by Git; it holds notes and the inter-AI channel shared by all AI tools (see "Method" below).

## Project
- Home Assistant integration (domain `weekly_planner`) that ships its own Lovelace card; distributed
  through HACS.
- Read `docs/SPEC.md` (specification and task lists) and `docs/DECISIONS.md` (decisions already made)
  before any change. Official user documentation lives in `wiki/`. Tick the tasks in the spec as they are done.

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
  A slot = start, optional end, days, label, and optional `entities` (the program devices it targets;
  absent = every device, including ones added later; never empty; test with `applies`). When a slot ends, the device's default label applies
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
  The main session coordinates and does short work itself (fix under ~10 lines, wording, config, one command);
  it delegates only when it pays off (long, independent, provable by a test/script/capture), picks a model
  sized to the work, checks evidence, and asks the owner before creating a new specialised agent. Another
  model (local Qwen, Codex…) is used only when worthwhile, never for user-facing wording or unreviewed engine code.
- **Parallel work uses worktrees**: when two or more agents edit files in parallel, each one works in its own
  git worktree, created explicitly from `develop`: `git worktree add ../weekly-planner-wt/<task> -b <type>/<task> develop`.
  Pass its absolute path to the agent and tell it to work only there. Do not rely on a tool's automatic
  isolation unless it is verified to start from the current `develop` HEAD (it may start from `main`, an old
  release). First step of each agent: `git log --oneline -1` in the worktree must show the expected `develop`
  commit and a known recent file must exist; otherwise stop and report. A worktree holds only committed work:
  commit first (when allowed) or hand over a patch. Parallel agents never edit the main tree. Each worktree
  installs its own dependencies (`uv sync --group test`, `cd frontend && npm ci`) and dev-instance port, and
  builds its own card bundle (not committed). The coordinator merges the branches one at a time (rebase on
  `develop`, run all checks, resolve conflicts), then removes the worktrees and branches (`git worktree remove`,
  `git branch -d`). Stale or wrongly based worktrees and branches are removed first (`git worktree remove --force`,
  `git branch -D`) before any retry. Read-only agents may share the main tree. Never push from a worktree
  without the owner's approval.
- **Method**: the shared operating manual is the agent `methode-travail`, generated for every AI tool.
  At the start of every new session, read this manual, this file and `PROJECT_MEMORY.md` if present,
  before taking action or reporting status; never rely only on instructions retained from an earlier session.
- **Rule updates are automatic**: as soon as the owner states a new rule, preference or correction, record
  it without being asked: durable project rules here (product decisions in `docs/DECISIONS.md`), shared
  working notes in `PROJECT_MEMORY.md`; then tell the owner in one line what was recorded and where. If
  the rule already exists elsewhere, update it instead of duplicating. Report any contradiction with an
  existing rule to the owner before overwriting. Rules that only concern the owner's own machine or
  installation (paths, hosts, personal habits, local tooling) go in `PROJECT_MEMORY.md`, never in this file:
  this repository is public.
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
  `pyproject.toml`, `frontend/package.json` (and its lock file), `uv.lock` (`uv lock`), with an entry in
  `CHANGELOG.md` (Keep a Changelog). A beta pre-release adds a suffix: `0.30.0-beta.1`.
- **Branches**: work on `develop`; `main` only receives releases approved by the maintainer. Changes go
  through an issue (`bug` or `change request`) and a pull request that references it.
  When the owner approves a plan for implementation, save it in `docs/PLAN_<name>.md` and create or update its GitHub
  tracking issue with the task checklist at implementation start, without waiting for completion.
- **No secrets** in the repository: no tokens, passwords, addresses or personal data. The local test
  instance under `dev/` stays untracked.
- Code, commits, README and CHANGELOG in English; `README.fr.md` in French.
- README (EN and FR, same structure): the page HACS shows before an install. Keep it short: what it does, requirements, installation (HACS with the My Home Assistant button, manual), first program, options summary, entities and actions, examples, updating, known limitations, troubleshooting, removal. Sections follow the Home Assistant documentation rules of the quality scale. Links and images are full GitHub addresses on `main` (HACS renders the file outside the repository), plain Markdown. The integrator reference lives in `wiki/REFERENCE.md` (English) and `wiki/REFERENCE.fr.md` (French): nothing is described twice, the README links to it. Development notes live in `CONTRIBUTING.md`.
- Before the v1.0.0 release, ALL screenshots (`wiki/images/guide`) must be redone from the final UI; until then screenshots may lag but are never labelled with versions.
- Renumber the screen atlas at the v1.0.0 release (gaps allowed until then).
- User-facing docs (wiki, guide, READMEs) describe only the current product: no history, no "old/former/replaced" wording, no version-dated captions; history lives in CHANGELOG/DECISIONS.
- **Quality scale (maintainer decision): the project must ALWAYS stay validated at least Bronze** on the Home Assistant Integration Quality Scale (self-declared, `custom_components/weekly_planner/quality_scale.yaml`), and the README (EN and FR) must ALWAYS claim it: the Bronze badge and the "Quality level" line. Before delivering or deploying Python code, check that no Bronze rule regressed (all 20 rules `done` or motivated `exempt`, `config_flow.py` at 100 % lines and branches, `tests/test_quality_scale.py` green, removal and actions docs up to date). A change that breaks a Bronze rule is not delivered until the rule holds again; never remove the badge to hide a regression.
- **Review agents**: use the shared generic agents of the public repository https://github.com/movrack/AI (`john-117` orchestrator, `nemesis` devil's advocate, `mamy` novice screen tester, `ally` accessibility, `stryker` mutation testing, `heimdall` delivery gatekeeper, `parker` photographer, `iris` CSS and visual consistency, `c3po` translations) instead of project-specific copies or look-alikes; change their behaviour in that repository, never in a generated copy. They work on request only and write their reports to `reports/ai/<agent>/` (git-ignored). The findings of `mamy` and `ally` are tracked in one GitHub issue per report, as a checklist (`- [ ]` / `- [x]`, labels `accessibility` and `enhancement`) ticked as tasks are delivered. `stryker` only adds tests (never production code, never lowers a floor, never skips a test), `heimdall` only reports, `iris` reviews styles and, only when asked to harmonise, edits styles only (shared stylesheet `frontend/src/styles.ts`), and `c3po` checks that every string exists in every language and means the same thing (reports by default; fixes translation files only when asked).
- Documentation: `wiki/` is the official source of the user docs (French only; `docs/` holds only internal project files: SPEC, DECISIONS, quick_todo, SCREEN_INVENTORY and the plan of work in progress; delete a plan when its work is done, the decision stays in DECISIONS; README.md English, README.fr.md French, kept in sync). The GitHub wiki (https://github.com/movrack/ha_weekly_planner/wiki) is a published copy. Pages: Home, _Sidebar, Guide-utilisateur (wiki/GUIDE.fr.md), Atlas-des-ecrans (wiki/SCREENS.fr.md + images/guide/), Actions-generiques (wiki/GENERIC_ACTIONS.md, translated), Modes (wiki/MODES.md, translated), Recettes (wiki/RECETTES.fr.md, the index), one page per recipe (wiki/RECETTE_*.fr.md; page name = the file name in the form `Recette-jour-travaille`, short and stable, not the long title) and Priorites (wiki/PRIORITES.fr.md); every recipe follows the same template: title, « À quoi ça sert », « Ce qu'il faut », « Étapes », « Résultat », « À savoir », back link to the index; the old page Recettes-pour-les-modes points to Recettes, Configuration-YAML-de-la-carte (wiki/REFERENCE.fr.md "Configuration de la carte"), Integrateurs (wiki/REFERENCE.fr.md from "Modèle et exécution" on, plus README.fr.md "Entités et actions"). Never publish anything from `docs/`. Resync by hand: clone `https://github.com/movrack/ha_weekly_planner.wiki.git` into a new directory (an existing clone may be reused after `git pull`), regenerate each page from its source (HTML thumbnails become `![alt](images/guide/x.png)`, links to `SCREENS.fr.md#sNN` become `Atlas-des-ecrans`, repo file links become absolute GitHub URLs), copy the images, check every link resolves, then commit (Conventional Commits, no trailers) and push to `master`. Update the wiki in the same session as any change to these sources.

## User interface
- Reference screen: 360 × 780 px CSS (a common phone), then ≥ 1400 px; light and dark themes.
- Keep text to the minimum; a non-technical person must understand every screen. No duplicate or
  ambiguous buttons; never more than one "Save / Cancel" pair visible at a time.
- General owner rule (2026-11-12): every new text is the **shortest wording that stays clear** to a
  novice, so the screen is not loaded at 360 px; a clarification must be visible, not hidden in a tooltip.
  Ask `c3po` for the wording of a new text (FR and EN) when it is not obvious.
- The card must always stay up to date by itself (`weekly_planner/subscribe`); never ask the user to
  reload. A save is rebuilt on fresh data (one retry on a revision conflict) and must not fail because of
  stale data.
- Icons: standard Home Assistant `mdi:` icons through `<ha-icon>` only, no emoji.
- **Consistency (owner rule, 2026-11-20):** every screen, view and gesture stays consistent with the rest of
  the product (same gesture for the same action: opening an editor from a graphic, a bar or a list row is a
  long press or the keyboard, never a plain click; visible buttons of a form or dialog, such as an edit
  pencil, a trash can or a "Modify" button, open by a plain click (owner, 2026-11-21); same wording, same
  layout, same rules). Any inconsistency found, in code, docs or between two
  owner decisions, is **reported to the owner to be fixed**, never worked around silently, and a later
  decision does not silently override an earlier one: the document that loses is updated in the same change.
- **An element never disappears (owner rule, 2026-11-21, accessibility):** a control, switch, field, fold, section
  or link that cannot be used in the current state (permission, read-only, another form open, empty list, mode)
  stays on screen, **greyed and disabled** (`disabled` and `aria-disabled`), with a **short visible message**
  that says why, linked by `aria-describedby` (EN and FR, shortest clear wording). Never hide it with `nothing`,
  `hidden`, `display: none` or a removed branch. Exceptions: purely decorative elements and loading states.
  Existing code that hides an element is an inconsistency to report and fix. The rule covers an element that is
  usable in **other states**; an element that is never offered in a given context (for example the setting
  editing buttons inside the compact bars strip, where settings can only be chosen) is not "disappearing": do not
  add it greyed.
- **A finding is verified before it is acted on, and before the owner is asked (owner rule, 2026-11-21, after the
  "several programs on one line" mistake: an audit said an element disappeared when the case cannot happen, the
  owner was asked to decide on it and unused code was written and deployed).** Every finding of an audit, a review
  or an agent report (accessibility, performance, dead code, tests, "missing" feature) is checked **in the real
  code and, for a screen, on the real screen** before work starts: who calls this code, with which values, can the
  state happen at all (a call chain, a test or a capture of the real card; a forced or simulated state does not
  prove it). A report states each point as **verified** (with the evidence) or **not verified**; a not verified
  point is not presented to the owner as a fact and does not start work. Only a verified finding is submitted to
  the owner for a decision, with the evidence. A briefing sent to an agent asks for this evidence (the caller, the
  condition, whether the state is reachable) and says which points the agent must not guess.
- **A visible feature is shown on the real screen before it is closed or delivered (owner rule, 2026-11-21):** a
  capture of the real card in a real browser (`parker`, real data, not a state forced with DevTools), shown to the
  owner when it changes what they see. Tests alone do not prove that a feature appears.
- Bars are editable by touch and mouse (long press, never a plain click; 44 px handles, 15-minute steps, saved on
  release with an undo); typed times accept any minute.

## Checks before a commit
- Python: `uv run --group test pytest -q`.
- Card: `cd frontend && npx tsc --noEmit && npx vitest run && npm run build`. The built bundle
  `custom_components/weekly_planner/frontend/weekly-planner-card.js` is **not committed** (git-ignored): the
  `Release` workflow builds it into `weekly_planner.zip`, the file HACS installs. Without it the integration
  starts with a warning and no card or panel. To have a change tested before a version, publish a beta
  pre-release (see "Deploying to a real instance"), never a branch or a commit.
- Try the change in a browser on a test instance: `scripts/dev_ha.sh` (port 8124, builds the card first) then
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

### Writing tests (owner rule, 2026-11-18)
- **One test file per module, named after the module** (`bar-editor.test.ts`, `tests/test_resolver.py`). A large
  module may split by behaviour (`bar-editor-drag.test.ts`), never by tool, origin, date or number: no
  `*-mutants-*`, `*-codex-*`, `coverage-floors-*`, `-3`, `polish-0211`, `test_mutation_*` files.
- **Before adding a test, search the module's file**: extend or parametrize an existing test of the same behaviour
  rather than writing a second one. Same behaviour = same rule of the spec, same inputs class, same expected kind.
- **One behaviour per test**, named as a sentence about what the user or the engine sees ("a slot ending at
  midnight keeps…"), not about the code ("covers branch 3", "kills mutant 28").
- **Many cases of one rule = one table** (`it.each` / `pytest.mark.parametrize`), not one copy-pasted test per case.
- **Shared helpers live in one place** (`src/__tests__/helpers/`, `tests/conftest.py` or a module-level helper);
  never copy `editor()`, `slot()` or a fixture into another file.
- **Test through the public surface**: rendered output, events, handlers of the template, WebSocket/service calls,
  stored data. Read or set a private `_x` field only when no public way exists, and say why in a comment.
- **Every test must be able to fail**: the expected value is written in the test, never derived from the output
  under test; no test without an assertion; no assertion on a mock's own return value.
- **No real clock**: fake timers / `freezer`; no exact CSS strings or long copied texts unless they are the contract
  (touch target size, contrast token, translation key); compare translated texts through `t()`.
- **Regression test for a reported bug**: in the module's file, named after the visible symptom; keep it even if it
  adds no coverage.
- **Remove a test only with proof**: per-file coverage unchanged and mutation score of the module unchanged.
- **Targeted tests, proportionate size** (owner rule, 2026-11-18): a test is as small as the behaviour it proves.
  A large test, oracle or fixture that adds only a few lines of coverage or a few killed mutants of its own is replaced
  by small tests aimed at exactly those lines or mutants, then removed (example: `legacy_engine.py` +
  `test_latency_equivalence.py`, ~1 200 lines for 5 covered lines, replaced by targeted tests). No differential
  oracle against an old version of the code once that version is gone.

### Dead code (owner rule, 2026-11-18, #64)
- Detection is done by the project's dead-code script, never by memory. Every false positive found updates the
  script (whitelist or rule, with a one-line reason) in the same change.
- Deciding that a hit is dead and removing it is done by an **Opus (or stronger) model**: nothing useful may be
  removed. Dead code goes with its tests (see "Targeted tests, proportionate size").

### Killing mutants (owner rule, 2026-11-18)
- A surviving mutant means a behaviour is not checked. **First find the existing test of that behaviour in the
  module's file and strengthen its assertion** (exact value, both sides of a boundary, the other branch).
- Add a new test only when the behaviour has none; put it in the module's file, named after the behaviour.
- A mutant that changes nothing observable (equivalent mutant, log text, defensive guard that cannot be reached) is
  **not killed by a test**: mark it ignored in the tool with a one-line reason, or simplify the code.
- Never write a test whose only purpose is to execute a line; if the line has no observable effect, question the code.
- After a mutation round: per-file floors kept, the module's mutation score not lower, no new file created.
- **Method for a mutant-killing round** (owner rule, 2026-11-18; measured on `confirm.ts`: blind round 62.55 → 65.54 %,
  round with the survivor list and a check tool 65.54 → 97.38 %):
  1. The coordinator runs Stryker/mutmut (agents in a restricted sandbox, e.g. Codex, cannot: `listen EPERM`) and
     keeps the `mutation.json` of the module.
  2. The agent gets the **exact list of surviving mutants** (id, line, mutator, replacement) and a tool that applies
     one mutant, runs the module's test file and restores the production file
     (`mutant_tool.py` in the coordinator's memory folder, outside the repository). Never ask an agent to kill
     mutants blind.
  3. The agent works group by group, checks only that group's ids, runs the full list at the end, and lists every
     remaining survivor as "equivalent" or "not worth it" with a reason.
  4. The coordinator **remeasures with the real tool** and reads the diff before accepting. An agent's own
     "all killed" is never accepted on its word: on `schedule-dialog.ts` an agent reported 138/138 killed while Stryker
     showed 34, because its checks ran while one test was red (a red test makes every mutant look killed). The
     check tool therefore runs the unmutated tests first and refuses to answer when they fail.
- **Which mutants are not killed by a test**: a mutant on a CSS template (`css\`…\``) is ignored, not pinned with a
  selector assertion (keep only contract tests: 44/48 px targets, contrast tokens). A mutant that survives because a
  condition is redundant (the code gives the same result either way) is a **simplification of the code** in a
  separate `refactor:` change, not a test.
- **Review of a test written to kill mutants** (the coordinator checks, in the diff): no assertion on rendered markup
  with exact whitespace (`aria-pressed=true class=on\n  @click=…`): assert the attribute, the text or the event;
  no more private `_x` accesses than before without a reason; no "does not throw" test; no helper function written
  inside a test file when another file could use it (`helpers/`); `const`, not `let`; the agent keeps the existing
  test names and strengthens them.

### Choosing the Codex model for a mutant-killing round (owner rule, 2026-11-19; provisional)
- **Default: `gpt-6.1-sol` with `model_reasoning_effort="low"`.** Measured on `holiday-section.ts` (same baseline, same
  prompt): same result as `gpt-6-luna` high (93 mutants killed each, no regression), in 5 min instead of 18, 2 M input
  tokens instead of 10 M, and cleaner tests (1 new private read instead of 17, no private write, helper 8 lines instead
  of 25).
- **`gpt-6-luna` with effort `high` when the 5 h quota is tight**, or to keep a second run in parallel: sol used
  about +15 points of the 5 h window for that run against about +10 for luna.
- **Never `gpt-6.1-sol` with effort `high`** (no gain justifies its cost).
- **Provisional**: one file only (99 mutants). Confirm on a harder file (the lines after 1000 of `schedule-dialog.ts`,
  `chart.ts`) before treating it as settled, and change this rule if the result differs.
- **Every run reports**: duration, commands, input/output tokens (fresh and cached) and the 5 h and weekly quota
  use from start to end (`codex_round_report.py`); the coordinator remeasures with Stryker and compares by mutant id.
- **Parallel runs**: at most two, on two **different files**, each in its own worktree copy (the check tool rewrites
  the production file in place, so two runs in one tree contaminate each other).

### Performance tests
- Tests must not depend on the real clock or on thread order: take operation counts at frozen, simulated
  moments (day and night) and register bus listeners in tests as `@callback` (a plain function runs in an
  executor thread and records events in random order). CI runs in UTC at any hour.
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
- Deployment tooling belongs to each maintainer and is not part of this repository. A deployment does not need
  a commit: the tested working tree is what gets deployed.
- Card-only change: call the `weekly_planner.reload` service. Python change: back up Home Assistant, then
  restart it.
- Release: once the maintainer has merged the release PR into `main`, the `Release` workflow (`.github/workflows/release.yml`) builds the card, packs and checks `weekly_planner.zip` (files of `custom_components/weekly_planner/` at the root of the archive, `manifest.json` and the card bundle present), then creates the tag and the GitHub release with the zip attached, from the CHANGELOG section of the version (it fails if manifest, pyproject and package.json versions differ, and skips an existing release). `scripts/release.sh` (dry run; `--apply`) is the manual fallback for a final version. **Final releases are created only from `main`, after the release PR. Beta pre-releases** (version with a suffix, `0.30.0-beta.1`, the same string in the three files; `uv.lock` records it as `0.30.0b1`) **may be dispatched by hand from any branch** (Actions, Release, "Run workflow"): marked pre-release, never latest; notes from their CHANGELOG section, or from `[Unreleased]` when they have none (owner, 2026-11-21). A push on `main` never publishes a pre-release. A deployment tool must build the card (`npm run build`) before copying the integration folder.
- Reports and plans never give effort estimates in human days or weeks; list the steps, dependencies and risks instead.

## Verification before a deploy
- Unit tests are not proof for a UI change. Before deploying a card change, look at it rendered in a real browser
  on a local instance with realistic data (presets without numbers, extra sources, two-column modal, 360 px and
  desktop, light and dark) and keep a screenshot or measured numbers (bounding boxes) as evidence.
- Coupled changes: ship the server part (and its restart) before or together with the card that depends on it;
  never deploy a card that sends a new field to an older server.
- A deploy report ends with "what to look at" (a short list of what to see after a hard refresh).
- Read the clock (`date`) before stating hours or restart windows; never guess it.
- **Token cost (retrospective 2026-11-12)**: run the light chain of `docs/agents/relais.md` ("Cost rules"): only the stages that can find something, `chrono` only when a hot path changed, a fresh agent instead of resuming one above about 100k tokens of context, one correction round per stage, at most two agents in parallel and one `opus`, replies in 8 to 15 lines.
- Agent reports are claims: re-run the checks and, for UI, require rendered evidence before saying it is done.
