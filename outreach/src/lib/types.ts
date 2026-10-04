/**
 * Frontend-owned copies of the backend's domain types (from
 * lib/notion/mappers.ts). Deliberately duplicated rather than imported —
 * `lib/notion/client.ts` throws if it's ever evaluated in a browser context
 * as a last-resort guard against the Notion token shipping to the client;
 * keeping the frontend from importing anything under lib/notion/ at all,
 * even type-only, means that guarantee doesn't depend on bundler type-import
 * elision working correctly. Keep these in sync with lib/notion/mappers.ts
 * and lib/notion/schema.ts by hand.
 */

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

export const AGENT_STATUS_OPTIONS = ["Not started", "In progress", "Idle", "Done"] as const;
export type AgentStatus = (typeof AGENT_STATUS_OPTIONS)[number];

export interface Lead {
  id: string;
  url: string;
  businessName: string;
  niche: string | null;
  score: number | null;
  runningMetaAdsPoorly: boolean;
  leadStatus: LeadStatus | null;
  leadSource: string | null;
  sourceSubAgent: string | null;
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

export interface LeadsSummary {
  total: number;
  qualified: number;
  untouched: number;
  metaAdsChecked: number;
  byStatus: Record<string, number>;
  byNiche: Record<string, number>;
  bySourceSubAgent: Record<string, number>;
  instagramGap: number;
}

export type DealIntegrity = "ok" | "orphan_no_lead" | "blank";

export interface Deal {
  id: string;
  url: string;
  dealName: string;
  leadIds: string[];
  clientIds: string[];
  outcome: DealOutcome | null;
  packagePitched: PackagePitched | null;
  callDate: string | null;
  sourceSubAgent: string | null;
  objectionsLogged: string;
  siteLink: string | null;
  lastEditedTime: string;
  integrity: DealIntegrity;
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

export interface FileBankEntry {
  key: string;
  filename: string;
  scope: "scout" | "closer";
  sizeBytes: number;
  uploadedAt: string;
  downloadUrl: string;
}
