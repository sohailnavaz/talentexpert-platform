"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, generateTempPassword } from "@/lib/auth/password";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { sendEmail } from "@/lib/email";
import { generateEnrollmentCode } from "@/lib/enrollment-code";
import { logActivity } from "@/lib/audit";

export async function toggleStudentActive(studentId: string, active: boolean) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);
  await db.student.update({ where: { id: studentId }, data: { active } });
  await logActivity(session.adminId, active ? "student.activate" : "student.deactivate", "Student", studentId);
  revalidatePath("/admin/students");
}

export async function resetStudentPassword(studentId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);
  const student = await db.student.update({
    where: { id: studentId },
    data: { passwordHash, mustChangePassword: true },
  });

  await sendEmail({
    to: student.email,
    subject: "Your Talent Expert password has been reset",
    html: `<p>Hi ${student.name},</p><p>Your temporary password is: <strong>${tempPassword}</strong></p><p>Please sign in and set a new password.</p>`,
  });
  await logActivity(session.adminId, "student.reset_password", "Student", studentId);

  revalidatePath("/admin/students");
  return tempPassword;
}

const manualEnrolSchema = z.object({
  studentId: z.string().min(1),
  batchId: z.string().min(1),
});

export async function manualEnrolStudent(formData: FormData) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = manualEnrolSchema.safeParse({
    studentId: formData.get("studentId"),
    batchId: formData.get("batchId"),
  });
  if (!parsed.success) return;

  const batch = await db.batch.findUnique({ where: { id: parsed.data.batchId } });
  if (!batch) return;

  const code = await generateEnrollmentCode();

  await db.enrollment.create({
    data: {
      enrollmentCode: code,
      studentId: parsed.data.studentId,
      batchId: parsed.data.batchId,
      amountDue: batch.fee,
      amountPaid: batch.fee,
      status: "PAID",
      portalUnlocked: true,
    },
  });
  await db.batch.update({ where: { id: batch.id }, data: { seatsFilled: { increment: 1 } } });
  await logActivity(session.adminId, "enrollment.manual_create", "Enrollment", code, {
    studentId: parsed.data.studentId,
    batchId: parsed.data.batchId,
  });

  revalidatePath("/admin/students");
  revalidatePath("/admin/enrolments");
}
