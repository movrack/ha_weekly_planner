# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/) (`0.x` until `1.0.0`).

## [Unreleased]

## [0.2.0] - 2026-10-25

### Added
- "Force permanent override" also guards the climates a Versatile Thermostat drives: an Evohome zone that
  falls back to a temporary override or its own schedule is put back in permanent override at once.

## [0.1.1] - 2026-10-25

### Fixed
- Simple mode highlights the mode the device is actually in, also outside slots.
- Versatile Thermostat preset temperatures (`preset_temperatures.<preset>_temp`) shown on the mode selector.

## [0.1.0] - 2026-10-25

First test release, installed by copy on the author's instance before the public release.

### Added
- Weekly programs with several entities, each with its own setpoint, and one switch per program.
- Slots with a start and an end, one-shot slots, slots crossing midnight, `24:00` end, 5-minute steps.
- Solar times (dawn, sunrise, sunset, dusk) with offset and "no earlier / no later" bounds.
- Default state at the end of a slot: a mode, a setpoint, the state before the slot, or nothing.
- Manual override detection and respect, with "Resume" and the `weekly_planner.resume` service.
- Voluntary override from the card ("Override...") and `weekly_planner.override` with a duration or an end time.
- Modes shared per entity type, with per-entity exceptions, starter modes and a modes page.
- Profiles (week layouts) per program, with a `select` entity to switch the active one.
- Priorities between programs, conflict and competing-controller warnings.
- Conditions per program and per slot with debounce; global Vacation switch.
- Re-apply option after restart, activation or edit; missed slot ends caught up after downtime.
- Retries with growing delays, unreachable entity handling, persistent notification after a delay.
- Logbook entries, one per decision; 14-day journal of decided segments.
- Services `apply_now`, `skip_next` and `reload`.
- Support for climate, cover, light, switch, input_boolean, fan, water_heater, media_player, input_number,
  input_select, and one-shot actions (script, scene, HA action).
- Versatile Thermostat support (requested state, lock, configuration warnings).
- Evohome permanent override option and hand-back when an entity leaves a program.
- Adaptive Lighting support ("Automatic" setpoint, manual control for fixed setpoints).
- Daylight saving time handling.
- Built-in `weekly-planner-card` Lovelace card: consultation view, week bars, day editor with draggable
  slot edges, +/-5 min buttons and keyboard, day copy, program/slot/mode dialogs, planned vs actual chart,
  visual editor, English and French.
- Integration options: admin-only editing, re-apply default, notify delay, condition debounce.
- Repairs alerts for removed entities; entity renames followed automatically.
- Versioned storage with backup before migration and read-only start when the file is corrupted.
- Single repository: the integration serves its card and registers the Lovelace resource.
- Simple mode for non-technical users (default): current and wanted temperature, warmer / colder buttons
  (±0.5 °C, hold to repeat), mode selector, override until the next change with an editable duration,
  sentence-based schedule editor, "More options" for advanced settings (`show_advanced`).
- Touch gestures: swipe between days, swipe down to close dialogs, long press on a slot, pinch to zoom.
- Confirmation before every deletion; 360 px layout; standard mdi icons.
- Warnings for other controllers of the same entity (Scheduler, automations, other programs) and risky
  Versatile Thermostat settings.

### Fixed
- Refused setpoints (for example an unknown preset) are no longer re-sent every minute.
- Day view crash on modes without exceptions.
