// The form of one schedule row, the same for every device type: start, optional end, days, action.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./action-picker";
import { ALL_DAYS, WEEKDAYS, WEEKEND, readAct, shiftSpec, specText, writeAct } from "../actions";
import type { Act, SlotGroup } from "../actions";
import { strings, t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import { DAY, clockToMinutes, minutesToClock } from "../time";
import { editorStyles, langOf } from "../editors/setpoint-editor";
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
        <button class="ibtn round" ?disabled=${dis} aria-label=${t(lang, "minus15")} @click=${() => this._update(which, shiftSpec(spec, -15))}>−15</button>
        ${"time" in spec
          ? html`<input type="time" step="300" .value=${spec.time === "24:00" ? "00:00" : spec.time} ?disabled=${dis}
              aria-label=${title} @change=${(e: Event) => this._fromInput(which, (e.target as HTMLInputElement).value)} />`
          : html`<output class="sun">${specText(lang, spec)}</output>`}
        <button class="ibtn round" ?disabled=${dis} aria-label=${t(lang, "plus15")} @click=${() => this._update(which, shiftSpec(spec, 15))}>+15</button>
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

  /* ---- action ---- */

  private _setAct(entityId: string, act: Act): void {
    this._set({ ...writeAct(this.group.slot, this.program, entityId, act) });
  }

  render() {
    if (!this.group || !this.program) return nothing;
    const lang = this._lang;
    const s = strings(lang);
    const slot = this.group.slot;
    const days = this.group.days;
    const eq = (a: number[], b: number[]) => a.length === b.length && b.every((d) => a.includes(d));
    const shortcut = (label: string, set: number[]) => html`<button class="chip small ${eq(days, set) ? "on" : ""}"
      aria-pressed=${eq(days, set)} ?disabled=${this.disabled} @click=${() => this._set({}, [...set])}>${label}</button>`;
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
        <div class="days" role="group" aria-label=${t(lang, "days_label")}>
          ${s.days_short.map((name, d) => html`<button class="day ${days.includes(d) ? "on" : ""}" aria-pressed=${days.includes(d)}
            aria-label=${s.days[d]} ?disabled=${this.disabled} @click=${() => this._toggleDay(d)}>${name}</button>`)}
        </div>
        <div class="chips">
          ${shortcut(t(lang, "all_days"), ALL_DAYS)}${shortcut(t(lang, "weekdays"), WEEKDAYS)}${shortcut(t(lang, "weekend"), WEEKEND)}
        </div>
      </section>
      <section>
        <h4>${t(lang, "action")}</h4>
        ${this.entityIds.map((eid) => html`
          ${this.entityIds.length > 1 ? html`<div class="dev"><ha-icon icon=${this.hass.states[eid]?.attributes.icon ?? `mdi:${entityDomain(eid) === "climate" ? "thermostat" : "devices"}`}></ha-icon>${friendlyName(this.hass, eid)}</div>` : nothing}
          <wp-action-picker .hass=${this.hass} .data=${this.data} entity-id=${eid} ?disabled=${this.disabled}
            .act=${readAct(slot, eid, this.data.modes)}
            @act-change=${(e: CustomEvent<Act>) => { e.stopPropagation(); this._setAct(eid, e.detail); }}></wp-action-picker>`)}
      </section>`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    section { margin: 0 0 14px; }
    h4 { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--secondary-text-color); }
    .time { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; }
    .time input[type="time"] { width: 150px; text-align: center; font-size: 24px; font-weight: 600; min-height: 56px; }
    .time output.sun { min-width: 150px; text-align: center; font-size: 20px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); min-width: 64px; font-weight: 600; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px; font: inherit; font-size: 15px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 20px;
    }
    .chip.on, .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled, .day:disabled { opacity: 0.5; cursor: default; }
    .chip.small { padding: 0 14px; }
    .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 8px; }
    .day {
      min-height: 48px; min-width: 0; padding: 0; border-radius: 12px; border: 1px solid var(--divider-color);
      background: none; color: var(--primary-text-color); font: inherit; font-size: 14px; cursor: pointer;
    }
    .dev { display: flex; align-items: center; gap: 8px; margin: 8px 0 4px; font-weight: 600; --mdc-icon-size: 20px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-slot-form": WpSlotForm;
  }
}
