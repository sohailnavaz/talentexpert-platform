"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { createStudentSession } from "@/lib/auth/session";
import { findOrCreateStudent, studentHasConverted } from "@/lib/student-provisioning";
import { generateEnrollmentCode } from "@/lib/enrollment-code";
import { getActiveOffer, computeEffectiveFee } from "@/lib/pricing";

const TRIAL_DURATION_MS = 48 * 60 * 60 * 1000;

export async function ensureTrialEnrollment(studentId: string, batchId: string) {
  const existing = await db.enrollment.findFirst({ where: { studentId, batchId } });
  if (existing) return existing;

  const batch = await db.batch.findUnique({
    where: { id: batchId },
    include: { offers: true, course: { select: { trialEnabled: true } } },
  });
  if (!batch) return null;
  if (!batch.course.trialEnabled) return null;

  const offer = getActiveOffer(batch.offers);
  const { effectiveFee } = computeEffectiveFee(Number(batch.fee), offer);
  const enrollmentCode = await generateEnrollmentCode();

  return db.enrollment.create({
    data: {
      enrollmentCode,
      studentId,
      batchId,
      amountDue: effectiveFee,
      amountPaid: 0,
      status: "PENDING",
      portalUnlocked: true,
      isTrial: true,
      trialExpiresAt: new Date(Date.now() + TRIAL_DURATION_MS),
    },
  });
}

const detailsSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
});

export type FreePreviewState = { ok: boolean; message?: string };

export async function startFreePreview(
  batchId: string,
  _prev: FreePreviewState,
  formData: FormData
): Promise<FreePreviewState> {
  const parsed = detailsSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { student, isNew } = await findOrCreateStudent(parsed.data);

  if (!isNew && (await studentHasConverted(student.id))) {
    return {
      ok: false,
      message: "An account already exists for this email. Please sign in instead.",
    };
  }

  const enrollment = await ensureTrialEnrollment(student.id, batchId);
  if (!enrollment) {
    return { ok: false, message: "This course doesn't offer a free trial. Please enrol to access it." };
  }

  await createStudentSession({ studentId: student.id, name: student.name, email: student.email });
  return { ok: true };
}
