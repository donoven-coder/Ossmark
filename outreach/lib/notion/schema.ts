/**
 * Ground truth for the Notion schema this app talks to — pulled directly from
 * the live workspace (via `notion-fetch` on each data source), not
 * reconstructed from the prototype snapshot. Field names, select options, and
 * data source IDs below are verified against Notion as of 2026-07-27.
 *
 * IMPORTANT — decoy databases exist in this workspace:
 *   - A second, unrelated database is also titled "Leads Database" (under
 *     "AUTHORITY FUNNEL DATA" / "Client Menu"). It has a completely different
 *     schema (Opt In/Manual/Cold/Hot Convo/... status options, no Score, no
 *     Niche, no Running Meta Ads Poorly). Do NOT point this app at it.
 *   - SCOUT's own System Prompt Notes warn against a second decoy, a data
 *     source literally named "LeadsDatabase2.0-EXAMPLE" — inert, unused.
 * The IDs below are the ones SCOUT and CLOSER's own Agent Registry entries
 * name as their real write targets.
 */

export const NOTION = {
  leadsDataSourceId: "266b9e70-03ea-8265-97af-07de7848d68d",
  dealsDataSourceId: "1f2b9e70-03ea-83ac-9d14-8722b17d1c65",
  agentRegistryDataSourceId: "32cb9e70-03ea-82e9-aeb6-0709a7861440",
} as const;

export const LEAD_STATUS_OPTIONS = [
  "Initiated",
  "Media Seen",
  "Engaged",
  "Agreed",
  "Reconnect",
  "Follow Up",
  "Disqualified",
  "Not Interested",
  "Booked",
  "Signed",
] as const;
export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number];

/** Lead Status values that hand a Lead off from SCOUT to CLOSER. */
export const CLOSER_HANDOFF_STATUSES: readonly LeadStatus[] = ["Agreed", "Booked"];

export const LEAD_SOURCE_OPTIONS = [
  "Instagram Opt In",
  "Instagram Follower",
  "Referral",
  "Outbound Email",
  "Momentum Campaign",
  "Cold Call",
  "Cold Dm",
] as const;
export type LeadSource = (typeof LEAD_SOURCE_OPTIONS)[number];

export const NICHE_OPTIONS = [
  "HVAC",
  "Med Spa",
  "Roofing",
  "Plumbing",
  "Real Estate",
  "Chiropractor",
  "Dentist",
  "Personal Injury Attorney",
] as const;
export type Niche = (typeof NICHE_OPTIONS)[number];

export const SOURCE_SUBAGENT_OPTIONS_SCOUT = ["Scraper", "Enrichment", "Qualifier"] as const;
export type ScoutSubAgent = (typeof SOURCE_SUBAGENT_OPTIONS_SCOUT)[number];

export const SOURCE_SUBAGENT_OPTIONS_CLOSER = ["Outreach", "Site Builder", "Objection Handler"] as const;
export type CloserSubAgent = (typeof SOURCE_SUBAGENT_OPTIONS_CLOSER)[number];

/** Internal per-lead sub-agent task status — distinct from Lead Status. */
export const LEAD_INTERNAL_STATUS_OPTIONS = ["Not started", "In progress", "Done"] as const;

export const DEAL_OUTCOME_OPTIONS = ["Pending", "Ads Program Yes", "Site Only", "Not Now"] as const;
export type DealOutcome = (typeof DEAL_OUTCOME_OPTIONS)[number];

export const PACKAGE_PITCHED_OPTIONS = [
  "Site-Only 497",
  "Growth Engine 1497",
  "Domination 2500",
  "Performance 5000",
] as const;
export type PackagePitched = (typeof PACKAGE_PITCHED_OPTIONS)[number];

export const PACKAGES: { value: PackagePitched; label: string; price: number; unit: string }[] = [
  { value: "Site-Only 497", label: "Site-Only", price: 497, unit: "one-time" },
  { value: "Growth Engine 1497", label: "Growth Engine", price: 1497, unit: "/mo" },
  { value: "Domination 2500", label: "Domination", price: 2500, unit: "/mo" },
  { value: "Performance 5000", label: "Performance", price: 5000, unit: "/mo" },
];

export const AGENT_LEVEL_OPTIONS = ["CEO", "Department", "Sub-Agent"] as const;
export const AGENT_STATUS_OPTIONS = ["Not started", "In progress", "Idle", "Done"] as const;
export type AgentStatus = (typeof AGENT_STATUS_OPTIONS)[number];

/** Notion property-name constants for the Leads data source. */
export const LEAD_FIELDS = {
  businessName: "Business Name",
  niche: "Niche",
  score: "Score",
  runningMetaAdsPoorly: "Running Meta Ads Poorly",
  leadStatus: "Lead Status",
  leadSource: "Lead Source",
  sourceSubAgent: "Source Sub-Agent",
  qualified: "Qualified",
  booked: "Booked",
  instagram: "Instagram",
  email: "Email",
  phone: "Phone",
  website: "Website",
  city: "City",
  notes: "Notes",
  optInWord: "Opt In Word",
  messagedDate: "Messaged Date",
  followUpDate: "Follow Up Date",
  dateBooked: "Date Booked",
  dateSigned: "Date Signed",
  deal: "Deal",
  status: "Status",
} as const;

/** Notion property-name constants for the Deals data source. */
export const DEAL_FIELDS = {
  dealName: "Deal Name",
  lead: "Lead",
  client: "Client",
  outcome: "Outcome",
  packagePitched: "Package Pitched",
  callDate: "Call Date",
  sourceSubAgent: "Source Sub-Agent",
  objectionsLogged: "Objections Logged",
  siteLink: "Site Link",
} as const;

/** Notion property-name constants for the Agent Registry data source. */
export const AGENT_FIELDS = {
  agentName: "Agent Name",
  level: "Level",
  status: "Status",
  reportsTo: "Reports To",
  subAgents: "Sub-Agents",
  systemPromptNotes: "System Prompt Notes",
  lastActive: "Last Active",
} as const;

/** The FB Ad Library check, exactly as validated in the source prototype. */
export const FB_AD_CHECK = {
  actor: "apify/facebook-ads-scraper",
  priorActor: "automation-lab/facebook-ads-library",
  priorActorResult: "TIMED-OUT, 0 items in 300s across 5 leads",
  /** Still the actor named in SCOUT's live System Prompt Notes as of this build — a known, open gap. */
  actorNameNotYetUpdatedInAgentRegistry: true,
} as const;
