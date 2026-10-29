// "What it does" for one device: a Home Assistant service accepting the device (with the input fields of
// the chosen one, as `ha-selector`s), or a scene that contains it. Emits `action-change`.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { scenesOf } from "../labels";
import { t } from "../i18n";
import { ensureHaSelector } from "../planner";
import { LIST_ATTRIBUTE, deviceOptions, loadServiceNames, serviceDomains, serviceFields, servicesFor, serviceDescription, startData } from "../services";
import type { ServiceField } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant } from "../types";

@customElement("wp-action-picker")
export class WpActionPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: "entity-id" }) entityId = "";
  @property({ attribute: false }) action: Action | null = null;
  @property({ type: Boolean }) disabled = false;
  /** Services offered for the device (empty: all); the chosen one is always shown. */
  @property({ attribute: false }) allowed: string[] = [];

  @state() private _selector = Boolean(customElements.get("ha-selector"));
  private _loadedFor = "";

  private get _lang(): string { return langOf(this.hass); }

  updated(): void {
    if (!this.hass || !this.entityId || this._loadedFor === this.entityId) return;
    this._loadedFor = this.entityId;
    void loadServiceNames(this.hass, serviceDomains(this.hass, this.entityId)).then((ok) => ok && this.requestUpdate());
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

  /** Context of Home Assistant's service control: the entity the field is about, and the attribute to list. */
  private _context(f: ServiceField): Record<string, unknown> {
    const state = f.selector.state as { attribute?: string } | undefined;
    return { filter_entity: [this.entityId], filter_target: { entity_id: [this.entityId] }, entity_id: this.entityId,
      filter_attribute: state?.attribute ?? LIST_ATTRIBUTE[f.key] };
  }

  /** Selector of a field; a list of the device (modes, presets…) is built from its attribute when it has one. */
  private _selectorOf(f: ServiceField): Record<string, unknown> {
    const options = deviceOptions(this.hass, this.entityId, f);
    return options ? { select: { options, mode: "dropdown" } } : f.selector;
  }

  render() {
    if (!this.hass || !this.entityId) return nothing;
    const lang = this._lang;
    const current = this.action?.kind === "service" ? this.action.service : "";
    const found = servicesFor(this.hass, this.entityId, this.allowed.length && current ? [...this.allowed, current] : this.allowed);
    const data = (this.action?.kind === "service" ? this.action.data ?? {} : {}) as Record<string, unknown>;
    const fields = current ? serviceFields(this.hass, current, this.entityId) : [];
    const scenes = scenesOf(this.hass, this.entityId);
    const selected = this.action?.kind === "scene" ? this.action.scene : current;
    const description = current ? serviceDescription(this.hass, current) || t(lang, "action_no_description")
      : this.action?.kind === "scene" ? t(lang, "action_scene_description") : "";
    return html`
      <label class="action-label" for="action">${t(lang, "action")}</label>
      <select id="action" .value=${selected || ""} aria-describedby="action-description" ?disabled=${this.disabled}
        @change=${(e: Event) => {
          const id = (e.target as HTMLSelectElement).value;
          if (!id) return;
          if (id.startsWith("scene.")) this._emit({ kind: "scene", scene: id });
          else this._emit({ kind: "service", service: id, data: startData(this.hass, id, this.entityId) });
        }}>
        <option value="" disabled ?selected=${!selected}>${t(lang, "action_choose")}</option>
        ${found.map((s) => html`<option value=${s.id} ?selected=${s.id === current}
          title=${serviceDescription(this.hass, s.id) || t(lang, "action_no_description")}>${s.label}</option>`)}
        ${scenes.map((s) => html`<option value=${s.entity_id} ?selected=${s.entity_id === selected}
          title=${t(lang, "action_scene_description")}>${String(s.attributes.friendly_name ?? s.entity_id)}</option>`)}
      </select>
      <p id="action-description" class="description" aria-live="polite">${description}</p>
      ${fields.map((f) => this._selector
        ? html`<ha-selector class="fld" .hass=${this.hass} .selector=${this._selectorOf(f)} .context=${this._context(f)} .value=${data[f.key]} .label=${f.label}
            .required=${f.required} ?disabled=${this.disabled}
            @value-changed=${(e: CustomEvent<{ value?: unknown }>) => { e.stopPropagation(); this._setData(f.key, e.detail.value); }}></ha-selector>`
        : html`<div class="field"><label>${f.label}</label><input type="text" .value=${String(data[f.key] ?? "")} ?disabled=${this.disabled}
            @change=${(e: Event) => this._setData(f.key, (e.target as HTMLInputElement).value)} /></div>`)}`;
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
