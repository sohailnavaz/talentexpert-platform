"use client";

import { useCallback, useEffect, useState } from "react";
import { getBatchMessages, type BatchMessageEvent } from "@/lib/actions/batch-messages";

const POLL_INTERVAL_MS = 4000;

export function useBatchMessages(batchId: string, initialMessages: BatchMessageEvent[]) {
  const [messages, setMessages] = useState(initialMessages);

  const refresh = useCallback(async () => {
    const fresh = await getBatchMessages(batchId);
    setMessages(fresh);
  }, [batchId]);

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { messages, refresh };
}
