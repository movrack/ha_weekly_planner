"""Entity-backed service fields: validated config, call-time reads and transition-only execution."""

from __future__ import annotations

from copy import deepcopy

import pytest
import voluptuous as vol

from homeassistant.exceptions import ServiceValidationError

from custom_components.weekly_planner.actions import call_for
from custom_components.weekly_planner.validation import ACTION, check_label

from .helpers import COVER, Recorder, act, go_to, label, labels, local, program, setup, slot


def sourced(field="position", entity_id="number.favorite", kind="number", attribute=None, **fixed):
    source = {"entity_id": entity_id, "type": kind}
    if attribute is not None:
        source["attribute"] = attribute
    return {**act("cover.set_cover_position", **fixed), "data_sources": {field: source}}


def test_number_source_is_read_each_call_and_overrides_fixed_data(hass):
    action = sourced(position=30)
    original = deepcopy(action)
    hass.states.async_set("number.favorite", "51")
    assert call_for(COVER, action, hass.states.get).data == {"position": 51}
    hass.states.async_set("number.favorite", "62")
    assert call_for(COVER, action, hass.states.get).data == {"position": 62}
    assert action == original
    assert call_for(COVER, act("cover.set_cover_position", position=30)).data == {"position": 30}


def test_attribute_boolean_text_and_native_sources(hass):
    hass.states.async_set("sensor.source", "on", {"position": 51, "values": [1, "two"], "flag": True})
    assert call_for(COVER, sourced(entity_id="sensor.source", attribute="position"), hass.states.get).data == {"position": 51}
    assert call_for(COVER, sourced(entity_id="sensor.source", kind="boolean"), hass.states.get).data == {"position": True}
    assert call_for(COVER, sourced(entity_id="sensor.source", kind="native", attribute="flag"), hass.states.get).data == {"position": True}
    assert call_for(COVER, sourced(entity_id="sensor.source", kind="string"), hass.states.get).data == {"position": "on"}
    values = call_for(COVER, sourced(entity_id="sensor.source", kind="native", attribute="values"), hass.states.get).data["position"]
    assert values == [1, "two"]
    values.append("new")
    assert hass.states.get("sensor.source").attributes["values"] == [1, "two"]


@pytest.mark.parametrize("state,attribute,kind", [
    (None, None, "number"), ("unavailable", None, "number"), ("unknown", None, "number"),
    ("word", None, "number"), ("nan", None, "number"), ("inf", None, "number"),
    ("", None, "number"), ("on", "gone", "number"), ("on", "flag", "number"),
    ("on", "bad", "native"), ("perhaps", None, "boolean"), ("on", "values", "string"),
    ("unavailable", "position", "number"),
])
def test_unavailable_and_invalid_source_never_uses_fixed_fallback(hass, state, attribute, kind):
    if state is not None:
        hass.states.async_set("number.favorite", state, {"flag": True, "position": 51, "bad": [float("nan")], "values": [1]})
    with pytest.raises(ServiceValidationError):
        call_for(COVER, sourced(kind=kind, attribute=attribute, position=30), hass.states.get)


def test_source_schema_is_generic_and_target_safe():
    assert ACTION(sourced(entity_id="input_number.favorite"))["data_sources"]["position"]["entity_id"] == "input_number.favorite"
    # A disappeared source is valid configuration: availability is checked when sending, not saving.
    check_label({"id": "favorite", "name": "Favorite", "action": sourced(entity_id="sensor.missing")})
    for key in ("entity_id", "device_id", "area_id", "floor_id", "label_id", "target"):
        with pytest.raises(vol.Invalid):
            ACTION(sourced(field=key))
    for bad in (
        {"entity_id": "", "type": "number"}, {"entity_id": "bad", "type": "number"},
        {"entity_id": "sensor.source", "type": "float"}, {"entity_id": "sensor.source"},
        {"entity_id": "sensor.source", "type": "number", "attribute": ""},
        {"entity_id": "sensor.source", "type": "number", "template": "{{ 51 }}"},
    ):
        with pytest.raises(vol.Invalid):
            ACTION({**act("cover.set_cover_position"), "data_sources": {"position": bad}})


async def test_source_changes_do_not_retrigger_but_next_transition_reads_fresh_value(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("number.favorite", "51")
    action = sourced(position=30)
    prog = program(slots=[slot("first", "08:00", "10:00", "favorite"), slot("second", "11:00", "12:00", "favorite")],
                   entities=[{"entity_id": COVER, "default_label": None, "label_overrides": {}}])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 7, 0), extra_labels=[*labels(), label("favorite", action)])
    rec.calls.clear()
    await go_to(hass, freezer, local(26, 8, 0))
    assert rec.calls == [("cover.set_cover_position", {"position": 51})]
    hass.states.async_set("number.favorite", "62")
    await hass.async_block_till_done()
    assert len(rec.calls) == 1
    # Even an unrelated recompute must not compare resolved source values and resend the current segment.
    await engine.async_recompute("condition")
    await hass.async_block_till_done()
    assert len(rec.calls) == 1
    await go_to(hass, freezer, local(26, 11, 0))
    assert rec.calls[-1] == ("cover.set_cover_position", {"position": 62})
    assert engine.rt(COVER)["target"] == action  # keep dynamic metadata for later executions/retries
    # The persistent history records sent values, never a mutable live source reference.
    sent = [entry["action"] for entry in engine.store.journal if entry.get("sent")]
    assert [entry["data"]["position"] for entry in sent] == [51, 62]
    assert all("data_sources" not in entry for entry in sent)
    assert action["data"]["position"] == 30


async def test_invalid_source_uses_existing_failure_path_without_dispatch(hass, hass_storage, freezer):
    rec = Recorder(hass)
    hass.states.async_set("number.favorite", "unavailable")
    prog = program(slots=[slot("first", "08:00", "10:00", "favorite")],
                   entities=[{"entity_id": COVER, "default_label": None, "label_overrides": {}}])
    engine = await setup(hass, hass_storage, freezer, [prog], local(26, 7, 0), extra_labels=[*labels(), label("favorite", sourced(position=30))])
    rec.calls.clear()
    await go_to(hass, freezer, local(26, 8, 0))
    assert rec.calls == []
    assert "service_retry" not in engine.rt(COVER)
    assert "retry_at" not in engine.rt(COVER)


async def test_label_save_roundtrips_entity_sources(hass, hass_storage, freezer, hass_ws_client):
    Recorder(hass)
    await setup(hass, hass_storage, freezer, [program()], None)
    client = await hass_ws_client(hass)
    expected = label("favorite", sourced(entity_id="input_number.favorite"))
    await client.send_json_auto_id({"type": "weekly_planner/label/save", "label": expected})
    assert (await client.receive_json())["success"]
    await client.send_json_auto_id({"type": "weekly_planner/get"})
    saved = next(item for item in (await client.receive_json())["result"]["labels"] if item["id"] == "favorite")
    assert saved["action"]["data_sources"] == expected["action"]["data_sources"]
    assert saved["action"]["data"] == {}
