// The one screen of a device or a schedule: its slots (one per row, expanded in place), the rest of
// the time, the chart of the day, the pause switch and the delete button.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import "./chart";
import "./day-bar";
import { sunDir, type BarSpan } from "./day-bar";
import "./dialog";
import "./label-picker";
import "./slot-form";
import { daysText, groupSlots, specText, ALL_DAYS } from "../actions";
import type { SlotGroup } from "../actions";
import { applyEdit, compareOrigin, dayView, findGroup, freshGroup, groupId, nextTimes, overlapDay, splitBusyDays } from "../edits";
import type { RowEdit } from "../edits";
import { allowedOf, compatible, entityAction, labelOf, labelsFor } from "../labels";
import type { LabelDraft } from "./label-picker";
import { addDaysIso } from "./chart";
import { confirmAction } from "./confirm";
import { strings, t } from "../i18n";
import { loadServiceNames } from "../services";
import { activeProfile, friendlyName } from "../planner";
import { fetchPreview } from "../preview-cache";
import { DAY, localDateIso } from "../time";
import { shiftTimeSpec, specMinutes, sunBoundsInvalid } from "../slots";
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
  @property({ attribute: false }) profileId: string | null = null;
  @state() private _viewProfileId: string | null = null;
  private _editProfileId: string | null = null;
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
  /** The label form open in the row (edit of its label, or a new one): saved first by the row's Save. */
  @state() private _labelDraft: LabelDraft | null = null;
  /** Changes when the label picker must start afresh (its form was saved with the row's Save). */
  @state() private _pickerKey = 0;
  /** Labels created from here, possibly not in the pushed data yet. */
  private _fresh = new Set<string>();
  @state() private _programId = "";
  @state() private _error = "";
  @state() private _saving = false;
  @state() private _toggling = false;
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

  private _modeProfile(program: Program): Profile | undefined {
    const id = this._open && program.id === this._programId ? this._editProfileId
      : this.profileId ?? (this.scope.kind === "program" ? this._viewProfileId : null);
    return id === null ? activeProfile(program, this.data) : program.profiles.find((p) => p.id === id);
  }

  private get _modeOnly(): boolean {
    return this.profileId !== null || this._programs.some((p) => this._modeProfile(p)?.id !== activeProfile(p, this.data)?.id);
  }

  private _editProfile(program: Program): Profile | undefined {
    return program.profiles.find((p) => p.id === this._editProfileId);
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
      const profile = this._open && program.id === this._programId ? this._editProfile(program) : this._modeProfile(program);
      if (!profile) continue;
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
    if (this.chart && owner && this.hass && !this._modeOnly) {
      const key = `${owner.id}|${owner.revision}|${this._modeProfile(owner)?.id}|${this._date}`;
      if (key !== this._loaded) {
        this._loaded = key;
        void this._loadPreview(owner.id, owner.revision, this._date, key, this._modeProfile(owner)?.id);
      }
    }
  }

  private get _today(): string { return localDateIso(new Date(), this._tz); }
  private get _date(): string { return addDaysIso(this._today, this._offset); }

  private async _loadPreview(programId: string, revision: number, date: string, key: string, profileId?: string): Promise<void> {
    const token = ++this._token;
    try {
      const results = await Promise.all([addDaysIso(date, -1), date].map((day) => fetchPreview(this.hass, programId, revision, day, profileId)));
      if (token === this._token && key === this._loaded) this._slots = results.flat();
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
    this._editProfileId = this._modeProfile(program)?.id ?? null;
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
    this._labelDraft = null;
    this._dropBusy = false;
    this._draft = structuredClone(program);
    this._error = "";
    this._note = "";
    // Show the top of the opened row, not the bottom of its form.
    void this.updateComplete.then(() => requestAnimationFrame(() => this._revealEditor()));
  }

  /** Brings the opened editor into view. In two columns the schematic sits beside it: scroll only if the editor's top is out of view. */
  private _revealEditor(): void {
    const editor = this.renderRoot.querySelector<HTMLElement>(".editor");
    if (!editor) return;
    const twoColumns = typeof matchMedia === "function" && matchMedia("(min-width: 768px)").matches;
    const content = this.renderRoot.querySelector("wp-dialog")?.shadowRoot?.querySelector<HTMLElement>(".content");
    if (!twoColumns || !content) { editor.scrollIntoView({ block: "start" }); return; }
    const e = editor.getBoundingClientRect();
    const c = content.getBoundingClientRect();
    if (e.top >= c.top && e.top < c.bottom) return; // already in view: do not push the schematic out of sight
    content.scrollTop += e.top - c.top;
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
    this._editProfileId = null;
    this._open = null;
    this._group = null;
    this._dayOnly = null;
    this._rest = null;
    this._openId = null;
    this._base = null;
    this._origin = null;
    this._overrides = [];
    this._labelDraft = null;
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
    const profile = this._modeProfile(program);
    if (!profile) return;
    const times = day === null ? undefined : nextTimes(profile.days[day], this._minutes);
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
    const base: RowEdit = { openId: this._openId, rest: this._rest, draft: structuredClone(g) };
    const dayOnly = this._dayOnly;
    const copy = freshGroup(g.slot.label, g.days);
    copy.slot = {
      ...structuredClone(g.slot), id: copy.slot.id,
      start: shiftTimeSpec(this.hass, start, length),
      end: end ? shiftTimeSpec(this.hass, end, length) : null,
    };
    const origin = this._origin;
    const profileId = this._editProfileId;
    this._expand("new", program, copy, { dayOnly });
    this._editProfileId = profileId;
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
      if (res?.program) {
        this._saved[program.id] = res.program;
        this.dispatchEvent(new CustomEvent("schedule-program-saved", { detail: res.program, bubbles: true, composed: true }));
      }
      return "ok";
    } catch (err) {
      const e = err as { code?: string; message?: string };
      if (e?.code === "conflict") return "conflict";
      if (e?.code === "unauthorized") this._error = t(this._lang, "err_unauthorized");
      else if (e?.message?.includes("unknown_label")) this._error = t(this._lang, "err_label");
      else if (e?.message?.includes("earliest_after_latest")) this._error = t(this._lang, "err_sun_bounds");
      else if (e?.message?.includes("random_window_too_short")) this._error = t(this._lang, "random_too_short");
      else if (e?.message?.includes("overlapping_slots")) this._error = t(this._lang, "w_err_overlap");
      else if (/offset|invalid_random_minutes|at most|at least|out of range|invalid_time|invalid_clock/i.test(e?.message ?? "")) this._error = t(this._lang, "err_time_range");
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
    if (sunBoundsInvalid(g.slot.start) || sunBoundsInvalid(g.slot.end)) return t(lang, "err_sun_bounds");
    if (g.slot.end && JSON.stringify(g.slot.start) === JSON.stringify(g.slot.end)) return t(lang, "w_err_same");
    if (!labelOf(this.data, g.slot.label) && !this._fresh.has(g.slot.label)) return t(lang, "err_action");
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
      const profileId = this._editProfileId;
      this._openRow(key, program, fresh);
      this._editProfileId = profileId;
    } else {
      this._cancel();
    }
    this._error = fresh ? message : "";
    this._note = fresh ? "" : message;
    return "changed";
  }

  /**
   * The label form of the open row is part of the row: saved first (then its values for a device become part
   * of the row's draft). False: stop, the error is shown.
   */
  private async _saveLabelDraft(): Promise<boolean> {
    const d = this._labelDraft;
    if (!d) return true;
    if (d.problem) {
      this._error = d.problem;
      return false;
    }
    this._saving = true;
    try {
      const res = await this.hass.callWS<{ label: { id: string } }>({
        type: "weekly_planner/label/save",
        label: { ...(d.id ? { id: d.id } : {}), name: d.name, color: d.color, action: d.action },
      });
      for (const o of d.overrides) this._onOverride({ entityId: o.entityId, labelId: res.label.id, action: o.action });
      if (!d.id) {
        if (this._open?.startsWith("rest:")) this._restLabel = res.label.id;
        else if (this._group) this._group = { ...this._group, slot: { ...this._group.slot, label: res.label.id } };
      }
      this._fresh.add(res.label.id);
      this._labelDraft = null;
      this._pickerKey += 1;
      return true;
    } catch (err) {
      this._error = (err as { code?: string })?.code === "unauthorized" ? t(this._lang, "err_unauthorized") : t(this._lang, "lb_err_save");
      return false;
    } finally {
      this._saving = false;
    }
  }

  private async _saveRow(): Promise<void> {
    const live = this._live(this._programId);
    if (!live || !this._editProfile(live)) { this._error = t(this._lang, "ss_changed"); return; }
    if (!(await this._saveLabelDraft())) return;
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
      const profile = this._editProfile(live);
      if (!profile) return { error: t(this._lang, "ss_changed") };
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
    if (!this._canEdit || this._saving) return;
    if (this._open === "new") {
      this._cancel();
      return;
    }
    const program = this._live(this._programId);
    if (!program || !this._openId) return;
    if (!(await confirmAction(this, t(this._lang, "w_confirm_slot"), t(this._lang, "yes"), t(this._lang, "no")))) return;
    const ok = await this._commit(program.id, (live) => {
      const profile = this._editProfile(live);
      if (!profile) return { error: t(this._lang, "ss_changed") };
      if (this._checkOrigin(profile, live) === "changed") return { changed: true };
      const next = applyEdit(profile, this._include, this._minutes, { openId: this._openId, rest: this._rest, draft: null });
      return { program: { ...live, profiles: live.profiles.map((p) => (p.id === profile.id ? next : p)) } };
    });
    if (ok) this._cancel();
  }

  private async _saveRest(eid: string): Promise<void> {
    if (!(await this._saveLabelDraft())) return;
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
    if (this._toggling) { input.checked = this._enabled; return; }
    this._toggling = true;
    try {
      if (!enabled && !(await confirmAction(this, t(this._lang, "confirm_pause", { name: this._title }), t(this._lang, "yes"), t(this._lang, "no")))) {
        input.checked = true;
        return;
      }
      for (const p of this._programs) {
        await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: p.id, enabled });
      }
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    } finally {
      this._toggling = false;
      input.checked = this._enabled;
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
      ${keyed(this._pickerKey, html`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? program} .group=${this._group!} .entityIds=${ids}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(e: CustomEvent<LabelDraft | null>) => { e.stopPropagation(); this._labelDraft = e.detail; this._error = ""; }}
        @group-change=${(e: CustomEvent<SlotGroup>) => { e.stopPropagation(); this._group = e.detail; this._error = ""; }}></wp-slot-form>`)}
      ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._saveRow()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => this._cancel()}>${t(lang, "cancel")}</button>
      </div>
      ${isNew || this._labelDraft ? nothing : html`<button class="btn dup" ?disabled=${!this._canEdit} @click=${() => this._duplicate()}>
        <ha-icon icon="mdi:content-copy"></ha-icon>${t(lang, "duplicate")}</button>`}
      <button class="btn danger-line alone" ?disabled=${this._saving || !this._canEdit} @click=${() => void this._deleteRow()}>
        <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete")}</button>
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
          ${keyed(this._pickerKey, html`<wp-label-picker embedded allow-none .hass=${this.hass} .data=${this.data} .program=${this._draft ?? program} .entityIds=${[eid]}
            .value=${this._restLabel} ?disabled=${!this._canEdit}
            @label-draft=${(e: CustomEvent<LabelDraft | null>) => { e.stopPropagation(); this._labelDraft = e.detail; this._error = ""; }}
            @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._restLabel = e.detail; }}></wp-label-picker>`)}
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

  /** Keep the whole week visible, including the unsaved slot being edited. */
  private _renderWeek() {
    const lang = this._lang;
    return html`<section class="schematic" aria-label=${t(lang, "week")}>
      ${this._entities.map((eid) => html`
        ${this._entities.length > 1 ? html`<h4>${friendlyName(this.hass, eid)}</h4>` : nothing}
        ${strings(lang).days_short.map((name, day) => {
          const spans: BarSpan[] = [];
          for (const original of [...this._programs].reverse()) {
            const program = this._live(original.id) ?? original;
            if (!program.entities.some((e) => e.entity_id === eid)) continue;
            let profile = program.id === this._programId && this._open ? this._editProfile(program) : this._modeProfile(program);
            if (!profile) continue;
            if (program.id === this._programId && this._group) {
              if (this._base) profile = applyEdit(profile, this._include, this._minutes, this._base);
              profile = applyEdit(profile, this._include, this._minutes, {
                openId: this._openId, rest: this._rest, draft: this._group,
              });
            }
            for (const d of [(day + 6) % 7, day]) {
              for (const slot of profile.days[d]) {
                const label = labelOf(this.data, slot.label);
                if (!label || !compatible(this.hass, eid, entityAction(program, eid, label)!, allowedOf(program, eid))) continue;
                const start = this._minutes(slot.start);
                const end = slot.end ? this._minutes(slot.end) : null;
                const overnight = end !== null && end < start && end < DAY / 2;
                if (d !== day && !overnight) continue;
                if (end !== null && end <= start && !overnight) continue;
                spans.push({
                  start: d === day ? start : 0,
                  end: d !== day ? end! : overnight ? DAY : end ?? start + 10,
                  color: label.color, label: label.name, marker: end === null,
                  startSun: d === day ? sunDir(slot.start) : null,
                  endSun: overnight && d === day ? null : sunDir(slot.end),
                  startSpec: slot.start, endSpec: slot.end,
                });
              }
            }
          }
          return html`<div class="schema-day"><span>${name}</span>
            <wp-day-bar lang=${lang} notches ?show-hours=${day === 6} .spans=${spans}></wp-day-bar>
          </div>`;
        })}
      `)}
    </section>`;
  }

  private _renderChart() {
    const lang = this._lang;
    const owner = this._programs[0];
    if (!this.chart || !owner || !this._chartEntity || this._modeOnly) return nothing;
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
    const missingMode = this.scope.kind === "program" && !this._modeProfile(this._programs[0]);
    return html`
      <wp-dialog open columns heading=${this._title}>
        <div class="cols">
        <div class="params">
        ${missingMode ? html`<p class="err" role="alert">${t(lang, "mode_removed")}</p>` : nothing}
        ${!this._canEdit ? html`<p class="err" role="alert">${t(lang, "read_only")}</p>` : nothing}
        ${this._error && !this._open ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
        ${this._open !== null || this._modeOnly ? nothing : html`<label class="switch">
          <span class="grow">${t(lang, "schedule_on")}</span>
          <span class="state">${this._enabled ? t(lang, "running") : t(lang, "stopped")}</span>
          <input type="checkbox" .checked=${this._enabled} ?disabled=${!this._canEdit || this._toggling}
            @change=${(e: Event) => void this._setEnabled((e.target as HTMLInputElement).checked, e.target as HTMLInputElement)} />
          <span class="track"></span>
        </label>`}
        ${this.scope.kind === "program" ? html`<label class="mode-select">${t(lang, "profile")}
          <select .value=${this._modeProfile(this._programs[0])?.id ?? ""} ?disabled=${this.profileId !== null || this._open !== null}
            @change=${(e: Event) => { this._viewProfileId = (e.target as HTMLSelectElement).value; this._slots = null; this._error = ""; }}>
            ${missingMode ? html`<option value="" selected>${t(lang, "mode_removed")}</option>` : nothing}
            ${this._programs[0].profiles.map((p) => html`<option value=${p.id} ?selected=${p.id === this._modeProfile(this._programs[0])?.id}>${p.name}</option>`)}
          </select></label>` : nothing}
        ${this._modeOnly ? html`<p class="muted note">${t(lang, "mode_schedule_hint")}</p>` : nothing}
        ${this._modeOnly ? nothing : html`<div class="rests">${this._renderRest()}</div>`}
        ${this._focus !== null && this._open === null ? html`<div class="focus">
          <button class="chip back" @click=${() => { this._focus = null; this._note = ""; }}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>${t(lang, "w_whole_week")}</button>
          <h3>${strings(lang).days[this._focus]}</h3></div>` : nothing}
        ${this._note && this._open === null ? html`<p class="muted note">${this._note}</p>` : nothing}
        <div class="list">
          ${rows.length ? rows.map((r) => this._renderRow(r)) : (this._open === "new" ? nothing : html`<p class="muted">${t(lang, "w_none")}</p>`)}
          ${this._group && (this._open === "new" || (this._open !== null && !rows.some((r) => r.key === this._open))) ? this._renderEditor(this._programs.find((p) => p.id === this._programId) ?? this._programs[0], this._open!) : nothing}
          ${this._open === null ? html`<button class="row add" ?disabled=${!this._canEdit || missingMode} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${this._focus === null ? t(lang, "w_add") : t(lang, "w_add_day", { day: strings(lang).days[this._focus].toLocaleLowerCase(lang) })}</span></button>` : nothing}
        </div>
        </div>
        <div class="area-week">${this._renderWeek()}</div>
        <div class="area-chart">${this._open !== null ? nothing : this._renderChart()}</div>
        <div class="area-delete">${this._open !== null || this._modeOnly ? nothing : html`<button class="btn danger-line alone" ?disabled=${!this._canEdit} @click=${() => void this._deleteAll()}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>${t(lang, "delete_schedule")}</button>`}</div>
        </div>
      </wp-dialog>`;
  }

  static styles = [editorStyles, css`
    :host { display: contents; }
    /* One DOM order (the phone order of section 24.2 = keyboard order). From 768 px the same order is laid out in two
       columns by the grid alone: parameters (and Delete) on the left, the 7-day schematic then the day chart on the right. */
    .cols, .params { display: block; }
    @media (min-width: 768px) {
      .cols {
        display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 24px; row-gap: 0; align-items: start;
        grid-template-rows: auto 1fr auto;
        grid-template-areas: "params week" "params chart" "delete chart";
      }
      .params { grid-area: params; min-width: 0; }
      .area-week { grid-area: week; min-width: 0; }
      .area-chart { grid-area: chart; min-width: 0; }
      .area-delete { grid-area: delete; min-width: 0; }
      .area-delete .btn.alone { margin-top: 0; }
      /* Hidden while a slot editor is open (nothing rendered): no empty grid cell. */
      .area-chart:empty, .area-delete:empty { display: none; }
    }
    .mode-select { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .mode-select select { flex: 1; min-width: 0; min-height: 44px; }
    .schematic { margin-bottom: 16px; }
    .schematic h4 { margin: 8px 0; }
    .schema-day { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 8px; align-items: center; min-height: 32px; }
    .schema-day > span { font-size: 12px; color: var(--secondary-text-color); }
    .schema-day wp-day-bar { min-width: 0; }
    .list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .rests:empty { display: none; }
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
    .switch { position: relative; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; margin-bottom: 8px; font-size: 16px; }
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
