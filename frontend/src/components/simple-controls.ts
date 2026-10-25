// Simple mode of a program (spec § 10.7): a plain sentence about the main device and the few
// controls of its type. Every command is a voluntary override (service weekly_planner.override).

import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./dialog";
import { strings, t } from "../i18n";
import {
  activeProfile, applicable, describeSp, entityDomain, fmtNum, fmtTemp, friendlyName, isFrostMode, mainType,
  modeEffect, modeSetpoint, slotMode, stepTemperature,
} from "../planner";
import { confirmAction } from "./confirm";
import { fmtClock, formatWhen, localMinutes } from "../time";
import { modeTypeOf, langOf } from "../editors/setpoint-editor";
import type { K } from "../editors/setpoint-editor";
import type { HomeAssistant, Mode, PlannerData, Program, Setpoint } from "../types";

type Timing = { duration: { hours: number } } | { until: string } | Record<string, never>;

const ONE_SHOT = ["scene", "script", "action"];
const SWITCHES = ["switch", "input_boolean", "fan"];
const REPEAT_MS = 400;
const SEND_DELAY_MS = 800;

@customElement("wp-simple-controls")
export class WpSimpleControls extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @state() private _expanded = false;
  @state() private _pending: Record<string, number> = {};
  @state() private _message = "";
  @state() private _error = "";
  @state() private _durationOpen = false;
  private _repeat?: number;
  private _sendTimers = new Map<string, number>();
  private _msgTimer?: number;
  private _clear = new Map<string, number>();

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopHold();
    this._sendTimers.forEach((id) => window.clearTimeout(id));
    this._clear.forEach((id) => window.clearTimeout(id));
    window.clearTimeout(this._msgTimer);
  }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("hass") && Object.keys(this._pending).length) {
      // Drop a pending value once the device reports it.
      const next = { ...this._pending };
      for (const [eid, value] of Object.entries(this._pending)) {
        const a = this.hass.states[eid]?.attributes ?? {};
        const shown = entityDomain(eid) === "light" ? this._brightnessPct(eid, false) : a.temperature;
        if (shown === value && !this._sendTimers.has(eid)) delete next[eid];
      }
      if (Object.keys(next).length !== Object.keys(this._pending).length) this._pending = next;
    }
  }

  private get _lang(): string { return langOf(this.hass); }
  private get _tz(): string { return this.hass.config.time_zone; }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  private get _status() { return this.data.status[this.program.id]; }
  private get _next(): string | null {
    const n = this._status?.next_change;
    return n ? formatWhen(n, this._tz, this._lang, new Date()) : null;
  }

  /** Entities of the program's main type (the first is shown, the others fold under "and N more"). */
  private get _main(): string[] {
    const type = modeTypeOf(mainType(this.program));
    const all = this.program.entities.map((e) => e.entity_id);
    const same = all.filter((id) => modeTypeOf(entityDomain(id)) === type);
    return same.length ? same : all.slice(0, 1);
  }

  /* ------------------------------------------------------------------ commands */

  private async _send(entities: string[], setpoint: Setpoint, timing: Timing = {}): Promise<void> {
    try {
      this._error = "";
      await this.hass.callService("weekly_planner", "override", { entity_id: entities, setpoint, ...timing });
      // The state sentence already says until when: the banner only confirms (4 s).
      this._say(this._tr("sm_done", { what: describeSp(this._lang, this.data.modes, entities[0], setpoint) }));
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  private _say(text: string): void {
    this._message = text;
    window.clearTimeout(this._msgTimer);
    this._msgTimer = window.setTimeout(() => (this._message = ""), 4000);
  }

  /** Several quick presses become one command, 800 ms after the last one. */
  private _queue(eid: string, setpoint: Setpoint): void {
    window.clearTimeout(this._sendTimers.get(eid));
    this._sendTimers.set(eid, window.setTimeout(() => {
      this._sendTimers.delete(eid);
      void this._send([eid], setpoint);
      this._clear.set(eid, window.setTimeout(() => {
        const next = { ...this._pending };
        delete next[eid];
        this._pending = next;
      }, 6000));
    }, SEND_DELAY_MS));
  }

  private _step(eid: string, dir: 1 | -1): void {
    const a = this.hass.states[eid]?.attributes ?? {};
    const base = this._pending[eid] ?? Number(a.temperature ?? a.current_temperature ?? 20);
    const min = Number(a.min_temp ?? 7);
    const max = Number(a.max_temp ?? 35);
    const next = stepTemperature(base, dir, min, max);
    if (next === base) return;
    window.clearTimeout(this._clear.get(eid));
    this._pending = { ...this._pending, [eid]: next };
    navigator.vibrate?.(10);
    this._queue(eid, { kind: "temperature", temperature: next });
  }

  private _brightnessPct(eid: string, usePending = true): number {
    if (usePending && this._pending[eid] !== undefined) return this._pending[eid];
    const st = this.hass.states[eid];
    if (st?.state !== "on") return 0;
    const b = st.attributes.brightness;
    return typeof b === "number" ? Math.round((b / 255) * 100) : 100;
  }

  private _dim(eid: string, dir: 1 | -1): void {
    const base = this._brightnessPct(eid);
    const next = Math.min(100, Math.max(10, base + dir * 10));
    if (next === base && base !== 0) return;
    window.clearTimeout(this._clear.get(eid));
    this._pending = { ...this._pending, [eid]: next };
    navigator.vibrate?.(10);
    this._queue(eid, { kind: "on", brightness: next });
  }

  private _startHold(ev: PointerEvent, step: () => void): void {
    ev.preventDefault();
    this._stopHold();
    step();
    this._repeat = window.setInterval(step, REPEAT_MS);
  }

  private _stopHold = (): void => {
    window.clearInterval(this._repeat);
    this._repeat = undefined;
  };

  private _holdButton(icon: string, label: string, step: () => void): TemplateResult {
    return html`<button class="big" aria-label=${label}
      @pointerdown=${(e: PointerEvent) => this._startHold(e, step)}
      @pointerup=${this._stopHold} @pointercancel=${this._stopHold} @pointerleave=${this._stopHold}
      @contextmenu=${(e: Event) => e.preventDefault()}
      @keydown=${(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); step(); } }}>
      <ha-icon icon=${icon}></ha-icon><span>${label}</span></button>`;
  }

  private _simple(eid: string, icon: string, label: string, sp: Setpoint): TemplateResult {
    return html`<button class="big" @click=${() => this._send([eid], sp)}><ha-icon icon=${icon}></ha-icon><span>${label}</span></button>`;
  }

  private async _resume(): Promise<void> {
    try {
      await this.hass.callService("weekly_planner", "resume", { program_id: this.program.id });
    } catch (err) {
      this._error = t(this._lang, "error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  private async _applyDuration(timing: Timing): Promise<void> {
    this._durationOpen = false;
    for (const e of this.program.entities) {
      const o = this.data.entities[e.entity_id]?.override;
      if (o?.origin === "voluntary" && o.setpoint) await this._send([e.entity_id], o.setpoint, timing);
    }
  }

  /** The duration choices with their end (server time zone); the default one is the next schedule change. */
  private _choices(): { label: string; timing: Timing; end: string; current: boolean }[] {
    const now = new Date();
    const lang = this._lang;
    const nowMin = localMinutes(now, this._tz);
    const start = now.getTime() - now.getSeconds() * 1000 - now.getMilliseconds();
    const at = (minutes: number) => new Date(start + minutes * 60_000).toISOString();
    const hours = (h: number) => ({ label: this._tr(h === 1 ? "sm_1h" : "sm_2h"), timing: { duration: { hours: h } } as Timing, end: new Date(now.getTime() + h * 3_600_000).toISOString() });
    const list: { label: string; timing: Timing; end: string }[] = [hours(1), hours(2)];
    if (nowMin < 1320) {
      const tonight = at(1320 - nowMin);
      list.push({ label: this._tr("sm_tonight", { time: fmtClock(lang, 1320) }), timing: { until: tonight }, end: tonight });
    }
    const midnight = at(1440 - nowMin);
    list.push({ label: this._tr("sm_all_day"), timing: { until: midnight }, end: midnight });
    const next = this._status?.next_change;
    if (next) {
      list.push({ label: this._tr("sm_next_slot", { time: formatWhen(next, this._tz, lang, now) }), timing: {}, end: next });
    }
    // The current choice: the one that ends when the override ends (the default is the next change).
    const ov = this.program.entities.map((e) => this.data.entities[e.entity_id]?.override)
      .find((o) => o?.origin === "voluntary");
    const target = ov?.until ? new Date(ov.until).getTime() : null;
    let currentIdx = -1;
    if (target !== null) currentIdx = list.findIndex((c) => Math.abs(new Date(c.end).getTime() - target) < 90_000);
    return list.map((c, i) => ({ ...c, current: i === currentIdx }));
  }

  /* ------------------------------------------------------------------ rendering */

  private _sentence(eid: string): string {
    const st = this.hass.states[eid];
    if (!st || st.state === "unavailable" || st.state === "unknown") return this._tr("sm_unavailable");
    const a = st.attributes;
    const lang = this._lang;
    const next = this._next;
    const planned = next ? ` · ${this._tr("sm_planned", { time: next })}` : "";
    switch (entityDomain(eid)) {
      case "climate": {
        const current = typeof a.current_temperature === "number" ? fmtTemp(lang, a.current_temperature) : "—";
        if (st.state === "off") return this._tr("sm_climate_off", { current });
        const wanted = this._pending[eid] ?? a.temperature;
        const target = typeof wanted === "number" ? fmtTemp(lang, wanted) : "—";
        const ov = this.data.entities[eid]?.override;
        const end = ov?.origin === "voluntary" && ov.until ? formatWhen(ov.until, this._tz, lang, new Date()) : next;
        const until = end ? this._tr("sm_until_part", { time: end }) : "";
        const heating = a.hvac_action === "heating" ? ` · ${this._tr("sm_heating")}` : "";
        return this._tr("sm_climate", { current, target, until }) + heating;
      }
      case "cover": {
        let text: string;
        if (st.state === "closed") text = this._tr("sm_cover_closed");
        else if (st.state === "opening" || st.state === "closing") text = this._tr("sm_cover_moving");
        else if (typeof a.current_position === "number" && a.current_position < 100) text = this._tr("sm_cover_open_at", { pos: fmtNum(lang, a.current_position) });
        else text = this._tr("sm_cover_open");
        return text + planned;
      }
      case "light": {
        const pct = this._brightnessPct(eid);
        if (st.state !== "on" && this._pending[eid] === undefined) return this._tr("sm_is_off") + planned;
        return (pct > 0 && pct < 100 ? this._tr("sm_is_on_at", { pct: String(pct) }) : this._tr("sm_is_on")) + planned;
      }
      default:
        return (st.state === "off" ? this._tr("sm_is_off") : this._tr("sm_is_on")) + planned;
    }
  }

  private _activeModeId(eid: string): string | undefined {
    const o = this.data.entities[eid]?.override;
    if (o) {
      const key = JSON.stringify(o.setpoint ?? null);
      return this.data.modes.find((m) => JSON.stringify(modeSetpoint(m, eid)) === key)?.id;
    }
    // the mode the device is actually in (Versatile Thermostat: what it was asked for)
    const st = this.hass.states[eid];
    if (st) {
      const req = st.attributes.requested_state;
      const preset = req?.preset ?? st.attributes.preset_mode;
      const temp = Number(req?.target_temperature ?? st.attributes.temperature);
      const byState = this.data.modes.find((m) => {
        const sp = modeSetpoint(m, eid) as Record<string, unknown>;
        if (m.type !== modeTypeOf(entityDomain(eid))) return false;
        if (sp.kind === "preset") return sp.preset === preset;
        if (sp.kind === "temperature") return (!preset || preset === "none") && Number(sp.temperature) === temp;
        return false;
      });
      if (byState) return byState.id;
    }
    const status = this._status;
    const slotId = status ? Object.values(status.current_slots)[0] : undefined;
    const slot = slotId ? activeProfile(this.program, this.data).days.flat().find((s) => s.id === slotId) : undefined;
    return slot ? slotMode(slot, this.program, this.data.modes)?.id : undefined;
  }

  private _modes(eid: string): TemplateResult | typeof nothing {
    const type = modeTypeOf(entityDomain(eid));
    const modes = this.data.modes.filter((m: Mode) => {
      if (m.type !== type) return false;
      const sp = modeSetpoint(m, eid);
      // never repeat what the big buttons already do (Open / Close, On / Off)
      const big = entityDomain(eid) === "cover" ? ["open", "close"] : ["on", "off"];
      const duplicate = big.includes(sp.kind) && !("brightness" in sp) && !("percentage" in sp);
      return !duplicate && !ONE_SHOT.includes(sp.kind) && applicable(this.hass, eid, sp);
    });
    if (!modes.length) return nothing;
    const active = this._activeModeId(eid);
    return html`<div class="modes" role="group" aria-label=${this._tr("sm_mode")}>
      ${modes.map((m) => {
        const on = m.id === active;
        const effect = modeEffect(this.hass, this._lang, m, eid);
        return html`<button class="seg ${on ? "on" : ""}" aria-pressed=${on} @click=${() => void this._chooseMode(eid, m)}>
          ${on ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}<span>${effect ? `${m.name} · ${effect}` : m.name}</span></button>`;
      })}
    </div>`;
  }

  private async _chooseMode(eid: string, mode: Mode): Promise<void> {
    if (isFrostMode(this.hass, mode, eid)
      && !(await confirmAction(this, this._tr("sm_frost_confirm"), this._tr("sm_frost_do")))) return;
    void this._send([eid], modeSetpoint(mode, eid));
  }

  private _controls(eid: string): TemplateResult | typeof nothing {
    const domain = entityDomain(eid);
    if (domain === "climate") {
      return html`<div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_cooler"), () => this._step(eid, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_warmer"), () => this._step(eid, 1))}</div>`;
    }
    if (domain === "cover") {
      return html`<div class="pair">
        ${this._simple(eid, "mdi:window-shutter-open", this._tr("sm_open"), { kind: "open" })}
        ${this._simple(eid, "mdi:window-shutter", this._tr("sm_close"), { kind: "close" })}</div>`;
    }
    if (domain === "light") {
      return html`<div class="pair">
        ${this._simple(eid, "mdi:lightbulb-on", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(eid, "mdi:lightbulb-off", this._tr("sm_off"), { kind: "off" })}</div>
        <div class="pair">
        ${this._holdButton("mdi:minus", this._tr("sm_dimmer"), () => this._dim(eid, -1))}
        ${this._holdButton("mdi:plus", this._tr("sm_brighter"), () => this._dim(eid, 1))}</div>`;
    }
    if (SWITCHES.includes(domain)) {
      return html`<div class="pair">
        ${this._simple(eid, "mdi:power-plug", this._tr("sm_on"), { kind: "on" })}
        ${this._simple(eid, "mdi:power-plug-off", this._tr("sm_off"), { kind: "off" })}</div>`;
    }
    return nothing;
  }

  private _block(eid: string, named: boolean): TemplateResult {
    return html`<div class="device">
      ${named ? html`<div class="dname">${friendlyName(this.hass, eid)}</div>` : nothing}
      <p class="sentence">${this._sentence(eid)}</p>
      ${this._controls(eid)}${this._modes(eid)}
    </div>`;
  }

  private _overrideLine(): TemplateResult | typeof nothing {
    const active = this.program.entities
      .map((e) => this.data.entities[e.entity_id]?.override)
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
    if (!active.length) return nothing;
    const voluntary = active.some((o) => o.origin === "voluntary");
    const hint = this._tr(mainType(this.program) === "climate" ? "sm_resume_hint_temp" : "sm_resume_hint");
    return html`<div class="actions">
      ${voluntary ? html`<button class="outline" @click=${() => (this._durationOpen = true)}>
        <ha-icon icon="mdi:clock-edit-outline"></ha-icon> ${this._tr("sm_change_duration")}</button>` : nothing}
      <div class="with-hint">
        <button class="outline" @click=${() => this._resume()}><ha-icon icon="mdi:undo-variant"></ha-icon> ${this._tr("sm_resume")}</button>
        <span class="hint">${hint}</span>
      </div>
    </div>`;
  }

  render() {
    if (!this.hass || !this.data || !this.program) return nothing;
    const main = this._main;
    if (!main.length) return nothing;
    const [first, ...others] = main;
    const lang = this._lang;
    return html`
      ${!this.program.enabled ? html`<p class="sentence muted">${this._tr("sm_disabled")}</p>` : html`
        ${this._block(first, false)}
        ${others.length
          ? html`<button class="outline more" aria-expanded=${this._expanded}
              @click=${() => (this._expanded = !this._expanded)}>
              <ha-icon icon=${this._expanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              ${this._expanded ? this._tr("sm_hide_others")
                : others.length === 1 ? this._tr("sm_others_one") : this._tr("sm_others", { n: String(others.length) })}</button>
            ${this._expanded ? others.map((id) => this._block(id, true)) : nothing}`
          : nothing}
        <div class="live" aria-live="polite">${this._message ? html`<div class="done"><ha-icon icon="mdi:check-circle"></ha-icon> ${this._message}</div>` : nothing}</div>
        ${this._error ? html`<div class="err">${this._error}</div>` : nothing}
        ${this._overrideLine()}`}
      ${this.data.can_edit
        ? html`<button class="outline sched" @click=${() => this.dispatchEvent(new CustomEvent("simple-schedule", { detail: { program: this.program }, bubbles: true, composed: true }))}>
            <ha-icon icon="mdi:calendar-clock"></ha-icon> ${strings(lang).sm_change_schedule}</button>`
        : nothing}
      ${this._durationOpen
        ? html`<wp-dialog open heading=${this._tr("sm_duration_title")}
            @closed=${(e: Event) => { e.stopPropagation(); this._durationOpen = false; }}>
            <div class="choices">${this._choices().map((c) => html`<button class="seg wide ${c.current ? "on" : ""}"
              aria-pressed=${c.current} @click=${() => this._applyDuration(c.timing)}>
              ${c.current ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}<span>${c.label}</span>
              ${c.current ? html`<span class="sr">(${this._tr("sm_current")})</span>` : nothing}</button>`)}</div>
            <button slot="footer" class="outline close" @click=${(e: Event) => (e.currentTarget as HTMLElement).closest<HTMLElement & { close(): void }>("wp-dialog")?.close()}>${strings(lang).close}</button>
          </wp-dialog>`
        : nothing}
    `;
  }

  static styles = css`
    :host { display: block; color: var(--primary-text-color); }
    * { box-sizing: border-box; }
    .device + .device { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .dname { font-size: 14px; font-weight: 500; opacity: 0.8; }
    .sentence { font-size: 16px; line-height: 1.4; margin: 4px 0 12px; }
    .muted { opacity: 0.8; }
    .pair { display: flex; gap: 8px; margin-bottom: 8px; }
    button { font: inherit; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
    button:focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    button.big {
      flex: 1 1 0; min-width: 0; min-height: 64px; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 2px; padding: 6px 8px; border-radius: 16px; font-size: 16px; font-weight: 500;
      border: none; cursor: pointer; background: var(--primary-color); color: var(--text-primary-color, #fff);
      --mdc-icon-size: 24px; user-select: none; -webkit-user-select: none;
    }
    button.big:active { filter: brightness(0.9); }
    .modes, .choices { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 8px; }
    button.seg {
      flex: 1 1 96px; min-height: 48px; padding: 4px 12px; border-radius: 24px; font-size: 14px; font-weight: 500;
      border: 1px solid var(--secondary-text-color); background: none; color: var(--primary-text-color); cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; --mdc-icon-size: 20px;
    }
    button.seg.on { background: var(--primary-color); border: 2px solid var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 700; }
    button.seg.wide { flex: 1 1 100%; min-height: 56px; font-size: 16px; }
    button.outline {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 4px 16px;
      border: 1px solid var(--primary-color); border-radius: 24px; background: none; color: var(--primary-color);
      font-size: 15px; font-weight: 500; cursor: pointer; --mdc-icon-size: 22px;
    }
    button.outline.more, button.outline.sched { width: 100%; margin-top: 12px; }
    .actions { display: flex; flex-direction: column; align-items: stretch; gap: 12px; margin-top: 12px; }
    .with-hint { display: flex; flex-direction: column; gap: 4px; }
    .hint { font-size: 14px; opacity: 0.8; text-align: center; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .live { min-height: 0; }
    .done {
      display: flex; align-items: center; gap: 8px; font-size: 16px; padding: 10px 12px; margin: 4px 0;
      border-radius: 12px; background: var(--secondary-background-color); --mdc-icon-size: 22px; color: var(--success-color, #43a047);
    }
    .err { color: var(--error-color, #db4437); font-size: 14px; margin: 4px 0; }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-simple-controls": WpSimpleControls;
  }
}
