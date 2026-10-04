/**
 * Structured logging for the backend. On Vercel these lines land in the
 * function's log stream (viewable in the dashboard / drains to a log
 * provider if one's configured). This is deliberately simple — no vendor
 * SDK — because the requirement is "a failed write doesn't fail silently,"
 * not "integrate a specific observability platform." Swap in Sentry/Axiom/
 * Logtail by replacing the two functions below; call sites don't change.
 */

interface LogFields {
  [key: string]: unknown;
}

function emit(level: "info" | "warn" | "error", event: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(event: string, fields?: LogFields) {
  emit("info", event, fields);
}

export function logWarn(event: string, fields?: LogFields) {
  emit("warn", event, fields);
}

export function logError(event: string, fields?: LogFields) {
  emit("error", event, fields);
}

/**
 * Records a failed Notion write with everything needed to replay it by
 * hand. This is the log line the "discovered a week later" scenario in the
 * brief is about — searchable by `event:"notion_write_failed"` in whatever
 * log viewer is attached.
 */
export function logWriteFailure(params: {
  entity: "lead" | "deal" | "agent" | "file";
  entityId?: string;
  action: string;
  payload: unknown;
  error: unknown;
}) {
  logError("notion_write_failed", {
    entity: params.entity,
    entityId: params.entityId,
    action: params.action,
    payload: params.payload,
    error: params.error instanceof Error ? { message: params.error.message, stack: params.error.stack } : params.error,
  });
}
