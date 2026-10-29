// Reusable editing pieces: styles, entity picker and conditions editor.

import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { strings, t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import type { Condition, HassEntity, HomeAssistant } from "../types";

export type K = Parameters<typeof t>[1];

export const langOf = (hass?: HomeAssistant): string => hass?.locale?.language ?? hass?.language ?? "en";

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
  input[type="checkbox"], input[type="radio"] { width: 20px; height: 20px; min-width: 20px; flex: none; margin: 0; accent-color: var(--primary-color); }
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

/* ------------------------------------------------------------------ entity picker */

@customElement("wp-entity-picker")
export class WpEntityPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() value = "";
  @property() label = "";
  @property({ type: Boolean }) disabled = false;
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
        .hass=${this.hass} .value=${this.value} .label=${this.label} .disabled=${this.disabled}
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
        <input type="text" ?disabled=${this.disabled} list=${this._listId} .value=${this.value} autocomplete="off"
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
