"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { BellRing, CalendarDays, Rocket, Video } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { sendSessionReminderNow } from "@/lib/actions/reminders";

type CalendarEvent = {
  kind: "session" | "batch-start";
  id: string;
  batchId: string;
  date: string;
  title: string;
  time: string;
  courseTitle: string;
  trainerName: string | null;
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function AdminCalendarView({ events }: { events: CalendarEvent[] }) {
  const [selected, setSelected] = useState<Date>(new Date());
  const [pending, startTransition] = useTransition();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const key = dateKey(new Date(e.date));
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const eventDates = useMemo(() => [...eventsByDay.keys()].map((k) => new Date(`${k}T00:00:00`)), [eventsByDay]);
  const dayEvents = eventsByDay.get(dateKey(selected)) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr]">
      <Card className="w-fit">
        <CardContent className="p-3">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            modifiers={{ hasEvent: eventDates }}
            modifiersClassNames={{ hasEvent: "after:absolute after:bottom-1 after:h-1 after:w-1 after:rounded-full after:bg-primary" }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" /> {formatDate(selected)}
          </h2>
          {dayEvents.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Nothing scheduled this day.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {dayEvents.map((e) => (
                <div
                  key={`${e.kind}-${e.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {e.kind === "session" ? (
                        <Video className="h-3.5 w-3.5 shrink-0 text-primary" />
                      ) : (
                        <Rocket className="h-3.5 w-3.5 shrink-0 text-primary" />
                      )}
                      <p className="truncate font-medium">{e.title}</p>
                      {e.kind === "batch-start" ? <Badge variant="secondary">Batch start</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {e.time} · {e.courseTitle}
                      {e.trainerName ? ` · ${e.trainerName}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {e.kind === "session" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            const count = await sendSessionReminderNow(e.id, e.batchId);
                            toast.success(`Reminder sent to ${count} student${count === 1 ? "" : "s"}.`);
                          })
                        }
                      >
                        <BellRing className="h-3.5 w-3.5" /> Remind
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" render={<Link href={`/admin/batches/${e.batchId}/edit`} />} nativeButton={false}>
                      Open batch
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
