"""Serve the bundled Lovelace card and register it as a dashboard resource."""

from __future__ import annotations

from hashlib import sha256
import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

CARD_FILE = Path(__file__).parent / "frontend" / "weekly-planner-card.js"
URL_BASE = f"/{DOMAIN}_static"
CARD_URL = f"{URL_BASE}/weekly-planner-card.js"
_REGISTERED = f"{DOMAIN}_frontend_registered"


async def async_register_card(hass: HomeAssistant) -> None:
    """Serve the card file and make dashboards load it (once per process)."""
    content = await hass.async_add_executor_job(CARD_FILE.read_bytes)
    url = f"{CARD_URL}?v={sha256(content).hexdigest()[:12]}"

    if not hass.data.get(_REGISTERED):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(URL_BASE, str(CARD_FILE.parent), cache_headers=False)]
        )
        hass.data[_REGISTERED] = True

    if "lovelace" not in hass.config.components:
        return

    from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE

    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace is None:
        return

    if lovelace.resource_mode != MODE_STORAGE:
        # YAML resources cannot be edited: load the module on every page instead.
        from homeassistant.components.frontend import add_extra_js_url

        add_extra_js_url(hass, url)
        return

    resources = lovelace.resources
    await resources.async_get_info()  # loads the collection
    for item in resources.async_items():
        if item["url"].split("?")[0] == CARD_URL:
            if item["url"] != url:
                await resources.async_update_item(item["id"], {"res_type": "module", "url": url})
                _LOGGER.debug("Card resource updated to %s", url)
            return
    await resources.async_create_item({"res_type": "module", "url": url})
    _LOGGER.debug("Card resource created: %s", url)


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
