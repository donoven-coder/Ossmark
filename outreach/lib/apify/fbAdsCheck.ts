/**
 * The Facebook/Meta Ad Library check, using the actor validated in the
 * source prototype (`apify/facebook-ads-scraper`, 98.4% success rate vs.
 * the prior `automation-lab/facebook-ads-library`, which timed out with 0
 * items across 5 leads in testing).
 *
 * Real input-schema note (pulled live from Apify, not assumed): this actor
 * takes `startUrls` — Meta Ad Library or Facebook Page URLs — not a plain
 * business-name search string the way the prior/broken actor did. Our Leads
 * data source has no "Facebook Page URL" field, so there's no exact Page ID
 * to target per lead. This job instead constructs a Meta Ad Library
 * *keyword* search URL from the lead's Business Name. That's a real,
 * working query — but keyword search is looser than an exact Page ID match
 * (a common business name can surface a similarly-named unrelated page).
 * Closing that precisely would mean capturing each lead's actual Facebook
 * Page URL (a schema gap, not just a code gap) — see README "Known gaps."
 *
 * Pricing: this actor is pay-per-event (~$0.0058/ad on the Free tier as of
 * this build) — real spend on every run, which is exactly why this module
 * is wired up but never called automatically. See /api/jobs/fb-ad-check.
 */

const APIFY_ACTOR = "apify/facebook-ads-scraper";
const APIFY_RUN_SYNC_URL = `https://api.apify.com/v2/acts/${encodeURIComponent(APIFY_ACTOR)}/run-sync-get-dataset-items`;

function getApifyToken(): string {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("APIFY_TOKEN is not set. Required as a server-side env var to run the FB Ad Library check.");
  }
  return token;
}

function buildAdLibrarySearchUrl(businessName: string): string {
  const q = encodeURIComponent(businessName);
  return `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${q}&search_type=keyword_unordered`;
}

export interface AdCheckResult {
  businessName: string;
  searchUrl: string;
  adsFound: number;
  oldestAdStart: string | null;
  distinctCreativeCount: number;
  raw: unknown[];
}

/**
 * Runs the actor for one lead and returns the raw signal. Deliberately does
 * NOT decide "Running Meta Ads Poorly" — that's a qualitative judgment
 * (is the ad spend being wasted, not just "do ads exist"), which the source
 * prototype's own proof case shows was a human call, not a pure classifier
 * output. This function surfaces the evidence; a human confirms the flag.
 */
export async function checkFacebookAds(businessName: string, resultsLimit = 10): Promise<AdCheckResult> {
  const searchUrl = buildAdLibrarySearchUrl(businessName);
  const res = await fetch(`${APIFY_RUN_SYNC_URL}?token=${getApifyToken()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [{ url: searchUrl }],
      resultsLimit,
      activeStatus: "active",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify actor run failed (${res.status}): ${body}`);
  }

  const items = (await res.json()) as any[];
  const startDates = items.map((i) => i?.startDate ?? i?.ad_delivery_start_time).filter(Boolean).sort();

  return {
    businessName,
    searchUrl,
    adsFound: items.length,
    oldestAdStart: startDates[0] ?? null,
    distinctCreativeCount: new Set(items.map((i) => i?.adArchiveId ?? i?.ad_archive_id)).size,
    raw: items,
  };
}
