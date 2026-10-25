"""Warnings shown in the card: other pilots of the same entity, risky device settings (spec § 6.2, § 9)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant


def program_warnings(hass: HomeAssistant, programs: list[dict], program: dict) -> list[dict[str, Any]]:
    """Never blocking: each warning is {entity_id, code, detail}."""
    try:
        from homeassistant.components.automation import automations_with_entity
    except ImportError:  # automation integration not loaded
        automations_with_entity = None  # type: ignore[assignment]

    warnings: list[dict[str, Any]] = []
    managed = {e["entity_id"] for p in programs if p.get("enabled", True) for e in p["entities"]}
    schedules = [s for s in hass.states.async_all("switch")
                 if s.entity_id.startswith("switch.schedule_") and s.state != "off"]

    for entity in program["entities"]:
        eid = entity["entity_id"]
        others = [p["name"] for p in programs if p["id"] != program["id"] and p.get("enabled", True)
                  and any(e["entity_id"] == eid for e in p["entities"])]
        if others:
            warnings.append({"entity_id": eid, "code": "other_program", "detail": ", ".join(others)})
        if automations_with_entity is not None and "automation" in hass.config.components:
            autos = [a for a in automations_with_entity(hass, eid)
                     if (st := hass.states.get(a)) is not None and st.state == "on"]
            if autos:
                warnings.append({"entity_id": eid, "code": "automation", "detail": ", ".join(sorted(autos))})
        sched = [s.entity_id for s in schedules if eid in (s.attributes.get("entities") or [])]
        if sched:
            warnings.append({"entity_id": eid, "code": "scheduler", "detail": ", ".join(sched)})

        state = hass.states.get(eid)
        if state is None:
            warnings.append({"entity_id": eid, "code": "missing", "detail": ""})
            continue
        over = state.attributes.get("vtherm_over_climate") or {}
        if over.get("follow_underlying_temp_change"):
            warnings.append({"entity_id": eid, "code": "vt_follow_underlying", "detail": ""})
        underlying = [u for u in over.get("underlying_entities") or [] if u in managed]
        if underlying:
            warnings.append({"entity_id": eid, "code": "vt_underlying_scheduled", "detail": ", ".join(underlying)})
        lock = state.attributes.get("lock_manager")
        if isinstance(lock, dict) and lock.get("is_locked") and lock.get("lock_automations"):
            warnings.append({"entity_id": eid, "code": "vt_locked", "detail": ""})
    return warnings
