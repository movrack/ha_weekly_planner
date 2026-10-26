"""Readable logbook entries for Weekly Planner decisions (spec § 5.8)."""

from __future__ import annotations

from homeassistant.components.logbook import LOGBOOK_ENTRY_ENTITY_ID, LOGBOOK_ENTRY_MESSAGE, LOGBOOK_ENTRY_NAME
from homeassistant.core import Event, HomeAssistant, callback

from .const import DOMAIN

EVENT = f"{DOMAIN}_event"

MESSAGES = {
    "en": {
        "applied": "ran {action}",
        "waiting_unavailable": "unavailable: will be applied when it is back",
        "failed": "could not run {action}",
    },
    "fr": {
        "applied": "action lancée : {action}",
        "waiting_unavailable": "indisponible : sera appliqué à son retour",
        "failed": "action impossible : {action}",
    },
}


def describe_action(action: dict | None) -> str:
    if not action:
        return "—"
    if action.get("kind") == "scene":
        return str(action.get("scene"))
    return str(action.get("service"))


@callback
def async_describe_events(hass: HomeAssistant, async_describe_event) -> None:
    @callback
    def describe(event: Event) -> dict[str, str]:
        lang = "fr" if hass.config.language.startswith("fr") else "en"
        what = event.data.get("event", "applied")
        template = MESSAGES[lang].get(what, what)
        if what == "applied" and event.data.get("reason") in ("retry", "back_online"):
            template = MESSAGES[lang]["applied"]
        return {
            LOGBOOK_ENTRY_NAME: "Weekly Planner",
            LOGBOOK_ENTRY_MESSAGE: template.format(action=describe_action(event.data.get("action"))),
            LOGBOOK_ENTRY_ENTITY_ID: event.data.get("entity_id"),
        }

    async_describe_event(DOMAIN, EVENT, describe)
