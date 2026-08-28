"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStudentSession, getTrainerSession, getAdminSession } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/storage";

export type BatchMessageEvent = {
  id: string;
  authorRole: "STUDENT" | "TRAINER" | "ADMIN";
  authorName: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function saveMessageAttachment(formData: FormData) {
  const file = formData.get("attachment");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
    throw new Error("Unsupported file type. Upload an image, PDF, or Word document.");
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("File must be under 10MB.");
  }
  const url = await saveUploadedFile(file);
  return { url, name: file.name };
}

export async function authorizeStudentBatchAccess(batchId: string, studentId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: { batchId, studentId, status: "PAID" },
  });
  return Boolean(enrollment);
}

export async function authorizeTrainerBatchAccess(batchId: string, trainerId: string) {
  const batch = await db.batch.findFirst({ where: { id: batchId, trainerId } });
  return Boolean(batch);
}

const ROLE_LABEL = { STUDENT: "Student", TRAINER: "Trainer", ADMIN: "Talent Expert Team" } as const;

export async function getBatchMessages(batchId: string): Promise<BatchMessageEvent[]> {
  const messages = await db.batchMessage.findMany({
    where: { batchId },
    orderBy: { createdAt: "asc" },
    include: {
      student: { select: { name: true } },
      trainer: { select: { name: true } },
      admin: { select: { name: true } },
    },
  });

  return messages.map((m) => ({
    id: m.id,
    authorRole: m.authorRole,
    authorName: m.student?.name ?? m.trainer?.name ?? m.admin?.name ?? ROLE_LABEL[m.authorRole],
    body: m.body,
    attachmentUrl: m.attachmentUrl,
    attachmentName: m.attachmentName,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function postStudentBatchMessage(
  batchId: string,
  revalidateTo: string,
  formData: FormData
) {
  const session = await getStudentSession();
  if (!session) return;
  if (!(await authorizeStudentBatchAccess(batchId, session.studentId))) return;

  const body = String(formData.get("body") ?? "").trim();
  const attachment = await saveMessageAttachment(formData).catch(() => null);
  if (!body && !attachment) return;

  await db.batchMessage.create({
    data: {
      batchId,
      authorRole: "STUDENT",
      studentId: session.studentId,
      body,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
    },
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
  if (!(await authorizeTrainerBatchAccess(batchId, session.trainerId))) return;

  const body = String(formData.get("body") ?? "").trim();
  const attachment = await saveMessageAttachment(formData).catch(() => null);
  if (!body && !attachment) return;

  await db.batchMessage.create({
    data: {
      batchId,
      authorRole: "TRAINER",
      trainerId: session.trainerId,
      body,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
    },
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
  const attachment = await saveMessageAttachment(formData).catch(() => null);
  if (!body && !attachment) return;

  await db.batchMessage.create({
    data: {
      batchId,
      authorRole: "ADMIN",
      adminId: session.adminId,
      body,
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name,
    },
  });
  revalidatePath(revalidateTo);
}
