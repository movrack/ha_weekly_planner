"""Constants for Weekly Planner."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "weekly_planner"

STORAGE_KEY: Final = DOMAIN
STORAGE_VERSION: Final = 3
# Minor 2 (issue #54): optional ``holiday`` per profile, ``holiday_entity`` / ``holiday_invert`` in the configuration.
STORAGE_MINOR_VERSION: Final = 2

CONF_ADMIN_ONLY: Final = "admin_only"
CONF_NOTIFY_DELAY_MIN: Final = "notify_delay_min"
CONF_REAPPLY_DEFAULT: Final = "reapply_default"
CONF_DEBOUNCE_MIN: Final = "debounce_min"

DEFAULT_ADMIN_ONLY: Final = False
DEFAULT_NOTIFY_DELAY_MIN: Final = 30
DEFAULT_REAPPLY: Final = True
# Priority of a program saved without one (1 = strongest); the card offers the same value.
DEFAULT_PRIORITY: Final = 10
DEFAULT_DEBOUNCE_MIN: Final = 2

# Verify and retry (spec § 5.8): a successful call is checked once after a settle delay.
VERIFY_SETTLE_S: Final = 8  # seconds the device gets to show the requested attribute
VERIFY_TOLERANCE: Final = 0.05  # numbers closer than this are equal
VERIFY_MIN_INTERVAL_S: Final = 60  # at least this long between two re-sends of a segment
VERIFY_MAX_TRIES: Final = 10  # re-sends per segment, then the planner gives up (warning)

# Global mode (docs/adr/0001): the selector entity and the option used when no valid mode is known.
CONF_MODE_SELECTOR: Final = "mode_selector"
CONF_DEFAULT_MODE: Final = "default_mode"
MODE_SELECTOR_DOMAINS: Final = ("input_select", "select")
MODE_NAME_MAX: Final = 40

# Day off (issue #54): one optional boolean entity for the whole house says whether today is a day off.
CONF_HOLIDAY_ENTITY: Final = "holiday_entity"
CONF_HOLIDAY_INVERT: Final = "holiday_invert"  # the entity is "on" on a working day (Workday)
HOLIDAY_DOMAINS: Final = ("binary_sensor", "input_boolean", "switch", "calendar")
HOLIDAY_DEBOUNCE_S: Final = 30  # a change of the flag waits this long; a flip back inside it is ignored
HOLIDAY_SETTLE_S: Final = 120  # after local midnight, wait at most this long for the entity to speak
