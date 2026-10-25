// Program editor: General / Entities / Week tabs. Works on a copy and only saves on "Save".

import { LitElement, css, html, nothing, unsafeCSS } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "../components/day-bar";
import "../components/dialog";
import { confirmAction } from "../components/confirm";
import { displayName, scrollHintCss, trackScrollHints } from "../components/gestures";
import { strings, t } from "../i18n";
import { entityDomain, newId } from "../planner";
import { spillover } from "../time";
import type {
  Condition, HomeAssistant, PlannerData, Profile, Program, ProgramEntity, Setpoint, Slot,
} from "../types";
import { daySpans, findOverlap, sortSlots } from "./day-editor";
import "./day-editor";
import "./slot-editor";
import "./setpoint-editor";
import {
  SUPPORTED_DOMAINS, defaultSetpoint, editorStyles, langOf, modeTypeOf, typeLabel,
} from "./setpoint-editor";
import type { K } from "./setpoint-editor";

type Tab = "general" | "entities" | "week";
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
  @property({ type: Number }) day?: number;

  @state() private _p!: Program;
  @state() private _isNew = true;
  @state() private _tab: Tab = "general";
  @state() private _profileId = "";
  @state() private _dayView?: number;
  @state() private _slotEdit?: { slot: Slot; isNew: boolean };
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _copy?: { from: number; targets: number[]; profileId: string; slotId?: string };
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
        main_type: this.defaultTypes[0] ?? null, conditions: [], entities: [], active_profile: pid,
        profiles: [{ id: pid, name: this._tr("profile_default"), days: EMPTY_DAYS() }],
      };
      this._isNew = true;
    }
    this._profileId = this._activeId();
    this._dayView = this.day;
    this._tab = this.day !== undefined ? "week" : "general";
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

  private _types(): string[] {
    const set = new Set<string>();
    if (this._p.main_type) set.add(this._p.main_type);
    for (const e of this._p.entities) set.add(modeTypeOf(entityDomain(e.entity_id)));
    return [...set];
  }

  private _canEdit(): boolean {
    return this.data.can_edit && !this.data.read_only;
  }

  /* ---- profile / days ---- */

  private _setProfile(profile: Profile): void {
    this._patch({ profiles: this._p.profiles.map((x) => (x.id === profile.id ? profile : x)) });
  }

  private _setDay(day: number, slots: Slot[], profileId = this._profileId): void {
    const profile = this._p.profiles.find((x) => x.id === profileId);
    if (!profile) return;
    const days = profile.days.map((d, i) => (i === day ? sortSlots(this.hass, slots) : d));
    this._setProfile({ ...profile, days });
  }

  private _spill(profile: Profile, day: number): number {
    const prev = profile.days[(day + 6) % 7] ?? [];
    return spillover(prev).reduce((m, x) => Math.max(m, x.end), 0);
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

  private _applyCopy(): void {
    const copy = this._copy;
    if (!copy) return;
    const source = this._profile.days[copy.from] ?? [];
    const one = copy.slotId ? source.find((x) => x.id === copy.slotId) : undefined;
    const skipped: number[] = [];
    let p = this._p;
    for (const target of copy.targets) {
      if (target === copy.from && copy.profileId === this._profileId) continue;
      p = {
        ...p,
        profiles: p.profiles.map((x) => {
          if (x.id !== copy.profileId) return x;
          return {
            ...x,
            days: x.days.map((d, i) => {
              if (i !== target) return d;
              if (!one) return cloneSlots(source);
              const next = sortSlots(this.hass, [...d, ...cloneSlots([one])]);
              if (findOverlap(next)) { skipped.push(target); return d; }
              return next;
            }),
          };
        }),
      };
    }
    this._p = p;
    this._copy = undefined;
    this._error = skipped.length
      ? this._tr("copy_slot_overlap", { days: skipped.map((d) => this._long(d)).join(", ") })
      : "";
  }

  private _saveSlot(slot: Slot): void {
    const day = this._dayView;
    if (day === undefined) return;
    const slots = this._profile.days[day];
    const exists = slots.some((s) => s.id === slot.id);
    this._setDay(day, exists ? slots.map((s) => (s.id === slot.id ? slot : s)) : [...slots, slot]);
  }

  /* ---- entities ---- */

  private _setEntity(index: number, patch: Partial<ProgramEntity>): void {
    this._patch({ entities: this._p.entities.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }

  private _addEntity(entityId: string): void {
    if (!entityId || this._p.entities.some((e) => e.entity_id === entityId)) return;
    const type = modeTypeOf(entityDomain(entityId));
    // propose a sensible default: the "eco"/"off"/"closed" mode of the type when there is one
    const modes = this.data.modes.filter((m) => m.type === type);
    const preferred = modes.find((m) => /eco|off|closed/.test(m.id)) ?? modes[0];
    const def = preferred ? { kind: "mode" as const, value: preferred.id } : { kind: "none" as const };
    this._pickerKey += 1;
    this._patch({
      entities: [...this._p.entities, { entity_id: entityId, default: def, force_permanent: false }],
      main_type: this._p.main_type || type,
    });
  }

  private _setDefaultKind(index: number, kind: ProgramEntity["default"]["kind"]): void {
    const entity = this._p.entities[index];
    const type = modeTypeOf(entityDomain(entity.entity_id));
    let value: ProgramEntity["default"]["value"] = undefined;
    if (kind === "mode") value = this.data.modes.find((m) => m.type === type)?.id ?? "";
    if (kind === "setpoint") value = defaultSetpoint(this.hass, entity.entity_id);
    this._setEntity(index, { default: value === undefined ? { kind } : { kind, value } });
  }

  /* ---- save / delete ---- */

  private _validate(): string {
    const p = this._p;
    if (!p.name.trim()) return this._tr("err_name");
    if (!p.entities.length) return this._tr("err_no_entity");
    if (p.conditions.some((c) => !c.entity_id)) return this._tr("err_incomplete");
    const names = p.profiles.map((x) => x.name.trim());
    if (new Set(names).size !== names.length) return this._tr("err_profile_name");
    for (const profile of p.profiles) {
      for (let d = 0; d < 7; d++) {
        if (findOverlap(profile.days[d])) {
          return this._tr("err_overlap_day", { profile: profile.name, day: this._long(d) });
        }
      }
    }
    return "";
  }

  private _payload(): Program {
    const p = structuredClone(this._p);
    const ids = new Set(p.entities.map((e) => e.entity_id));
    p.name = p.name.trim();
    p.profiles = p.profiles.map((profile) => ({
      ...profile,
      days: profile.days.map((slots) =>
        slots.map((slot) => {
          const by_entity = Object.fromEntries(Object.entries(slot.actions.by_entity).filter(([id]) => ids.has(id)));
          return { ...slot, actions: { ...slot.actions, by_entity } };
        })),
    }));
    if (this._isNew) delete (p as Partial<Program>).id;
    if (!p.main_type) p.main_type = null;
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
    const types = this._types();
    return html`
      <div class="field"><label for="f-name">${this._tr("pe_name")}</label>
        <input id="f-name" type="text" maxlength="60" .value=${p.name}
          @input=${(e: Event) => this._patch({ name: (e.target as HTMLInputElement).value })} /></div>
      <div class="row">
        <div class="field"><label for="f-icon">${this._tr("pe_icon")}</label>
          <div class="row" style="flex-wrap:nowrap">
            ${p.icon && customElements.get("ha-icon") ? html`<ha-icon .icon=${p.icon}></ha-icon>` : nothing}
            <input id="f-icon" type="text" placeholder="mdi:thermometer" .value=${p.icon ?? ""}
              @input=${(e: Event) => this._patch({ icon: (e.target as HTMLInputElement).value.trim() || null })} />
          </div></div>
        <div class="field" style="flex:0 1 140px"><label for="f-prio">${this._tr("pe_priority")}</label>
          <input id="f-prio" type="number" min="1" max="100" step="1" .value=${String(p.priority)}
            @change=${(e: Event) => this._patch({ priority: Math.max(1, Math.min(100, Math.round(Number((e.target as HTMLInputElement).value) || 10))) })} /></div>
      </div>
      <p class="hint">${this._tr("pe_priority_hint")}</p>
      <label class="check"><input type="checkbox" .checked=${p.enabled}
        @change=${(e: Event) => this._patch({ enabled: (e.target as HTMLInputElement).checked })} /> ${this._tr("pe_enabled")}</label>
      <label class="check"><input type="checkbox" .checked=${p.reapply}
        @change=${(e: Event) => this._patch({ reapply: (e.target as HTMLInputElement).checked })} /> ${this._tr("pe_reapply")}</label>
      <p class="hint">${this._tr("pe_reapply_hint")}</p>
      ${types.length
        ? html`<div class="field"><label for="f-main">${this._tr("pe_main_type")}</label>
            <select id="f-main" @change=${(e: Event) => this._patch({ main_type: (e.target as HTMLSelectElement).value })}>
              ${types.map((ty) => html`<option value=${ty} ?selected=${ty === (p.main_type || types[0])}>${typeLabel(this._lang, ty)}</option>`)}
            </select></div>`
        : nothing}
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
      ${keyed(this._pickerKey, html`<wp-entity-picker .hass=${this.hass} .value=${""} .label=${this._tr("pe_add_entity")}
        .domains=${SUPPORTED_DOMAINS} .exclude=${p.entities.map((x) => x.entity_id)}
        @wp-change=${(ev: CustomEvent) => { ev.stopPropagation(); this._addEntity(ev.detail); }}></wp-entity-picker>`)}
    `;
  }

  private _renderEntity(e: ProgramEntity, index: number) {
    const type = modeTypeOf(entityDomain(e.entity_id));
    const attrs = this.hass.states[e.entity_id]?.attributes ?? {};
    const hasPermanent = Array.isArray(attrs.preset_modes) && attrs.preset_modes.includes("permanent");
    const modes = this.data.modes.filter((m) => m.type === type);
    const kind = e.default?.kind ?? "none";
    return html`
      <div class="card">
        <div class="row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${displayName(this.hass, e.entity_id)}</strong>
            ${this.hass.states[e.entity_id] ? nothing : html`<div class="muted small">${this._tr("pe_unknown_entity")}</div>`}</div>
          <button class="ibtn" aria-label=${`${this._tr("delete")} ${displayName(this.hass, e.entity_id)}`}
            @click=${() => void this._askDeleteEntity(index)}><ha-icon icon="mdi:delete"></ha-icon></button>
        </div>
        <div class="field"><label>${this._tr("pe_default")}</label>
          <select @change=${(ev: Event) => this._setDefaultKind(index, (ev.target as HTMLSelectElement).value as ProgramEntity["default"]["kind"])}>
            <option value="none" ?selected=${kind === "none"}>${this._tr("pe_default_none")}</option>
            <option value="previous" ?selected=${kind === "previous"}>${this._tr("pe_default_previous")}</option>
            <option value="mode" ?selected=${kind === "mode"}>${this._tr("pe_default_mode")}</option>
            <option value="setpoint" ?selected=${kind === "setpoint"}>${this._tr("pe_default_setpoint")}</option>
          </select></div>
        ${kind === "mode"
          ? html`<div class="field"><select aria-label=${this._tr("pe_default_mode")}
              @change=${(ev: Event) => this._setEntity(index, { default: { kind: "mode", value: (ev.target as HTMLSelectElement).value } })}>
              ${modes.map((m) => html`<option value=${m.id} ?selected=${m.id === e.default.value}>${m.name}</option>`)}
            </select></div>`
          : nothing}
        ${kind === "setpoint"
          ? html`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .admin=${Boolean(this.data.is_admin)}
              .value=${(e.default.value as Setpoint | null) ?? null}
              @wp-change=${(ev: CustomEvent) => { ev.stopPropagation(); this._setEntity(index, { default: { kind: "setpoint", value: ev.detail } }); }}></wp-setpoint-editor>`
          : nothing}
        ${hasPermanent || e.force_permanent
          ? html`<label class="check"><input type="checkbox" .checked=${Boolean(e.force_permanent)}
              @change=${(ev: Event) => this._setEntity(index, { force_permanent: (ev.target as HTMLInputElement).checked })} />
              ${this._tr("pe_permanent")}</label>
              <p class="hint">${this._tr("pe_permanent_hint")}</p>`
          : nothing}
      </div>`;
  }

  private _renderWeek() {
    const p = this._p;
    const profile = this._profile;
    const active = this._activeId();
    const form = this._profileForm;
    return html`
      <div class="row profile-bar">
        <div class="field" style="flex:1 1 160px"><label for="f-profile">${this._tr("profile")}</label>
          <select id="f-profile" @change=${(e: Event) => { this._profileId = (e.target as HTMLSelectElement).value; this._dayView = undefined; }}>
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
      ${this._dayView === undefined ? this._renderDays(profile) : this._renderDayEditor(profile, this._dayView)}
    `;
  }

  private _renderDays(profile: Profile) {
    return html`${profile.days.map((slots, d) => {
      const spans = daySpans(this.hass, this.data, this._p, slots, this._spill(profile, d));
      const name = this._long(d);
      return html`
        <div class="dayrow">
          <button class="dname" @click=${() => (this._dayView = d)} aria-label=${`${this._tr("edit")} ${name}`}>${this._short(d)}</button>
          <div class="grow bar" @click=${() => (this._dayView = d)}><wp-day-bar .spans=${spans}></wp-day-bar></div>
          <button class="ibtn" aria-label=${`${this._tr("edit")} ${name}`} @click=${() => (this._dayView = d)}><ha-icon icon="mdi:pencil"></ha-icon></button>
          <button class="ibtn" aria-label=${`${this._tr("copy_day")} ${name}`} title=${this._tr("copy_day")}
            @click=${() => (this._copy = { from: d, targets: [], profileId: profile.id })}><ha-icon icon="mdi:content-copy"></ha-icon></button>
        </div>`;
    })}`;
  }

  private _renderDayEditor(profile: Profile, day: number) {
    return html`
      <div class="row daynav">
        <button class="btn" @click=${() => (this._dayView = undefined)}><ha-icon icon="mdi:arrow-left"></ha-icon> ${this._tr("week")}</button>
        <span class="grow"></span>
        <button class="ibtn" aria-label=${this._tr("previous_day")} @click=${() => (this._dayView = (day + 6) % 7)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <strong>${this._long(day)}</strong>
        <button class="ibtn" aria-label=${this._tr("next_day")} @click=${() => (this._dayView = (day + 1) % 7)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-day-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .day=${day}
        .slots=${profile.days[day]} .spill=${this._spill(profile, day)}
        @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._setDay(day, e.detail); }}
        @edit-slot=${(e: CustomEvent) => { e.stopPropagation(); this._slotEdit = e.detail; }}
        @copy-slot=${(e: CustomEvent) => {
          e.stopPropagation();
          this._copy = { from: day, targets: [], profileId: profile.id, slotId: (e.detail.slot as Slot).id };
        }}></wp-day-editor>
    `;
  }

  /* ---- render: dialogs ---- */

  private _renderCopy() {
    const copy = this._copy;
    if (!copy) return nothing;
    const set = (targets: number[]) => (this._copy = { ...copy, targets });
    const days = [0, 1, 2, 3, 4, 5, 6];
    return html`
      <wp-dialog open heading=${copy.slotId ? this._tr("copy_slot") : `${this._tr("copy_day")} — ${this._long(copy.from)}`}
        @closed=${(e: Event) => { e.stopPropagation(); this._copy = undefined; }}>
        <div class="row">
          <button class="btn" @click=${() => set([0, 1, 2, 3, 4])}>${this._tr("copy_mon")} <ha-icon icon="mdi:arrow-right"></ha-icon> ${this._tr("copy_fri")}</button>
          <button class="btn" @click=${() => set([5, 6])}>${this._tr("copy_weekend")}</button>
          <button class="btn" @click=${() => set(days)}>${this._tr("copy_all")}</button>
        </div>
        <div class="row" role="group" aria-label=${this._tr("copy_choose")}>
          ${days.map((d) => html`<label class="check"><input type="checkbox" .checked=${copy.targets.includes(d)}
            @change=${(e: Event) => set((e.target as HTMLInputElement).checked ? [...copy.targets, d] : copy.targets.filter((x) => x !== d))} />
            ${this._short(d)}</label>`)}
        </div>
        <div class="field"><label>${this._tr("profile")}</label>
          <select @change=${(e: Event) => (this._copy = { ...copy, profileId: (e.target as HTMLSelectElement).value })}>
            ${this._p.profiles.map((x) => html`<option value=${x.id} ?selected=${x.id === copy.profileId}>${x.name}</option>`)}
          </select></div>
        <p class="hint">${this._tr(copy.slotId ? "copy_slot_hint" : "copy_warning")}</p>
        <button slot="footer" class="btn" @click=${() => (this._copy = undefined)}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!copy.targets.length} @click=${() => this._applyCopy()}>${this._tr("copy")}</button>
      </wp-dialog>`;
  }

  render() {
    if (!this._p) return nothing;
    const tabs: [Tab, K][] = [["general", "tab_general"], ["entities", "tab_entities"], ["week", "tab_week"]];
    const editable = this._canEdit();
    const day = this._dayView;
    return html`
      <wp-dialog id="main" open wide heading=${this._isNew ? this._tr("new_program") : this._p.name || this._tr("title")}>
        ${!editable ? html`<p class="error" role="alert">${this._tr("read_only")}</p>` : nothing}
        <div class="tabs" role="tablist" aria-label=${this._tr("tab_scroll")}>
          ${tabs.map(([id, label]) => html`<button role="tab" aria-selected=${this._tab === id} class="tab ${this._tab === id ? "on" : ""}"
            @click=${() => (this._tab = id)}>${this._tr(label)}</button>`)}
        </div>
        <div role="tabpanel">
          ${this._tab === "general" ? this._renderGeneral() : this._tab === "entities" ? this._renderEntities() : this._renderWeek()}
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
      ${this._renderCopy()}
      ${this._slotEdit && day !== undefined
        ? html`<wp-slot-editor .hass=${this.hass} .data=${this.data} .program=${this._p} .entry=${this._slotEdit.slot}
            .others=${this._profile.days[day].filter((s) => s.id !== this._slotEdit!.slot.id)}
            @wp-save=${(e: CustomEvent) => { e.stopPropagation(); this._saveSlot(e.detail); }}
            @closed=${(e: Event) => { e.stopPropagation(); this._slotEdit = undefined; }}></wp-slot-editor>`
        : nothing}
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
      .break { display: none; }
      @media (max-width: 520px) {
        .break { display: block; order: 3; flex: 1 0 100%; height: 0; }
        .del { order: 4; margin-right: auto; }
      }
      @media (min-width: 521px) { .del { order: -1; margin-right: auto; } }
      .profile-bar { align-items: flex-end; gap: 4px; }
      .dayrow { display: flex; align-items: center; gap: 4px; padding: 4px 0; }
      .dname {
        flex: none; width: 44px; min-height: 48px; border: none; background: none; color: inherit;
        font-weight: 600; text-align: left; cursor: pointer;
      }
      .bar { cursor: pointer; }
      .daynav { margin: 8px 0; }
      @media (max-width: 480px) { .btn { padding: 0 12px; } }
    `,
  ];
}
