"use client";

import { useEffect, useRef } from "react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";

export function DailyCallRoom({ roomUrl, token }: { roomUrl: string; token: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const call = DailyIframe.createFrame(containerRef.current, {
      url: roomUrl,
      token: token ?? undefined,
      showLeaveButton: true,
      iframeStyle: { width: "100%", height: "100%", border: "0" },
    });
    call.join();
    callRef.current = call;

    return () => {
      call.destroy();
      callRef.current = null;
    };
  }, [roomUrl, token]);

  return <div ref={containerRef} className="h-[70vh] w-full overflow-hidden rounded-2xl border border-border" />;
}
