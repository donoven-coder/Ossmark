import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import type { Lead, Deal } from "../../lib/types";
import { DEAL_OUTCOME_OPTIONS, PACKAGES, type DealOutcome, type PackagePitched } from "../../lib/types";
import { CALL_SCRIPT, OBJECTIONS_NOTE, PRICING_RULE_NOTE, VALUE_STACK_STATUS } from "../../lib/callScript";
import { useCreateOrUpdateDeal } from "../../hooks/useDeals";

export function Cockpit({ leads, deals }: { leads: Lead[]; deals: Deal[] }) {
  const [collapsed, setCollapsed] = useState(false);
  const relevantLeads = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const rank = (l: Lead) => (l.leadStatus === "Agreed" || l.leadStatus === "Booked" ? 0 : l.leadStatus === "Initiated" ? 1 : 2);
        return rank(a) - rank(b);
      }),
    [leads],
  );
  const [selectedId, setSelectedId] = useState(relevantLeads[0]?.id);
  const selectedLead = leads.find((l) => l.id === selectedId) ?? relevantLeads[0];
  const existingDeal = selectedLead ? deals.find((d) => d.leadIds.includes(selectedLead.id)) : undefined;

  const [priceRevealed, setPriceRevealed] = useState(false);
  const [openBlock, setOpenBlock] = useState<number | null>(null);
  const [draftOutcome, setDraftOutcome] = useState<DealOutcome | "">(existingDeal?.outcome ?? "");
  const [draftPackage, setDraftPackage] = useState<PackagePitched | "">(existingDeal?.packagePitched ?? "");
  const [draftObjections, setDraftObjections] = useState(existingDeal?.objectionsLogged ?? "");
  const saveMutation = useCreateOrUpdateDeal();

  if (!selectedLead) {
    return <div className="text-[12px] text-(--color-sub) italic">No leads yet to run a call cockpit against.</div>;
  }

  const callDate = new Date().toISOString().slice(0, 10);
  const dealNamePreview = `${selectedLead.businessName} - ${callDate}`;
  const callNumber = selectedLead.leadStatus === "Initiated" ? "Call 2 (re-engagement)" : "Call 1 (first discovery call)";
  const packagePitchedAllowed = !!draftOutcome && draftOutcome !== "Pending";

  const selectLead = (id: string) => {
    setSelectedId(id);
    const deal = deals.find((d) => d.leadIds.includes(id));
    setDraftOutcome(deal?.outcome ?? "");
    setDraftPackage(deal?.packagePitched ?? "");
    setDraftObjections(deal?.objectionsLogged ?? "");
    setPriceRevealed(false);
  };

  const save = () => {
    saveMutation.mutate({
      leadId: selectedLead.id,
      businessName: selectedLead.businessName,
      callDate,
      outcome: draftOutcome || undefined,
      packagePitched: packagePitchedAllowed ? draftPackage || null : null,
      objectionsLogged: draftObjections,
    });
  };

  return (
    <div className="rounded-3xl border border-(--color-violet) bg-(--color-panel) p-4.5 shadow-[0_8px_30px_#A855F71A]">
      <div className="mb-3 flex items-center justify-between">
        <div className="font-display flex items-center gap-2 text-[16px] font-semibold">
          <span className="h-[7px] w-[7px] rounded-full bg-(--color-violet)" />
          Discovery Call Cockpit
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-1.5 rounded-full border border-(--color-line) bg-(--color-panel2) px-3 py-1.25 text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase"
        >
          <motion.span animate={{ rotate: collapsed ? -90 : 0 }}>
            <ChevronDown size={12} />
          </motion.span>
          {collapsed ? "Expand" : "Minimize"}
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-[520px] overflow-y-auto pr-1.5">
          <select
            value={selectedLead.id}
            onChange={(e) => selectLead(e.target.value)}
            className="mb-2.5 w-full rounded-xl border border-(--color-line) bg-(--color-panel2) p-3 text-[13px] font-bold text-(--color-ink)"
          >
            {relevantLeads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.businessName} {l.leadStatus ? `· ${l.leadStatus}` : ""}
              </option>
            ))}
          </select>

          <div className="mb-2.5 rounded-xl bg-(--color-panel2) px-3 py-2.5 text-[10.5px] leading-relaxed text-(--color-sub)">
            Deal Name on save: <b className="text-(--color-ink)">{dealNamePreview}</b> · <b className="text-(--color-ink)">{callNumber}</b>
          </div>

          <StatusChip
            label="Website Link"
            value={
              existingDeal?.siteLink ? (
                <a href={existingDeal.siteLink} target="_blank" rel="noreferrer" className="text-(--color-violet)">
                  {existingDeal.siteLink}
                </a>
              ) : (
                "Empty — Site Builder sub-agent is Idle, no site has been built yet for this lead."
              )
            }
          />
          <StatusChip label="Value Stack Slide" value={VALUE_STACK_STATUS} />

          <div className="font-display mt-4 mb-2 text-[13px] font-semibold">Call Script</div>
          <div className="mb-3.5 overflow-hidden rounded-xl border border-(--color-line)">
            {CALL_SCRIPT.map((b, i) => (
              <div key={i} className="border-b border-(--color-line) last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenBlock(openBlock === i ? null : i)}
                  className="flex w-full items-center justify-between bg-(--color-panel2) px-3.5 py-2.75 text-left"
                >
                  <div>
                    <div className="text-[9.5px] font-extrabold tracking-wide text-(--color-violet)">{b.block}</div>
                    <div className="mt-0.5 text-[12px] font-bold">{b.title}</div>
                  </div>
                  <span className="text-[14px] text-(--color-violet)">{openBlock === i ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {openBlock === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pt-1 pb-3.5 text-[11.5px] leading-relaxed text-(--color-sub)">{b.body}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="mb-3.5 rounded-xl bg-(--color-panel2) px-3 py-2.5 text-[10px] leading-relaxed text-(--color-sub)">
            This is the only word-for-word script that currently exists (first-call / discovery call). There's no
            separate "Call 2" script built yet for Reconnect or Follow Up stage leads.
          </div>

          {!priceRevealed ? (
            <button
              type="button"
              onClick={() => setPriceRevealed(true)}
              className="w-full rounded-2xl border-[1.5px] border-dashed border-(--color-violet) bg-linear-to-br from-[#241B33] to-(--color-panel2) py-5.5 text-center"
            >
              <Lock size={22} className="mx-auto mb-2 text-(--color-violet)" />
              <div className="text-[11px] font-extrabold tracking-wide text-(--color-sub) uppercase">Tap to Reveal Pricing</div>
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {PACKAGES.map((p) => (
                <div key={p.value} className="flex items-center justify-between border-b border-(--color-line) py-2.5 last:border-b-0">
                  <div className="text-[12.5px] font-bold">{p.label}</div>
                  <div className="font-display text-[17px] font-bold text-(--color-gold)">
                    ${p.price.toLocaleString()} <span className="font-body text-[10px] text-(--color-sub)">{p.unit}</span>
                  </div>
                </div>
              ))}

              <div className="mt-3.5 space-y-3">
                <div>
                  <div className="mb-1 text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase">Outcome</div>
                  <div className="flex flex-wrap gap-1.5">
                    {DEAL_OUTCOME_OPTIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => {
                          setDraftOutcome(o);
                          if (o === "Pending") setDraftPackage("");
                        }}
                        className={`rounded-lg border-[1.5px] px-2.5 py-1.5 text-[11px] font-bold ${
                          draftOutcome === o
                            ? "border-(--color-violet) bg-(--color-violet)/13 text-(--color-violet)"
                            : "border-(--color-line) text-(--color-sub)"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase">
                    Package Pitched {!packagePitchedAllowed && "(set Outcome first)"}
                  </div>
                  <select
                    value={draftPackage}
                    disabled={!packagePitchedAllowed}
                    onChange={(e) => setDraftPackage(e.target.value as PackagePitched)}
                    className="w-full rounded-lg border border-(--color-line) bg-(--color-panel2) p-2.5 text-[12px] font-bold text-(--color-ink) disabled:opacity-40"
                  >
                    <option value="">— none yet —</option>
                    {PACKAGES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label} (${p.price.toLocaleString()} {p.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-1 text-[10px] font-extrabold tracking-wide text-(--color-sub) uppercase">Objections Logged</div>
                  <textarea
                    value={draftObjections}
                    onChange={(e) => setDraftObjections(e.target.value)}
                    rows={3}
                    placeholder="The prospect's actual words, not a paraphrased category…"
                    className="w-full rounded-lg border border-(--color-line) bg-(--color-panel2) p-2.5 text-[12px] text-(--color-ink) placeholder:text-(--color-sub)"
                  />
                </div>

                <button
                  type="button"
                  onClick={save}
                  disabled={saveMutation.isPending || !draftOutcome}
                  className="w-full rounded-xl bg-linear-to-br from-(--color-violet) to-(--color-violet-dim) py-3 text-[12.5px] font-extrabold text-(--color-ink) disabled:opacity-40"
                >
                  {saveMutation.isPending ? "Saving…" : "Save Call Outcome"}
                </button>
              </div>

              <div className="mt-3.5 rounded-xl bg-(--color-panel2) p-3 text-[10.5px] leading-relaxed text-(--color-sub)">
                {OBJECTIONS_NOTE}
                <br />
                <br />
                {PRICING_RULE_NOTE}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusChip({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-2.5 rounded-xl border border-(--color-line) bg-(--color-panel2) p-2.5">
      <div className="mb-1 text-[9px] font-extrabold tracking-wide text-(--color-sub) uppercase">{label}</div>
      <div className="text-[11px] font-semibold text-(--color-sub) italic">{value}</div>
    </div>
  );
}
