// Reusable editing pieces: styles, entity picker, conditions editor and the setpoint editor.
// A setpoint is {kind, ...} (spec § 6); the kinds offered depend on the entity domain.

import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { strings, t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import type { Condition, HassEntity, HomeAssistant, Setpoint } from "../types";

export type K = Parameters<typeof t>[1];

export const langOf = (hass?: HomeAssistant): string => hass?.locale?.language ?? hass?.language ?? "en";

/** Type of mode used for an entity domain (modes are grouped by type). */
export const modeTypeOf = (domain: string): string => (domain === "input_boolean" ? "switch" : domain);

/** Display name of a mode type (falls back to the raw type). */
export function typeLabel(lang: string, type: string): string {
  const text = (strings(lang) as Record<string, unknown>)[`type_${type}`];
  return typeof text === "string" ? text : type;
}

export const SUPPORTED_DOMAINS = [
  "climate", "cover", "light", "switch", "input_boolean", "fan", "water_heater",
  "media_player", "input_number", "input_select",
];

export const editorStyles = css`
  :host { display: block; color: var(--primary-text-color); font-size: 14px; }
  * { box-sizing: border-box; }
  .field { display: flex; flex-direction: column; gap: 4px; margin: 8px 0; min-width: 0; }
  .field > label, .label { font-size: 12px; color: var(--secondary-text-color); }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .row > .field { flex: 1 1 140px; }
  input[type="text"], input[type="number"], input[type="time"], input[type="date"], input:not([type]),
  select, textarea {
    width: 100%; min-height: 48px; padding: 8px 10px; font: inherit; color: var(--primary-text-color);
    background: var(--card-background-color, #fff); border: 1px solid var(--divider-color);
    border-radius: 8px;
  }
  textarea { min-height: 72px; font-family: monospace; }
  input[type="color"] { width: 56px; height: 48px; padding: 2px; border: 1px solid var(--divider-color);
    border-radius: 8px; background: none; }
  input[type="checkbox"], input[type="radio"] { width: 20px; height: 20px; margin: 0; accent-color: var(--primary-color); }
  label.check { display: flex; align-items: center; gap: 10px; min-height: 48px; cursor: pointer; }
  button { font: inherit; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 4px; --mdc-icon-size: 20px;
    min-height: 48px; padding: 0 16px; border-radius: 24px; border: 1px solid var(--divider-color);
    background: none; color: var(--primary-text-color); cursor: pointer;
  }
  .btn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .btn.primary { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
  .btn.danger { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
  .btn:disabled { opacity: 0.45; cursor: default; }
  .ibtn {
    min-width: 48px; min-height: 48px; border-radius: 24px; border: none; background: none; --mdc-icon-size: 20px;
    color: inherit; cursor: pointer; font-size: 16px; display: inline-flex; align-items: center; justify-content: center;
  }
  .ibtn:hover:not(:disabled) { background: var(--secondary-background-color); }
  .ibtn:disabled { opacity: 0.35; cursor: default; }
  :is(button, input, select, textarea, [tabindex]):focus-visible {
    outline: 2px solid var(--primary-color); outline-offset: 2px;
  }
  .error { color: var(--error-color, #db4437); margin: 8px 0; }
  .hint { display: flex; align-items: center; gap: 4px; --mdc-icon-size: 16px; color: var(--secondary-text-color); font-size: 12px; margin: 4px 0; }
  .card {
    border: 1px solid var(--divider-color); border-radius: 12px; padding: 8px 12px; margin: 8px 0;
  }
  .dot { display: inline-block; width: 12px; height: 12px; border-radius: 6px; flex: none; }
  .muted { color: var(--secondary-text-color); }
  .grow { flex: 1; min-width: 0; }
`;

function fire(el: HTMLElement, name: string, detail?: unknown): void {
  el.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
}

/* ------------------------------------------------------------------ describe */

export function describeSetpoint(lang: string, sp?: Setpoint | null): string {
  if (!sp) return "";
  const x = sp as Record<string, any>;
  const label = (k: string) => t(lang, `sp_${k}` as K);
  switch (sp.kind) {
    case "preset": return `${x.preset}${x.hvac_mode ? ` · ${x.hvac_mode}` : ""}`;
    case "temperature": return `${x.temperature} °C${x.hvac_mode ? ` · ${x.hvac_mode}` : ""}`;
    case "hvac_mode": return `${label("hvac_mode")} ${x.hvac_mode}`;
    case "position": return `${label("position")} ${x.position} %`;
    case "tilt": return `${label("tilt")} ${x.tilt} %`;
    case "on": {
      const extra = [x.brightness !== undefined ? `${x.brightness} %` : "", x.percentage !== undefined ? `${x.percentage} %` : "",
        x.effect ?? ""].filter(Boolean).join(" · ");
      return extra ? `${label("on")} · ${extra}` : label("on");
    }
    case "volume": return `${label("volume")} ${x.volume} %`;
    case "source": return `${x.source}`;
    case "value": return `${x.value}`;
    case "option": return `${x.option}`;
    case "water_heater": return [x.operation_mode, x.temperature !== undefined && x.temperature !== null ? `${x.temperature} °C` : ""].filter(Boolean).join(" · ");
    case "scene": return `${label("scene")} ${x.scene ?? ""}`;
    case "script": return `${label("script")} ${x.script ?? ""}`;
    case "action": return `${x.action ?? ""}`;
    default: return label(sp.kind);
  }
}

/* ------------------------------------------------------------------ entity picker */

@customElement("wp-entity-picker")
export class WpEntityPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() value = "";
  @property() label = "";
  @property({ attribute: false }) domains: string[] = [];
  @property({ attribute: false }) exclude: string[] = [];
  @property({ attribute: false }) filter?: (entityId: string) => boolean;
  private _listId = `wp-list-${Math.random().toString(16).slice(2, 8)}`;

  private _ids(): string[] {
    return Object.keys(this.hass?.states ?? {})
      .filter((id) => !this.domains.length || this.domains.includes(entityDomain(id)))
      .filter((id) => !this.exclude.includes(id))
      .filter((id) => !this.filter || this.filter(id))
      .sort();
  }

  private _emit(value: string): void {
    fire(this, "wp-change", value);
  }

  render() {
    if (customElements.get("ha-entity-picker")) {
      const filter = this.filter;
      return html`<ha-entity-picker
        .hass=${this.hass} .value=${this.value} .label=${this.label}
        .includeDomains=${this.domains.length ? this.domains : undefined}
        .excludeEntities=${this.exclude}
        .entityFilter=${filter ? (e: HassEntity) => filter(e.entity_id) : undefined}
        @value-changed=${(ev: CustomEvent) => {
          ev.stopPropagation();
          this._emit(ev.detail.value ?? "");
        }}></ha-entity-picker>`;
    }
    const ids = this._ids().slice(0, 600);
    return html`
      <div class="field">
        ${this.label ? html`<label>${this.label}</label>` : nothing}
        <input type="text" list=${this._listId} .value=${this.value} autocomplete="off"
          aria-label=${this.label || "entity"} placeholder="domain.entity"
          @change=${(ev: Event) => {
            const v = (ev.target as HTMLInputElement).value.trim();
            if (v === "" || this.hass.states[v]) this._emit(v);
          }}
          @input=${(ev: Event) => {
            const v = (ev.target as HTMLInputElement).value.trim();
            if (this.hass.states[v] && v !== this.value) this._emit(v);
          }} />
        <datalist id=${this._listId}>
          ${ids.map((id) => html`<option value=${id}>${friendlyName(this.hass, id)}</option>`)}
        </datalist>
      </div>`;
  }

  static styles = [editorStyles, css`:host { display: block; min-width: 0; } ha-entity-picker { display: block; }`];
}

/* ------------------------------------------------------------------ conditions */

@customElement("wp-conditions-editor")
export class WpConditionsEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) conditions: Condition[] = [];

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K) { return t(this._lang, key); }

  private _set(list: Condition[]): void {
    fire(this, "wp-change", list);
  }

  private _patch(index: number, patch: Partial<Condition>): void {
    this._set(this.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  private _parse(raw: string, hasAttribute: boolean): Condition["value"] {
    const text = raw.trim();
    if (text !== "" && !Number.isNaN(Number(text))) return Number(text);
    if (hasAttribute && text === "true") return true;
    if (hasAttribute && text === "false") return false;
    return raw;
  }

  render() {
    return html`
      ${this.conditions.map(
        (c, i) => html`
          <div class="card">
            <wp-entity-picker .hass=${this.hass} .value=${c.entity_id} .label=${this._tr("entity")}
              @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch(i, { entity_id: e.detail }); }}></wp-entity-picker>
            <div class="row">
              <div class="field">
                <label>${this._tr("cond_attribute")}</label>
                <input type="text" .value=${c.attribute ?? ""} placeholder="—"
                  @change=${(e: Event) => this._patch(i, { attribute: (e.target as HTMLInputElement).value.trim() || null })} />
              </div>
              <div class="field" style="flex:0 1 110px">
                <label>${this._tr("cond_op")}</label>
                <select aria-label=${this._tr("cond_op")}
                  @change=${(e: Event) => this._patch(i, { op: (e.target as HTMLSelectElement).value as Condition["op"] })}>
                  ${(["eq", "ne", "lt", "gt"] as const).map(
                    (op) => html`<option value=${op} ?selected=${(c.op ?? "eq") === op}>${{ eq: "=", ne: "≠", lt: "<", gt: ">" }[op]}</option>`,
                  )}
                </select>
              </div>
              <div class="field">
                <label>${this._tr("cond_value")}</label>
                <input type="text" .value=${String(c.value ?? "")}
                  @change=${(e: Event) => this._patch(i, { value: this._parse((e.target as HTMLInputElement).value, Boolean(c.attribute)) })} />
              </div>
              <button class="ibtn" aria-label=${this._tr("delete")}
                @click=${() => this._set(this.conditions.filter((_, j) => j !== i))}><ha-icon icon="mdi:delete"></ha-icon></button>
            </div>
          </div>`,
      )}
      <button class="btn" @click=${() => this._set([...this.conditions, { entity_id: "", op: "eq", value: "on" }])}>
        + ${this._tr("cond_add")}
      </button>
    `;
  }

  static styles = editorStyles;
}

/* ------------------------------------------------------------------ setpoint editor */

const KINDS: Record<string, string[]> = {
  climate: ["preset", "temperature", "hvac_mode", "off"],
  cover: ["open", "close", "position", "tilt"],
  light: ["on", "off", "auto"],
  switch: ["on", "off"],
  input_boolean: ["on", "off"],
  fan: ["on", "off"],
  water_heater: ["water_heater"],
  media_player: ["on", "off", "volume", "source"],
  input_number: ["value"],
  input_select: ["option"],
};
const ONE_SHOT = ["scene", "script", "action"];

export function defaultSetpoint(hass: HomeAssistant | undefined, entityId: string): Setpoint {
  const kinds = KINDS[entityDomain(entityId)];
  return kindDefaults(hass, entityId, kinds ? kinds[0] : "action");
}

function kindDefaults(hass: HomeAssistant | undefined, entityId: string, kind: string): Setpoint {
  const attrs = hass?.states[entityId]?.attributes ?? {};
  switch (kind) {
    case "preset": return { kind, preset: (attrs.preset_modes as string[] | undefined)?.[0] ?? "" };
    case "temperature": return { kind, temperature: Number(attrs.temperature ?? attrs.min_temp ?? 20) };
    case "hvac_mode": return { kind, hvac_mode: (attrs.hvac_modes as string[] | undefined)?.find((m) => m !== "off") ?? "heat" };
    case "position": return { kind, position: 50 };
    case "tilt": return { kind, tilt: 50 };
    case "volume": return { kind, volume: 30 };
    case "source": return { kind, source: (attrs.source_list as string[] | undefined)?.[0] ?? "" };
    case "value": return { kind, value: Number(attrs.min ?? 0) };
    case "option": return { kind, option: (attrs.options as string[] | undefined)?.[0] ?? "" };
    case "water_heater":
      return { kind, operation_mode: (attrs.operation_list as string[] | undefined)?.[0] ?? "", temperature: Number(attrs.temperature ?? 50) };
    case "scene": return { kind, scene: "" };
    case "script": return { kind, script: "" };
    case "action": return { kind, action: "", data: {} };
    default: return { kind };
  }
}

@customElement("wp-setpoint-editor")
export class WpSetpointEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  /** Entity whose domain and attributes drive the available choices. */
  @property({ attribute: "entity-id" }) entityId = "";
  @property({ attribute: false }) value: Setpoint | null = null;
  /** Scene, script and action setpoints are offered to administrators only. */
  @property({ type: Boolean }) admin = false;
  /** Only state setpoints (modes, overrides): no scene, script or action. */
  @property({ type: Boolean, attribute: "state-only" }) stateOnly = false;
  @state() private _json = "";
  @state() private _jsonError = false;
  private _jsonFor = "";

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }
  private get _domain() { return entityDomain(this.entityId); }
  private get _attrs(): Record<string, any> { return this.hass?.states[this.entityId]?.attributes ?? {}; }

  private _kinds(): string[] {
    const base = KINDS[this._domain] ?? [];
    const extra = !this.stateOnly && this.admin ? ONE_SHOT : [];
    const current = this.value?.kind;
    const list = [...base, ...extra];
    if (current && !list.includes(current)) list.push(current);
    return list;
  }

  private _current(): Setpoint {
    return this.value ?? kindDefaults(this.hass, this.entityId, this._kinds()[0] ?? "action");
  }

  private _emit(sp: Setpoint): void {
    const clean: Setpoint = { kind: sp.kind };
    for (const [k, v] of Object.entries(sp)) {
      if (k !== "kind" && v !== undefined && v !== "" && !(typeof v === "number" && Number.isNaN(v))) clean[k] = v;
    }
    // Required fields must survive even when empty.
    if (sp.kind === "scene") clean.scene = sp.scene ?? "";
    if (sp.kind === "script") clean.script = sp.script ?? "";
    if (sp.kind === "action") { clean.action = sp.action ?? ""; clean.data = sp.data ?? {}; }
    if (sp.kind === "preset") clean.preset = sp.preset ?? "";
    fire(this, "wp-change", clean);
  }

  private _patch(patch: Record<string, unknown>): void {
    this._emit({ ...this._current(), ...patch } as Setpoint);
  }

  private _number(label: K, key: string, min: number, max: number, step = 1, unit = "") {
    const sp = this._current() as Record<string, any>;
    return html`
      <div class="field">
        <label>${this._tr(label)}${unit ? ` (${unit})` : ""}</label>
        <input type="number" min=${min} max=${max} step=${step} .value=${sp[key] === undefined ? "" : String(sp[key])}
          @change=${(e: Event) => {
            const raw = (e.target as HTMLInputElement).value;
            this._patch({ [key]: raw === "" ? undefined : Math.min(max, Math.max(min, Number(raw))) });
          }} />
      </div>`;
  }

  private _choice(label: K, key: string, options: string[] | undefined, optional = false, free = false) {
    const sp = this._current() as Record<string, any>;
    const current = (sp[key] as string | undefined) ?? "";
    if (!options?.length && !optional && free) {
      return html`<div class="field"><label>${this._tr(label)}</label>
        <input type="text" .value=${current} @change=${(e: Event) => this._patch({ [key]: (e.target as HTMLInputElement).value })} /></div>`;
    }
    const list = options ?? [];
    return html`
      <div class="field">
        <label>${this._tr(label)}</label>
        <select @change=${(e: Event) => this._patch({ [key]: (e.target as HTMLSelectElement).value || undefined })}>
          ${optional ? html`<option value="" ?selected=${current === ""}>—</option>` : nothing}
          ${!list.includes(current) && current ? html`<option value=${current} selected>${current}</option>` : nothing}
          ${list.map((o) => html`<option value=${o} ?selected=${o === current}>${o}</option>`)}
        </select>
      </div>`;
  }

  private _fields(sp: Record<string, any>): TemplateResult | typeof nothing {
    const a = this._attrs;
    switch (sp.kind) {
      case "preset":
        return html`${this._choice("f_preset", "preset", a.preset_modes, false, true)}${this._choice("f_hvac_mode", "hvac_mode", a.hvac_modes, true)}`;
      case "temperature":
        return html`${this._number("f_temperature", "temperature", a.min_temp ?? 5, a.max_temp ?? 35, a.target_temp_step ?? 0.5, "°C")}${this._choice("f_hvac_mode", "hvac_mode", a.hvac_modes, true)}`;
      case "hvac_mode":
        return this._choice("f_hvac_mode", "hvac_mode", a.hvac_modes, false, true);
      case "position": return this._number("f_position", "position", 0, 100, 1, "%");
      case "tilt": return this._number("f_tilt", "tilt", 0, 100, 1, "%");
      case "volume": return this._number("f_volume", "volume", 0, 100, 1, "%");
      case "source": return this._choice("f_source", "source", a.source_list, false, true);
      case "value": return this._number("f_value", "value", a.min ?? -1e6, a.max ?? 1e6, a.step ?? 1);
      case "option": return this._choice("f_option", "option", a.options, false, true);
      case "on":
        if (this._domain === "light") {
          return html`${this._number("f_brightness", "brightness", 1, 100, 1, "%")}${this._choice("f_effect", "effect", a.effect_list, true)}`;
        }
        if (this._domain === "fan") return this._number("f_percentage", "percentage", 1, 100, 1, "%");
        return nothing;
      case "auto":
        return html`
          <div class="field"><label>${this._tr("f_adaptive_switch")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${sp.adaptive_switch ?? ""} .domains=${["switch"]}
              .filter=${(id: string) => id.startsWith("switch.adaptive_lighting")}
              @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ adaptive_switch: e.detail || undefined }); }}></wp-entity-picker>
            ${sp.adaptive_switch ? html`<span class="hint">${this._tr("f_adaptive_warning")}</span>` : nothing}</div>
          <div class="field"><label>${this._tr("f_script")}</label>
            <wp-entity-picker .hass=${this.hass} .value=${sp.script ?? ""} .domains=${["script"]}
              @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ script: e.detail || undefined }); }}></wp-entity-picker></div>`;
      case "water_heater":
        return html`${this._choice("f_operation_mode", "operation_mode", a.operation_list, true)}${this._number("f_temperature", "temperature", a.min_temp ?? 20, a.max_temp ?? 90, 1, "°C")}`;
      case "scene":
        return html`<div class="field"><label>${this._tr("f_scene")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${sp.scene ?? ""} .domains=${["scene"]}
            @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ scene: e.detail }); }}></wp-entity-picker></div>`;
      case "script":
        return html`<div class="field"><label>${this._tr("f_script")}</label>
          <wp-entity-picker .hass=${this.hass} .value=${sp.script ?? ""} .domains=${["script"]}
            @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ script: e.detail }); }}></wp-entity-picker></div>`;
      case "action":
        return this._actionFields(sp);
      default: return nothing;
    }
  }

  private _actionFields(sp: Record<string, any>) {
    const text = JSON.stringify(sp.data ?? {}, null, 2);
    if (this._jsonFor !== this.entityId + text && !this._jsonError) {
      this._json = text;
      this._jsonFor = this.entityId + text;
    }
    return html`
      <div class="field"><label>${this._tr("f_action")}</label>
        <input type="text" .value=${sp.action ?? ""} placeholder="light.turn_on"
          @change=${(e: Event) => this._patch({ action: (e.target as HTMLInputElement).value.trim() })} /></div>
      <div class="field"><label>${this._tr("f_data")}</label>
        <textarea .value=${this._json} spellcheck="false"
          @input=${(e: Event) => {
            const raw = (e.target as HTMLTextAreaElement).value;
            this._json = raw;
            try {
              const parsed = raw.trim() ? JSON.parse(raw) : {};
              if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("object");
              this._jsonError = false;
              this._jsonFor = this.entityId + JSON.stringify(parsed, null, 2);
              this._patch({ data: parsed });
            } catch {
              this._jsonError = true;
            }
          }}></textarea>
        ${this._jsonError ? html`<span class="error">${this._tr("f_json_invalid")}</span>` : nothing}</div>
      <label class="check"><input type="checkbox" .checked=${sp.target_self !== false}
        @change=${(e: Event) => this._patch({ target_self: (e.target as HTMLInputElement).checked ? undefined : false })} />
        ${this._tr("f_target_self")}</label>`;
  }

  render() {
    const kinds = this._kinds();
    const sp = this._current() as Record<string, any>;
    return html`
      <div class="field">
        <label>${this._tr("setpoint")}</label>
        <select aria-label=${this._tr("setpoint")}
          @change=${(e: Event) => this._emit(kindDefaults(this.hass, this.entityId, (e.target as HTMLSelectElement).value))}>
          ${kinds.map((k) => html`<option value=${k} ?selected=${k === sp.kind}>${this._tr(`sp_${k}` as K)}</option>`)}
        </select>
      </div>
      ${this._fields(sp)}
    `;
  }

  static styles = editorStyles;
}
