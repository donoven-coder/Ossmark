import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-3.5 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-panel)",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PanelHeadProps {
  label: string;
  sub?: string;
  icon: LucideIcon;
  accent: string;
  done?: number;
  total?: number;
}

export function PanelHead({ label, sub, icon: Icon, accent, done, total }: PanelHeadProps) {
  return (
    <div className="flex items-center gap-2.5 border-b border-(--color-border) px-4 py-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium text-(--color-ink)">{label}</div>
        {sub && <div className="mt-0.5 text-[9.5px] text-(--color-ink-faint)">{sub}</div>}
      </div>
      {typeof total === "number" && total > 0 && (
        <div className="font-mono-app text-[10px] text-(--color-ink-dimmer)">
          {done}/{total}
        </div>
      )}
    </div>
  );
}
