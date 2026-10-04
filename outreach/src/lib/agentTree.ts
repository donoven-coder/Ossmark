import type { AgentRegistryEntry } from "./types";

export function findDepartment(agents: AgentRegistryEntry[], name: "SCOUT" | "CLOSER"): AgentRegistryEntry | undefined {
  return agents.find((a) => a.level === "Department" && a.agentName === name);
}

export function subAgentsOf(agents: AgentRegistryEntry[], dept: AgentRegistryEntry | undefined): AgentRegistryEntry[] {
  if (!dept) return [];
  const ids = new Set(dept.subAgentIds);
  return agents.filter((a) => ids.has(a.id));
}
