"""Chart sources persist as display-only metadata, without scheduling side effects."""
from copy import deepcopy
from unittest.mock import AsyncMock, patch

import pytest
import voluptuous as vol

from custom_components.weekly_planner.validation import check_program
from custom_components.weekly_planner.websocket import _chart_metadata_only
from custom_components.weekly_planner.registry import rename_entity
from .helpers import Recorder, labels, program, setup


def test_chart_source_schema_and_optional_legacy():
    base = program()
    known = {x["id"]: x for x in labels()}
    assert "chart_sources" not in check_program(base, known)["entities"][0]
    base["entities"][0]["chart_sources"] = [
        {"entity_id": "sensor.humidity", "kind": "numeric"},
        {"entity_id": "binary_sensor.window", "kind": "states", "states": ["on", "unknown_saved"]},
    ]
    checked = check_program(base, known)
    assert checked["entities"][0]["chart_sources"][1]["states"] == ["on", "unknown_saved"]
    assert _chart_metadata_only(check_program(program(), known), checked)
    changed = deepcopy(checked)
    changed["name"] = "Changed"
    assert not _chart_metadata_only(check_program(program(), known), changed)
    assert not _chart_metadata_only(None, checked)
    assert not _chart_metadata_only(checked, deepcopy(checked))


@pytest.mark.parametrize("sources", [
    [{"entity_id": "bad", "kind": "numeric"}],
    [{"entity_id": "sensor.x", "kind": "other"}],
    [{"entity_id": "sensor.x", "kind": "states", "states": [1]}],
    [{"entity_id": "sensor.x", "kind": "states"}] * 2,
])
def test_invalid_chart_sources_refused(sources):
    base = program()
    base["entities"][0]["chart_sources"] = sources
    with pytest.raises(vol.Invalid):
        check_program(base, {x["id"]: x for x in labels()})


def test_chart_sources_follow_entity_rename():
    base = program()
    base["entities"][0]["chart_sources"] = [{"entity_id": "sensor.old", "kind": "numeric"}]
    assert rename_entity({"programs": [base]}, "sensor.old", "sensor.new")
    assert base["entities"][0]["chart_sources"][0]["entity_id"] == "sensor.new"


async def test_chart_metadata_save_pushes_without_recompute_or_device_calls(hass, hass_storage, freezer, hass_ws_client):
    recorder = Recorder(hass)
    engine = await setup(hass, hass_storage, freezer, [program()], None)
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "weekly_planner/get"})
    base = (await ws.receive_json())["result"]["programs"][0]
    base["entities"][0]["chart_sources"] = [{"entity_id": "sensor.missing", "kind": "numeric"}]
    observer = await hass_ws_client(hass)
    await observer.send_json_auto_id({"type": "weekly_planner/subscribe"})
    assert (await observer.receive_json())["success"]
    await observer.receive_json()  # initial snapshot
    before = len(recorder.calls)
    with patch.object(engine, "_async_config_changed", new_callable=AsyncMock) as recompute:
        await ws.send_json_auto_id({"type": "weekly_planner/program/save", "program": base})
        response = await ws.receive_json()
        assert response["success"]
        assert response["result"]["program"]["entities"][0]["chart_sources"][0]["entity_id"] == "sensor.missing"
        recompute.assert_not_called()
    pushed = (await observer.receive_json())["event"]["programs"][0]
    assert pushed["revision"] == base["revision"] + 1
    assert pushed["entities"][0]["chart_sources"][0]["entity_id"] == "sensor.missing"
    assert len(recorder.calls) == before
