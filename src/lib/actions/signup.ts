"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createStudentSession } from "@/lib/auth/session";

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
  redirect("/portal");
}
