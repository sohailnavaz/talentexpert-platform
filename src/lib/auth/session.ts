import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET environment variable is required");
}
const encodedKey = new TextEncoder().encode(secretKey);

export type StudentSessionPayload = {
  kind: "student";
  studentId: string;
  name: string;
  email: string;
};

export type AdminSessionPayload = {
  kind: "admin";
  adminId: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "COUNSELLOR" | "COORDINATOR" | "EDITOR";
};

const STUDENT_COOKIE = "te_student_session";
const ADMIN_COOKIE = "te_admin_session";
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

export async function createStudentSession(payload: Omit<StudentSessionPayload, "kind">) {
  const token = await encrypt({ kind: "student", ...payload });
  await setSessionCookie(STUDENT_COOKIE, token);
}

export async function createAdminSession(payload: Omit<AdminSessionPayload, "kind">) {
  const token = await encrypt({ kind: "admin", ...payload });
  await setSessionCookie(ADMIN_COOKIE, token);
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt<StudentSessionPayload>(cookieStore.get(STUDENT_COOKIE)?.value);
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt<AdminSessionPayload>(cookieStore.get(ADMIN_COOKIE)?.value);
}

export async function destroyStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_COOKIE);
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}
