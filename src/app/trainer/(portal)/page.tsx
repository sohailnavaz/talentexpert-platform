import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarClock, MessageCircle, Users, Video } from "lucide-react";
import { verifyTrainerSession } from "@/lib/auth/dal";
import { getNextSessionForTrainer, getTrainerBatches, getTrainerDashboardStats } from "@/lib/data/trainer-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDateShort, modeLabels, batchStatusLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Trainer Dashboard" };

export default async function TrainerDashboardPage() {
  const session = await verifyTrainerSession();
  const [batches, nextSession, stats] = await Promise.all([
    getTrainerBatches(session.trainerId),
    getNextSessionForTrainer(session.trainerId),
    getTrainerDashboardStats(session.trainerId),
  ]);

  const statCards = [
    { label: "Batches", value: batches.length, href: "/trainer" },
    { label: "Enrolled students", value: stats.totalStudents, href: "/trainer" },
    { label: "Sessions this week", value: stats.sessionsThisWeek, href: "/trainer" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Welcome back, {session.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;re assigned to {batches.length} batch{batches.length === 1 ? "" : "es"}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="font-heading text-2xl font-bold">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
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
            <Button render={<Link href={`/trainer/batches/${nextSession.batchId}`} />} nativeButton={false}>
              View batch <ArrowRight className="h-4 w-4" />
            </Button>
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
        <h2 className="font-heading text-lg font-semibold">My batches</h2>
        {batches.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No batches assigned yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {batches.map((b) => (
              <Link key={b.id} href={`/trainer/batches/${b.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-heading text-base">{b.course.title}</CardTitle>
                      <Badge variant={b.status === "ONGOING" ? "default" : "secondary"}>
                        {batchStatusLabels[b.status] ?? b.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                    <p>{modeLabels[b.mode] ?? b.mode} · Starts {formatDateShort(b.startDate)}</p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {b._count.enrollments} enrolled
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
            <MessageCircle className="h-4.5 w-4.5 text-primary" /> Recent messages
          </h2>
          <Link href="/trainer/messages" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {stats.recentMessages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No messages from students yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {stats.recentMessages.map((m) => (
              <Link key={m.id} href={`/trainer/messages/${m.studentId}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{m.student.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.body}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
