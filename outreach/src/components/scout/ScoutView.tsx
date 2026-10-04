import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useLeads } from "../../hooks/useLeads";
import { useAgents } from "../../hooks/useAgents";
import { Panel, SectionTitle } from "../shared/Panel";
import { StatCard } from "../shared/StatCard";
import { AlertCard } from "../shared/AlertCard";
import { SubagentRow } from "../shared/SubagentRow";
import { MixBar } from "../shared/MixBar";
import { LeadCard } from "./LeadCard";
import { findDepartment, subAgentsOf } from "../../lib/agentTree";
import { FileBank } from "../shared/FileBank";

const PAGE_SIZE = 20;

export function ScoutView() {
  const leadsQuery = useLeads();
  const agentsQuery = useAgents();
  const [queueMinimized, setQueueMinimized] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (leadsQuery.isError) return <ErrorPanel message={(leadsQuery.error as Error).message} onRetry={() => leadsQuery.refetch()} />;
  if (!leadsQuery.data) return <LoadingPanels />;

  const { leads, summary } = leadsQuery.data!;
  const scoutDept = agentsQuery.data ? findDepartment(agentsQuery.data.agents, "SCOUT") : undefined;
  const scoutAgents = agentsQuery.data ? subAgentsOf(agentsQuery.data.agents, scoutDept) : [];

  const untouchedList = leads.filter((l) => !l.messagedDate && !l.leadStatus);
  const visibleLeads = leads.slice(0, visibleCount);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
      <Panel>
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard value={summary.total} label="Total Leads" tone="gold" />
          <StatCard value={summary.qualified} label="Qualified" />
          <StatCard value={untouchedList.length} label="Never Contacted" tone="warn" />
        </div>
      </Panel>

      <Panel>
        <SectionTitle>SCOUT — sub-agents</SectionTitle>
        {scoutAgents.length > 0 ? (
          <SubagentRow agents={scoutAgents} />
        ) : (
          <div className="text-[11px] text-(--color-sub) italic">Loading Agent Registry…</div>
        )}
      </Panel>

      <AlertCard tone="warn" title="Instagram field is empty on active Instagram leads" className="md:col-span-2">
        <b>{summary.instagramGap}</b> lead{summary.instagramGap === 1 ? "" : "s"} have a Lead Source of Instagram Opt
        In / Instagram Follower but no Instagram handle on file — DM currently has to route through SMS as a
        workaround. This count is computed live from Notion, not hardcoded.
      </AlertCard>

      <AlertCard tone="info" title="Facebook Ad Library check — validated, coverage still low" className="md:col-span-2">
        Prior actor <b>automation-lab/facebook-ads-library</b>: timed out, 0 items in 300s across 5 leads. Switched
        to <b>apify/facebook-ads-scraper</b> (official Apify) — succeeded in testing. Coverage today:{" "}
        <b>
          {summary.metaAdsChecked} of {summary.qualified}
        </b>{" "}
        qualified leads checked. The batch job to scale this across the rest is built (see Settings → FB Ad Library
        job) but not run automatically — each check costs real Apify credits.
      </AlertCard>

      <Panel>
        <SectionTitle>Niche Mix</SectionTitle>
        <MixBar data={summary.byNiche} />
      </Panel>

      <Panel>
        <SectionTitle>Source Mix</SectionTitle>
        <MixBar data={summary.bySourceSubAgent} />
      </Panel>

      <Panel wide>
        <div className="mb-2.5 flex items-center justify-between">
          <SectionTitle>Lead Queue</SectionTitle>
          <button
            type="button"
            onClick={() => setQueueMinimized((m) => !m)}
            className="flex items-center gap-1.5 rounded-full border border-(--color-line) bg-(--color-panel) px-3 py-1.25 text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase"
          >
            <motion.span animate={{ rotate: queueMinimized ? -90 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={12} />
            </motion.span>
            {queueMinimized ? "Expand" : "Minimize"}
          </button>
        </div>
        {!queueMinimized && (
          <div className="max-h-[480px] overflow-y-auto pr-1">
            {visibleLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
            {visibleCount < leads.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="mt-1 w-full rounded-xl border border-(--color-line) py-2.5 text-[11px] font-bold text-(--color-sub)"
              >
                Show {Math.min(PAGE_SIZE, leads.length - visibleCount)} more of {leads.length - visibleCount} remaining
              </button>
            )}
          </div>
        )}
      </Panel>

      <Panel wide>
        <SectionTitle>File Bank — SCOUT</SectionTitle>
        <FileBank scope="scout" />
      </Panel>
    </div>
  );
}

function LoadingPanels() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Panel key={i}>
          <div className="h-24 animate-pulse rounded-xl bg-(--color-panel2)" />
        </Panel>
      ))}
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <AlertCard tone="warn" title="Couldn't load live data from Notion">
      {message}
      <button type="button" onClick={onRetry} className="mt-2 block font-bold text-(--color-ink) underline">
        Retry
      </button>
    </AlertCard>
  );
}
