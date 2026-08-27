"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";
import { getBadgeIcon } from "@/lib/badge-icons";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BadgeBoardItem = {
  id: string;
  key: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
};

export function BadgesGrid({ badges }: { badges: BadgeBoardItem[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {badges.map((badge) => {
        const Icon = getBadgeIcon(badge.icon);
        return (
          <motion.div
            key={badge.id}
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.95 },
              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
            }}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-transform hover:-translate-y-0.5",
              badge.earned
                ? "border-primary/30 bg-primary/[0.06] shadow-sm shadow-primary/10"
                : "border-dashed border-border bg-muted/30 opacity-60"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                badge.earned ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {badge.earned ? <Icon className="h-5.5 w-5.5" /> : <Lock className="h-5 w-5" />}
            </div>
            <p className="text-sm font-semibold leading-tight">{badge.label}</p>
            <p className="text-xs leading-snug text-muted-foreground">{badge.description}</p>
            {badge.earned && badge.earnedAt ? (
              <span className="text-[10px] font-medium text-primary">
                Earned {formatDate(badge.earnedAt)}
              </span>
            ) : null}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
