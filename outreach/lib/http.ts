import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { ZodSchema } from "zod";
import { ValidationError } from "./validation/rules.js";
import { NotionApiError } from "./notion/client.js";
import { logError } from "./logging.js";

export function methodGuard(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (!methods.includes(req.method ?? "")) {
    res.setHeader("Allow", methods.join(", "));
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return false;
  }
  return true;
}

export function parseBody<T>(req: VercelRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "));
  }
  return result.data;
}

export function handleApiError(res: VercelResponse, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(422).json({ error: err.message, field: err.field });
    return;
  }
  if (err instanceof NotionApiError) {
    res.status(err.status === 429 ? 429 : 502).json({ error: `Notion sync failed: ${err.message}` });
    return;
  }
  logError("unhandled_api_error", { error: err instanceof Error ? { message: err.message, stack: err.stack } : err });
  res.status(500).json({ error: "Internal error" });
}
