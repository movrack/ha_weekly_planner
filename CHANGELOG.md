# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project follows
[Semantic Versioning](https://semver.org/) (`0.x` until `1.0.0`).

## [Unreleased]

### Fixed
- Day chart: the shading of the periods when the device was on was missing under a setting without a number ("Turn off", "Close") while the legend still named it, was only a few pixels high when the planned value sat at the bottom of the axis, and was missing outside any planned setting. It is now a full-height translucent band with a solid strip along the time axis, in one colour that stays visible in light and dark themes, drawn under the curves and at least 3 px wide.
- Day chart: a cover counts as active while it is open or moving (not only during the seconds it moves).
- Day chart legend: "On or open" with a swatch identical to the band (was a grey square named "Active").

### Changed
- Solar time form: the limits are now labelled "Au plus tôt à" / "Au plus tard à" ("Not earlier than" / "Not later than"), with a plain sentence giving the actual time and today's result.
- The random-delay help is one plain sentence ("Chaque jour, démarre au hasard entre 18:00 et 18:15.") instead of repeating the solar time and its limits.
- Card: settings are edited per program in the schedule screen only. The card no longer has a global "Settings" dialog.

### Removed
- Card: the "Settings" button at the top right of the card header, and the blank band it left above the first program. The header now appears only with a title or the vacation chip.

## [0.21.1] - 2026-10-31

### Fixed
- Schedule screen: an overlap error now says the day, the two schedules and their times instead of "Two schedules overlap." (French and English).
- Duplicating a schedule that would end after midnight keeps its length and ends at 24:00 instead of producing an empty copy.
- Card: the "now" clock above the day bars no longer touches the text above a long row.
- Stale spec reference in the gesture helpers.

## [0.21.0] - 2026-10-31

### Added
- Card: a collapsible "Chart" button under the week bars of each device shows the day chart without opening the schedule screen. Collapsed by default (no history is read while collapsed); the choice is remembered in the browser. Hidden when the card option "Show the chart" is off. The new card option `chart_collapsed` (default `true`) sets the initial state when the browser has no saved choice.

- Card YAML: `filter.programs` and `program` accept a program name as well as its ID (`filter: { programs: [Bureau, Lampe du salon] }`). An exact ID wins; otherwise the name matches ignoring case and accents, and every program with that name is shown. Unmatched entries are ignored. The visual editor counts a name as selecting that program and rewrites the selection as IDs on edit. Existing ID lists are unchanged.

### Changed
- Card editor: the chart option is now two switches, "Chart button under each device" (`show_chart`) and "Chart open by default" (`chart_collapsed`, inverted), each with a short explanation. The chart button is called "Today’s chart", uses the chart icon, is 16 px text with a 16 px gap from "Week", and its screen-reader label uses the name shown on the card.
- Card editor, programs to display: each type shows Home Assistant’s icon and the names of its programs; a type with a single program is one row with its switch (no expander); counts read "3 of 5"; a partly selected type says "partly" in text and keeps a crisp switch; turning something off while "All programs" is on explains that new programs will no longer appear automatically, with a one-tap way back.
- Plainer words: "Several devices", "One program only", "Room (optional)" (was "Area"), "Day layout", and a shorter hint. Configuration keys are unchanged.
- Chart legend: "Schedule", "Measured value", "Requested from device", "Active". The vertical axis shows the device’s own unit.
- A setting whose name is a raw service id (for example `vacuum.start`) is shown with Home Assistant’s service name; the stored name is not changed.

### Fixed
- Card editor on a narrow phone (360 px): the "Show all programs again" button wraps inside its notice instead of running off the edge, and a type's name is no longer cut letter by letter; its count ("2 of 3 · partly") now sits under the name so the name and program names get the full width.
- Chart: value labels of markers that are close together (for example "15 15" at the end of the day) no longer overlap.
- The remembered open/closed state of the card chart is now per card and device, not per device only (an older per-device choice is no longer read).
- Adding the card: the code editor now lists every setting the visual editor shows (`schedule_view: bars`, `show_chart: true`, `chart_collapsed: true`, `filter: {}`) instead of only `filter: {}`. Opening an existing card changes nothing; the first change in the visual editor writes the full configuration.

## [0.20.2] - 2026-10-31

### Fixed
- Reloading or unloading the integration no longer logs "Unable to remove unknown job listener" (the one-shot startup listener was removed a second time after it had fired).
- Schedule screen on tablets and computers: opening a slot no longer scrolls the overview out of sight and no longer leaves empty grid cells for the hidden chart and Delete button.

## [0.20.1] - 2026-10-31

### Changed
- Schedule screen on tablets and computers (from 768 px wide): two columns. Left: on/off switch, mode, the rest of the time, slots with Add, Delete. Right: the 7-day overview, then the day chart. The reading and keyboard order is unchanged; phones keep the single column.

### Fixed
- Day chart legend: the "Planned" symbol now shows the same filled dot as the start of each planned step, followed by the line.

## [0.20.0] - 2026-10-31

### Changed
- "Label" is now called "Setting" ("Réglage" in French) everywhere in the interface, README and guides. Keys, API and storage are unchanged.
- Bar panel (edit mode): None, cut and Copy to are above the list of settings; the selected setting card stays below.
- In the bar panel, settings can only be chosen. Creating, renaming, recolouring and per-device values stay in the schedule screen.
- Cutting a slot keeps its setting on the left part; the right part becomes None.
- Schedule screen order: on/off switch, mode, the rest of the time, slots with Add, the 7-day overview, the day chart, then Delete.

## [0.19.1] - 2026-10-31

### Fixed
- Duplicating a solar slot longer than 4 h gives a valid time: a solar offset beyond ±240 minutes becomes the fixed time it resolves to.
- Clearer save error when a time is out of range.
- Escape closes dialogs at any time, and the focus returns to the button that opened them.
- Bars are reachable with Tab; Enter or Space starts editing (or opens the day when read-only).
- Day buttons of the schedule form are at least 44 px wide.
- The card editor selector no longer shows "Continue creating" while "New program" is selected.
- The "press and hold" hint is drawn above the now line.
- Singular and plural of label usage ("1 use", "2 uses").
- Axis hours follow the locale.
- The random-delay text no longer repeats its limits.

### Changed
- Performance: a recompute over 200 entities no longer holds the Home Assistant event loop. About 6x less work (30 ms instead of 180 ms), and it yields at least every 10 ms. Program statuses and the card snapshot are about 4x faster. Behaviour is unchanged.

### Added
- Code coverage reports with floors (Python 85 %; card 49 / 78 / 45 / 49).
- Mutation testing (mutmut and StrykerJS) with a weekly `mutation.yml` workflow; informational only.
- Performance budget tests and `scripts/bench.py`.
- Visual control checklist rewritten, with the 2026-10-31 results.

## [0.19.0] - 2026-10-31

### Added
- Touch hint "Press and hold to edit" on the first three taps on a bar, remembered per device.
- Preview cache shared between cards and dialogs, invalidated when the configuration revision or card version changes.
- Server defaults (`defaults: {reapply, priority}`) in the `weekly_planner/get` and subscribe snapshot; new programs in the card start from them.
- Lovelace resource lifecycle tests (creation, version update, removal).

### Changed
- One default priority (10) everywhere; stored priorities are unchanged, only a missing priority key now resolves to 10 instead of 100.
- Missing-entity repairs are recomputed when programs or labels are saved, duplicated or deleted, when entities are renamed, created or removed, at startup and on reload.
- Program status is computed once per notification and occurrences are shared between the entities of a program (internal).
- `show_week` and `show_advanced` card options are deprecated: still accepted, now ignored.
- Specification: `00:00 → 00:00` is documented as an accepted 24-hour slot (behaviour unchanged).

### Fixed
- The `reapply_default` option now applies: a program saved without `reapply` takes the configured default.

### Removed
- Unused internal `PlannerStore.async_backup` (the pre-migration backup is made by the versioned store).

## [0.18.0] - 2026-10-31

### Changed
- Repository hardening: security policy, Dependabot updates, read-only CI token and actions pinned to commit SHAs.
- Internal backend cleanup (shared websocket edit guard, fewer repeated computations, dead code removed); no behaviour change.
- Rename the random-time option to “Random delay”, move it below the solar shortcuts and show the explicit fixed or solar-relative interval.
- Put New program immediately after the settings selector placeholder, between native separators, while preserving creation drafts.

### Added
- Not before / Not after limits on sunrise and sunset start or end times (for example "sunset, but not before 18:00 and not after 21:00"), set with two optional time fields under the solar choice. Limits survive offset, delay, sunrise/sunset switching, grouping and duplication; dragging a bar to an exact time still replaces the solar time.
- Reject a "Not before" later than "Not after" in the form and on the server.
- Choose the programs displayed by each filtered card in a collapsible checklist; combine the selection with type and area filters without changing program execution.
- French illustrated guide for 0.16.2 with nine current mobile captures, 49 explicitly historical screenshots, local demo provenance and links from both integrator READMEs.
- Track the guide's screenshots under a narrow image-ignore exception and document the screen coverage inventory.

## [0.17.0] - 2026-10-30

### Added
- Optional daily random delays on fixed or solar start/end times, with a configurable window up to 240 minutes and a 15-minute default when enabled. Delays are deterministic per occurrence and stable across recalculation and restart. See [#22](https://github.com/movrack/ha_weekly_planner/issues/22).
- Resolve delayed times consistently in previews and charts, including previous-day tails and actions delayed across midnight; preserve solar latest limits and validate fixed-time duration/overlap envelopes.

## [0.16.4] - 2026-10-30

### Fixed
- Keep Delete available in the schedule form while a label has unsaved changes. Confirm deletion of an existing slot using fresh data and its original mode/day, without saving the label draft; discard a new unsaved slot locally without a server write.
- Disable slot deletion while saving or when editing is forbidden.

## [0.16.3] - 2026-10-30

### Fixed
- Follow renamed entities in mode sources, explicit action targets, scenes and dynamic field sources, advancing affected configuration revisions.
- Accept typed times at any minute while retaining minimum slot duration and drag-step rules.
- Recheck program revisions after asynchronous metadata loading, returning clean conflicts for concurrent saves.
- Index condition dependencies and avoid rebuilding deadlines for unrelated state attributes; share derived websocket snapshots within each notification.
- Invalidate obsolete action generations on segment changes, including empty defaults and unavailable targets, without suppressing valid eagerly started tasks.
- Keep bar edits and Undo attached to their original mode, preserving concurrent changes to restored days.
- Refresh solar previews after runtime mode changes and recover preview/subscription failures without manual reloads.
- Keep week dates consecutive across daylight-saving transitions and refresh current-day charts on a shared visible-page clock.
- Bound chart history caches per connection, avoid oversized min/max argument lists, and replace repeated temporal scans with sorted lookups.

## [0.16.2] - 2026-10-29

### Fixed
- Replace free-text card area filters with existing program areas, preserving missing selections, and expose program area assignment in General settings.
- Explain filtered empty lists and distinguish missing or unavailable history from days without planned actions in charts.

## [0.16.1] - 2026-10-29

### Fixed
- Synchronize native selects after their dynamic options render: active mode, external-state associations and action-source attributes display their actual stored values without emitting edits. Preserve unavailable configured choices.
- Clearly separate immediate mode activation from unapplied settings and explain its effect next to the control.
- Mark additional device selection as optional, explain zero selected commands, and provide a direct schedule setup action after creating a program.
- Collapse external-state associations into a counted section and keep one primary Apply/Create action reachable while scrolling, separate from destructive actions.

## [0.16.0] - 2026-10-29

### Added
- Unified program modes with their own weekly schedules, including Vacation as an ordinary mode. Choose the active mode manually or map an external entity’s raw states to program modes; retain the last mode when the source is unavailable or unmapped.
- Edit inactive modes’ schedules without activating them or reapplying active device actions; capture the edited mode across concurrent external changes and refuse writes to deleted modes. Show the active mode in cards and expose live source status.
- Validate mode associations, reject circular Weekly Planner sources and prevent manual overrides while external control is configured.

### Changed
- Rename Seasons to Modes throughout the UI and Home Assistant selectors. Preserve entity IDs and existing schedules. Rename the legacy global Vacation suspension to All programs paused, preserving its behavior and automations.

## [0.15.1] - 2026-10-29

### Fixed
- Show Home Assistant action descriptions below each offered-action checkbox, with accessible descriptions and mobile wrapping. Use translated descriptions when available; do not invent missing descriptions.

## [0.15.0] - 2026-10-29

### Changed
- New devices start with no service actions selected. Show their action checklist during program creation and when adding a device, with guidance to choose the useful commands. Allow deselecting the last action.
- Use an explicit restriction flag to preserve historical empty-list behavior for existing programs. Keep configured service choices visible when their service/target disappears, including actions on other entities.

## [0.14.0] - 2026-10-29

### Added
- Label service actions can explicitly control another Home Assistant entity, such as pressing a shutter favorite-position button or starting a script. Discover actions and fields from the selected target, show its name in summaries, and retain per-device overrides and service restrictions.

## [0.13.0] - 2026-10-29

### Fixed
- Show a red Disabled badge below the program controls in bar, radial and compact-list views instead of the ambiguous pause icon.

### Added
- Read service field values from a Home Assistant entity state or attribute, including helpers, as an alternative to fixed values. Resolve and convert values when the action executes, without triggering actions when only the source changes.
- Show source selection and current value in the label editor; retain generic entity discovery and per-device action overrides. Refuse unavailable or invalid source values instead of sending an old fixed fallback.

## [0.12.0] - 2026-10-29

### Added
- Allow both radial schedule views in filtered lists, rendering each program with its own resolved device spans; remove disabled choices and the single-program restriction.
- Expand the clicked compact-list program in place into editable daily bars and optional week rows. Keep one program expanded at a time, with an explicit calendar button for schedule editing and an independent enable switch.

## [0.11.3] - 2026-10-29

### Fixed
- Simplify creation to a single name-and-devices form with an explicit Create program action, then select the saved program and return to card display. Show a resume action for retained drafts.
- Keep device management only in the Devices tab for existing programs.
- Make program creation visible beside the card program selector, with a direct edit shortcut. Always show a labelled program selector in program settings, listing every program independently of card filters and retaining existing drafts.

## [0.11.2] - 2026-10-29

### Fixed
- Restore live program-state subscriptions when Home Assistant reattaches a cached card or editor without replacing its hass object. Keep bar, dial, compact list and open schedule switches synchronized.
- Prevent duplicate toggle requests while confirmation or a request is pending; restore the schedule checkbox after cancellation or failure.
- Publish program enable changes to every WebSocket subscriber and the native HA switch during startup stabilization, without executing device actions early.

## [0.11.1] - 2026-10-29

### Fixed
- Put the morning on the inner 12-hour ring with 3/6/9/12 labels, and the afternoon on the outer ring with 15/18/21/24 labels. Keep solar and current-time markers on their corresponding ring.

## [0.11.0] - 2026-10-29

### Added
- Optional concentric 12-hour schedule rings, with morning outside and afternoon inside, alongside the existing 24-hour dial.
- Hourly dial ticks and the same sunrise, sunset and current-time icons and accessible tooltips as the linear view.

### Fixed
- Match linear schedule colours: unscheduled time stays grey regardless of the default action label colour. Split noon-crossing slots without duplicating solar endpoints.

## [0.10.0] - 2026-10-29

### Fixed
- Deploy tested working-tree changes independently of commit status, reporting the base revision, uncommitted state and card checksum. Keep the daytime commit restriction separate from deployment authorization.

### Added
- Undo and redo for unapplied program settings, including devices, conditions, season forms and duplication, retained across editor navigation.
- Keep up to 50 local draft steps, grouping short typing bursts; start a new redo branch after a new edit and reset history after a successful save.
- Keyboard shortcuts outside text fields; text inputs keep their native typing undo. Undo never reverses an action already applied to Home Assistant.

## [0.9.1] - 2026-10-29

### Fixed
- Retain unapplied program drafts when switching programs, card modes or editor tabs, including pending season names.
- Keep background saves attached to their own program without replacing the current selection.
- Make the radial option visible in list mode with guidance to select one program.
- Distinguish active seasons from the season being managed and open the actual Home Assistant profile selector directly.
- Use labelled season actions and one Apply action for season names and shared settings, with explicit scope and success feedback.
- Support keyboard tab navigation and related ARIA labels in both configuration editors.

## [0.9.0] - 2026-10-29

### Added
- Optional single-program 24-hour dial with a text legend and access to schedule editing.
- Compact program list and dashboard enabled switches.
- Notices naming other programs using a selected device and their priorities.
- Season and generic-action guides, configuration usability review.

### Changed
- Select devices before the icon; use Home Assistant icon metadata for the first device without a domain catalogue.
- Put New program after the placeholder, between separators.
- Click dialog titles to expand or reduce desktop width.
- Hide the global label manager in single-program cards; contextual editing stays available.
- Explain season management versus activation through the HA profile entity.

## [0.8.0] - 2026-10-28

### Changed
- Discover card filter types from program entity domains and existing selections, using Home Assistant domain titles. Remove the fixed type catalogue and the implicit thermostat filter for new cards.
- Record generic metadata-driven discovery as a shared contributor and AI-agent rule.
- Move shared program settings (General, Devices, Seasons), creation and duplication into the dashboard card editor. Remove program settings from the schedule screen.
- Apply shared settings explicitly, with fresh data and one retry on revision conflicts, preserving concurrent schedule edits.


### Added
- Show the schematic week above the schedule list, including unsaved slot edits.

### Changed
- Replace action chips with a compact dropdown and display the selected action’s Home Assistant description.
- Clicking the selected “Every day” shortcut clears the day selection in the slot editor.
- Document generic AI assistance in both READMEs and keep project guidance independent of any specific AI tool.
- Add a Git-ignored local project memory for context shared across AI tools.

## [0.7.10] - 2026-10-26

### Fixed
- CI: a valid `setup-uv` version.
- Manifest: the `categories` field is removed (refused by hassfest for custom integrations).

## [0.7.9] - 2026-10-26

### Added
- Integration brand icon.
- Contributor guidelines (`AGENTS.md`).
- Manifest categories (`helpers`, `productivity_information.calendars_todos`).

### Changed
- Repository renamed to `ha_weekly_planner`; documentation links updated.
- CI: GitHub Actions bumped to Node 24 versions.

### Security
- Service data can no longer retarget other devices.
- The list of admin-only domains is widened.
- Size limits added on incoming data.
- The preview date is validated.

## [0.7.8] - 2026-10-26

### Added
- Copy conflicts: each day shows its bar before and after the copy, following the choice (replace or skip).

## [0.7.7] - 2026-10-26

### Added
- Bars: a one-shot (a thin line) shows its label and time in a tooltip on hover or tap; a mouse click still goes to the bar.

## [0.7.6] - 2026-10-26

### Added
- Chart: a sun icon (with its tooltip) marks the actions that follow sunrise or sunset; an action hidden by another slot is still shown, faded.

## [0.7.5] - 2026-10-26

### Fixed
- A time typed in a slot's field can be any minute (e.g. 15:32); the − / + buttons and the bars keep their 15-minute steps.

## [0.7.4] - 2026-10-26

### Changed
- The label name stays visible in a bar crossed by the "now" line: it moves to the wider side of the slot.
- Service fields follow the device: fields it does not support (e.g. temperature range) are hidden, and an optional field that another service sets on its own (the mode in "set temperature") is left out.

### Fixed
- A label could be saved without any value when every field of its service is optional (e.g. "set temperature" without a temperature): the first field is now required.

## [0.7.3] - 2026-10-26

### Added
- « Offered actions » per device (settings, Devices tab): a checklist of the services a device may be given; the action picker and the labels offered follow it, and the server skips a label whose service is not allowed for a device (with a warning). Empty means all.
- Tooltips on the sun and « now » icons of the bars and the chart (sun event, offset and resolved time; hover, keyboard focus, or a 2 s tap), with the same text as accessible name.

### Changed
- The chosen label is shown read-only; one pencil opens one form (name, colour, action, value for this device). Inside a schedule row the form has no buttons of its own: the row's Save saves the label then the row, its Cancel discards both.

### Fixed
- The mode list (e.g. HVAC mode) of an action was empty: fields now get the device context and list the modes of the device.

## [0.7.2] - 2026-10-26

### Changed
- « Rien » on a bar asks for a confirmation before deleting the slot.

## [0.7.1] - 2026-10-26

### Changed
- The chosen label's settings (action, value for this device, pencil) are framed in the label's colour under its name, also in the strip under a bar.

## [0.7.0] - 2026-10-26

### Added
- Edit directly on the card's bars ("Today" and the week): long press (finger) or click (mouse) makes the bar taller with a handle on every boundary; drag to move it (15 min steps, a bubble shows the time, neighbours are never crossed, sun-based boundaries become fixed times); keyboard arrows move the selected handle by 15 min; Escape or a tap outside leaves the edit mode.
- Saved on release for that day only, rebuilt on the current program (one retry on a revision conflict, never a reload request); "Changed · Undo" for about 6 s; neighbouring slots with the same label are merged.
- Tap a slot or a gap: label chips, "None", scissors (cut in the middle) and "Copy to…" (days, with a Replace / Do not copy choice for days where the copy overlaps; existing slots are trimmed or split around the copied range).
- Sun icons (sunrise / sunset) at the boundary or marker of anything that follows the sun, even when the label does not fit.
- A clock icon above the "now" line (bars and chart), outside the clipped bar.
- Chart: the planned value is drawn as a staircase in the colour of each label, the hollow circle only where the value really returns to the default, and the periods where the device was really active are shaded under it (up to now).
- Rename a label in place (pencil in an open slot), with a discreet "Shared" when other programs use it.
- The card reloads the page by itself, once, when the integration serves a newer bundle and nothing is open (`card_version` in the websocket data).

### Changed
- In the week list the day name opens the schedule screen; the bar itself is editable.

## [0.6.5] - 2026-10-26

### Fixed
- A second schedule on the same day no longer replaces the first: tapping a day in the week list now shows that day's slots with an explicit "Add a schedule on <day>" button (new slot starting after the last one) instead of silently editing the existing slot.
- "Add a schedule" in the full screen always creates a new slot on all days; days already busy are dropped with a short note instead of refusing the save.
- Opening another row while editing no longer carries over the previous day-only state (could duplicate or refuse slots).
- Duplicate now keeps the edits made to the original slot.
- Overlaps hidden behind a long slot are detected.
- Saving builds the change on the current program and retries once on a revision mismatch; unrelated concurrent changes never block it. A changed slot shows its new version instead of a "reload" message.

## [0.6.4] - 2026-10-26

### Fixed
- Bars could show an earlier version of a slot after quick successive edits (stale sun-time previews were kept).

## [0.6.3] - 2026-10-26

### Changed
- The week list always shows Monday to Sunday (today in bold), each day at its next occurrence; today's bar stays on top.

## [0.6.2] - 2026-10-26

### Fixed
- Chart: a device coming back after a restart or a reload (same state, no user) is not a manual change.

## [0.6.1] - 2026-10-26

### Fixed
- Chart: the value carried over from the previous day is no longer shown as a manual change; round values on the vertical axis.
- Card: a long next action wraps instead of overflowing; a change a week or more ahead shows its date.
- Label names in French (decimal comma) and from the translated service names; same names allowed across devices; first install without a configuration file.

## [0.6.0] - 2026-10-26

### BREAKING
- **One model for every device.** A slot is a start, an optional end, days and a **label**. A label is shared by all programs and holds one action: a Home Assistant service on the device or a scene (the services offered come from the generic picker). A device can have its own value for a label. "The rest of the time" is a label too, sent when a slot with an end finishes; a slot without an end runs once and is never run again.
- Removed: typed setpoints (temperature, preset, HVAC, position, open/close, on/off, brightness, colour temperature, effect), common modes and their options flow, the "Automatic" light and everything Adaptive Lighting, the Evohome "permanent" option and the Versatile Thermostat special cases (lock, underlying devices, `requested_state`).
- Removed: manual-change detection, overrides, the `weekly_planner.override` and `weekly_planner.resume` services, the "Set by hand" line, state comparison and state-based retries. Retries after a failed service call (1, 2, 5, 10, 15 min, none for a refused value) and the notification are kept.
- Storage version 2: existing programs are converted automatically (typed setpoints and modes become actions, identical actions become one label named after the action, e.g. "18 °C", "Fermer"); a copy of the old file is kept next to it. The default "previous state" no longer exists (logged once).

### Added
- Labels: label picker with inline creation, value for one device, "Labels" screen (rename, recolour, change the action, delete refused while used), colours from a 12-colour palette on the day and week bars and the chart.
- A chart for every device: the Home Assistant history of the day (curve or band of states), the planned actions with their value, a "now" line, a tap opens the Home Assistant history of the day.
- Changes made by hand shown in red on the chart (display only; from the logbook and the Weekly Planner journal).
- Card line: icon, program name, translated state and the next action ("→ label, time").
- Option "send the current action again after a restart or an edit" now sends the action of the current slot or the rest of the time (never a one-shot).

## [0.5.3] - 2026-10-26

### Added
- "Duplicate" in an open slot: a new slot like it, right after it (same length, days and action), ready to adjust.

## [0.5.2] - 2026-10-26

### Fixed
- A common mode named like one of the device's own modes ("Hors-gel") is no longer offered twice; common modes show their effect ("Nuit 16 °C").
- Space between the end choice and its time field.

## [0.5.1] - 2026-10-26

### Changed
- The time field is one control: the 15-minute steps (− / +) are part of the field instead of separate round buttons.

## [0.5.0] - 2026-10-25

### Added
- Any Home Assistant entity can be scheduled: other than climate, cover, light, switch and fan, the actions are the services accepting the entity (e.g. a vacuum: clean area, start, return to base), with their inputs.
- Service actions run once at their start time (no end, no default, never re-applied); failures other than a refused value are retried after 1, 2, 5, 10 and 15 minutes.
- The "Devices" tab accepts entities of any domain.

### Changed
- Hour notches in every day bar and one hour scale above the week list.
- The schedule button of each line has no border and its icon sits on the first line.

### Fixed (visual polish)
- Today's bar and the week bars have the same width (a "Today" label column) and one hour scale 0/6/12/18/24 h; hour lines at 6, 12 and 18 h drawn behind the slots.
- Bar labels are drawn only when they fit entirely.
- The next change says "tomorrow" instead of the weekday.
- Generic actions: technical services (a required free text or raw object) are left out; the device name shared by all labels is dropped ("Start" instead of "Start the vacuum"); long labels wrap instead of being cut.
- The end choice reads "Until…" instead of repeating "End".

## [0.4.1] - 2026-10-25

### Changed
- The "Schedule" button of each line is a calendar icon; the header button listing all schedules uses a list icon.

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
