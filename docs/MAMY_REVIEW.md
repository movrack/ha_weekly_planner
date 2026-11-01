# Dashboard configuration usability review

Review date: 2026-10-29. Perspective: an occasional user who wants to set up a
schedule without knowing Home Assistant internals. "Mamy" is this review role,
not a dependency or a new scheduling model.

This report is based on the frontend and integration sources. It does not claim
that the flows were exercised in a browser or that responsive layouts passed
visual testing. Check the final implementation at 360 × 780 CSS pixels and on a
large screen, in light and dark themes, with touch and keyboard.

## Main findings

| Priority | Difficulty | Why it matters | Suggested change |
|---|---|---|---|
| High | Switching the program being edited remounts its settings editor without a dirty-draft warning. | A user can spend time entering settings and lose them simply by choosing another program. | Retain one draft per program or ask before discarding a dirty draft. Distinguish this from already applied changes. |
| High | The Seasons dropdown chooses what to manage, but does not activate that season. | A user may believe Summer is running while Winter still controls the devices. The schedule screen edits the active season. | Explain the distinction beside the dropdown and provide a visible route to the program's Home Assistant profile entity; consider a separate explicit activation action. |
| High | Applying program settings persists outside the outer Lovelace save/cancel flow. | A user may press Cancel in Home Assistant and expect the program change to disappear. | Keep the shared-settings notice next to Apply and confirm "Program updated everywhere" after success. Avoid a second pair of Save/Cancel buttons. |
| Medium | The Area filter expects free text. | Users know room names, not internal identifiers; a spelling mismatch can hide all programs. Program areas are program metadata, rather than automatically inferred from device rooms. | Use an available-area picker and show an intelligible empty state; first make clear how a program receives its area. |
| Medium | Season actions are icon-only. | Add, copy and rename are hard to distinguish on a touch screen, where hover tooltips are unavailable. | Put short visible labels on important actions, or group them in a clearly named menu. Keep deletion apart from common actions. |
| Medium | Confirming a small season form only changes the program draft. | "OK" can look like a final save, while the main Apply is still required. | Explain "Apply to program to save" or use an unambiguous local action label. |
| Medium | A numeric priority is abstract without its competitors. | Users cannot predict what wins when the same device belongs to multiple programs. | Show the names and priorities of other programs beside that device; explain that the lowest number wins. Do not prevent intentional sharing. |
| Medium | Global label management is available from a one-program card. | A user can reasonably assume the button only changes the displayed program. Shared label changes can affect other programs. | Hide the global management shortcut in the one-program view; retain contextual label editing and its Shared indication. |
| Medium | "Show the chart" does not explain which data is needed. | An empty graph can look like a broken schedule. | Keep a short empty state distinguishing no recorded history from no planned action. |
| Medium | Custom tabs have selected state but incomplete tab relationships and keyboard behavior. | Keyboard and assistive-technology users lack predictable movement between sections. | Add IDs, aria-controls/labelledby, roving tab index and arrow-key navigation. |

## Changes addressed in the current work

The program editor now puts selected devices and the device picker before the
icon. It displays other programs using those devices and their priorities. The
automatic icon uses the first device's exposed Home Assistant icon metadata;
explicitly chosen icons remain customizable. If metadata is missing, a generic
calendar icon remains usable rather than restricting supported device types.

The season explanation should name the actual activation path: the Home Assistant
profile select entity. There is no season activation control in the existing
Weekly Planner schedule dialog. See [Seasons](MODES.md) for the detailed guide.

These improvements should be checked in the final built card; this source review
does not substitute for browser verification.

## Acceptance walkthrough

1. Add a Weekly Planner card with no programs. Find how to create a program
   without changing YAML or guessing an entity ID.
2. Give the program a name, select a device, and verify that device selection
   comes before icon customization. Try a device without an explicit icon.
3. Select a device used by another program. Read which program it belongs to and
   understand that a smaller priority number wins, without being blocked.
4. Modify settings and choose another program. Confirm that a draft is retained
   or an explicit discard warning appears before any work is lost.
5. Apply settings. Confirm the change is identified as shared. Cancel the outer
   Lovelace editor and verify that the already applied program remains changed.
6. Create a Summer season. Distinguish selecting it to manage from activating it.
   Locate the program's Home Assistant profile entity, activate Summer and verify
   that the displayed schedule follows it automatically.
7. Copy a season and change its times. Verify that the source keeps its times,
   while changing a shared label clearly affects both seasons.
8. On a one-program card, find how to edit a slot label without unexpectedly
   opening global label administration.
9. Use every tab and form with the keyboard. Confirm visible focus, appropriate
   labels, readable validation and no accidental activation of a different action.
10. Repeat on a phone in both themes. Confirm touch targets, no horizontal form
    overflow, readable long program/device names, and one clear primary action.

## Source references

- `frontend/src/card-editor.ts`: display settings and shared-program selection.
- `frontend/src/editors/program-editor.ts`: drafts, devices, seasons and Apply.
- `frontend/src/components/dialog.ts`: modal sizing and title interaction.
- `frontend/src/components/schedule-dialog.ts`: active-season schedule editing.
- `frontend/src/weekly-planner-card.ts`: dashboard entry points.
- `custom_components/weekly_planner/select.py`: actual season activation.

## Follow-up fixes in 0.9.1

- Program editors are retained for the lifetime of the Lovelace editor. Switching programs, card content modes or appearance/settings tabs preserves unapplied fields and pending season-name forms. Closing the outer editor still discards unapplied drafts. Applied shared settings remain saved.
- Background save responses update their own editor and do not switch the currently selected program.
- The radial option stays visible in list mode, with a short instruction to select One program.
- Seasons show the saved active season separately from Season to manage. Change active season opens the real HA profile entity using registry metadata; unsaved season changes must be applied first.
- Add, rename, copy and delete have visible labels. The main Apply validates the pending name and saves once; an invalid name does not write anything. A secondary action only discards that pending name form.
- The shared-save scope is stated next to Apply and success confirms the update on every card. Both editors support arrow, Home and End navigation between tabs.

Remaining recommendations: replace the free-text area filter with a well-defined program-area choice and improve chart empty-state guidance. These are not claimed fixed by this patch.

### Remaining recommendations addressed in 0.16.2

- The card area filter now offers existing program areas, with All areas and preservation of configured values whose programs disappeared. General settings expose the program area explicitly; it is independent of Home Assistant device rooms. Empty filtered lists explain which settings to check.
- Charts distinguish no recorded history, future history, unavailable history and no planned action. A history loading failure leaves planned actions visible.
- Earlier fixes remain in place: retained drafts, explicit shared Apply scope, labelled mode actions, separate mode management and immediate activation, competing program priorities, contextual label editing and keyboard tab navigation.

Source review and automated checks cover these changes; no new claim of full keyboard, screen-reader or physical-device validation is made.

### Follow-up verification

Validated against local Home Assistant on 2026-10-29: 360 × 780 light and 1440 px dark; no horizontal overflow or console errors. Browser scenarios verified editor identity, original merge base, unsaved name and pending season form after program/mode/tab switches; invalid names produced zero program writes. A background save kept the selected program unchanged. The active-season shortcut opened the actual HA profile more-info selector, without changing its value. Arrow-key navigation, unapplied-change status, and visible disabled radial choice with guidance were also checked. Python: 85 tests; card: 121 tests; TypeScript and production build pass.
