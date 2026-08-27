import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CalendarPlus, Download, FileText, MessageSquare, Video } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import { getEnrollmentForStudent } from "@/lib/data/portal";
import { getBatchMessages, postStudentBatchMessage } from "@/lib/actions/batch-messages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BatchMessageThread } from "@/components/portal/batch-message-thread";
import { VideoEmbed } from "@/components/site/video-embed";
import { formatDate, formatINR, modeLabels } from "@/lib/format";
import { googleCalendarUrl } from "@/lib/calendar";
import { getActiveOffer, computeEffectiveFee } from "@/lib/pricing";

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

  if (enrollment.isTrial) {
    const { batch } = enrollment;
    const previewSession = batch.sessions.find((s) => s.isFreePreview && s.recordingUrl);
    const offer = getActiveOffer(batch.offers);
    const { effectiveFee } = computeEffectiveFee(Number(batch.fee), offer);

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Badge className="bg-primary">Free preview</Badge>
          <h1 className="mt-2 font-heading text-2xl font-bold">{batch.course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have free access to the intro class. Enrol to unlock the full course.
          </p>
        </div>

        {previewSession?.recordingUrl ? (
          <VideoEmbed url={previewSession.recordingUrl} title={previewSession.topic} />
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              The free intro class isn&apos;t available right now — check back soon.
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading font-semibold">Ready for the full course?</p>
            <p className="text-sm text-muted-foreground">
              Enrol for {formatINR(effectiveFee)} to unlock every session, materials, attendance and your
              certificate.
            </p>
          </div>
          <Button render={<Link href={`/checkout/${batch.id}`} />} nativeButton={false} size="lg">
            Enrol now
          </Button>
        </div>
      </div>
    );
  }

  const { batch } = enrollment;
  const now = new Date();
  const upcomingSessions = batch.sessions.filter((s) => s.date >= now);
  const pastSessions = batch.sessions.filter((s) => s.date < now);
  const attendanceByCession = new Map(enrollment.attendances.map((a) => [a.classSessionId, a.present]));
  const attendedCount = pastSessions.filter((s) => attendanceByCession.get(s.id)).length;
  const messages = await getBatchMessages(batch.id);
  const postMessage = postStudentBatchMessage.bind(null, batch.id, `/portal/courses/${enrollment.id}`);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
          <h1 className="mt-2 font-heading text-2xl font-bold">{batch.course.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enrollment ID: {enrollment.enrollmentCode} · Trainer: {batch.trainer?.name ?? "TBA"}
          </p>
        </div>
        {batch.sessions.length > 0 ? (
          <Button
            variant="outline"
            size="sm"
            render={<a href={`/api/calendar/enrollment/${enrollment.id}`} />}
            nativeButton={false}
          >
            <CalendarPlus className="h-4 w-4" /> Download schedule (.ics)
          </Button>
        ) : null}
      </div>

      {pastSessions.length > 0 ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <span className="text-sm text-muted-foreground">Your attendance</span>
            <Badge variant={attendedCount === pastSessions.length ? "default" : "secondary"}>
              {attendedCount} / {pastSessions.length} sessions attended
            </Badge>
          </CardContent>
        </Card>
      ) : null}

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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <a
                              href={googleCalendarUrl({
                                title: `${batch.course.title}: ${s.topic}`,
                                description: `${s.time} — Join: ${s.joinUrl}`,
                                date: s.date,
                              })}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                          nativeButton={false}
                        >
                          <CalendarPlus className="h-3.5 w-3.5" /> Calendar
                        </Button>
                        <Button render={<Link href={`/portal/live/${s.id}`} />} nativeButton={false} size="sm">
                          Join
                        </Button>
                      </div>
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
                        <li key={s.id} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                          <span>
                            {s.topic} — {formatDate(s.date)}
                          </span>
                          {attendanceByCession.has(s.id) ? (
                            <Badge variant={attendanceByCession.get(s.id) ? "default" : "destructive"} className="text-[0.65rem]">
                              {attendanceByCession.get(s.id) ? "Present" : "Absent"}
                            </Badge>
                          ) : null}
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

          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <MessageSquare className="h-4.5 w-4.5 text-primary" /> Batch discussion
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Message your trainer and batchmates. Everyone enrolled in this batch can see this thread.
            </p>
            <div className="mt-3">
              <BatchMessageThread batchId={batch.id} initialMessages={messages} postAction={postMessage} viewerRole="STUDENT" />
            </div>
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
