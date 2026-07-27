import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../lib/http";
import { listAllLeads, updateLead } from "../../lib/notion/repository";
import { fbAdCheckJobSchema } from "../../lib/validation/schemas";
import { checkFacebookAds, type AdCheckResult } from "../../lib/apify/fbAdsCheck";
import { logInfo, logError } from "../../lib/logging";

/**
 * The FB Ad Library coverage batch job — validated on 1 lead in the source
 * prototype (Superior Comfort Heating & Cooling), with ~150 still
 * uncovered. Chunked into small batches (Vercel serverless functions have
 * execution-time limits), safe by design: without `confirm: true` in the
 * body it's a dry run that only reports which leads WOULD be checked and
 * what it would cost, spending nothing and writing nothing.
 *
 * Even with confirm:true, this never auto-writes "Running Meta Ads Poorly."
 * That flag is a judgment call ("are they running ads, badly") — the actor
 * only tells us ad counts and dates. Results are appended to the lead's
 * Notes field as evidence for a human to confirm from the dashboard.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;

  try {
    const { limit, confirm } = parseBody(req, fbAdCheckJobSchema);
    const leads = await listAllLeads();

    const candidates = leads
      .filter((l) => l.qualified && !l.runningMetaAdsPoorly && !l.notes.includes("[FB Ad Library check"))
      .slice(0, limit);

    if (!confirm) {
      return void res.status(200).json({
        dryRun: true,
        candidateCount: candidates.length,
        candidates: candidates.map((l) => ({ id: l.id, businessName: l.businessName })),
        estimatedCostUsd: Number((candidates.length * 10 * 0.0058).toFixed(4)), // ~10 ads/lead at Free-tier pricing
        note: "Nothing was run or written. POST again with confirm: true to actually execute.",
      });
    }

    const results: { leadId: string; businessName: string; ok: boolean; result?: AdCheckResult; error?: string }[] = [];

    for (const lead of candidates) {
      try {
        const result = await checkFacebookAds(lead.businessName);
        const note = `[FB Ad Library check ${new Date().toISOString().slice(0, 10)}]: ${result.adsFound} active ad(s) found${result.oldestAdStart ? `, oldest since ${result.oldestAdStart}` : ""}. Needs human review to confirm "poorly."`;
        await updateLead(lead.id, { notes: `${lead.notes}\n${note}`.trim() });
        results.push({ leadId: lead.id, businessName: lead.businessName, ok: true, result });
        logInfo("fb_ad_check_completed", { leadId: lead.id, adsFound: result.adsFound });
      } catch (err) {
        results.push({ leadId: lead.id, businessName: lead.businessName, ok: false, error: (err as Error).message });
        logError("fb_ad_check_failed", { leadId: lead.id, error: (err as Error).message });
      }
    }

    res.status(200).json({ dryRun: false, processed: results.length, results });
  } catch (err) {
    handleApiError(res, err);
  }
}
