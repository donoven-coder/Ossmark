import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDeals, createOrUpdateDeal, patchDeal } from "../lib/api";

export const DEALS_KEY = ["deals"] as const;

export function useDeals() {
  return useQuery({
    queryKey: DEALS_KEY,
    queryFn: fetchDeals,
    staleTime: 30_000,
  });
}

export function useCreateOrUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      leadId: string;
      businessName: string;
      callDate: string;
      outcome?: string;
      sourceSubAgent?: string;
      packagePitched?: string | null;
      objectionsLogged?: string;
    }) => createOrUpdateDeal(params, `Save call outcome — ${params.businessName}`),
    onSettled: () => qc.invalidateQueries({ queryKey: DEALS_KEY }),
  });
}

export function usePatchDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, patch, label }: { dealId: string; patch: Record<string, unknown>; label: string }) =>
      patchDeal(dealId, patch, label),
    onSettled: () => qc.invalidateQueries({ queryKey: DEALS_KEY }),
  });
}
