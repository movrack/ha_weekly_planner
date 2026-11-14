"""Day off kept in memory (issue #54): ``off: true`` keeps the setting without applying it; a copied weekday may
keep an own day beside it (``{copy, day}``). Nothing the user wrote is lost when they change their mind."""

from __future__ import annotations

from copy import deepcopy

import pytest
import voluptuous as vol

from custom_components.weekly_planner import yaml_file
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.modes import copy_holiday
from custom_components.weekly_planner.resolver import (
    Holiday,
    day_slots,
    has_holiday,
    holiday_setting,
    occurrences_around,
)
from custom_components.weekly_planner.validation import ProgramError, check_program

from .helpers import TZ, Recorder, local, program, slot
from .test_holiday import (
    CONFIG,
    DAY_OFF,
    LABELS,
    OWN,
    TUE,
    hprog,
    no_sun,
    prof,
    running,
    started,
    utc,
    with_holiday,
)

KEPT = [slot("k", "07:00", "08:00", "t25")]


def test_off_runs_the_normal_weekday_and_applies_nothing():
    for setting in ({"copy": 6, "off": True}, {"day": OWN["day"], "off": True}, {"copy": 6, "day": KEPT, "off": True}):
        profile = prof(setting)
        assert holiday_setting(profile) is None and has_holiday(profile) is False
        assert day_slots(profile, TUE, True) is profile["days"][1]  # the weekday, even on a day off
    assert holiday_setting(prof({"copy": 6})) == {"copy": 6} and has_holiday(prof({"day": []}))


def test_off_does_not_cut_at_midnight():
    profile = prof({**OWN, "off": True})
    holiday = Holiday(day=TUE)
    assert running(profile, local(27, 3), holiday) == "night"  # yesterday's night goes on into the day off
    tail = [occ for occ, item in occurrences_around(profile, local(27, 3), TZ, no_sun, days=(-1,), holiday=holiday)
            if item["id"] == "night"]
    assert tail[0].end == utc(local(27, 6))
    assert running(profile, local(27, 10), holiday) is None  # the own day does not run


def test_a_copy_beside_a_kept_day_runs_the_copied_weekday_and_keeps_the_day():
    profile = prof({"copy": 6, "day": KEPT})
    assert day_slots(profile, TUE, True) is profile["days"][6]
    assert running(profile, local(27, 10), Holiday(day=TUE)) == "sun"
    checked = check_program(with_holiday({"copy": 6, "day": KEPT}), LABELS)["profiles"][0]["holiday"]
    assert checked["copy"] == 6 and [s["id"] for s in checked["day"]] == ["k"]


def test_the_setting_is_normalised_on_save():
    def stored(holiday):
        return check_program(with_holiday(holiday), LABELS)["profiles"][0]["holiday"]

    assert stored({"copy": 2, "off": False}) == {"copy": 2}
    assert stored({"day": [], "off": False}) == {"day": []}
    assert stored({"copy": 2, "day": []}) == {"copy": 2}  # an empty kept day is dropped
    assert stored({"copy": 2, "day": [], "off": True}) == {"copy": 2, "off": True}
    assert stored({"copy": 2, "off": True}) == {"copy": 2, "off": True}
    assert stored({"day": [], "off": True}) == {"day": [], "off": True}
    for bad in ({"off": True}, {"copy": 2, "off": "yes"}, {"day": [], "off": 1}):
        with pytest.raises(vol.Invalid):
            check_program(with_holiday(bad), LABELS)


def test_a_kept_day_is_checked_like_the_others():
    with pytest.raises(ProgramError, match="unknown_label:nope"):
        check_program(with_holiday({"copy": 1, "day": [slot("x", "08:00", "09:00", "nope")]}), LABELS)
    with pytest.raises(ProgramError, match="unknown_label:nope"):
        check_program(with_holiday({"copy": 1, "day": [slot("x", "08:00", "09:00", "nope")], "off": True}), LABELS)
    with pytest.raises(ProgramError, match="overlapping_slots"):
        check_program(with_holiday({"copy": 1, "day": [slot("x", "08:00", "10:00"), slot("y", "09:00", "11:00")]}),
                      LABELS)


def test_copy_holiday_keeps_off_and_copy_and_renews_the_ids_of_the_day():
    source = {"copy": 3, "day": [slot("h", "00:00", "10:00", "t25")], "off": True}
    copied = copy_holiday(source)
    assert copied["copy"] == 3 and copied["off"] is True
    assert [s["seed"] for s in copied["day"]] == ["h"] and copied["day"][0]["id"] != "h"
    assert source["day"][0]["id"] == "h"  # the source is untouched
    assert copy_holiday({"day": KEPT, "off": True})["off"] is True


def test_yaml_round_trip_of_a_kept_setting():
    setting = {"copy": 6, "day": deepcopy(KEPT), "off": True}
    written = yaml_file.holiday_to_file(setting)
    assert written == {"copy": "sun", "day": KEPT, "off": True}
    assert yaml_file.holiday_from_file("Home", written) == setting
    assert yaml_file.holiday_from_file("Home", {"copy": "mon"}) == {"copy": 0}
    assert yaml_file.holiday_to_file({"copy": 0}) == {"copy": "mon"} and "off" not in yaml_file.holiday_to_file({"day": []})
    assert yaml_file.holiday_from_file("Home", {"day": None, "off": False}) == {"day": []}
    prog = program()
    prog["profiles"][0]["holiday"] = setting
    back = yaml_file.program_from_file(yaml_file._parse(yaml_file.render(
        {"vacation": False, "labels": [], "programs": [prog]}))["programs"][0], prog)
    assert back["profiles"][0]["holiday"] == setting


def test_yaml_refuses_an_off_without_a_setting_and_a_wrong_off():
    with pytest.raises(TypeError, match="'holiday' must be"):
        yaml_file.holiday_from_file("Home", {"off": True})
    with pytest.raises(TypeError, match="'holiday' must be"):
        yaml_file.holiday_from_file("Home", {"copy": "mon", "off": "yes"})
    with pytest.raises(TypeError, match="'holiday' must be"):
        yaml_file.holiday_from_file("Home", {"copy": "mon", "extra": 1})


async def test_status_has_no_holiday_when_off_and_the_websocket_accepts_it(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    hass.states.async_set(DAY_OFF, "on")
    off = hprog("off", {"copy": 6, "off": True})
    kept = hprog("kept", {"copy": 6, "day": KEPT})
    engine, ws = await started(hass, hass_storage, freezer, hass_ws_client, [off, kept], local(27, 9), config=CONFIG)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert "holiday" not in data["status"]["off"]
    assert data["status"]["kept"]["holiday"] == {"copy": 6}

    async def send(holiday, **payload):
        await ws.send_json_auto_id({"type": f"{DOMAIN}/program/holiday", "program_id": "kept", "profile_id": "base",
                                    "holiday": holiday, **payload})
        return await ws.receive_json()

    res = await send({"copy": 6, "off": True})
    assert res["success"] and res["result"]["program"]["profiles"][0]["holiday"] == {"copy": 6, "off": True}
    assert engine.store.program("kept")["profiles"][0]["holiday"] == {"copy": 6, "off": True}
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    assert "holiday" not in (await ws.receive_json())["result"]["status"]["kept"]
    res = await send({"copy": 6, "day": KEPT, "off": False})
    assert res["result"]["program"]["profiles"][0]["holiday"]["copy"] == 6
    assert "off" not in res["result"]["program"]["profiles"][0]["holiday"]
    assert (await send({"off": True}))["error"]["code"] == "invalid"
