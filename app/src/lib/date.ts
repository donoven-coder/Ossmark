export function todayDate(): Date {
  return new Date();
}

export function formatDateTag(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
}

// 0 = Sunday ... 6 = Saturday
export function weekday(d: Date): number {
  return d.getDay();
}

export function isRestDay(d: Date): boolean {
  return weekday(d) === 0;
}

// Index into DAY_NAMES (Mon..Sat) for the program view's auto-selected day.
// Sunday has no program day, so it falls back to Monday (index 0) while
// isRestDay() is what actually gates the rest-day UI.
export function autoDayIndex(d: Date): number {
  const dow = weekday(d);
  return dow === 0 ? 0 : dow - 1;
}

// yyyy-mm-dd in local time, used as a day-rollover stamp for persisted state.
export function todayStamp(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
