import { Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Level } from "@/lib/gamification";

export function RewardMeter({
  totalPoints,
  level,
  nextLevel,
  pointsToNext,
}: {
  totalPoints: number;
  level: Level;
  nextLevel: Level | null;
  pointsToNext: number;
}) {
  const pct = nextLevel
    ? Math.min(100, Math.round(((totalPoints - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100))
    : 100;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold">{level.name}</p>
            <p className="text-xs text-muted-foreground">{totalPoints} points earned</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {nextLevel ? `${pointsToNext} pts to ${nextLevel.name}` : "Top level reached"}
        </p>
      </div>
      <Progress value={pct} className="mt-3" />
    </div>
  );
}
