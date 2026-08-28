import { Circle } from "lucide-react";
import { formatDate } from "@/lib/format";

export type SessionParticipantView = {
  id: string;
  name: string;
  role: "STUDENT" | "TRAINER";
  joinedAt: Date;
  leftAt: Date | null;
  durationSecs: number | null;
  isLive: boolean;
};

export function SessionViewersPanel({ participants }: { participants: SessionParticipantView[] }) {
  if (participants.length === 0) {
    return <p className="mt-2 text-xs text-muted-foreground">No analytics data yet.</p>;
  }

  const live = participants.filter((p) => p.isLive);
  const past = participants.filter((p) => !p.isLive);

  return (
    <div className="mt-2 space-y-2 text-xs">
      {live.length > 0 ? (
        <div>
          <p className="flex items-center gap-1.5 font-medium text-primary">
            <Circle className="h-2 w-2 fill-primary" /> {live.length} watching now
          </p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {live.map((p) => (
              <li key={p.id}>
                {p.name} ({p.role === "STUDENT" ? "student" : "trainer"})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {past.length > 0 ? (
        <div>
          <p className="font-medium text-muted-foreground">Past viewers ({past.length})</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {past.map((p) => (
              <li key={p.id}>
                {p.name} — {formatDate(p.joinedAt)}
                {p.durationSecs ? ` (${Math.round(p.durationSecs / 60)} min)` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
