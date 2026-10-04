import type { NotionPage } from "./client.js";
import { LEAD_FIELDS, DEAL_FIELDS, AGENT_FIELDS } from "./schema.js";
import type {
  LeadStatus,
  LeadSource,
  Niche,
  ScoutSubAgent,
  CloserSubAgent,
  DealOutcome,
  PackagePitched,
  AgentStatus,
} from "./schema.js";
import * as P from "./props.js";

export interface Lead {
  id: string;
  url: string;
  businessName: string;
  niche: Niche | null;
  score: number | null;
  runningMetaAdsPoorly: boolean;
  leadStatus: LeadStatus | null;
  leadSource: LeadSource | null;
  sourceSubAgent: ScoutSubAgent | null;
  qualified: boolean;
  booked: boolean;
  instagram: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  city: string;
  notes: string;
  optInWord: string;
  messagedDate: string | null;
  followUpDate: string | null;
  dateBooked: string | null;
  dateSigned: string | null;
  dealIds: string[];
  internalStatus: string | null;
  lastEditedTime: string;
}

export function toLead(page: NotionPage): Lead {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    businessName: P.readTitle(p, LEAD_FIELDS.businessName),
    niche: P.readSelect(p, LEAD_FIELDS.niche) as Niche | null,
    score: P.readNumber(p, LEAD_FIELDS.score),
    runningMetaAdsPoorly: P.readCheckbox(p, LEAD_FIELDS.runningMetaAdsPoorly),
    leadStatus: P.readSelect(p, LEAD_FIELDS.leadStatus) as LeadStatus | null,
    leadSource: P.readSelect(p, LEAD_FIELDS.leadSource) as LeadSource | null,
    sourceSubAgent: P.readSelect(p, LEAD_FIELDS.sourceSubAgent) as ScoutSubAgent | null,
    qualified: P.readCheckbox(p, LEAD_FIELDS.qualified),
    booked: P.readCheckbox(p, LEAD_FIELDS.booked),
    instagram: P.readRichText(p, LEAD_FIELDS.instagram),
    email: P.readEmail(p, LEAD_FIELDS.email),
    phone: P.readPhone(p, LEAD_FIELDS.phone),
    website: P.readUrl(p, LEAD_FIELDS.website),
    city: P.readRichText(p, LEAD_FIELDS.city),
    notes: P.readRichText(p, LEAD_FIELDS.notes),
    optInWord: P.readRichText(p, LEAD_FIELDS.optInWord),
    messagedDate: P.readDateStart(p, LEAD_FIELDS.messagedDate),
    followUpDate: P.readDateStart(p, LEAD_FIELDS.followUpDate),
    dateBooked: P.readDateStart(p, LEAD_FIELDS.dateBooked),
    dateSigned: P.readDateStart(p, LEAD_FIELDS.dateSigned),
    dealIds: P.readRelationIds(p, LEAD_FIELDS.deal),
    internalStatus: P.readStatus(p, LEAD_FIELDS.status),
    lastEditedTime: page.last_edited_time,
  };
}

/** Partial patch -> Notion property JSON. Only included keys are written. */
export function buildLeadPatch(patch: Partial<Omit<Lead, "id" | "url" | "dealIds" | "lastEditedTime">>) {
  const props: Record<string, unknown> = {};
  if (patch.businessName !== undefined) props[LEAD_FIELDS.businessName] = P.titleProp(patch.businessName);
  if (patch.niche !== undefined) props[LEAD_FIELDS.niche] = P.selectProp(patch.niche);
  if (patch.score !== undefined) props[LEAD_FIELDS.score] = P.numberProp(patch.score);
  if (patch.runningMetaAdsPoorly !== undefined)
    props[LEAD_FIELDS.runningMetaAdsPoorly] = P.checkboxProp(patch.runningMetaAdsPoorly);
  if (patch.leadStatus !== undefined) props[LEAD_FIELDS.leadStatus] = P.selectProp(patch.leadStatus);
  if (patch.leadSource !== undefined) props[LEAD_FIELDS.leadSource] = P.selectProp(patch.leadSource);
  if (patch.sourceSubAgent !== undefined) props[LEAD_FIELDS.sourceSubAgent] = P.selectProp(patch.sourceSubAgent);
  if (patch.qualified !== undefined) props[LEAD_FIELDS.qualified] = P.checkboxProp(patch.qualified);
  if (patch.booked !== undefined) props[LEAD_FIELDS.booked] = P.checkboxProp(patch.booked);
  if (patch.instagram !== undefined) props[LEAD_FIELDS.instagram] = P.richTextProp(patch.instagram);
  if (patch.email !== undefined) props[LEAD_FIELDS.email] = P.emailProp(patch.email);
  if (patch.phone !== undefined) props[LEAD_FIELDS.phone] = P.phoneProp(patch.phone);
  if (patch.website !== undefined) props[LEAD_FIELDS.website] = P.urlProp(patch.website);
  if (patch.notes !== undefined) props[LEAD_FIELDS.notes] = P.richTextProp(patch.notes);
  if (patch.messagedDate !== undefined) props[LEAD_FIELDS.messagedDate] = P.dateProp(patch.messagedDate);
  if (patch.followUpDate !== undefined) props[LEAD_FIELDS.followUpDate] = P.dateProp(patch.followUpDate);
  if (patch.dateBooked !== undefined) props[LEAD_FIELDS.dateBooked] = P.dateProp(patch.dateBooked);
  if (patch.dateSigned !== undefined) props[LEAD_FIELDS.dateSigned] = P.dateProp(patch.dateSigned);
  if (patch.internalStatus !== undefined) props[LEAD_FIELDS.status] = P.statusProp(patch.internalStatus);
  return props;
}

export interface Deal {
  id: string;
  url: string;
  dealName: string;
  leadIds: string[];
  clientIds: string[];
  outcome: DealOutcome | null;
  packagePitched: PackagePitched | null;
  callDate: string | null;
  sourceSubAgent: CloserSubAgent | null;
  objectionsLogged: string;
  siteLink: string | null;
  lastEditedTime: string;
}

export function toDeal(page: NotionPage): Deal {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    dealName: P.readTitle(p, DEAL_FIELDS.dealName),
    leadIds: P.readRelationIds(p, DEAL_FIELDS.lead),
    clientIds: P.readRelationIds(p, DEAL_FIELDS.client),
    outcome: P.readSelect(p, DEAL_FIELDS.outcome) as DealOutcome | null,
    packagePitched: P.readSelect(p, DEAL_FIELDS.packagePitched) as PackagePitched | null,
    callDate: P.readDateStart(p, DEAL_FIELDS.callDate),
    sourceSubAgent: P.readSelect(p, DEAL_FIELDS.sourceSubAgent) as CloserSubAgent | null,
    objectionsLogged: P.readRichText(p, DEAL_FIELDS.objectionsLogged),
    siteLink: P.readUrl(p, DEAL_FIELDS.siteLink),
    lastEditedTime: page.last_edited_time,
  };
}

export function buildDealPatch(patch: Partial<Omit<Deal, "id" | "url" | "leadIds" | "clientIds" | "lastEditedTime">>) {
  const props: Record<string, unknown> = {};
  if (patch.dealName !== undefined) props[DEAL_FIELDS.dealName] = P.titleProp(patch.dealName);
  if (patch.outcome !== undefined) props[DEAL_FIELDS.outcome] = P.selectProp(patch.outcome);
  if (patch.packagePitched !== undefined) props[DEAL_FIELDS.packagePitched] = P.selectProp(patch.packagePitched);
  if (patch.callDate !== undefined) props[DEAL_FIELDS.callDate] = P.dateProp(patch.callDate);
  if (patch.sourceSubAgent !== undefined) props[DEAL_FIELDS.sourceSubAgent] = P.selectProp(patch.sourceSubAgent);
  if (patch.objectionsLogged !== undefined)
    props[DEAL_FIELDS.objectionsLogged] = P.richTextProp(patch.objectionsLogged);
  if (patch.siteLink !== undefined) props[DEAL_FIELDS.siteLink] = P.urlProp(patch.siteLink);
  return props;
}

export function buildDealLeadRelation(leadId: string) {
  return { [DEAL_FIELDS.lead]: P.relationProp([leadId]) };
}

export interface AgentRegistryEntry {
  id: string;
  url: string;
  agentName: string;
  level: "CEO" | "Department" | "Sub-Agent" | null;
  status: AgentStatus | null;
  reportsToIds: string[];
  subAgentIds: string[];
  systemPromptNotes: string;
  lastActive: string | null;
  lastEditedTime: string;
}

export function toAgent(page: NotionPage): AgentRegistryEntry {
  const p = page.properties;
  return {
    id: page.id,
    url: page.url,
    agentName: P.readTitle(p, AGENT_FIELDS.agentName),
    level: P.readSelect(p, AGENT_FIELDS.level) as AgentRegistryEntry["level"],
    status: P.readSelect(p, AGENT_FIELDS.status) as AgentStatus | null,
    reportsToIds: P.readRelationIds(p, AGENT_FIELDS.reportsTo),
    subAgentIds: P.readRelationIds(p, AGENT_FIELDS.subAgents),
    systemPromptNotes: P.readRichText(p, AGENT_FIELDS.systemPromptNotes),
    lastActive: P.readDateStart(p, AGENT_FIELDS.lastActive),
    lastEditedTime: page.last_edited_time,
  };
}

export function buildAgentStatusPatch(status: AgentStatus) {
  return { [AGENT_FIELDS.status]: P.selectProp(status) };
}
