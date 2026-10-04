import { nanoid } from "nanoid";
import {
  addOutboxItem,
  getPendingOutboxItems,
  getAllOutboxItems,
  updateOutboxItem,
  removeOutboxItem,
  type OutboxItem,
} from "./db";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getOutboxSnapshot() {
  return getAllOutboxItems();
}

/**
 * Enqueues a write. Call this instead of `fetch` for any action that must
 * survive the rep losing signal mid-outreach — it attempts the request
 * immediately, and only falls back to persisted-queue-and-retry if that
 * attempt fails due to being offline (a real network failure, not a
 * validation error from our own API, which surfaces immediately instead).
 */
export async function enqueueWrite(params: {
  method: OutboxItem["method"];
  url: string;
  body?: unknown;
  label: string;
}): Promise<{ ok: true; data: unknown } | { ok: false; queued: boolean; error: string }> {
  const item: OutboxItem = {
    id: nanoid(),
    method: params.method,
    url: params.url,
    body: params.body,
    createdAt: Date.now(),
    attempts: 0,
    status: "pending",
    label: params.label,
  };

  try {
    const res = await attemptRequest(item);
    if (res.ok) {
      const data = await res.json().catch(() => undefined);
      return { ok: true, data };
    }
    // Reached the server but it rejected the request (validation, etc.) —
    // surface immediately, don't silently queue a request that will never succeed.
    const errBody = await res.json().catch(() => ({}));
    return { ok: false, queued: false, error: errBody.error ?? `Request failed (${res.status})` };
  } catch {
    // Network-level failure (offline, DNS, timeout) — persist and retry later.
    // Deliberately not retrying inline here: we just failed a network call,
    // so an immediate retry is low-value and would race with the 'online'
    // listener / periodic sweep below for the same item. Those own the retry.
    await addOutboxItem(item);
    notify();
    return { ok: false, queued: true, error: "Offline — queued, will sync when connection returns." };
  }
}

async function attemptRequest(item: OutboxItem): Promise<Response> {
  return fetch(item.url, {
    method: item.method,
    headers: item.body ? { "Content-Type": "application/json" } : undefined,
    body: item.body ? JSON.stringify(item.body) : undefined,
  });
}

let flushing = false;

export async function flush(): Promise<void> {
  if (flushing || typeof navigator !== "undefined" && !navigator.onLine) return;
  flushing = true;
  try {
    const pending = await getPendingOutboxItems();
    for (const item of pending.sort((a, b) => a.createdAt - b.createdAt)) {
      try {
        const res = await attemptRequest(item);
        if (res.ok) {
          await removeOutboxItem(item.id);
          notify();
          continue;
        }
        const errBody = await res.json().catch(() => ({}));
        await updateOutboxItem({
          ...item,
          status: "failed",
          attempts: item.attempts + 1,
          lastError: errBody.error ?? `Request failed (${res.status})`,
        });
        notify();
      } catch {
        // Still offline — stop here, keep remaining items pending, try again next trigger.
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

export async function retryFailedItem(id: string): Promise<void> {
  const items = await getAllOutboxItems();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  await updateOutboxItem({ ...item, status: "pending" });
  notify();
  void flush();
}

export async function dismissOutboxItem(id: string): Promise<void> {
  await removeOutboxItem(id);
  notify();
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => void flush());
  // Belt-and-suspenders: also sweep periodically in case the online event
  // is missed (some mobile browsers are unreliable about firing it).
  setInterval(() => void flush(), 30_000);
}
