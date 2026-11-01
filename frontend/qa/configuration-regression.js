/**
 * Browser regression for the configuration review. Run on the local HA test page after loading
 * the current card bundle: await configurationRegression(). Uses only synthetic drafts; never saves
 * a program, activates a mode or calls a device service. A real DOM is required (not the Lit SSR shim).
 */
async function configurationRegression() {
  const app = document.querySelector("home-assistant");
  if (!app?.hass || !customElements.get("wp-program-editor")) throw new Error("Load HA and the current card bundle first");
  const hass = app.hass;
  const results = [];
  const check = (condition, name) => { if (!condition) throw new Error(name); results.push(name); };
  const host = document.createElement("section");
  host.style.cssText = "position:fixed;inset:0;overflow:auto;z-index:99999;background:var(--card-background-color);padding:12px";
  app.shadowRoot.append(host);
  const day = () => Array.from({ length: 7 }, () => []);
  const target = Object.keys(hass.states).find((id) => id.startsWith("climate."));
  if (!target) throw new Error("The local test instance needs a climate entity");
  const program = {
    id: "qa_selects", revision: 1, name: "QA selects", priority: 10, enabled: false, reapply: false,
    conditions: [], entities: [{ entity_id: target, default_label: null, label_overrides: {} }],
    active_profile: "home", profiles: [
      { id: "home", name: "Maison", days: day() }, { id: "holiday", name: "Vacances", days: day() },
    ],
  };
  const data = { programs: [program], labels: [], status: { qa_selects: { active_profile: "holiday" } }, can_edit: true, read_only: false, vacation: false };
  const passiveWrites = [];
  const readonlyHass = { ...hass, callWS: async (msg) => {
    if (/weekly_planner\/(?:program|label)\//.test(msg.type)) { passiveWrites.push(msg); throw new Error("QA forbids writes"); }
    return hass.callWS(msg);
  }, callService: async () => { throw new Error("QA forbids device commands"); } };
  const editor = document.createElement("wp-program-editor");
  editor.hass = readonlyHass; editor.data = data; editor.program = program; editor.embedded = true;
  host.append(editor);
  const picker = document.createElement("wp-action-picker");
  picker.hass = readonlyHass; picker.entityId = target;
  let events = 0;
  picker.addEventListener("action-change", () => events++);
  try {
    await editor.updateComplete;
    editor._tab = "seasons";
    await editor.updateComplete;
    check(editor.shadowRoot.querySelector("#mode-active").value === "holiday", "manual mode displays stored second option");
    check(editor.shadowRoot.querySelector(".mode-live").textContent.includes("Appliquer") || editor.shadowRoot.querySelector(".mode-live").textContent.includes("Apply"), "immediate mode activation is explained separately");
    editor._patch({ mode_source: { entity_id: "sensor.qa_mode", mappings: { Maison: "home", Vacances: "holiday" } } });
    editor._associationsOpen = true;
    await editor.updateComplete;
    check(editor.shadowRoot.querySelector("#mode-target-1").value === "holiday", "association displays stored second mode");
    editor._tab = "general"; await editor.updateComplete;
    editor._tab = "seasons"; await editor.updateComplete;
    check(editor.shadowRoot.querySelector("#mode-target-1").value === "holiday", "association survives tab navigation");
    editor._patch({ profiles: [...editor._p.profiles].reverse() }); await editor.updateComplete;
    check(editor.shadowRoot.querySelector("#mode-target-0").value === "home", "association survives dynamic option reorder");
    editor._associationsOpen = false; await editor.updateComplete;
    check(!editor.shadowRoot.querySelector(".mode-associations").open, "associations collapse without deleting the draft");
    check(editor._p.mode_source.mappings.Vacances === "holiday", "collapsed associations retain values");
    host.append(picker);
    picker.action = { kind: "service", service: "climate.set_temperature", data_sources: { temperature: { entity_id: target, attribute: "temperature", type: "number" } } };
    await picker.updateComplete;
    check(picker.shadowRoot.querySelector("#attribute-temperature").value === "temperature", "source attribute displays stored value on first render");
    picker.action = { kind: "service", service: "climate.set_temperature", data: { temperature: 19 } }; await picker.updateComplete;
    picker.action = { kind: "service", service: "climate.set_temperature", data_sources: { temperature: { entity_id: target, attribute: "temperature", type: "number" } } }; await picker.updateComplete;
    check(picker.shadowRoot.querySelector("#attribute-temperature").value === "temperature", "source attribute survives reopening");
    picker.action = { ...picker.action, data_sources: { temperature: { entity_id: "sensor.qa_missing", attribute: "saved_attribute", type: "number" } } }; await picker.updateComplete;
    check(picker.shadowRoot.querySelector("#attribute-temperature").value === "saved_attribute", "missing source attributes remain selected");
    picker.action = { ...picker.action, data_sources: { temperature: { entity_id: target, type: "number" } } }; await picker.updateComplete;
    check(picker.shadowRoot.querySelector("#attribute-temperature").value === "", "entity state remains a selectable source");
    check(events === 0 && passiveWrites.length === 0, "passive renders do not emit edits or send writes");
    return { passed: results.length, checks: results };
  } finally { host.remove(); }
}
