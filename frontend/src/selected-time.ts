// The selected occurrence uses resolved server minutes, including its unclipped overnight end.
import { strings, t } from "./i18n";
import { DAY, fmtClock, fmtDayEnd } from "./time";
import type { TimeSpec } from "./types";

export function selectedTimeText(lang: string, start: number, end: number | null,
  startSpec?: TimeSpec, endSpec?: TimeSpec | null): string {
  const boundary = (minute: number, spec?: TimeSpec | null) => {
    const clock = minute === DAY ? fmtDayEnd(lang) : fmtClock(lang, minute);
    if (!spec || !("sun" in spec)) return clock;
    const name = strings(lang)[`sun_${spec.sun}` as "sun_sunset"] ?? spec.sun;
    const offset = spec.offset ?? 0;
    return `${clock} (${name}${offset ? ` ${offset > 0 ? "+" : "−"} ${Math.abs(offset)} min` : ""})`;
  };
  const from = boundary(start, startSpec);
  if (end === null) return t(lang, "time_from", { time: from });
  return `${from} – ${boundary(end, endSpec)}${end <= start ? ` (${t(lang, "time_next_day")})` : ""}`;
}
