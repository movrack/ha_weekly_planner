"""The administrators' "Weekly Planner" sidebar panel (programs are managed there, not in a card)."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

from homeassistant.components import frontend as ha_frontend

from custom_components.weekly_planner import frontend


async def test_panel_is_registered_for_administrators(hass) -> None:
    hass.config.components.add("panel_custom")
    hass.data[frontend.CARD_VERSION_KEY] = "abc123"
    with patch("homeassistant.components.panel_custom.async_register_panel", new=AsyncMock()) as register:
        await frontend.async_register_panel(hass)
    kwargs = register.await_args.kwargs
    assert kwargs["frontend_url_path"] == "weekly-planner"
    assert kwargs["webcomponent_name"] == "wp-programs-panel"
    assert kwargs["require_admin"] is True
    assert kwargs["module_url"] == f"{frontend.CARD_URL}?v=abc123"
    assert kwargs["sidebar_icon"] == "mdi:calendar-clock"


async def test_panel_is_skipped_without_panel_custom(hass) -> None:
    assert "panel_custom" not in hass.config.components
    with patch("homeassistant.components.panel_custom.async_register_panel", new=AsyncMock()) as register:
        await frontend.async_register_panel(hass)
    register.assert_not_awaited()


async def test_panel_registered_twice_is_replaced(hass) -> None:
    hass.config.components.add("panel_custom")
    hass.data[ha_frontend.DATA_PANELS] = {frontend.PANEL_URL_PATH: object()}
    with (
        patch("homeassistant.components.panel_custom.async_register_panel", new=AsyncMock()) as register,
        patch.object(ha_frontend, "async_remove_panel", new=MagicMock()) as remove,
    ):
        await frontend.async_register_panel(hass)
    remove.assert_called_once_with(hass, frontend.PANEL_URL_PATH)
    register.assert_awaited_once()


async def test_panel_is_removed_on_unload(hass) -> None:
    hass.config.components.add("frontend")
    hass.data[ha_frontend.DATA_PANELS] = {frontend.PANEL_URL_PATH: object()}
    with patch.object(ha_frontend, "async_remove_panel", new=MagicMock()) as remove:
        frontend.async_unregister_panel(hass)
    remove.assert_called_once_with(hass, frontend.PANEL_URL_PATH)


async def test_unregister_is_harmless_when_nothing_was_registered(hass) -> None:
    hass.config.components.add("frontend")
    hass.data[ha_frontend.DATA_PANELS] = {}
    with patch.object(ha_frontend, "async_remove_panel", new=MagicMock()) as remove:
        frontend.async_unregister_panel(hass)
    remove.assert_not_called()


async def test_panel_without_sidebar_link_keeps_its_address(hass) -> None:
    hass.config.components.add("panel_custom")
    with patch("homeassistant.components.panel_custom.async_register_panel", new=AsyncMock()) as register:
        await frontend.async_register_panel(hass, in_sidebar=False)
    kwargs = register.call_args.kwargs
    assert kwargs["frontend_url_path"] == "weekly-planner"
    assert kwargs["sidebar_title"] is None and kwargs["sidebar_icon"] is None
