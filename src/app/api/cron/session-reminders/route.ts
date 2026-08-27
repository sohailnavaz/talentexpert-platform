import { NextResponse } from "next/server";
import { sendSessionRemindersDue } from "@/lib/actions/reminders";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await sendSessionRemindersDue();
  return NextResponse.json(result);
}
