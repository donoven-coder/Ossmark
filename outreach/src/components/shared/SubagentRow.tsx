import { motion } from "framer-motion";
import type { AgentRegistryEntry, AgentStatus } from "../../lib/types";

const STATUS_COLOR: Record<AgentStatus, string> = {
  "Not started": "#8B85A0",
  "In progress": "#22C55E",
  Idle: "#8B85A0",
  Done: "#22D3EE",
};

export function SubagentRow({
  agents,
  onSelect,
}: {
  agents: AgentRegistryEntry[];
  onSelect?: (agent: AgentRegistryEntry) => void;
}) {
  return (
    <div className="flex gap-2.5">
      {agents.map((a) => {
        const color = a.status ? STATUS_COLOR[a.status] : "#8B85A0";
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onSelect?.(a)}
            disabled={!onSelect}
            className="flex-1 rounded-2xl border border-(--color-line) bg-(--color-panel) px-2.5 py-3.5 text-center disabled:cursor-default"
          >
            <motion.div
              className="mx-auto mb-1.5 h-2 w-2 rounded-full"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
              animate={a.status === "In progress" ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={{ duration: 1.8, repeat: a.status === "In progress" ? Infinity : 0 }}
            />
            <div className="text-[11px] font-extrabold">{a.agentName}</div>
            <div className="mt-0.5 text-[9px] font-bold tracking-wide text-(--color-sub) uppercase">{a.status ?? "—"}</div>
            {a.lastActive && <div className="mt-0.5 text-[8.5px] text-(--color-sub)">active {a.lastActive}</div>}
          </button>
        );
      })}
    </div>
  );
}
