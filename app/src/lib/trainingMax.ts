import { MAIN_TM_KEY, WEEK_SCHEME, type SetEntry, type WeekKey } from "../data/programData";

export function roundTo5(x: number): number {
  return Math.round(x / 5) * 5;
}

// Computes the main (T1) lift's sets live from the current TM + week scheme.
// Any sets beyond the first 3 (present on Fri/Sat in the original sheet) are
// kept as static values pulled from the sheet, since they weren't part of
// the clean 3-set formula.
export function mainSetsFor(
  dayIdx: number,
  weekKey: WeekKey,
  originalSets: SetEntry[],
  tm: Record<string, number>,
): SetEntry[] {
  const tmKey = MAIN_TM_KEY[dayIdx];
  const tmValue = tm[tmKey];
  const scheme = WEEK_SCHEME[weekKey];
  const computed: SetEntry[] = scheme.pct.map((p, i) => ({
    w: roundTo5((tmValue * p) / 100),
    r: scheme.reps[i],
  }));
  const extra = originalSets.slice(3);
  return computed.concat(extra);
}
