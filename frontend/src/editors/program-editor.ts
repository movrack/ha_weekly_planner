// Program settings: General / Devices / Seasons tabs. Works on a copy and only saves on "Save".
// The slots themselves are edited in the schedule screen.

import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { syncSelectValues } from "../select-value";
import { DraftHistory } from "../draft-history";
import { defaultEntityIcon } from "../icons";
import { mergeProgramSettings } from "../program-settings";
import { keyed } from "lit/directives/keyed.js";
import "../components/dialog";
import "../components/schedule-dialog";
import { confirmAction } from "../components/confirm";
import { displayName, scrollHintCss, trackScrollHints } from "../components/gestures";
import { strings, t } from "../i18n";
import { ensureHaSelector, newId } from "../planner";
import { loadServiceNames, serviceDomains, serviceDescription, serviceLabel, servicesFor } from "../services";
import type { Condition, HomeAssistant, PlannerData, Profile, Program, ProgramEntity, Slot } from "../types";
import "./shared";
import { editorStyles, langOf } from "./shared";
import type { K } from "./shared";

type Tab = "general" | "entities" | "seasons";
type ProfileForm = { mode: "add" | "rename" | "copy"; name: string };
interface EditorSnapshot {
  program: Program;
  origin?: Program;
  isNew: boolean;
  iconCustomized: boolean;
  profileId: string;
  profileForm?: ProfileForm;
}
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
  @property({ type: Boolean }) embedded = false;
  private _origin?: Program;
  private _iconCustomized = false;
  @state() private _applied = false;
  @property({ attribute: false }) defaultTypes: string[] = [];

  @state() private _p!: Program;
  @state() private _isNew = true;
  @state() private _tab: Tab = "general";
  @state() private _profileId = "";
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _changingMode = false;
  @state() private _associationsOpen = false;
  @state() private _scheduleProfileId: string | null = null;
  private _hoursRevision = 0;
  @state() private _picker = Boolean(customElements.get("ha-selector"));

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._historyKey);
    if (!this._picker) void ensureHaSelector().then((ok) => (this._picker = ok));
  }
  @state() private _profileForm?: { mode: "add" | "rename" | "copy"; name: string };
  private _ready = false;
  private _history = new DraftHistory<EditorSnapshot>();
  private _editingHistory = false;
  private _iconEpoch = 0;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("keydown", this._historyKey);
  }

  private _snapshot(): EditorSnapshot {
    return structuredClone({ program: this._p, origin: this._origin, isNew: this._isNew,
      iconCustomized: this._iconCustomized, profileId: this._profileId, profileForm: this._profileForm });
  }

  /** One semantic edit can update several fields without creating partial undo steps. */
  private _edit(change: () => void, group?: string): void {
    if (this._editingHistory) { change(); return; }
    const before = this._snapshot();
    this._editingHistory = true;
    try { change(); } finally { this._editingHistory = false; }
    this._history.record(before, this._snapshot(), group);
    this.requestUpdate();
  }

  private _restore(snapshot: EditorSnapshot): void {
    this._p = snapshot.program;
    this._origin = snapshot.origin;
    this._isNew = snapshot.isNew;
    this._iconCustomized = snapshot.iconCustomized;
    this._profileId = snapshot.profileId;
    this._profileForm = snapshot.profileForm;
    this._error = "";
    this._applied = false;
    this._refreshIcon();
  }

  private _undoDraft(): void {
    if (!this._canEdit() || this._saving) return;
    const snapshot = this._history.undo(this._snapshot());
    if (snapshot) this._restore(snapshot);
  }

  private _redoDraft(): void {
    if (!this._canEdit() || this._saving) return;
    const snapshot = this._history.redo(this._snapshot());
    if (snapshot) this._restore(snapshot);
  }

  private _historyKey = (event: KeyboardEvent): void => {
    if (event.defaultPrevented || event.altKey || !(event.ctrlKey || event.metaKey) || !this._p || this._saving || !this._canEdit()) return;
    // Text fields keep the browser's native typing undo, including inputs inside HA selectors.
    if (event.composedPath().some((node) => node instanceof HTMLElement
      && (node.tagName === "INPUT" || node.tagName === "TEXTAREA" || node.isContentEditable))) return;
    const key = event.key.toLowerCase();
    const redo = (key === "z" && event.shiftKey) || key === "y";
    if (!(key === "z" || key === "y")) return;
    event.preventDefault();
    event.stopPropagation();
    if (redo) this._redoDraft(); else this._undoDraft();
  };

  private _changeProfileForm(form: ProfileForm | undefined, group?: string): void {
    this._edit(() => { this._profileForm = form; this._applied = false; this._error = ""; }, group);
  }

  private _refreshIcon(): void {
    const epoch = ++this._iconEpoch;
    const entityId = this._p.entities[0]?.entity_id;
    if (this._iconCustomized || !entityId) return;
    void defaultEntityIcon(this.hass, entityId).then((icon) => {
      if (epoch !== this._iconEpoch || this._iconCustomized || this._p.entities[0]?.entity_id !== entityId) return;
      // Derived metadata is part of the device edit, never a separate history step.
      this._p = { ...this._p, icon };
    });
  }

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  private _long(d: number): string { return strings(this._lang).days[d]; }
  private _short(d: number): string { return strings(this._lang).days_short[d]; }

  /* ---- initial state ---- */

  willUpdate(): void {
    if (this._ready) return;
    if (!this.hass || !this.data) return;
    this._ready = true;
    this._origin = this.program ? structuredClone(this.program) : undefined;
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
    this._iconCustomized = Boolean(this.program?.icon && this.program.icon !== this._deviceIcon(this.program.entities[0]?.entity_id));
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

  private _deviceIcon(entityId?: string): string {
    const icon: unknown = entityId ? this.hass.states[entityId]?.attributes.icon : undefined;
    return typeof icon === "string" && icon.startsWith("mdi:") ? icon : "mdi:calendar-clock";
  }

  private _setIcon(icon: string | null): void {
    this._edit(() => {
      this._iconCustomized = Boolean(icon);
      this._patch({ icon: icon || this._deviceIcon(this._p.entities[0]?.entity_id) });
    }, "icon");
    this._refreshIcon();
  }

  private _patch(patch: Partial<Program>, group?: string): void {
    this._edit(() => {
      if (patch.entities && !this._iconCustomized) patch = { ...patch, icon: this._deviceIcon(patch.entities[0]?.entity_id) };
      this._p = { ...this._p, ...patch };
      this._error = "";
      this._applied = false;
    }, group);
    if (patch.entities) this._refreshIcon();
  }

  private _canEdit(): boolean {
    return this.data.can_edit && !this.data.read_only;
  }

  /* ---- profile / days ---- */

  private _setProfile(profile: Profile): void {
    this._patch({ profiles: this._p.profiles.map((x) => (x.id === profile.id ? profile : x)) });
  }

  private _submitProfileForm(): boolean {
    const form = this._profileForm;
    if (!form) return true;
    const name = form.name.trim();
    const clash = this._p.profiles.some((x) => x.name === name && !(form.mode === "rename" && x.id === this._profileId));
    if (!name || clash || name.length > 40) {
      this._error = this._tr("err_profile_name");
      return false;
    }
    this._edit(() => {
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
    });
    return true;
  }

  private _deleteProfile(): void {
    this._edit(() => {
      const profile = this._profile;
      const profiles = this._p.profiles.filter((x) => x.id !== profile.id);
      const source = this._p.mode_source;
      this._patch({ profiles, ...(source ? { mode_source: { ...source, mappings: Object.fromEntries(Object.entries(source.mappings).filter(([, id]) => id !== profile.id)) } } : {}) });
      this._profileId = this._activeId();
      if (!profiles.some((x) => x.id === this._profileId)) this._profileId = profiles[0].id;
    });
  }

  /* ---- entities ---- */

  private _setEntity(index: number, patch: Partial<ProgramEntity>): void {
    this._patch({ entities: this._p.entities.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }

  private _addEntity(entityId: string): void {
    if (!entityId || this._p.entities.some((e) => e.entity_id === entityId)) return;
    this._pickerKey += 1;
    this._servicesOpen = entityId;
    this._patch({ entities: [...this._p.entities, { entity_id: entityId, default_label: null, label_overrides: {}, allowed_services: [], restrict_services: true }] });
  }

  /* ---- save / delete ---- */

  private _validate(): string {
    const p = this._p;
    if (!p.name.trim()) return this._tr("err_name");
    if (!p.entities.length) return this._tr("err_no_entity");
    if (p.mode_source && (!p.mode_source.entity_id || !Object.keys(p.mode_source.mappings).length || Object.entries(p.mode_source.mappings).some(([state, id]) => !state.trim() || !p.profiles.some((mode) => mode.id === id)))) return this._tr("mode_incomplete");
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
    if (message.includes("random_window_too_short")) return this._tr("random_too_short");
    if (message.includes("overlapping_slots")) return this._tr("err_overlap_server");
    if (message.includes("circular_mode_source")) return this._tr("mode_source_loop");
    if (message.includes("controlled by an external")) return this._tr("mode_source_locked");
    if (message.includes("unknown_mode_profile")) return this._tr("mode_incomplete");
    if (message.includes("duplicate_profile_name")) return this._tr("err_profile_name");
    return this._tr("error", { message });
  }

  private async _save(): Promise<void> {
    if (!this._canEdit() || this._saving) return;
    if (!this._submitProfileForm()) return;
    const problem = this._validate();
    if (problem) {
      if (this._p.mode_source) this._associationsOpen = true;
      this._error = problem;
      return;
    }
    this._saving = true;
    try {
      const draft = this._payload();
      let saved: Program | undefined;
      for (let attempt = 0; attempt < 2; attempt++) {
        const fresh = await this.hass.callWS<PlannerData>({ type: "weekly_planner/get" });
        const live = fresh.programs.find((p) => p.id === draft.id);
        if (this._origin && !live) throw { code: "conflict" };
        let payload = draft;
        if (this._origin && live) {
          try { payload = mergeProgramSettings(this._origin, draft, live); }
          catch { throw { code: "conflict" }; }
        }
        try {
          const result = await this.hass.callWS<{ program: Program }>({ type: "weekly_planner/program/save", program: payload });
          saved = result.program;
          break;
        } catch (err) {
          if (attempt || (err as { code?: string }).code !== "conflict") throw err;
        }
      }
      if (saved) {
        this._p = structuredClone(saved);
        this._origin = structuredClone(saved);
        this._isNew = false;
        this._applied = true;
        ++this._iconEpoch;
        this._history.clear();
        this.dispatchEvent(new CustomEvent("program-saved", { detail: saved, bubbles: true, composed: true }));
      }
      if (!this.embedded) this._close();
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
      this.dispatchEvent(new CustomEvent("program-deleted", { detail: this._p.id, bubbles: true, composed: true }));
      this._close();
    } catch (err) {
      this._error = this._errorText(err);
    }
  }

  private _duplicate(): void {
    this._edit(() => {
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
        ...(source.mode_source ? { mode_source: { ...source.mode_source, mappings: Object.fromEntries(Object.entries(source.mode_source.mappings).map(([state, id]) => [state, ids.get(id) ?? id])) } } : {}),
      };
      delete this._p.created_at;
      this._isNew = true;
      this._origin = undefined;
      this._applied = false;
      this._profileId = this._p.active_profile ?? profiles[0].id;
      this._error = "";
    });
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
          @input=${(e: Event) => this._patch({ name: (e.target as HTMLInputElement).value }, "name")} /></div>
      <div class="field"><label for="f-area">${this._tr("pe_area")}</label>
        <input id="f-area" type="text" list="program-areas" .value=${p.area ?? ""} aria-describedby="program-area-help"
          @change=${(e: Event) => this._patch({ area: (e.target as HTMLInputElement).value.trim() || null })} />
        <datalist id="program-areas">${[...new Set(this.data.programs.flatMap((program) => program.area ? [program.area] : []))].sort().map((area) => html`<option value=${area}></option>`)}</datalist>
        <p id="program-area-help" class="hint">${this._tr("pe_area_hint")}</p></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          ${this._picker
            ? html`<ha-selector id="f-icon" .hass=${this.hass} .selector=${{ icon: {} }} .value=${p.icon ?? ""}
                @value-changed=${(e: CustomEvent<{ value?: string }>) => this._setIcon(e.detail.value || null)}></ha-selector>`
            : html`<div class="row" style="flex-wrap:nowrap">
                ${p.icon && customElements.get("ha-icon") ? html`<ha-icon .icon=${p.icon}></ha-icon>` : nothing}
                <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${p.icon ?? ""}
                  @input=${(e: Event) => this._setIcon((e.target as HTMLInputElement).value.trim() || null)} />
              </div>`}</div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(p.priority)}
            @change=${(e: Event) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number((e.target as HTMLInputElement).value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_icon_hint")}</p>
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
    syncSelectValues(this.renderRoot);
    trackScrollHints(this.renderRoot.querySelector<HTMLElement>(".tabs"));
  }

  private _renderEntities(compact = false) {
    const p = this._p;
    return html`
      ${p.entities.length === 0 ? html`<p class="muted">${this._tr("pe_no_entity")}</p>` : nothing}
      ${p.entities.map((e, i) => this._renderEntity(e, i, compact))}
      ${keyed(this._pickerKey, this._picker
        ? html`<ha-selector .hass=${this.hass} .selector=${{ entity: { exclude_entities: p.entities.map((x) => x.entity_id) } }}
            .label=${this._tr(p.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .value=${""} .required=${!p.entities.length}
            @value-changed=${(ev: CustomEvent<{ value?: string }>) => { ev.stopPropagation(); this._addEntity(ev.detail.value ?? ""); }}></ha-selector>`
        : html`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr(p.entities.length ? "pe_add_another_entity" : "pe_add_entity")} .required=${!p.entities.length}
        .exclude=${p.entities.map((x) => x.entity_id)}
        @wp-change=${(ev: CustomEvent) => { ev.stopPropagation(); this._addEntity(ev.detail); }}></wp-entity-picker>`)}
    `;
  }

  @state() private _servicesOpen = "";

  /** New devices require an explicit choice; legacy unrestricted devices keep their existing behavior. */
  private _renderServices(e: ProgramEntity, index: number) {
    const choices = new Map(servicesFor(this.hass, e.entity_id).map((s) => [s.id, s]));
    // Retain configured choices even when their target/service disappears, including explicit label targets.
    const configured = [...this.data.labels.map((label) => label.action), ...Object.values(e.label_overrides ?? {})];
    const extra = [...(e.allowed_services ?? []), ...configured.flatMap((action) => action.kind === "service" && action.target_entity_id ? [action.service] : [])];
    for (const id of extra) if (!choices.has(id)) {
      const [domain, service] = id.split(".");
      choices.set(id, { id, domain, service, label: serviceLabel(this.hass, id) });
    }
    const all = [...choices.values()].sort((a, b) => a.label.localeCompare(b.label));
    if (!all.length) return html`<p class="hint">${this._tr("pe_no_services")}</p>`;
    const allowed = e.allowed_services ?? [];
    const unrestricted = !e.restrict_services && !allowed.length;
    const on = (id: string) => unrestricted || allowed.includes(id);
    const count = all.filter((s) => on(s.id)).length;
    const open = this._isNew || this._servicesOpen === e.entity_id;
    const toggle = (id: string, checked: boolean) => {
      const next = new Set(unrestricted ? all.map((s) => s.id) : allowed);
      if (checked) next.add(id); else next.delete(id);
      this._setEntity(index, { allowed_services: [...next], restrict_services: true });
    };
    return html`
      ${this._isNew ? html`<h3>${this._tr("pe_services")} · ${count}/${all.length}</h3>` : html`
        <button class="link" aria-expanded=${open} @click=${() => (this._servicesOpen = open ? "" : e.entity_id)}>
          <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${this._tr("pe_services")} · ${count === all.length ? this._tr("pe_services_all") : `${count}/${all.length}`}</button>`}
      ${count === 0 && e.restrict_services ? html`<p class="hint" role="status">${this._tr("pe_zero_services")}</p>` : nothing}
      ${open ? html`<p class="hint">${this._tr("pe_choose_services")}</p><div class="svc">${all.map((s) => {
        const description = serviceDescription(this.hass, s.id);
        const nameId = `svc-name-${index}-${s.id}`;
        const descId = `svc-description-${index}-${s.id}`;
        return html`<label class="check svc-choice"><input type="checkbox" .checked=${on(s.id)}
          aria-labelledby=${nameId} aria-describedby=${description ? descId : nothing}
          @change=${(ev: Event) => toggle(s.id, (ev.target as HTMLInputElement).checked)} />
          <span class="svc-copy"><span id=${nameId}>${s.label}</span>
            ${description ? html`<span id=${descId} class="svc-description">${description}</span>` : nothing}
          </span></label>`;
      })}</div>` : nothing}`;
  }

  private _renderEntity(e: ProgramEntity, index: number, compact = false) {
    void loadServiceNames(this.hass, serviceDomains(this.hass, e.entity_id)).then((ok) => ok && this.requestUpdate());
    const otherPrograms = this.data.programs
      .filter((program) => program.id !== this._p.id && program.entities.some((entity) => entity.entity_id === e.entity_id))
      .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))
      .map((program) => this._tr("pe_program_priority", { name: program.name, priority: String(program.priority) }));
    return html`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${displayName(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? nothing : html`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${displayName(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(index)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        ${otherPrograms.length ? html`<p class="hint" role="status">${this._tr("pe_other_programs", { programs: otherPrograms.join(", ") })}</p>` : nothing}
        ${this._renderServices(e, index)}
      </div>`;
  }

  private get _seasonsUnapplied(): boolean {
    return Boolean(this._profileForm) || !this._origin || JSON.stringify(this._p.profiles) !== JSON.stringify(this._origin.profiles) || JSON.stringify(this._p.mode_source) !== JSON.stringify(this._origin.mode_source);
  }

  private async _changeActiveMode(profileId: string, input?: HTMLSelectElement): Promise<void> {
    if (this._changingMode || this._seasonsUnapplied || this._origin?.mode_source) return;
    this._changingMode = true;
    this._error = "";
    try {
      await this.hass.callWS({ type: "weekly_planner/program/set_profile", program_id: this._p.id, profile_id: profileId });
    } catch (err) { this._error = this._errorText(err); }
    finally { this._changingMode = false; if (input) input.value = this._activeId(); }
  }

  private _closeModeSchedule(): void {
    this._scheduleProfileId = null;
    const live = this.data.programs.find((p) => p.id === this._p.id);
    if (live) this._adoptModeSchedule(live);
  }

  private _adoptModeSchedule(program: Program): void {
    if (program.id !== this._p.id || program.revision < this._hoursRevision) return;
    this._hoursRevision = program.revision;
    // Schedule saves are already applied; keep draft settings while adopting their fresh hours.
    this._p = { ...this._p, profiles: structuredClone(program.profiles) };
    if (this._origin) this._origin = { ...this._origin, profiles: structuredClone(program.profiles) };
  }

  private _sourceState(old: string, state: string): void {
    const source = this._p.mode_source;
    if (!source || old === state) return;
    if (Object.prototype.hasOwnProperty.call(source.mappings, state)) { this._error = this._tr("mode_duplicate_state"); return; }
    const mappings = Object.fromEntries(Object.entries(source.mappings).map(([key, value]) => [key === old ? state : key, value]));
    this._patch({ mode_source: { ...source, mappings } });
  }

  private _renderModeSource() {
    const source = this._p.mode_source;
    const state = source ? this.hass.states[source.entity_id] : undefined;
    const live = this.data.status[this._p.id];
    const activeName = this._p.profiles.find((p) => p.id === this._activeId())?.name ?? "";
    const options = [...new Set([...(Array.isArray(state?.attributes.options) ? state.attributes.options as string[] : []),
      ...(state && !["unknown", "unavailable"].includes(state.state) ? [state.state] : []), ...Object.keys(source?.mappings ?? {})])];
    return html`<div class="field"><label for="mode-control">${this._tr("mode_control")}</label>
      <select id="mode-control" .value=${source ? "external" : "manual"}
        @change=${(e: Event) => { this._associationsOpen = true; this._patch({ mode_source: (e.target as HTMLSelectElement).value === "external" ? { entity_id: "", mappings: {} } : undefined }); }}>
        <option value="manual">${this._tr("mode_manual")}</option><option value="external">${this._tr("mode_external")}</option>
      </select></div>
      ${source ? html`<wp-entity-picker .hass=${this.hass} .value=${source.entity_id} .label=${this._tr("mode_source_entity")}
        @wp-change=${(e: CustomEvent<string>) => { e.stopPropagation(); if (e.detail !== source.entity_id) { this._associationsOpen = true; this._patch({ mode_source: { entity_id: e.detail, mappings: {} } }); } }}></wp-entity-picker>
        <p class="hint">${this._tr("mode_source_hint")}</p>
        ${source.entity_id ? html`
          <p class="hint">${this._tr("mode_source_current", { state: state ? (this.hass.formatEntityState?.(state) ?? state.state) : this._tr("value_unavailable") })}</p>
          <details class="mode-associations" .open=${this._associationsOpen}
            @toggle=${(e: Event) => { this._associationsOpen = (e.currentTarget as HTMLDetailsElement).open; }}>
            <summary>${this._tr("mode_association_count", { n: String(Object.keys(source.mappings).length) })}</summary>
          ${Object.entries(source.mappings).map(([key, profileId], index) => html`<div class="card mode-mapping">
            ${this._picker ? html`<ha-selector .hass=${this.hass} .selector=${{ state: { entity_id: source.entity_id } }}
              .value=${key || undefined} .label=${this._tr("mode_source_state")}
              @value-changed=${(e: CustomEvent<{ value?: string }>) => { e.stopPropagation(); this._sourceState(key, e.detail.value ?? ""); }}></ha-selector>`
              : html`<div class="field"><label for=${`mode-state-${index}`}>${this._tr("mode_source_state")}</label>
                <input id=${`mode-state-${index}`} list="mode-state-values" .value=${key}
                  @change=${(e: Event) => this._sourceState(key, (e.target as HTMLInputElement).value)} /></div>`}
            <div class="field"><label for=${`mode-target-${index}`}>${this._tr("mode_source_target")}</label>
              <select id=${`mode-target-${index}`} data-value=${profileId} @change=${(e: Event) => this._patch({ mode_source: { ...source, mappings: { ...source.mappings, [key]: (e.target as HTMLSelectElement).value } } })}>
                ${!this._p.profiles.some((p) => p.id === profileId) ? html`<option value=${profileId}>${this._tr("mode_removed")}</option>` : nothing}
                ${this._p.profiles.map((p) => html`<option value=${p.id}>${p.name}</option>`)}
              </select></div>
            <button class="btn danger" aria-label=${this._tr("mode_remove_mapping")} @click=${() => this._patch({ mode_source: { ...source, mappings: Object.fromEntries(Object.entries(source.mappings).filter(([k]) => k !== key)) } })}>
              <ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>
          </div>`)}
          <datalist id="mode-state-values">${options.map((value) => html`<option value=${value}></option>`)}</datalist>
          <button class="btn" ?disabled=${Object.prototype.hasOwnProperty.call(source.mappings, "")} @click=${() => this._patch({ mode_source: { ...source, mappings: { ...source.mappings, "": this._profileId } } })}>
            <ha-icon icon="mdi:plus"></ha-icon>${this._tr("mode_add_mapping")}</button>
          </details>
        ` : nothing}
        ${!this._seasonsUnapplied && live?.mode_source_status && live.mode_source_status !== "matched" ? html`<p class="hint" role="status">${this._tr("mode_source_kept", { name: activeName })}</p>` : nothing}
      ` : !this._isNew ? html`<section class="mode-live"><div class="field"><label for="mode-active">${this._tr("mode_active_immediate")}</label>
        <select id="mode-active" data-value=${this._activeId()} aria-describedby="mode-live-help" ?disabled=${this._seasonsUnapplied || this._changingMode}
          @change=${(e: Event) => void this._changeActiveMode((e.target as HTMLSelectElement).value, e.target as HTMLSelectElement)}>
          ${this._p.profiles.map((p) => html`<option value=${p.id}>${p.name}</option>`)}
        </select></div><p id="mode-live-help" class="hint">${this._tr("mode_active_immediate_hint")}</p></section>` : nothing}`;
  }

  private _renderSeasons() {
    const p = this._p;
    const profile = this._profile;
    const active = this._activeId();
    const form = this._profileForm;
    return html`
      <p class="hint">${this._tr("profile_explanation")}</p>
      ${!this._isNew ? html`<p class="active-profile" role="status"><ha-icon icon="mdi:star"></ha-icon>
        ${this._tr("profile_current", { name: this._origin?.profiles.find((x) => x.id === active)?.name ?? profile.name })}</p>` : nothing}
      ${this._renderModeSource()}
      ${this._seasonsUnapplied ? html`<p class="hint">${this._tr("profile_apply_first")}</p>` : nothing}
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile_manage")}</label>
          <select id="f-profile" data-value=${profile.id} ?disabled=${Boolean(form)} @change=${(e: Event) => { this._profileId = (e.target as HTMLSelectElement).value; }}>
            ${p.profiles.map((x) => html`<option value=${x.id} ?selected=${x.id === profile.id}>${x.name}${x.id === active ? ` (${this._tr("profile_active")})` : ""}</option>`)}
          </select></div>
      </div>
      <p class="hint">${this._tr("profile_draft_hint")}</p>
      <button class="btn" ?disabled=${this._seasonsUnapplied} @click=${() => { this._scheduleProfileId = profile.id; }}>
        <ha-icon icon="mdi:calendar-edit"></ha-icon>${this._tr("mode_edit_hours")}</button>
      <div class="row season-actions">
        <button class="btn" ?disabled=${Boolean(form)}
          @click=${() => this._changeProfileForm({ mode: "add", name: "" })}><ha-icon icon="mdi:plus"></ha-icon>${this._tr("profile_add")}</button>
        <button class="btn" ?disabled=${Boolean(form)}
          @click=${() => this._changeProfileForm({ mode: "rename", name: profile.name })}><ha-icon icon="mdi:pencil"></ha-icon>${this._tr("profile_rename")}</button>
        <button class="btn" ?disabled=${Boolean(form)}
          @click=${() => this._changeProfileForm({ mode: "copy", name: `${profile.name} ${this._tr("copy_suffix")}`.slice(0, 40) })}><ha-icon icon="mdi:content-copy"></ha-icon>${this._tr("profile_copy")}</button>
      </div>
      ${profile.id === active ? html`<p class="hint">${this._tr("profile_active_hint")}</p>` : nothing}
      ${form
        ? html`<div class="card">
            <div class="field"><label for="f-pname">${this._tr(form.mode === "rename" ? "profile_rename" : form.mode === "copy" ? "profile_copy" : "profile_add")}</label>
              <input id="f-pname" type="text" maxlength="40" .value=${form.name}
                @input=${(e: Event) => this._changeProfileForm({ ...form, name: (e.target as HTMLInputElement).value }, "season-name")}
                @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); void this._save(); } }} /></div>
            ${form.mode === "rename" ? html`<p class="hint">${this._tr("profile_rename_warning")}</p>` : nothing}
            <button class="btn" @click=${() => this._changeProfileForm(undefined)}>${this._tr("profile_discard_edit")}</button>
          </div>`
        : nothing}
      <div class="season-delete"><button class="btn danger"
        ?disabled=${Boolean(form) || p.profiles.length < 2 || profile.id === active}
        @click=${() => void this._askDeleteProfile(profile)}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("profile_delete")}</button></div>
    `;
  }

  private _tabKey(event: KeyboardEvent, tabs: [Tab, K][]): void {
    const index = tabs.findIndex(([id]) => id === this._tab);
    const next = event.key === "ArrowRight" ? (index + 1) % tabs.length
      : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length
      : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    this._tab = tabs[next][0];
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`#pe-tab-${this._tab}`)?.focus());
  }

  render() {
    if (!this._p) return nothing;
    const tabs: [Tab, K][] = [["general", "tab_general"], ["entities", "tab_entities"], ["seasons", "tab_seasons"]];
    const editable = this._canEdit();
    const content = html`
      ${!editable ? html`<p class="error" role="alert">${this._tr("read_only")}</p>` : nothing}
      <fieldset ?disabled=${!editable || this._saving}>
        <div class="history" role="group" aria-label=${this._tr("pe_history")}>
          <button class="btn" aria-label=${this._tr("pe_undo")} title=${this._tr("pe_undo")} ?disabled=${!this._history.canUndo} @click=${() => this._undoDraft()}>
            <ha-icon icon="mdi:undo"></ha-icon>${this._isNew ? nothing : this._tr("pe_undo")}</button>
          <button class="btn" aria-label=${this._tr("pe_redo")} title=${this._tr("pe_redo")} ?disabled=${!this._history.canRedo} @click=${() => this._redoDraft()}>
            <ha-icon icon="mdi:redo"></ha-icon>${this._isNew ? nothing : this._tr("pe_redo")}</button>
        </div>
        ${this._isNew ? html`<p class="hint">${this._tr("pe_create_hint")}</p>
          <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
            <input id="f-name" type="text" maxlength="60" .value=${this._p.name}
              @input=${(e: Event) => this._patch({ name: (e.target as HTMLInputElement).value }, "name")} /></div>
          <h3>${this._tr("tab_entities")}</h3>${this._renderEntities(true)}` : html`
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${tabs.map(([id, label]) => html`<button id=${`pe-tab-${id}`} role="tab" aria-controls="pe-panel" tabindex=${this._tab === id ? 0 : -1} aria-selected=${this._tab === id} class="tab ${this._tab === id ? "on" : ""}"
            @keydown=${(event: KeyboardEvent) => this._tabKey(event, tabs)} @click=${() => (this._tab = id)}>${this._tr(label)}</button>`)}
        </div>
        <div id="pe-panel" role="tabpanel" aria-labelledby=${`pe-tab-${this._tab}`}>
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderSeasons()}
        </div>`}
      </fieldset>
      ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}`;
    const primaryActions = html`
      <button class="btn primary" ?disabled=${!editable || this._saving} @click=${() => void this._save()}>
        ${this._tr(this._isNew ? "pe_create" : this.embedded ? "ce_apply_program" : "save")}</button>
      ${!this.embedded ? html`<button class="btn" @click=${() => this._close()}>${this._tr("cancel")}</button>` : nothing}`;
    const secondaryActions = html`
      ${!this._isNew ? html`<button class="btn" ?disabled=${!editable || this._saving || Boolean(this._profileForm)} @click=${() => this._duplicate()}>${this._tr("duplicate")}</button>` : nothing}
      ${!this._isNew ? html`<button class="btn danger" ?disabled=${!editable || this._saving || Boolean(this._profileForm)}
        @click=${() => void this._askDelete()}><ha-icon icon="mdi:delete"></ha-icon>${this._tr("delete")}</button>` : nothing}`;
    const unapplied = Boolean(this._profileForm) || (this._origin
      ? JSON.stringify(this._p) !== JSON.stringify(this._origin)
      : Boolean(this._p.name || this._p.entities.length));
    if (this.embedded) return html`<section class="embedded">${content}
      ${unapplied && !this._isNew ? html`<p role="status" class="hint">${this._tr("pe_unapplied")}</p>` : nothing}
      <p class="hint">${this._tr(this._isNew ? "pe_create_save_hint" : "pe_shared_save_hint")}</p>
      <div class="actions apply-bar">${primaryActions}</div><div class="actions secondary-actions">${secondaryActions}</div>
      ${this._applied ? html`<p role="status" class="hint">${this._tr("ce_program_applied")}</p>` : nothing}
      ${this._scheduleProfileId ? html`<wp-schedule .hass=${this.hass} .data=${this.data}
        .scope=${{ kind: "program", programId: this._p.id }} .profileId=${this._scheduleProfileId} .chart=${false}
        @schedule-program-saved=${(e: CustomEvent<Program>) => { e.stopPropagation(); this._adoptModeSchedule(e.detail); }}
        @closed=${(e: Event) => { e.stopPropagation(); this._closeModeSchedule(); }}></wp-schedule>` : nothing}
    </section>`;
    return html`<wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
      ${content}<div slot="footer" class="actions">${primaryActions}${secondaryActions}</div>
    </wp-dialog>`;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: block; }
      fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
      .history { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
      .history .btn { font-size: 14px; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
      .apply-bar { position: sticky; bottom: 0; z-index: 2; background: var(--card-background-color, #fff); padding: 8px 0; border-top: 1px solid var(--divider-color); }
      .apply-bar .primary { flex: 1; }
      .mode-live { margin: 12px 0; padding: 8px 12px; border: 1px solid var(--divider-color); border-radius: 10px; }
      .mode-associations { margin: 8px 0 12px; }
      .mode-associations summary { min-height: 44px; display: list-item; align-content: center; cursor: pointer; color: var(--primary-color); }
      .actions .danger { margin-left: auto; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
      .svc-choice { align-items: flex-start; padding: 8px 0; }
      .svc-choice input { margin-top: 2px; }
      .svc-copy { display: flex; flex-direction: column; min-width: 0; overflow-wrap: anywhere; }
      .svc-description { color: var(--secondary-text-color); font-size: 12px; line-height: 1.45; margin-top: 3px; white-space: pre-line; }
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
      .profile-bar { align-items: flex-end; gap: 4px; }
      .active-profile { display: flex; align-items: center; gap: 8px; }
      .season-actions { margin: 12px 0; }
      .season-delete { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `,
  ];
}
