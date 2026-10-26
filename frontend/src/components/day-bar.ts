// A 24-hour bar of colored slots (read-only). Used in the week view and the day view.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./tip";
import { strings, t } from "../i18n";
import { DAY, fmtClock } from "../time";
import type { TimeSpec } from "../types";

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
  ignored?: string | null;
  /** Slot this span comes from (spill: the part of the previous day's slot that crosses midnight). */
  slotId?: string;
  spill?: boolean;
  /** A one-shot (no end): drawn as a small marker. */
  marker?: boolean;
}

/** Icon side of a time that follows the sun: sunrise side ("up") or sunset side ("down"), null for a fixed time. */
export function sunDir(spec: { time: string } | { sun: string } | null | undefined): "up" | "down" | null {
  if (!spec || !("sun" in spec)) return null;
  return spec.sun === "sunrise" || spec.sun === "dawn" ? "up" : "down";
}

/** Text of a sun icon: "Sunset + 30 min · 5:55 pm" (the time is the resolved one). */
export function sunTip(lang: string, spec: TimeSpec | null | undefined, minutes: number): string {
  if (!spec || !("sun" in spec)) return "";
  const offset = spec.offset ?? 0;
  const name = strings(lang)[`sun_${spec.sun}` as "sun_sunset"] ?? spec.sun;
  const off = offset ? ` ${offset > 0 ? "+" : "-"} ${Math.abs(offset)} min` : "";
  return `${name}${off} · ${fmtClock(lang, minutes)}`;
}

/** Text of the "now" icon: "Now · 2:05 pm". */
export const nowTip = (lang: string, minutes: number): string => `${t(lang, "now")} · ${fmtClock(lang, minutes)}`;

@customElement("wp-day-bar")
export class WpDayBar extends LitElement {
  @property({ attribute: false }) spans: BarSpan[] = [];
  @property({ type: Number }) now: number | null = null;
  @property({ type: Boolean }) thin = false;
  @property({ type: Boolean, attribute: "show-hours" }) showHours = false;
  /** Hour lines inside the bar at 6, 12 and 18 h, behind the slots. */
  @property({ type: Boolean }) notches = false;
  /** Taller bar (direct editing). */
  @property({ type: Boolean }) tall = false;
  /** Language of the texts (set by the card). */
  @property() lang = "en";

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
  private _labelBox(s: BarSpan): { left: number; width: number } | null {
    if (this.thin || this._width <= 0) return null;
    let from = s.start;
    let to = s.end;
    const now = this.now;
    if (now !== null && now > s.start - 20 && now < s.end + 20) {
      const gap = 20; // minutes kept clear on each side of the line
      if (now - s.start >= s.end - now) to = Math.min(s.end, now - gap);
      else from = Math.max(s.start, now + gap);
    }
    // Room needed: about 7 px per character, the sun icon and the padding.
    const need = Math.max(40, s.label.length * 7 + 14);
    if (((to - from) / DAY) * this._width < need) return null;
    const span = Math.max(s.end - s.start, 1);
    return { left: ((from - s.start) / span) * 100, width: ((to - from) / span) * 100 };
  }

  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  private _sunIcons() {
    const icons: { m: number; dir: "up" | "down"; spec?: TimeSpec | null; label?: string }[] = [];
    for (const s of this.spans) {
      // a one-shot is only a thin line: its icon also says what it does
      if (s.startSun) icons.push({ m: s.start, dir: s.startSun, spec: s.startSpec, label: s.marker ? s.label : undefined });
      if (s.endSun && s.end < DAY) icons.push({ m: s.end, dir: s.endSun, spec: s.endSpec });
    }
    // While editing, the handles below keep the pointer; the icon is still read by keyboard and screen readers.
    return icons.map((i) => html`<wp-tip class="sunic" ?passive=${this.tall}
      text=${`${i.label ? `${i.label} · ` : ""}${sunTip(this.lang, i.spec, i.m)}`}
      style="left:clamp(16px, ${(i.m / DAY) * 100}%, calc(100% - 16px))" data-sun=${i.dir}>
      <span class="sunc"><ha-icon icon=${i.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span></wp-tip>`);
  }

  /** A one-shot is a thin line: a wider invisible target over it shows its label and time. */
  private _markerTips() {
    return this.spans.filter((s) => s.marker && !s.startSun && !this.thin).map((s) => html`<wp-tip class="mktip" through
      ?passive=${this.tall} text=${`${s.label} · ${fmtClock(this.lang, s.start)}`}
      style="left:clamp(12px, ${(s.start / DAY) * 100}%, calc(100% - 12px))"></wp-tip>`);
  }

  render() {
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    const now = this.now;
    return html`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((s) => s.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((h) => html`<i class="tick" style="left:${pct(h * 60)}"></i>`) : nothing}
          ${this.spans.map((s) => {
            const box = this._labelBox(s);
            return html`<div
              class="span ${s.ignored ? "ignored" : ""}"
              style="left:${pct(s.start)};width:${pct(Math.max(s.end - s.start, 5))};--c:${s.color}"
              title=${s.label}
            >${box ? html`<span class="name" style="left:${box.left}%;width:${box.width}%">${s.label}</span>` : nothing}</div>`;
          })}
        </div>
        <div class="icons">${this._markerTips()}${this._sunIcons()}</div>
        <slot></slot>
        ${now !== null ? html`<div class="nowline" style="left:${pct(now)}">
          <wp-tip class="nowic" text=${nowTip(this.lang, now)}><ha-icon icon="mdi:clock-outline"></ha-icon></wp-tip></div>` : nothing}
      </div>
      ${this.showHours
        ? html`<div class="hours">${[0, 6, 12, 18, 24].map((h) => html`<span style="left:${pct(h * 60)}">${h} h</span>`)}</div>`
        : nothing}
    `;
  }

  static styles = css`
    :host { display: block; }
    .wrap { position: relative; }
    .bar {
      position: relative; height: 28px; border-radius: 14px; overflow: hidden;
      background: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .bar.thin { height: 10px; border-radius: 5px; }
    .bar.tall { height: 44px; border-radius: 12px; transition: height 0.12s; }
    .span {
      position: absolute; top: 0; bottom: 0; background: var(--c);
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .span.ignored {
      background: repeating-linear-gradient(135deg, var(--c) 0 4px, transparent 4px 8px);
      opacity: 0.5;
    }
    .span span {
      display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; color: #fff;
      color: #fff; font-size: 11px; font-weight: 600; white-space: nowrap;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6); padding: 0 6px; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .span .name { position: absolute; top: 0; bottom: 0; justify-content: center; box-sizing: border-box; }
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .icons { position: absolute; inset: 0; pointer-events: none; z-index: 4; }
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
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
}
