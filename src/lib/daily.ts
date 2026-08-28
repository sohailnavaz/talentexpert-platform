import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const API_BASE = "https://api.daily.co/v1";

function apiKey() {
  return process.env.DAILY_API_KEY || null;
}

export async function createDailyRoom(expiresAt: Date): Promise<{ url: string; name: string } | null> {
  const key = apiKey();
  if (!key) return null;

  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      privacy: "private",
      properties: { exp: Math.floor(expiresAt.getTime() / 1000), enable_chat: false },
    }),
  });
  if (!res.ok) {
    console.error(`[daily:create-room-failed] status=${res.status} ${await res.text()}`);
    return null;
  }
  const room = await res.json();
  return { url: room.url, name: room.name };
}

export async function deleteDailyRoom(roomName: string): Promise<void> {
  const key = apiKey();
  if (!key) return;

  try {
    const res = await fetch(`${API_BASE}/rooms/${roomName}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok && res.status !== 404) {
      console.error(`[daily:delete-room-failed] status=${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("[daily:delete-room-failed]", err);
  }
}

export async function createMeetingToken(
  roomName: string,
  opts: { userName: string; isOwner: boolean; userId?: string }
): Promise<string | null> {
  const key = apiKey();
  if (!key) return null;

  const res = await fetch(`${API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: opts.userName,
        is_owner: opts.isOwner,
        ...(opts.userId ? { user_id: opts.userId } : {}),
      },
    }),
  });
  if (!res.ok) {
    console.error(`[daily:create-token-failed] status=${res.status} ${await res.text()}`);
    return null;
  }
  const data = await res.json();
  return data.token as string;
}

export async function registerDailyWebhook(url: string, secret: string): Promise<boolean> {
  const key = apiKey();
  if (!key) return false;

  const res = await fetch(`${API_BASE}/webhooks`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      eventTypes: ["participant.joined", "participant.left"],
      hmac: secret,
    }),
  });
  if (!res.ok) {
    console.error(`[daily:register-webhook-failed] status=${res.status} ${await res.text()}`);
    return false;
  }
  return true;
}

export function verifyDailyWebhookSignature(
  rawBody: string,
  timestamp: string,
  signature: string
): boolean {
  const secret = process.env.DAILY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("base64");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
