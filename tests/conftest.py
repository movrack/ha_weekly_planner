"""Shared fixtures."""

import pytest

from custom_components.weekly_planner import yaml_file


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Load custom integrations in every test."""
    yield


@pytest.fixture(autouse=True)
def yaml_in_tmp(monkeypatch, tmp_path_factory):
    """The YAML mirror lives in a private directory: tests never share or pollute a real file."""
    folder = tmp_path_factory.mktemp("www")
    monkeypatch.setattr(yaml_file, "yaml_path", lambda hass: folder / "weekly_planner.yml")
    return folder / "weekly_planner.yml"


@pytest.fixture(autouse=True)
def home_assistant_panel_stack(monkeypatch):
    """`panel_custom` is a dependency of the integration; the real `frontend` needs the HA web bundle, absent in tests."""
    from unittest.mock import AsyncMock

    from homeassistant.components import frontend, panel_custom

    monkeypatch.setattr(frontend, "async_setup", AsyncMock(return_value=True))
    monkeypatch.setattr(panel_custom, "async_register_panel", AsyncMock())


@pytest.fixture(autouse=True)
def built_card(monkeypatch, tmp_path_factory):
    """A stand-in for the card bundle: it is built at release time and is not in the repository."""
    from custom_components.weekly_planner import frontend

    card = tmp_path_factory.mktemp("card") / "weekly-planner-card.js"
    card.write_bytes(b"customElements.define('weekly-planner-card', class extends HTMLElement {});\n")
    monkeypatch.setattr(frontend, "CARD_FILE", card)
    return card
