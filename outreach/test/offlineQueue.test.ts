import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { enqueueWrite, flush, getOutboxSnapshot } from "../src/lib/offlineQueue";
import { getAllOutboxItems, removeOutboxItem } from "../src/lib/db";

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 422) {
  return { ok, status, json: async () => body } as Response;
}

describe("offline write queue — resilience for a rep who loses signal mid-outreach", () => {
  beforeEach(async () => {
    vi.stubGlobal("fetch", vi.fn());
    // fake-indexeddb persists across tests in the same file — start each
    // test from a clean outbox so assertions aren't testing leftover state.
    for (const item of await getAllOutboxItems()) await removeOutboxItem(item.id);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the server response directly on a successful write, without touching the queue", async () => {
    (fetch as any).mockResolvedValueOnce(jsonResponse({ lead: { id: "l1" } }));

    const result = await enqueueWrite({ method: "PATCH", url: "/api/leads/l1", body: { qualified: true }, label: "Qualify lead" });

    expect(result).toEqual({ ok: true, data: { lead: { id: "l1" } } });
    expect((await getOutboxSnapshot()).length).toBe(0);
  });

  it("surfaces a real validation error immediately instead of queuing a request that will never succeed", async () => {
    (fetch as any).mockResolvedValueOnce(jsonResponse({ error: "leadId is required" }, false, 422));

    const result = await enqueueWrite({ method: "POST", url: "/api/deals", body: {}, label: "Create deal" });

    expect(result).toEqual({ ok: false, queued: false, error: "leadId is required" });
    expect((await getOutboxSnapshot()).length).toBe(0);
  });

  it("persists to the offline queue on a network failure instead of losing the action", async () => {
    (fetch as any).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const result = await enqueueWrite({
      method: "POST",
      url: "/api/leads/l1/touchpoint",
      body: { channel: "call" },
      label: "Log call — Superior Comfort",
    });

    expect(result.ok).toBe(false);
    expect((result as any).queued).toBe(true);

    const items = await getOutboxSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ status: "pending", label: "Log call — Superior Comfort" });
  });

  it("flush() replays queued items and clears them once the network is back", async () => {
    (fetch as any).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await enqueueWrite({ method: "PATCH", url: "/api/leads/l1", body: { qualified: true }, label: "Qualify lead" });
    expect((await getOutboxSnapshot())).toHaveLength(1);

    (fetch as any).mockResolvedValueOnce(jsonResponse({ lead: { id: "l1" } }));
    await flush();

    expect((await getOutboxSnapshot())).toHaveLength(0);
  });

  it("flush() marks a request that reaches the server but fails as 'failed', not silently dropped", async () => {
    (fetch as any).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await enqueueWrite({ method: "PATCH", url: "/api/deals/d1", body: { packagePitched: "Site-Only 497" }, label: "Set package" });

    (fetch as any).mockResolvedValueOnce(jsonResponse({ error: "Package Pitched can only be set after Outcome is decided" }, false, 422));
    await flush();

    const items = await getOutboxSnapshot();
    expect(items).toHaveLength(1);
    expect(items[0].status).toBe("failed");
    expect(items[0].lastError).toContain("Package Pitched");
  });
});
