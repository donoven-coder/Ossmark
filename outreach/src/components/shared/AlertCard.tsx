import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../../lib/cn";

const TONES = {
  warn: {
    bg: "linear-gradient(120deg, #2A1414, #1C1926)",
    border: "#EF444455",
    icon: "text-(--color-crimson)",
    title: "text-[#FCA5A5]",
    Icon: AlertTriangle,
  },
  good: {
    bg: "linear-gradient(120deg, #142A1C, #1C1926)",
    border: "#22C55E55",
    icon: "text-(--color-emerald)",
    title: "text-[#86EFAC]",
    Icon: CheckCircle2,
  },
  info: {
    bg: "linear-gradient(120deg, #1C1E2E, #1C1926)",
    border: "#A855F755",
    icon: "text-(--color-violet)",
    title: "text-[#C4B5FD]",
    Icon: Info,
  },
} as const;

export function AlertCard({
  tone,
  title,
  children,
  className,
}: {
  tone: keyof typeof TONES;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      className={cn("flex items-start gap-3 rounded-2xl border p-4", className)}
      style={{ background: t.bg, borderColor: t.border }}
    >
      <t.Icon size={18} strokeWidth={2} className={cn("mt-0.5 shrink-0", t.icon)} />
      <div>
        <div className={cn("text-[12.5px] font-extrabold tracking-wide", t.title)}>{title}</div>
        <div className="mt-1 text-[12px] leading-relaxed text-(--color-sub) [&_b]:text-(--color-ink)">{children}</div>
      </div>
    </div>
  );
}
