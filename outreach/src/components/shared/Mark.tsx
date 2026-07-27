import { motion } from "framer-motion";

export function Mark() {
  return (
    <div className="relative mx-auto mb-3.5 h-16 w-16">
      <motion.div
        className="absolute -inset-3.5 rounded-full"
        style={{ background: "radial-gradient(circle, #E8B84B55 0%, transparent 70%)" }}
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 64 64" className="relative h-16 w-16 drop-shadow-[0_4px_18px_#E8B84B44]">
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5D98A" />
            <stop offset="55%" stopColor="#E8B84B" />
            <stop offset="100%" stopColor="#B8903A" />
          </linearGradient>
        </defs>
        <polygon points="32,3 58,18 58,46 32,61 6,46 6,18" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" />
        <circle cx="32" cy="32" r="13" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
        <circle cx="32" cy="32" r="6" fill="none" stroke="url(#goldGrad)" strokeWidth="2" />
        <circle cx="32" cy="32" r="2" fill="url(#goldGrad)" />
        <line x1="32" y1="14" x2="32" y2="20" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="32" y1="44" x2="32" y2="50" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="14" y1="32" x2="20" y2="32" stroke="url(#goldGrad)" strokeWidth="2" />
        <line x1="44" y1="32" x2="50" y2="32" stroke="url(#goldGrad)" strokeWidth="2" />
      </svg>
    </div>
  );
}
