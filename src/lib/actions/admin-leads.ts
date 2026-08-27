"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession } from "@/lib/auth/dal";

const STATUSES = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;

export async function updateLeadStatus(leadId: string, status: string) {
  await verifyAdminSession();
  if (!STATUSES.includes(status as never)) return;
  await db.lead.update({ where: { id: leadId }, data: { status: status as (typeof STATUSES)[number] } });
  revalidatePath("/admin/leads");
}
