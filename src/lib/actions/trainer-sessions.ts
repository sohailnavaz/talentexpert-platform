"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTrainerSession } from "@/lib/auth/session";

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
