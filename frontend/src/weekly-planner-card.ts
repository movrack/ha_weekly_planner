// The card: a planner. One compact line per device (or per schedule) with its day bar; every
// change of the schedule happens in the schedule screen. No immediate controls.

import { LitElement, css, html, nothing } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { customElement, property, state } from "lit/decorators.js";
import "./components/bar-editor";
import "./components/day-bar";
import "./components/radial-day";
import { confirmAction } from "./components/confirm";
import { sunDir } from "./components/day-bar";
import "./components/dialog";
import "./components/labels-dialog";
import "./components/schedule-dialog";
import type { BarSpan } from "./components/day-bar";
import { scopeKey } from "./components/schedule-dialog";
import type { Scope } from "./components/schedule-dialog";
import { nb } from "./actions";
import { actionText, entityAction, labelOf } from "./labels";
import { strings, t } from "./i18n";
import { loadServiceNames } from "./services";
import { reloadIfOutdated } from "./update";
import { fetchPreview } from "./preview-cache";
import { activeProfile, filterPrograms, friendlyName, subscribePlanner } from "./planner";
import { dayBounds, addDaysIso } from "./components/chart";
import { formatWhen, localDateIso, localMinutes, localWeekday, nominal, spillover, DAY } from "./time";
import type { CardConfig, HomeAssistant, PlannerData, PreviewSlot, Program, Slot } from "./types";

type Dialog =
  | { kind: "schedule"; scope: Scope; day?: { weekday: number; offset: number } }
  | { kind: "labels" }
  | null;

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
  @state() private _expandedProgram: string | null = null;
  /** Bar being edited in place (null: none), and the "Changed · Undo" bar. */
  @state() private _edit: string | null = null;
  @state() private _snack: { undo: () => Promise<boolean> } | null = null;
  private _snackTimer?: number;
  private _ticks = 0;
  private _unsub?: () => void;
  private _clock?: number;
  private _previewKey = "";
  @state() private _toggling = new Set<string>();

  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }

  static getStubConfig() {
    return { filter: {} };
  }

  setConfig(config: CardConfig): void {
    this._config = { show_chart: true, ...config };
    if (this._data) void this._loadPreviews();
  }

  getCardSize(): number {
    return 2 + (this._data?.programs.length ?? 1) * 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    // HA can reattach a cached view without assigning a new hass object.
    this.requestUpdate();
    this._clock = window.setInterval(() => {
      this._now = new Date();
      void this._loadPreviews();
      this._checkVersion();
      if (++this._ticks % 5 === 0) void this._pollVersion();
    }, 60_000);
    document.addEventListener("visibilitychange", this._visible);
  }

  private _visible = (): void => {
    if (!document.hidden) void this._pollVersion();
  };

  /** Page at rest: nothing open and no edit in progress. */
  private get _idle(): boolean {
    return !this._dialog && this._edit === null && !this._snack;
  }

  /** The integration serves a newer card: reload by itself once the page is idle (never in a loop). */
  private _checkVersion(): void {
    reloadIfOutdated(this._data?.card_version, this._idle);
  }

  /** Asks the server for the served version (a reload of the integration does not push new data to old subscriptions). */
  private async _pollVersion(): Promise<void> {
    try {
      const fresh = await this.hass.callWS<PlannerData>({ type: "weekly_planner/get" });
      reloadIfOutdated(fresh.card_version, this._idle);
    } catch {
      /* offline: the next tick tries again */
    }
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

  updated(): void {
    if (this._idle && this._data?.card_version) this._checkVersion();
    if (this.isConnected && this.hass && !this._unsub) {
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
    return new Date(dayBounds(addDaysIso(localDateIso(this._now, this._tz), offset), this._tz).startMs + 12 * 3_600_000);
  }

  /** Translated names of the services used by the labels. */
  private async _loadNames(data: PlannerData): Promise<void> {
    const domains = data.labels.flatMap((l) => (l.action.kind === "service" ? [l.action.service.split(".")[0]] : []));
    if (await loadServiceNames(this.hass, domains)) this.requestUpdate();
  }

  /** Resolved slots of the coming 7 days (sun times), reloaded only when a program changes. */
  private _failedPreviewKey = "";
  private _previewRetryAt = 0;

  private async _loadPreviews(): Promise<void> {
    if (!this._data) return;
    const dates = [-1, 0, 1, 2, 3, 4, 5, 6].map((o) => localDateIso(this._dateAt(o), this._tz));
    const programs = filterPrograms(this._data, this._config);
    const key = `${dates[0]}|${programs.map((p) => `${p.id}:${p.revision}:${activeProfile(p, this._data!).id}`).join(",")}`;
    if (key === this._previewKey || (key === this._failedPreviewKey && Date.now() < this._previewRetryAt)) return;
    this._previewKey = key;
    let failed = false;
    const previews: Record<string, Record<string, PreviewSlot[]>> = {};
    await Promise.all(dates.flatMap((date) => programs.map((p) =>
      fetchPreview(this.hass, p.id, p.revision, date, activeProfile(p, this._data!).id, false)
        .then((slots) => { (previews[date] ??= {})[p.id] = slots; })
        .catch(() => { failed = true; }))));
    // a newer edit started its own loading meanwhile: these previews are stale
    if (key === this._previewKey) {
      this._preview = previews;
      if (failed) {
        this._previewKey = "";
        this._failedPreviewKey = key;
        this._previewRetryAt = Date.now() + 5000;
      } else this._failedPreviewKey = "";
    }
  }

  /* ---- blocks ---- */

  private _spanCache = new Map<string, BarSpan[]>();
  private _spanInputs: unknown[] = [];

  /** Spans of a day (`offset` days from today) for a device, from every program that schedules it (memoized until an input is replaced). */
  private _spans(entityId: string, programs: Program[], offset = 0): BarSpan[] {
    const inputs = [this._data, this._preview, this._now, this._config];
    if (inputs.some((x, i) => x !== this._spanInputs[i])) {
      this._spanCache.clear();
      this._spanInputs = inputs;
    }
    const key = `${entityId}|${offset}|${programs.map((p) => p.id).join(",")}`;
    let spans = this._spanCache.get(key);
    if (!spans) this._spanCache.set(key, (spans = this._computeSpans(entityId, programs, offset)));
    return spans;
  }

  private _computeSpans(entityId: string, programs: Program[], offset: number): BarSpan[] {
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
          endSun: slot.end ? sunDir(slot.end) : null, startSpec: slot.start, endSpec: slot.end ?? null, marker: !slot.end, ...extra };
      };
      const date = localDateIso(at, this._tz);
      const previous = this._preview[addDaysIso(date, -1)]?.[program.id];
      const resolved = preview[program.id];
      const byId = new Map(profile.days.flat().map((slot) => [slot.id, slot]));
      const bounds = dayBounds(date, this._tz);
      for (const r of [...(previous ?? []), ...(resolved ?? [])]) {
        const slot = byId.get(r.slot_id);
        if (!slot || !of(slot)) continue;
        const startMs = Date.parse(r.start), endMs = r.end ? Date.parse(r.end) : null;
        if (startMs >= bounds.endMs || (endMs === null ? startMs < bounds.startMs : endMs <= bounds.startMs)) continue;
        const spill = startMs < bounds.startMs;
        const start = spill ? 0 : localMinutes(r.start, this._tz);
        const end = endMs === null ? null : endMs >= bounds.endMs ? DAY : localMinutes(r.end!, this._tz);
        spans.push(mk(slot, start, end === null ? Math.min(DAY, start + 10) : end, {
          spill, startSun: spill ? null : sunDir(slot.start), ignored: r.ignored ?? null,
          sun: "sun" in slot.start || Boolean(slot.end && "sun" in slot.end),
        }));
      }
      // Until a preview arrives, only exact fixed schedules have an honest fallback.
      if (!previous) for (const { slot, end } of spillover(profile.days[(today + 6) % 7])) {
        if (!slot.start.random_minutes && !slot.end?.random_minutes && of(slot)) spans.push(mk(slot, 0, end, { spill: true, startSun: null }));
      }
      if (!resolved) for (const slot of profile.days[today]) {
        if (!of(slot) || slot.start.random_minutes || slot.end?.random_minutes) continue;
        const start = nominal(slot.start), end = nominal(slot.end ?? null);
        if (start !== null) spans.push(mk(slot, start, end === null ? start + 10 : end > start ? end : DAY));
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

  private async _toggleProgram(program: Program): Promise<void> {
    if (this._toggling.has(program.id)) return;
    this._toggling = new Set(this._toggling).add(program.id);
    const enabled = !program.enabled;
    try {
      if (!enabled && !(await confirmAction(this, t(this._lang, "confirm_pause", { name: program.name }), t(this._lang, "yes"), t(this._lang, "no")))) return;
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: program.id, enabled });
    } catch (err) {
      this._error = String((err as { message?: string }).message ?? err);
    } finally {
      const pending = new Set(this._toggling);
      pending.delete(program.id);
      this._toggling = pending;
    }
  }

  private _programToggle(program: Program) {
    return html`<button class="hours" role="switch" aria-checked=${program.enabled}
      aria-label=${`${program.name}: ${t(this._lang, program.enabled ? "running" : "stopped")}`}
      ?disabled=${this._data?.read_only || this._toggling.has(program.id)}
      @click=${() => void this._toggleProgram(program)}>
      <ha-icon icon=${program.enabled ? "mdi:toggle-switch" : "mdi:toggle-switch-off-outline"}></ha-icon></button>`;
  }

  private _modeName(program: Program) {
    const mode = this._data ? activeProfile(program, this._data) : undefined;
    return mode && (program.profiles.length > 1 || program.mode_source) ? html`<span class="mode-name">${t(this._lang, "profile")}: ${mode.name}</span>` : nothing;
  }

  private _disabledBadge(disabled: boolean) {
    return disabled ? html`<span class="disabled-badge" role="status">${t(this._lang, "program_disabled")}</span>` : nothing;
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
    const icon = opts.icon ?? stateObj?.attributes.icon ?? "mdi:calendar-clock";
    const open = () => this._open(opts.open);
    return html`
      <div class="block">
        <div class="line">
          <ha-icon class="dev" icon=${icon}></ha-icon>
          <div class="info">
            ${opts.name ? html`<span class="name">${opts.name}</span>` : nothing}
            ${opts.button && programs.length === 1 ? this._modeName(programs[0]) : nothing}
            <span class="now">
              <span class="nw">${stateObj ? (this.hass.formatEntityState?.(stateObj) ?? stateObj.state) : "—"}</span>
              ${next ? html`<span class="next">→ ${nextLabel?.name ?? actionText(this.hass, lang, next.action)}
                <span class="when nw">${nb(formatWhen(next.at, this._tz, lang, this._now))}</span></span>` : nothing}
            </span>
          </div>
          ${opts.button ? html`<div class="header-actions"><div class="header-icons">
            ${programs.length === 1 ? this._programToggle(programs[0]) : nothing}
            <button class="hours" aria-label=${t(lang, "hours")} title=${t(lang, "hours")} @click=${open}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(paused)}</div>` : nothing}
        </div>
        ${(this._config.schedule_view === "radial" || this._config.schedule_view === "radial_12h") ? html`<wp-radial-day
          .spans=${this._spans(entityId, programs)} .now=${localMinutes(this._now, this._tz)} lang=${lang}
          .rest=${labelOf(data, programs[0].entities.find((e) => e.entity_id === entityId)?.default_label)?.name ?? t(lang, "rest_none")}
          .double=${this._config.schedule_view === "radial_12h"}
          @open-day=${open}></wp-radial-day>` : html`<div class="today">
          <span class="wname">${t(lang, "today_short")}</span>
          ${this._bar(entityId, programs[0], 0, "today", open)}
        </div>`}
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
          <h2>${p.name}${this._modeName(p)}</h2>
          <div class="header-actions"><div class="header-icons">${this._programToggle(p)}
            <button class="hours" aria-label=${t(lang, "hours")} title=${t(lang, "hours")} @click=${() => this._open(scope)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>
          </div>${this._disabledBadge(!p.enabled)}</div>
        </div>
        ${p.entities.map((e) => this._line(e.entity_id, [p], { name: friendlyName(this.hass, e.entity_id), button: null, open: scope }))}
      </section>`;
    });
  }

  private _compactList(programs: Program[]) {
    return programs.map((p) => {
      const scope: Scope = { kind: "program", programId: p.id };
      const next = p.entities.map((e) => ({ entity: e.entity_id, next: this._next(e.entity_id, [p]) }))
        .filter((item) => item.next).sort((a, b) => Date.parse(a.next!.at) - Date.parse(b.next!.at));
      const expanded = this._expandedProgram === p.id;
      return html`<section class="compact-program"><div class="compact-row">
        <ha-icon icon=${p.icon ?? "mdi:calendar-clock"}></ha-icon>
        <button class="summary" aria-expanded=${expanded} aria-controls=${`compact-${p.id}`}
          @click=${() => { this._expandedProgram = expanded ? null : p.id; this._edit = null; }}>
          <strong>${p.name}<ha-icon icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></strong>${this._modeName(p)}
          ${next.length ? html`<span>${labelOf(this._data!, next[0].next!.label)?.name ?? actionText(this.hass, this._lang, next[0].next!.action)} · ${nb(formatWhen(next[0].next!.at, this._tz, this._lang, this._now))}</span>` : html`${p.enabled ? html`<span>${t(this._lang, "hours")}</span>` : nothing}`}
        </button><div class="header-actions"><div class="header-icons">${this._programToggle(p)}
        ${expanded ? html`<button class="hours" aria-label=${t(this._lang, "hours")} title=${t(this._lang, "hours")}
          @click=${() => this._open(scope)}><ha-icon icon="mdi:calendar-edit"></ha-icon></button>` : nothing}</div>
          ${this._disabledBadge(!p.enabled)}</div></div>
        ${expanded ? html`<div id=${`compact-${p.id}`} class="compact-details" role="region" aria-label=${p.name}>
          ${p.entities.map((e) => html`
            ${p.entities.length > 1 ? html`<strong class="compact-device">${friendlyName(this.hass, e.entity_id)}</strong>` : nothing}
            <div class="today"><span class="wname">${t(this._lang, "today_short")}</span>
              ${this._bar(e.entity_id, p, 0, "today", () => this._open(scope))}</div>
            ${this._weekRows(`${scopeKey(scope)}|${e.entity_id}`, e.entity_id, [p], scope)}
          `)}
        </div>` : nothing}</section>`;
    });
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const lang = this._lang;
    const data = this._data;
    const programs = data ? filterPrograms(data, this._config) : [];
    const admin = Boolean(data) && Boolean(this.hass.user?.is_admin) && Boolean(data?.can_edit);
    const globalLabels = admin && this._config.program === undefined;
    const showTitle = this._config.title !== undefined && this._config.title !== "";
    return html`
      <ha-card>
        ${showTitle || globalLabels || data?.vacation
          ? html`<div class="head">
              <h1>${this._config.title ?? ""}</h1>
              ${data?.vacation ? html`<span class="chip"><ha-icon icon="mdi:pause-circle-outline"></ha-icon> ${t(lang, "vacation")}</span>` : nothing}
              ${globalLabels ? html`<button class="gear" aria-label=${t(lang, "labels")} @click=${() => (this._dialog = { kind: "labels" })}>
                <ha-icon icon="mdi:label-multiple-outline"></ha-icon></button>` : nothing}
            </div>`
          : nothing}
        ${this._error ? html`<div class="error">${t(lang, "error", { message: this._error })}</div>` : nothing}
        ${data?.read_only ? html`<div class="error">${t(lang, "read_only")}</div>` : nothing}
        ${!data ? html`<div class="empty">…</div>` : nothing}
        ${data && !programs.length ? html`<div class="empty" role="status">${t(lang, data.programs.length && this._config.program === undefined ? "no_matching_program" : "no_program")}</div>` : nothing}
        ${data ? this._config.schedule_view === "list" ? this._compactList(programs) : this._bySchedule(programs) : nothing}
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
          .chart=${this._config.show_chart !== false} @closed=${close}></wp-schedule>`);
      case "labels":
        return html`<wp-labels .hass=${this.hass} .data=${this._data} @closed=${close}></wp-labels>`;
    }
  }

  static styles = css`
    .compact-program { border-top: 1px solid var(--divider-color); }
    .compact-program:first-of-type { border-top: 0; }
    .compact-row { display: flex; align-items: center; gap: 8px; min-height: 72px; }
    .summary strong { display: flex; align-items: center; gap: 4px; overflow-wrap: anywhere; }
    .summary ha-icon { --mdc-icon-size: 18px; flex: none; }
    .compact-details { padding-bottom: 8px; }
    .compact-device { display: block; margin-top: 12px; }
    .summary { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; justify-content: center; gap: 4px; text-align: left; background: none; border: 0; color: inherit; font: inherit; cursor: pointer; }
    .summary span { font-size: 14px; color: var(--secondary-text-color); overflow-wrap: anywhere; }
    button:disabled { opacity: .5; cursor: default; }
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
    .mode-name { display: block; flex-basis: 100%; font-size: 13px; font-weight: 400; color: var(--secondary-text-color); line-height: 20px; }
    .name { font-size: 17px; font-weight: 600; }
    .now { font-size: 15px; display: flex; flex-wrap: wrap; column-gap: 6px; color: var(--primary-text-color); }
    .nw { white-space: nowrap; }
    .next { min-width: 0; overflow-wrap: anywhere; }
    .when { opacity: 0.8; }
    .header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
    .header-icons { display: flex; align-items: center; }
    .disabled-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; background: #b3261e; color: #fff; font-size: 13px; font-weight: 600; line-height: 20px; }
    .line .header-actions { margin-top: -12px; }
    .name, .now { line-height: 24px; }
    button.hours {
      flex: none; width: 48px; height: 48px; padding: 0; border-radius: 24px; border: none;
      background: none; color: var(--primary-text-color); cursor: pointer; --mdc-icon-size: 24px;
      display: inline-flex; align-items: center; justify-content: center;
    }
    button.hours:hover { background: var(--secondary-background-color); }
    wp-bar-editor { margin-top: 2px; }
    .weekbtn {
      display: inline-flex; align-items: center; gap: 4px; min-height: 48px; padding: 0 8px 0 0; border: none;
      background: none; color: var(--primary-color); font: inherit; font-size: 14px; cursor: pointer; --mdc-icon-size: 20px;
    }
    .week { display: flex; flex-direction: column; gap: 0; padding-bottom: 4px; }
    .wday { display: flex; align-items: flex-start; gap: 8px; min-height: 48px; width: 100%; }
    .wnamebtn {
      flex: none; width: 44px; margin-right: -8px; height: 48px; padding: 0; border: none; border-radius: 8px; background: none; color: inherit;
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
  `;
}
