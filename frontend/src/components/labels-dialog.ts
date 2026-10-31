// The "Labels" screen (administrators): every label with its colour, name, action and use; rename, recolour,
// change the action, delete (refused while a program uses it).

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import "./dialog";
import { confirmAction } from "./confirm";
import { actionText, labelName, labelUsers, PALETTE } from "../labels";
import { t } from "../i18n";
import { friendlyName } from "../planner";
import { loadServiceNames, missingFields } from "../services";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant, Label, PlannerData } from "../types";

@customElement("wp-labels")
export class WpLabels extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;

  @state() private _open: string | null = null;
  @state() private _name = "";
  @state() private _color = "";
  @state() private _action: Action | null = null;
  @state() private _entity = "";
  @state() private _error = "";
  @state() private _saving = false;

  private get _lang(): string { return langOf(this.hass); }

  firstUpdated(): void {
    const domains = this.data.labels.flatMap((l) => (l.action.kind === "service" ? [l.action.service.split(".")[0]] : []));
    void loadServiceNames(this.hass, domains).then((ok) => ok && this.requestUpdate());
  }

  /** Devices that can serve to choose an action: those of the programs using the label, else all of them. */
  private _entities(label: Label): string[] {
    const users = this.data.programs.filter((p) => labelUsers(this.data, label.id).includes(p.name));
    const all = (list: typeof users) => [...new Set(list.flatMap((p) => p.entities.map((e) => e.entity_id)))];
    return users.length ? all(users) : all(this.data.programs);
  }

  private _expand(label: Label): void {
    this._open = label.id;
    this._name = label.name;
    this._color = label.color;
    this._action = structuredClone(label.action);
    this._entity = this._entities(label)[0] ?? "";
    this._error = "";
  }

  private async _save(label: Label): Promise<void> {
    const lang = this._lang;
    if (!this._name.trim()) { this._error = t(lang, "lb_err_name"); return; }
    if (this._action?.kind === "service" && (!this._action.service || this._action.target_entity_id === "")) { this._error = t(lang, "lb_err_action"); return; }
    if (this._action?.kind === "service" && missingFields(this.hass, this._action.service, this._action.data, this._action.target_entity_id, this._action.data_sources).length) {
      this._error = t(lang, "lb_err_fields");
      return;
    }
    this._saving = true;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/save", label: { id: label.id, name: this._name.trim(), color: this._color, action: this._action } });
      this._open = null;
    } catch {
      this._error = t(lang, "lb_err_save");
    } finally {
      this._saving = false;
    }
  }

  private async _delete(label: Label): Promise<void> {
    const lang = this._lang;
    const users = labelUsers(this.data, label.id);
    if (users.length) {
      this._error = t(lang, "lb_in_use", { programs: users.join(", ") });
      return;
    }
    if (!(await confirmAction(this, t(lang, "confirm_delete", { name: labelName(this.hass, label) }), t(lang, "delete"), t(lang, "cancel")))) return;
    try {
      await this.hass.callWS({ type: "weekly_planner/label/delete", label_id: label.id });
      this._open = null;
    } catch (err) {
      const e = err as { code?: string; message?: string };
      this._error = e?.code === "in_use" ? t(lang, "lb_in_use", { programs: e.message ?? "" }) : t(lang, "lb_err_save");
    }
  }

  render() {
    if (!this.hass || !this.data) return nothing;
    const lang = this._lang;
    return html`<wp-dialog open heading=${t(lang, "labels")}>
      ${this.data.labels.length ? nothing : html`<p class="muted">${t(lang, "lb_none")}</p>`}
      <div class="list">
        ${this.data.labels.map((l) => {
          const users = labelUsers(this.data, l.id).length;
          if (this._open !== l.id) {
            return html`<button class="row" @click=${() => this._expand(l)}>
              <i class="dot" style="background:${l.color}"></i>
              <span class="txt"><b>${labelName(this.hass, l)}</b><span class="sub">${actionText(this.hass, lang, l.action)} · ${t(lang, users > 1 ? "lb_uses_many" : "lb_uses", { n: String(users) })}</span></span>
              <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
          }
          const entities = this._entities(l);
          return html`<div class="editor">
            <div class="field"><label for="lbe-name">${t(lang, "lb_name")}</label>
              <input id="lbe-name" type="text" maxlength="30" .value=${this._name}
                @input=${(e: Event) => { this._name = (e.target as HTMLInputElement).value; this._error = ""; }} /></div>
            <div class="swatches" role="radiogroup" aria-label=${t(lang, "lb_color")}>
              ${PALETTE.map((c) => html`<button class="sw ${c === this._color ? "on" : ""}" role="radio" aria-checked=${c === this._color}
                aria-label=${c} style="background:${c}" @click=${() => (this._color = c)}></button>`)}
            </div>
            ${entities.length > 1 ? html`<div class="field"><label for="lbe-ent">${t(lang, "lb_device")}</label>
              <select id="lbe-ent" @change=${(e: Event) => (this._entity = (e.target as HTMLSelectElement).value)}>
                ${entities.map((e) => html`<option value=${e} ?selected=${e === this._entity}>${friendlyName(this.hass, e)}</option>`)}
              </select></div>` : nothing}
            <wp-action-picker .hass=${this.hass} entity-id=${this._entity} .action=${this._action}
              @action-change=${(e: CustomEvent<Action>) => { e.stopPropagation(); this._action = e.detail; this._error = ""; }}></wp-action-picker>
            ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
            <div class="btns">
              <button class="btn primary" ?disabled=${this._saving} @click=${() => void this._save(l)}>${t(lang, "save")}</button>
              <button class="btn" @click=${() => (this._open = null)}>${t(lang, "cancel")}</button>
            </div>
            <button class="btn danger-line alone" @click=${() => void this._delete(l)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete")}</button>
          </div>`;
        })}
      </div>
    </wp-dialog>`;
  }

  static styles = [editorStyles, css`
    :host { display: contents; }
    .list { display: flex; flex-direction: column; gap: 8px; }
    .row {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 12px; border-radius: 12px; text-align: left;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 16px;
      cursor: pointer; width: 100%; --mdc-icon-size: 22px;
    }
    .row .txt { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.3; }
    .row .sub { color: var(--secondary-text-color); font-size: 14px; }
    .dot { width: 16px; height: 16px; border-radius: 8px; flex: none; }
    .editor { border: 2px solid var(--primary-color); border-radius: 12px; padding: 12px; }
    .swatches { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 12px; }
    .sw { width: 40px; height: 40px; border-radius: 20px; border: 2px solid transparent; cursor: pointer; padding: 0; }
    .sw.on { border-color: var(--primary-text-color); box-shadow: 0 0 0 2px var(--card-background-color) inset; }
    .btns { display: flex; gap: 8px; margin-top: 12px; }
    .btns .btn { flex: 1; }
    .btn.alone { width: 100%; margin-top: 32px; }
    .btn.danger-line { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
    .err { color: var(--error-color, #db4437); margin: 8px 0 0; }
    .muted { color: var(--secondary-text-color); }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-labels": WpLabels;
  }
}
