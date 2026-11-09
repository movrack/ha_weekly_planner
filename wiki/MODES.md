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
  not a button. The line appears as soon as a selector is set, has options and the
  active mode is known; it is hidden without a selector or before any valid mode is known.
- A program that has no schedule for the active mode shows **No schedule for
  this mode**. Its devices then follow "The rest of the time".

## A mode that follows another mode

In the schedules screen, under **Advanced options**, **Same schedules as** (choice **None** to follow nothing) lets a mode use, for this program, the schedules of another mode (for
example "House leave" follows "Home"). It is not a copy: a change made in "Home" is seen at once in "House leave".
Only a mode that follows nobody can be followed, and a followed mode cannot follow. A mode that follows has no
schedules of its own; choosing one asks for confirmation when the mode already has some.

To change a mode that follows, the screen asks: **Edit {source}** (also applies to this mode) or **Stop following**
(the mode gets a copy of the schedules and becomes independent). If the followed mode is deleted, the modes that
followed it keep a copy of its last schedules and a notice says so. In the file: `modes: {House leave: {follows: Home}}`.

## How a mode is matched to its schedules

A program's schedules belong to the mode that has **the same name** as an option
of the selector. Keep the names identical.

When the selector is unavailable, or its state is not one of its options, the
last valid mode stays active. If no valid mode has ever been known, the default
mode is used. The **default mode** also receives the schedules of a program that
had a single week before a selector was chosen.

## Edit the schedules of a mode

Open a program's schedules. The modes are in a **Mode** drop-down at the top (no tabs); the screen
opens on the active mode, marked “(Active)”. A mode that is no longer an option of the selector is
marked “(no longer exists)”, and a mode that follows another one “(same schedules as X)”.

- Another mode shows **This mode is not active**. Editing it does not activate it
  and does not resend the actions of the active mode.
- Under **Advanced options**, **Reuse the schedules of another mode** copies the schedules of that mode into the open
  one. The button only appears when another mode has schedules, you can edit, and the open mode does not follow another mode. If the open mode already has schedules, you are asked to confirm the
  replacement. Settings are global, so only the schedules are copied.
- An empty mode does not mean that a device is off: "The rest of the time" can
  still apply. Choose the action you want explicitly.

## When an option is renamed or removed

- **One option renamed**: if the selector has the same number of options in the
  same order and exactly one name changed, the schedules follow the new name in
  every program. The schedules screen (not the card) says **The mode X was renamed to Y**, with an **Undo** button for a
  week and an **OK** button that dismisses the notice.
- **Anything else**: Weekly Planner does not guess. The old mode stays with its
  schedules, marked **no longer exists** (it is never used), and nothing is erased. A
  notice in the schedules screen offers each new option ("Did it
  become…?") or **Delete its schedules**, and a repair message (“a mode matches no option”) points to it. Nothing
  changes until you answer.

## Suspension and priority

**Suspension of all programs** is a separate global switch, an entity of the integration
(**Settings → Devices & services → Weekly Planner**); the card only shows the chip “All programs suspended”. It wins over the
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
selector. Ready-to-use examples (workday sensor, school holidays, away when nobody
is home) are in the [Recettes pour les modes](Recettes-pour-les-modes) (French).

Source references: `custom_components/weekly_planner/{modes,engine,config_flow}.py`,
`frontend/src/components/{schedule-dialog,mode-notice}.ts`.
