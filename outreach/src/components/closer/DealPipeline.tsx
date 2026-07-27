import { DEAL_OUTCOME_OPTIONS, PACKAGES } from "../../lib/types";
import type { Deal } from "../../lib/types";
import { cn } from "../../lib/cn";

export function DealPipeline({ deals }: { deals: Deal[] }) {
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1.5">
      {DEAL_OUTCOME_OPTIONS.map((outcome) => {
        const here = deals.filter((d) => d.outcome === outcome && d.integrity !== "blank");
        const blankRows = outcome === "Pending" ? deals.filter((d) => d.integrity === "blank") : [];

        return (
          <div key={outcome} className="w-37.5 shrink-0">
            <div className="mb-2 border-b-2 border-(--color-line) pb-2 text-center text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase">
              {outcome}
            </div>
            {here.length === 0 && blankRows.length === 0 && (
              <div className="mb-2 flex min-h-16 items-center justify-center rounded-xl border border-(--color-line) p-3 text-center text-[11.5px] text-(--color-sub)">
                Empty
              </div>
            )}
            {here.map((d) => {
              const pkg = PACKAGES.find((p) => p.value === d.packagePitched);
              return (
                <div
                  key={d.id}
                  className={cn(
                    "mb-2 rounded-xl border p-3 text-center text-[11.5px]",
                    "border-(--color-violet) bg-linear-to-br from-[#241B33] to-(--color-panel) text-(--color-ink)",
                  )}
                >
                  {d.dealName || "(unnamed deal)"}
                  {pkg && <div className="mt-1 text-[10px] text-(--color-gold)">{pkg.label}</div>}
                  {d.integrity === "orphan_no_lead" && (
                    <div className="mt-1.5 text-[9px] font-extrabold tracking-wide text-(--color-crimson)">
                      ⚠ UNVERIFIED — NO MATCHING LEAD
                    </div>
                  )}
                </div>
              );
            })}
            {blankRows.map((d) => (
              <div key={d.id} className="mb-2 min-h-16 rounded-xl border border-dashed border-(--color-line) p-3 text-center text-[11.5px] text-(--color-sub) opacity-55">
                Blank row in Deals
                <div className="mt-1.5 text-[9px] font-extrabold tracking-wide text-(--color-crimson)">CLEAN UP</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
