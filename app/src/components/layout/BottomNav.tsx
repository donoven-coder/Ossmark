import { ListChecks, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ViewKey } from "../../App";

interface BottomNavProps {
  view: ViewKey;
  onChange: (view: ViewKey) => void;
}

const TABS: { key: ViewKey; label: string; icon: typeof ListChecks }[] = [
  { key: "today", label: "Today", icon: ListChecks },
  { key: "program", label: "Program", icon: Dumbbell },
];

export function BottomNav({ view, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-(--color-border) bg-(--color-surface)/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[640px]">
        {TABS.map((tab) => {
          const active = tab.key === view;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  className="absolute top-0 h-[2px] w-10 rounded-full bg-(--color-accent)"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={1.8}
                className={cn("transition-colors", active ? "text-(--color-accent)" : "text-(--color-ink-dimmer)")}
              />
              <span
                className={cn(
                  "font-mono-app text-[10px] tracking-wide transition-colors",
                  active ? "text-(--color-accent)" : "text-(--color-ink-dimmer)",
                )}
              >
                {tab.label.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
