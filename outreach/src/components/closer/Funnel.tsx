import { motion } from "framer-motion";
import { LEAD_STATUS_OPTIONS } from "../../lib/types";
import type { Lead } from "../../lib/types";

export function Funnel({ leads }: { leads: Lead[] }) {
  const rows = [
    { stage: "New / No Status", count: leads.filter((l) => l.leadStatus === null).length },
    ...LEAD_STATUS_OPTIONS.map((stage) => ({ stage, count: leads.filter((l) => l.leadStatus === stage).length })),
  ];
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((r) => {
        const pct = r.count > 0 ? Math.max(Math.round((r.count / max) * 100), 4) : 0;
        return (
          <div key={r.stage} className="flex items-center gap-2.5">
            <div className="w-27 shrink-0 text-right text-[10.5px] font-bold text-(--color-sub)">{r.stage}</div>
            <div className="h-5 flex-1 overflow-hidden rounded-md border border-(--color-line) bg-(--color-panel)">
              {r.count > 0 ? (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.4 }}
                  className="flex h-full items-center justify-end rounded-md bg-linear-to-r from-(--color-violet-dim) to-(--color-violet) pr-1.5"
                >
                  <span className="text-[10px] font-extrabold text-(--color-ink)">{r.count}</span>
                </motion.div>
              ) : (
                <span className="pl-2 text-[10px] text-(--color-sub)">0</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
