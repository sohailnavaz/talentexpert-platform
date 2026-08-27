import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("text-[var(--brand)]", className)}>{children}</span>;
}

export function AnimatedBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
      <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
      {children}
    </span>
  );
}
