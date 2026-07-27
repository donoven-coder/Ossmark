import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RotateCw, X } from "lucide-react";
import { useOutbox } from "../../hooks/useOutbox";

export function SyncIssuesBanner() {
  const { pending, failed, retry, dismiss } = useOutbox();

  if (pending.length === 0 && failed.length === 0) return null;

  return (
    <div className="mx-auto max-w-270 px-4.5">
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-2.5 flex items-center gap-2.5 rounded-xl border border-(--color-gold)/40 bg-(--color-gold)/8 px-3.5 py-2.5"
          >
            <CloudOff size={15} className="shrink-0 text-(--color-gold)" />
            <div className="text-[11.5px] text-(--color-sub)">
              <b className="text-(--color-ink)">
                {pending.length} action{pending.length === 1 ? "" : "s"}
              </b>{" "}
              waiting to sync — will send automatically when connection returns.
            </div>
          </motion.div>
        )}

        {failed.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-2.5 flex items-center gap-2.5 rounded-xl border border-(--color-crimson)/40 bg-(--color-crimson)/8 px-3.5 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[11.5px] font-bold text-(--color-ink)">{item.label} — didn't sync</div>
              <div className="mt-0.5 truncate text-[10.5px] text-(--color-sub)">{item.lastError}</div>
            </div>
            <button type="button" onClick={() => retry(item.id)} aria-label="Retry" className="shrink-0 text-(--color-crimson)">
              <RotateCw size={15} />
            </button>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss" className="shrink-0 text-(--color-sub)">
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
