import { cn } from "@/lib/utils";

export function Spotlight({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 top-0 h-[42rem] w-[72rem] -translate-x-1/2 animate-spotlight opacity-0",
        "bg-[radial-gradient(ellipse_at_center,color-mix(in_oklch,var(--brand)_55%,transparent)_0%,transparent_65%)] blur-2xl",
        className
      )}
    />
  );
}
