import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ItemRowProps {
  label: string;
  done: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export function ItemRow({ label, done, onToggle, isLast }: ItemRowProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-2.75 text-left transition-colors active:bg-(--color-panel-alt)",
        !isLast && "border-b border-(--color-panel-alt)",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-150",
          done ? "border-(--color-accent) bg-(--color-accent)" : "border-slate-600 bg-transparent",
        )}
      >
        {done && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="flex text-(--color-base)"
          >
            <Check size={11} strokeWidth={3} />
          </motion.span>
        )}
      </span>
      <span
        className={cn(
          "text-[13px] leading-relaxed transition-colors duration-150",
          done ? "text-(--color-ink-dimmer) line-through" : "text-(--color-ink-line)",
        )}
      >
        {label}
      </span>
    </button>
  );
}
