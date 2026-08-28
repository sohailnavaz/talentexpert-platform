import "server-only";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export async function findOrCreateStudent(details: {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  emailVerified?: boolean;
}) {
  const existing = await db.student.findUnique({ where: { email: details.email } });
  if (existing) return { student: existing, isNew: false };

  const unusablePasswordHash = await hashPassword(crypto.randomUUID());
  const student = await db.student.create({
    data: {
      name: details.name,
      email: details.email,
      phone: details.phone || "",
      whatsapp: details.whatsapp || null,
      passwordHash: unusablePasswordHash,
      emailVerified: details.emailVerified ?? false,
    },
  });
  return { student, isNew: true };
}

export async function studentHasConverted(studentId: string) {
  const count = await db.enrollment.count({ where: { studentId, status: "PAID", isTrial: false } });
  return count > 0;
}
