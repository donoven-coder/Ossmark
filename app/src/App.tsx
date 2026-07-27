import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav } from "./components/layout/BottomNav";
import { TodayView } from "./components/today/TodayView";
import { ProgramView } from "./components/program/ProgramView";
import { useTodayStore } from "./store/useTodayStore";
import { useProgramStore } from "./store/useProgramStore";

export type ViewKey = "today" | "program";

function App() {
  const [view, setView] = useState<ViewKey>("today");
  const checkTodayRollover = useTodayStore((s) => s.checkDayRollover);
  const checkProgramRollover = useProgramStore((s) => s.checkDayRollover);

  useEffect(() => {
    checkTodayRollover();
    checkProgramRollover();
  }, [checkTodayRollover, checkProgramRollover]);

  return (
    <div className="mx-auto min-h-dvh max-w-[640px] pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {view === "today" ? <TodayView /> : <ProgramView />}
        </motion.div>
      </AnimatePresence>
      <BottomNav view={view} onChange={setView} />
    </div>
  );
}

export default App;
