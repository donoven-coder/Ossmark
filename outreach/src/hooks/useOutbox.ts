import { useEffect, useState, useCallback } from "react";
import { getOutboxSnapshot, subscribe, retryFailedItem, dismissOutboxItem, flush } from "../lib/offlineQueue";
import type { OutboxItem } from "../lib/db";

export function useOutbox() {
  const [items, setItems] = useState<OutboxItem[]>([]);

  const refresh = useCallback(() => {
    void getOutboxSnapshot().then(setItems);
  }, []);

  useEffect(() => {
    refresh();
    const unsubscribe = subscribe(refresh);
    void flush();
    return unsubscribe;
  }, [refresh]);

  const pending = items.filter((i) => i.status === "pending");
  const failed = items.filter((i) => i.status === "failed");

  return {
    pending,
    failed,
    retry: (id: string) => void retryFailedItem(id),
    dismiss: (id: string) => void dismissOutboxItem(id),
  };
}
