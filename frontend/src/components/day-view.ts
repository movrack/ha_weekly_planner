// Read-only view of one program for one day (spec § 10.2): resolved bar, slot list, charts.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./chart";
import "./day-bar";
import "./dialog";
import { addDaysIso, weekdayOf } from "./chart";
import type { BarSpan } from "./day-bar";
import { strings, t } from "../i18n";
import { activeProfile, entityDomain, friendlyName, slotColor, slotLabel } from "../planner";
import { formatClock, localDateIso, localMinutes, nominal, spillover, DAY } from "../time";
import type { HomeAssistant, Mode, PlannerData, PreviewSlot, Program, Setpoint, Slot } from "../types";

const BACK = 14;
const AHEAD = 7;

@customElement("wp-day-view")
export class WpDayView extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ type: Number }) day = 0; // 0 = Monday
  @property({ type: Boolean }) showChart = true;

  @state() private _offset: number | null = null;
  @state() private _open = true;
  @state() private _slots: PreviewSlot[] | null = null;
  @state() private _loadedDate = "";
  private _editing = false;
  private _token = 0;
  private _previews = new Map<string, PreviewSlot[] | null>();

  private get _lang(): string { return this.hass.locale?.language ?? this.hass.language ?? "en"; }
  private get _tz(): string { return this.hass.config.time_zone; }
  private get _today(): string { return localDateIso(new Date(), this._tz); }

  private get _date(): string { return addDaysIso(this._today, this._offset ?? 0); }

  willUpdate(changed: Map<string, unknown>): void {
    if (this._offset === null && this.hass) {
      // Nearest occurrence of the requested weekday, today or later.
      this._offset = (this.day - weekdayOf(this._today) + 7) % 7;
    }
    if (this._offset !== null && this.hass && this.program
      && (changed.has("_offset") || changed.has("program") || changed.has("hass") && !this._loadedDate)) {
      void this._loadPreview();
    }
  }

  private async _loadPreview(): Promise<void> {
    const date = this._date;
    const key = `${this.program.id}|${this.program.revision}|${date}`;
    if (this._previews.has(key)) {
      this._slots = this._previews.get(key) ?? null;
      this._loadedDate = date;
      return;
    }
    const token = ++this._token;
    try {
      const res = await this.hass.callWS<{ slots: PreviewSlot[] }>({
        type: "weekly_planner/preview", program_id: this.program.id, date,
      });
      if (token !== this._token) return;
      this._previews.set(key, res.slots);
      this._slots = res.slots;
    } catch {
      if (token !== this._token) return;
      this._slots = null; // nominal times are used instead
    }
    this._loadedDate = date;
  }

  private _go(delta: number): void {
    const next = (this._offset ?? 0) + delta;
    if (next < -BACK || next > AHEAD) return;
    this._loadedDate = "";
    this._slots = null;
    this._offset = next;
  }

  private _edit(): void {
    this._editing = true;
    this.dispatchEvent(new CustomEvent("edit-day", {
      detail: { day: weekdayOf(this._date) }, bubbles: true, composed: true,
    }));
    this._open = false;
  }

  private _closed = (ev: Event): void => {
    ev.stopPropagation();
    this._open = false;
    if (!this._editing) this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  };

  // ---- content ----

  private _modeSetpoint(mode: Mode | undefined, entityId: string): Setpoint | null {
    return mode ? mode.exceptions?.[entityId] ?? mode.value : null;
  }

  private _setpointText(sp: Setpoint | null): string {
    const s = strings(this._lang);
    if (!sp) return "–";
    switch (sp.kind) {
      case "temperature": return `${sp.temperature} °C`;
      case "preset": return String(sp.preset);
      case "position": return `${sp.position} %`;
      case "open": return s.sp_open;
      case "close": return s.sp_close;
      case "on": return typeof sp.brightness === "number" ? `${sp.brightness} %` : s.sp_on;
      case "off": return s.sp_off;
      case "auto": return s.sp_auto;
      case "value": return String(sp.value);
      case "option": return String(sp.option);
      default: return sp.kind;
    }
  }

  private _bars(date: string, slots: PreviewSlot[] | null): BarSpan[] {
    const s = strings(this._lang);
    const profile = activeProfile(this.program, this.data);
    const modes = this.data.modes;
    const wd = weekdayOf(date);
    const fallback = s.override;
    const spans: BarSpan[] = [];
    for (const { slot, end } of spillover(profile.days[(wd + 6) % 7])) {
      spans.push({ start: 0, end, color: slotColor(slot, this.program, modes), label: slotLabel(slot, this.program, modes, this._lang) });
    }
    const reason = (code: string): string => (s as unknown as Record<string, string>)[`reason_${code}`] ?? code;
    for (const slot of profile.days[wd]) {
      const r = slots?.find((x) => x.slot_id === slot.id);
      let start = nominal(slot.start);
      let end = nominal(slot.end ?? null);
      if (slots) {
        if (!r) continue;
        start = this._minutesOf(r.start, date);
        end = r.end ? this._minutesOf(r.end, date) : null;
      }
      if (start === null) continue;
      const stop = end === null ? start + 10 : end > start ? end : DAY;
      const label = slotLabel(slot, this.program, modes, this._lang);
      spans.push({
        start, end: Math.min(DAY, stop), color: slotColor(slot, this.program, modes),
        label: r?.ignored ? `${label} — ${reason(r.ignored)}` : label,
        sun: r?.sun ?? ("sun" in slot.start || Boolean(slot.end && "sun" in slot.end)),
        ignored: r?.ignored ?? null,
      });
    }
    return spans;
  }

  /** Minutes since local midnight of `date`; capped to 1440 when the instant is on a later day. */
  private _minutesOf(iso: string, date: string): number {
    const local = localDateIso(new Date(iso), this._tz);
    return local > date ? DAY : localMinutes(iso, this._tz);
  }

  private _rows(date: string, slots: PreviewSlot[] | null) {
    const profile = activeProfile(this.program, this.data);
    const wd = weekdayOf(date);
    const rows: { slot: Slot; start: string; end: string; startM: number; r?: PreviewSlot }[] = [];
    for (const slot of profile.days[wd]) {
      const r = slots?.find((x) => x.slot_id === slot.id);
      if (slots && !r) continue;
      const startM = r ? this._minutesOf(r.start, date) : nominal(slot.start) ?? 0;
      const clock = (m: number | null) => (m === null ? "" : `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
      rows.push({
        slot, r, startM,
        start: r ? formatClock(r.start, this._tz, this._lang) : clock(nominal(slot.start)),
        end: r ? (r.end ? formatClock(r.end, this._tz, this._lang) : "") : clock(nominal(slot.end ?? null)),
      });
    }
    return rows.sort((a, b) => a.startM - b.startM);
  }

  private _entityTexts(slot: Slot) {
    const modes = this.data.modes;
    return this.program.entities.map((e) => {
      const direct = slot.actions.by_entity[e.entity_id];
      const mode = modes.find((m) => m.id === slot.actions.by_type[entityDomain(e.entity_id)]);
      const sp = direct ?? this._modeSetpoint(mode, e.entity_id);
      return { entityId: e.entity_id, mode: direct ? undefined : mode, text: this._setpointText(sp) };
    });
  }

  render() {
    if (!this.hass || !this.data || !this.program || this._offset === null) return nothing;
    const s = strings(this._lang);
    const date = this._date;
    const wd = weekdayOf(date);
    const [y, m, d] = date.split("-").map(Number);
    const pretty = new Intl.DateTimeFormat(this._lang, { day: "numeric", month: "long", timeZone: "UTC" })
      .format(new Date(Date.UTC(y, m - 1, d, 12)));
    const ready = this._loadedDate === date;
    const slots = ready ? this._slots : null;
    const isToday = this._offset === 0;
    const nowMin = isToday ? localMinutes(new Date(), this._tz) : null;
    const rows = ready ? this._rows(date, slots) : [];
    return html`
      <wp-dialog wide ?open=${this._open} heading="${s.days[wd]} ${pretty}${isToday ? " · " + s.today : ""}"
        @closed=${this._closed}>
        <button slot="header-start" class="nav" ?disabled=${this._offset <= -BACK}
          aria-label=${s.previous_day} @click=${() => this._go(-1)}><ha-icon icon="mdi:chevron-left"></ha-icon></button>
        <button slot="header-actions" class="nav" ?disabled=${this._offset >= AHEAD}
          aria-label=${s.next_day} @click=${() => this._go(1)}><ha-icon icon="mdi:chevron-right"></ha-icon></button>
        <div class="program">${this.program.name}</div>
        <wp-day-bar show-hours .spans=${ready ? this._bars(date, slots) : []} .now=${nowMin}></wp-day-bar>
        ${ready && !rows.length ? html`<p class="empty">${s.no_slot_day}</p>` : nothing}
        <ul class="slots">
          ${rows.map((row) => html`
            <li class=${row.r?.ignored ? "ignored" : ""}>
              <div class="time">${row.r?.sun ? html`<ha-icon icon="mdi:weather-sunny"></ha-icon>` : nothing}${row.start}${row.end ? html` <ha-icon icon="mdi:arrow-right"></ha-icon> ${row.end}` : nothing}</div>
              <div class="what">
                ${this._entityTexts(row.slot).map((e) => html`
                  <div class="line">
                    <span class="name">${friendlyName(this.hass, e.entityId)}</span>
                    ${e.mode
                      ? html`<span class="pill" style="background:${row.slot.color || e.mode.color}">${e.mode.name}</span>`
                      : nothing}
                    <span class="val">${e.text}</span>
                  </div>`)}
                ${row.r?.ignored
                  ? html`<div class="why">${(s as unknown as Record<string, string>)[`reason_${row.r.ignored}`] ?? row.r.ignored}</div>`
                  : nothing}
              </div>
            </li>`)}
        </ul>
        ${this.showChart && ready
          ? this.program.entities.map((e) => html`
            <section class="chart">
              <h3>${friendlyName(this.hass, e.entity_id)}</h3>
              <wp-chart .hass=${this.hass} .data=${this.data} .program=${this.program}
                .entityId=${e.entity_id} .date=${date} .slots=${slots}></wp-chart>
            </section>`)
          : nothing}
        ${this.data.can_edit
          ? html`<button slot="footer" class="primary" @click=${this._edit}><ha-icon icon="mdi:pencil"></ha-icon> ${s.edit}</button>` : nothing}
      </wp-dialog>
    `;
  }

  static styles = css`
    :host { display: contents; }
    .nav {
      border: none; background: none; color: var(--primary-text-color); font-size: 16px;
      min-width: 40px; height: 40px; border-radius: 20px; cursor: pointer;
    }
    .nav:hover:not([disabled]) { background: var(--secondary-background-color); }
    .nav[disabled] { opacity: 0.3; cursor: default; }
    .program { color: var(--secondary-text-color); margin-bottom: 8px; }
    wp-day-bar { margin: 4px 0 8px; }
    .empty { color: var(--secondary-text-color); text-align: center; }
    ul.slots { list-style: none; margin: 8px 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
    li { display: flex; gap: 12px; padding: 8px 10px; border-radius: 10px; background: var(--secondary-background-color); }
    li.ignored .time, li.ignored .name, li.ignored .val { text-decoration: line-through; opacity: 0.7; }
    .time { min-width: 96px; --mdc-icon-size: 16px; font-weight: 500; font-variant-numeric: tabular-nums; }
    .what { flex: 1; min-width: 0; }
    .line { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
    .name { color: var(--secondary-text-color); font-size: 13px; }
    .pill { color: #fff; border-radius: 10px; padding: 1px 8px; font-size: 12px; font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5); }
    .why { font-size: 12px; color: var(--secondary-text-color); font-style: italic; }
    .chart h3 { margin: 16px 0 4px; font-size: 14px; font-weight: 500; }
    button.primary {
      border: none; border-radius: 18px; padding: 8px 18px; min-height: 40px; cursor: pointer;
      background: var(--primary-color); color: var(--text-primary-color, #fff); font-size: 14px;
    }
    @media (max-width: 420px) { .time { min-width: 80px; } }
  `;
}
