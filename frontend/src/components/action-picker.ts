// "What happens" for one device: the choices of its type (own modes, scenes, common modes) and the
// few inputs the chosen one needs (temperature, position, light settings).

import { LitElement, css, html, nothing } from "lit";
import type { TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { actionChoices, selectedChoice } from "../actions";
import type { Act, Choice } from "../actions";
import { t } from "../i18n";
import { entityDomain, fmtNum } from "../planner";
import { editorStyles, langOf } from "../editors/setpoint-editor";
import type { HomeAssistant, PlannerData, Setpoint } from "../types";

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

@customElement("wp-action-picker")
export class WpActionPicker extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property({ attribute: false }) data!: PlannerData;
  @property({ attribute: "entity-id" }) entityId = "";
  @property({ attribute: false }) act: Act | null = null;
  /** "The rest of the time": adds "do nothing" and "previous state", without scenes. */
  @property({ type: Boolean }) rest = false;
  @property({ type: Boolean }) disabled = false;

  private get _lang(): string { return langOf(this.hass); }

  private _emit(act: Act): void {
    this.dispatchEvent(new CustomEvent("act-change", { detail: act, bubbles: true, composed: true }));
  }

  private _choices(): Choice[] {
    return actionChoices(this.hass, this._lang, this.data.modes, this.entityId, !this.rest);
  }

  private _pick(choice: Choice): void {
    this._emit({ ...choice.act, sp: structuredClone(choice.act.sp) });
  }

  private _patch(patch: Record<string, unknown>, drop: string[] = []): void {
    const sp = { ...(this.act?.sp ?? { kind: "on" }), ...patch } as Record<string, unknown>;
    for (const key of drop) delete sp[key];
    this._emit({ sp: sp as Setpoint });
  }

  private _stepper(
    label: string, value: string, onMinus: () => void, onPlus: () => void, onClear?: () => void,
  ): TemplateResult {
    return html`<div class="stepper" role="group" aria-label=${label}>
      <span class="lbl">${label}</span>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="−" @click=${onMinus}><ha-icon icon="mdi:minus"></ha-icon></button>
      <output>${value}</output>
      <button class="ibtn round" ?disabled=${this.disabled} aria-label="+" @click=${onPlus}><ha-icon icon="mdi:plus"></ha-icon></button>
      ${onClear ? html`<button class="ibtn round" ?disabled=${this.disabled} aria-label=${t(this._lang, "clear")} @click=${onClear}><ha-icon icon="mdi:close"></ha-icon></button>` : nothing}
    </div>`;
  }

  private _params(choice: Choice | undefined): unknown {
    if (!choice?.param || !this.act) return nothing;
    const lang = this._lang;
    const a = this.hass.states[this.entityId]?.attributes ?? {};
    const sp = this.act.sp as Record<string, unknown>;
    if (choice.param === "temperature") {
      const min = num(a.min_temp) ?? 5;
      const max = num(a.max_temp) ?? 35;
      const v = num(sp.temperature) ?? 19;
      const set = (n: number) => this._patch({ temperature: clamp(Math.round(n * 2) / 2, min, max) });
      return this._stepper(t(lang, "act_temp"), `${fmtNum(lang, v)} °C`, () => set(v - 0.5), () => set(v + 0.5));
    }
    if (choice.param === "position") {
      const v = num(sp.position) ?? 50;
      const set = (n: number) => this._patch({ position: clamp(Math.round(n / 5) * 5, 0, 100) });
      return html`${this._stepper(t(lang, "act_pos"), `${v} %`, () => set(v - 10), () => set(v + 10))}
        <input type="range" min="0" max="100" step="5" .value=${String(v)} ?disabled=${this.disabled}
          aria-label=${t(lang, "act_pos")} @change=${(e: Event) => set(Number((e.target as HTMLInputElement).value))} />`;
    }
    // light: brightness, colour temperature and effect, each optional and collapsed until set
    const modes = (a.supported_color_modes as string[] | undefined) ?? [];
    const effects = ((a.effect_list as string[] | undefined) ?? []).filter((x) => x !== "off");
    const rows: TemplateResult[] = [];
    const adders: TemplateResult[] = [];
    const adder = (name: string, patch: Record<string, unknown>) => adders.push(html`
      <button class="chip add" ?disabled=${this.disabled} @click=${() => this._patch(patch)}>${t(lang, "add_param", { name })}</button>`);
    if (modes.some((m) => m !== "onoff")) {
      const b = num(sp.brightness);
      const set = (n: number) => this._patch({ brightness: clamp(Math.round(n / 5) * 5, 5, 100) });
      if (b === null) adder(t(lang, "act_brightness"), { brightness: 80 });
      else rows.push(this._stepper(t(lang, "act_brightness"), `${b} %`, () => set(b - 10), () => set(b + 10), () => this._patch({}, ["brightness"])));
    }
    if (modes.includes("color_temp")) {
      const lo = num(a.min_color_temp_kelvin) ?? 2000;
      const hi = num(a.max_color_temp_kelvin) ?? 6500;
      const k = num(sp.color_temp_kelvin);
      const set = (n: number) => this._patch({ color_temp_kelvin: clamp(Math.round(n / 100) * 100, lo, hi) });
      if (k === null) adder(t(lang, "act_kelvin"), { color_temp_kelvin: clamp(2700, lo, hi) });
      else rows.push(this._stepper(t(lang, "act_kelvin"), `${k} K`, () => set(k - 200), () => set(k + 200), () => this._patch({}, ["color_temp_kelvin"])));
    }
    if (effects.length) {
      if (!sp.effect) adder(t(lang, "act_effect"), { effect: effects[0] });
      else rows.push(html`<div class="stepper"><span class="lbl">${t(lang, "act_effect")}</span>
        <select class="grow" ?disabled=${this.disabled} aria-label=${t(lang, "act_effect")}
          @change=${(e: Event) => this._patch({ effect: (e.target as HTMLSelectElement).value })}>
          ${effects.map((x) => html`<option value=${x} ?selected=${x === sp.effect}>${x}</option>`)}
        </select>
        <button class="ibtn round" ?disabled=${this.disabled} aria-label=${t(lang, "clear")} @click=${() => this._patch({}, ["effect"])}><ha-icon icon="mdi:close"></ha-icon></button></div>`);
    }
    return html`${rows}${adders.length ? html`<div class="chips adders">${adders}</div>` : nothing}`;
  }

  render() {
    if (!this.hass || !this.data || !this.entityId) return nothing;
    const lang = this._lang;
    const choices = this._choices();
    const chosen = this.act?.special ? undefined : selectedChoice(choices, this.act);
    const custom = this.act && !this.act.special && !chosen;
    const domain = entityDomain(this.entityId);
    const chip = (label: string, on: boolean, click: () => void, icon?: string) => html`
      <button class="chip ${on ? "on" : ""}" role="radio" aria-checked=${on} ?disabled=${this.disabled} @click=${click}>
        ${icon ? html`<ha-icon icon=${icon}></ha-icon>` : nothing}<span>${label}</span></button>`;
    return html`
      <div class="chips" role="radiogroup" aria-label=${t(lang, "action")}>
        ${custom ? chip(t(lang, "act_custom"), true, () => undefined) : nothing}
        ${choices.map((c) => chip(c.label, chosen?.id === c.id, () => this._pick(c),
          c.group === "scene" ? "mdi:palette-outline" : undefined))}
        ${this.rest ? html`
          ${chip(t(lang, "rest_none"), this.act?.special === "none", () => this._emit({ sp: { kind: "off" }, special: "none" }))}
          ${chip(t(lang, "rest_previous"), this.act?.special === "previous", () => this._emit({ sp: { kind: "off" }, special: "previous" }))}` : nothing}
      </div>
      ${domain ? this._params(chosen) : nothing}`;
  }

  static styles = [editorStyles, css`
    :host { display: block; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 6px; min-height: 48px; padding: 0 16px; border-radius: 24px;
      border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-size: 15px;
      cursor: pointer; --mdc-icon-size: 20px; max-width: 100%;
    }
    .chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .chip.on { background: var(--primary-color); border-color: var(--primary-color); color: var(--text-primary-color, #fff); font-weight: 600; }
    .chip:disabled { opacity: 0.5; cursor: default; }
    .stepper { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
    .stepper .lbl { flex: 1 1 100%; font-size: 13px; color: var(--secondary-text-color); }
    .stepper output { min-width: 84px; text-align: center; font-size: 22px; font-weight: 600; }
    .ibtn.round { border: 1px solid var(--divider-color); }
    input[type="range"] { width: 100%; min-height: 48px; margin: 4px 0 0; accent-color: var(--primary-color); }
    .adders { margin-top: 8px; }
    .chip.add { border-style: dashed; color: var(--primary-color); min-height: 48px; }
    .stepper select { flex: 1; min-width: 0; }
  `];
}

declare global {
  interface HTMLElementTagNameMap {
    "wp-action-picker": WpActionPicker;
  }
}
