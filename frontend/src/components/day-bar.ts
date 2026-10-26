// A 24-hour bar of colored slots (read-only). Used in the week view and the day view.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { t } from "../i18n";
import { DAY } from "../time";

export interface BarSpan {
  start: number; // minutes 0–1440
  end: number;
  color: string;
  label: string;
  sun?: boolean;
  /** The start / end of this span follows the sun: which icon to draw there (sunrise side or sunset side). */
  startSun?: "up" | "down" | null;
  endSun?: "up" | "down" | null;
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

  /** A label is only drawn when its span is wide enough for it (never cut off). */
  private _fits(s: BarSpan): boolean {
    // Never under the "now" line: a label cut by it is dropped.
    const cut = this.now !== null && this.now >= s.start - 20 && this.now <= s.end + 20;
    // Room needed: about 7 px per character, the sun icon and the padding.
    const need = Math.max(40, s.label.length * 7 + 14);
    return !this.thin && !cut && this._width > 0 && ((s.end - s.start) / DAY) * this._width >= need;
  }

  /** Sun icons at the start / end of the spans that follow the sun (visible even when the label does not fit). */
  private _sunIcons() {
    const icons: { m: number; dir: "up" | "down" }[] = [];
    for (const s of this.spans) {
      if (s.startSun) icons.push({ m: s.start, dir: s.startSun });
      if (s.endSun && s.end < DAY) icons.push({ m: s.end, dir: s.endSun });
    }
    return icons.map((i) => html`<span class="sunic" style="left:clamp(10px, ${(i.m / DAY) * 100}%, calc(100% - 10px))"
      data-sun=${i.dir}><ha-icon icon=${i.dir === "up" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon></span>`);
  }

  render() {
    const pct = (m: number) => `${(m / DAY) * 100}%`;
    const now = this.now;
    return html`
      <div class="wrap">
        <div class="bar ${this.thin ? "thin" : ""} ${this.tall ? "tall" : ""}" role="img"
          aria-label=${this.spans.map((s) => s.label).join(", ")}>
          ${this.notches ? [6, 12, 18].map((h) => html`<i class="tick" style="left:${pct(h * 60)}"></i>`) : nothing}
          ${this.spans.map(
            (s) => html`<div
              class="span ${s.ignored ? "ignored" : ""}"
              style="left:${pct(s.start)};width:${pct(Math.max(s.end - s.start, 5))};--c:${s.color}"
              title=${s.label}
            >${this._fits(s) ? html`<span>${s.label}</span>` : nothing}</div>`,
          )}
        </div>
        <div class="icons">${this._sunIcons()}</div>
        <slot></slot>
        ${now !== null ? html`<div class="nowline" style="left:${pct(now)}">
          <ha-icon class="nowic" icon="mdi:clock-outline" role="img" aria-label=${t(this.lang, "now")}></ha-icon></div>` : nothing}
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
    /* Hour lines at 6, 12 and 18 h, drawn behind the slots. */
    .tick {
      position: absolute; top: 0; bottom: 0; width: 1px; margin-left: -0.5px; pointer-events: none;
      background: var(--secondary-text-color); opacity: 0.35;
    }
    .icons { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
    .sunic {
      position: absolute; top: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; border-radius: 9px;
      display: flex; align-items: center; justify-content: center; --mdc-icon-size: 14px;
      background: var(--card-background-color, #fff); color: var(--primary-text-color);
      box-shadow: 0 0 0 1px var(--divider-color, rgba(127, 127, 127, 0.5));
    }
    slot { display: contents; }
    /* the "now" line is drawn over everything, outside the clipped bar; the clock sits just above the bar */
    .nowline {
      position: absolute; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; z-index: 3; pointer-events: none;
      background: var(--primary-text-color); box-shadow: 0 0 0 1px var(--card-background-color);
    }
    .nowic {
      position: absolute; left: 50%; bottom: 100%; transform: translateX(-50%); --mdc-icon-size: 13px;
      color: var(--primary-text-color); display: flex; margin-bottom: 0;
    }
    .hours { position: relative; height: 20px; font-size: 12px; color: var(--secondary-text-color); }
    .hours span { position: absolute; transform: translateX(-50%); top: 2px; white-space: nowrap; }
    .hours span:first-child { transform: none; }
    .hours span:last-child { transform: translateX(-100%); }
  `;
}
