// A 24-hour bar of colored slots (read-only). Used in the week view and the day view.

import { readableOn, tokenStyles } from "../styles";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./tip";
import { strings, t } from "../i18n";
import { DAY, fmtClock, fmtDayEnd } from "../time";
import type { TimeSpec } from "../types";
import { selectedTimeText } from "../selected-time";

export interface BarSpan {
  start: number; // minutes 0–1440
  end: number;
  color: string;
  label: string;
  sun?: boolean;
  /** The start / end of this span follows the sun: which icon to draw there (sunrise side or sunset side). */
  startSun?: "up" | "down" | null;
  endSun?: "up" | "down" | null;
  /** The start / end as stored (for the tooltip of the sun icon: event and offset). */
  startSpec?: TimeSpec | null;
  endSpec?: TimeSpec | null;
  /** When the start / end has a random delay: its time before the delay (sun, offset and bounds only), for the tooltip. */
  startBase?: number | null;
  endBase?: number | null;
  ignored?: string | null;
  /** Slot this span comes from (spill: the part of the previous day's slot that crosses midnight). */
  slotId?: string;
  /** Setting (label id) of the span. */
  labelId?: string;
  spill?: boolean;
  /** A one-shot (no end): drawn as a small marker. */
  marker?: boolean;
  /** Real instants (ms) of the resolved start / end, when the span comes from a resolved preview (absent from the fallbacks). */
  startMs?: number;
  endMs?: number | null;
}

/** Visible transitions between distinct schedules; paint order decides overlapping spans. */
export function scheduleBoundaries(spans: readonly BarSpan[]): { minute: number; color: string }[] {
  const events = new Map<number, { index: number; start: boolean }[]>();
  spans.forEach((s, index) => {
    if (s.ignored || s.marker || !Number.isFinite(s.start) || !Number.isFinite(s.end) || s.end <= s.start) return;
    const start = Math.max(0, s.start), end = Math.min(DAY, s.end);
    if (end <= start) return;
    for (const [minute, begins] of [[start, true], [end, false]] as const) {
      const at = events.get(minute) ?? [];
      at.push({ index, start: begins });
      events.set(minute, at);
    }
  });
  const active = new Set<number>();
  const out: { minute: number; color: string }[] = [];
  let before: BarSpan | undefined;
  for (const [minute, changes] of [...events].sort(([a], [b]) => a - b)) {
    for (const e of changes) {
      if (e.start) active.add(e.index);
      else active.delete(e.index);
    }
    const after = active.size ? spans[Math.max(...active)] : undefined;
    if (before && after && before !== after && (before.slotId === undefined || before.slotId !== after.slotId)) {
      out.push({ minute, color: readableOn(after.color).fg });
    }
    before = after;
  }
  return out;
}

/** Icon side of a time that follows the sun: sunrise side ("up") or sunset side ("down"), null for a fixed time. */
export function sunDir(spec: { time: string } | { sun: string } | null | undefined): "up" | "down" | null {
  if (!spec || !("sun" in spec)) return null;
  return spec.sun === "sunrise" || spec.sun === "dawn" ? "up" : "down";
}

/**
 * Text of a sun icon, short: "Sunset + 30 min · 5:55 pm" (the time is the resolved one). With a random delay: the sun time and the
 * delay, "Sunset · 4:55 pm + 19 min" (without the time before it: "Sunset, random · 5:14 pm"). A bound is named only when it
 * decides the time ("Sunset, not before 5:15 pm · 5:15 pm").
 */
export function sunTip(lang: string, spec: TimeSpec | null | undefined, minutes: number, base?: number | null): string {
  if (!spec || !("sun" in spec)) return "";
  const offset = spec.offset ?? 0;
  const name = strings(lang)[`sun_${spec.sun}` as "sun_sunset"] ?? spec.sun;
  const off = offset ? ` ${offset > 0 ? "+" : "-"} ${Math.abs(offset)} min` : "";
  if (spec.random_minutes) {
    return typeof base === "number"
      ? `${name}${off} · ${fmtClock(lang, base)}\n${t(lang, "sun_delay", { n: String(spec.random_minutes) })}`
      : `${name}${off}, ${t(lang, "sun_random_word")} · ${fmtClock(lang, minutes)}`;
  }
  const at = (v: string | undefined) => { if (!v) return null; const [h, m] = v.split(":").map(Number); return h * 60 + m; };
  const bound = at(spec.earliest) === minutes ? t(lang, "sun_bound_earliest", { time: fmtClock(lang, minutes) })
    : at(spec.latest) === minutes ? t(lang, "sun_bound_latest", { time: fmtClock(lang, minutes) }) : "";
  return `${name}${off}${bound ? `, ${bound}` : ""} · ${fmtClock(lang, minutes)}`;
}

/** Text of the "now" icon: "Now · 2:05 pm". */
export const nowTip = (lang: string, minutes: number): string => `${t(lang, "now")} · ${fmtClock(lang, minutes)}`;

@customElement("wp-day-bar")
export class WpDayBar extends LitElement {
  @property({ attribute: false }) spans: BarSpan[] = [];
  @property({ type: Number }) now: number | null = null;
  @property({ type: Boolean }) thin = false;
  @property({ type: Boolean, attribute: "show-hours" }) showHours = false;
  /** The markers are out of the tab order (the bar sits in a button whose name already lists them). */
  @property({ type: Boolean, attribute: "no-tab" }) noTab = false;
  /** The "now" line without its clock icon (stacked bars: only the first one of a group carries the icon). */
  @property({ type: Boolean, attribute: "no-clock" }) noClock = false;
  /** Hour lines inside the bar at 6, 12 and 18 h, behind the slots. */
  @property({ type: Boolean }) notches = false;
  /** Taller bar (direct editing). */
  @property({ type: Boolean }) tall = false;
  /** Language of the texts (set by the card). */
  @property() lang = "en";
  /** Device the bar belongs to: said by the "now" marker so that several bars do not read the same. */
  @property({ attribute: "device-name" }) deviceName = "";

  @state() private _width = 0;
  private _ro?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") {
      this._ro = new ResizeObserver((entries) => {
        const w = Math.round(entries[0]?.contentRect.width ?? 0);
        if (w !== this._width) this._width = w;
      });
      this._ro.observe(this);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._ro?.disconnect();
  }

  /**
   * Where the label of a span is drawn (left and width in % of the span), or null when it does not fit (never cut
   * off). Crossed by the "now" line, it goes in the wider side of the span, if that side is wide enough.
   */
  private _labelBox(s: BarSpan): { left: number; width: number; text: string } | null {
    if (this.thin || this._width <= 0) return null;
    let from = s.start;
    let to = s.end;
    const now = this.now;
    if (now !== null && now > s.start - 20 && now < s.end + 20) {
      const gap = 20; // minutes kept clear on each side of the line
      if (now - s.start >= s.end - now) to = Math.min(s.end, now - gap);
      else from = Math.max(s.start, now + gap);
    }
    // Room needed: about 7 px per character, the sun icon and the padding. A name too long for the room
    // ("Comfort (19 °C)") gives up its closing bracket ("Comfort") before giving up altogether.
    const room = ((to - from) / DAY) * this._width;
    const needFor = (text: string) => Math.max(40, text.length * 7 + 14);
    const short = s.label.replace(/\s*[(（][^()（）]*[)）]\s*$/, "").trim();
    const text = room >= needFor(s.label) ? s.label : short && short !== s.label && room >= needFor(short) ? short : null;
    if (text === null) return null;
    const span = Math.max(s.end - s.start, 1);
    return { left: ((from - s.start) / span) * 100, width: ((to - from) / span) * 100, text };
  }

  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  private _sunIcons() {
    const icons: { m: number; dir: "up" | "down"; spec?: TimeSpec | null; label?: string; base?: number | null }[] = [];
    for (const s of this.spans) {
      // a one-shot is only a thin line: its icon also says what it does
      if (s.startSun) icons.push({ m: s.start, dir: s.startSun, spec: s.startSpec, base: s.startBase, label: s.marker ? s.label : undefined });
      if (s.endSun && s.end < DAY) icons.push({ m: s.end, dir: s.endSun, spec: s.endSpec, base: s.endBase });
    }
    // While editing, the handles below keep the pointer; the icon is still read by keyboard and screen readers.
    // Only the action and the times: the line already is the device, so a room in brackets ("Close (Dining room)") is dropped.
    // A bracket with a figure ("Open (50 %)") is part of the action and stays.
    const said = (l?: string) => (l ?? "").replace(/\s*[(（]([^()（）]*)[)）]\s*$/, (m, n: string) => /[\d%]/.test(n) ? m : "").trim();
    return icons.map((i) => html`<wp-tip class="sunic" ?passive=${this.tall} ?no-tab=${this.noTab}
      text=${`${said(i.label) ? `${said(i.label)}\n` : ""}${sunTip(this.lang, i.spec, i.m, i.base)}`}
      style="left:clamp(16px, ${(i.m / DAY) * 100}%, calc(100% - 16px))" data-sun=${i.dir}>
      <span class="sunc"><ha-icon icon=${i.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
  }

  /** A one-shot is a thin line: a wider invisible target over it shows its label and time. */
  private _markerTips() {
    return this.spans.filter((s) => s.marker && !s.startSun && !this.thin).map((s) => html`<wp-tip class="mktip" through
      ?passive=${this.tall} ?no-tab=${this.noTab} text=${`${s.label} · ${fmtClock(this.lang, s.start)}`}
      style="left:clamp(12px, ${(s.start / DAY) * 100}%, calc(100% - 12px))"></wp-tip>`);
  }

  /** Names drawn on the bar (the ones that fit), left to right: the visible text of the bar, for the name of its zone. */
  visibleText(): string {
    return this.spans.map((s) => this._labelBox(s)?.text).filter(Boolean).join(" ");
  }

  private _lastText: string | null = null;

  protected updated(): void {
    const text = this.visibleText();
    if (text === this._lastText) return;
    this._lastText = text;
    this.dispatchEvent(new CustomEvent("visible-text", { detail: text }));
  }

  /** What a screen reader says of the bar: every span with its times (WCAG 1.1.1, as the name of the bar button does). */
  private _name(): string {
    return this.spans.map((s) => `${s.label} · ${selectedTimeText(this.lang, s.start, s.marker ? null : s.end, s.startSpec ?? undefined, s.endSpec)}`).join(", ");
  }

  render() {
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    const now = this.now;
    return html`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this._name()}>
          ${this.notches ? [6, 12, 18].map((h) => html`<i class="tick" style="left:${pct(h * 60)}"></i>`) : nothing}
          ${this.spans.map((s) => {
            const box = this._labelBox(s);
            return html`<div
              class="span ${s.ignored ? "ignored" : ""}"
              style="left:${pct(s.start)};width:${pct(Math.max(s.end - s.start, 5))};--c:${s.color};--fg:${readableOn(s.color).fg};--sh:${readableOn(s.color).shadow}"
              title=${s.label}
            >${box ? html`<span class="name" style="left:${box.left}%;width:${box.width}%">${box.text}</span>` : nothing}</div>`;
          })}
          ${scheduleBoundaries(this.spans).map((b) => html`<i class="schedule-boundary" aria-hidden="true" style="left:${pct(b.minute)};--c:${b.color}"></i>`)}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${now !== null ? html`<div class="nowline" style="left:${pct(now)}">
          ${this.noClock ? nothing : html`<wp-tip class="nowic" no-tab text=${nowTip(this.lang, now)} label=${this.deviceName ? `${nowTip(this.lang, now)}, ${this.deviceName}` : nowTip(this.lang, now)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip>`}</div>` : nothing}
      </div>
      ${this.showHours
        ? html`<div class="hours" aria-hidden="true">${[0, 6, 12, 18, 24].map((h) => html`<span style="left:${pct(h * 60)}">${h === 24 ? fmtDayEnd(this.lang) : fmtClock(this.lang, h * 60)}</span>`)}</div>`
        : nothing}
    `;
  }

  static styles = css`
    ${tokenStyles}
    :host { display: block; }
    .wrap { position: relative; }
    .bar {
      position: relative; height: var(--wp-bar-height, 28px); border-radius: var(--wp-bar-radius, 14px); overflow: hidden; /* taller where the bar is a touch target */
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .bar.thin { height: 10px; border-radius: 5px; }
    .bar.tall { height: 44px; border-radius: 12px; transition: height 0.12s; }
    .span {
      position: absolute; top: 0; bottom: 0; background: var(--c);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .schedule-boundary {
      position: absolute; top: 4px; bottom: 4px; width: 2px; margin-left: -1px;
      background: var(--c); pointer-events: none;
    }
    .span.ignored {
      background: repeating-linear-gradient(135deg, var(--c) 0 4px, transparent 4px 8px);
      opacity: 0.5;
    }
    .span span {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px;
      color: var(--fg, #fff); font-size: 0.6875rem; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px var(--sh, rgba(0, 0, 0, 0.6)); padding: 0 6px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .span .name { position: absolute; top: 0; bottom: 0; justify-content: center; box-sizing: border-box; }
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .icons { position: absolute; inset: 0; pointer-events: none; z-index: 6; } /* above the now line (5): a tip is never crossed by it */
    .sunic { position: absolute; top: 50%; transform: translate(-50%, -50%); }
    .mktip { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 24px; height: 28px; }
    .sunc {
      width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; --mdc-icon-size: 14px;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    slot { display: contents; }
    /* the "now" line is drawn over everything, outside the clipped bar; the clock sits just above the bar */
    .nowline {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; z-index: 5; pointer-events: none;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .nowic {
      position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); --mdc-icon-size: 13px;
      color: var(--primary-text-color); margin-bottom: 0; align-items: flex-end;
    }
    .nowic::part(hit) { align-items: flex-end; }
    .hours { position: relative; height: 20px; font-size: 0.75rem; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
}
