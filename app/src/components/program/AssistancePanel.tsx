import { List } from "lucide-react";
import { Panel, PanelHead } from "../ui/Panel";
import { ItemRow } from "../ui/ItemRow";
import { useProgramStore } from "../../store/useProgramStore";

export function AssistancePanel({ assistance, idsFor }: { assistance: string; idsFor: (i: number) => string }) {
  const checkedSets = useProgramStore((s) => s.checkedSets);
  const toggleSet = useProgramStore((s) => s.toggleSet);
  const items = assistance.split("|").map((s) => s.trim());
  const done = items.filter((_, i) => checkedSets[idsFor(i)]).length;

  return (
    <Panel>
      <PanelHead label="Assistance" icon={List} accent="#A583FF" done={done} total={items.length} />
      {items.map((txt, i) => (
        <ItemRow
          key={i}
          label={txt}
          done={!!checkedSets[idsFor(i)]}
          onToggle={() => toggleSet(idsFor(i))}
          isLast={i === items.length - 1}
        />
      ))}
    </Panel>
  );
}
