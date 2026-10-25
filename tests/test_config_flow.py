"""Config flow tests."""

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType

from custom_components.weekly_planner.const import DOMAIN


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

    hass_storage[DOMAIN] = {"version": 1, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "modes": [{
                                "id": "m1", "type": "climate", "name": "Night", "color": "#7e57c2",
                                "value": {"kind": "temperature", "temperature": 16}, "exceptions": {}}],
                                "programs": []}}
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_options_menu_and_common_modes(hass: HomeAssistant, hass_storage) -> None:
    """Common modes are created, changed and deleted from the options flow."""
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    assert set(result["menu_options"]) == {"settings", "modes"}

    # create
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "modes"})
    result = await flow.async_configure(result["flow_id"], {"mode": "__new__"})
    assert result["step_id"] == "mode"
    result = await flow.async_configure(result["flow_id"], {
        "name": "Comfort", "type": "climate", "kind": "temperature", "value": 21})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    modes = {m["name"]: m for m in entry.runtime_data.store.config["modes"]}
    assert modes["Comfort"]["value"] == {"kind": "temperature", "temperature": 21.0}

    # change
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "modes"})
    result = await flow.async_configure(result["flow_id"], {"mode": "m1"})
    result = await flow.async_configure(result["flow_id"], {
        "name": "Night", "type": "climate", "kind": "temperature", "value": 17, "delete": False})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.runtime_data.store.modes["m1"]["value"]["temperature"] == 17.0
    assert entry.runtime_data.store.modes["m1"]["color"] == "#7e57c2"  # kept

    # delete
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "modes"})
    result = await flow.async_configure(result["flow_id"], {"mode": "m1"})
    result = await flow.async_configure(result["flow_id"], {
        "name": "Night", "type": "climate", "kind": "temperature", "delete": True})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert "m1" not in entry.runtime_data.store.modes


async def test_options_mode_in_use_cannot_be_deleted(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    engine = entry.runtime_data
    engine.store.programs.append({
        "id": "p", "name": "P", "entities": [{"entity_id": "climate.x", "default": {"kind": "mode", "value": "m1"}}],
        "profiles": []})
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "modes"})
    result = await flow.async_configure(result["flow_id"], {"mode": "m1"})
    result = await flow.async_configure(result["flow_id"], {
        "name": "Night", "type": "climate", "kind": "temperature", "delete": True})
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "mode_in_use"}


async def test_options_settings_still_saved(hass: HomeAssistant, hass_storage) -> None:
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "settings"})
    result = await flow.async_configure(result["flow_id"], {
        "admin_only": True, "reapply_default": True, "notify_delay_min": 30, "debounce_min": 2})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["admin_only"] is True
