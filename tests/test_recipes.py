"""The wiki recipes (wiki/RECETTE_*.fr.md), built as real programs and run through the validator and the resolver.

Each test is one recipe: the setup is the one the page tells the reader to build, the checks are the results the page
announces. Entity ids are examples; the values (temperatures, times, positions) are the ones of the recipes.
"""

from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

from custom_components.weekly_planner.actions import resolve_action
from custom_components.weekly_planner.resolver import resolve_entity
from custom_components.weekly_planner.timeline import occurrence
from custom_components.weekly_planner.validation import check_program

TZ = ZoneInfo("Europe/Brussels")
MON, TUE, WED, THU, FRI, SAT, SUN = range(7)
WEEKDAYS, WEEKEND, ALL = [MON, TUE, WED, THU, FRI], [SAT, SUN], list(range(7))


def svc(service: str, **data) -> dict:
    return {"kind": "service", "service": service, "data": data}


def label(name: str, action: dict) -> dict:
    return {"id": name, "name": name, "color": "#ff9800", "action": action}


def temp(name: str, value: float) -> dict:
    return label(name, svc("climate.set_temperature", temperature=value))


def position(name: str, value: int) -> dict:
    return label(name, svc("cover.set_cover_position", position=value))


ON = label("Marche", svc("switch.turn_on"))
OFF = label("Arrêt", svc("switch.turn_off"))
LABELS = {item["id"]: item for item in (
    temp("Confort", 19), temp("Week-end", 20), temp("Nuit", 16), temp("Éco", 16), temp("Hors gel", 8),
    temp("Confort enfants", 20), temp("Nuit maison", 14), temp("Pointe", 17), temp("Bureau", 21),
    position("Ouvert", 100), position("Fermé", 0), position("Mi-fermé", 30),
    ON, OFF,
    label("Veilleuse", svc("light.turn_on", brightness_pct=10)),
    label("Présence", svc("light.turn_on", brightness_pct=40)),
    label("Éteinte", svc("light.turn_off")),
)}


def slot(sid: str, start, end, name: str, **extra) -> dict:
    """A slot: ``start`` and ``end`` are 'HH:MM' or a solar spec; ``end`` None is a one-shot."""
    def spec(value):
        return None if value is None else ({"time": value} if isinstance(value, str) else value)
    out = {"id": sid, "start": spec(start), "label": name, "conditions": []}
    if end is not None:
        out["end"] = spec(end)
    return {**out, **extra}


def program(pid: str, entities: dict[str, str | None], by_day: dict[int, list], *, priority=1, conditions=None,
            profiles=None) -> dict:
    """``entities``: entity id -> its 'rest of the time' label (None: leave as is)."""
    prof = profiles or [{"id": "p", "name": "Maison", "days": [list(by_day.get(d, [])) for d in range(7)]}]
    return check_program({
        "id": pid, "name": pid, "priority": priority, "created_at": f"2026-01-0{priority}",
        "conditions": conditions or [],
        "entities": [{"entity_id": e, "default_label": rest} for e, rest in entities.items()],
        "profiles": prof,
    }, LABELS)


def days(days_: list[int], *slots: dict) -> dict[int, list]:
    """The same slots on several days (each day gets its own copies, as the card stores them)."""
    return {d: [dict(s, id=f"{s['id']}{d}") for s in slots] for d in days_}


def merge(*parts: dict) -> dict:
    out: dict[int, list] = {}
    for part in parts:
        for d, items in part.items():
            out.setdefault(d, []).extend(items)
    return out


def at(day: int, h: int, m: int = 0) -> datetime:
    """October 2026 (winter time): 26 = Monday."""
    return (datetime(2026, 10, 26, h, m, tzinfo=TZ) + timedelta(days=day)).astimezone(UTC)


def no_sun(_event, _day):
    return None


def now(programs, entity, moment, *, ok=lambda c: True, profiles=None, vacation=False):
    seg = resolve_entity(entity, programs, lambda p, e, lbl: resolve_action(p, e, lbl, LABELS), moment, TZ, no_sun,
                         ok, active_profiles=profiles, vacation=vacation)
    if seg.action is None:
        return None
    return seg.action["data"] or seg.action["service"]


def test_heating_weekdays_and_weekend():
    rooms = {"climate.salon": "Nuit"}
    prog = program("chauffage", rooms, merge(
        days(WEEKDAYS, slot("m", "06:30", "08:30", "Confort"), slot("s", "17:00", "22:30", "Confort")),
        days(WEEKEND, slot("j", "08:00", "22:30", "Week-end"))))
    assert now([prog], "climate.salon", at(WED, 7)) == {"temperature": 19}
    assert now([prog], "climate.salon", at(WED, 12)) == {"temperature": 16}
    assert now([prog], "climate.salon", at(SAT, 12)) == {"temperature": 20}
    assert now([prog], "climate.salon", at(SAT, 23)) == {"temperature": 16}


def test_shutters_follow_the_sun_with_limits():
    sunrise = datetime(2026, 6, 15, 3, 50, tzinfo=UTC)  # 05:50 local (summer time)
    sunset = datetime(2026, 6, 15, 19, 50, tzinfo=UTC)  # 21:50 local
    sun = lambda event, day: sunrise if event == "sunrise" else sunset
    day = date(2026, 6, 15)
    weekday = occurrence({"id": "o", "start": {"sun": "sunrise", "earliest": "07:00"}}, day, TZ, sun)
    weekend = occurrence({"id": "o", "start": {"sun": "sunrise", "earliest": "09:00"}}, day, TZ, sun)
    close = occurrence({"id": "c", "start": {"sun": "sunset", "offset": 15, "latest": "21:30"}}, day, TZ, sun)
    assert weekday.start.astimezone(TZ).strftime("%H:%M") == "07:00"
    assert weekend.start.astimezone(TZ).strftime("%H:%M") == "09:00"
    assert close.start.astimezone(TZ).strftime("%H:%M") == "21:30"
    covers = {c: None for c in ("cover.volet_salon", "cover.volet_cuisine", "cover.volet_bureau")}
    check = program("volets", covers, merge(
        days(WEEKDAYS, slot("o", {"sun": "sunrise", "earliest": "07:00"}, None, "Ouvert"),
             slot("f", {"sun": "sunset", "offset": 15, "latest": "21:30"}, None, "Fermé")),
        days(WEEKEND, slot("o", {"sun": "sunrise", "earliest": "09:00"}, None, "Ouvert"),
             slot("f", {"sun": "sunset", "offset": 15, "latest": "21:30"}, None, "Fermé"))))
    assert len(check["entities"]) == 3


def test_summer_shutters_are_two_one_shot_programs_under_conditions_and_leave_the_rest_alone():
    hot = [{"entity_id": "sensor.season", "op": "eq", "value": "summer"},
           {"entity_id": "sensor.temperature_exterieure", "op": "gt", "value": 24}]
    close = program("ete-fermer", {"cover.volet_salon": None, "cover.volet_chambre_sud": None},
                    days(ALL, slot("a", "12:00", None, "Mi-fermé")), conditions=hot)
    reopen = program("ete-rouvrir", {"cover.volet_salon": None, "cover.volet_chambre_sud": None},
                     days(ALL, slot("b", "18:00", None, "Ouvert")), priority=2, conditions=hot[:1])
    assert close["conditions"] == hot and reopen["conditions"] == hot[:1]
    # one-shots are events: between them the programs leave the shutter alone (rest of the time: leave as is)
    assert now([close, reopen], "cover.volet_salon", at(WED, 14)) is None


def test_watering_runs_three_days_and_stops_when_it_rains():
    rain = [{"entity_id": "sensor.pluviometre_24h", "op": "lt", "value": 2}]
    prog = program("arrosage", {"switch.arrosage_jardin": "Arrêt"},
                   days([MON, WED, SAT], slot("w", "06:00", "06:20", "Marche")), conditions=rain)
    dry = lambda c: True
    wet = lambda c: not c
    assert now([prog], "switch.arrosage_jardin", at(MON, 6, 10), ok=dry) == "switch.turn_on"
    assert now([prog], "switch.arrosage_jardin", at(MON, 6, 10), ok=wet) == "switch.turn_off"
    assert now([prog], "switch.arrosage_jardin", at(MON, 6, 25), ok=dry) == "switch.turn_off"
    assert now([prog], "switch.arrosage_jardin", at(TUE, 6, 10), ok=dry) == "switch.turn_off"


def test_water_heater_off_peak_nights_and_whole_weekend():
    prog = program("chauffe-eau", {"switch.chauffe_eau": "Arrêt"}, merge(
        days(ALL, slot("n", "22:00", "06:00", "Marche")),
        days(WEEKEND, slot("w", "06:00", "22:00", "Marche"))))
    heater = "switch.chauffe_eau"
    expected = [(MON, 23, True), (TUE, 3, True), (TUE, 7, False), (FRI, 12, False), (FRI, 23, True),
                (SAT, 3, True), (SAT, 12, True), (SUN, 12, True), (SUN, 23, True), (MON, 5, True), (MON, 7, False)]
    for day, hour, running in expected:
        want = "switch.turn_on" if running else "switch.turn_off"
        assert now([prog], heater, at(day, hour)) == want, (day, hour)
    # Sunday 22:00 -> Monday 06:00 is the night slot of Sunday: Monday morning follows it
    assert now([prog], heater, at(MON + 7, 5)) == "switch.turn_on"


def test_holiday_house_follows_the_vacation_mode():
    modes = lambda p, a: [
        {"id": "m", "name": "Maison", "days": [list(x) for x in a]},
        {"id": "v", "name": "Vacances", "days": [list(x) for x in p]}]
    heating = program("chauffage", {"climate.salon": "Éco"}, {}, profiles=modes(
        [[slot("h", "00:00", "24:00", "Hors gel")] for _ in range(7)],
        [[slot("c", "06:30", "08:30", "Confort")] for _ in range(7)]))
    shutters = program("volets", {"cover.volet_salon": None}, {}, profiles=modes(
        [[slot("f", "00:00", "24:00", "Fermé")] for _ in range(7)],
        [[slot("o", {"sun": "sunrise", "earliest": "07:00"}, None, "Ouvert")] for _ in range(7)]))
    lamps = [{"entity_id": e, "default_label": None, "label_overrides": {}} for e in ("light.salon", "light.chambre_etage")]
    presence = check_program({
        "id": "lumieres", "name": "Lumières de présence", "entities": lamps, "profiles": [
            {"id": "m", "name": "Maison", "days": [[] for _ in range(7)]},
            {"id": "v", "name": "Vacances", "days": [[
                slot("on", {"time": "18:30", "random_minutes": 30}, None, "Présence"),
                slot("off", {"time": "23:00", "random_minutes": 30}, None, "Éteinte")] for _ in range(7)]}]}, LABELS)
    away = {"chauffage": "v", "volets": "v", "lumieres": "v"}
    assert now([heating], "climate.salon", at(WED, 3), profiles=away) == {"temperature": 8}
    assert now([heating], "climate.salon", at(WED, 14), profiles=away) == {"temperature": 8}
    assert now([heating], "climate.salon", at(WED, 14), profiles={"chauffage": "m"}) == {"temperature": 16}
    assert now([shutters], "cover.volet_salon", at(WED, 14), profiles=away) == {"position": 0}
    # lights: events only, so coming back to the Maison mode never switches them off
    for mode in ("v", "m"):
        assert now([presence], "light.salon", at(WED, 21), profiles={"lumieres": mode}) is None
    # the suspension of all programs is another thing: nothing is sent at all
    assert now([heating], "climate.salon", at(WED, 3), profiles=away, vacation=True) is None


def test_child_night_light_ends_at_7_on_school_mornings_and_at_8_on_weekend_mornings():
    lamp = "light.chambre_enfant"
    prog = program("veilleuse", {lamp: "Éteinte"}, merge(
        days([SUN, MON, TUE, WED, THU], slot("n", "20:00", "07:00", "Veilleuse")),
        days([FRI, SAT], slot("w", "20:00", "08:00", "Veilleuse"))))
    on, off = {"brightness_pct": 10}, "light.turn_off"
    for day, hour, minute, want in [(WED, 22, 0, on), (THU, 3, 0, on), (THU, 8, 0, off), (FRI, 6, 59, on),
                                    (FRI, 7, 30, off), (FRI, 22, 0, on), (SAT, 7, 30, on), (SAT, 8, 30, off),
                                    (SAT, 22, 0, on), (SUN, 7, 59, on), (SUN, 8, 30, off), (SUN, 21, 0, on),
                                    (MON + 7, 6, 59, on), (MON + 7, 7, 30, off)]:
        assert now([prog], lamp, at(day, hour, minute)) == want, (day, hour, minute)


def test_alternating_custody_needs_the_same_rest_of_the_time_in_both_programs():
    room = "climate.chambre_enfants"
    present = [{"entity_id": "input_boolean.enfants_presents", "op": "eq", "value": "on"}]

    def build(rest_of_the_kids_week):
        base = program("base", {room: "Nuit maison"}, days(ALL, slot("b", "07:00", "22:00", "Éco")), priority=2)
        kids = program("enfants", {room: rest_of_the_kids_week}, days(
            ALL, slot("m", "06:30", "08:00", "Confort enfants"), slot("s", "16:00", "22:00", "Confort enfants")),
            priority=1, conditions=present)
        return [kids, base]

    with_kids = lambda c: True
    without = lambda c: not c
    same = build("Nuit maison")
    assert now(same, room, at(WED, 6, 45), ok=with_kids) == {"temperature": 20}
    assert now(same, room, at(WED, 6, 45), ok=without) == {"temperature": 14}  # base maison at night
    assert now(same, room, at(WED, 10), ok=with_kids) == {"temperature": 16}  # the base program is running
    assert now(same, room, at(WED, 23), ok=with_kids) == {"temperature": 14}
    # the rest of the time of the first program applies even when its conditions are false
    other = build("Confort enfants")
    assert now(other, room, at(WED, 6, 45), ok=without) == {"temperature": 20}


def test_peak_hours_hand_each_radiator_back_to_its_own_rest():
    rooms = {"climate.salon": "Éco", "climate.chambre": "Éco"}
    living = program("salon", {"climate.salon": "Éco"}, days(ALL, slot("c", "17:00", "22:00", "Confort")), priority=2)
    peak = lambda rest: program("pointe", rooms, days(ALL, slot("p", "17:00", "20:00", "Pointe")), priority=1,
                                conditions=[{"entity_id": "input_boolean.pointe", "value": "on"}]) | {
        "entities": [{"entity_id": e, "default_label": rest, "label_overrides": {}} for e in rooms]}
    good = [peak("Éco"), living]
    assert now(good, "climate.salon", at(WED, 18)) == {"temperature": 17}
    assert now(good, "climate.salon", at(WED, 20, 30)) == {"temperature": 19}
    assert now(good, "climate.salon", at(WED, 23)) == {"temperature": 16}
    assert now(good, "climate.chambre", at(WED, 21)) == {"temperature": 16}
    # without a rest of the time, nothing is sent once the peak is over: the radiator stays where it was
    bad = [peak(None), living]
    assert now(bad, "climate.chambre", at(WED, 21)) is None


def test_remote_work_example_of_the_priorities_page():
    salon = "climate.salon"
    base = program("chauffage", {salon: "Éco"}, days(ALL, slot("m", "06:30", "08:30", "Confort"),
                                                      slot("s", "17:00", "22:30", "Confort")), priority=2)
    remote = program("teletravail", {salon: "Éco"}, days(WEEKDAYS, slot("t", "09:00", "18:00", "Bureau")),
                     priority=1, conditions=[{"entity_id": "input_boolean.teletravail", "value": "on"}])
    for hour, minute, want in [(5, 0, 16), (7, 0, 19), (8, 45, 16), (12, 0, 21), (18, 30, 19), (23, 0, 16)]:
        assert now([remote, base], salon, at(WED, hour, minute))["temperature"] == want, (hour, minute)
