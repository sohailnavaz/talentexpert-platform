import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { verifyStudentSession } from "@/lib/auth/dal";
import {
  getDirectThread,
  getStudentMessageableTrainers,
  postStudentDirectMessage,
} from "@/lib/actions/direct-messages";
import { DirectMessageThread } from "@/components/shared/direct-message-thread";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function StudentDirectMessagePage({
  params,
}: {
  params: Promise<{ trainerId: string }>;
}) {
  const { trainerId } = await params;
  const session = await verifyStudentSession();

  const trainers = await getStudentMessageableTrainers(session.studentId);
  const trainer = trainers.find((t) => t.id === trainerId);
  if (!trainer) notFound();

  const messages = await getDirectThread(session.studentId, trainerId);
  const postMessage = postStudentDirectMessage.bind(null, trainerId, `/portal/messages/${trainerId}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/portal/messages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to messages
      </Link>
      <h1 className="font-heading text-xl font-bold">{trainer.name}</h1>
      <DirectMessageThread
        studentId={session.studentId}
        trainerId={trainerId}
        initialMessages={messages}
        postAction={postMessage}
        viewerRole="STUDENT"
      />
    </div>
  );
}
