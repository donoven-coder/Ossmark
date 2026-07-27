import { Target } from "lucide-react";
import { motion } from "framer-motion";
import { Panel, PanelHead } from "../ui/Panel";
import { useProgramStore } from "../../store/useProgramStore";
import { PROGRAM_DATA } from "../../data/programData";

export function TrainingMaxPanel({ highlightKey }: { highlightKey: string | null }) {
  const tm = useProgramStore((s) => s.tm);
  const updateTM = useProgramStore((s) => s.updateTM);

  return (
    <Panel>
      <PanelHead label="Training Maxes — tap to edit" icon={Target} accent="#0EA5E9" />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {Object.entries(PROGRAM_DATA.maxes).map(([name, m]) => {
          const justChanged = highlightKey === name || highlightKey === "*";
          return (
            <div
              key={name}
              className="min-w-[92px] shrink-0 rounded-[10px] border border-(--color-border-strong) bg-(--color-panel-alt) px-2.5 py-2"
            >
              <div className="font-mono-app text-[9px] tracking-wide text-(--color-ink-dimmer)">
                {name.toUpperCase()}
              </div>
              <motion.input
                type="number"
                step={5}
                inputMode="numeric"
                value={tm[name]}
                onChange={(e) => updateTM(name, parseFloat(e.target.value) || 0)}
                animate={justChanged ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 0.5 }}
                className="font-mono-app mt-1 w-full border-b border-(--color-border-strong) bg-transparent py-0.5 text-[16px] font-bold text-(--color-accent) focus:border-(--color-accent) focus:outline-none"
              />
              <div className="font-mono-app mt-1 text-[9px] text-(--color-ink-faint)">sheet 1RM {m["1rm"]}</div>
            </div>
          );
        })}
      </div>
      <div className="font-mono-app px-4 pb-3 text-[9.5px] leading-relaxed tracking-wide text-(--color-ink-faint)">
        MAIN LIFTS RECALCULATE LIVE FROM THESE — CHANGE A NUMBER AND EVERY WEEK/DAY USING THAT LIFT UPDATES
      </div>
    </Panel>
  );
}
