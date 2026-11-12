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
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    CONF_ADMIN_ONLY,
    CONF_DEBOUNCE_MIN,
    CONF_NOTIFY_DELAY_MIN,
    CONF_REAPPLY_DEFAULT,
    CONF_DEFAULT_MODE,
    CONF_HOLIDAY_ENTITY,
    CONF_HOLIDAY_INVERT,
    CONF_MODE_SELECTOR,
    DEFAULT_ADMIN_ONLY,
    DEFAULT_DEBOUNCE_MIN,
    DEFAULT_NOTIFY_DELAY_MIN,
    DEFAULT_REAPPLY,
    DOMAIN,
    HOLIDAY_DOMAINS,
    MODE_NAME_MAX,
    MODE_SELECTOR_DOMAINS,
)
from .messages import resync_lines
from .validation import check_holiday_config, check_mode_config, driven_entities


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
    """Global options: the settings, then the global mode (selector and default mode).

    The mode selector and the day-off entity live in the store (``store.config``), not in the entry options.
    """

    def __init__(self) -> None:
        self._settings: dict[str, Any] = {}
        self._selector: str | None = None
        self._holiday: dict[str, Any] = {}

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Menu: the settings, or the resynchronisation of the devices (administrators: the options flow is admin-only)."""
        return self.async_show_menu(step_id="init", menu_options=["settings", "resync"])

    async def async_step_resync(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """List what would be sent to the devices; nothing is sent before the confirmation (issue #52)."""
        if user_input is not None:
            result = await self._engine.async_resync()
            return self.async_abort(reason="resync_done", description_placeholders={"count": str(len(result["sent"]))})
        plan = await self._engine.async_plan_resync()
        if not any(item["send"] for item in plan):
            return self.async_abort(reason="resync_nothing")
        lines = resync_lines(self.hass, plan, self._engine.tz)
        return self.async_show_form(
            step_id="resync", data_schema=vol.Schema({}), description_placeholders={"plan": lines})

    @property
    def _engine(self) -> Any:
        return self.config_entry.runtime_data

    async def async_step_settings(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Manage the options and the mode selector."""
        errors: dict[str, str] = {}
        config = self._engine.store.config
        if user_input is not None:
            selector = user_input.pop(CONF_MODE_SELECTOR, None) or None
            holiday = user_input.pop(CONF_HOLIDAY_ENTITY, None) or None
            invert = user_input.pop(CONF_HOLIDAY_INVERT, False)
            for key in (CONF_NOTIFY_DELAY_MIN, CONF_DEBOUNCE_MIN):  # number selectors give floats (both are required)
                user_input[key] = int(user_input[key])
            try:
                check_mode_config(selector, None, self.hass)
            except vol.Invalid as err:
                errors[CONF_MODE_SELECTOR] = str(err)
            try:
                self._holiday = check_holiday_config(
                    holiday, invert, self.hass, driven_entities(self._engine.store.programs, self._engine.labels))
            except vol.Invalid as err:
                errors[CONF_HOLIDAY_ENTITY] = str(err)
            if not errors:
                self._settings = user_input
                self._selector = selector
                if selector:
                    return await self.async_step_default_mode()
                await self._save_mode(None, config.get("default_mode"))
                return self.async_create_entry(data=user_input)
        options = self.config_entry.options
        selector_key = (
            vol.Optional(CONF_MODE_SELECTOR, description={"suggested_value": config.get("mode_selector")})
        )
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
                ): NumberSelector(NumberSelectorConfig(
                    min=1, max=1440, step=1, mode=NumberSelectorMode.BOX, unit_of_measurement="min")),
                vol.Required(
                    CONF_DEBOUNCE_MIN,
                    default=options.get(CONF_DEBOUNCE_MIN, DEFAULT_DEBOUNCE_MIN),
                ): NumberSelector(NumberSelectorConfig(
                    min=0, max=60, step=1, mode=NumberSelectorMode.SLIDER, unit_of_measurement="min")),
                selector_key: EntitySelector(EntitySelectorConfig(domain=list(MODE_SELECTOR_DOMAINS))),
                vol.Optional(CONF_HOLIDAY_ENTITY, description={"suggested_value": config.get(CONF_HOLIDAY_ENTITY)}):
                    EntitySelector(EntitySelectorConfig(domain=list(HOLIDAY_DOMAINS))),
                vol.Required(CONF_HOLIDAY_INVERT, default=bool(config.get(CONF_HOLIDAY_INVERT, False))): bool,
            }
        )
        return self.async_show_form(step_id="settings", data_schema=schema, errors=errors)

    async def _save_mode(self, selector: str | None, default_mode: str | None) -> None:
        """Save the global mode and the day off now: changed options reload the entry, which reads the store again."""
        await self._engine.async_set_mode_config(selector, default_mode)
        await self._engine.async_set_holiday_config(self._holiday["holiday_entity"], self._holiday["holiday_invert"])
        await self._engine.store.async_flush_config()  # a delayed save would be lost by the reload

    def _known_options(self) -> list[str]:
        state = self.hass.states.get(self._selector or "")
        options = state.attributes.get("options") if state else None
        return [o for o in options if isinstance(o, str)] if isinstance(options, list) else []

    async def async_step_default_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Choose the default mode among the options of the selector (free text when none is known)."""
        errors: dict[str, str] = {}
        known = self._known_options()
        if user_input is not None:
            default_mode = user_input.get(CONF_DEFAULT_MODE)
            try:
                settings = check_mode_config(self._selector, default_mode, self.hass, known)
            except vol.Invalid as err:
                errors[CONF_DEFAULT_MODE] = str(err)
            else:
                await self._save_mode(settings["mode_selector"], settings["default_mode"])
                return self.async_create_entry(data=self._settings)
        current = self._engine.store.config.get("default_mode")
        field: Any
        if known:
            field = SelectSelector(SelectSelectorConfig(options=known, mode=SelectSelectorMode.DROPDOWN))
            current = current if current in known else known[0]
        else:
            field = vol.All(TextSelector(), vol.Length(min=1, max=MODE_NAME_MAX))
        key = vol.Required(CONF_DEFAULT_MODE, default=current) if current else vol.Required(CONF_DEFAULT_MODE)
        return self.async_show_form(
            step_id="default_mode", data_schema=vol.Schema({key: field}), errors=errors
        )
