"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTrainerSession } from "@/lib/auth/session";
import { createDailyRoom, deleteDailyRoom } from "@/lib/daily";

async function requireOwnedBatch(batchId: string, trainerId: string) {
  const batch = await db.batch.findFirst({ where: { id: batchId, trainerId } });
  if (!batch) throw new Error("Batch not found.");
  return batch;
}

export async function addSessionAsTrainer(
  batchId: string,
  data: { topic: string; date: string; time: string; joinUrl: string }
) {
  const session = await getTrainerSession();
  if (!session) throw new Error("Your session has expired. Please sign in again.");
  await requireOwnedBatch(batchId, session.trainerId);

  const sessionDate = new Date(data.date);
  const expiresAt = new Date(sessionDate.getTime() + 6 * 60 * 60 * 1000);
  const room = await createDailyRoom(expiresAt);
  if (!room && process.env.DAILY_API_KEY && !data.joinUrl) {
    throw new Error("Could not create the video room. Please try again.");
  }

  await db.classSession.create({
    data: {
      batchId,
      topic: data.topic,
      date: sessionDate,
      time: data.time,
      joinUrl: room?.url ?? data.joinUrl,
      roomName: room?.name ?? null,
    },
  });

  revalidatePath(`/trainer/batches/${batchId}`);
  revalidatePath("/portal");
  revalidatePath(`/preview/${batchId}`);
}

export async function updateSessionDetailsAsTrainer(
  sessionId: string,
  batchId: string,
  data: { topic: string; date: string; time: string; joinUrl?: string }
) {
  const session = await getTrainerSession();
  if (!session) throw new Error("Your session has expired. Please sign in again.");
  await requireOwnedBatch(batchId, session.trainerId);

  const existing = await db.classSession.findFirst({
    where: { id: sessionId, batchId },
    select: { roomName: true },
  });
  if (!existing) throw new Error("Session not found.");

  await db.classSession.update({
    where: { id: sessionId },
    data: {
      topic: data.topic,
      date: new Date(data.date),
      time: data.time,
      ...(existing.roomName ? {} : { joinUrl: data.joinUrl || undefined }),
    },
  });

  revalidatePath(`/trainer/batches/${batchId}`);
  revalidatePath("/portal");
  revalidatePath(`/preview/${batchId}`);
}

export async function deleteSessionAsTrainer(sessionId: string, batchId: string) {
  const session = await getTrainerSession();
  if (!session) return;
  await requireOwnedBatch(batchId, session.trainerId);

  const classSession = await db.classSession.findFirst({
    where: { id: sessionId, batchId },
    select: { roomName: true },
  });
  if (!classSession) return;

  if (classSession.roomName) {
    await deleteDailyRoom(classSession.roomName);
  }
  await db.classSession.delete({ where: { id: sessionId } });
  revalidatePath(`/trainer/batches/${batchId}`);
}

export async function updateSessionRecordingAsTrainer(
  sessionId: string,
  batchId: string,
  data: { recordingUrl: string; isFreePreview: boolean }
) {
  const session = await getTrainerSession();
  if (!session) return;

  const classSession = await db.classSession.findFirst({
    where: { id: sessionId, batch: { trainerId: session.trainerId } },
    select: { id: true },
  });
  if (!classSession) return;

  await db.classSession.update({
    where: { id: sessionId },
    data: { recordingUrl: data.recordingUrl || null, isFreePreview: data.isFreePreview },
  });

  revalidatePath(`/trainer/batches/${batchId}`);
  revalidatePath("/portal");
  revalidatePath(`/preview/${batchId}`);
}

export async function setEnrollmentCompletion(enrollmentId: string, batchId: string, completed: boolean) {
  const session = await getTrainerSession();
  if (!session) return;

  const enrollment = await db.enrollment.findFirst({
    where: { id: enrollmentId, batch: { trainerId: session.trainerId } },
    select: { id: true },
  });
  if (!enrollment) return;

  await db.enrollment.update({
    where: { id: enrollmentId },
    data: { completedAt: completed ? new Date() : null },
  });

  revalidatePath(`/trainer/batches/${batchId}`);
  revalidatePath("/portal");
}
