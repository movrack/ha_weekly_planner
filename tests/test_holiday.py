"""Day off ("Jour férié", issue #54): placement, validation, engine, websocket, YAML, storage.

No real device is commanded: every service is the test Recorder.
"""

from __future__ import annotations

from copy import deepcopy
from datetime import UTC, date, datetime, timedelta

import pytest
import voluptuous as vol
import yaml
from homeassistant.config_entries import ConfigEntryState
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.modes import (
    check_follows,
    copy_holiday,
    detach_followers,
    profile_for_mode,
    profile_slots,
    set_follow,
)
from custom_components.weekly_planner.registry import rename_entity
from custom_components.weekly_planner.resolver import (
    NO_HOLIDAY,
    Holiday,
    OccurrenceCache,
    day_slots,
    next_transition,
    occurrences_around,
    resolve_entity,
)
from custom_components.weekly_planner.slots import remove_device_from_slots
from custom_components.weekly_planner.validation import (
    ProgramError,
    admin_required,
    check_holiday_config,
    check_program,
    driven_entities,
    label_users,
)

from .helpers import (
    CLIMATE,
    COVER,
    TZ,
    Recorder,
    act,
    label,
    labels,
    local,
    program,
    setup,
    slot,
    tick,
)

DAY_OFF = "input_boolean.day_off"
CONFIG = {"holiday_entity": DAY_OFF, "holiday_invert": False}
MON, TUE, WED = date(2026, 10, 26), date(2026, 10, 27), date(2026, 10, 28)


def no_sun(_event, _day):
    return None


def prof(holiday: dict | None = None) -> dict:
    """Every weekday: night 22:00 -> 06:00 (crosses midnight); Sunday also has 09:00 -> 18:00."""
    days = [[slot("night", "22:00", "06:00", "t19")] for _ in range(7)]
    days[6] = days[6] + [slot("sun", "09:00", "18:00", "t21")]
    profile = {"id": "base", "name": "Base", "days": days}
    if holiday is not None:
        profile["holiday"] = holiday
    return profile


OWN = {"day": [slot("h", "00:00", "10:00", "t25"), slot("hn", "22:00", "06:00", "t21")]}


def running(profile: dict, moment: datetime, holiday: Holiday = NO_HOLIDAY) -> str | None:
    for occ, item in occurrences_around(profile, moment, TZ, no_sun, program_id="p", holiday=holiday):
        if occ.runs and occ.end is not None and occ.start <= moment < occ.end:
            return item["id"]
    return None


def utc(moment: datetime) -> datetime:
    return moment.astimezone(UTC)


# -- one place picks the day ------------------------------------------------------------------


def test_day_slots_picks_the_weekday_a_copy_or_the_own_day():
    plain, copy, own = prof(), prof({"copy": 6}), prof(OWN)
    assert day_slots(plain, TUE, True) is plain["days"][1]  # no setting: the weekday, holiday or not
    assert day_slots(copy, TUE, False) is copy["days"][1]
    assert day_slots(copy, TUE, True) is copy["days"][6]  # live reference to Sunday
    assert day_slots(own, TUE, True) is OWN["day"]
    assert day_slots({**own, "holiday": None}, TUE, True) is own["days"][1]


def test_copy_is_a_live_reference():
    profile = prof({"copy": 6})
    assert running(profile, local(27, 10), Holiday(day=TUE)) == "sun"
    profile["days"][6] = [slot("other", "09:30", "11:00", "t21")]
    assert running(profile, local(27, 10), Holiday(day=TUE)) == "other"


# -- midnight next to a day off: the four combinations ------------------------------------------


def test_normal_then_normal_keeps_the_tail_of_yesterday():
    assert running(prof(OWN), local(27, 3)) == "night"


def test_normal_then_day_off_cuts_yesterday_at_midnight():
    profile = prof(OWN)
    holiday = Holiday(day=TUE)
    assert running(profile, local(27, 3), holiday) == "h"
    monday = [occ for occ, item in occurrences_around(profile, local(27, 3), TZ, no_sun, days=(-1,), holiday=holiday)
              if item["id"] == "night"]
    assert monday[0].start == utc(local(26, 22)) and monday[0].end == utc(local(27, 0))


def test_day_off_then_normal_stops_at_midnight_and_the_next_day_starts_clean():
    profile = prof(OWN)
    assert running(profile, local(27, 23, 30), Holiday(day=TUE)) == "hn"
    tail = [occ for occ, item in occurrences_around(profile, local(27, 23), TZ, no_sun, days=(0,),
                                                     holiday=Holiday(day=TUE)) if item["id"] == "hn"]
    assert tail[0].end == utc(local(28, 0))
    # Wednesday is normal: yesterday (a day off) is computed as a normal day, cut at midnight.
    assert running(profile, local(28, 3), Holiday(after=TUE)) is None
    assert running(profile, local(28, 3), NO_HOLIDAY) == "night"  # without the memory, the tail would run


def test_day_off_then_day_off():
    assert running(prof(OWN), local(28, 3), Holiday(day=WED, after=TUE)) == "h"


def test_a_profile_without_setting_ignores_the_day_off():
    assert running(prof(), local(27, 3), Holiday(day=TUE, after=MON)) == "night"


def test_cut_drops_what_starts_after_midnight_and_short_rests():
    profile = prof({"day": [slot("late", "23:58", "01:00", "t21")]})
    occ = next(o for o, item in occurrences_around(profile, local(27, 12), TZ, no_sun, days=(0,),
                                                holiday=Holiday(day=TUE)) if item["id"] == "late")
    assert occ.ignored == "too_short"


def test_occurrence_cache_key_includes_the_flag():
    profile, cache = prof(OWN), OccurrenceCache()
    normal = cache.day(profile, TUE, TZ, no_sun, "p")
    off = cache.day(profile, TUE, TZ, no_sun, "p", holiday=Holiday(day=TUE))
    assert [s["id"] for _o, s in normal] == ["night"]
    assert [s["id"] for _o, s in off] == ["h", "hn"]
    assert [s["id"] for _o, s in cache.day(profile, TUE, TZ, no_sun, "p")] == ["night"]


def test_dst_on_a_day_off():
    spring = date(2026, 3, 29)  # Brussels: 02:00 -> 03:00
    profile = prof({"day": [slot("gap", "02:30", "04:00", "t21")]})
    noon = datetime(2026, 3, 29, 12, tzinfo=TZ)
    occ = next(o for o, item in occurrences_around(profile, noon, TZ, no_sun, days=(0,), holiday=Holiday(day=spring))
           if item["id"] == "gap")
    assert occ.runs and occ.start == datetime(2026, 3, 29, 1, 30, tzinfo=UTC) and occ.end == datetime(2026, 3, 29, 2, tzinfo=UTC)
    autumn = date(2026, 10, 25)  # Brussels: 03:00 -> 02:00; midnight of the 26th is 23:00 UTC
    profile = prof({"day": [slot("n", "22:00", "06:00", "t21")]})
    noon = datetime(2026, 10, 25, 12, tzinfo=TZ)
    occ = next(o for o, item in occurrences_around(profile, noon, TZ, no_sun, days=(0,), holiday=Holiday(day=autumn))
           if item["id"] == "n")
    assert occ.end == datetime(2026, 10, 25, 23, tzinfo=UTC)


def test_next_transition_on_a_day_off_and_the_day_before():
    program_ = {"id": "p", "enabled": True, "entities": [{"entity_id": CLIMATE}], "profiles": [prof(OWN)]}
    # on the day off: the own day decides (h ends at 10:00)
    assert next_transition([program_], utc(local(27, 7)), TZ, no_sun, holiday=Holiday(day=TUE)) == utc(local(27, 10))
    # the same moment on a normal day
    assert next_transition([program_], utc(local(27, 7)), TZ, no_sun) == utc(local(27, 22))
    # the day before, tomorrow is a normal day: the tail of tonight ends at 06:00
    assert next_transition([program_], utc(local(26, 23)), TZ, no_sun) == utc(local(27, 6))


def test_priorities_are_unchanged_on_a_day_off():
    a = program("a", priority=5, slots=[slot("a", "08:00", "12:00", "t21")])
    a["profiles"][0]["holiday"] = {"day": []}  # day off: nothing for A
    b = program("b", priority=10, slots=[slot("b", "08:00", "12:00", "t19")], default="t25")

    def resolve(_p, _e, label_id):
        return {"label": label_id} if label_id else None

    off = Holiday(day=TUE)
    seg = resolve_entity(CLIMATE, [a, b], resolve, utc(local(27, 9)), TZ, no_sun, lambda c: True, holiday=off)
    assert seg.program_id == "b" and seg.label == "t19"  # B keeps its normal day and drives the device
    seg = resolve_entity(CLIMATE, [a, b], resolve, utc(local(27, 9)), TZ, no_sun, lambda c: True)
    assert seg.program_id == "a"
    seg = resolve_entity(CLIMATE, [a, b], resolve, utc(local(27, 13)), TZ, no_sun, lambda c: True, holiday=off)
    assert seg.key == ("default", "a") and seg.label == "t15"  # the default still belongs to the strongest


# -- validation ---------------------------------------------------------------------------------


LABELS = {lab["id"]: lab for lab in labels()}


def with_holiday(holiday, **kwargs) -> dict:
    prog = program(**kwargs)
    prog["profiles"][0]["holiday"] = holiday
    return prog


def test_holiday_shapes():
    assert check_program(with_holiday({"copy": 0}), LABELS)["profiles"][0]["holiday"] == {"copy": 0}
    assert check_program(with_holiday({"day": []}), LABELS)["profiles"][0]["holiday"] == {"day": []}
    assert "holiday" not in check_program(with_holiday(None), LABELS)["profiles"][0]
    for bad in ({"copy": 7}, {"copy": True}, {"copy": "mon"}, {}, [], {"day": None}, {"off": True}):
        with pytest.raises(vol.Invalid):
            check_program(with_holiday(bad), LABELS)


def test_holiday_day_rules():
    with pytest.raises(ProgramError, match="unknown_label:nope"):
        check_program(with_holiday({"day": [slot("x", "08:00", "09:00", "nope")]}), LABELS)
    with pytest.raises(ProgramError, match="overlapping_slots"):
        check_program(with_holiday({"day": [slot("x", "08:00", "10:00"), slot("y", "09:00", "11:00")]}), LABELS)
    with pytest.raises(ProgramError, match="unknown_slot_entity"):
        check_program(with_holiday({"day": [{**slot("x", "08:00", "09:00"), "entities": [COVER]}]}), LABELS)
    # never checked against its neighbours: yesterday's 23:00 -> 02:00 and the day off's 00:30 -> 08:00
    prog = program(slots=[slot("n", "23:00", "02:00", "t19")])
    prog["profiles"][0]["holiday"] = {"day": [slot("x", "00:30", "08:00")]}
    check_program(prog, LABELS)


def test_holiday_day_with_device_lists_is_scoped():
    entities = [{"entity_id": CLIMATE, "default_label": None, "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}}]
    day = [{**slot("c", "08:00", "10:00", "t21"), "entities": [CLIMATE]},
           {**slot("v", "09:00", "11:00", "close"), "entities": [COVER]}]
    check_program(with_holiday({"day": day}, entities=entities), LABELS)
    day.append({**slot("c2", "09:30", "12:00", "t19"), "entities": [CLIMATE]})
    with pytest.raises(ProgramError, match=f"overlapping_slots:{CLIMATE}"):
        check_program(with_holiday({"day": day}, entities=entities), LABELS)


def test_a_following_mode_cannot_have_its_own_day_off():
    prog = program()
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[] for _ in range(7)], "follows": "Base",
                             "holiday": {"copy": 1}})
    with pytest.raises(ProgramError, match="own day off"):
        check_program(prog, LABELS)


def test_labels_used_by_a_day_off_are_in_use_and_checked_for_admin():
    lock = label("unlock", act("lock.unlock"))
    labs = {**LABELS, "unlock": lock}
    prog = with_holiday({"day": [slot("x", "08:00", "09:00", "unlock")]})
    assert label_users([prog], "unlock") == ["office"]
    assert admin_required(prog, labs) is True
    assert label_users([with_holiday({"copy": 2})], "unlock") == []


def test_check_holiday_config():
    assert check_holiday_config(None, False) == {"holiday_entity": None, "holiday_invert": False}
    for entity in ("binary_sensor.workday", "input_boolean.x", "switch.x", "calendar.holidays"):
        assert check_holiday_config(entity, True)["holiday_entity"] == entity
    with pytest.raises(ProgramError, match="invalid_holiday_entity_domain"):
        check_holiday_config("light.x", False)
    with pytest.raises(ProgramError, match="driven_holiday_entity"):
        check_holiday_config("switch.boiler", False, driven={"switch.boiler"})
    with pytest.raises(ProgramError, match="invalid_holiday_invert"):
        check_holiday_config(None, "yes")
    with pytest.raises(vol.Invalid):
        check_holiday_config("not an entity", False)
    target = {"kind": "service", "service": "switch.turn_on", "target_entity_id": "switch.other", "data": {}}
    prog = program(entities=[{"entity_id": CLIMATE, "default_label": None, "label_overrides": {"t21": target}}])
    assert driven_entities([prog], [label("x", act("light.turn_on"))]) == {CLIMATE, "switch.other"}


async def test_own_entities_are_refused(hass):
    entry = er.async_get(hass).async_get_or_create("switch", DOMAIN, "own", suggested_object_id="weekly_planner_x")
    with pytest.raises(ProgramError, match="circular_holiday_entity"):
        check_holiday_config(entry.entity_id, False, hass)


# -- modes, slots, registry -------------------------------------------------------------------


def test_profile_slots_and_copy_holiday():
    profile = prof(OWN)
    assert [s["id"] for s in profile_slots(profile)] == ["night"] * 6 + ["night", "sun", "h", "hn"]
    assert [s["id"] for s in profile_slots(prof({"copy": 1}))][-1] == "sun"
    copied = copy_holiday(OWN)
    assert [s["seed"] for s in copied["day"]] == ["h", "hn"] and copied["day"][0]["id"] != "h"
    assert copy_holiday({"copy": 3}) == {"copy": 3} and copy_holiday(None) is None


def test_follow_and_stop_following_carry_the_day_off():
    prog = program()
    prog["profiles"][0]["name"] = "Home"
    prog["profiles"][0]["holiday"] = deepcopy(OWN)
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[] for _ in range(7)], "holiday": {"copy": 1}})
    following = set_follow(prog, "Away", "Home")
    away = following["profiles"][1]
    assert away["follows"] == "Home" and "holiday" not in away  # it uses the day off of Home
    assert profile_for_mode(following, "Away") == "base"  # the engine places Home's profile, day off included
    stopped = set_follow(following, "Away", None)
    away = stopped["profiles"][1]
    assert "follows" not in away and [s["seed"] for s in away["holiday"]["day"]] == ["h", "hn"]
    check_follows(stopped["profiles"])
    # the source goes away: the follower keeps a copy, day off included
    following["profiles"][0]["holiday"] = {"copy": 4}
    detach_followers([following], "Home")
    assert following["profiles"][1]["holiday"] == {"copy": 4}
    # a source without a day off: the follower stops following without one
    plain = set_follow({**program(), "profiles": [{**program()["profiles"][0], "name": "Home"},
                                                   {"id": "a", "name": "Away", "days": [[]] * 7}]}, "Away", "Home")
    assert "holiday" not in set_follow(plain, "Away", None)["profiles"][1]


def test_removed_device_leaves_the_day_off_lists():
    entities = [{"entity_id": CLIMATE, "default_label": None, "label_overrides": {}},
                {"entity_id": COVER, "default_label": None, "label_overrides": {}},
                {"entity_id": "light.x", "default_label": None, "label_overrides": {}}]
    prog = with_holiday({"day": [{**slot("a", "08:00", "09:00"), "entities": [COVER]},
                                 {**slot("b", "10:00", "11:00"), "entities": [CLIMATE, COVER]}]}, entities=entities)
    out = remove_device_from_slots(prog, COVER)
    assert out["profiles"][0]["holiday"]["day"] == [{**slot("b", "10:00", "11:00"), "entities": [CLIMATE]}]
    assert remove_device_from_slots(with_holiday({"copy": 2}), COVER)["profiles"][0]["holiday"] == {"copy": 2}


def test_rename_follows_the_day_off_entity_and_its_slots():
    cond = {"entity_id": "sensor.old", "op": "eq", "value": "on"}
    prog = with_holiday({"day": [{**slot("a", "08:00", "09:00", conditions=[cond]), "entities": [CLIMATE]}]})
    config = {"labels": [], "programs": [prog], "holiday_entity": "binary_sensor.old"}
    assert rename_entity(config, "binary_sensor.old", "binary_sensor.new")
    assert config["holiday_entity"] == "binary_sensor.new"
    assert rename_entity(config, "sensor.old", "sensor.new")
    assert config["programs"][0]["profiles"][0]["holiday"]["day"][0]["conditions"][0]["entity_id"] == "sensor.new"
    assert rename_entity(config, CLIMATE, "climate.renamed")
    assert config["programs"][0]["profiles"][0]["holiday"]["day"][0]["entities"] == ["climate.renamed"]


# -- engine -------------------------------------------------------------------------------------


def hprog(pid: str = "office", holiday: dict | None = None, *, reapply: bool = True, extra: list | None = None,
          start: str = "00:00") -> dict:
    """Normal day: 08:00-12:00 21 degrees, 22:00-06:00 19 degrees; day off: 00:00-10:00 25 degrees."""
    prog = program(pid, slots=[slot("day", "08:00", "12:00", "t21"), slot("night", "22:00", "06:00", "t19")],
                   reapply=reapply)
    prog["profiles"][0]["holiday"] = holiday or {"day": [slot("h", start, "10:00", "t25"), *(extra or [])]}
    return prog


def temperatures(rec: Recorder) -> list:
    return [data["temperature"] for name, data in rec.calls if name == "climate.set_temperature"]


def runtime_storage(hass_storage, holiday: dict) -> None:
    hass_storage[f"{DOMAIN}.runtime"] = {"version": 2, "minor_version": 1, "key": f"{DOMAIN}.runtime",
                                         "data": {"entities": {}, "programs": {}, "holiday": holiday}}


async def go(hass, freezer, moment: datetime) -> None:
    await tick(hass, freezer, moment.astimezone(UTC) - datetime.now(UTC))


async def at_monday_night(hass, hass_storage, freezer, rec, state="off", **kwargs):
    freezer.move_to(local(26, 21))  # the entity's last_updated must not lie in the future
    hass.states.async_set(DAY_OFF, state)
    engine = await setup(hass, hass_storage, freezer, [hprog(**kwargs)], local(26, 21), config=CONFIG)
    await go(hass, freezer, local(26, 22))
    rec.calls.clear()
    return engine


async def test_midnight_flip_at_0000_then_back_at_0020_sends_nothing(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await at_monday_night(hass, hass_storage, freezer, rec)
    await go(hass, freezer, local(27, 0))  # the engine wakes at midnight and waits for the entity
    hass.states.async_set(DAY_OFF, "on")  # 00:00:00
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=20))
    hass.states.async_set(DAY_OFF, "off")  # 00:00:20: back
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=25))  # 00:00:45: still inside the settle time
    assert rec.calls == [] and engine.holiday_today is False
    await tick(hass, freezer, timedelta(seconds=60))
    assert rec.calls == []  # a normal day: the tail of Monday night runs on, nothing to send
    assert engine.store.runtime["holiday"]["date"] == "2026-10-27" and engine.store.runtime["holiday"]["on"] is False


async def test_midnight_late_entity_holds_then_sends_once(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await at_monday_night(hass, hass_storage, freezer, rec)
    await go(hass, freezer, local(27, 0))
    await tick(hass, freezer, timedelta(seconds=20))
    hass.states.async_set(DAY_OFF, "on")  # 00:00:20: the sensor updates after midnight
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=15))
    assert rec.calls == []  # held: nothing sent for the wrong day
    await tick(hass, freezer, timedelta(seconds=30))  # past 00:00:50
    assert temperatures(rec) == [25] and engine.holiday_today is True
    await tick(hass, freezer, timedelta(minutes=5))
    assert temperatures(rec) == [25]


async def test_one_shots_of_the_wait_run_once_at_its_end(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await at_monday_night(hass, hass_storage, freezer, rec, start="00:01",
                                   extra=[slot("p", "00:00", None, "boost")])
    await go(hass, freezer, local(27, 0))
    await tick(hass, freezer, timedelta(seconds=20))
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=35))  # 00:00:55: the wait ended at 00:00:50
    assert engine.holiday_today is True
    assert rec.services.count("climate.set_preset_mode") == 1  # the 00:00 one-shot of the day off
    assert temperatures(rec) == [15]  # Monday night stopped at midnight: the rest of the time until 00:01
    await go(hass, freezer, local(27, 0, 5))
    assert temperatures(rec) == [15, 25] and rec.services.count("climate.set_preset_mode") == 1


async def test_midnight_silent_entity_waits_at_most_two_minutes(hass, hass_storage, freezer):
    rec = Recorder(hass)
    freezer.move_to(local(26, 21))
    hass.states.async_set(DAY_OFF, "on")
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(26, 21), config=CONFIG)
    assert engine.holiday_today is True  # Monday read at startup
    rec.calls.clear()
    await go(hass, freezer, local(27, 0, 1))
    assert rec.calls == []
    await go(hass, freezer, local(27, 0, 3))  # 2 minutes passed: the entity still says on
    assert temperatures(rec) == [25] and engine.holiday_today is True
    assert engine.store.runtime["holiday"]["previous"] == {"date": "2026-10-26", "on": True}


async def test_day_off_then_normal_day_stops_at_midnight(hass, hass_storage, freezer):
    rec = Recorder(hass)
    engine = await at_monday_night(hass, hass_storage, freezer, rec, state="on",
                                   extra=[slot("hn", "22:00", "06:00", "t21")])
    assert engine.holiday_today is True and engine.rt(CLIMATE)["segment"][:3] == ["slot", "office", "hn"]
    await go(hass, freezer, local(27, 0))
    await tick(hass, freezer, timedelta(seconds=10))
    hass.states.async_set(DAY_OFF, "off")  # 00:00:10: Tuesday is a working day
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=20))
    assert rec.calls == []  # held until 00:00:40
    await tick(hass, freezer, timedelta(seconds=20))
    # Monday's day-off night stopped at midnight, and Monday computed as a normal day stops there too:
    # Tuesday's own schedule applies from 00:00 (nothing until 08:00, the rest of the time).
    assert temperatures(rec) == [15] and engine.holiday_today is False
    await go(hass, freezer, local(27, 8, 1))
    assert temperatures(rec) == [15, 21]


@pytest.mark.parametrize("reapply", [True, False])
async def test_unavailable_at_startup_keeps_the_flag_of_today(hass, hass_storage, freezer, reapply):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "unavailable")
    runtime_storage(hass_storage, {"date": "2026-10-27", "on": True})
    engine = await setup(hass, hass_storage, freezer, [hprog(reapply=reapply)], local(27, 9), config=CONFIG)
    assert engine.holiday_today is True
    assert engine.rt(CLIMATE)["segment"][:3] == ["slot", "office", "h"]
    assert temperatures(rec) == ([25] if reapply else [])
    rec.calls.clear()
    hass.states.async_set(DAY_OFF, "on")  # unavailable -> on: same boolean, no change, no salvo
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=45))
    assert rec.calls == []


async def test_unavailable_at_startup_without_value_is_a_normal_day(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "unknown")
    runtime_storage(hass_storage, {"date": "2026-10-26", "on": True})  # yesterday's value does not count
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9), config=CONFIG)
    assert engine.holiday_today is False and temperatures(rec) == [21]


async def test_flip_during_the_day_is_debounced_and_acts_like_a_mode_change(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "off")
    engine = await setup(hass, hass_storage, freezer, [hprog(extra=[slot("p", "09:01", None, "boost")])],
                         local(27, 9), config=CONFIG)
    assert temperatures(rec) == [21]
    rec.calls.clear()
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=20))
    hass.states.async_set(DAY_OFF, "off")  # back inside the 30 s: ignored
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=40))
    hass.states.async_set(DAY_OFF, "unavailable")  # off -> unavailable is no change
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=40))
    assert rec.calls == [] and engine.holiday_today is False
    engine.skip_next("office")
    assert engine.store.runtime["programs"]["office"].get("skip_at")
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert engine.holiday_today is True and temperatures(rec) == [25]
    assert "climate.set_preset_mode" not in rec.services  # the 09:01 one-shot of the day off is not replayed
    assert "skip_at" not in engine.store.runtime["programs"]["office"]


async def test_flip_respects_reapply_off(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "off")
    engine = await setup(hass, hass_storage, freezer, [hprog(reapply=False)], local(27, 9), config=CONFIG)
    rec.calls.clear()
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert engine.holiday_today is True and rec.calls == []
    assert engine.rt(CLIMATE)["segment"][:3] == ["slot", "office", "h"] and engine.rt(CLIMATE)["suppressed"]
    await go(hass, freezer, local(27, 10, 1))  # the day-off slot ends: the rest of the time is sent
    assert temperatures(rec) == [15]


async def test_invert_and_calendar(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("binary_sensor.workday", "off")  # Workday: off on a day off
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9),
                         config={"holiday_entity": "binary_sensor.workday", "holiday_invert": True})
    assert engine.holiday_today is True and temperatures(rec) == [25]


async def started(hass, hass_storage, freezer, hass_ws_client, programs, moment, **kwargs):
    """Engine plus websocket client: the token is issued before the frozen clock moves."""
    engine = await setup(hass, hass_storage, freezer, programs, None, **kwargs)
    ws = await hass_ws_client(hass)
    freezer.move_to(moment)
    await engine.async_recompute("startup")
    await hass.async_block_till_done()
    return engine, ws


async def test_following_mode_uses_the_day_off_of_its_source(hass, hass_storage, freezer, hass_ws_client):
    rec = Recorder(hass)
    hass.states.async_set("input_select.house", "Away", {"options": ["Home", "Away"]})
    hass.states.async_set(DAY_OFF, "on")
    prog = hprog()
    prog["profiles"][0]["name"] = "Home"
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[] for _ in range(7)], "follows": "Home"})
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [prog], local(27, 9),
                               config={**CONFIG, "mode_selector": "input_select.house", "default_mode": "Home"})
    assert engine.holiday_today is True and temperatures(rec)[-1] == 25
    rec.calls.clear()
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/mode_follow", "program_id": "office", "mode": "Away",
                                "follows": None})
    saved = (await ws.receive_json())["result"]["program"]
    away = saved["profiles"][1]
    assert "follows" not in away and [s["seed"] for s in away["holiday"]["day"]] == ["h"]
    await hass.async_block_till_done()
    assert temperatures(rec) in ([], [25])  # copied slots get new ids; the target stays the day off's 25
    assert engine.rt(CLIMATE)["target"]["data"] == {"temperature": 25}


async def test_snapshot_status_and_preview(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "on")
    copy = hprog("copy", {"copy": 6})
    _engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [hprog(), copy, program("plain")],
                                local(27, 9), config=CONFIG)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["holiday_today"] is True and data["holiday_entity"] == DAY_OFF and data["holiday_invert"] is False
    assert data["status"]["office"]["holiday"] == {"own": True}
    assert data["status"]["copy"]["holiday"] == {"copy": 6}
    assert "holiday" not in data["status"]["plain"]
    assert data["status"]["office"]["next_change"] == utc(local(27, 10)).isoformat()

    async def preview(day: str) -> dict:
        await ws.send_json_auto_id({"type": f"{DOMAIN}/preview", "program_id": "office", "date": day})
        return (await ws.receive_json())["result"]

    today = await preview("2026-10-27")
    assert today["holiday"] is True and [s["slot_id"] for s in today["slots"]] == ["h"]
    yesterday = await preview("2026-10-26")
    assert yesterday["holiday"] is False and [s["slot_id"] for s in yesterday["slots"]] == ["day", "night"]
    assert yesterday["slots"][1]["end"] == utc(local(27, 0)).isoformat()  # the night before a day off stops at 00:00
    tomorrow = await preview("2026-10-28")
    assert tomorrow["holiday"] is False and [s["slot_id"] for s in tomorrow["slots"]] == ["day", "night"]


async def test_preview_with_device_lists_on_a_day_off(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "on")
    prog = hprog()
    prog["entities"].append({"entity_id": COVER, "default_label": None, "label_overrides": {}})
    prog["profiles"][0]["holiday"] = {"day": [{**slot("h", "00:00", "10:00", "t25"), "entities": [CLIMATE]}]}
    _engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [prog], local(27, 9), config=CONFIG)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/preview", "program_id": "office", "date": "2026-10-27"})
    result = (await ws.receive_json())["result"]
    assert result["holiday"] is True and [s["slot_id"] for s in result["slots"]] == ["h"]
    assert [s["slot_id"] for s in result["by_entity"][CLIMATE]] == ["h"] and result["by_entity"][COVER] == []


async def test_websocket_sets_and_clears_a_day_off(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "off")
    prog = program()
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[] for _ in range(7)], "follows": "Base"})
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [prog], local(27, 9), config=CONFIG)

    async def send(**payload) -> dict:
        await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "office",
                                    "profile_id": "base", **payload})
        return await ws.receive_json()

    res = await send(holiday={"copy": 6}, revision=1)
    assert res["success"] and res["result"]["program"]["profiles"][0]["holiday"] == {"copy": 6}
    assert engine.store.program("office")["revision"] == 2
    assert (await send(holiday={"copy": 6}, revision=1))["error"]["code"] == "conflict"
    assert (await send(holiday={"copy": 9}))["error"]["code"] == "invalid"
    overlap = {"day": [slot("a", "08:00", "10:00"), slot("b", "09:00", "11:00")]}
    assert (await send(holiday=overlap))["error"]["code"] == "invalid"
    res = await send(holiday={"day": [slot("a", "08:00", "10:00")]})
    assert res["result"]["program"]["profiles"][0]["holiday"]["day"][0]["id"] == "a"
    # program/save from a card that does not know the key keeps the day off; null clears it
    current = deepcopy(engine.store.program("office"))
    del current["profiles"][0]["holiday"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": current})
    saved = (await ws.receive_json())["result"]["program"]
    assert saved["profiles"][0]["holiday"]["day"][0]["id"] == "a"
    saved["profiles"][0]["holiday"] = None
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": saved})
    assert "holiday" not in (await ws.receive_json())["result"]["program"]["profiles"][0]
    res = await send(holiday=None)
    assert res["success"] and "holiday" not in res["result"]["program"]["profiles"][0]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "office",
                                "profile_id": "away", "holiday": {"copy": 1}})
    assert (await ws.receive_json())["error"]["code"] == "invalid"  # a following mode has none of its own
    assert (await send(profile_id="nope", holiday=None))["error"]["code"] == "not_found"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "nope",
                                "profile_id": "base", "holiday": None})
    assert (await ws.receive_json())["error"]["code"] == "not_found"


async def test_websocket_day_off_rights(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    hass.services.async_register("lock", "unlock", lambda call: None)
    await setup(hass, hass_storage, freezer, [program()], None,
                extra_labels=[*labels(), label("unlock", act("lock.unlock"))])
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "office", "profile_id": "base",
                                "holiday": {"day": [slot("u", "08:00", None, "unlock")]}})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_websocket_day_off_admin_only(hass, hass_storage, freezer, hass_ws_client, hass_read_only_access_token):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "office", "profile_id": "base",
                                "holiday": {"copy": 1}})
    assert (await ws.receive_json())["error"]["code"] == "unauthorized"


async def test_missing_entity_raises_a_repair_and_a_rename_follows(hass, hass_storage, freezer):
    Recorder(hass)
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("input_boolean", "test", "day_off", suggested_object_id="day_off")
    assert entry.entity_id == DAY_OFF
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9),
                         config={"holiday_entity": "binary_sensor.gone", "holiday_invert": False})
    issues = ir.async_get(hass)
    issue = issues.async_get_issue(DOMAIN, "holiday_entity_missing")
    assert issue is not None and issue.translation_placeholders == {"entity": "binary_sensor.gone"}
    await engine.async_set_holiday_config(DAY_OFF, False)
    from custom_components.weekly_planner.registry import async_check_missing
    async_check_missing(hass, engine)
    assert issues.async_get_issue(DOMAIN, "holiday_entity_missing") is None
    registry.async_update_entity(DAY_OFF, new_entity_id="input_boolean.holiday")
    await hass.async_block_till_done()
    assert engine.store.config["holiday_entity"] == "input_boolean.holiday"


async def test_changing_the_entity_applies_like_a_mode_change(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "on")
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9))
    assert engine.holiday_today is False and temperatures(rec) == [21]
    rec.calls.clear()
    await engine.async_set_holiday_config(DAY_OFF, False)
    await hass.async_block_till_done()
    assert engine.holiday_today is True and temperatures(rec) == [25]
    await engine.async_set_holiday_config(None, False)
    await hass.async_block_till_done()
    assert engine.holiday_today is False and "holiday" not in engine.store.runtime
    assert temperatures(rec) == [25, 21]


# -- YAML file ----------------------------------------------------------------------------------


def test_yaml_round_trip_of_the_day_off():
    prog = hprog()
    prog["profiles"][0]["name"] = "Home"
    prog["profiles"].append({"id": "away", "name": "Away", "days": [[] for _ in range(7)], "holiday": {"copy": 6}})
    prog["profiles"].append({"id": "night", "name": "Night", "days": [[] for _ in range(7)], "follows": "Home"})
    config = {"vacation": False, "mode_selector": "input_select.house", "default_mode": "Home",
              "holiday_entity": DAY_OFF, "holiday_invert": True, "labels": labels(), "programs": [prog]}
    text = yaml_file.render(config)
    raw = yaml_file._parse(text)
    assert raw["holiday_entity"] == DAY_OFF and raw["holiday_invert"] is True
    modes = raw["programs"][0]["modes"]
    assert modes["Away"]["holiday"] == {"copy": "sun"} and modes["Home"]["holiday"]["day"][0]["id"] == "h"
    assert "holiday" not in modes["Night"]
    back = yaml_file.program_from_file(raw["programs"][0], prog)
    assert back["profiles"] == prog["profiles"]
    assert check_program(back, LABELS)["profiles"][1]["holiday"] == {"copy": 6}


def test_yaml_day_off_errors():
    base = {"id": "p", "name": "p", "entities": [], "modes": {"Home": {"holiday": {"copy": "someday"}}}}
    with pytest.raises(TypeError, match="holiday: copy"):
        yaml_file.program_from_file(base, None)
    base["modes"]["Home"]["holiday"] = "mon"
    with pytest.raises(TypeError, match="'holiday' must be"):
        yaml_file.program_from_file(base, None)
    base["modes"]["Home"]["holiday"] = None
    assert "holiday" not in yaml_file.program_from_file(base, None)["profiles"][0]
    base["modes"] = {"Home": {"mon": []}, "Away": {"follows": "Home", "holiday": {"copy": "mon"}}}
    prog = yaml_file.program_from_file(base, None)
    with pytest.raises(ProgramError, match="own day off"):
        check_program({**program(), "profiles": prog["profiles"]}, LABELS)
    for bad in (b"labels: []\nprograms: []\nholiday_entity: 3\n", b"labels: []\nprograms: []\nholiday_invert: 1\n"):
        with pytest.raises(TypeError):
            yaml_file._parse(bad)


async def test_yaml_import_of_the_day_off_settings(hass, hass_storage, freezer, yaml_in_tmp):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "off")
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9), config=CONFIG)
    doc = yaml.safe_load(yaml_in_tmp.read_text())
    assert doc["holiday_entity"] == DAY_OFF and doc["programs"][0]["modes"]["Base"]["holiday"]["day"][0]["id"] == "h"

    async def write(mutate) -> None:
        current = yaml.safe_load(yaml_in_tmp.read_text())
        mutate(current)
        yaml_in_tmp.write_text(yaml.safe_dump(current, sort_keys=False))
        await tick(hass, freezer, timedelta(seconds=31))
        await hass.async_block_till_done(wait_background_tasks=True)

    def drop_keys(doc):
        doc.pop("holiday_entity")
        doc.pop("holiday_invert")
        doc["vacation"] = False
        doc["programs"][0]["name"] = "renamed"

    await write(drop_keys)  # a file without the keys leaves the settings alone
    assert engine.store.program("office")["name"] == "renamed"
    assert engine.store.config["holiday_entity"] == DAY_OFF

    def other(doc):
        doc["holiday_entity"] = "binary_sensor.workday"
        doc["holiday_invert"] = True

    await write(other)
    assert (engine.store.config["holiday_entity"], engine.store.config["holiday_invert"]) == ("binary_sensor.workday", True)

    def drive_it(doc):
        doc["holiday_entity"] = CLIMATE.replace("climate", "switch")
        doc["programs"][0]["entities"][0]["entity_id"] = "switch.office"

    await write(drive_it)
    assert ir.async_get(hass).async_get_issue(DOMAIN, yaml_file.ISSUE) is not None
    assert engine.store.config["holiday_entity"] == "binary_sensor.workday"


# -- storage ------------------------------------------------------------------------------------


async def test_storage_without_day_off_is_migrated_to_the_new_minor(hass, hass_storage, freezer):
    Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], local(27, 9))
    await engine.store.async_flush_config()
    assert hass_storage[DOMAIN]["version"] == 3 and hass_storage[DOMAIN]["minor_version"] == 2
    assert engine.store.programs[0]["profiles"][0]["days"][0][0]["id"] == "s1"
    assert engine.holiday_today is False


async def test_storage_of_a_newer_minor_is_refused_cleanly(hass, hass_storage, freezer):
    hass_storage[DOMAIN] = {"version": 3, "minor_version": 9, "key": DOMAIN,
                            "data": {"vacation": False, "labels": [], "programs": []}}
    await hass.config.async_update(time_zone="Europe/Brussels")
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert not await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.SETUP_ERROR
    assert hass_storage[DOMAIN]["minor_version"] == 9  # untouched


# -- small paths ----------------------------------------------------------------------------------


def test_cut_keeps_ignored_and_drops_what_starts_after_the_boundary():
    from custom_components.weekly_planner.resolver import _cut
    from custom_components.weekly_planner.timeline import Occurrence

    boundary = utc(local(28, 0))
    ignored = Occurrence("a", utc(local(27, 23)), utc(local(28, 2)), "overlap")
    assert _cut(ignored, boundary) is ignored
    late = Occurrence("b", utc(local(28, 0, 3)), None)  # a one-shot pushed past midnight by its delay
    assert _cut(late, boundary).ignored == "holiday_cut"
    early = Occurrence("c", utc(local(27, 23)), None)
    assert _cut(early, boundary) is early


async def test_first_reading_of_the_day_and_programs_without_setting(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set(DAY_OFF, "unavailable")
    engine = await setup(hass, hass_storage, freezer, [program()], local(27, 9), config=CONFIG)
    assert "holiday" not in engine.store.runtime  # no valid value yet: a normal day
    hass.states.async_set(DAY_OFF, "off")  # first valid reading: stored, nothing to change
    await hass.async_block_till_done()
    assert engine.store.runtime["holiday"] == {"date": "2026-10-27", "on": False}
    rec.calls.clear()
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    hass.states.async_set(DAY_OFF, "unavailable")  # inside the wait: the pending change goes on
    await hass.async_block_till_done()
    hass.states.async_set(DAY_OFF, "on")
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=31))
    assert engine.holiday_today is True and rec.calls == []  # no program has a day-off setting


# -- corrections after the code review (nemesis, 2026-11-12) -----------------------------------------


async def test_a_save_may_not_make_a_program_drive_the_day_off_entity(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "off")
    hass.services.async_register("input_boolean", "turn_on", lambda call: None)
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [program()], local(27, 9), config=CONFIG)
    current = deepcopy(engine.store.program("office"))
    current["entities"].append({"entity_id": DAY_OFF, "default_label": None, "label_overrides": {}})
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": current})
    res = await ws.receive_json()
    assert res["error"]["code"] == "invalid" and "driven_holiday_entity" in res["error"]["message"]
    target = {"kind": "service", "service": "input_boolean.turn_on", "target_entity_id": DAY_OFF, "data": {}}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": {"name": "On", "action": target}})
    res = await ws.receive_json()
    assert res["error"]["code"] == "invalid" and "driven_holiday_entity" in res["error"]["message"]
    # a scene that sets the entity counts too
    hass.states.async_set("scene.holiday", "scening", {"entity_id": [DAY_OFF]})
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": {
        "name": "Scene", "action": {"kind": "scene", "scene": "scene.holiday"}}})
    assert "driven_holiday_entity" in (await ws.receive_json())["error"]["message"]
    # program/holiday re-checks the whole program
    engine.store.program("office")["entities"][0]["label_overrides"] = {"t21": target}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "office", "profile_id": "base",
                                "holiday": {"copy": 1}})
    assert "driven_holiday_entity" in (await ws.receive_json())["error"]["message"]
    assert "holiday" not in engine.store.program("office")["profiles"][0]


async def test_rename_and_rechoice_keep_yesterdays_memory(hass, hass_storage, freezer):
    Recorder(hass)
    registry = er.async_get(hass)
    registry.async_get_or_create("input_boolean", "test", "day_off", suggested_object_id="day_off")
    freezer.move_to(local(28, 3))
    hass.states.async_set(DAY_OFF, "off")
    hass.states.async_set("input_boolean.other", "off")
    runtime_storage(hass_storage, {"date": "2026-10-28", "on": False, "previous": {"date": "2026-10-27", "on": True}})
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(28, 3), config=CONFIG)
    assert engine.holiday_view().after == TUE
    registry.async_update_entity(DAY_OFF, new_entity_id="input_boolean.renamed")
    await hass.async_block_till_done()
    assert engine.store.config["holiday_entity"] == "input_boolean.renamed"
    assert engine.store.runtime["holiday"]["previous"] == {"date": "2026-10-27", "on": True}
    assert engine.holiday_view().after == TUE
    await engine.async_set_holiday_config("input_boolean.other", False)  # another entity: today read again
    assert engine.holiday_view().after == TUE
    assert engine.store.runtime["holiday"]["date"] == "2026-10-28"


async def test_startup_reading_that_differs_from_today_waits_the_debounce(hass, hass_storage, freezer):
    rec = Recorder(hass)
    freezer.move_to(local(27, 9))
    hass.states.async_set(DAY_OFF, "off")  # a template whose source is not loaded yet
    runtime_storage(hass_storage, {"date": "2026-10-27", "on": True})
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9), config=CONFIG)
    assert engine.holiday_today is True and temperatures(rec) == [25]  # the stored flag of today
    rec.calls.clear()
    await tick(hass, freezer, timedelta(seconds=10))
    hass.states.async_set(DAY_OFF, "on")  # the source loaded: back to the stored value
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(seconds=40))
    assert engine.holiday_today is True and rec.calls == []  # one salvo only


async def test_startup_reading_that_stays_different_applies_after_the_debounce(hass, hass_storage, freezer):
    rec = Recorder(hass)
    freezer.move_to(local(27, 9))
    hass.states.async_set(DAY_OFF, "off")
    runtime_storage(hass_storage, {"date": "2026-10-27", "on": True})
    engine = await setup(hass, hass_storage, freezer, [hprog()], local(27, 9), config=CONFIG)
    rec.calls.clear()
    await tick(hass, freezer, timedelta(seconds=31))
    assert engine.holiday_today is False and temperatures(rec) == [21]


async def test_scene_members_are_driven(hass):
    hass.states.async_set("scene.night", "scening", {"entity_id": ["switch.x", 3]})
    labs = [label("n", {"kind": "scene", "scene": "scene.night"}), label("m", {"kind": "scene", "scene": "scene.none"})]
    assert driven_entities([], labs, hass) == {"switch.x"}
    hass.states.async_set("scene.night", "scening", {"entity_id": "switch.x"})
    assert driven_entities([], labs, hass) == set()
