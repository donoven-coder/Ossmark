// Extracted verbatim from the source prototype `daily-checklist.html`.

// Weekday-driven PPL rotation (Mon-Sat gym, Sunday rest/home).
// Assumption inherited from the prototype — adjust if your actual split
// order differs: Mon Push · Tue Pull · Wed Legs · Thu Push · Fri Pull ·
// Sat Legs · Sun Home/Rest. Manually overridable in the Training panel.
export type SplitName = "Push" | "Pull" | "Legs";

export const SPLIT_BY_DAY: Record<number, SplitName | null> = {
  0: null,
  1: "Push",
  2: "Pull",
  3: "Legs",
  4: "Push",
  5: "Pull",
  6: "Legs",
};

export type TrainingModeKey = "gym" | "home" | "alt";

export interface TrainingFlow {
  label: string;
  steps: string[];
}

export function trainingFlows(splitName: SplitName | null): Record<TrainingModeKey, TrainingFlow> {
  const liftLine = splitName ? `Lift — ${splitName} session` : "Lift — today's session";
  return {
    gym: {
      label: "Gym" + (splitName ? ` — ${splitName}` : " — PPL"),
      steps: ["Warm up (5-10 min)", liftLine, "Calisthenics finisher", "Abs circuit", "Incline walk (20-30 min)"],
    },
    home: {
      label: "Home Day",
      steps: ["Warm up", "Calisthenics circuit", "Abs circuit", "Walk pad (30-45 min)"],
    },
    alt: {
      label: "Calis + Run + Lift",
      steps: ["Calisthenics warm-up", "Run — intervals or steady state", "Lift session"],
    },
  };
}

export interface ChecklistPanelDef {
  id: string;
  label: string;
  icon: "sun" | "pill";
  accent: string;
  items: string[];
}

export const CHECKLIST_PANELS: ChecklistPanelDef[] = [
  {
    id: "morning",
    label: "Morning",
    icon: "sun",
    accent: "#FFB020",
    items: ["Wellness shot — ginger, turmeric, lemon", "Hydrate before coffee"],
  },
  {
    id: "supps",
    label: "Supplements",
    icon: "pill",
    accent: "#A583FF",
    items: ["Morning supplements", "Creatine", "Protein shake — post-lift", "Night supplements"],
  },
];

export interface MacroDef {
  key: "cal" | "protein" | "carbs" | "fat";
  label: string;
  unit: string;
  target: number;
  step: number;
  accent: string;
}

// Targets are placeholder defaults inherited from the prototype, not locked
// facts — editable in-app via the Diet panel's target inputs.
export const MACROS: MacroDef[] = [
  { key: "cal", label: "Calories", unit: " cal", target: 1800, step: 100, accent: "#CDFF3D" },
  { key: "protein", label: "Protein", unit: "g", target: 160, step: 10, accent: "#FF5C47" },
  { key: "carbs", label: "Carbs", unit: "g", target: 150, step: 10, accent: "#FFB020" },
  { key: "fat", label: "Fats", unit: "g", target: 55, step: 5, accent: "#FF6BC1" },
];

// Placeholder default — adjustable in-app via the Water panel.
export const DEFAULT_WATER_TARGET = 8;
