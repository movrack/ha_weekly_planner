"""Migration of the stored data, version 1 (typed setpoints, common modes) -> 2 (actions)."""

from __future__ import annotations

import logging

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.migration import convert_setpoint, migrate_config_v1, migrate_runtime_v1

from .helpers import local, setup

THERMOSTAT = "climate.thermostat_bureau"
VOLET = "cover.bureau_volet_low_speed"

MODES = [
    {"id": "climate_eco", "type": "climate", "name": "Eco", "value": {"kind": "preset", "preset": "eco"}, "exceptions": {}},
    {"id": "cover_open", "type": "cover", "name": "Open", "value": {"kind": "open"}, "exceptions": {}},
    {"id": "cover_closed", "type": "cover", "name": "Closed", "value": {"kind": "close"}, "exceptions": {}},
    {"id": "cover_favorite", "type": "cover", "name": "Favorite", "value": {"kind": "position", "position": 30},
     "exceptions": {"cover.other": {"kind": "position", "position": 60}}},
    {"id": "light_on", "type": "light", "name": "On", "value": {"kind": "on"}, "exceptions": {}},
]


def week(slots):
    return [[dict(s) for s in slots] for _ in range(7)]


def slot(sid, start, end, by_type=None, by_entity=None):
    return {"id": sid, "start": {"time": start}, "end": {"time": end} if end else None, "conditions": [],
            "actions": {"by_type": by_type or {}, "by_entity": by_entity or {}}}


def prod_config():
    """The two real programs of the house, as stored by 0.5.x."""
    return {
        "vacation": False,
        "modes": MODES,
        "programs": [
            {"id": "bureau", "name": "Bureau", "priority": 10, "enabled": True, "reapply": True, "main_type": "climate",
             "created_at": "2026-10-01T00:00:00+00:00", "revision": 4, "conditions": [], "active_profile": "base",
             "entities": [{"entity_id": THERMOSTAT, "force_permanent": True, "grace_s": 360,
                           "default": {"kind": "setpoint", "value": {"kind": "temperature", "temperature": 15}}}],
             "profiles": [{"id": "base", "name": "Base", "days": week([
                 slot("m", "07:00", "09:00", by_entity={THERMOSTAT: {"kind": "temperature", "temperature": 18}}),
                 slot("s", "17:00", "22:00", by_entity={THERMOSTAT: {"kind": "temperature", "temperature": 18}}),
             ])}]},
            {"id": "volet", "name": "Volet du bureau", "priority": 10, "enabled": True, "reapply": True,
             "main_type": "cover", "created_at": "2026-10-02T00:00:00+00:00", "revision": 2, "conditions": [],
             "active_profile": "base",
             "entities": [{"entity_id": VOLET, "default": {"kind": "none"}}],
             "profiles": [{"id": "base", "name": "Base", "days": week([
                 slot("c", "20:00", None, by_type={"cover": "cover_closed"}),
                 slot("o", "08:00", None, by_type={"cover": "cover_open"}),
             ])}]},
        ],
    }


def by_name(data):
    return {x["name"]: x for x in data["labels"]}


def test_production_programs_are_converted():
    data = migrate_config_v1(prod_config(), "fr")
    assert "modes" not in data
    names = by_name(data)
    assert set(names) == {"18 °C", "15 °C", "Fermer", "Ouvrir"}  # identical actions: ONE label each
    assert names["18 °C"]["action"] == {"kind": "service", "service": "climate.set_temperature", "data": {"temperature": 18}}
    assert names["Fermer"]["action"] == {"kind": "service", "service": "cover.close_cover"}
    bureau, volet = data["programs"]
    assert "main_type" not in bureau
    entity = bureau["entities"][0]
    assert entity == {"entity_id": THERMOSTAT, "default_label": names["15 °C"]["id"], "label_overrides": {}}
    for day in bureau["profiles"][0]["days"]:
        assert [s["label"] for s in day] == [names["18 °C"]["id"]] * 2 and all("actions" not in s for s in day)
    assert volet["entities"][0]["default_label"] is None
    day = volet["profiles"][0]["days"][0]
    assert day[0]["end"] is None and day[1]["end"] is None
    assert [s["label"] for s in day] == [names["Fermer"]["id"], names["Ouvrir"]["id"]]
    assert all(x["color"].startswith("#") and len(x["color"]) == 7 for x in data["labels"])
    assert names["18 °C"]["color"] != names["15 °C"]["color"] and names["Fermer"]["color"] != names["Ouvrir"]["color"]


def test_label_names_follow_the_actions():
    from custom_components.weekly_planner.migration import label_name

    svc = lambda s, **d: {"kind": "service", "service": s, "data": d}  # noqa: E731
    assert label_name(svc("cover.set_cover_position", position=30), "fr") == "Position 30 %"
    assert label_name(svc("light.turn_on", brightness_pct=30), "fr") == "Allumer 30 %"
    assert label_name(svc("light.turn_on"), "fr") == "Allumer" and label_name(svc("switch.turn_off"), "fr") == "Éteindre"
    assert label_name(svc("light.turn_on"), "en") == "Turn on"
    assert label_name({"kind": "scene", "scene": "scene.movie_night"}, "fr") == "Movie night"
    assert label_name(svc("vacuum.start"), "fr") == "vacuum.start"


def test_conversions_by_domain():
    c = convert_setpoint
    assert c("climate.x", {"kind": "preset", "preset": "eco"}) == {
        "kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "eco"}}
    assert c("climate.x", {"kind": "off"})["data"] == {"hvac_mode": "off"}
    assert c("climate.x", {"kind": "hvac_mode", "hvac_mode": "heat"})["service"] == "climate.set_hvac_mode"
    assert c("cover.x", {"kind": "position", "position": 30}) == {
        "kind": "service", "service": "cover.set_cover_position", "data": {"position": 30}}
    assert c("light.x", {"kind": "on", "brightness": 60, "color_temp_kelvin": 2700, "effect": "rainbow"}) == {
        "kind": "service", "service": "light.turn_on",
        "data": {"brightness_pct": 60, "color_temp_kelvin": 2700, "effect": "rainbow"}}
    assert c("light.x", {"kind": "on"}) == {"kind": "service", "service": "light.turn_on"}
    assert c("light.x", {"kind": "off"})["service"] == "light.turn_off"
    for domain in ("switch", "input_boolean", "fan"):
        assert c(f"{domain}.x", {"kind": "on"})["service"] == f"{domain}.turn_on"
        assert c(f"{domain}.x", {"kind": "off"})["service"] == f"{domain}.turn_off"
    assert c("vacuum.x", {"kind": "service", "service": "vacuum.start", "data": {}})["service"] == "vacuum.start"
    assert c("climate.x", {"kind": "scene", "scene": "scene.a"}) == {"kind": "scene", "scene": "scene.a"}
    assert c("climate.x", {"kind": "mystery"}) is None


def test_modes_are_resolved_into_labels_with_device_overrides():
    config = {
        "modes": MODES,
        "programs": [{
            "id": "p", "name": "P", "entities": [
                {"entity_id": "cover.a", "default": {"kind": "mode", "value": "cover_favorite"}},
                {"entity_id": "cover.other", "default": {"kind": "none"}},
                {"entity_id": "light.a", "default": {"kind": "none"}},
            ],
            "profiles": [{"id": "b", "name": "B", "days": week([
                slot("s", "08:00", "10:00", by_type={"cover": "cover_favorite", "light": "light_on"})])}],
        }],
    }
    out = migrate_config_v1(config, "fr")
    names = by_name(out)
    program = out["programs"][0]
    cover, other, light = program["entities"]
    assert cover["default_label"] == names["Position 30 %"]["id"]
    slot_label = program["profiles"][0]["days"][0][0]["label"]
    assert slot_label == names["Position 30 %"]["id"]  # the first entity gives the label
    assert other["label_overrides"] == {slot_label: {  # the exception of the mode, kept for this device
        "kind": "service", "service": "cover.set_cover_position", "data": {"position": 60}}}
    assert light["label_overrides"] == {slot_label: {"kind": "service", "service": "light.turn_on"}}


def test_previous_default_is_dropped_with_one_warning(caplog):
    config = {"modes": [], "programs": [{
        "id": "p", "name": "P", "profiles": [{"id": "b", "name": "B", "days": week([])}],
        "entities": [{"entity_id": "light.a", "default": {"kind": "previous"}},
                     {"entity_id": "light.b", "default": {"kind": "previous"}}]}]}
    with caplog.at_level(logging.WARNING):
        out = migrate_config_v1(config)
    assert [e["default_label"] for e in out["programs"][0]["entities"]] == [None, None]
    warnings = [r for r in caplog.records if r.levelno == logging.WARNING]
    assert len(warnings) == 1 and "light.a" in warnings[0].message and "light.b" in warnings[0].message


def test_runtime_manual_change_state_is_dropped():
    runtime = {"adaptive": {"x": 1}, "entities": {"climate.a": {
        "segment": ["default", "p"], "override": {"origin": "external"}, "grace_until": "x", "outside": {"kind": "off"},
        "target": {"kind": "preset", "preset": "eco"}, "permanent_set": True,
        "service_retry": {"setpoint": {"kind": "service", "service": "a.b"}, "attempt": 1}}}}
    out = migrate_runtime_v1(runtime)
    rt = out["entities"]["climate.a"]
    assert "adaptive" not in out and rt["segment"] == ["default", "p"] and rt["target"] is None
    assert not {"override", "grace_until", "outside", "permanent_set"} & set(rt)
    assert rt["service_retry"]["action"]["service"] == "a.b"


async def test_version_one_file_is_migrated_on_load_and_works(hass, hass_storage, freezer):
    from pytest_homeassistant_custom_component.common import MockConfigEntry

    hass_storage[DOMAIN] = {"version": 1, "minor_version": 1, "key": DOMAIN, "data": prod_config()}
    hass.states.async_set(THERMOSTAT, "heat", {"temperature": 10})
    calls = []

    async def handler(call):
        calls.append(dict(call.data))

    hass.services.async_register("climate", "set_temperature", handler)
    await hass.config.async_update(time_zone="Europe/Brussels")
    freezer.move_to(local(26, 8, 0))
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    store = entry.runtime_data.store
    names = by_name(store.config)
    assert "modes" not in store.config and "18 °C" in names
    assert store.programs[0]["entities"][0]["default_label"] == names["15 °C"]["id"]
