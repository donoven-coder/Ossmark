import { motion } from "framer-motion";

interface ProgressRingProps {
  pct: number;
  size?: number;
  complete: boolean;
  accent: string;
  children?: React.ReactNode;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ pct, size = 148, complete, accent, children }: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(100, Math.max(0, pct)) / 100);
  const strokeColor = complete ? "var(--color-success)" : accent;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--color-track)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={false}
          animate={{
            strokeDashoffset: offset,
            filter: complete ? `drop-shadow(0 0 10px ${strokeColor}88)` : "drop-shadow(0 0 0px transparent)",
          }}
          transition={{ strokeDashoffset: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }, filter: { duration: 0.5 } }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
