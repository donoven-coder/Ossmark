import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface OutboxItem {
  id: string;
  method: "PATCH" | "POST" | "DELETE";
  url: string;
  body?: unknown;
  createdAt: number;
  attempts: number;
  lastError?: string;
  status: "pending" | "failed";
  /** Human-readable label for the sync-issues UI, e.g. "Mark Superior Comfort as Agreed". */
  label: string;
}

interface OutreachDB extends DBSchema {
  outbox: {
    key: string;
    value: OutboxItem;
    indexes: { "by-status": string };
  };
}

let dbPromise: Promise<IDBPDatabase<OutreachDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OutreachDB>("outreach-command-center", 1, {
      upgrade(db) {
        const store = db.createObjectStore("outbox", { keyPath: "id" });
        store.createIndex("by-status", "status");
      },
    });
  }
  return dbPromise;
}

export async function addOutboxItem(item: OutboxItem): Promise<void> {
  const db = await getDb();
  await db.put("outbox", item);
}

export async function getPendingOutboxItems(): Promise<OutboxItem[]> {
  const db = await getDb();
  return db.getAllFromIndex("outbox", "by-status", "pending");
}

export async function getAllOutboxItems(): Promise<OutboxItem[]> {
  const db = await getDb();
  return db.getAll("outbox");
}

export async function updateOutboxItem(item: OutboxItem): Promise<void> {
  const db = await getDb();
  await db.put("outbox", item);
}

export async function removeOutboxItem(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("outbox", id);
}
