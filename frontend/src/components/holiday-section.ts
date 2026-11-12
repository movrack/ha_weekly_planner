// "Jour férié" section of the schedules window (#54): what a mode does on a day off. A collapsible block, closed by
// default, three choices: no special setting, the same schedules as a weekday (live reference), or an own day.
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
  /** The own-day slot being edited (id, or "new"), and its draft. */
  @state() private _editing: string | null = null;
  @state() private _group: SlotGroup | null = null;

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

  private async _choose(choice: "none" | "copy" | "own"): Promise<void> {
    const current = holidayChoice(this._shown);
    if (choice === current || this._readOnly) return;
    this._editing = null;
    this._group = null;
    if (choice === "none") {
      if (!(await confirmAction(this, t(this._lang, "holiday_clear"), t(this._lang, "holiday_clear_yes"), t(this._lang, "no")))) {
        this._syncRadios(); // "No": the radios go back to what is still saved
        return;
      }
      await this._write(null);
    } else await this._write(choice === "copy" ? { copy: 0 } : { day: [] });
  }

  private _syncRadios(): void {
    const current = holidayChoice(this._shown);
    const values = ["none", "copy", "own"];
    this.renderRoot?.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((r, i) => { r.checked = values[i] === current; });
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
    if (await this._write({ day })) { this._editing = null; this._group = null; }
  }

  private async _delete(slot: Slot): Promise<void> {
    await this._write({ day: this._own().filter((s) => s.id !== slot.id) });
  }

  private _row(slot: Slot) {
    const lang = this._lang;
    const label = labelOf(this.data, slot.label);
    const name = label ? labelName(this.hass, label) : slot.label;
    const when = `${specText(lang, slot.start)}${slot.end ? `–${specText(lang, slot.end)}` : ""}`;
    return html`<li class="hrow">
      <button class="open" ?disabled=${this._readOnly || this._busy} @click=${() => this._edit(slot)}>
        <span class="dot" style="background:${label?.color ?? "transparent"}" aria-hidden="true"></span><span class="txt">${when} · ${name}</span></button>
      <button class="del" ?disabled=${this._readOnly || this._busy} aria-label=${`${t(lang, "delete")} ${when}`} title=${t(lang, "delete")}
        @click=${() => void this._delete(slot)}><ha-icon icon="mdi:delete-outline"></ha-icon></button></li>`;
  }

  private _ownDay() {
    const lang = this._lang;
    const slots = this._shown.holiday && "day" in this._shown.holiday ? this._shown.holiday.day : [];
    const entityIds = this.program.entities.map((e) => e.entity_id);
    const form = this._group ? html`<div class="form">
      <wp-slot-form .hass=${this.hass} .data=${this.data} .program=${this.program} .group=${this._group} .entityIds=${entityIds}
        .device=${entityIds[0] ?? ""} ?disabled=${this._busy}
        @group-change=${(e: CustomEvent<SlotGroup>) => { e.stopPropagation(); this._group = e.detail; this._error = ""; }}></wp-slot-form>
      ${passesMidnight(this.hass, this._group.slot) ? html`<p class="warn" role="status">${t(lang, "holiday_midnight")}</p>` : nothing}
      <div class="btns">
        <button class="btn primary" ?disabled=${this._busy} @click=${() => void this._save()}>${t(lang, "save")}</button>
        <button class="btn" @click=${() => { this._editing = null; this._group = null; }}>${t(lang, "cancel")}</button></div></div>` : nothing;
    return html`<ul class="hlist">${slots.map((s) => this._row(s))}</ul>${form}
      ${!this._group && !this._readOnly ? html`<button class="btn add" ?disabled=${this._busy} @click=${() => this._add()}>
        <ha-icon icon="mdi:plus"></ha-icon>${t(lang, "w_add")}</button>` : nothing}
      ${slots.length === 0 && !this._group ? html`<p class="muted">${t(lang, "w_none")}</p>` : nothing}`;
  }

  private _summary(setting: Profile["holiday"]): string {
    const lang = this._lang;
    return !setting ? t(lang, "holiday_what_none")
      : "copy" in setting ? t(lang, "holiday_what_copy", { day: dayInText(lang, setting.copy) }) : t(lang, "holiday_what_own");
  }

  render() {
    const lang = this._lang;
    const shown = this._shown;
    const choice = holidayChoice(shown);
    const id = `holiday-${this.program.id}`;
    const radio = (value: "none" | "copy" | "own", text: string) => html`<label class="opt"><input type="radio" name=${id} .checked=${choice === value}
      ?disabled=${this._readOnly || this._busy} @change=${() => void this._choose(value)} />${text}</label>`;
    return html`<section class="holiday">
      <button class="head" aria-expanded=${this._open} aria-controls=${id} @click=${() => { this._open = !this._open; }}>
        <span class="grow">${t(lang, "holiday_title")}</span>
        <span class="state">${this._summary(shown.holiday)}</span>
        <ha-icon icon=${this._open ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon></button>
      <div id=${id} role="group" aria-label=${t(lang, "holiday_title")} ?hidden=${!this._open}>
        ${this.source ? html`<p class="muted">${t(lang, "holiday_follows_note", { mode: this.source.name })}</p>` : html`<div class="opts" role="radiogroup" aria-label=${t(lang, "holiday_title")}>
          ${radio("none", t(lang, "holiday_none"))}
          ${radio("copy", t(lang, "holiday_copy"))}
          ${choice === "copy" ? html`<select class="day" aria-label=${t(lang, "holiday_copy")} ?disabled=${this._readOnly || this._busy}
            @change=${(e: Event) => void this._write({ copy: Number((e.target as HTMLSelectElement).value) })}>
            ${strings(lang).days.map((d, i) => html`<option value=${i} ?selected=${shown.holiday && "copy" in shown.holiday && shown.holiday.copy === i}>${d}</option>`)}</select>` : nothing}
          ${radio("own", t(lang, "holiday_own"))}
        </div>
        ${choice === "own" ? this._ownDay() : nothing}`}
        ${this._error ? html`<p class="err" role="alert">${this._error}</p>` : nothing}
      </div>
    </section>`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .holiday { border: 1px solid var(--divider-color); border-radius: 12px; padding: 0 12px; margin: 0 0 12px; }
    .head { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; border: 0; background: none; color: var(--primary-text-color);
      font: inherit; font-weight: 600; text-align: left; cursor: pointer; }
    .head .grow { flex: 1; }
    .head .state { font-weight: 400; font-size: 1rem; color: var(--secondary-text-color); }
    [hidden] { display: none; }
    .opts { display: flex; flex-direction: column; gap: 0; }
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
    .btns { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .add { margin: 4px 0 12px; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-holiday": WpHoliday;
  }
}
