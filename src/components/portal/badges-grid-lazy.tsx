"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { BadgeBoardItem } from "./badges-grid";

const BadgesGrid = dynamic(() => import("./badges-grid").then((m) => m.BadgesGrid), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-36 rounded-2xl" />
      ))}
    </div>
  ),
});

export function BadgesGridLazy({ badges }: { badges: BadgeBoardItem[] }) {
  return <BadgesGrid badges={badges} />;
}
