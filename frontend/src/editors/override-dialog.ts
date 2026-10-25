// "Override…" dialog: pick entities of a program, a setpoint (or a mode) and a duration.
// Also lists the overrides in progress with "Resume".

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/dialog";
import { t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import { formatClock, localDateIso } from "../time";
import type { HomeAssistant, PlannerData, Program, Setpoint } from "../types";
import "./setpoint-editor";
import { defaultSetpoint, editorStyles, langOf, modeTypeOf } from "./setpoint-editor";
import type { K } from "./setpoint-editor";

const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Milliseconds to add to a UTC instant to get the wall clock time in a zone. */
function zoneOffset(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const n = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wall = Date.UTC(n("year"), n("month") - 1, n("day"), n("hour"), n("minute"), n("second"));
  return wall - Math.floor(date.getTime() / 1000) * 1000;
}

/** The instant at which the wall clock of `timeZone` shows `date` + `clock`. */
export function zonedInstant(dateIso: string, clock: string, timeZone: string): Date {
  const [y, mo, d] = dateIso.split("-").map(Number);
  const [h, mi] = clock.split(":").map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let guess = wall;
  for (let i = 0; i < 3; i++) guess = wall - zoneOffset(new Date(guess), timeZone);
  return new Date(guess);
}

function addDays(dateIso: string, days: number): string {
  const [y, mo, d] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(y, mo - 1, d + days)).toISOString().slice(0, 10);
}

@customElement("wp-override-dialog")
export class WpOverrideDialog extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @state() private _sel: string[] = [];
  @state() private _how: "setpoint" | "mode" = "setpoint";
  @state() private _sp: Setpoint | null = null;
  @state() private _modeId = "";
  @state() private _dur: "next" | "for" | "until" = "next";
  @state() private _hours = 1;
  @state() private _minutes = 0;
  @state() private _untilTime = "18:00";
  @state() private _untilDate = "";
  @state() private _error = "";
  @state() private _busy = false;
  private _init = false;

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  willUpdate(): void {
    if (this._init || !this.program) return;
    this._init = true;
    this._sel = this.program.entities.map((e) => e.entity_id);
  }

  private get _rep(): string {
    return this._sel[0] ?? this.program.entities[0]?.entity_id ?? "";
  }

  private get _sameType(): boolean {
    return new Set(this._sel.map((id) => modeTypeOf(entityDomain(id)))).size <= 1;
  }

  private get _modes() {
    const type = modeTypeOf(entityDomain(this._rep));
    return this.data.modes.filter((m) => m.type === type);
  }

  private _toggle(id: string, on: boolean): void {
    this._sel = on ? [...this._sel, id] : this._sel.filter((x) => x !== id);
    this._sp = null;
    this._modeId = "";
    this._error = "";
  }

  private _timing(): Record<string, unknown> | string {
    if (this._dur === "next") return {};
    if (this._dur === "for") {
      const hours = Math.max(0, Math.floor(this._hours || 0));
      const minutes = Math.max(0, Math.floor(this._minutes || 0));
      const total = (hours * 60 + minutes) * 60000;
      if (total <= 0) return this._tr("ov_err_duration");
      if (total > WEEK_MS) return this._tr("ov_err_week");
      return { duration: { hours, minutes } };
    }
    const tz = this.hass.config.time_zone;
    const now = new Date();
    let at: Date;
    if (this._untilDate) {
      at = zonedInstant(this._untilDate, this._untilTime, tz);
    } else {
      const today = localDateIso(now, tz);
      at = zonedInstant(today, this._untilTime, tz);
      if (at <= now) at = zonedInstant(addDays(today, 1), this._untilTime, tz);
    }
    if (at.getTime() <= now.getTime()) return this._tr("ov_err_past");
    if (at.getTime() - now.getTime() > WEEK_MS) return this._tr("ov_err_week");
    return { until: at.toISOString() };
  }

  private async _apply(): Promise<void> {
    if (!this._sel.length) {
      this._error = this._tr("ov_err_no_entity");
      return;
    }
    if (!this._sameType) {
      this._error = this._tr("ov_err_mixed");
      return;
    }
    const timing = this._timing();
    if (typeof timing === "string") {
      this._error = timing;
      return;
    }
    const groups = new Map<string, { entity_id: string[]; setpoint: Setpoint }>();
    if (this._how === "mode") {
      const mode = this._modes.find((m) => m.id === this._modeId);
      if (!mode) {
        this._error = this._tr("ov_err_no_setpoint");
        return;
      }
      for (const id of this._sel) {
        const setpoint = mode.exceptions?.[id] ?? mode.value;
        const key = JSON.stringify(setpoint);
        const group = groups.get(key) ?? { entity_id: [], setpoint };
        group.entity_id.push(id);
        groups.set(key, group);
      }
    } else {
      const setpoint = this._sp ?? defaultSetpoint(this.hass, this._rep);
      groups.set("sp", { entity_id: [...this._sel], setpoint });
    }
    this._busy = true;
    try {
      for (const group of groups.values()) {
        await this.hass.callService("weekly_planner", "override", { ...group, ...timing });
      }
      this.shadowRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
    } catch (err) {
      this._error = this._tr("error", { message: (err as { message?: string })?.message ?? String(err) });
    } finally {
      this._busy = false;
    }
  }

  private async _resume(entityId: string): Promise<void> {
    try {
      await this.hass.callService("weekly_planner", "resume", { entity_id: [entityId] });
    } catch (err) {
      this._error = this._tr("error", { message: (err as { message?: string })?.message ?? String(err) });
    }
  }

  private _current() {
    const rows = this.program.entities
      .map((e) => ({ id: e.entity_id, o: this.data.entities[e.entity_id]?.override }))
      .filter((x) => x.o);
    if (!rows.length) return nothing;
    const tz = this.hass.config.time_zone;
    return html`
      <h3>${this._tr("ov_current")}</h3>
      ${rows.map(({ id, o }) => html`
        <div class="card row" style="flex-wrap:nowrap">
          <div class="grow"><strong>${friendlyName(this.hass, id)}</strong>
            <div class="muted small">${o!.origin === "voluntary" && o!.until
              ? this._tr("overridden_until", { time: formatClock(o!.until, tz, this._lang) })
              : o!.origin === "voluntary" ? this._tr("ov_until_next") : this._tr("overridden")}</div></div>
          <button class="btn" @click=${() => void this._resume(id)}>${this._tr("resume")}</button>
        </div>`)}`;
  }

  render() {
    if (!this.program || !this.data) return nothing;
    const editable = this.data.can_edit && !this.data.read_only;
    const modes = this._modes;
    return html`
      <wp-dialog open heading=${`${this._tr("override")} — ${this.program.name}`}>
        ${this._current()}
        <h3>${this._tr("ov_entities")}</h3>
        <div role="group" aria-label=${this._tr("ov_entities")}>
          ${this.program.entities.map((e) => html`
            <label class="check"><input type="checkbox" .checked=${this._sel.includes(e.entity_id)}
              @change=${(ev: Event) => this._toggle(e.entity_id, (ev.target as HTMLInputElement).checked)} />
              ${friendlyName(this.hass, e.entity_id)}</label>`)}
        </div>
        ${!this._sameType ? html`<p class="error">${this._tr("ov_err_mixed")}</p>` : nothing}

        <h3>${this._tr("setpoint")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("setpoint")}>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "setpoint"} @change=${() => (this._how = "setpoint")} /> ${this._tr("ov_how_setpoint")}</label>
          <label class="check"><input type="radio" name="how" .checked=${this._how === "mode"} ?disabled=${!modes.length} @change=${() => (this._how = "mode")} /> ${this._tr("ov_how_mode")}</label>
        </div>
        ${this._how === "mode"
          ? html`<div class="field"><select aria-label=${this._tr("ov_how_mode")} @change=${(e: Event) => (this._modeId = (e.target as HTMLSelectElement).value)}>
              <option value="" ?selected=${!this._modeId}>—</option>
              ${modes.map((m) => html`<option value=${m.id} ?selected=${m.id === this._modeId}>${m.name}</option>`)}
            </select></div>`
          : this._rep
            ? html`<wp-setpoint-editor .hass=${this.hass} entity-id=${this._rep} state-only
                .value=${this._sp ?? defaultSetpoint(this.hass, this._rep)}
                @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._sp = e.detail; this._error = ""; }}></wp-setpoint-editor>`
            : nothing}

        <h3>${this._tr("ov_duration")}</h3>
        <div role="radiogroup" aria-label=${this._tr("ov_duration")}>
          <label class="check"><input type="radio" name="dur" .checked=${this._dur === "next"} @change=${() => (this._dur = "next")} /> ${this._tr("ov_until_next")}</label>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "for"} @change=${() => (this._dur = "for")} /> ${this._tr("ov_for")}</label>
            <input type="number" min="0" max="168" style="width:80px" aria-label=${this._tr("ov_hours")} .value=${String(this._hours)}
              @focus=${() => (this._dur = "for")} @input=${(e: Event) => (this._hours = Number((e.target as HTMLInputElement).value))} /> h
            <input type="number" min="0" max="59" step="5" style="width:80px" aria-label=${this._tr("ov_minutes")} .value=${String(this._minutes)}
              @focus=${() => (this._dur = "for")} @input=${(e: Event) => (this._minutes = Number((e.target as HTMLInputElement).value))} /> min
          </div>
          <div class="row">
            <label class="check"><input type="radio" name="dur" .checked=${this._dur === "until"} @change=${() => (this._dur = "until")} /> ${this._tr("ov_until")}</label>
            <input type="time" step="300" style="width:130px" aria-label=${this._tr("ov_until")} .value=${this._untilTime}
              @focus=${() => (this._dur = "until")} @input=${(e: Event) => { this._untilTime = (e.target as HTMLInputElement).value; this._dur = "until"; }} />
            <input type="date" style="width:160px" aria-label=${this._tr("ov_date")} .value=${this._untilDate}
              min=${localDateIso(new Date(), this.hass.config.time_zone)}
              max=${addDays(localDateIso(new Date(), this.hass.config.time_zone), 7)}
              @input=${(e: Event) => { this._untilDate = (e.target as HTMLInputElement).value; this._dur = "until"; }} />
          </div>
          ${this._dur === "until" ? html`<p class="hint">${this._tr("ov_until_hint")}</p>` : nothing}
        </div>
        ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
        <button slot="footer" class="btn" @click=${() => this.shadowRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" ?disabled=${!editable || this._busy} @click=${() => void this._apply()}>${this._tr("ov_apply")}</button>
      </wp-dialog>`;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: contents; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .small { font-size: 12px; }
    `,
  ];
}
