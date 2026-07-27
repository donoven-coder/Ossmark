import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SetChipProps {
  weight: number;
  reps: number | string;
  done: boolean;
  onToggle: () => void;
  justChanged?: boolean;
}

export function SetChip({ weight, reps, done, onToggle, justChanged }: SetChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      className={cn(
        "font-mono-app rounded-[9px] border-[1.5px] px-3 py-2 text-[12px] transition-colors duration-150",
        done
          ? "border-(--color-accent) bg-(--color-accent)/13 text-(--color-accent)"
          : "border-(--color-border) bg-(--color-panel-alt) text-(--color-ink-dim)",
      )}
    >
      <motion.span
        key={weight}
        initial={justChanged ? { scale: 1 } : false}
        animate={
          justChanged
            ? {
                scale: [1, 1.22, 1],
                color: ["#0EA5E9", "#0EA5E9", done ? "#0EA5E9" : "#94A3B8"],
              }
            : {}
        }
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="inline-block"
      >
        {weight}
      </motion.span>{" "}
      &times; {reps}
    </button>
  );
}
