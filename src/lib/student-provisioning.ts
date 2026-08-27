import "server-only";
import crypto from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export async function findOrCreateStudent(details: {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
}) {
  const existing = await db.student.findUnique({ where: { email: details.email } });
  if (existing) return existing;

  const unusablePasswordHash = await hashPassword(crypto.randomUUID());
  return db.student.create({
    data: {
      name: details.name,
      email: details.email,
      phone: details.phone,
      whatsapp: details.whatsapp || null,
      passwordHash: unusablePasswordHash,
    },
  });
}
