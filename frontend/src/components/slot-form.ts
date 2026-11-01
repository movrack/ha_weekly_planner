// The form of one schedule row, the same for every device: start, optional end, days, label.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./label-picker";
import { ALL_DAYS, WEEKDAYS, WEEKEND, shiftSpec, specText } from "../actions";
import type { SlotGroup } from "../actions";
import { strings, t } from "../i18n";
import { applicable, sunBoundsInvalid } from "../slots";
import { devicesOf, forDevices } from "../device-edits";
import { friendlyName } from "../planner";
import { DAY, clockToMinutes, localDateIso, localMinutes, minutesToClock } from "../time";
import { editorStyles, langOf } from "../editors/shared";
import type { HomeAssistant, PlannerData, Program, TimeSpec } from "../types";

type Which = "start" | "end";
const SUNS = ["sunrise", "sunset"] as const;

const SUN_ATTR = { dawn: "next_dawn", sunrise: "next_rising", sunset: "next_setting", dusk: "next_dusk" } as const;

function duration(minutes: number): string {
  const value = Math.abs(minutes);
  return value < 60 ? `${value} min` : `${Math.floor(value / 60)}h${value % 60 ? String(value % 60).padStart(2, "0") : ""}`;
}

/** Lowercase name of the solar event, for use inside a sentence ("coucher", "sunset"). */
function sunWord(lang: string, spec: Extract<TimeSpec, { sun: string }>, long: boolean): string {
  const key = long && (spec.sun === "sunrise" || spec.sun === "sunset") ? `sun_${spec.sun}` : spec.sun === "sunrise" || spec.sun === "sunset" ? `sun_${spec.sun}_short` : `sun_${spec.sun}`;
  return t(lang, key as never).toLowerCase();
}

/** ", mais pas avant 18:00 ni après 19:00" for the bounds that are set, or an empty string. */
function boundsText(lang: string, spec: Extract<TimeSpec, { sun: string }>): string {
  if (spec.earliest && spec.latest) return t(lang, "sun_limits_both", { a: spec.earliest, b: spec.latest });
  if (spec.earliest) return t(lang, "sun_limits_earliest", { a: spec.earliest });
  if (spec.latest) return t(lang, "sun_limits_latest", { b: spec.latest });
  return "";
}

/** Minutes of today's solar event (offset and bounds applied), or null when the sun entity gives no time for today. */
export function todaySunMinutes(hass: HomeAssistant | undefined, spec: TimeSpec): number | null {
  if (!hass || !("sun" in spec)) return null;
  const iso = hass.states?.["sun.sun"]?.attributes?.[SUN_ATTR[spec.sun]] as string | undefined;
  const zone = hass.config?.time_zone;
  if (!iso || !zone || Number.isNaN(new Date(iso).getTime())) return null;
  if (localDateIso(new Date(iso), zone) !== localDateIso(new Date(), zone)) return null;
  let m = localMinutes(iso, zone) + (spec.offset ?? 0);
  if (spec.earliest) m = Math.max(m, clockToMinutes(spec.earliest));
  if (spec.latest) m = Math.min(m, clockToMinutes(spec.latest));
  return Math.max(0, Math.min(DAY, m));
}

/** Plain sentence for a solar time: what it really means, with its offset and bounds. Empty when nothing to explain. */
export function solarMeaningText(lang: string, spec: TimeSpec): string {
  if (!("sun" in spec) || (!spec.offset && !spec.earliest && !spec.latest)) return "";
  const offset = spec.offset ? ` ${spec.offset > 0 ? "+" : "−"} ${duration(spec.offset)}` : "";
  return t(lang, "sun_real", { base: `${sunWord(lang, spec, true)}${offset}`, limits: boundsText(lang, spec) });
}

function clockText(lang: string, minutes: number): string {
  const withinDay = minutes % DAY;
  const value = `${String(Math.floor(withinDay / 60)).padStart(2, "0")}:${String(withinDay % 60).padStart(2, "0")}`;
  return minutes >= DAY ? `${value} (${t(lang, "next_day")})` : value;
}

/** Today's result of a solar time ("Aujourd'hui : 18:00"), or an empty string when it cannot be computed. */
export function solarTodayText(lang: string, hass: HomeAssistant | undefined, spec: TimeSpec): string {
  const minutes = todaySunMinutes(hass, spec);
  return minutes === null ? "" : t(lang, "sun_today", { time: clockText(lang, minutes) });
}

/** Plain-words description of the daily random delay of a boundary. */
export function randomDelayRangeText(lang: string, spec: TimeSpec, which: Which = "start", hass?: HomeAssistant): string {
  const delay = spec.random_minutes ?? 0;
  const key = which === "end" ? "random_range_end" : "random_range_start";
  if ("time" in spec) {
    const minutes = clockToMinutes(spec.time);
    return `${t(lang, key, { start: clockText(lang, minutes), end: clockText(lang, minutes + delay) })}.`;
  }
  const today = todaySunMinutes(hass, spec);
  if (today !== null) {
    // The latest bound also caps the delayed result.
    const last = spec.latest ? Math.min(today + delay, clockToMinutes(spec.latest)) : today + delay;
    return `${t(lang, key, { start: clockText(lang, today), end: clockText(lang, Math.max(today, last)) })}.`;
  }
  const offset = spec.offset ?? 0;
  const base = `${sunWord(lang, spec, false)}${offset ? ` ${offset > 0 ? "+" : "−"} ${duration(offset)}` : ""}`;
  return `${t(lang, key, { start: base, end: t(lang, "random_later", { n: duration(delay) }) })}${boundsText(lang, spec)}.`;
}

@customElement("wp-slot-form")
export class WpSlotForm extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: false }) group!: SlotGroup;
  @property({ attribute: false }) entityIds: string[] = [];
  @property({ type: Boolean }) disabled = false;
  /** Device the slot is edited from (always kept in the slot's devices). */
  @property({ attribute: false }) device = "";
  /** Show "Also for: …" (the other devices of the program); off while editing for this device only (D1). */
  @property({ attribute: false }) also = true;
  /** Opened from one day of the week: edit that day only, other days on request. */
  @property({ type: Number }) dayOnly: number | null = null;
  @state() private _more = false;
  /** Last fixed time of each field, restored when a sun chip is switched off. */
  @state() private _last: Record<Which, string> = { start: "08:00", end: "09:00" };

  private get _lang(): string { return langOf(this.hass); }

  private _set(patch: Partial<SlotGroup["slot"]>, days?: number[]): void {
    const next: SlotGroup = { ...this.group, slot: { ...this.group.slot, ...patch }, days: days ?? this.group.days };
    this.dispatchEvent(new CustomEvent("group-change", { detail: next, bubbles: true, composed: true }));
  }

  /* ---- time ---- */

  private _update(which: Which, spec: TimeSpec | null): void {
    if (spec && "time" in spec) this._last = { ...this._last, [which]: spec.time };
    this._set({ [which]: spec } as never);
  }

  private _toggleSun(which: Which, sun: (typeof SUNS)[number]): void {
    const spec = this.group.slot[which];
    if (!spec) return;
    if ("sun" in spec && spec.sun === sun) this._update(which, { time: this._last[which], random_minutes: spec.random_minutes });
    else {
      if ("time" in spec) this._last = { ...this._last, [which]: spec.time };
      // Switching between sunrise and sunset keeps the offset and the not-before / not-after limits.
      const kept = "sun" in spec ? { offset: spec.offset ?? 0, earliest: spec.earliest, latest: spec.latest } : { offset: 0 };
      this._update(which, this._clean({ sun, ...kept, random_minutes: spec.random_minutes }));
    }
  }

  private _fromInput(which: Which, value: string): void {
    if (!/^\d{2}:\d{2}$/.test(value)) return;
    let m = clockToMinutes(value);
    if (which === "end" && m === 0) m = DAY;
    this._update(which, { time: m >= DAY ? "24:00" : value, random_minutes: this.group.slot[which]?.random_minutes });
  }

  /** Drops absent optional keys so saved specs stay minimal. */
  private _clean(spec: TimeSpec): TimeSpec {
    return Object.fromEntries(Object.entries(spec).filter(([, value]) => value !== undefined)) as TimeSpec;
  }

  /** Sets or clears (empty value) the "not before" / "not after" limit of a solar time. */
  private _limit(which: Which, key: "earliest" | "latest", value: string): void {
    const spec = this.group.slot[which];
    if (!spec || !("sun" in spec)) return;
    if (value && !/^\d{2}:\d{2}$/.test(value)) return;
    const { [key]: _old, ...rest } = spec;
    this._update(which, value ? { ...rest, [key]: value } : rest);
  }

  private _random(which: Which, value: number): void {
    const spec = this.group.slot[which];
    if (!spec || !Number.isInteger(value) || value < 0 || value > 240) return;
    const { random_minutes: _old, ...base } = spec;
    this._update(which, value ? { ...base, random_minutes: value } : base);
  }

  private _timeBlock(which: Which, title: string) {
    const spec = this.group.slot[which];
    if (!spec) return nothing;
    const lang = this._lang;
    const s = strings(lang);
    const dis = this.disabled;
    return html`
      <div class="time" role="group" aria-label=${title}>
        <button class="step" ?disabled=${dis} aria-label=${t(lang, "minus15")} title=${t(lang, "minus15")} @click=${() => this._update(which, shiftSpec(spec, -15))}><ha-icon icon="mdi:minus"></ha-icon></button>
        ${"time" in spec
          ? html`<input type="time" step="60" .value=${spec.time === "24:00" ? "00:00" : spec.time} ?disabled=${dis}
              aria-label=${title} @change=${(e: Event) => this._fromInput(which, (e.target as HTMLInputElement).value)} />`
          : html`<output class="sun">${specText(lang, { ...spec, random_minutes: 0 })}</output>`}
        <button class="step" ?disabled=${dis} aria-label=${t(lang, "plus15")} title=${t(lang, "plus15")} @click=${() => this._update(which, shiftSpec(spec, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${SUNS.map((sun) => {
          const on = "sun" in spec && spec.sun === sun;
          return html`<button class="chip ${on ? "on" : ""}" aria-pressed=${on} ?disabled=${dis}
            @click=${() => this._toggleSun(which, sun)}><ha-icon icon=${sun === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${s[`sun_${sun}_short` as "sun_dawn"] ?? sun}</button>`;
        })}
      </div>
      ${"sun" in spec ? this._limits(which, spec, title) : nothing}
      <div class="random">
        <label><input type="checkbox" aria-describedby=${`random-${which}`} .checked=${Boolean(spec.random_minutes)} ?disabled=${dis}
          @change=${(e: Event) => this._random(which, (e.target as HTMLInputElement).checked ? 15 : 0)} />${t(lang, "random_time")}</label>
        ${spec.random_minutes ? html`<label>${t(lang, "random_minutes")}<input type="number" aria-describedby=${`random-${which}`} min="1" max="240" step="1" required
          .value=${String(spec.random_minutes)} ?disabled=${dis} @change=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            if (input.validity.valid) this._random(which, Number(input.value));
          }} /></label><small id=${`random-${which}`}>${randomDelayRangeText(lang, spec, which, this.hass)}</small>` : nothing}
      </div>
      `;
  }

  private _limits(which: Which, spec: Extract<TimeSpec, { sun: string }>, title: string) {
    const lang = this._lang;
    const field = (key: "earliest" | "latest") => html`<div class="limit">
      <label>${t(lang, key === "earliest" ? "sun_earliest" : "sun_latest")}
        <input type="time" step="60" .value=${spec[key] === "24:00" ? "00:00" : spec[key] ?? ""} ?disabled=${this.disabled}
          aria-label=${`${title}: ${t(lang, key === "earliest" ? "sun_earliest" : "sun_latest")}`}
          @change=${(e: Event) => this._limit(which, key, (e.target as HTMLInputElement).value)} /></label>
      ${spec[key] ? html`<button class="clear" ?disabled=${this.disabled} aria-label=${t(lang, "sun_limit_clear")} title=${t(lang, "sun_limit_clear")}
        @click=${() => this._limit(which, key, "")}><ha-icon icon="mdi:close"></ha-icon></button>` : nothing}
    </div>`;
    const meaning = solarMeaningText(lang, spec);
    const today = solarTodayText(lang, this.hass, spec);
    return html`<div class="limits" role="group">${field("earliest")}${field("latest")}</div>
      ${meaning || today ? html`<small class="sun-help">${meaning}${meaning && today ? " " : ""}${today}</small>` : nothing}
      ${sunBoundsInvalid(spec) ? html`<small class="bad" role="alert">${t(lang, "err_sun_bounds")}</small>` : nothing}`;
  }

  private _toggleEnd(withEnd: boolean): void {
    if (!withEnd) return this._update("end", null);
    const start = this.group.slot.start;
    const m = "time" in start ? clockToMinutes(start.time) : 12 * 60;
    this._update("end", { time: minutesToClock(Math.min(DAY - 5, m + 60)) });
  }

  /* ---- devices ---- */

  /** "Also for: …": the slot runs for this device and the ticked ones; all ticked = no list (D5). */
  private _toggleDevice(entityId: string): void {
    const devices = devicesOf(this.program);
    const now = applicable(this.group.slot, devices);
    const list = now.includes(entityId) ? now.filter((d) => d !== entityId) : [...now, entityId];
    const next = forDevices(this.group.slot, [...list, this.device], this.program);
    if (!next) return;
    this.dispatchEvent(new CustomEvent("group-change", { detail: { ...this.group, slot: next }, bubbles: true, composed: true }));
  }

  private _alsoFor() {
    const others = devicesOf(this.program).filter((d) => d !== this.device);
    if (!this.also || !this.device || !others.length) return nothing;
    const on = applicable(this.group.slot, devicesOf(this.program));
    return html`<section>
      <h4>${t(this._lang, "also_for")}</h4>
      <div class="chips" role="group" aria-label=${t(this._lang, "also_for")}>
        ${others.map((d) => html`<button class="chip ${on.includes(d) ? "on" : ""}" aria-pressed=${on.includes(d)} ?disabled=${this.disabled}
          @click=${() => this._toggleDevice(d)}>${on.includes(d) ? html`<ha-icon icon="mdi:check"></ha-icon>` : html`<ha-state-icon .hass=${this.hass} .stateObj=${this.hass.states[d]}></ha-state-icon>`}${friendlyName(this.hass, d)}</button>`)}
      </div>
    </section>`;
  }

  /* ---- days ---- */

  private _toggleDay(day: number): void {
    const days = this.group.days.includes(day) ? this.group.days.filter((d) => d !== day) : [...this.group.days, day];
    this._set({}, days.sort((a, b) => a - b));
  }

  render() {
    if (!this.group || !this.program) return nothing;
    const lang = this._lang;
    const s = strings(lang);
    const slot = this.group.slot;
    const days = this.group.days;
    const eq = (a: number[], b: number[]) => a.length === b.length && b.every((d) => a.includes(d));
    const shortcut = (label: string, set: number[]) => html`<button class="chip small ${eq(days, set) ? "on" : ""}"
      aria-pressed=${eq(days, set)} ?disabled=${this.disabled} @click=${() => this._set({}, set === ALL_DAYS && eq(days, set) ? [] : [...set])}>${eq(days, set) ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}${label}</button>`;
    return html`
      <section>
        <h4>${t(lang, "start")}</h4>
        ${this._timeBlock("start", t(lang, "start"))}
      </section>
      <section>
        <h4>${t(lang, "end")}</h4>
        <div class="chips">
          <button class="chip ${slot.end ? "" : "on"}" aria-pressed=${!slot.end} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(false)}>${t(lang, "no_end")}</button>
          <button class="chip ${slot.end ? "on" : ""}" aria-pressed=${Boolean(slot.end)} ?disabled=${this.disabled}
            @click=${() => this._toggleEnd(true)}>${t(lang, "with_end")}</button>
        </div>
        ${slot.end ? this._timeBlock("end", t(lang, "end")) : nothing}
      </section>
      <section>
        <h4>${t(lang, "days_label")}</h4>
        ${this.dayOnly !== null && !this._more && eq(days, [this.dayOnly])
          ? html`<div class="chips"><span class="only">${s.days[this.dayOnly]}</span>
              <button class="chip" ?disabled=${this.disabled} @click=${() => (this._more = true)}>
                <ha-icon icon="mdi:calendar-plus"></ha-icon>${t(lang, "apply_other_days")}</button></div>`
          : html`<div class="days" role="group" aria-label=${t(lang, "days_label")}>
          ${s.days_short.map((name, d) => html`<button class="day ${days.includes(d) ? "on" : ""}" aria-pressed=${days.includes(d)}
            aria-label=${s.days[d]} ?disabled=${this.disabled} @click=${() => this._toggleDay(d)}>${days.includes(d) ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}<span>${name}</span></button>`)}
        </div>
        <div class="chips">
          ${shortcut(t(lang, "all_days"), ALL_DAYS)}${shortcut(t(lang, "weekdays"), WEEKDAYS)}${shortcut(t(lang, "weekend"), WEEKEND)}
        </div>`}
      </section>
      <section>
        <h4>${t(lang, "action")}</h4>
        <wp-label-picker embedded .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${slot.label || null} ?disabled=${this.disabled}
          @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._set({ label: e.detail ?? "" }); }}></wp-label-picker>
      </section>
      ${this._alsoFor()}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    section { margin: 0 0 14px; }
    h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); }
    /* One field: [ − | time | + ], the steps (15 min) are part of the field. */
    .time {
      display: flex; align-items: stretch; margin-bottom: 8px; min-height: 56px; overflow: hidden;
      border: 1px solid var(--divider-color); border-radius: 12px; background: var(--card-background-color);
    }
    .time:focus-within { border-color: var(--primary-color); }
    .time .step {
      flex: none; width: 56px; border: none; background: none; color: var(--primary-text-color); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 22px;
    }
    .time .step:first-child { border-right: 1px solid var(--divider-color); }
    .time .step:last-child { border-left: 1px solid var(--divider-color); }
    .time .step:hover:not(:disabled) { background: var(--secondary-background-color); }
    .time .step:disabled { opacity: 0.4; cursor: default; }
    .time input[type="time"] {
      flex: 1; min-width: 0; border: none; border-radius: 0; background: none; outline: none;
      text-align: center; font-size: 24px; font-weight: 600; min-height: 56px; color: var(--primary-text-color);
    }
    .time output.sun { flex: 1; min-width: 0; align-self: center; text-align: center; font-size: 20px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); min-width: 64px; font-weight: 600; }
    .limits { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
    .limit { display: flex; align-items: flex-end; gap: 4px; min-width: 0; }
    .limit label { flex: 1; min-width: 0; display: grid; gap: 2px; font-size: 13px; color: var(--secondary-text-color); }
    .limit input[type="time"] {
      width: 100%; min-width: 0; box-sizing: border-box; min-height: 44px; font: inherit; font-size: 16px;
      color: var(--primary-text-color); background: var(--card-background-color);
      border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 8px;
    }
    .limit .clear {
      flex: none; width: 44px; height: 44px; border: none; background: none; color: var(--secondary-text-color);
      cursor: pointer; display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 20px;
    }
    .limit .clear:disabled { opacity: 0.4; cursor: default; }
    .sun-help { display: block; margin-bottom: 8px; color: var(--secondary-text-color); }
    small.bad { color: var(--error-color, #db4437); display: block; margin-bottom: 8px; }
    .random { display: grid; gap: 6px; margin: 8px 0; }
    .random label { display: flex; align-items: center; gap: 8px; min-height: 44px; }
    .random input[type="checkbox"] { width: 20px; height: 20px; }
    .random input[type="number"] { width: 76px; min-height: 44px; box-sizing: border-box; }
    .random small { color: var(--secondary-text-color); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips + .time { margin-top: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .day.on { border-color: transparent; background-clip: padding-box; box-shadow: inset 0 0 0 1px var(--primary-color); }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 16px; font-weight: 500; margin-right: 8px; }
    /* 7 x 44 px at 360 px: the row borrows the editor's side padding; the pill is drawn inside a transparent 2 px border so the touch target stays 44 px wide */
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; margin: 0 -8px 8px; }
    .day {
      min-height: 48px; min-width: 44px; padding: 0; border-radius: 14px; border: 2px solid transparent; background-clip: padding-box;
      box-shadow: inset 0 0 0 1px var(--divider-color);
      background-color: transparent; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-slot-form": WpSlotForm;
  }
}
