import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface StepperRowProps {
  label: string;
  sub: string;
  value: number;
  suffix?: string;
  onDecrement: () => void;
  onIncrement: () => void;
}

export function StepperRow({ label, sub, value, suffix = "", onDecrement, onIncrement }: StepperRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[13px] text-(--color-ink-line)">{label}</div>
        <div className="font-mono-app mt-0.5 text-[10px] text-(--color-ink-faint)">{sub}</div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-(--color-border) bg-(--color-panel-alt) text-(--color-accent) active:scale-95"
        >
          <Minus size={14} />
        </button>
        <motion.div
          key={value}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="font-mono-app min-w-[56px] text-center text-[15px] text-(--color-ink-bright)"
        >
          {value}
          {suffix}
        </motion.div>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-[7px] border border-(--color-border) bg-(--color-panel-alt) text-(--color-accent) active:scale-95"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
