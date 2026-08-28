import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Download, FileText, Megaphone, MessageSquare, Users, Video, X } from "lucide-react";
import { verifyTrainerSession } from "@/lib/auth/dal";
import { getAttendanceForBatch, getBatchForTrainer } from "@/lib/data/trainer-portal";
import { getBatchMessages, postTrainerBatchMessage } from "@/lib/actions/batch-messages";
import { saveAttendance } from "@/lib/actions/attendance";
import { createBatchAnnouncement, deleteBatchAnnouncement } from "@/lib/actions/trainer-announcements";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AttendanceForm } from "@/components/trainer/attendance-form";
import { BatchMessageThread } from "@/components/portal/batch-message-thread";
import { formatDate, modeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "Batch" };

export default async function TrainerBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  const session = await verifyTrainerSession();
  const batch = await getBatchForTrainer(session.trainerId, batchId);
  if (!batch) notFound();

  const [attendance, messages] = await Promise.all([
    getAttendanceForBatch(batch.id),
    getBatchMessages(batch.id),
  ]);
  const attendanceMap = new Map(attendance.map((a) => [`${a.classSessionId}_${a.enrollmentId}`, a.present]));
  const postMessage = postTrainerBatchMessage.bind(null, batch.id, `/trainer/batches/${batch.id}`);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
        <h1 className="mt-2 font-heading text-2xl font-bold">{batch.course.title}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" /> {batch.enrollments.length} enrolled student
          {batch.enrollments.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <CalendarDays className="h-4.5 w-4.5 text-primary" /> Sessions & attendance
            </h2>
            {batch.sessions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No sessions scheduled yet.</p>
            ) : batch.enrollments.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No paid enrolments yet — attendance opens once students enrol.</p>
            ) : (
              <Accordion className="mt-3">
                {batch.sessions.map((s) => (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="text-sm">
                      {s.topic} — {formatDate(s.date)}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Button
                        render={<Link href={`/trainer/batches/${batch.id}/live/${s.id}`} />}
                        nativeButton={false}
                        size="sm"
                        className="mb-3"
                      >
                        <Video className="h-3.5 w-3.5" /> Start / join class
                      </Button>
                      <AttendanceForm
                        action={saveAttendance.bind(null, s.id, `/trainer/batches/${batch.id}`)}
                        students={batch.enrollments.map((e) => ({
                          enrollmentId: e.id,
                          name: e.student.name,
                          present: attendanceMap.get(`${s.id}_${e.id}`) ?? false,
                        }))}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </section>

          <section>
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold">
              <MessageSquare className="h-4.5 w-4.5 text-primary" /> Batch discussion
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Message your students. Everyone enrolled can see this thread.</p>
            <div className="mt-3">
              <BatchMessageThread batchId={batch.id} initialMessages={messages} postAction={postMessage} viewerRole="TRAINER" />
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

          <section>
            <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Megaphone className="h-4 w-4" /> Batch announcements
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Visible only to students enrolled in this batch.</p>
            <form
              action={createBatchAnnouncement.bind(null, batch.id, `/trainer/batches/${batch.id}`)}
              className="mt-3 space-y-2"
            >
              <Input name="title" placeholder="Title" required />
              <Textarea name="body" placeholder="Message" rows={2} required />
              <Button type="submit" size="sm">
                Post announcement
              </Button>
            </form>
            <div className="mt-4 space-y-2">
              {batch.announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              ) : (
                batch.announcements.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="flex items-start justify-between gap-2 p-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-medium">{a.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.body}</p>
                      </div>
                      <form action={deleteBatchAnnouncement.bind(null, a.id, `/trainer/batches/${batch.id}`)}>
                        <Button type="submit" size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label="Delete announcement">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Enrolled students
            </h2>
            <div className="mt-3 space-y-2">
              {batch.enrollments.map((e) => (
                <Card key={e.id}>
                  <CardContent className="p-3 text-sm">
                    <p className="font-medium">{e.student.name}</p>
                    <p className="text-xs text-muted-foreground">{e.student.email}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
