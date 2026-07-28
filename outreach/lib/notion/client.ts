/**
 * Server-only Notion access. This module must never be imported from
 * frontend code — it reads NOTION_TOKEN directly from the environment and
 * throws if that env var somehow leaked into a non-Node runtime (no
 * `process`), which is the last line of defense against the token shipping
 * to the browser by accident.
 */
import { logError } from "../logging.js";

if (typeof window !== "undefined") {
  throw new Error("lib/notion/client.ts imported into a browser context — this must never happen.");
}

const NOTION_VERSION = "2025-09-03"; // first version with data-source query endpoints
const API_BASE = "https://api.notion.com/v1";

export class NotionApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "NotionApiError";
  }
}

/** Thrown when we're deliberately not calling Notion to protect the rate limit. */
export class NotionRateLimitGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotionRateLimitGuardError";
  }
}

function getToken(): string {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN is not set. This must be configured as a server-side environment variable " +
        "(Vercel project settings), never committed and never exposed with a VITE_/NEXT_PUBLIC_ prefix.",
    );
  }
  return token;
}

async function notionFetch<T>(path: string, init: RequestInit = {}, attempt = 0): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (res.status === 429 && attempt < 3) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 1;
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return notionFetch<T>(path, init, attempt + 1);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    logError("notion_api_error", { path, status: res.status, code: body.code, message: body.message });
    throw new NotionApiError(body.message ?? `Notion API error (${res.status})`, res.status, body.code);
  }

  return res.json() as Promise<T>;
}

export interface NotionPage {
  id: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, unknown>;
}

export interface NotionQueryResult {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

export async function queryDataSource(
  dataSourceId: string,
  body: { filter?: unknown; sorts?: unknown[]; page_size?: number; start_cursor?: string } = {},
): Promise<NotionQueryResult> {
  return notionFetch<NotionQueryResult>(`/data_sources/${dataSourceId}/query`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getPage(pageId: string): Promise<NotionPage> {
  return notionFetch<NotionPage>(`/pages/${pageId}`);
}

export async function createPage(dataSourceId: string, properties: Record<string, unknown>): Promise<NotionPage> {
  return notionFetch<NotionPage>(`/pages`, {
    method: "POST",
    body: JSON.stringify({
      parent: { type: "data_source_id", data_source_id: dataSourceId },
      properties,
    }),
  });
}

export async function updatePage(pageId: string, properties: Record<string, unknown>): Promise<NotionPage> {
  return notionFetch<NotionPage>(`/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties }),
  });
}

export interface NotionBlock {
  id: string;
  type: string;
  [key: string]: unknown;
}

/**
 * Per-lead body content (e.g. the "Outreach Drafts" section SCOUT writes
 * under each lead) lives as page blocks, not a database property — fetch
 * on demand per lead, not as part of the bulk Leads query.
 */
export async function getPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const qs = cursor ? `?start_cursor=${cursor}&page_size=100` : "?page_size=100";
    const res = await notionFetch<{ results: NotionBlock[]; has_more: boolean; next_cursor: string | null }>(
      `/blocks/${pageId}/children${qs}`,
    );
    blocks.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return blocks;
}
