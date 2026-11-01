"""Constants for Weekly Planner."""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "weekly_planner"

STORAGE_KEY: Final = DOMAIN
STORAGE_VERSION: Final = 2
STORAGE_MINOR_VERSION: Final = 1

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
