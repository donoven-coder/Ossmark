import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../lib/http";
import { listAllDeals, createOrUpdateDealForLead } from "../../lib/notion/repository";
import { dealCreateSchema } from "../../lib/validation/schemas";
import { assertDealHasLead, assertPackagePitchedAllowed, classifyDealIntegrity } from "../../lib/validation/rules";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET", "POST"])) return;

  try {
    if (req.method === "GET") {
      const deals = await listAllDeals();
      const withIntegrity = deals.map((d) => ({ ...d, integrity: classifyDealIntegrity(d) }));
      return void res.status(200).json({ deals: withIntegrity });
    }

    const body = parseBody(req, dealCreateSchema);
    assertDealHasLead(body.leadId);
    if (body.packagePitched) {
      assertPackagePitchedAllowed(body.outcome);
    }
    const { deal, created } = await createOrUpdateDealForLead(body);
    res.status(created ? 201 : 200).json({ deal, created });
  } catch (err) {
    handleApiError(res, err);
  }
}
