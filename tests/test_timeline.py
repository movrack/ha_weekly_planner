"""Day placement of slots: midnight, sun bounds, daylight saving time (S2, S3, S4, S26, S27)."""

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from custom_components.weekly_planner.timeline import (
    Occurrence,
    day_occurrences,
    local_datetime,
    occurrence,
    parse_clock,
    place_day,
    trim,
)
from custom_components.weekly_planner.timeline import resolve as resolve_time

from .helpers import AKL, WEDNESDAY, no_sun

TZ = ZoneInfo("Europe/Brussels")
SUMMER = date(2026, 6, 21)
WINTER = date(2026, 12, 21)


def fake_sun(event: str, day: date) -> datetime:
    """Rough Brussels sun times: sunset 21:58 in June, 16:40 in December."""
    local = {
        ("sunset", 6): (21, 58),
        ("sunset", 12): (16, 40),
        ("sunrise", 6): (5, 28),
        ("sunrise", 12): (8, 44),
        ("dusk", 6): (22, 43),
        ("dawn", 6): (4, 42),
    }[(event, day.month)]
    return datetime(day.year, day.month, day.day, *local, tzinfo=TZ).astimezone(UTC)


def slot(start, end=None, sid="s"):
    return {"id": sid, "start": start, "end": end}


def at(day, h, m, plus_days=0):
    d = day + timedelta(days=plus_days)
    return datetime(d.year, d.month, d.day, h, m, tzinfo=TZ)


def test_simple_slot():
    occ = occurrence(slot({"time": "08:00"}, {"time": "17:30"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.start == at(SUMMER, 8, 0) and occ.end == at(SUMMER, 17, 30)


def test_crosses_midnight():  # S2
    occ = occurrence(slot({"time": "22:00"}, {"time": "06:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end == at(SUMMER, 6, 0, plus_days=1)


def test_end_of_day_2400():  # S27
    occ = occurrence(slot({"time": "20:00"}, {"time": "24:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end == at(SUMMER, 0, 0, plus_days=1)


@pytest.mark.parametrize("bad", ["24:05", "25:00", "07:60"])
def test_invalid_clock_names_the_bad_value(bad):
    with pytest.raises(ValueError, match=rf"^invalid time '{bad}'$"):
        parse_clock(bad)


def test_unknown_sun_event_names_the_bad_value():
    with pytest.raises(ValueError, match=r"^unknown sun event 'noon'$"):
        resolve_time({"sun": "noon"}, WEDNESDAY, AKL, no_sun)


def test_typed_minutes_are_not_snapped():
    assert parse_clock("12:03") == (12, 3)
    occ = occurrence(slot({"time": "08:17"}, {"time": "08:23"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.start == at(SUMMER, 8, 17) and occ.end == at(SUMMER, 8, 23)
    assert occurrence(slot({"time": "08:17"}, {"time": "08:20"}), SUMMER, TZ, fake_sun).ignored


def test_sun_with_offset_and_bounds():  # S3
    spec = {"sun": "sunset", "offset": 15, "earliest": "18:00", "latest": "21:00"}
    summer = occurrence(slot(spec, {"time": "23:00"}), SUMMER, TZ, fake_sun)
    winter = occurrence(slot(spec, {"time": "23:00"}), WINTER, TZ, fake_sun)
    assert summer.start == at(SUMMER, 21, 0)  # 22:13 capped at 21:00
    assert winter.start == at(WINTER, 18, 0)  # 16:55 raised to 18:00


def test_sun_keeps_its_exact_minute():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "23:00"}), SUMMER, TZ, fake_sun)
    assert occ.start == at(SUMMER, 21, 58)  # never rounded to a 5-minute step


def test_sun_slot_empty_that_day():  # S26
    occ = occurrence(slot({"sun": "sunset"}, {"time": "21:00"}), SUMMER, TZ, fake_sun)
    assert occ.ignored == "empty"
    assert occurrence(slot({"sun": "sunset"}, {"time": "21:00"}), WINTER, TZ, fake_sun).runs


def test_sun_to_next_morning():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "07:00"}), WINTER, TZ, fake_sun)
    assert occ.runs and occ.end == at(WINTER, 7, 0, plus_days=1)


def test_five_minutes_is_enough():
    occ = occurrence(slot({"sun": "sunset"}, {"time": "22:03"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end - occ.start == timedelta(minutes=5)
    assert occurrence(slot({"sun": "sunset"}, {"time": "22:02"}), SUMMER, TZ, fake_sun).ignored == "too_short"


def test_one_shot_slot():
    occ = occurrence(slot({"time": "05:00"}), SUMMER, TZ, fake_sun)
    assert occ.runs and occ.end is None and occ.start == at(SUMMER, 5, 0)


# --- daylight saving time (S4) ---------------------------------------------
SPRING = date(2026, 3, 29)  # 02:00 → 03:00
AUTUMN = date(2026, 10, 25)  # 03:00 → 02:00


def test_skipped_time_moves_forward():
    moment, existed = local_datetime(SPRING, 2, 30, TZ)
    assert not existed and (moment.hour, moment.minute) == (3, 30)


def test_slot_inside_skipped_hour_is_ignored():
    occ = occurrence(slot({"time": "02:15"}, {"time": "02:45"}), SPRING, TZ, fake_sun)
    assert occ.ignored == "skipped_by_dst"


def test_ambiguous_time_takes_first_occurrence():
    moment, existed = local_datetime(AUTUMN, 2, 30, TZ)
    assert existed and moment.utcoffset() == timedelta(hours=2)


def test_autumn_night_lasts_one_hour_more():
    occ = occurrence(slot({"time": "22:00"}, {"time": "06:00"}), date(2026, 10, 24), TZ, fake_sun)
    assert occ.end - occ.start == timedelta(hours=9)


# --- whole day ----------------------------------------------------------------


def test_overlap_trims_the_later_slot():
    slots = [
        slot({"time": "08:00"}, {"time": "12:00"}, "a"),
        slot({"time": "11:00"}, {"time": "14:00"}, "b"),
        slot({"time": "11:30"}, {"time": "11:55"}, "c"),
    ]
    a, b, c = day_occurrences(slots, SUMMER, TZ, fake_sun)
    assert a.runs and a.end == at(SUMMER, 12, 0)
    assert b.runs and b.start == at(SUMMER, 12, 0)
    assert c.ignored == "overlap"


def test_day_occurrences_is_trim_of_place_day():
    slots = [
        slot({"time": "11:00"}, {"time": "14:00"}, "b"),
        slot({"time": "08:00"}, {"time": "12:00"}, "a"),
        slot({"time": "11:30"}, None, "c"),
        slot({"sun": "sunset"}, {"time": "06:00"}, "d"),
    ]
    placed = place_day(slots, SUMMER, TZ, fake_sun)
    assert [o.slot_id for o in placed] == ["a", "b", "c", "d"]
    assert all(o.runs for o in placed)  # place_day never trims
    assert trim(placed) == day_occurrences(slots, SUMMER, TZ, fake_sun)


def test_trim_of_a_filtered_placement_ignores_removed_slots():
    slots = [
        slot({"time": "08:00"}, {"time": "12:00"}, "a"),
        slot({"time": "11:00"}, {"time": "14:00"}, "b"),
    ]
    placed = place_day(slots, SUMMER, TZ, fake_sun)
    (b,) = trim([o for o in placed if o.slot_id == "b"])
    assert b.runs and b.start == at(SUMMER, 11, 0)


# --- a zone that is neither UTC nor the zone of the developer: wall-clock bugs show -------------------------


def _utc(day, h, m=0, s=0, tz=AKL):
    return datetime(day.year, day.month, day.day, h, m, s, tzinfo=tz).astimezone(UTC)


def _occ(start, end="NONE", day=WEDNESDAY, sun=no_sun, sid="x", **extra):
    spec = {"id": sid, "start": start, **extra}
    if end != "NONE":
        spec["end"] = end
    return occurrence(spec, day, AKL, sun, identity=("p", "m"))


THURSDAY = date(2026, 10, 29)


@pytest.mark.parametrize(
    ("time", "expected"),
    [("08:00", datetime(2026, 10, 28, 8, tzinfo=AKL)), ("24:00", datetime(2026, 10, 29, tzinfo=AKL))],
)
def test_fixed_time_is_read_in_the_given_zone(time, expected):
    assert resolve_time({"time": time}, WEDNESDAY, AKL, no_sun) == (expected, True)


def test_missing_sun_event_is_reported_as_existing_none():
    assert resolve_time({"sun": "sunset"}, WEDNESDAY, AKL, no_sun) == (None, True)


def test_solar_time_is_a_whole_minute_in_the_given_zone():
    def sun(event, day):
        return datetime(2026, 10, 28, 6, 30, 45, 123456, tzinfo=UTC)

    moment, existed = resolve_time({"sun": "sunrise", "offset": 10}, WEDNESDAY, AKL, sun)
    assert existed is True
    assert (moment.second, moment.microsecond) == (0, 0)
    assert moment == datetime(2026, 10, 28, 6, 40, tzinfo=UTC)
    assert moment.utcoffset() == timedelta(hours=13)


@pytest.mark.parametrize(
    ("limits", "expected_hour"),
    [({"earliest": "19:00"}, 19), ({"latest": "17:00"}, 17), ({"earliest": "17:00", "latest": "19:00"}, 18)],
)
def test_solar_limits_are_read_in_the_given_zone(limits, expected_hour):
    def sun(event, day):
        return datetime(2026, 10, 28, 5, 0, tzinfo=UTC)  # 18:00 in Auckland

    moment = resolve_time({"sun": "dawn", **limits}, WEDNESDAY, AKL, sun)[0]
    assert moment == datetime(2026, 10, 28, expected_hour, tzinfo=AKL)


# --- random delays: the draw is a stable hash, so it is pinned -------------------------------------------


@pytest.mark.parametrize(
    ("day", "owner", "expected"),
    [(date(2026, 6, 22), ("program", "mode"), "11:32"), (date(2026, 6, 22), ("a", "p"), "11:28"),
     (date(2026, 6, 21), ("a", "p"), "09:17")],
)
def test_random_delay_is_pinned_across_releases(day, owner, expected):
    """Changing the seed or the modulus would move every user's slots."""
    spec = {"id": "s", "start": {"time": "08:00", "random_minutes": 240}}
    result = occurrence(spec, day, TZ, no_sun, identity=owner)
    assert result.start.astimezone(TZ).strftime("%H:%M") == expected


def test_random_delay_depends_on_non_ascii_seed_bytes():
    """The seed is hashed as ASCII-escaped JSON: an accented seed must keep its draw across releases."""
    spec = {"id": "s", "start": {"time": "08:00", "random_minutes": 240}, "seed": "séjour"}
    assert occurrence(spec, WEDNESDAY, AKL, no_sun, identity=("p",)).start == _utc(WEDNESDAY, 9, 51)


def test_random_delay_of_the_end_is_drawn_apart_from_the_start():
    """The edge name is part of the hash: start and end of a slot draw independently, and stay pinned."""
    spec = {"id": "r", "start": {"time": "08:00", "random_minutes": 240},
            "end": {"time": "20:00", "random_minutes": 240}}
    occ = occurrence(spec, WEDNESDAY, AKL, no_sun, identity=("p", "m"))
    assert occ.start == _utc(WEDNESDAY, 8) + timedelta(minutes=128)
    assert occ.end == _utc(WEDNESDAY, 20) + timedelta(minutes=173)


def test_random_delay_follows_the_seed_not_the_id():
    def start(sid, **extra):
        return _occ({"time": "08:00", "random_minutes": 240}, sid=sid, **extra).start

    assert start("a", seed="shared") == start("b", seed="shared")
    assert len({start(sid) for sid in "abcdef"}) > 1  # without a seed, each id draws on its own


def test_random_delay_of_a_solar_slot_is_capped_by_latest_on_the_day_it_ends():
    start = {"time": "22:00"}
    end = {"sun": "sunrise", "random_minutes": 240, "latest": "06:30"}
    # the end lands on the next morning (sunrise before noon): the cap is that day's 06:30, not today's
    occ = occurrence({"id": "x", "start": start, "end": end}, WEDNESDAY, AKL,
                     lambda e, d: _utc(d, 6, 0) if e else None, identity=("p",))
    assert occ.runs
    assert occ.start == _utc(WEDNESDAY, 22)
    assert occ.end == _utc(THURSDAY, 6, 30)


# --- why a slot is ignored, and where it ends ----------------------------------------------------------


def _next_morning_sun(event, day):
    return _utc(day, 6, 0) if day == WEDNESDAY else None


def _sun_at_615(event, day):
    return _utc(day, 6, 15)


@pytest.mark.parametrize(
    ("start", "end", "sun", "expected"),
    [
        pytest.param({"sun": "sunset"}, {"time": "23:00"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 0), None, "sun_event_missing"),
                     id="a missing sun event at the start puts the slot at local midnight"),
        pytest.param({"time": "08:00"}, {"sun": "sunset"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 8), None, "sun_event_missing"),
                     id="a missing sun event at the end keeps the start"),
        pytest.param({"time": "22:00"}, {"sun": "sunrise"}, _next_morning_sun,
                     Occurrence("x", _utc(WEDNESDAY, 22), None, "sun_event_missing"),
                     id="the end moves to a morning without sunrise"),
        pytest.param({"time": "22:00"}, {"sun": "sunrise"}, _sun_at_615,
                     Occurrence("x", _utc(WEDNESDAY, 22), _utc(THURSDAY, 6, 15)),
                     id="the end uses the sun of the next morning"),
        pytest.param({"time": "08:00"}, {"time": "08:00"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 8), _utc(THURSDAY, 8)),
                     id="an end equal to the start lasts a whole day"),
        pytest.param({"time": "18:00"}, {"time": "11:59"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 18), _utc(THURSDAY, 11, 59)),
                     id="an end before noon is the next morning"),
        pytest.param({"time": "18:00"}, {"time": "12:00"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 18), _utc(WEDNESDAY, 12), "empty"),
                     id="an end at noon is not the next morning: the slot is empty"),
        pytest.param({"time": "18:00"}, {"time": "13:00"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 18), _utc(WEDNESDAY, 13), "empty"),
                     id="an end in the afternoon before the start is empty"),
        pytest.param({"time": "08:00"}, {"time": "08:04"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 8), _utc(WEDNESDAY, 8, 4), "too_short"),
                     id="four minutes is too short"),
        pytest.param({"time": "08:00"}, {"time": "08:05"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 8), _utc(WEDNESDAY, 8, 5)),
                     id="five minutes is enough"),
        pytest.param({"time": "08:00", "random_minutes": 5}, {"time": "08:05"}, no_sun,
                     Occurrence("x", _utc(WEDNESDAY, 8, 5), _utc(WEDNESDAY, 8, 5), "empty"),
                     id="a delay that lands the start on the end leaves an empty, not a too short, slot"),
    ],
)
def test_where_a_slot_starts_ends_and_why_it_is_ignored(start, end, sun, expected):
    assert _occ(start, end, sun=sun) == expected


def test_a_slot_wholly_in_the_dst_gap_is_skipped_but_one_end_in_the_gap_runs():
    gap_day = date(2027, 3, 28)  # Brussels: 02:00 -> 03:00

    def place(start, end):
        return occurrence({"id": "x", "start": {"time": start}, "end": {"time": end}}, gap_day, TZ, no_sun)

    both = place("02:10", "02:40")
    assert both.ignored == "skipped_by_dst" and both.slot_id == "x"
    # a skipped time moves forward by the hour that does not exist: 02:10 -> 03:10 (01:10 UTC)
    assert both.start == datetime(2027, 3, 28, 1, 10, tzinfo=UTC)
    assert both.end == datetime(2027, 3, 28, 1, 40, tzinfo=UTC)
    assert place("02:30", "04:00").runs
    assert place("01:00", "02:30").runs


def test_place_day_uses_the_zone_and_the_identity():
    slots = [{"id": "b", "start": {"time": "09:00"}, "end": {"time": "10:00"}},
             {"id": "a", "start": {"time": "08:00", "random_minutes": 240}, "end": {"time": "20:00"}}]
    placed = place_day(slots, WEDNESDAY, AKL, no_sun, identity=("prog", "mode"))
    assert [o.start for o in placed] == sorted(o.start for o in placed)
    by_id = {o.slot_id: o for o in placed}
    assert by_id["b"].start == _utc(WEDNESDAY, 9) and by_id["b"].end == _utc(WEDNESDAY, 10)
    other = place_day(slots, WEDNESDAY, AKL, no_sun, identity=("other", "mode"))
    assert {o.slot_id: o.start for o in other}["a"] != by_id["a"].start
    assert place_day(slots, WEDNESDAY, AKL, no_sun, identity=("prog", "mode")) == placed
    assert day_occurrences(slots, WEDNESDAY, AKL, no_sun, identity=("other", "mode")) == trim(other)


def _o(start_h, end_h, sid="a", start_m=0, end_m=0, ignored=None):
    end = None if end_h is None else _utc(WEDNESDAY, end_h, end_m)
    return Occurrence(sid, _utc(WEDNESDAY, start_h, start_m), end, ignored)


def test_trim_keeps_a_slot_starting_exactly_when_the_previous_one_ends():
    first, shot = _o(8, 9), _o(9, None, "shot")
    assert trim([first, shot]) == [first, shot]  # one-shot at the very end: not an overlap
    assert trim([first, _o(8, None, "x", start_m=30)])[1].ignored == "overlap"  # a one-shot inside is


@pytest.mark.parametrize(
    ("end_minutes", "expected"),
    [
        pytest.param(5, Occurrence("b", _utc(WEDNESDAY, 9), _utc(WEDNESDAY, 9, 5), None),
                     id="what is left after the overlap is kept from five minutes"),
        pytest.param(4, Occurrence("b", _utc(WEDNESDAY, 8, 30), _utc(WEDNESDAY, 9, 4), "overlap"),
                     id="four minutes left is dropped as an overlap"),
    ],
)
def test_trim_keeps_exactly_five_minutes_and_drops_four(end_minutes, expected):
    assert trim([_o(8, 9), _o(8, 9, "b", start_m=30, end_m=end_minutes)])[1] == expected


def test_trim_moves_the_start_and_keeps_the_id_and_the_end():
    result = trim([_o(8, 10), _o(9, 12, "b")])
    assert result[1] == Occurrence("b", _utc(WEDNESDAY, 10), _utc(WEDNESDAY, 12), None)
    one_shot = trim([_o(8, 10), _o(9, None, "shot")])[1]
    assert one_shot == Occurrence("shot", _utc(WEDNESDAY, 9), None, "overlap")


def test_trim_ignores_ignored_slots_when_computing_the_furthest_end():
    too_short = Occurrence("tiny", _utc(WEDNESDAY, 10), _utc(WEDNESDAY, 10, 3), "too_short")
    later = _o(10, 11, "later", start_m=1)
    assert trim([_o(8, 9), too_short, later])[2] == later
