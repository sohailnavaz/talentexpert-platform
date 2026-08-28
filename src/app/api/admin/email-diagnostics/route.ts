import { NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";

export async function GET() {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const [domains, emails] = await Promise.all([
    resend.domains.list(),
    resend.emails.list({ limit: 30 }),
  ]);

  return NextResponse.json({ domains: domains.data, emails: emails.data, emailsError: emails.error });
}
