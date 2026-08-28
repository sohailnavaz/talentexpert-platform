import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth/session";
import { ensureTrialEnrollment } from "@/lib/actions/free-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/site/video-embed";
import { FreePreviewForm } from "@/components/site/free-preview-form";
import { formatDate, formatINR, modeLabels } from "@/lib/format";
import { getActiveOffer, computeEffectiveFee } from "@/lib/pricing";
import { resolveVideoPlaybackUrl } from "@/lib/storage";

export const metadata: Metadata = { title: "Free intro class" };

export default async function FreePreviewPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;

  const batch = await db.batch.findUnique({
    where: { id: batchId },
    include: {
      course: { select: { title: true, slug: true, trialEnabled: true } },
      offers: true,
      sessions: { where: { isFreePreview: true }, take: 1 },
    },
  });
  if (!batch) notFound();
  if (!batch.course.trialEnabled) notFound();

  const previewSession = batch.sessions[0];
  if (!previewSession?.recordingUrl) notFound();

  const offer = getActiveOffer(batch.offers);
  const { effectiveFee } = computeEffectiveFee(Number(batch.fee), offer);

  const studentSession = await getStudentSession();
  if (studentSession) {
    await ensureTrialEnrollment(studentSession.studentId, batch.id);
  }
  const playbackUrl = studentSession ? await resolveVideoPlaybackUrl(previewSession.recordingUrl) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:py-16">
      <div>
        <Badge variant="secondary">{modeLabels[batch.mode] ?? batch.mode}</Badge>
        <h1 className="mt-2 font-heading text-2xl font-bold">{batch.course.title}: {previewSession.topic}</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" /> Recorded {formatDate(previewSession.date)} · Free intro class
        </p>
      </div>

      {studentSession && playbackUrl ? (
        <>
          <VideoEmbed
            url={playbackUrl}
            title={previewSession.topic}
            watermark={{ name: studentSession.name, email: studentSession.email }}
          />
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-heading font-semibold">Like what you see?</p>
              <p className="text-sm text-muted-foreground">
                Enrol in the full course for {formatINR(effectiveFee)} to unlock every session, materials and your
                certificate.
              </p>
            </div>
            <Button render={<Link href={`/checkout/${batch.id}`} />} nativeButton={false} size="lg">
              Enrol now
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            This class is also saved to your{" "}
            <Link href="/portal/courses" className="text-primary hover:underline">
              student portal
            </Link>
            .
          </p>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 p-8 text-center text-sm text-muted-foreground">
            <span>Enter your details to unlock this free class instantly.</span>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <FreePreviewForm batchId={batch.id} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-xl bg-secondary/50 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p>
          You get 2 days of free access to this course&apos;s preview content. You only pay when you&apos;re
          ready to enrol in the full course.
        </p>
      </div>
    </div>
  );
}
