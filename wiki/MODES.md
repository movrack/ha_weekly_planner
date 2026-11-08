# Modes

A **mode** is the state of the whole house: Home, Away, Vacation, Winter or any
name you like. The mode is the same for every program and is chosen **outside
Weekly Planner**. Each program has its own weekly schedule for each mode.
Vacation is an ordinary mode. A name does not choose a date and does not
suspend anything by itself.

## Choose where the mode comes from

The mode comes from one Home Assistant `input_select` or `select` entity, which
you probably already have (a dashboard button, an alarm panel, an automation).

1. Open **Settings → Devices & services → Weekly Planner → Configure**.
2. Choose the **Mode selector** (optional). Only administrators can do this.
3. Choose the **Default Mode** among the options of that selector.

The options of the selector are the modes. Weekly Planner only reads the
selector; it never changes it. To switch mode, change the selector itself.

Without a selector there is a single mode, the default mode, and the card shows
no mode.

## What is shown

- The card shows the active mode once, at the top: **Mode: Home**. It is text,
  not a button.
- A program that has no schedule for the active mode shows **No schedule for
  this mode**. Its devices then follow "The rest of the time".

## How a mode is matched to its schedules

A program's schedules belong to the mode that has **the same name** as an option
of the selector. Keep the names identical.

When the selector is unavailable, or its state is not one of its options, the
last valid mode stays active. If no valid mode has ever been known, the default
mode is used. The **default mode** also receives the schedules of a program that
had a single week before a selector was chosen.

## Edit the schedules of a mode

Open a program's schedules. The modes are shown as tabs at the top; the screen
opens on the active mode.

- Another mode shows **This mode is not active**. Editing it does not activate it
  and does not resend the actions of the active mode.
- **Copy from another mode** copies the schedules of that mode into the open
  one. If the open mode already has schedules, you are asked to confirm the
  replacement. Settings are global, so only the schedules are copied.
- An empty mode does not mean that a device is off: "The rest of the time" can
  still apply. Choose the action you want explicitly.

## When an option is renamed or removed

- **One option renamed**: if the selector has the same number of options in the
  same order and exactly one name changed, the schedules follow the new name in
  every program. The card says **Renamed from …**, with an **Undo** button for a
  week.
- **Anything else**: Weekly Planner does not guess. The old mode stays with its
  schedules, marked **no option** (it is never used), and nothing is erased. A
  notice on the card and in the schedules screen offers each new option ("Did it
  become…?") or **No, delete it**, and a repair message points to it. Nothing
  changes until you answer.

## Suspension and priority

**Suspension of all programs** is a separate global switch. It wins over the
mode and is not the Vacation mode. A mode never adds priority: among programs
that share a device, the lowest priority number still wins.

A change of mode recalculates the action for the current time and does not
replay earlier actions. It does not enable a disabled program and does not skip
its conditions.

## Automations

There is no Weekly Planner action to change the mode: use the selector.

```yaml
action: input_select.select_option
target:
  entity_id: input_select.house_mode   # your own selector
data:
  option: Away
```

A time-based change (summer / winter) is an automation that changes the
selector.

Source references: `custom_components/weekly_planner/{modes,engine,config_flow}.py`,
`frontend/src/components/{schedule-dialog,mode-notice}.ts`.
