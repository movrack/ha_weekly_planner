"""Engine with per-device schedules (issue #34, LOT 2): ``slot.entities`` and ``slot.seed``.

Frozen time only (``freezer``), service calls recorded with the targeted entity so a test can prove
that a device never receives another device's action.
"""

from __future__ import annotations

import random
from copy import deepcopy
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.util import dt as dt_util

from custom_components.weekly_planner.checks import program_warnings
from custom_components.weekly_planner.resolver import (
    OccurrenceCache,
    next_transition,
    occurrences_around,
    resolve_entity,
)
from custom_components.weekly_planner.slots import applies
from custom_components.weekly_planner.timeline import day_occurrences, occurrence

from .helpers import CLIMATE, COVER, Recorder, go_to, labels, local, program, setup, slot

TZ = ZoneInfo("Europe/Brussels")
BEDROOM = "climate.bedroom"


class TargetRecorder(Recorder):
    """Recorder that also keeps which entity each call targeted: ``(service, entity_id, data)``."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.targeted: list[tuple[str, str, dict]] = []
        super().__init__(hass)
        hass.states.async_set(BEDROOM, "heat", {"temperature": 10})

    async def _handle(self, call: ServiceCall) -> None:
        await super()._handle(call)
        eids = call.data.get("entity_id")
        for eid in [eids] if isinstance(eids, str) else list(eids or []):
            self.targeted.append((f"{call.domain}.{call.service}", eid, self.calls[-1][1]))

    def to(self, entity_id: str) -> list[tuple[str, dict]]:
        return [(service, data) for service, eid, data in self.targeted if eid == entity_id]


def for_(sl: dict, *entities: str) -> dict:
    return {**sl, "entities": list(entities)}


def owner_program(**kwargs) -> dict:
    """The owner's case: thermostat 15 °C 07:00-22:00 for the climate only, cover closed at 07:00."""
    slots = [for_(slot("thermo", "07:00", "22:00", "t15"), CLIMATE), for_(slot("shut", "07:00", None, "close"), COVER)]
    return program(slots=slots, entities=[
        {"entity_id": CLIMATE, "default_label": "t19", "label_overrides": {}},
        {"entity_id": COVER, "default_label": None, "label_overrides": {}},
    ], **kwargs)


def no_sun(_event, _day):
    return None


# ------------------------------------------------------------------ owner case, frozen time

async def test_owner_case_each_device_gets_only_its_own_action(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    await setup(hass, hass_storage, freezer, [owner_program()], local(26, 6, 0))
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 19})]  # default at start-up
    assert rec.to(COVER) == []
    rec.targeted.clear()
    await go_to(hass, freezer, local(26, 7, 0))
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 15})]
    # the cover one-shot lies inside the thermostat slot: per-device trimming keeps it
    assert rec.to(COVER) == [("cover.close_cover", {})]
    await go_to(hass, freezer, local(26, 12, 0))
    assert len(rec.to(COVER)) == 1 and len(rec.to(CLIMATE)) == 1  # sent once
    rec.targeted.clear()
    await go_to(hass, freezer, local(26, 22, 0))
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 19})]  # default, climate only
    assert rec.to(COVER) == []  # cover untouched (no default of its own)
    assert all(not service.startswith("climate.") for service, _ in rec.to(COVER))


async def test_owner_case_next_action_differs_per_device(hass, hass_storage, freezer):
    TargetRecorder(hass)
    engine = await setup(hass, hass_storage, freezer, [owner_program()], local(26, 6, 0))
    at = local(26, 6, 30).astimezone(dt_util.UTC)
    climate, cover = engine.next_action(CLIMATE, at), engine.next_action(COVER, at)
    seven = local(26, 7, 0).astimezone(dt_util.UTC).isoformat()
    assert climate["at"] == cover["at"] == seven
    assert climate["label"] == "t15" and climate["action"]["service"] == "climate.set_temperature"
    assert cover["label"] == "close" and cover["action"]["service"] == "cover.close_cover"
    at = local(26, 8, 0).astimezone(dt_util.UTC)
    assert engine.next_action(CLIMATE, at)["at"] == local(26, 22, 0).astimezone(dt_util.UTC).isoformat()
    assert engine.next_action(COVER, at)["at"] == local(27, 7, 0).astimezone(dt_util.UTC).isoformat()
    status = engine.program_status("office")
    assert set(status["next_actions"]) == {CLIMATE, COVER}


async def test_cover_one_shot_is_caught_up_after_a_restart(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    engine = await setup(hass, hass_storage, freezer, [owner_program()], local(26, 6, 50))
    rec.targeted.clear()
    # Home Assistant was down across 07:00: the next pass sees last_tick < 07:00 <= now
    freezer.move_to(local(26, 7, 10))
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    assert rec.to(COVER) == [("cover.close_cover", {})]
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 15})]
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    assert rec.to(COVER) == [("cover.close_cover", {})]  # never re-run


async def test_one_shot_is_not_sent_to_an_unlisted_device(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    entities = [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in (CLIMATE, BEDROOM)]
    prog = program(slots=[for_(slot("shot", "05:00", None, "boost"), BEDROOM)], entities=entities)
    await setup(hass, hass_storage, freezer, [prog], local(26, 4, 0))
    await go_to(hass, freezer, local(26, 5, 30))
    # same domain, same label compatibility: only the list decides
    assert rec.to(BEDROOM) == [("climate.set_preset_mode", {"preset_mode": "boost"})]
    assert rec.to(CLIMATE) == []


async def test_priority_counts_only_slots_that_apply_to_the_device(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    both = [{"entity_id": eid, "default_label": None, "label_overrides": {}} for eid in (CLIMATE, COVER)]
    p1 = program("p1", slots=[for_(slot("heat", "08:00", "12:00", "t21"), CLIMATE)], priority=1, entities=both)
    p2 = program("p2", slots=[slot("open", "08:00", "12:00", "open")], priority=20,
                 entities=[{"entity_id": COVER, "default_label": None, "label_overrides": {}}])
    engine = await setup(hass, hass_storage, freezer, [p1, p2], local(26, 7, 0))
    await go_to(hass, freezer, local(26, 9, 0))
    assert engine.segment(CLIMATE).program_id == "p1"
    assert engine.segment(COVER).key[:3] == ("slot", "p2", "open")  # P1's climate slot does not win
    assert rec.to(COVER) == [("cover.open_cover", {})]
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 21})]


async def test_overnight_slot_from_the_previous_day_with_lists(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    slots = [for_(slot("night", "22:00", "06:00", "t21"), CLIMATE), for_(slot("dark", "23:00", "05:00", "close"), COVER)]
    prog = program(slots=slots, entities=[{"entity_id": CLIMATE, "default_label": "t19", "label_overrides": {}},
                                          {"entity_id": COVER, "default_label": "open", "label_overrides": {}}])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 21, 0))
    await go_to(hass, freezer, local(27, 1, 0))
    climate, cover = engine.segment(CLIMATE), engine.segment(COVER)
    # both overlap in time but target different devices: both run, started the day before
    assert climate.slot_id == "night" and climate.start == local(26, 22, 0)
    assert cover.slot_id == "dark" and cover.start == local(26, 23, 0)
    rec.targeted.clear()
    await go_to(hass, freezer, local(27, 5, 30))
    assert rec.to(COVER) == [("cover.open_cover", {})] and rec.to(CLIMATE) == []
    await go_to(hass, freezer, local(27, 6, 30))
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 19})]


# ------------------------------------------------------------------ pure resolver

def _resolve(prog_list, eid, at, labels_by_id=None):
    labels_by_id = labels_by_id or {lab["id"]: lab for lab in labels()}

    def res(prog, entity_id, label_id):
        from custom_components.weekly_planner.actions import resolve_action

        domain = entity_id.split(".")[0]
        return resolve_action(prog, entity_id, label_id, labels_by_id,
                              lambda e, a: a.get("kind") != "service" or a["service"].startswith(domain + "."))

    return resolve_entity(eid, prog_list, res, at, TZ, no_sun, lambda conds: True)


def test_dst_day_with_solar_slots_and_lists():
    """25 October 2026: the clock goes back at 03:00. Device timelines equal the slots of the device alone."""
    day = date(2026, 10, 25)

    def sun(event, d):
        return {"sunrise": datetime(d.year, d.month, d.day, 8, 17, 40, tzinfo=TZ),
                "sunset": datetime(d.year, d.month, d.day, 17, 3, 5, tzinfo=TZ)}.get(event)

    slots = [
        {"id": "dawn", "start": {"sun": "sunrise", "offset": -20}, "end": {"time": "12:00"}, "label": "t21",
         "entities": [CLIMATE]},
        {"id": "night", "start": {"time": "01:30"}, "end": {"time": "04:00"}, "label": "close", "entities": [COVER]},
        {"id": "eve", "start": {"sun": "sunset"}, "end": {"time": "23:00"}, "label": "t19"},  # both devices
        {"id": "late", "start": {"sun": "sunset", "random_minutes": 30}, "end": {"time": "22:00"}, "label": "open",
         "entities": [COVER]},
    ]
    profile = {"id": "base", "days": [slots] * 7}
    noon = datetime(2026, 10, 25, 12, tzinfo=TZ)
    for eid in (CLIMATE, COVER):
        timeline = occurrences_around(profile, noon, TZ, sun, days=(0,), program_id="p", entity_id=eid)
        alone = day_occurrences([s for s in slots if applies(s, eid)], day, TZ, sun, identity=("p", "base"))
        assert [occ for occ, _ in timeline] == alone
    cover = {occ.slot_id: occ for occ, _ in
             occurrences_around(profile, noon, TZ, sun, days=(0,), program_id="p", entity_id=COVER)}
    assert cover["night"].end - cover["night"].start == timedelta(hours=3, minutes=30)  # repeated hour counted
    assert cover["late"].ignored == "overlap"  # overlaps "eve" on the cover itself
    climate = {occ.slot_id: occ for occ, _ in
               occurrences_around(profile, noon, TZ, sun, days=(0,), program_id="p", entity_id=CLIMATE)}
    assert climate["dawn"].start == datetime(2026, 10, 25, 7, 57, tzinfo=TZ)
    assert "late" not in climate and climate["eve"].runs  # the cover's slot never trims the climate


def test_next_transition_is_the_union_of_device_timelines():
    """A global trim would hide the cover slot (inside the thermostat slot); the union keeps its edges."""
    slots = [for_(slot("thermo", "07:00", "22:00", "t15"), CLIMATE), for_(slot("cv", "08:00", "09:00", "close"), COVER)]
    prog = program(slots=slots, entities=[{"entity_id": e, "default_label": None, "label_overrides": {}}
                                          for e in (CLIMATE, COVER)])
    assert next_transition([prog], local(26, 7, 30), TZ, no_sun) == local(26, 8, 0)
    assert next_transition([prog], local(26, 8, 30), TZ, no_sun) == local(26, 9, 0)
    assert next_transition([prog], local(26, 9, 30), TZ, no_sun) == local(26, 22, 0)


def test_programs_without_lists_keep_one_timeline():
    prog = program(slots=[slot("a", "07:00", "12:00"), slot("b", "11:00", "14:00"), slot("c", "11:30", None)])
    profile = prog["profiles"][0]
    now = local(26, 9, 0)
    plain = occurrences_around(profile, now, TZ, no_sun, program_id="office")
    cache = OccurrenceCache()
    for eid in (CLIMATE, COVER, None):
        assert occurrences_around(profile, now, TZ, no_sun, program_id="office", entity_id=eid) == plain
        assert occurrences_around(profile, now, TZ, no_sun, program_id="office", entity_id=eid, cache=cache) == plain
    assert next_transition([prog], now, TZ, no_sun) == local(26, 12, 0)


def test_cache_shares_one_trim_per_group_of_devices(monkeypatch):
    from custom_components.weekly_planner import resolver

    calls = []
    original = resolver.trim
    monkeypatch.setattr(resolver, "trim", lambda placed: calls.append(1) or original(placed))
    ids = [f"climate.d{i}" for i in range(6)]
    slots = [for_(slot("x", "07:00", "08:00"), *ids[:3]), for_(slot("y", "09:00", "10:00"), *ids[3:])]
    profile = {"id": "base", "days": [slots] * 7}
    cache = OccurrenceCache()
    for eid in ids * 2:
        cache.day(profile, date(2026, 10, 26), TZ, no_sun, "p", eid)
    assert len(calls) == 2  # two groups of devices, each trimmed once


def test_seed_keeps_the_random_draw_of_a_split_slot():
    base = {"id": "s1", "start": {"time": "07:00", "random_minutes": 45}, "end": {"time": "09:00"}, "label": "t21"}
    copy = {**deepcopy(base), "id": "s1-copy", "seed": "s1", "entities": [COVER]}
    other = {**deepcopy(base), "id": "s1-copy"}
    day = date(2026, 10, 26)
    first = occurrence(base, day, TZ, no_sun, identity=("p", "base"))
    assert occurrence(copy, day, TZ, no_sun, identity=("p", "base")).start == first.start
    draws = {occurrence({**base, "id": f"s{i}"}, day, TZ, no_sun, identity=("p", "base")).start for i in range(20)}
    assert len(draws) > 1  # the id still drives the draw without a seed
    assert occurrence(other, day, TZ, no_sun).start == occurrence(other, day, TZ, no_sun).start


# ------------------------------------------------------------------ D2: re-send only what changed

DEVICES = (CLIMATE, BEDROOM, "climate.kitchen")


def _random_program(rng: random.Random) -> dict:
    slots = []
    for n in range(rng.randint(2, 7)):
        start = rng.randrange(0, 23 * 60, 15)
        end = (start + rng.randrange(15, 10 * 60, 15)) % (24 * 60)
        item = {"id": f"s{n}", "start": {"time": f"{start // 60:02d}:{start % 60:02d}"},
                "end": None if rng.random() < 0.2 else {"time": f"{end // 60:02d}:{end % 60:02d}"},
                "label": rng.choice(["t15", "t19", "t21", "t25", "boost"]), "conditions": []}
        if rng.random() < 0.3:
            item["start"]["random_minutes"] = rng.choice([5, 20])
        if rng.random() < 0.6:
            item["entities"] = sorted(rng.sample(DEVICES, rng.randint(1, 2)))
        slots.append(item)
    return program(slots=slots, entities=[{"entity_id": e, "default_label": "t19", "label_overrides": {}}
                                          for e in DEVICES])


def _edit_for(rng: random.Random, prog: dict, target: str) -> dict:
    """An edit made from the row of ``target``: own slots changed, shared slots split copy-on-write."""
    new = deepcopy(prog)
    for day in new["profiles"][0]["days"]:
        for item in list(day):
            if not applies(item, target):
                continue
            mine = {**deepcopy(item), "entities": [target]}
            mine["label"] = rng.choice(["t15", "t25", "boost"])
            if mine["end"] is not None and rng.random() < 0.5:
                mine["end"] = {"time": f"{rng.randrange(0, 24):02d}:{rng.choice([0, 30]):02d}"}
            if item.get("entities") == [target]:
                day[day.index(item)] = mine  # only this device: edited in place
                continue
            others = [e for e in (item.get("entities") or DEVICES) if e != target]
            day[day.index(item)] = {**item, "entities": others}  # kept part keeps id (and draw)
            mine["id"], mine["seed"] = f"{item['id']}-{target}", item.get("seed") or item["id"]
            day.append(mine)
        if rng.random() < 0.3:
            day.append({"id": f"new-{target}", "start": {"time": "23:30"}, "end": None, "label": "boost",
                        "conditions": [], "entities": [target]})
    return new


def test_d2_property_edit_on_one_device_leaves_the_others_unchanged():
    rng = random.Random(34)
    moments = [local(26, 0) + timedelta(minutes=10 * i) for i in range(6 * 24 * 2)]
    for _ in range(60):
        before = _random_program(rng)
        target = rng.choice(DEVICES)
        after = _edit_for(rng, before, target)
        for eid in DEVICES:
            if eid == target:
                continue
            for at in moments:
                assert _resolve([before], eid, at) == _resolve([after], eid, at), (eid, at)
            profile_b, profile_a = before["profiles"][0], after["profiles"][0]
            assert ([o for o, _ in occurrences_around(profile_b, local(26, 12), TZ, no_sun, days=range(-1, 8),
                                                      program_id="office", entity_id=eid)]
                    == [o for o, _ in occurrences_around(profile_a, local(26, 12), TZ, no_sun, days=range(-1, 8),
                                                         program_id="office", entity_id=eid)])


async def test_d2_editing_the_cover_slot_does_not_resend_the_thermostat(hass, hass_storage, freezer):
    rec = TargetRecorder(hass)
    engine = await setup(hass, hass_storage, freezer, [owner_program()], local(26, 9, 0))
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 15})]
    hass.states.async_set(CLIMATE, "heat", {"temperature": 23})  # manual change on the thermostat
    rec.targeted.clear()
    edited = deepcopy(engine.store.programs[0])
    for day in edited["profiles"][0]["days"]:
        day[:] = [{**s, "start": {"time": "08:30"}} if s["id"] == "shut" else s for s in day]
        day.append({"id": "eve", "start": {"time": "22:30"}, "end": None, "label": "open", "conditions": [],
                    "entities": [COVER]})
    engine.store.programs[0] = edited
    engine.store.save_config()
    await engine.async_config_changed()
    await hass.async_block_till_done()
    assert rec.to(CLIMATE) == []  # its segment and target did not change: manual 23 °C is kept
    # editing the thermostat's own slot re-sends to the thermostat only
    edited = deepcopy(edited)
    for day in edited["profiles"][0]["days"]:
        day[:] = [{**s, "label": "t21"} if s["id"] == "thermo" else s for s in day]
    engine.store.programs[0] = edited
    engine.store.save_config()
    await engine.async_config_changed()
    await hass.async_block_till_done()
    assert rec.to(CLIMATE) == [("climate.set_temperature", {"temperature": 21})]
    assert rec.to(COVER) == []


async def test_d2_without_lists_an_unrelated_edit_resends_nothing(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    rec.calls.clear()
    edited = deepcopy(engine.store.programs[0])
    edited["profiles"][0]["days"][3].append(slot("thu", "18:00", "19:00", "t25"))
    engine.store.programs[0] = edited
    engine.store.save_config()
    await engine.async_config_changed()
    await hass.async_block_till_done()
    assert rec.calls == []


# ------------------------------------------------------------------ status and warnings

async def test_skip_next_names_the_device_and_action(hass, hass_storage, freezer):
    TargetRecorder(hass)
    slots = [for_(slot("thermo", "07:00", "22:00", "t15"), CLIMATE), for_(slot("cv", "08:00", "09:00", "close"), COVER)]
    prog = program(slots=slots, entities=[{"entity_id": e, "default_label": None, "label_overrides": {}}
                                          for e in (CLIMATE, COVER)])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 7, 30))
    engine.skip_next("office")
    status = engine.program_status("office")
    assert status["skip_next"] == local(26, 8, 0).astimezone(dt_util.UTC).isoformat()
    assert [(t["entity_id"], t["label"]) for t in status["skip_next_targets"]] == [(COVER, "close")]
    assert status["skip_next_targets"][0]["action"]["service"] == "cover.close_cover"


async def test_incompatible_label_warning_only_for_slots_of_the_device(hass, hass_storage, freezer):
    TargetRecorder(hass)
    engine = await setup(hass, hass_storage, freezer, [owner_program()], local(26, 6, 0))
    engine.descriptions = {"cover": {"close_cover": {"target": {"entity": {"domain": "cover"}}}},
                           "climate": {"set_temperature": {"target": {"entity": {"domain": "climate"}}}}}
    prog = engine.store.programs[0]
    codes = [(w["entity_id"], w["code"]) for w in program_warnings(hass, engine.store.programs, prog, engine)]
    assert (CLIMATE, "incompatible_label") not in codes  # "close" targets the cover only
    assert (COVER, "incompatible_label") not in codes  # "15 °C" targets the climate only
    shared = deepcopy(prog)
    for day in shared["profiles"][0]["days"]:
        day[:] = [{k: v for k, v in s.items() if k != "entities"} if s["id"] == "thermo" else s for s in day]
    warnings = program_warnings(hass, engine.store.programs, shared, engine)
    assert [(w["entity_id"], w["detail"]) for w in warnings if w["code"] == "incompatible_label"] == [(COVER, "t15")]
