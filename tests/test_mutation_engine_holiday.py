"""Mutation-testing survivors of the day-off section of engine.py and of websocket._keep_holidays."""

from __future__ import annotations

import logging
from datetime import UTC, date, datetime, timedelta

from custom_components.weekly_planner.websocket import _keep_holidays

from .helpers import Recorder, local, setup
from .test_holiday import CONFIG, DAY_OFF, hprog

TODAY = date(2026, 10, 27)


async def _engine(hass, hass_storage, freezer, state="off", moment=None, config=CONFIG):
    Recorder(hass)
    if state is not None:
        hass.states.async_set(DAY_OFF, state)
    return await setup(hass, hass_storage, freezer, [hprog()], moment or local(27, 9), config=config)


# -- the stored flags ---------------------------------------------------------------------------


async def test_the_flag_of_a_day_is_stored_with_its_date_and_the_earlier_flag_becomes_previous(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer)
    runtime = engine.store.runtime
    runtime.pop("holiday", None)
    engine._store_holiday(TODAY, True)
    assert runtime["holiday"] == {"date": "2026-10-27", "on": True}
    engine._store_holiday(TODAY, True)  # same value: nothing changes
    assert runtime["holiday"] == {"date": "2026-10-27", "on": True}
    engine._store_holiday(date(2026, 10, 28), False)  # the next day: today's flag becomes the previous one
    assert runtime["holiday"] == {"date": "2026-10-28", "on": False, "previous": {"date": "2026-10-27", "on": True}}
    engine._store_holiday(date(2026, 10, 28), True)  # same day, another value: the previous flag is kept
    assert runtime["holiday"] == {"date": "2026-10-28", "on": True, "previous": {"date": "2026-10-27", "on": True}}
    engine._store_holiday(date(2026, 10, 28), True)
    assert runtime["holiday"]["previous"] == {"date": "2026-10-27", "on": True}


async def test_a_stored_flag_of_the_same_day_with_the_same_value_does_not_save_again(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer)
    engine.store.runtime["holiday"] = {"date": "2026-10-27", "on": True}
    saved = []
    engine.store.save_runtime = lambda: saved.append(1)
    engine._store_holiday(TODAY, True)
    assert saved == []
    engine._store_holiday(TODAY, False)
    assert saved == [1] and engine.store.runtime["holiday"] == {"date": "2026-10-27", "on": False}


# -- the wait of a new day -----------------------------------------------------------------------


async def test_a_new_day_waits_for_the_entity_in_the_zone_of_the_house_until_the_limit(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state=None)
    engine.store.runtime.pop("holiday", None)
    engine._holiday_started = None
    midnight = datetime(2026, 10, 27, 0, 0, tzinfo=engine.tz).astimezone(UTC)
    limit = midnight + timedelta(seconds=120)
    assert engine._holiday_settles_at(midnight + timedelta(seconds=10)) == limit
    assert engine._holiday_settles_at(limit - timedelta(seconds=1)) == limit
    assert engine._holiday_settles_at(limit) is None  # the wait ends exactly at the limit
    engine._holiday_started = TODAY
    assert engine._holiday_settles_at(midnight + timedelta(seconds=10)) is None  # its start was taken
    engine._holiday_started = None
    engine.store.runtime["holiday"] = {"date": "2026-10-27", "on": False}
    assert engine._holiday_settles_at(midnight + timedelta(seconds=10)) is None  # it has a flag


async def test_the_wait_is_read_in_the_zone_of_the_house_not_of_the_server(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state=None)
    await hass.config.async_update(time_zone="America/New_York")
    engine.store.runtime.pop("holiday", None)
    engine._holiday_started = None
    midnight = datetime(2026, 10, 28, 0, 0, tzinfo=engine.tz).astimezone(UTC)  # 04:00 UTC
    assert engine._holiday_settles_at(midnight + timedelta(seconds=30)) == midnight + timedelta(seconds=120)


# -- changes during the day ---------------------------------------------------------------------


async def test_a_settled_change_is_stored_logged_and_ignored_when_it_is_not_one(hass, hass_storage, freezer, caplog):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    caplog.set_level(logging.INFO)
    hass.states.async_set(DAY_OFF, "on")
    today = engine._holiday_started
    assert today is not None
    await engine._async_holiday_settled()
    assert engine.store.runtime["holiday"]["on"] is True and "Day off today: True" in caplog.text
    caplog.clear()
    await engine._async_holiday_settled()  # no change any more
    assert "Day off today" not in caplog.text
    hass.states.async_set(DAY_OFF, "unavailable")
    await engine._async_holiday_settled()  # unavailable: the known flag stays
    assert engine.store.runtime["holiday"]["on"] is True
    engine._holiday_started = date(2000, 1, 1)
    engine._holiday_raw = lambda: False
    await engine._async_holiday_settled()  # a new day began meanwhile
    assert engine.store.runtime["holiday"]["on"] is True
    engine._holiday_started = today
    engine._stopped = True
    await engine._async_holiday_settled()
    assert engine.store.runtime["holiday"]["on"] is True


async def test_a_change_clears_the_pending_skip_of_the_programs_with_a_day_off_and_recomputes_them(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    engine.store.runtime["programs"].setdefault("office", {})["skip_at"] = "2026-10-27T10:00:00+00:00"
    seen = []
    original = engine._async_recompute

    async def spy(kind, **kwargs):
        seen.append((kind, kwargs))
        return await original(kind, **kwargs)

    engine._async_recompute = spy
    await engine._async_holiday_changed()
    assert "skip_at" not in engine.store.runtime["programs"]["office"]
    assert seen == [("profile", {"profile_program_ids": {"office"}})]


async def test_the_event_of_a_new_day_starts_it_and_a_flip_back_is_ignored(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    calls = []

    async def recompute(kind, **kwargs):
        calls.append(kind)

    engine._async_recompute = recompute
    engine._holiday_started = date(2000, 1, 1)
    await engine._async_holiday_event()
    assert calls == ["timer"]
    engine._holiday_started = engine.holiday_view and dt_today(engine)
    engine.store.runtime["holiday"] = {"date": dt_today(engine).isoformat(), "on": False}
    hass.states.async_set(DAY_OFF, "on")
    await engine._async_holiday_event()
    assert engine._holiday_timer is not None  # a change waits for its debounce
    hass.states.async_set(DAY_OFF, "off")
    await engine._async_holiday_event()
    assert engine._holiday_timer is None  # back to the applied value
    engine.store.runtime.pop("holiday")
    await engine._async_holiday_event()
    assert engine.store.runtime["holiday"]["on"] is False  # the first valid reading of the day is stored


def dt_today(engine):
    from homeassistant.util import dt as dt_util

    return dt_util.utcnow().astimezone(engine.tz).date()


async def test_the_programs_with_a_day_off_are_found_from_a_pass_or_from_the_store(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer)
    assert engine._holiday_programs() == {"office"}
    fake = type("Ctx", (), {"programs": [], "profiles": {}})()
    assert engine._holiday_programs(fake) == set()
    assert engine._holiday_programs(type("Ctx", (), {"programs": engine.store.programs, "profiles": {}})()) == {"office"}


async def test_the_raw_flag_reads_the_entity_only_when_there_is_one_and_inverts_it(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="on")
    assert engine._holiday_raw() is True
    hass.states.async_set(DAY_OFF, "unknown")
    assert engine._holiday_raw() is None
    engine.store.config["holiday_entity"] = None
    assert engine._holiday_raw() is None


# -- configuration ----------------------------------------------------------------------------


async def test_a_renamed_entity_keeps_its_inversion_and_only_the_watched_one_is_renamed(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, config={"holiday_entity": DAY_OFF, "holiday_invert": True})
    assert engine._holiday_key == (DAY_OFF, True)
    engine.note_holiday_rename("input_boolean.other", "input_boolean.x")
    assert engine._holiday_key == (DAY_OFF, True)
    engine.note_holiday_rename(DAY_OFF, "input_boolean.new")
    assert engine._holiday_key == ("input_boolean.new", True)


async def test_another_entity_is_read_again_and_the_pending_skip_of_the_changed_programs_is_cleared(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    hass.states.async_set("input_boolean.other", "on")
    engine.store.runtime["programs"].setdefault("office", {})["skip_at"] = "2026-10-27T10:00:00+00:00"
    engine._holiday_timer = lambda: None
    engine.store.config["holiday_entity"] = "input_boolean.other"
    changed = engine._sync_holiday_config()
    assert changed == {"office"} and engine._holiday_key == ("input_boolean.other", False)
    assert "skip_at" not in engine.store.runtime["programs"]["office"]
    assert engine._holiday_timer is None and engine.holiday_today is True
    assert engine._holiday_started is not None
    assert engine._sync_holiday_config() == set()  # nothing changed since


async def test_before_the_engine_is_ready_a_new_entity_is_not_read_yet_and_an_unchanged_day_changes_no_program(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    engine._ready = False
    engine.store.config["holiday_entity"] = "input_boolean.other"
    hass.states.async_set("input_boolean.other", "off")
    assert engine._sync_holiday_config() == set() and engine._holiday_started is None
    engine._ready = True
    engine.store.config["holiday_invert"] = True
    hass.states.async_set("input_boolean.other", "off")
    assert engine._sync_holiday_config() == {"office"}  # inverted: off is a day off


async def test_setting_the_day_off_config_does_not_reapply_and_a_same_config_is_a_no_op(hass, hass_storage, freezer):
    engine = await _engine(hass, hass_storage, freezer, state="off")
    seen = []

    async def changed(**kwargs):
        seen.append(kwargs)

    engine._async_config_changed = changed
    await engine.async_set_holiday_config(DAY_OFF, False)
    assert seen == []
    await engine.async_set_holiday_config("input_boolean.other", True)
    assert seen == [{"reapply": False}]
    assert engine.store.config["holiday_entity"] == "input_boolean.other" and engine.store.config["holiday_invert"] is True


# -- websocket: the day off kept when a card sends a program without it ----------------------------


def test_a_profile_sent_without_the_day_off_keeps_the_stored_one_unless_it_follows_or_names_none():
    stored = {"profiles": [{"id": "a", "holiday": {"copy": 1}}, {"id": "b"}, {"id": "c", "holiday": {"copy": 2}},
                           {"id": "d", "holiday": {"copy": 3}}]}
    sent = {"name": "x", "profiles": [{"id": "a"}, {"id": "b"}, {"id": "c", "follows": "a"},
                                      {"id": "d", "holiday": None}, "not a dict", {"id": "new"}]}
    kept = _keep_holidays(stored, sent)
    assert kept["profiles"][0] == {"id": "a", "holiday": {"copy": 1}}
    assert kept["profiles"][1] == {"id": "b"}
    assert kept["profiles"][2] == {"id": "c", "follows": "a"}
    assert kept["profiles"][3] == {"id": "d", "holiday": None}
    assert kept["profiles"][4:] == ["not a dict", {"id": "new"}]
    assert kept["name"] == "x" and sent["profiles"][0] == {"id": "a"}  # the input is not changed
    assert _keep_holidays(None, sent) is sent and _keep_holidays({}, sent) is sent
    assert _keep_holidays({"profiles": [{"id": "a"}]}, sent) is sent  # nothing stored
    assert _keep_holidays({"name": "n"}, sent) is sent
    assert _keep_holidays(stored, {"profiles": "x"})["profiles"] == "x"
    deep = _keep_holidays({"profiles": [{"id": "a", "holiday": {"day": [{"id": "s"}]}}]}, {"profiles": [{"id": "a"}]})
    assert deep["profiles"][0]["holiday"] == {"day": [{"id": "s"}]}
