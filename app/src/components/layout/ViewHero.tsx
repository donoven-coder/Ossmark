import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
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

  // Confetti burst on the rising edge of completion — the "satisfying moment"
  const wasComplete = useRef(complete);
  useEffect(() => {
    if (complete && !wasComplete.current) {
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 38,
        origin: { x: 0.5, y: 0.32 },
        colors: ["#CDFF3D", "#FF5C47", "#A583FF", "#3EE7F5", "#F5F2FB"],
        disableForReducedMotion: true,
      });
    }
    wasComplete.current = complete;
  }, [complete]);

  return (
    <div
      className={cn(
        "px-5 pt-7 pb-6 text-center transition-[background,border-color] duration-500",
        "border-b",
        complete ? "border-(--color-accent)" : "border-(--color-border)",
      )}
      style={{
        background: complete
          ? "radial-gradient(120% 100% at 50% -10%, #2c330f 0%, #1c2210 55%, #0f0d13 100%)"
          : "radial-gradient(120% 100% at 50% -10%, #2c1a38 0%, #1d1526 55%, #0f0d13 100%)",
      }}
    >
      <div className="mx-auto max-w-[640px]">
        <div
          className={cn(
            "font-mono-app mb-1 text-[10px] tracking-[3px] transition-colors duration-400",
            complete ? "text-(--color-accent)" : "text-(--color-ember)",
          )}
        >
          {complete ? completeEyebrow : eyebrow}
        </div>
        <h1 className="font-display mb-1 text-[30px] font-bold tracking-wide text-(--color-ink-bright) uppercase">
          {title}
        </h1>
        <div className="font-mono-app mb-4 text-[11px] tracking-wide text-(--color-ink-dimmer)">{dateTag}</div>

        <motion.div
          animate={complete ? { scale: [1, 1.07, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <ProgressRing pct={pct} complete={complete} accent={accent}>
            <motion.div
              key={pct}
              initial={{ scale: 1.18 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="font-display text-[36px] font-bold leading-none text-(--color-ink-bright)"
            >
              {pct}%
            </motion.div>
            <div className="font-mono-app mt-1 text-[11px] tracking-wide text-(--color-ink-dimmer)">
              {done}/{total}
            </div>
          </ProgressRing>
        </motion.div>

        <div
          className={cn(
            "font-mono-app mt-3.5 inline-block rounded-full border px-3.5 py-1.5 text-[10px] tracking-[1.5px]",
            complete
              ? "border-(--color-accent) text-(--color-accent)"
              : "border-(--color-border-strong) text-(--color-ember)",
          )}
        >
          {tag}
        </div>

        {complete && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono-app mt-2.5 text-[12px] tracking-[2px] text-(--color-accent)"
          >
            {completeMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}
