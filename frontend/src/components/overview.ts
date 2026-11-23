// "Aperçu" of the programs panel: the Weekly Planner card itself, as a compact list, for the programs the panel list shows.

import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../weekly-planner-card";
import type { CardConfig, HomeAssistant } from "../types";

/** The card configuration of the overview: the compact list, in the order of the panel list; `programs` undefined keeps every program (also the ones created later). */
export const overviewConfig = (programs: string[] | undefined, order: string[]): CardConfig => ({
  type: "custom:weekly-planner-card",
  schedule_view: "list",
  sort: "custom",
  order,
  filter: programs ? { programs } : {},
});

type CardElement = HTMLElement & { setConfig(config: CardConfig): void; hass?: HomeAssistant };

@customElement("wp-overview")
export class WpOverview extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  /** Ids of the programs to show; undefined: all of them. */
  @property({ attribute: false }) programs?: string[];
  /** Ids in the order of the panel list. */
  @property({ attribute: false }) order: string[] = [];
  private _card?: CardElement;
  private _key = "";

  /** The card needs its configuration before its first render, and again only when it changes (it reloads its previews then). */
  willUpdate(): void {
    this._card ??= document.createElement("weekly-planner-card") as CardElement;
    const config = overviewConfig(this.programs, this.order);
    const key = JSON.stringify(config);
    if (key !== this._key) {
      this._key = key;
      this._card.setConfig(config);
    }
    this._card.hass = this.hass;
  }

  render() {
    return html`${this._card}`;
  }
}

declare global { interface HTMLElementTagNameMap { "wp-overview": WpOverview } }
