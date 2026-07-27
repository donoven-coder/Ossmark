import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { ViewHero } from "../layout/ViewHero";
import { ChecklistSection } from "./ChecklistSection";
import { TrainingPanel } from "./TrainingPanel";
import { DietPanel } from "./DietPanel";
import { WaterPanel } from "./WaterPanel";
import { useTodayStore } from "../../store/useTodayStore";
import { CHECKLIST_PANELS, MACROS, SPLIT_BY_DAY, trainingFlows } from "../../data/checklistData";
import { formatDateTag, todayDate, weekday } from "../../lib/date";

export function TodayView() {
  const checked = useTodayStore((s) => s.checked);
  const trainingModeOverride = useTodayStore((s) => s.trainingModeOverride);
  const macroValues = useTodayStore((s) => s.macroValues);
  const macroTargets = useTodayStore((s) => s.macroTargets);
  const waterCups = useTodayStore((s) => s.waterCups);
  const waterTarget = useTodayStore((s) => s.waterTarget);
  const resetDay = useTodayStore((s) => s.resetDay);

  const date = useMemo(() => todayDate(), []);
  const splitName = SPLIT_BY_DAY[weekday(date)];
  const trainingMode = trainingModeOverride ?? (splitName ? "gym" : "home");
  const flow = trainingFlows(splitName)[trainingMode];

  let doneCount = 0;
  let totalCount = 0;
  CHECKLIST_PANELS.forEach((section) => {
    section.items.forEach((_, i) => {
      totalCount += 1;
      if (checked[`${section.id}-${i}`]) doneCount += 1;
    });
  });
  flow.steps.forEach((_, i) => {
    totalCount += 1;
    if (checked[`train-${i}`]) doneCount += 1;
  });
  MACROS.forEach((m) => {
    totalCount += 1;
    if (macroValues[m.key] >= macroTargets[m.key]) doneCount += 1;
  });
  totalCount += 1;
  if (waterCups >= waterTarget) doneCount += 1;

  const pct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div>
      <ViewHero
        eyebrow="DAILY CHECKLIST"
        completeEyebrow="DAY COMPLETE"
        title="Today"
        dateTag={formatDateTag(date)}
        pct={pct}
        done={doneCount}
        total={totalCount}
        tag={splitName ? `${splitName.toUpperCase()} DAY` : "REST / HOME"}
        accent="#0EA5E9"
      />

      <div className="mx-auto max-w-[640px] px-4 pt-5">
        {CHECKLIST_PANELS.map((section) => (
          <ChecklistSection key={section.id} section={section} />
        ))}

        <TrainingPanel splitName={splitName} mode={trainingMode} flow={flow} />
        <DietPanel />
        <WaterPanel />

        <div className="mt-5 flex justify-center pb-2">
          <button
            type="button"
            onClick={resetDay}
            className="font-mono-app flex items-center gap-1.5 rounded-full border border-(--color-border) px-4.5 py-2 text-[11px] tracking-wide text-(--color-ink-dimmer) active:scale-95"
          >
            <RotateCcw size={12} />
            RESET DAY
          </button>
        </div>
      </div>
    </div>
  );
}
