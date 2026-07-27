import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Staggered entrance for view content — index controls the delay step. */
export function Reveal({ index = 0, children }: { index?: number; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
