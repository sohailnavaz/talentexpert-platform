"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Starting now";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `In ${days}d ${hours}h`;
  if (hours > 0) return `In ${hours}h ${minutes}m`;
  return `In ${minutes}m`;
}

export function SessionCountdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [label, setLabel] = useState(() => formatRemaining(target - Date.now()));

  useEffect(() => {
    const interval = setInterval(() => {
      setLabel(formatRemaining(target - Date.now()));
    }, 30_000);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{label}</span>
  );
}
