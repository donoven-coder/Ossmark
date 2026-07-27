import { useState } from "react";
import { Droplet, Pencil, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Panel } from "../ui/Panel";
import { StepperRow } from "../ui/StepperRow";
import { useTodayStore } from "../../store/useTodayStore";

export function WaterPanel() {
  const [editing, setEditing] = useState(false);
  const waterCups = useTodayStore((s) => s.waterCups);
  const waterTarget = useTodayStore((s) => s.waterTarget);
  const adjustWater = useTodayStore((s) => s.adjustWater);
  const setWaterTarget = useTodayStore((s) => s.setWaterTarget);

  const hit = waterCups >= waterTarget;

  return (
    <Panel>
      <div className="flex items-center gap-2.5 border-b border-(--color-border) px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--color-cyan)/13 text-(--color-cyan)">
          <Droplet size={15} strokeWidth={1.8} />
        </div>
        <div className="flex-1 text-[13px] text-(--color-ink)">Water</div>
        <span className="font-mono-app text-[10px] text-(--color-ink-dimmer)">{hit ? 1 : 0}/1</span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-label={editing ? "Done editing target" : "Edit water target"}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--color-border) text-(--color-ink-dimmer) active:scale-95"
        >
          {editing ? <Check size={13} /> : <Pencil size={13} />}
        </button>
      </div>

      <div className="px-4 py-3">
        {editing ? (
          <div className="flex items-center justify-between gap-3">
            <div className="text-[13px] text-(--color-ink-line)">Daily target</div>
            <label className="flex items-center gap-1.5">
              <input
                type="number"
                inputMode="numeric"
                value={waterTarget}
                onChange={(e) => setWaterTarget(parseFloat(e.target.value) || 1)}
                className="font-mono-app w-20 rounded-md border border-(--color-border-strong) bg-(--color-panel-alt) px-2 py-1 text-right text-[13px] text-(--color-accent)"
              />
              <span className="font-mono-app text-[10px] text-(--color-ink-faint)">cups</span>
            </label>
          </div>
        ) : (
          <StepperRow
            label="Cups today"
            sub={`target ${waterTarget} — tap to adjust`}
            value={waterCups}
            onDecrement={() => adjustWater(-1)}
            onIncrement={() => adjustWater(1)}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-1 px-4 pb-3.5">
        {Array.from({ length: waterTarget }).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{
              background: i < waterCups ? "#3EE7F5" : "transparent",
              borderColor: i < waterCups ? "#3EE7F5" : "#453B60",
            }}
            transition={{ duration: 0.2 }}
            className="h-4 w-4 rounded-[4px] border-[1.5px]"
          />
        ))}
      </div>
    </Panel>
  );
}
