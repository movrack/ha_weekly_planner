# Weekly Planner

English | [Français](README.fr.md)

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A weekly time-slot planner for Home Assistant. Program any entity (thermostats, covers, lights, plugs, vacuums...)
with colored weekly schedules built from shared labels. One install gives you both the engine
(integration) and the card.

<!-- screenshot: docs/images/card-overview.png — the card in consultation mode (week bars + current mode) -->

## Why Weekly Planner?

- **One way of working for every device.** A slot has a start, an optional end, days and a **label**. A label is
  a name and a color for an action: any Home Assistant service accepting the device (`climate.set_temperature`,
  `cover.close_cover`, `vacuum.start`...) or a scene. "Comfort" = 19 °C, defined once, used in every slot.
- **Labels are shared.** Change what "Comfort" does and every slot using it follows. A device can have its own
  value for a label (19 °C everywhere, 22 °C in the bathroom).
- **"The rest of the time".** Each device can have a label applied when a slot with an end finishes. A slot without
  an end is a one-shot action: it runs once, at its start, and is never run again.
- **Profiles.** Several week layouts per program (Winter, Summer, Remote work) and a `select` to switch.
- **Solar times with bounds.** Dawn, sunrise, sunset, dusk, plus an offset, "no earlier than" and "no later than".
- **Priorities and conditions.** Several programs can target the same entity; the highest priority wins and
  the other takes over when it ends. Conditions work per program and per slot.
- **Vacation switch.** One switch suspends every program and applies the defaults.
- **Survives restarts.** Optionally the action in progress is sent again after a restart or an edit
  (never the one-shots); missed slot ends are caught up.
- **History chart for every device.** The Home Assistant history of the day (a curve for a number, a band of
  states otherwise), the planned actions, "now", and the changes made by hand in red. A tap opens the Home
  Assistant history.
- **One installation.** The integration ships its own card: no second HACS repository.

> **0.6.0 is a breaking change.** Typed setpoints, common modes, manual-change detection ("overrides") and the
> Evohome / Adaptive Lighting / Versatile Thermostat special cases are gone. Stored programs are converted
> automatically (a backup of the old file is kept next to it). See the [changelog](CHANGELOG.md).

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
| `show_chart` | Show the history chart in the schedule screen (default on). |

The card is a planner, not a remote control: one line per device (icon, program name, state, the next
scheduled action and time) with its day bar, the week and a **Schedule** button. The schedule screen lists the
slots one per row (tap to edit in place: start, optional end, days, label), "The rest of the time", the chart of
the day, a pause switch and a confirmed delete. The gear (administrators only) opens the program settings
(name, icon, priority, conditions, "send the current action again after a restart", devices, seasons); the
list button of the card header opens the **Labels** screen.

<!-- screenshot: docs/images/card-overview.png — the card -->
<!-- screenshot: docs/images/card-chart.png — the history chart -->

## Concepts

- **Program**: a named set of entities plus a week of slots and settings. One switch per program.
- **Slot**: an interval `[start, end)` of a day, or a one-shot (start only), with a label.
- **Label**: shared by every program: a name, a color and an action. The action is a service call on the
  device (`{"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 19}}`) or a scene.
  A label is offered for a device when its service accepts it (or the scene contains it); a device that does
  not suit a slot's label is skipped for that slot and the card warns you.
- **Value for a device**: a device's own action for a label.
- **The rest of the time**: the label a device receives when a slot with an end finishes (or nothing).
- **Profile**: one of several week layouts of a program. Entities, defaults, conditions and priority are shared.
- **Priority**: when several active programs target the same entity, the lowest number wins.

Rules in short: the engine does not replay events; it recalculates the wanted action and acts only at
transitions (slot start or end, condition change, program on/off, vacation, edit). It does not watch what a
device does afterwards: a change made by hand is neither detected nor corrected (the chart only shows it).

## Entities created

| Entity | Role |
|---|---|
| `switch.weekly_planner_<program>` | Turns a program on or off. Attributes: current slots, next change, next actions, skip, active profile. |
| `switch.weekly_planner_vacation` | Suspends all programs and applies their defaults. Entity ids follow the instance language (French: `switch.weekly_planner_vacances`). |
| `select.weekly_planner_profile_<program>` | Chooses the active profile (French: `select.weekly_planner_profil_<program>`). |

Entity ids follow the entity names, so they depend on the language of your account when created.

## Services

```yaml
# Send now what the program wants for its entities
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
| Only administrators can edit | off | Locks program and label editing. Reading, switches and profile change stay open. Actions on sensitive domains (`homeassistant`, `hassio`, `alarm_control_panel`, `lock`) are always admin-only. |
| Re-apply after a restart or a change | on | Default for new programs: send the current action again at startup, activation or edit (never a one-shot). |
| Notify delay (min) | 30 | Persistent notification if a device is still unavailable after this time. |
| Condition debounce (min) | 2 | A condition must hold this long before it starts or ends a slot. |

## Supported entities

Every entity. The actions offered for a device are the Home Assistant services whose target accepts it
(with their translated names and input fields) and the scenes that contain it; technical services (a required
free text or raw object) are hidden. If a call fails (other than a value refused by the device) it is retried
after 1, 2, 5, 10 and 15 minutes, then a persistent notification appears. A refused value gives a notification
at once. Weekly Planner knows nothing special about Versatile Thermostat, Evohome or Adaptive Lighting: they
are scheduled like any other entity.

## FAQ

**What happens when Home Assistant restarts?**
After a 30 s settling time, the wanted action is recalculated. With "send the current action again" on, the action
of the current slot (or "the rest of the time") is sent; with it off, nothing is sent until the next transition.
A slot end missed while HA was down is caught up; one-shots are not replayed.

**What if I change a device by hand?**
Nothing: Weekly Planner does not detect it. The next slot start or end sends its action as planned. The chart
shows the changes made by a person in red (from the logbook; a change that only touches attributes, such as a
thermostat setpoint, is only guessed from the difference with what Weekly Planner sent).

**What if a device is unreachable?**
The action waits. When the device is back, the wanted action is recalculated and sent. After the notify delay,
a persistent notification appears.

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
