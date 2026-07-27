import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../lib/http";
import { getLeadById, updateLead, createOrUpdateDealForLead } from "../../lib/notion/repository";
import { leadPatchSchema } from "../../lib/validation/schemas";
import { isCloserHandoffStatus } from "../../lib/validation/rules";
import { logInfo } from "../../lib/logging";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET", "PATCH"])) return;
  const id = req.query.id as string;

  try {
    if (req.method === "GET") {
      const lead = await getLeadById(id);
      if (!lead) return void res.status(404).json({ error: "Lead not found" });
      return void res.status(200).json({ lead });
    }

    const before = await getLeadById(id);
    const patch = parseBody(req, leadPatchSchema);
    const lead = await updateLead(id, patch);

    // The real SCOUT -> CLOSER handoff trigger: a Lead reaching Agreed/Booked
    // creates (or, per CLOSER's own dedup rule, updates) its Deal row, so
    // Outreach/Site Builder/Objection Handler have something real to act on
    // instead of staying Idle with nothing to point at.
    let dealHandoff: { dealId: string; created: boolean } | undefined;
    const statusJustReachedHandoff = isCloserHandoffStatus(lead.leadStatus) && before?.leadStatus !== lead.leadStatus;
    if (statusJustReachedHandoff) {
      const { deal, created } = await createOrUpdateDealForLead({
        leadId: lead.id,
        businessName: lead.businessName,
        callDate: new Date().toISOString().slice(0, 10),
      });
      dealHandoff = { dealId: deal.id, created };
      logInfo("closer_handoff_triggered", { leadId: id, leadStatus: lead.leadStatus, dealId: deal.id, created });
    }

    res.status(200).json({ lead, dealHandoff });
  } catch (err) {
    handleApiError(res, err);
  }
}
