"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";

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
    <div className="relative flex items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
      <Sparkles className="hidden h-4 w-4 shrink-0 sm:block" />
      <p className="truncate">
        <span className="font-semibold">{title}</span>
        <span className="hidden sm:inline"> — {body}</span>
      </p>
      <button
        aria-label="Dismiss"
        onClick={() => {
          sessionStorage.setItem(`ann-dismissed-${id}`, "1");
          setDismissed(true);
        }}
        className="absolute right-3 rounded-full p-1 hover:bg-white/15"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
