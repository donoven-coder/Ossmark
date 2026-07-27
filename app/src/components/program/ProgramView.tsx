import { useEffect, useMemo, useState } from "react";
import { RotateCcw, RefreshCcw, Dumbbell } from "lucide-react";
import { ViewHero } from "../layout/ViewHero";
import { Reveal } from "../ui/Reveal";
import { Panel, PanelHead } from "../ui/Panel";
import { TrainingMaxPanel } from "./TrainingMaxPanel";
import { WeekDayTabs } from "./WeekDayTabs";
import { LiftBlock } from "./LiftBlock";
import { AssistancePanel } from "./AssistancePanel";
import { RestDayCard } from "./RestDayCard";
import { useProgramStore } from "../../store/useProgramStore";
import { PROGRAM_DATA, MAIN_TM_KEY, WEEK_SCHEME } from "../../data/programData";
import { mainSetsFor } from "../../lib/trainingMax";
import { autoDayIndex, formatDateTag, isRestDay, todayDate } from "../../lib/date";

export function ProgramView() {
  const date = useMemo(() => todayDate(), []);
  const currentWeek = useProgramStore((s) => s.currentWeek);
  const currentDayIdx = useProgramStore((s) => s.currentDayIdx);
  const tm = useProgramStore((s) => s.tm);
  const checkedSets = useProgramStore((s) => s.checkedSets);
  const toggleSet = useProgramStore((s) => s.toggleSet);
  const resetDaySets = useProgramStore((s) => s.resetDaySets);
  const resetMaxes = useProgramStore((s) => s.resetMaxes);
  const lastTMEdit = useProgramStore((s) => s.lastTMEdit);

  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  useEffect(() => {
    if (!lastTMEdit) return;
    setHighlightKey(lastTMEdit.key);
    const t = setTimeout(() => setHighlightKey(null), 900);
    return () => clearTimeout(t);
  }, [lastTMEdit]);

  const autoIdx = autoDayIndex(date);
  const restToday = isRestDay(date) && currentDayIdx === autoIdx;

  const days = PROGRAM_DATA.program[currentWeek];
  const day = days[currentDayIdx];
  const tmKey = MAIN_TM_KEY[currentDayIdx];
  const scheme = WEEK_SCHEME[currentWeek];

  const liftIds: string[] = [];
  const liftSetsByLift = day.lifts.map((lift, li) => {
    const sets = li === 0 ? mainSetsFor(currentDayIdx, currentWeek, lift.sets, tm) : lift.sets;
    const ids = sets.map((_, si) => `${currentWeek}-${currentDayIdx}-l${li}-s${si}`);
    liftIds.push(...ids);
    return { lift, sets, ids };
  });

  const assistanceItems = day.assistance ? day.assistance.split("|").map((s) => s.trim()) : [];
  const assistanceIds = assistanceItems.map((_, ai) => `${currentWeek}-${currentDayIdx}-a${ai}`);

  const dayIds = restToday ? [] : [...liftIds, ...assistanceIds];
  const done = dayIds.filter((id) => checkedSets[id]).length;
  const total = dayIds.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const liftDone = liftIds.filter((id) => checkedSets[id]).length;

  const dayLabel = restToday ? "REST DAY" : day.day.toUpperCase();

  return (
    <div>
      <ViewHero
        eyebrow="WORKOUT PROGRAM"
        completeEyebrow="DAY COMPLETE"
        title="n-Suns 531 LP"
        dateTag={formatDateTag(date)}
        pct={pct}
        done={done}
        total={total}
        tag={`${currentWeek.toUpperCase()} · ${dayLabel}`}
        accent="#FF5C47"
      />

      <div className="mx-auto max-w-[640px] px-4 pt-5">
        <Reveal index={0}>
          <TrainingMaxPanel highlightKey={highlightKey} />
        </Reveal>
        <Reveal index={1}>
          <WeekDayTabs />
        </Reveal>

        {restToday ? (
          <Reveal index={2}>
            <RestDayCard />
          </Reveal>
        ) : (
          <>
            <Reveal index={2}>
            <Panel>
              <PanelHead label={day.day} icon={Dumbbell} accent="#FF5C47" done={liftDone} total={liftIds.length} />
              {liftSetsByLift.map(({ lift, sets, ids }, li) => (
                <LiftBlock
                  key={li}
                  name={lift.name}
                  sub={li === 0 ? `${tmKey} TM · ${scheme.pct.join("/")}% for the first 3 sets` : undefined}
                  sets={sets}
                  idsFor={(si) => ids[si]}
                  checkedSets={checkedSets}
                  onToggle={toggleSet}
                  justChangedFor={
                    li === 0 ? (si) => si < 3 && (highlightKey === tmKey || highlightKey === "*") : undefined
                  }
                  isLast={li === liftSetsByLift.length - 1}
                />
              ))}
            </Panel>
            </Reveal>

            {day.assistance && (
              <Reveal index={3}>
                <AssistancePanel assistance={day.assistance} idsFor={(i) => assistanceIds[i]} />
              </Reveal>
            )}
          </>
        )}

        <div className="mt-5 flex flex-wrap justify-center gap-2.5 pb-2">
          <button
            type="button"
            onClick={() => resetDaySets(dayIds)}
            className="font-mono-app flex items-center gap-1.5 rounded-full border border-(--color-border) px-4 py-2 text-[11px] tracking-wide text-(--color-ink-dimmer) active:scale-95"
          >
            <RotateCcw size={12} />
            RESET TODAY'S SETS
          </button>
          <button
            type="button"
            onClick={resetMaxes}
            className="font-mono-app flex items-center gap-1.5 rounded-full border border-(--color-border) px-4 py-2 text-[11px] tracking-wide text-(--color-ink-dimmer) active:scale-95"
          >
            <RefreshCcw size={12} />
            RESET MAXES TO SHEET
          </button>
        </div>
      </div>
    </div>
  );
}
