import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Panel({ children, wide, className }: { children: ReactNode; wide?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-(--color-line) bg-(--color-panel) p-4.5",
        wide && "col-span-full",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, accent = "gold" }: { children: ReactNode; accent?: "gold" | "violet" }) {
  return (
    <div className="font-display mt-0 mb-2.5 flex items-center gap-2 text-[16px] font-semibold">
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ background: accent === "gold" ? "var(--color-gold)" : "var(--color-violet)" }}
      />
      {children}
    </div>
  );
}
