"""Resynchronisation after an outage (issue #52, docs/SPEC.md § 5.8)."""

from __future__ import annotations

from copy import deepcopy

import pytest
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResultType

from custom_components.weekly_planner import engine as engine_module
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.resync import Decision, Expected, settle_manual_change

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
    hass.states.async_set("cover.s2", "unavailable", {})
    hass.config.language = "fr"
    text = resync_lines(hass, await engine.async_plan_resync(), engine.tz)
    assert "Sera envoyé (1)" in text and "Laissé tel quel (1)" in text and "indisponible" in text
    assert "(depuis 26/10 17:00)" in text


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
