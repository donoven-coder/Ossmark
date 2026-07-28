import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, handleApiError } from "../../../lib/http.js";
import { getPageBlocks } from "../../../lib/notion/client.js";
import { parseOutreachDrafts } from "../../../lib/notion/scripts.js";
import { cached } from "../../../lib/notion/cache.js";

/**
 * Fetched lazily — only when a rep actually expands a lead's script
 * accordion in the UI, not as part of the bulk Leads list. Outreach Drafts
 * live as page content, not a data-source property, so this is a separate
 * per-page block fetch; caching it briefly means re-expanding the same
 * lead within a few minutes doesn't re-hit Notion.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET"])) return;
  const id = req.query.id as string;

  try {
    const blocks = await cached(`lead-blocks:${id}`, () => getPageBlocks(id), 5 * 60_000);
    const script = parseOutreachDrafts(blocks);
    res.status(200).json({ script });
  } catch (err) {
    handleApiError(res, err);
  }
}
