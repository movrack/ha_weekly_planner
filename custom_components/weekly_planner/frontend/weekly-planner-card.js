// Weekly Planner card — loading prototype (replaced by the Lit bundle).
const TAG = "weekly-planner-card";

class WeeklyPlannerCard extends HTMLElement {
  setConfig(config) {
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._root) {
      this._root = this.attachShadow({ mode: "open" });
      this._root.innerHTML = `<ha-card header="Weekly Planner"><div class="card-content">OK</div></ha-card>`;
    }
  }

  getCardSize() {
    return 2;
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, WeeklyPlannerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: TAG,
    name: "Weekly Planner",
    description: "Weekly schedules for your entities",
  });
}
