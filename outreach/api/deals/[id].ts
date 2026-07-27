import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../lib/http";
import { listAllDeals, updateDeal } from "../../lib/notion/repository";
import { dealPatchSchema } from "../../lib/validation/schemas";
import { assertPackagePitchedAllowed, ValidationError } from "../../lib/validation/rules";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["PATCH"])) return;
  const id = req.query.id as string;

  try {
    const patch = parseBody(req, dealPatchSchema);

    if (patch.packagePitched !== undefined && patch.packagePitched !== null) {
      const deals = await listAllDeals();
      const current = deals.find((d) => d.id === id);
      if (!current) throw new ValidationError("Deal not found");
      const outcome = patch.outcome ?? current.outcome;
      assertPackagePitchedAllowed(outcome);
    }

    const deal = await updateDeal(id, patch);
    res.status(200).json({ deal });
  } catch (err) {
    handleApiError(res, err);
  }
}
