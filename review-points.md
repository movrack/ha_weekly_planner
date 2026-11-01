## Fixed

### Week-wide overlap check rejected saved programs that use no random delay
- file: custom_components/weekly_planner/validation.py:266
- file: custom_components/weekly_planner/validation.py:271
- file: tests/test_random_times.py:110
- source: ticket-fit, correctness, tests reviewers
- severity: medium
- observation: The new cross-day check compared every fixed interval, so a program such as Mon 22:00–07:00 plus Tue 06:00–08:00 saved by 0.16.3 failed with overlapping_slots on any later save, although no delay is configured.
- fix: Keep the historical per-day rule for all slots and apply cross-day overlap only when one of the two intervals has a random delay.

### next_action ignored yesterday's occurrences, so delays crossing midnight were missed
- file: custom_components/weekly_planner/engine.py:235
- source: correctness, tests reviewers
- severity: medium
- observation: `days=range(0, 8)` skipped yesterday, so a 23:50 slot delayed to 00:20 was not reported as the next action at 00:05.
- fix: Start the window at day -1.

### Duplicating a fixed-time slot dropped its random delay
- file: frontend/src/components/schedule-dialog.ts:298
- file: frontend/src/components/schedule-dialog.ts:304
- source: ticket-fit reviewer
- severity: medium
- observation: `shift()` returned only `{ time }`, so the copy lost `random_minutes` although the spec marks duplication as preserving it.
- fix: Spread the original spec into the shifted one.

### Settings selector lost the "Continue creating program" cue
- file: frontend/src/card-editor.ts:145
- source: ticket-fit reviewer
- severity: low
- observation: The New program option always read "New program", so nothing showed that a creation draft was kept.
- fix: Reuse the resume label when a draft exists.

### Delay addition could overflow on extreme preview dates
- file: custom_components/weekly_planner/timeline.py:94
- source: security reviewer
- severity: low
- observation: A preview for 9999-12-31 with a late slot and a delay raised an unhandled OverflowError.
- fix: Keep the configured time when the delayed moment is out of range.

## Ignored

### Random delays are predictable from an unkeyed hash
- file: custom_components/weekly_planner/timeline.py:91
- source: security reviewer
- severity: info
- observation: Anyone who can read the IDs and request previews can compute the delays.
- why: Delays spread load and mimic presence; previews are meant to show them. docs/SPEC.md:19 requires stable, preview-visible draws.

### Preview requests multiplied (8 dates per program, two per dialog)
- file: frontend/src/weekly-planner-card.ts:172
- source: security reviewer
- severity: low
- observation: More websocket calls on every refresh.
- why: Bounded, read-only, and needed for previous-day tails; no measured cost.

### Slot summary still says "Within the next N minutes"
- file: frontend/src/actions.ts:29
- source: ticket-fit, correctness reviewers
- severity: low
- observation: The row summary does not show the explicit interval or the solar latest cap.
- why: The explicit interval belongs to the form; the row has no nominal time to compute it. Follow-up if wanted.

### Tails crossing midnight are not trimmed against next-day slots
- file: custom_components/weekly_planner/resolver.py:83
- source: correctness reviewer
- severity: low
- observation: A solar end with a large offset and delay can land over the next day's fixed slot.
- why: Solar slots are trimmed at runtime by design; validation skips them as before.

### Solar or mixed slots with a delay have no minimum-duration check
- file: custom_components/weekly_planner/validation.py:233
- source: correctness reviewer
- severity: low
- observation: A delayed solar start can pass the end, so the slot is empty that day.
- why: Sun times vary daily and cannot be validated at save; the inverted occurrence is skipped.

### Test gaps: shared draw between engine and preview, dialog two-day fetch, Delete disabled state, overnight solar latest
- file: custom_components/weekly_planner/engine.py:415
- file: frontend/src/components/schedule-dialog.ts:181
- source: tests reviewer
- severity: low
- observation: Several behaviours are covered only indirectly.
- why: Valid gaps, not defects; deferred to keep this change reviewable.

## Assumptions

### Legacy programs keep the per-day overlap rule
- file: custom_components/weekly_planner/validation.py:271
- why: The decision log promises unchanged behaviour without delays, so cross-day checks apply only with a delay. The old rule may hide real week-edge overlaps.
- alternative: Reject every cross-day overlap and migrate stored programs.
- confidence: 0.70

### The delay is a hash of program, mode, slot, date and edge
- file: custom_components/weekly_planner/timeline.py:91
- why: No stored state is needed and restarts agree. Different days may repeat a value by chance.
- alternative: Persist each day's draw in the store.
- confidence: 0.80

### An out-of-range delayed date keeps the configured time
- file: custom_components/weekly_planner/timeline.py:94
- why: Only reachable at the calendar limit, so the choice has no practical effect.
- alternative: Reject the preview request with an error.
- confidence: 0.85
