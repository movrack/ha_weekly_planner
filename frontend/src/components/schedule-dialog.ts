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
import { daysText, groupSlots, slotKey, specText, ALL_DAYS } from "../actions";
import type { SlotGroup } from "../actions";
import { applyEdit, compareOrigin, dayView, findGroup, freshGroup, groupId, nextTimes, overlapPair, splitBusyDays } from "../edits";
import { devicesOf, dropDeviceSlots, editForDevice, isShared, remergeIdentical } from "../device-edits";
import type { SlotPatch } from "../device-edits";
import type { RowEdit } from "../edits";
import { appliedAction, labelName, labelOf, labelsFor } from "../labels";
import type { LabelDraft } from "./label-picker";
import { addDaysIso } from "./chart";
import { confirmAction } from "./confirm";
import { slotDeviceError, strings, t } from "../i18n";
import { loadServiceNames } from "../services";
import { activeProfile, friendlyName, newId } from "../planner";
import { deviceDays, fetchPreviewResponse } from "../preview-cache";
import { DAY, localDateIso, minutesToClock } from "../time";
import { applicable, applies, normaliseEntities, shiftTimeSpec, specMinutes, sunBoundsInvalid } from "../slots";
import { editorStyles, langOf } from "../editors/shared";
import type { Action, HomeAssistant, PlannerData, PreviewResponse, PreviewSlot, Profile, Program, Slot, TimeSpec } from "../types";

/** A program screen opened from one device row carries that device (`entityId`): its schedules are shown first. */
export type Scope = { kind: "device"; entityId: string } | { kind: "program"; programId: string; entityId?: string };

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
  /** Opened from the card's "Create a setting" button: straight to the first slot when there is none. */
  @property({ type: Boolean }) create = false;

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
  /** Preview answers of the day before and of the day shown (null: none or failed). */
  @state() private _resp: [PreviewResponse, PreviewResponse] | null = null;
  /** Device chosen with the device chips ("" : the one the screen was opened from, else the first). */
  @state() private _pick = "";
  /** Editing a slot shared with other devices from this device: "one" (this device) or "all" (D1); null: not chosen. */
  @state() private _who: "one" | "all" | null = null;
  /** The opened slot runs for more than one device. */
  @state() private _shared = false;
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

  /** Every device of the screen (the program's devices, or the one device of a device scope). */
  private get _entities(): string[] {
    if (this.scope.kind === "device") return [this.scope.entityId];
    const program = this._programs[0];
    return program ? program.entities.map((e) => e.entity_id) : [];
  }

  /** Device whose schedules are shown and edited (per-device screen, #34). */
  private get _eid(): string {
    const list = this._entities;
    if (this._pick && list.includes(this._pick)) return this._pick;
    const wanted = this.scope?.entityId;
    return wanted && list.includes(wanted) ? wanted : list[0] ?? "";
  }

  /** Devices of the program being edited (program order). */
  private _devices(program: Program | undefined = this._programs.find((p) => p.id === this._programId) ?? this._programs[0]): string[] {
    return program ? devicesOf(program) : [];
  }

  /** Resolved slots of the shown device for the chart (previous-day spill included, no duplicate). */
  private get _slots(): PreviewSlot[] | null {
    if (!this._resp) return null;
    const { today, previous } = deviceDays(this._resp[1], this._resp[0], this._eid);
    return [...(previous ?? []), ...(today ?? [])];
  }

  private get _title(): string {
    if (this.scope.kind === "device") return friendlyName(this.hass, this.scope.entityId);
    return this._programs[0]?.name ?? "";
  }

  /**
   * The screen shows and edits the slots of the chosen device only: those that target it (`applies`) and whose
   * setting it can take (a slot of an unknown setting stays visible, to be fixed).
   */
  private _include = (slot: Slot): boolean => {
    const eid = this._eid;
    if (!eid) return true;
    if (!applies(slot, eid)) return false;
    const label = labelOf(this.data, slot.label);
    const program = this._programs.find((p) => p.id === this._programId) ?? this._programs[0];
    return !label?.action || !program || Boolean(appliedAction(this.hass, program, eid, label, slot));
  };

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
    if (this.create && !this.day) {
      if (!this._rows().length && this._canEdit) this._add();
      return;
    }
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
    if (changed.has("scope") && changed.get("scope") !== undefined) this._pick = "";
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
      const results = await Promise.all([addDaysIso(date, -1), date].map((day) => fetchPreviewResponse(this.hass, programId, revision, day, profileId)));
      if (token === this._token && key === this._loaded) this._resp = [results[0], results[1]];
    } catch {
      if (token === this._token) this._resp = null;
    }
  }

  private _go(delta: number): void {
    const next = this._offset + delta;
    if (next < -BACK || next > AHEAD) return;
    this._resp = null;
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
    this._who = null;
    this._shared = Boolean(group && opts.openId && this._eid && isShared(group.slot, devicesOf(program)));
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
    this._who = null;
    this._shared = false;
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
    const eid = this._eid;
    if (!program || !eid) return;
    const first = labelsFor(this.hass, this.data, [eid], program)[0];
    const day = days.length === 1 ? days[0] : null;
    const profile = this._modeProfile(program);
    if (!profile) return;
    const times = day === null ? undefined : nextTimes(profile.days[day], this._minutes, eid);
    const group = freshGroup(first?.id ?? "", days, times);
    // a new slot belongs to the device it is created from ("Also for" adds others); absent for a single device (D5)
    const entities = normaliseEntities([eid], devicesOf(program));
    if (entities) group.slot.entities = entities;
    this._expand("new", program, group, { dayOnly: day });
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
    // a copy pushed past midnight would be empty: keep its length and end it at 24:00 instead
    if (copy.slot.end && specMinutes(this.hass, copy.slot.start) >= specMinutes(this.hass, copy.slot.end)) {
      copy.slot.start = { time: minutesToClock(Math.max(0, DAY - length)) };
      copy.slot.end = { time: minutesToClock(DAY) };
    }
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
      else if (slotDeviceError(this._lang, e?.message, (eid) => friendlyName(this.hass, eid))) this._error = slotDeviceError(this._lang, e?.message, (eid) => friendlyName(this.hass, eid))!;
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

  /** Names the two colliding slots, the day and their times (the generic sentence when nothing is found). */
  private _overlapText(profile: Profile): string {
    const lang = this._lang;
    const pair = overlapPair(profile);
    if (!pair) return t(lang, "w_err_overlap");
    const name = (slot: Slot) => {
      const label = labelOf(this.data, slot.label);
      return label ? labelName(this.hass, label) : t(lang, "w_err_overlap_slot");
    };
    const time = (slot: Slot) => `${specText(lang, slot.start)}${slot.end ? ` → ${specText(lang, slot.end)}` : ""}`;
    return t(lang, "w_err_overlap_detail", {
      day: strings(lang).days_short[pair.day],
      a: name(pair.a), a_time: time(pair.a), b: name(pair.b), b_time: time(pair.b),
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
    if (this._shared && this._who === null && this._contentChanged()) return t(lang, "who_pick");
    return "";
  }

  /** Something other than the devices changed in the open slot (times, days, setting): D1 asks for whom. */
  private _contentChanged(): boolean {
    const origin = this._origin;
    const g = this._group;
    if (!origin || !g) return false;
    const strip = (slot: Slot): string => slotKey({ ...slot, entities: undefined, seed: undefined });
    const days = [...(this._dayOnly !== null ? [this._dayOnly] : origin.days)].sort();
    return strip(g.slot) !== strip(origin.slot) || JSON.stringify([...g.days].sort()) !== JSON.stringify(days);
  }

  /** "This device" / "All (N)" for a shared slot (D1). "This device" keeps the slot's devices as they were. */
  private _pickWho(who: "one" | "all"): void {
    this._who = who;
    this._error = "";
    const g = this._group;
    const origin = this._origin;
    if (who === "one" && g && origin) {
      const { entities: _e, ...slot } = g.slot;
      this._group = { ...g, slot: origin.slot.entities ? { ...slot, entities: [...origin.slot.entities] } : slot };
    }
  }

  /** The values of the open slot that an edit for one device changes (never its id, devices or seed). */
  private _patch(slot: Slot): SlotPatch {
    const patch: SlotPatch = { start: slot.start, end: slot.end ?? null, label: slot.label };
    if (slot.conditions !== undefined) patch.conditions = slot.conditions;
    if (slot.color !== undefined) patch.color = slot.color;
    return patch;
  }

  /**
   * Days of the open group edited for this device only (D1 "This device"), rebuilt on the fresh program. On each edited
   * day the shared slot is split (copy-on-write, `editForDevice`: the kept part keeps its id, the copy gets the seed);
   * a day the slot did not have gets a copy for this device; a day taken off stops the slot for this device only.
   * Null: the slot no longer runs for the device (someone else changed it meanwhile).
   */
  private _forDevice(days: Slot[][], origin: SlotGroup, draft: SlotGroup | null, devices: string[]): Slot[][] | null {
    const eid = this._eid;
    const edited = this._dayOnly !== null ? [this._dayOnly] : origin.days;
    const wanted = draft?.days ?? [];
    for (const d of new Set([...edited, ...wanted])) {
      const id = origin.ids[d];
      if (id) {
        if (!edited.includes(d) && !wanted.includes(d)) continue;
        const res = editForDevice(days, id, eid, draft && wanted.includes(d) ? this._patch(draft.slot) : null, { devices });
        if (!res) return null;
        days = res.days;
      } else if (draft && wanted.includes(d)) {
        const { seed: _s, ...slot } = structuredClone(draft.slot);
        days = days.map((x, i) => (i === d ? [...x, { ...slot, id: newId(), entities: [eid] }] : x));
      }
    }
    return days.map((x) => [...x].sort((a, b) => this._minutes(a.start) - this._minutes(b.start)));
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
    if (this._shared && this._who === "one" && this._contentChanged()) {
      let stale = false;
      const ok = await this._commit(program.id, (live) => {
        const profile = this._editProfile(live);
        if (!profile) return { error: t(this._lang, "ss_changed") };
        if (this._checkOrigin(profile, live) === "changed" || !this._origin) { stale = true; return { changed: true }; }
        const days = this._forDevice(profile.days, this._origin, draft, devicesOf(live));
        if (!days) return { error: t(this._lang, "ss_changed") };
        const next = { ...profile, days };
        if (overlapPair(next)) return { error: this._overlapText(next) };
        return { program: { ...live, entities: this._withOverrides(live), profiles: live.profiles.map((p) => (p.id === profile.id ? next : p)) } };
      });
      if (ok && !stale) this._cancel();
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
        if (!free.length) return { error: this._overlapText(applyEdit(current, include, this._minutes, { openId: this._openId, rest: this._rest, draft })) };
        group = { ...draft, days: free };
        dropped = busy;
      }
      const edited = applyEdit(current, include, this._minutes, { openId: this._openId, rest: this._rest, draft: group });
      // copies that became identical again (other devices) are merged back into one slot (D1)
      const next = { ...edited, days: edited.days.map((d) => remergeIdentical(d, devicesOf(live)).day) };
      if (overlapPair(next)) return { error: this._overlapText(next) };
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
    if (this._shared && this._who === null) { this._error = t(this._lang, "who_pick"); return; }
    if (!(await confirmAction(this, t(this._lang, "w_confirm_slot"), t(this._lang, "yes"), t(this._lang, "no")))) return;
    const one = this._shared && this._who === "one";
    const ok = await this._commit(program.id, (live) => {
      const profile = this._editProfile(live);
      if (!profile) return { error: t(this._lang, "ss_changed") };
      if (this._checkOrigin(profile, live) === "changed") return { changed: true };
      if (one && this._origin) {
        // "This device": the slot stops for this device only, the other devices keep it (D1)
        const days = this._forDevice(profile.days, this._origin, null, devicesOf(live));
        if (!days) return { error: t(this._lang, "ss_changed") };
        return { program: { ...live, profiles: live.profiles.map((p) => (p.id === profile.id ? { ...profile, days } : p)) } };
      }
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
    const owner = this._programs[0];
    if (this.scope.kind === "program" && owner && owner.entities.length > 1 && this._eid) {
      // one device of several: only its schedules go (every mode); the program and the other devices stay
      const eid = this._eid;
      if (!(await confirmAction(this, t(this._lang, "confirm_delete_device", { name: friendlyName(this.hass, eid) }), t(this._lang, "yes"), t(this._lang, "no")))) return;
      if (await this._commit(owner.id, (live) => ({ program: dropDeviceSlots(live, eid) }))) this._closeDialog();
      return;
    }
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

  private _rowText(group: SlotGroup, program?: Program): { text: string; days: string; color: string; also: string } {
    const lang = this._lang;
    const label = labelOf(this.data, group.slot.label);
    const days = daysText(lang, strings(lang).days_short, group.days);
    // the other devices this slot also runs for (names from Home Assistant)
    const others = program ? applicable(group.slot, devicesOf(program)).filter((d) => d !== this._eid) : [];
    return {
      text: [label ? labelName(this.hass, label) : "", this._when(group.slot)].filter(Boolean).join(" · "),
      days,
      color: label?.color ?? "var(--disabled-text-color)",
      also: others.length ? t(lang, "also_short", { names: others.map((d) => friendlyName(this.hass, d)).join(", ") }) : "",
    };
  }

  private _renderRow(row: { program: Program; group: SlotGroup; key: string }) {
    const { program, group, key } = row;
    if (this._open === key && this._group) return this._renderEditor(program, key);
    const { text, days, color, also } = this._rowText(group, program);
    return html`<button class="row" aria-expanded="false" @click=${() => this._openRow(key, program, group)}>
      <span class="dot" style="background:${color}"></span>
      <span class="txt"><span class="l1">${text}</span>${this._focus === null ? html`<span class="l2">${days}</span>` : nothing}${also ? html`<small>${also}</small>` : nothing}${this._programs.length > 1 ? html`<small>${program.name}</small>` : nothing}</span>
      <ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
  }

  /** "All devices (N)", or "With <the other devices>" when the slot runs for some of them only. */
  private _whoAll(count: number, devices: string[]): string {
    if (count >= devices.length) return t(this._lang, "who_all", { n: String(count) });
    const others = this._origin ? applicable(this._origin.slot, devices).filter((d) => d !== this._eid) : [];
    return t(this._lang, "who_some", { me: friendlyName(this.hass, this._eid), names: others.map((d) => friendlyName(this.hass, d)).join(", ") });
  }

  private _renderEditor(program: Program, key: string) {
    const lang = this._lang;
    const isNew = key === "new";
    const devices = this._devices(program);
    const count = this._origin ? applicable(this._origin.slot, devices).length : devices.length;
    return html`<div class="editor">
      ${keyed(this._pickerKey, html`<wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this._draft ?? program} .group=${this._group!} .entityIds=${[this._eid]}
        .device=${this._eid} .also=${!this._shared}
        .dayOnly=${this._dayOnly} ?disabled=${!this._canEdit}
        @label-draft=${(e: CustomEvent<LabelDraft | null>) => { e.stopPropagation(); this._labelDraft = e.detail; this._error = ""; }}
        @group-change=${(e: CustomEvent<SlotGroup>) => { e.stopPropagation(); this._group = e.detail; this._error = ""; }}></wp-slot-form>`)}
      ${this._shared && !isNew ? html`<div class="who" role="radiogroup" aria-label=${t(lang, "who_title")}>
        <span>${t(lang, "who_title")}</span>
        <div class="seg">
          <button role="radio" aria-checked=${this._who === "one"} class=${this._who === "one" ? "on" : ""} ?disabled=${!this._canEdit}
            @click=${() => this._pickWho("one")}><ha-icon icon="mdi:numeric-1-circle-outline"></ha-icon>${t(lang, "who_one", { name: friendlyName(this.hass, this._eid) })}</button>
          <button role="radio" aria-checked=${this._who === "all"} class=${this._who === "all" ? "on" : ""} ?disabled=${!this._canEdit}
            @click=${() => this._pickWho("all")}><ha-icon icon="mdi:select-all"></ha-icon>${this._whoAll(count, devices)}</button>
        </div></div>` : nothing}
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
    return [this._eid].filter((e) => program.entities.some((x) => x.entity_id === e)).map((eid) => {
      const entity = program.entities.find((x) => x.entity_id === eid)!;
      const key = `rest:${eid}`;
      const title = t(lang, "rest_of_time");
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
        <span class="txt">${title}${t(lang, "colon")}<b>${label ? labelName(this.hass, label) : t(lang, "rest_untouched")}</b></span><ha-icon icon="mdi:chevron-down"></ha-icon></button>`;
    });
  }

  /** One chip per device of the program (icon and name from Home Assistant): the screen shows that device's schedules. */
  private _renderDevices() {
    if (this._entities.length < 2) return nothing;
    return html`<div class="devices" role="radiogroup" aria-label=${t(this._lang, "device_label")}>
      ${this._entities.map((eid) => {
        const on = eid === this._eid;
        return html`<button class="devchip ${on ? "on" : ""}" role="radio" aria-checked=${on} ?disabled=${this._open !== null}
          @click=${() => { this._pick = eid; this._error = ""; this._note = ""; }}>
          <ha-state-icon .hass=${this.hass} .stateObj=${this.hass.states[eid]}></ha-state-icon><span>${friendlyName(this.hass, eid)}</span></button>`;
      })}
    </div>`;
  }

  /** Keep the whole week visible, including the unsaved slot being edited. */
  private _renderWeek() {
    const lang = this._lang;
    return html`<section class="schematic" aria-label=${t(lang, "week")}>
      ${[this._eid].map((eid) => html`
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
                // only this device's slots with an action it can take (bar, dialog and chart agree)
                if (!label || !appliedAction(this.hass, program, eid, label, slot)) continue;
                const start = this._minutes(slot.start);
                const end = slot.end ? this._minutes(slot.end) : null;
                const overnight = end !== null && end < start && end < DAY / 2;
                if (d !== day && !overnight) continue;
                if (end !== null && end <= start && !overnight) continue;
                spans.push({
                  start: d === day ? start : 0,
                  end: d !== day ? end! : overnight ? DAY : end ?? start + 10,
                  color: label.color, label: labelName(this.hass, label), marker: end === null,
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
    if (!this.chart || !owner || !this._eid || this._modeOnly) return nothing;
    const date = this._date;
    const label = new Intl.DateTimeFormat(lang, { timeZone: "UTC", weekday: "short", day: "numeric", month: "short" })
      .format(new Date(`${date}T12:00:00Z`));
    return html`<section class="chart">
      <div class="nav">
        <button class="ibtn" ?disabled=${this._offset <= -BACK} aria-label=${t(lang, "previous_day")} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <span>${this._offset === 0 ? t(lang, "today") : label}</span>
        <button class="ibtn" ?disabled=${this._offset >= AHEAD} aria-label=${t(lang, "next_day")} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
      </div>
      <wp-chart show-options .hass=${this.hass} .data=${this.data} .program=${owner} entity-id=${this._eid} date=${date}
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
    const first = !rows.length && this._focus === null && !this._modeOnly;
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
            @change=${(e: Event) => { this._viewProfileId = (e.target as HTMLSelectElement).value; this._resp = null; this._error = ""; }}>
            ${missingMode ? html`<option value="" selected>${t(lang, "mode_removed")}</option>` : nothing}
            ${this._programs[0].profiles.map((p) => html`<option value=${p.id} ?selected=${p.id === this._modeProfile(this._programs[0])?.id}>${p.name}</option>`)}
          </select></label>` : nothing}
        ${this._renderDevices()}
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
          ${this._open === null ? html`<button class="row add ${first ? "first" : ""}" ?disabled=${!this._canEdit || missingMode} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon><span class="txt">${first ? t(lang, "create_setting") : this._focus === null ? t(lang, "w_add") : t(lang, "w_add_day", { day: strings(lang).days[this._focus].toLocaleLowerCase(lang) })}</span></button>` : nothing}
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
    .devices { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
    .devchip {
      display: inline-flex; align-items: center; gap: 8px; min-height: 48px; max-width: 100%; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px; cursor: pointer;
      --mdc-icon-size: 20px;
    }
    .devchip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .devchip.on { border: 2px solid var(--primary-color); font-weight: 600; }
    .devchip:disabled:not(.on) { opacity: 0.5; cursor: default; }
    .who { margin-top: 8px; }
    .who > span { display: block; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); margin-bottom: 6px; }
    .who .seg { display: flex; flex-wrap: wrap; gap: 8px; }
    .who button {
      flex: 1 1 200px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; padding: 4px 12px;
      text-align: left;
      border-radius: 24px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit;
      font-size: 15px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .who button.on { border: 2px solid var(--primary-color); font-weight: 600; }
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
    .row.add.first:not(:disabled) { border-style: solid; background: var(--primary-color); color: var(--text-primary-color, #fff); }
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
