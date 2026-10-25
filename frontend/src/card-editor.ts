// Visual editor of the card (Lovelace "edit card" panel).

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { t } from "./i18n";
import type { CardConfig, HomeAssistant, PlannerData } from "./types";
import { editorStyles, langOf, typeLabel } from "./editors/setpoint-editor";
import type { K } from "./editors/setpoint-editor";

const TYPES = ["climate", "cover", "light", "switch", "fan", "water_heater", "media_player", "input_boolean", "input_number", "input_select"];

@customElement("weekly-planner-card-editor")
export class WeeklyPlannerCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config: CardConfig = { type: "custom:weekly-planner-card" };
  @state() private _programs: { id: string; name: string }[] = [];
  private _loaded = false;

  setConfig(config: CardConfig): void {
    this._config = { ...config };
  }

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && !this._loaded) {
      this._loaded = true;
      this.hass
        .callWS<PlannerData>({ type: "weekly_planner/get" })
        .then((data) => (this._programs = data.programs.map((p) => ({ id: p.id, name: p.name }))))
        .catch(() => (this._loaded = false));
    }
  }

  private _emit(config: CardConfig): void {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }

  private _set(key: keyof CardConfig, value: unknown): void {
    const next = { ...this._config } as Record<string, unknown>;
    if (value === undefined || value === "" || value === null) delete next[key];
    else next[key] = value;
    this._emit(next as unknown as CardConfig);
  }

  private get _isProgram(): boolean {
    return this._config.program !== undefined;
  }

  private _setMode(program: boolean): void {
    const next = { ...this._config } as CardConfig;
    if (program) {
      delete next.filter;
      next.program = this._programs[0]?.id ?? "";
    } else {
      delete next.program;
      next.filter = { types: next.filter?.types ?? [] };
    }
    this._emit(next);
  }

  private _setFilter(patch: { types?: string[]; area?: string }): void {
    const filter = { ...(this._config.filter ?? {}), ...patch };
    if (!filter.types?.length) delete filter.types;
    if (!filter.area) delete filter.area;
    const next = { ...this._config, filter } as CardConfig;
    this._emit(next);
  }

  render() {
    const c = this._config;
    const types = c.filter?.types ?? [];
    return html`
      <div class="field"><label for="ce-title">${this._tr("ce_title")}</label>
        <input id="ce-title" type="text" .value=${c.title ?? ""} @input=${(e: Event) => this._set("title", (e.target as HTMLInputElement).value)} /></div>

      <div class="row" role="radiogroup" aria-label=${this._tr("ce_mode")}>
        <label class="check"><input type="radio" name="ce-mode" .checked=${this._isProgram} @change=${() => this._setMode(true)} /> ${this._tr("ce_one_program")}</label>
        <label class="check"><input type="radio" name="ce-mode" .checked=${!this._isProgram} @change=${() => this._setMode(false)} /> ${this._tr("ce_filtered")}</label>
      </div>

      ${this._isProgram
        ? html`<div class="field"><label for="ce-program">${this._tr("ce_program")}</label>
            <select id="ce-program" @change=${(e: Event) => this._set("program", (e.target as HTMLSelectElement).value)}>
              ${this._programs.length === 0 ? html`<option value="">${this._tr("no_program")}</option>` : nothing}
              ${!this._programs.some((p) => p.id === c.program) && c.program ? html`<option value=${c.program} selected>${c.program}</option>` : nothing}
              ${this._programs.map((p) => html`<option value=${p.id} ?selected=${p.id === c.program}>${p.name}</option>`)}
            </select></div>`
        : html`
            <div class="label">${this._tr("ce_types")}</div>
            <div class="row" role="group" aria-label=${this._tr("ce_types")}>
              ${TYPES.map((ty) => html`<label class="check" style="flex:1 1 150px"><input type="checkbox" .checked=${types.includes(ty)}
                @change=${(e: Event) => this._setFilter({ types: (e.target as HTMLInputElement).checked ? [...types, ty] : types.filter((x) => x !== ty) })} />
                ${typeLabel(this._lang, ty)}</label>`)}
            </div>
            <p class="hint">${this._tr("ce_types_hint")}</p>
            <div class="field"><label for="ce-area">${this._tr("ce_area")}</label>
              <input id="ce-area" type="text" .value=${c.filter?.area ?? ""} placeholder="bureau"
                @input=${(e: Event) => this._setFilter({ area: (e.target as HTMLInputElement).value.trim() })} /></div>`}

      <label class="check"><input type="checkbox" .checked=${Boolean(c.show_week)}
        @change=${(e: Event) => this._set("show_week", (e.target as HTMLInputElement).checked)} /> ${this._tr("ce_show_week")}</label>
      <label class="check"><input type="checkbox" .checked=${c.show_chart !== false}
        @change=${(e: Event) => this._set("show_chart", (e.target as HTMLInputElement).checked)} /> ${this._tr("ce_show_chart")}</label>
      <label class="check"><input type="checkbox" .checked=${c.show_advanced !== false}
        @change=${(e: Event) => this._set("show_advanced", (e.target as HTMLInputElement).checked ? undefined : false)} /> ${this._tr("ce_show_advanced")}</label>
    `;
  }

  static styles = [editorStyles, css`:host { display: block; padding: 4px 0; }`];
}

declare global {
  interface HTMLElementTagNameMap {
    "weekly-planner-card-editor": WeeklyPlannerCardEditor;
  }
}
