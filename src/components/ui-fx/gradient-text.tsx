import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "animate-gradient-move bg-[length:200%_auto] bg-clip-text text-transparent",
        "bg-[linear-gradient(90deg,var(--brand),var(--brand-2),var(--brand))]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function AnimatedBadge({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] bg-[length:200%_100%]" />
      <span className="relative flex h-1.5 w-1.5 rounded-full bg-[var(--brand-2)]" />
      <span className="relative">{children}</span>
    </span>
  );
}
