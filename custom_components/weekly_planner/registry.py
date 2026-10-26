"""Follow entity renames and removals so programs never point at a dead entity (spec § 8, S32)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, issue_registry as ir

from .const import DOMAIN


def rename_entity(config: dict[str, Any], old: str, new: str) -> bool:
    """Replace an entity id everywhere in the configuration; True if anything changed."""
    changed = False

    def swap_conditions(conditions: list[dict]) -> None:
        nonlocal changed
        for cond in conditions:
            if cond.get("entity_id") == old:
                cond["entity_id"] = new
                changed = True

    for program in config["programs"]:
        swap_conditions(program.get("conditions", []))
        for entity in program["entities"]:
            if entity["entity_id"] == old:
                entity["entity_id"] = new
                changed = True
        for profile in program["profiles"]:
            for day in profile["days"]:
                for slot in day:
                    swap_conditions(slot.get("conditions", []))
    return changed


def missing_entities(config: dict[str, Any], exists) -> dict[str, list[str]]:
    """Program name -> entity ids that no longer exist."""
    result: dict[str, list[str]] = {}
    for program in config["programs"]:
        gone = [e["entity_id"] for e in program["entities"] if not exists(e["entity_id"])]
        if gone:
            result[program["name"]] = gone
    return result


@callback
def async_track_registry(hass: HomeAssistant, engine) -> callback:
    """Listen to the entity registry; returns the unsubscribe callback."""

    @callback
    def on_update(event: Event) -> None:
        data = event.data
        if data["action"] == "update" and "old_entity_id" in data:
            if rename_entity(engine.store.config, data["old_entity_id"], data["entity_id"]):
                rt = engine.store.runtime["entities"].pop(data["old_entity_id"], None)
                if rt is not None:
                    engine.store.runtime["entities"][data["entity_id"]] = rt
                engine.store.save_config()
                hass.async_create_task(engine.async_config_changed())
        elif data["action"] == "remove":
            async_check_missing(hass, engine)

    return hass.bus.async_listen(er.EVENT_ENTITY_REGISTRY_UPDATED, on_update)


@callback
def async_check_missing(hass: HomeAssistant, engine) -> None:
    """Create or clear a repair issue listing programs with removed entities."""
    registry = er.async_get(hass)

    def exists(entity_id: str) -> bool:
        return registry.async_get(entity_id) is not None or hass.states.get(entity_id) is not None

    missing = missing_entities(engine.store.config, exists)
    if missing:
        ir.async_create_issue(
            hass, DOMAIN, "missing_entities", is_fixable=False, severity=ir.IssueSeverity.WARNING,
            translation_key="missing_entities",
            translation_placeholders={"details": "; ".join(f"{p}: {', '.join(e)}" for p, e in missing.items())},
        )
    else:
        ir.async_delete_issue(hass, DOMAIN, "missing_entities")
