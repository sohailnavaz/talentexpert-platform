"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createResetToken, verifyResetToken } from "@/lib/auth/reset-token";
import { sendEmail, emailButton } from "@/lib/email";
import {
  createAdminSession,
  createStudentSession,
  createTrainerSession,
  destroyAdminSession,
  destroyStudentSession,
  destroyTrainerSession,
  getStudentSession,
} from "@/lib/auth/session";
import { isRateLimited, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/actions/signup";

const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a few minutes and try again.";

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

  const rateLimitKey = `login:student:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const student = await db.student.findUnique({ where: { email: parsed.data.email } });
  if (!student || !student.active) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "We couldn't find an account with those details." };
  }

  const valid = await verifyPassword(parsed.data.password, student.passwordHash);
  if (!valid) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "Incorrect email or password." };
  }

  clearAttempts(rateLimitKey);
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

  const rateLimitKey = `login:admin:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const admin = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!admin || !admin.active) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "We couldn't find an account with those details." };
  }

  const valid = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!valid) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "Incorrect email or password." };
  }

  clearAttempts(rateLimitKey);
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

export async function loginTrainer(
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

  const rateLimitKey = `login:trainer:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const trainer = await db.trainer.findUnique({ where: { email: parsed.data.email } });
  if (!trainer || !trainer.active || !trainer.passwordHash) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "We couldn't find an account with those details." };
  }

  const valid = await verifyPassword(parsed.data.password, trainer.passwordHash);
  if (!valid) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "Incorrect email or password." };
  }

  clearAttempts(rateLimitKey);
  await createTrainerSession({ trainerId: trainer.id, name: trainer.name, email: parsed.data.email });
  redirect("/trainer");
}

export async function logoutTrainer() {
  await destroyTrainerSession();
  redirect("/trainer/login");
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

  const rateLimitKey = `reset:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }
  recordFailedAttempt(rateLimitKey);

  const student = await db.student.findUnique({ where: { email: parsed.data.email } });
  if (student && student.active) {
    const token = await createResetToken(student.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    await sendEmail({
      to: student.email,
      subject: "Reset your Talent Expert password",
      html: `<p>Hi ${student.name},</p><p>We received a request to reset your Talent Expert password.</p><p style="text-align:center;margin:28px 0;">${emailButton(resetUrl, "Reset password")}</p><p style="color:#71717a;font-size:13px;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>`,
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

const trainerOtpSchema = z.object({
  email: z.email("Enter a valid email"),
  otp: z.string().trim().length(6, "Enter the 6-digit code sent to your email"),
});

async function findValidTrainerOtp(email: string, otp: string) {
  const trainer = await db.trainer.findUnique({ where: { email } });
  if (!trainer || !trainer.otpHash || !trainer.otpExpiresAt || trainer.otpExpiresAt < new Date()) {
    return null;
  }
  const valid = await verifyPassword(otp, trainer.otpHash);
  return valid ? trainer : null;
}

export async function verifyTrainerOtp(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = trainerOtpSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const rateLimitKey = `trainer-otp:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const trainer = await findValidTrainerOtp(parsed.data.email, parsed.data.otp);
  if (!trainer) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "That code is invalid or has expired." };
  }

  clearAttempts(rateLimitKey);
  return { ok: true, message: "Email verified. Set your password to continue." };
}

const setTrainerPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
  otp: z.string().trim().length(6, "Enter the 6-digit code sent to your email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function setTrainerPassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = setTrainerPasswordSchema.safeParse({
    email: formData.get("email"),
    otp: formData.get("otp"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const rateLimitKey = `trainer-otp:${parsed.data.email.toLowerCase()}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }

  const trainer = await findValidTrainerOtp(parsed.data.email, parsed.data.otp);
  if (!trainer) {
    recordFailedAttempt(rateLimitKey);
    return { ok: false, message: "That verification code is invalid or has expired. Please start again." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.trainer.update({
    where: { id: trainer.id },
    data: {
      passwordHash,
      mustChangePassword: false,
      emailVerified: true,
      otpHash: null,
      otpExpiresAt: null,
    },
  });

  clearAttempts(rateLimitKey);
  await createTrainerSession({ trainerId: trainer.id, name: trainer.name, email: trainer.email! });
  redirect("/trainer");
}

export async function resendVerificationEmail(
  _prev: AuthFormState,
  _formData: FormData
): Promise<AuthFormState> {
  const session = await getStudentSession();
  if (!session) return { ok: false, message: "Your session has expired. Please sign in again." };

  const rateLimitKey = `verify-resend:${session.studentId}`;
  if (isRateLimited(rateLimitKey)) {
    return { ok: false, message: RATE_LIMIT_MESSAGE };
  }
  recordFailedAttempt(rateLimitKey);

  const student = await db.student.findUnique({ where: { id: session.studentId } });
  if (!student) return { ok: false, message: "Account not found." };
  if (student.emailVerified) return { ok: true, message: "Your email is already verified." };

  await sendVerificationEmail(student);
  return { ok: true, message: "Verification email sent. Please check your inbox." };
}
