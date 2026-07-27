import type { Lead, LeadsSummary, Deal, AgentRegistryEntry, AgentStatus, FileBankEntry } from "./types";
import { enqueueWrite } from "./offlineQueue";

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function fetchLeads() {
  return get<{ leads: Lead[]; summary: LeadsSummary }>("/api/leads");
}

export function fetchDeals() {
  return get<{ deals: Deal[] }>("/api/deals");
}

export function fetchAgents() {
  return get<{ agents: AgentRegistryEntry[] }>("/api/agents");
}

export function fetchFiles(scope: "scout" | "closer") {
  return get<{ files: FileBankEntry[] }>(`/api/files?scope=${scope}`);
}

export interface OutreachScript {
  dm: string;
  emailSubject: string;
  emailBody: string;
  callPoints: string[];
}

export function fetchOutreachScript(leadId: string) {
  return get<{ script: OutreachScript | null }>(`/api/leads/${leadId}/scripts`);
}

// --- Writes: go through the offline queue so a rep never loses work to a dead signal. ---

export function logTouchpoint(leadId: string, channel: "text" | "call" | "email", label: string) {
  return enqueueWrite({ method: "POST", url: `/api/leads/${leadId}/touchpoint`, body: { channel }, label });
}

export function patchLead(leadId: string, patch: Record<string, unknown>, label: string) {
  return enqueueWrite({ method: "PATCH", url: `/api/leads/${leadId}`, body: patch, label });
}

export function createOrUpdateDeal(
  body: {
    leadId: string;
    businessName: string;
    callDate: string;
    outcome?: string;
    sourceSubAgent?: string;
    packagePitched?: string | null;
    objectionsLogged?: string;
  },
  label: string,
) {
  return enqueueWrite({ method: "POST", url: `/api/deals`, body, label });
}

export function patchDeal(dealId: string, patch: Record<string, unknown>, label: string) {
  return enqueueWrite({ method: "PATCH", url: `/api/deals/${dealId}`, body: patch, label });
}

export function patchAgentStatus(agentId: string, status: AgentStatus, label: string) {
  return enqueueWrite({ method: "PATCH", url: `/api/agents/${agentId}`, body: { status }, label });
}

export async function requestFileUpload(scope: "scout" | "closer", file: File) {
  const res = await fetch("/api/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scope, filename: file.name, contentType: file.type || "application/octet-stream" }),
  });
  if (!res.ok) throw new Error("Could not prepare upload");
  const { key, uploadUrl } = (await res.json()) as { key: string; uploadUrl: string };

  const putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!putRes.ok) throw new Error("Upload to storage failed");
  return key;
}

export function deleteFile(key: string) {
  return fetch("/api/files/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}
