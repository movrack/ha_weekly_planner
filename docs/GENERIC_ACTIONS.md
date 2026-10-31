# Native entity actions

Weekly Planner 0.16.2 discovers services and fields from Home Assistant metadata
and entity attributes. It has no catalogue of supported brands or device types.
The UI calls scheduled entities “devices”; they remain HA entity IDs.

## Choose the offered commands

In program settings, **Devices → Offered actions** selects the services offered
for each device. New devices start with `restrict_services: true` and
`allowed_services: []`: no service action is selected. Creation invites users to
choose commands, with descriptions from HA; they can choose them later in Devices.
A nonempty `allowed_services` restricts the device to those services. Legacy
empty/missing lists without `restrict_services` remain unrestricted. Scenes are
separate from this service filter. A configured action is retained for editing
when metadata disappears; that does not make an unavailable service executable.

Unsupported fields are hidden using service metadata, supported features and
attributes. Services requiring raw text/object input are omitted by the picker.
Unknown entity domains remain usable when HA exposes compatible services.

## Thermostat presets

Select the thermostat, allow its preset action and create a label using
`climate.set_preset_mode`. Choices come from the actual entity’s `preset_modes`
attribute. Eco, Comfort or Boost only appear if the entity exposes them. HVAC
modes are a separate action and list. A missing preset is not synthesized.

## Recall a blind’s favourite position

A favourite-position button performs an action; it does not necessarily expose
its stored percentage. To use one while keeping the blind in the program:

1. Create or edit a label and choose **Another entity** as the action target.
2. Select the button exposed by HA and its `button.press` action.
3. Ensure that service is selected in the program device’s offered actions.
4. Schedule the label without an end for a one-shot press.

```json
{"kind":"service","service":"button.press","target_entity_id":"button.example_favourite"}
```

Services and fields are discovered from this actual target. `target_entity_id`
is the explicit target override; never redirect through `data` or `data_sources`.
If the integration instead exposes a script or targeted service, use that action.
A fixed position calls the position service with a percentage; it does not recall
a favourite stored in the motor. Stop is not assumed to mean Favourite. If HA
exposes no corresponding action, Weekly Planner cannot invent one.

## Read a value from an entity

For a service field, select **Value from an entity**, choose the source and then
its state or attribute. The preview is the current value; execution reads it again.
For example, a helper can supply a cover position:

```json
{"kind":"service","service":"cover.set_cover_position","data_sources":{"position":{"entity_id":"input_number.example_position","type":"number"}}}
```

Without `attribute`, the entity state is read. Add `attribute` to read one of its
attributes. Source types are `number`, `boolean`, `string` and `native`; the editor
chooses the type from the service field. Invalid, missing or unavailable values
produce an action error rather than silently using a fixed fallback. Changing a
source does not itself trigger a scheduled action. Sources supply field values,
not targets.

## Enable an automation during a time window

1. Add the `automation.*` entity and allow `automation.turn_on` and `automation.turn_off`.
2. Create Enabled and Disabled labels using those services.
3. Choose Disabled as the entity’s **The rest of the time** label.
4. Add a bounded slot, for example 18:00–23:00, using Enabled.

This enables its triggers during the slot; it does not run the automation now.
`automation.trigger` is a different action. Already-running actions follow HA’s
`stop_actions` option when disabled; inspect the chosen fields when relevant.
Priorities, conditions, global pause and reapply still follow the normal program
rules. Vacation is an ordinary weekly mode, separate from the global pause switch.

## Verification limits

Automated checks cover metadata discovery, unknown domains, service restrictions,
explicit targets and dynamic sources. These examples do not claim a physical test
of a particular thermostat or blind. Replace example entity IDs with actual IDs.
See [the integrator README](../README.md) and [mode reference](SEASONS.md).
