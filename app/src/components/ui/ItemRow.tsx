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
    <motion.button
      type="button"
      onClick={onToggle}
      aria-pressed={done}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-2.75 text-left transition-colors active:bg-(--color-panel-alt)",
        !isLast && "border-b border-(--color-panel-alt)",
      )}
    >
      <motion.span
        animate={done ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          "mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors duration-150",
          done ? "border-(--color-accent) bg-(--color-accent)" : "border-(--color-border-strong) bg-transparent",
        )}
      >
        {done && (
          <motion.span
            initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 28 }}
            className="flex text-(--color-base)"
          >
            <Check size={12} strokeWidth={3.5} />
          </motion.span>
        )}
      </motion.span>
      <span
        className={cn(
          "text-[14px] leading-relaxed transition-colors duration-150",
          done ? "text-(--color-ink-dimmer) line-through" : "text-(--color-ink-line)",
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}
