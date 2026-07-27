import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, fetchOutreachScript, logTouchpoint, patchLead } from "../lib/api";
import type { Lead } from "../lib/types";
import { DEALS_KEY } from "./useDeals";

export const LEADS_KEY = ["leads"] as const;

/** Lazy — only fires while `enabled` (i.e. the lead's script accordion is open). */
export function useOutreachScript(leadId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["lead-script", leadId],
    queryFn: () => fetchOutreachScript(leadId),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useLeads() {
  return useQuery({
    queryKey: LEADS_KEY,
    queryFn: fetchLeads,
    staleTime: 30_000,
  });
}

function useOptimisticLeadPatch() {
  const qc = useQueryClient();
  return (leadId: string, patch: Partial<Lead>) => {
    qc.setQueryData<Awaited<ReturnType<typeof fetchLeads>>>(LEADS_KEY, (old) => {
      if (!old) return old;
      return { ...old, leads: old.leads.map((l) => (l.id === leadId ? { ...l, ...patch } : l)) };
    });
  };
}

export function useLogTouchpoint() {
  const applyOptimistic = useOptimisticLeadPatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ leadId, channel, businessName }: { leadId: string; channel: "text" | "call" | "email"; businessName: string }) => {
      applyOptimistic(leadId, { messagedDate: new Date().toISOString() });
      return logTouchpoint(leadId, channel, `Logged ${channel} touchpoint — ${businessName}`);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: LEADS_KEY }),
  });
}

export function usePatchLead() {
  const applyOptimistic = useOptimisticLeadPatch();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      leadId,
      patch,
      label,
    }: {
      leadId: string;
      patch: Record<string, unknown>;
      label: string;
    }) => {
      applyOptimistic(leadId, patch as Partial<Lead>);
      return patchLead(leadId, patch, label);
    },
    onSettled: () => {
      // A leadStatus patch can trigger the server-side CLOSER handoff
      // (Agreed/Booked -> Deal created/updated), so refresh both.
      qc.invalidateQueries({ queryKey: LEADS_KEY });
      qc.invalidateQueries({ queryKey: DEALS_KEY });
    },
  });
}
