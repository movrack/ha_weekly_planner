// The card: a planner. One compact line per device (or per schedule) with its day bar; every
// change of the schedule happens in the schedule screen. No immediate controls.

import { LitElement, css, html, nothing } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { customElement, property, state } from "lit/decorators.js";
import "./components/bar-editor";
import "./components/day-bar";
import { sunDir } from "./components/day-bar";
import "./components/dialog";
import "./components/labels-dialog";
import "./components/schedule-dialog";
import "./editors/program-editor";
import type { BarSpan } from "./components/day-bar";
import { scopeKey } from "./components/schedule-dialog";
import type { Scope } from "./components/schedule-dialog";
import { nb } from "./actions";
import { actionText, entityAction, labelOf } from "./labels";
import { strings, t } from "./i18n";
import { loadServiceNames } from "./services";
import { reloadIfOutdated } from "./update";
import { activeProfile, entityDomain, filterPrograms, friendlyName, subscribePlanner } from "./planner";
import { formatWhen, localDateIso, localMinutes, localWeekday, nominal, spillover, DAY } from "./time";
import type { CardConfig, HomeAssistant, PlannerData, PreviewSlot, Program, Slot } from "./types";

type Dialog =
  | { kind: "schedule"; scope: Scope; day?: { weekday: number; offset: number } }
  | { kind: "program"; program?: Program }
  | { kind: "admin" }
  | { kind: "labels" }
  | null;

const ICONS: Record<string, string> = {
  climate: "mdi:thermostat", cover: "mdi:window-shutter", light: "mdi:lightbulb",
  switch: "mdi:power-plug", input_boolean: "mdi:toggle-switch", fan: "mdi:fan", vacuum: "mdi:robot-vacuum",
  water_heater: "mdi:water-boiler", media_player: "mdi:play-box", lock: "mdi:lock", button: "mdi:gesture-tap-button",
};

@customElement("weekly-planner-card")
export class WeeklyPlannerCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: CardConfig;
  @state() private _data?: PlannerData;
  @state() private _error?: string;
  @state() private _dialog: Dialog = null;
  // Resolved slots (sun times) per local date, then per program: today and the next 6 days.
  @state() private _preview: Record<string, Record<string, PreviewSlot[]>> = {};
  @state() private _now = new Date();
  @state() private _week = new Set<string>();
  /** Bar being edited in place (null: none), and the "Changed · Undo" bar. */
  @state() private _edit: string | null = null;
  @state() private _snack: { undo: () => Promise<boolean> } | null = null;
  private _snackTimer?: number;
  private _unsub?: () => void;
  private _clock?: number;
  private _previewKey = "";

  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }

  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }

  setConfig(config: CardConfig): void {
    this._config = { show_chart: true, ...config };
  }

  getCardSize(): number {
    return 2 + (this._data?.programs.length ?? 1) * 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._clock = window.setInterval(() => {
      this._now = new Date();
      this._checkVersion();
    }, 60_000);
    document.addEventListener("visibilitychange", this._visible);
  }

  private _visible = (): void => {
    if (!document.hidden) this._checkVersion();
  };

  /** Page at rest: nothing open and no edit in progress. */
  private get _idle(): boolean {
    return !this._dialog && this._edit === null && !this._snack;
  }

  /** The integration serves a newer card: reload by itself once the page is idle (never in a loop). */
  private _checkVersion(): void {
    reloadIfOutdated(this._data?.card_version, this._idle);
  }

  private _showSnack(undo: () => Promise<boolean>): void {
    this._snack = { undo };
    window.clearTimeout(this._snackTimer);
    this._snackTimer = window.setTimeout(() => (this._snack = null), 6000);
  }

  private async _undo(): Promise<void> {
    const snack = this._snack;
    window.clearTimeout(this._snackTimer);
    this._snack = null;
    await snack?.undo();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._snackTimer);
    document.removeEventListener("visibilitychange", this._visible);
    this._unsub?.();
    this._unsub = undefined;
    window.clearInterval(this._clock);
  }

  updated(changed: Map<string, unknown>): void {
    if (this._idle && this._data?.card_version) this._checkVersion();
    if (changed.has("hass") && this.hass && !this._unsub) {
      this._unsub = subscribePlanner(this.hass, (data) => {
        this._data = data;
        this._error = undefined;
        void this._loadNames(data);
        void this._loadPreviews();
      });
    }
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private get _tz(): string {
    return this.hass.config.time_zone;
  }

  /** The moment `offset` days from now (only its local date and weekday are used). */
  private _dateAt(offset: number): Date {
    return new Date(this._now.getTime() + offset * 86_400_000);
  }

  /** Translated names of the services used by the labels. */
  private async _loadNames(data: PlannerData): Promise<void> {
    const domains = data.labels.flatMap((l) => (l.action.kind === "service" ? [l.action.service.split(".")[0]] : []));
    if (await loadServiceNames(this.hass, domains)) this.requestUpdate();
  }

  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  private async _loadPreviews(): Promise<void> {
    if (!this._data) return;
    const dates = [0, 1, 2, 3, 4, 5, 6].map((o) => localDateIso(this._dateAt(o), this._tz));
    const programs = filterPrograms(this._data, this._config);
    const key = `${dates[0]}|${programs.map((p) => `${p.id}:${p.revision}`).join(",")}`;
    if (key === this._previewKey) return;
    this._previewKey = key;
    const previews: Record<string, Record<string, PreviewSlot[]>> = {};
    await Promise.all(dates.flatMap((date) => programs.map((p) =>
      this.hass.callWS<{ slots: PreviewSlot[] }>({ type: "weekly_planner/preview", program_id: p.id, date })
        .then((res) => { (previews[date] ??= {})[p.id] = res.slots; })
        .catch(() => undefined))));
    // a newer edit started its own loading meanwhile: these previews are stale
    if (key === this._previewKey) this._preview = previews;
  }

  /* ---- blocks ---- */

  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it. */
  private _spans(entityId: string, programs: Program[], offset = 0): BarSpan[] {
    const data = this._data!;
    const at = this._dateAt(offset);
    const today = localWeekday(at, this._tz);
    const preview = this._preview[localDateIso(at, this._tz)] ?? {};
    const spans: BarSpan[] = [];
    for (const program of [...programs].reverse()) {
      if (!program.enabled) continue;
      const profile = activeProfile(program, data);
      const of = (slot: Slot) => entityAction(program, entityId, labelOf(data, slot.label));
      const mk = (slot: Slot, start: number, end: number, extra: Partial<BarSpan> = {}): BarSpan => {
        const label = labelOf(data, slot.label)!;
        return { start, end, color: label.color, label: label.name, slotId: slot.id, startSun: sunDir(slot.start),
          endSun: slot.end ? sunDir(slot.end) : null, marker: !slot.end, ...extra };
      };
      for (const { slot, end } of spillover(profile.days[(today + 6) % 7])) {
        if (of(slot)) spans.push(mk(slot, 0, end, { spill: true, startSun: null }));
      }
      const resolved = preview[program.id];
      for (const slot of profile.days[today]) {
        if (!of(slot)) continue;
        const r = resolved?.find((x) => x.slot_id === slot.id);
        let start = nominal(slot.start);
        let end = nominal(slot.end ?? null);
        if (r) {
          start = localMinutes(r.start, this._tz);
          end = r.end ? localMinutes(r.end, this._tz) : null;
        }
        if (start === null) continue;
        spans.push(mk(slot, start, end === null ? start + 10 : end > start ? end : DAY,
          { sun: "sun" in slot.start || Boolean(slot.end && "sun" in slot.end), ignored: r?.ignored ?? null }));
      }
    }
    return spans;
  }

  private _next(entityId: string, programs: Program[]) {
    const data = this._data!;
    for (const p of programs) {
      if (!p.enabled) continue;
      const n = data.status[p.id]?.next_actions?.[entityId];
      if (n) return n;
    }
    return undefined;
  }

  /* ---- actions ---- */

  private _open(scope: Scope, day?: { weekday: number; offset: number }): void {
    this._dialog = { kind: "schedule", scope, day };
  }

  /* ---- render ---- */

  /** A bar that can be edited in place: today's (`kind` "today") or one of the week's. */
  private _bar(entityId: string, program: Program, offset: number, kind: "today" | "week", openDay: () => void) {
    const at = this._dateAt(offset);
    const weekday = localWeekday(at, this._tz);
    const date = localDateIso(at, this._tz);
    const key = `${program.id}|${entityId}|${kind}|${weekday}`;
    const programs = [program];
    return html`<wp-bar-editor .hass=${this.hass} .data=${this._data} .program=${program} entity-id=${entityId}
      weekday=${weekday} .spans=${this._spans(entityId, programs, offset)} .preview=${this._preview[date]?.[program.id]}
      .now=${offset === 0 ? localMinutes(this._now, this._tz) : null} ?hours=${kind === "today"}
      ?editing=${this._edit === key} ?editable=${Boolean(this._data?.can_edit) && !this._data?.read_only}
      lang=${this._lang} tz=${this._tz}
      @edit-request=${() => (this._edit = key)} @edit-exit=${() => { if (this._edit === key) this._edit = null; }}
      @open-day=${openDay} @edited=${(e: CustomEvent<{ undo: () => Promise<boolean> }>) => this._showSnack(e.detail.undo)}></wp-bar-editor>`;
  }

  private _line(entityId: string, programs: Program[], opts: { name: string | null; icon?: string; button: Scope | null; open: Scope }) {
    const lang = this._lang;
    const data = this._data!;
    const next = this._next(entityId, programs);
    const nextLabel = labelOf(data, next?.label);
    const paused = programs.length > 0 && programs.every((p) => !p.enabled);
    const stateObj = this.hass.states[entityId];
    const icon = opts.icon ?? stateObj?.attributes.icon ?? ICONS[entityDomain(entityId)] ?? "mdi:calendar-clock";
    const open = () => this._open(opts.open);
    return html`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${icon}></ha-icon>
          <div class="info">
            ${opts.name ? html`<span class="name">${opts.name}</span>` : nothing}
            <span class="now">
              <span class="nw">${stateObj ? (this.hass.formatEntityState?.(stateObj) ?? stateObj.state) : "—"}</span>
              ${next ? html`<span class="next">→ ${nextLabel?.name ?? actionText(this.hass, lang, next.action)}
                <span class="when nw">${nb(formatWhen(next.at, this._tz, lang, this._now))}</span></span>` : nothing}
            </span>
          </div>
          ${paused ? html`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${t(lang, "paused")}></ha-icon>` : nothing}
          ${opts.button ? html`<button class="hours" aria-label=${t(lang, "hours")} title=${t(lang, "hours")} @click=${open}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : nothing}
        </div>
        <div class="today">
          <span class="wname">${t(lang, "today_short")}</span>
          ${this._bar(entityId, programs[0], 0, "today", open)}
        </div>
        ${this._weekRows(`${scopeKey(opts.open)}|${entityId}`, entityId, programs, opts.open)}
      </div>`;
  }

  /** Collapsible list of the next 6 days, one thin bar each, below today's bar. */
  private _weekRows(key: string, entityId: string, programs: Program[], scope: Scope) {
    const lang = this._lang;
    const open = this._week.has(key);
    const toggle = () => {
      const week = new Set(this._week);
      if (open) week.delete(key);
      else week.add(key);
      this._week = week;
    };
    const days = strings(lang).days_short;
    return html`
      <button class="weekbtn" aria-expanded=${open} @click=${toggle}>
        <ha-icon icon=${open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>${t(lang, "week")}</button>
      ${open ? html`<div class="week">
        ${[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
          // the whole week, Monday to Sunday, each day at its next occurrence (today included)
          const o = (weekday - localWeekday(this._now, this._tz) + 7) % 7;
          const openDay = () => this._open(scope, { weekday, offset: o });
          return html`<div class="wday">
            <button class="wnamebtn" aria-label=${days[weekday]} @click=${openDay}>
              <span class="wname ${o === 0 ? "today" : ""}">${days[weekday]}</span></button>
            ${this._bar(entityId, programs[0], o, "week", openDay)}</div>`;
        })}
      </div>` : nothing}`;
  }

  private _bySchedule(programs: Program[]) {
    const lang = this._lang;
    return programs.map((p) => {
      const scope: Scope = { kind: "program", programId: p.id };
      // One device: one line named after the schedule (the name set in its settings).
      if (p.entities.length === 1) {
        return this._line(p.entities[0].entity_id, [p], { name: p.name, icon: p.icon ?? undefined, button: scope, open: scope });
      }
      return html`
      <section class="prog">
        <div class="phead">
          <ha-icon icon=${p.icon ?? "mdi:calendar-clock"}></ha-icon>
          <h2>${p.name}</h2>
          ${p.enabled ? nothing : html`<ha-icon class="pause" icon="mdi:pause-circle-outline" title=${t(lang, "paused")}></ha-icon>`}
          <button class="hours" aria-label=${t(lang, "hours")} title=${t(lang, "hours")} @click=${() => this._open(scope)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
        </div>
        ${p.entities.map((e) => this._line(e.entity_id, [p], { name: friendlyName(this.hass, e.entity_id), button: null, open: scope }))}
      </section>`;
    });
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const lang = this._lang;
    const data = this._data;
    const programs = data ? filterPrograms(data, this._config) : [];
    const admin = Boolean(data) && Boolean(this.hass.user?.is_admin) && Boolean(data?.can_edit);
    const showTitle = this._config.title !== undefined && this._config.title !== "";
    return html`
      <ha-card>
        ${showTitle || admin || data?.vacation
          ? html`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${data?.vacation ? html`<span class="chip"><ha-icon icon="mdi:bag-suitcase"></ha-icon> ${t(lang, "vacation")}</span>` : nothing}
              ${admin ? html`<button class="gear" aria-label=${t(lang, "all_programs")} @click=${() => (this._dialog = { kind: "admin" })}>
                <ha-icon icon="mdi:format-list-bulleted"></ha-icon></button>` : nothing}
            </div>`
          : nothing}
        ${this._error ? html`<div class="error">${t(lang, "error", { message: this._error })}</div>` : nothing}
        ${data?.read_only ? html`<div class="error">${t(lang, "read_only")}</div>` : nothing}
        ${!data ? html`<div class="empty">…</div>` : nothing}
        ${data && !programs.length ? html`<div class="empty">${t(lang, "no_program")}</div>` : nothing}
        ${data ? this._bySchedule(programs) : nothing}
      </ha-card>
      ${this._snack ? html`<div class="snack" role="status"><span>${t(lang, "edited")} ·</span>
        <button @click=${() => void this._undo()}>${t(lang, "undo")}</button></div>` : nothing}
      ${this._renderDialog()}`;
  }

  private _renderDialog() {
    const d = this._dialog;
    if (!d || !this._data) return nothing;
    const close = () => (this._dialog = null);
    switch (d.kind) {
      case "schedule":
        return keyed(scopeKey(d.scope), html`<wp-schedule .hass=${this.hass} .data=${this._data} .scope=${d.scope} .day=${d.day ?? null}
          .chart=${this._config.show_chart !== false} @closed=${close}
          @open-settings=${(e: CustomEvent<{ programId: string }>) => {
            const program = this._data!.programs.find((p) => p.id === e.detail.programId);
            if (program) this._dialog = { kind: "program", program };
          }}></wp-schedule>`);
      case "program":
        return html`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${d.program}
          @closed=${close}></wp-program-editor>`;
      case "labels":
        return html`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${close}></wp-labels>`;
      case "admin": {
        const lang = this._lang;
        return html`<wp-dialog open heading=${t(lang, "all_programs")} @closed=${close}>
          <div class="adm">
            <button class="admrow" @click=${() => (this._dialog = { kind: "labels" })}>
              <ha-icon icon="mdi:label-multiple-outline"></ha-icon><span>${t(lang, "labels")}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>
            ${this._data.programs.map((p) => html`<button class="admrow" @click=${() => (this._dialog = { kind: "program", program: p })}>
              <ha-icon icon=${p.icon ?? "mdi:calendar-clock"}></ha-icon><span>${p.name}</span><ha-icon icon="mdi:chevron-right"></ha-icon></button>`)}
            <button class="admrow add" @click=${() => (this._dialog = { kind: "program" })}>
              <ha-icon icon="mdi:plus"></ha-icon><span>${t(lang, "new_program")}</span></button>
          </div></wp-dialog>`;
      }
    }
  }

  static styles = css`
    ha-card { padding: 8px 16px 12px; }
    .head { display: flex; align-items: center; gap: 8px; min-height: 48px; }
    h1 { flex: 1; min-width: 0; margin: 0; font-size: 20px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip { display: inline-flex; align-items: center; gap: 4px; --mdc-icon-size: 14px; font-size: 14px; padding: 2px 10px; border-radius: 12px; background: var(--warning-color, #ff9800); color: #fff; }
    .gear {
      border: none; background: none; color: inherit; width: 48px; height: 48px; border-radius: 24px; cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center; --mdc-icon-size: 22px; flex: none;
    }
    .gear:hover { background: var(--secondary-background-color); }
    .block { padding: 8px 0; border-top: 1px solid var(--divider-color); }
    .block:first-of-type, .head + .block { border-top: none; }
    .line { display: flex; align-items: flex-start; gap: 10px; min-height: 28px; }
    .dev { --mdc-icon-size: 26px; flex: none; color: var(--secondary-text-color); margin-top: -1px; }
    .info { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; align-items: baseline; column-gap: 8px; row-gap: 0; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .next { min-width: 0; overflow-wrap: anywhere; }
    .when { opacity: 0.8; }
    .pause { --mdc-icon-size: 20px; color: var(--secondary-text-color); flex: none; margin-top: 2px; }
    .name, .now { line-height: 24px; }
    button.hours {
      flex: none; width: 48px; height: 48px; padding: 0; border-radius: 24px; border: none;
      background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 24px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.hours:hover { background: var(--secondary-background-color); }
    .line button.hours { margin: -12px 0; }
    wp-bar-editor { margin-top: 2px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday { display: flex; align-items: flex-start; gap: 8px; min-height: 48px; width: 100%; }
    .wnamebtn {
      flex: none; width: 44px; height: 48px; padding: 0; border: none; border-radius: 8px; background: none; color: inherit;
      font: inherit; cursor: pointer; text-align: left; display: flex; align-items: center;
    }
    .wnamebtn:hover .wname { text-decoration: underline; }
    .wday wp-bar-editor { margin: 10px 0; }
    .wname { flex: none; width: 36px; font-size: 14px; color: var(--secondary-text-color); }
    .wday wp-bar-editor, .today wp-bar-editor { flex: 1; min-width: 0; }
    .wname.today { color: var(--primary-text-color); font-weight: 600; }
    .today { display: flex; align-items: flex-start; gap: 8px; padding-top: 12px; }
    .today .wname { line-height: 28px; margin-top: 2px; }
    .prog { padding: 8px 0 4px; border-top: 1px solid var(--divider-color); }
    .prog:first-of-type, .head + .prog { border-top: none; }
    .prog .block { border-top: none; padding: 2px 0 4px; }
    .phead { display: flex; align-items: center; gap: 10px; min-height: 48px; --mdc-icon-size: 24px; }
    .phead h2 { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; overflow-wrap: anywhere; }
    .snack {
      position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 8; display: flex; align-items: center; gap: 12px;
      min-height: 48px; padding: 0 8px 0 16px; border-radius: 24px; font-size: 15px; white-space: nowrap;
      background: var(--primary-text-color); color: var(--card-background-color, #fff); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }
    .snack button {
      min-height: 48px; padding: 0 12px; border: none; background: none; font: inherit; font-weight: 600; cursor: pointer;
      color: inherit; text-decoration: underline; border-radius: 24px;
    }
    .empty { color: var(--primary-text-color); opacity: 0.8; padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 14px; margin: 8px 0; }
    .adm { display: flex; flex-direction: column; gap: 8px; }
    .admrow {
      display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 0 12px; border-radius: 12px; font: inherit; font-size: 16px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); cursor: pointer; text-align: left;
    }
    .admrow span { flex: 1; }
    .admrow.add { border-style: dashed; color: var(--primary-color); }
  `;
}
