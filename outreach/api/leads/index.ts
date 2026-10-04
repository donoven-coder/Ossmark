import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, handleApiError } from "../../lib/http.js";
import { listAllLeads } from "../../lib/notion/repository.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET"])) return;
  try {
    const leads = await listAllLeads();

    const summary = {
      total: leads.length,
      qualified: leads.filter((l) => l.qualified).length,
      untouched: leads.filter((l) => !l.messagedDate && !l.leadStatus).length,
      metaAdsChecked: leads.filter((l) => l.runningMetaAdsPoorly).length,
      byStatus: countBy(leads, (l) => l.leadStatus ?? "New / No Status"),
      byNiche: countBy(
        leads.filter((l) => l.niche),
        (l) => l.niche as string,
      ),
      bySourceSubAgent: countBy(
        leads.filter((l) => l.sourceSubAgent),
        (l) => l.sourceSubAgent as string,
      ),
      instagramGap: leads.filter((l) => l.leadSource?.startsWith("Instagram") && !l.instagram.trim()).length,
    };

    res.status(200).json({ leads, summary });
  } catch (err) {
    handleApiError(res, err);
  }
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}
