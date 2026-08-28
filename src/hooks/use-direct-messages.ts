"use client";

import { useCallback, useEffect, useState } from "react";
import { getDirectThread, type DirectMessageEvent } from "@/lib/actions/direct-messages";

const POLL_INTERVAL_MS = 4000;

export function useDirectMessages(studentId: string, trainerId: string, initialMessages: DirectMessageEvent[]) {
  const [messages, setMessages] = useState(initialMessages);

  const refresh = useCallback(async () => {
    const fresh = await getDirectThread(studentId, trainerId);
    setMessages(fresh);
  }, [studentId, trainerId]);

  useEffect(() => {
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { messages, refresh };
}
