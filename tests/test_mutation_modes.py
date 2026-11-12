"""Mutation-testing survivors of modes.py: follow, detach, rename, delete and the revision they bump."""

from __future__ import annotations

import pytest

from custom_components.weekly_planner.modes import (
    EMPTY_PROFILE,
    apply_default_mode,
    check_follows,
    copy_days,
    copy_holiday,
    delete_profile,
    detach_followers,
    rename_profile,
    set_follow,
    unambiguous_rename,
)


def day(*ids):
    return [{"id": i, "start": {"time": "08:00"}, "end": {"time": "09:00"}, "label": "l"} for i in ids]


def week(*ids):
    return [day(*ids) if n == 0 else [] for n in range(7)]


def profile(name, days=None, **extra):
    return {"id": f"id-{name}", "name": name, "days": days if days is not None else week(), **extra}


def program(pid, profiles, **extra):
    return {"id": pid, "profiles": profiles, **extra}


# -- check_follows reads the "follows" key only ------------------------------------------------------


def test_check_follows_reads_the_follows_key_of_every_profile_and_of_the_source():
    ok = [profile("A"), profile("B", follows="A")]
    check_follows(ok)
    with pytest.raises(ValueError, match="'A' already follows another mode"):
        check_follows([profile("B", follows="A"), profile("A", follows="C"), profile("C")])
    with pytest.raises(ValueError, match="another mode already follows 'A'"):
        check_follows([profile("A", follows="C"), profile("C"), profile("B", follows="A")])
    # a profile that is only followed (no "follows" key of its own) is no source of a chain
    check_follows([profile("A"), profile("B", follows="A"), profile("C", follows="A")])


# -- copies --------------------------------------------------------------------------------------


def test_copy_days_gives_new_twelve_character_ids_and_keeps_the_seed():
    original = week("s1")
    copy = copy_days(original)
    new = copy[0][0]
    assert len(new["id"]) == 12 and new["id"] != "s1" and new["seed"] == "s1"
    assert original[0][0]["id"] == "s1" and "seed" not in original[0][0]
    assert copy_days([[{**original[0][0], "seed": "kept"}]])[0][0]["seed"] == "kept"


def test_copy_holiday_copies_an_own_day_with_new_ids_and_a_weekday_reference_as_is():
    assert copy_holiday(None) is None and copy_holiday({}) is None
    own = copy_holiday({"day": day("h1")})
    assert list(own) == ["day"] and own["day"][0]["id"] != "h1" and own["day"][0]["seed"] == "h1"
    ref = {"copy": 3}
    copied = copy_holiday(ref)
    assert copied == {"copy": 3} and copied is not ref


# -- following and stopping to follow --------------------------------------------------------------


def test_stop_following_takes_a_copy_of_the_days_and_the_day_off_of_the_source():
    source = profile("A", week("a1"), holiday={"day": day("h1")})
    follower = profile("B", week(), follows="A")
    result = set_follow(program("p", [source, follower]), "B", None)
    own = next(p for p in result["profiles"] if p["name"] == "B")
    assert "follows" not in own
    assert own["days"][0][0]["id"] != "a1" and own["days"][0][0]["seed"] == "a1"
    assert own["holiday"]["day"][0]["seed"] == "h1"
    plain = set_follow(program("p", [profile("A", week("a1")), profile("B", week(), follows="A")]), "B", None)
    assert "holiday" not in next(p for p in plain["profiles"] if p["name"] == "B")
    # the source of the original program is untouched
    assert source["days"][0][0]["id"] == "a1"


def test_stop_following_a_missing_source_leaves_seven_empty_days_and_no_day_off():
    follower = profile("B", week(), follows="Gone", holiday={"copy": 1})
    result = set_follow(program("p", [profile("A"), follower]), "B", None)
    own = next(p for p in result["profiles"] if p["name"] == "B")
    assert own["days"] == [[] for _ in range(7)] and "holiday" not in own and "follows" not in own


def test_stop_following_without_following_changes_nothing():
    base = program("p", [profile("A", week("a1")), profile("B", week("b1"))])
    assert set_follow(base, "B", None)["profiles"] == base["profiles"]
    assert set_follow(base, "Missing", None)["profiles"] == base["profiles"]


def test_follow_creates_the_mode_profile_with_a_twelve_character_id_and_seven_empty_days():
    result = set_follow(program("p", [profile("A", week("a1"))]), "B", "A")
    own = next(p for p in result["profiles"] if p["name"] == "B")
    assert len(own["id"]) == 12 and own["days"] == [[] for _ in range(7)] and own["follows"] == "A"
    assert set(own) == {"id", "name", "days", "follows"}


def test_following_empties_the_days_and_the_day_off_of_the_follower():
    own = profile("B", week("b1"), holiday={"day": day("h")})
    result = set_follow(program("p", [profile("A"), own]), "B", "A")
    follower = next(p for p in result["profiles"] if p["name"] == "B")
    assert follower["days"] == [[] for _ in range(7)] and "holiday" not in follower and follower["follows"] == "A"


# -- detaching followers and the revision ------------------------------------------------------------


def test_detach_followers_copies_for_each_follower_and_bumps_only_the_programs_concerned():
    a = program("a", [profile("Src", week("s1")), profile("F", week(), follows="Src")], revision=4)
    other = program("other", [profile("Else")], revision=7)
    nosrc = program("nosrc", [profile("F2", follows="Src")], revision=9)
    last = program("last", [profile("Src", week("t1")), profile("G", week(), follows="Src")])
    lost = detach_followers([nosrc, a, other, last], "Src")
    assert lost == [{"program_id": "a", "mode": "F"}, {"program_id": "last", "mode": "G"}]
    assert (a["revision"], other["revision"], nosrc["revision"], last["revision"]) == (5, 7, 9, 1)
    assert "follows" not in a["profiles"][1] and a["profiles"][1]["days"][0][0]["seed"] == "s1"
    assert "follows" in nosrc["profiles"][0]
    assert "revision" not in program("x", [])


def test_detach_followers_leaves_a_program_whose_source_has_no_follower_alone():
    p = program("p", [profile("Src"), profile("Other")], revision=3)
    assert detach_followers([p], "Src") == [] and p["revision"] == 3 and "revision" not in program("q", [profile("Src")]) and "revision" not in program("q", [])


def test_detach_followers_does_not_bump_a_program_that_lost_nothing_even_after_another_that_did():
    a = program("a", [profile("Src"), profile("F", follows="Src")], revision=1)
    b = program("b", [profile("Src")], revision=1)
    detach_followers([a, b], "Src")
    assert (a["revision"], b["revision"]) == (2, 1)


# -- default mode, rename and delete --------------------------------------------------------------


def test_apply_default_mode_renames_the_first_profile_follows_it_and_bumps_the_revision():
    p = program("p", [profile("Old"), profile("F", follows="Old")], revision=2)
    fresh = program("fresh", [profile("Old2")])
    assert apply_default_mode([p, fresh], "Home") == ["p", "fresh"]
    assert [x["name"] for x in p["profiles"]] == ["Home", "F"] and p["profiles"][1]["follows"] == "Home"
    assert (p["revision"], fresh["revision"]) == (3, 1)
    assert apply_default_mode([program("q", [profile("X")])], "") == []
    skip = program("s", [profile("Known")], revision=5)
    assert apply_default_mode([skip], "Home", ["Known"]) == [] and skip["revision"] == 5


def test_rename_profile_retargets_followers_bumps_and_skips_in_order():
    a = program("a", [profile("Old"), profile("F", follows="Old")], revision=1)
    b = program("b", [profile("Other")], revision=1)
    c = program("c", [profile("Old"), profile("New")], revision=1)
    d = program("d", [profile("Old")])
    assert rename_profile([a, b, c, d], "Old", "New") == (["a", "d"], ["c"])
    assert a["profiles"][1]["follows"] == "New" and a["profiles"][0]["name"] == "New"
    assert (a["revision"], b["revision"], c["revision"], d["revision"]) == (2, 1, 1, 1)


def test_rename_profile_goes_on_past_a_program_without_the_profile():
    first = program("first", [profile("Else")])
    second = program("second", [profile("Old")], revision=0)
    assert rename_profile([first, second], "Old", "New") == (["second"], [])


def test_delete_profile_detaches_followers_bumps_and_skips_a_last_profile_without_stopping():
    a = program("a", [profile("Src", week("s1")), profile("F", week(), follows="Src")], revision=3)
    b = program("b", [profile("Src")], revision=3)
    c = program("c", [profile("Else"), profile("Src")])
    d = program("d", [profile("Else")], revision=3)
    assert delete_profile([d, b, a, c], "Src") == (["a", "c"], ["b"])
    assert [p["name"] for p in a["profiles"]] == ["F"] and "follows" not in a["profiles"][0]
    assert a["profiles"][0]["days"][0][0]["seed"] == "s1"
    assert (a["revision"], b["revision"], c["revision"], d["revision"]) == (5, 3, 1, 3)
    # detaching bumped once, deleting bumped once more: the followers copy first, then the profile goes
    twice = program("t", [profile("Src", week("s1")), profile("F", week(), follows="Src")], revision=0)
    delete_profile([twice], "Src")
    assert twice["revision"] == 2


def test_delete_profile_goes_on_past_a_program_without_the_profile():
    assert delete_profile([program("x", [profile("Else")]), program("y", [profile("Src"), profile("Z")])], "Src") == (["y"], [])


# -- rename detection ----------------------------------------------------------------------------


def test_unambiguous_rename_needs_equal_length_and_distinct_options():
    programs = [program("p", [profile("Old")])]
    assert unambiguous_rename(["Old"], ["New"], programs) == ("Old", "New")
    assert unambiguous_rename(["Old", "X"], ["New"], programs) is None
    assert unambiguous_rename(["Old", "X"], ["New", "New"], programs) is None
    assert unambiguous_rename(["Old", "X"], ["New", "Y"], programs) is None


def test_the_empty_profile_has_no_schedule():
    assert EMPTY_PROFILE["days"] == [[] for _ in range(7)] and EMPTY_PROFILE["name"] == ""
