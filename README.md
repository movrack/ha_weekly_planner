# Weekly Planner

English | [Français](README.fr.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Quality scale: Bronze (self-declared)](https://img.shields.io/badge/Quality%20scale-Bronze%20(self--declared)-cd7f32.svg)](custom_components/weekly_planner/quality_scale.yaml)

A Home Assistant integration with a bundled Lovelace card for weekly scheduling.
It schedules compatible Home Assistant service calls or scenes through shared
settings, with optional end times and a per-entity default action. Discovery uses
Home Assistant metadata, without a device-brand catalogue.

This README is for Home Assistant integrators. For household users, use the
[illustrated French guide](wiki/GUIDE.fr.md) and [screen atlas](wiki/SCREENS.fr.md).

<a href="wiki/SCREENS.fr.md#s01"><img src="wiki/images/guide/s01-overview.png" width="300" alt="Weekly Planner overview" /></a>
<a href="wiki/SCREENS.fr.md#s03"><img src="wiki/images/guide/s03-radial.png" width="300" alt="Single-program 24-hour dial" /></a>

This project was developed with the assistance of AI agents.

Quality level: self-declared Bronze on the Home Assistant Integration Quality Scale (custom integration, no official badge); see `custom_components/weekly_planner/quality_scale.yaml`.

## Requirements and installation

- Home Assistant **2026.10.0 or later**, as declared in `hacs.json`.
- One integration entry per Home Assistant instance. That entry owns every program.
- Existing HA entities and compatible target services or scenes.
- HA history provides the recorded-data layer of the chart; it is separate from scheduling.

### HACS

1. Add `https://github.com/movrack/ha_weekly_planner` as a custom **Integration** repository.
2. Install Weekly Planner and restart Home Assistant to load its Python code.
3. Open **Settings → Devices & services → Add integration → Weekly Planner**.
4. Add a **Weekly Planner** card to a dashboard. Create programs in its visual editor.

There is no separate card repository. In Lovelace storage mode, the integration
registers and updates its JavaScript module resource automatically. In YAML
resource mode, it loads the module through Home Assistant's extra-JavaScript URL
mechanism. The served module is
`/weekly_planner_static/weekly-planner-card.js?v=<content-hash>`.

Do not add another integration entry to create another program. Use **Program
settings → New program** in the card editor. See [S36](wiki/SCREENS.fr.md#s36).

## Additional chart sources

In the schedule window, open **Chart options** below a device chart to add another Home Assistant entity. A numeric state is drawn as a curve;
other states appear on a named band with checkboxes for the states to highlight. Multiple states can be selected.
Unknown or unavailable observations leave gaps; future periods contain no recorded data. The sources follow chart panning and zoom.

Choices save automatically in Home Assistant for this program and device, shared by its cards and schedule window,
independently of the day or mode. Closing the options panel leaves the curves and bands visible. Removing a source only removes
its display. These options never command an entity and cannot be changed in read-only mode.

Curves with the same unit share one scale. Up to three different units are displayed: the main scale on the left and two on
the right, each coloured to match its first curve. Remove a source with another unit before adding a fourth unit.
Only the additional entity's state is read; its attributes are not selectable as numeric sources.

## Dashboard configuration

The visual editor has two sections:

- **Card appearance** changes this card: title, fixed program or filters, schedule
  view, and chart visibility. Save these changes with the Lovelace editor.
- **Program settings** changes integration data shared by every card displaying
  that program. **Apply to program** persists immediately. Cancelling the outer
  Lovelace editor does not roll it back. This settings section is administrator-only.

Program-setting drafts and their local undo/redo history survive navigation
between tabs and programs within the editor. Closing the editor discards unapplied
drafts. A successful Apply resets history; it cannot undo actions already sent to HA.

### Single program with a radial overview

```yaml
type: custom:weekly-planner-card
program: YOUR_PROGRAM_ID
title: Living room
schedule_view: radial
show_chart: true
```

### Today as a list of times

```yaml
type: custom:weekly-planner-card
program: YOUR_PROGRAM_ID
schedule_view: times
```

The week and the chart under each device stay as bars. An old card bundle that does not know `times` shows bars.

### Several programs in a compact list

```yaml
type: custom:weekly-planner-card
title: Schedules
schedule_view: list
filter:
  types:
    - climate
    - cover
```

| Option | Behavior |
|---|---|
| `type` | `custom:weekly-planner-card`. |
| `program` | Existing internal program ID, or a program name (see below). A nonempty value selects one program instead of applying filters. |
| `filter.types` | Entity domains found in programs. Missing or empty means all domains. Unknown domains remain usable. |
| `filter.area` | Exact match against the program’s `area`, assigned in General settings. The editor offers existing program areas and retains missing selections. Device rooms are not inferred. |
| `filter.programs` | Optional list of program IDs or names (see below), intersected with type/area filters. Missing means all programs, including future ones; `[]` means none. |
| `title` | Optional card title. |
| `schedule_view` | `bars` (default), `list`, `radial` (24-hour dial), `radial_12h` (concentric 12-hour dials), or `times` (**Daily times**: today as a plain list, one row per stretch with its setting, until when, and a “Now” mark; an “Edit the day” button, or a tap on a row, opens today in the schedule window). All work with single-program and filtered cards. |
| `sort` | Order of the list: `type` (default: by type A→Z, then name; types are named by Home Assistant, with a small heading each), `area` (by room A→Z with headings, programs without a room under “Others”), `name` (A→Z) or `custom` (the `order` list). The first device of a program gives its type. |
| `order` | With `sort: custom`: program IDs in the wanted order. Set in the editor (drag handle or up/down buttons). A program missing from the list goes last (by type, then name); an unknown ID is ignored. |
| Time format | No option: the card follows the 12 h or 24 h setting of your Home Assistant profile (12 h shows am/pm, “midnight” and “noon”; the time fields of the slot editor show the chosen time, such as “= 10:30 pm”, under them). |
| `show_chart` | Boolean, default `true`. On: a **Today’s chart** button under each device on the card, and the chart in the schedule window. Off: no button and no chart anywhere on this card. In the editor: “Chart button under each device”. |
| `chart_collapsed` | Boolean, default `true`: the chart under each device starts closed (`false`: starts open). Only matters when `show_chart` is on. In the editor: the switch “Chart open by default” (the inverse). A choice made with the chart button is remembered per browser, per card and per device, and wins afterwards. |

**YAML reference.** Every option of the visual editor can be set in the YAML code editor, with the same
effect, and switching between both keeps all keys (including keys this card does not know). Types:
`title`, `program`, `filter.area` are strings; `filter.types` and `filter.programs` are lists of strings
(a single string is accepted as a one-item list); `schedule_view` is one of `bars`, `list`, `radial`,
`radial_12h`, `times`; `sort` is one of `type`, `area`, `name`, `custom`; `order` is a list of strings; `show_chart` and `chart_collapsed` are booleans. A value of the wrong type is ignored and
the default applies; a configuration that is not a YAML mapping shows a clear error card. In the visual
editor, the type and program switches write `filter.programs` (and only ever widen or, for an empty type,
remove an entry of `filter.types`), so a YAML `filter.types`-only configuration keeps working.
`filter.programs` set by the editor lists the chosen programs: future programs are then not added
automatically; use **All programs** (or omit `filter.programs`) for that.

`filter.programs` and `program` accept a program **name** as well as its ID, e.g.
`filter: { programs: [Bureau, Lampe du salon] }`. An exact ID match wins; otherwise the name is compared
ignoring case, accents and surrounding spaces, and every program with that name is shown (duplicate names
all match). An entry matching nothing is ignored silently. Caveat: renaming a program breaks a name-based
list; the visual editor rewrites the selection as IDs (stable) on the first change.

```yaml
type: custom:weekly-planner-card
title: Schedules                # default: none
schedule_view: bars             # bars | list | radial | radial_12h | times
sort: type                      # type | area | name | custom (default type)
order: []                       # program IDs, used when sort is custom
show_chart: true                # default true
chart_collapsed: true           # default true (collapsed)
filter:                         # ignored when `program` is set
  types: [climate, cover]       # default: all
  area: Living room             # default: all areas
  programs: [ID1, Bureau]       # IDs or names; default: all (future ones included)
```

A program ID is generated by the integration; it is not the display name or a
slug derived from that name. Get it from the program switch's `program_id`
attribute or the `weekly_planner/get` WebSocket response. Replace the example ID
above with a real ID. Entity IDs may also vary with language and renaming.

Set a program’s optional area in **Program settings → General**. This is a name
used to group programs; it is independent of HA device rooms.
The week is expanded interactively.

The dial displays the same resolved schedule data as the bars and opens the
existing editor. The inner 12-hour ring covers midnight–noon and the outer ring noon–midnight.
Both dial variants use the bars’ colours, hourly marks and solar markers.
Click or long-press a dial to edit its arcs with the handles. In a compact list,
clicking a row expands its bar inline. A dialog has an **Expand / collapse** button
(arrows, next to the close cross) to widen it on desktop. Mobile dialogs already occupy
the full screen; a downward swipe on the header closes them.

## Scheduling model and runtime behavior

The UI calls scheduled HA entities “devices”; they are entity IDs, not device
registry IDs. A program may contain several of them.

| Object | Meaning |
|---|---|
| Program | Name, entity list, priority, conditions, reapply policy and one weekly schedule per mode. |
| Setting | Global `{id, name, color, action}` shared across programs. |
| Slot | Start, optional end, days, a setting reference and, optionally, the devices it targets (`entities`; absent = every device of the program, also those added later). |
| Entity default | Optional `default_label` applied outside bounded slots under the ownership rules. |
| Entity override | `label_overrides[label_id]` changes that setting's action for this entity in this program. |
| Mode | The state of the whole house (Home, Away, Vacation…), the same for every program and chosen outside Weekly Planner. Each program has its own weekly schedule for each mode. Vacation is an ordinary mode. Entities, defaults, program conditions and priority are shared. |

Two slots of a program may overlap in time only when they target different
devices. Each device runs only the slots that target it; saving a program
re-sends an action only to the devices whose current setting or target changed.

A service setting action has this shape:

```json
{"kind":"service","service":"climate.set_temperature","data":{"temperature":20}}
```

An action can instead target a different entity explicitly, for example a button
that moves a cover to its own stored favourite position:

```json
{"kind":"service","service":"button.press","target_entity_id":"button.example_favourite"}
```

Under **Advanced options** of the setting action editor, choose **Another entity**. Services and fields are
discovered from that target; `target_entity_id` is the only target override.
The relevant service must also be selected in the program device’s offered actions.

A service field can read a live entity state or attribute instead of a fixed value:

```json
{"kind":"service","service":"cover.set_cover_position","data_sources":{"position":{"entity_id":"input_number.example_position","type":"number"}}}
```

Sources are read when the action runs. Add `attribute` to read an attribute;
without it, the entity’s state is used. Supported source types are `number`,
`boolean`, `string` and `native`. An invalid or unavailable source is reported as
an action error; it is not silently replaced by a fixed value. Source changes do
not themselves trigger a scheduled action.

A scene action uses `{"kind":"scene","scene":"scene.example"}`. The service
target or scene membership must accept the entity. A slot's setting does not need
to apply to every entity in a mixed program; incompatible entities are skipped.

The engine recalculates desired segments and acts on transitions. It does not
continuously enforce observed device state or detect manual overrides. Manual
changes may be shown in the chart; that display does not change engine behavior.

- **Bounded slot:** apply its setting at the start. At its end, apply the eligible
  default or the action of another program taking ownership.
- **One-shot slot:** no end, no end/default event, and no replay after its time has
  passed. A higher-priority running bounded slot can suppress a one-shot.
- **Ownership:** among eligible active bounded slots, the lowest priority number
  wins; the oldest program breaks ties. Without an active bounded slot, the
  highest-priority enabled program containing the entity supplies its optional default.
- **Conditions:** all program conditions must pass for its slots. A false condition
  is not a generic off action; default ownership still matters.
- **Recovery:** startup stabilization is 30 seconds. Reapply can resend the current
  bounded/default action after restart, activation or edits. Missed ends are caught
  up, and past one-shots are not replayed.
- **Time:** schedules are built in HA local time; engine comparisons use UTC.
  Overnight intervals end on the next day only when the end is earlier than the
  start **and before noon**. `24:00` is valid as an end.
- **Solar times:** stored formulas can represent dawn, sunrise, sunset or dusk,
  offsets and bounds. The current visual form exposes sunrise and sunset with offsets and optional earliest/latest limits, under **Advanced options**.

Service choices and field selectors come from HA descriptions and entity
attributes. New devices start with `restrict_services: true` and
`allowed_services: []`: no service action is selected. The creation form asks the
user to choose the offered commands, with descriptions supplied by HA. These
choices can be changed later in **Devices**. A nonempty `allowed_services` list
restricts actions to that list. Empty or missing lists without
`restrict_services` remain unrestricted. Scenes are separate from this filter.
The picker hides unsupported fields and services requiring raw text/object input.
Presets come from entity attributes; no manufacturer-specific modes are synthesized.

### Modes and the mode selector

The mode is global: one optional Home Assistant `input_select` or `select` entity, chosen once in
**Settings → Devices & services → Weekly Planner → Configure → Mode selector**, gives the active mode of
every program. Its options are the modes; a **default mode** (one of the options) is asked right after.
Weekly Planner only reads this entity and never changes it. Leave it empty to have a single mode, the default
mode, which the card does not show.

- **Matching by name**: a program's schedules belong to the mode with the same name as an option.
- **Selector unavailable or in an unknown state**: the last valid mode is kept; with none known yet, the
  default mode applies. A program with no schedules for the active mode applies “the rest of the time”.
- **Renamed option**: if exactly one option is renamed, the schedules follow it in every program (with an
  Undo for a week). Otherwise the old mode stays, marked “no longer exists”, nothing is erased and the schedules screen
  proposes the new options (or deleting the mode). The rename notice (with **Undo** and **OK**)
  is shown in the schedules screen only.
- **Schedules screen**: a **Mode** drop-down at the top, opening on the active mode (marked “Active”); editing another mode never activates it.
  Under **Advanced options**, “Reuse the schedules of another mode” copies its schedules, and
  “Same schedules as” makes the mode follow another one: it then uses the schedules of that mode, which stay
  shared (editing one changes both), until you choose **Stop following** (the mode keeps a copy).
- **Switching mode** = change the selector entity (dashboard, alarm, automation). The suspension of all
  programs is a separate control and wins over the mode.

```yaml
# Switch the house to the Away mode (use your selector entity and an exact option name).
action: input_select.select_option
target:
  entity_id: input_select.house_mode
data:
  option: Away
```

See the [mode reference](wiki/MODES.md) and [native-action examples](wiki/GENERIC_ACTIONS.md).

### Day off

One optional entity for the whole house says whether today is a holiday or day off: a `binary_sensor`,
`input_boolean`, `switch` or `calendar` (for example the Holiday integration), chosen by an administrator in
**Configure → Holiday or day off**. Tick **This entity is “on” on a working day** for a Workday sensor; with
its default options weekends then count as days off too, so prefer a public-holiday calendar (Holiday
integration).
Entities of Weekly Planner and entities a program controls are refused, also when a program or a setting
is saved.

- Each mode can have a day-off setting: the same times as a weekday (a live link to that day) or its own day.
  On a day off it **replaces** the weekday of the active mode; a mode without one keeps its normal day, and
  a mode that follows another uses the day off of its source. Priorities do not change.
- A day off is a whole day, 00:00 to 24:00: next to a day off, schedules stop at midnight. Yesterday and
  tomorrow are always normal days. **Consequence:** a night slot (for example “Closed 21:00 → 07:00”) is cut
  at midnight the night before and the night after a day off, so “the rest of the time” (shutters open,
  day temperature) is sent around 00:00. Give the day off its own schedule that starts at 00:00 with the
  night setting, and make sure the next morning's setting is right.
- Only on/off counts. Unavailable or unknown keeps today’s value; with none known, the day is normal.
  A change waits 30 seconds (a flip back within that time is ignored), then applies like a mode change.
  Just after midnight, programs with a day-off setting wait up to 2 minutes for the entity.
- A missing entity raises a repair issue; the settings are kept and every day is normal.
- Going back to 0.28 or older: restore `.storage/weekly_planner` from the backup taken before the update
  (that version does not know the day off and refuses to save a program that has one).
- **On the card**: when today is a day off that changes a program, a line under “Mode” says “Day off today: Sunday’s schedule” or “Day off today: own schedule” (hidden when the copied day is the real one). Today’s bar, today’s row of the week and the Daily times view show what really runs today; they cannot be edited in place that day (use the **Day off** section of the schedules window; the “Edit the day” button still opens the window). “Next: tomorrow …” ignores a possible day off tomorrow.
- **In the schedules window**: a collapsible **Day off** section, closed by default and hidden when there is no entity, with three choices: *Normal day* (asks before clearing, and before dropping own-day schedules), *Same as:* a weekday, or *My own schedule* (a day edited like the others, per-device schedules allowed; a schedule that passes midnight is cut at 24:00). A mode that follows another shows the day off of its source, read-only.

## Created entities and HA actions

The integration creates one global suspension switch, and one program switch per
program. There is no mode `select`: the mode comes from your selector. Inspect the actual entity registry;
do not assume a generated English entity ID on another installation.

| Entity | Integration behavior |
|---|---|
| Program `switch` | Enable/suspend the program. Attributes: `program_id`, `no_schedule_for_mode`, `current_slots`, `next_change`, `skip_next`, `skip_next_targets`, `next_actions`, and when relevant `paused_until`, `verification` and `holiday` (today's day off replaces the weekday: `{copy: 0..6}` or `{own: true}`). There is no active-mode attribute: read the mode on the selector entity. |
| Global suspension `switch` (all programs) | Suspend all programs and apply the applicable defaults once. |

| Action | Fields | Who can call it |
|---|---|---|
| `weekly_planner.apply_now` | `program_id` (required); returns `sent` and `skipped` (with the reason); also resends the last one-shot of less than 24 h unless a person changed the device since | Anyone; administrators only if `admin_only` is on |
| `weekly_planner.skip_next` | `program_id` (required), `cancel` (optional, default `false`) | Same as `apply_now` |
| `weekly_planner.pause` | `program_id` (required), `days` and/or `hours` (whole numbers, at least one; 1 hour to 365 days in total) | Same as `apply_now` |
| `weekly_planner.resume` | `program_id` (required); cancels a timed pause only (a program switched off with its switch stays off) | Same as `apply_now` |
| `weekly_planner.reload` | none | Administrators |

`program_id` is the `program_id` attribute of the program switch.

```yaml
# Reapply the program's current desired action now.
action: weekly_planner.apply_now
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Skip the next change once; use cancel: true to cancel a pending skip.
action: weekly_planner.skip_next
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Pause a program for 1 hour to 365 days (`days`, `hours`, or both); it resumes by itself (even after a restart).
action: weekly_planner.pause
data:
  program_id: YOUR_PROGRAM_ID
  days: 7
```

```yaml
# Resume a paused program now.
action: weekly_planner.resume
data:
  program_id: YOUR_PROGRAM_ID
```

```yaml
# Reload this integration and register the current card bundle.
action: weekly_planner.reload
```

Program and vacation switches use the usual `switch.turn_on` / `switch.turn_off`
actions. Enabling an `automation.*` entity with a scheduled `automation.turn_on`
action enables its triggers; it is not the same as `automation.trigger`.

## Permissions and integration options

**Settings → Devices & services → Weekly Planner → Configure**:

| Option | Default | Current behavior |
|---|---|---|
| `admin_only` | `false` | Restricts program/setting mutations. Program/vacation switches remain separate controls; choosing the mode is done on the selector entity, not in Weekly Planner. |
| `mode_selector` | none | Optional `input_select` or `select` entity whose state is the active mode, then a default mode among its options. Changing them is reserved to administrators. |
| `holiday_entity`, `holiday_invert` | none, `false` | Optional day-off entity of the house and “on on a working day”. Reserved to administrators; stored with the mode selector, not in the entry options. |
| `reapply_default` | `true` | Starting value of **Reapply** for every new program (card, WebSocket, or a YAML file program without `reapply`). |
| `notify_delay_min` | `30` | Unavailable-entity notification delay, 1–1440 minutes. |
| `debounce_min` | `2` | Condition stability delay, 0–60 minutes. |

Sensitive-action authorization is enforced server-side independently of
`admin_only`; see [actions.py](custom_components/weekly_planner/actions.py).
Shared program settings are only shown to HA administrators. Schedule editing and
contextual setting editing also depend on `can_edit` and storage state. The reload
action requires administrator permission for user-originated calls.

## Data, API and concurrent editors

Programs and settings are integration data, not embedded card YAML. Persistence uses
HA `.storage/weekly_planner`, `.storage/weekly_planner.runtime` and
`.storage/weekly_planner.journal`. Back up HA configuration, including `.storage`,
before a Python upgrade or recovery. Do not hand-edit live storage files.
A backup of the previous files is kept. Configuration corruption
must not silently replace existing programs with an empty configuration.

The card uses `weekly_planner/subscribe` for live state. `card_version` identifies
the served bundle; a mismatched card refreshes automatically once idle.
For another client, the [WebSocket implementation](custom_components/weekly_planner/websocket.py)
is the source of truth:

| Command family | Purpose |
|---|---|
| `weekly_planner/get`, `weekly_planner/subscribe` | Snapshot and live updates. |
| `weekly_planner/program/save`, `program/delete`, `program/set_enabled`, `program/pause`, `program/mode_follow`, `program/holiday` | Program mutations. All suffixes shown are under `weekly_planner/`. `program/holiday` sets (`{copy: 0..6}` or `{day: [...]}`) or clears (`null`) the day off of one mode; a profile saved without `holiday` keeps it. |
| `weekly_planner/mode/set`, `mode/resolve`, `mode/undo_rename`, `mode/dismiss_rename` | Mode answers and rename notices. |
| `weekly_planner/label/save`, `label/delete` | Global setting mutations. |
| `weekly_planner/preview` | Resolve a program's occurrences (for a mode) for a date; `holiday` says whether that date is today's day off. The snapshot carries `holiday_entity`, `holiday_invert` and `holiday_today`. |
| `weekly_planner/journal` | Recorded decisions, up to 14 days. |

Updates to an existing program must carry its current `revision`; stale revisions
are rejected with `conflict`. The card rebuilds edits against fresh data and retries
once. Shared-setting saves merge against their original draft base to preserve
unrelated concurrent schedule changes. A conflict in the same setting is reported
rather than overwriting it. There is no action to change the mode: change the selector entity.

## YAML file

Programs can also be edited as text. Weekly Planner keeps a mirror of its configuration (global
vacation flag, mode selector, settings and programs, not the runtime state) in `/config/www/weekly_planner.yml`.
The `.storage` data stays the source of truth while Home Assistant runs; the file is a readable copy
that you may edit.

```yaml
version: 1
vacation: false
mode_selector: input_select.house_mode   # null = a single mode
default_mode: Home                       # an option of the selector
holiday_entity: binary_sensor.workday    # null = no day off
holiday_invert: true                     # the entity is on on a working day
labels:
  - id: comfort
    name: Comfort
    color: "#ff9800"
    action: {kind: service, service: climate.set_temperature, data: {temperature: 21}}
programs:
  - id: living
    name: Living room
    entities: [{entity_id: climate.living, default_label: comfort, label_overrides: {}}]
    modes:            # the schedules of each mode, keyed by mode name
      Home: {mon: [...], tue: [...], holiday: {copy: sun}}   # 7 day lists; holiday: {copy: <day>} or {day: [...]}
```

- **Edit in the card**: the file is written about 2 seconds after the save (and created at startup
  when missing). Comments and ordering are rewritten each time. Deleting the file recreates it.
- **Edit by hand**: a changed file is read within 30 seconds, at startup and by the
  `weekly_planner.reload` action. It is validated with the same rules as the card; only a fully valid
  file replaces the programs, labels and vacation flag (programs missing from the file are removed).
- **Invalid file** (syntax, unknown setting, overlap, empty file...): nothing changes, the file is
  left as is and a repair issue shows the error. It disappears once the file is valid. If you save in
  the card meanwhile, the invalid file is first kept as `weekly_planner.yml.invalid`.
- A file without `holiday_entity` or `holiday_invert` leaves these settings unchanged. A mode without
  `holiday` has no day-off setting; a mode with `follows` cannot have one.
- Removing the integration deletes the file.

> **Warning:** `/config/www` is served **without authentication** at
> `http://<your-ha>/local/weekly_planner.yml`. The schedules, day-off times included, reveal when the
> house is occupied or empty. Do not expose this address to the internet (reverse proxy, port forwarding).

## For AI agents

An installed release ships its own agent documentation in `custom_components/weekly_planner/`:
[`AI_GUIDE.md`](custom_components/weekly_planner/AI_GUIDE.md) (discover, configure through the YAML file,
verify, cautions), [`example.yml`](custom_components/weekly_planner/example.yml) (annotated, validated by
the tests) and `services.yaml`. [`llms.txt`](llms.txt) indexes them for agents that browse the web.
Agents working on this repository read [`AGENTS.md`](AGENTS.md).

## Uninstalling

1. Open **Settings → Devices & services → Weekly Planner**, then the three-dot menu → **Delete**.
   This removes the switches and deletes the stored programs and the
   `/config/www/weekly_planner.yml` file (with its `.invalid` and `.tmp` leftovers).
2. Remove the **Weekly Planner** card from every dashboard (edit the dashboard, open the card, delete it).
   Without the integration the card shows nothing useful.
3. In **HACS → Integrations → Weekly Planner → ⋮ → Remove**, then restart Home Assistant.

Data location, if you need to check or clean up by hand (Home Assistant stopped, or the integration was
removed from disk before its entry): the programs are in `/config/.storage/weekly_planner` (with `weekly_planner.runtime` and `weekly_planner.journal`) and the YAML
mirror in `/config/www/weekly_planner.yml`. Delete these files to leave nothing behind. Back them up
first if you may reinstall: restoring them brings the programs back.

## Known UI limits and diagnostics

- The area filter matches program metadata, not HA entity areas.
- The slot model supports conditions, but the slot form does not expose a slot-condition
  builder (program conditions are edited in **General**).
- Validation limits: program name 60 characters, setting name 30, mode name 40; 20 modes per
  program, 50 schedules per day, 100 devices per program, 10 conditions per schedule; priority 1–100;
  sun offset −240 to +240 minutes; random delay 0–240 minutes; 100 highlighted states and a 60-character
  alias per chart source.
- History/manual-change display depends on Recorder/logbook data and attribution;
  attribute-only changes have attribution limits.

The chart distinguishes missing/future/unavailable history from no planned action.
History failures do not hide planned actions.

If the card has no rows, inspect its filters and program ID. If an action is
missing, inspect the service target, supported features, entity attributes and
`allowed_services`. Use the program switch attributes, Repairs, notifications and
HA logs for runtime investigation. Repairs raised by the integration:
`missing_entities`, `yaml_invalid`, `modes_now_global` and `mode_option_missing`.
Persistent notifications report an unavailable entity whose action is still waiting,
an action that could not run, and an unreadable configuration file (programs are
paused and nothing is overwritten). Failed service calls use bounded retries;
validation errors are reported without retrying the invalid value.

## Development and deployment

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


### Review agents (optional)

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

Further references: [specification](docs/SPEC.md), [decisions](docs/DECISIONS.md),
[screen inventory](docs/SCREEN_INVENTORY.md), [changelog](CHANGELOG.md).

## License

[MIT](LICENSE)
