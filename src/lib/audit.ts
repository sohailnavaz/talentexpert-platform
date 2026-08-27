import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma";

export async function logActivity(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  meta?: Record<string, unknown>
) {
  await db.activityLog.create({
    data: { actorId, action, entityType, entityId, meta: meta as Prisma.InputJsonValue },
  });
}
