// A day schedule (bar or circular) of the card that can be edited in place (spec § 10.8): long press / click to enter, handles on every
// boundary, saved on release for that day only, a strip under the bar for the selected slot or gap.
// All the logic lives in edits.ts (pure); this element only handles pointers, keys and saving.

import { LitElement, css, html, svg, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import "./day-bar";
import { radialHoverTarget } from "./radial-day";
import { radialPointerMinute, radialPosition, radialDelta, radialSegments } from "../radial";
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
import { callout } from "../styles";
import { devicesOf, isShared, isolateForDevice, remergeIdentical, undoSlots } from "../device-edits";
import { dismissHoldHint, HOLD_HINT_MS, takeHoldHint } from "../hold-hint";
import { slotDeviceError, strings, t } from "../i18n";
import { appliedAction, labelName, labelOf, labelsFor } from "../labels";
import { onServiceNames } from "../services";
import { activeProfile, newId } from "../planner";
import { applicable, applies, normaliseEntities, shiftTimeSpec, specMinutes } from "../slots";
import { DAY, clockToMinutes, fmtClock, fmtDayEnd, localMinutes } from "../time";
import { selectedTimeText } from "../selected-time";
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
  /** Why this bar is not edited in place (a day off runs today): a tap or Enter says it instead of opening the day. */
  @property({ attribute: "locked-reason" }) lockedReason = "";
  /** Hour labels under the bar (today's bar only). */
  @property({ type: Boolean }) hours = false;
  /** Names the day-editing button for assistive technology (the program, and the device when there are several). */
  @property({ attribute: "device-name" }) deviceName = "";
  @property() lang = "en";
  @property() tz = "UTC";
  @property() view = "bar";
  @property() rest = "";
  private get _radial(): boolean { return this.view === "radial" || this.view === "radial_12h"; }
  private _pointerY = 0;
  private _polarDrag?: { x: number; y: number; minute: number };
  private _polarProgress?: { x: number; y: number; delta: number };
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
  @state() private _ask: { op: DevOp; touched: number[]; ids: string[]; profileId: string; count: number; others: string[] } | null = null;
  @state() private _hover = false;
  /** Keep identity rather than cached text: minute ticks and drafts update an open tooltip. */
  @state() private _tip: number | "now" | null = null;
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

  private _offNames?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this._offNames = onServiceNames(() => this.requestUpdate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._offNames?.();
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
        this._pointerY = p.y;
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
    else if (this.lockedReason) this._emit("locked-request");
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
    if (e.key === "Escape") this._tip = null;
    if (this.editing || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    if (this.editable) {
      this._kbd = true;
      this._clearHint();
      dismissHoldHint();
      this._emit("edit-request");
    } else if (this.lockedReason) this._emit("locked-request");
    else this._emit("open-day");
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
    if (this._radial) {
      const r = this._dialRect();
      return { m: radialPointerMinute(clientX, this._pointerY, r, this.view === "radial_12h"), ppm: r.width / 320 * 2 * Math.PI * 112 / (this.view === "radial_12h" ? 720 : DAY) };
    }
    const r = this._overlay?.getBoundingClientRect();
    const width = r?.width || 1;
    return { m: ((clientX - (r?.left ?? 0)) / width) * DAY, ppm: width / DAY };
  }

  private _dialRect() {
    const r = (this._overlay ?? this.renderRoot.querySelector(".radial-face")!).getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.width };
  }

  private _radialMovement(x: number, y: number, x0: number, y0: number): number {
    const prev = this._polarProgress ?? { x: x0, y: y0, delta: 0 };
    const delta = prev.delta + radialDelta(prev.x, prev.y, x, y, this._dialRect(), this.view === "radial_12h");
    this._polarProgress = { x, y, delta };
    return delta;
  }

  private _radialBoundaries() {
    return boundaries(this._day, this._ctx()).flatMap(b => this.view === "radial_12h" && b.m === 720
      ? ["end", "start"].flatMap(edge => {
        const refs = b.refs.filter(ref => ref.edge === edge);
        return refs.length ? [{ ...b, refs }] : [];
      }) : [b]);
  }

  private _radialNearest(x: number, y: number) {
    const r = this._dialRect();
    let best: { b: ReturnType<typeof boundaries>[number]; d: number } | undefined;
    for (const b of this._radialBoundaries()) {
      const p = radialPosition(b.m, this.view === "radial_12h", b.refs[0].edge === "end");
      const d = Math.hypot(x - r.left - p.x / 320 * r.width, y - r.top - p.y / 320 * r.height);
      if (d <= GRAB_PX && (!best || d < best.d)) best = { b, d };
    }
    return best?.b;
  }

  private _radialOverlay() {
    const sel = this._sel;
    return html`<div class="ov polar" title=${this._tipText || this._selectedTime} aria-label=${this._selectedTime} @pointerdown=${this._ovDown} @pointermove=${this._ovMove}
      @pointerup=${this._ovUp} @pointercancel=${this._ovCancel}>
      ${sel ? html`<svg class="polar-selection" viewBox="0 0 320 320" aria-hidden="true">
        ${radialSegments([{ start: sel.start, end: sel.end ?? sel.start, marker: sel.end === null, color: "", label: "" }], this.view === "radial_12h").map(s => {
          const radius = this.view === "radial_12h" && s.ring === 0 ? 78 : 112;
          const p = radialPosition(s.start, this.view === "radial_12h");
          return s.source.marker ? svg`<circle cx=${p.x} cy=${p.y} r="12" fill="none" stroke="var(--primary-text-color)" stroke-width="2" />`
            : svg`<circle cx="160" cy="160" r=${radius} fill="none" stroke="var(--primary-text-color)" stroke-width=${this.view === "radial_12h" ? 28 : 40}
                pathLength="100" stroke-dasharray="${s.fraction * 100} ${100 - s.fraction * 100}" stroke-dashoffset=${-s.offset * 100} transform="rotate(-90 160 160)" opacity=".4" />`;
        })}</svg>` : nothing}
      ${this._radialBoundaries().map((b) => {
        const ref = b.refs[0];
        const p = radialPosition(b.m, this.view === "radial_12h", ref.edge === "end");
        return html`<button class="hd dot" style="left:${p.x / 3.2}%;top:${p.y / 3.2}%" role="slider"
          aria-valuemin="0" aria-valuemax="1440" aria-valuenow=${b.m} aria-valuetext=${this._clock(b.m)}
          aria-label=${t(this.lang, "handle", { time: this._clock(b.m) })} data-h=${`${ref.id}:${ref.edge}`}
          @keydown=${(e: KeyboardEvent) => this._key(e, ref)} @focus=${() => { this._hsel = ref; this._selected = { kind: "slot", id: ref.id }; this._focusSlotTip(ref.id); }} @blur=${() => { this._tip = null; }}><i></i></button>`;
      })}
      ${!this._selectedTime && this._bubble ? html`<div class="polar-time">${this._bubble.text ?? this._clock(this._bubble.m)}</div>` : nothing}
    </div>`;
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
    this._pointerY = e.clientY;
    const { m, ppm } = this._minuteAt(e.clientX);
    const near = this._radial ? this._radialNearest(e.clientX, e.clientY) : this._nearest(m, ppm);
    this._polarProgress = undefined;
    if (this._radial) this._polarDrag = { x: e.clientX, y: e.clientY, minute: m };
    if (near) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      this._drag = { ref: near.refs[0], m0: near.m, x0: e.clientX, id: e.pointerId, moved: false, last: near.m,
        profileId: activeProfile(this._live, this.data).id, weekday: this.weekday, ctx: this._ctx() };
      this._hsel = near.refs[0];
      this._selected = { kind: "slot", id: near.refs[0].id };
      e.preventDefault();
      // a long press without moving turns the grab into a move of the whole slot under the finger (slots are
      // often narrower than the two 44 px handle zones, so the body cannot always be reached otherwise)
      const at = { x: e.clientX, y: e.clientY };
      window.clearTimeout(this._mvTimer);
      this._mvTimer = window.setTimeout(() => {
        const d = this._drag;
        this._pointerY = at.y;
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
    this._polarProgress = undefined;
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
    const delta = this._radial ? this._radialMovement(e.clientX, e.clientY, mv.x0, mv.y0) : dx / this._minuteAt(0).ppm;
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
      if (!d.moved && (this._radial ? Math.hypot(dx, e.clientY - (this._polarDrag?.y ?? e.clientY)) : Math.abs(dx)) < 3) return;
      d.moved = true;
      const base = this._live.profiles.find((profile) => profile.id === d.profileId)?.days[d.weekday];
      if (!base) { this._ovCancel(); return; }
      const res = moveBoundary(base, d.ref, d.m0 + (this._radial ? this._radialMovement(e.clientX, e.clientY, this._polarDrag?.x ?? d.x0, this._polarDrag?.y ?? e.clientY) : dx / this._minuteAt(0).ppm), d.ctx);
      if (res) {
        d.last = res.m;
        this._draft = res.slots;
        this._bubble = { m: res.m };
      }
      return;
    }
    if (!this._tap && !d) {
      this._pointerY = e.clientY;
      const { m, ppm } = this._minuteAt(e.clientX);
      this._hover = Boolean(this._radial ? this._radialNearest(e.clientX, e.clientY) : this._nearest(m, ppm));
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
    const runs = applicable(shared[0], devices);
    this._ask = { op, touched, ids, profileId, count: runs.length, others: runs.filter((d) => d !== this.entityId) };
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
    const sel0 = this._selected;
    void this._commit((all) => {
      // copy-on-write on the fresh day: the shared slots are split for this device, the edit works on its copies,
      // then copies that are identical again are merged back (D1, D7)
      const devices = devicesOf(this._live);
      const iso = isolateForDevice(all[day], eid, devices, a.ids);
      // the selection follows this device's copy (the kept part now belongs to the other devices only)
      const moved = sel0?.kind === "slot" ? iso.map.get(sel0.id) : undefined;
      if (moved) this._selected = { kind: "slot", id: moved };
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
      // copies that became identical again (other devices) are merged back into one slot (D1)
      const devices = devicesOf(live);
      const absorbed = new Map<string, string>();
      const merged = after.map((day, i) => {
        if (!touched.includes(i) || day === before[i]) return day;
        const re = remergeIdentical(mergeAdjacent(day, this._ctx(), this._keep), devices);
        for (const [k, v] of re.absorbed) absorbed.set(k, v);
        return re.day;
      });
      const sel = this._selected;
      if (sel?.kind === "slot" && absorbed.has(sel.id)) this._selected = { kind: "slot", id: absorbed.get(sel.id)! };
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
      // only a slot that runs for this device: never act on another device's slot from this row
      const slot = day.find((s) => s.id === t0.id && (!this.entityId || applies(s, this.entityId)));
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
    const lbl = labelOf(this.data, sel.slot.label);
    const what = [lbl ? labelName(this.hass, lbl) : "", this._selectedTime].filter(Boolean).join(" · ");  // say which schedule goes away
    if (!(await confirmAction(this, `${t(this.lang, "w_confirm_slot")}${what ? ` ${what}` : ""}`, t(this.lang, "slot_delete_yes"), t(this.lang, "slot_delete_no")))) return;
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

  /** Read from the draft on every pointer update; eff() intentionally clips the drawing at midnight. */
  private get _selectedTime(): string {
    const sel = this._sel;
    if (!sel) return "";
    const slot = sel.slot;
    const text = selectedTimeText(this.lang, sel.start, slot?.end ? this._at(slot.end) : sel.end,
      slot?.start, slot?.end);
    return this._bubble?.text ? `${text} · ${this._bubble.text}` : text;
  }

  private _spanTip(span: BarSpan): string {
    const sourceDay = span.spill ? activeProfile(this._live, this.data).days[(this.weekday + 6) % 7] ?? [] : this._day;
    const slot = sourceDay.find(s => s.id === span.slotId);
    const resolved = !this._draft || span.spill ? this.preview?.find(r => r.slot_id === span.slotId) : undefined;
    // Drawing is clipped at midnight; the complete occurrence retains its stored/resolved end.
    const startSpec = slot?.start ?? span.startSpec;
    const endSpec = slot?.end ?? span.endSpec;
    const start = startSpec && "time" in startSpec ? clockToMinutes(startSpec.time)
      : resolved ? localMinutes(resolved.start, this.tz) : slot ? this._at(slot.start) : span.start;
    const end = span.marker || (slot && !slot.end) ? null
      : endSpec && "time" in endSpec ? clockToMinutes(endSpec.time)
      : resolved?.end ? localMinutes(resolved.end, this.tz) : slot?.end ? this._at(slot.end) : span.end;
    return `${span.label} · ${selectedTimeText(this.lang, start, end, slot?.start ?? span.startSpec ?? undefined, slot?.end ?? span.endSpec)}`;
  }

  private get _tipText(): string {
    if (this._tip === "now") return this.now === null ? "" : t(this.lang, "now_time", { time: fmtClock(this.lang, this.now) });
    const span = this._tip === null ? undefined : this._spansNow()[this._tip];
    return span ? this._spanTip(span) : "";
  }

  /** Observe existing gesture surfaces; this never catches a press or alters handle hit targets. */
  private _tipMove(e: PointerEvent): void {
    if (e.pointerType !== "mouse" || e.buttons || this._drag || this._mv) { this._tip = null; return; }
    const spans = this._spansNow();
    if (this._radial) {
      const face = this.renderRoot.querySelector(".radial-face");
      if (face) this._tip = radialHoverTarget(spans, this.now, this.view === "radial_12h", e.clientX, e.clientY, face.getBoundingClientRect());
      return;
    }
    const bar = this.renderRoot.querySelector("wp-day-bar")?.shadowRoot?.querySelector(".bar");
    if (!bar) return;
    const r = bar.getBoundingClientRect();
    if (e.clientY < r.top - 4 || e.clientY > r.bottom + 4 || e.clientX < r.left || e.clientX > r.right) { this._tip = null; return; }
    const m = (e.clientX - r.left) / r.width * DAY;
    // Sixteen CSS pixels around the 2px line, without an intercepting hit element.
    this._tip = this.now !== null && Math.abs(m - this.now) * r.width / DAY <= 8 ? "now" : null;
    if (this._tip !== "now") for (let i = spans.length - 1; i >= 0; i--) {
      const span = spans[i];
      if (span.ignored) continue;
      if (span.marker ? Math.abs(m - span.start) * r.width / DAY <= 8 : m >= span.start && m < span.end) { this._tip = i; break; }
    }
  }

  private _focusSlotTip(id: string): void {
    const i = this._spansNow().findIndex(span => span.slotId === id && !span.spill);
    this._tip = i < 0 ? null : i;
  }

  /** Accessible name of the bar while it is not being edited: what it does, for which device and day, then what it shows. */
  /** Names drawn on the bar, reported by the bar itself (it knows which ones fit). */
  @state() private _barText = "";

  private _zoneLabel(): string {
    const day = strings(this.lang).days[this.weekday] ?? "";
    const what = this.lockedReason ? [this.deviceName, day].filter(Boolean).join(", ")
      : this.deviceName ? t(this.lang, "edit_bar_of", { name: this.deviceName, day }) : t(this.lang, "edit_bar");
    const shown = this._spansNow().filter((span) => !span.ignored).map((span) => this._spanTip(span));
    if (this.now !== null) shown.push(t(this.lang, "now_time", { time: fmtClock(this.lang, this.now) }));
    const named = shown.length ? `${what} : ${shown.join(" ; ")}` : what;
    // WCAG 2.5.3: the name starts with the text drawn on the bar (the action names), then adds the context
    return !this._radial && this._barText ? `${this._barText}, ${named}` : named;
  }

  private _tipTargets() {
    const target = (key: number | "now", text: string, m: number, from: number, to: number) => {
      const p = this._radial ? radialPosition(m, this.view === "radial_12h") : null;
      // not a tab stop: the zone is, and its name carries this text
      return html`<span class="tip-target" aria-hidden="true" title=${text}
        style=${p ? `left:${p.x / 3.2}%;top:${p.y / 3.2}%;width:24px;height:24px;transform:translate(-50%,-50%)`
          : key === "now" ? `left:${m / DAY * 100}%;top:-4px;bottom:-4px;width:16px;transform:translateX(-50%)`
          : `left:${from / DAY * 100}%;width:${Math.max(to - from, 5) / DAY * 100}%;top:0;bottom:0`}
></span>`;
    };
    return html`<div class="tip-targets ${this._radial ? "round" : ""}">
      ${this._spansNow().map((span, i) => target(i, this._spanTip(span), span.marker ? span.start : (span.start + span.end) / 2, span.start, span.end))}
      ${this.now === null ? nothing : target("now", t(this.lang, "now_time", { time: fmtClock(this.lang, this.now) }), this.now, this.now, this.now)}
    </div>`;
  }

  private _clock(m: number): string {
    return m >= DAY ? fmtDayEnd(this.lang) : fmtClock(this.lang, m);
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
    return html`<div class="ov ${this._hover ? "grab" : ""}" title=${this._tipText || this._selectedTime} aria-label=${this._selectedTime}
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
          @keydown=${(e: KeyboardEvent) => this._key(e, ref)} @focus=${() => { this._hsel = ref; this._selected = { kind: "slot", id: ref.id }; this._focusSlotTip(ref.id); }} @blur=${() => { this._tip = null; }}
          ><i></i></button>`;
      })}
      ${!this._selectedTime && this._bubble ? html`<div class="bubble" style="left:clamp(44px, ${pct(this._bubble.m)}, calc(100% - 44px))">${this._bubble.text ?? this._clock(this._bubble.m)}</div>` : nothing}
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
        ${sel.slot ? html`<button class="act" @click=${() => void this._nothing()}><ha-icon icon="mdi:close-circle-outline"></ha-icon>${t(lang, "strip_erase")}</button>` : nothing}
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
        ${this._copyDays.length ? nothing : html`<span class="copy-hint" role="status">${t(lang, "copy_pick_days")}</span>`}
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
        <button class="act" @click=${() => this._answer("one")}><ha-icon icon="mdi:numeric-1-circle-outline"></ha-icon>${t(lang, "who_one", { name: String(this.hass.states[this.entityId]?.attributes.friendly_name ?? this.entityId) })}</button>
        <button class="act" @click=${() => this._answer("all")}><ha-icon icon="mdi:select-all"></ha-icon>${a.count >= devicesOf(this._live).length ? t(lang, "who_all", { n: String(a.count) })
          : t(lang, "who_some", { me: String(this.hass.states[this.entityId]?.attributes.friendly_name ?? this.entityId), names: a.others.map((d) => String(this.hass.states[d]?.attributes.friendly_name ?? d)).join(", ") })}</button>
        <button class="act" @click=${() => this._askCancel()}><ha-icon icon="mdi:undo-variant"></ha-icon>${t(lang, "who_keep")}</button>
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

  /** Hour axis under the bar: outside the zone (a button), so its ticks are not visible text of the button (2.5.3). */
  private _hoursAxis() {
    return html`<div class="hours" aria-hidden="true">${[0, 6, 12, 18, 24].map((h) => html`<span style="left:${(h / 24) * 100}%">${h === 24 ? fmtDayEnd(this.lang) : fmtClock(this.lang, h * 60)}</span>`)}</div>`;
  }

  render() {
    if (!this.hass || !this.data || !this.program) return nothing;
    return html`
      <div class="zone ${this.editing ? "editing" : ""}" title=${this._tipText || (this.editing ? this._selectedTime : "")} tabindex=${ifDefined(this.editing ? undefined : 0)}
        role=${ifDefined(this.editing ? undefined : "button")} aria-label=${ifDefined(this.editing ? undefined : this._zoneLabel())}
        aria-disabled=${ifDefined(this.lockedReason ? "true" : undefined)} aria-describedby=${ifDefined(this.lockedReason ? "locked-reason" : undefined)}
        @keydown=${this._zoneKey}
        @pointerdown=${(e: PointerEvent) => { this._tip = null; this._zoneDown(e); }}
        @pointermove=${(e: PointerEvent) => { this._zoneMove(e); this._tipMove(e); }} @pointerup=${this._zoneUp}
        @pointerleave=${() => { this._tip = null; }}
        @pointercancel=${this._zoneCancel} @contextmenu=${(e: Event) => { if (this._press && !this._press.mouse) e.preventDefault(); }}>
        ${this.editing && !this._radial && this._selectedTime ? html`<div class="selected-time-row" style=${`grid-template-columns:minmax(0, ${Math.max(0, Math.min(DAY, (this._sel!.start + (this._sel!.end ?? this._sel!.start)) / 2))}fr) auto minmax(0, ${DAY - Math.max(0, Math.min(DAY, (this._sel!.start + (this._sel!.end ?? this._sel!.start)) / 2))}fr)`}>
          <div class="selected-time" title=${this._selectedTime} aria-label=${this._selectedTime} role="status">${this._selectedTime}</div></div>` : nothing}
        ${this._radial ? html`<div class="radial-face"><wp-radial-day passive device-name=${this.deviceName} .spans=${this._spansNow()} .now=${this.now}
          .double=${this.view === "radial_12h"} .selectedTime=${this.editing ? this._selectedTime : ""} lang=${this.lang} rest=${this.rest}></wp-radial-day>
          ${this.editing ? this._radialOverlay() : nothing}${this._tipTargets()}</div>` : html`<wp-day-bar notches ?no-tab=${!this.editing} lang=${this.lang} device-name=${this.deviceName} @visible-text=${(e: CustomEvent<string>) => { this._barText = e.detail; }} ?tall=${this.editing} .spans=${this._spansNow()} .now=${this.now}
          aria-label=${t(this.lang, "edit_bar")}>${this.editing ? this._overlay_() : nothing}${this._tipTargets()}</wp-day-bar>`}
        ${this._tipText ? html`<div id="schedule-tooltip" class="hover-tip ${this._radial ? "round" : ""}" role="tooltip"
          title=${this._tipText} aria-label=${this._tipText}>${this._tipText}</div>` : nothing}
        ${this.lockedReason ? html`<span id="locked-reason" class="sr-only">${this.lockedReason}</span>` : nothing}
        <div class="hold-hint" role="status">${this._hint ? t(this.lang, "hold_hint") : nothing}</div>
      </div>
      ${this.hours && !this._radial ? this._hoursAxis() : nothing}
      ${this.editing && !this._moving && !this._ask ? this._strip() : nothing}
      ${this._askBox()}
      ${this._error ? html`${callout("error", "", this._error, { role: "alert" })}` : nothing}
      ${this._conflictDialog()}`;
  }

  static styles = [editorStyles, css`
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    :host { display: block; min-width: 0; }
    .zone { position: relative; touch-action: pan-y; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; cursor: pointer; }
    .hours { position: relative; height: 20px; font-size: 0.75rem; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
    .tip-targets { position: absolute; inset: 0; pointer-events: none; }
    .tip-targets.round { bottom: auto; aspect-ratio: 1; }
    .tip-target { position: absolute; pointer-events: none; border-radius: 8px; }
    .tip-target:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 2px; }
    .hover-tip {
      position: absolute; bottom: calc(100% + 4px); left: 0; right: 0; margin: auto; width: max-content;
      max-width: 100%; box-sizing: border-box; padding: 6px 10px; border-radius: 8px; z-index: 8;
      pointer-events: none; overflow-wrap: anywhere; text-align: center; font-size: 0.8125rem; line-height: 1.4;
      background: var(--primary-text-color, #212121); color: var(--card-background-color, #fff);
      box-shadow: 0 2px 8px rgba(0, 0, 0, .3);
    }
    .hover-tip.round { bottom: auto; top: 12px; }
    .zone::before { content: ""; position: absolute; inset: -10px 0; } /* 28 px bar, 48 px tap area, layout unchanged */
    .zone:focus-visible { outline: 2px solid var(--wp-primary-text); outline-offset: 3px; border-radius: 14px; }
    /* above the "now" line of the bar (z-index 5) */
    .hold-hint {
      position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 6; max-width: 96%;
      padding: 6px 12px; border-radius: 16px; font-size: 0.8125rem; line-height: 1.3; text-align: center; pointer-events: none;
      background: var(--primary-text-color); color: var(--card-background-color, #fff);
    }
    .hold-hint:empty { display: none; }
    .selected-time-row { display: grid; margin-bottom: 20px; }
    .selected-time {
      grid-column: 2; min-width: 0; max-width: 100%; box-sizing: border-box;
      padding: 4px 10px; border-radius: 10px; background: var(--primary-text-color, #212121);
      color: var(--card-background-color, #fff); font-size: 0.875rem; font-weight: 600; line-height: 1.4;
      text-align: center; overflow-wrap: anywhere; pointer-events: auto;
    }
    .zone.editing { touch-action: none; cursor: default; }
    .ov { position: absolute; inset: 0; touch-action: none; z-index: 2; }
    .radial-face { position: relative; max-width: 360px; margin: auto; }
    .polar { bottom: auto; aspect-ratio: 1; }
    .polar-selection { position: absolute; inset: 0; width: 100%; pointer-events: none; }
    .polar .hd { width: 44px; height: 44px; bottom: auto; margin: -22px 0 0 -22px; }
    .polar-time { position: absolute; top: 42%; left: 32%; width: 36%; padding: 12px 0; text-align: center; background: var(--card-background-color); pointer-events: none; font-weight: 600; }
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
      background: var(--primary-text-color); color: var(--card-background-color, #fff); font-size: 0.875rem; font-weight: 600;
      white-space: nowrap; pointer-events: none; z-index: 5; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
    }
    .ask { margin: 4px 0 8px; padding: 8px; border: 2px solid var(--wp-primary-text); border-radius: 12px; }
    .ask > span { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 6px; }
    .strip { margin: 4px 0 8px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 12px; }
    .strip wp-label-picker { --mdc-icon-size: 18px; }
    .acts { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .grp { display: inline-flex; }
    :host([drop]) .zone { outline: 2px dashed var(--wp-primary-text); outline-offset: 3px; border-radius: 14px; }
    .pick { margin-top: 8px; }
    .act {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 48px; min-width: 48px; padding: 0 12px;
      border-radius: 24px; border: 1px solid var(--wp-field-border); background: none; color: var(--primary-text-color);
      font: inherit; font-size: 0.875rem; cursor: pointer; --mdc-icon-size: 20px;
    }
    .act:hover:not(:disabled) { background: var(--secondary-background-color); }
    .act.on { border: 2px solid var(--wp-primary-text); background: color-mix(in srgb, var(--wp-primary-text) 12%, transparent); }
    .act:disabled { opacity: 0.4; cursor: default; }
    /* edit actions (erase, cut, copy): flat text buttons in a row, not pills, so they differ from the setting chips */
    .strip > .acts { gap: 0; padding-bottom: 6px; border-bottom: 1px solid var(--divider-color); }
    .strip > .acts .act { border: 0; border-radius: 8px; padding: 0 10px; color: var(--wp-primary-text); font-weight: 500; }
    .strip > .acts .act.on { border: 0; }
    .act.go { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; }
    .copy-hint { flex-basis: 100%; font-size: 0.875rem; color: var(--secondary-text-color); }
    .copy { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; align-items: center; }
    .dchip {
      min-width: 48px; min-height: 48px; padding: 0 10px; border-radius: 24px; border: 1px solid var(--wp-field-border); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 0.875rem; cursor: pointer;
    }
    .dchip.on { background: var(--wp-primary-fill); border-color: var(--wp-primary-fill); color: #fff; }
    .cf { display: flex; flex-direction: column; gap: 12px; }
    .cfrow { display: flex; flex-direction: column; gap: 6px; }
    .seg2 { display: flex; flex-wrap: wrap; gap: 6px; }
    .cfbar { display: grid; grid-template-columns: 44px 1fr; align-items: center; gap: 8px; font-size: 0.8125rem; }
    .cfbar span { color: var(--secondary-text-color); }
    .seg2 button {
      flex: 1 1 140px; min-height: 48px; padding: 0 12px; border-radius: 24px; border: 1px solid var(--wp-field-border); background: none;
      color: var(--primary-text-color); font: inherit; font-size: 0.875rem; cursor: pointer;
    }
    .seg2 button.on { border: 2px solid var(--wp-primary-text); font-weight: 600; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-bar-editor": WpBarEditor;
  }
}
