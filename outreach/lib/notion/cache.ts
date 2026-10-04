/**
 * Rate-limit-aware caching for Notion reads.
 *
 * Note on which limit this guards against: Notion's SQL-query mode (used by
 * Notion AI / MCP connectors) has a separate hourly limit on single-data-source
 * queries on Free/Plus plans — that is NOT what this backend calls. This
 * backend uses the public REST "query a data source" endpoint, which is
 * subject to Notion's standard platform rate limit instead (an average of
 * ~3 requests/second per integration token, with short bursts tolerated).
 * Blowing through *that* limit under normal phone-refresh use is still very
 * possible for a dashboard that queries 3 data sources on every load, so we
 * cache short-TTL and dedupe concurrent identical reads regardless.
 *
 * This cache is process-local (in-memory). On Vercel that means it helps
 * within a warm serverless instance across nearby requests, and does nothing
 * across cold starts or separate instances — that's an accepted limitation
 * for a single-user app opened "dozens of times a day," not a shared
 * multi-tenant one. See README "Scaling the cache" for the upgrade path
 * (Vercel KV / Upstash) if this ever needs to be multi-instance-consistent.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

const DEFAULT_TTL_MS = 45_000;

export async function cached<T>(key: string, fetcher: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      inFlight.delete(key);
      return value;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

/** Returns the last cached value even if expired — used as a fallback when a live fetch fails. */
export function getStale<T>(key: string): T | undefined {
  return store.get(key)?.value as T | undefined;
}

export function invalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
