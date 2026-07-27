import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PROGRAM_DATA, WEEK_KEYS, type WeekKey } from "../data/programData";
import { autoDayIndex, todayStamp } from "../lib/date";

const seedTM = (): Record<string, number> => {
  const tm: Record<string, number> = {};
  Object.keys(PROGRAM_DATA.maxes).forEach((k) => {
    tm[k] = PROGRAM_DATA.maxes[k].tm;
  });
  return tm;
};

interface ProgramState {
  lastActiveDate: string;
  tm: Record<string, number>;
  checkedSets: Record<string, boolean>;
  currentWeek: WeekKey;
  currentDayIdx: number;
  /** lift key -> timestamp of last edit, used to trigger the recalculation highlight */
  lastTMEdit: { key: string; at: number } | null;

  updateTM: (key: string, val: number) => void;
  resetMaxes: () => void;
  toggleSet: (id: string) => void;
  setWeek: (w: WeekKey) => void;
  setDay: (i: number) => void;
  resetDaySets: (ids: string[]) => void;
  checkDayRollover: () => void;
}

export const useProgramStore = create<ProgramState>()(
  persist(
    (set, get) => ({
      lastActiveDate: todayStamp(),
      tm: seedTM(),
      checkedSets: {},
      currentWeek: WEEK_KEYS[0],
      currentDayIdx: autoDayIndex(new Date()),
      lastTMEdit: null,

      updateTM: (key, val) =>
        set((s) => ({
          tm: { ...s.tm, [key]: Number.isFinite(val) ? val : 0 },
          lastTMEdit: { key, at: Date.now() },
        })),
      resetMaxes: () => set({ tm: seedTM(), lastTMEdit: { key: "*", at: Date.now() } }),
      toggleSet: (id) => set((s) => ({ checkedSets: { ...s.checkedSets, [id]: !s.checkedSets[id] } })),
      setWeek: (w) => set({ currentWeek: w }),
      setDay: (i) => set({ currentDayIdx: i }),
      resetDaySets: (ids) =>
        set((s) => {
          const next = { ...s.checkedSets };
          ids.forEach((id) => delete next[id]);
          return { checkedSets: next };
        }),
      checkDayRollover: () => {
        const stamp = todayStamp();
        if (get().lastActiveDate !== stamp) {
          set({
            lastActiveDate: stamp,
            checkedSets: {},
            currentDayIdx: autoDayIndex(new Date()),
          });
        }
      },
    }),
    { name: "fcc-program-v1" },
  ),
);
