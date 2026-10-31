# Screen capture inventory

Inventory date: 2026-10-29. Current target: Weekly Planner 0.16.2. S01–S36 are historical 0.10.0 captures.

This source-derived checklist tracks the canonical captures under
`docs/images/guide/`; see the completion record below for actual capture status. Use synthetic local
test programs and friendly device names. Do not expose production addresses,
tokens, personal names or configuration secrets.

Use French for the user guide captures. Default viewport: 360 × 780 CSS pixels in
the light theme. Use a 1440 px desktop viewport for the expanded modal and other
screens that need context. Repeat representative overview, form and chart screens
in dark mode as `-dark.png` variants. When a form is taller than the viewport,
capture the actual scrollable screen and a documented continuation rather than
claiming that invisible controls fit on the phone.

## Canonical captures

| ID | Filename | Screen or state | How to reach it and what to show |
|---|---|---|---|
| S01 | `s01-overview.png` | Multi-program bar overview | A card with no fixed `program`, `schedule_view: bars`, and several local test programs. Show program names, enabled controls, next actions and today's bars. |
| S02 | `s02-one-program.png` | One-program bar card | Set `program` to a real test program ID and `schedule_view: bars`. Show the contextual schedule entry and absence of global label management. |
| S03 | `s03-radial.png` | One-program radial view | Same fixed program, `schedule_view: radial`. Show dial, current time and textual label/time legend. This is a reading view; clicking it opens schedules. |
| S04 | `s04-compact-list.png` | Compact program list | Set `schedule_view: list`. Show several rows, next occurrences and right-hand toggles. |
| S05 | `s05-week-expanded.png` | Week unfolded on the card | On a bar card choose the Week control. Show seven day bars and the day names that open a focused schedule. |
| S06 | `s06-schedules.png` | Whole-week schedule dialog | Choose the program's calendar-edit button, list summary or radial dial. Show the seven-day schematic and grouped schedule rows. |
| S07 | `s07-one-day.png` | Schedule dialog focused on a day | Choose a weekday name beside an unfolded week bar. Show the selected day and Whole week return control. |
| S08 | `s08-slot-form.png` | Add or edit a bounded slot | Choose Add schedule or an existing row. Show fixed start/end controls, selected days, label and the single Save/Cancel pair. |
| S09 | `s09-solar-slot.png` | Solar time editor | In a slot form choose Sunrise or Sunset for a boundary. Show the event, offset and ±15-minute controls. Do not invent a separate advanced solar-bound dialog. |
| S10 | `s10-one-shot.png` | Slot without an end | In a slot form choose No end. Show that the end-time input disappears while days and label remain. |
| S11 | `s11-new-label.png` | New label inside a slot | In the slot's label picker choose New label. Show name, colour, action selector and the parent slot's Save/Cancel pair; no second pair. |
| S12 | `s12-edit-shared-label.png` | Edit an existing shared label | Select a label used in another program and choose its pencil. Show Shared, name, colour and common action. |
| S13 | `s13-device-value.png` | Label override for one device | In the existing-label form choose Value for this device. Show the device action editor and Return to common value when an override exists. |
| S14 | `s14-rest-of-time.png` | Default action editor | In the schedule dialog open The rest of the time. Show compatible labels, Leave as is and the single Save/Cancel pair. |
| S15 | `s15-chart.png` | Schedule chart | Leave the slot form, scroll below the rows/default. Show the date navigation, expected actions and available real local history. For multiple devices show the chart's device selector. |
| S16 | `s16-ha-history.png` | Home Assistant history | Click the chart to open the selected device's HA history. This is HA UI rather than a separate Weekly Planner editor. |
| S17 | `s17-expanded-dialog.png` | Expanded desktop dialog | At desktop width click the schedule dialog title. Show the wider panel; phones already use the full screen. |
| S18 | `s18-bar-edit.png` | Direct bar editing | Mouse-click a bar or long-press on touch. Select an existing segment and show its 44 px handle hit areas/visible handles and editing strip. A drag-in-progress capture may show the time bubble. |
| S19 | `s19-copy-days.png` | Copy a segment to days | With a segment selected under a bar, choose Copy to, then select destination weekdays. Show destination chips and Copy action before executing it. |
| S20 | `s20-copy-conflict.png` | Copy overlap decision | Choose a destination containing an overlapping slot and choose Copy. Show Before/After previews, Replace and Do not copy this day. Capture before applying. |
| S21 | `s21-bar-undo.png` | Saved bar change with undo | Make a harmless local bar edit and release it. Capture Changed · Undo during its six-second display. This is distinct from program-settings history. |
| S24 | `s24-card-filter-settings.png` | Card appearance, filtered mode | Edit the dashboard card → Card appearance → Filtered list. Show dynamic types, optional area, view choices and the visible disabled radial choice with explanation. |
| S25 | `s25-card-one-settings.png` | Card appearance, fixed program | Choose One program, then an existing program. Show the program selector and the available Bars / 24-hour dial / Compact list view choices. |
| S26 | `s26-program-selector.png` | Shared-program selection | Card editor → Program settings in filtered mode. The native dropdown popup is not exported by the browser screenshot: capture the selector closed and explain its option order in the guide (Choose a program, New program, separators, existing programs). |
| S27 | `s27-new-program.png` | New program, General | Choose New program. Show the name, device picker before icon, priority and shared Apply notice. Do not apply an incomplete program for the capture. |
| S28 | `s28-program-general-history.png` | Existing program with local history | Open General, make a harmless unsaved name edit. Show Undo/Redo and a selected device's other-program names/priorities where configured. Demonstrate history locally without applying. |
| S29 | `s29-program-conditions.png` | Program conditions | General → Add a condition, then select a synthetic helper. Show optional attribute, operator and value. This is the actual condition builder, not an obsolete device-specific mode screen. |
| S30 | `s30-device-actions.png` | Per-device offered actions | Program settings → Devices → expand Offered actions on a selected device. Show translated service checkboxes and all/subset count. |
| S31 | `s31-season-management.png` | Manage seasons | Program settings → Seasons. Show Active now, Change active season, Season to manage and text-labelled Add/Rename/Copy/Delete controls. |
| S32 | `s32-season-name-draft.png` | Unsaved season name | Choose Add, Rename or Copy season. Show the name field, discard-name control, main Apply and activation disabled until the season draft is applied. Invalid-name validation can be a variant of this same screen. |
| S33 | `s33-active-season-ha.png` | Actual active-season selector | With season changes applied, choose Change active season. Capture the real HA more-info for the registry-resolved profile select entity, including its available options. |
| S34 | `s34-confirmation.png` | Destructive/pause confirmation | Choose a program's enabled control while it is on, or delete a local draft entity/season. Capture the confirmation before accepting; cancel afterwards. This shared component also serves other confirmations. |
| S35 | `s35-integration-options.png` | Integration-wide settings | HA Settings → Devices & services → Weekly Planner → integration options/configure. Show administrator-only editing, reapply default, unavailable notification delay and condition debounce settings. Do not change production settings to obtain this capture. |
| S36 | `s36-single-instance.png` | Integration already configured | Local HA Add integration → Weekly Planner. Capture the actual singleton notice and close it without submitting or removing an existing integration. Programs are created inside the card, not as extra integrations. |

## Supporting states and coverage boundaries

Capture variants when needed to explain the same screen, rather than numbering
arbitrary combinations as independent pages:

- An empty card or empty label list; a paused program; Vacation indicator.
- Read-only/non-editable schedule state using an appropriate test account or actual
  read-only fixture. Do not imply that the disabled controls have been tested merely
  by setting a CSS style.
- Required-name or missing-device validation in General; invalid season name in S32.
- Action field examples: thermostat presets, a cover position, an exposed favourite
  button, automation enable/disable. These are metadata-driven variants of the
  same action selector, not separate device-specific application screens.
- Undo and Redo enabled states in S28; cross-program draft retention can be
  demonstrated with a short pair of screenshots or verified separately.
- An empty-history chart is a legitimate state. Do not draw invented measured
  history to make S15 look populated.
- Integration first installation has a confirmation-only config flow, with no
  additional field-rich setup screen. S35 covers the substantive integration form.

No current UI provides the retired mode library, manual override, Resume or
Override-until dialogs. Do not copy those pages from old specifications into the
guide. Slot conditions exist in the stored model, but `wp-slot-form` currently
renders times, days and a label, with no slot-condition builder. S29 documents the
available program-condition editor only.

## Source-backed shortcuts for a local capture harness

These describe the component state, not a public API. Prefer real user
interactions for captures that demonstrate interactions. Restrict synthetic state
and writes to the local test instance.

- The card's `setConfig({type: "custom:weekly-planner-card", program: id,
  schedule_view: "bars" | "radial" | "list"})` selects an existing layout; omit
  `program` for the filtered overview. Wait for subscription data and previews.
- The card's `_open({kind: "program", programId: id})` opens the schedule dialog;
  `_open(scope, {weekday: 0, offset: 0})` represents its day-focused route. Supply
  the actual matching weekday/offset rather than claiming an arbitrary date.
- `wp-schedule` is inside the card's shadow root. `_add()` opens a new slot.
  `_rows()` supplies real row objects; `_openRow(row.key, row.program, row.group)`
  opens that slot without fabricating an invalid group. `_cancel()` returns to the
  schedule overview.
- A slot form contains `wp-label-picker` in its shadow root. `_open(false)` is its
  New label route and `_open(true)` edits its current label. `_valueFor` selects
  the real entity's override editor, which is only rendered for an existing label.
- `wp-bar-editor` has an `editing` property; normal user entry also updates the
  card's `_edit` key. A selected existing segment is `{kind: "slot", id: slotId}`.
  `_copyOpen`, `_copyDays` and `_copyGo()` drive the actual copy path. Configure a
  real overlap in a test destination so `_copyGo()` produces its genuine conflict
  model rather than assigning a fake confirmation state.
- The card editor has `_section: "display" | "programs"` and `_editing` containing
  a saved program ID or `"new"`. It retains the actual `wp-program-editor` instances
  per program. Inside a program editor `_tab` is `"general"`, `"entities"` or
  `"seasons"`; `_servicesOpen` is an existing entity ID.
- The active-season entry point looks up `config/entity_registry/list` and opens
  HA more-info by the actual select entity ID. Never guess the entity slug from
  the program name.
- Every render-changing capture should await the relevant component's
  `updateComplete`; action/history/preview loading can require a further idle
  wait. Ensure no loading placeholder obscures the state being documented.

## Capture completion

For each final file, verify that it opens, matches the stated screen, contains no
secrets and is referenced by the user guide. Record any inaccessible state as
pending with its concrete reason; do not mark a source-inferred view as captured.


## Capture provenance and completion record

The capture session uses the actual 0.10.0 application components with synthetic
local Salon programs: Comfort at 20 °C, Reduced at 16 °C, a sunset/07:30 blind
schedule and an 18:00–23:00 light schedule. Native Home Assistant history, select
and integration options views are captured from the local test instance.

No program writes or production changes are performed for the atlas. S21 uses an
in-memory simulated bar-save response to display the actual component's undo
notification; it does not demonstrate a real server write. This distinction is
also disclosed in the French atlas. S26 shows the closed selector because its
native popup cannot be exported by the browser screenshot.

- [x] All 36 canonical images exist and decode successfully.
- [x] The two long-form continuation images exist and decode successfully.
- [x] The 11 supporting dark/empty/paused/vacation/read-only/validation variants exist.
- [x] Every image in `SCREENS.fr.md` resolves to an existing PNG.
- [x] The atlas links to `GUIDE.fr.md` and the user guide exists.

This record is completed after the final capture files are written, rather than
inferring success from component rendering alone.

Final verification: all 49 PNGs (36 canonical, two continuations and 11
supporting variants) have valid PNG chunk checksums and successfully decompress
to their expected pixel dimensions. All 49 are referenced by `SCREENS.fr.md`;
all image paths resolve. `GUIDE.fr.md` exists, and the atlas provides explicit
S01–S36 and variants anchors for its links. This checks artifact integrity and
link coverage; it does not claim a physical-device execution test. The native
profile example is the actual local **Profil Bureau** entity, distinct from the
synthetic Salon program fixtures.

## Version 0.16.2 additions

Nine mobile light fixtures use real components and read-only synthetic drafts on local HA. Action, radial and chart images are isolated fragments. Native selectors use local demo entities. No production or device writes occurred.

| ID | File | Coverage |
|---|---|---|
| S37 | `s37-create-actions.png` | Créer un programme |
| S38 | `s38-modes-manual.png` | Choisir ou préparer un mode |
| S39 | `s39-modes-external.png` | Suivre une entité |
| S40 | `s40-program-area.png` | Zone du programme |
| S41 | `s41-card-filter.png` | Filtres et présentation |
| S42 | `s42-action-target.png` | Appuyer sur un autre bouton |
| S43 | `s43-action-source.png` | Lire une valeur dans une entité |
| S44 | `s44-radial-double.png` | Double cadran de 12 heures |
| S45 | `s45-chart-empty.png` | Graphique sans données |

Not every 0.16.2 state has been recaptured: compact expansion, disabled badges, solar markers, creation success and external mapping continuation still rely on source descriptions and earlier checks. The older 49-image integrity record applies only to the historical set.

Verification after the 0.16.2 additions: all 58 PNGs pass chunk CRC and decompression checks; local guide, README and reference links resolve, including atlas anchors. Nine new images were visually inspected. No full physical-device, screen-reader or theme-matrix validation is claimed.
