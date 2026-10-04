import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, handleApiError } from "../../lib/http.js";
import { listAllAgents } from "../../lib/notion/repository.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET"])) return;
  try {
    const agents = await listAllAgents();
    res.status(200).json({ agents });
  } catch (err) {
    handleApiError(res, err);
  }
}
