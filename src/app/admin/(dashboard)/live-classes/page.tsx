import type { Metadata } from "next";
import { Video, History } from "lucide-react";
import { verifyAdminSession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { getSessionParticipants } from "@/lib/data/trainer-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { SessionViewersPanel } from "@/components/shared/session-viewers-panel";
import { SearchParamInput } from "@/components/shared/search-param-input";

export const metadata: Metadata = { title: "Live Classes" };

const LIVE_WINDOW_BEFORE_MS = 30 * 60 * 1000;
const LIVE_WINDOW_AFTER_MS = 3 * 60 * 60 * 1000;
const PAST_SESSIONS_LIMIT = 20;

export default async function AdminLiveClassesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await verifyAdminSession();
  const { q } = await searchParams;

  const now = new Date();
  const windowStart = new Date(now.getTime() - LIVE_WINDOW_BEFORE_MS);
  const windowEnd = new Date(now.getTime() + LIVE_WINDOW_AFTER_MS);

  const [liveSessions, pastSessions] = await Promise.all([
    db.classSession.findMany({
      where: { date: { gte: windowStart, lte: windowEnd } },
      include: { batch: { include: { course: { select: { title: true } }, trainer: { select: { name: true } } } } },
      orderBy: { date: "asc" },
    }),
    db.classSession.findMany({
      where: {
        date: { lt: windowStart },
        ...(q ? { batch: { course: { title: { contains: q, mode: "insensitive" } } } } : {}),
      },
      include: {
        batch: { include: { course: { select: { title: true } }, trainer: { select: { name: true } } } },
        participants: true,
      },
      orderBy: { date: "desc" },
      take: PAST_SESSIONS_LIMIT,
    }),
  ]);

  const liveParticipants = await Promise.all(liveSessions.map((s) => getSessionParticipants(s.id)));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Live Classes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sessions happening now, plus viewer analytics once Daily.co webhooks are registered in Site
          Settings.
        </p>
      </div>

      <section>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <Video className="h-4.5 w-4.5 text-primary" /> Live now
        </h2>
        {liveSessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No classes scheduled in this window.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {liveSessions.map((s, i) => (
              <Card key={s.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm font-semibold">
                    <span className="truncate">{s.batch.course.title}</span>
                    <Badge variant="secondary">{formatDate(s.date)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {s.topic} · Trainer: {s.batch.trainer?.name ?? "Unassigned"}
                  </p>
                  <SessionViewersPanel participants={liveParticipants[i]} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
          <History className="h-4.5 w-4.5 text-primary" /> Past sessions
        </h2>
        <SearchParamInput placeholder="Search by course title" className="mt-3 max-w-sm" />
        {pastSessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No past sessions yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {pastSessions.map((s) => {
              const withDuration = s.participants.filter((p) => p.durationSecs !== null);
              const avgSecs =
                withDuration.length > 0
                  ? Math.round(withDuration.reduce((sum, p) => sum + (p.durationSecs ?? 0), 0) / withDuration.length)
                  : null;
              return (
                <Card key={s.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {s.batch.course.title} — {s.topic}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.date)} · Trainer: {s.batch.trainer?.name ?? "Unassigned"}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {s.participants.length > 0 ? (
                        <>
                          <p>{s.participants.length} unique viewers</p>
                          {avgSecs !== null ? <p>Avg. watch: {Math.round(avgSecs / 60)} min</p> : null}
                        </>
                      ) : (
                        <p>No analytics data yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
