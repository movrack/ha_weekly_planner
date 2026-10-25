// Dialog editing one slot: start / end (fixed time or sun), one-shot, action (modes by type or
// direct setpoints per entity) and slot conditions. Emits `wp-save` with the edited slot.

import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "../components/dialog";
import { t } from "../i18n";
import { entityDomain, friendlyName } from "../planner";
import { DAY, clockToMinutes, minutesToClock } from "../time";
import type { Condition, HomeAssistant, PlannerData, Program, Setpoint, Slot, TimeSpec } from "../types";
import { findOverlap, slotTimeText } from "./day-editor";
import "./setpoint-editor";
import { defaultSetpoint, editorStyles, langOf, modeTypeOf, typeLabel } from "./setpoint-editor";
import type { K } from "./setpoint-editor";

const SUN_EVENTS = ["dawn", "sunrise", "sunset", "dusk"] as const;

@customElement("wp-slot-editor")
export class WpSlotEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: false }) program!: Program;
  @property({ attribute: false }) entry!: Slot;
  /** The other slots of the same day (overlap check). */
  @property({ attribute: false }) others: Slot[] = [];
  @state() private _s!: Slot;
  @state() private _mode: "modes" | "direct" = "modes";
  @state() private _error = "";

  private get _lang() { return langOf(this.hass); }
  private _tr(key: K, vars?: Record<string, string>) { return t(this._lang, key, vars); }

  willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("entry") && this.entry) {
      this._s = structuredClone(this.entry);
      this._s.conditions ??= [];
      this._s.actions ??= { by_type: {}, by_entity: {} };
      this._s.actions.by_type ??= {};
      this._s.actions.by_entity ??= {};
      this._mode = Object.keys(this._s.actions.by_entity).length && !Object.keys(this._s.actions.by_type).length ? "direct" : "modes";
    }
  }

  private get _types(): string[] {
    const set = new Set<string>();
    if (this.program.main_type) set.add(this.program.main_type);
    for (const e of this.program.entities) set.add(modeTypeOf(entityDomain(e.entity_id)));
    return [...set];
  }

  private _update(patch: Partial<Slot>): void {
    this._s = { ...this._s, ...patch };
    this._error = "";
  }

  /* ---- time specs ---- */

  private _setSpec(which: "start" | "end", spec: TimeSpec | null): void {
    this._update({ [which]: spec } as Partial<Slot>);
  }

  private _specEditor(which: "start" | "end", spec: TimeSpec) {
    const isSun = !("time" in spec);
    const label = this._tr(which === "start" ? "slot_start" : "slot_end");
    return html`
      <fieldset>
        <legend>${label}</legend>
        <div class="field">
          <select aria-label=${`${label} — ${this._tr("time_kind")}`}
            @change=${(e: Event) => {
              const sun = (e.target as HTMLSelectElement).value === "sun";
              this._setSpec(which, sun ? { sun: "sunset", offset: 0 } : { time: which === "start" ? "08:00" : "09:00" });
            }}>
            <option value="fixed" ?selected=${!isSun}>${this._tr("time_fixed")}</option>
            <option value="sun" ?selected=${isSun}>${this._tr("time_sun")}</option>
          </select>
        </div>
        ${"time" in spec
          ? this._fixedEditor(which, spec.time, label)
          : html`
              <div class="row">
                <div class="field">
                  <label>${this._tr("sun_event")}</label>
                  <select @change=${(e: Event) => this._setSpec(which, { ...spec, sun: (e.target as HTMLSelectElement).value as typeof SUN_EVENTS[number] })}>
                    ${SUN_EVENTS.map((ev) => html`<option value=${ev} ?selected=${spec.sun === ev}>${this._tr(`sun_${ev}` as K)}</option>`)}
                  </select>
                </div>
                <div class="field">
                  <label>${this._tr("sun_offset")}</label>
                  <input type="number" min="-240" max="240" step="5" .value=${String(spec.offset ?? 0)}
                    @change=${(e: Event) => {
                      const v = Math.max(-240, Math.min(240, Math.round(Number((e.target as HTMLInputElement).value) || 0)));
                      this._setSpec(which, { ...spec, offset: v });
                    }} />
                </div>
              </div>
              <div class="row">
                ${(["earliest", "latest"] as const).map(
                  (bound) => html`
                    <div class="field">
                      <label>${this._tr(bound === "earliest" ? "sun_earliest" : "sun_latest")}</label>
                      <div class="row">
                        <input type="time" step="300" style="flex:1" .value=${spec[bound] ?? ""}
                          @change=${(e: Event) => {
                            const v = (e.target as HTMLInputElement).value;
                            const next = { ...spec } as Record<string, unknown>;
                            if (v) next[bound] = minutesToClock(clockToMinutes(v));
                            else delete next[bound];
                            this._setSpec(which, next as TimeSpec);
                          }} />
                        ${spec[bound]
                          ? html`<button class="ibtn" aria-label=${this._tr("clear")}
                              @click=${() => { const next = { ...spec } as Record<string, unknown>; delete next[bound]; this._setSpec(which, next as TimeSpec); }}><ha-icon icon="mdi:close"></ha-icon></button>`
                          : nothing}
                      </div>
                    </div>`,
                )}
              </div>`}
      </fieldset>`;
  }

  private _fixedEditor(which: "start" | "end", time: string, label: string) {
    const midnight = which === "end" && time === "24:00";
    return html`
      ${midnight
        ? html`<p class="time-big">24:00</p>`
        : html`<div class="field"><input type="time" step="300" aria-label=${label} .value=${time}
            @change=${(e: Event) => {
              const v = (e.target as HTMLInputElement).value;
              if (v) this._setSpec(which, { time: minutesToClock(clockToMinutes(v)) });
            }} /></div>`}
      ${which === "end"
        ? html`<label class="check"><input type="checkbox" .checked=${midnight}
            @change=${(e: Event) => this._setSpec("end", { time: (e.target as HTMLInputElement).checked ? "24:00" : "23:55" })} />
            ${this._tr("until_midnight")}</label>`
        : nothing}`;
  }

  /* ---- actions ---- */

  private _setMode(type: string, id: string): void {
    const by_type = { ...this._s.actions.by_type };
    if (id) by_type[type] = id;
    else delete by_type[type];
    this._update({ actions: { ...this._s.actions, by_type } });
  }

  private _setDirect(entityId: string, sp: Setpoint | null): void {
    const by_entity = { ...this._s.actions.by_entity };
    if (sp) by_entity[entityId] = sp;
    else delete by_entity[entityId];
    this._update({ actions: { ...this._s.actions, by_entity } });
  }

  private _switchMode(mode: "modes" | "direct"): void {
    this._mode = mode;
    if (mode === "modes") this._update({ actions: { ...this._s.actions, by_entity: {} } });
    else this._update({ actions: { ...this._s.actions, by_type: {} } });
  }

  private _modesEditor() {
    return html`${this._types.map((type) => {
      const modes = this.data.modes.filter((m) => m.type === type);
      const current = this._s.actions.by_type[type] ?? "";
      return html`
        <div class="field">
          <label>${this._tr("mode_for_type", { type: this._typeName(type) })}</label>
          <select @change=${(e: Event) => this._setMode(type, (e.target as HTMLSelectElement).value)}>
            <option value="" ?selected=${current === ""}>—</option>
            ${modes.map((m) => html`<option value=${m.id} ?selected=${m.id === current}>${m.name}</option>`)}
          </select>
        </div>`;
    })}`;
  }

  private _typeName(type: string): string {
    return typeLabel(this._lang, type);
  }

  private _directEditor() {
    return html`${this.program.entities.map((e) => {
      const sp = this._s.actions.by_entity[e.entity_id];
      return html`
        <div class="card">
          <label class="check"><input type="checkbox" .checked=${Boolean(sp)}
            @change=${(ev: Event) => this._setDirect(e.entity_id,
              (ev.target as HTMLInputElement).checked ? defaultSetpoint(this.hass, e.entity_id) : null)} />
            <strong>${friendlyName(this.hass, e.entity_id)}</strong></label>
          ${sp
            ? html`<wp-setpoint-editor .hass=${this.hass} entity-id=${e.entity_id} .value=${sp}
                .admin=${Boolean(this.data.is_admin)}
                @wp-change=${(ev: CustomEvent) => { ev.stopPropagation(); this._setDirect(e.entity_id, ev.detail); }}></wp-setpoint-editor>`
            : nothing}
        </div>`;
    })}
    <div class="field" style="max-width:220px">
      <label>${this._tr("slot_color")}</label>
      <div class="row">
        <input type="color" aria-label=${this._tr("slot_color")} .value=${this._s.color ?? "#9e9e9e"}
          @input=${(e: Event) => this._update({ color: (e.target as HTMLInputElement).value })} />
        ${this._s.color ? html`<button class="btn" @click=${() => this._update({ color: null })}>${this._tr("clear")}</button>` : nothing}
      </div>
    </div>`;
  }

  /* ---- validation / save ---- */

  private _validate(): string {
    const s = this._s;
    const a = "time" in s.start ? clockToMinutes(s.start.time) : null;
    if (s.end && "time" in s.start && "time" in s.end && a === clockToMinutes(s.end.time)) return this._tr("err_start_equals_end");
    if (a !== null && a >= DAY) return this._tr("err_start_equals_end");
    if (!Object.keys(s.actions.by_type).length && !Object.keys(s.actions.by_entity).length) return this._tr("err_no_action");
    for (const sp of Object.values(s.actions.by_entity)) {
      if (sp.kind === "scene" && !sp.scene) return this._tr("err_incomplete");
      if (sp.kind === "script" && !sp.script) return this._tr("err_incomplete");
      if (sp.kind === "action" && !sp.action) return this._tr("err_incomplete");
    }
    if (s.conditions?.some((c) => !c.entity_id)) return this._tr("err_incomplete");
    const clash = findOverlap([...this.others, s]);
    if (clash) {
      const other = clash.find((x) => x.id !== s.id) ?? clash[0];
      return this._tr("err_overlap", { slot: slotTimeText(this.hass, other, this._lang) });
    }
    return "";
  }

  private _save(): void {
    const error = this._validate();
    if (error) {
      this._error = error;
      return;
    }
    const slot = structuredClone(this._s);
    if (!slot.color) delete slot.color;
    this.dispatchEvent(new CustomEvent("wp-save", { detail: slot, bubbles: true, composed: true }));
    this.shadowRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close();
  }

  render() {
    if (!this._s) return nothing;
    const s = this._s;
    return html`
      <wp-dialog open wide heading=${this._tr("slot_title")}>
        ${this._specEditor("start", s.start)}
        <label class="check"><input type="checkbox" .checked=${!s.end}
          @change=${(e: Event) => {
            const one = (e.target as HTMLInputElement).checked;
            if (one) this._setSpec("end", null);
            else {
              const a = "time" in s.start ? clockToMinutes(s.start.time) : 480;
              this._setSpec("end", { time: minutesToClock(Math.min(DAY, a + 60)) });
            }
          }} /> ${this._tr("one_shot_check")}</label>
        ${s.end ? this._specEditor("end", s.end) : html`<p class="hint">${this._tr("one_shot_hint")}</p>`}

        <h3>${this._tr("slot_action")}</h3>
        <div class="row" role="radiogroup" aria-label=${this._tr("slot_action")}>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "modes"} @change=${() => this._switchMode("modes")} />
            ${this._tr("action_modes")}</label>
          <label class="check"><input type="radio" name="am" .checked=${this._mode === "direct"} @change=${() => this._switchMode("direct")} />
            ${this._tr("action_direct")}</label>
        </div>
        ${this._mode === "modes" ? this._modesEditor() : this._directEditor()}

        <h3>${this._tr("slot_conditions")}</h3>
        <wp-conditions-editor .hass=${this.hass} .conditions=${(s.conditions ?? []) as Condition[]}
          @wp-change=${(e: CustomEvent) => { e.stopPropagation(); this._update({ conditions: e.detail }); }}></wp-conditions-editor>

        ${this._error ? html`<p class="error" role="alert">${this._error}</p>` : nothing}
        <button slot="footer" class="btn" @click=${() => this.shadowRoot?.querySelector<HTMLElement & { close(): void }>("wp-dialog")?.close()}>${this._tr("cancel")}</button>
        <button slot="footer" class="btn primary" @click=${() => this._save()}>${this._tr("ok")}</button>
      </wp-dialog>`;
  }

  static styles = [
    editorStyles,
    css`
      :host { display: contents; }
      fieldset { border: 1px solid var(--divider-color); border-radius: 12px; margin: 8px 0; padding: 4px 12px 8px; min-width: 0; }
      legend { font-weight: 600; padding: 0 6px; }
      h3 { margin: 16px 0 4px; font-size: 15px; font-weight: 500; }
      .time-big { font-size: 20px; font-weight: 600; margin: 8px 0; }
    `,
  ];
}
