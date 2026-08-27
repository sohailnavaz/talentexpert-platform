import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("relative shrink-0 overflow-hidden rounded-xl bg-brand-navy", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/icon-mark.png"
        alt="Talent Expert"
        fill
        sizes={`${size}px`}
        className="object-cover"
        priority
      />
    </span>
  );
}

export function Logo({ className, iconSize = 36 }: { className?: string; iconSize?: number }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={iconSize} />
      <span className="font-heading text-lg font-bold tracking-tight">
        Talent<span className="text-primary">Expert</span>
      </span>
    </span>
  );
}
