"""Vulture whitelist: references are inspected statically, never executed."""

# Vulture whitelist syntax uses an undefined receiver and standalone attributes.
# ruff: noqa: B018, F821
_.CONFIG_SCHEMA  # Home Assistant discovers/calls this integration API member.
_.async_setup  # Home Assistant discovers/calls this integration API member.
_.async_setup_entry  # Home Assistant discovers/calls this integration API member.
_.async_unload_entry  # Home Assistant discovers/calls this integration API member.
_.async_remove_entry  # Home Assistant discovers/calls this integration API member.
_.WeeklyPlannerConfigFlow  # Home Assistant discovers/calls this integration API member.
_.VERSION  # Home Assistant discovers/calls this integration API member.
_.async_step_user  # Home Assistant discovers/calls this integration API member.
_.async_step_init  # Home Assistant discovers/calls this integration API member.
_.async_step_resync  # Home Assistant discovers/calls this integration API member.
_.async_step_settings  # Home Assistant discovers/calls this integration API member.
_.async_get_options_flow  # Home Assistant discovers/calls this integration API member.
_.async_added_to_hass  # Home Assistant discovers/calls this integration API member.
_.async_describe_events  # Home Assistant discovers/calls this integration API member.
_._async_migrate_func  # Home Assistant discovers/calls this integration API member.
_.suggested_object_id  # Home Assistant discovers/calls this integration API member.
_.is_on  # Home Assistant discovers/calls this integration API member.
_.icon  # Home Assistant discovers/calls this integration API member.
_.extra_state_attributes  # Home Assistant discovers/calls this integration API member.
_.async_turn_on  # Home Assistant discovers/calls this integration API member.
_.async_turn_off  # Home Assistant discovers/calls this integration API member.
_._attr_device_info  # Home Assistant discovers/calls this integration API member.
_._attr_unique_id  # Home Assistant discovers/calls this integration API member.
# ignore-name: hass Home Assistant imposes this callback argument.
# ignore-name: entry Home Assistant imposes this callback argument.
# ignore-name: config Home Assistant imposes this callback argument.
# ignore-name: kwargs Home Assistant imposes this callback argument.
# ignore-name: user_input Home Assistant imposes this callback argument.
# ignore-location: custom_components/weekly_planner/validation.py:443 d Sorted key callback must accept each item.
# ignore-name: async_step_* Home Assistant dispatches config-flow steps by their suffix.
# ignore-name: _attr_* Home Assistant reads Entity attribute overrides.
_.async_recompute  # Locked entry point of a pass, kept as the test entry point (26 calls in 10 test files; the latency tests need its lock).
_.SKIP_REASONS  # The list of resync skip reasons, checked against messages.py by test_resync (every reason has a text).
# keep: frontend/src/actions.ts stable unused-export Exported for its unit test (actions.test.ts).
# keep: frontend/src/chart-history.ts parseSourceHistory unused-export Exported for its unit test (chart-history.test.ts).
# keep: frontend/src/chart-sources.ts chartQuantity unused-export Exported for its unit test (chart-quantity.test.ts).
# keep: frontend/src/components/chart.ts SHADE_MIN unused-export Exported for its unit test (chart-shade.test.ts).
# keep: frontend/src/components/chart.ts SHADE_EDGE unused-export Exported for its unit test (chart-shade.test.ts).
# keep: frontend/src/components/slot-form.ts solarMeaningText unused-export Exported for its unit tests (random-time, slot-form-time-field).
# keep: frontend/src/components/slot-form.ts solarTodayText unused-export Exported for its unit test (random-time.test.ts).
# keep: frontend/src/components/slot-form.ts randomDelayRangeText unused-export Exported for its unit test (random-time.test.ts).
# keep: frontend/src/edits.ts keptRest unused-export Exported for its unit test (edits-group.test.ts).
# keep: frontend/src/holiday.ts holidayKind unused-export Exported for its unit test (holiday.test.ts).
# keep: frontend/src/labels.ts presetTemperature unused-export Exported for its unit test (label-preset-value.test.ts).
# keep: frontend/src/labels.ts linkedValueText unused-export Exported for its unit test (label-preset-value.test.ts).
# keep: frontend/src/labels.ts compatible unused-export Exported for its unit test (labels.test.ts).
# keep: frontend/src/planned.ts isActive unused-export Exported for its unit test (planned.test.ts).
# keep: frontend/src/planner.ts normalizeName unused-export Exported for its unit test (planner.test.ts, dynamic import).
# keep: frontend/src/preview-cache.ts clearPreviewCache unused-export Test hook: resets the module cache between tests (6 test files).
# keep: frontend/src/priority-groups.ts components unused-export Exported for its unit test (priority-groups.test.ts).
# keep: frontend/src/program-areas.ts normalizeRoom unused-export Exported for its unit test (program-areas.test.ts).
# keep: frontend/src/slots.ts fixedInterval unused-export Exported for its unit tests (slots-intervals-entities, performance).
# keep: frontend/src/styles.ts tokenFormulas unused-export Exported for the contrast test of the colour tokens (contrast-tokens.test.ts).
# keep: frontend/src/time.ts timeFormat unused-export Exported for its unit test (time-format.test.ts).
# keep: frontend/src/update.ts runningVersion unused-export Exported for its unit test (update.test.ts).
# keep: frontend/src/update.ts shouldReload unused-export Exported for its unit test (update.test.ts).
# keep: frontend/src/weekly-planner-card.ts commonWordPrefix unused-export Exported for its unit test (compare.test.ts).
