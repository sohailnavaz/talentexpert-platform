import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdminSession, getStudentSession, getTrainerSession } from "./session";

export const verifyStudentSession = cache(async () => {
  const session = await getStudentSession();
  if (!session) redirect("/login");
  return session;
});

export const getCurrentStudent = cache(async () => {
  const session = await getStudentSession();
  if (!session) return null;
  const student = await db.student.findUnique({ where: { id: session.studentId } });
  if (!student || !student.active) return null;
  return student;
});

export const verifyAdminSession = cache(async () => {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
});

export const getCurrentAdmin = cache(async () => {
  const session = await getAdminSession();
  if (!session) return null;
  const admin = await db.adminUser.findUnique({ where: { id: session.adminId } });
  if (!admin || !admin.active) return null;
  return admin;
});

export const verifyTrainerSession = cache(async () => {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/login");
  return session;
});

export const getCurrentTrainer = cache(async () => {
  const session = await getTrainerSession();
  if (!session) return null;
  const trainer = await db.trainer.findUnique({ where: { id: session.trainerId } });
  if (!trainer || !trainer.active) return null;
  return trainer;
});

export function requireRole(
  session: { role: string },
  allowed: Array<"SUPER_ADMIN" | "COUNSELLOR" | "COORDINATOR" | "EDITOR">
) {
  if (!allowed.includes(session.role as never)) {
    redirect("/admin");
  }
}
