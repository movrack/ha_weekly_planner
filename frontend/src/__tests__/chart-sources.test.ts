import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { sourceKind, sourceUnits, sourceColor, knownStates, stateIntervals, stateNumber, numericAxes, axisTicks, mergeSourceDays } from "../chart-sources";
import { entityHistories } from "../chart-history";
import { WpChartOptions } from "../components/chart-options";
import { WpChart } from "../components/chart";
import { WpSchedule } from "../components/schedule-dialog";
import { flat, handlers } from "./helpers/tpl";
const entity = (state: string, attributes: any = {}) => ({ state, attributes });
const hass = (): any => ({ language: "en", config: { time_zone: "UTC" }, states: {
  "sensor.temp": entity("20", { unit_of_measurement: "°C" }), "sensor.humidity": entity("55", { unit_of_measurement: "%" }),
  "sensor.watts": entity("300", { unit_of_measurement: "W" }), "sensor.volts": entity("220", { unit_of_measurement: "V" }),
  "binary_sensor.window": entity("off", { options: ["on", "off"] }),
} });
const source = (entity_id: string, kind: "numeric" | "states" = "numeric", states?: string[]) => ({ entity_id, kind, ...(states ? { states } : {}) });
const program = (): any => ({ id: "sources", revision: 1, entities: [{ entity_id: "sensor.temp", chart_sources: [] }], profiles: [{ id: "home", days: Array.from({length:7},()=>[]) }] });
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-01T12:00:00Z"));
  (globalThis as any).CustomEvent ??= class { constructor(public type: string, public detail: any) { this.detail = detail.detail; } };
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); });
describe("generic chart sources", () => {
  it("uses values and metadata, including unknown domains, without domain catalogues", () => {
    const h = hass(); h.states["custom.quantum"] = entity("unknown", { unit_of_measurement:"q" });
    h.states["custom.selector"] = entity("1", { options:["1","2"] });
    expect(sourceKind(h,"custom.quantum")).toBe("numeric"); expect(sourceKind(h,"custom.selector")).toBe("states");
    expect(sourceKind(h,"binary_sensor.window")).toBe("states"); expect(stateNumber("unknown")).toBeNull(); expect(stateNumber(" ")).toBeNull();
  });
  it("shares units, permits three scales and reports a fourth", () => {
    const h = hass(), sources = [source("sensor.temp"),source("sensor.humidity"),source("sensor.watts"),source("sensor.volts")];
    expect(sourceUnits(h,sources.slice(0,3),"°C")).toEqual(["°C","%","W"]);
    const a = numericAxes(h,sources,{}, {unit:"°C",lo:17,hi:22}); expect(a.axes).toHaveLength(3);expect(a.overflow).toBe(true);
    expect(sourceColor("sensor.temp")).not.toBe(sourceColor("sensor.humidity")); expect(axisTicks(0,1e12).length).toBeLessThanOrEqual(6);
  });
  it("keeps missing saved states and discovers current, metadata and history states", () => {
    const h = hass(); const s = source("binary_sensor.window","states",["saved_gone"]);
    expect(knownStates(h,s,[{t:1,s:"ajar",a:{}}])).toEqual(["ajar","off","on","saved_gone"]);
    delete h.states[s.entity_id];expect(knownStates(h,s)).toEqual(["saved_gone"]);
  });
  it("carries initial state, colours selected states and distinguishes neutral from missing", () => {
    const p = (t:number,s:string)=>({t,s,a:{}});
    expect(stateIntervals([p(-5,"on"),p(4,"off"),p(7,"unavailable")],["on"],0,10)).toEqual([
      {from:0,to:4,state:"on",selected:true,missing:false},{from:4,to:7,state:"off",selected:false,missing:false},
      {from:7,to:10,state:"unavailable",selected:false,missing:true},
    ]);
    expect(stateIntervals([p(5,"on")],["on"],0,10)[0].missing).toBe(true);
  });
});
describe("history cache", () => {
  it("batches sources, shares in-flight requests and keeps gaps instead of future history", async () => {
    const h=hass(); h.callWS=vi.fn(async (m:any)=>Object.fromEntries(m.entity_ids.map((id:string)=>[id,[{lu:1,s:"12",a:{}}]])));
    const a=entityHistories(h,["sensor.temp","sensor.humidity"],0,10000), b=entityHistories(h,["sensor.temp"],0,10000);
    expect((await a)["sensor.temp"]).toHaveLength(1);await b;expect(h.callWS).toHaveBeenCalledOnce();
    expect(await entityHistories(h,["sensor.temp"],Date.now()+1,Date.now()+1000)).toEqual({"sensor.temp":[]});
    expect(h.callWS).toHaveBeenCalledOnce();
  });
  it("returns every entity of a call even if the shared cache evicts early entries", async () => {
    const h=hass();h.callWS=vi.fn(async(m:any)=>Object.fromEntries(m.entity_ids.map((id:string)=>[id,[{lu:1,s:"1"}]])));
    const result=await entityHistories(h,Array.from({length:130},(_,i)=>`sensor.x${i}`),0,10000);
    expect(Object.values(result).every(points=>points.length===1)).toBe(true);expect(Object.keys(result)).toHaveLength(130);
  });
  it("isolates failed histories and retries rather than caching failure", async () => {
    const h=hass(),failed=vi.fn();h.callWS=vi.fn().mockRejectedValueOnce(Error()).mockResolvedValue({"sensor.temp":[]});
    expect(await entityHistories(h,["sensor.temp"],0,10000,failed)).toEqual({"sensor.temp":[]});
    expect(failed).toHaveBeenCalledWith("sensor.temp");await entityHistories(h,["sensor.temp"],0,10000);expect(h.callWS).toHaveBeenCalledTimes(2);
  });
});
const options=():any=>{const o:any=new WpChartOptions();o.hass=hass();o.program=program();o.entityId="sensor.temp";o.data={can_edit:true,read_only:false};o.mainUnit="°C";o.dispatchEvent=vi.fn();o.willUpdate();return o;};
describe("persisted options",()=>{
  it("starts collapsed, prevents duplicate/fourth-unit choices, and respects readonly",()=>{
    const o=options();expect(flat(o.render())).toContain('<details>');expect(flat(o.render())).not.toContain('<details open');
    o._draft=[source("sensor.humidity"),source("sensor.watts")];o._add("sensor.volts");expect(o._error).toContain("Three units");
    o._change=vi.fn();o._add("sensor.humidity");expect(o._change).not.toHaveBeenCalled();o.data.can_edit=false;o._add("binary_sensor.window");
    expect(flat(o.render())).not.toContain("wp-entity-picker");
  });
  it("rebuilds a save from fresh data and retries exactly once on revision conflict",async()=>{
    const o=options(),base=program();base.name="fresh";
    o.hass.callWS=vi.fn().mockResolvedValueOnce({can_edit:true,programs:[{...base,revision:2}]}).mockRejectedValueOnce({code:"conflict"})
      .mockResolvedValueOnce({can_edit:true,programs:[{...base,revision:3}]}).mockResolvedValueOnce({program:{...base,revision:4,entities:[{entity_id:o.entityId,chart_sources:[source("sensor.humidity")]}]}});
    o._change([source("sensor.humidity")]);await o._queue;
    expect(o.hass.callWS.mock.calls[3][0].program.revision).toBe(3);expect(o.hass.callWS.mock.calls[3][0].program.name).toBe("fresh");
    expect(o._sources).toEqual([source("sensor.humidity")]);expect(o._done).toBe(true);
  });
  it("keeps pending writes attached to the originating device without leaking UI status",async()=>{
    const o=options(),base=program();let resolve!:(v:any)=>void;
    o.hass.callWS=vi.fn().mockImplementationOnce(()=>new Promise(r=>resolve=r)).mockResolvedValueOnce({program:{...base,revision:2}});
    o._change([source("sensor.humidity")]);await Promise.resolve();
    o.entityId="sensor.other";o.willUpdate();resolve({can_edit:true,programs:[base]});await o._queue;
    expect(o._draft).toBeNull();expect(o._saved).toBeNull();expect(o._saving).toBe(0);expect(o._done).toBe(false);
    expect(o.hass.callWS.mock.calls[1][0].program.entities[0].entity_id).toBe("sensor.temp");
  });
});


describe("rendered sources on a shared timeline", () => {
  const chart = (): any => {
    const c: any = new WpChart(); c.date = "2026-11-01"; c.entityId = "climate.main"; c.hass = hass();
    c.hass.states[c.entityId] = entity("heat", { temperature:19, current_temperature:18 });
    c.program = program(); c.program.entities = [{ entity_id:c.entityId, chart_sources:[source("sensor.humidity"),source("sensor.watts"),source("binary_sensor.window","states",["on"])] }];
    c.data = { labels:[], status:{} }; c._loaded = {hist:[{t:Date.parse(c.date+"T00:00:00Z"),s:"heat",a:{temperature:19,current_temperature:18}}],log:[],sent:[]};
    c._model = c._build(c._loaded);
    const start = Date.parse(c.date+"T00:00:00Z");
    c._sourceHistory = {"sensor.humidity":[{t:start,s:"45",a:{}},{t:start+3600000,s:"60",a:{}}],
      "sensor.watts":[{t:start,s:"300",a:{}}],"binary_sensor.window":[{t:start,s:"on",a:{}},{t:start+7200000,s:"off",a:{}}]};
    return c;
  };
  it("offers the chart-options panel only in the schedule window, not on the dashboard card", () => {
    const c = chart();
    expect(c.showOptions).toBe(false);
    expect(flat(c.render())).not.toContain("wp-chart-options");
    c.showOptions = true;
    expect(flat(c.render())).toContain("wp-chart-options");
  });
  it("uses separate bounds for Celsius, percent and watts, and aligns the source state row", () => {
    const c=chart(),conf=c._plotConfig(c._model);
    expect(conf.axes.map((a:any)=>a.unit)).toEqual(["°C","%","W"]);
    expect(conf.axes[1].lo).toBe(0);expect(conf.axes[1].hi).toBe(100);expect(conf.axes[2].lo).toBe(299);
    const output=flat(c._renderChart(c._model));
    expect(output.match(/class="source-axis"/g)).toHaveLength(2);
    expect(output.match(/class="source-line"/g)).toHaveLength(2);
    expect(output).toContain(sourceColor("binary_sensor.window","on"));
    expect(flat(c._legend(c._model))).toContain("Other states");expect(output).not.toContain("More than three units");
  });
  it("does not carry prior-day values or states through an empty or failed next day", () => {
    const points=mergeSourceDays([{start:0,end:100,history:[{t:-1,s:"on",a:{}}]}, {start:100,end:200,history:[]}]);
    expect(points).toEqual([{t:0,s:"on",a:{}},{t:100,s:"unknown",a:{}}]);
    expect(stateIntervals(points,["on"],0,200).slice(-1)[0]).toEqual({from:100,to:200,state:"unknown",selected:false,missing:true});
  });
  it("never draws an external real curve into a future visible window while loading", () => {
    const c=chart();c._zoom={from:1440,to:2880};
    expect(flat(c._renderChart(c._model))).not.toContain('class="source-line"');
    c._sourceHistory={};delete c.hass.states["sensor.watts"];
    expect(c._plotConfig(c._model).axes.map((a:any)=>a.unit)).not.toContain("W");
  });
});

describe("chart source aliases #41", () => {
  it("saves a trimmed alias, removes a blank alias and respects readonly", async () => {
    const o = options(), base = program();
    base.entities[0].chart_sources = [source("sensor.humidity")]; o.program = base;
    o.hass.callWS = vi.fn(async (m: any) => m.type === "weekly_planner/get"
      ? { can_edit: true, programs: [base] } : { program: { ...m.program, revision: 2 } });
    o._alias(o._sources[0], "  Office humidity  "); await o._queue;
    expect(o._sources[0].alias).toBe("Office humidity");
    expect(flat(o.render())).toContain("Display name");
    o._alias(o._sources[0], " "); await o._queue;
    expect(o._sources[0]).not.toHaveProperty("alias");
    o.data.read_only = true; const count = o.hass.callWS.mock.calls.length;
    o._alias(o._sources[0], "Blocked"); await o._queue;
    expect(o.hass.callWS).toHaveBeenCalledTimes(count);
  });
  it("uses aliases in numeric and state legends, bands and titles with HA fallback", () => {
    const c: any = new WpChart(); c.hass = hass(); c.date = "2026-11-01";
    c.entityId = "sensor.temp"; c.data = { labels: [], status: {} }; c.program = program();
    c.program.entities[0].chart_sources = [
      { ...source("sensor.humidity"), alias: "Office humidity" },
      { ...source("binary_sensor.window", "states", ["on"]), alias: "Office window" },
    ];
    c._sourceHistory = { "sensor.humidity": [{t:Date.parse(c.date+"T00:00:00Z"),s:"50",a:{}}],
      "binary_sensor.window": [{t:Date.parse(c.date+"T00:00:00Z"),s:"on",a:{}}] };
    c._model = c._build({hist:[], log:[], sent:[]});
    expect(flat(c._legend(c._model))).toContain("Office humidity");
    const out = flat(c._renderChart(c._model));
    expect(out).toContain("Office humidity · %</title>");
    expect(out).toContain("Office window · on</title>");
    expect(out).toContain('aria-label=Office window');
    delete c.program.entities[0].chart_sources[0].alias;
    c.hass.states["sensor.humidity"].attributes.friendly_name = "HA humidity";
    expect(flat(c._legend(c._model))).toContain("HA humidity");
  });
});


describe("alias save through rendered options and websocket round trip #41", () => {
  it("sends the input alias, rereads it and updates chart sources immediately", async () => {
    const o = options(); let stored = program();
    stored.entities[0].chart_sources = [source("sensor.humidity")]; o.program = stored;
    o.hass.callWS = vi.fn(async (message: any) => {
      if (message.type === "weekly_planner/get") return {can_edit:true, programs:[structuredClone(stored)]};
      stored = {...message.program, revision:stored.revision + 1}; return {program:structuredClone(stored)};
    });
    const schedule: any = new WpSchedule(); schedule.hass=o.hass; schedule.scope={kind:"program",programId:stored.id};
    schedule.data={programs:[stored],status:{},labels:[],can_edit:true};
    o.dispatchEvent = (event: any) => { handlers(schedule._renderChartOptions()).find(h => h.event === "chart-sources-saved")!.fn(event); return true; };
    handlers(o.render()).find(h => h.event === "change" && h.before.includes('maxlength="60"'))!.fn({target:{value:"  Office humidity  "}});
    await o._queue;
    const reread = await o.hass.callWS({type:"weekly_planner/get"});
    expect(reread.programs[0].entities[0].chart_sources[0].alias).toBe("Office humidity");
    expect(schedule._chartOwner().entities[0].chart_sources[0].alias).toBe("Office humidity");
    expect(o.hass.callWS.mock.calls.map((call:any) => call[0].type)).toEqual(["weekly_planner/get","weekly_planner/program/save","weekly_planner/get"]);
  });
  it("explains an outdated alias schema while preserving other server errors", async () => {
    const o=options();o.program.entities[0].chart_sources=[source("sensor.humidity")];
    o.hass.callWS=vi.fn().mockResolvedValueOnce({can_edit:true,programs:[o.program]}).mockRejectedValueOnce({code:"invalid",message:"extra keys not allowed @ data['alias']"});
    o._alias(o._sources[0],"Office");await o._queue;expect(o._error).toContain("Restart Home Assistant");
    o.hass.callWS=vi.fn().mockRejectedValue({code:"unauthorized",message:"Administrator access required"});
    o._alias(o._sources[0],"Office");await o._queue;expect(o._error).toContain("Administrator access required");expect(o._error).not.toContain("Restart");
  });
  it("shares existing histories and primary unit without a request", () => {
    const c:any=new WpChart(); c.hass=hass();c.program=program();c.entityId="sensor.temp";
    c.hass.callWS=vi.fn();
    c._sourceHistory={"binary_sensor.window":[{t:0,s:"historic",a:{}}]}; c.dispatchEvent=vi.fn();
    c.updated(new Map([["_sourceHistory",null]]));
    const context=c.dispatchEvent.mock.calls[0][0].detail;
    expect(context.histories).toBe(c._sourceHistory); expect(context.mainUnit).toBe("°C");
    const s:any=new WpSchedule();s.hass=c.hass;s.data={programs:[c.program],status:{}};s.scope={kind:"program",programId:c.program.id};s._chartContext=context;
    const template=s._renderChartOptions();expect(template.values).toContain(c._sourceHistory);
    c.program.entities.push({entity_id:"sensor.other"});s.scope={kind:"device",entityId:"sensor.other"};expect(s._renderChartOptions().values).not.toContain(c._sourceHistory);
    expect(c.hass.callWS).not.toHaveBeenCalled();
  });
});
