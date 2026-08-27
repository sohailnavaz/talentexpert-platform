"use server";

import { db } from "@/lib/db";
import { getStudentSession, getTrainerSession } from "@/lib/auth/session";
import { createMeetingToken } from "@/lib/daily";

export type JoinClassSessionResult =
  | { ok: true; roomUrl: string; token: string | null }
  | { ok: false; reason: "not-authenticated" | "not-authorized" | "not-found" | "not-configured" };

export async function joinClassSession(sessionId: string): Promise<JoinClassSessionResult> {
  const classSession = await db.classSession.findUnique({ where: { id: sessionId } });
  if (!classSession) return { ok: false, reason: "not-found" };
  if (!classSession.roomName) return { ok: false, reason: "not-configured" };

  const studentSession = await getStudentSession();
  if (studentSession) {
    const enrollment = await db.enrollment.findFirst({
      where: { batchId: classSession.batchId, studentId: studentSession.studentId, status: "PAID" },
    });
    if (!enrollment) return { ok: false, reason: "not-authorized" };

    const token = await createMeetingToken(classSession.roomName, {
      userName: studentSession.name,
      isOwner: false,
    });
    return { ok: true, roomUrl: classSession.joinUrl, token };
  }

  const trainerSession = await getTrainerSession();
  if (trainerSession) {
    const batch = await db.batch.findFirst({
      where: { id: classSession.batchId, trainerId: trainerSession.trainerId },
    });
    if (!batch) return { ok: false, reason: "not-authorized" };

    const token = await createMeetingToken(classSession.roomName, {
      userName: trainerSession.name,
      isOwner: true,
    });
    return { ok: true, roomUrl: classSession.joinUrl, token };
  }

  return { ok: false, reason: "not-authenticated" };
}
