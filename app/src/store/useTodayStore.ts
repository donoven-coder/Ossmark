import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MACROS, DEFAULT_WATER_TARGET, type MacroDef } from "../data/checklistData";
import { todayStamp } from "../lib/date";

export type MacroKey = MacroDef["key"];
export type TrainingModeKey = "gym" | "home" | "alt";

type MacroValues = Record<MacroKey, number>;

const defaultMacroValues = (): MacroValues =>
  MACROS.reduce((acc, m) => ({ ...acc, [m.key]: 0 }), {} as MacroValues);

const defaultMacroTargets = (): MacroValues =>
  MACROS.reduce((acc, m) => ({ ...acc, [m.key]: m.target }), {} as MacroValues);

interface TodayState {
  lastActiveDate: string;
  checked: Record<string, boolean>;
  trainingModeOverride: TrainingModeKey | null;
  waterCups: number;
  waterTarget: number;
  macroValues: MacroValues;
  macroTargets: MacroValues;

  toggleItem: (id: string) => void;
  setTrainingMode: (mode: TrainingModeKey) => void;
  adjustWater: (delta: number) => void;
  setWaterTarget: (target: number) => void;
  adjustMacro: (key: MacroKey, delta: number) => void;
  setMacroTarget: (key: MacroKey, target: number) => void;
  resetDay: () => void;
  checkDayRollover: () => void;
}

export const useTodayStore = create<TodayState>()(
  persist(
    (set, get) => ({
      lastActiveDate: todayStamp(),
      checked: {},
      trainingModeOverride: null,
      waterCups: 0,
      waterTarget: DEFAULT_WATER_TARGET,
      macroValues: defaultMacroValues(),
      macroTargets: defaultMacroTargets(),

      toggleItem: (id) => set((s) => ({ checked: { ...s.checked, [id]: !s.checked[id] } })),
      setTrainingMode: (mode) => set({ trainingModeOverride: mode }),
      adjustWater: (delta) =>
        set((s) => ({
          waterCups: Math.max(0, Math.min(s.waterTarget + 4, s.waterCups + delta)),
        })),
      setWaterTarget: (target) => set({ waterTarget: Math.max(1, target) }),
      adjustMacro: (key, delta) =>
        set((s) => ({ macroValues: { ...s.macroValues, [key]: Math.max(0, s.macroValues[key] + delta) } })),
      setMacroTarget: (key, target) =>
        set((s) => ({ macroTargets: { ...s.macroTargets, [key]: Math.max(1, target) } })),
      resetDay: () =>
        set({
          checked: {},
          waterCups: 0,
          macroValues: defaultMacroValues(),
          trainingModeOverride: null,
        }),
      checkDayRollover: () => {
        const stamp = todayStamp();
        if (get().lastActiveDate !== stamp) {
          set({
            lastActiveDate: stamp,
            checked: {},
            waterCups: 0,
            macroValues: defaultMacroValues(),
            trainingModeOverride: null,
          });
        }
      },
    }),
    { name: "fcc-today-v1" },
  ),
);
