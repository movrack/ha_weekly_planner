// Choice of a label for a slot (or for "the rest of the time"): the labels that suit the devices, as coloured
// chips; "+ New label" opens a small inline form; the value of the chosen label can be set for one device.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import { actionText, entityAction, hasOverride, labelOf, labelsFor, labelUsers, nextColor, PALETTE } from "../labels";
import { t } from "../i18n";
import { friendlyName } from "../planner";
import { missingFields } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant, PlannerData, Program } from "../types";

@customElement("wp-label-picker")
export class WpLabelPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: false }) entityIds: string[] = [];
  @property({ attribute: false }) value: string | null = null;
  /** "The rest of the time": a "Nothing" choice is added. */
  @property({ type: Boolean, attribute: "allow-none" }) allowNone = false;
  @property({ type: Boolean }) disabled = false;
  /** Only the chips (no creation, no pencil, no value for a device): the strip under a bar. */
  @property({ type: Boolean }) compact = false;

  @state() private _creating = false;
  /** Id of the label being edited in place (null: a new label is being created). */
  @state() private _editId: string | null = null;
  @state() private _name = "";
  @state() private _color = "";
  @state() private _action: Action | null = null;
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _valueFor: string | null = null;

  private get _lang(): string { return langOf(this.hass); }

  private _emit(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /** Edits the chosen label in place: name, colour and action (the label is shared by every program). */
  private _startEdit(): void {
    const label = labelOf(this.data, this.value);
    if (!label) return;
    this._creating = true;
    this._editId = label.id;
    this._name = label.name;
    this._color = label.color;
    this._action = structuredClone(label.action);
    this._error = "";
  }

  private _startCreate(): void {
    this._editId = null;
    this._creating = true;
    this._name = "";
    this._color = nextColor(this.data.labels);
    this._action = null;
    this._error = "";
  }

  private get _formProblem(): string {
    const lang = this._lang;
    if (!this._name.trim()) return t(lang, "lb_err_name");
    if (!this._action) return t(lang, "lb_err_action");
    if (this._action.kind === "service" && missingFields(this.hass, this._action.service, this._action.data).length) {
      return t(lang, "lb_err_fields");
    }
    return "";
  }

  private async _create(): Promise<void> {
    const problem = this._formProblem;
    if (problem) {
      this._error = problem;
      return;
    }
    this._saving = true;
    try {
      const res = await this.hass.callWS<{ label: { id: string } }>({
        type: "weekly_planner/label/save",
        label: { ...(this._editId ? { id: this._editId } : {}), name: this._name.trim(), color: this._color, action: this._action },
      });
      this._creating = false;
      this._emit("label-change", res.label.id);
    } catch (err) {
      const e = err as { code?: string };
      this._error = e?.code === "unauthorized" ? t(this._lang, "err_unauthorized") : t(this._lang, "lb_err_save");
    } finally {
      this._saving = false;
    }
  }

  private _valueEditor(entityId: string) {
    const lang = this._lang;
    const label = labelOf(this.data, this.value);
    if (!label) return nothing;
    const action = entityAction(this.program, entityId, label) ?? null;
    return html`<div class="valbox">
      <wp-action-picker .hass=${this.hass} entity-id=${entityId} .action=${action} ?disabled=${this.disabled}
        @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._emit("override-change", { entityId, labelId: label.id, action: e.detail }); }}></wp-action-picker>
      ${hasOverride(this.program, entityId, label.id)
        ? html`<button class="btn" ?disabled=${this.disabled}
            @click=${() => this._emit("override-change", { entityId, labelId: label.id, action: null })}>
            <ha-icon icon="mdi:undo"></ha-icon>${t(lang, "lb_common_value")}</button>` : nothing}
    </div>`;
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const lang = this._lang;
    const labels = labelsFor(this.hass, this.data, this.entityIds);
    const chosen = labelOf(this.data, this.value);
    const chip = (name: string, on: boolean, click: () => void, color?: string) => html`
      <button class="chip ${on ? "on" : ""}" role="radio" aria-checked=${on} ?disabled=${this.disabled} @click=${click}>
        ${color ? html`<i class="dot" style="background:${color}"></i>` : nothing}<span>${name}</span></button>`;
    return html`
      <div class="chips" role="radiogroup" aria-label=${t(lang, "action")}>
        ${this.allowNone ? chip(t(lang, "rest_none"), this.value === null, () => this._emit("label-change", null)) : nothing}
        ${labels.map((l) => chip(l.name, l.id === this.value, () => this._emit("label-change", l.id), l.color))}
        ${this.value && !chosen ? chip("?", true, () => undefined) : nothing}
        ${this.compact ? nothing : html`<button class="chip add" ?disabled=${this.disabled} @click=${() => this._startCreate()}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${t(lang, "lb_new")}</span></button>`}
      </div>
      ${chosen && !this.compact && !this._creating ? html`<div class="edit">
        <button class="pen" aria-label=${t(lang, "rename_label")} title=${t(lang, "rename_label")} ?disabled=${this.disabled}
          @click=${() => this._startEdit()}><ha-icon icon="mdi:pencil"></ha-icon></button>
        ${labelUsers(this.data, chosen.id).some((n) => n !== this.program.name) ? html`<span class="shared">${t(lang, "shared")}</span>` : nothing}
      </div>` : nothing}
      ${this._creating ? html`<div class="form">
        <div class="field"><label for="lb-name">${t(lang, "lb_name")}</label>
          <input id="lb-name" type="text" maxlength="30" .value=${this._name}
            @input=${(e: Event) => { this._name = (e.target as HTMLInputElement).value; this._error = ""; }} /></div>
        <div class="swatches" role="radiogroup" aria-label=${t(lang, "lb_color")}>
          ${PALETTE.map((c) => html`<button class="sw ${c === this._color ? "on" : ""}" role="radio" aria-checked=${c === this._color}
            aria-label=${c} style="background:${c}" @click=${() => (this._color = c)}></button>`)}
        </div>
        <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .action=${this._action}
          @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._action = e.detail; this._error = ""; }}></wp-action-picker>
        ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
        <div class="btns">
          <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._create()}>${t(lang, "save")}</button>
          <button class="btn" @click=${() => (this._creating = false)}>${t(lang, "cancel")}</button>
        </div>
      </div>` : nothing}
      ${chosen && !this._creating && !this.compact ? html`
        ${this.entityIds.map((eid) => {
          const open = this._valueFor === eid;
          const own = hasOverride(this.program, eid, chosen.id);
          return html`<div class="dev">
            <div class="sum"><span class="what">${actionText(this.hass, lang, entityAction(this.program, eid, chosen))}</span>
              ${this.entityIds.length > 1 ? html`<span class="who">${friendlyName(this.hass, eid)}</span>` : nothing}</div>
            <button class="link ${own ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${open}
              @click=${() => (this._valueFor = open ? null : eid)}>${t(lang, "lb_value_here")}</button>
            ${open ? this._valueEditor(eid) : nothing}
          </div>`;
        })}` : nothing}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { border: 2px solid var(--primary-color); font-weight: 600; }
    .chip.add { border-style: dashed; color: var(--primary-color); }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .edit { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .pen {
      width: 48px; height: 48px; border: none; border-radius: 24px; background: none; color: var(--secondary-text-color);
      cursor: pointer; --mdc-icon-size: 20px; display: inline-flex; align-items: center; justify-content: center;
    }
    .pen:hover { background: var(--secondary-background-color); }
    .shared { font-size: 12px; color: var(--secondary-text-color); }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .form { margin-top: 12px; padding: 12px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 40px; height: 40px; border-radius: 20px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .sw.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .err { color: var(--error-color, #db4437); margin: 8px 0 0; }
    .dev { margin-top: 10px; }
    .sum { display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 15px; }
    .sum .what { font-weight: 600; }
    .sum .who { color: var(--secondary-text-color); font-size: 13px; }
    .link {
      border: none; background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer;
      min-height: 48px; padding: 0; text-align: left;
    }
    .link.own { font-weight: 600; }
    .valbox { padding: 8px 0 4px; display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .valbox wp-action-picker { align-self: stretch; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-label-picker": WpLabelPicker;
  }
}
