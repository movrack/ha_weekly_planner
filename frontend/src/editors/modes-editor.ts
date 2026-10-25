// Modes library: one tab per entity type, list of modes, create / edit / delete.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/dialog";
import { t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import type { HomeAssistant, Mode, PlannerData, Setpoint } from "../types";
import "./setpoint-editor";
import { defaultSetpoint, describeSetpoint, editorStyles, langOf, modeTypeOf, typeLabel } from "./setpoint-editor";
import type { K } from "./setpoint-editor";

type Draft = Omit<Mode, "id"> & { id?: string };

const BASE_TYPES = ["climate", "cover", "light", "switch"];

@customElement("wp-modes-editor")
export class WpModesEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @state() private _type = "";
  @state() private _edit?: Draft;
  @state() private _rep = "";
  @state() private _error = "";
  @state() private _confirmId = "";
  @state() private _saving = false;

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  private _types(): string[] {
    const set = new Set<string>(BASE_TYPES);
    for (const m of this.data.modes) set.add(m.type);
    for (const p of this.data.programs) for (const e of p.entities) set.add(modeTypeOf(entityDomain(e.entity_id)));
    return [...set];
  }

  private get _current(): string {
    return this._type || this._types()[0];
  }

  private _users(modeId: string): number {
    return this.data.programs.filter(
      (p) =>
        p.profiles.some((profile) => profile.days.some((day) => day.some((s) => Object.values(s.actions.by_type).includes(modeId)))) ||
        p.entities.some((e) => e.default?.kind === "mode" && e.default.value === modeId),
    ).length;
  }

  private _domains(type: string): string[] {
    return type === "switch" ? ["switch", "input_boolean"] : [type];
  }

  /** Entities of a type, those used by programs first. */
  private _candidates(type: string): string[] {
    const domains = this._domains(type);
    const used = new Set(this.data.programs.flatMap((p) => p.entities.map((e) => e.entity_id)));
    return Object.keys(this.hass.states)
      .filter((id) => domains.includes(entityDomain(id)))
      .sort((a, b) => Number(used.has(b)) - Number(used.has(a)) || a.localeCompare(b))
      .slice(0, 300);
  }

  private _startEdit(mode?: Mode): void {
    const type = this._current;
    this._error = "";
    this._confirmId = "";
    if (mode) {
      this._edit = structuredClone(mode);
      this._rep = this._candidates(type)[0] ?? `${this._domains(type)[0]}.x`;
    } else {
      this._rep = this._candidates(type)[0] ?? `${this._domains(type)[0]}.x`;
      this._edit = { type, name: "", color: "#2196f3", icon: null, value: defaultSetpoint(this.hass, this._rep), exceptions: {} };
    }
  }

  private _patch(patch: Partial<Draft>): void {
    if (this._edit) this._edit = { ...this._edit, ...patch };
    this._error = "";
  }

  private _errorText(err: unknown): string {
    const e = err as { code?: string; message?: string };
    if (e?.code === "in_use") return this._tr("mode_in_use", { list: e.message ?? "" });
    if (e?.code === "unauthorized") return this._tr("err_unauthorized");
    return this._tr("error", { message: e?.message ?? String(err) });
  }

  private async _save(): Promise<void> {
    const draft = this._edit;
    if (!draft) return;
    if (!draft.name.trim()) {
      this._error = this._tr("err_name");
      return;
    }
    if (["scene", "script", "action"].includes(draft.value.kind)) {
      this._error = this._tr("err_incomplete");
      return;
    }
    this._saving = true;
    try {
      const mode: Draft = { ...draft, name: draft.name.trim() };
      if (!mode.icon) mode.icon = null;
      if (!mode.id) delete mode.id;
      await this.hass.callWS({ type: "weekly_planner/mode/save", mode });
      this._edit = undefined;
    } catch (err) {
      this._error = this._errorText(err);
    } finally {
      this._saving = false;
    }
  }

  private async _delete(id: string): Promise<void> {
    this._confirmId = "";
    try {
      await this.hass.callWS({ type: "weekly_planner/mode/delete", mode_id: id });
      this._error = "";
    } catch (err) {
      this._error = this._errorText(err);
    }
  }

  /* ---- render ---- */

  private _renderList() {
    const type = this._current;
    const modes = this.data.modes.filter((m) => m.type === type);
    const editable = this.data.can_edit && !this.data.read_only;
    return html`
      <div class="tabs" role="tablist">
        ${this._types().map((ty) => html`<button role="tab" aria-selected=${ty === type} class="tab ${ty === type ? "on" : ""}"
          @click=${() => { this._type = ty; this._error = ""; this._confirmId = ""; }}>${typeLabel(this._lang, ty)}</button>`)}
      </div>
      ${modes.length === 0 ? html`<p class="muted">${this._tr("no_modes")}</p>` : nothing}
      ${modes.map((m) => {
        const n = this._users(m.id);
        return html`
          <div class="mode">
            <span class="dot" style="background:${m.color}"></span>
            <div class="grow">
              <strong>${m.name}</strong>
              <div class="muted small">${describeSetpoint(this._lang, m.value)}${
                Object.keys(m.exceptions ?? {}).length ? ` · ${this._tr("mode_exceptions_n", { n: String(Object.keys(m.exceptions).length) })}` : ""}</div>
              <div class="muted small">${n === 0 ? this._tr("mode_unused") : this._tr(n === 1 ? "mode_used_one" : "mode_used_many", { n: String(n) })}</div>
            </div>
            ${this._confirmId === m.id
              ? html`<span class="small">${this._tr("confirm_delete", { name: m.name })}</span>
                  <button class="btn danger" @click=${() => void this._delete(m.id)}>${this._tr("delete")}</button>
                  <button class="btn" @click=${() => (this._confirmId = "")}>${this._tr("cancel")}</button>`
              : html`<button class="ibtn" ?disabled=${!editable} aria-label=${`${this._tr("edit")} ${m.name}`} @click=${() => this._startEdit(m)}>✏️</button>
                  <button class="ibtn" ?disabled=${!editable} aria-label=${`${this._tr("delete")} ${m.name}`} @click=${() => { this._confirmId = m.id; this._error = ""; }}>🗑</button>`}
          </div>`;
      })}
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
      <button class="btn" ?disabled=${!editable} @click=${() => this._startEdit()}>+ ${this._tr("mode_new")}</button>
    `;
  }

  private _renderForm(draft: Draft) {
    const type = draft.type;
    const domains = this._domains(type);
    const candidates = this._candidates(type);
    const rep = this._rep;
    const exceptions = Object.entries(draft.exceptions ?? {});
    const admin = false; // modes hold state setpoints only
    return html`
      <div class="field"><label for="m-name">${this._tr("mode_name")}</label>
        <input id="m-name" type="text" maxlength="40" .value=${draft.name}
          @input=${(e: Event) => this._patch({ name: (e.target as HTMLInputElement).value })} /></div>
      <div class="row">
        <div class="field" style="flex:0 0 auto"><label for="m-color">${this._tr("mode_color")}</label>
          <input id="m-color" type="color" .value=${draft.color || "#9e9e9e"}
            @input=${(e: Event) => this._patch({ color: (e.target as HTMLInputElement).value })} /></div>
        <div class="field"><label for="m-icon">${this._tr("pe_icon")}</label>
          <input id="m-icon" type="text" placeholder="mdi:sofa" .value=${draft.icon ?? ""}
            @input=${(e: Event) => this._patch({ icon: (e.target as HTMLInputElement).value.trim() || null })} /></div>
      </div>
      <h3>${this._tr("mode_value")}</h3>
      ${candidates.length
        ? html`<div class="field"><label>${this._tr("mode_rep_entity")}</label>
            <select @change=${(e: Event) => (this._rep = (e.target as HTMLSelectElement).value)}>
              ${candidates.map((id) => html`<option value=${id} ?selected=${id === rep}>${friendlyName(this.hass, id)}</option>`)}
            </select></div>`
        : nothing}
      <wp-setpoint-editor .hass=${this.hass} entity-id=${rep} .value=${draft.value} .admin=${admin} state-only
        @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ value: e.detail as Setpoint }); }}></wp-setpoint-editor>
      <h3>${this._tr("mode_exceptions")}</h3>
      <p class="hint">${this._tr("mode_exceptions_hint")}</p>
      ${exceptions.map(([eid, sp]) => html`
        <div class="card">
          <div class="row" style="flex-wrap:nowrap">
            <strong class="grow">${friendlyName(this.hass, eid)}</strong>
            <button class="ibtn" aria-label=${`${this._tr("delete")} ${friendlyName(this.hass, eid)}`}
              @click=${() => { const next = { ...draft.exceptions }; delete next[eid]; this._patch({ exceptions: next }); }}>🗑</button>
          </div>
          <wp-setpoint-editor .hass=${this.hass} entity-id=${eid} .value=${sp} state-only
            @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ exceptions: { ...draft.exceptions, [eid]: e.detail } }); }}></wp-setpoint-editor>
        </div>`)}
      <wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("mode_add_exception")} .domains=${domains}
        .exclude=${Object.keys(draft.exceptions ?? {})}
        @wp-change=${(e: CustomEvent) => {
          e.stopPropagation();
          if (e.detail) this._patch({ exceptions: { ...draft.exceptions, [e.detail]: structuredClone(draft.value) } });
        }}></wp-entity-picker>
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
    `;
  }

  render() {
    if (!this.data) return nothing;
    const draft = this._edit;
    return html`
      <wp-dialog open wide heading=${draft ? (draft.id ? this._tr("mode_edit") : this._tr("mode_new")) : this._tr("modes")}>
        ${draft ? this._renderForm(draft) : this._renderList()}
        ${draft
          ? html`<button slot="footer" class="btn" @click=${() => { this._edit = undefined; this._error = ""; }}>${this._tr("cancel")}</button>
              <button slot="footer" class="btn primary" ?disabled=${this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>`
          : html`<button slot="footer" class="btn" @click=${() => this.shadowRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close()}>${this._tr("close")}</button>`}
      </wp-dialog>`;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 44px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      .mode { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); flex-wrap: wrap; }
      .mode .dot { width: 20px; height: 20px; border-radius: 10px; }
    `,
  ];
}
