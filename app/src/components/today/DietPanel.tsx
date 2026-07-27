import { useState } from "react";
import { Flame, Pencil, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Panel } from "../ui/Panel";
import { StepperRow } from "../ui/StepperRow";
import { useTodayStore } from "../../store/useTodayStore";
import { MACROS } from "../../data/checklistData";

export function DietPanel() {
  const [editing, setEditing] = useState(false);
  const macroValues = useTodayStore((s) => s.macroValues);
  const macroTargets = useTodayStore((s) => s.macroTargets);
  const adjustMacro = useTodayStore((s) => s.adjustMacro);
  const setMacroTarget = useTodayStore((s) => s.setMacroTarget);

  const done = MACROS.filter((m) => macroValues[m.key] >= macroTargets[m.key]).length;

  return (
    <Panel>
      <div className="flex items-center gap-2.5 border-b border-(--color-border) px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--color-ember)/13 text-(--color-ember)">
          <Flame size={15} strokeWidth={1.8} />
        </div>
        <div className="flex-1 text-[13px] text-(--color-ink)">Diet</div>
        <span className="font-mono-app text-[10px] text-(--color-ink-dimmer)">
          {done}/{MACROS.length}
        </span>
        <button
          type="button"
          onClick={() => setEditing((e) => !e)}
          aria-label={editing ? "Done editing targets" : "Edit macro targets"}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-(--color-border) text-(--color-ink-dimmer) active:scale-95"
        >
          {editing ? <Check size={13} /> : <Pencil size={13} />}
        </button>
      </div>

      {MACROS.map((m, i) => {
        const target = macroTargets[m.key];
        const value = macroValues[m.key];
        const pct = Math.min(100, Math.round((value / target) * 100));
        return (
          <div
            key={m.key}
            className={`px-4 py-3 ${i !== MACROS.length - 1 ? "border-b border-(--color-panel-alt)" : ""}`}
          >
            {editing ? (
              <div className="flex items-center justify-between gap-3">
                <div className="text-[13px] text-(--color-ink-line)">{m.label}</div>
                <label className="flex items-center gap-1.5">
                  <span className="font-mono-app text-[10px] text-(--color-ink-faint)">target</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={target}
                    onChange={(e) => setMacroTarget(m.key, parseFloat(e.target.value) || 0)}
                    className="font-mono-app w-20 rounded-md border border-(--color-border-strong) bg-(--color-panel-alt) px-2 py-1 text-right text-[13px] text-(--color-accent)"
                  />
                  <span className="font-mono-app text-[10px] text-(--color-ink-faint)">{m.unit}</span>
                </label>
              </div>
            ) : (
              <>
                <StepperRow
                  label={m.label}
                  sub={`target ${target}${m.unit}`}
                  value={value}
                  suffix={m.unit}
                  onDecrement={() => adjustMacro(m.key, -m.step)}
                  onIncrement={() => adjustMacro(m.key, m.step)}
                />
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-(--color-border)">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.accent }}
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="font-mono-app border-t border-(--color-panel-alt) px-4 py-2.5 text-[10px] leading-relaxed tracking-wide text-(--color-ink-faint)">
        TARGETS ARE PLACEHOLDER DEFAULTS — TAP THE PENCIL ABOVE TO EDIT THEM
      </div>
    </Panel>
  );
}
