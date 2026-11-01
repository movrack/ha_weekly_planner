"""Warnings shown in the card: other pilots of the same entity (spec § 9)."""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .slots import applies


def program_warnings(
    hass: HomeAssistant, programs: list[dict], program: dict, engine: Any = None
) -> list[dict[str, Any]]:
    """Never blocking: each warning is {entity_id, code, detail}."""
    try:
        from homeassistant.components.automation import automations_with_entity
    except ImportError:  # automation integration not loaded
        automations_with_entity = None  # type: ignore[assignment]

    warnings: list[dict[str, Any]] = []
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

        if engine is not None:
            labels = engine.labels
            # only the slots that apply to this device (#34): a cover slot never warns the thermostat
            used = ({s["label"] for p in program["profiles"] for d in p["days"] for s in d if applies(s, eid)}
                    | {entity.get("default_label")})
            skipped = sorted(
                labels[lid]["name"] for lid in used
                if lid in labels and engine.resolve(program, eid, lid) is None)
            if skipped:
                warnings.append({"entity_id": eid, "code": "incompatible_label", "detail": ", ".join(skipped)})
        state = hass.states.get(eid)
        if state is None:
            warnings.append({"entity_id": eid, "code": "missing", "detail": ""})
            continue
    return warnings
