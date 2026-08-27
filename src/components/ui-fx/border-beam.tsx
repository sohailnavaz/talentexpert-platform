"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export function BorderBeam({
  className,
  duration = 8,
  size = 140,
}: {
  className?: string;
  duration?: number;
  size?: number;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}>
      <motion.div
        className="absolute aspect-square"
        style={{
          width: size,
          offsetPath: `rect(0 auto auto 0 round ${size}px)`,
        }}
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,var(--brand-2)_0%,transparent_70%)]" />
      </motion.div>
    </div>
  );
}
