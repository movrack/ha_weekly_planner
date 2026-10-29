# Seasons

A season is a named version of a program's weekly schedule. For example, the same
room can have a **Winter** week and a **Summer** week. The name is only a name:
Weekly Planner does not assign dates, temperatures or automatic switching rules to
it. A program uses one season at a time.

In the implementation and API, a season is called a `profile`.

## What changes with a season

Each season owns its seven lists of slots: their times, days, labels and slot
conditions. A new season starts with an empty week; copying a season starts with
independent copies of its slots. Changing copied times does not change the source.

These settings belong to the program and are shared by all its seasons:

- Devices, allowed actions and each device's default label ("The rest of the time").
- Label action overrides for an individual device.
- Program name, icon, priority, enabled state and reapply setting.
- Program conditions.

Labels themselves are global across programs and seasons. Copying a season copies
its label references, not the labels. Renaming or changing the action of a shared
label affects every schedule that uses it. To keep different actions, create
separate labels, such as "Winter comfort" and "Summer comfort".

An empty summer week does not necessarily stop a device. Outside slots, the
program's shared default label can still apply. For a summer strategy with a
different default, different devices or different program conditions, use separate
programs and enable the appropriate one, or design the actions and conditions
explicitly.

## Create, rename or copy a season

1. Edit the Weekly Planner dashboard card.
2. Open **Program settings** and choose the program.
3. Open **Seasons**.
4. Add a season, or copy an existing season and give it a distinct name.
5. Enter the season name and choose **Apply to program**. This validates the name
   and persists the program settings in one action.

Names must be nonempty, unique within the program, and at most 40 characters long.
The active season cannot be deleted; activate another season first. Removing a
season removes that season's schedule when the program settings are applied.

Selecting a season in this settings tab only selects the season to manage. It does
not activate that season. The schedule screen and editable dashboard bars use the
active season. To enter or change the slots of an inactive season, apply the new
season, activate it as described below, then edit its schedule.

**Apply to program** changes the integration and every card displaying that
program. Cancelling the outer Home Assistant card editor does not undo a program
change that was already applied.

## Activate a season

The integration creates a Home Assistant `select` entity for every program. In
English it is named **{program} profile**; in French it is **Profil {program}**.
The actual entity ID is assigned by Home Assistant and can be renamed. Do not
assume that the example ID below is the ID in your installation.

Find the entity under **Settings → Devices & services → Entities**, filtering for
Weekly Planner, then open the program's season/profile entity and choose a season.
You can also add this entity to a standard Home Assistant dashboard card.

An automation or Developer Tools action can make the same change:

```yaml
action: select.select_option
target:
  entity_id: select.example_program_profile
data:
  option: Winter
```

Replace both the example entity ID and `Winter` with the exact values from your
installation. Automations refer to the visible season name: update them if you
rename that season.

In program settings, **Seasons → Change active season** opens this Home Assistant
selector directly. Apply any pending season changes first. The **Season to manage**
list is only for management. There is currently no activation selector inside the
schedule screen. Home Assistant's select entity is the supported activation path; there is no dedicated
`weekly_planner.set_profile` action.

## What happens when you activate another season

The engine immediately recalculates the desired action for the current time using
the newly active week. It does not play all the actions that would have happened
earlier in the day. The choice is retained in runtime storage across a restart.

With **Re-apply the current slot after a restart or a change** enabled (the
default), the current applicable action is sent: the action of the running slot,
or the applicable default outside a slot. A one-shot slot whose start is already
past is not replayed. With reapply disabled, the normal behavior is to wait for a
future transition; catching up a missed slot end remains an exception. Reapply is
evaluated for the winning program that currently owns the device.

Activating a season does not enable a paused program, bypass its conditions, or
exit Vacation mode. Conditions on the program still apply to its slots; each slot
can also have its own conditions. Outside an eligible slot, the shared default
rules still apply. In particular, a false program condition is not a separate
season-specific "off" action.

When programs share a device, only their active seasons participate in resolution.
Among eligible running slots, the lower priority number wins; ties use the older
program. If none supplies a running slot, the enabled program with the highest
priority owns the default action. A lower-priority program can therefore resume
control when another program's slot ends. Selecting a season does not bypass
these rules.

## Example

A program controls a room thermostat and contains these global labels:

- **Comfort**: the thermostat service with a comfortable temperature.
- **Reduced**: the same service with a lower temperature.

Its default is **Reduced** in every season. **Winter** contains Comfort slots in
the morning and evening. **Summer** has no slots. With Summer active, the empty
week does not create Comfort actions, but Reduced remains the program's default.
If the intention is to stop heating entirely in summer, design an explicit summer
action or separate program rather than assuming that an empty season turns the
thermostat off.

An external Home Assistant automation can choose Winter or Summer on dates or
according to a sensor. Weekly Planner provides the season selection, not the
calendar or weather rule.

## Implementation references

- `frontend/src/editors/program-editor.ts`: season management and copies.
- `frontend/src/components/schedule-dialog.ts`: edits the active season.
- `custom_components/weekly_planner/select.py`: activation through Home Assistant.
- `custom_components/weekly_planner/resolver.py`: active season and priority rules.
- `custom_components/weekly_planner/engine.py`: recalculation and reapply behavior.
