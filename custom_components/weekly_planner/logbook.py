"""Readable logbook entries for Weekly Planner decisions (spec § 5.8)."""

from __future__ import annotations

from homeassistant.components.logbook import LOGBOOK_ENTRY_ENTITY_ID, LOGBOOK_ENTRY_MESSAGE, LOGBOOK_ENTRY_NAME
from homeassistant.core import Event, HomeAssistant, callback

from .const import DOMAIN

EVENT = f"{DOMAIN}_event"

MESSAGES = {
    "en": {
        "applied": "applied {setpoint}",
        "override_detected": "changed by hand: kept until the next change",
        "override_set": "override {setpoint}",
        "resumed": "back to the schedule",
        "waiting_unavailable": "unavailable: will be applied when it is back",
        "failed": "did not reach {setpoint}",
        "locked": "locked: setpoint not sent",
    },
    "fr": {
        "applied": "consigne appliquée : {setpoint}",
        "override_detected": "modifié à la main : conservé jusqu'au prochain changement",
        "override_set": "dérogation : {setpoint}",
        "resumed": "retour au programme",
        "waiting_unavailable": "indisponible : sera appliqué à son retour",
        "failed": "consigne non atteinte : {setpoint}",
        "locked": "verrouillé : consigne non envoyée",
    },
}


def describe_setpoint(setpoint: dict | None) -> str:
    if not setpoint:
        return "—"
    kind = setpoint.get("kind")
    for key in ("preset", "temperature", "position", "hvac_mode", "option", "value", "scene", "script"):
        if key in setpoint:
            value = setpoint[key]
            return f"{value} °C" if key == "temperature" else str(value)
    return str(kind)


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
            LOGBOOK_ENTRY_MESSAGE: template.format(setpoint=describe_setpoint(event.data.get("setpoint"))),
            LOGBOOK_ENTRY_ENTITY_ID: event.data.get("entity_id"),
        }

    async_describe_event(DOMAIN, EVENT, describe)
