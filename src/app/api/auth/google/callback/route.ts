import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForIdToken, verifyGoogleIdToken } from "@/lib/google-oauth";
import { findOrCreateStudent } from "@/lib/student-provisioning";
import { createStudentSession } from "@/lib/auth/session";

const STATE_COOKIE = "google_oauth_state";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function fail(reason: string) {
  return NextResponse.redirect(new URL(`/login?error=${reason}`, SITE_URL));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("invalid-state");
  }

  const idToken = await exchangeCodeForIdToken(code);
  if (!idToken) return fail("token-exchange-failed");

  const identity = await verifyGoogleIdToken(idToken);
  if (!identity) return fail("verification-failed");

  const { student } = await findOrCreateStudent({
    name: identity.name,
    email: identity.email,
    emailVerified: identity.emailVerified,
  });

  await createStudentSession({ studentId: student.id, name: student.name, email: student.email });
  return NextResponse.redirect(new URL("/portal", SITE_URL));
}
