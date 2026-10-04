import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScoutView } from "./components/scout/ScoutView";
import { CloserView } from "./components/closer/CloserView";
import { SyncIssuesBanner } from "./components/shared/SyncIssuesBanner";
import { Mark } from "./components/shared/Mark";

type View = "scout" | "closer";

function App() {
  const [view, setView] = useState<View>("scout");

  return (
    <div>
      <header className="relative px-5 pt-6.5 pb-4.5 text-center">
        <div className="mx-auto max-w-270">
          <Mark />
          <h1 className="font-display text-[26px] font-semibold tracking-tight">
            OSSMARK{" "}
            <span className="bg-linear-to-r from-(--color-gold) via-[#F5D98A] to-(--color-gold) bg-clip-text text-transparent">
              COMMAND
            </span>
          </h1>
          <div className="mt-1 text-[11px] font-bold tracking-[3px] text-(--color-sub) uppercase">
            SCOUT + CLOSER · OUTREACH INTELLIGENCE
          </div>

          <div className="mx-auto mt-5.5 flex max-w-80 gap-1 rounded-2xl border border-(--color-line) bg-(--color-panel) p-1">
            <TabButton active={view === "scout"} tone="gold" onClick={() => setView("scout")}>
              SCOUT
            </TabButton>
            <TabButton active={view === "closer"} tone="violet" onClick={() => setView("closer")}>
              CLOSER
            </TabButton>
          </div>
        </div>
      </header>

      <SyncIssuesBanner />

      <main className="mx-auto max-w-270 px-4.5 pt-6.5 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            {view === "scout" ? <ScoutView /> : <CloserView />}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="pb-8 text-center text-[9.5px] font-bold tracking-[1.5px] text-(--color-sub) uppercase">
        Live from Notion + Agent Registry + Apify
      </div>
    </div>
  );
}

function TabButton({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "gold" | "violet";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex-1 rounded-xl py-2.75 text-[12.5px] font-extrabold tracking-wide text-(--color-sub)"
    >
      {active && (
        <motion.div
          layoutId="tab-active-bg"
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              tone === "gold"
                ? "linear-gradient(135deg, var(--color-gold), var(--color-gold-dim))"
                : "linear-gradient(135deg, var(--color-violet), var(--color-violet-dim))",
            boxShadow: tone === "gold" ? "0 4px 20px #E8B84B4D" : "0 4px 20px #A855F74D",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      )}
      <span className={`relative ${active ? (tone === "gold" ? "text-[#1A1408]" : "text-(--color-ink)") : ""}`}>
        {children}
      </span>
    </button>
  );
}

export default App;
