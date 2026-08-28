"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getTrainerSession } from "@/lib/auth/session";

export async function createBatchAnnouncement(batchId: string, revalidateTo: string, formData: FormData) {
  const session = await getTrainerSession();
  if (!session) return;

  const batch = await db.batch.findFirst({ where: { id: batchId, trainerId: session.trainerId }, select: { id: true } });
  if (!batch) return;

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  await db.announcement.create({
    data: { title, body, audience: "PORTAL", batchId, active: true, startAt: new Date() },
  });

  revalidatePath(revalidateTo);
}

export async function deleteBatchAnnouncement(announcementId: string, revalidateTo: string) {
  const session = await getTrainerSession();
  if (!session) return;

  const announcement = await db.announcement.findFirst({
    where: { id: announcementId, batch: { trainerId: session.trainerId } },
    select: { id: true },
  });
  if (!announcement) return;

  await db.announcement.delete({ where: { id: announcementId } });
  revalidatePath(revalidateTo);
}
