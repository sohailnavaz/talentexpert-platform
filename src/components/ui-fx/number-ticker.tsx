"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";

export function NumberTicker({
  value,
  suffix = "",
  prefix = "",
  className,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 120,
  });
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix, decimals]);

  return (
    <>
      <span ref={ref} className={cn("tabular-nums print:hidden", className)}>
        {prefix}0{suffix}
      </span>
      {/* Printing captures a static snapshot, so the spring animation above
          never runs and would otherwise show the "0" starting value. */}
      <span className={cn("tabular-nums hidden print:inline", className)}>
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </>
  );
}
