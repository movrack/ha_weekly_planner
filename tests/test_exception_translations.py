"""User-facing errors are translatable: key + placeholders, and the notification follows the instance language."""

from __future__ import annotations

import json
import re
from pathlib import Path
from types import SimpleNamespace

import pytest
from homeassistant.components import persistent_notification
from homeassistant.exceptions import ServiceValidationError

from custom_components.weekly_planner.actions import call_for
from custom_components.weekly_planner.const import DOMAIN
from custom_components.weekly_planner.messages import async_reason, validation_error

from .helpers import CLIMATE, local, program, setup

TRANSLATIONS = Path("custom_components/weekly_planner/translations")


def _exceptions(lang: str) -> dict:
    return json.loads((TRANSLATIONS / f"{lang}.json").read_text(encoding="utf-8"))["exceptions"]


def test_exceptions_same_keys_and_placeholders():
    en, fr = _exceptions("en"), _exceptions("fr")
    assert en.keys() == fr.keys()
    for key in en:
        assert set(re.findall(r"{(\w+)}", en[key]["message"])) == set(re.findall(r"{(\w+)}", fr[key]["message"]))


def test_every_raised_key_is_translated():
    used = set()
    for path in Path("custom_components/weekly_planner").glob("*.py"):
        used |= set(re.findall(r'validation_error\(\s*"(\w+)"', path.read_text(encoding="utf-8")))
    assert used and used <= set(_exceptions("en"))


def test_error_carries_key_and_placeholders():
    err = validation_error("pause_range", max_days="365")
    assert (err.translation_domain, err.translation_key) == (DOMAIN, "pause_range")
    assert err.translation_placeholders == {"max_days": "365"}
    with pytest.raises(ServiceValidationError) as exc:
        call_for("cover.a", {"kind": "service", "service": "cover.set", "data_sources": {"x": {"entity_id": "a.b"}}},
                 lambda _e: SimpleNamespace(state="1", attributes={}))
    assert exc.value.translation_key == "source_invalid"
    assert exc.value.translation_placeholders == {"key": "x"}


async def test_reason_follows_language(hass):
    err = validation_error("pause_range", max_days="365")
    hass.config.language = "en"
    assert await async_reason(hass, err) == "A pause lasts 1 hour to 365 days"
    hass.config.language = "fr"
    assert await async_reason(hass, err) == "Un programme se met en pause de 1 heure à 365 jours"
    hass.config.language = "fr-CA"
    assert await async_reason(hass, validation_error("unknown_program")) == "Programme inconnu"
    assert await async_reason(hass, ServiceValidationError("plain")) == "plain"
    assert await async_reason(hass, validation_error("no_such_key")) == "no_such_key"


@pytest.mark.parametrize(("language", "expected"), [("fr", "Source de valeur non valide pour"), ("en", "Invalid value source for")])
async def test_notification_reason_in_instance_language(hass, hass_storage, freezer, language, expected):
    hass.config.language = language
    hass.states.async_set(CLIMATE, "heat", {})

    async def refuse(call):
        raise validation_error("source_invalid", key="temperature")

    hass.services.async_register("climate", "set_temperature", refuse)
    await setup(hass, hass_storage, freezer, [program()], local(26, 9, 0))
    notifications = persistent_notification._async_get_or_create_notifications(hass)
    assert expected in notifications[f"{DOMAIN}_{CLIMATE}_failed"]["message"]


async def test_a_service_called_without_a_loaded_entry_raises_the_translated_error(hass):
    """`_engine` used to raise a NameError (missing import) instead of the translated validation error."""
    import pytest
    from homeassistant.exceptions import ServiceValidationError

    from custom_components.weekly_planner.services import _engine

    with pytest.raises(ServiceValidationError) as err:
        _engine(hass)
    assert err.value.translation_key == "not_loaded"
