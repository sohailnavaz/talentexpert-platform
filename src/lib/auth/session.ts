import "server-only";
import { randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is required");
}
const encodedKey = new TextEncoder().encode(secretKey);

// Caps how many devices a student can be signed in on at once — logging in
// on a third device silently signs out the oldest. A missing sessionId (a
// token issued before this existed) is grandfathered through unchecked until
// it expires or the student logs in again.
const MAX_STUDENT_SESSIONS = 2;

export type StudentSessionPayload = {
  kind: "student";
  studentId: string;
  name: string;
  email: string;
  sessionId?: string;
};

export type AdminSessionPayload = {
  kind: "admin";
  adminId: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "COUNSELLOR" | "COORDINATOR" | "EDITOR";
};

export type TrainerSessionPayload = {
  kind: "trainer";
  trainerId: string;
  name: string;
  email: string;
};

const STUDENT_COOKIE = "te_student_session";
const ADMIN_COOKIE = "te_admin_session";
const TRAINER_COOKIE = "te_trainer_session";
const SESSION_TTL_DAYS = 14;

async function encrypt(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(encodedKey);
}

async function decrypt<T>(session: string | undefined): Promise<T | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as T;
  } catch {
    return null;
  }
}

async function setSessionCookie(name: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function createStudentSession(payload: Omit<StudentSessionPayload, "kind" | "sessionId">) {
  const sessionId = randomUUID();
  const token = await encrypt({ kind: "student", ...payload, sessionId });
  await setSessionCookie(STUDENT_COOKIE, token);

  const student = await db.student.findUnique({
    where: { id: payload.studentId },
    select: { activeSessionIds: true },
  });
  const activeSessionIds = [...(student?.activeSessionIds ?? []), sessionId].slice(-MAX_STUDENT_SESSIONS);
  await db.student.update({ where: { id: payload.studentId }, data: { activeSessionIds } });
}

export async function createAdminSession(payload: Omit<AdminSessionPayload, "kind">) {
  const token = await encrypt({ kind: "admin", ...payload });
  await setSessionCookie(ADMIN_COOKIE, token);
}

export async function createTrainerSession(payload: Omit<TrainerSessionPayload, "kind">) {
  const token = await encrypt({ kind: "trainer", ...payload });
  await setSessionCookie(TRAINER_COOKIE, token);
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies();
  const payload = await decrypt<StudentSessionPayload>(cookieStore.get(STUDENT_COOKIE)?.value);
  if (!payload || !payload.sessionId) return payload;

  const student = await db.student.findUnique({
    where: { id: payload.studentId },
    select: { activeSessionIds: true },
  });
  if (!student || !student.activeSessionIds.includes(payload.sessionId)) return null;

  return payload;
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt<AdminSessionPayload>(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function getTrainerSession(): Promise<TrainerSessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt<TrainerSessionPayload>(cookieStore.get(TRAINER_COOKIE)?.value);
}

export async function destroyStudentSession() {
  const cookieStore = await cookies();
  const payload = await decrypt<StudentSessionPayload>(cookieStore.get(STUDENT_COOKIE)?.value);
  cookieStore.delete(STUDENT_COOKIE);

  if (payload?.sessionId) {
    const student = await db.student.findUnique({
      where: { id: payload.studentId },
      select: { activeSessionIds: true },
    });
    if (student) {
      await db.student.update({
        where: { id: payload.studentId },
        data: { activeSessionIds: student.activeSessionIds.filter((id) => id !== payload.sessionId) },
      });
    }
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function destroyTrainerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TRAINER_COOKIE);
}
