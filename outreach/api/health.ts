import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    time: new Date().toISOString(),
    notionConfigured: !!process.env.NOTION_TOKEN,
    r2Configured: !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_BUCKET),
    apifyConfigured: !!process.env.APIFY_TOKEN,
  });
}
