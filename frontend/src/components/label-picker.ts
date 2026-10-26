// Choice of a label for a slot (or for "the rest of the time"): the labels that suit the devices, as coloured
// chips; "+ New label" opens a small inline form; the value of the chosen label can be set for one device.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import { actionSummary, actionText, allowedOf, entityAction, hasOverride, labelOf, labelsFor, labelUsers, nextColor, PALETTE } from "../labels";
import { t } from "../i18n";
import { friendlyName } from "../planner";
import { loadServiceNames, missingFields } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant, Label, PlannerData, Program } from "../types";

/** The label form as a draft, for a parent that saves it together with its own form (`embedded`). */
export interface LabelDraft {
  /** null: a new label. */
  id: string | null;
  name: string;
  color: string;
  action: Action | null;
  /** Values for a device changed in the form (null: back to the common value). */
  overrides: { entityId: string; action: Action | null }[];
  /** Why it cannot be saved yet ("" when it can). */
  problem: string;
}

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
  /** The strip under a bar: no label creation. */
  @property({ type: Boolean }) compact = false;
  /** Inside a form that has its own Save / Cancel: the label form has no buttons and reports `label-draft`. */
  @property({ type: Boolean }) embedded = false;

  /** The label form is open (edit of the chosen label, or a new one). */
  @state() private _form = false;
  /** Id of the label being edited (null: a new label is being created). */
  @state() private _editId: string | null = null;
  @state() private _name = "";
  @state() private _color = "";
  @state() private _action: Action | null = null;
  /** Values for a device changed in the form. */
  @state() private _ov: Record<string, Action | null> = {};
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _valueFor: string | null = null;
  private _loaded = "";

  private get _lang(): string { return langOf(this.hass); }

  private _emit(name: string, detail: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  updated(): void {
    const action = labelOf(this.data, this.value)?.action;
    const key = action?.kind === "service" ? action.service.split(".")[0] : "";
    if (!this.hass || !key || this._loaded === key) return;
    this._loaded = key;
    void loadServiceNames(this.hass, [key]).then((ok) => ok && this.requestUpdate());
  }

  /** Opens the form on the chosen label (a pencil), or on a new one. */
  private _open(edit: boolean): void {
    const label = edit ? labelOf(this.data, this.value) : undefined;
    if (edit && !label) return;
    this._form = true;
    this._editId = label?.id ?? null;
    this._name = label?.name ?? "";
    this._color = label?.color ?? nextColor(this.data.labels);
    this._action = label ? structuredClone(label.action) : null;
    this._ov = {};
    this._valueFor = null;
    this._error = "";
    this._changed();
  }

  private _close(): void {
    this._form = false;
    this._error = "";
    this._changed();
  }

  /** The form changed: an embedding form is told. */
  private _changed(): void {
    if (!this.embedded) return;
    this._emit("label-draft", this._form ? this._draft() : null);
  }

  private _draft(): LabelDraft {
    return {
      id: this._editId, name: this._name.trim(), color: this._color, action: this._action,
      overrides: Object.entries(this._ov).map(([entityId, action]) => ({ entityId, action })),
      problem: this._formProblem,
    };
  }

  private get _formProblem(): string {
    const lang = this._lang;
    if (!this._name.trim()) return t(lang, "lb_err_name");
    if (!this._action) return t(lang, "lb_err_action");
    if (this._action.kind === "service" && missingFields(this.hass, this._action.service, this._action.data, this.entityIds[0]).length) {
      return t(lang, "lb_err_fields");
    }
    return "";
  }

  private _set(patch: { name?: string; color?: string; action?: Action | null }): void {
    if (patch.name !== undefined) this._name = patch.name;
    if (patch.color !== undefined) this._color = patch.color;
    if (patch.action !== undefined) this._action = patch.action;
    this._error = "";
    this._changed();
  }

  /** The value of the label for a device as the form shows it: changed in the form, else the saved one. */
  private _ownValue(entityId: string, labelId: string): Action | null {
    if (entityId in this._ov) return this._ov[entityId];
    return this.program.entities.find((e) => e.entity_id === entityId)?.label_overrides?.[labelId] ?? null;
  }

  /** Writes the changed values for a device on the live program (own Save only). */
  private async _saveOverrides(labelId: string): Promise<void> {
    const changes = Object.entries(this._ov);
    if (!changes.length) return;
    for (let attempt = 0; attempt < 2; attempt++) {
      const fresh = await this.hass.callWS<PlannerData>({ type: "weekly_planner/get" });
      const live = fresh.programs.find((p) => p.id === this.program.id);
      if (!live) return;
      const next: Program = {
        ...live,
        entities: live.entities.map((e) => {
          const mine = changes.filter(([eid]) => eid === e.entity_id);
          if (!mine.length) return e;
          const overrides = { ...(e.label_overrides ?? {}) };
          for (const [, action] of mine) {
            if (action) overrides[labelId] = action;
            else delete overrides[labelId];
          }
          return { ...e, label_overrides: overrides };
        }),
      };
      try {
        await this.hass.callWS({ type: "weekly_planner/program/save", program: next });
        return;
      } catch (err) {
        if ((err as { code?: string })?.code !== "conflict") throw err;
      }
    }
  }

  private async _save(): Promise<void> {
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
      await this._saveOverrides(res.label.id);
      this._form = false;
      this._emit("label-change", res.label.id);
    } catch (err) {
      const e = err as { code?: string };
      this._error = e?.code === "unauthorized" ? t(this._lang, "err_unauthorized") : t(this._lang, "lb_err_save");
    } finally {
      this._saving = false;
    }
  }

  private _choose(id: string | null): void {
    if (this._form) {
      this._form = false;
      this._changed();
    }
    this._emit("label-change", id);
  }

  /** "Value for this device" inside the form: the action of the label for this device only. */
  private _valueEditor(entityId: string, labelId: string) {
    const lang = this._lang;
    const own = this._ownValue(entityId, labelId);
    const shown = (this._valueFor === entityId);
    return html`<div class="dev">
      <button class="link ${own ? "own" : ""}" ?disabled=${this.disabled} aria-expanded=${shown}
        @click=${() => (this._valueFor = shown ? null : entityId)}>${t(lang, "lb_value_here")}${this.entityIds.length > 1 ? ` · ${friendlyName(this.hass, entityId)}` : ""}</button>
      ${shown ? html`<div class="valbox">
        <wp-action-picker .hass=${this.hass} entity-id=${entityId} .allowed=${allowedOf(this.program, entityId)}
          .action=${own ?? this._action} ?disabled=${this.disabled}
          @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._ov = { ...this._ov, [entityId]: e.detail }; this._error = ""; this._changed(); }}></wp-action-picker>
        ${own ? html`<button class="btn" ?disabled=${this.disabled}
          @click=${() => { this._ov = { ...this._ov, [entityId]: null }; this._changed(); }}>
          <ha-icon icon="mdi:undo"></ha-icon>${t(lang, "lb_common_value")}</button>` : nothing}
      </div>` : nothing}
    </div>`;
  }

  private _renderForm() {
    const lang = this._lang;
    return html`<div class="form">
      <div class="field"><label for="lb-name">${t(lang, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })} /></div>
      <div class="swatches" role="radiogroup" aria-label=${t(lang, "lb_color")}>
        ${PALETTE.map((c) => html`<button class="sw ${c === this._color ? "on" : ""}" role="radio" aria-checked=${c === this._color}
          aria-label=${c} style="background:${c}" @click=${() => this._set({ color: c })}></button>`)}
      </div>
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${allowedOf(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled}
        @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._set({ action: e.detail }); }}></wp-action-picker>
      ${this._editId ? this.entityIds.map((eid) => this._valueEditor(eid, this._editId!)) : nothing}
      ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      ${this.embedded ? nothing : html`<div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled} @click=${() => void this._save()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${t(lang, "cancel")}</button>
      </div>`}
    </div>`;
  }

  /** The chosen label, read-only: colour, name, what it does, the value for a device when there is one. */
  private _renderDetails(chosen: Label) {
    const lang = this._lang;
    return html`
      <!-- framed in the label's colour so it clearly belongs to it -->
      <div class="details" style="--lc:${chosen.color}">
        <div class="dhead">
          <i class="dot" style="background:${chosen.color}"></i><b>${chosen.name}</b>
          ${labelUsers(this.data, chosen.id).some((n) => n !== this.program.name) ? html`<span class="shared">${t(lang, "shared")}</span>` : nothing}
          <button class="pen ${this._form ? "on" : ""}" aria-label=${t(lang, "rename_label")} title=${t(lang, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => (this._form && this._editId ? this._close() : this._open(true))}><ha-icon icon="mdi:pencil"></ha-icon></button>
        </div>
        ${this._form ? nothing : html`
          <div class="sum"><span class="what">${actionSummary(this.hass, lang, chosen.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((eid) => {
            const own = hasOverride(this.program, eid, chosen.id) ? entityAction(this.program, eid, chosen) : undefined;
            return own ? html`<div class="sum"><span class="k">${t(lang, "lb_value_here")} :</span>
              <span class="what">${actionText(this.hass, lang, own)}</span>
              ${this.entityIds.length > 1 ? html`<span class="who">${friendlyName(this.hass, eid)}</span>` : nothing}</div>` : nothing;
          })}`}
        ${this._form && this._editId ? this._renderForm() : nothing}
      </div>`;
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const lang = this._lang;
    const labels = labelsFor(this.hass, this.data, this.entityIds, this.program);
    const chosen = labelOf(this.data, this.value);
    const chip = (name: string, on: boolean, click: () => void, color?: string) => html`
      <button class="chip ${on ? "on" : ""}" role="radio" aria-checked=${on} ?disabled=${this.disabled} @click=${click}>
        ${color ? html`<i class="dot" style="background:${color}"></i>` : nothing}<span>${name}</span></button>`;
    return html`
      <div class="chips" role="radiogroup" aria-label=${t(lang, "action")}>
        ${this.allowNone ? chip(t(lang, "rest_none"), this.value === null, () => this._choose(null)) : nothing}
        ${labels.map((l) => chip(l.name, l.id === this.value, () => this._choose(l.id), l.color))}
        ${this.value && !chosen ? chip("?", true, () => undefined) : nothing}
        ${this.compact ? nothing : html`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => (this._form && !this._editId ? this._close() : this._open(false))}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${t(lang, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId ? this._renderForm() : nothing}
      ${chosen && !(this._form && !this._editId) ? this._renderDetails(chosen) : nothing}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .details {
      margin-top: 10px; padding: 8px 12px; border-radius: 12px; border: 1px solid var(--lc);
      border-left-width: 4px; background: color-mix(in srgb, var(--lc) 10%, transparent);
    }
    .dhead { display: flex; align-items: center; gap: 8px; min-height: 40px; }
    .dhead b { flex: 1; min-width: 0; }
    .details .k { color: var(--secondary-text-color); }
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
    .pen.on { background: var(--secondary-background-color); color: var(--primary-color); }
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
    .dev { margin-top: 6px; }
    .sum { margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 15px; }
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
