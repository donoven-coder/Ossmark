import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAgents, patchAgentStatus } from "../lib/api";
import type { AgentStatus } from "../lib/types";

export const AGENTS_KEY = ["agents"] as const;

export function useAgents() {
  return useQuery({
    queryKey: AGENTS_KEY,
    queryFn: fetchAgents,
    staleTime: 30_000,
  });
}

export function usePatchAgentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, status, label }: { agentId: string; status: AgentStatus; label: string }) =>
      patchAgentStatus(agentId, status, label),
    onSettled: () => qc.invalidateQueries({ queryKey: AGENTS_KEY }),
  });
}
