# Weekly Planner — guide for AI agents

For an AI agent that **uses or configures** an installed Weekly Planner (HACS release) on a Home Assistant
instance. It ships with the integration, next to `example.yml`. Developers of this repository read
`AGENTS.md` at the repository root instead.

Weekly Planner schedules Home Assistant service calls (or scenes) on any entity, in weekly programs with
modes (Home, Away, Vacation…) shared by every program. It has no device or brand knowledge: it calls the services that the
target entity accepts.

## 1. Discover what is configured (read-only, safe)
1. **Files**: `/config/www/weekly_planner.yml` is a readable mirror of the whole configuration (labels,
   mode selector, programs, slots, modes). Read it first. If it is missing, the integration is not set up.
2. **Entities** (find the real IDs in the entity registry, never guess them from English names):
   - one `switch` per program (enable / suspend), attributes: `program_id`, active mode, current
     slots, next actions;
   - one global pause `switch`;
   - there is **no** `select` entity of Weekly Planner: the mode is the state of one external selector
     (`mode_selector` in the YAML file).
3. **Mode**: `mode_selector` (an `input_select` or `select` entity, or `null` = a single mode) and
   `default_mode` (one of its options) are set once for the whole house, in the YAML file or in
   **Settings → Devices & services → Weekly Planner → Configure**. The options of the selector are the modes.
   **To switch mode, change that external selector** (`input_select.select_option` or
   `select.select_option`): Weekly Planner has no service or command for it and only reads the selector.
   If the selector is unavailable the last valid mode is kept, then the default mode applies.
4. **Actions** (`weekly_planner.*`, fields in `services.yaml` in this folder):
   - `apply_now` (`program_id`) — reapply the program's desired state now;
   - `skip_next` (`program_id`, `cancel`) — skip the next change once;
   - `pause` (`program_id`, `days`: 1 to 365) — suspend a program, it resumes by itself; `resume` (`program_id`) — resume now;
   - `reload` — reload the integration and re-read the YAML file.
5. **Why did something (not) happen?** Program switch attributes, Repairs (missing entities, invalid
   YAML), the logbook and the Home Assistant log (`custom_components.weekly_planner`).

## 2. Configure by editing the YAML file (recommended for agents)
1. Copy `example.yml` (this folder) as a starting point; it is validated by the test suite.
2. Edit `/config/www/weekly_planner.yml`: add a **label** (name, colour, action), then a **program**
   (devices, `modes:` keyed by mode name, each with 7 day lists of slots). Keep existing `id` values and the exact mode names (a mode is matched to a selector option by its name; the first mode of a program is the one used when there is no selector); programs missing from the file
   are **removed**, so never rewrite the file from a partial view.
3. Save. The change is read within 30 seconds, or call `weekly_planner.reload`.
4. **Verify**: no repair issue `yaml_invalid`; the program switch exists with the expected attributes;
   `weekly_planner.apply_now` then check the device state. An invalid file changes nothing and the
   previous state keeps running.
5. A save made in the card rewrites the file (comments are lost). Back it up before big edits.

Rules the validator enforces (same as the card): a slot has `id`, `start`, optional `end` (no `end` =
one-shot), `label`; times are `{time: "HH:MM"}` (end up to `24:00`) or solar
`{sun: sunrise|sunset, offset: minutes, earliest: "HH:MM", latest: "HH:MM"}`; slots of a day must not
overlap (unless scoped to different devices); every label referenced must exist; a label action is
`{kind: service, service: "domain.service", data: {...}}` or `{kind: scene, scene: "scene.x"}`; the
service must be accepted by the target entity.

## 3. Other interfaces
- **Websocket API** `weekly_planner/*` (the card uses it): `get`, `subscribe`, program and label
  save/delete with an optimistic `revision`. Prefer the YAML file for agents.
- **Dashboard**: the Lovelace card `custom:weekly-planner-card`; see the README "Dashboard
  configuration".

## 4. Cautions
- Programs act on real devices (heating, shutters). Test on one harmless entity first.
- `/config/www` is public (`/local/weekly_planner.yml`, no authentication) and the schedules reveal when
  the house is empty: never share or paste that address.
- Do not edit `.storage/weekly_planner`. Do not restart Home Assistant around sunset or morning/evening
  windows: pending random delays are cancelled.

## 5. More documentation
- README (installation, model, actions, YAML): https://github.com/movrack/ha_weekly_planner#readme
- User guide (French, with screenshots): https://github.com/movrack/ha_weekly_planner/blob/main/wiki/GUIDE.fr.md
- Modes: https://github.com/movrack/ha_weekly_planner/blob/main/wiki/MODES.md
- Generic actions (any service): https://github.com/movrack/ha_weekly_planner/blob/main/wiki/GENERIC_ACTIONS.md
- Index for agents: https://raw.githubusercontent.com/movrack/ha_weekly_planner/main/llms.txt
