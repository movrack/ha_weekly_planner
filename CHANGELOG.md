# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/) (`0.x` until `1.0.0`).

## [Unreleased]

## [0.4.0] - 2026-10-25

### Changed
- The schedule settings use Home Assistant's icon picker (drop-down list); the "Program active" box is gone (the schedule screen has the same switch).
- One display only: one block per schedule. A schedule with one device is a single line named and iconed after the schedule's own settings.

### Removed
- The card option `display` (by device / by schedule); it is ignored if still present.

## [0.3.5] - 2026-10-25

### Changed
- A day opened from the week list is edited alone; "Apply to other days" shows the day chips.

## [0.3.4] - 2026-10-25

### Added
- Tapping a day of the week list opens the schedule on that day: its slot opens for editing, or a new slot for that day when it has none.

## [0.3.3] - 2026-10-25

### Fixed
- Chart: preset temperatures read from Versatile Thermostat `preset_temperatures`; no made-up level when unknown.
- Chart: the planned line uses the legend colour.
- Journal: a new target within the same segment (default or slot edited) is recorded.

### Changed
- The card header button that lists all schedules uses a calendar icon; the gear stays for the schedule settings.

## [0.3.2] - 2026-10-25

### Added
- Collapsible "Week" below each device line: one bar per coming day, with resolved sun times.

## [0.3.1] - 2026-10-25

### Changed
- Opening a slot row scrolls to its top.
- Slot rows use two lines: action and time range, then the days.
- Light actions: brightness, white tone and effect start as small "+" chips and only appear when set; the
  effect is hidden when the light has none, the white tone when it has no colour temperature.
- Day bar: a label is never drawn under the "now" line; hour marks 0 h, 12 h, 24 h at a readable size.
- Day shortcuts are "Tous les jours", "Semaine" and "Week-end"; selected days show a check mark.
- Deletions ask "Oui / Non", with 32 px above the red button; "delete" of a device screen is outlined and last.
- The pause switch says "En marche" or "À l'arrêt"; "Le reste du temps" stays on one line.
- More room between the gear and the close button; the dialog footer lines up with its content; checkboxes
  keep the same size.

## [0.3.0] - 2026-10-25

### Changed
- The card is a planner: no more immediate controls (temperature, modes, open/close, on/off, "More
  options"). One compact line per device with its state, the next scheduled action and a day bar; a
  manual setting is shown with a cross that cancels it; a paused program shows a pause icon.
- New card option `display: device | schedule` (default `device`): one block per device or per program.
- One screen per device or schedule replaces the five editors and the day view: slots listed one per
  row and edited in place, the "rest of the time", a Planned / Measured chart with previous / next day,
  a pause switch with confirmation and a confirmed delete.
- A slot carries its days (chips plus All, Mon-Fri, Weekend); identical slots are grouped for display and
  split per day on save. No more day tabs, day copy or duplicate.
- Same slot form for every device: start (time with -/+15 min or sunrise / sunset), optional end
  (no end = one-shot), days, action. Actions come from the device's own modes, then the Home Assistant
  scenes that contain it, then the common modes.
- The gear (administrators only) opens the owner settings: priority, conditions, devices, setpoints,
  seasons.
- Common modes are edited in the integration options.

### Added
- Light slots can set brightness, effect and colour temperature (`color_temp_kelvin`); the engine checks
  them like the other setpoints.
- The program status carries the next action of each device (`next_actions`).

### Fixed
- The schedule dialog could show the schedule of the previously opened device when the dialog was
  reused for another one.

## [0.2.2] - 2026-10-25

### Fixed
- Simple mode no longer repeats the big buttons as modes (Open / Opened, Close / Closed, On / Off).
- Cover buttons use shutter icons.

## [0.2.1] - 2026-10-25

### Fixed
- The permanent-override guard ignores the planner's own changes, only undoes a fallback to `none` or
  `temporary`, and still hands a zone back to its schedule when it leaves the planner.

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
