# Weekly Planner

English | [Français](README.fr.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A weekly time-slot planner for Home Assistant. Program thermostats, covers, lights, plugs and fans with
colored weekly schedules, shared modes and sensible handling of manual changes. One install gives you
both the engine (integration) and the card.

<!-- screenshot: docs/images/card-overview.png — the card in consultation mode (week bars + current mode) -->

## Why Weekly Planner?

- **Slots have a start and an end.** When a slot ends, the entity returns to its **default state**
  (a mode, the state it had before, or nothing).
- **Manual changes are respected.** If you touch a device during a slot, Weekly Planner notices, leaves it
  alone and shows an override badge ("Resume" puts the schedule back). The slot end still applies.
- **Shared modes per entity type.** "Comfort", "Eco", "Closed"... are defined once per type and reused by
  every program, with exceptions per entity.
- **Profiles.** Several week layouts per program (Winter, Summer, Remote work) and a `select` to switch.
- **Solar times with bounds.** Dawn, sunrise, sunset, dusk, plus an offset, "no earlier than" and
  "no later than".
- **Priorities and conditions.** Several programs can target the same entity; the highest priority wins
  and the other takes over when it ends. Conditions work per program and per slot.
- **Vacation switch.** One switch suspends every program and applies the defaults.
- **Survives restarts.** The wanted state is recalculated, overrides are remembered, missed slot ends are
  caught up.
- **Planned vs actual chart.** A 24 h chart per entity shows the planned setpoint, what was applied and
  the measurement.
- **One installation.** The integration ships its own card: no second HACS repository.

## Installation

1. In HACS, open the menu > **Custom repositories**.
2. Add `https://github.com/movrack/ha_Weekly_planner` with category **Integration**.
3. Install **Weekly Planner** and restart Home Assistant.
4. Go to **Settings > Devices & services > Add integration**, and add **Weekly Planner**
   (a single instance is allowed).

The card is registered automatically as a Lovelace resource (storage mode). In YAML mode it is added as an
extra JS module.

<!-- screenshot: docs/images/install-config-flow.png — adding the integration -->

## Adding the card

Edit a dashboard, add a card, pick **Weekly Planner**, or use YAML.

One fixed program:

```yaml
type: custom:weekly-planner-card
program: office-heating
title: Office
show_chart: true
```

A filtered list of programs (with program creation from the card):

```yaml
type: custom:weekly-planner-card
filter:
  types: [climate]
  area: office
title: Heating
```

| Option | Description |
|---|---|
| `program` | Id of a single program to show. |
| `filter.types` | Entity types to list (`climate`, `cover`, `light`...). |
| `filter.area` | Only programs that contain entities of this area. |
| `title` | Card title. |
| `show_chart` | Show the planned/measured chart in the schedule screen (default on). |

The card is a planner, not a remote control: one compact line per device (state, next scheduled action,
day bar) and a **Schedule** button. The schedule screen lists the slots one per row (tap to edit in place:
start, optional end, days, action), the rest of the time, a planned/measured chart, a pause switch and a
confirmed delete. The gear (administrators only) opens the owner settings. The common modes (Night,
Comfort...) are edited in the integration options.

<!-- screenshot: docs/images/card-day-editor.png — the day editor with draggable slot edges -->
<!-- screenshot: docs/images/card-chart.png — the planned/actual chart -->

## Concepts

- **Program**: a named set of entities plus a week of slots and settings. One switch per program.
- **Slot**: an interval `[start, end)` of a day (or a one-shot slot: start only). It carries an action per
  entity type (a mode) or per entity (a setpoint).
- **Mode**: a named, colored setpoint shared by an entity type (a common value plus per-entity exceptions).
- **Setpoint**: the concrete action on an entity (`preset = eco`, `position = 30`, a scene...).
- **Default state**: what an entity receives when a slot ends: a mode/setpoint, the state it had before the
  slot, or nothing.
- **Override**: a change to an entity that does not come from Weekly Planner. It is kept until the next
  transition of the winning program.
- **Profile**: one of several week layouts of a program. Entities, defaults, conditions and priority are
  shared.
- **Priority**: when several active programs target the same entity, the lowest number wins.

Rules in short: the engine does not replay events; it recalculates the wanted state and acts only at
transitions (slot start or end, condition change, program on/off, vacation, edit). Then it leaves the
entity alone.

## Entities created

| Entity | Role |
|---|---|
| `switch.weekly_planner_<program>` | Turns a program on or off. Attributes: current mode, current slot, next change, entities in override, conflicts, alerts. |
| `switch.weekly_planner_vacation` | Suspends all programs and applies their defaults. Entity ids follow the instance language (French: `switch.weekly_planner_vacances`). |
| `select.weekly_planner_profile_<program>` | Chooses the active profile (French: `select.weekly_planner_profil_<program>`). |

Entity ids follow the entity names, so they depend on the language of your account when created.

## Services

```yaml
# Cancel overrides and apply the schedule again (entities or a whole program)
action: weekly_planner.resume
data:
  program_id: office-heating
```

```yaml
# Apply a setpoint for a while, then return to the schedule
action: weekly_planner.override
data:
  entity_id: climate.office
  setpoint: {kind: preset, preset: boost}
  duration: "02:00:00"      # or: until: "2026-10-26 18:00:00"
```

```yaml
# Apply what the program wants right now (entities without override)
action: weekly_planner.apply_now
data:
  program_id: office-heating
```

```yaml
# Skip the next change of a program (once); add cancel: true to cancel the skip
action: weekly_planner.skip_next
data:
  program_id: office-heating
```

```yaml
action: weekly_planner.reload
```

## Integration options

Settings > Devices & services > Weekly Planner > **Configure**.

| Option | Default | Meaning |
|---|---|---|
| Only administrators can edit | off | Locks program and mode editing. Reading, switches, Resume, Override and profile change stay open. Scripts, HA actions, advanced values and sensitive domains (`homeassistant`, `hassio`, `alarm_control_panel`, `lock`) are always admin-only. |
| Re-apply after a restart or a change | on | Default for new programs: apply the current slot again at startup, activation or edit. |
| Notify delay (min) | 30 | Persistent notification if the wanted state is not reached after this time. |
| Condition debounce (min) | 2 | A condition must hold this long before it starts or ends a slot. |

## Compatibility

- **Versatile Thermostat >= 10.6**: schedule the VT entity itself, never its underlying devices. Disable its
  automatic manual-override return (`manual_override_duration_min` = 0), otherwise it undoes your overrides.
  The card warns you when you add a VT. Window, safety and load-shedding changes are not treated as overrides.
- **Evohome**: option "permanent override" (preset `permanent`, then the setpoint). When an entity leaves
  Weekly Planner, it goes back to following the Evohome program. Under a VT, keep the zone's internal
  Evohome program empty or flat.
- **Adaptive Lighting >= 1.32**: the "Automatic" light setpoint turns on an Adaptive Lighting switch (or runs a
  script). For a fixed setpoint on a light covered by Adaptive Lighting, Weekly Planner sets manual control
  for the slot and gives the light back at the end.

## Supported entity types and setpoints

| Type | Setpoints |
|---|---|
| `climate` | temperature, preset, HVAC mode, off |
| `cover` | open, close, position %, tilt %, "favorite" (adjustable position) |
| `light` | on/off, brightness, color/white, effect, **Automatic** |
| `switch`, `input_boolean` | on, off |
| `fan` | on/off, speed %, preset |
| `water_heater` | operation mode, temperature |
| `media_player` | on/off, volume, source, play media |
| `input_number`, `input_select` | value, option |
| Any / other | HA action, scene, script (one-shot actions), advanced value |

Choices (presets, HVAC modes, effects) are read from the entity and validated on save.
One-shot actions (script, scene, action) are never re-applied after a restart.

## FAQ

**What happens when Home Assistant restarts?**
After a 30 s settling time, the wanted state is recalculated. With "re-apply" on, the current slot is applied
to entities that are not in override; with it off, nothing is sent until the next transition. Overrides are
remembered, a slot end missed while HA was down is caught up, and one-shot actions are not replayed.

**What if I change a device by hand?**
It is recorded as an override: Weekly Planner does not fight you. It lasts until the slot ends (then the
default state applies), or until you press **Resume**.

**What if a device is unreachable?**
The action waits. When the device is back, the wanted state is recalculated (the slot start if still inside,
otherwise the default). After the notify delay, a persistent notification appears, removed once the target is
reached.

**What about daylight saving time?**
Hours are built in local time and normalized through UTC. A non-existent hour moves forward (02:30 becomes
03:30), an ambiguous hour runs once, a slot entirely inside the skipped hour is ignored that day.

**Can a slot cross midnight?**
Yes (22:00 to 06:00), and it belongs to the day it starts. `24:00` is allowed as an end.

## Development

```bash
uv sync --group test                      # Python 3.14 environment
uv run pytest                             # tests
cd frontend && npm install && npm run build   # builds custom_components/weekly_planner/frontend/weekly-planner-card.js
scripts/dev_ha.sh                         # local Home Assistant on http://localhost:8124
python3 scripts/dev_onboard.py            # onboard the local instance (user dev / dev) and add the integration
```

Use `npm run watch` for rebuilds and `npm run typecheck` for type checks. The full specification (French) is in
[docs/SPEC.md](docs/SPEC.md); manual procedures are in [docs/test-reel.md](docs/test-reel.md) and
[docs/controle-visuel.md](docs/controle-visuel.md).

## License

[MIT](LICENSE)
