// The one screen of a device or a schedule: its slots (one per row, expanded in place), the rest of
// the time, the chart of the day, the pause switch and the delete button.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./chart";
import "./dialog";
import "./label-picker";
import "./slot-form";
import { daysText, groupSlots, specText, ALL_DAYS } from "../actions";
import type { SlotGroup } from "../actions";
import { applyEdit, compareOrigin, dayView, findGroup, freshGroup, groupId, nextTimes, overlapDay, splitBusyDays } from "../edits";
import type { RowEdit } from "../edits";
import { labelOf, labelsFor } from "../labels";
import { addDaysIso } from "./chart";
import { confirmAction } from "./confirm";
import { strings, t } from "../i18n";
import { loadServiceNames } from "../services";
import { activeProfile, friendlyName } from "../planner";
import { DAY, localDateIso, minutesToClock } from "../time";
import { specMinutes } from "../slots";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant, PlannerData, PreviewSlot, Profile, Program, Slot, TimeSpec } from "../types";

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
  /** Id of the group being edited (null: a new slot). */
  private _openId: string | null = null;
  /** Duplicate: the edited original, written together with its copy. */
  private _base: RowEdit | null = null;
  /** New slot from the full screen: days that overlap another slot are dropped, not refused. */
  private _dropBusy = false;
  /** Day the screen is focused on (opened from the week list), null for the whole week. */
  @state() private _focus: number | null = null;
  @state() private _note = "";
  /** The group as it was when opened: a change of it meanwhile is a real conflict. */
  private _origin: SlotGroup | null = null;
  /** Label values set for a device while editing, applied on top of the current program when saving. */
  private _overrides: { entityId: string; labelId: string; action: Action | null }[] = [];
  /** Last program saved from here: newer than the pushed data until the push arrives. */
  private _saved: Record<string, Program> = {};
  /** Program being edited: the saved one plus the values of labels set for a device (saved with the row). */
  @state() private _draft: Program | null = null;
  @state() private _restLabel: string | null = null;
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

  /** A slot applies to every device of its program. */
  private _include = (_slot: Slot): boolean => true;

  private _minutes = (spec: TimeSpec): number => specMinutes(this.hass, spec);

  private _rows(): { program: Program; group: SlotGroup; key: string }[] {
    const out: { program: Program; group: SlotGroup; key: string }[] = [];
    for (const program of this._programs) {
      const profile = activeProfile(program, this.data);
      for (const group of groupSlots(profile, this._include, this._minutes)) {
        if (this._focus !== null && !group.days.includes(this._focus)) continue;
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
    this._focus = weekday;
    // a day without a slot: straight to a new one
    if (!this._rows().length && this._canEdit) this._add([weekday]);
  }

  /** Translated service names of the actions of the labels. */
  private _loadNames(): void {
    const domains = new Set<string>();
    for (const l of this.data.labels) if (l.action.kind === "service") domains.add(l.action.service.split(".")[0]);
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

  private _expand(
    key: string, program: Program, group: SlotGroup | null,
    opts: { restLabel?: string | null; rest?: SlotGroup | null; dayOnly?: number | null; openId?: string | null; origin?: SlotGroup | null } = {},
  ): void {
    this._open = key;
    this._programId = program.id;
    this._group = group ? structuredClone(group) : null;
    this._restLabel = opts.restLabel ?? null;
    this._rest = opts.rest ?? null;
    this._dayOnly = opts.dayOnly ?? null;
    this._openId = opts.openId ?? null;
    this._base = null;
    this._origin = opts.origin ? structuredClone(opts.origin) : null;
    this._overrides = [];
    this._dropBusy = false;
    this._draft = structuredClone(program);
    this._error = "";
    this._note = "";
    // Show the top of the opened row, not the bottom of its form.
    void this.updateComplete.then(() => requestAnimationFrame(() =>
      this.renderRoot.querySelector<HTMLElement>(".editor")?.scrollIntoView({ block: "start" })));
  }

  /** Opens a slot row: the whole group, or only the focused day of it. */
  private _openRow(key: string, program: Program, group: SlotGroup): void {
    const openId = groupId(group) ?? null;
    if (this._focus !== null && group.days.includes(this._focus)) {
      const { draft, rest } = dayView(group, this._focus);
      this._expand(key, program, draft, { rest, dayOnly: this._focus, openId, origin: group });
    } else {
      this._expand(key, program, group, { openId, origin: group });
    }
  }

  private _cancel(): void {
    this._open = null;
    this._group = null;
    this._dayOnly = null;
    this._rest = null;
    this._openId = null;
    this._base = null;
    this._origin = null;
    this._overrides = [];
    this._dropBusy = false;
    this._draft = null;
    this._restLabel = null;
    this._error = "";
  }

  private _onOverride(detail: { entityId: string; labelId: string; action: Action | null }): void {
    const draft = this._draft;
    if (!draft) return;
    this._overrides = [...this._overrides.filter((o) => o.entityId !== detail.entityId || o.labelId !== detail.labelId), detail];
    this._draft = {
      ...draft,
      entities: draft.entities.map((e) => {
        if (e.entity_id !== detail.entityId) return e;
        const overrides = { ...(e.label_overrides ?? {}) };
        if (detail.action) overrides[detail.labelId] = detail.action;
        else delete overrides[detail.labelId];
        return { ...e, label_overrides: overrides };
      }),
    };
  }

  /** A new slot: all days from the full screen, one day when focused (starting after that day's last slot). */
  private _add(days: number[] = this._focus === null ? ALL_DAYS : [this._focus]): void {
    const program = this._programs[0];
    const eid = this._entities[0];
    if (!program || !eid) return;
    const first = labelsFor(this.hass, this.data, this._entities)[0];
    const day = days.length === 1 ? days[0] : null;
    const times = day === null ? undefined : nextTimes(activeProfile(program, this.data).days[day], this._minutes);
    this._expand("new", program, freshGroup(first?.id ?? "", days, times), { dayOnly: day });
    this._dropBusy = day === null;
  }

  /** A new slot like the open one (as edited), right after it: same length, same days and action. */
  private _duplicate(): void {
    const program = this._programs.find((p) => p.id === this._programId);
    const g = this._group;
    if (!program || !g) return;
    const problem = this._problem(program);
    if (problem) {
      this._error = problem;
      return;
    }
    const { start, end } = g.slot;
    const from = specMinutes(this.hass, start);
    const length = end ? Math.max(15, specMinutes(this.hass, end) - from) : 60;
    const shift = (m: number) => ({ time: minutesToClock(Math.min(DAY, m)) });
    const base: RowEdit = { openId: this._openId, rest: this._rest, draft: structuredClone(g) };
    const dayOnly = this._dayOnly;
    const copy = freshGroup(g.slot.label, g.days);
    copy.slot = {
      ...structuredClone(g.slot), id: copy.slot.id,
      start: "time" in start ? shift(from + length) : { ...start, offset: (start.offset ?? 0) + length },
      end: !end ? null : "time" in end ? shift(from + 2 * length) : { ...end, offset: (end.offset ?? 0) + length },
    };
    const origin = this._origin;
    this._expand("new", program, copy, { dayOnly });
    this._base = base;
    this._origin = origin;
  }

  /* ---- saving ---- */

  /** The newest known version of a program: the pushed data, or what this screen saved last. */
  private _live(programId: string): Program | undefined {
    const pushed = this.data.programs.find((p) => p.id === programId);
    const saved = this._saved[programId];
    return saved && (!pushed || saved.revision > pushed.revision) ? saved : pushed;
  }

  private async _saveProgram(program: Program): Promise<"ok" | "conflict" | "error"> {
    this._saving = true;
    try {
      const res = await this.hass.callWS<{ program?: Program }>({ type: "weekly_planner/program/save", program: structuredClone(program) });
      if (res?.program) this._saved[program.id] = res.program;
      return "ok";
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "conflict") return "conflict";
      if (e?.code === "unauthorized") this._error = t(this._lang, "err_unauthorized");
      else if (e?.message?.includes("unknown_label")) this._error = t(this._lang, "err_label");
      else if (e?.message?.includes("overlapping_slots")) this._error = t(this._lang, "w_err_overlap");
      else this._error = t(this._lang, "ss_err_save");
      return "error";
    } finally {
      this._saving = false;
    }
  }

  /**
   * Builds the change on the CURRENT program and saves it. A revision mismatch is retried once on top of
   * the fresh data, then reported. `build` returns the program to save, or a message / a changed group.
   */
  private async _commit(
    programId: string,
    build: (live: Program) => { program: Program } | { error: string } | { changed: true },
  ): Promise<boolean> {
    let live = this._live(programId);
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!live) return false;
      const built = build(live);
      if ("error" in built) {
        this._error = built.error;
        return false;
      }
      if ("changed" in built) return false;
      const result = await this._saveProgram(built.program);
      if (result === "ok") return true;
      if (result === "error") return false;
      try {
        const fresh = await this.hass.callWS<PlannerData>({ type: "weekly_planner/get" });
        live = fresh.programs.find((p) => p.id === programId);
        if (live) this._saved[programId] = live;
      } catch {
        break;
      }
    }
    this._error = t(this._lang, "ss_err_save");
    return false;
  }

  /** The entities of the current program with the label values set on this screen. */
  private _withOverrides(live: Program, entities = live.entities): Program["entities"] {
    return entities.map((e) => {
      const mine = this._overrides.filter((o) => o.entityId === e.entity_id);
      if (!mine.length) return e;
      const overrides = { ...(e.label_overrides ?? {}) };
      for (const o of mine) {
        if (o.action) overrides[o.labelId] = o.action;
        else delete overrides[o.labelId];
      }
      return { ...e, label_overrides: overrides };
    });
  }

  private _problem(program: Program): string {
    const lang = this._lang;
    const g = this._group;
    if (!g) return "";
    if (!g.days.length) return t(lang, "err_days");
    if (g.slot.end && JSON.stringify(g.slot.start) === JSON.stringify(g.slot.end)) return t(lang, "w_err_same");
    if (!labelOf(this.data, g.slot.label)) return t(lang, "err_action");
    return "";
  }

  /**
   * The group being edited against the current profile: unchanged, merged when only its other days moved,
   * or changed meanwhile (then the editor shows the new version, or closes if it is gone).
   */
  private _checkOrigin(profile: Profile, program: Program): "ok" | "changed" {
    const origin = this._origin;
    if (!origin || !this._openId) return "ok";
    const fresh = findGroup(profile, this._include, this._minutes, this._openId);
    const state = compareOrigin(fresh, origin);
    if (state === "same") return "ok";
    if (state === "days" && fresh && this._dayOnly !== null && fresh.days.includes(this._dayOnly)) {
      this._rest = dayView(fresh, this._dayOnly).rest;
      this._origin = structuredClone(fresh);
      return "ok";
    }
    const message = t(this._lang, "ss_changed");
    if (fresh) {
      const key = this._open ?? `${program.id}|${groupId(fresh)}`;
      this._openRow(key, program, fresh);
    } else {
      this._cancel();
    }
    this._error = fresh ? message : "";
    this._note = fresh ? "" : message;
    return "changed";
  }

  private async _saveRow(): Promise<void> {
    const draft = this._group;
    const program = this._live(this._programId);
    if (!program || !draft) return;
    const problem = this._problem(program);
    if (problem) {
      this._error = problem;
      return;
    }
    const include = this._include;
    let dropped: number[] = [];
    let changed = false;
    const saved = await this._commit(program.id, (live) => {
      const profile = activeProfile(live, this.data);
      if (this._checkOrigin(profile, live) === "changed") {
        changed = true;
        return { changed: true };
      }
      let current = profile;
      if (this._base) current = applyEdit(current, include, this._minutes, this._base);
      let group = draft;
      dropped = [];
      if (this._dropBusy) {
        const { free, busy } = splitBusyDays(current, include, this._minutes, draft.slot, draft.days);
        if (!free.length) return { error: t(this._lang, "w_err_overlap") };
        group = { ...draft, days: free };
        dropped = busy;
      }
      const next = applyEdit(current, include, this._minutes, { openId: this._openId, rest: this._rest, draft: group });
      if (overlapDay(next) !== null) return { error: t(this._lang, "w_err_overlap") };
      return { program: { ...live, entities: this._withOverrides(live), profiles: live.profiles.map((p) => (p.id === profile.id ? next : p)) } };
    });
    if (saved && !changed) {
      this._cancel();
      if (dropped.length) this._note = t(this._lang, "w_dropped", { days: dropped.map((d) => strings(this._lang).days_short[d]).join(" ") });
    }
  }

  private async _deleteRow(): Promise<void> {
    const program = this._live(this._programId);
    if (!program || this._open === "new" || !this._openId) return;
    if (!(await confirmAction(this, t(this._lang, "w_confirm_slot"), t(this._lang, "yes"), t(this._lang, "no")))) return;
    const ok = await this._commit(program.id, (live) => {
      const profile = activeProfile(live, this.data);
      if (this._checkOrigin(profile, live) === "changed") return { changed: true };
      const next = applyEdit(profile, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
      return { program: { ...live, profiles: live.profiles.map((p) => (p.id === profile.id ? next : p)) } };
    });
    if (ok) this._cancel();
  }

  private async _saveRest(eid: string): Promise<void> {
    const program = this._live(this._programId) ?? this._programs[0];
    if (!program) return;
    const ok = await this._commit(program.id, (live) => ({
      program: {
        ...live,
        entities: this._withOverrides(live, live.entities.map((e) => (e.entity_id === eid ? { ...e, default_label: this._restLabel } : e))),
      },
    }));
    if (ok) this._cancel();
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
        await this.hass.callWS({ type: "weekly_planner/program/save", program: clean });
      }
      this._closeDialog();
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  /** Leave the screen and open the Home Assistant history of the device (navigate: pushState + location-changed). */
  private _openHistory(path: string): void {
    this._closeDialog();
    window.history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
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

  private _rowText(group: SlotGroup): { text: string; days: string; color: string } {
    const lang = this._lang;
    const label = labelOf(this.data, group.slot.label);
    const days = daysText(lang, strings(lang).days_short, group.days);
    return {
      text: [label?.name ?? "", this._when(group.slot)].filter(Boolean).join(" · "),
      days,
      color: label?.color ?? "var(--disabled-text-color)",
    };
  }

  private _renderRow(row: { program: Program; group: SlotGroup; key: string }) {
    const { program, group, key } = row;
    if (this._open === key && this._group) return this._renderEditor(program, key);
    const { text, days, color } = this._rowText(group);
    return html`<button class="row" aria-expanded="false" @click=${() => this._openRow(key, program, group)}>
      <span class="dot" style="background:${color}"></span>
      <span class="txt"><span class="l1">${text}</span>${this._focus === null ? html`<span class="l2">${days}</span>` : nothing}${this._programs.length > 1 ? html`<small>${program.name}</small>` : nothing}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }

  private _renderEditor(program: Program, key: string) {
    const lang = this._lang;
    const isNew = key === "new";
    const ids = this._entities.filter((e) => program.entities.some((x) => x.entity_id === e));
    return html`<div class="editor">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? program} .group=${this._group!} .entityIds=${ids}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @override-change=${(e: CustomEvent) => { e.stopPropagation(); this._onOverride(e.detail); }}
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
    return this._entities.filter((e) => program.entities.some((x) => x.entity_id === e)).map((eid) => {
      const entity = program.entities.find((x) => x.entity_id === eid)!;
      const key = `rest:${eid}`;
      const title = this._entities.length > 1 ? `${t(lang, "rest_of_time")} · ${friendlyName(this.hass, eid)}` : t(lang, "rest_of_time");
      if (this._open === key) {
        return html`<div class="editor"><h4>${title}</h4>
          <wp-label-picker allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? program} .entityIds=${[eid]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @override-change=${(e: CustomEvent) => { e.stopPropagation(); this._onOverride(e.detail); }}
            @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._restLabel = e.detail; }}></wp-label-picker>
          ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
          <div class="btns">
            <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRest(eid)}>${t(lang, "save")}</button>
            <button class="btn" @click=${() => this._cancel()}>${t(lang, "cancel")}</button>
          </div></div>`;
      }
      const label = labelOf(this.data, entity.default_label);
      return html`<button class="row rest" aria-expanded="false" @click=${() => this._expand(key, program, null, { restLabel: entity.default_label ?? null })}>
        ${label ? html`<span class="dot" style="background:${label.color}"></span>` : html`<ha-icon icon="mdi:update"></ha-icon>`}
        <span class="txt">${title} · <b>${label ? label.name : t(lang, "rest_none_short")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
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
      <wp-chart .hass=${this.hass} .data=${this.data} .program=${owner} entity-id=${this._chartEntity} date=${date}
        .slots=${this._slots} @open-history=${(e: CustomEvent<string>) => this._openHistory(e.detail)}></wp-chart>
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
        ${this._focus !== null && this._open === null ? html`<div class="focus">
          <button class="chip back" @click=${() => { this._focus = null; this._note = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${t(lang, "w_whole_week")}</button>
          <h3>${strings(lang).days[this._focus]}</h3></div>` : nothing}
        ${this._note && this._open === null ? html`<p class="muted note">${this._note}</p>` : nothing}
        <div class="list">
          ${rows.length ? rows.map((r) => this._renderRow(r)) : (this._open === "new" ? nothing : html`<p class="muted">${t(lang, "w_none")}</p>`)}
          ${this._open === "new" && this._group ? this._renderEditor(this._programs[0], "new") : nothing}
          ${this._open === null ? html`<button class="row add" ?disabled=${!this._canEdit} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? t(lang, "w_add") : t(lang, "w_add_day", { day: strings(lang).days[this._focus].toLocaleLowerCase(lang) })}</span></button>` : nothing}
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
    .note { margin: 0 0 8px; font-size: 14px; }
    .focus { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
    .focus h3 { margin: 0; font-size: 20px; font-weight: 600; }
    .chip.back {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
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
