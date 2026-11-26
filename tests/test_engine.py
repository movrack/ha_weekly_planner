"""Engine scenarios in a real Home Assistant test instance with simulated time."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.util import dt as dt_util

from custom_components.weekly_planner.const import DOMAIN

from .helpers import (
    CLIMATE,
    COVER,
    Recorder,
    go_to,
    label,
    labels,
    local,
    program,
    setup,
    slot,
    temp,
    tick,
)


async def test_start_of_slot_and_default_at_its_end(hass, hass_storage, freezer):  # S1
    rec = Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})]  # outside slots: default
    await go_to(hass, freezer, local(26, 8, 0))
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 21})
    await go_to(hass, freezer, local(26, 12, 0))
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 15})  # the default
    assert len(rec.calls) == 3


async def test_no_default_sends_nothing_at_the_end(hass, hass_storage, freezer):
    rec = Recorder(hass)
    await setup(hass, hass_storage, freezer, [program(default=None)], local(26, 7, 0))
    assert rec.calls == []
    await go_to(hass, freezer, local(26, 8, 0))
    assert len(rec.calls) == 1
    await go_to(hass, freezer, local(26, 12, 0))
    assert len(rec.calls) == 1  # no default: nothing at the end


async def test_scene_slot_then_default(hass, hass_storage, freezer):
    rec = Recorder(hass)
    slots = [slot("s", "08:00", "10:00", "work")]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 7, 0))
    await go_to(hass, freezer, local(26, 8, 0))
    assert rec.calls[-1] == ("scene.turn_on", {})  # the scene is the target of the call
    await go_to(hass, freezer, local(26, 10, 0))
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 15})


async def test_one_shot_runs_once_and_is_never_rerun(hass, hass_storage, freezer):  # S24, S29
    rec = Recorder(hass)
    slots = [slot("shot", "05:00", None, "boost")]
    engine = await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 4, 0))
    rec.calls.clear()  # the default sent at start-up
    await go_to(hass, freezer, local(26, 5, 0))
    assert rec.calls == [("climate.set_preset_mode", {"preset_mode": "boost"})]
    await go_to(hass, freezer, local(26, 6, 0))
    assert len(rec.calls) == 1  # no end, nothing undone
    for reason in ("startup", "modification", "profile"):
        await engine.async_recompute(reason)
    assert [c for c in rec.calls if c[0] == "climate.set_preset_mode"] == [
        ("climate.set_preset_mode", {"preset_mode": "boost"})]  # nothing replays it by itself
    await engine.async_apply_now("office")  # the resynchronisation exception (spec 5.8): the last one-shot, < 24 h
    await hass.async_block_till_done()
    assert [c for c in rec.calls if c[0] == "climate.set_preset_mode"] == [
        ("climate.set_preset_mode", {"preset_mode": "boost"})] * 2


async def test_reapply_on_resends_the_current_action(hass, hass_storage, freezer):  # S7
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(reapply=True)], local(26, 9, 0))
    assert rec.calls == [("climate.set_temperature", {"temperature": 21})]  # start-up inside a slot
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    assert len(rec.calls) == 2


async def test_reapply_off_waits_for_the_next_transition(hass, hass_storage, freezer):  # S7
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program(reapply=False)], local(26, 9, 0))
    await engine.async_recompute("startup")
    await engine.async_recompute("modification")
    assert rec.calls == []
    await go_to(hass, freezer, local(26, 12, 0))
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})]


async def test_reapply_after_a_program_edit(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass)
    freezer.move_to(local(26, 9, 0))
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    rec.calls.clear()
    edited = engine.store.programs[0]
    edited["profiles"][0]["days"][0][0]["label"] = "t19"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": edited})
    assert (await ws.receive_json())["success"]
    await hass.async_block_till_done()
    assert rec.calls == [("climate.set_temperature", {"temperature": 19})]


async def test_no_override_a_manual_change_is_ignored(hass, hass_storage, freezer):  # S5
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(26, 8, 30))
    count = len(rec.calls)
    hass.states.async_set(CLIMATE, "heat", {"temperature": 25})  # someone changes it
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(minutes=10))  # nothing watches it, nothing is retried
    assert len(rec.calls) == count
    assert "override" not in engine.rt(CLIMATE) and not engine.rt(CLIMATE).get("retry_at")
    await go_to(hass, freezer, local(26, 12, 0))
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 15})  # the end still runs


async def test_contiguous_slots_both_send_their_action(hass, hass_storage, freezer):  # S39
    rec = Recorder(hass)
    slots = [slot("a", "06:00", "08:00", "t19"), slot("b", "08:00", "10:00", "t19")]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 6, 30))
    count = len(rec.calls)
    await go_to(hass, freezer, local(26, 8, 0))
    assert len(rec.calls) == count + 1


async def test_external_change_stays_until_the_next_boundary(hass, hass_storage, freezer):  # #76
    rec = Recorder(hass)
    extra = [*labels(), label("t18", temp(18)), label("t17", temp(17))]
    slots = [slot("a", "10:00", "20:00", "t18"), slot("b", "20:00", "21:00", "t17")]
    await setup(hass, hass_storage, freezer, [program(slots=slots)], local(26, 10, 30), extra_labels=extra)
    assert rec.calls[-1][1] == {"temperature": 18}
    count = len(rec.calls)
    hass.states.async_set(CLIMATE, "heat", {"temperature": 20})  # someone else sets 20 °C
    await go_to(hass, freezer, local(26, 12, 0))
    assert len(rec.calls) == count  # nothing is sent, nothing is undone
    await go_to(hass, freezer, local(26, 20, 0))
    assert len(rec.calls) == count + 1
    assert rec.calls[-1][1] == {"temperature": 17}  # the planner takes control back


async def test_priority_hand_back(hass, hass_storage, freezer):  # S9
    rec = Recorder(hass)
    low = program("low", [slot("l", "08:00", "20:00", "t19")], priority=20)
    high = program("high", [slot("h", "10:00", "12:00", "t25")], priority=1)
    await setup(hass, hass_storage, freezer, [low, high], local(26, 9, 0))
    assert rec.calls[-1][1] == {"temperature": 19}
    await go_to(hass, freezer, local(26, 10, 0))
    assert rec.calls[-1][1] == {"temperature": 25}
    await go_to(hass, freezer, local(26, 12, 0))
    assert rec.calls[-1][1] == {"temperature": 19}  # the lower program takes over, not the default


async def test_vacation_sends_the_default_once(hass, hass_storage, freezer):  # S12
    rec = Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    await hass.services.async_call("switch", "turn_on", {"entity_id": "switch.weekly_planner_vacation"}, blocking=True)
    await hass.async_block_till_done()
    assert rec.calls[-1] == ("climate.set_temperature", {"temperature": 15})
    count = len(rec.calls)
    await go_to(hass, freezer, local(27, 9, 0))
    assert len(rec.calls) == count  # programs suspended


async def test_unavailable_then_back(hass, hass_storage, freezer):  # S13
    rec = Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], local(26, 7, 0))
    hass.states.async_set(CLIMATE, "unavailable", {})
    await go_to(hass, freezer, local(26, 8, 0))
    assert rec.calls[-1][1] == {"temperature": 15}  # nothing sent while unavailable
    hass.states.async_set(CLIMATE, "heat", {"temperature": 10})
    await hass.async_block_till_done()
    await hass.async_block_till_done()
    assert rec.calls[-1][1] == {"temperature": 21}


async def test_cover_close_open_one_shots(hass, hass_storage, freezer):
    rec = Recorder(hass)
    slots = [slot("c", "20:00", None, "close"), slot("o", "08:00", None, "open")]
    prog = program("cover", slots, entities=[{"entity_id": COVER, "default_label": None, "label_overrides": {}}])
    await setup(hass, hass_storage, freezer, [prog], local(26, 7, 0))
    await go_to(hass, freezer, local(26, 8, 0))
    await go_to(hass, freezer, local(26, 20, 0))
    assert rec.services == ["cover.open_cover", "cover.close_cover"]


# -- start / stop slots (issue #93): one setting at the start, another one at the end ----------------------------

CAR_ON = [{"entity_id": "sensor.outside", "op": "lt", "value": 10}]


def _car(conditions: list | None = None) -> dict:
    """Saturday-like slot every day: 10:30 start (21 degrees), 11:00 stop (19 degrees); no rest-of-the-time."""
    return program(slots=[slot("car", "10:30", "11:00", "t21", conditions, end_label="t19")], default=None)


def _temps(rec: Recorder) -> list:
    return [data["temperature"] for name, data in rec.calls if name == "climate.set_temperature"]


async def test_start_stop_slot_sends_its_start_setting_then_its_end_setting(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 10, 30))
    assert _temps(rec) == [21]
    assert engine.segment(CLIMATE).key == ("default", "office")  # no lasting state: nothing restored at the end
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [21, 19]
    await go_to(hass, freezer, local(26, 12, 0))
    assert _temps(rec) == [21, 19]


async def test_start_stop_condition_blocks_the_start_only(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("sensor.outside", "15")
    await setup(hass, hass_storage, freezer, [_car(CAR_ON)], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [19]  # too warm: no start, the stop still goes out


async def test_start_stop_program_condition_blocks_the_start_only(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("sensor.outside", "15")
    prog = _car()
    prog["conditions"] = CAR_ON
    await setup(hass, hass_storage, freezer, [prog], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [19]


async def test_start_stop_timed_pause_blocks_the_start_not_the_end(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await engine.async_pause("office", 1)
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [19]


async def test_start_stop_disabled_program_sends_nothing(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await engine.async_set_enabled("office", False)
    await go_to(hass, freezer, local(26, 11, 30))
    assert _temps(rec) == []


async def test_start_stop_committed_end_goes_out_after_the_program_is_disabled(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 10, 30))
    assert engine.store.runtime["ends"][0]["at"] == local(26, 11, 0).astimezone(dt_util.UTC).isoformat()
    await engine.async_set_enabled("office", False)
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [21, 19]
    assert engine.store.runtime["ends"] == []


async def test_start_stop_committed_end_goes_out_after_the_slot_is_deleted(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 10, 30))
    for day in engine.store.program("office")["profiles"][0]["days"]:
        day.clear()
    await engine.async_config_changed()
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [21, 19]


async def test_start_stop_committed_end_survives_a_restart(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    await go_to(hass, freezer, local(26, 10, 30))
    entry = hass.config_entries.async_entries(DOMAIN)[0]
    for day in engine.store.program("office")["profiles"][0]["days"]:
        day.clear()  # the restarted engine no longer knows the slot: only the stored end can send the stop
    engine.store.save_config()
    await tick(hass, freezer, timedelta(seconds=2))  # the delayed writes reach the storage, as on a shutdown
    assert await hass.config_entries.async_reload(entry.entry_id)
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert hass.config_entries.async_entries(DOMAIN)[0].runtime_data.store.runtime["ends"]
    await go_to(hass, freezer, local(26, 11, 0))
    assert _temps(rec) == [21, 19]


async def test_start_stop_end_is_the_next_action_after_the_start(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [_car()], local(26, 10, 0))
    assert engine.program_status("office")["next_actions"][CLIMATE]["label"] == "t21"
    await go_to(hass, freezer, local(26, 10, 30))
    status = engine.program_status("office")
    assert status["next_actions"][CLIMATE]["label"] == "t19"
    assert status["committed_ends"] == [{"entity_id": CLIMATE, "at": local(26, 11, 0).astimezone(dt_util.UTC).isoformat(),
                                         "label": "t19", "slot_id": "car"}]
