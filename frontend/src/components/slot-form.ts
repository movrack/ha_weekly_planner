// The form of one schedule row, the same for every device: start, optional end, days, label.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./label-picker";
import { ALL_DAYS, WEEKDAYS, WEEKEND, shiftSpec, specText } from "../actions";
import type { SlotGroup } from "../actions";
import { strings, t } from "../i18n";
import { DAY, clockToMinutes, minutesToClock } from "../time";
import { editorStyles, langOf } from "../editors/shared";
import type { HomeAssistant, PlannerData, Program, TimeSpec } from "../types";

type Which = "start" | "end";
const SUNS = ["sunrise", "sunset"] as const;

@customElement("wp-slot-form")
export class WpSlotForm extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: false }) group!: SlotGroup;
  @property({ attribute: false }) entityIds: string[] = [];
  @property({ type: Boolean }) disabled = false;
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
    if ("sun" in spec && spec.sun === sun) this._update(which, { time: this._last[which] });
    else {
      if ("time" in spec) this._last = { ...this._last, [which]: spec.time };
      this._update(which, { sun, offset: "sun" in spec ? spec.offset ?? 0 : 0 });
    }
  }

  private _fromInput(which: Which, value: string): void {
    if (!/^\d{2}:\d{2}$/.test(value)) return;
    let m = clockToMinutes(value);
    if (which === "end" && m === 0) m = DAY;
    this._update(which, { time: m >= DAY ? "24:00" : minutesToClock(m) });
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
          ? html`<input type="time" step="300" .value=${spec.time === "24:00" ? "00:00" : spec.time} ?disabled=${dis}
              aria-label=${title} @change=${(e: Event) => this._fromInput(which, (e.target as HTMLInputElement).value)} />`
          : html`<output class="sun">${specText(lang, spec)}</output>`}
        <button class="step" ?disabled=${dis} aria-label=${t(lang, "plus15")} title=${t(lang, "plus15")} @click=${() => this._update(which, shiftSpec(spec, 15))}><ha-icon icon="mdi:plus"></ha-icon></button>
      </div>
      <div class="chips">
        ${SUNS.map((sun) => {
          const on = "sun" in spec && spec.sun === sun;
          return html`<button class="chip ${on ? "on" : ""}" aria-pressed=${on} ?disabled=${dis}
            @click=${() => this._toggleSun(which, sun)}><ha-icon icon=${sun === "sunrise" ? "mdi:weather-sunset-up" : "mdi:weather-sunset-down"}></ha-icon>${s[`sun_${sun}_short` as "sun_dawn"] ?? sun}</button>`;
        })}
      </div>`;
  }

  private _toggleEnd(withEnd: boolean): void {
    if (!withEnd) return this._update("end", null);
    const start = this.group.slot.start;
    const m = "time" in start ? clockToMinutes(start.time) : 12 * 60;
    this._update("end", { time: minutesToClock(Math.min(DAY - 5, m + 60)) });
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
      aria-pressed=${eq(days, set)} ?disabled=${this.disabled} @click=${() => this._set({}, [...set])}>${eq(days, set) ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}${label}</button>`;
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
        <wp-label-picker .hass=${this.hass} .data=${this.data} .program=${this.program} .entityIds=${this.entityIds}
          .value=${slot.label || null} ?disabled=${this.disabled}
          @label-change=${(e: CustomEvent<string | null>) => { e.stopPropagation(); this._set({ label: e.detail ?? "" }); }}></wp-label-picker>
      </section>`;
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
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chips + .time { margin-top: 12px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .only { display: inline-flex; align-items: center; min-height: 48px; font-size: 16px; font-weight: 500; margin-right: 8px; }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px; }
    .day {
      min-height: 48px; min-width: 0; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
      background: none; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
      display: flex; flex-direction: column; align-items: center; justify-content: center; --mdc-icon-size: 14px;
    }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-slot-form": WpSlotForm;
  }
}
