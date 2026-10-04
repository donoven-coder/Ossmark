import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, Mail, ExternalLink } from "lucide-react";
import type { Lead } from "../../lib/types";
import { StatusPill } from "../shared/StatusPill";
import { useOutreachScript } from "../../hooks/useLeads";
import { useLogTouchpoint } from "../../hooks/useLeads";

export function LeadCard({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);
  const scriptQuery = useOutreachScript(lead.id, open);
  const touchpoint = useLogTouchpoint();

  const log = (channel: "text" | "call" | "email") => {
    void touchpoint.mutateAsync({ leadId: lead.id, channel, businessName: lead.businessName });
  };

  return (
    <div className="mb-2 rounded-2xl border border-(--color-line) bg-(--color-panel) p-3.5 transition-colors active:border-(--color-gold)">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 text-left"
      >
        <div className="font-display flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-full border-[1.5px] border-(--color-gold) text-[15px] font-bold text-(--color-gold)">
          {lead.score ?? "—"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-bold">{lead.businessName}</div>
          <div className="mt-0.5 text-[10.5px] tracking-wide text-(--color-sub)">
            {lead.niche ?? "No niche"} · via {lead.sourceSubAgent ?? "unknown"}
          </div>
          {lead.runningMetaAdsPoorly && (
            <div className="mt-1 inline-block rounded-full bg-(--color-crimson)/13 px-1.75 py-0.5 text-[8.5px] font-extrabold tracking-wide text-[#FCA5A5] uppercase">
              Running Meta Ads — verified live
            </div>
          )}
        </div>
        <StatusPill status={lead.leadStatus} />
      </button>

      <div className="mt-2.5 flex gap-2">
        <ActionButton icon={MessageCircle} label="Text" onClick={() => log("text")} href={lead.phone ? `sms:${lead.phone}` : undefined} />
        <ActionButton icon={Phone} label="Call" onClick={() => log("call")} href={lead.phone ? `tel:${lead.phone}` : undefined} />
        <ActionButton icon={Mail} label="Email" onClick={() => log("email")} href={lead.email ? `mailto:${lead.email}` : undefined} />
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2.5 flex items-center gap-1 text-[9.5px] font-extrabold tracking-wide text-(--color-violet) uppercase"
      >
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={11} />
        </motion.span>
        Channel scripts
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 border-t border-(--color-line) pt-2.5">
              {scriptQuery.isLoading && <div className="text-[10.5px] text-(--color-sub) italic">Loading…</div>}
              {scriptQuery.data?.script ? (
                <div className="space-y-2.5">
                  <ScriptBlock label="DM">{scriptQuery.data.script.dm}</ScriptBlock>
                  <ScriptBlock label="Email">
                    <b className="text-(--color-ink)">{scriptQuery.data.script.emailSubject}</b>
                    <br />
                    {scriptQuery.data.script.emailBody}
                  </ScriptBlock>
                  <ScriptBlock label="Cold Call">
                    <ul className="list-disc space-y-1 pl-3.5">
                      {scriptQuery.data.script.callPoints.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </ScriptBlock>
                </div>
              ) : (
                scriptQuery.isFetched && (
                  <div className="text-[10.5px] text-(--color-sub) italic">
                    No Outreach Drafts found on this lead's Notion page yet.{" "}
                    <a href={lead.website ?? "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-(--color-violet) not-italic">
                      Open in Notion <ExternalLink size={9} />
                    </a>
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScriptBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 text-[9px] font-extrabold tracking-wide text-(--color-violet) uppercase">{label}</div>
      <div className="rounded-lg bg-(--color-panel2) px-2.5 py-2 text-[11px] leading-relaxed text-(--color-sub)">{children}</div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  href,
}: {
  icon: typeof MessageCircle;
  label: string;
  onClick: () => void;
  href?: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      aria-disabled={!href}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-(--color-line) bg-(--color-panel2) py-2 text-[10.5px] font-bold text-(--color-ink) active:scale-95 aria-disabled:pointer-events-none aria-disabled:opacity-40"
    >
      <Icon size={13} />
      {label}
    </a>
  );
}
