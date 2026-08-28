import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyDailyWebhookSignature } from "@/lib/daily";

type DailyWebhookPayload = {
  type: string;
  payload?: {
    room: string;
    user_id?: string;
    session_id: string;
    joined_at: number;
    duration?: number;
  };
};

function parseUserId(userId: string | undefined) {
  if (!userId) return {};
  if (userId.startsWith("student:")) return { studentId: userId.slice("student:".length) };
  if (userId.startsWith("trainer:")) return { trainerId: userId.slice("trainer:".length) };
  return {};
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const timestamp = request.headers.get("X-Webhook-Timestamp");
  const signature = request.headers.get("X-Webhook-Signature");

  if (!timestamp || !signature || !verifyDailyWebhookSignature(rawBody, timestamp, signature)) {
    // Daily disables the webhook on non-200 responses, so acknowledge without processing.
    return NextResponse.json({ ok: true });
  }

  let body: DailyWebhookPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!body.payload || (body.type !== "participant.joined" && body.type !== "participant.left")) {
    return NextResponse.json({ ok: true });
  }

  const { room, user_id, session_id, joined_at, duration } = body.payload;

  if (body.type === "participant.joined") {
    const classSession = await db.classSession.findFirst({
      where: { roomName: room },
      select: { id: true },
    });
    if (classSession) {
      await db.sessionParticipant.upsert({
        where: { dailySessionId: session_id },
        create: {
          dailySessionId: session_id,
          classSessionId: classSession.id,
          joinedAt: new Date(joined_at * 1000),
          ...parseUserId(user_id),
        },
        update: {},
      });
    }
  }

  if (body.type === "participant.left") {
    await db.sessionParticipant
      .update({
        where: { dailySessionId: session_id },
        data: {
          leftAt: new Date((joined_at + (duration ?? 0)) * 1000),
          durationSecs: duration ? Math.round(duration) : null,
        },
      })
      .catch(() => null);
  }

  return NextResponse.json({ ok: true });
}
