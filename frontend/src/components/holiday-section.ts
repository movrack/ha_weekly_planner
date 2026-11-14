// "Jour férié" section of the schedules window (#54): what a mode does on a day off. A collapsible block, closed by
// default: one switch "Different schedule on days off" (off = no setting); on, two choices: the same schedules as a weekday
// (live reference) or an own day.
// The server decides what runs; this only writes the setting (`weekly_planner/program/holiday`).

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./slot-form";
import { specText } from "../actions";
import type { SlotGroup } from "../actions";
import { freshGroup } from "../edits";
import { dayInText, holidayChoice, holidayOwnSlots } from "../holiday";
import { errorText, strings, t } from "../i18n";
import { labelName, labelOf } from "../labels";
import { specMinutes } from "../slots";
import { editorStyles, langOf } from "../editors/shared";
import { confirmAction } from "./confirm";
import type { HolidaySetting, HomeAssistant, PlannerData, Profile, Program, Slot } from "../types";

/** The slot passes midnight (its end is not after its start): cut at 24:00 on a day off. */
export const passesMidnight = (hass: HomeAssistant, slot: Slot): boolean =>
  Boolean(slot.end) && specMinutes(hass, slot.end!) <= specMinutes(hass, slot.start);

@customElement("wp-holiday")
export class WpHoliday extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  /** The mode's own profile (the one written). */
  @property({ attribute: false }) profile!: Profile;
  /** The mode followed, when this one follows another: its day-off setting is shown, read-only. */
  @property({ attribute: false }) source: Profile | null = null;
  @property({ type: Boolean }) canEdit = false;
  @state() private _open = false;
  @state() private _error = "";
  @state() private _busy = false;
  /** Spoken confirmation ("Saved" / "Deleted") in an always-present status region. */
  @state() private _status = "";
  private _statusTimer?: ReturnType<typeof setTimeout>;

  private _say(key: "holiday_saved" | "holiday_deleted"): void {
    this._status = t(this._lang, key);
    clearTimeout(this._statusTimer);
    this._statusTimer = setTimeout(() => { this._status = ""; }, 3000);
  }

  /** Puts the focus back on a control after the screen changed under it (never lets it fall to the page). */
  private async _focus(selector: string): Promise<void> {
    await this.updateComplete;
    (this.renderRoot?.querySelector<HTMLElement>(selector) ?? this.renderRoot?.querySelector<HTMLElement>(".head"))?.focus();
  }
  /** The own-day slot being edited (id, or "new"), and its draft. */
  @state() private _editing: string | null = null;
  @state() private _group: SlotGroup | null = null;

  protected updated(changed: Map<string, unknown>): void {
    // the outer slot form hides its own Save / Cancel while this form is open (one pair at a time)
    if (changed.has("_group")) this.dispatchEvent(new CustomEvent("holiday-form", { detail: this._group !== null, bubbles: true, composed: true }));
  }

  private get _lang(): string { return langOf(this.hass); }
  private get _shown(): Profile { return this.source ?? this.profile; }
  private get _readOnly(): boolean { return !this.canEdit || this.source !== null; }

  private async _write(holiday: HolidaySetting | null): Promise<boolean> {
    if (this._busy) return false;
    this._busy = true;
    try {
      const res = await this.hass.callWS<{ program?: Program }>({
        type: "weekly_planner/program/holiday", program_id: this.program.id, profile_id: this.profile.id, holiday, revision: this.program.revision,
      });
      this._error = "";
      if (res?.program) this.dispatchEvent(new CustomEvent("holiday-saved", { detail: res.program, bubbles: true, composed: true }));
      return true;
    } catch (err) {
      this._error = errorText(this._lang, err);
      return false;
    } finally {
      this._busy = false;
    }
  }

  /** Writes a setting; after a failed write the controls show the saved state again and a draft is kept. */
  private async _apply(setting: HolidaySetting, focus: string): Promise<void> {
    if (await this._write(setting)) {
      this._editing = null;
      this._group = null;
      this._say("holiday_saved");
    } else this._syncControls();
    void this._focus(focus);
  }

  /** The switch: off keeps the setting in memory (`off`), on gives back the same choice (or the copy of Sunday at first). */
  private async _toggle(on: boolean): Promise<void> {
    if (this._readOnly) return;
    const setting = this._shown.holiday;
    if (on === (holidayChoice(this._shown) !== "none")) return;
    let next: HolidaySetting;
    if (!on) next = { ...setting!, off: true };
    else if (setting) { const { off: _off, ...rest } = setting; next = rest as HolidaySetting; }
    else next = { copy: 6 };
    await this._apply(next, 'input[role="switch"]');
  }

  /** The radios: the other choice is kept in memory (own schedules beside a copy), so nothing is lost and nothing is asked. */
  private async _choose(choice: "copy" | "own"): Promise<void> {
    if (this._readOnly || choice === holidayChoice(this._shown)) return;
    const kept = holidayOwnSlots(this._shown);
    const next: HolidaySetting = choice === "copy" ? { copy: 6, ...(kept.length ? { day: kept } : {}) } : { day: kept };
    await this._apply(next, `input[data-v="${choice}"]`);
  }

  private async _pickDay(copy: number): Promise<void> {
    const setting = this._shown.holiday;
    if (this._busy || !setting) return;
    await this._apply({ ...setting, copy }, ".day");
  }

  /** Puts the switch, the radios and the day select back on the saved setting (a failed write leaves them as clicked). */
  private _syncControls(): void {
    const kind = holidayChoice(this._shown);
    this.renderRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r) => { r.checked = r.dataset.v === kind; });
    const sw = this.renderRoot?.querySelector<HTMLInputElement>('input[role="switch"]');
    if (sw) sw.checked = kind !== "none";
    const day = this.renderRoot?.querySelector<HTMLSelectElement>(".day");
    const h = this._shown.holiday;
    if (day && h && "copy" in h) day.value = String(h.copy);
  }

  private _own(): Slot[] { return holidayOwnSlots(this.profile); }

  private _edit(slot: Slot): void {
    this._editing = slot.id;
    this._group = { slot: structuredClone(slot), days: [0], ids: { 0: slot.id } };
  }

  private _add(): void {
    this._editing = "new";
    this._group = freshGroup(this.data.labels[0]?.id ?? "", [0]);
  }

  private async _save(): Promise<void> {
    const group = this._group;
    if (!group) return;
    const slot = group.slot;
    const own = this._own();
    const day = own.some((s) => s.id === slot.id) ? own.map((s) => (s.id === slot.id ? slot : s)) : [...own, slot];
    if (await this._write({ day })) { this._editing = null; this._group = null; this._say("holiday_saved"); void this._focus(`.open[data-slot="${slot.id}"]`); }
  }

  private async _delete(slot: Slot): Promise<void> {
    const lang = this._lang;
    const when = `${specText(lang, slot.start)}${slot.end ? `–${specText(lang, slot.end)}` : ""}`;
    if (!(await confirmAction(this, `${t(lang, "w_confirm_slot")} ${when}`, t(lang, "slot_delete_yes"), t(lang, "slot_delete_no")))) {
      void this._focus(`.del[data-slot="${slot.id}"]`);
      return;
    }
    if (await this._write({ day: this._own().filter((s) => s.id !== slot.id) })) this._say("holiday_deleted");
    void this._focus(".add");
  }

  private _row(slot: Slot) {
    const lang = this._lang;
    const label = labelOf(this.data, slot.label);
    const name = label ? labelName(this.hass, label) : slot.label;
    const when = `${specText(lang, slot.start)}${slot.end ? `–${specText(lang, slot.end)}` : ""}`;
    return html`<li class="hrow">
      <button class="open" data-slot=${slot.id} ?disabled=${this._readOnly || this._busy} @click=${() => this._edit(slot)}>
        <span class="dot" style="background:${label?.color ?? "transparent"}" aria-hidden="true"></span><span class="txt">${when} · ${name}</span></button>
      <button class="del" data-slot=${slot.id} ?disabled=${this._readOnly || this._busy} aria-label=${`${t(lang, "delete")} ${when}`} title=${t(lang, "delete")}
        @click=${() => void this._delete(slot)}><ha-icon icon="mdi:delete-outline"></ha-icon></button></li>`;
  }

  private _ownDay() {
    const lang = this._lang;
    const slots = holidayOwnSlots(this._shown);
    const entityIds = this.program.entities.map((e) => e.entity_id);
    const form = this._group ? html`<div class="form">
      <h4 class="ftitle">${t(lang, "holiday_form_title")}</h4>
      <wp-slot-form .noDays=${true} .hass=${this.hass} .data=${this.data} .program=${this.program} .group=${this._group} .entityIds=${entityIds}
        .device=${entityIds[0] ?? ""} ?disabled=${this._busy}
        @group-change=${(e: CustomEvent<SlotGroup>) => { e.stopPropagation(); this._group = e.detail; this._error = ""; }}></wp-slot-form>
      <div class="warn" role="status">${passesMidnight(this.hass, this._group.slot) ? t(lang, "holiday_midnight") : ""}</div>
      <div class="btns">
        <button class="btn primary" ?disabled=${this._busy} @click=${() => void this._save()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => { const id = this._editing; this._editing = null; this._group = null; void this._focus(id && id !== "new" ? `.open[data-slot="${id}"]` : ".add"); }}>${t(lang, "cancel")}</button></div></div>` : nothing;
    return html`<ul class="hlist">${slots.map((s) => this._row(s))}</ul>${form}
      ${!this._group && !this._readOnly ? html`<button class="btn add" ?disabled=${this._busy} @click=${() => this._add()}>
        <ha-icon icon="mdi:plus"></ha-icon>${t(lang, "w_add")}</button>` : nothing}
      ${slots.length === 0 && !this._group ? html`<p class="muted">${t(lang, "w_none")}</p>` : nothing}`;
  }

  private _summary(setting: Profile["holiday"]): string {
    const lang = this._lang;
    return !setting || setting.off ? t(lang, "holiday_what_none")
      : "copy" in setting ? t(lang, "holiday_what_copy", { day: dayInText(lang, setting.copy) }) : t(lang, "holiday_what_own");
  }

  render() {
    const lang = this._lang;
    const shown = this._shown;
    const choice = holidayChoice(shown);
    const id = `holiday-${this.program.id}`;
    const radio = (value: "copy" | "own", text: string) => html`<label class="opt"><input type="radio" name=${id} data-v=${value} .checked=${choice === value}
      ?disabled=${this._readOnly} @change=${() => void this._choose(value)} />${text}</label>`;
    return html`<section class="holiday">
      <button class="head" aria-expanded=${this._open} aria-controls=${id} @click=${() => { this._open = !this._open; }}>
        <span class="grow">${t(lang, "holiday_title")}</span>
        <span class="state">${this._summary(shown.holiday)}</span>
        <ha-icon icon=${this._open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>
      <p class="sr-only" role="status">${this._status}</p>
      <div id=${id} ?hidden=${!this._open}>
        ${this.source ? html`<p class="muted">${t(lang, "holiday_follows_note", { mode: this.source.name })}</p>` : html`
          <label class="sw"><input type="checkbox" role="switch" .checked=${choice !== "none"} ?disabled=${this._readOnly}
            @change=${(e: Event) => void this._toggle((e.target as HTMLInputElement).checked)} />
            <span class="track" aria-hidden="true"><span class="knob"></span></span><span class="txt">${t(lang, "holiday_switch")}</span></label>
          ${choice !== "none" ? html`<fieldset class="opts"><legend class="sr-only">${t(lang, "holiday_title")}</legend>
          ${radio("copy", t(lang, "holiday_copy"))}
          ${choice === "copy" ? html`<select class="day" aria-label=${t(lang, "holiday_copy").replace(/\s*:$/, "")} ?disabled=${this._readOnly}
            @change=${(e: Event) => void this._pickDay(Number((e.target as HTMLSelectElement).value))}>
            ${strings(lang).days.map((d, i) => html`<option value=${i} ?selected=${shown.holiday && "copy" in shown.holiday && shown.holiday.copy === i}>${d}</option>`)}</select>` : nothing}
          ${radio("own", t(lang, "holiday_own"))}
        </fieldset>
        ${choice === "own" ? this._ownDay() : nothing}` : nothing}`}
        ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      </div>
    </section>`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .holiday { border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 12px; margin: 12px 0; }
    .head { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; border: 0; background: none; color: var(--primary-text-color);
      font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
    .head .grow { flex: 1; }
    .head .state { font-weight: 400; font-size: 1rem; color: var(--secondary-text-color); }
    [hidden] { display: none; }
    .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    fieldset.opts { border: 0; margin: 0; padding: 0; min-width: 0; }
    .opts { display: flex; flex-direction: column; gap: 0; }
    .sw { display: flex; align-items: center; gap: 12px; min-height: 48px; cursor: pointer; }
    .sw input { position: absolute; width: 48px; height: 48px; margin: 0; opacity: 0; cursor: pointer; }
    .track { flex: none; position: relative; width: 44px; height: 24px; border-radius: 12px; background: var(--secondary-text-color); transition: background 0.15s; }
    .knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 9px; background: var(--card-background-color, #fff); transition: transform 0.15s; }
    .sw input:checked + .track { background: var(--primary-color); }
    .sw input:checked + .track .knob { transform: translateX(20px); }
    .sw input:focus-visible + .track { outline: 2px solid var(--primary-text-color); outline-offset: 2px; }
    .opt { display: flex; align-items: center; gap: 10px; min-height: 48px; cursor: pointer; }
    .day { min-height: 48px; margin: 0 0 8px 34px; max-width: calc(100% - 34px); }
    .hlist { list-style: none; margin: 8px 0; padding: 0; }
    .hrow { display: flex; align-items: center; gap: 4px; border-top: 1px solid var(--divider-color); }
    .hrow .open { flex: 1; display: flex; align-items: center; gap: 8px; min-height: 48px; border: 0; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
    .hrow .del { flex: none; width: 48px; height: 48px; border: 0; background: none; color: var(--secondary-text-color); cursor: pointer; }
    .dot { flex: none; width: 14px; height: 14px; border-radius: 7px; box-shadow: 0 0 0 1px var(--divider-color); }
    .warn, .err, .muted { margin: 8px 0; font-size: 1rem; }
    .err { color: var(--wp-danger-text); }
    .muted { color: var(--secondary-text-color); }
    .ftitle { margin: 8px 0 6px; font-size: 0.875rem; font-weight: 600; color: var(--secondary-text-color); }
    .btns { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .add { margin: 4px 0 12px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-holiday": WpHoliday;
  }
}
