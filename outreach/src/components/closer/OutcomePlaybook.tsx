import { OUTCOME_CASCADE } from "../../lib/callScript";

export function OutcomePlaybook() {
  return (
    <div className="flex flex-col gap-2.5">
      {OUTCOME_CASCADE.map((c) => (
        <div key={c.outcome} className="rounded-xl border border-(--color-line) border-l-[3px] border-l-(--color-violet) bg-(--color-panel) p-3.5">
          <div className="mb-1.5 text-[12px] font-extrabold">{c.outcome}</div>
          <ol className="list-decimal space-y-1 pl-3.5 text-[11px] leading-relaxed text-(--color-sub)">
            {c.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
