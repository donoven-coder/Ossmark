import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../../lib/http";
import { getLeadById, updateLead } from "../../../lib/notion/repository";
import { touchpointSchema } from "../../../lib/validation/schemas";
import { computeTouchpointPatch } from "../../../lib/validation/rules";
import { logInfo } from "../../../lib/logging";

/**
 * The Text/Call/Email tap-through, wired exactly as the brief's example
 * describes: logs that a touchpoint happened (Messaged Date), and if the
 * lead has no status yet, moves it to Initiated — so the UI action and the
 * CRM state never drift apart.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  const id = req.query.id as string;

  try {
    const { channel } = parseBody(req, touchpointSchema);
    const lead = await getLeadById(id);
    if (!lead) return void res.status(404).json({ error: "Lead not found" });

    const patch = computeTouchpointPatch(lead.leadStatus, new Date().toISOString());
    const updated = await updateLead(id, patch);
    logInfo("touchpoint_logged", { leadId: id, channel, statusMoved: !!patch.leadStatus });

    res.status(200).json({ lead: updated });
  } catch (err) {
    handleApiError(res, err);
  }
}
