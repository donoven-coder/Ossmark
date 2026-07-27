import { queryDataSource, updatePage, createPage, type NotionPage } from "./client";
import { cached, getStale, invalidate } from "./cache";
import { NOTION, DEAL_FIELDS, LEAD_FIELDS } from "./schema";
import {
  toLead,
  toDeal,
  toAgent,
  buildLeadPatch,
  buildDealPatch,
  buildDealLeadRelation,
  buildAgentStatusPatch,
  type Lead,
  type Deal,
  type AgentRegistryEntry,
} from "./mappers";
import type { AgentStatus } from "./schema";
import { logInfo, logWriteFailure } from "../logging";

async function queryAllPages(dataSourceId: string, body: Record<string, unknown> = {}): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await queryDataSource(dataSourceId, { ...body, page_size: 100, start_cursor: cursor });
    pages.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return pages;
}

export async function listAllLeads(): Promise<Lead[]> {
  try {
    const pages = await cached("leads:all", () => queryAllPages(NOTION.leadsDataSourceId));
    return pages.map(toLead);
  } catch (err) {
    const stale = getStale<NotionPage[]>("leads:all");
    if (stale) {
      logInfo("leads_serving_stale_on_error", { count: stale.length });
      return stale.map(toLead);
    }
    throw err;
  }
}

export async function listAllDeals(): Promise<Deal[]> {
  try {
    const pages = await cached("deals:all", () => queryAllPages(NOTION.dealsDataSourceId));
    return pages.map(toDeal);
  } catch (err) {
    const stale = getStale<NotionPage[]>("deals:all");
    if (stale) return stale.map(toDeal);
    throw err;
  }
}

export async function listAllAgents(): Promise<AgentRegistryEntry[]> {
  try {
    const pages = await cached("agents:all", () => queryAllPages(NOTION.agentRegistryDataSourceId));
    return pages.map(toAgent);
  } catch (err) {
    const stale = getStale<NotionPage[]>("agents:all");
    if (stale) return stale.map(toAgent);
    throw err;
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const leads = await listAllLeads();
  return leads.find((l) => l.id === id) ?? null;
}

export async function updateLead(id: string, patch: Parameters<typeof buildLeadPatch>[0]): Promise<Lead> {
  try {
    const page = await updatePage(id, buildLeadPatch(patch));
    invalidate("leads:");
    return toLead(page);
  } catch (err) {
    logWriteFailure({ entity: "lead", entityId: id, action: "update", payload: patch, error: err });
    throw err;
  }
}

/**
 * CLOSER's own rule (from its Agent Registry System Prompt Notes): "Before
 * creating a new Deal row, check the linked Lead doesn't already have one —
 * one Deal per Lead, update the existing row on re-engagement rather than
 * duplicating." This is the enforcement point for that rule.
 */
export async function findDealForLead(leadId: string): Promise<Deal | null> {
  const deals = await listAllDeals();
  return deals.find((d) => d.leadIds.includes(leadId)) ?? null;
}

export async function createOrUpdateDealForLead(params: {
  leadId: string;
  businessName: string;
  callDate: string;
  outcome?: Deal["outcome"];
  sourceSubAgent?: Deal["sourceSubAgent"];
  packagePitched?: Deal["packagePitched"];
  objectionsLogged?: string;
}): Promise<{ deal: Deal; created: boolean }> {
  const existing = await findDealForLead(params.leadId);
  const dealName = `${params.businessName} - ${params.callDate}`;

  if (existing) {
    try {
      const page = await updatePage(
        existing.id,
        buildDealPatch({
          dealName,
          callDate: params.callDate,
          ...(params.outcome !== undefined ? { outcome: params.outcome } : {}),
          ...(params.sourceSubAgent !== undefined ? { sourceSubAgent: params.sourceSubAgent } : {}),
          ...(params.packagePitched !== undefined ? { packagePitched: params.packagePitched } : {}),
          ...(params.objectionsLogged !== undefined ? { objectionsLogged: params.objectionsLogged } : {}),
        }),
      );
      invalidate("deals:");
      return { deal: toDeal(page), created: false };
    } catch (err) {
      logWriteFailure({ entity: "deal", entityId: existing.id, action: "update_on_reengagement", payload: params, error: err });
      throw err;
    }
  }

  try {
    const page = await createPage(NOTION.dealsDataSourceId, {
      ...buildDealPatch({
        dealName,
        callDate: params.callDate,
        outcome: params.outcome ?? "Pending",
        sourceSubAgent: params.sourceSubAgent,
        packagePitched: params.packagePitched,
        objectionsLogged: params.objectionsLogged,
      }),
      ...buildDealLeadRelation(params.leadId),
    });
    invalidate("deals:");
    return { deal: toDeal(page), created: true };
  } catch (err) {
    logWriteFailure({ entity: "deal", action: "create", payload: params, error: err });
    throw err;
  }
}

export async function updateDeal(id: string, patch: Parameters<typeof buildDealPatch>[0]): Promise<Deal> {
  try {
    const page = await updatePage(id, buildDealPatch(patch));
    invalidate("deals:");
    return toDeal(page);
  } catch (err) {
    logWriteFailure({ entity: "deal", entityId: id, action: "update", payload: patch, error: err });
    throw err;
  }
}

export async function updateAgentStatus(id: string, status: AgentStatus): Promise<AgentRegistryEntry> {
  try {
    const page = await updatePage(id, buildAgentStatusPatch(status));
    invalidate("agents:");
    return toAgent(page);
  } catch (err) {
    logWriteFailure({ entity: "agent", entityId: id, action: "update_status", payload: { status }, error: err });
    throw err;
  }
}

export { LEAD_FIELDS, DEAL_FIELDS };
