"""Config flow tests."""

from unittest.mock import patch

import pytest
from homeassistant import config_entries
from homeassistant.data_entry_flow import InvalidData
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.validation import ProgramError


async def test_single_instance(hass: HomeAssistant) -> None:
    """The flow creates one entry and refuses a second one."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def _options_entry(hass: HomeAssistant, hass_storage):
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": []}}
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _open_settings(flow, entry):
    """The options flow opens on a menu: choose the settings."""
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU and result["menu_options"] == ["settings", "resync"]
    return await flow.async_configure(result["flow_id"], {"next_step_id": "settings"})


BASE = {"admin_only": True, "reapply_default": True, "notify_delay_min": 30, "debounce_min": 2}


async def test_options_form_is_the_settings(hass: HomeAssistant, hass_storage) -> None:
    """Without selector the flow ends at once and keeps a single mode."""
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "settings"
    result = await flow.async_configure(result["flow_id"], dict(BASE))
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["admin_only"] is True
    assert "mode_selector" not in entry.options
    assert entry.runtime_data.store.config["mode_selector"] is None


async def test_options_choose_selector_and_default_mode(hass: HomeAssistant, hass_storage) -> None:
    """The default mode is picked among the options of the chosen selector."""
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "default_mode"
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Away"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    config = entry.runtime_data.store.config
    assert (config["mode_selector"], config["default_mode"]) == ("input_select.mode", "Away")
    assert "mode_selector" not in entry.options and "default_mode" not in entry.options
    # reopened: the current choice is the suggestion; a current default outside the options falls back
    result = await _open_settings(flow, entry)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Out"]})
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    assert result["type"] is FlowResultType.FORM
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Out"})
    assert result["type"] is FlowResultType.CREATE_ENTRY


async def test_options_clearing_the_selector_keeps_the_default(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    await entry.runtime_data.async_set_mode_config("input_select.mode", "Away")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], dict(BASE))
    assert result["type"] is FlowResultType.CREATE_ENTRY
    config = entry.runtime_data.store.config
    assert (config["mode_selector"], config["default_mode"]) == (None, "Away")


async def test_options_default_mode_free_text_when_no_options_known(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    await entry.runtime_data.async_set_mode_config("select.old", "Winter")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "select.x"})
    assert result["step_id"] == "default_mode"
    with pytest.raises(InvalidData):
        await flow.async_configure(result["flow_id"], {"default_mode": ""})
    with pytest.raises(InvalidData):
        await flow.async_configure(result["flow_id"], {"default_mode": "x" * 41})
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Summer"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["default_mode"] == "Summer"


async def test_options_unchanged_selector_keeps_default_mode_without_asking(hass: HomeAssistant, hass_storage) -> None:
    """Changing another option (the day off entity) does not ask the default mode again."""
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    await entry.runtime_data.async_set_mode_config("input_select.mode", "Away")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["default_mode"] == "Away"


async def test_options_unchanged_selector_asks_when_saved_default_no_longer_fits(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    await entry.runtime_data.async_set_mode_config("input_select.mode", "Away")
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Out"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    assert result["step_id"] == "default_mode"


async def test_options_unchanged_selector_without_known_options_keeps_default(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    await entry.runtime_data.async_set_mode_config("select.x", "Winter")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "select.x"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["default_mode"] == "Winter"


async def test_options_free_text_without_current_default(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "select.x"})
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Home"})
    assert result["type"] is FlowResultType.CREATE_ENTRY


async def test_options_default_mode_no_longer_an_option(hass: HomeAssistant, hass_storage) -> None:
    """The options changed between display and submit: an error on the field, not a crash."""
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "input_select.mode"})
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home"]})
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Away"})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"default_mode": "unknown_default_mode"}


async def test_options_selector_error_is_shown_on_the_field(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    with patch("custom_components.weekly_planner.config_flow.check_mode_config",
               side_effect=ProgramError("circular_mode_selector")):
        result = await flow.async_configure(result["flow_id"], {**BASE, "mode_selector": "select.x"})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "settings"
    assert result["errors"] == {"mode_selector": "circular_mode_selector"}


def test_translations_cover_the_mode_fields() -> None:
    import json
    from pathlib import Path
    folder = Path(__file__).parents[1] / "custom_components" / "weekly_planner" / "translations"
    for name in ("en", "fr"):
        options = json.loads((folder / f"{name}.json").read_text())["options"]
        assert "mode_selector" in options["step"]["settings"]["data"]
        assert "mode_selector" in options["step"]["settings"]["data_description"]
        assert set(options["step"]["default_mode"]["data"]) == {"default_mode"}
        assert set(options["error"]) == {"invalid_mode_selector_domain", "circular_mode_selector",
                                         "invalid_default_mode", "unknown_default_mode",
                                         "invalid_holiday_entity_domain", "circular_holiday_entity",
                                         "driven_holiday_entity", "invalid_holiday_invert"}
        for field in ("holiday_entity", "holiday_invert"):  # day off (issue #54)
            assert field in options["step"]["settings"]["data"]
            assert field in options["step"]["settings"]["data_description"]


# -- day off (issue #54): the entity of the house lives in the store, like the mode selector ------------------------


async def test_options_choose_the_day_off_entity(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(
        result["flow_id"], {**BASE, "holiday_entity": "binary_sensor.workday", "holiday_invert": True})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    config = entry.runtime_data.store.config
    assert (config["holiday_entity"], config["holiday_invert"]) == ("binary_sensor.workday", True)
    assert "holiday_entity" not in entry.options and "holiday_invert" not in entry.options
    # cleared again
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], dict(BASE))
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["holiday_entity"] is None


async def test_options_day_off_errors_are_shown_on_the_field(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    with pytest.raises(InvalidData):  # the entity selector already refuses another domain
        await flow.async_configure(result["flow_id"], {**BASE, "holiday_entity": "light.kitchen"})
    with patch("custom_components.weekly_planner.config_flow.check_holiday_config",
               side_effect=ProgramError("driven_holiday_entity")):
        result = await flow.async_configure(result["flow_id"], {**BASE, "holiday_entity": "switch.boiler"})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"holiday_entity": "driven_holiday_entity"}
    assert entry.runtime_data.store.config.get("holiday_entity") is None


# -- the "Resync the devices" step (issue #52): covered here too, the Bronze check runs this file only ------------------

PLAN = [{"entity_id": "cover.s1", "send": True}]


async def test_resync_step_lists_the_plan_then_sends_on_validation(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    engine = entry.runtime_data
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    with patch.object(engine, "async_plan_resync", return_value=PLAN) as plan, \
            patch.object(engine, "async_resync", return_value={"sent": ["cover.s1"], "skipped": []}) as send, \
            patch("custom_components.weekly_planner.config_flow.resync_lines", return_value="cover.s1: close"):
        result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
        assert result["type"] is FlowResultType.FORM and result["step_id"] == "resync"
        assert result["description_placeholders"] == {"plan": "cover.s1: close"}
        send.assert_not_called()  # nothing is sent before the confirmation
        result = await flow.async_configure(result["flow_id"], {})
    plan.assert_called_once()
    send.assert_called_once()
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "resync_done"
    assert result["description_placeholders"] == {"count": "1"}


async def test_resync_step_with_nothing_to_send_aborts(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    with patch.object(entry.runtime_data, "async_plan_resync", return_value=[{"entity_id": "cover.s1", "send": False}]):
        result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "resync_nothing"
