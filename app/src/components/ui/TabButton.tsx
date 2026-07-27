import { cn } from "../../lib/utils";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export function TabButton({ active, onClick, children, className }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "font-mono-app rounded-lg border-[1.5px] px-3 py-1.5 text-[11px] transition-colors duration-150",
        active
          ? "border-(--color-accent) bg-(--color-accent)/10 text-(--color-accent)"
          : "border-(--color-border) bg-transparent text-(--color-ink-dimmer)",
        className,
      )}
    >
      {children}
    </button>
  );
}
