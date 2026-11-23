"""Config flow tests."""

from unittest.mock import patch

import pytest
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType, InvalidData, section
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.validation import ProgramError

from .helpers import local
from .test_resync import COVERS, shutters, start


async def test_single_instance(hass: HomeAssistant) -> None:
    """The flow creates one entry and refuses a second one."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "user"
    result = await hass.config_entries.flow.async_configure(result["flow_id"], {})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Weekly Planner" and result["data"] == {}

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def _options_entry(hass: HomeAssistant, hass_storage, options=None, config=None):
    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": [], **(config or {})}}
    entry = MockConfigEntry(domain=DOMAIN, data={}, options=options or {})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def _open_settings(flow, entry):
    """The options flow opens on a menu: choose the settings."""
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU and result["menu_options"] == ["settings", "resync"]
    # the menu points to the programs panel (the programs are not managed from a card any more)
    assert result["description_placeholders"] == {"panel_url": "/weekly-planner"}
    return await flow.async_configure(result["flow_id"], {"next_step_id": "settings"})


BASE = {"admin_only": True, "reapply_default": True, "show_sidebar": True, "notify_delay_min": 30, "debounce_min": 2,
        "mode_and_day_off": {}}


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
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "default_mode"
    result = await flow.async_configure(result["flow_id"], {"default_mode": "Away"})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    config = entry.runtime_data.store.config
    assert (config["mode_selector"], config["default_mode"]) == ("input_select.mode", "Away")
    assert "mode_selector" not in entry.options and "default_mode" not in entry.options
    # reopened: the current choice is the suggestion; a current default outside the options falls back
    result = await _open_settings(flow, entry)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Out"]})
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
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
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "select.x"}})
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
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["default_mode"] == "Away"


async def test_options_unchanged_selector_asks_when_saved_default_no_longer_fits(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    await entry.runtime_data.async_set_mode_config("input_select.mode", "Away")
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Out"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
    assert result["step_id"] == "default_mode"
    key, _field = next(iter(result["data_schema"].schema.items()))
    assert key.default() == "Home"  # the saved "Away" is gone: the first option is suggested


async def test_options_unchanged_selector_without_known_options_keeps_default(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    await entry.runtime_data.async_set_mode_config("select.x", "Winter")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "select.x"}})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["default_mode"] == "Winter"


async def test_options_default_mode_no_longer_an_option(hass: HomeAssistant, hass_storage) -> None:
    """The options changed between display and submit: an error on the field, not a crash."""
    entry = await _options_entry(hass, hass_storage)
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
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
        result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "select.x"}})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "settings"
    assert result["errors"] == {"base": "circular_mode_selector"}


def test_translations_cover_the_mode_fields() -> None:
    import json
    from pathlib import Path
    folder = Path(__file__).parents[1] / "custom_components" / "weekly_planner" / "translations"
    for name in ("en", "fr"):
        options = json.loads((folder / f"{name}.json").read_text())["options"]
        group = options["step"]["settings"]["sections"]["mode_and_day_off"]
        assert group["name"] and group["description"]
        for field in ("mode_selector", "holiday_entity", "holiday_invert"):  # in the sub-section, not at the top
            assert field in group["data"] and field in group["data_description"]
            assert field not in options["step"]["settings"]["data"]
        assert set(options["step"]["default_mode"]["data"]) == {"default_mode"}
        assert set(options["error"]) == {"invalid_mode_selector_domain", "circular_mode_selector",
                                         "invalid_default_mode", "unknown_default_mode",
                                         "invalid_holiday_entity_domain", "circular_holiday_entity",
                                         "driven_holiday_entity", "invalid_holiday_invert"}


# -- day off (issue #54): the entity of the house lives in the store, like the mode selector ------------------------


async def test_options_choose_the_day_off_entity(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(
        result["flow_id"], {**BASE, "mode_and_day_off": {"holiday_entity": "binary_sensor.workday", "holiday_invert": True}})
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
        await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"holiday_entity": "light.kitchen"}})
    with patch("custom_components.weekly_planner.config_flow.check_holiday_config",
               side_effect=ProgramError("driven_holiday_entity")):
        result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"holiday_entity": "switch.boiler"}})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "driven_holiday_entity"}
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


def _fields(result):
    """{field name: (marker, validator)} of a form."""
    fields = {str(key): (key, value) for key, value in result["data_schema"].schema.items()}
    group = fields.pop("mode_and_day_off")  # the mode selector and the day off live in one sub-section
    assert isinstance(group[1], section) and group[1].options == {"collapsed": False}
    fields.update({str(key): (key, value) for key, value in group[1].schema.schema.items()})
    return fields


async def test_the_settings_form_defaults_follow_the_options_and_fall_back_to_the_defaults(hass, hass_storage):
    entry = await _options_entry(hass, hass_storage)
    result = await _open_settings(hass.config_entries.options, entry)
    fields = _fields(result)
    assert result["step_id"] == "settings"
    assert [fields[k][0].default() for k in ("admin_only", "reapply_default", "notify_delay_min", "debounce_min")] == [
        False, True, 30, 2]
    assert fields["holiday_invert"][0].default() is False
    assert fields["mode_selector"][0].description == {"suggested_value": None}
    assert fields["holiday_entity"][0].description == {"suggested_value": None}


async def test_the_settings_form_shows_the_current_options_and_store_values_and_its_selectors(hass, hass_storage):
    entry = await _options_entry(
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
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    handler = flow._progress[result["flow_id"]]
    saved = await handler.async_step_settings({**BASE, "mode_and_day_off": {"holiday_entity": "input_boolean.off"}})
    assert saved["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.config["holiday_invert"] is False
    bad = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"holiday_entity": "switch.x", "holiday_invert": True}})
    assert bad["type"] is not FlowResultType.FORM or bad["step_id"] == "settings"
    again = await _open_settings(flow, entry)
    bad = await flow._progress[again["flow_id"]].async_step_settings({**BASE, "mode_and_day_off": {"mode_selector": "light.nope"}})
    assert bad["type"] is FlowResultType.FORM and bad["step_id"] == "settings"
    assert bad["errors"] == {"base": "invalid_mode_selector_domain"}


async def test_an_own_entity_cannot_be_chosen_as_the_mode_selector(hass, hass_storage):
    entry = await _options_entry(hass, hass_storage)
    own = er.async_get(hass).async_get_or_create("select", DOMAIN, "own", suggested_object_id="weekly_planner_mode")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    bad = await flow._progress[result["flow_id"]].async_step_settings({**BASE, "mode_and_day_off": {"mode_selector": own.entity_id}})
    assert bad["errors"] == {"base": "circular_mode_selector"}


async def test_the_default_mode_step_keeps_the_current_choice_the_options_and_the_saved_options(hass, hass_storage):
    entry = await _options_entry(hass, hass_storage, config={"mode_selector": "input_select.old", "default_mode": "Away"})
    hass.states.async_set("input_select.mode", "Home", {"options": ["Home", "Away"]})
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.mode"}})
    assert result["step_id"] == "default_mode"
    key, field = next(iter(result["data_schema"].schema.items()))
    assert key.default() == "Away"
    assert [o["value"] if isinstance(o, dict) else o for o in field.config["options"]] == ["Home", "Away"]
    assert field.config["mode"] == "dropdown"
    done = await flow.async_configure(result["flow_id"], {"default_mode": "Home"})
    assert done["type"] is FlowResultType.CREATE_ENTRY and done["data"] == {k: v for k, v in BASE.items() if k != "mode_and_day_off"}
    assert entry.options["notify_delay_min"] == 30 and entry.runtime_data.store.config["default_mode"] == "Home"


async def test_free_text_default_mode_accepts_one_character_and_has_no_default_without_a_stored_one(hass, hass_storage):
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.unknown"}})
    key, field = next(iter(result["data_schema"].schema.items()))
    assert result["step_id"] == "default_mode" and key.default is vol.UNDEFINED
    assert type(field.validators[0]).__name__ == "TextSelector" and len(field.validators) == 2
    done = await flow.async_configure(result["flow_id"], {"default_mode": "A"})
    assert done["type"] is FlowResultType.CREATE_ENTRY


async def test_a_wrong_default_mode_is_reported_on_its_field_with_the_selector_known(hass, hass_storage):
    entry = await _options_entry(hass, hass_storage)
    own = er.async_get(hass).async_get_or_create("select", DOMAIN, "own2", suggested_object_id="weekly_planner_m2")
    flow = hass.config_entries.options
    result = await _open_settings(flow, entry)
    result = await flow.async_configure(result["flow_id"], {**BASE, "mode_and_day_off": {"mode_selector": "input_select.other"}})
    handler = flow._progress[result["flow_id"]]
    handler._selector = own.entity_id
    bad = await handler.async_step_default_mode({"default_mode": "Home"})
    assert bad["errors"] == {"default_mode": "circular_mode_selector"}


async def test_the_resync_form_is_named_has_an_empty_schema_and_shows_local_times(hass, hass_storage, freezer):
    _engine, _rec = await start(hass, hass_storage, freezer, [shutters(entities=COVERS[:1])], local(26, 18))
    await hass.config.async_update(time_zone="America/New_York")  # the engine reads it again
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
    assert result["step_id"] == "resync" and result["data_schema"].schema == {}
    assert "since 26/10 08:00" in result["description_placeholders"]["plan"]  # 08:00 where the house is, not where the server is


async def test_the_day_off_entity_cannot_be_one_a_program_a_label_or_a_scene_drives(hass, hass_storage):
    from .helpers import act, label, program

    drive = {"kind": "scene", "scene": "scene.evening"}
    prog = program(entities=[{"entity_id": "switch.boiler", "default_label": "t15", "label_overrides": {}}])
    labs = [label("t15", act("climate.set_temperature", temperature=15)),
            label("tgt", {"kind": "service", "service": "switch.turn_on", "target_entity_id": "switch.target", "data": {}}),
            label("sc", drive)]
    entry = await _options_entry(hass, hass_storage, config={"programs": [prog], "labels": labs})
    hass.states.async_set("scene.evening", "scening", {"entity_id": ["input_boolean.member"]})
    flow = hass.config_entries.options
    for driven in ("switch.boiler", "switch.target", "input_boolean.member"):
        result = await _open_settings(flow, entry)
        bad = await flow._progress[result["flow_id"]].async_step_settings({**BASE, "mode_and_day_off": {"holiday_entity": driven}})
        assert bad["errors"] == {"base": "driven_holiday_entity"}, driven
        flow.async_abort(result["flow_id"])


def test_reapply_option_is_worded_like_the_checkbox_of_the_program_sheet() -> None:
    """The integration option is the default of the program checkbox: both name it the same way, in EN and FR."""
    import json
    import re
    from pathlib import Path
    root = Path(__file__).parents[1]
    card = (root / "frontend" / "src" / "i18n.ts").read_text(encoding="utf-8")
    labels = re.findall(r'^  pe_reapply: "([^"]+)",$', card, flags=re.M)  # the English block first, then the French one
    assert len(labels) == 2
    folder = root / "custom_components" / "weekly_planner" / "translations"
    for name, checkbox in zip(("en", "fr"), labels):
        option = json.loads((folder / f"{name}.json").read_text(encoding="utf-8"))[
            "options"]["step"]["settings"]["data"]["reapply_default"]
        assert option.startswith(checkbox)
