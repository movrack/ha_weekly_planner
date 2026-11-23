import { describe, expect, it } from "vitest";
import { t } from "../i18n";
import { WpRadialDay, radialHoverTarget } from "../components/radial-day";
import { flat } from "./helpers/tpl";
import { attrOf } from "./helpers/planner-card";

describe("radial day: sun icons, now icon, open", () => {
  const mk = async () => (await import("../components/radial-day")).WpRadialDay;
  const span = (over: any = {}) => ({ start: 360, end: 720, color: "#00f", label: "Open", ...over });
  it("start and end sun icons carry the side, the position and the tip with the time before the delay", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.lang = "en";
    el.spans = [span({ startSun: "up", startSpec: { sun: "sunrise", random_minutes: 10 }, startBase: 350, endSun: "down", endSpec: { sun: "sunset" } })];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("text=Sunrise · 5:50 am + up to 10 min at random");
    expect(html).toContain("text=Sunset · 12 pm");
    expect(html).toContain("icon=mdi:weather-sunset-up");
    expect(html).toContain("icon=mdi:weather-sunset-down");
    expect(html.match(/class="icon"/g)).toHaveLength(2);
    expect(html).toContain("left:85%;top:50%");
    expect(html).toContain("left:50%;top:85%");
    el.spans = [span({ startSun: "down", startSpec: { sun: "sunset" }, endSun: "up", endSpec: { sun: "sunrise" } })];
    const swapped = flat(el.render());
    expect(swapped.indexOf("mdi:weather-sunset-down")).toBeLessThan(swapped.indexOf("mdi:weather-sunset-up"));
  });
  it("a paused span is drawn as a faint arc under a striped (masked) one; a running one is a single plain arc", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.lang = "en";
    el.spans = [span({ paused: true })];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("wp-paused-stripes");
    expect(html).toContain('class=paused-ground');
    expect(html).toContain("mask=url(#wp-paused-mask)");
    el.spans = [span()];
    const plain = flat(el.render());
    expect(plain).not.toContain("wp-paused-mask");
    expect(plain).not.toContain("paused-ground");
  });
  it("no end icon at 24:00 or for a one-shot; no start icon without a sun start", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.spans = [span({ end: 1440, endSun: "down", endSpec: { sun: "sunset" } })];
    expect(flat(el.render())).not.toContain("weather-sunset");
    el.spans = [span({ end: 360, marker: true, endSun: "down", endSpec: { sun: "sunset" } })];
    expect(flat(el.render())).not.toContain("weather-sunset");
  });
  it("the now icon names the device; passive dials do not open", async () => {
    const WpRadialDay = await mk();
    const el = new WpRadialDay() as any;
    el.lang = "en"; el.now = 360; el.deviceName = "Shutter";
    expect(flat(el.render()).replace(/\s+/g, " ")).toContain(`label=${t("en", "now")} · 6 am, Shutter ?no-tab=`);
    expect(attrOf(el.render(), /\?no-tab=$/)).toEqual([true]);
    el.deviceName = "";
    expect(flat(el.render()).replace(/\s+/g, " ")).toContain(`label=${t("en", "now")} · 6 am ?no-tab=`);
    const seen: any[] = [];
    el.dispatchEvent = (e: any) => { seen.push(e); return true; };
    el._open();
    expect(seen).toHaveLength(1);
    expect([seen[0].type, seen[0].bubbles, seen[0].composed]).toEqual(["open-day", true, true]);
    el.passive = true;
    el._open();
    expect(seen).toHaveLength(1);
  });
});

describe("radial day: hit test", () => {
  const at = async (turn: number, r: number, rect = { left: 0, top: 0, width: 320 }) => {
    const { radialHoverTarget } = await import("../components/radial-day");
    const a = turn * Math.PI * 2 - Math.PI / 2;
    const s = rect.width / 320;
    return { hit: (spans: any[], now: number | null, double = false) => radialHoverTarget(spans, now, double, rect.left + (r * Math.cos(a)) * s + 160 * s, rect.top + (r * Math.sin(a)) * s + 160 * s, rect) };
  };
  const span = (start: number, end: number, over: any = {}) => ({ start, end, color: "#0", label: "x", ...over });
  it("single dial: only the ring is a target, with 4 px around the track", async () => {
    for (const [r, expected] of [[90.1, 0], [89.9, null], [133.9, 0], [134.1, null], [112, 0], [0, null], [160, null]] as const) {
      expect((await at(0.375, r)).hit([span(0, 1440)], null)).toBe(expected);
    }
  });
  it("single dial: a span from its start to just before its end, the last drawn wins, ignored ones are skipped", async () => {
    const spans = [span(360, 720), span(500, 600), span(500, 600, { ignored: "x" })];
    const h = async (min: number) => (await at(min / 1440, 112)).hit(spans, null);
    expect(await h(359)).toBeNull();
    expect(await h(361)).toBe(0);
    expect(await h(550)).toBe(1);
    expect(await h(719)).toBe(0);
    expect(await h(721)).toBeNull();
    expect((await at(0.99, 112)).hit([span(0, 1440, { ignored: "x" })], null)).toBeNull();
  });
  it("the now mark wins within 8 px of the line, also across midnight; scaled and moved rectangles give the same answers", async () => {
    const spans = [span(0, 1440)];
    const rect = { left: 100, top: 40, width: 640 };
    for (const r of [{ left: 0, top: 0, width: 320 }, rect]) {
      const h = async (min: number, now: number) => (await at(min / 1440, 112, r)).hit(spans, now);
      expect(await h(535, 540)).toBe("now"); // 5 minutes: 2.4 px on the 320 dial, 4.9 px at twice the size
      expect(await h(570, 540)).toBe(0); // 30 minutes: 14.7 px
    }
    expect(await (await at(1438 / 1440, 112)).hit(spans, 5)).toBe("now");
    expect(await (await at(25 / 1440, 112)).hit(spans, 5)).toBe(0);
    // 10 minutes = 4.9 px on the dial, 9.8 px at twice the size
    expect(await (await at(550 / 1440, 112, rect)).hit(spans, 540)).toBe(0);
    expect(await (await at(550 / 1440, 112)).hit(spans, 540)).toBe("now");
    expect(await (await at(550 / 1440, 112)).hit(spans, null)).toBe(0);
  });
  it("a one-shot is a target within 8 px, not inside the stretch rule", async () => {
    const shot = [span(540, 540, { marker: true })];
    expect(await (await at(550 / 1440, 112)).hit(shot, null)).toBe(0);
    expect(await (await at(530 / 1440, 112)).hit(shot, null)).toBe(0);
    expect(await (await at(570 / 1440, 112)).hit(shot, null)).toBeNull(); // 14.7 px
    expect(await (await at(540 / 1440, 112)).hit([span(540, 1440, { marker: true })], null)).toBe(0);
    expect(await (await at(900 / 1440, 112)).hit([span(540, 1440, { marker: true })], null)).toBeNull(); // not a stretch
  });
  it("double dial: the inner ring is the morning, the outer the afternoon; the now mark only on its own ring", async () => {
    const spans = [span(100, 200), span(850, 950)];
    const inner = await at(180 / 720, 78);
    const outer = await at(180 / 720, 112);
    expect(inner.hit(spans, null, true)).toBe(0);
    expect(outer.hit(spans, null, true)).toBe(1);
    expect(inner.hit([span(0, 1440)], 180, true)).toBe("now");
    expect(outer.hit([span(0, 1440)], 180, true)).toBe(0);
    expect(inner.hit([span(0, 1440)], 900, true)).toBe(0);
    expect(outer.hit([span(0, 1440)], 900, true)).toBe("now");
    expect(outer.hit([span(0, 1440)], 719, true)).toBe(0);
    expect(outer.hit([span(0, 1440)], 720 + 180, true)).toBe("now");
    for (const [r, expected] of [[62.1, 0], [61.9, null], [93.9, 0], [96.1, 1], [127.9, 1], [128.1, null]] as const) {
      expect((await at(0.3, r)).hit([span(0, 720), span(720, 1440)], null, true)).toBe(expected);
    }
    expect(outer.hit([span(0, 1440)], 179, true)).toBe(0); // 1 minute from 180 on the other half
  });
});

describe("radial day: drawing", () => {
  const mk = async (props: any = {}) => {
    const { WpRadialDay } = await import("../components/radial-day");
    const el = new WpRadialDay() as any;
    Object.assign(el, { lang: "en", ...props });
    return el;
  };
  const norm = (el: any) => flat(el.render()).replace(/\s+/g, " ");
  it("single dial: one track, a stretch as a dashed arc, ticks every hour, four hours written", async () => {
    const el = await mk({ spans: [{ start: 360, end: 720, color: "#00f", label: "Open" }] });
    const html = norm(el);
    expect(html.match(/class="track"/g)).toHaveLength(1);
    expect(html).toContain('class="track" cx="160" cy="160" r=112 fill="none" stroke=var(--divider-color, rgba(127, 127, 127, 0.2)) stroke-width=36');
    expect(html).toContain('stroke=#00f stroke-width=36 pathLength="100" stroke-dasharray="25 75" stroke-dashoffset=-25 transform="rotate(-90 160 160)"');
    expect(html.match(/class="tick"/g)).toHaveLength(24);
    const ticks = [...html.matchAll(/class="tick" x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+)/g)].map((m) => Math.hypot(+m[1] - +m[3], +m[2] - +m[4]));
    expect(ticks.map((l) => Math.round(l))).toEqual(Array.from({ length: 24 }, (_, h) => (h % 6 === 0 ? 36 : 6)));
    expect([...html.matchAll(/class="hour" x=([\d.]+) y=([\d.]+) text-anchor="middle">(\d+)</g)].map((m) => [Math.round(+m[1]), Math.round(+m[2]), m[3]])).toEqual([
      [160, 20, "00"], [305, 165, "06"], [160, 310, "12"], [15, 165, "18"]]);
    expect(html).not.toContain('class="rings"');
    expect(html).toContain('<text x="160" y="156" text-anchor="middle">24 h</text>');
    expect(html).toContain(`<text x="160" y="180" text-anchor="middle">${t("en", "hours")}</text>`);
    expect(html).toContain(`<span><i style=background:#00f></i>${t("en", "range_from_to", { from: "6 am", to: "12 pm" })} · Open</span>`);
    expect(html).not.toContain(t("en", "rest_of_time"));
    expect(html).not.toContain("<line x1");
  });
  it("a one-shot is a dot of radius 7 on the ring and a time in the legend", async () => {
    const html = norm(await mk({ spans: [{ start: 540, end: 540, color: "#0f0", label: "Shot", marker: true }] }));
    const m = /<circle cx=([\d.]+) cy=([\d.]+) r="7" fill=#0f0 stroke="var\(--primary-text-color\)" stroke-width="2"/.exec(html)!;
    expect([Math.round(+m[1]), Math.round(+m[2])]).toEqual([239, 239]);
    expect(html).toContain("<i style=background:#0f0></i>9 am · Shot</span>");
    expect(html).not.toContain("pathLength");
  });
  it("double dial: two tracks (78 and 112, width 24), 12 ticks a ring, the hours of each half, the rings text", async () => {
    const html = norm(await mk({ double: true, spans: [{ start: 360, end: 1080, color: "#00f", label: "Open" }] }));
    expect([...html.matchAll(/class="track" cx="160" cy="160" r=(\d+) fill="none" stroke=var\(--divider-color, rgba\([^)]*\)\) stroke-width=(\d+)/g)].map((m) => [m[1], m[2]])).toEqual([["78", "24"], ["112", "24"]]);
    expect(html.match(/class="tick"/g)).toHaveLength(24);
    const hours = [...html.matchAll(/class="hour" x=([\d.]+) y=([\d.]+) text-anchor="middle">(\d+)</g)].map((m) => [Math.round(+m[1]), Math.round(+m[2]), m[3]]);
    expect(hours).toEqual([[160, 112, "12"], [213, 165, "3"], [160, 218, "6"], [107, 165, "9"], [160, 20, "24"], [305, 165, "15"], [160, 310, "18"], [15, 165, "21"]]);
    expect(html).toContain(`<div class="rings">${t("en", "radial_rings")}</div>`);
    expect(html.match(/pathLength="100"/g)).toHaveLength(2);
    expect(html).toContain('r=78 fill="none" stroke=#00f stroke-width=24 pathLength="100" stroke-dasharray="50 50" stroke-dashoffset=-50');
    expect(html).toContain('r=112 fill="none" stroke=#00f stroke-width=24 pathLength="100" stroke-dasharray="50 50" stroke-dashoffset=0');
    const ticks = [...html.matchAll(/class="tick" x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+)/g)].map((m) => Math.round(Math.hypot(+m[1] - +m[3], +m[2] - +m[4])));
    expect(ticks).toEqual([...Array(2)].flatMap(() => Array.from({ length: 12 }, (_, h) => (h % 3 === 0 ? 24 : 6))));
  });
  it("the now line and its icon follow the ring of the time; the clock text shows the time; out of range or missing means none", async () => {
    const single = norm(await mk({ now: 360 }));
    const line = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(single)!;
    expect([line[1], line[2], line[3], line[4]].map((v) => Math.round(+v))).toEqual([250, 160, 294, 160]); // radius 90 to 134 at 6 am, a quarter turn from the top
    expect(single).toContain('<text x="160" y="156" text-anchor="middle">6 am</text>');
    expect(single).toContain("mdi:clock-outline");
    const double = norm(await mk({ now: 800, double: true }));
    const dl = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(double)!;
    expect(Math.round(Math.hypot(+dl[1] - 160, +dl[2] - 160))).toBe(96); // outer ring: 112 - 12 - 4
    expect(Math.round(Math.hypot(+dl[3] - 160, +dl[4] - 160))).toBe(128);
    const morning = norm(await mk({ now: 100, double: true }));
    const ml = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(morning)!;
    expect(Math.round(Math.hypot(+ml[1] - 160, +ml[2] - 160))).toBe(62); // inner ring: 78 - 12 - 4
    expect(norm(await mk({ now: 720, double: true }))).toMatch(/<line x1=[\d.]+ y1=[\d.]+ x2=[\d.]+ y2=[\d.]+ stroke="var\(--primary-text-color\)" stroke-width="3"/);
    for (const bad of [null, -1, 1440, 2000, NaN]) {
      const html = norm(await mk({ now: bad }));
      expect(html).not.toContain('stroke-width="3"');
      expect(html).not.toContain("mdi:clock-outline");
      expect(html).toContain("24 h</text>");
    }
    expect(norm(await mk({ now: 0 }))).toContain('stroke-width="3"');
    expect(norm(await mk({ now: 1439 }))).toContain('stroke-width="3"');
  });
  it("the selected time replaces the idle clock; it goes inside the single dial unless long, outside the double one", async () => {
    const short = norm(await mk({ selectedTime: "8 h – 9 h" }));
    expect(short).not.toContain('y="156"');
    expect(short.indexOf("class=selected-time")).toBeLessThan(short.indexOf("</svg>") + 400);
    const longText = "x".repeat(46);
    expect(norm(await mk({ selectedTime: longText }))).toContain("class=selected-time outside");
    expect(norm(await mk({ selectedTime: "x".repeat(45) }))).not.toContain("outside");
    expect(norm(await mk({ selectedTime: "a", double: true }))).toContain("class=selected-time outside");
  });
  it("the legend names the rest of the time and each stretch once; the dial opens the day unless passive", async () => {
    const s = { start: 0, end: 60, color: "#0", label: "A" };
    const el = await mk({ spans: [s, { ...s, start: 60, end: 120, label: "B" }], rest: "3 h" });
    const html = norm(el);
    expect(html).toContain(`<i style=background:var(--divider-color, rgba(127, 127, 127, 0.2))></i>${t("en", "rest_of_time")}: 3 h`);
    expect(html.match(/<span><i style=background:#0>/g)).toHaveLength(2);
    expect(norm(await mk({ double: true, spans: [{ ...s, end: 1440 }] })).match(/<span><i style=background:#0>/g)).toHaveLength(1); // one entry for two rings
    expect(attrOf(el.render(), /tabindex=$/)).toEqual([0]);
    el.passive = true;
    expect(attrOf(el.render(), /tabindex=$/)).toEqual([-1]);
    expect(html).toContain(`aria-label=${t("en", "hours")}`);
  });
});

describe("radial day: icons and the now mark in detail", () => {
  const mk = async (props: any = {}) => {
    const { WpRadialDay } = await import("../components/radial-day");
    const el = new WpRadialDay() as any;
    Object.assign(el, { lang: "en", ...props });
    return el;
  };
  const norm = (el: any) => flat(el.render()).replace(/\s+/g, " ");
  const icons = (html: string) => [...html.matchAll(/<wp-tip text=(.*?) label=.*? style=left:([\d.]+)%;top:([\d.]+)%> <span class="icon"><ha-icon icon=(\S+?)><\/ha-icon>/g)]
    .map((m) => [m[1], Math.round(+m[2] * 10) / 10, Math.round(+m[3] * 10) / 10, m[4]]);
  it("the start icon follows the side of the sun and only exists for a sun start", async () => {
    const down = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", startSun: "down", startSpec: { sun: "sunset" } }] })));
    expect(down).toEqual([["Sunset · 6 am", 85, 50, "mdi:weather-sunset-down"]]);
    const up = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" } }] })));
    expect(up[0][3]).toBe("mdi:weather-sunset-up");
    expect(icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A" }] })))).toEqual([]);
    expect(icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", endSpec: { sun: "sunset" } }] })))).toEqual([]);
  });
  it("the end icon follows the side too, sits on the end of the arc and not on a ring split", async () => {
    const up = icons(norm(await mk({ spans: [{ start: 360, end: 720, color: "#0", label: "A", endSun: "up", endSpec: { sun: "sunrise" } }] })));
    expect(up).toEqual([["Sunrise · 12 pm", 50, 85, "mdi:weather-sunset-up"]]);
    const split = icons(norm(await mk({ double: true, spans: [{ start: 600, end: 900, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" }, endSun: "down", endSpec: { sun: "sunset" } }] })));
    expect(split.map((i) => [i[0], i[3]])).toEqual([["Sunrise · 10 am", "mdi:weather-sunset-up"], ["Sunset · 3 pm", "mdi:weather-sunset-down"]]);
    const cut = icons(norm(await mk({ double: true, spans: [{ start: 600, end: 900, color: "#0", label: "A", endSun: "down", endSpec: { sun: "sunset" } }, { start: 100, end: 800, color: "#0", label: "B", startSun: "up", startSpec: { sun: "sunrise" } }] })));
    expect(cut.length).toBe(2);
  });
  it("the clock icon sits inside the ring, on the ring of the time", async () => {
    expect(icons(norm(await mk({ now: 360 })))).toEqual([["Now · 6 am", 75.6, 50, "mdi:clock-outline"]]);
    const afternoon = icons(norm(await mk({ now: 900, double: true })))[0]; // 3 pm: 180/720 of the outer ring, radius 112 - 12 - 12
    expect([afternoon[1], afternoon[2]]).toEqual([Math.round((160 + 88 * Math.cos(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10, Math.round((160 + 88 * Math.sin(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10]);
    const morning = icons(norm(await mk({ now: 180, double: true })))[0]; // 3 am: inner ring, radius 78 - 12 - 12
    expect([morning[1], morning[2]]).toEqual([Math.round((160 + 54 * Math.cos(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10, Math.round((160 + 54 * Math.sin(0.25 * 2 * Math.PI - Math.PI / 2)) / 3.2 * 10) / 10]);
    const noon = icons(norm(await mk({ now: 720, double: true })))[0]; // 12 pm: first minute of the outer ring, top
    expect([noon[1], noon[2]]).toEqual([50, Math.round((160 - 88) / 3.2 * 10) / 10]);
    const edge = icons(norm(await mk({ now: 719, double: true })))[0];
    expect(Number(edge[2])).toBeGreaterThanOrEqual(Math.round((160 - 54) / 3.2 * 10) / 10); // inner ring (radius 54), just before the top
    expect(Number(edge[2])).toBeLessThan(Math.round((160 - 88) / 3.2 * 10) / 10 + 40);
  });
});

describe("radial dial: exact boundaries and the now mark", () => {
  const hit = (x: number, y: number, spans: any[], now: number | null, double = false) => radialHoverTarget(spans, now, double, x, y, { left: 0, top: 0, width: 320 });
  const polar = (turn: number, r: number) => { const a = turn * Math.PI * 2 - Math.PI / 2; return [160 + r * Math.cos(a), 160 + r * Math.sin(a)] as const; };
  const sp = (start: number, end: number, extra: any = {}) => ({ start, end, color: "#0", label: "x", ...extra });
  it("the ring is a target up to 4 px past the track edge, inclusive", () => {
    expect(hit(294, 160, [sp(0, 1440)], null)).toBe(0); // 134 px from the centre, exactly the edge
    expect(hit(26, 160, [sp(0, 1440)], null)).toBe(0);
  });
  it("a stretch includes its start minute and excludes its end minute", () => {
    expect(hit(272, 160, [sp(360, 720)], null)).toBe(0); // 3 o'clock: minute 360 exactly
    expect(hit(272, 160, [sp(0, 360)], null)).toBeNull();
  });
  it("the first minute of the afternoon belongs to the outer ring and its now mark", () => {
    const [x, y] = polar(0, 112);
    expect(hit(x, y, [sp(0, 1440)], 720, true)).toBe("now");
    const [mx, my] = polar(100 / 720, 112);
    expect(hit(mx, my, [sp(0, 1440)], 900, true)).toBe(0); // 100 is far from the 180 of the mark
    expect(hit(mx, my, [sp(0, 1440)], 100 + 720, true)).toBe("now");
  });
  it("a dial with a marker or a stretch is drawn without stray text, and the clock follows the ring of the time", () => {
    const el = new WpRadialDay() as any;
    el.spans = [{ start: 0, end: 60, color: "#0", label: "A" }];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toMatch(/<\/svg><\/button> <\/div> <div class="legend">/);
    el.now = 900;
    const line = (h: string) => { const m = /<line x1=([\d.]+) y1=([\d.]+) x2=([\d.]+) y2=([\d.]+) stroke="var\(--primary-text-color\)" stroke-width="3"/.exec(h)!; return [+m[1], +m[2], +m[3], +m[4]]; };
    const [x1, y1] = line(flat(el.render()).replace(/\s+/g, " "));
    const [ex, ey] = polar(900 / 1440, 112 - 18 - 4);
    expect([x1, y1].map(Math.round)).toEqual([ex, ey].map(Math.round));
    el.double = true;
    const [dx, dy] = line(flat(el.render()).replace(/\s+/g, " "));
    const [fx, fy] = polar(180 / 720, 112 - 12 - 4);
    expect([dx, dy].map(Math.round)).toEqual([fx, fy].map(Math.round));
  });
  it("sun icons keep the device name out of their label and stay in the tab order", () => {
    const el = new WpRadialDay() as any;
    el.deviceName = "Shutter";
    el.spans = [{ start: 360, end: 720, color: "#0", label: "A", startSun: "up", startSpec: { sun: "sunrise" } }];
    const html = flat(el.render()).replace(/\s+/g, " ");
    expect(html).toContain("label=Sunrise · 6 am ?no-tab=");
    expect(html).not.toContain("Sunrise · 6 am, Shutter");
  });
});

describe("radial day: the now mark of a double dial", () => {
  it("the now mark of a double dial lies exactly on its ring angle", () => {
    const el = new WpRadialDay() as any;
    el.double = true; el.now = 900;
    const m = /<line x1=([\d.]+) y1=([\d.]+) x2=/.exec(flat(el.render()).replace(/\s+/g, " "))!;
    const a = (180 / 720) * Math.PI * 2 - Math.PI / 2;
    expect(+m[1]).toBeCloseTo(160 + 96 * Math.cos(a), 6);
    expect(+m[2]).toBeCloseTo(160 + 96 * Math.sin(a), 6);
  });
});

describe("radial schedule boundaries", () => {
  it.each([false, true])("same-setting schedules stay distinct on the dial (double=%s)", (double) => {
    const dial = new WpRadialDay();
    dial.double = double;
    dial.spans = [
      { start: 0, end: 420, slotId: "night", spill: true, color: "#ffbf00", label: "19°" },
      { start: 1140, end: 1290, slotId: "evening", color: "#ffbf00", label: "19°" },
      { start: 1290, end: 1440, slotId: "night", color: "#ffbf00", label: "19°" },
    ];
    const html = flat(dial.render());
    const separators = [...html.matchAll(/class="schedule-boundary" data-minute=(\d+) x1=([^ ]+) y1=([^ ]+) x2=([^ ]+) y2=([^ ]+)/g)];
    expect(separators.map((m) => Number(m[1]))).toEqual([1290]);
    const line = separators[0];
    const a = Math.atan2(Number(line[3]) - 160, Number(line[2]) - 160);
    expect((a + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)).toBeCloseTo((double ? 570 / 720 : 1290 / 1440) * Math.PI * 2);
    expect(Math.hypot(Number(line[2]) - 160, Number(line[3]) - 160)).toBeCloseTo(double ? 104 : 98);
    expect(Math.hypot(Number(line[4]) - 160, Number(line[5]) - 160)).toBeCloseTo(double ? 120 : 126);
  });
  it("splitting one schedule at noon does not add a separator", () => {
    const dial = new WpRadialDay();
    dial.double = true;
    dial.spans = [{ start: 600, end: 900, slotId: "one", color: "#ffbf00", label: "19°" }];
    expect(flat(dial.render())).not.toContain('class="schedule-boundary"');
  });
  it("a true noon boundary separates both ring endpoints", () => {
    const dial = new WpRadialDay();
    dial.double = true;
    dial.spans = [
      { start: 600, end: 720, slotId: "one", color: "#ffbf00", label: "19°" },
      { start: 720, end: 900, slotId: "two", color: "#ffbf00", label: "19°" },
    ];
    expect([...flat(dial.render()).matchAll(/class="schedule-boundary" data-minute=(\d+)/g)].map((m) => Number(m[1]))).toEqual([720, 720]);
  });
});
