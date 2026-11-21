"""Serve the bundled Lovelace card and register it as a dashboard resource."""

from __future__ import annotations

import logging
from hashlib import sha256
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CARD_FILE = Path(__file__).parent / "frontend" / "weekly-planner-card.js"
URL_BASE = f"/{DOMAIN}_static"
CARD_URL = f"{URL_BASE}/weekly-planner-card.js"
_REGISTERED = f"{DOMAIN}_frontend_registered"
CARD_VERSION_KEY = f"{DOMAIN}_card_version"
PANEL_URL_PATH = "weekly-planner"
PANEL_ELEMENT = "wp-programs-panel"


def _read_card() -> bytes | None:
    """Content of the built card, or None when it was not built (installed from the source tree)."""
    try:
        return CARD_FILE.read_bytes()
    except FileNotFoundError:
        return None


async def async_register_card(hass: HomeAssistant) -> bool:
    """Serve the card file and make dashboards load it (once per process).

    Returns False, after a warning, when the card file is missing: the schedules keep running, but no
    dashboard resource and no panel are registered.
    """
    content = await hass.async_add_executor_job(_read_card)
    if content is None:
        hass.data.pop(CARD_VERSION_KEY, None)
        _LOGGER.warning(
            "Weekly Planner card not built (%s is missing): schedules keep running, but the card and the "
            "panel are not available. Install a release through HACS, or run `npm run build` in `frontend/`",
            CARD_FILE,
        )
        return False
    version = sha256(content).hexdigest()[:12]
    url = f"{CARD_URL}?v={version}"
    # the pages compare it with the version of the card they run and reload themselves when it differs
    hass.data[CARD_VERSION_KEY] = version

    if not hass.data.get(_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(CARD_FILE.parent), cache_headers=False)]
        )
        hass.data[_REGISTERED] = True

    if "lovelace" not in hass.config.components:
        return True

    from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE

    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None:
        return True

    if lovelace.resource_mode != MODE_STORAGE:
        # YAML resources cannot be edited: load the module on every page instead.
        from homeassistant.components.frontend import add_extra_js_url

        add_extra_js_url(hass, url)
        return True

    resources = lovelace.resources
    await resources.async_get_info()  # loads the collection
    for item in resources.async_items():
        if item["url"].split("?")[0] == CARD_URL:
            if item["url"] != url:
                await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
                _LOGGER.debug("Card resource updated to %s", url)
            return True
    await resources.async_create_item({"res_type": "module", "url": url})
    _LOGGER.debug("Card resource created: %s", url)
    return True


async def async_unregister_card(hass: HomeAssistant) -> None:
    """Remove the dashboard resource (integration removed)."""
    if "lovelace" not in hass.config.components:
        return
    from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE

    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None or lovelace.resource_mode != MODE_STORAGE:
        return
    resources = lovelace.resources
    await resources.async_get_info()
    for item in list(resources.async_items()):
        if item["url"].split("?")[0] == CARD_URL:
            await resources.async_delete_item(item["id"])


async def async_register_panel(hass: HomeAssistant, in_sidebar: bool = True) -> None:
    """Add the administrators' "Weekly Planner" panel (programs are managed there, not in a card).

    ``in_sidebar`` False keeps the panel at its address but hides its sidebar link.
    """
    if "panel_custom" not in hass.config.components:
        return
    from homeassistant.components import frontend, panel_custom

    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        frontend.async_remove_panel(hass, PANEL_URL_PATH)  # a reload registers it again
    version = hass.data.get(CARD_VERSION_KEY, "")
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        sidebar_title="Weekly Planner" if in_sidebar else None,
        sidebar_icon="mdi:calendar-clock" if in_sidebar else None,
        module_url=f"{CARD_URL}?v={version}",
        require_admin=True,
    )


def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the sidebar panel (integration unloaded or removed)."""
    if "frontend" not in hass.config.components:
        return
    from homeassistant.components import frontend

    if PANEL_URL_PATH in hass.data.get(frontend.DATA_PANELS, {}):
        frontend.async_remove_panel(hass, PANEL_URL_PATH)
