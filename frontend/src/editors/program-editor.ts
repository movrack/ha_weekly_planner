// Program settings: General / Devices / Seasons tabs. Works on a copy and only saves on "Save".
// The slots themselves are edited in the schedule screen.

import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "../components/dialog";
import { confirmAction } from "../components/confirm";
import { displayName, scrollHintCss, trackScrollHints } from "../components/gestures";
import { strings, t } from "../i18n";
import { ensureHaSelector, newId } from "../planner";
import { loadServiceNames, serviceDomains, servicesFor } from "../services";
import type { Condition, HomeAssistant, PlannerData, Profile, Program, ProgramEntity, Slot } from "../types";
import "./shared";
import { editorStyles, langOf } from "./shared";
import type { K } from "./shared";

type Tab = "general" | "entities" | "seasons";
type Closable = HTMLElement & { close(): void };

const EMPTY_DAYS = (): Slot[][] => [[], [], [], [], [], [], []];

function cloneSlots(slots: Slot[]): Slot[] {
  return slots.map((s) => ({ ...structuredClone(s), id: newId() }));
}

@customElement("wp-program-editor")
export class WpProgramEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program?: Program;
  @property({ attribute: false }) defaultTypes: string[] = [];

  @state() private _p!: Program;
  @state() private _isNew = true;
  @state() private _tab: Tab = "general";
  @state() private _profileId = "";
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _picker = Boolean(customElements.get("ha-selector"));

  connectedCallback(): void {
    super.connectedCallback();
    if (!this._picker) void ensureHaSelector().then((ok) => (this._picker = ok));
  }
  @state() private _profileForm?: { mode: "add" | "rename" | "copy"; name: string };
  private _ready = false;

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  private _long(d: number): string { return strings(this._lang).days[d]; }
  private _short(d: number): string { return strings(this._lang).days_short[d]; }

  /* ---- initial state ---- */

  willUpdate(changed: Map<string, unknown>): void {
    if (this._ready && !changed.has("program")) return;
    if (!this.hass || !this.data) return;
    this._ready = true;
    if (this.program) {
      this._p = structuredClone(this.program);
      this._isNew = false;
    } else {
      const pid = newId();
      this._p = {
        id: "", revision: 0, name: "", icon: "mdi:calendar-clock", priority: 10, enabled: true, reapply: true,
        conditions: [], entities: [], active_profile: pid,
        profiles: [{ id: pid, name: this._tr("profile_default"), days: EMPTY_DAYS() }],
      };
      this._isNew = true;
    }
    this._profileId = this._activeId();
    this._tab = "general";
  }

  private _activeId(): string {
    const p = this._p;
    const wanted = (!this._isNew && this.data.status[p.id]?.active_profile) || p.active_profile;
    return p.profiles.find((x) => x.id === wanted)?.id ?? p.profiles[0].id;
  }

  private get _profile(): Profile {
    return this._p.profiles.find((x) => x.id === this._profileId) ?? this._p.profiles[0];
  }

  private _patch(patch: Partial<Program>): void {
    this._p = { ...this._p, ...patch };
    this._error = "";
  }

  private _canEdit(): boolean {
    return this.data.can_edit && !this.data.read_only;
  }

  /* ---- profile / days ---- */

  private _setProfile(profile: Profile): void {
    this._patch({ profiles: this._p.profiles.map((x) => (x.id === profile.id ? profile : x)) });
  }

  private _submitProfileForm(): void {
    const form = this._profileForm;
    if (!form) return;
    const name = form.name.trim();
    const clash = this._p.profiles.some((x) => x.name === name && !(form.mode === "rename" && x.id === this._profileId));
    if (!name || clash || name.length > 40) {
      this._error = this._tr("err_profile_name");
      return;
    }
    if (form.mode === "rename") {
      this._setProfile({ ...this._profile, name });
    } else {
      const source = this._profile;
      const profile: Profile = {
        id: newId(), name,
        days: form.mode === "copy" ? source.days.map(cloneSlots) : EMPTY_DAYS(),
      };
      this._patch({ profiles: [...this._p.profiles, profile] });
      this._profileId = profile.id;
    }
    this._profileForm = undefined;
    this._error = "";
  }

  private _deleteProfile(): void {
    const profile = this._profile;
    const profiles = this._p.profiles.filter((x) => x.id !== profile.id);
    this._patch({ profiles });
    this._profileId = this._activeId();
    if (!profiles.some((x) => x.id === this._profileId)) this._profileId = profiles[0].id;
  }

  /* ---- entities ---- */

  private _setEntity(index: number, patch: Partial<ProgramEntity>): void {
    this._patch({ entities: this._p.entities.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }

  private _addEntity(entityId: string): void {
    if (!entityId || this._p.entities.some((e) => e.entity_id === entityId)) return;
    this._pickerKey += 1;
    this._patch({ entities: [...this._p.entities, { entity_id: entityId, default_label: null, label_overrides: {}, allowed_services: [] }] });
  }

  /* ---- save / delete ---- */

  private _validate(): string {
    const p = this._p;
    if (!p.name.trim()) return this._tr("err_name");
    if (!p.entities.length) return this._tr("err_no_entity");
    if (p.conditions.some((c) => !c.entity_id)) return this._tr("err_incomplete");
    const names = p.profiles.map((x) => x.name.trim());
    if (new Set(names).size !== names.length) return this._tr("err_profile_name");
    return "";
  }

  private _payload(): Program {
    const p = structuredClone(this._p);
    const ids = new Set(p.entities.map((e) => e.entity_id));
    p.name = p.name.trim();
    p.entities = p.entities.filter((e) => ids.has(e.entity_id));
    if (this._isNew) delete (p as Partial<Program>).id;
    return p;
  }

  private _errorText(err: unknown): string {
    const e = err as { code?: string; message?: string };
    const message = e?.message ?? String(err);
    if (e?.code === "conflict") return `${this._tr("conflict")} — ${this._tr("modified_elsewhere")}`;
    if (e?.code === "unauthorized") return this._tr("err_unauthorized");
    if (message.includes("overlapping_slots")) return this._tr("err_overlap_server");
    if (message.includes("duplicate_profile_name")) return this._tr("err_profile_name");
    return this._tr("error", { message });
  }

  private async _save(): Promise<void> {
    const problem = this._validate();
    if (problem) {
      this._error = problem;
      return;
    }
    this._saving = true;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: this._payload() });
      this._close();
    } catch (err) {
      this._error = this._errorText(err);
    } finally {
      this._saving = false;
    }
  }

  private async _askDelete(): Promise<void> {
    if (await confirmAction(this, this._tr("confirm_delete", { name: this._p.name }), this._tr("delete"))) await this._delete();
  }

  private async _askDeleteProfile(profile: Profile): Promise<void> {
    if (await confirmAction(this, this._tr("confirm_delete", { name: profile.name }), this._tr("delete"))) this._deleteProfile();
  }

  private async _askDeleteEntity(index: number): Promise<void> {
    const id = this._p.entities[index]?.entity_id;
    if (!id) return;
    const text = this._tr("confirm_delete", { name: displayName(this.hass, id) });
    if (await confirmAction(this, text, this._tr("delete"))) {
      this._patch({ entities: this._p.entities.filter((_, j) => j !== index) });
    }
  }

  private async _delete(): Promise<void> {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: this._p.id });
      this._close();
    } catch (err) {
      this._error = this._errorText(err);
    }
  }

  private _duplicate(): void {
    const pid = newId();
    const source = this._p;
    const ids = new Map<string, string>();
    const profiles = source.profiles.map((profile) => {
      const id = profile.id === this._activeId() ? pid : newId();
      ids.set(profile.id, id);
      return { ...structuredClone(profile), id, days: profile.days.map(cloneSlots) };
    });
    this._p = {
      ...structuredClone(source), id: "", revision: 0, created_at: undefined,
      name: `${source.name} ${this._tr("copy_suffix")}`.slice(0, 60),
      profiles, active_profile: ids.get(this._activeId()) ?? profiles[0].id,
    };
    delete this._p.created_at;
    this._isNew = true;
    this._profileId = this._p.active_profile ?? profiles[0].id;
    this._error = "";
  }

  private _close(): void {
    this.renderRoot.querySelector<Closable>("#main")?.close();
  }

  /* ---- render: tabs ---- */

  private _renderGeneral() {
    const p = this._p;
    return html`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${p.name}
          @input=${(e: Event) => this._patch({ name: (e.target as HTMLInputElement).value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker
            ? html`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${p.icon ?? ""}
                @value-changed=${(e: CustomEvent<{ value?: string }>) => this._patch({ icon: e.detail.value || null })}></ha-selector>`
            : html`<div class="row" style="flex-wrap:nowrap">
                ${p.icon && customElements.get("ha-icon") ? html`<ha-icon .icon=${p.icon}></ha-icon>` : nothing}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${p.icon ?? ""}
                  @input=${(e: Event) => this._patch({ icon: (e.target as HTMLInputElement).value.trim() || null })} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(p.priority)}
            @change=${(e: Event) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number((e.target as HTMLInputElement).value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${p.reapply}
        @change=${(e: Event) => this._patch({ reapply: (e.target as HTMLInputElement).checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      <h3>${this._tr("pe_conditions")}</h3>
      <p class="hint">${this._tr("pe_conditions_hint")}</p>
      <wp-conditions-editor .hass=${this.hass} .conditions=${p.conditions as Condition[]}
        @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._patch({ conditions: e.detail }); }}></wp-conditions-editor>
    `;
  }

  private _pickerKey = 0;

  updated(): void {
    trackScrollHints(this.renderRoot.querySelector<HTMLElement>(".tabs"));
  }

  private _renderEntities() {
    const p = this._p;
    return html`
      ${p.entities.length === 0 ? html`<p class="muted">${this._tr("pe_no_entity")}</p>` : nothing}
      ${p.entities.map((e, i) => this._renderEntity(e, i))}
      ${keyed(this._pickerKey, this._picker
        ? html`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: p.entities.map((x) => x.entity_id) } }}
            .label=${this._tr("pe_add_entity")} .value=${""}
            @value-changed=${(ev: CustomEvent<{ value?: string }>) => { ev.stopPropagation(); this._addEntity(ev.detail.value ?? ""); }}></ha-selector>`
        : html`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .exclude=${p.entities.map((x) => x.entity_id)}
        @wp-change=${(ev: CustomEvent) => { ev.stopPropagation(); this._addEntity(ev.detail); }}></wp-entity-picker>`)}
    `;
  }

  @state() private _servicesOpen = "";

  /** Checklist of the services offered for a device (all checked or none: all are offered). */
  private _renderServices(e: ProgramEntity, index: number) {
    const all = servicesFor(this.hass, e.entity_id);
    if (!all.length) return nothing;
    const allowed = e.allowed_services ?? [];
    const on = (id: string) => !allowed.length || allowed.includes(id);
    const count = all.filter((s) => on(s.id)).length;
    const open = this._servicesOpen === e.entity_id;
    const toggle = (id: string, checked: boolean) => {
      const next = all.map((s) => s.id).filter((x) => (x === id ? checked : on(x)));
      if (!next.length) return;
      this._setEntity(index, { allowed_services: next.length === all.length ? [] : next });
    };
    return html`
      <button class="link" aria-expanded=${open} @click=${() => (this._servicesOpen = open ? "" : e.entity_id)}>
        <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${count === all.length ? this._tr("pe_services_all") : `${count}/${all.length}`}</button>
      ${open ? html`<div class="svc">${all.map((s) => html`<label class="check"><input type="checkbox" .checked=${on(s.id)}
        ?disabled=${on(s.id) && count === 1} @change=${(ev: Event) => toggle(s.id, (ev.target as HTMLInputElement).checked)} /> ${s.label}</label>`)}</div>` : nothing}`;
  }

  private _renderEntity(e: ProgramEntity, index: number) {
    void loadServiceNames(this.hass, serviceDomains(this.hass, e.entity_id)).then((ok) => ok && this.requestUpdate());
    return html`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${displayName(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? nothing : html`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${displayName(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(index)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${this._renderServices(e, index)}
      </div>`;
  }

  private _renderSeasons() {
    const p = this._p;
    const profile = this._profile;
    const active = this._activeId();
    const form = this._profileForm;
    return html`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(e: Event) => { this._profileId = (e.target as HTMLSelectElement).value; }}>
            ${p.profiles.map((x) => html`<option value=${x.id} ?selected=${x.id === profile.id}>${x.name}${x.id === active ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
        <button class="ibtn" aria-label=${this._tr("profile_add")} title=${this._tr("profile_add")}
          @click=${() => (this._profileForm = { mode: "add", name: "" })}><ha-icon icon="mdi:plus"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_rename")} title=${this._tr("profile_rename")}
          @click=${() => (this._profileForm = { mode: "rename", name: profile.name })}><ha-icon icon="mdi:pencil"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_copy")} title=${this._tr("profile_copy")}
          @click=${() => (this._profileForm = { mode: "copy", name: `${profile.name} ${this._tr("copy_suffix")}`.slice(0, 40) })}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        <button class="ibtn" aria-label=${this._tr("profile_delete")} title=${this._tr("profile_delete")}
          ?disabled=${p.profiles.length < 2 || profile.id === active}
          @click=${() => void this._askDeleteProfile(profile)}><ha-icon icon="mdi:delete"></ha-icon></button>
      </div>
      ${profile.id === active ? html`<p class="hint"><ha-icon icon="mdi:star"></ha-icon> ${this._tr("profile_active_hint")}</p>` : nothing}
      ${form
        ? html`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(form.mode === "rename" ? "profile_rename" : form.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${form.name}
                @input=${(e: Event) => (this._profileForm = { ...form, name: (e.target as HTMLInputElement).value })}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") this._submitProfileForm(); }} /></div>
            ${form.mode === "rename" ? html`<p class="hint">${this._tr("profile_rename_warning")}</p>` : nothing}
            <div class="row"><button class="btn primary" @click=${() => this._submitProfileForm()}>${this._tr("ok")}</button>
              <button class="btn" @click=${() => (this._profileForm = undefined)}>${this._tr("cancel")}</button></div>
          </div>`
        : nothing}
    `;
  }

  render() {
    if (!this._p) return nothing;
    const tabs: [Tab, K][] = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]];
    const editable = this._canEdit();
    return html`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${!editable ? html`<p class="error" role="alert">${this._tr("read_only")}</p>` : nothing}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${tabs.map(([id, label]) => html`<button role="tab" aria-selected=${this._tab === id} class="tab ${this._tab === id ? "on" : ""}"
            @click=${() => (this._tab = id)}>${this._tr(label)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>
        ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
        ${!this._isNew
          ? html`<button slot="footer" class="btn" @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>`
          : nothing}
        <button slot="footer" class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!editable || this._saving} @click=${() => void this._save()}>${this._tr("save")}</button>
        ${!this._isNew
          ? html`<span slot="footer" class="break" aria-hidden="true"></span>
            <button slot="footer" class="btn danger del" ?disabled=${!editable}
              @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon> ${this._tr("delete")}</button>`
          : nothing}
      </wp-dialog>
    `;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--divider-color); margin-bottom: 8px; overflow-x: auto; }
      .tab {
        min-height: 48px; padding: 0 16px; border: none; background: none; color: var(--secondary-text-color);
        border-bottom: 3px solid transparent; cursor: pointer; white-space: nowrap;
      }
      .tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: 600; }
      ${unsafeCSS(scrollHintCss)}
      .link {
        display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0; border: none; background: none;
        color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
      }
      .svc { display: flex; flex-direction: column; padding-left: 8px; }
      .break { display: none; }
      @media (max-width: 520px) {
        .break { display: block; order: 3; flex: 1 0 100%; height: 0; }
        .del { order: 4; margin-right: auto; }
      }
      @media (min-width: 521px) { .del { order: -1; margin-right: auto; } }
      .profile-bar { align-items: flex-end; gap: 4px; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `,
  ];
}
