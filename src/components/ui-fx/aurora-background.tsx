export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-1/4 -top-1/3 h-[28rem] w-[28rem] animate-float rounded-full bg-[color-mix(in_oklch,var(--brand)_45%,transparent)] opacity-40 blur-3xl" />
      <div
        className="absolute -right-1/4 top-0 h-[24rem] w-[24rem] animate-float rounded-full bg-[color-mix(in_oklch,var(--brand-2)_45%,transparent)] opacity-30 blur-3xl"
        style={{ animationDelay: "-2s", animationDuration: "8s" }}
      />
      <div
        className="absolute bottom-[-6rem] left-1/3 h-[22rem] w-[22rem] animate-float rounded-full bg-[color-mix(in_oklch,var(--chart-3)_40%,transparent)] opacity-25 blur-3xl"
        style={{ animationDelay: "-4s", animationDuration: "10s" }}
      />
    </div>
  );
}
