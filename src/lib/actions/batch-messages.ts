"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStudentSession, getTrainerSession, getAdminSession } from "@/lib/auth/session";

export async function getBatchMessages(batchId: string) {
  return db.batchMessage.findMany({
    where: { batchId },
    orderBy: { createdAt: "asc" },
    include: {
      student: { select: { name: true } },
      trainer: { select: { name: true } },
      admin: { select: { name: true } },
    },
  });
}

export async function postStudentBatchMessage(
  batchId: string,
  revalidateTo: string,
  formData: FormData
) {
  const session = await getStudentSession();
  if (!session) return;

  const enrollment = await db.enrollment.findFirst({
    where: { batchId, studentId: session.studentId, status: "PAID" },
  });
  if (!enrollment) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.batchMessage.create({
    data: { batchId, authorRole: "STUDENT", studentId: session.studentId, body },
  });
  revalidatePath(revalidateTo);
}

export async function postTrainerBatchMessage(
  batchId: string,
  revalidateTo: string,
  formData: FormData
) {
  const session = await getTrainerSession();
  if (!session) return;

  const batch = await db.batch.findFirst({ where: { id: batchId, trainerId: session.trainerId } });
  if (!batch) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.batchMessage.create({
    data: { batchId, authorRole: "TRAINER", trainerId: session.trainerId, body },
  });
  revalidatePath(revalidateTo);
}

export async function postAdminBatchMessage(
  batchId: string,
  revalidateTo: string,
  formData: FormData
) {
  const session = await getAdminSession();
  if (!session) return;

  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  await db.batchMessage.create({
    data: { batchId, authorRole: "ADMIN", adminId: session.adminId, body },
  });
  revalidatePath(revalidateTo);
}
