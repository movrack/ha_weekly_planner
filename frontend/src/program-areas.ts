import type { Program } from "./types";

/** Program metadata only: device rooms do not implicitly assign a program's area. */
export function programAreas(programs: Pick<Program, "area">[], selected?: string): string[] {
  return [...new Set([...programs.map((program) => program.area), selected]
    .filter((area): area is string => typeof area === "string" && area.length > 0))]
    .sort((a, b) => a.localeCompare(b));
}
