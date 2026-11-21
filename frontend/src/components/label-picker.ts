// Choice of a label for a slot (or for "the rest of the time"): the labels that suit the devices, as coloured
// chips; "+ New label" opens a small inline form; the value of the chosen label can be set for one device.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import { actionSummary, actionText, allowedOf, entityAction, hasOverride, labelName, labelOf, labelsFor, labelUsers, nextColor, PALETTE, PALETTE_NAMES, replaceLabel, usesLabel } from "../labels";
import { t } from "../i18n";
import { friendlyName } from "../planner";
import { loadServiceNames, missingFields } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import { callout } from "../styles";
import type { Action, HomeAssistant, Label, PlannerData, Program } from "../types";

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
  /** Settings can be chosen but not configured: no pencil, no "new setting", no form (the strip under a bar). */
  @property({ type: Boolean, attribute: "readonly-settings" }) readonlySettings = false;

  /** The label form is open (edit of the chosen label, or a new one). */
  @state() private _form = false;
  /** Id of the label being edited (null: a new label is being created). */
  @state() private _editId: string | null = null;
  @state() private _name = "";
  @state() private _color = "";
  @state() private _showValue = false;
  @state() private _action: Action | null = null;
  /** Values for a device changed in the form. */
  @state() private _ov: Record<string, Action | null> = {};
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _valueFor: string | null = null;
  /** The delete confirmation (or the refusal) is shown for the chosen label. */
  @state() private _confirmDel = false;
  @state() private _replaceBy: string | null = null;
  @state() private _delError = "";
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
    this._showValue = Boolean(label?.show_value);
    this._action = label ? structuredClone(label.action) : null;
    this._ov = {};
    this._valueFor = null;
    this._error = "";
  }

  private _close(): void {
    this._form = false;
    this._error = "";
  }

  private get _formProblem(): string {
    const lang = this._lang;
    if (!this._name.trim()) return t(lang, "lb_err_name");
    if (!this._action) return t(lang, "lb_err_action");
    if (this._action.kind === "service" && (!this._action.service || this._action.target_entity_id === "")) return t(lang, "lb_err_action");
    if (this._action.kind === "service" && missingFields(this.hass, this._action.service, this._action.data, this._action.target_entity_id ?? this.entityIds[0], this._action.data_sources).length) {
      return t(lang, "lb_err_fields");
    }
    return "";
  }

  private _set(patch: { name?: string; color?: string; action?: Action | null; showValue?: boolean }): void {
    if (patch.showValue !== undefined) this._showValue = patch.showValue;
    if (patch.name !== undefined) this._name = patch.name;
    if (patch.color !== undefined) this._color = patch.color;
    if (patch.action !== undefined) this._action = patch.action;
    this._error = "";
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
        label: { ...(this._editId ? { id: this._editId } : {}), name: this._name.trim(), color: this._color, action: this._action, show_value: this._canShowValue ? this._showValue : false },
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

  /** Deletes the chosen label for everyone (the server refuses while a program uses it). */
  private async _delete(label: Label): Promise<void> {
    this._saving = true;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: label.id });
      this._confirmDel = false;
      this._delError = "";
      this._form = false;
      this._emit("label-change", null);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      this._delError = e?.code === "in_use"
        ? t(this._lang, "lb_delete_used", { name: labelName(this.hass, label), programs: e.message || "" })
        : e?.code === "unauthorized" ? t(this._lang, "err_unauthorized") : t(this._lang, "lb_err_delete");
    } finally {
      this._saving = false;
    }
  }

  /**
   * A setting still in use cannot be deleted as is: the programs that use it get another setting first, then it goes.
   * Every program is saved with its own check (revision, admin rights); the first one refused stops everything and the
   * setting stays, so nothing is half deleted.
   */
  private async _replaceAndDelete(label: Label): Promise<void> {
    const to = this._replaceBy;
    if (!to || this._saving) return;
    this._saving = true;
    this._delError = "";
    try {
      for (const program of this.data.programs.filter((p) => usesLabel(p, label.id))) {
        await this.hass.callWS({ type: "weekly_planner/program/save", program: replaceLabel(program, label.id, to) });
      }
      await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: label.id });
      this._confirmDel = false;
      this._replaceBy = null;
      this._form = false;
      this._emit("label-change", to);
    } catch (err) {
      const e = err as { code?: string };
      this._delError = e?.code === "unauthorized" ? t(this._lang, "err_unauthorized") : e?.code === "conflict" ? t(this._lang, "lb_replace_conflict") : t(this._lang, "lb_err_delete");
    } finally {
      this._saving = false;
    }
  }

  private _renderDelete(chosen: Label) {
    const lang = this._lang;
    const name = labelName(this.hass, chosen);
    const users = labelUsers(this.data, chosen.id);
    if (users.length && !this.disabled) {
      const others = labelsFor(this.hass, this.data, this.entityIds, this.program).filter((l) => l.id !== chosen.id);
      return html`<div class="delbox" role="alert">
        ${callout("warning", "", this._delError || t(lang, "lb_delete_used", { name, programs: users.join(", ") }))}
        ${others.length ? html`<p class="label" id="lb-repl">${t(lang, "lb_replace_with")}</p>
          <div class="chips" role="radiogroup" aria-labelledby="lb-repl">
            ${others.map((l) => html`<button class="chip ${l.id === this._replaceBy ? "on" : ""}" role="radio" aria-checked=${l.id === this._replaceBy}
              @click=${() => { this._replaceBy = l.id; }}><i class="dot" style="background:${l.color}"></i><span>${labelName(this.hass, l, this.entityIds[0])}</span></button>`)}
          </div>` : nothing}
        <div class="btns">
          ${others.length ? html`<button class="btn danger-line" ?disabled=${this._saving || !this._replaceBy} @click=${() => void this._replaceAndDelete(chosen)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "lb_replace_go")}</button>` : nothing}
          <button class="btn" @click=${() => { this._confirmDel = false; this._delError = ""; this._replaceBy = null; }}>${t(lang, "cancel")}</button>
        </div>
      </div>`;
    }
    const used = users.length > 0 || !!this._delError;
    const msg = this._delError
      || (users.length ? t(lang, "lb_delete_used", { name, programs: users.join(", ") }) : t(lang, "lb_delete_ask", { name }));
    return html`<div class="delbox" role="alert">
      ${used ? callout("error", "", msg) : html`<p>${msg}</p>`}
      <div class="btns">
        ${used ? nothing : html`<button class="btn danger-line" ?disabled=${this._saving || this.disabled} @click=${() => void this._delete(chosen)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete")}</button>`}
        <button class="btn" @click=${() => { this._confirmDel = false; this._delError = ""; }}>${t(lang, used ? "close" : "cancel")}</button>
      </div>
    </div>`;
  }

  private _choose(id: string | null): void {
    this._confirmDel = false;
    this._delError = "";
    this._form = false;
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
      ${shown ? html`<div class="valbox wp-appear">
        <wp-action-picker no-fold .hass=${this.hass} entity-id=${entityId} .allowed=${allowedOf(this.program, entityId)}
          .action=${own ?? this._action} ?disabled=${this.disabled}
          @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._ov = { ...this._ov, [entityId]: e.detail }; this._error = ""; }}></wp-action-picker>
        ${own ? html`<button class="btn" ?disabled=${this.disabled}
          @click=${() => { this._ov = { ...this._ov, [entityId]: null }; }}>
          <ha-icon icon="mdi:undo"></ha-icon>${t(lang, "lb_common_value")}</button>` : nothing}
      </div>` : nothing}
    </div>`;
  }

  /** Colour swatches as a radiogroup: named by colour, one tab stop, arrow keys move and choose. */
  private _swatches() {
    const lang = this._lang;
    const current = PALETTE.findIndex((c) => c === this._color.toLowerCase());
    const custom = current < 0 && /^#[0-9a-f]{3,8}$/i.test(this._color.trim());
    const stop = current < 0 ? (custom ? -1 : 0) : current;
    const key = (e: KeyboardEvent) => {
      const at = PALETTE.findIndex((c) => c === this._color.toLowerCase());
      const n = PALETTE.length;
      const next = e.key === "ArrowRight" || e.key === "ArrowDown" ? (at + 1) % n
        : e.key === "ArrowLeft" || e.key === "ArrowUp" ? (at < 0 ? n - 1 : (at + n - 1) % n)
        : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
      if (next < 0 || this.disabled) return;
      e.preventDefault();
      this._set({ color: PALETTE[next] });
      (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("button.sw:not(.custom)")[next]?.focus();
    };
    return html`<div class="label" id="lb-color-label">${t(lang, "lb_color")}</div><div class="swatches" role="radiogroup" aria-labelledby="lb-color-label" @keydown=${key}>
      ${PALETTE.map((c, i) => html`<button class="sw" role="radio" aria-checked=${i === current} tabindex=${i === stop ? 0 : -1}
        aria-label=${t(lang, PALETTE_NAMES[i])} @click=${() => this._set({ color: c })}><i class=${i === current ? "on" : ""} style="background:${c}"></i></button>`)}
      ${custom ? html`<button class="sw custom" role="radio" aria-checked="true" tabindex="0" aria-label=${t(lang, "color_custom")}
        title=${t(lang, "color_custom")}><i class="on" style="background:${this._color}"></i></button>` : nothing}
    </div>`;
  }

  /** A value to show: one the action reads from an entity, or the temperature of a preset mode. */
  private get _canShowValue(): boolean {
    const a = this._action;
    return a?.kind === "service" && (Object.keys(a.data_sources ?? {}).length > 0 || a.service === "climate.set_preset_mode");
  }

  private _renderForm() {
    const lang = this._lang;
    return html`<div class="form">
      <div class="field"><label for="lb-name">${t(lang, "lb_name")}</label>
        <input id="lb-name" type="text" maxlength="30" .value=${this._name} ?disabled=${this.disabled}
          @input=${(e: Event) => this._set({ name: (e.target as HTMLInputElement).value })} />
        ${this._canShowValue ? html`<label class="check"><input type="checkbox" .checked=${this._showValue} ?disabled=${this.disabled}
          @change=${(e: Event) => this._set({ showValue: (e.target as HTMLInputElement).checked })} /> ${t(lang, "lb_show_value")}</label>` : nothing}</div>
      ${this._swatches()}
      <wp-action-picker .hass=${this.hass} entity-id=${this.entityIds[0] ?? ""} .allowed=${allowedOf(this.program, this.entityIds[0] ?? "")}
        .action=${this._action} ?disabled=${this.disabled} ?advanced-open=${Boolean(this._editId) && this.entityIds.some((eid) => this._ownValue(eid, this._editId!))}
        @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._set({ action: e.detail }); }}>
        ${this._editId ? html`<div slot="advanced">${this.entityIds.map((eid) => this._valueEditor(eid, this._editId!))}</div>` : nothing}
      </wp-action-picker>
      ${this._error ? html`${callout("error", "", this._error, { role: "alert" })}` : nothing}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || this.disabled}
          @click=${() => void this._save()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => this._close()}>${t(lang, "cancel")}</button>
      </div>
    </div>`;
  }

  /** The chosen label, read-only: colour, name, what it does, the value for a device when there is one. */
  private _renderDetails(chosen: Label) {
    const lang = this._lang;
    return html`
      <!-- framed in the label's colour so it clearly belongs to it -->
      <div class="details" style="--lc:${chosen.color}">
        <div class="dhead">
          <i class="dot" style="background:${chosen.color}"></i><b>${labelName(this.hass, this._form && this._editId === chosen.id && this._action ? { ...chosen, action: this._action, show_value: this._canShowValue && this._showValue } : chosen, this.entityIds[0])}</b>
          ${this.readonlySettings ? nothing : html`<button class="pen ${this._form ? "on" : ""}" aria-label=${t(lang, "rename_label")} title=${t(lang, "rename_label")}
            aria-pressed=${this._form} ?disabled=${this.disabled}
            @click=${() => (this._form && this._editId ? this._close() : this._open(true))}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="pen ${this._confirmDel ? "on" : ""}" aria-label=${t(lang, "lb_delete")} title=${t(lang, "lb_delete")}
            aria-expanded=${this._confirmDel} ?disabled=${this.disabled}
            @click=${() => { this._confirmDel = !this._confirmDel; this._delError = ""; }}><ha-icon icon="mdi:delete-outline"></ha-icon></button>`}
        </div>
        ${(() => {
          // the other programs that use this setting too (a change here changes them as well), on its own line
          const others = labelUsers(this.data, chosen.id).filter((n) => n !== this.program.name);
          return others.length ? html`<small class="shared">${t(lang, "used_by", { names: others.join(", ") })}</small>` : nothing;
        })()}
        ${this._confirmDel && !this.readonlySettings ? this._renderDelete(chosen) : nothing}
        ${this._form && !this.readonlySettings ? nothing : html`
          <div class="sum"><span class="what">${actionSummary(this.hass, lang, chosen.action, this.entityIds[0])}</span></div>
          ${this.entityIds.map((eid) => {
            const own = hasOverride(this.program, eid, chosen.id) ? entityAction(this.program, eid, chosen) : undefined;
            return own ? html`<div class="sum"><span class="k">${t(lang, "lb_value_here")} :</span>
              <span class="what">${actionText(this.hass, lang, own)}</span>
              ${this.entityIds.length > 1 ? html`<span class="who">${friendlyName(this.hass, eid)}</span>` : nothing}</div>` : nothing;
          })}`}
        ${this._form && this._editId && !this.readonlySettings ? this._renderForm() : nothing}
      </div>`;
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const lang = this._lang;
    // ascending order by name, numbers as numbers ("15 °C" before "20 °C")
    const labels = [...labelsFor(this.hass, this.data, this.entityIds, this.program)]
      .sort((a, b) => labelName(this.hass, a).localeCompare(labelName(this.hass, b), lang, { numeric: true, sensitivity: "base" }));
    const chosen = labelOf(this.data, this.value);
    const chip = (name: string, on: boolean, click: () => void, color?: string) => html`
      <button class="chip ${on ? "on" : ""}" role="radio" aria-checked=${on} ?disabled=${this.disabled} @click=${click}>
        ${color ? html`<i class="dot" style="background:${color}"></i>` : nothing}<span>${name}</span></button>`;
    return html`
      <div class="chips" role="radiogroup" aria-label=${t(lang, "action")}>
        ${this.allowNone ? chip(t(lang, "rest_none"), this.value === null, () => this._choose(null)) : nothing}
        ${labels.map((l) => chip(labelName(this.hass, l, this.entityIds[0]), l.id === this.value, () => this._choose(l.id), l.color))}
        ${this.value && !chosen ? chip("?", true, () => undefined) : nothing}
        ${this.compact || this.readonlySettings ? nothing : html`<button class="chip add ${this._form && !this._editId ? "on" : ""}" ?disabled=${this.disabled}
          @click=${() => (this._form && !this._editId ? this._close() : this._open(false))}>
          <ha-icon icon="mdi:plus"></ha-icon><span>${t(lang, "lb_new")}</span></button>`}
      </div>
      ${this._form && !this._editId && !this.readonlySettings ? this._renderForm() : nothing}
      ${chosen && !(this._form && !this._editId && !this.readonlySettings) ? this._renderDetails(chosen) : nothing}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .check { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 0.9em; font-weight: normal; cursor: pointer; }
    .check input { width: auto; min-height: 0; margin: 0; }
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
      border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color); font: inherit; font-size: 0.9375rem;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
    .chip.add { border-style: dashed; color: var(--wp-primary-text); }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .edit { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
    .pen {
      width: 48px; height: 48px; border: none; border-radius: 24px; background: none; color: var(--secondary-text-color);
      cursor: pointer; --mdc-icon-size: 20px; display: inline-flex; align-items: center; justify-content: center;
    }
    .pen.on { background: var(--secondary-background-color); color: var(--wp-primary-text); }
    .pen:hover { background: var(--secondary-background-color); }
    .shared { display: block; margin: -4px 0 4px; font-size: 0.875rem; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .form { margin-top: 12px; padding: 12px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 44px; height: 44px; border: 0; background: none; cursor: pointer; padding: 2px; display: inline-flex; align-items: center; justify-content: center; }
    .sw i { display: block; width: 40px; height: 40px; border-radius: 20px; box-sizing: border-box; border: 2px solid transparent; }
    .sw i.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .sw:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 0; border-radius: 22px; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .delbox p { margin: 4px 0 0; }
    .delbox .btns { margin-top: 8px; }
    .danger-line { color: var(--wp-danger-text); border-color: var(--wp-danger-text); }
    .dev { margin-top: 6px; }
    .sum { margin-top: 2px; display: flex; flex-wrap: wrap; gap: 4px 8px; align-items: baseline; font-size: 0.9375rem; }
    .sum .what { font-weight: 600; }
    .sum .who { color: var(--secondary-text-color); font-size: 0.8125rem; }
    .link {
      border: none; background: none; color: var(--wp-primary-text); font: inherit; font-size: 0.875rem; cursor: pointer;
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
