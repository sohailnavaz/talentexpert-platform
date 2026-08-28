import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getGoogleAuthUrl } from "@/lib/google-oauth";

const STATE_COOKIE = "google_oauth_state";

export async function GET() {
  const state = randomUUID();
  const authUrl = getGoogleAuthUrl(state);

  if (!authUrl) {
    return NextResponse.redirect(
      new URL("/login?error=google-not-configured", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(authUrl);
}
