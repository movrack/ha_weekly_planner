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
