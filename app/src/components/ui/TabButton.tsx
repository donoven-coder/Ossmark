import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function TabButton({ active, onClick, children, className }: TabButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={cn(
        "font-mono-app rounded-lg border-[1.5px] px-3 py-1.5 text-[12px] tracking-wide transition-colors duration-150",
        active
          ? "border-(--color-accent) bg-(--color-accent)/12 text-(--color-accent)"
          : "border-(--color-border) bg-transparent text-(--color-ink-dimmer)",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}
