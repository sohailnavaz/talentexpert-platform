import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Download, FileText, Video } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getEnrollmentForStudent } from "@/lib/data/portal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDate, modeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Course Workspace" };

export default async function CourseWorkspacePage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const { enrollmentId } = await params;
  const session = await verifyStudentSession();
  const enrollment = await getEnrollmentForStudent(session.studentId, enrollmentId);
  if (!enrollment) notFound();

  const { batch } = enrollment;
  const now = new Date();
  const upcomingSessions = batch.sessions.filter((s) => s.date >= now);
  const pastSessions = batch.sessions.filter((s) => s.date < now);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
        <h1 className="mt-2 font-heading text-2xl font-bold">{batch.course.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enrollment ID: {enrollment.enrollmentCode} · Trainer: {batch.trainer?.name ?? "TBA"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <Video className="h-4.5 w-4.5 text-primary" /> Session links
            </h2>
            {upcomingSessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No upcoming sessions scheduled yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {upcomingSessions.map((s) => (
                  <Card key={s.id}>
                    <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{s.topic}</p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5" /> {formatDate(s.date)} · {s.time}
                        </p>
                      </div>
                      <Button render={<a href={s.joinUrl} target="_blank" rel="noreferrer" />} nativeButton={false} size="sm">
                        Join
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {pastSessions.length > 0 ? (
              <Accordion className="mt-4">
                <AccordionItem value="past-sessions">
                  <AccordionTrigger className="text-sm">Past sessions ({pastSessions.length})</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2">
                      {pastSessions.map((s) => (
                        <li key={s.id} className="text-sm text-muted-foreground">
                          {s.topic} — {formatDate(s.date)}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}
          </section>

          <section>
            <h2 className="font-heading text-lg font-semibold">Syllabus</h2>
            <Accordion className="mt-3">
              {batch.course.modules.map((m) => (
                <AccordionItem key={m.id} value={m.id}>
                  <AccordionTrigger className="text-sm">{m.title}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-1.5">
                      {m.topics.map((t) => (
                        <li key={t.id} className="text-sm text-muted-foreground">
                          {t.title}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>

        <aside className="space-y-6">
          <section>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <FileText className="h-4 w-4" /> Study materials
            </h2>
            {batch.materials.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No materials uploaded yet.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                {batch.materials.map((m) => (
                  <a
                    key={m.id}
                    href={m.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-accent"
                  >
                    <span className="truncate">{m.title}</span>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
              </div>
            )}
          </section>

          {enrollment.testAttempts.length > 0 ? (
            <section>
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Test scores
              </h2>
              <div className="mt-3 flex flex-col gap-2">
                {enrollment.testAttempts.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                    <span>{t.title}</span>
                    <Badge variant={t.scorePercent >= 60 ? "default" : "secondary"}>{t.scorePercent}%</Badge>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
