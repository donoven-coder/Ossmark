import type { VercelRequest, VercelResponse } from "@vercel/node";
import { methodGuard, parseBody, handleApiError } from "../../lib/http.js";
import { updateAgentStatus } from "../../lib/notion/repository.js";
import { agentStatusPatchSchema } from "../../lib/validation/schemas.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["PATCH"])) return;
  const id = req.query.id as string;

  try {
    const { status } = parseBody(req, agentStatusPatchSchema);
    const agent = await updateAgentStatus(id, status);
    res.status(200).json({ agent });
  } catch (err) {
    handleApiError(res, err);
  }
}
