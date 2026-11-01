import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadServiceNames, serviceFields, startData, missingFields, serviceLabel, serviceDescription, servicesFor } from "../services";
import { runningVersion, shouldReload, reloadIfOutdated } from "../update";
import { WpDayBar, sunDir, sunTip, nowTip } from "../components/day-bar";
import { flat } from "./helpers/tpl";

afterEach(() => vi.unstubAllGlobals());

describe("loadServiceNames", () => {
  it("loads each domain once, keeps the last translator, and retries after a failure", async () => {
    const load = vi.fn(async (_k: string, _d: string) => (() => "") as any);
    const hass: any = { loadBackendTranslation: load };
    expect(await loadServiceNames(hass, ["svcdom1", "svcdom1", "svcdom2"])).toBe(true);
    expect(load).toHaveBeenCalledTimes(2);
    expect(await loadServiceNames(hass, ["svcdom1"])).toBe(false);
    expect(await loadServiceNames({} as any, ["svcdom3"])).toBe(false);
    const failing: any = { loadBackendTranslation: vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValue(undefined) };
    expect(await loadServiceNames(failing, ["svcdom4"])).toBe(false);
    expect(await loadServiceNames(failing, ["svcdom4"])).toBe(true);
  });
});

describe("service fields of a device", () => {
  const hass: any = {
    states: { "climate.t": { entity_id: "climate.t", state: "heat", attributes: { supported_features: 1, temperature: 21.5, hvac_modes: ["off", "heat"] } },
      "cover.c": { entity_id: "cover.c", state: "open", attributes: { supported_features: 4, modes: ["a"] } } },
    services: {
      climate: {
        set_temperature: { name: "Set temperature", description: "d", target: { entity: { domain: "climate" } }, fields: {
          temperature: { required: true, selector: { number: { min: 5 } } },
          hvac_mode: { selector: { state: {} } },
          advanced_thing: { advanced: true, selector: { text: {} } },
          entity_id: { selector: { entity: {} } },
          target_temp_high: { selector: { number: {} }, filter: { supported_features: [2] } },
          grouped: { fields: { inner: { selector: { boolean: {} }, default: true, name: "Inner" } } },
        } },
        set_hvac_mode: { target: { entity: { domain: "climate" } }, fields: { hvac_mode: { selector: { state: {} } } } },
        raw: { target: { entity: { domain: "climate" } }, fields: { cmd: { required: true, selector: { text: {} } } } },
        optional: { target: { entity: { domain: "climate" } }, fields: { a: { selector: { number: {} } }, b: { selector: { number: {} } } } },
      },
      cover: { set_position: { target: { entity: [{ domain: "cover", supported_features: [4] }] }, fields: { position: { required: true, selector: { number: { min: 0, max: 100 } } },
        tilt: { selector: { number: {} }, filter: { attribute: { modes: ["zz"] } } } } },
        stop: { target: {} } },
      homeassistant: { turn_on: { target: {} } },
      light: { notarget: {} },
    },
  };
  it("hides advanced, target, unsupported and set-elsewhere fields; required first", () => {
    const fields = serviceFields(hass, "climate.set_temperature", "climate.t");
    expect(fields.map((f) => f.key)).toEqual(["temperature", "inner"]);
    expect(fields[1].default).toBe(true); expect(fields[1].label).toBe("Inner");
    expect(serviceFields(hass, "climate.set_hvac_mode", "climate.t")[0]).toMatchObject({ key: "hvac_mode", required: true });
    const opt = serviceFields(hass, "climate.optional", "climate.t");
    expect(opt[0].required).toBe(true); expect(opt[1].required).toBe(false);
    expect(serviceFields(hass, "cover.set_position", "cover.c").map((f) => f.key)).toEqual(["position"]);
    expect(serviceFields(hass, "nothing.here")).toEqual([]);
  });
  it("starts from usable values and lists what is missing", () => {
    expect(startData(hass, "climate.set_temperature", "climate.t")).toEqual({ temperature: 21.5 });
    expect(startData(hass, "cover.set_position", "cover.c")).toEqual({ position: 50 });
    hass.states["climate.t"].attributes.temperature = "x";
    expect(startData(hass, "climate.set_temperature", "climate.t")).toEqual({ temperature: 19 });
    expect(missingFields(hass, "climate.set_temperature", {}, "climate.t")).toHaveLength(1);
    expect(missingFields(hass, "climate.set_temperature", { temperature: 20 }, "climate.t")).toEqual([]);
    expect(missingFields(hass, "climate.set_temperature", {}, "climate.t", { temperature: { entity_id: "sensor.x" } })).toEqual([]);
    expect(missingFields(hass, "climate.set_temperature", {}, "climate.t", { temperature: { entity_id: "" } })).toHaveLength(1);
    expect(missingFields(hass, "climate.set_temperature", { temperature: "" }, "climate.t")).toHaveLength(1);
  });
  it("offers services by target filters, skipping technical, homeassistant and target-less ones", () => {
    const ids = servicesFor(hass, "climate.t").map((s) => s.id);
    expect(ids).toContain("climate.set_temperature"); expect(ids).not.toContain("climate.raw"); expect(ids).not.toContain("homeassistant.turn_on");
    expect(servicesFor(hass, "cover.c").map((s) => s.id)).toEqual(expect.arrayContaining(["cover.set_position", "cover.stop"]));
    hass.states["cover.c"].attributes.supported_features = 1;
    expect(servicesFor(hass, "cover.c").map((s) => s.id)).not.toContain("cover.set_position");
  });
  it("labels and describes services, falling back to readable names", () => {
    expect(serviceLabel(hass, "climate.set_temperature")).toBeTruthy();
    expect(serviceLabel(hass, "foo.bar_baz")).toBeTruthy();
    expect(serviceDescription(hass, "climate.set_temperature")).toBe("d");
    expect(serviceDescription(hass, "foo.bar")).toBe("");
  });
});

describe("update check", () => {
  it("reads the version from the bundle URL", () => {
    expect(runningVersion("https://x/y.js?v=1.2")).toBe("1.2");
    expect(runningVersion("https://x/y.js")).toBeNull();
    expect(runningVersion("not a url")).toBeNull();
    expect(typeof runningVersion()).not.toBe("undefined");
  });
  it("reloads only when both versions are known, differ, and not already reloaded", () => {
    expect(shouldReload("1", "2", null)).toBe(true);
    expect(shouldReload("1", "1", null)).toBe(false);
    expect(shouldReload("1", "2", "2")).toBe(false);
    expect(shouldReload(null, "2", null)).toBe(false);
    expect(shouldReload("1", undefined, null)).toBe(false);
  });
  it("reloadIfOutdated respects idleness and remembers the version", () => {
    expect(reloadIfOutdated("9", false)).toBe(false);
    expect(reloadIfOutdated("9", true)).toBe(false);
  });
});

describe("wp-day-bar", () => {
  beforeEach(() => vi.stubGlobal("ResizeObserver", undefined));
  const bar = (props: Record<string, unknown> = {}) => {
    const el = new WpDayBar() as any;
    Object.assign(el, { lang: "en", spans: [
      { start: 0, end: 480, color: "#00f", label: "Night" },
      { start: 480, end: 600, color: "#f00", label: "Morning peak with a long name", startSun: "up", startSpec: { sun: "sunrise", offset: -15 } },
      { start: 700, end: 700, color: "#0f0", label: "Shot", marker: true },
      { start: 720, end: 1000, color: "#ff0", label: "Day", ignored: "x", endSun: "down", endSpec: { sun: "sunset" } },
    ], ...props });
    return el;
  };
  it("helpers describe the sun and the time", () => {
    expect(sunDir(null)).toBeNull(); expect(sunDir({ time: "08:00" })).toBeNull();
    expect(sunDir({ sun: "dawn" })).toBe("up"); expect(sunDir({ sun: "dusk" })).toBe("down");
    expect(sunTip("en", null, 0)).toBe(""); expect(sunTip("en", { sun: "sunrise", offset: 30 }, 480)).toContain("+ 30 min");
    expect(sunTip("en", { sun: "sunset", offset: -5 }, 1000)).toContain("- 5 min");
    expect(nowTip("en", 600)).toContain("·");
  });
  it("renders spans, notches, hours, sun icons, markers and the now line", () => {
    const el = bar({ notches: true, showHours: true, now: 500 });
    el._width = 1000;
    const html = flat(el.render());
    expect(html).toContain("tick"); expect(html).toContain("nowline"); expect(html).toContain("mdi:weather-sunset-up");
    expect(html).toContain("mdi:weather-sunset-down"); expect(html).toContain("mktip"); expect(html).toContain("class=\"hours\"");
    expect(html).toContain("ignored");
  });
  it("only draws labels that fit, avoiding the now line, and none when thin", () => {
    const el = bar({ now: 590 }); el._width = 1440;
    const span = { start: 480, end: 600, label: "Morning" } as any;
    const box = el._labelBox(span);
    expect(box).not.toBeNull(); expect(box.width).toBeLessThan(100);
    el.now = 500; expect(el._labelBox(span)?.left).toBeGreaterThan(0);
    el.now = null; el._width = 100; expect(el._labelBox(span)).toBeNull();
    el._width = 0; expect(el._labelBox(span)).toBeNull();
    el._width = 1440; el.thin = true; expect(el._labelBox(span)).toBeNull();
  });
});
