"""Explicit service targets keep program ownership and service discovery generic."""

import pytest
import voluptuous as vol

from custom_components.weekly_planner.actions import call_for, resolve_action
from custom_components.weekly_planner.validation import ACTION, ProgramError, check_label

from .helpers import COVER, Recorder, act, go_to, label, local, program, setup, slot

BUTTON = "button.favorite"
ACTION_TARGET = {**act("button.press"), "target_entity_id": BUTTON}


def test_target_is_separate_from_service_data():
    call = call_for(COVER, ACTION_TARGET)
    assert call.target_entity_id == BUTTON
    assert call.service_data() == {}
    assert call_for(COVER, act("cover.close_cover")).target_entity_id == COVER
    for target in ("bad target", "button.x,button.y", [BUTTON], None):
        with pytest.raises(vol.Invalid):
            ACTION({**ACTION_TARGET, "target_entity_id": target})


async def test_target_validation_and_owner_restrictions(hass):
    hass.services.async_register("button", "press", lambda call: None)
    descriptions = {"button": {"press": {"target": {"entity": {"domain": "button"}}}}}
    check_label(label("favorite", ACTION_TARGET), hass, descriptions)
    with pytest.raises(ProgramError, match="service_not_for_entity"):
        check_label(label("favorite", {**ACTION_TARGET, "target_entity_id": COVER}), hass, descriptions)
    owner = {"entity_id": COVER, "allowed_services": ["cover.close_cover"]}
    assert resolve_action(program(entities=[owner]), COVER, "favorite", {"favorite": label("favorite", ACTION_TARGET)}) is None


@pytest.mark.parametrize("initial", ["unknown", "unavailable"])
async def test_cover_label_calls_button_and_recovers_only_on_availability(hass, hass_storage, freezer, initial):
    rec = Recorder(hass)
    calls = []

    async def press(call):
        calls.append(dict(call.data))

    hass.services.async_register("button", "press", press)
    hass.states.async_set(BUTTON, initial)
    prog = program(entities=[{"entity_id": COVER, "default_label": "close", "label_overrides": {}}],
                   slots=[slot("favorite", "08:00", "10:00", "favorite")])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9),
                         extra_labels=[label("favorite", ACTION_TARGET), label("close", act("cover.close_cover"))])
    assert engine.accepts(COVER, ACTION_TARGET)
    assert len(calls) == (1 if initial == "unknown" else 0)
    if initial == "unavailable":
        assert engine.rt(COVER)["pending"]
        hass.states.async_set(BUTTON, "unknown")
        await hass.async_block_till_done()
    assert calls == [{"entity_id": BUTTON}]
    assert not engine.rt(COVER).get("pending")
    hass.states.async_set(BUTTON, "2026-10-26T08:01:00Z")
    await hass.async_block_till_done()
    assert len(calls) == 1
    await go_to(hass, freezer, local(26, 10))
    assert rec.calls[-1] == ("cover.close_cover", {})


async def test_resolved_sources_preserve_explicit_target_in_journal(hass, hass_storage, freezer):
    Recorder(hass)
    calls = []

    async def set_position(call):
        calls.append(dict(call.data))

    hass.services.async_register("cover", "set_cover_position", set_position)
    hass.states.async_set("cover.other", "open")
    hass.states.async_set("sensor.position", "37")
    action = {**act("cover.set_cover_position"), "target_entity_id": "cover.other",
              "data_sources": {"position": {"entity_id": "sensor.position", "type": "number"}}}
    prog = program(slots=[], entities=[{"entity_id": COVER, "default_label": "position", "label_overrides": {}}])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 9), extra_labels=[label("position", action)])
    assert calls == [{"position": 37.0, "entity_id": "cover.other"}]
    sent = [entry for entry in engine.store.journal if entry.get("sent")]
    assert sent[-1]["action"] == {**act("cover.set_cover_position", position=37.0), "target_entity_id": "cover.other"}
