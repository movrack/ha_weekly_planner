"""Follow entity renames and removals so programs never point at a dead entity (spec § 8, S32)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er, issue_registry as ir

from .const import DOMAIN


def rename_entity(config: dict[str, Any], old: str, new: str) -> bool:
    """Replace an entity id everywhere in the configuration; True if anything changed."""
    def swap(reference: dict, key: str = "entity_id") -> bool:
        if reference.get(key) != old:
            return False
        reference[key] = new
        return True

    def swap_action(action: dict) -> bool:
        changed = swap(action, "target_entity_id")
        if action.get("kind") == "scene":
            changed |= swap(action, "scene")
        for source in action.get("data_sources", {}).values():
            changed |= swap(source)
        return changed

    def swap_slot_entities(slot: dict) -> bool:
        """Rewrite ``slot.entities`` (any mode); a rename onto an id already listed leaves one copy."""
        targets = slot.get("entities")
        if not targets:
            return False
        new_targets = list(dict.fromkeys(new if eid == old else eid for eid in targets))
        if new_targets == targets:
            return False
        slot["entities"] = new_targets
        return True

    labels_changed = False
    for label in config.get("labels", []):
        labels_changed |= swap_action(label["action"])
    changed = labels_changed
    for program in config["programs"]:
        program_changed = labels_changed
        program_changed |= swap(program.get("mode_source") or {})
        for condition in program.get("conditions", []):
            program_changed |= swap(condition)
        for entity in program["entities"]:
            program_changed |= swap(entity)
            for source in entity.get("chart_sources", []):
                program_changed |= swap(source)
            for action in entity.get("label_overrides", {}).values():
                program_changed |= swap_action(action)
        for profile in program["profiles"]:
            for day in profile["days"]:
                for slot in day:
                    for condition in slot.get("conditions", []):
                        program_changed |= swap(condition)
                    program_changed |= swap_slot_entities(slot)
        if program_changed:
            program["revision"] = program.get("revision", 0) + 1
        changed |= program_changed
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
        elif data["action"] in ("remove", "create"):
            async_check_missing(hass, engine)  # an entity (re)appearing clears the issue

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
