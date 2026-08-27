import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, Megaphone, Video } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getNextSessionForStudent, getPortalAnnouncements, getStudentEnrollments } from "@/lib/data/portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateShort, modeLabels } from "@/lib/format";
import { SessionCountdown } from "@/components/portal/session-countdown";

export const metadata: Metadata = { title: "Dashboard" };

export default async function PortalDashboardPage() {
  const session = await verifyStudentSession();
  const [enrollments, nextSession, announcements] = await Promise.all([
    getStudentEnrollments(session.studentId),
    getNextSessionForStudent(session.studentId),
    getPortalAnnouncements(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Welcome back, {session.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your {enrollments.length} enrolled course
          {enrollments.length === 1 ? "" : "s"}.
        </p>
      </div>

      {nextSession ? (
        <Card className="overflow-hidden border-primary/20 bg-primary/[0.04]">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                <Video className="h-3.5 w-3.5" /> Next live session
              </span>
              <p className="mt-1.5 font-heading text-lg font-semibold">{nextSession.topic}</p>
              <p className="text-sm text-muted-foreground">
                {nextSession.batch.course.title} · {formatDate(nextSession.date)} · {nextSession.time}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <SessionCountdown date={nextSession.date.toISOString()} />
              <Button render={<a href={nextSession.joinUrl} target="_blank" rel="noreferrer" />} nativeButton={false}>
                Join class <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <CalendarClock className="h-5 w-5" /> No upcoming sessions scheduled yet.
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">My courses</h2>
          <Link href="/portal/courses" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        {enrollments.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No active enrolments yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {enrollments.slice(0, 4).map((e) => (
              <Link key={e.id} href={`/portal/courses/${e.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-heading text-base">{e.batch.course.title}</CardTitle>
                      {e.completedAt ? <Badge className="bg-emerald-600">Completed</Badge> : <Badge variant="secondary">Ongoing</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                    <p>{modeLabels[e.batch.mode] ?? e.batch.mode} · Starts {formatDateShort(e.batch.startDate)}</p>
                    {e.batch.trainer ? <p>Trainer: {e.batch.trainer.name}</p> : null}
                    <p className="text-xs">Enrollment ID: {e.enrollmentCode}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {announcements.length > 0 ? (
        <div>
          <h2 className="font-heading text-lg font-semibold">Announcements</h2>
          <div className="mt-4 space-y-3">
            {announcements.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <Megaphone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-muted-foreground">{a.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
