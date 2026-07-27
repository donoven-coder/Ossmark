import { SetChip } from "../ui/SetChip";
import type { SetEntry } from "../../data/programData";

interface LiftBlockProps {
  name: string;
  sub?: string;
  sets: SetEntry[];
  idsFor: (setIndex: number) => string;
  checkedSets: Record<string, boolean>;
  onToggle: (id: string) => void;
  justChangedFor?: (setIndex: number) => boolean;
  isLast: boolean;
}

export function LiftBlock({ name, sub, sets, idsFor, checkedSets, onToggle, justChangedFor, isLast }: LiftBlockProps) {
  return (
    <div className={`px-4 py-3 ${!isLast ? "border-b border-(--color-panel-alt)" : ""}`}>
      <div className="text-[13px] text-(--color-ink-line)">{name}</div>
      {sub ? (
        <div className="font-mono-app mb-2 mt-0.5 text-[9.5px] text-(--color-ink-faint)">{sub}</div>
      ) : (
        <div className="h-2" />
      )}
      <div className="flex flex-wrap gap-2">
        {sets.map((s, si) => {
          const id = idsFor(si);
          return (
            <SetChip
              key={si}
              weight={s.w}
              reps={s.r}
              done={!!checkedSets[id]}
              onToggle={() => onToggle(id)}
              justChanged={justChangedFor ? justChangedFor(si) : false}
            />
          );
        })}
      </div>
    </div>
  );
}
