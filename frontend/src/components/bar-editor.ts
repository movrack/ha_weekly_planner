// A day bar of the card that can be edited in place (spec § 10.8): long press / click to enter, handles on every
// boundary, saved on release for that day only, a strip under the bar for the selected slot or gap.
// All the logic lives in edits.ts (pure); this element only handles pointers, keys and saving.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "./day-bar";
import "./dialog";
import "./label-picker";
import { confirmAction } from "./confirm";
import { sunDir, sunTip } from "./day-bar";
import type { BarSpan } from "./day-bar";
import {
  boundaries, copyConflicts, copyToDays, eff, handleMinute, mergeAdjacent, middle, moveBoundary, removeSlot, segments,
  setLabel, splitAt,
} from "../edits";
import type { At, DayCtx, Handle, Target } from "../edits";
import { editorStyles } from "../editors/shared";
import { dismissHoldHint, HOLD_HINT_MS, takeHoldHint } from "../hold-hint";
import { strings, t } from "../i18n";
import { entityAction, labelOf, labelsFor } from "../labels";
import { activeProfile, newId } from "../planner";
import { specMinutes } from "../slots";
import { DAY, clockToMinutes, fmtClock, localMinutes } from "../time";
import type { HomeAssistant, PlannerData, PreviewSlot, Program, Slot } from "../types";

const LONG_PRESS_MS = 450;
const GRAB_PX = 22; // half of the 44 px hit target
const MOVE_PX = 8;
const COMMIT_DELAY_MS = 700; // keyboard: wait for the last key press

/** Newest known version of each program saved from any bar (the pushed data may be a moment late). */
const lastSaved = new Map<string, Program>();

const newest = (a: Program | undefined, b: Program): Program => (a && a.revision > b.revision ? a : b);

type Op = (days: Slot[][]) => Slot[][] | null;

@customElement("wp-bar-editor")
export class WpBarEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: "entity-id" }) entityId = "";
  /** Day of the week of the bar (0 = Monday): the slots edited here. */
  @property({ type: Number }) weekday = 0;
  /** Spans drawn by the card (sun times resolved, previous day's tail included). */
  @property({ attribute: false }) spans: BarSpan[] = [];
  /** Resolved slots of the day (sun times) of this program. */
  @property({ attribute: false }) preview: PreviewSlot[] | undefined;
  @property({ type: Number }) now: number | null = null;
  @property({ type: Boolean }) editing = false;
  /** May the user change the programs? (else a tap just opens the schedule screen) */
  @property({ type: Boolean }) editable = false;
  /** Hour labels under the bar (today's bar only). */
  @property({ type: Boolean }) hours = false;
  @property() lang = "en";
  @property() tz = "UTC";

  @state() private _draft: Slot[] | null = null;
  @state() private _selected: Target | null = null;
  @state() private _hsel: Handle | null = null;
  @state() private _bubble: { m: number } | null = null;
  @state() private _copyOpen = false;
  @state() private _copyDays: number[] = [];
  @state() private _conflict: { to: number[]; days: number[]; skip: number[]; id: string } | null = null;
  @state() private _error = "";
  @state() private _hover = false;
  /** "Press and hold to edit" shown after a plain tap (first times only). */
  @state() private _hint = false;
  private _hintTimer?: number;

  private _sun = new Map<string, number>();
  private _keep = new Set<string>();
  private _awaitRev: number | null = null;
  private _clearTimer?: number;
  private _errTimer?: number;
  private _press?: { id: number; x: number; y: number; timer?: number; fired: boolean; mouse: boolean };
  private _drag?: { ref: Handle; m0: number; x0: number; id: number; moved: boolean; last: number; profileId: string; weekday: number; ctx: DayCtx };
  private _tap?: { id: number; x: number; y: number; target: Target | null };
  private _nudge?: { ref: Handle; m: number; timer: number; profileId: string; weekday: number; ctx: DayCtx };
  private _listening = false;

  /* ---- times of the day ---- */

  /** Minutes of a time spec on the edited day (sun times from the resolved preview). */
  private _at: At = (spec) => {
    if ("time" in spec) return clockToMinutes(spec.time);
    return this._sun.get(JSON.stringify(spec)) ?? specMinutes(this.hass, spec);
  };

  private get _live(): Program {
    return newest(lastSaved.get(this.program.id), this.program);
  }

  private get _baseDay(): Slot[] {
    return activeProfile(this._live, this.data).days[this.weekday] ?? [];
  }

  private get _day(): Slot[] {
    return this._draft ?? this._baseDay;
  }

  private get _lead(): number {
    return Math.max(0, ...this.spans.filter((s) => s.spill).map((s) => s.end));
  }

  private _ctx(newIds?: () => string): DayCtx {
    const entity = this.program.entities.find((e) => e.entity_id === this.entityId);
    const fallback = labelsFor(this.hass, this.data, [this.entityId])[0]?.id;
    const sun = new Map(this._sun);
    return {
      at: (spec) => "time" in spec ? clockToMinutes(spec.time) : sun.get(JSON.stringify(spec)) ?? specMinutes(this.hass, spec),
      lead: this._lead, newId: newIds ?? newId,
      defaultLabel: entity?.default_label ?? fallback,
    };
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("program") || changed.has("preview") || changed.has("data")) {
      this._sun = new Map();
      for (const slot of this._baseDay) {
        const r = this.preview?.find((x) => x.slot_id === slot.id);
        if (!r) continue;
        if ("sun" in slot.start) this._sun.set(JSON.stringify(slot.start), localMinutes(r.start, this.tz));
        if (slot.end && "sun" in slot.end && r.end) this._sun.set(JSON.stringify(slot.end), localMinutes(r.end, this.tz));
      }
      // the saved version reached the card: the draft is no longer needed
      if (this._awaitRev !== null && this.program.revision >= this._awaitRev) this._dropDraft();
    }
  }

  updated(changed: Map<string, unknown>): void {
    if (changed.has("editing")) {
      if (this.editing) {
        this._clearHint();
        this._listen(true);
      }
      else {
        this._listen(false);
        this._flushNudge();
        this._selected = null;
        this._hsel = null;
        this._copyOpen = false;
        this._conflict = null;
        this._keep.clear();
        this._bubble = null;
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listen(false);
    window.clearTimeout(this._clearTimer);
    window.clearTimeout(this._errTimer);
    window.clearTimeout(this._hintTimer);
    window.clearTimeout(this._press?.timer);
  }

  private _dropDraft(): void {
    this._draft = null;
    this._awaitRev = null;
    window.clearTimeout(this._clearTimer);
  }

  private _listen(on: boolean): void {
    if (on === this._listening) return;
    this._listening = on;
    const fn = on ? document.addEventListener.bind(document) : document.removeEventListener.bind(document);
    fn("pointerdown", this._outside, true);
    fn("keydown", this._escape as EventListener);
  }

  /** A touch outside this bar (and its snackbar) leaves the edit mode. */
  private _outside = (e: PointerEvent): void => {
    const path = e.composedPath();
    if (path.includes(this)) return;
    if (path.some((n) => n instanceof HTMLElement && n.classList?.contains("snack"))) return;
    this._emit("edit-exit");
  };

  private _escape = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && !this._conflict) this._emit("edit-exit");
  };

  private _emit(name: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /* ---- entering the edit mode (long press / click) ---- */

  private _zoneDown(e: PointerEvent): void {
    if (this.editing || e.button !== 0) return;
    const mouse = e.pointerType === "mouse";
    this._press = { id: e.pointerId, x: e.clientX, y: e.clientY, fired: false, mouse };
    if (this.editable && !mouse) {
      this._press.timer = window.setTimeout(() => {
        if (!this._press) return;
        this._press.fired = true;
        navigator.vibrate?.(12);
        this._clearHint();
        dismissHoldHint();
        this._emit("edit-request");
      }, LONG_PRESS_MS);
    }
  }

  private _zoneMove(e: PointerEvent): void {
    const p = this._press;
    if (!p || p.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > MOVE_PX) {
      window.clearTimeout(p.timer);
      this._press = undefined; // a scroll or a drag, not a press
    }
  }

  private _zoneUp(e: PointerEvent): void {
    const p = this._press;
    if (!p || p.id !== e.pointerId) return;
    window.clearTimeout(p.timer);
    this._press = undefined;
    if (p.fired) return; // the long press already did its job
    if (p.mouse && this.editable) this._emit("edit-request");
    else if (this.editable && !p.mouse) this._tapHint();
    else this._emit("open-day");
  }

  /** A plain touch on an editable bar: tell how to edit for 2 s, then open the day screen as before (a second tap opens it at once). */
  private _tapHint(): void {
    if (this._hint) {
      this._clearHint();
      this._emit("open-day");
      return;
    }
    if (!takeHoldHint()) {
      this._emit("open-day");
      return;
    }
    this._hint = true;
    this._hintTimer = window.setTimeout(() => {
      this._hint = false;
      this._hintTimer = undefined;
      this._emit("open-day");
    }, HOLD_HINT_MS);
  }

  private _clearHint(): void {
    window.clearTimeout(this._hintTimer);
    this._hintTimer = undefined;
    this._hint = false;
  }

  private _zoneCancel(): void {
    window.clearTimeout(this._press?.timer);
    this._press = undefined;
  }

  /* ---- pointer in the edit mode ---- */

  private get _overlay(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".ov");
  }

  private _minuteAt(clientX: number): { m: number; ppm: number } {
    const r = this._overlay?.getBoundingClientRect();
    const width = r?.width || 1;
    return { m: ((clientX - (r?.left ?? 0)) / width) * DAY, ppm: width / DAY };
  }

  private _nearest(m: number, ppm: number) {
    let best: { b: ReturnType<typeof boundaries>[number]; d: number } | undefined;
    for (const b of boundaries(this._day, this._ctx())) {
      const d = Math.abs(b.m - m) * ppm;
      if (d <= GRAB_PX && (!best || d < best.d)) best = { b, d };
    }
    return best?.b;
  }

  private _segAt(m: number): Target | null {
    const seg = segments(this._day, this._ctx()).find((s) => m >= s.start && m < s.end);
    if (!seg) return null;
    return seg.kind === "slot" ? { kind: "slot", id: seg.id } : { kind: "gap", start: seg.start, end: seg.end };
  }

  private _ovDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    this._flushNudge();
    const { m, ppm } = this._minuteAt(e.clientX);
    const near = this._nearest(m, ppm);
    if (near) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      this._drag = { ref: near.refs[0], m0: near.m, x0: e.clientX, id: e.pointerId, moved: false, last: near.m,
        profileId: activeProfile(this._live, this.data).id, weekday: this.weekday, ctx: this._ctx() };
      this._hsel = near.refs[0];
      e.preventDefault();
      return;
    }
    this._tap = { id: e.pointerId, x: e.clientX, y: e.clientY, target: this._segAt(m) };
  }

  private _ovMove(e: PointerEvent): void {
    const d = this._drag;
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x0;
      if (!d.moved && Math.abs(dx) < 3) return;
      d.moved = true;
      const base = this._live.profiles.find((profile) => profile.id === d.profileId)?.days[d.weekday];
      if (!base) { this._ovCancel(); return; }
      const res = moveBoundary(base, d.ref, d.m0 + dx / this._minuteAt(0).ppm, d.ctx);
      if (res) {
        d.last = res.m;
        this._draft = res.slots;
        this._bubble = { m: res.m };
      }
      return;
    }
    if (!this._tap && !d) {
      const { m, ppm } = this._minuteAt(e.clientX);
      this._hover = Boolean(this._nearest(m, ppm));
    }
  }

  private _ovUp(e: PointerEvent): void {
    const d = this._drag;
    if (d && d.id === e.pointerId) {
      this._drag = undefined;
      this._bubble = null;
      if (d.moved) {
        const { ref, last } = d;
        void this._commit((days) => {
          const r = moveBoundary(days[d.weekday], ref, last, d.ctx);
          return r ? this._with(days, d.weekday, r.slots) : null;
        }, [d.weekday], false, d.profileId);
      } else {
        // a tap on a one-shot marker selects it
        const slot = this._baseDay.find((s) => s.id === d.ref.id);
        if (slot && !slot.end) this._select({ kind: "slot", id: slot.id });
      }
      return;
    }
    const tap = this._tap;
    if (tap && tap.id === e.pointerId) {
      this._tap = undefined;
      if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) <= MOVE_PX && tap.target) this._select(tap.target);
    }
  }

  private _ovCancel(): void {
    if (this._drag?.moved) this._draft = null;
    this._drag = undefined;
    this._tap = undefined;
    this._bubble = null;
  }

  private _select(target: Target): void {
    const same = this._selected && JSON.stringify(this._selected) === JSON.stringify(target);
    this._selected = same ? null : target;
    this._copyOpen = false;
    this._copyDays = [];
  }

  /* ---- keyboard ---- */

  private _key(e: KeyboardEvent, ref: Handle): void {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const profileId = activeProfile(this._live, this.data).id;
    if (this._nudge && this._nudge.profileId !== profileId) {
      this._flushNudge();
      this._draft = null;
    }
    const ctx = this._nudge?.ctx ?? this._ctx();
    const base = this._draft ?? this._baseDay;
    const m = this._nudge?.m ?? handleMinute(base, ref, ctx);
    if (m === null) return;
    const res = moveBoundary(base, ref, m + (e.key === "ArrowRight" ? 15 : -15), ctx);
    if (!res) return;
    this._draft = res.slots;
    this._bubble = { m: res.m };
    window.clearTimeout(this._nudge?.timer);
    this._nudge = { ref, m: res.m, timer: window.setTimeout(() => this._flushNudge(), COMMIT_DELAY_MS), profileId, weekday: this.weekday, ctx };
  }

  private _flushNudge(): void {
    const n = this._nudge;
    if (!n) return;
    window.clearTimeout(n.timer);
    this._nudge = undefined;
    this._bubble = null;
    void this._commit((days) => {
      const r = moveBoundary(days[n.weekday], n.ref, n.m, n.ctx);
      return r ? this._with(days, n.weekday, r.slots) : null;
    }, [n.weekday], false, n.profileId);
  }

  /* ---- saving ---- */

  private _with(days: Slot[][], day: number, slots: Slot[]): Slot[][] {
    return days.map((d, i) => (i === day ? slots : d));
  }

  private _fail(message: string): void {
    this._error = message;
    window.clearTimeout(this._errTimer);
    this._errTimer = window.setTimeout(() => (this._error = ""), 5000);
  }

  /**
   * Builds the change on the CURRENT program (`op` is applied to the days of its active profile) and saves it.
   * A revision conflict is retried once on the fresh data; the user is never asked to reload.
   */
  private async _commit(op: Op, touched: number[], silent = false, profileId = activeProfile(this._live, this.data).id): Promise<boolean> {
    let live = this._live;
    for (let attempt = 0; attempt < 2; attempt++) {
      const profile = live.profiles.find((p) => p.id === profileId);
      if (!profile) { this._dropDraft(); return false; }
      const before = profile.days;
      const after = op(before);
      if (!after) {
        this._dropDraft();
        return false;
      }
      const merged = after.map((day, i) => (touched.includes(i) && day !== before[i] ? mergeAdjacent(day, this._ctx(), this._keep) : day));
      const changed = merged.map((day, i) => i).filter((i) => JSON.stringify(merged[i]) !== JSON.stringify(before[i]));
      if (!changed.length) {
        this._dropDraft();
        return true;
      }
      const program: Program = { ...live, profiles: live.profiles.map((p) => (p.id === profile.id ? { ...p, days: merged } : p)) };
      this._draft = merged[this.weekday] ?? null;
      try {
        const res = await this.hass.callWS<{ program?: Program }>({ type: "weekly_planner/program/save", program: structuredClone(program) });
        if (res?.program) {
          lastSaved.set(res.program.id, res.program);
          this._awaitRev = res.program.revision;
          window.clearTimeout(this._clearTimer);
          this._clearTimer = window.setTimeout(() => this._dropDraft(), 2500);
          if (this.program.revision >= res.program.revision) this._dropDraft();
        } else this._dropDraft();
        if (!silent) {
          const restore = changed.map((i) => [i, before[i]] as const);
          this._emit("edited", {
            undo: () => this._commit((days) => {
              // Never overwrite another editor's subsequent change to a restored day.
              if (changed.some((i) => JSON.stringify(days[i]) !== JSON.stringify(merged[i]))) return null;
              return days.map((d, i) => restore.find((r) => r[0] === i)?.[1] ?? d);
            }, changed, true, profileId),
          });
        }
        return true;
      } catch (err) {
        const e = err as { code?: string; message?: string };
        if (e?.code === "conflict" && attempt === 0) {
          try {
            const fresh = await this.hass.callWS<PlannerData>({ type: "weekly_planner/get" });
            const next = fresh.programs.find((p) => p.id === live.id);
            if (next) {
              lastSaved.set(next.id, next);
              live = next;
              continue;
            }
          } catch {
            /* reported below */
          }
        }
        this._dropDraft();
        this._fail(e?.message?.includes("overlapping_slots") ? t(this.lang, "w_err_overlap")
          : e?.code === "unauthorized" ? t(this.lang, "err_unauthorized") : t(this.lang, "ss_err_save"));
        return false;
      }
    }
    return false;
  }

  /* ---- actions of the strip ---- */

  private get _sel(): { target: Target; slot?: Slot; start: number; end: number | null } | null {
    const t0 = this._selected;
    if (!t0) return null;
    const day = this._day;
    if (t0.kind === "slot") {
      const slot = day.find((s) => s.id === t0.id);
      if (!slot) return null;
      const e = eff(slot, this._at);
      return { target: t0, slot, start: e.start, end: e.end };
    }
    const gap = segments(day, this._ctx()).find((s) => s.kind === "gap" && s.start === t0.start);
    return gap ? { target: { kind: "gap", start: gap.start, end: gap.end }, start: gap.start, end: gap.end } : null;
  }

  private _pickLabel(label: string | null): void {
    const sel = this._sel;
    if (!sel || label === null) return;
    const id = newId();
    const target = sel.target;
    void this._commit((days) => this._with(days, this.weekday, setLabel(days[this.weekday], target, label, this._ctx(() => id))), [this.weekday]);
    if (target.kind === "gap") this._selected = { kind: "slot", id };
  }

  private async _nothing(): Promise<void> {
    const sel = this._sel;
    if (!sel?.slot) return;
    const id = sel.slot.id;
    if (!(await confirmAction(this, t(this.lang, "w_confirm_slot"), t(this.lang, "yes"), t(this.lang, "no")))) return;
    this._selected = null;
    void this._commit((days) => this._with(days, this.weekday, removeSlot(days[this.weekday], id)), [this.weekday]);
  }

  private _cut(): void {
    const sel = this._sel;
    if (!sel) return;
    const target = sel.target;
    const id = newId();
    const ctx = this._ctx(() => id);
    const res = splitAt(this._day, target, ctx);
    if (!res) return;
    this._keep.add(id);
    if (target.kind === "slot") this._keep.add(target.id);
    this._hsel = res.handle;
    void this._commit((days) => {
      const r = splitAt(days[this.weekday], target, this._ctx(() => id));
      return r ? this._with(days, this.weekday, r.slots) : null;
    }, [this.weekday]).then(() => {
      void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`[data-h="${id}:start"]`)?.focus());
    });
    if (target.kind === "gap") this._selected = { kind: "slot", id };
  }

  private _toggleDay(d: number): void {
    this._copyDays = this._copyDays.includes(d) ? this._copyDays.filter((x) => x !== d) : [...this._copyDays, d];
  }

  private _copyGo(): void {
    const sel = this._sel;
    if (!sel?.slot || !this._copyDays.length) return;
    const id = sel.slot.id;
    const to = [...this._copyDays].sort((a, b) => a - b);
    const days = activeProfile(this._live, this.data).days;
    const conflicts = copyConflicts(days, { day: this.weekday, id }, to, this._ctx());
    if (conflicts.length) {
      this._conflict = { to, days: conflicts, skip: [], id };
      return;
    }
    void this._doCopy(id, to, []);
  }

  private async _doCopy(id: string, to: number[], skip: number[]): Promise<void> {
    this._conflict = null;
    this._copyOpen = false;
    this._copyDays = [];
    const touched = to.filter((d) => !skip.includes(d));
    if (!touched.length) return;
    await this._commit((days) => {
      const out = copyToDays(days, { day: this.weekday, id }, to, this._ctx(), skip);
      return out === days ? null : out;
    }, touched);
  }

  /* ---- render ---- */

  private _spansNow(): BarSpan[] {
    if (!this._draft) return this.spans;
    return [...this.spans.filter((s) => s.spill), ...this._spansOf(this._draft)];
  }

  /** Bar spans of the slots of a day (the labels that do nothing for this device are left out). */
  private _spansOf(slots: Slot[]): BarSpan[] {
    const out: BarSpan[] = [];
    for (const slot of slots) {
      const label = labelOf(this.data, slot.label);
      if (!label || !entityAction(this.program, this.entityId, label)) continue;
      const e = eff(slot, this._at);
      out.push({
        start: e.start, end: e.end ?? e.start + 10, color: label.color, label: label.name, slotId: slot.id,
        marker: e.end === null, startSun: sunDir(slot.start), endSun: slot.end ? sunDir(slot.end) : null,
        startSpec: slot.start, endSpec: slot.end ?? null,
      });
    }
    return out;
  }

  private _clock(m: number): string {
    return m >= DAY ? "24 h" : fmtClock(this.lang, m);
  }

  /** Text of a handle on a sun boundary (the icon under it does not catch the pointer while editing). */
  private _sunTitle(ref: { id: string; edge: string }, m: number): string {
    const slot = this._draft?.find((x) => x.id === ref.id);
    const spec = ref.edge === "start" ? slot?.start : slot?.end;
    return sunTip(this.lang, spec, m);
  }

  private _overlay_() {
    const day = this._day;
    const ctx = this._ctx();
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    const sel = this._sel;
    const bnds = boundaries(day, ctx);
    return html`<div class="ov ${this._hover ? "grab" : ""}"
      @pointerdown=${this._ovDown} @pointermove=${this._ovMove} @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}
      @pointerleave=${() => (this._hover = false)}>
      ${sel && sel.end !== null ? html`<div class="selbox ${sel.slot ? "" : "gap"}"
        style="left:${pct(sel.start)};width:${pct(sel.end - sel.start)}"></div>` : nothing}
      ${sel?.slot && sel.end === null ? html`<div class="selpoint" style="left:${pct(sel.start)}"></div>` : nothing}
      ${repeat(bnds, (b) => b.refs.map((r) => `${r.id}:${r.edge}`).join("+"), (b) => {
        const ref = b.refs[0];
        const on = this._hsel && b.refs.some((r) => r.id === this._hsel?.id && r.edge === this._hsel?.edge);
        return html`<button class="hd ${b.oneShot ? "dot" : ""} ${on ? "on" : ""}" style="left:clamp(0px, ${pct(b.m)}, 100%)"
          role="slider" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${b.m}
          aria-valuetext=${this._clock(b.m)} aria-label=${t(this.lang, "handle", { time: this._clock(b.m) })}
          data-h=${b.refs.map((r) => `${r.id}:${r.edge}`).join(" ")} title=${this._sunTitle(ref, b.m)}
          @keydown=${(e: KeyboardEvent) => this._key(e, ref)} @focus=${() => (this._hsel = ref)}
          ><i></i></button>`;
      })}
      ${this._bubble ? html`<div class="bubble" style="left:clamp(28px, ${pct(this._bubble.m)}, calc(100% - 28px))">${this._clock(this._bubble.m)}</div>` : nothing}
    </div>`;
  }

  private _strip() {
    const sel = this._sel;
    if (!sel) return nothing;
    const lang = this.lang;
    const ctx = this._ctx();
    const canCut = sel.end !== null && (sel.slot ? Boolean(sel.slot.end) : Boolean(ctx.defaultLabel)) && middle(sel.start, sel.end) !== null;
    const days = strings(lang).days_short;
    return html`<div class="strip" role="group">
      <wp-label-picker compact .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
        .value=${sel.slot?.label ?? null} @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._pickLabel(e.detail); }}></wp-label-picker>
      <div class="acts">
        ${sel.slot ? html`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${t(lang, "rest_none_short")}</button>` : nothing}
        <button class="act" ?disabled=${!canCut} aria-label=${t(lang, "cut")} title=${t(lang, "cut")} @click=${() => this._cut()}>
          <ha-icon icon="mdi:content-cut"></ha-icon></button>
        ${sel.slot ? html`<button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
          @click=${() => { this._copyOpen = !this._copyOpen; this._copyDays = []; }}><ha-icon icon="mdi:content-copy"></ha-icon>${t(lang, "copy_to")}</button>` : nothing}
      </div>
      ${this._copyOpen && sel.slot ? html`<div class="copy">
        ${days.map((name, d) => d === this.weekday ? nothing : html`<button class="dchip ${this._copyDays.includes(d) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(d)} @click=${() => this._toggleDay(d)}>${name}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${t(lang, "copy_go")} title=${t(lang, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${t(lang, "copy_go")}</button>
      </div>` : nothing}
    </div>`;
  }

  private _conflictDialog() {
    const c = this._conflict;
    if (!c) return nothing;
    const lang = this.lang;
    const days = strings(lang).days;
    const set = (d: number, skip: boolean) => {
      this._conflict = { ...c, skip: skip ? [...c.skip.filter((x) => x !== d), d] : c.skip.filter((x) => x !== d) };
    };
    const allSkipped = c.to.every((d) => c.skip.includes(d));
    // each day in conflict: its bar now, and what it becomes with the choice made
    const all = activeProfile(this._live, this.data).days;
    const ctx = this._ctx();
    const bar = (title: string, slots: Slot[]) => html`<div class="cfbar"><span>${title}</span>
      <wp-day-bar lang=${this.lang} notches .spans=${this._spansOf(slots)} .now=${null}></wp-day-bar></div>`;
    return html`<wp-dialog open heading=${t(lang, "conflict_title")} @closed=${(e: Event) => { e.stopPropagation(); this._conflict = null; }}>
      <div class="cf">
        ${c.days.map((d) => html`<div class="cfrow"><strong>${days[d]}</strong>
          ${bar(t(lang, "cf_before"), all[d] ?? [])}
          ${bar(t(lang, "cf_after"), c.skip.includes(d) ? all[d] ?? [] : copyToDays(all, { day: this.weekday, id: c.id }, [d], ctx)[d] ?? [])}
          <div class="seg2" role="radiogroup" aria-label=${days[d]}>
            <button role="radio" aria-checked=${!c.skip.includes(d)} class=${c.skip.includes(d) ? "" : "on"} @click=${() => set(d, false)}>${t(lang, "replace")}</button>
            <button role="radio" aria-checked=${c.skip.includes(d)} class=${c.skip.includes(d) ? "on" : ""} @click=${() => set(d, true)}>${t(lang, "skip_day")}</button>
          </div></div>`)}
      </div>
      <button slot="footer" class="btn" @click=${() => (this._conflict = null)}>${t(lang, "cancel")}</button>
      <button slot="footer" class="btn primary" ?disabled=${allSkipped} @click=${() => void this._doCopy(c.id, c.to, c.skip)}>${t(lang, "copy_go")}</button>
    </wp-dialog>`;
  }

  render() {
    if (!this.hass || !this.data || !this.program) return nothing;
    return html`
      <div class="zone ${this.editing ? "editing" : ""}"
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(e: Event) => { if (this._press && !this._press.mouse) e.preventDefault(); }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${t(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : nothing}</wp-day-bar>
        <div class="hint" role="status">${this._hint ? t(this.lang, "hold_hint") : nothing}</div>
      </div>
      ${this.editing ? this._strip() : nothing}
      ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      ${this._conflictDialog()}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; min-width: 0; }
    .zone { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .hint {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 3; max-width: 96%;
      padding: 6px 12px; border-radius: 16px; font-size: 13px; line-height: 1.3; text-align: center; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff);
    }
    .hint:empty { display: none; }
    .zone.editing { touch-action: none; cursor: default; }
    .ov { position: absolute; inset: 0; touch-action: none; z-index: 2; }
    .ov.grab { cursor: ew-resize; }
    .selbox {
      position: absolute; top: 0; bottom: 0; border: 2px solid var(--primary-text-color); border-radius: 10px;
      box-shadow: 0 0 0 1px var(--card-background-color); pointer-events: none;
    }
    .selbox.gap { border-style: dashed; }
    .selpoint {
      position: absolute; top: 4px; bottom: 4px; width: 24px; margin-left: -12px; border: 2px solid var(--primary-text-color);
      border-radius: 12px; pointer-events: none;
    }
    .hd {
      position: absolute; top: 0; bottom: 0; width: 44px; margin: 0 0 0 -22px; padding: 0; border: none; background: none;
      pointer-events: none; display: flex; align-items: center; justify-content: center; outline: none;
    }
    .hd i {
      display: block; width: 8px; height: 32px; border-radius: 4px; background: #fff;
      border: 1px solid rgba(0, 0, 0, 0.55); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.45);
    }
    .hd.dot i { width: 18px; height: 18px; border-radius: 9px; }
    .hd.on i, .hd:focus-visible i { background: var(--primary-color); border-color: #fff; box-shadow: 0 0 0 2px var(--primary-color); }
    .bubble {
      position: absolute; bottom: calc(100% + 8px); transform: translateX(-50%); padding: 4px 10px; border-radius: 10px;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 14px; font-weight: 600;
      white-space: nowrap; pointer-events: none; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .strip { margin: 4px 0 8px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .strip wp-label-picker { --mdc-icon-size: 18px; }
    .acts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; min-width: 48px; padding: 0 14px;
      border-radius: 24px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
      font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .act:hover:not(:disabled) { background: var(--secondary-background-color); }
    .act.on { border: 2px solid var(--primary-color); }
    .act:disabled { opacity: 0.4; cursor: default; }
    .act.go { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .copy { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
    .dchip {
      min-width: 48px; min-height: 48px; padding: 0 10px; border-radius: 24px; border: 1px solid var(--divider-color); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .dchip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
    .err { color: var(--error-color, #db4437); font-size: 13px; margin: 4px 0; }
    .cf { display: flex; flex-direction: column; gap: 12px; }
    .cfrow { display: flex; flex-direction: column; gap: 6px; }
    .seg2 { display: flex; flex-wrap: wrap; gap: 6px; }
    .cfbar { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px; font-size: 13px; }
    .cfbar span { color: var(--secondary-text-color); }
    .seg2 button {
      flex: 1 1 140px; min-height: 48px; padding: 0 12px; border-radius: 24px; border: 1px solid var(--divider-color); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .seg2 button.on { border: 2px solid var(--primary-color); font-weight: 600; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-bar-editor": WpBarEditor;
  }
}
