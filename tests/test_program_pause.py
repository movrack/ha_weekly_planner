"""Timed pause of one program (spec § 37.1): suspended state plus a stored resume time."""

from __future__ import annotations

from datetime import timedelta

import pytest
import voluptuous as vol
from homeassistant.exceptions import ServiceValidationError, Unauthorized
from homeassistant.util import dt as dt_util

from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.validation import check_program

from .helpers import CLIMATE, Recorder, local, program, setup, slot, tick
from .test_yaml_file import _doc, _edit, _issue, _later

OTHER = "cover.office"


def _two() -> list[dict]:
    other = program("other", entities=[{"entity_id": OTHER, "default_label": "close", "label_overrides": {}}],
                    slots=[slot("o1", "08:00", "12:00", "open")])
    return [program(), other]


async def _start(hass, hass_storage, freezer, programs=None, start="default", **options):
    start = local(26, 9) if start == "default" else start
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, programs or [program()], start, **options)
    rec.calls.clear()
    return rec, engine


def _until(engine, pid="office"):
    return engine.store.program(pid).get("paused_until")


async def test_pause_suspends_stores_until_and_applies_default_once(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    now = dt_util.utcnow()
    await engine.async_pause("office", 2)
    prog = engine.store.program("office")
    assert prog["enabled"] is False
    assert dt_util.parse_datetime(prog["paused_until"]) == now + timedelta(days=2)
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})]  # default, once
    assert engine.program_status("office")["paused_until"] == prog["paused_until"]
    state = hass.states.get("switch.weekly_planner_office") or hass.states.async_all("switch")[-1]
    assert any(s.attributes.get("paused_until") == prog["paused_until"] for s in hass.states.async_all("switch"))
    assert state is not None
    await tick(hass, freezer, timedelta(hours=3))
    assert rec.calls == [("climate.set_temperature", {"temperature": 15})]  # nothing more while paused


@pytest.mark.parametrize("days", [1, 2, 7, 14])
async def test_auto_resume_reapplies_desired_state(hass, hass_storage, freezer, days):
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", days)
    rec.calls.clear()
    await tick(hass, freezer, timedelta(days=days) - timedelta(minutes=1))
    assert engine.store.program("office")["enabled"] is False
    await tick(hass, freezer, timedelta(minutes=2))
    prog = engine.store.program("office")
    assert prog["enabled"] is True and "paused_until" not in prog
    assert engine._pause_timers == {}
    assert ("climate.set_temperature", {"temperature": 21}) in rec.calls  # 09:00 slot, reapplied


async def test_pause_of_a_disabled_program_changes_the_resume_time(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_set_enabled("office", False)
    rec.calls.clear()
    await engine.async_pause("office", 1)
    first = _until(engine)
    assert engine.store.program("office")["enabled"] is False and first
    assert rec.calls == []  # already suspended: no second default
    await tick(hass, freezer, timedelta(hours=1))
    await engine.async_pause("office", 7)
    assert _until(engine) != first and len(engine._pause_timers) == 1
    await tick(hass, freezer, timedelta(days=1, hours=1))  # the first time passes, nothing resumes
    assert engine.store.program("office")["enabled"] is False


async def test_manual_enable_and_disable_clear_the_pause(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    await engine.async_set_enabled("office", True)
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None
    assert engine._pause_timers == {}
    await engine.async_pause("office", 1)
    await engine.async_set_enabled("office", False)  # indefinite pause
    assert engine.store.program("office")["enabled"] is False and _until(engine) is None
    assert engine._pause_timers == {}
    rec.calls.clear()
    await tick(hass, freezer, timedelta(days=2))
    assert engine.store.program("office")["enabled"] is False and rec.calls == []


async def test_switch_service_clears_the_pause(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    entity = next(s.entity_id for s in hass.states.async_all("switch") if s.attributes.get("program_id") == "office")
    await hass.services.async_call("switch", "turn_on", {"entity_id": entity}, blocking=True)
    await hass.async_block_till_done()
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None


async def test_cancel_resumes_now(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    rec.calls.clear()
    await engine.async_pause("office", None)
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None
    assert engine._pause_timers == {}
    assert ("climate.set_temperature", {"temperature": 21}) in rec.calls
    await engine.async_pause("office", None)  # nothing to cancel: harmless


@pytest.mark.parametrize("days", [0, 3, 30, -1])
async def test_invalid_days_are_rejected(hass, hass_storage, freezer, days):
    _rec, engine = await _start(hass, hass_storage, freezer)
    with pytest.raises(ServiceValidationError):
        await engine.async_pause("office", days)
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None


async def test_unknown_program_is_refused(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    with pytest.raises(ServiceValidationError):
        await engine.async_pause("nope", 1)


async def test_other_programs_are_untouched(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer, _two())
    await engine.async_pause("office", 1)
    other = engine.store.program("other")
    assert other["enabled"] is True and "paused_until" not in other
    assert all(service.startswith("climate.") for service in rec.services)
    await tick(hass, freezer, timedelta(days=1, minutes=1))
    assert engine.store.program("other")["enabled"] is True and engine.store.program("office")["enabled"] is True


async def test_restart_with_future_until_schedules_the_resume(hass, hass_storage, freezer):
    until = (local(26, 9) + timedelta(days=1)).astimezone(dt_util.UTC).isoformat()
    paused = program()
    paused.update(enabled=False, paused_until=until)
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [paused], local(26, 9))
    assert engine.store.program("office")["enabled"] is False and len(engine._pause_timers) == 1
    assert rec.calls == []
    await tick(hass, freezer, timedelta(days=1))
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None
    assert ("climate.set_temperature", {"temperature": 21}) in rec.calls


async def test_restart_with_past_until_resumes_after_stabilization(hass, hass_storage, freezer):
    until = (local(26, 9) - timedelta(hours=5)).astimezone(dt_util.UTC).isoformat()
    paused = program()
    paused.update(enabled=False, paused_until=until)
    rec = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [paused], local(26, 9))
    await hass.async_block_till_done()
    prog = engine.store.program("office")
    assert prog["enabled"] is True and "paused_until" not in prog
    assert ("climate.set_temperature", {"temperature": 21}) in rec.calls


async def test_unload_cancels_the_timer(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    await engine.async_stop()
    assert engine._pause_timers == {}
    engine._sync_pauses()  # a stopped engine never re-arms
    assert engine._pause_timers == {}


async def test_deleting_or_editing_the_pause_drops_the_timer(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer, _two())
    await engine.async_pause("office", 1)
    await engine.async_pause("other", 1)
    engine.store.programs.remove(engine.store.program("office"))
    await engine.async_config_changed()
    assert list(engine._pause_timers) == ["other"]


async def test_timer_ignores_a_pause_changed_meanwhile(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    old = _until(engine)
    engine.store.program("office")["paused_until"] = None
    await engine._async_end_pause("office", old)
    assert engine.store.program("office")["enabled"] is False


async def test_websocket_pause_and_cancel(hass, hass_storage, freezer, hass_ws_client):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/pause", "program_id": "office", "days": 7})
    assert (await ws.receive_json())["success"]
    assert engine.store.program("office")["enabled"] is False and _until(engine)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    data = (await ws.receive_json())["result"]
    assert data["programs"][0]["paused_until"] == _until(engine)
    assert data["status"]["office"]["paused_until"] == _until(engine)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/pause", "program_id": "office", "days": None})
    assert (await ws.receive_json())["success"]
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None


async def test_websocket_errors(hass, hass_storage, freezer, hass_ws_client):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/pause", "program_id": "office", "days": 3})
    assert not (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/pause", "program_id": "nope", "days": 1})
    assert (await ws.receive_json())["error"]["code"] == "not_found"
    assert engine.store.program("office")["enabled"] is True


async def test_websocket_open_to_non_admin_like_set_enabled(hass, hass_storage, freezer, hass_ws_client,
                                                            hass_read_only_access_token):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None, admin_only=True)
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/pause", "program_id": "office", "days": 1})
    assert (await ws.receive_json())["success"]  # same rule as set_enabled
    assert engine.store.program("office")["enabled"] is False


async def test_services_pause_and_resume(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await hass.services.async_call(DOMAIN, "pause", {"program_id": "office", "days": "14"}, blocking=True)
    assert engine.store.program("office")["enabled"] is False and _until(engine)
    await hass.services.async_call(DOMAIN, "resume", {"program_id": "office"}, blocking=True)
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None
    with pytest.raises(vol.Invalid):
        await hass.services.async_call(DOMAIN, "pause", {"program_id": "office", "days": 5}, blocking=True)


async def test_services_need_edit_rights_when_admin_only(hass, hass_storage, freezer, hass_read_only_user):
    from homeassistant.core import Context
    _rec, engine = await _start(hass, hass_storage, freezer, admin_only=True)
    for service, data in (("pause", {"program_id": "office", "days": 1}), ("resume", {"program_id": "office"})):
        with pytest.raises(Unauthorized):
            await hass.services.async_call(DOMAIN, service, data, blocking=True,
                                           context=Context(user_id=hass_read_only_user.id))
    assert engine.store.program("office")["enabled"] is True


async def test_yaml_round_trip(hass, hass_storage, freezer, yaml_in_tmp):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 7)
    await _later(hass, freezer, 3)
    mirrored = _doc(yaml_in_tmp)["programs"][0]
    assert mirrored["enabled"] is False and mirrored["paused_until"] == _until(engine)
    # a hand edit moves the resume time (unquoted date-time form included)
    new = (dt_util.utcnow() + timedelta(days=2)).replace(microsecond=0)
    text = yaml_in_tmp.read_text()
    quoted = f"paused_until: '{_until(engine)}'"
    assert quoted in text
    yaml_in_tmp.write_text(text.replace(quoted, f"paused_until: {new.isoformat()}"))  # unquoted: parsed as a datetime
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert dt_util.parse_datetime(_until(engine)) == new
    assert engine.store.program("office")["enabled"] is False and len(engine._pause_timers) == 1
    # resuming by hand in the file
    text = yaml_in_tmp.read_text()
    assert "enabled: false" in text
    yaml_in_tmp.write_text(text.replace("enabled: false", "enabled: true"))
    await _later(hass, freezer, 31)
    assert engine.store.program("office")["enabled"] is True and _until(engine) is None
    assert engine._pause_timers == {}


async def test_yaml_invalid_date_makes_the_file_invalid(hass, hass_storage, freezer, yaml_in_tmp):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 1)
    before = _until(engine)
    await _later(hass, freezer, 3)  # mirror written
    for bad in ("tomorrow", "2026-11-10T08:00:00", 12):  # not a date, no offset, not text
        _edit(yaml_in_tmp, lambda d, bad=bad: d["programs"][0].update(paused_until=bad))
        await _later(hass, freezer, 31)
        assert _issue(hass) is not None and _until(engine) == before


def test_validation_keeps_or_drops_paused_until():
    base = program()
    labels = {"t15": {}, "t21": {}}
    suspended = check_program({**base, "enabled": False, "paused_until": "2026-11-10T09:00:00+01:00"}, labels)
    assert suspended["paused_until"] == "2026-11-10T08:00:00+00:00"
    assert "paused_until" not in check_program({**base, "paused_until": "2026-11-10T09:00:00+00:00"}, labels)
    assert "paused_until" not in check_program({**base, "enabled": False, "paused_until": None}, labels)
    with pytest.raises(vol.Invalid):
        check_program({**base, "enabled": False, "paused_until": "soon"}, labels)


async def _paused_saved(hass, hass_ws_client, engine, mutate):
    """Pause, then save the program from a card holding the data it had BEFORE the pause."""
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/get"})
    stale = (await ws.receive_json())["result"]["programs"][0]
    await engine.async_pause("office", 7)
    until = _until(engine)
    prog = {k: v for k, v in stale.items() if k != "paused_until"}
    prog["revision"] = engine.store.program("office")["revision"]
    mutate(prog)
    await ws.send_json_auto_id({"type": f"{DOMAIN}/program/save", "program": prog})
    assert (await ws.receive_json())["success"]
    return until


async def test_program_save_keeps_the_pause(hass, hass_storage, freezer, hass_ws_client):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None)
    until = await _paused_saved(hass, hass_ws_client, engine, lambda p: p.update(name="Renamed", enabled=True))
    prog = engine.store.program("office")
    assert prog["name"] == "Renamed" and prog["enabled"] is False and prog["paused_until"] == until
    assert list(engine._pause_timers) == ["office"]


async def test_program_save_with_device_and_slot_edit_keeps_the_pause(hass, hass_storage, freezer, hass_ws_client):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None)

    def edit(p):
        p["entities"] = p["entities"] + [{"entity_id": OTHER, "default_label": "close", "label_overrides": {}}]
        p["profiles"][0]["days"][0] = [slot("n1", "06:00", "07:00", "t19")]

    until = await _paused_saved(hass, hass_ws_client, engine, edit)
    prog = engine.store.program("office")
    assert len(prog["entities"]) == 2 and prog["enabled"] is False and prog["paused_until"] == until


async def test_label_save_keeps_the_pause(hass, hass_storage, freezer, hass_ws_client):
    _rec, engine = await _start(hass, hass_storage, freezer, start=None)
    await engine.async_pause("office", 2)
    until = _until(engine)
    ws = await hass_ws_client(hass)
    lab = dict(engine.labels["t21"])
    lab["name"] = "Warm"
    await ws.send_json_auto_id({"type": f"{DOMAIN}/label/save", "label": lab})
    assert (await ws.receive_json())["success"]
    assert engine.store.program("office")["enabled"] is False and _until(engine) == until


async def test_device_state_change_and_rename_keep_the_pause(hass, hass_storage, freezer):
    from homeassistant.helpers import entity_registry as er
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 2)
    until = _until(engine)
    rec.calls.clear()
    hass.states.async_set(CLIMATE, "heat", {"temperature": 25})  # manual change on the thermostat
    await hass.async_block_till_done()
    await tick(hass, freezer, timedelta(hours=1))
    assert engine.store.program("office")["enabled"] is False and _until(engine) == until
    assert rec.calls == []
    registry = er.async_get(hass)
    entry = registry.async_get_or_create("climate", "test", "thermo", suggested_object_id="other_thermo")
    registry.async_update_entity(entry.entity_id, new_entity_id="climate.renamed_thermo")
    await hass.async_block_till_done()
    assert engine.store.program("office")["enabled"] is False and _until(engine) == until


async def test_yaml_import_keeps_a_stored_pause(hass, hass_storage, freezer, yaml_in_tmp):
    _rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_pause("office", 7)
    until = _until(engine)
    await _later(hass, freezer, 3)
    text = yaml_in_tmp.read_text()
    line = f"paused_until: '{until}'"
    assert line in text
    # file without the key (hand-written, still suspended): the stored resume time stays
    yaml_in_tmp.write_text("\n".join(l for l in text.split("\n") if line not in l))
    await _later(hass, freezer, 31)
    assert _issue(hass) is None
    assert engine.store.program("office")["enabled"] is False and _until(engine) == until
    # same value in the file: unchanged
    yaml_in_tmp.write_text(text)
    await _later(hass, freezer, 31)
    assert engine.store.program("office")["enabled"] is False and _until(engine) == until


async def test_cancel_leaves_a_plain_suspension_alone(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await engine.async_set_enabled("office", False)
    await engine.async_pause("office", None)
    assert engine.store.program("office")["enabled"] is False and _until(engine) is None
