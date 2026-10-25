// The card: a clear read view of programs (spec § 10.2); editing happens in dialogs.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./components/day-bar";
import "./components/dialog";
import "./components/day-view";
import "./editors/program-editor";
import "./editors/override-dialog";
import "./editors/modes-editor";
import { describeSetpoint } from "./editors/setpoint-editor";
import type { BarSpan } from "./components/day-bar";
import { t, strings } from "./i18n";
import {
  activeProfile, filterPrograms, slotColor, slotLabel, slotMode, subscribePlanner,
} from "./planner";
import { formatWhen, localDateIso, localMinutes, localWeekday, nominal, spillover, DAY } from "./time";
import type { CardConfig, HomeAssistant, PlannerData, PreviewSlot, Program } from "./types";

type Dialog =
  | { kind: "day"; program: Program; day: number }
  | { kind: "program"; program?: Program }
  | { kind: "override"; program: Program }
  | { kind: "modes" }
  | null;

@customElement("weekly-planner-card")
export class WeeklyPlannerCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @state() private _config!: CardConfig;
  @state() private _data?: PlannerData;
  @state() private _error?: string;
  @state() private _dialog: Dialog = null;
  @state() private _showWeek = false;
  @state() private _preview: Record<string, PreviewSlot[]> = {};
  @state() private _now = new Date();
  private _unsub?: () => void;
  private _clock?: number;

  static getConfigElement() {
    return document.createElement("weekly-planner-card-editor");
  }

  static getStubConfig() {
    return { filter: { types: ["climate"] } };
  }

  setConfig(config: CardConfig): void {
    this._config = { show_week: false, show_chart: true, ...config };
    this._showWeek = Boolean(this._config.show_week);
  }

  getCardSize(): number {
    return 3 + (this._data?.programs.length ?? 1) * 2;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._clock = window.setInterval(() => (this._now = new Date()), 60_000);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._unsub?.();
    this._unsub = undefined;
    window.clearInterval(this._clock);
  }

  updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && !this._unsub) {
      this._unsub = subscribePlanner(this.hass, (data) => {
        this._data = data;
        this._error = undefined;
        this._loadPreviews();
      });
    }
  }

  private get _lang(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? "en";
  }

  private get _tz(): string {
    return this.hass.config.time_zone;
  }

  /** Resolved slots (sun times, ignored slots) for the next occurrence of each weekday. */
  private async _loadPreviews(): Promise<void> {
    if (!this._data) return;
    const previews: Record<string, PreviewSlot[]> = {};
    const base = new Date();
    const jobs: Promise<void>[] = [];
    for (const p of filterPrograms(this._data, this._config)) {
      for (let offset = 0; offset < 7; offset++) {
        const when = new Date(base.getTime() + offset * 86_400_000);
        const date = localDateIso(when, this._tz);
        const weekday = localWeekday(when, this._tz);
        jobs.push(
          this.hass
            .callWS<{ slots: PreviewSlot[] }>({ type: "weekly_planner/preview", program_id: p.id, date })
            .then((res) => { previews[`${p.id}|${weekday}`] = res.slots; })
            .catch(() => undefined),
        );
      }
    }
    await Promise.all(jobs);
    this._preview = previews;
  }

  /** Spans of a program for a weekday (0 = Monday); today uses resolved sun times. */
  private _spans(program: Program, day: number, today: boolean): BarSpan[] {
    const data = this._data!;
    const profile = activeProfile(program, data);
    const label = (s: any) => slotLabel(s, program, data.modes, this._lang);
    const spans: BarSpan[] = [];
    for (const { slot, end } of spillover(profile.days[(day + 6) % 7])) {
      spans.push({ start: 0, end, color: slotColor(slot, program, data.modes), label: label(slot) });
    }
    const resolved = this._preview[`${program.id}|${day}`];
    for (const slot of profile.days[day]) {
      const r = resolved?.find((x) => x.slot_id === slot.id);
      let start = nominal(slot.start);
      let end = nominal(slot.end ?? null);
      if (r) {
        start = localMinutes(r.start, this._tz);
        end = r.end ? localMinutes(r.end, this._tz) : null;
      }
      if (start === null) continue; // sun slot on another day: shown when resolved
      const stop = end === null ? start + 10 : end > start ? end : DAY;
      spans.push({
        start, end: stop, color: slotColor(slot, program, data.modes), label: label(slot),
        sun: "sun" in slot.start || Boolean(slot.end && "sun" in slot.end), ignored: r?.ignored ?? null,
      });
    }
    return spans;
  }

  private _summary(program: Program) {
    const data = this._data!;
    const status = data.status[program.id];
    const profile = activeProfile(program, data);
    const slotId = status ? Object.values(status.current_slots)[0] : undefined;
    const slot = slotId ? profile.days.flat().find((s) => s.id === slotId) : undefined;
    const mode = slot ? slotMode(slot, program, data.modes) : undefined;
    const overridden = program.entities.filter((e) => data.entities[e.entity_id]?.override);
    return { status, slot, mode, overridden };
  }

  private async _toggle(program: Program, enabled: boolean): Promise<void> {
    try {
      await this.hass.callWS({ type: "weekly_planner/program/set_enabled", program_id: program.id, enabled });
    } catch (err: any) {
      this._error = err?.message ?? String(err);
    }
  }

  private async _resume(program: Program): Promise<void> {
    await this.hass.callService("weekly_planner", "resume", { program_id: program.id });
  }

  render() {
    if (!this._config || !this.hass) return nothing;
    const lang = this._lang;
    const s = strings(lang);
    const data = this._data;
    const programs = data ? filterPrograms(data, this._config) : [];
    const today = localWeekday(this._now, this._tz);
    const nowMin = localMinutes(this._now, this._tz);

    return html`
      <ha-card>
        <div class="head">
          <h1>${this._config.title ?? s.title}</h1>
          ${data?.vacation ? html`<span class="chip warn">🧳 ${s.vacation}</span>` : nothing}
          ${data?.can_edit && !this._config.program
            ? html`<button class="ghost" @click=${() => (this._dialog = { kind: "modes" })}>${s.modes}</button>
                <button class="ghost" @click=${() => (this._dialog = { kind: "program" })}>＋ ${s.new_program}</button>`
            : nothing}
        </div>
        ${this._error ? html`<div class="error">${t(lang, "error", { message: this._error })}</div>` : nothing}
        ${data?.read_only ? html`<div class="error">${s.read_only}</div>` : nothing}
        ${!data ? html`<div class="empty">…</div>` : nothing}
        ${data && !programs.length ? html`<div class="empty">${s.no_program}</div>` : nothing}
        ${programs.map((program) => this._renderProgram(program, today, nowMin))}
        ${programs.length && !this._config.program
          ? html`<button class="link" @click=${() => (this._showWeek = !this._showWeek)}>
              ${this._showWeek ? s.hide_week : s.show_week}</button>`
          : nothing}
      </ha-card>
      ${this._renderDialog()}
    `;
  }

  private _renderProgram(program: Program, today: number, nowMin: number) {
    const lang = this._lang;
    const s = strings(lang);
    const data = this._data!;
    const { status, slot, mode, overridden } = this._summary(program);
    const next = status?.next_change ? formatWhen(status.next_change, this._tz, lang, this._now) : null;
    const fallback = this._defaultMode(program);
    const showWeek = this._showWeek || Boolean(this._config.program);
    const profile = activeProfile(program, data);
    return html`
      <section class="program ${program.enabled ? "" : "off"}">
        <div class="row">
          <div class="name">
            <span class="title">${program.name}</span>
            ${program.profiles.length > 1 ? html`<span class="chip">${profile.name}</span>` : nothing}
          </div>
          <label class="switch" title=${program.enabled ? "On" : "Off"}>
            <input type="checkbox" .checked=${program.enabled}
              @change=${(e: Event) => this._toggle(program, (e.target as HTMLInputElement).checked)} />
            <span></span>
          </label>
        </div>
        <div class="state">
          ${this._effective(program)
            ? html`<span class="pill override">${this._effective(program)}</span>`
            : mode
            ? html`<span class="pill" style="--c:${mode.color}">${mode.name}</span>`
            : slot
              ? html`<span class="pill" style="--c:${slotColor(slot, program, data.modes)}">${slotLabel(slot, program, data.modes, lang)}</span>`
              : fallback && program.enabled && !data.vacation
              ? html`<span class="pill" style="--c:${fallback.color}">${fallback.name}</span>`
              : html`<span class="pill neutral">${program.enabled ? s.off_slot : "—"}</span>`}
          <span class="muted">${next ? t(lang, "until", { time: next }) : s.no_change}</span>
          ${status?.skip_next ? html`<span class="chip">${s.skip_planned}</span>` : nothing}
        </div>
        ${overridden.length
          ? html`<div class="warn-row">⚠️ ${overridden.length > 1 ? `${overridden.length} × ` : ""}${this._overrideText(overridden[0].entity_id)}
              <button class="small" @click=${() => this._resume(program)}>${s.resume}</button></div>`
          : nothing}
        ${(data.warnings?.[program.id] ?? []).length && data.can_edit
          ? html`<details class="warnings"><summary>⚠️ ${(data.warnings?.[program.id] ?? []).length}</summary>
              ${(data.warnings?.[program.id] ?? []).map((w) => html`<div>${this._warning(w)}</div>`)}</details>`
          : nothing}
        <wp-day-bar .spans=${this._spans(program, today, true)} .now=${nowMin} show-hours
          @click=${() => (this._dialog = { kind: "day", program, day: today })}></wp-day-bar>
        ${showWeek
          ? html`<div class="week">${[0, 1, 2, 3, 4, 5, 6].map(
              (d) => html`<button class="day" @click=${() => (this._dialog = { kind: "day", program, day: d })}>
                <span class=${d === today ? "today" : ""}>${s.days_short[d]}</span>
                <wp-day-bar thin .spans=${this._spans(program, d, d === today)}
                  .now=${d === today ? nowMin : null}></wp-day-bar></button>`,
            )}</div>`
          : nothing}
        <div class="actions">
          <button class="small" @click=${() => (this._dialog = { kind: "override", program })}>${s.override}</button>
          ${data.can_edit
            ? html`<button class="small ghost" @click=${() => (this._dialog = { kind: "program", program })}>✏️ ${s.edit}</button>`
            : nothing}
        </div>
      </section>
    `;
  }

  private _warning(w: { entity_id: string; code: string; detail: string }): string {
    const name = this.hass.states[w.entity_id]?.attributes.friendly_name ?? w.entity_id;
    const key = `warn_${w.code}` as any;
    const text = (strings(this._lang) as any)[key] as string | undefined;
    return text ? t(this._lang, key, { entity: name, detail: w.detail }) : `${name}: ${w.code}`;
  }

  /** Setpoint of a voluntary override on the program's first entity, shown instead of the plan. */
  private _effective(program: Program): string | undefined {
    const first = program.entities[0]?.entity_id;
    const o = first ? this._data!.entities[first]?.override : undefined;
    return o?.origin === "voluntary" && o.setpoint ? describeSetpoint(this._lang, o.setpoint) : undefined;
  }

  /** Mode applied outside slots (default of the first entity), to show instead of "outside slots". */
  private _defaultMode(program: Program) {
    const def = program.entities[0]?.default;
    if (def?.kind !== "mode" || typeof def.value !== "string") return undefined;
    return this._data!.modes.find((m) => m.id === def.value);
  }

  private _overrideText(entityId: string): string {
    const o = this._data!.entities[entityId]?.override;
    if (o?.origin === "voluntary" && o.until) {
      return t(this._lang, "overridden_until", { time: formatWhen(o.until, this._tz, this._lang, this._now) });
    }
    return t(this._lang, "overridden");
  }

  private _renderDialog() {
    const d = this._dialog;
    if (!d || !this._data) return nothing;
    const close = () => (this._dialog = null);
    switch (d.kind) {
      case "day":
        return html`<wp-day-view .hass=${this.hass} .data=${this._data} .program=${d.program} .day=${d.day}
          .showChart=${this._config.show_chart !== false}
          @closed=${close}
          @edit-day=${(e: CustomEvent) => (this._dialog = { kind: "program", program: d.program, ...e.detail })}></wp-day-view>`;
      case "program":
        return html`<wp-program-editor .hass=${this.hass} .data=${this._data} .program=${d.program}
          .defaultTypes=${this._config.filter?.types ?? []} @closed=${close}></wp-program-editor>`;
      case "override":
        return html`<wp-override-dialog .hass=${this.hass} .data=${this._data} .program=${d.program}
          @closed=${close}></wp-override-dialog>`;
      case "modes":
        return html`<wp-modes-editor .hass=${this.hass} .data=${this._data} @closed=${close}></wp-modes-editor>`;
    }
  }

  static styles = css`
    ha-card { padding: 16px; }
    .head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
    h1 { flex: 1; margin: 0; font-size: 20px; font-weight: 500; }
    .program { padding: 12px 0; border-top: 1px solid var(--divider-color); }
    .program:first-of-type { border-top: none; }
    .program.off { opacity: 0.55; }
    .row { display: flex; align-items: center; gap: 8px; }
    .name { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
    .title { font-size: 16px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .state { display: flex; align-items: center; gap: 8px; margin: 6px 0 10px; flex-wrap: wrap; }
    .pill {
      background: var(--c); color: #fff; border-radius: 12px; padding: 2px 10px; font-size: 13px;
      font-weight: 600; text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    }
    .pill.override {
      background: repeating-linear-gradient(135deg, var(--warning-color, #ff9800) 0 6px, #e68900 6px 12px);
    }
    .pill.neutral { background: var(--secondary-background-color); color: var(--primary-text-color); text-shadow: none; }
    .muted { color: var(--secondary-text-color); font-size: 13px; }
    .chip {
      font-size: 12px; padding: 1px 8px; border-radius: 10px; background: var(--secondary-background-color);
    }
    .chip.warn { background: var(--warning-color, #ff9800); color: #fff; }
    .warnings { font-size: 12px; color: var(--secondary-text-color); margin-bottom: 8px; }
    .warnings summary { cursor: pointer; }
    .warn-row { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 8px; }
    wp-day-bar { cursor: pointer; }
    .week { display: grid; gap: 4px; margin-top: 8px; }
    .day {
      display: grid; grid-template-columns: 36px 1fr; align-items: center; gap: 8px;
      background: none; border: none; padding: 2px 0; cursor: pointer; color: inherit; font: inherit;
    }
    .day span { font-size: 12px; color: var(--secondary-text-color); text-align: left; }
    .day span.today { color: var(--primary-color); font-weight: 600; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
    button.small, button.ghost {
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color);
      border-radius: 16px; padding: 4px 12px; font: inherit; font-size: 13px; cursor: pointer; min-height: 32px;
    }
    button.ghost { border-color: transparent; color: var(--primary-color); }
    button.link {
      border: none; background: none; color: var(--primary-color); cursor: pointer; padding: 8px 0 0; font: inherit;
    }
    .empty { color: var(--secondary-text-color); padding: 16px 0; text-align: center; }
    .error { color: var(--error-color, #db4437); font-size: 13px; margin-bottom: 8px; }
    .switch { position: relative; width: 40px; height: 22px; flex: none; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .switch span {
      position: absolute; inset: 0; border-radius: 11px; background: var(--disabled-color, #bdbdbd);
      transition: background 0.2s; cursor: pointer;
    }
    .switch span::before {
      content: ""; position: absolute; width: 18px; height: 18px; left: 2px; top: 2px; border-radius: 50%;
      background: #fff; transition: transform 0.2s;
    }
    .switch input:checked + span { background: var(--primary-color); }
    .switch input:checked + span::before { transform: translateX(18px); }
    .switch input:focus-visible + span { outline: 2px solid var(--primary-color); outline-offset: 2px; }
  `;
}

