"""Config and options flows for Weekly Planner."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import callback

from .const import (
    CONF_ADMIN_ONLY,
    CONF_DEBOUNCE_MIN,
    CONF_NOTIFY_DELAY_MIN,
    CONF_REAPPLY_DEFAULT,
    DEFAULT_ADMIN_ONLY,
    DEFAULT_DEBOUNCE_MIN,
    DEFAULT_NOTIFY_DELAY_MIN,
    DEFAULT_REAPPLY,
    DOMAIN,
)


class WeeklyPlannerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Single-instance config flow."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Create the single entry."""
        if user_input is not None:
            return self.async_create_entry(title="Weekly Planner", data={})
        return self.async_show_form(step_id="user")

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        """Return the options flow."""
        return WeeklyPlannerOptionsFlow()


class WeeklyPlannerOptionsFlow(OptionsFlow):
    """Global options applying to every program."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(data=user_input)
        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_ADMIN_ONLY,
                    default=options.get(CONF_ADMIN_ONLY, DEFAULT_ADMIN_ONLY),
                ): bool,
                vol.Required(
                    CONF_REAPPLY_DEFAULT,
                    default=options.get(CONF_REAPPLY_DEFAULT, DEFAULT_REAPPLY),
                ): bool,
                vol.Required(
                    CONF_NOTIFY_DELAY_MIN,
                    default=options.get(CONF_NOTIFY_DELAY_MIN, DEFAULT_NOTIFY_DELAY_MIN),
                ): vol.All(int, vol.Range(min=1, max=1440)),
                vol.Required(
                    CONF_DEBOUNCE_MIN,
                    default=options.get(CONF_DEBOUNCE_MIN, DEFAULT_DEBOUNCE_MIN),
                ): vol.All(int, vol.Range(min=0, max=60)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
