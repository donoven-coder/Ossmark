import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ProgressRing } from "./ProgressRing";
import { cn } from "../../lib/utils";

interface ViewHeroProps {
  eyebrow: string;
  completeEyebrow: string;
  title: ReactNode;
  dateTag: string;
  pct: number;
  done: number;
  total: number;
  tag: string;
  accent: string;
  completeMessage?: string;
}

export function ViewHero({
  eyebrow,
  completeEyebrow,
  title,
  dateTag,
  pct,
  done,
  total,
  tag,
  accent,
  completeMessage = "DAY LOCKED IN",
}: ViewHeroProps) {
  const complete = total > 0 && pct === 100;

  return (
    <div
      className={cn(
        "px-5 pt-7 pb-6 text-center transition-[background,border-color] duration-500",
        "border-b",
        complete ? "border-(--color-success)" : "border-(--color-border)",
      )}
      style={{
        background: complete
          ? "radial-gradient(120% 100% at 50% -10%, #0E3324 0%, #0A2018 55%, #080E1A 100%)"
          : "radial-gradient(120% 100% at 50% -10%, #0F2847 0%, #0A1628 55%, #080E1A 100%)",
      }}
    >
      <div className="mx-auto max-w-[640px]">
        <div
          className={cn(
            "font-mono-app mb-1 text-[10px] tracking-[3px] transition-colors duration-400",
            complete ? "text-(--color-success)" : "text-(--color-accent)",
          )}
        >
          {complete ? completeEyebrow : eyebrow}
        </div>
        <h1 className="mb-1 text-[21px] font-normal tracking-tight text-(--color-ink-bright)">{title}</h1>
        <div className="font-mono-app mb-4 text-[11px] text-(--color-ink-dimmer)">{dateTag}</div>

        <ProgressRing pct={pct} complete={complete} accent={accent}>
          <div className="font-mono-app text-[28px] font-bold leading-none text-(--color-ink-bright)">{pct}%</div>
          <div className="font-mono-app mt-1.5 text-[10px] tracking-wide text-(--color-ink-dimmer)">
            {done}/{total}
          </div>
        </ProgressRing>

        <div className="font-mono-app mt-3.5 inline-block rounded-full border border-(--color-border-strong) px-3.5 py-1.5 text-[10px] tracking-wide text-(--color-accent)">
          {tag}
        </div>

        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono-app mt-2.5 text-[12px] tracking-wide text-(--color-success)"
          >
            {completeMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}
