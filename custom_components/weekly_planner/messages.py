"""Texts shown to the user by Python (persistent notifications), in the instance language."""

from __future__ import annotations

from datetime import datetime, tzinfo

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
        "resync_send_title": "Will be sent ({count}):",
        "resync_skip_title": "Left alone ({count}):",
        "resync_send": "- {entity}: {action}{since}",
        "resync_since": " (since {time})",
        "resync_skip": "- {entity}: {reason}",
        "resync_reason_vacation": "all programs are paused",
        "resync_reason_paused": "its program is paused",
        "resync_reason_off": "its program is switched off",
        "resync_reason_no_action": "nothing to send",
        "resync_reason_too_old": "its last one-shot is more than 24 h old",
        "resync_reason_manual_change": "changed by a person since",
        "resync_reason_unavailable": "unavailable",
        "resync_reason_duplicate": "same command already sent to this device",
        "resync_reason_other_program": "driven by another program",
    },
    "fr": {
        "unavailable": "{entity} est indisponible : son action planifiée est toujours en attente.",
        "failed": "{entity} : {action} n'a pas pu être exécuté.",
        "storage": (
            "Le fichier de configuration de Weekly Planner n'a pas pu être lu. Les programmes sont "
            "en pause et rien ne sera écrasé. Restaurez `.storage/weekly_planner` depuis une sauvegarde."
        ),
        "resync_send_title": "Sera envoyé ({count}) :",
        "resync_skip_title": "Laissé tel quel ({count}) :",
        "resync_send": "- {entity} : {action}{since}",
        "resync_since": " (depuis {time})",
        "resync_skip": "- {entity} : {reason}",
        "resync_reason_vacation": "tous les programmes sont suspendus",
        "resync_reason_paused": "son programme est en pause",
        "resync_reason_off": "son programme est éteint",
        "resync_reason_no_action": "rien à envoyer",
        "resync_reason_too_old": "son dernier ponctuel date de plus de 24 h",
        "resync_reason_manual_change": "modifié par une personne depuis",
        "resync_reason_unavailable": "indisponible",
        "resync_reason_duplicate": "même commande déjà envoyée à cet appareil",
        "resync_reason_other_program": "piloté par un autre programme",
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


def resync_lines(hass: HomeAssistant, plan: list[dict], tz: tzinfo) -> str:
    """The plan of a resynchronisation as text (what will be sent, what is left alone and why)."""
    send, skip = [], []
    for item in plan:
        if item["send"]:
            action = item["action"]
            since = ""
            if item.get("start"):
                local = datetime.fromisoformat(item["start"]).astimezone(tz)
                since = message(hass, "resync_since", time=local.strftime("%d/%m %H:%M"))
            send.append(message(hass, "resync_send", entity=item["entity_id"], since=since,
                                action=action.get("scene") if action.get("kind") == "scene" else action.get("service")))
        else:
            skip.append(message(hass, "resync_skip", entity=item["entity_id"],
                                reason=message(hass, f"resync_reason_{item['reason']}")))
    blocks = []
    if send:
        blocks.append("\n".join([message(hass, "resync_send_title", count=len(send)), *send]))
    if skip:
        blocks.append("\n".join([message(hass, "resync_skip_title", count=len(skip)), *skip]))
    return "\n\n".join(blocks)
