# Program modes

Weekly Planner organizes schedules in **modes**. Each mode is an independent
weekly schedule: Home, Away, Vacation, Winter or any name chosen by the user.
Vacation is an ordinary mode. Names do not assign dates or automatic behaviour.
One mode is active per program.

Stored `profiles`, profile IDs and Home Assistant entity identities are stable;
renaming a mode does not rename entity IDs.

## Shared settings and independent schedules

Each mode owns its seven lists of slots, including times, days and setting
references. A new mode starts empty; copying creates independent slots that keep
the devices each slot targets. Editing the copied times does not change the source
mode.

Devices, default settings ("The rest of the time"), per-device setting overrides,
allowed services, program conditions, priority and enabled/reapply settings are
shared by the program. Settings are global: copying a mode does not copy its settings.
Changing a shared setting affects every schedule using it.

An empty mode does not mean that a device is off: the shared default can still
apply. Configure the intended action explicitly rather than relying on a name.

## Prepare a mode without activating it

1. Edit the dashboard card, open **Program settings**, and choose the program.
2. Open **Modes**, then add or copy a mode and give it a distinct name.
3. Choose **Apply to program** to save the settings.
4. Select **Mode to edit**, then **Edit this mode’s schedules**.

Editing inactive schedules does not activate that mode or reapply the active
mode's actions. Names must be nonempty, unique within the program and at most
40 characters. The active mode cannot be deleted. Applied settings affect every
card using the program; cancelling the outer card editor does not undo them.

## Choose the active mode

Under **Choose mode**, use either:

- **Manually**: **Active mode — changes immediately** changes the running mode
  without Apply. Draft Undo does not restore the previous active mode.
- **From an entity**: select an existing Home Assistant entity and associate its
  raw states with program modes. For example, associate the household selector's
  Vacation state with this program's Vacation mode. Apply these settings.

No alarm states or selector types are required: any external entity can be used.
When its state is unavailable or has no association, the last valid mode stays
active. Weekly Planner entities cannot be used as sources, to avoid circular
selection. While a program follows an external entity, change that entity rather
than manually overriding its mode here.

The program's Home Assistant `select` entity remains available with its existing
identity. It offers mode names as options. In manual mode, `select.select_option`
can activate a mode; use the actual entity ID and exact option name from your
installation. Update name-based automations if a mode is renamed. There is no
`weekly_planner.set_profile` service.

## Activation, priority and suspension

Activation recalculates the action for the current time. It does not replay all
earlier actions. Reapply settings govern whether the current action is sent;
past one-shot actions are not replayed. Activation does not enable a disabled
program or bypass its conditions. Device sharing retains the usual priority
rules: a lower number wins among eligible programs; modes do not add priority.

**Suspension of all programs** is a separate global control. It suspends scheduling across programs and does
not mean "activate the Vacation mode" or "turn every device off".

Source references: `frontend/src/editors/program-editor.ts`,
`frontend/src/components/schedule-dialog.ts`, and
`custom_components/weekly_planner/{select,engine,resolver}.py`.
