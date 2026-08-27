import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandWatermark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] opacity-15 sm:h-[36rem] sm:w-[36rem]",
        className
      )}
    >
      <Image
        src="/brand/icon-mark.png"
        alt=""
        fill
        sizes="(min-width: 640px) 576px, 448px"
        className="object-contain"
        loading="lazy"
      />
    </div>
  );
}
