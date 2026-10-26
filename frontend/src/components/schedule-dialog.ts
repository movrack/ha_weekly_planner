// The one screen of a device or a schedule: its slots (one per row, expanded in place), the rest of
// the time, a Planned / Measured chart, the pause switch and the delete button.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import "./chart";
import "./dialog";
import "./slot-form";
import {
  actColor, actText, daysText, groupSlots, readAct, readDefault, shiftSpec, specText, writeDefault, writeGroups, ALL_DAYS,
} from "../actions";
import type { Act, SlotGroup } from "../actions";
import { addDaysIso } from "./chart";
import { confirmAction } from "./confirm";
import { strings, t } from "../i18n";
import { isGenericEntity, loadServiceNames } from "../services";
import { activeProfile, friendlyName, newId } from "../planner";
import { localDateIso } from "../time";
import { findOverlap, specMinutes } from "../editors/day-editor";
import { editorStyles, langOf } from "../editors/setpoint-editor";
import type { HomeAssistant, PlannerData, PreviewSlot, Program, Slot, TimeSpec } from "../types";

export type Scope = { kind: "device"; entityId: string } | { kind: "program"; programId: string };

export const scopeKey = (scope: Scope): string => (scope.kind === "device" ? `d:${scope.entityId}` : `p:${scope.programId}`);

const BACK = 14;
const AHEAD = 7;

@customElement("wp-schedule")
export class WpSchedule extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) scope!: Scope;
  @property({ type: Boolean }) chart = true;
  /** Opened from a day of the card's week (0 = Monday, `offset` days from today): edit that day. */
  @property({ attribute: false }) day: { weekday: number; offset: number } | null = null;

  /** Row being edited: its key, "new", or "rest:<entity>". */
  @state() private _open: string | null = null;
  @state() private _group: SlotGroup | null = null;
  /** Editing one day of a group: that day, and the rest of the group kept as it is. */
  @state() private _dayOnly: number | null = null;
  private _rest: SlotGroup | null = null;
  @state() private _act: Act | null = null;
  @state() private _programId = "";
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _offset = 0;
  @state() private _slots: PreviewSlot[] | null = null;
  @state() private _chartEntity = "";
  private _token = 0;
  private _loaded = "";

  private get _lang(): string { return langOf(this.hass); }
  private get _tz(): string { return this.hass.config.time_zone; }

  /* ---- scope ---- */

  private get _programs(): Program[] {
    const all = this.data.programs;
    const list = this.scope.kind === "device"
      ? all.filter((p) => p.entities.some((e) => e.entity_id === (this.scope as { entityId: string }).entityId))
      : all.filter((p) => p.id === (this.scope as { programId: string }).programId);
    return [...list].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  }

  private get _entities(): string[] {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const program = this._programs[0];
    return program ? program.entities.map((e) => e.entity_id) : [];
  }

  private get _title(): string {
    if (this.scope.kind === "device") return friendlyName(this.hass, this.scope.entityId);
    return this._programs[0]?.name ?? "";
  }

  private _include(program: Program): (slot: Slot) => boolean {
    const ids = this._entities.filter((e) => program.entities.some((x) => x.entity_id === e));
    return (slot) => ids.some((e) => readAct(slot, e, this.data.modes) !== null);
  }

  private _minutes = (spec: TimeSpec): number => specMinutes(this.hass, spec);

  private _rows(): { program: Program; group: SlotGroup; key: string }[] {
    const out: { program: Program; group: SlotGroup; key: string }[] = [];
    for (const program of this._programs) {
      const profile = activeProfile(program, this.data);
      for (const group of groupSlots(profile, this._include(program), this._minutes)) {
        out.push({ program, group, key: `${program.id}|${group.ids[group.days[0]]}` });
      }
    }
    return out;
  }

  /* ---- lifecycle / chart ---- */

  firstUpdated(): void {
    this._loadNames();
    if (!this.day) return;
    const { weekday, offset } = this.day;
    if (offset >= -BACK && offset <= AHEAD) this._offset = offset;
    const rows = this._rows().filter((r) => r.group.days.includes(weekday));
    if (rows.length === 1) {
      const { key, program, group } = rows[0];
      const { [weekday]: own, ...others } = group.ids;
      this._expand(key, program, { slot: group.slot, days: [weekday], ids: own ? { [weekday]: own } : {} });
      this._rest = { slot: structuredClone(group.slot), days: group.days.filter((d) => d !== weekday), ids: others };
      this._dayOnly = weekday;
    } else if (!rows.length && this._canEdit) {
      this._add([weekday]);
      this._dayOnly = weekday;
    }
  }

  /** Translated service names of the generic actions of this scope. */
  private _loadNames(): void {
    const domains = new Set<string>();
    for (const p of this._programs) {
      for (const day of activeProfile(p, this.data).days) {
        for (const slot of day) {
          for (const sp of Object.values(slot.actions.by_entity)) {
            if (sp.kind === "service") domains.add(String(sp.service).split(".")[0]);
          }
        }
      }
    }
    void loadServiceNames(this.hass, [...domains]).then((ok) => ok && this.requestUpdate());
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (!this._chartEntity || changed.has("scope")) this._chartEntity = this._entities[0] ?? "";
    const owner = this._programs[0];
    if (this.chart && owner && this.hass) {
      const key = `${owner.id}|${owner.revision}|${this._date}`;
      if (key !== this._loaded) {
        this._loaded = key;
        void this._loadPreview(owner.id, this._date, key);
      }
    }
  }

  private get _today(): string { return localDateIso(new Date(), this._tz); }
  private get _date(): string { return addDaysIso(this._today, this._offset); }

  private async _loadPreview(programId: string, date: string, key: string): Promise<void> {
    const token = ++this._token;
    try {
      const res = await this.hass.callWS<{ slots: PreviewSlot[] }>({ type: "weekly_planner/preview", program_id: programId, date });
      if (token === this._token && key === this._loaded) this._slots = res.slots;
    } catch {
      if (token === this._token) this._slots = null;
    }
  }

  private _go(delta: number): void {
    const next = this._offset + delta;
    if (next < -BACK || next > AHEAD) return;
    this._slots = null;
    this._offset = next;
  }

  /* ---- editing state ---- */

  private get _canEdit(): boolean {
    return this.data.can_edit && !this.data.read_only;
  }

  private _expand(key: string, program: Program, group: SlotGroup | null, act: Act | null = null): void {
    this._open = key;
    this._programId = program.id;
    this._group = group ? structuredClone(group) : null;
    this._act = act;
    this._error = "";
    // Show the top of the opened row, not the bottom of its form.
    void this.updateComplete.then(() => requestAnimationFrame(() =>
      this.renderRoot.querySelector<HTMLElement>(".editor")?.scrollIntoView({ block: "start" })));
  }

  private _cancel(): void {
    this._open = null;
    this._group = null;
    this._dayOnly = null;
    this._rest = null;
    this._act = null;
    this._error = "";
  }

  private _add(days: number[] = ALL_DAYS): void {
    const program = this._programs[0];
    const eid = this._entities[0];
    if (!program || !eid) return;
    const slot: Slot = {
      id: newId(), start: { time: "08:00" }, end: this._entities.every(isGenericEntity) ? null : { time: "09:00" }, conditions: [],
      actions: { by_type: {}, by_entity: {} },
    };
    this._expand("new", program, { slot, days: [...days], ids: {}, fresh: true });
  }

  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  private _duplicate(): void {
    const program = this._programs.find((p) => p.id === this._programId);
    const g = this._group;
    if (!program || !g) return;
    const { start, end } = g.slot;
    const length = end ? Math.max(15, specMinutes(this.hass, end) - specMinutes(this.hass, start)) : 60;
    const slot: Slot = {
      ...structuredClone(g.slot), id: newId(),
      start: shiftSpec(start, length), end: end ? shiftSpec(end, length) : null,
    };
    this._expand("new", program, { slot, days: [...g.days], ids: {}, fresh: true });
    this._rest = null;
  }

  /* ---- saving ---- */

  private async _saveProgram(program: Program): Promise<boolean> {
    this._saving = true;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(program) });
      return true;
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "conflict") this._error = t(this._lang, "ss_conflict");
      else if (e?.code === "unauthorized") this._error = t(this._lang, "err_unauthorized");
      else if (e?.message?.includes("service_has_no_end")) this._error = t(this._lang, "err_service_end");
      else if (e?.message?.includes("overlapping_slots")) this._error = t(this._lang, "w_err_overlap");
      else this._error = t(this._lang, "ss_err_save");
      return false;
    } finally {
      this._saving = false;
    }
  }

  private _problem(program: Program): string {
    const lang = this._lang;
    const g = this._group;
    if (!g) return "";
    if (!g.days.length) return t(lang, "err_days");
    if (g.slot.end && JSON.stringify(g.slot.start) === JSON.stringify(g.slot.end)) return t(lang, "w_err_same");
    if (!this._entities.some((e) => program.entities.some((x) => x.entity_id === e) && readAct(g.slot, e, this.data.modes))) {
      return t(lang, "err_action");
    }
    return "";
  }

  /** The rest of a group edited from one day, minus the days the edit now covers. */
  private _kept(days: number[]): SlotGroup[] {
    const rest = this._rest;
    if (!rest) return [];
    const left = rest.days.filter((d) => !days.includes(d));
    const ids = Object.fromEntries(left.filter((d) => rest.ids[d]).map((d) => [d, rest.ids[d]]));
    return left.length ? [{ ...rest, days: left, ids }] : [];
  }

  private async _saveRow(): Promise<void> {
    const program = this._programs.find((p) => p.id === this._programId);
    const draft = this._group;
    if (!program || !draft) return;
    const problem = this._problem(program);
    if (problem) {
      this._error = problem;
      return;
    }
    const profile = activeProfile(program, this.data);
    const include = this._include(program);
    const groups = groupSlots(profile, include, this._minutes)
      .filter((g) => `${program.id}|${g.ids[g.days[0]]}` !== this._open);
    groups.push(...this._kept(draft.days), draft);
    const next = writeGroups(profile, groups, include, this._minutes);
    for (const slots of next.days) {
      if (findOverlap(slots)) {
        this._error = t(this._lang, "w_err_overlap");
        return;
      }
    }
    const saved = await this._saveProgram({ ...program, profiles: program.profiles.map((p) => (p.id === profile.id ? next : p)) });
    if (saved) this._cancel();
  }

  private async _deleteRow(): Promise<void> {
    const program = this._programs.find((p) => p.id === this._programId);
    if (!program || this._open === "new") return;
    if (!(await confirmAction(this, t(this._lang, "w_confirm_slot"), t(this._lang, "yes"), t(this._lang, "no")))) return;
    const profile = activeProfile(program, this.data);
    const include = this._include(program);
    const groups = groupSlots(profile, include, this._minutes)
      .filter((g) => `${program.id}|${g.ids[g.days[0]]}` !== this._open);
    groups.push(...this._kept([]));
    const next = writeGroups(profile, groups, include, this._minutes);
    if (await this._saveProgram({ ...program, profiles: program.profiles.map((p) => (p.id === profile.id ? next : p)) })) this._cancel();
  }

  private async _saveRest(eid: string): Promise<void> {
    const program = this._programs[0];
    const act = this._act;
    if (!program || !act) return;
    const entities = program.entities.map((e) => (e.entity_id === eid ? { ...e, default: writeDefault(act) } : e));
    if (await this._saveProgram({ ...program, entities })) this._cancel();
  }

  /* ---- pause / delete ---- */

  private get _enabled(): boolean {
    return this._programs.some((p) => p.enabled);
  }

  private async _setEnabled(enabled: boolean, input: HTMLInputElement): Promise<void> {
    if (!enabled && !(await confirmAction(this, t(this._lang, "confirm_pause", { name: this._title }), t(this._lang, "yes"), t(this._lang, "no")))) {
      input.checked = true;
      return;
    }
    try {
      for (const p of this._programs) {
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: p.id, enabled });
      }
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  private async _deleteAll(): Promise<void> {
    if (!(await confirmAction(this, t(this._lang, "confirm_delete_schedule", { name: this._title }), t(this._lang, "yes"), t(this._lang, "no")))) return;
    try {
      for (const program of this._programs) {
        const eid = this.scope.kind === "device" ? this.scope.entityId : null;
        if (!eid || program.entities.length <= 1) {
          await this.hass.callWS({ type: "weekly_planner/program/delete", program_id: program.id });
          continue;
        }
        const clean = structuredClone(program);
        clean.entities = clean.entities.filter((e) => e.entity_id !== eid);
        for (const profile of clean.profiles) {
          for (const day of profile.days) {
            for (const slot of day) delete slot.actions.by_entity[eid];
          }
          profile.days = profile.days.map((d) => d.filter((s) => Object.keys(s.actions.by_entity).length || Object.keys(s.actions.by_type).length));
        }
        await this.hass.callWS({ type: "weekly_planner/program/save", program: clean });
      }
      this._closeDialog();
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  private _closeDialog(): void {
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _settings(): void {
    const program = this._programs[0];
    if (!program) return;
    this.dispatchEvent(new CustomEvent("open-settings", { detail: { programId: program.id }, bubbles: true, composed: true }));
  }

  /* ---- render ---- */

  private _when(slot: Slot): string {
    const lang = this._lang;
    const start = specText(lang, slot.start);
    return slot.end ? `${start}–${specText(lang, slot.end)}` : start;
  }

  private _rowText(program: Program, group: SlotGroup): { text: string; days: string; color: string } {
    const lang = this._lang;
    const ids = this._entities.filter((e) => program.entities.some((x) => x.entity_id === e));
    const withAct = ids.map((e) => ({ e, act: readAct(group.slot, e, this.data.modes) })).filter((x) => x.act);
    const first = withAct[0];
    const what = first ? actText(this.hass, lang, this.data.modes, first.e, first.act!) : "";
    const more = withAct.length > 1 ? ` +${withAct.length - 1}` : "";
    const days = daysText(lang, strings(lang).days_short, group.days);
    return {
      text: [`${what}${more}`, this._when(group.slot)].filter(Boolean).join(" · "),
      days,
      color: first ? actColor(this.data.modes, first.e, first.act) : "var(--disabled-text-color)",
    };
  }

  private _renderRow(row: { program: Program; group: SlotGroup; key: string }) {
    const { program, group, key } = row;
    if (this._open === key && this._group) return this._renderEditor(program, key);
    const { text, days, color } = this._rowText(program, group);
    return html`<button class="row" aria-expanded="false" @click=${() => this._expand(key, program, group)}>
      <span class="dot" style="background:${color}"></span>
      <span class="txt"><span class="l1">${text}</span><span class="l2">${days}</span>${this._programs.length > 1 ? html`<small>${program.name}</small>` : nothing}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }

  private _renderEditor(program: Program, key: string) {
    const lang = this._lang;
    const isNew = key === "new";
    const ids = this._entities.filter((e) => program.entities.some((x) => x.entity_id === e));
    return html`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${program} .group=${this._group!} .entityIds=${ids}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @group-change=${(e: CustomEvent<SlotGroup>) => { e.stopPropagation(); this._group = e.detail; this._error = ""; }}></wp-slot-form>
      ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${t(lang, "cancel")}</button>
      </div>
      ${isNew ? nothing : html`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${t(lang, "duplicate")}</button>`}
      ${isNew ? nothing : html`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete")}</button>`}
    </div>`;
  }

  private _renderRest() {
    const lang = this._lang;
    const program = this._programs[0];
    if (!program) return nothing;
    return this._entities.filter((e) => !isGenericEntity(e) && program.entities.some((x) => x.entity_id === e)).map((eid) => {
      const entity = program.entities.find((x) => x.entity_id === eid)!;
      const act = readDefault(entity, this.data.modes);
      const key = `rest:${eid}`;
      const label = this._entities.length > 1 ? `${t(lang, "rest_of_time")} · ${friendlyName(this.hass, eid)}` : t(lang, "rest_of_time");
      if (this._open === key) {
        return html`<div class="editor"><h4>${label}</h4>
          <wp-action-picker rest .hass=${this.hass} .data=${this.data} entity-id=${eid} .act=${this._act} ?disabled=${!this._canEdit}
            @act-change=${(e: CustomEvent<Act>) => { e.stopPropagation(); this._act = e.detail; }}></wp-action-picker>
          ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(eid)}>${t(lang, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${t(lang, "cancel")}</button>
          </div></div>`;
      }
      const text = act.special === "none" ? t(lang, "rest_none_short") : act.special === "previous" ? t(lang, "rest_previous_short")
        : actText(this.hass, lang, this.data.modes, eid, act);
      return html`<button class="row rest" aria-expanded="false" @click=${() => this._expand(key, program, null, act)}>
        <ha-icon icon="mdi:update"></ha-icon>
        <span class="txt">${label} · <b>${text}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    });
  }

  private _renderChart() {
    const lang = this._lang;
    const owner = this._programs[0];
    if (!this.chart || !owner || !this._chartEntity) return nothing;
    const date = this._date;
    const label = new Intl.DateTimeFormat(lang, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
      .format(new Date(`${date}T12:00:00Z`));
    return html`<section class="chart">
      ${this._entities.length > 1 ? html`<select aria-label=${t(lang, "chart")} @change=${(e: Event) => (this._chartEntity = (e.target as HTMLSelectElement).value)}>
        ${this._entities.map((e) => html`<option value=${e} ?selected=${e === this._chartEntity}>${friendlyName(this.hass, e)}</option>`)}</select>` : nothing}
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -BACK} aria-label=${t(lang, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? t(lang, "today") : label}</span>
        <button class="ibtn" ?disabled=${this._offset >= AHEAD} aria-label=${t(lang, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart simple .hass=${this.hass} .data=${this.data} .program=${owner} entity-id=${this._chartEntity} date=${date}
        .slots=${this._slots}></wp-chart>
    </section>`;
  }

  render() {
    if (!this.hass || !this.data || !this.scope) return nothing;
    const lang = this._lang;
    if (!this._programs.length) {
      return html`<wp-dialog open heading=${this._title}><p class="muted">${t(lang, "no_program")}</p></wp-dialog>`;
    }
    const rows = this._rows();
    const admin = Boolean(this.hass.user?.is_admin) && this.data.can_edit;
    return html`
      <wp-dialog open heading=${this._title}>
        ${admin ? html`<button slot="header-actions" class="gear" aria-label=${t(lang, "settings")} @click=${() => this._settings()}>
          <ha-icon icon="mdi:cog"></ha-icon></button>` : nothing}
        ${!this._canEdit ? html`<p class="err" role="alert">${t(lang, "read_only")}</p>` : nothing}
        ${this._error && !this._open ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
        <div class="list">
          ${rows.length ? rows.map((r) => this._renderRow(r)) : (this._open === "new" ? nothing : html`<p class="muted">${t(lang, "w_none")}</p>`)}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : nothing}
          ${this._open === null ? html`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${t(lang, "w_add")}</span></button>` : nothing}
          ${this._renderRest()}
        </div>
        ${this._open !== null ? nothing : html`${this._renderChart()}
        <label class="switch">
          <span class="grow">${t(lang, "schedule_on")}</span>
          <span class="state">${this._enabled ? t(lang, "running") : t(lang, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit}
            @change=${(e: Event) => void this._setEnabled((e.target as HTMLInputElement).checked, e.target as HTMLInputElement)} />
          <span class="track"></span>
        </label>
        <button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete_schedule")}</button>`}
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
    .row .txt { flex: 1; min-width: 0; overflow-wrap: anywhere; line-height: 1.3; }
    .row .txt .l1, .row .txt .l2 { display: block; }
    .row .txt .l2 { color: var(--secondary-text-color); font-size: 14px; }
    .row.rest .txt { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 15px; }
    .row .txt small { display: block; color: var(--secondary-text-color); font-size: 12px; }
    .row.add { border-style: dashed; color: var(--primary-color); font-weight: 500; }
    .row.rest { background: var(--secondary-background-color); }
    .row:disabled { opacity: 0.5; cursor: default; }
    .dot { width: 14px; height: 14px; border-radius: 7px; flex: none; }
    .editor { border: 2px solid var(--primary-color); border-radius: 12px; padding: 12px; }
    .editor h4 { margin: 0 0 8px; font-size: 15px; }
    .btns { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .btns .btn { flex: 1 1 120px; }
    .btn.alone { width: 100%; margin-top: 32px; }
    .btn.dup { width: 100%; margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; --mdc-icon-size: 20px; }
    .editor { scroll-margin-top: 8px; }
    .btn.danger-line { color: var(--error-color, #db4437); border-color: var(--error-color, #db4437); }
    .btn.danger { background: var(--error-color, #db4437); border-color: var(--error-color, #db4437); color: #fff; }
    .err { color: var(--error-color, #db4437); margin: 8px 0; }
    .muted { color: var(--secondary-text-color); }
    .chart { margin-top: 16px; }
    .chart .nav { display: flex; align-items: center; justify-content: space-between; font-size: 15px; font-weight: 500; }
    .chart select { margin-bottom: 4px; }
    .gear {
      border: none; background: none; color: inherit; width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 24px;
    }
    .gear:hover { background: var(--secondary-background-color); }
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-top: 12px; font-size: 16px; }
    .switch .state { font-size: 14px; color: var(--secondary-text-color); }
    .switch input { opacity: 0; width: 0; height: 0; position: absolute; }
    .switch .track { position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--disabled-color, #bdbdbd); transition: background 0.2s; flex: none; }
    .switch .track::before { content: ""; position: absolute; width: 20px; height: 20px; left: 2px; top: 2px; border-radius: 50%; background: #fff; transition: transform 0.2s; }
    .switch input:checked + .track { background: var(--primary-color); }
    .switch input:checked + .track::before { transform: translateX(20px); }
    .switch input:focus-visible + .track { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-schedule": WpSchedule;
  }
}
