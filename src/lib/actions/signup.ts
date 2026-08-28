"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createStudentSession } from "@/lib/auth/session";
import { createVerifyToken } from "@/lib/auth/verify-token";
import { sendEmail, emailButton } from "@/lib/email";

export async function sendVerificationEmail(student: { id: string; name: string; email: string }) {
  const token = await createVerifyToken(student.id);
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;
  await sendEmail({
    to: student.email,
    subject: "Verify your Talent Expert email",
    html: `<p>Hi ${student.name},</p><p>Thanks for signing up for Talent Expert. Verify your email address to activate your account.</p><p style="text-align:center;margin:28px 0;">${emailButton(verifyUrl, "Verify email")}</p><p style="color:#71717a;font-size:13px;">This link expires in 24 hours.</p>`,
  });
}

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number")
    .max(15, "Enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupState = { ok: boolean; message?: string };

export async function signupStudent(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const existing = await db.student.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, message: "An account already exists for this email. Please sign in instead." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const student = await db.student.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
      mustChangePassword: false,
    },
  });

  await createStudentSession({ studentId: student.id, name: student.name, email: student.email });
  await sendVerificationEmail(student);
  redirect("/portal");
}
