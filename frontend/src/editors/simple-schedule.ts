// "Change the schedule" in simple mode (spec § 10.7): one day at a time, one sentence per
// slot of the active season ("From 07:00 to 09:00: Comfort"), native time inputs, 15 minute
// buttons, add / remove a slot, copy the day, save the whole program.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/dialog";
import { confirmAction } from "../components/confirm";
import { SwipeTracker } from "../components/gestures";
import { strings, t } from "../i18n";
import { activeProfile, describeSp, mainType, modeEffect, newId } from "../planner";
import { DAY, clockToMinutes, fmtClock, localWeekday, minutesToClock, nominal } from "../time";
import type { HomeAssistant, PlannerData, Profile, Program, Slot, TimeSpec } from "../types";
import { findOverlap, sortSlots, specMinutes } from "./day-editor";
import { editorStyles, langOf } from "./setpoint-editor";
import type { K } from "./setpoint-editor";

type Sun = "dawn" | "sunrise" | "sunset" | "dusk";
const MOVE = 15; // minutes
const clock = (m: number): string => (m >= DAY ? "24:00" : minutesToClock(m));

@customElement("wp-simple-schedule")
export class WpSimpleSchedule extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;

  @state() private _p?: Program;
  @state() private _day = 0;
  @state() private _error = "";
  @state() private _conflict = false;
  @state() private _saving = false;
  @state() private _saved = false;
  private _closeTimer?: number;
  private _swipe = new SwipeTracker(60);

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this._closeTimer);
  }

  willUpdate(): void {
    if (this._p || !this.hass || !this.data || !this.program) return;
    this._p = structuredClone(this.program);
    this._day = Math.max(0, localWeekday(new Date(), this.hass.config.time_zone));
  }

  /* ---- data ---- */

  private get _profile(): Profile {
    return activeProfile(this._p!, this.data);
  }

  private get _slots(): Slot[] {
    return this._profile.days[this._day] ?? [];
  }

  private _setDay(day: number, slots: Slot[]): void {
    const p = this._p!;
    const id = this._profile.id;
    const sorted = sortSlots(this.hass, slots);
    this._p = {
      ...p,
      profiles: p.profiles.map((x) => (x.id === id ? { ...x, days: x.days.map((d, i) => (i === day ? sorted : d)) } : x)),
    };
    this._error = "";
  }

  private _patchSlot(id: string, patch: Partial<Slot>): void {
    this._setDay(this._day, this._slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  private _go(day: number): void {
    this._day = ((day % 7) + 7) % 7;
    this._error = "";
  }

  private get _modes() {
    return this.data.modes.filter((m) => m.type === mainType(this._p!));
  }

  /* ---- time editing ---- */

  private _setTime(slot: Slot, which: "start" | "end", minutes: number): void {
    let m = Math.max(0, Math.min(DAY, Math.round(minutes / 5) * 5));
    if (which === "start") m = Math.min(m, DAY - 5);
    else if (m === 0) m = DAY; // "00:00" as an end means "until midnight"
    this._patchSlot(slot.id, { [which]: { time: clock(m) } } as Partial<Slot>);
  }

  private _fromInput(slot: Slot, which: "start" | "end", ev: Event): void {
    const value = (ev.target as HTMLInputElement).value;
    if (!/^\d{2}:\d{2}$/.test(value)) return;
    this._setTime(slot, which, clockToMinutes(value));
  }

  private _shift(slot: Slot, which: "start" | "end", delta: number): void {
    const spec = slot[which];
    const m = spec ? nominal(spec) : null;
    if (m === null) return;
    const next = which === "end" ? Math.max(MOVE, Math.min(DAY, m + delta)) : Math.max(0, Math.min(DAY - MOVE, m + delta));
    this._setTime(slot, which, next);
  }

  /* ---- slots ---- */

  private _mode(slot: Slot): string {
    return slot.actions.by_type[mainType(this._p!)] ?? "";
  }

  private _setMode(slot: Slot, modeId: string): void {
    const type = mainType(this._p!);
    this._patchSlot(slot.id, { actions: { ...slot.actions, by_type: { ...slot.actions.by_type, [type]: modeId } } });
  }

  private _add(): void {
    const slots = this._slots;
    let start = 8 * 60;
    if (slots.length) {
      start = Math.max(...slots.map((s) => {
        const a = specMinutes(this.hass, s.start);
        const b = s.end ? specMinutes(this.hass, s.end) : a;
        return b > a ? b : DAY; // a slot crossing midnight occupies the rest of its day
      }));
    }
    start = Math.min(start, DAY - 60);
    const modes = this._modes;
    const comfort = modes.find((m) => /confort|comfort/i.test(`${m.id} ${m.name}`)) ?? modes[0];
    const slot: Slot = {
      id: newId(), start: { time: clock(start) }, end: { time: clock(Math.min(DAY, start + 60)) }, conditions: [],
      actions: { by_type: comfort ? { [mainType(this._p!)]: comfort.id } : {}, by_entity: {} },
    };
    this._setDay(this._day, [...slots, slot]);
  }

  private async _remove(slot: Slot): Promise<void> {
    const sun = !("time" in slot.start) || Boolean(slot.end && !("time" in slot.end));
    const text = sun ? this._tr("ss_confirm_remove_sun") : this._tr("ss_confirm_remove", { time: this._sentenceTime(slot) });
    if (await confirmAction(this, text, this._tr("ss_remove"))) {
      this._setDay(this._day, this._slots.filter((s) => s.id !== slot.id));
    }
  }

  private async _copy(kind: "weekdays" | "weekend" | "all"): Promise<void> {
    const targets = (kind === "weekdays" ? [0, 1, 2, 3, 4] : kind === "weekend" ? [5, 6] : [0, 1, 2, 3, 4, 5, 6])
      .filter((d) => d !== this._day);
    if (!targets.length) return;
    const names = strings(this._lang).days.map((n) => (this._lang.startsWith("fr") ? n.toLowerCase() : n));
    const question = targets.length === 6
      ? this._tr("ss_copy_confirm_all", { n: String(targets.length) })
      : this._tr("ss_copy_confirm", { days: targets.map((d) => names[d]).join(", ") });
    if (!(await confirmAction(this, question, this._tr("ss_copy_do")))) return;
    const source = this._slots;
    const id = this._profile.id;
    const clones = () => source.map((s) => ({ ...structuredClone(s), id: newId() }));
    const p = this._p!;
    this._p = {
      ...p,
      profiles: p.profiles.map((x) => (x.id === id ? { ...x, days: x.days.map((d, i) => (targets.includes(i) ? clones() : d)) } : x)),
    };
    this._error = "";
  }

  /* ---- save ---- */

  private _validate(): string {
    const profile = this._profile;
    const days = strings(this._lang).days;
    for (let d = 0; d < 7; d++) {
      const slots = profile.days[d] ?? [];
      for (const s of slots) {
        if (!Object.keys(s.actions.by_type).length && !Object.keys(s.actions.by_entity).length) {
          return this._modes.length ? this._tr("ss_err_no_mode", { day: days[d] }) : this._tr("ss_err_none_modes");
        }
        if (s.end && JSON.stringify(s.start) === JSON.stringify(s.end)) return this._tr("ss_err_same", { day: days[d] });
      }
      if (findOverlap(slots)) return this._tr("ss_err_overlap", { day: days[d] });
    }
    return "";
  }

  private async _save(): Promise<void> {
    const problem = this._validate();
    if (problem) {
      this._error = problem;
      return;
    }
    this._saving = true;
    try {
      await this.hass.callWS({ type: "weekly_planner/program/save", program: structuredClone(this._p) });
      this._saved = true;
      this._closeTimer = window.setTimeout(() => this._closeDialog(), 1500);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      this._conflict = e?.code === "conflict";
      if (this._conflict) this._error = this._tr("ss_conflict");
      else if (e?.code === "unauthorized") this._error = this._tr("err_unauthorized");
      else if (e?.message?.includes("overlapping_slots")) this._error = this._tr("err_overlap_server");
      else this._error = this._tr("ss_err_save");
    } finally {
      this._saving = false;
    }
  }

  private _closeDialog(): void {
    this.renderRoot.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  private _reload(): void {
    this._p = structuredClone(this.program);
    this._conflict = false;
    this._error = "";
  }

  /* ---- render ---- */

  private _sunText(side: "from" | "to", ev: Sun): string {
    return this._tr(`ss_${side}_${ev}` as K);
  }

  /** "8 h 30 à 22 h" (fixed times only; sun-based times use their own words). */
  private _sentenceTime(slot: Slot): string {
    const side = (spec: TimeSpec | null | undefined, kind: "from" | "to"): string =>
      !spec ? "" : "time" in spec ? fmtClock(this._lang, clockToMinutes(spec.time)) : this._sunText(kind, spec.sun);
    return slot.end ? `${side(slot.start, "from")} ${this._tr("ss_to")} ${side(slot.end, "to")}` : side(slot.start, "from");
  }

  private _timeInput(slot: Slot, which: "start" | "end", word: string) {
    const spec = slot[which];
    if (!spec) return nothing;
    const m = nominal(spec) ?? 0;
    const shown = m >= DAY ? "00:00" : "time" in spec ? spec.time : "";
    return html`<span class="w">${word}</span>
      <input type="time" step="900" .value=${shown} aria-label=${word} @change=${(e: Event) => this._fromInput(slot, which, e)} />`;
  }

  private _steps(slot: Slot, which: "start" | "end", label: string) {
    if (!slot[which]) return nothing;
    const aria = (k: K) => this._tr(k, { when: label });
    return html`<div class="steps"><span class="lbl">${label}</span>
      <button class="btn step" aria-label=${aria("ss_earlier_aria")} @click=${() => this._shift(slot, which, -MOVE)}>
        <ha-icon icon="mdi:minus"></ha-icon><span>${this._tr("ss_earlier")}</span></button>
      <button class="btn step" aria-label=${aria("ss_later_aria")} @click=${() => this._shift(slot, which, MOVE)}>
        <ha-icon icon="mdi:plus"></ha-icon><span>${this._tr("ss_later")}</span></button></div>`;
  }

  /** Entity the period's mode is read on (first entity of the main type). */
  private get _firstEntity(): string {
    const type = mainType(this._p!);
    const ids = this._p!.entities.map((e) => e.entity_id);
    return ids.find((id) => id.split(".")[0] === type) ?? ids[0] ?? "";
  }

  private _modeControl(slot: Slot) {
    const modes = this._modes;
    const current = this._mode(slot);
    const eid = this._firstEntity;
    const custom = !current && Object.keys(slot.actions.by_entity).length > 0;
    if (custom) {
      const [id, sp] = Object.entries(slot.actions.by_entity)[0];
      const more = Object.keys(slot.actions.by_entity).length - 1;
      return html`<strong class="custom">${describeSp(this._lang, this.data.modes, id, sp)}${more > 0 ? ` +${more}` : ""}</strong>`;
    }
    return html`
      <select aria-label=${this._tr("slot_action")} @change=${(e: Event) => this._setMode(slot, (e.target as HTMLSelectElement).value)}>
        ${current ? nothing : html`<option value="" selected>${this._tr("ss_pick_mode")}</option>`}
        ${modes.map((m) => {
          const effect = eid ? modeEffect(this.hass, this._lang, m, eid) : "";
          return html`<option value=${m.id} ?selected=${m.id === current}>${effect ? `${m.name} (${effect})` : m.name}</option>`;
        })}
      </select>`;
  }

  private _renderSlot(slot: Slot) {
    const fixedStart = "time" in slot.start;
    const fixedEnd = !slot.end || "time" in slot.end;
    const sun = !fixedStart || !fixedEnd;
    const s = nominal(slot.start);
    const e = nominal(slot.end ?? null);
    const next = s !== null && e !== null && e <= s && e < DAY;
    return html`
      <div class="slot card">
        ${sun
          ? html`<div class="sentence">
              <strong>${this._sentenceTime(slot)}</strong>
              <p class="hint"><ha-icon icon="mdi:weather-sunny"></ha-icon> ${this._tr("ss_sun_note")}</p>
              <div class="sent"><span class="w">:</span><div class="grow">${this._modeControl(slot)}</div></div>
            </div>`
          : html`
            <div class="sent">
              ${slot.end
                ? html`${this._timeInput(slot, "start", this._tr("ss_from"))}
                  <span class="grp">${this._timeInput(slot, "end", this._tr("ss_to"))}<span class="w">:</span></span>`
                : html`<span class="grp">${this._timeInput(slot, "start", this._tr("ss_at"))}<span class="w">:</span></span>`}
              <div class="mode">${this._modeControl(slot)}</div>
            </div>
            ${next ? html`<p class="hint"><ha-icon icon="mdi:weather-night"></ha-icon> ${this._tr("ss_next_day")}</p>` : nothing}
            ${e === DAY ? html`<p class="hint">${this._tr("ss_midnight")}</p>` : nothing}
            ${this._steps(slot, "start", this._tr("ss_start_lbl"))}
            ${this._steps(slot, "end", this._tr("ss_end_lbl"))}`}
        <div class="actions">
          <button class="btn danger" ?disabled=${!this._canEdit} @click=${() => void this._remove(slot)}>
            <ha-icon icon="mdi:delete"></ha-icon> ${this._tr("ss_remove")}</button>
        </div>
      </div>`;
  }

  private get _canEdit(): boolean {
    return this.data.can_edit && !this.data.read_only;
  }

  render() {
    if (!this._p) return nothing;
    const s = strings(this._lang);
    const today = localWeekday(new Date(), this.hass.config.time_zone);
    const slots = this._slots;
    const editable = this._canEdit;
    return html`
      <wp-dialog open wide heading=${this._tr("ss_title")}>
        ${!editable ? html`<p class="error" role="alert">${this._tr("read_only")}</p>` : nothing}
        <div class="days" role="group" aria-label=${this._tr("ss_day_pick")}>
          ${s.days_short.map((name, d) => html`
            <button class="day ${d === this._day ? "on" : ""} ${d === today ? "today" : ""}" aria-pressed=${d === this._day}
              aria-label=${s.days[d] + (d === today ? ` (${s.today})` : "")} @click=${() => this._go(d)}>${name}</button>`)}
        </div>
        <div class="body" @pointerdown=${(e: PointerEvent) => this._swipe.down(e)}
          @pointerup=${(e: PointerEvent) => { const dir = this._swipe.up(e); if (dir) this._go(this._day + dir); }}
          @pointercancel=${() => this._swipe.cancel()}>
          <h3>${s.days[this._day]}${this._day === today ? html` <span class="badge">${s.today}</span>` : nothing}</h3>
          ${this._p.profiles.length > 1 ? html`<p class="muted small">${this._tr("ss_season", { name: this._profile.name })}</p>` : nothing}
          ${slots.length === 0 ? html`<p class="muted">${this._tr("ss_empty")}</p>` : nothing}
          ${slots.map((slot) => this._renderSlot(slot))}
          <button class="btn" ?disabled=${!editable} @click=${() => this._add()}>
            <ha-icon icon="mdi:plus"></ha-icon> ${this._tr("ss_add")}</button>
          <h4>${this._tr("ss_copy_title")}</h4>
          <div class="row">
            <button class="btn" ?disabled=${!editable} @click=${() => void this._copy("weekdays")}>${this._tr("ss_copy_weekdays")}</button>
            <button class="btn" ?disabled=${!editable} @click=${() => void this._copy("weekend")}>${this._tr("ss_copy_weekend")}</button>
            <button class="btn" ?disabled=${!editable} @click=${() => void this._copy("all")}>${this._tr("ss_copy_all")}</button>
          </div>
        </div>
        ${this._error ? html`<p class="error" role="alert">${this._error}
          ${this._conflict ? html`<button class="btn" @click=${() => this._reload()}>${this._tr("ss_reload")}</button>` : nothing}</p>` : nothing}
        ${this._saved ? html`<p class="saved" role="status"><ha-icon icon="mdi:check-circle"></ha-icon> ${this._tr("ss_saved")}</p>` : nothing}
        <button slot="footer" class="btn" @click=${() => this._closeDialog()}>${s.cancel}</button>
        <button slot="footer" class="btn primary save" ?disabled=${!editable || this._saving || this._saved} @click=${() => void this._save()}>${s.save}</button>
      </wp-dialog>`;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: contents; }
      .days { display: grid; grid-template-columns: repeat(7, minmax(48px, 1fr)); gap: 6px; margin-bottom: 8px; }
      .day {
        min-width: 48px; min-height: 48px; padding: 0; border-radius: 12px; border: 1px solid var(--secondary-text-color);
        background: none; color: var(--primary-text-color); cursor: pointer; font-size: 14px;
      }
      .day.today { font-weight: 700; text-decoration: underline; }
      .day.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); }
      @media (max-width: 480px) { .days { grid-template-columns: repeat(4, 1fr); } }
      .body { touch-action: pan-y; min-height: 40vh; }
      h3 { margin: 8px 0 0; font-size: 20px; font-weight: 600; }
      h4 { margin: 20px 0 8px; font-size: 15px; font-weight: 500; }
      .small { font-size: 14px; margin: 2px 0 8px; }
      .badge {
        background: var(--primary-color); color: var(--text-primary-color, #fff); border-radius: 12px;
        padding: 2px 10px; font-size: 13px; font-weight: 600; vertical-align: middle;
      }
      .slot { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
      .sent { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
      .grp { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
      .sent .w { font-size: 16px; }
      .sent input[type="time"] { flex: 0 0 104px; width: 104px; min-height: 48px; font-size: 20px; font-weight: 600; text-align: center; padding: 4px; }
      .sent .mode { flex: 1 1 150px; min-width: 0; }
      .sent select { font-size: 16px; }
      .custom { font-size: 18px; }
      .steps { display: flex; align-items: center; gap: 8px; }
      .steps .lbl { flex: 0 0 44px; font-size: 14px; opacity: 0.8; }
      .btn.step { flex: 1; min-width: 0; padding: 0 8px; font-size: 14px; gap: 2px; --mdc-icon-size: 16px; white-space: nowrap; }
      .btn.step span { white-space: nowrap; }
      .btn { border-color: var(--secondary-text-color); }
      .btn.primary { border-color: var(--primary-color); }
      .btn.danger { border-color: var(--error-color, #db4437); }
      .muted, .hint { color: var(--primary-text-color); opacity: 0.8; }
      .sentence { font-size: 16px; }
      .actions { display: flex; justify-content: flex-start; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
      .saved { display: flex; align-items: center; gap: 8px; font-size: 16px; color: var(--success-color, #43a047); --mdc-icon-size: 22px; }
      @media (max-width: 600px) { .btn.save { flex: 1 1 100%; order: -1; } }
      @media (max-width: 400px) { .sent input[type="time"] { flex-basis: 96px; width: 96px; font-size: 18px; } }
    `,
  ];
}
