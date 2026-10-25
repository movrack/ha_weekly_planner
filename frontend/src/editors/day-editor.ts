// Editor for the slots of ONE day of a profile: draggable 24 h bar + list of slots.
// Fixed-time edges are dragged (pointer events, 5 min snapping, magnifier); every edge also
// has -5 / +5 minute buttons. Sun-based slots are shown (☀️) but edited in the slot dialog.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/day-bar";
import type { BarSpan } from "../components/day-bar";
import { t } from "../i18n";
import { friendlyName, mainType, newId, slotColor, slotLabel, slotMode } from "../planner";
import { DAY, STEP, clockToMinutes, localMinutes, minutesToClock, nominal, slotSpans } from "../time";
import type { HomeAssistant, PlannerData, Program, Slot, TimeSpec } from "../types";
import { editorStyles, langOf } from "./setpoint-editor";
import type { K } from "./setpoint-editor";

const SUN_ATTR = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" } as const;
const SUN_DEFAULT = { dawn: 360, sunrise: 420, sunset: 1140, dusk: 1200 } as const;

/** Approximate minutes of a time spec (sun times come from the sun entity). */
export function specMinutes(hass: HomeAssistant, spec: TimeSpec): number {
  if ("time" in spec) return clockToMinutes(spec.time);
  const iso = hass.states["sun.sun"]?.attributes[SUN_ATTR[spec.sun]] as string | undefined;
  let m: number = iso ? localMinutes(iso, hass.config.time_zone) : SUN_DEFAULT[spec.sun];
  m += spec.offset ?? 0;
  if (spec.earliest) m = Math.max(m, clockToMinutes(spec.earliest));
  if (spec.latest) m = Math.min(m, clockToMinutes(spec.latest));
  return Math.max(0, Math.min(DAY, m));
}

/** Interval occupied by a slot made of fixed times only (null otherwise). */
export function fixedInterval(slot: Slot): [number, number] | null {
  const s = nominal(slot.start);
  if (s === null || !slot.end) return null;
  const e = nominal(slot.end);
  if (e === null) return null;
  return e > s ? [s, e] : [s, DAY];
}

/** First pair of overlapping fixed-time slots, as the server checks them. */
export function findOverlap(slots: Slot[]): [Slot, Slot] | null {
  const timed = slots
    .map((slot) => ({ slot, iv: fixedInterval(slot) }))
    .filter((x): x is { slot: Slot; iv: [number, number] } => x.iv !== null)
    .sort((a, b) => a.iv[0] - b.iv[0]);
  for (let i = 1; i < timed.length; i++) {
    if (timed[i].iv[0] < timed[i - 1].iv[1]) return [timed[i - 1].slot, timed[i].slot];
  }
  return null;
}

export function sortSlots(hass: HomeAssistant, slots: Slot[]): Slot[] {
  return [...slots].sort((a, b) => specMinutes(hass, a.start) - specMinutes(hass, b.start));
}

export function slotTimeText(hass: HomeAssistant, slot: Slot, lang: string): string {
  const side = (spec: TimeSpec): string => {
    if ("time" in spec) return spec.time;
    const off = spec.offset ? ` ${spec.offset > 0 ? "+" : "−"}${Math.abs(spec.offset)} min` : "";
    return `☀️ ${t(lang, `sun_${spec.sun}` as K)}${off} (≈${minutesToClock(specMinutes(hass, spec))})`;
  };
  if (!slot.end) return `${side(slot.start)} · ${t(lang, "one_shot")}`;
  return `${side(slot.start)} → ${side(slot.end)}`;
}

/** Bar spans of a day (sun times approximated), plus the spill-over of the previous day. */
export function daySpans(
  hass: HomeAssistant, data: PlannerData, program: Program, slots: Slot[], spill: number,
): BarSpan[] {
  const lang = langOf(hass);
  const spans: BarSpan[] = [];
  if (spill > 0) {
    spans.push({ start: 0, end: spill, color: "var(--secondary-text-color)", label: t(lang, "previous_day"), ignored: "spill" });
  }
  for (const slot of slots) {
    const start = specMinutes(hass, slot.start);
    const end = slot.end ? specMinutes(hass, slot.end) : null;
    const [[a, b]] = slotSpans(slot, { start, end });
    const sun = !("time" in slot.start) || Boolean(slot.end && !("time" in slot.end));
    spans.push({
      start: a, end: b, sun, color: slotColor(slot, program, data.modes),
      label: `${slotLabel(slot, program, data.modes, t(lang, "slot_direct"))} ${slotTimeText(hass, slot, lang)}`,
    });
  }
  return spans;
}

interface Ref { id: string; which: "start" | "end" }
interface Edge { key: string; min: number; refs: Ref[] }

@customElement("wp-day-editor")
export class WpDayEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: false }) slots: Slot[] = [];
  /** Minutes of the previous day's slots that spill over midnight onto this day. */
  @property({ type: Number }) spill = 0;
  @property({ type: Number }) day = 0;
  @state() private _drag?: { refs: Ref[]; lo: number; hi: number; min: number; moved: boolean };
  @state() private _dragSlots?: Slot[];
  @state() private _notice = "";

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }
  private get _slots(): Slot[] { return this._dragSlots ?? this.slots; }

  /* ---- geometry ---- */

  private _edges(slots: Slot[]): Edge[] {
    const map = new Map<number, Ref[]>();
    const add = (min: number, ref: Ref) => map.set(min, [...(map.get(min) ?? []), ref]);
    for (const slot of slots) {
      const s = nominal(slot.start);
      if (s !== null) add(s, { id: slot.id, which: "start" });
      const e = nominal(slot.end ?? null);
      if (s !== null && e !== null && e > s) add(e, { id: slot.id, which: "end" });
    }
    return [...map.entries()].map(([min, refs]) => ({ key: refs.map((r) => r.id + r.which).join("|"), min, refs }));
  }

  private _bounds(slots: Slot[], refs: Ref[], pos: number): [number, number] {
    let lo = 0;
    let hi = DAY;
    for (const ref of refs) {
      const slot = slots.find((s) => s.id === ref.id);
      if (!slot) continue;
      const s = nominal(slot.start) ?? 0;
      const e = slot.end ? nominal(slot.end) : null;
      const crossing = e !== null && e <= s;
      if (ref.which === "start") {
        if (e !== null && !crossing) hi = Math.min(hi, e - STEP);
        else hi = Math.min(hi, DAY - STEP);
        if (crossing) lo = Math.max(lo, e!);
      } else if (crossing) {
        lo = Math.max(lo, STEP);
        hi = Math.min(hi, s);
      } else {
        lo = Math.max(lo, s + STEP);
      }
    }
    const ids = new Set(refs.map((r) => r.id));
    const pointsOnly = refs.every((r) => {
      const slot = slots.find((s) => s.id === r.id);
      return r.which === "start" && !slot?.end;
    });
    if (!pointsOnly) {
      for (const other of slots) {
        if (ids.has(other.id)) continue;
        const iv = fixedInterval(other);
        if (!iv) continue;
        if (iv[1] <= pos) lo = Math.max(lo, iv[1]);
        else if (iv[0] >= pos) hi = Math.min(hi, iv[0]);
      }
    }
    return [lo, hi];
  }

  private _apply(slots: Slot[], refs: Ref[], min: number): Slot[] {
    const time = { time: minutesToClock(min) };
    return slots.map((slot) => {
      const ref = refs.find((r) => r.id === slot.id);
      if (!ref) return slot;
      return ref.which === "start" ? { ...slot, start: time } : { ...slot, end: time };
    });
  }

  private _emitSlots(slots: Slot[]): void {
    this.dispatchEvent(new CustomEvent("wp-change", { detail: slots, bubbles: true, composed: true }));
  }

  private _snap(min: number): number {
    return Math.round(min / STEP) * STEP;
  }

  /* ---- drag ---- */

  private _down(ev: PointerEvent, edge: Edge): void {
    if (ev.button !== 0 && ev.pointerType === "mouse") return;
    const target = ev.currentTarget as HTMLElement;
    target.setPointerCapture(ev.pointerId);
    const [lo, hi] = this._bounds(this.slots, edge.refs, edge.min);
    this._drag = { refs: edge.refs, lo, hi, min: edge.min, moved: false };
    this._dragSlots = this.slots;
    ev.preventDefault();
  }

  private _move(ev: PointerEvent): void {
    const drag = this._drag;
    const track = this.renderRoot.querySelector<HTMLElement>(".track");
    if (!drag || !track) return;
    const rect = track.getBoundingClientRect();
    const raw = ((ev.clientX - rect.left) / rect.width) * DAY;
    const min = Math.max(drag.lo, Math.min(drag.hi, this._snap(raw)));
    if (min === drag.min) return;
    this._drag = { ...drag, min, moved: true };
    this._dragSlots = this._apply(this.slots, drag.refs, min);
  }

  private _up(ev: PointerEvent): void {
    const drag = this._drag;
    const target = ev.currentTarget as HTMLElement;
    if (target.hasPointerCapture?.(ev.pointerId)) target.releasePointerCapture(ev.pointerId);
    const slots = this._dragSlots;
    this._drag = undefined;
    this._dragSlots = undefined;
    if (drag?.moved && slots) this._emitSlots(slots);
  }

  private _cancel(): void {
    this._drag = undefined;
    this._dragSlots = undefined;
  }

  /* ---- keyboard / buttons ---- */

  private _nudge(refs: Ref[], current: number, delta: number): void {
    const [lo, hi] = this._bounds(this.slots, refs, current);
    const min = Math.max(lo, Math.min(hi, this._snap(current + delta)));
    if (min === current) return;
    this._notice = "";
    this._emitSlots(this._apply(this.slots, refs, min));
  }

  private _onKey(ev: KeyboardEvent, edge: Edge): void {
    const step = ev.shiftKey ? 60 : STEP;
    let delta = 0;
    if (ev.key === "ArrowLeft" || ev.key === "ArrowDown") delta = -step;
    else if (ev.key === "ArrowRight" || ev.key === "ArrowUp") delta = step;
    else return;
    ev.preventDefault();
    this._nudge(edge.refs, edge.min, delta);
  }

  /* ---- actions ---- */

  private _newSlot(): Slot {
    const modes = this.data.modes.filter((m) => m.type === mainType(this.program));
    const taken = this._slots.map(fixedInterval).filter((iv): iv is [number, number] => iv !== null).sort((a, b) => a[0] - b[0]);
    let start = 480;
    for (const [s, e] of taken) if (start >= s && start < e) start = e;
    if (start > DAY - 60) start = DAY - 60;
    const end = Math.min(DAY, start + 60);
    return {
      id: newId(),
      start: { time: minutesToClock(start) },
      end: { time: minutesToClock(end) },
      conditions: [],
      actions: { by_type: modes[0] ? { [mainType(this.program)]: modes[0].id } : {}, by_entity: {} },
    };
  }

  private _edit(slot: Slot, isNew: boolean): void {
    this.dispatchEvent(new CustomEvent("edit-slot", { detail: { slot, isNew }, bubbles: true, composed: true }));
  }

  /* ---- render ---- */

  private _slotText(slots: Slot[], id: string): string {
    const slot = slots.find((s) => s.id === id);
    return slot ? slotTimeText(this.hass, slot, this._lang) : "";
  }

  private _actionText(slot: Slot): string {
    const mode = slotMode(slot, this.program, this.data.modes);
    const names = Object.values(slot.actions.by_type)
      .map((id) => this.data.modes.find((m) => m.id === id)?.name)
      .filter(Boolean);
    if (names.length) return names.join(" · ");
    const entities = Object.keys(slot.actions.by_entity).map((e) => friendlyName(this.hass, e));
    return mode?.name ?? (entities.length ? entities.join(", ") : this._tr("slot_direct"));
  }

  private _stepper(slot: Slot, which: "start" | "end", spec: TimeSpec | null | undefined) {
    if (!spec) return html`<span class="muted">${this._tr("one_shot")}</span>`;
    if (!("time" in spec)) {
      return html`<span class="time sun">${slotTimeText(this.hass, { ...slot, start: spec, end: null } as Slot, this._lang).replace(` · ${this._tr("one_shot")}`, "")}</span>`;
    }
    const min = clockToMinutes(spec.time);
    const refs: Ref[] = [{ id: slot.id, which }];
    const [lo, hi] = this._bounds(this._slots, refs, min);
    const label = this._tr(which === "start" ? "slot_start" : "slot_end");
    return html`
      <span class="stepper">
        <button class="ibtn" ?disabled=${min - STEP < lo} @click=${() => this._nudge(refs, min, -STEP)}
          aria-label=${`${label} −5 min`}>−5</button>
        <span class="time">${spec.time}</span>
        <button class="ibtn" ?disabled=${min + STEP > hi} @click=${() => this._nudge(refs, min, STEP)}
          aria-label=${`${label} +5 min`}>+5</button>
      </span>`;
  }

  render() {
    const slots = this._slots;
    const spans = daySpans(this.hass, this.data, this.program, slots, this.spill);
    const edges = this._edges(slots);
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    const drag = this._drag;
    const sorted = sortSlots(this.hass, slots);
    return html`
      <div class="wrap">
        <div class="track">
          <wp-day-bar .spans=${spans} show-hours></wp-day-bar>
          <div class="handles">
            ${edges.map((edge) => {
              const active = drag && edge.refs.some((r) => drag.refs.some((d) => d.id === r.id && d.which === r.which));
              const [lo, hi] = this._bounds(slots, edge.refs, edge.min);
              const text = minutesToClock(edge.min);
              return html`<button class="handle ${active ? "active" : ""}" style="left:${pct(edge.min)}"
                role="slider" aria-orientation="horizontal"
                aria-label=${edge.refs.map((r) => `${r.which === "start" ? this._tr("slot_start") : this._tr("slot_end")} ${this._slotText(slots, r.id)}`).join(" / ")}
                aria-valuemin=${lo} aria-valuemax=${hi} aria-valuenow=${edge.min} aria-valuetext=${text}
                @pointerdown=${(e: PointerEvent) => this._down(e, edge)}
                @pointermove=${(e: PointerEvent) => this._move(e)}
                @pointerup=${(e: PointerEvent) => this._up(e)}
                @pointercancel=${() => this._cancel()}
                @keydown=${(e: KeyboardEvent) => this._onKey(e, edge)}><span class="grip"></span></button>`;
            })}
            ${drag
              ? html`<div class="loupe" style="left:${pct(drag.min)}" aria-hidden="true">
                  <span>${minutesToClock(drag.min)}</span></div>`
              : nothing}
          </div>
        </div>
      </div>
      ${this.spill > 0 ? html`<p class="hint">${this._tr("spill_hint", { time: minutesToClock(this.spill) })}</p>` : nothing}
      ${this._notice ? html`<p class="error" role="alert">${this._notice}</p>` : nothing}
      <div class="list">
        ${sorted.length === 0 ? html`<p class="muted">${this._tr("no_slots")}</p>` : nothing}
        ${sorted.map(
          (slot) => html`
            <div class="slot">
              <span class="dot" style="background:${slotColor(slot, this.program, this.data.modes)}"></span>
              <div class="grow">
                <div class="times">
                  ${this._stepper(slot, "start", slot.start)}
                  ${slot.end ? html`<span class="muted">→</span>${this._stepper(slot, "end", slot.end)}` : html`<span class="muted">· ${this._tr("one_shot")}</span>`}
                </div>
                <div class="action muted">${this._actionText(slot)}${
                  slot.conditions?.length ? ` · ${this._tr("slot_conditions")}: ${slot.conditions.length}` : ""}</div>
              </div>
              <button class="ibtn" aria-label=${`${this._tr("edit")} ${slotTimeText(this.hass, slot, this._lang)}`}
                @click=${() => this._edit(slot, false)}>✏️</button>
              <button class="ibtn" aria-label=${`${this._tr("delete")} ${slotTimeText(this.hass, slot, this._lang)}`}
                @click=${() => this._emitSlots(this.slots.filter((s) => s.id !== slot.id))}>🗑</button>
            </div>`,
        )}
      </div>
      <button class="btn" @click=${() => this._edit(this._newSlot(), true)}>+ ${this._tr("add_slot")}</button>
    `;
  }

  static styles = [
    editorStyles,
    css`
      .wrap { padding: 56px 22px 0; }
      .track { position: relative; }
      .handles { position: absolute; left: 0; right: 0; top: 0; height: 28px; }
      .handle {
        position: absolute; top: 50%; width: 44px; height: 44px; margin: -22px 0 0 -22px; padding: 0;
        border: none; background: none; cursor: ew-resize; touch-action: none; display: flex;
        align-items: center; justify-content: center;
      }
      .grip {
        width: 8px; height: 36px; border-radius: 4px; background: var(--card-background-color, #fff);
        border: 2px solid var(--primary-text-color); box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      }
      .handle.active .grip { background: var(--primary-color); }
      .loupe {
        position: absolute; bottom: 100%; margin-bottom: 14px; transform: translateX(-50%); pointer-events: none;
        background: var(--primary-text-color); color: var(--card-background-color, #fff);
        border-radius: 12px; padding: 6px 14px; font-size: 28px; font-weight: 600; font-variant-numeric: tabular-nums;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      }
      .loupe::after {
        content: ""; position: absolute; left: 50%; top: 100%; margin-left: -6px; border: 6px solid transparent;
        border-top-color: var(--primary-text-color);
      }
      .list { margin: 8px 0; }
      .slot {
        display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--divider-color);
      }
      .times { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; }
      .stepper { display: inline-flex; align-items: center; gap: 2px; }
      .time { font-variant-numeric: tabular-nums; font-weight: 600; min-width: 44px; text-align: center; }
      .time.sun { font-weight: 500; text-align: left; }
      .action { font-size: 12px; }
    `,
  ];
}
