"""Resynchronisation after an outage (issue #52, docs/SPEC.md § 5.8)."""

from __future__ import annotations

from copy import deepcopy
from datetime import UTC, datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import pytest
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResultType

from custom_components.weekly_planner import engine as engine_module
from custom_components.weekly_planner import resync
from custom_components.weekly_planner.actions import resolve_action
from custom_components.weekly_planner.const import DEFAULT_PRIORITY, DOMAIN
from custom_components.weekly_planner.resolver import OccurrenceCache
from custom_components.weekly_planner.resync import (
    Decision,
    Expected,
    expected_state,
    settle_manual_change,
)

from .helpers import CLIMATE, Recorder, act, label, labels, local, program, setup, slot

COVERS = [f"cover.s{i}" for i in range(1, 7)]


@pytest.fixture(autouse=True)
def no_spacing(monkeypatch):
    monkeypatch.setattr(engine_module, "RESYNC_SPACING_S", 0)


class FakeHistory:
    """Stands for the recorder: the devices a person changed."""

    def __init__(self, changed=()):
        self.changed = set(changed)
        self.asked: list[tuple] = []

    async def async_changed_by_person(self, entity_id, since, until):
        self.asked.append((entity_id, since, until))
        return entity_id in self.changed


def covers(entities=COVERS, default=None) -> list[dict]:
    return [{"entity_id": eid, "default_label": default, "label_overrides": {}} for eid in entities]


def shutters(slots=None, entities=COVERS, **kwargs) -> dict:
    """Open at 08:00 and close at 17:00, both one-shots."""
    slots = slots if slots is not None else [slot("up", "08:00", None, "open"), slot("down", "17:00", None, "close")]
    return program("shutters", slots=slots, entities=covers(entities), default=None, **kwargs)


def targets(hass) -> list:
    """(service, entity) of every service call from now on."""
    seen: list = []

    @callback
    def on_call(event):
        data = event.data["service_data"]
        entity = data.get("entity_id")
        if event.data["domain"] in ("cover", "climate", "scene", "light"):
            seen.append((f"{event.data['domain']}.{event.data['service']}", entity))

    hass.bus.async_listen("call_service", on_call)
    return seen


async def start(hass, hass_storage, freezer, programs, moment, **kwargs):
    rec = Recorder(hass)
    for eid in COVERS:
        hass.states.async_set(eid, "open", {})
    engine = await setup(hass, hass_storage, freezer, programs, moment, **kwargs)
    engine.history = FakeHistory()
    rec.calls.clear()
    return engine, rec


def by_entity(plan) -> dict:
    return {item["entity_id"]: item for item in plan}


async def test_nine_hour_outage_six_shutters(hass, hass_storage, freezer):
    """The 08:00 and 17:00 one-shots were lost: after the outage the last one (close) goes to the six."""
    engine, rec = await start(hass, hass_storage, freezer, [shutters()], local(26, 18))
    seen = targets(hass)
    plan = await engine.async_plan_resync()
    assert [i["entity_id"] for i in plan] == COVERS and all(i["send"] and i["kind"] == "one_shot" for i in plan)
    assert {i["label"] for i in plan} == {"close"}
    assert rec.calls == []  # planning sends nothing
    result = await engine.async_resync()
    await hass.async_block_till_done()
    assert result == {"sent": COVERS, "skipped": []}
    assert [c[0] for c in rec.calls] == ["cover.close_cover"] * 6
    assert sorted(e if isinstance(e, str) else e[0] for _s, e in seen) == COVERS  # one command per device


async def test_no_older_one_shot_is_replayed(hass, hass_storage, freezer):
    """At 10:00 the last one is 'open' (08:00); the 17:00 of yesterday is not replayed."""
    engine, _rec = await start(hass, hass_storage, freezer, [shutters()], local(26, 10))
    assert {i["label"] for i in await engine.async_plan_resync()} == {"open"}


async def test_manual_change_seen_in_history_skips_that_device(hass, hass_storage, freezer):
    engine, rec = await start(hass, hass_storage, freezer, [shutters()], local(26, 18))
    engine.history = FakeHistory({"cover.s2"})
    plan = by_entity(await engine.async_plan_resync())
    assert plan["cover.s2"]["send"] is False and plan["cover.s2"]["reason"] == "manual_change"
    assert all(plan[e]["send"] for e in COVERS if e != "cover.s2")
    _entity, since, until = engine.history.asked[0]
    assert since == local(26, 17) and until.timestamp() == local(26, 18).timestamp() + 31  # since the one-shot
    result = await engine.async_resync()
    await hass.async_block_till_done()
    assert "cover.s2" not in result["sent"] and len(rec.calls) == 5
    assert {"entity_id": "cover.s2", "reason": "manual_change"} in result["skipped"]


async def test_no_visible_intervention_applies(hass, hass_storage, freezer):
    engine, _rec = await start(hass, hass_storage, freezer, [shutters()], local(26, 18))
    engine.history = FakeHistory()
    assert all(i["send"] for i in await engine.async_plan_resync())


async def test_paused_and_switched_off_programs_are_ignored(hass, hass_storage, freezer):
    paused = shutters(entities=["cover.s1"])
    paused["enabled"], paused["paused_until"] = False, "2099-01-01T00:00:00+00:00"
    paused["id"] = "paused"
    off = shutters(entities=["cover.s2"])
    off["enabled"], off["id"] = False, "off"
    live = shutters(entities=["cover.s3"])
    live["id"] = "live"
    engine, rec = await start(hass, hass_storage, freezer, [paused, off, live], local(26, 18))
    plan = by_entity(await engine.async_plan_resync())
    assert plan["cover.s1"]["reason"] == "paused" and plan["cover.s2"]["reason"] == "off"
    assert plan["cover.s3"]["send"]
    result = await engine.async_resync()
    assert result["sent"] == ["cover.s3"] and len(rec.calls) == 1


async def test_global_pause_is_ignored(hass, hass_storage, freezer):
    engine, _rec = await start(hass, hass_storage, freezer, [shutters()], local(26, 18))
    engine.store.config["vacation"] = True
    assert {i["reason"] for i in await engine.async_plan_resync()} == {"vacation"}


async def test_same_command_is_never_sent_twice_to_one_device(hass, hass_storage, freezer):
    """Two entities whose label points at the same target with the same command: one call."""
    twin = label("twin", {"kind": "service", "service": "cover.close_cover", "target_entity_id": "cover.s1"})
    engine, rec = await start(
        hass, hass_storage, freezer,
        [program("p", slots=[slot("d", "17:00", None, "twin")], entities=covers(["cover.s2", "cover.s3"]), default=None)],
        local(26, 18), extra_labels=[*labels(), twin])
    plan = by_entity(await engine.async_plan_resync())
    assert plan["cover.s2"]["send"] and plan["cover.s3"]["reason"] == "duplicate"
    await engine.async_resync()
    await hass.async_block_till_done()
    assert len(rec.calls) == 1


async def test_one_entity_in_two_programs_gets_one_command(hass, hass_storage, freezer):
    a, b = shutters(entities=["cover.s1"]), shutters(entities=["cover.s1"], priority=3)
    a["id"], b["id"] = "a", "b"
    engine, rec = await start(hass, hass_storage, freezer, [a, b], local(26, 18))
    plan = await engine.async_plan_resync()
    assert len(plan) == 1 and plan[0]["program_id"] == "b"  # the strongest program owns it
    await engine.async_resync()
    await hass.async_block_till_done()
    assert len(rec.calls) == 1


def monday_only(prog: dict, slots: list) -> dict:
    prog["profiles"][0]["days"] = [list(slots) if d == 0 else [] for d in range(7)]
    return prog


async def test_one_shot_older_than_24_hours_is_too_old(hass, hass_storage, freezer):
    prog = monday_only(shutters(entities=["cover.s1"]), [slot("up", "05:00", None, "open")])
    engine, _ = await start(hass, hass_storage, freezer, [prog], local(27, 4))  # Tuesday 04:00: 23 h
    assert (await engine.async_plan_resync())[0]["send"]
    freezer.move_to(local(27, 6))  # 25 h
    plan = await engine.async_plan_resync()
    assert plan[0]["send"] is False and plan[0]["reason"] == "too_old"


async def test_timed_schedule_is_sent_even_when_already_in_that_state(hass, hass_storage, freezer):
    prog = program(slots=[slot("s1", "08:00", "12:00", "t21")])
    engine, rec = await start(hass, hass_storage, freezer, [prog], local(26, 10))
    engine.hass.states.async_set(CLIMATE, "heat", {"temperature": 21})  # already as expected
    plan = await engine.async_plan_resync()
    assert plan[0]["send"] and plan[0]["kind"] == "slot" and plan[0]["slot_id"] == "s1"
    result = await engine.async_resync()
    await hass.async_block_till_done()
    assert result["sent"] == [CLIMATE] and rec.calls == [("climate.set_temperature", {"temperature": 21})]


async def test_timed_schedule_ignores_the_manual_check(hass, hass_storage, freezer):
    engine, _ = await start(hass, hass_storage, freezer, [program()], local(26, 10))
    engine.history = FakeHistory({CLIMATE})
    assert (await engine.async_plan_resync())[0]["send"]
    assert engine.history.asked == []


async def test_default_applies_outside_schedules(hass, hass_storage, freezer):
    engine, _rec = await start(hass, hass_storage, freezer, [program()], local(26, 14))
    item = (await engine.async_plan_resync())[0]
    assert item["kind"] == "default" and item["action"]["data"] == {"temperature": 15}
    assert item["start"] is not None  # the end of the 08:00-12:00 schedule


async def test_one_shot_after_a_schedule_end_beats_the_default(hass, hass_storage, freezer):
    prog = program(slots=[slot("s1", "08:00", "10:00", "t21"), slot("shot", "11:00", None, "boost")])
    engine, _ = await start(hass, hass_storage, freezer, [prog], local(26, 12))
    assert (await engine.async_plan_resync())[0]["kind"] == "one_shot"


async def test_one_shot_before_a_schedule_end_loses_to_the_default(hass, hass_storage, freezer):
    prog = program(slots=[slot("shot", "07:00", None, "boost"), slot("s1", "08:00", "10:00", "t21")])
    engine, _ = await start(hass, hass_storage, freezer, [prog], local(26, 12))
    assert (await engine.async_plan_resync())[0]["kind"] == "default"


async def test_simultaneous_one_shots_are_told_apart_by_priority(hass, hass_storage, freezer):
    weak = shutters(entities=["cover.s1"], slots=[slot("x", "17:00", None, "open")], priority=10)
    strong = shutters(entities=["cover.s1"], slots=[slot("y", "17:00", None, "close")], priority=2)
    weak["id"], strong["id"] = "weak", "strong"
    engine, _ = await start(hass, hass_storage, freezer, [weak, strong], local(26, 18))
    assert (await engine.async_plan_resync())[0]["label"] == "close"


async def test_one_shot_under_a_stronger_running_schedule_is_skipped(hass, hass_storage, freezer):
    strong = program("strong", slots=[slot("s", "08:00", "20:00", "t19")], priority=1)
    weak = program("weak", slots=[slot("shot", "09:00", None, "boost")], priority=10)
    engine, _ = await start(hass, hass_storage, freezer, [strong, weak], local(26, 12))
    item = (await engine.async_plan_resync())[0]
    assert item["kind"] == "slot" and item["program_id"] == "strong"


async def test_one_shot_of_a_stronger_program_beats_a_later_running_schedule_only_if_more_recent(hass, hass_storage, freezer):
    strong = program("strong", slots=[slot("shot", "09:00", None, "boost")], priority=1)
    weak = program("weak", slots=[slot("s", "08:00", "20:00", "t19")], priority=10)
    engine, _ = await start(hass, hass_storage, freezer, [strong, weak], local(26, 12))
    assert (await engine.async_plan_resync())[0]["kind"] == "one_shot"  # 09:00 is after 08:00


def moded() -> dict:
    prog = program("modes", slots=[slot("a", "08:00", "12:00", "t21")])
    prog["profiles"][0]["name"] = "Home"
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[slot("b", "08:00", "12:00", "t19")] for _ in range(7)]})
    return prog


MODE_CONFIG = {"mode_selector": "input_select.house", "default_mode": "Home"}


async def test_active_mode_decides_the_expected_state(hass, hass_storage, freezer):
    hass.states.async_set("input_select.house", "Away", {"options": ["Home", "Away"]})
    engine, _ = await start(hass, hass_storage, freezer, [moded()], local(26, 10), config=MODE_CONFIG)
    assert (await engine.async_plan_resync())[0]["action"]["data"] == {"temperature": 19}


async def test_lost_selector_falls_back_to_the_default_mode(hass, hass_storage, freezer):
    hass.states.async_set("input_select.house", "unavailable", {})
    engine, _ = await start(hass, hass_storage, freezer, [moded()], local(26, 10), config=MODE_CONFIG)
    assert (await engine.async_plan_resync())[0]["action"]["data"] == {"temperature": 21}


async def test_unavailable_entity_is_left_alone(hass, hass_storage, freezer):
    engine, _ = await start(hass, hass_storage, freezer, [shutters()], local(26, 18))
    hass.states.async_set("cover.s3", "unavailable", {})
    plan = by_entity(await engine.async_plan_resync())
    assert plan["cover.s3"]["send"] is False and plan["cover.s3"]["reason"] == "unavailable"
    result = await engine.async_resync()
    assert "cover.s3" not in result["sent"]


async def test_apply_now_service_returns_sent_and_skipped(hass, hass_storage, freezer):
    other = shutters(entities=["cover.s1"])
    other["id"] = "other"
    _engine, rec = await start(hass, hass_storage, freezer, [shutters(entities=COVERS[1:]), other], local(26, 18))
    hass.states.async_set("cover.s4", "unavailable", {})
    response = await hass.services.async_call(
        DOMAIN, "apply_now", {"program_id": "shutters"}, blocking=True, return_response=True)
    await hass.async_block_till_done()
    assert response == {"sent": ["cover.s2", "cover.s3", "cover.s5", "cover.s6"],
                        "skipped": [{"entity_id": "cover.s4", "reason": "unavailable"}]}
    assert len(rec.calls) == 4


async def test_spacing_waits_between_commands(hass, hass_storage, freezer, monkeypatch):
    engine, _ = await start(hass, hass_storage, freezer, [shutters(entities=COVERS[:3])], local(26, 18))
    sleeps = []

    async def fake_sleep(seconds):
        sleeps.append(seconds)

    monkeypatch.setattr(engine_module.asyncio, "sleep", fake_sleep)
    monkeypatch.setattr(engine_module, "RESYNC_SPACING_S", 2.0)
    await engine.async_resync()
    assert sleeps == [2.0, 2.0]  # between the commands, not after the last


async def test_settle_manual_change_only_looks_at_one_shots():
    class Boom:
        async def async_changed_by_person(self, *args):
            raise AssertionError("not asked")

    from datetime import UTC, datetime
    now = datetime(2026, 10, 26, 12, tzinfo=UTC)
    slot_state = Decision(Expected("slot", "p", "s", None, act("cover.open_cover"), now))
    assert await settle_manual_change(slot_state, "cover.x", now, Boom()) is slot_state
    shot = Decision(Expected("one_shot", "p", "s", None, act("cover.open_cover"), now))
    assert await settle_manual_change(shot, "cover.x", now, None) is shot  # no history: apply
    assert deepcopy(shot) == shot


# -- options flow -----------------------------------------------------------------------------


async def test_options_step_lists_the_plan_then_sends_on_validation(hass, hass_storage, freezer):
    _engine, rec = await start(hass, hass_storage, freezer, [shutters(entities=COVERS[:2])], local(26, 18))
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.MENU
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
    assert result["type"] is FlowResultType.FORM and result["step_id"] == "resync"
    plan = result["description_placeholders"]["plan"]
    assert "cover.s1" in plan and "cover.s2" in plan and "cover.close_cover" in plan
    await hass.async_block_till_done()
    assert rec.calls == []  # nothing sent before the confirmation
    result = await flow.async_configure(result["flow_id"], {})
    await hass.async_block_till_done()
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "resync_done"
    assert result["description_placeholders"] == {"count": "2"} and len(rec.calls) == 2


async def test_options_step_with_nothing_to_send(hass, hass_storage, freezer):
    _engine, _rec = await start(hass, hass_storage, freezer, [shutters(entities=["cover.s1"])], local(26, 18))
    hass.states.async_set("cover.s1", "unavailable", {})
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    flow = hass.config_entries.options
    result = await flow.async_init(entry.entry_id)
    result = await flow.async_configure(result["flow_id"], {"next_step_id": "resync"})
    assert result["type"] is FlowResultType.ABORT and result["reason"] == "resync_nothing"


async def test_plan_text_in_french_with_reasons(hass, hass_storage, freezer):
    from custom_components.weekly_planner.messages import resync_lines
    engine, _ = await start(hass, hass_storage, freezer, [shutters(entities=["cover.s1", "cover.s2"])], local(26, 18))
    hass.states.async_set("cover.s2", "unavailable", {"friendly_name": "Volet cuisine"})
    hass.config.language = "fr"
    text = resync_lines(hass, await engine.async_plan_resync(), engine.tz)
    assert "Sera envoyé maintenant (1)" in text and "Laissé tel quel (1)" in text and "indisponible" in text
    assert "(depuis 26/10 17:00)" in text
    assert "Volet cuisine" in text and "cover.s2" not in text  # plain device name, not the entity id


def test_every_resync_reason_has_a_text_in_both_languages():
    from custom_components.weekly_planner.messages import _MESSAGES
    from custom_components.weekly_planner.resync import SKIP_REASONS
    for lang in ("en", "fr"):
        assert all(f"resync_reason_{r}" in _MESSAGES[lang] for r in SKIP_REASONS)


def test_translations_have_the_resync_step_in_both_languages():
    import json
    from pathlib import Path
    folder = Path(__file__).parents[1] / "custom_components" / "weekly_planner" / "translations"
    for name in ("en", "fr"):
        options = json.loads((folder / f"{name}.json").read_text())["options"]
        assert set(options["step"]["init"]["menu_options"]) == {"settings", "resync"}
        assert "{plan}" in options["step"]["resync"]["description"]
        assert {"resync_done", "resync_nothing"} <= set(options["abort"])


# -- real recorder (in-memory database) -------------------------------------------------------


async def test_recorder_history_sees_a_person_but_not_the_planner(hass, tmp_path):
    from datetime import timedelta

    from homeassistant.components.recorder import get_instance
    from homeassistant.core import Context
    from homeassistant.helpers.recorder import async_initialize_recorder
    from homeassistant.setup import async_setup_component
    from homeassistant.util import dt as dt_util

    from custom_components.weekly_planner.resync import RecorderManualChanges

    async_initialize_recorder(hass)
    assert await async_setup_component(hass, "recorder", {"recorder": {"db_url": f"sqlite:///{tmp_path / 'h.db'}"}})
    await hass.async_block_till_done()
    history = RecorderManualChanges(hass)
    assert history.available
    since = dt_util.utcnow() - timedelta(seconds=5)
    hass.states.async_set("cover.a", "open")
    hass.states.async_set("cover.a", "unavailable", context=Context(user_id="0123456789abcdef0123456789abcdef"))  # outage: ignored
    hass.states.async_set("cover.b", "open")
    hass.states.async_set("cover.b", "closed", context=Context(user_id="0123456789abcdef0123456789abcdef"))  # a person
    await hass.async_block_till_done()
    await get_instance(hass).async_block_till_done()
    until = dt_util.utcnow() + timedelta(seconds=5)
    assert await history.async_changed_by_person("cover.a", since, until) is False
    assert await history.async_changed_by_person("cover.b", since, until) is True
    assert await history.async_changed_by_person("cover.b", until, until + timedelta(seconds=1)) is False


async def test_recorder_history_without_recorder_sees_nothing(hass):
    from datetime import UTC, datetime

    from custom_components.weekly_planner.resync import RecorderManualChanges

    now = datetime.now(UTC)
    assert await RecorderManualChanges(hass).async_changed_by_person("cover.a", now, now) is False


TZ = ZoneInfo("Europe/Brussels")
E = "climate.office"
LABELS = {
    "comfort": {"id": "comfort", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "comfort"}}},
    "eco": {"id": "eco", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "eco"}}},
    "night": {"id": "night", "action": {"kind": "service", "service": "climate.set_preset_mode", "data": {"preset_mode": "night"}}},
}


def no_sun(_event, _day):
    return None


def conditions_pass(_conditions):
    return True


def at(h, m=0, day=28):
    return datetime(2026, 10, day, h, m, tzinfo=TZ).astimezone(UTC)


def rule_slot(sid, start, end=None, label="comfort", **extra):
    item = {"id": sid, "start": {"time": start}, "label": label, **extra}
    if end:
        item["end"] = {"time": end}
    return item


def rule_prog(pid, slots, *, priority=10, created="2026-01-01", default="eco", entities=(E,), week=None, **extra):
    days = week if week is not None else [list(slots) for _ in range(7)]
    item = {
        "id": pid, "priority": priority, "enabled": True, "conditions": [], "created_at": created,
        "entities": [{"entity_id": e, "default_label": default, "label_overrides": {}} for e in entities],
        "profiles": [{"id": "p", "name": "Base", "days": days}],
    }
    item.update(extra)
    return item


def rule_resolve(program, entity_id, label_id):
    return resolve_action(program, entity_id, label_id, LABELS)


def rule_decide(programs, now, **kwargs):
    kwargs.setdefault("sun", no_sun)
    kwargs.setdefault("conditions_ok", conditions_pass)
    tz = kwargs.pop("tz", TZ)
    return expected_state(E, programs, rule_resolve, now, tz, kwargs.pop("sun"), kwargs.pop("conditions_ok"), **kwargs)


def decided_label(decision):
    return decision.expected.action["data"]["preset_mode"]


# -- who is considered ------------------------------------------------------------------------


def test_vacation_is_only_skipped_when_asked():
    programs = [rule_prog("a", [rule_slot("s", "08:00")])]
    assert rule_decide(programs, at(9), vacation=True) == Decision(reason="vacation")
    assert rule_decide(programs, at(9)).expected is not None


def test_a_program_without_enabled_key_counts_as_enabled_and_off_or_paused_is_told_apart():
    plain = rule_prog("a", [rule_slot("s", "08:00")])
    del plain["enabled"]
    assert rule_decide([plain], at(9)).expected.program_id == "a"
    assert rule_decide([rule_prog("a", [], enabled=False)], at(9)) == Decision(reason="off")
    assert rule_decide([rule_prog("a", [], enabled=False, paused_until="2026-11-01T00:00:00+00:00")], at(9)) == Decision(reason="paused")
    assert rule_decide([rule_prog("a", [], enabled=False, paused_until=None)], at(9)) == Decision(reason="off")


def test_priority_then_creation_date_decide_simultaneous_starts_and_missing_values_have_defaults():
    old = rule_prog("old", [rule_slot("s", "08:00", label="comfort")], priority=DEFAULT_PRIORITY)
    del old["created_at"]
    young = rule_prog("young", [rule_slot("s", "08:00", label="night")], created="2026-05-01")
    young["priority"] = DEFAULT_PRIORITY
    for order in ([old, young], [young, old]):
        assert rule_decide(order, at(9)).expected.program_id == "old"
    no_priority = rule_prog("none", [rule_slot("s", "08:00", label="comfort")])
    del no_priority["priority"]
    other = rule_prog("other", [rule_slot("s", "08:00", label="night")], priority=DEFAULT_PRIORITY)
    assert rule_decide([no_priority, other], at(9)).expected is not None
    urgent = rule_prog("urgent", [rule_slot("s", "08:00", label="comfort")], priority=1)
    late = rule_prog("late", [rule_slot("s", "08:00", label="night")], priority=2)
    assert rule_decide([late, urgent], at(9)).expected.program_id == "urgent"


def test_the_last_fired_wins_among_equal_programs_and_among_one_shots_of_one_program():
    a = rule_prog("a", [rule_slot("s", "08:00", label="comfort")])
    b = rule_prog("b", [rule_slot("s", "08:00", label="night")], created="2026-01-01")
    assert rule_decide([a, b], at(9)).expected.program_id == "b"
    twin = rule_prog("t", [rule_slot("first", "08:00", label="comfort"), rule_slot("second", "08:00", label="night")])
    best = rule_decide([twin], at(9)).expected
    assert (best.slot_id, decided_label(Decision(expected=best))) == ("second", "night")


def test_a_running_slot_and_a_one_shot_of_an_equal_program_starting_together_pick_the_one_shot():
    running = rule_prog("run", [rule_slot("long", "08:00", "12:00", label="comfort")])
    shot = rule_prog("shot", [rule_slot("once", "08:00", label="night")])
    got = rule_decide([running, shot], at(9)).expected
    assert (got.kind, got.program_id) == ("one_shot", "shot")


def test_a_running_slot_is_expected_with_its_ids_label_and_start():
    got = rule_decide([rule_prog("a", [rule_slot("long", "08:00", "12:00", label="comfort")])], at(9)).expected
    assert (got.kind, got.program_id, got.slot_id, got.label, got.start) == ("slot", "a", "long", "comfort", at(8))
    assert got.action["data"] == {"preset_mode": "comfort"}


def test_a_one_shot_carries_its_slot_id_label_and_start():
    got = rule_decide([rule_prog("a", [rule_slot("once", "08:00", label="night")])], at(9)).expected
    assert (got.kind, got.slot_id, got.label, got.start) == ("one_shot", "once", "night", at(8))


# -- the one-shot window ----------------------------------------------------------------------


def test_a_one_shot_starting_exactly_now_counts_and_one_exactly_24_hours_old_is_too_old():
    programs = [rule_prog("a", [rule_slot("once", "08:00", label="night")])]
    assert rule_decide(programs, at(8)).expected.kind == "one_shot"
    assert rule_decide(programs, at(7, 59)).expected.kind == "one_shot"  # yesterday's 08:00 is 23 h 59 old
    week = [[], [], [], [], [], [], []]
    week[2] = [rule_slot("once", "08:00", label="night")]  # Wednesday only
    only_wed = [rule_prog("a", [], week=week, default="eco")]
    assert rule_decide(only_wed, at(8, 0, 29)).expected.kind == "default"  # a day later, exactly 24 h
    week_tue = [[], [], [], [], [], [], []]
    week_tue[1] = [rule_slot("once", "08:00", label="night")]
    none = rule_prog("a", [], week=week_tue, default=None)
    assert rule_decide([none], at(8, 0, 28)) == Decision(reason="too_old")
    assert rule_decide([none], at(7, 59, 28)).expected.kind == "one_shot"


def test_nothing_to_do_is_no_action_or_too_old():
    assert rule_decide([rule_prog("a", [], default=None)], at(9)) == Decision(reason="no_action")


# -- the default and where it starts --------------------------------------------------------------


def test_the_default_starts_when_the_last_schedule_ended_even_two_days_ago():
    week = [[rule_slot("mon", "08:00", "09:00")], [], [], [], [], [], []]  # Monday only; now is Wednesday
    got = rule_decide([rule_prog("a", [], week=week)], at(10)).expected
    assert (got.kind, got.program_id, got.label, got.start) == ("default", "a", "eco", at(9, 0, 26))
    assert got.slot_id is None


def test_a_schedule_ending_exactly_now_starts_the_default_now_and_a_later_one_does_not_count():
    got = rule_decide([rule_prog("a", [rule_slot("s", "07:00", "08:00")])], at(8)).expected
    assert (got.kind, got.start) == ("default", at(8))
    later = rule_prog("a", [rule_slot("s", "17:00", "18:00")], week=[[rule_slot("s", "17:00", "18:00")] if i == 2 else [] for i in range(7)])
    got = rule_decide([later], at(10)).expected
    assert (got.kind, got.start) == ("default", None)


def test_a_one_shot_at_the_exact_end_of_the_last_schedule_does_not_beat_the_default():
    p = rule_prog("a", [rule_slot("t", "07:00", "08:00"), rule_slot("o", "08:00", label="night")])
    # at 08:30 the one-shot is running: it competes (it started after... exactly at the end: the default stays)
    got = rule_decide([p], at(8, 30)).expected
    assert got.kind == "default"


def test_the_end_of_an_earlier_schedule_of_the_same_program_does_not_hide_a_later_one_shot():
    p = rule_prog("a", [rule_slot("t", "06:00", "07:00"), rule_slot("o", "08:00", label="night")])
    got = rule_decide([p], at(9)).expected
    assert (got.kind, got.slot_id) == ("one_shot", "o")


def test_a_slot_listed_after_a_future_one_is_still_read():
    p = rule_prog("a", [rule_slot("future", "17:00", label="night"), rule_slot("past", "08:00", label="comfort")])
    assert rule_decide([p], at(9)).expected.slot_id == "past"


def test_a_slot_whose_label_has_no_action_is_skipped_not_the_rest():
    p = rule_prog("a", [rule_slot("bad", "06:00", label="unknown"), rule_slot("good", "07:00", label="night")])
    assert rule_decide([p], at(9)).expected.slot_id == "good"


def test_conditions_of_the_program_and_of_the_slot_are_asked_and_skip_only_what_fails():
    asked = []

    def conditions(conds):
        asked.append(list(conds))
        return "no" not in conds

    blocked = rule_prog("blocked", [rule_slot("s", "08:00", label="night")], conditions=["no"], priority=1)
    fine = rule_prog("fine", [rule_slot("s", "07:00", label="comfort")], priority=2)
    assert rule_decide([blocked, fine], at(9), conditions_ok=conditions).expected.program_id == "fine"
    shot = rule_prog("a", [rule_slot("a1", "08:00", label="night", conditions=["no"]), rule_slot("a2", "07:00", label="comfort")])
    assert rule_decide([shot], at(9), conditions_ok=conditions).expected.slot_id == "a2"
    assert ["no"] in asked


def test_a_program_or_slot_without_conditions_is_asked_with_an_empty_list():
    def strict(conds):
        assert conds == []
        return True

    bare = rule_prog("a", [{"id": "s", "start": {"time": "08:00"}, "label": "night"}])
    del bare["conditions"]
    assert rule_decide([bare], at(9), conditions_ok=strict).expected.slot_id == "s"


def test_a_one_shot_under_a_higher_priority_running_slot_is_skipped_but_an_equal_priority_one_is_not():
    top = rule_prog("top", [rule_slot("long", "07:00", "12:00", label="comfort")], priority=1)
    low = rule_prog("low", [rule_slot("once", "08:00", label="night")], priority=5)
    assert rule_decide([top, low], at(9)).expected.program_id == "top"
    same = rule_prog("same", [rule_slot("once", "08:00", label="night")], priority=1, created="2026-02-01")
    assert rule_decide([top, same], at(9)).expected.program_id == "same"


def test_a_slot_that_does_not_apply_to_the_device_is_ignored_and_one_that_does_is_kept():
    other = rule_prog("a", [rule_slot("o", "08:00", label="night", entities=["climate.other"])])
    assert rule_decide([other], at(9)).expected.kind == "default"
    mine = rule_prog("a", [rule_slot("o", "08:00", label="night", entities=[E])])
    assert rule_decide([mine], at(9)).expected.slot_id == "o"


def test_other_entities_programs_are_not_considered():
    other = rule_prog("a", [rule_slot("o", "08:00", label="night")], entities=("climate.other",))
    assert rule_decide([other], at(9)) == Decision(reason="off")


def test_the_time_zone_and_the_sun_reach_the_placement():
    p = rule_prog("a", [{"id": "s", "start": {"sun": "sunset"}, "label": "night"}])

    def sun(event, day):
        return datetime(day.year, day.month, day.day, 16, 0, tzinfo=UTC) if event == "sunset" else None

    got = rule_decide([p], at(18), sun=sun).expected  # 17:00 local is 16:00 UTC
    assert (got.kind, got.start) == ("one_shot", datetime(2026, 10, 28, 16, 0, tzinfo=UTC))
    fixed = rule_decide([rule_prog("a", [rule_slot("s", "08:00", "12:00")])], at(9)).expected
    assert fixed.start == datetime(2026, 10, 28, 7, 0, tzinfo=UTC)  # 08:00 local, not 08:00 UTC


def test_an_own_cache_is_used_and_filled():
    cache = OccurrenceCache()
    rule_decide([rule_prog("a", [rule_slot("s", "08:00")])], at(9), cache=cache)
    assert cache._days


def test_a_profile_chosen_by_the_active_profiles_is_the_one_read():
    p = rule_prog("a", [rule_slot("base", "08:00", label="night")])
    p["profiles"].append({"id": "alt", "name": "Alt", "days": [[rule_slot("alt", "08:30", label="comfort")] for _ in range(7)]})
    assert rule_decide([p], at(9), active_profiles={"a": "alt"}).expected.slot_id == "alt"
    assert rule_decide([p], at(9)).expected.slot_id == "base"


def test_the_holiday_reaches_the_placement():
    from custom_components.weekly_planner.resolver import Holiday

    p = rule_prog("a", [rule_slot("normal", "08:00", label="night")])
    p["profiles"][0]["holiday"] = {"day": [rule_slot("off", "08:30", label="comfort")]}
    assert rule_decide([p], at(9), holiday=Holiday(day=datetime(2026, 10, 28).date())).expected.slot_id == "off"
    assert rule_decide([p], at(9)).expected.slot_id == "normal"
    timed = rule_prog("a", [rule_slot("normal", "08:00", "12:00", label="night")])
    timed["profiles"][0]["holiday"] = {"day": [rule_slot("off", "08:30", "12:00", label="comfort")]}
    assert rule_decide([timed], at(9), holiday=Holiday(day=datetime(2026, 10, 28).date())).expected.slot_id == "off"
    assert rule_decide([timed], at(9)).expected.slot_id == "normal"


# -- the history check --------------------------------------------------------------------------


class _History:
    def __init__(self):
        self.asked = []

    async def async_changed_by_person(self, entity_id, since, until):
        self.asked.append(entity_id)
        return True


async def test_a_one_shot_is_checked_against_the_device_the_action_targets():
    history = _History()
    got = rule_decide([rule_prog("a", [rule_slot("o", "08:00", label="night")])], at(9)).expected
    got.action["target_entity_id"] = "climate.target"
    result = await settle_manual_change(Decision(expected=got), E, at(9), history)
    assert result == Decision(reason="manual_change") and history.asked == ["climate.target"]
    got.action.pop("target_entity_id")
    await settle_manual_change(Decision(expected=got), E, at(9), history)
    assert history.asked[-1] == E


# -- the recorder query ---------------------------------------------------------------------------


def test_the_recorder_query_is_read_only_inclusive_at_the_end_and_ignores_unavailable(monkeypatch):
    import homeassistant.helpers.recorder as recorder_helpers

    seen = {}

    class Session:
        def execute(self, statement):
            seen["sql"] = str(statement.compile(compile_kwargs={"literal_binds": False}))
            return SimpleNamespace(all=lambda: seen["rows"])

    class Scope:
        def __init__(self, **kwargs):
            seen["kwargs"] = kwargs

        def __enter__(self):
            return Session()

        def __exit__(self, *_):
            return False

    monkeypatch.setattr(recorder_helpers, "session_scope", Scope)
    changes = resync.RecorderManualChanges(SimpleNamespace(config=SimpleNamespace(components={"recorder"})))
    seen["rows"] = [("unavailable", b"u"), ("unknown", b"u"), ("on", None)]
    assert changes._query(E, 1.0, 2.0) is False
    assert seen["kwargs"]["read_only"] is True and seen["kwargs"]["hass"] is changes._hass
    sql = " ".join(seen["sql"].split())
    assert "states.last_updated_ts > :last_updated_ts_1" in sql
    assert "states.last_updated_ts <= :last_updated_ts_2" in sql
    assert "ORDER BY states.last_updated_ts" in sql
    assert "JOIN states_meta ON states.metadata_id = states_meta.metadata_id" in sql
    assert sql.startswith("SELECT states.state, states.context_user_id_bin")
    seen["rows"] = [("on", b"u")]
    assert changes._query(E, 1.0, 2.0) is True
    seen["rows"] = [("unknown", b"u"), ("unavailable", b"u")]
    assert changes._query(E, 1.0, 2.0) is False
    seen["rows"] = [("on", None)]
    assert changes._query(E, 1.0, 2.0) is False


def test_a_zone_other_than_the_system_one_places_the_slots_in_that_zone():
    new_york = ZoneInfo("America/New_York")
    p = rule_prog("a", [rule_slot("s", "08:00", "12:00")], week=None)
    now = datetime(2026, 10, 28, 15, 0, tzinfo=UTC)  # 11:00 in New York (EDT)
    got = rule_decide([p], now, tz=new_york).expected
    assert got.start == datetime(2026, 10, 28, 12, 0, tzinfo=UTC)
    nothing_before = rule_decide([rule_prog("a", [rule_slot("s", "08:00", "12:00")])], datetime(2026, 10, 28, 10, 0, tzinfo=UTC), tz=new_york).expected
    assert nothing_before.kind == "default"
    one_shot = rule_decide([rule_prog("a", [rule_slot("o", "08:00", label="night")])], now, tz=new_york).expected
    assert (one_shot.kind, one_shot.start) == ("one_shot", datetime(2026, 10, 28, 12, 0, tzinfo=UTC))


def test_a_running_slot_without_action_gives_no_action():
    p = rule_prog("a", [rule_slot("long", "08:00", "12:00", label="unknown")], default=None)
    assert rule_decide([p], at(9)) == Decision(reason="no_action")


def test_the_program_and_device_identity_reach_the_placement():
    from custom_components.weekly_planner.resolver import occurrences_around

    start = {"time": "08:00", "random_minutes": 90}
    shot = {"id": "s", "start": start, "label": "night"}
    p = rule_prog("alpha", [shot])
    p["profiles"][0]["days"] = [[shot] for _ in range(7)]
    want = next(o.start for o, _ in occurrences_around(p["profiles"][0], at(23), TZ, no_sun, days=(0,), program_id="alpha"))
    got = rule_decide([p], at(23)).expected
    assert got.start == want
    twin = rule_prog("beta", [shot])
    other = next(o.start for o, _ in occurrences_around(twin["profiles"][0], at(23), TZ, no_sun, days=(0,), program_id="beta"))
    assert rule_decide([twin], at(23)).expected.start == other


def test_a_device_timeline_is_not_trimmed_by_slots_of_other_devices():
    a = rule_slot("mine", "08:00", "12:00", entities=[E], label="comfort")
    b = rule_slot("theirs", "09:00", "10:00", entities=["climate.other"], label="night")
    p = rule_prog("a", [a, b], entities=(E, "climate.other"))
    got = rule_decide([p], at(13)).expected
    assert (got.kind, got.start) == ("default", at(12))


def test_an_ignored_occurrence_does_not_hide_the_ones_after_it():
    # 2026-03-29: 02:30 does not exist in Europe/Brussels (clocks jump from 02:00 to 03:00)
    shots = [rule_slot("gap", "02:30", label="night"), rule_slot("late", "08:00", label="comfort")]
    p = rule_prog("a", shots)
    got = rule_decide([p], datetime(2026, 3, 29, 12, 0, tzinfo=TZ).astimezone(UTC)).expected
    assert got.slot_id == "late"


def test_a_slot_hidden_by_an_overlap_does_not_hide_the_ones_after_it():
    p = rule_prog("a", [rule_slot("long", "06:00", "10:00"), rule_slot("inside", "07:00", label="night"), rule_slot("after", "11:00", label="night")])
    got = rule_decide([p], at(12)).expected
    assert (got.kind, got.slot_id) == ("one_shot", "after")


def test_a_one_shot_is_not_hidden_by_a_slot_of_another_device_only_by_its_own_device_timeline():
    mine = rule_slot("mine", "08:30", label="night", entities=[E])
    theirs = rule_slot("theirs", "07:00", "09:30", entities=["climate.other"])
    p = rule_prog("a", [theirs, mine], entities=(E, "climate.other"))
    got = rule_decide([p], at(9)).expected
    assert (got.kind, got.slot_id) == ("one_shot", "mine")


def test_start_stop_slot_expects_its_start_setting_then_its_end_setting():
    """Issue #93: the start counts as a one-shot, then its end setting; the condition only blocks the start."""
    car = rule_prog("car", [rule_slot("s", "08:00", "10:00", label="comfort", end_label="night",
                                      conditions=[{"entity_id": "sensor.x", "value": 1}])], default=None)
    assert decided_label(rule_decide([car], at(9))) == "comfort"
    assert decided_label(rule_decide([car], at(11))) == "night"
    blocked = rule_decide([car], at(9), conditions_ok=lambda conds: not conds)
    assert decided_label(blocked) == "night" and blocked.expected.start == at(10, day=27)  # yesterday's end
