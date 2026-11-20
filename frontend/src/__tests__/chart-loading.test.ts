import { describe, expect, it, vi } from "vitest";
import { chart, dayStart, useChartDay } from "./helpers/chart-component";

useChartDay();


const ws = (answers: { history?: any; log?: any; journal?: any }) => vi.fn(async (m: any) => {
  const a = m.type === "history/history_during_period" ? answers.history : m.type === "logbook/get_events" ? answers.log : answers.journal;
  if (a instanceof Error) throw a;
  return a;
});

describe("chart history loading", () => {
  it("reads every shape of history row, of logbook entry and of journal segment", async () => {
    const c = chart();
    const t0 = dayStart / 1000;
    c.hass.callWS = ws({
      history: { "climate.room": [
        { s: "heat", a: { temperature: 20 }, lu: t0 + 60 },
        { s: "off", lc: t0 + 120 },
        { state: "cool", attributes: { temperature: 18 }, last_updated_ts: t0 + 180 },
        { s: "idle", last_updated: "2026-11-02T00:04:00Z" },
        { s: "broken", last_updated: "not a date" },
        { lu: t0 + 300 },
      ] },
      log: [
        { when: t0 + 100, state: "on", context_user_id: "u" },
        { when: (t0 + 200) * 1000, state: "off", context_event_type: "automation_triggered" },
        { when: t0 + 300, state: "on", context_domain: "x" }, { when: t0 + 310, state: "on", context_service: "turn_on" },
        { when: t0 + 320, state: "on", context_entity_id: "e" }, { when: t0 + 330, state: "on", context_message: "m" },
        { when: "nope", state: "on" }, { when: t0 + 400 },
      ],
      journal: { segments: [{ entity_id: "climate.room", at: "2026-11-02T08:00:00Z" }, { entity_id: "other", at: "2026-11-02T09:00:00Z" }] },
    });
    const { loaded, failed } = await c._loadAt("2026-11-02");
    expect(failed).toBe(false);
    expect(loaded.hist.map((p: any) => [p.t / 1000 - t0, p.s])).toEqual([[60, "heat"], [120, "off"], [180, "cool"], [240, "idle"], [300, ""]]);
    expect(loaded.hist[1].a).toEqual({ temperature: 20 }); // attributes carried over
    expect(loaded.hist[2].a).toEqual({ temperature: 20 }); // only `a` carries attributes in a history row
    expect(loaded.log.map((e: any) => [e.user, e.context])).toEqual([[true, false], [false, true], [false, true], [false, true], [false, true], [false, true], [false, false]]);
    expect(loaded.log[1].t).toBe((t0 + 200) * 1000); // milliseconds are kept
    expect(loaded.log.at(-1).state).toBe("");
    expect(loaded.sent).toEqual([Date.parse("2026-11-02T08:00:00Z")]);
  });
  it("anything that is not a list gives nothing; the logbook and the journal may fail alone", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": "oops" }, log: new Error("no logbook"), journal: new Error("no journal") });
    const { loaded, failed } = await c._loadAt("2026-11-02");
    expect(failed).toBe(false);
    expect(loaded).toEqual({ hist: [], log: [], sent: [] });
    c.hass.callWS = ws({ history: { "climate.room": [] }, log: { not: "a list" }, journal: {} });
    expect((await chart({ hass: c.hass })._loadAt("2026-11-01")).loaded.log).toEqual([]);
  });
  it("a failing history marks the day as failed, and is not kept in the cache", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: new Error("down"), log: [], journal: { segments: [] } });
    expect((await c._loadAt("2026-10-30")).failed).toBe(true);
    c.hass.callWS = ws({ history: { "climate.room": [{ s: "heat", lu: 1 }] }, log: [], journal: { segments: [] } });
    const again = await c._loadAt("2026-10-30");
    expect(again.failed).toBe(false);
  });
  it("a closed day is fetched once, a running day again after a minute, a future day never", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": [] }, log: [], journal: { segments: [] } });
    const count = () => c.hass.callWS.mock.calls.filter((x: any) => x[0].type === "history/history_during_period").length;
    await c._loadAt("2026-10-29"); await c._loadAt("2026-10-29");
    expect(count()).toBe(1);
    await c._loadAt("2026-11-02"); await c._loadAt("2026-11-02");
    expect(count()).toBe(2);
    vi.setSystemTime(dayStart + 12 * 3600000 + 61_000);
    await c._loadAt("2026-11-02");
    expect(count()).toBe(3);
    const future = await c._loadAt("2026-11-05");
    expect(future.loaded).toEqual({ hist: [], log: [], sent: [] });
    expect(count()).toBe(3);
  });
  it("the cache keeps 64 entries, the oldest go first, and a hit is refreshed", async () => {
    const c = chart();
    c.hass.connection = {};
    c.hass.callWS = ws({ history: {}, log: [], journal: { segments: [] } });
    const count = () => c.hass.callWS.mock.calls.filter((x: any) => x[0].type === "history/history_during_period").length;
    for (let i = 0; i < 70; i++) { c.entityId = `sensor.e${i}`; await c._loadAt("2026-10-20"); }
    expect(count()).toBe(70);
    c.entityId = "sensor.e69"; await c._loadAt("2026-10-20"); // recent: still there
    expect(count()).toBe(70);
    c.entityId = "sensor.e0"; await c._loadAt("2026-10-20"); // oldest: evicted
    expect(count()).toBe(71);
  });
  it("loads the days of the window, keeps the sources and the failures, ignores a stale answer", async () => {
    const c = chart();
    c.hass.callWS = ws({ history: { "climate.room": [{ s: "heat", lu: dayStart / 1000 + 60 }] }, log: [], journal: { segments: [] } });
    c.slots = [];
    await c._load();
    expect(c._loaded.hist).toHaveLength(1);
    expect(c._failed).toBe(false);
    expect(c._previewFailed).toBe(false);
    const callWS = c.hass.callWS;
    vi.setSystemTime(dayStart + 12 * 3600000 + 61_000); // the running day is asked again
    c.hass.callWS = ws({ history: { "climate.room": [{ s: "heat", lu: dayStart / 1000 + 60 }, { s: "off", lu: dayStart / 1000 + 120 }] }, log: [], journal: { segments: [] } });
    const stale = c._load();
    c._token++; // a newer load has started
    await stale;
    expect(c._loaded.hist).toHaveLength(1); // the answer of the stale load is dropped
    c.hass.callWS = callWS;
    const calls = callWS.mock.calls.length;
    c.hass = undefined;
    await c._load();
    expect(callWS.mock.calls.length).toBe(calls); // nothing is asked without hass
  });
});

