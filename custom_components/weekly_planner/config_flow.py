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
from homeassistant.helpers import selector

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
from .store import new_id
from .validation import MODE

MODE_TYPES = ["climate", "cover", "light", "switch"]
MODE_KINDS = ["temperature", "preset", "off", "open", "close", "position", "on"]
KINDS_BY_TYPE = {
    "climate": ["temperature", "preset", "off"],
    "cover": ["open", "close", "position"],
    "light": ["on", "off"],
    "switch": ["on", "off"],
}
MODE_COLORS = {"climate": "#ff9800", "cover": "#8bc34a", "light": "#ffeb3b", "switch": "#4caf50"}
NEW_MODE = "__new__"


def mode_setpoint(kind: str, user_input: dict[str, Any], previous: dict | None) -> dict:
    """Setpoint of a common mode from the form (unknown kinds keep their stored value)."""
    if kind not in MODE_KINDS and previous is not None:
        return previous
    value = user_input.get("value")
    if kind == "temperature":
        return {"kind": kind, "temperature": float(value if value is not None else 19)}
    if kind == "preset":
        return {"kind": kind, "preset": str(user_input.get("preset") or "eco")}
    if kind == "position":
        return {"kind": kind, "position": int(value if value is not None else 50)}
    if kind == "on" and value:
        return {"kind": kind, "brightness": int(value)}
    return {"kind": kind}


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
    """Global options and the common modes shared by every schedule."""

    _mode_id: str | None = None

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Menu: settings or common modes."""
        return self.async_show_menu(step_id="init", menu_options=["settings", "modes"])

    async def async_step_modes(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Pick a common mode to edit, or a new one."""
        engine = self._engine()
        if engine is None:
            return self.async_abort(reason="not_loaded")
        if user_input is not None:
            self._mode_id = None if user_input["mode"] == NEW_MODE else user_input["mode"]
            return await self.async_step_mode()
        choices = [selector.SelectOptionDict(value=NEW_MODE, label="+")] + [
            selector.SelectOptionDict(value=m["id"], label=f"{m['name']} ({m['type']})")
            for m in engine.store.config["modes"]
        ]
        schema = vol.Schema({
            vol.Required("mode", default=NEW_MODE): selector.SelectSelector(
                selector.SelectSelectorConfig(options=choices, mode=selector.SelectSelectorMode.LIST)
            )
        })
        return self.async_show_form(step_id="modes", data_schema=schema)

    async def async_step_mode(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Create, change or delete one common mode."""
        engine = self._engine()
        if engine is None:
            return self.async_abort(reason="not_loaded")
        modes = engine.store.config["modes"]
        current = next((m for m in modes if m["id"] == self._mode_id), None)
        errors: dict[str, str] = {}
        if user_input is not None:
            if current is not None and user_input.get("delete"):
                if engine.mode_users(current["id"]):
                    errors["base"] = "mode_in_use"
                else:
                    engine.store.config["modes"] = [m for m in modes if m["id"] != current["id"]]
                    return await self._modes_done(engine)
            else:
                mode_type = user_input["type"]
                kind = user_input["kind"]
                if kind not in KINDS_BY_TYPE.get(mode_type, MODE_KINDS) and kind in MODE_KINDS:
                    errors["kind"] = "kind_not_for_type"
                else:
                    value = mode_setpoint(kind, user_input, current["value"] if current else None)
                    mode = {
                        "id": current["id"] if current else new_id(),
                        "type": mode_type,
                        "name": user_input["name"].strip(),
                        "color": current["color"] if current else MODE_COLORS.get(mode_type, "#9e9e9e"),
                        "value": value,
                        "exceptions": current.get("exceptions", {}) if current else {},
                    }
                    if current and current.get("icon"):
                        mode["icon"] = current["icon"]
                    try:
                        mode = MODE(mode)
                    except vol.Invalid:
                        errors["name"] = "invalid_mode"
                    else:
                        if current:
                            modes[modes.index(current)] = mode
                        else:
                            modes.append(mode)
                        return await self._modes_done(engine)
        value = (current or {}).get("value", {})
        kind_default = value.get("kind", "temperature")
        kinds = MODE_KINDS if kind_default in MODE_KINDS else [*MODE_KINDS, kind_default]
        number = value.get("temperature", value.get("position", value.get("brightness")))
        fields: dict[Any, Any] = {
            vol.Required("name", default=(current or {}).get("name", "")): str,
            vol.Required("type", default=(current or {}).get("type", "climate")): vol.In(MODE_TYPES),
            vol.Required("kind", default=kind_default): vol.In(kinds),
            vol.Optional("value", description={"suggested_value": number}): vol.Coerce(float),
            vol.Optional("preset", description={"suggested_value": value.get("preset")}): str,
        }
        if current:
            fields[vol.Optional("delete", default=False)] = bool
        return self.async_show_form(
            step_id="mode", data_schema=vol.Schema(fields), errors=errors
        )

    async def _modes_done(self, engine) -> ConfigFlowResult:
        engine.store.save_config()
        await engine.async_config_changed()
        return self.async_create_entry(data=dict(self.config_entry.options))

    def _engine(self):
        entry = self.config_entry
        return getattr(entry, "runtime_data", None)

    async def async_step_settings(
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
        return self.async_show_form(step_id="settings", data_schema=schema)
