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

    hass_storage[DOMAIN] = {"version": 2, "minor_version": 1, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": []}}
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_options_form_is_the_settings(hass: HomeAssistant, hass_storage) -> None:
    """The options flow is only the global settings (no common modes any more)."""
    entry = await _options_entry(hass, hass_storage)
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "init"
    result = await flow.async_configure(result["flow_id"], {
        "admin_only": True, "reapply_default": True, "notify_delay_min": 30, "debounce_min": 2})
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options["admin_only"] is True
