"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStudentSession, getTrainerSession } from "@/lib/auth/session";
import type { Gender } from "@/generated/prisma";

export type DirectMessageEvent = {
  id: string;
  senderRole: "STUDENT" | "TRAINER";
  body: string;
  createdAt: string;
};

async function authorizeDirectMessageAccess(studentId: string, trainerId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      studentId,
      OR: [{ status: "PAID" }, { isTrial: true }],
      batch: { trainerId },
    },
  });
  return Boolean(enrollment);
}

export async function getDirectThread(studentId: string, trainerId: string): Promise<DirectMessageEvent[]> {
  const messages = await db.directMessage.findMany({
    where: { studentId, trainerId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole as "STUDENT" | "TRAINER",
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function getStudentMessageableTrainers(studentId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { studentId, OR: [{ status: "PAID" }, { isTrial: true }] },
    include: { batch: { include: { trainer: true } } },
  });

  const seen = new Map<string, { id: string; name: string; photoUrl: string | null }>();
  for (const e of enrollments) {
    if (e.batch.trainer) {
      seen.set(e.batch.trainer.id, {
        id: e.batch.trainer.id,
        name: e.batch.trainer.name,
        photoUrl: e.batch.trainer.photoUrl,
      });
    }
  }
  return Array.from(seen.values());
}

export async function getTrainerMessageableStudents(trainerId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { batch: { trainerId }, OR: [{ status: "PAID" }, { isTrial: true }] },
    include: { student: true },
  });

  const seen = new Map<
    string,
    { id: string; name: string; email: string; avatarUrl: string | null; gender: Gender | null }
  >();
  for (const e of enrollments) {
    seen.set(e.student.id, {
      id: e.student.id,
      name: e.student.name,
      email: e.student.email,
      avatarUrl: e.student.avatarUrl,
      gender: e.student.gender,
    });
  }
  return Array.from(seen.values());
}

export async function postStudentDirectMessage(trainerId: string, revalidateTo: string, formData: FormData) {
  const session = await getStudentSession();
  if (!session) return;
  if (!(await authorizeDirectMessageAccess(session.studentId, trainerId))) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.directMessage.create({
    data: { studentId: session.studentId, trainerId, senderRole: "STUDENT", body },
  });
  revalidatePath(revalidateTo);
}

export async function postTrainerDirectMessage(studentId: string, revalidateTo: string, formData: FormData) {
  const session = await getTrainerSession();
  if (!session) return;
  if (!(await authorizeDirectMessageAccess(studentId, session.trainerId))) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.directMessage.create({
    data: { studentId, trainerId: session.trainerId, senderRole: "TRAINER", body },
  });
  revalidatePath(revalidateTo);
}
