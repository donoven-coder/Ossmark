import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { methodGuard, parseBody, handleApiError } from "../../lib/http.js";
import { deleteFile } from "../../lib/storage/r2.js";
import { logInfo } from "../../lib/logging.js";

const deleteSchema = z.object({ key: z.string().min(1) }).strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  try {
    const { key } = parseBody(req, deleteSchema);
    // Object keys are always written as "<scope>/..." by createPresignedUpload,
    // so this doubles as a scope allowlist check on the delete path.
    if (!/^(scout|closer)\//.test(key)) {
      return void res.status(400).json({ error: "Invalid file key" });
    }
    await deleteFile(key);
    logInfo("file_deleted", { key });
    res.status(204).end();
  } catch (err) {
    handleApiError(res, err);
  }
}
