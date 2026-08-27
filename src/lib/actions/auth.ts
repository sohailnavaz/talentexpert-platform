"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createResetToken, verifyResetToken } from "@/lib/auth/reset-token";
import { sendEmail } from "@/lib/email";
import {
  createAdminSession,
  createStudentSession,
  destroyAdminSession,
  destroyStudentSession,
} from "@/lib/auth/session";

const credentialsSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type AuthFormState = {
  ok: boolean;
  message?: string;
};

export async function loginStudent(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const student = await db.student.findUnique({ where: { email: parsed.data.email } });
  if (!student || !student.active) {
    return { ok: false, message: "We couldn't find an account with those details." };
  }

  const valid = await verifyPassword(parsed.data.password, student.passwordHash);
  if (!valid) {
    return { ok: false, message: "Incorrect email or password." };
  }

  await createStudentSession({ studentId: student.id, name: student.name, email: student.email });
  redirect("/portal");
}

export async function logoutStudent() {
  await destroyStudentSession();
  redirect("/login");
}

export async function loginAdmin(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.active) {
    return { ok: false, message: "We couldn't find an account with those details." };
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    return { ok: false, message: "Incorrect email or password." };
  }

  await db.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  await createAdminSession({
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin/login");
}

const emailSchema = z.object({ email: z.email("Enter a valid email") });

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  const genericMessage =
    "If an account exists for that email, a reset link has been sent.";

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const student = await db.student.findUnique({ where: { email: parsed.data.email } });
  if (student && student.active) {
    const token = await createResetToken(student.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    await sendEmail({
      to: student.email,
      subject: "Reset your Talent Expert password",
      html: `<p>Hi ${student.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  }

  return { ok: true, message: genericMessage };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const studentId = await verifyResetToken(parsed.data.token);
  if (!studentId) {
    return { ok: false, message: "This reset link is invalid or has expired." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.student.update({
    where: { id: studentId },
    data: { passwordHash, mustChangePassword: false },
  });

  return { ok: true, message: "Password updated. You can now sign in." };
}
