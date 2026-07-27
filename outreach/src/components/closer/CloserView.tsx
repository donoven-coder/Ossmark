import { useLeads } from "../../hooks/useLeads";
import { useDeals } from "../../hooks/useDeals";
import { useAgents } from "../../hooks/useAgents";
import { Panel, SectionTitle } from "../shared/Panel";
import { SubagentRow } from "../shared/SubagentRow";
import { AlertCard } from "../shared/AlertCard";
import { Funnel } from "./Funnel";
import { DealPipeline } from "./DealPipeline";
import { Cockpit } from "./Cockpit";
import { OutcomePlaybook } from "./OutcomePlaybook";
import { FileBank } from "../shared/FileBank";
import { findDepartment, subAgentsOf } from "../../lib/agentTree";

export function CloserView() {
  const leadsQuery = useLeads();
  const dealsQuery = useDeals();
  const agentsQuery = useAgents();

  if (leadsQuery.isError || dealsQuery.isError || agentsQuery.isError) {
    return (
      <AlertCard tone="warn" title="Couldn't load live data from Notion">
        {((leadsQuery.error ?? dealsQuery.error ?? agentsQuery.error) as Error)?.toString()}
      </AlertCard>
    );
  }
  if (!leadsQuery.data || !dealsQuery.data || !agentsQuery.data) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Panel wide>
          <div className="h-32 animate-pulse rounded-xl bg-(--color-panel2)" />
        </Panel>
      </div>
    );
  }

  const { leads } = leadsQuery.data!;
  const { deals } = dealsQuery.data!;
  const { agents } = agentsQuery.data!;

  const closerDept = findDepartment(agents, "CLOSER");
  const closerAgents = subAgentsOf(agents, closerDept);
  const handoffEligible = leads.filter((l) => l.leadStatus === "Agreed" || l.leadStatus === "Booked" || l.leadStatus === "Signed");
  const initiatedCount = leads.filter((l) => l.leadStatus === "Initiated").length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-start">
      <Panel wide>
        <SectionTitle accent="violet">CLOSER — {closerDept?.status ?? "—"}</SectionTitle>
        {closerAgents.length > 0 && <SubagentRow agents={closerAgents} />}
        <div className="mt-2.5 px-0.5 text-[11px] leading-relaxed text-(--color-sub)">
          {deals.length > 0 ? (
            <>
              <b className="text-(--color-ink)">{deals.length}</b> deal{deals.length === 1 ? "" : "s"} now exist from
              the SCOUT → CLOSER handoff — sub-agents have real work to act on.
            </>
          ) : handoffEligible.length > 0 ? (
            <>
              <b className="text-(--color-ink)">{handoffEligible.length}</b> lead(s) have reached Agreed/Booked but no
              Deal row exists yet for them — check the handoff trigger.
            </>
          ) : (
            <>
              All 3 sub-agents correctly Idle — SCOUT has <b className="text-(--color-ink)">{initiatedCount}</b>{" "}
              Initiated lead{initiatedCount === 1 ? "" : "s"} but none have reached a booked call yet, so there's no
              handoff event to trigger Outreach/Site Builder/Objection Handler. Not a broken handoff — the pipeline
              just hasn't produced one yet.
            </>
          )}
        </div>
      </Panel>

      <Panel>
        <SectionTitle accent="violet">Full Funnel — where leads actually are</SectionTitle>
        <Funnel leads={leads} />
      </Panel>

      <Panel>
        <SectionTitle accent="violet">Deal Pipeline</SectionTitle>
        <DealPipeline deals={deals} />
      </Panel>

      <div className="md:col-span-2">
        <Cockpit leads={leads} deals={deals} />
      </div>

      <Panel wide>
        <SectionTitle accent="violet">Post-Call Outcome Playbook</SectionTitle>
        <OutcomePlaybook />
      </Panel>

      <Panel wide>
        <SectionTitle accent="violet">File Bank — CLOSER</SectionTitle>
        <FileBank scope="closer" />
      </Panel>
    </div>
  );
}
