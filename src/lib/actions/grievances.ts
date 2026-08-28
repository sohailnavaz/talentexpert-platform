"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth/session";
import { verifyAdminSession } from "@/lib/auth/dal";
import { sendEmail, emailButton } from "@/lib/email";

export type GrievanceFormState = { ok: boolean; message?: string };

const submitSchema = z.object({
  subject: z.string().trim().min(3, "Give it a short subject"),
  body: z.string().trim().min(10, "Tell us a bit more about the issue"),
});

export async function submitGrievance(
  _prev: GrievanceFormState,
  formData: FormData
): Promise<GrievanceFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const parsed = submitSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  await db.grievance.create({
    data: { studentId: session.studentId, subject: parsed.data.subject, body: parsed.data.body },
  });

  revalidatePath("/portal/grievances");
  return { ok: true, message: "Your concern has been submitted. We'll get back to you soon." };
}

export async function getStudentGrievances(studentId: string) {
  return db.grievance.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } });
}

export async function replyToGrievance(grievanceId: string, formData: FormData) {
  await verifyAdminSession();
  const reply = String(formData.get("adminReply") ?? "").trim();
  if (!reply) return;

  const grievance = await db.grievance.update({
    where: { id: grievanceId },
    data: { adminReply: reply, status: "IN_PROGRESS" },
    include: { student: true },
  });

  const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/portal/grievances`;
  await sendEmail({
    to: grievance.student.email,
    subject: `Update on your enquiry: ${grievance.subject}`,
    html: `<p>Hi ${grievance.student.name},</p><p>We've responded to your enquiry <strong>"${grievance.subject}"</strong>:</p><blockquote style="border-left:3px solid #ea580c;padding-left:12px;color:#444;">${reply}</blockquote><p style="text-align:center;margin:28px 0;">${emailButton(portalUrl, "View in your portal")}</p>`,
  });

  revalidatePath("/admin/grievances");
  revalidatePath("/portal/grievances");
}

export async function updateGrievanceStatus(grievanceId: string, status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED") {
  await verifyAdminSession();
  await db.grievance.update({
    where: { id: grievanceId },
    data: { status, resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null },
  });
  revalidatePath("/admin/grievances");
  revalidatePath("/portal/grievances");
}
