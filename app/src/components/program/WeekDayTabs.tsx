import { Panel } from "../ui/Panel";
import { TabButton } from "../ui/TabButton";
import { useProgramStore } from "../../store/useProgramStore";
import { DAY_NAMES, WEEK_KEYS, PROGRAM_DATA, type WeekKey } from "../../data/programData";

export function WeekDayTabs() {
  const currentWeek = useProgramStore((s) => s.currentWeek);
  const currentDayIdx = useProgramStore((s) => s.currentDayIdx);
  const setWeek = useProgramStore((s) => s.setWeek);
  const setDay = useProgramStore((s) => s.setDay);

  const days = PROGRAM_DATA.program[currentWeek];

  return (
    <Panel>
      <div className="flex flex-wrap gap-1.5 border-b border-(--color-border) px-4 py-3">
        {WEEK_KEYS.map((w: WeekKey) => (
          <TabButton key={w} active={w === currentWeek} onClick={() => setWeek(w)}>
            {w}
          </TabButton>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 px-4 py-3">
        {days.map((_, i) => (
          <TabButton key={i} active={i === currentDayIdx} onClick={() => setDay(i)}>
            {DAY_NAMES[i].slice(0, 3).toUpperCase()}
          </TabButton>
        ))}
      </div>
      <div className="font-mono-app px-4 pb-3 text-[9.5px] tracking-wide text-(--color-ink-faint)">
        TODAY AUTO-SELECTED FROM WEEKDAY — TAP TO BROWSE OTHER DAYS · WEEK DEFAULTS TO WEEK 1, TAP TO SWITCH
      </div>
    </Panel>
  );
}
