// A day bar of the card that can be edited in place (spec § 10.8): long press / click to enter, handles on every
// boundary, saved on release for that day only, a strip under the bar for the selected slot or gap.
// All the logic lives in edits.ts (pure); this element only handles pointers, keys and saving.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import "./day-bar";
import "./dialog";
import "./label-picker";
import { confirmAction } from "./confirm";
import { sunDir, sunTip } from "./day-bar";
import type { BarSpan } from "./day-bar";
import {
  boundaries, copyConflicts, copyToDays, eff, handleMinute, mergeAdjacent, middle, moveBoundary, moveRefusal, moveSlotBy, moveToDay,
  removeSlot, segments, setLabel, splitAt,
} from "../edits";
import type { At, DayCtx, Handle, Target } from "../edits";
import { editorStyles } from "../editors/shared";
import { devicesOf, isShared, isolateForDevice, remergeIdentical, undoSlots } from "../device-edits";
import { dismissHoldHint, HOLD_HINT_MS, takeHoldHint } from "../hold-hint";
import { slotDeviceError, strings, t } from "../i18n";
import { appliedAction, labelName, labelOf, labelsFor } from "../labels";
import { activeProfile, newId } from "../planner";
import { applicable, normaliseEntities, shiftTimeSpec, specMinutes } from "../slots";
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
/** An edit of the bar written for any device choice: `id` gives the slot to work on (the device's copy for "This device"). */
type DevOp = (days: Slot[][], id: (slotId: string) => string) => Slot[][] | null;
const same = (x: string): string => x;

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
  /** A slot dragged from another day bar is above this one (drop target). */
  @property({ type: Boolean, reflect: true }) drop = false;

  @state() private _draft: Slot[] | null = null;
  @state() private _selected: Target | null = null;
  @state() private _hsel: Handle | null = null;
  @state() private _bubble: { m: number; text?: string } | null = null;
  @state() private _copyOpen = false;
  @state() private _copyDays: number[] = [];
  @state() private _conflict: { to: number[]; days: number[]; skip: number[]; id: string } | null = null;
  @state() private _error = "";
  /** An edit touches a slot shared with other devices: "This device" / "All (N)" is asked before saving (D1). */
  @state() private _ask: { op: DevOp; touched: number[]; ids: string[]; profileId: string; count: number } | null = null;
  @state() private _hover = false;
  /** A slot is being dragged: the strip is hidden so that the other day bars come back within reach. */
  @state() private _moving = false;
  /** "Press and hold to edit" shown after a plain tap (first times only). */
  @state() private _hint = false;
  private _hintTimer?: number;
  /** Edit mode was entered with the keyboard: focus goes to the first handle, then back to the bar. */
  private _kbd = false;

  private _sun = new Map<string, number>();
  private _keep = new Set<string>();
  private _awaitRev: number | null = null;
  private _clearTimer?: number;
  private _errTimer?: number;
  private _press?: { id: number; x: number; y: number; timer?: number; fired: boolean; mouse: boolean };
  private _drag?: { ref: Handle; m0: number; x0: number; id: number; moved: boolean; last: number; profileId: string; weekday: number; ctx: DayCtx };
  /** Whole-slot move: long press (edit mode), then drag along the bar (same day) or onto another day bar. */
  private _mv?: { id: number; x0: number; y0: number; slotId: string; moved: boolean; delta: number; to: WpBarEditor | null; profileId: string; weekday: number; ctx: DayCtx; refused: boolean };
  private _mvTimer?: number;
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
    const fallback = labelsFor(this.hass, this.data, [this.entityId], this.program)[0]?.id;
    const sun = new Map(this._sun);
    const devices = devicesOf(this.program);
    return {
      at: (spec) => "time" in spec ? clockToMinutes(spec.time) : sun.get(JSON.stringify(spec)) ?? specMinutes(this.hass, spec),
      // `lead` comes from this device's own spans (its previous-day spill only)
      lead: this._lead, newId: newIds ?? newId,
      defaultLabel: entity?.default_label ?? fallback,
      entity: this.entityId || undefined, devices,
      // a slot created on this row belongs to this device (absent for a single-device program, D5)
      newEntities: this.entityId ? normaliseEntities([this.entityId], devices) : undefined,
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
        if (this._kbd) this.renderRoot.querySelector<HTMLElement>(".hd")?.focus();
      }
      else {
        this._listen(false);
        if (this._kbd) this.renderRoot.querySelector<HTMLElement>(".zone")?.focus();
        this._kbd = false;
        this._flushNudge();
        this._selected = null;
        this._hsel = null;
        this._copyOpen = false;
        this._conflict = null;
        this._keep.clear();
        this._bubble = null;
        if (this._ask) { this._ask = null; this._dropDraft(); }
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
    window.clearTimeout(this._mvTimer);
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
    if (p.fired) {
      // the long press opened the edit mode and the finger is still down: dragging moves the slot under it
      if (!this._mv && this.editing) {
        const target = this._segAt(this._minuteAt(p.x).m);
        if (target?.kind === "slot") {
          this._mvBegin(e, target.id, p);
        }
      }
      this._mvMove(e);
      return;
    }
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
    if (p.fired) { // the long press already did its job
      this._mvUp(e);
      return;
    }
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

  /** Keyboard: Enter or Space on the focused bar does what a click does. */
  private _zoneKey(e: KeyboardEvent): void {
    if (this.editing || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    if (this.editable) {
      this._kbd = true;
      this._clearHint();
      dismissHoldHint();
      this._emit("edit-request");
    } else this._emit("open-day");
  }

  private _zoneCancel(): void {
    if (this._press?.fired) this._mvCancel();
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
      // a long press without moving turns the grab into a move of the whole slot under the finger (slots are
      // often narrower than the two 44 px handle zones, so the body cannot always be reached otherwise)
      const at = { x: e.clientX, y: e.clientY };
      window.clearTimeout(this._mvTimer);
      this._mvTimer = window.setTimeout(() => {
        const d = this._drag;
        const target = this._segAt(this._minuteAt(at.x).m);
        if (!d || d.moved || d.id !== e.pointerId || target?.kind !== "slot") return;
        navigator.vibrate?.(12);
        this._drag = undefined;
        this._hsel = null;
        this._mvBegin(e, target.id, at);
      }, LONG_PRESS_MS);
      return;
    }
    const target = this._segAt(m);
    this._tap = { id: e.pointerId, x: e.clientX, y: e.clientY, target };
    if (target?.kind === "slot") {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      this._mvBegin(e, target.id);
    }
  }

  /* ---- moving a whole slot ---- */

  private _mvBegin(e: PointerEvent, slotId: string, from: { x: number; y: number } = { x: e.clientX, y: e.clientY }): void {
    const ctx = this._ctx();
    const slot = this._baseDay.find((s) => s.id === slotId);
    if (!slot) return;
    this._mv = { id: e.pointerId, x0: from.x, y0: from.y, slotId, moved: false, delta: 0, to: null,
      profileId: activeProfile(this._live, this.data).id, weekday: this.weekday, ctx, refused: moveRefusal(slot, ctx) !== null };
  }

  /** The other bar of the same program and device under the pointer (another day), if any. */
  private _barAt(x: number, y: number): WpBarEditor | null {
    const root = this.getRootNode() as Document | ShadowRoot;
    const hit = root.elementsFromPoint?.(x, y).find((n) => n instanceof WpBarEditor) as WpBarEditor | undefined;
    if (!hit || hit === this || hit.weekday === this.weekday || hit.program?.id !== this.program.id || hit.entityId !== this.entityId) return null;
    return hit;
  }

  private _setDrop(bar: WpBarEditor | null): void {
    if (this._mv?.to && this._mv.to !== bar) this._mv.to.drop = false;
    if (this._mv) this._mv.to = bar;
    if (bar) bar.drop = true;
  }

  private _shift = (spec: import("../types").TimeSpec, d: number) => shiftTimeSpec(this.hass, spec, d);

  private _mvMove(e: PointerEvent): boolean {
    const mv = this._mv;
    if (!mv || mv.id !== e.pointerId) return false;
    const dx = e.clientX - mv.x0;
    if (!mv.moved) {
      if (Math.hypot(dx, e.clientY - mv.y0) < MOVE_PX) return true;
      mv.moved = true;
      this._moving = true;
      this._tap = undefined; // a drag, not a tap
      this._selected = { kind: "slot", id: mv.slotId };
      if (mv.refused) {
        const slot = this._baseDay.find((s) => s.id === mv.slotId);
        const why = slot ? moveRefusal(slot, mv.ctx) : null;
        if (why) this._fail(t(this.lang, `move_err_${why}`));
      }
    }
    if (mv.refused) return true;
    const base = this._live.profiles.find((profile) => profile.id === mv.profileId)?.days[mv.weekday];
    if (!base) { this._mvCancel(); return true; }
    const delta = dx / this._minuteAt(0).ppm;
    const bar = this._barAt(e.clientX, e.clientY);
    this._setDrop(bar);
    if (bar) {
      // the slot keeps its place on this bar until released; the bubble tells where it will land
      const probe = moveToDay(this._live.profiles.find((profile) => profile.id === mv.profileId)?.days ?? [], { day: mv.weekday, id: mv.slotId }, bar.weekday, delta, mv.ctx, this._shift);
      this._draft = null;
      this._bubble = "start" in probe ? { m: probe.start, text: t(this.lang, "move_to", { day: strings(this.lang).days_short[bar.weekday], time: this._clock(probe.start) }) } : null;
      mv.delta = delta;
      return true;
    }
    const res = moveSlotBy(base, mv.slotId, delta, mv.ctx, this._shift);
    if (res) {
      mv.delta = delta;
      this._draft = res.slots;
      this._bubble = { m: res.start };
    }
    return true;
  }

  private _mvUp(e: PointerEvent): boolean {
    const mv = this._mv;
    if (!mv || mv.id !== e.pointerId) return false;
    this._mv = undefined;
    this._moving = false;
    this._bubble = null;
    const to = mv.to;
    if (to) to.drop = false;
    if (!mv.moved || mv.refused) return true;
    const { slotId, delta, weekday, profileId, ctx } = mv;
    if (to) {
      const dest = to.weekday;
      const days = this._live.profiles.find((profile) => profile.id === profileId)?.days ?? [];
      const probe = moveToDay(days, { day: weekday, id: slotId }, dest, delta, ctx, this._shift);
      this._draft = null;
      if ("error" in probe) {
        this._fail(probe.error === "overlap" ? t(this.lang, "w_err_overlap") : probe.error === "gone" ? t(this.lang, "ss_err_save") : t(this.lang, `move_err_${probe.error}`));
        return true;
      }
      const id = newId();
      this._edit((all, of) => {
        const r = moveToDay(all, { day: weekday, id: of(slotId) }, dest, delta, { ...ctx, newId: () => id }, this._shift);
        return "days" in r ? r.days : null;
      }, [weekday, dest], [slotId], profileId);
    } else {
      this._edit((all, of) => {
        const r = moveSlotBy(all[weekday], of(slotId), delta, ctx, this._shift);
        return r ? this._with(all, weekday, r.slots) : null;
      }, [weekday], [slotId], profileId);
    }
    return true;
  }

  private _mvCancel(): void {
    if (this._mv?.to) this._mv.to.drop = false;
    if (this._mv?.moved) this._draft = null;
    this._mv = undefined;
    this._moving = false;
    this._bubble = null;
  }

  private _ovMove(e: PointerEvent): void {
    if (this._mvMove(e)) return;
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
    window.clearTimeout(this._mvTimer);
    if (this._mvUp(e)) {
      if (this._tap?.id === e.pointerId && Math.hypot(e.clientX - this._tap.x, e.clientY - this._tap.y) <= MOVE_PX && this._tap.target) this._select(this._tap.target);
      this._tap = undefined;
      return;
    }
    const d = this._drag;
    if (d && d.id === e.pointerId) {
      this._drag = undefined;
      this._bubble = null;
      if (d.moved) {
        const { ref, last } = d;
        this._edit((days, of) => {
          const r = moveBoundary(days[d.weekday], { ...ref, id: of(ref.id) }, last, d.ctx);
          return r ? this._with(days, d.weekday, r.slots) : null;
        }, [d.weekday], this._boundaryIds(ref, d.ctx), d.profileId);
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
    window.clearTimeout(this._mvTimer);
    this._mvCancel();
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
    this._edit((days, of) => {
      const r = moveBoundary(days[n.weekday], { ...n.ref, id: of(n.ref.id) }, n.m, n.ctx);
      return r ? this._with(days, n.weekday, r.slots) : null;
    }, [n.weekday], this._boundaryIds(n.ref, n.ctx), n.profileId);
  }

  /* ---- per-device edits (#34, D1) ---- */

  /** Slots moved together with a handle (the slots of its boundary on this device row). */
  private _boundaryIds(ref: Handle, ctx: DayCtx): string[] {
    const b = boundaries(this._baseDay, ctx).find((x) => x.refs.some((r) => r.id === ref.id && r.edge === ref.edge));
    return b ? [...new Set(b.refs.map((r) => r.id))] : [ref.id];
  }

  /**
   * Runs an edit of this bar. When it touches a slot shared with other devices, nothing is saved yet: the draft
   * stays on the bar and "This device" / "All (N)" is asked (D1, never a silent split). Otherwise it is saved.
   */
  private _edit(op: DevOp, touched: number[], ids: string[], profileId = activeProfile(this._live, this.data).id): void {
    const devices = devicesOf(this._live);
    const days = this._live.profiles.find((p) => p.id === profileId)?.days ?? [];
    const shared = days[this.weekday]?.filter((s) => ids.includes(s.id) && isShared(s, devices)) ?? [];
    if (!this.entityId || !shared.length) {
      void this._commit((all) => op(all, same), touched, false, profileId);
      return;
    }
    const preview = op(days, same);
    if (preview) this._draft = preview[this.weekday] ?? null;
    this._ask = { op, touched, ids, profileId, count: applicable(shared[0], devices).length };
  }

  /** The answer to "This device" / "All (N)": the pending edit is rebuilt on the current program and saved. */
  private _answer(who: "one" | "all"): void {
    const a = this._ask;
    if (!a) return;
    this._ask = null;
    if (who === "all") {
      void this._commit((all) => a.op(all, same), a.touched, false, a.profileId);
      return;
    }
    const eid = this.entityId;
    const day = this.weekday;
    const touched = [...new Set([...a.touched, day])];
    void this._commit((all) => {
      // copy-on-write on the fresh day: the shared slots are split for this device, the edit works on its copies,
      // then copies that are identical again are merged back (D1, D7)
      const devices = devicesOf(this._live);
      const iso = isolateForDevice(all[day], eid, devices, a.ids);
      const out = a.op(this._with(all, day, iso.day), (x) => iso.map.get(x) ?? x);
      return out ? out.map((d, i) => (touched.includes(i) ? remergeIdentical(d, devices).day : d)) : null;
    }, touched, false, a.profileId);
  }

  private _askCancel(): void {
    this._ask = null;
    this._dropDraft();
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
          const at = this._ctx().at;
          this._emit("edited", {
            undo: () => this._commit((days) => {
              // only the slots this edit wrote come back: another device's change made meanwhile is kept; a slot of
              // this edit changed since cannot be undone and the user is told (never a silent refusal)
              const out = days.map((d, i) => (changed.includes(i) ? undoSlots(d, before[i], merged[i]) : d));
              if (out.some((d) => d === null)) {
                this._fail(t(this.lang, "undo_changed"));
                return null;
              }
              return (out as Slot[][]).map((d, i) => (changed.includes(i) ? [...d].sort((x, y) => at(x.start) - at(y.start)) : d));
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
        this._fail(slotDeviceError(this.lang, e?.message, (eid) => String(this.hass.states[eid]?.attributes.friendly_name ?? eid))
          ?? (e?.message?.includes("overlapping_slots") ? t(this.lang, "w_err_overlap")
          : e?.code === "unauthorized" ? t(this.lang, "err_unauthorized") : t(this.lang, "ss_err_save")));
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
    this._edit((days, of) => this._with(days, this.weekday, setLabel(days[this.weekday], target.kind === "slot" ? { ...target, id: of(target.id) } : target, label, this._ctx(() => id))),
      [this.weekday], target.kind === "slot" ? [target.id] : []);
    if (target.kind === "gap") this._selected = { kind: "slot", id };
  }

  private async _nothing(): Promise<void> {
    const sel = this._sel;
    if (!sel?.slot) return;
    const id = sel.slot.id;
    if (!(await confirmAction(this, t(this.lang, "w_confirm_slot"), t(this.lang, "yes"), t(this.lang, "no")))) return;
    this._selected = null;
    this._edit((days, of) => this._with(days, this.weekday, removeSlot(days[this.weekday], of(id))), [this.weekday], [id]);
  }

  private _cut(): void {
    const sel = this._sel;
    if (!sel) return;
    const target = sel.target;
    const id = newId();
    const ctx = this._ctx(() => id);
    const res = splitAt(this._day, target, ctx);
    if (!res) return;
    if (target.kind === "gap") this._keep.add(id);
    this._hsel = res.handle;
    this._edit((days, of) => {
      const r = splitAt(days[this.weekday], target.kind === "slot" ? { ...target, id: of(target.id) } : target, this._ctx(() => id));
      return r ? this._with(days, this.weekday, r.slots) : null;
    }, [this.weekday], target.kind === "slot" ? [target.id] : []);
    void this.updateComplete.then(() => this.renderRoot.querySelector<HTMLElement>(`[data-h="${res.handle.id}:${res.handle.edge}"]`)?.focus());
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
    this._edit((days, of) => {
      const out = copyToDays(days, { day: this.weekday, id: of(id) }, to, this._ctx(), skip);
      return out === days ? null : out;
    }, touched, [id]);
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
      if (!label || !appliedAction(this.hass, this.program, this.entityId, label, slot)) continue;
      const e = eff(slot, this._at);
      out.push({
        start: e.start, end: e.end ?? e.start + 10, color: label.color, label: labelName(this.hass, label), slotId: slot.id,
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
      ${this._bubble ? html`<div class="bubble" style="left:clamp(44px, ${pct(this._bubble.m)}, calc(100% - 44px))">${this._bubble.text ?? this._clock(this._bubble.m)}</div>` : nothing}
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
      <div class="acts">
        ${sel.slot ? html`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${t(lang, "rest_none_short")}</button>` : nothing}
        <div class="grp" role="group" aria-label=${t(lang, "grp_time")}>
          <button class="act" ?disabled=${!canCut} aria-label=${`${t(lang, "cut")}. ${t(lang, "cut_hint")}`} title=${t(lang, "cut_hint")} @click=${() => this._cut()}>
            <ha-icon icon="mdi:arrow-split-vertical"></ha-icon>${t(lang, "cut")}</button>
        </div>
        ${sel.slot ? html`<div class="grp" role="group" aria-label=${t(lang, "grp_days")}>
          <button class="act ${this._copyOpen ? "on" : ""}" aria-expanded=${this._copyOpen}
            aria-label=${`${t(lang, "copy_to")} ${t(lang, "copy_hint")}`} title=${t(lang, "copy_hint")}
            @click=${() => { this._copyOpen = !this._copyOpen; this._copyDays = []; }}><ha-icon icon="mdi:content-copy"></ha-icon>${t(lang, "copy_to")}</button>
        </div>` : nothing}
      </div>
      ${this._copyOpen && sel.slot ? html`<div class="copy">
        ${days.map((name, d) => d === this.weekday ? nothing : html`<button class="dchip ${this._copyDays.includes(d) ? "on" : ""}"
          role="checkbox" aria-checked=${this._copyDays.includes(d)} @click=${() => this._toggleDay(d)}>${name}</button>`)}
        <button class="act go" ?disabled=${!this._copyDays.length} aria-label=${t(lang, "copy_go")} title=${t(lang, "copy_go")}
          @click=${() => this._copyGo()}><ha-icon icon="mdi:check"></ha-icon>${t(lang, "copy_go")}</button>
      </div>` : nothing}
      <div class="pick">
        <wp-label-picker compact readonly-settings .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${[this.entityId]}
          .value=${sel.slot?.label ?? null} @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._pickLabel(e.detail); }}></wp-label-picker>
      </div>
    </div>`;
  }

  /** "Change for: This device / All (N)" under the bar, with a way back (the edit is then dropped). */
  private _askBox() {
    const a = this._ask;
    if (!a) return nothing;
    const lang = this.lang;
    return html`<div class="ask" role="group" aria-label=${t(lang, "who_title")}>
      <span>${t(lang, "who_title")}</span>
      <div class="acts">
        <button class="act" @click=${() => this._answer("one")}><ha-icon icon="mdi:numeric-1-circle-outline"></ha-icon>${t(lang, "who_one")}</button>
        <button class="act" @click=${() => this._answer("all")}><ha-icon icon="mdi:select-all"></ha-icon>${t(lang, "who_all", { n: String(a.count) })}</button>
        <button class="act" aria-label=${t(lang, "cancel")} title=${t(lang, "cancel")} @click=${() => this._askCancel()}><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
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
      <div class="zone ${this.editing ? "editing" : ""}" tabindex=${ifDefined(this.editing ? undefined : 0)}
        role=${ifDefined(this.editing ? undefined : "button")} aria-label=${ifDefined(this.editing ? undefined : t(this.lang, "edit_bar"))}
        @keydown=${this._zoneKey}
        @pointerdown=${this._zoneDown} @pointermove=${this._zoneMove} @pointerup=${this._zoneUp}
        @pointercancel=${this._zoneCancel} @contextmenu=${(e: Event) => { if (this._press && !this._press.mouse) e.preventDefault(); }}>
        <wp-day-bar ?show-hours=${this.hours} notches lang=${this.lang} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${t(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : nothing}</wp-day-bar>
        <div class="hint" role="status">${this._hint ? t(this.lang, "hold_hint") : nothing}</div>
      </div>
      ${this.editing && !this._moving && !this._ask ? this._strip() : nothing}
      ${this._askBox()}
      ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      ${this._conflictDialog()}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; min-width: 0; }
    .zone { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .zone:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 3px; border-radius: 14px; }
    /* above the "now" line of the bar (z-index 5) */
    .hint {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 6; max-width: 96%;
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
    .ask { margin: 4px 0 8px; padding: 8px; border: 2px solid var(--primary-color); border-radius: 12px; }
    .ask > span { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; }
    .strip { margin: 4px 0 8px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .strip wp-label-picker { --mdc-icon-size: 18px; }
    .acts { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .grp { display: inline-flex; padding: 2px; border-radius: 28px; background: var(--secondary-background-color); }
    :host([drop]) .zone { outline: 2px dashed var(--primary-color); outline-offset: 3px; border-radius: 14px; }
    .pick { margin-top: 8px; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; min-width: 48px; padding: 0 12px;
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
