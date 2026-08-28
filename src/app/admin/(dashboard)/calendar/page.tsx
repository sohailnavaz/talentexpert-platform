import type { Metadata } from "next";
import { db } from "@/lib/db";
import { AdminCalendarView } from "@/components/admin/admin-calendar-view";

export const metadata: Metadata = { title: "Calendar" };

const RANGE_BEFORE_DAYS = 14;
const RANGE_AFTER_DAYS = 120;

export default async function AdminCalendarPage() {
  const now = new Date();
  const rangeStart = new Date(now.getTime() - RANGE_BEFORE_DAYS * 24 * 60 * 60 * 1000);
  const rangeEnd = new Date(now.getTime() + RANGE_AFTER_DAYS * 24 * 60 * 60 * 1000);

  const [sessions, batches] = await Promise.all([
    db.classSession.findMany({
      where: { date: { gte: rangeStart, lte: rangeEnd } },
      include: { batch: { include: { course: { select: { title: true } }, trainer: { select: { name: true } } } } },
      orderBy: { date: "asc" },
    }),
    db.batch.findMany({
      where: { startDate: { gte: rangeStart, lte: rangeEnd } },
      include: { course: { select: { title: true } }, trainer: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const sessionEvents = sessions.map((s) => ({
    kind: "session" as const,
    id: s.id,
    batchId: s.batchId,
    date: s.date.toISOString(),
    title: s.topic,
    time: s.time,
    courseTitle: s.batch.course.title,
    trainerName: s.batch.trainer?.name ?? null,
  }));

  const batchEvents = batches.map((b) => ({
    kind: "batch-start" as const,
    id: b.id,
    batchId: b.id,
    date: b.startDate.toISOString(),
    title: `${b.course.title} starts`,
    time: b.startTime,
    courseTitle: b.course.title,
    trainerName: b.trainer?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every class session and batch start date, all in one place.
        </p>
      </div>
      <AdminCalendarView events={[...sessionEvents, ...batchEvents]} />
    </div>
  );
}
