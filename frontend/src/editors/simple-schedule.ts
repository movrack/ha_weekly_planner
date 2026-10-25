// "Change the schedule" in simple mode (spec § 10.7): one day at a time, one sentence per
// slot of the active season ("From 07:00 to 09:00: Comfort"), native time inputs, 15 minute
// buttons, add / remove a slot, copy the day, save the whole program.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/dialog";
import { confirmAction } from "../components/confirm";
import { SwipeTracker } from "../components/gestures";
import { strings, t } from "../i18n";
import { activeProfile, describeSp, mainType, modeEffect, modeSetpoint, newId } from "../planner";
import { DAY, clockToMinutes, fmtClock, localWeekday, minutesToClock, nominal } from "../time";
import type { HomeAssistant, Mode, PlannerData, Profile, Program, Slot, TimeSpec } from "../types";
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
  @state() private _adding = false;
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

  private _add(range: boolean): void {
    this._adding = false;
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
      id: newId(), start: { time: clock(start) }, conditions: [],
      actions: { by_type: comfort ? { [mainType(this._p!)]: comfort.id } : {}, by_entity: {} },
    };
    if (range) slot.end = { time: clock(Math.min(DAY, start + 60)) };
    this._setDay(this._day, [...slots, slot]);
  }

  private async _remove(slot: Slot): Promise<void> {
    const text = this._tr("ss_confirm_remove", { time: this._sentenceTime(slot) });
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

  private _offsetWord(minutes: number): string {
    const abs = Math.abs(minutes);
    const d = abs < 60 ? `${abs} min` : abs % 60 ? `${Math.floor(abs / 60)} h ${String(abs % 60).padStart(2, "0")}` : `${abs / 60} h`;
    return this._tr(minutes > 0 ? "ss_off_after" : "ss_off_before", { d });
  }

  /** "À 4 h" / "Au coucher du soleil" / "30 min après le coucher du soleil" / "De 8 h" / "à 22 h". */
  private _whenText(spec: TimeSpec, role: "at" | "from" | "to"): string {
    if ("time" in spec) {
      const m = clockToMinutes(spec.time);
      return `${this._tr(`ss_${role}` as K)} ${m >= DAY ? this._tr("ss_midnight_word") : fmtClock(this._lang, m)}`;
    }
    const offset = spec.offset ?? 0;
    if (!offset) return this._tr(`ss_${role}_${spec.sun}` as K);
    const phrase = `${this._offsetWord(offset)} ${this._tr(`ss_the_${spec.sun}` as K)}`;
    return role === "at" ? phrase : `${this._tr(`ss_${role}` as K)} ${phrase}`;
  }

  /** "8 h 45 à 17 h" is built as "De 8 h 45 à 17 h"; a single time as "À 4 h". */
  private _sentenceTime(slot: Slot): string {
    return slot.end
      ? `${this._whenText(slot.start, "from")} ${this._whenText(slot.end, "to")}`
      : this._whenText(slot.start, "at");
  }

  /** Entity the period's mode is read on (first entity of the main type). */
  private get _firstEntity(): string {
    const type = mainType(this._p!);
    const ids = this._p!.entities.map((e) => e.entity_id);
    return ids.find((id) => id.split(".")[0] === type) ?? ids[0] ?? "";
  }

  /** Action of a mode as the user reads it: a verb ("fermer le volet") or a setting ("Confort (19 °C)"). */
  private _action(mode: Mode): { text: string; verb: boolean } {
    const eid = this._firstEntity;
    const sp = (eid ? modeSetpoint(mode, eid) : mode.value) as Record<string, unknown>;
    const n = String(sp.position ?? "");
    switch (sp.kind) {
      case "open": return { text: this._tr("ss_act_open"), verb: true };
      case "close": return { text: this._tr("ss_act_close"), verb: true };
      case "off": return { text: this._tr("ss_act_off"), verb: true };
      case "on": return typeof sp.brightness === "number"
        ? { text: this._tr("ss_act_on_pct", { n: String(sp.brightness) }), verb: true }
        : { text: this._tr("ss_act_on"), verb: true };
      case "position":
        return /favori|favorite/i.test(`${mode.id} ${mode.name}`)
          ? { text: this._tr("ss_act_fav", { n }), verb: true }
          : { text: this._tr("ss_act_pos", { n }), verb: true };
      default: {
        const effect = eid ? modeEffect(this.hass, this._lang, mode, eid) : "";
        return { text: effect ? `${mode.name} (${effect})` : mode.name, verb: false };
      }
    }
  }

  /** The whole sentence of a slot: when, then what happens. */
  private _title(slot: Slot): string {
    const when = this._sentenceTime(slot);
    const current = this._mode(slot);
    let action = "";
    let verb = false;
    if (current) {
      const mode = this._modes.find((m) => m.id === current);
      if (mode) ({ text: action, verb } = this._action(mode));
    } else if (Object.keys(slot.actions.by_entity).length) {
      const [id, sp] = Object.entries(slot.actions.by_entity)[0];
      action = describeSp(this._lang, this.data.modes, id, sp);
    }
    if (!action) return when;
    return verb
      ? `${when}, ${action.charAt(0).toLowerCase()}${action.slice(1)}`
      : `${when}${this._tr("ss_colon")}${action}`;
  }

  /* ---- time block ("Quand" / "Début" / "Fin") ---- */

  private _setKind(slot: Slot, which: "start" | "end", kind: string): void {
    const spec = slot[which];
    if (!spec) return;
    if (kind === "time") {
      if ("time" in spec) return;
      this._setTime(slot, which, Math.round(specMinutes(this.hass, spec) / 5) * 5);
    } else {
      const sun = kind as Sun;
      const next: TimeSpec = "time" in spec ? { sun, offset: 0 } : { ...spec, sun };
      this._patchSlot(slot.id, { [which]: next } as Partial<Slot>);
    }
  }

  private _setOffset(slot: Slot, which: "start" | "end", ev: Event): void {
    const spec = slot[which];
    if (!spec || "time" in spec) return;
    const offset = Number((ev.target as HTMLSelectElement).value);
    this._patchSlot(slot.id, { [which]: { ...spec, offset } } as Partial<Slot>);
  }

  private _whenBlock(slot: Slot, which: "start" | "end", title: string) {
    const spec = slot[which];
    if (!spec) return nothing;
    const kind = "time" in spec ? "time" : spec.sun;
    const kinds = ["time", "sunrise", "sunset", ...(kind === "dawn" || kind === "dusk" ? [kind] : [])];
    const edit = this._canEdit;
    let body;
    if ("time" in spec) {
      const m = nominal(spec) ?? 0;
      body = html`
        <input type="time" step="300" .value=${m >= DAY ? "00:00" : spec.time} aria-label=${title} ?disabled=${!edit}
          @change=${(e: Event) => this._fromInput(slot, which, e)} />
        <div class="steps">
          <button class="btn step" ?disabled=${!edit} aria-label=${this._tr("ss_earlier_aria", { when: title })}
            @click=${() => this._shift(slot, which, -MOVE)}><ha-icon icon="mdi:minus"></ha-icon><span>${this._tr("ss_earlier")}</span></button>
          <button class="btn step" ?disabled=${!edit} aria-label=${this._tr("ss_later_aria", { when: title })}
            @click=${() => this._shift(slot, which, MOVE)}><ha-icon icon="mdi:plus"></ha-icon><span>${this._tr("ss_later")}</span></button>
        </div>`;
    } else {
      const offset = spec.offset ?? 0;
      const offsets = [0, 15, 30, 60, -15, -30, -60];
      if (!offsets.includes(offset)) offsets.unshift(offset);
      body = html`<select aria-label=${title} ?disabled=${!edit} @change=${(e: Event) => this._setOffset(slot, which, e)}>
        ${offsets.map((o) => html`<option value=${o} ?selected=${o === offset}>${o === 0 ? this._tr("ss_off_zero") : this._offsetWord(o)}</option>`)}
      </select>`;
    }
    return html`
      <div class="blk" role="group" aria-label=${title}>
        <div class="blk-t">${title}</div>
        <div class="seg" role="radiogroup" aria-label=${title}>
          ${kinds.map((k) => html`<button class="segb ${k === kind ? "on" : ""}" role="radio" aria-checked=${k === kind}
            ?disabled=${!edit} @click=${() => this._setKind(slot, which, k)}>${this._tr(`ss_kind_${k}` as K)}</button>`)}
        </div>
        ${body}
      </div>`;
  }

  /* ---- action block ---- */

  private _actionBlock(slot: Slot) {
    const current = this._mode(slot);
    const custom = !current && Object.keys(slot.actions.by_entity).length > 0;
    const modes = this._modes;
    if (custom) {
      const [id, sp] = Object.entries(slot.actions.by_entity)[0];
      const more = Object.keys(slot.actions.by_entity).length - 1;
      const text = `${describeSp(this._lang, this.data.modes, id, sp)}${more > 0 ? ` +${more}` : ""}`;
      return html`<div class="blk"><div class="blk-t">${this._tr("ss_action")}</div><strong class="custom">${text}</strong></div>`;
    }
    const edit = this._canEdit;
    return html`
      <div class="blk" role="radiogroup" aria-label=${this._tr("ss_action")}>
        <div class="blk-t">${this._tr("ss_action")}</div>
        ${modes.map((m) => html`
          <label class="opt ${m.id === current ? "on" : ""}">
            <input type="radio" name=${`act-${slot.id}`} .checked=${m.id === current} ?disabled=${!edit}
              @change=${() => this._setMode(slot, m.id)} />
            <span>${this._action(m).text}</span>
          </label>`)}
      </div>`;
  }

  private _renderSlot(slot: Slot) {
    const s = nominal(slot.start);
    const e = nominal(slot.end ?? null);
    const next = s !== null && e !== null && e <= s && e < DAY;
    return html`
      <div class="slot card">
        <div class="sentence">${this._title(slot)}</div>
        ${slot.end
          ? html`${this._whenBlock(slot, "start", this._tr("ss_start_lbl"))}${this._whenBlock(slot, "end", this._tr("ss_end_lbl"))}`
          : this._whenBlock(slot, "start", this._tr("ss_when"))}
        ${next ? html`<p class="hint"><ha-icon icon="mdi:weather-night"></ha-icon> ${this._tr("ss_next_day")}</p>` : nothing}
        ${this._actionBlock(slot)}
        <div class="actions">
          <button class="textbtn" ?disabled=${!this._canEdit} @click=${() => void this._remove(slot)}>
            <ha-icon icon="mdi:delete-outline"></ha-icon> ${this._tr("ss_remove")}</button>
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
          ${this._adding
            ? html`<div class="card addbox" role="group" aria-label=${this._tr("ss_add")}>
                <div class="blk-t">${this._tr("ss_add_title")}</div>
                <button class="btn big" @click=${() => this._add(false)}><ha-icon icon="mdi:clock-outline"></ha-icon> ${this._tr("ss_add_point")}</button>
                <button class="btn big" @click=${() => this._add(true)}><ha-icon icon="mdi:timer-sand"></ha-icon> ${this._tr("ss_add_range")}</button>
                <button class="textbtn plain" @click=${() => { this._adding = false; }}>${s.cancel}</button>
              </div>`
            : html`<button class="btn" ?disabled=${!editable} @click=${() => { this._adding = true; }}>
                <ha-icon icon="mdi:plus"></ha-icon> ${this._tr("ss_add")}</button>`}
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
        <button slot="footer" class="btn primary save" ?disabled=${!editable || this._saving || this._saved} @click=${() => void this._save()}>${s.save}</button>
        <button slot="footer" class="textbtn plain cancel" @click=${() => this._closeDialog()}>${s.cancel}</button>
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
      .slot { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
      .sentence { font-size: 18px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
      .blk { display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid var(--divider-color); min-width: 0; }
      .blk-t { font-size: 15px; font-weight: 600; }
      .seg { display: flex; flex-wrap: wrap; gap: 8px; }
      .segb {
        flex: 1 1 96px; min-height: 52px; padding: 6px 8px; border-radius: 12px; font-size: 15px; line-height: 1.2;
        border: 2px solid var(--secondary-text-color); background: none; color: var(--primary-text-color); cursor: pointer;
      }
      .segb.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
      .segb:disabled { opacity: 0.45; cursor: default; }
      .blk input[type="time"] { width: 100%; max-width: 180px; min-height: 52px; font-size: 22px; font-weight: 600; text-align: center; }
      .blk select { font-size: 16px; min-height: 52px; }
      .steps { display: flex; flex-wrap: wrap; gap: 8px; }
      .btn.step { flex: 1 1 100%; min-width: 0; min-height: 52px; padding: 0 12px; font-size: 16px; gap: 6px; border-color: var(--secondary-text-color); }
      @media (min-width: 600px) { .btn.step { flex: 1 1 160px; } }
      .opt {
        display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 8px 14px; border-radius: 12px; cursor: pointer;
        border: 2px solid var(--secondary-text-color); font-size: 16px; line-height: 1.25;
      }
      .opt input { flex: none; }
      .opt.on { border-color: var(--primary-color); background: color-mix(in srgb, var(--primary-color) 18%, transparent); font-weight: 600; }
      .custom { font-size: 18px; }
      .btn { border-color: var(--secondary-text-color); }
      .btn.primary { border-color: var(--primary-color); }
      .btn.big { min-height: 56px; font-size: 16px; width: 100%; }
      .addbox { display: flex; flex-direction: column; gap: 8px; }
      .muted, .hint { color: var(--primary-text-color); opacity: 0.8; }
      .actions { display: flex; justify-content: flex-start; padding-top: 4px; }
      .textbtn {
        display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 8px; border: none; background: none;
        cursor: pointer; font-size: 15px; color: var(--error-color, #db4437); text-decoration: underline; --mdc-icon-size: 20px;
      }
      .textbtn.plain { color: var(--primary-text-color); justify-content: center; }
      .textbtn:disabled { opacity: 0.45; cursor: default; }
      .saved { display: flex; align-items: center; gap: 8px; font-size: 16px; color: var(--success-color, #43a047); --mdc-icon-size: 22px; }
      .btn.save { flex: 1 1 100%; min-height: 56px; font-size: 17px; }
      .cancel { flex: 1 1 100%; }
    `,
  ];
}
