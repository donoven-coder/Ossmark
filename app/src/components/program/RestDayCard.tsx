import { Panel } from "../ui/Panel";

export function RestDayCard() {
  return (
    <Panel>
      <div className="px-4 py-7 text-center">
        <div className="mb-1.5 text-[15px] text-(--color-ink)">Rest Day</div>
        <div className="text-[12px] text-(--color-ink-dimmer)">
          No lift scheduled for Sunday — browse the week above if you want to preview.
        </div>
      </div>
    </Panel>
  );
}
