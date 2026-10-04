import { motion } from "framer-motion";
import { cn } from "../../lib/cn";

export function StatCard({ value, label, tone = "default" }: { value: number | string; label: string; tone?: "default" | "warn" | "gold" }) {
  return (
    <div className="rounded-2xl border border-(--color-line) bg-linear-to-br from-(--color-panel2) to-(--color-panel) px-3 py-4 text-center">
      <motion.div
        key={value}
        initial={{ opacity: 0.4, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "font-display text-[30px] leading-none font-bold",
          tone === "warn" && "text-(--color-crimson)",
          tone === "gold" && "text-(--color-gold)",
        )}
      >
        {value}
      </motion.div>
      <div className="mt-1.5 text-[9.5px] font-bold tracking-wide text-(--color-sub) uppercase">{label}</div>
    </div>
  );
}
