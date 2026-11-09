"""Texts shown to the user by Python (persistent notifications), in the instance language."""

from __future__ import annotations

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers.translation import async_get_translations

from .const import DOMAIN

_MESSAGES: dict[str, dict[str, str]] = {
    "en": {
        "unavailable": "{entity} is unavailable: its scheduled action is still waiting.",
        "failed": "{entity}: {action} could not be run.",
        "storage": (
            "The Weekly Planner configuration file could not be read. Programs are paused "
            "and nothing will be overwritten. Restore `.storage/weekly_planner` from a backup."
        ),
    },
    "fr": {
        "unavailable": "{entity} est indisponible : son action planifiée est toujours en attente.",
        "failed": "{entity} : {action} n'a pas pu être exécuté.",
        "storage": (
            "Le fichier de configuration de Weekly Planner n'a pas pu être lu. Les programmes sont "
            "en pause et rien ne sera écrasé. Restaurez `.storage/weekly_planner` depuis une sauvegarde."
        ),
    },
}


def message(hass: HomeAssistant, key: str, **kwargs: object) -> str:
    """Return the text ``key`` in the Home Assistant language (``fr-CA`` -> ``fr``), English by default."""
    language = (getattr(hass.config, "language", None) or "en").lower().split("-")[0].split("_")[0]
    templates = _MESSAGES.get(language, _MESSAGES["en"])
    return templates[key].format(**kwargs)


def validation_error(key: str, /, **placeholders: str) -> ServiceValidationError:
    """A user-facing error translated by Home Assistant (``exceptions.<key>`` in translations/*.json)."""
    return ServiceValidationError(
        translation_domain=DOMAIN, translation_key=key, translation_placeholders=placeholders or None)


async def async_reason(hass: HomeAssistant, err: HomeAssistantError) -> str:
    """The error text in the instance language (base language, English by default)."""
    key = err.translation_key
    if err.translation_domain != DOMAIN or not key:
        return str(err)
    language = (getattr(hass.config, "language", None) or "en").lower().split("-")[0].split("_")[0]
    texts = await async_get_translations(hass, language, "exceptions", {DOMAIN})
    text = texts.get(f"component.{DOMAIN}.exceptions.{key}.message")
    if not text:
        return str(err)
    try:
        return text.format(**(err.translation_placeholders or {}))
    except (KeyError, IndexError):
        return text
