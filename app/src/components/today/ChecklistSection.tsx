import { Sun, Pill } from "lucide-react";
import { Panel, PanelHead } from "../ui/Panel";
import { ItemRow } from "../ui/ItemRow";
import { useTodayStore } from "../../store/useTodayStore";
import type { ChecklistPanelDef } from "../../data/checklistData";

const ICONS = { sun: Sun, pill: Pill } as const;

export function ChecklistSection({ section }: { section: ChecklistPanelDef }) {
  const checked = useTodayStore((s) => s.checked);
  const toggleItem = useTodayStore((s) => s.toggleItem);

  const done = section.items.filter((_, i) => checked[`${section.id}-${i}`]).length;

  return (
    <Panel>
      <PanelHead label={section.label} icon={ICONS[section.icon]} accent={section.accent} done={done} total={section.items.length} />
      {section.items.map((item, i) => (
        <ItemRow
          key={i}
          label={item}
          done={!!checked[`${section.id}-${i}`]}
          onToggle={() => toggleItem(`${section.id}-${i}`)}
          isLast={i === section.items.length - 1}
        />
      ))}
    </Panel>
  );
}
