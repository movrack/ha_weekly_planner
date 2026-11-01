// "What it does" for one device: a Home Assistant service accepting the device (with the input fields of
// the chosen one, as `ha-selector`s), or a scene that contains it. Emits `action-change`.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { scenesOf } from "../labels";
import { t } from "../i18n";
import { ensureHaSelector } from "../planner";
import { syncSelectValues } from "../select-value";
import { LIST_ATTRIBUTE, deviceOptions, loadServiceNames, serviceDomains, serviceFields, servicesFor, serviceDescription, serviceLabel, startData } from "../services";
import type { ServiceField } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, ActionValueSource, HomeAssistant } from "../types";

@customElement("wp-action-picker")
export class WpActionPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: "entity-id" }) entityId = "";
  @property({ attribute: false }) action: Action | null = null;
  @property({ type: Boolean }) disabled = false;
  /** Services offered for the device (undefined: all, empty: none); the chosen one stays visible. */
  @property({ attribute: false }) allowed?: string[];

  @state() private _selector = Boolean(customElements.get("ha-selector"));
  private _loadedFor = "";

  private get _lang(): string { return langOf(this.hass); }

  private get _targetEntity(): string {
    return this.action?.kind === "service" ? this.action.target_entity_id ?? this.entityId : this.entityId;
  }

  private _setTarget(target?: string): void {
    if (this.action?.kind === "service" && this.action.target_entity_id === target) return;
    this._emit({ kind: "service", service: "", ...(target !== undefined ? { target_entity_id: target } : {}) });
  }

  updated(): void {
    syncSelectValues(this.renderRoot);
    if (!this.hass || !this._targetEntity || this._loadedFor === this._targetEntity) return;
    this._loadedFor = this._targetEntity;
    void loadServiceNames(this.hass, serviceDomains(this.hass, this._targetEntity)).then((ok) => ok && this.requestUpdate());
    if (!this._selector) void ensureHaSelector().then((ok) => (this._selector = ok));
  }

  private _emit(action: Action): void {
    this.dispatchEvent(new CustomEvent("action-change", { detail: action, bubbles: true, composed: true }));
  }

  private _setData(key: string, value: unknown): void {
    if (this.action?.kind !== "service") return;
    const data = { ...(this.action.data ?? {}) };
    const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);
    if (empty) delete data[key];
    else data[key] = value;
    this._emit({ ...this.action, data });
  }

  private _sourceType(f: ServiceField): ActionValueSource["type"] {
    const multiple = (f.selector.select as { multiple?: boolean } | undefined)?.multiple;
    return f.selector.number ? "number" : f.selector.boolean ? "boolean" : multiple ? "native" : f.selector.text || f.selector.select ? "string" : "native";
  }

  private _setSource(key: string, source?: ActionValueSource): void {
    if (this.action?.kind !== "service") return;
    const data_sources = { ...this.action.data_sources };
    const data = { ...this.action.data };
    if (source) { data_sources[key] = source; delete data[key]; }
    else delete data_sources[key];
    this._emit({ ...this.action, data, data_sources });
  }

  private _field(f: ServiceField, data: Record<string, unknown>) {
    const source = this.action?.kind === "service" ? this.action.data_sources?.[f.key] : undefined;
    const state = source ? this.hass.states[source.entity_id] : undefined;
    const value = source?.attribute ? state?.attributes[source.attribute] : state?.state;
    const available = state && !["unknown", "unavailable"].includes(state.state) && value !== undefined && value !== null;
    const preview = available ? typeof value === "object" ? JSON.stringify(value) : String(value) : t(this._lang, "value_unavailable");
    const attributes = [...new Set([...Object.keys(state?.attributes ?? {}), ...(source?.attribute ? [source.attribute] : [])])].sort();
    return html`<div class="source-field">
      <div class="field"><label for=${`source-${f.key}`}>${f.label}</label>
        <select id=${`source-${f.key}`} data-value=${source ? "entity" : "fixed"} ?disabled=${this.disabled}
          @change=${(e: Event) => this._setSource(f.key, (e.target as HTMLSelectElement).value === "entity"
            ? { entity_id: "", type: this._sourceType(f) } : undefined)}>
          <option value="fixed">${t(this._lang, "value_fixed")}</option>
          <option value="entity">${t(this._lang, "value_entity")}</option>
        </select></div>
      ${source ? html`<wp-entity-picker .hass=${this.hass} .value=${source.entity_id} .label=${t(this._lang, "value_source")}
          .disabled=${this.disabled}
          @wp-change=${(e: CustomEvent<string>) => { e.stopPropagation(); this._setSource(f.key, { ...source, entity_id: e.detail }); }}></wp-entity-picker>
        <div class="field"><label for=${`attribute-${f.key}`}>${t(this._lang, "value_read")}</label>
          <select id=${`attribute-${f.key}`} data-value=${source.attribute ?? ""} ?disabled=${this.disabled}
            @change=${(e: Event) => { const attribute = (e.target as HTMLSelectElement).value; this._setSource(f.key, { entity_id: source.entity_id, type: source.type, ...(attribute ? { attribute } : {}) }); }}>
            <option value="">${t(this._lang, "value_state")}</option>
            ${attributes.map((a) => html`<option value=${a}>${a}</option>`)}
          </select></div>
        ${source.entity_id ? html`<p class="hint" role="status">${t(this._lang, "value_current", { value: preview })}</p>` : nothing}
        <p class="hint">${t(this._lang, "value_at_execution")}</p>`
        : this._selector ? html`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(f)} .context=${this._context(f)} .value=${data[f.key]} .label=${f.label}
            .required=${f.required} ?disabled=${this.disabled}
            @value-changed=${(e: CustomEvent<{ value?: unknown }>) => { e.stopPropagation(); this._setData(f.key, e.detail.value); }}></ha-selector>`
          : html`<div class="field"><label>${f.label}</label><input type="text" .value=${String(data[f.key] ?? "")} ?disabled=${this.disabled}
            @change=${(e: Event) => this._setData(f.key, (e.target as HTMLInputElement).value)} /></div>`}
    </div>`;
  }

  /** Context of Home Assistant's service control: the entity the field is about, and the attribute to list. */
  private _context(f: ServiceField): Record<string, unknown> {
    const state = f.selector.state as { attribute?: string } | undefined;
    return { filter_entity: [this._targetEntity], filter_target: { entity_id: [this._targetEntity] }, entity_id: this._targetEntity,
      filter_attribute: state?.attribute ?? LIST_ATTRIBUTE[f.key] };
  }

  /** Selector of a field; a list of the device (modes, presets…) is built from its attribute when it has one. */
  private _selectorOf(f: ServiceField): Record<string, unknown> {
    const options = deviceOptions(this.hass, this._targetEntity, f);
    return options ? { select: { options, mode: "dropdown" } } : f.selector;
  }

  render() {
    if (!this.hass) return nothing;
    const lang = this._lang;
    const external = this.action?.kind === "service" && this.action.target_entity_id !== undefined;
    const target = this._targetEntity;
    const current = this.action?.kind === "service" ? this.action.service : "";
    const found = target ? servicesFor(this.hass, target, this.allowed !== undefined && current ? [...this.allowed, current] : this.allowed) : [];
    if (current && !found.some((service) => service.id === current)) {
      const [domain, service] = current.split(".");
      found.push({ id: current, domain, service, label: serviceLabel(this.hass, current) });
    }
    const data = (this.action?.kind === "service" ? this.action.data ?? {} : {}) as Record<string, unknown>;
    const fields = current ? serviceFields(this.hass, current, target) : [];
    const scenes = external ? [] : scenesOf(this.hass, this.entityId);
    const selected = this.action?.kind === "scene" ? this.action.scene : current;
    const description = current ? serviceDescription(this.hass, current) || t(lang, "action_no_description")
      : this.action?.kind === "scene" ? t(lang, "action_scene_description") : "";
    return html`
      <div class="field"><label for="action-target-mode">${t(lang, "action_target")}</label>
        <select id="action-target-mode" data-value=${external ? "other" : "device"} ?disabled=${this.disabled}
          @change=${(e: Event) => this._setTarget((e.target as HTMLSelectElement).value === "other" ? "" : undefined)}>
          <option value="device">${t(lang, "action_target_device")}</option>
          <option value="other">${t(lang, "action_target_other")}</option>
        </select></div>
      ${external ? html`<wp-entity-picker .hass=${this.hass} .value=${target} .disabled=${this.disabled} .label=${t(lang, "action_target_entity")}
        @wp-change=${(e: CustomEvent<string>) => { e.stopPropagation(); this._setTarget(e.detail); }}></wp-entity-picker>
        <p class="hint">${t(lang, "action_target_hint")}</p>` : nothing}
      ${this.allowed?.length === 0 ? html`<p class="hint" role="status">${t(lang, "action_none_allowed")}</p>` : nothing}
      <label class="action-label" for="action">${t(lang, "action")}</label>
      <select id="action" data-value=${selected || ""} aria-describedby="action-description" ?disabled=${this.disabled || !target}
        @change=${(e: Event) => {
          const id = (e.target as HTMLSelectElement).value;
          if (!id) return;
          if (id.startsWith("scene.")) this._emit({ kind: "scene", scene: id });
          else this._emit({ kind: "service", service: id, ...(external ? { target_entity_id: target } : {}), data: startData(this.hass, id, target) });
        }}>
        <option value="" disabled ?selected=${!selected}>${t(lang, "action_choose")}</option>
        ${found.map((s) => html`<option value=${s.id} ?selected=${s.id === current}
          title=${serviceDescription(this.hass, s.id) || t(lang, "action_no_description")}>${s.label}</option>`)}
        ${this.action?.kind === "scene" && !scenes.some((scene) => scene.entity_id === selected)
          ? html`<option value=${selected} selected>${selected}</option>` : nothing}
        ${scenes.map((s) => html`<option value=${s.entity_id} ?selected=${s.entity_id === selected}
          title=${t(lang, "action_scene_description")}>${String(s.attributes.friendly_name ?? s.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${description}</p>
      ${fields.map((f) => this._field(f, data))}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .action-label { display: block; margin-bottom: 6px; font-size: 14px; }
    select { width: 100%; min-width: 0; min-height: 48px; padding: 10px 12px; box-sizing: border-box;
      font: inherit; color: var(--primary-text-color); background: var(--secondary-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; }
    .description { margin: 8px 0; color: var(--secondary-text-color); font-size: 14px;
      line-height: 1.45; white-space: pre-line; overflow-wrap: anywhere; }
    .fld { display: block; margin-top: 8px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-action-picker": WpActionPicker;
  }
}
