"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBarClient({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(`ann-dismissed-${id}`) === "1");
  }, [id]);

  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 border-b border-border bg-brand-navy px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
      <p className="truncate">
        <span className="font-semibold">{title}</span>
        <span className="hidden text-white/70 sm:inline"> — {body}</span>
      </p>
      <button
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem(`ann-dismissed-${id}`, "1");
          setDismissed(true);
        }}
        className="absolute right-3 rounded-full p-1 hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
