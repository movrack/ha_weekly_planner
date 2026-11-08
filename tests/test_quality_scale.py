"""Keep quality_scale.yaml consistent (self-declared Bronze level)."""

from __future__ import annotations

import json
from pathlib import Path

import yaml

COMPONENT = Path(__file__).parent.parent / "custom_components" / "weekly_planner"

BRONZE = {
    "action-setup", "appropriate-polling", "brands", "common-modules", "config-flow",
    "config-flow-test-coverage", "dependency-transparency", "docs-actions", "docs-conditions",
    "docs-high-level-description", "docs-installation-instructions", "docs-removal-instructions",
    "docs-triggers", "entity-event-setup", "entity-unique-id", "has-entity-name", "runtime-data",
    "test-before-configure", "test-before-setup", "unique-config-entry",
}
OTHER = {
    "action-exceptions", "config-entry-unloading", "docs-configuration-parameters",
    "docs-installation-parameters", "entity-unavailable", "integration-owner",
    "log-when-unavailable", "parallel-updates", "reauthentication-flow", "test-coverage",
    "devices", "diagnostics", "discovery", "discovery-update-info", "docs-data-update",
    "docs-examples", "docs-known-limitations", "docs-supported-devices",
    "docs-supported-functions", "docs-troubleshooting", "docs-use-cases", "dynamic-devices",
    "entity-category", "entity-device-class", "entity-disabled-by-default", "entity-translations",
    "exception-translations", "icon-translations", "reconfiguration-flow", "repair-issues",
    "stale-devices", "async-dependency", "inject-websession", "strict-typing",
}
STATUSES = {"done", "todo", "exempt"}


def _rules() -> dict:
    data = yaml.safe_load((COMPONENT / "quality_scale.yaml").read_text(encoding="utf-8"))
    assert isinstance(data, dict) and isinstance(data.get("rules"), dict)
    return data["rules"]


def _status(value) -> str:
    return value if isinstance(value, str) else value.get("status")


def test_rule_names_are_known_and_complete():
    names = set(_rules())
    assert not names - BRONZE - OTHER, f"unknown rules: {names - BRONZE - OTHER}"
    assert not (BRONZE | OTHER) - names, f"missing rules: {(BRONZE | OTHER) - names}"


def test_statuses_are_valid():
    for name, value in _rules().items():
        assert _status(value) in STATUSES, name


def test_exempt_rules_have_a_reason():
    for name, value in _rules().items():
        if _status(value) == "exempt":
            assert isinstance(value, dict), name
            assert str(value.get("comment", "")).strip(), f"{name}: exempt without comment"


def test_bronze_is_complete():
    rules = _rules()
    assert [n for n in BRONZE if _status(rules[n]) == "todo"] == []


def test_manifest_has_no_quality_scale():
    manifest = json.loads((COMPONENT / "manifest.json").read_text(encoding="utf-8"))
    assert "quality_scale" not in manifest
