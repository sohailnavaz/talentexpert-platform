"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const MODES = ["ONLINE", "CLASSROOM", "WEEKEND", "CORPORATE", "INTERNSHIP", "WORKSHOP"] as const;

const batchSchema = z.object({
  courseId: z.string().min(1, "Select a course"),
  startDate: z.string().min(1, "Pick a start date"),
  startTime: z.string().trim().min(1, "Add a time"),
  mode: z.enum(MODES),
  trainerId: z.string().optional(),
  durationText: z.string().trim().optional(),
  seatTotal: z.coerce.number().int().min(1),
  fee: z.coerce.number().min(0),
  contactNumber: z.string().trim().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED"]),
});

function parseBatch(formData: FormData) {
  return batchSchema.safeParse({
    courseId: formData.get("courseId"),
    startDate: formData.get("startDate"),
    startTime: formData.get("startTime"),
    mode: formData.get("mode"),
    trainerId: formData.get("trainerId") || undefined,
    durationText: formData.get("durationText") || undefined,
    seatTotal: formData.get("seatTotal"),
    fee: formData.get("fee"),
    contactNumber: formData.get("contactNumber") || undefined,
    status: formData.get("status") ?? "UPCOMING",
  });
}

export async function createBatch(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = parseBatch(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  const batch = await db.batch.create({
    data: {
      courseId: d.courseId,
      startDate: new Date(d.startDate),
      startTime: d.startTime,
      mode: d.mode,
      trainerId: d.trainerId || null,
      durationText: d.durationText,
      seatTotal: d.seatTotal,
      fee: d.fee,
      contactNumber: d.contactNumber,
      status: d.status,
    },
  });

  await logActivity(session.adminId, "batch.create", "Batch", batch.id);

  revalidatePath("/admin/batches");
  revalidatePath("/batches");
  redirect(`/admin/batches/${batch.id}/edit`);
}

export async function updateBatch(
  batchId: string,
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = parseBatch(formData);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const d = parsed.data;

  await db.batch.update({
    where: { id: batchId },
    data: {
      courseId: d.courseId,
      startDate: new Date(d.startDate),
      startTime: d.startTime,
      mode: d.mode,
      trainerId: d.trainerId || null,
      durationText: d.durationText,
      seatTotal: d.seatTotal,
      fee: d.fee,
      contactNumber: d.contactNumber,
      status: d.status,
    },
  });

  await logActivity(session.adminId, "batch.update", "Batch", batchId);

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/batches");
  return { ok: true, message: "Batch updated." };
}

export async function deleteBatch(batchId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  await db.batch.delete({ where: { id: batchId } });
  await logActivity(session.adminId, "batch.delete", "Batch", batchId);
  revalidatePath("/admin/batches");
  revalidatePath("/batches");
}

const offerSchema = z.object({
  label: z.string().trim().min(1),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().min(0),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
});

export async function addOffer(batchId: string, formData: FormData) {
  await verifyAdminSession();
  const parsed = offerSchema.safeParse({
    label: formData.get("label"),
    type: formData.get("type"),
    value: formData.get("value"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  });
  if (!parsed.success) return;
  const d = parsed.data;
  await db.offer.create({
    data: {
      batchId,
      label: d.label,
      type: d.type,
      value: d.value,
      startAt: new Date(d.startAt),
      endAt: new Date(d.endAt),
    },
  });
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/batches");
}

export async function deleteOffer(offerId: string, batchId: string) {
  await verifyAdminSession();
  await db.offer.delete({ where: { id: offerId } });
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/batches");
}

export async function addSession(
  batchId: string,
  data: { topic: string; date: string; time: string; joinUrl: string; recordingUrl?: string; isFreePreview?: boolean }
) {
  await verifyAdminSession();
  await db.classSession.create({
    data: {
      batchId,
      topic: data.topic,
      date: new Date(data.date),
      time: data.time,
      joinUrl: data.joinUrl,
      recordingUrl: data.recordingUrl || null,
      isFreePreview: data.isFreePreview ?? false,
    },
  });
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/portal");
  revalidatePath(`/preview/${batchId}`);
}

export async function updateSessionRecording(
  sessionId: string,
  batchId: string,
  data: { recordingUrl: string; isFreePreview: boolean }
) {
  await verifyAdminSession();
  await db.classSession.update({
    where: { id: sessionId },
    data: { recordingUrl: data.recordingUrl || null, isFreePreview: data.isFreePreview },
  });
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/portal");
  revalidatePath(`/preview/${batchId}`);
}

export async function deleteSession(sessionId: string, batchId: string) {
  await verifyAdminSession();
  await db.classSession.delete({ where: { id: sessionId } });
  revalidatePath(`/admin/batches/${batchId}/edit`);
}

export async function addMaterial(batchId: string, title: string, fileUrl: string) {
  await verifyAdminSession();
  await db.material.create({ data: { batchId, title, fileUrl } });
  revalidatePath(`/admin/batches/${batchId}/edit`);
  revalidatePath("/portal");
}

export async function deleteMaterial(materialId: string, batchId: string) {
  await verifyAdminSession();
  await db.material.delete({ where: { id: materialId } });
  revalidatePath(`/admin/batches/${batchId}/edit`);
}
