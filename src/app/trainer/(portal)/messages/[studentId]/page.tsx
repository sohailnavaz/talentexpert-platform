import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { verifyTrainerSession } from "@/lib/auth/dal";
import {
  getDirectThread,
  getTrainerMessageableStudents,
  postTrainerDirectMessage,
} from "@/lib/actions/direct-messages";
import { DirectMessageThread } from "@/components/shared/direct-message-thread";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

export default async function TrainerDirectMessagePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const session = await verifyTrainerSession();

  const students = await getTrainerMessageableStudents(session.trainerId);
  const student = students.find((s) => s.id === studentId);
  if (!student) notFound();

  const messages = await getDirectThread(studentId, session.trainerId);
  const postMessage = postTrainerDirectMessage.bind(null, studentId, `/trainer/messages/${studentId}`);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/trainer/messages" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to messages
      </Link>
      <h1 className="font-heading text-xl font-bold">{student.name}</h1>
      <DirectMessageThread
        studentId={studentId}
        trainerId={session.trainerId}
        initialMessages={messages}
        postAction={postMessage}
        viewerRole="TRAINER"
      />
    </div>
  );
}
