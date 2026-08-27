import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-3", className)}>
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon,
  className,
  children,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120px_circle_at_var(--x,50%)_var(--y,0%),color-mix(in_oklch,var(--brand)_12%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {icon ? (
        <div className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="relative font-heading text-lg font-semibold text-foreground">
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children ? <div className="relative mt-4">{children}</div> : null}
    </div>
  );
}
