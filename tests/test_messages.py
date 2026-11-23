"""Notification texts follow the Home Assistant language."""

import json
from pathlib import Path
from types import SimpleNamespace

import pytest

from custom_components.weekly_planner.messages import message

TRANSLATIONS = Path(__file__).parent.parent / "custom_components" / "weekly_planner" / "translations"


def _hass(language):
    return SimpleNamespace(config=SimpleNamespace(language=language))


@pytest.mark.parametrize(
    ("language", "expected"),
    [
        ("fr", "light.a est indisponible : son action planifiée est toujours en attente."),
        ("fr-CA", "light.a est indisponible : son action planifiée est toujours en attente."),
        ("en", "light.a is unavailable: its scheduled action is still waiting."),
        ("xx", "light.a is unavailable: its scheduled action is still waiting."),
        (None, "light.a is unavailable: its scheduled action is still waiting."),
    ],
)
def test_unavailable(language, expected):
    assert message(_hass(language), "unavailable", entity="light.a") == expected


def test_failed_placeholders():
    assert message(_hass("fr"), "failed", entity="light.a", action="light.turn_on") == (
        "light.a : light.turn_on n'a pas pu être exécuté."
    )
    assert message(_hass("en"), "failed", entity="light.a", action="light.turn_on") == (
        "light.a: light.turn_on could not be run."
    )


def test_storage_languages():
    assert "Restaurez" in message(_hass("fr"), "storage")
    assert "Restore" in message(_hass("en"), "storage")


def test_resync_texts_use_the_names_of_the_screen_not_one_shot_jargon():
    """The schedule without an end time is **At this time only** / **À cette heure seulement** everywhere."""
    for language, word in (("fr", "ponctuel"), ("en", "one-shot")):
        text = message(_hass(language), "resync_reason_too_old")
        assert word not in text
        assert ("À cette heure seulement" if language == "fr" else "At this time only") in text
        options = json.loads((TRANSLATIONS / f"{language}.json").read_text(encoding="utf-8"))
        assert word not in options["options"]["step"]["resync"]["description"]
