import { Dumbbell } from "lucide-react";
import { Panel, PanelHead } from "../ui/Panel";
import { ItemRow } from "../ui/ItemRow";
import { TabButton } from "../ui/TabButton";
import { useTodayStore, type TrainingModeKey } from "../../store/useTodayStore";
import { trainingFlows, type SplitName, type TrainingFlow } from "../../data/checklistData";

const MODE_KEYS: TrainingModeKey[] = ["gym", "home", "alt"];

export function TrainingPanel({
  splitName,
  mode,
  flow,
}: {
  splitName: SplitName | null;
  mode: TrainingModeKey;
  flow: TrainingFlow;
}) {
  const checked = useTodayStore((s) => s.checked);
  const toggleItem = useTodayStore((s) => s.toggleItem);
  const setTrainingMode = useTodayStore((s) => s.setTrainingMode);

  const flows = trainingFlows(splitName);
  const done = flow.steps.filter((_, i) => checked[`train-${i}`]).length;

  return (
    <Panel>
      <PanelHead label={`Training — ${flow.label}`} icon={Dumbbell} accent="#CDFF3D" done={done} total={flow.steps.length} />
      <div className="flex flex-wrap gap-1.5 border-b border-(--color-border) px-4 py-3">
        {MODE_KEYS.map((key) => (
          <TabButton key={key} active={key === mode} onClick={() => setTrainingMode(key)}>
            {flows[key].label}
          </TabButton>
        ))}
      </div>
      {mode === "gym" && (
        <div className="font-mono-app px-4 pt-2.5 pb-1 text-[9.5px] tracking-wide text-(--color-ink-faint)">
          AUTO-SET FROM WEEKDAY — TAP ABOVE TO OVERRIDE
        </div>
      )}
      {flow.steps.map((step, i) => (
        <ItemRow
          key={i}
          label={step}
          done={!!checked[`train-${i}`]}
          onToggle={() => toggleItem(`train-${i}`)}
          isLast={i === flow.steps.length - 1}
        />
      ))}
    </Panel>
  );
}
