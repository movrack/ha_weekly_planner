"""Verify and retry (spec § 5.8): a call the device ignored is sent again when it changes, never forced over a manual change."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.core import ServiceCall

from custom_components.weekly_planner.const import (
    VERIFY_MAX_TRIES,
    VERIFY_MIN_INTERVAL_S,
    VERIFY_SETTLE_S,
)

from .helpers import CLIMATE, Recorder, act, go_to, label, labels, local, program, setup, slot, tick

SETTLE = timedelta(seconds=VERIFY_SETTLE_S + 1)
GAP = timedelta(seconds=VERIFY_MIN_INTERVAL_S + 1)


def _labels() -> list[dict]:
    return labels() + [label("comfort", act("climate.set_preset_mode", preset_mode="comfort")),
                       label("t19f", act("climate.set_temperature", temperature=19.0))]


class Virtual(Recorder):
    """A climate that ignores the calls until ``ready`` (like a virtual thermostat whose radiator is gone)."""

    def __init__(self, hass, ready: bool = False) -> None:
        super().__init__(hass)
        self.ready = ready
        hass.states.async_set(CLIMATE, "heat", {"preset_mode": "eco", "temperature": 18, "is_ready": ready})

    async def _handle(self, call: ServiceCall) -> None:
        await super()._handle(call)
        if self.ready:
            attrs = dict(self.hass.states.get(CLIMATE).attributes)
            attrs.update({k: v for k, v in call.data.items() if k != "entity_id"})
            self.hass.states.async_set(CLIMATE, "heat", attrs)


def _prog(label_id: str = "comfort", **kwargs) -> dict:
    return program(slots=[slot("s1", "08:00", "12:00", label_id)], default=None, **kwargs)


def _attrs(hass, **changes) -> dict:
    return {**hass.states.get(CLIMATE).attributes, **changes}


async def _start(hass, hass_storage, freezer, prog=None, label_id="comfort", **kwargs):
    rec = Virtual(hass)
    engine = await setup(hass, hass_storage, freezer, [prog or _prog(label_id)], local(26, 7, 0),
                         extra_labels=_labels(), **kwargs)
    await go_to(hass, freezer, local(26, 8, 45))
    return rec, engine


async def test_incident_ignored_call_is_resent_once_the_device_reacts(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    assert rec.calls[-1] == ("climate.set_preset_mode", {"preset_mode": "comfort"})
    sent = len(rec.calls)
    assert engine.rt(CLIMATE).get("verify")
    await tick(hass, freezer, SETTLE)
    assert engine.rt(CLIMATE)["verification"] == "pending"
    assert engine.rt(CLIMATE)["verify"]["seen"] == {"preset_mode": "eco"}
    assert engine.program_status("office")["verification"] == {CLIMATE: "pending"}
    assert len(rec.calls) == sent  # no loop: nothing re-sent until the entity changes
    # only other attributes change (is_ready false -> true): comfort is sent again, once
    rec.ready = True
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, is_ready=True))
    await hass.async_block_till_done()
    assert len(rec.calls) == sent + 1
    assert rec.calls[-1] == ("climate.set_preset_mode", {"preset_mode": "comfort"})
    await tick(hass, freezer, SETTLE)
    assert hass.states.get(CLIMATE).attributes["preset_mode"] == "comfort"
    assert "verify" not in engine.rt(CLIMATE)
    assert engine.rt(CLIMATE)["verification"] == "ok"
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, messages="x"))
    await tick(hass, freezer, GAP)
    assert len(rec.calls) == sent + 1  # cleared: no more sends


async def test_manual_change_while_pending_is_respected(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await tick(hass, freezer, SETTLE)
    sent = len(rec.calls)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, preset_mode="away"))
    await tick(hass, freezer, GAP)
    assert len(rec.calls) == sent
    assert "verify" not in engine.rt(CLIMATE)
    assert engine.rt(CLIMATE)["verification"] == "manual"
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, is_ready=True))
    await tick(hass, freezer, GAP)
    assert len(rec.calls) == sent


async def test_manual_change_before_the_check(hass, hass_storage, freezer):
    _rec, engine = await _start(hass, hass_storage, freezer)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, preset_mode="away"))
    await tick(hass, freezer, SETTLE)
    assert engine.rt(CLIMATE)["verification"] == "manual"
    assert "verify" not in engine.rt(CLIMATE)


async def test_rate_limit_and_max_tries(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await tick(hass, freezer, SETTLE)
    sent = len(rec.calls)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, n=1))
    await hass.async_block_till_done()
    assert len(rec.calls) == sent + 1
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, n=2))  # too soon
    await tick(hass, freezer, SETTLE)
    assert len(rec.calls) == sent + 1
    for n in range(3, 40):
        await tick(hass, freezer, GAP)
        hass.states.async_set(CLIMATE, "heat", _attrs(hass, n=n))
        await tick(hass, freezer, SETTLE)
    assert len(rec.calls) == sent + VERIFY_MAX_TRIES
    assert engine.rt(CLIMATE)["verify"]["tries"] == VERIFY_MAX_TRIES
    from custom_components.weekly_planner.checks import program_warnings
    codes = [w["code"] for w in program_warnings(hass, engine.store.programs, engine.store.programs[0], engine)]
    assert "action_not_applied" in codes


async def test_numeric_tolerance(hass, hass_storage, freezer):
    Virtual(hass, ready=True)
    engine = await setup(hass, hass_storage, freezer, [_prog("t19")], local(26, 7, 0), extra_labels=_labels())
    await go_to(hass, freezer, local(26, 8, 45))
    assert hass.states.get(CLIMATE).attributes["temperature"] == 19
    await tick(hass, freezer, SETTLE)
    assert "verify" not in engine.rt(CLIMATE) and "verification" not in engine.rt(CLIMATE)
    # 19.04 counts as 19, 19.2 does not
    from custom_components.weekly_planner.engine import same_value
    assert same_value(19, 19.0) and same_value(19, 19.04) and not same_value(19, 19.2)
    assert same_value("comfort", "comfort") and not same_value("comfort", "eco")
    assert same_value(19, "19.0") and not same_value(19, "abc")


async def test_action_without_checked_key_is_never_verified(hass, hass_storage, freezer):
    rec = Virtual(hass)
    engine = await setup(hass, hass_storage, freezer, [_prog("close")], local(26, 7, 0), extra_labels=_labels())
    await go_to(hass, freezer, local(26, 8, 45))
    sent = len(rec.calls)
    assert sent and "verify" not in engine.rt(CLIMATE)
    await tick(hass, freezer, SETTLE)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, n=1))
    await tick(hass, freezer, GAP)
    assert len(rec.calls) == sent
    assert "verification" not in engine.rt(CLIMATE)


async def test_segment_end_clears_pending(hass, hass_storage, freezer):
    rec, engine = await _start(hass, hass_storage, freezer)
    await tick(hass, freezer, SETTLE)
    assert engine.rt(CLIMATE)["verification"] == "pending"
    await go_to(hass, freezer, local(26, 12, 1))
    assert "verify" not in engine.rt(CLIMATE) and "verification" not in engine.rt(CLIMATE)
    sent = len(rec.calls)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, is_ready=True))
    await tick(hass, freezer, GAP)
    assert len(rec.calls) == sent


async def test_reapply_false_only_retries_a_send_that_happened(hass, hass_storage, freezer):
    # started inside the slot with reapply off: the planner sends nothing, so it never retries
    rec = Virtual(hass)
    engine = await setup(hass, hass_storage, freezer, [_prog(reapply=False)], local(26, 9, 0), extra_labels=_labels())
    assert rec.calls == []
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, is_ready=True))
    await tick(hass, freezer, GAP)
    assert rec.calls == [] and "verify" not in engine.rt(CLIMATE)
    # a send made at the slot edge is retried even though reapply is off
    engine = None
    rec2 = await _edge_case(hass, hass_storage, freezer)
    assert len(rec2.calls) == 2


async def _edge_case(hass, hass_storage, freezer):
    hass_storage.clear()
    entry = hass.config_entries.async_entries("weekly_planner")[0]
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    rec = Virtual(hass)
    await setup(hass, hass_storage, freezer, [_prog(reapply=False)], local(27, 7, 0), extra_labels=_labels())
    await go_to(hass, freezer, local(27, 8, 0))
    assert len(rec.calls) == 1
    await tick(hass, freezer, SETTLE)
    hass.states.async_set(CLIMATE, "heat", _attrs(hass, is_ready=True))
    await hass.async_block_till_done()
    return rec
