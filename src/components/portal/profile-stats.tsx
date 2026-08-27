import { Award, BookOpenCheck, CheckCircle2, Clock } from "lucide-react";
import { NumberTicker } from "@/components/ui-fx/number-ticker";
import type { StudentStats } from "@/lib/gamification";

export function ProfileStats({ stats }: { stats: StudentStats }) {
  const cards = [
    { icon: BookOpenCheck, label: "Courses enrolled", value: stats.coursesEnrolled },
    { icon: CheckCircle2, label: "Courses completed", value: stats.coursesCompleted },
    { icon: Clock, label: "Hours logged", value: stats.hoursLogged },
    { icon: Award, label: "Tests passed", value: stats.testsPassed },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl border border-border bg-card p-4">
          <c.icon className="h-4.5 w-4.5 text-primary" />
          <p className="mt-2 font-heading text-2xl font-bold">
            <NumberTicker value={c.value} />
          </p>
          <p className="text-xs text-muted-foreground">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
