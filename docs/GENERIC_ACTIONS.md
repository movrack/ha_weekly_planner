# Native device actions

Weekly Planner uses the actions exposed by Home Assistant and the selected entity's
attributes. It does not maintain a list of supported manufacturers or invent modes.
In program settings, **Devices → Offered actions** can restrict the choices; an
empty restriction means all available actions.

## Thermostat presets

Choose the thermostat entity, create a label and select Home Assistant's preset
mode action (`climate.set_preset_mode`). The preset choices come from that entity's
`preset_modes` attribute, so names such as Eco, Comfort or Boost only appear when
the thermostat actually exposes them. HVAC modes are a separate action and list.
A missing preset is not synthesized. Check the selected entity's attributes and
its offered actions if a mode is absent.

## A blind's favorite position

Use the favorite action actually exposed by the blind's Home Assistant integration.
Some devices expose a separate button entity: select that button and create a
label using `button.press`. Schedule it without an end, since a button press is a
one-shot action. Another integration may expose a targeted service or a script.
A normal position label can also use the entity's position service and an explicit
position, but that does not recall a favorite stored in the motor.

Do not assume that Stop recalls a favorite or that a manufacturer's app button is
available in Home Assistant. If HA exposes no corresponding action, Weekly Planner
cannot discover it. No brand-specific mapping is introduced.

## Enable an automation during a time window

1. Select the `automation.*` entity in the program.
2. Create an **Enabled** label using `automation.turn_on`.
3. Create a **Disabled** label using `automation.turn_off` and choose it as that
   entity's **The rest of the time** label.
4. Add a bounded slot, for example 18:00–23:00, with Enabled.

During the slot, the automation's triggers are enabled. At the end, they are
disabled by the default action. This does not run the automation immediately:
`automation.trigger` has a different meaning. Actions already running when the
automation is disabled follow Home Assistant's `stop_actions` option; inspect the
chosen action fields if that distinction matters.

The normal program rules still apply: priorities resolve shared devices, Vacation
and conditions affect eligibility, and reapply controls startup/edit behavior.
There is no separate automation scheduler model.

## Verification limits

Frontend tests cover service discovery for automation, button, unknown domains and
entity-provided preset lists. These examples describe exposed Home Assistant
actions; they do not claim a physical test of a particular thermostat or blind.
