import { describe, expect, it } from "vitest";
import { clockToMinutes, exactClock, localDateIso, localMinutes, localWeekday, minutesToClock } from "../time";

const TZ = "Europe/Brussels";

describe("server time zone", () => {
  it("uses the house zone, not the browser's", () => {
    expect(localMinutes("2026-10-26T07:00:00Z", TZ)).toBe(8 * 60);
    expect(localWeekday(new Date("2026-10-26T07:00:00Z"), TZ)).toBe(0); // Monday
    expect(localDateIso(new Date("2026-10-25T23:30:00Z"), TZ)).toBe("2026-10-26");
  });
});

describe("clock strings", () => {
  it("converts clock strings in 5-minute steps", () => {
    expect(clockToMinutes("07:30")).toBe(450);
    expect(minutesToClock(452)).toBe("07:30");
    expect(minutesToClock(1440)).toBe("24:00");
  });
  it("keeps the exact minute of a sun time, seconds dropped like the server", () => {
    expect(localMinutes("2026-11-02T16:17:12Z", "UTC")).toBe(16 * 60 + 17);
    expect(localMinutes("2026-11-02T16:19:59.999Z", "UTC")).toBe(16 * 60 + 19);
    expect(exactClock(16 * 60 + 17)).toBe("16:17");
    expect(exactClock(-3)).toBe("00:00");
    expect(exactClock(1500)).toBe("24:00");
  });
});
