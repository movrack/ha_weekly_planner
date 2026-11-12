"""Mutation-testing survivors of config_flow.py: the forms (step ids, defaults, selectors) and what the steps save."""

from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weekly_planner.const import DOMAIN

from .test_config_flow import BASE, _open_settings
from .test_resync import COVERS, shutters, start
from .helpers import local


async def _entry(hass, hass_storage, options=None, config=None):
    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": [], **(config or {})}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options or {})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


def _fields(result):
    """{field name: (marker, validator)} of a form."""
    return {str(key): (key, value) for key, value in result["data_schema"].schema.items()}


async def test_the_user_step_is_a_form_named_user_and_creates_the_entry_with_its_title(hass):
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": config_entries.SOURCE_USER})
    assert result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["title"] == "Weekly Planner" and result["data"] == {}


async def test_the_settings_form_defaults_follow_the_options_and_fall_back_to_the_defaults(hass, hass_storage):
    entry = await _entry(hass, hass_storage)
    result = await _open_settings(hass.config_entries.options, entry)
    fields = _fields(result)
    assert result["step_id"] == "settings"
    assert [fields[k][0].default() for k in ("admin_only", "reapply_default", "notify_delay_min", "debounce_min")] == [
        False, True, 30, 2]
    assert fields["holiday_invert"][0].default() is False
    assert fields["mode_selector"][0].description == {"suggested_value": None}
    assert fields["holiday_entity"][0].description == {"suggested_value": None}


async def test_the_settings_form_shows_the_current_options_and_store_values_and_its_selectors(hass, hass_storage):
    entry = await _entry(
        hass, hass_storage,
        options={"admin_only": True, "reapply_default": False, "notify_delay_min": 45, "debounce_min": 7},
        config={"mode_selector": "input_select.mode", "holiday_entity": "input_boolean.off", "holiday_invert": True})
    result = await _open_settings(hass.config_entries.options, entry)
    fields = _fields(result)
    assert [fields[k][0].default() for k in ("admin_only", "reapply_default", "notify_delay_min", "debounce_min")] == [
        True, False, 45, 7]
    assert fields["holiday_invert"][0].default() is True
    assert fields["mode_selector"][0].description == {"suggested_value": "input_select.mode"}
    assert fields["holiday_entity"][0].description == {"suggested_value": "input_boolean.off"}
    notify, debounce = fields["notify_delay_min"][1].config, fields["debounce_min"][1].config
    assert (notify["min"], notify["max"], notify["step"], notify["mode"], notify["unit_of_measurement"]) == (1, 1440, 1, "box", "min")
    assert (debounce["min"], debounce["max"], debounce["step"], debounce["mode"], debounce["unit_of_measurement"]) == (0, 60, 1, "slider", "min")
    assert fields["mode_selector"][1].config["domain"] == ["input_select", "select"]
    assert fields["holiday_entity"][1].config["domain"] == ["binary_sensor", "input_boolean", "switch", "calendar"]


async def test_a_settings_save_without_the_invert_key_means_not_inverted_and_a_form_error_keeps_the_step(hass, hass_storage):
    entry = await _entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    handler = flow._progress[result["flow_id"]]
    saved = await handler.async_step_settings({**BASE, "holiday_entity": "input_boolean.off"})
    assert saved["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["holiday_invert"] is False
    bad = await flow.async_configure(result["flow_id"], {**BASE, "holiday_entity": "switch.x", "holiday_invert": True})
    assert bad["type"] is not FlowResultType.FORM or bad["step_id"] == "settings"
    again = await _open_settings(flow, entry)
    bad = await flow._progress[again["flow_id"]].async_step_settings({**BASE, "mode_selector": "light.nope"})
    assert bad["type"] is FlowResultType.FORM and bad["step_id"] == "settings"
    assert bad["errors"] == {"mode_selector": "invalid_mode_selector_domain"}


async def test_an_own_entity_cannot_be_chosen_as_the_mode_selector(hass, hass_storage):
    entry = await _entry(hass, hass_storage)
    own = er.async_get(hass).async_get_or_create("select", DOMAIN, "own", suggested_object_id="weekly_planner_mode")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    bad = await flow._progress[result["flow_id"]].async_step_settings({**BASE, "mode_selector": own.entity_id})
    assert bad["errors"] == {"mode_selector": "circular_mode_selector"}


async def test_the_default_mode_step_keeps_the_current_choice_the_options_and_the_saved_options(hass, hass_storage):
    entry = await _entry(hass, hass_storage, config={"mode_selector": "input_select.mode", "default_mode": "Away"})
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    assert result["step_id"] == "default_mode"
    key, field = next(iter(result["data_schema"].schema.items()))
    assert key.default() == "Away" and field.config["options"] == [{"value": "Home", "label": "Home"}, {"value": "Away", "label": "Away"}] \
        or field.config["options"] == ["Home", "Away"]
    assert field.config["mode"] == "dropdown"
    done = await flow.async_configure(result["flow_id"], {"default_mode": "Home"})
    assert done["type"] is FlowResultType.CREATE_ENTRY and done["data"] == BASE
    assert entry.options["notify_delay_min"] == 30 and entry.runtime_data.store.config["default_mode"] == "Home"


async def test_a_stored_default_outside_the_options_falls_back_to_the_first_option(hass, hass_storage):
    entry = await _entry(hass, hass_storage, config={"mode_selector": "input_select.mode", "default_mode": "Gone"})
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    key, _field = next(iter(result["data_schema"].schema.items()))
    assert key.default() == "Home"


async def test_free_text_default_mode_accepts_one_character_and_has_no_default_without_a_stored_one(hass, hass_storage):
    entry = await _entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.unknown"})
    key, field = next(iter(result["data_schema"].schema.items()))
    assert result["step_id"] == "default_mode" and key.default is vol.UNDEFINED
    done = await flow.async_configure(result["flow_id"], {"default_mode": "A"})
    assert done["type"] is FlowResultType.CREATE_ENTRY


async def test_a_wrong_default_mode_is_reported_on_its_field_with_the_selector_known(hass, hass_storage):
    entry = await _entry(hass, hass_storage)
    own = er.async_get(hass).async_get_or_create("select", DOMAIN, "own2", suggested_object_id="weekly_planner_m2")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.other"})
    handler = flow._progress[result["flow_id"]]
    handler._selector = own.entity_id
    bad = await handler.async_step_default_mode({"default_mode": "Home"})
    assert bad["errors"] == {"default_mode": "circular_mode_selector"}


async def test_the_resync_form_is_named_has_an_empty_schema_and_shows_local_times(hass, hass_storage, freezer):
    engine, _rec = await start(hass, hass_storage, freezer, [shutters(entities=COVERS[:1])], local(26, 18))
    await hass.config.async_update(time_zone="America/New_York")  # the engine reads it again
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
    assert result["step_id"] == "resync" and result["data_schema"].schema == {}
    assert "since 26/10 08:00" in result["description_placeholders"]["plan"]  # 08:00 where the house is, not where the server is
