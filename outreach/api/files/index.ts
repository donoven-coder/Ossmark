import type { VercelRequest, VercelResponse } from "@vercel/node";
import { z } from "zod";
import { methodGuard, parseBody, handleApiError } from "../../lib/http.js";
import { createPresignedUpload, listFiles, type FileScope } from "../../lib/storage/r2.js";
import { ValidationError } from "../../lib/validation/rules.js";
import { logInfo } from "../../lib/logging.js";

const scopeSchema = z.enum(["scout", "closer"]);

const uploadRequestSchema = z
  .object({
    scope: scopeSchema,
    filename: z.string().min(1).max(255),
    contentType: z.string().min(1).max(200),
  })
  .strict();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET", "POST"])) return;

  try {
    if (req.method === "GET") {
      const scopeResult = scopeSchema.safeParse(req.query.scope);
      if (!scopeResult.success) throw new ValidationError("scope query param must be 'scout' or 'closer'");
      const files = await listFiles(scopeResult.data as FileScope);
      return void res.status(200).json({ files });
    }

    const { scope, filename, contentType } = parseBody(req, uploadRequestSchema);
    const upload = await createPresignedUpload(scope as FileScope, filename, contentType);
    logInfo("file_upload_presigned", { scope, filename, key: upload.key });
    res.status(200).json(upload);
  } catch (err) {
    handleApiError(res, err);
  }
}
