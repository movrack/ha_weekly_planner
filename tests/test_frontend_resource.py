"""Lovelace resource of the bundled card: creation, version update, removal (S33)."""

from __future__ import annotations

from hashlib import sha256
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

from pytest_homeassistant_custom_component.common import MockConfigEntry

from homeassistant.components.lovelace.const import LOVELACE_DATA, MODE_STORAGE, MODE_YAML

from custom_components.weekly_planner import async_remove_entry
from custom_components.weekly_planner import frontend
from custom_components.weekly_planner.const import DOMAIN


class FakeResources:
    """Minimal stand-in for the Lovelace resource collection."""

    def __init__(self, items=None):
        self.items = list(items or [])
        self.loaded = 0

    async def async_get_info(self):
        self.loaded += 1

    def async_items(self):
        return list(self.items)

    async def async_create_item(self, data):
        item = {"id": f"id{len(self.items)}", "type": data["res_type"], "url": data["url"]}
        self.items.append(item)
        return item

    async def async_update_item(self, item_id, data):
        for item in self.items:
            if item["id"] == item_id:
                item["url"] = data["url"]

    async def async_delete_item(self, item_id):
        self.items = [i for i in self.items if i["id"] != item_id]


def _prepare(hass, tmp_path, monkeypatch, content=b"v1", mode=MODE_STORAGE, items=None):
    card = tmp_path / "weekly-planner-card.js"
    card.write_bytes(content)
    monkeypatch.setattr(frontend, "CARD_FILE", card)
    hass.http = MagicMock(async_register_static_paths=AsyncMock())
    hass.config.components.add("lovelace")
    resources = FakeResources(items)
    hass.data[LOVELACE_DATA] = SimpleNamespace(resource_mode=mode, resources=resources)
    return card, resources


def _url(content: bytes) -> str:
    return f"{frontend.CARD_URL}?v={sha256(content).hexdigest()[:12]}"


async def test_resource_created_with_version(hass, tmp_path, monkeypatch):  # S33
    _, resources = _prepare(hass, tmp_path, monkeypatch)
    await frontend.async_register_card(hass)
    assert [i["url"] for i in resources.items] == [_url(b"v1")]
    assert resources.items[0]["type"] == "module"
    assert hass.data[frontend.CARD_VERSION_KEY] == sha256(b"v1").hexdigest()[:12]
    hass.http.async_register_static_paths.assert_awaited_once()


async def test_resource_not_duplicated_when_unchanged(hass, tmp_path, monkeypatch):  # S33
    _, resources = _prepare(hass, tmp_path, monkeypatch)
    await frontend.async_register_card(hass)
    await frontend.async_register_card(hass)
    assert len(resources.items) == 1
    hass.http.async_register_static_paths.assert_awaited_once()  # static path once per process


async def test_resource_updated_when_bundle_changes(hass, tmp_path, monkeypatch):  # S33
    card, resources = _prepare(hass, tmp_path, monkeypatch)
    await frontend.async_register_card(hass)
    first_id = resources.items[0]["id"]
    card.write_bytes(b"v2")
    await frontend.async_register_card(hass)
    assert len(resources.items) == 1
    assert resources.items[0]["id"] == first_id
    assert resources.items[0]["url"] == _url(b"v2")


async def test_unregister_removes_only_our_resource(hass, tmp_path, monkeypatch):  # S33
    other = {"id": "other", "type": "module", "url": "/hacsfiles/other-card.js"}
    _, resources = _prepare(hass, tmp_path, monkeypatch, items=[other])
    await frontend.async_register_card(hass)
    assert len(resources.items) == 2
    await frontend.async_unregister_card(hass)
    assert resources.items == [other]


async def test_remove_entry_unregisters_card(hass, tmp_path, monkeypatch, hass_storage):  # S33
    _, resources = _prepare(hass, tmp_path, monkeypatch)
    await frontend.async_register_card(hass)
    assert resources.items
    await async_remove_entry(hass, MockConfigEntry(domain=DOMAIN))
    assert resources.items == []


async def test_yaml_mode_leaves_resources_untouched(hass, tmp_path, monkeypatch):  # S33
    _, resources = _prepare(hass, tmp_path, monkeypatch, mode=MODE_YAML)
    hass.data["frontend_extra_module_url"] = set()
    await frontend.async_register_card(hass)
    await frontend.async_unregister_card(hass)
    assert resources.items == [] and resources.loaded == 0
    assert hass.data["frontend_extra_module_url"] == {_url(b"v1")}
