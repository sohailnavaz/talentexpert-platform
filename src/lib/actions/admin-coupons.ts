"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { logActivity } from "@/lib/audit";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  code: z.string().trim().min(3).toUpperCase(),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().positive(),
  expiresAt: z.string().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
});

export async function createCoupon(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);

  const parsed = schema.safeParse({
    code: formData.get("code"),
    type: formData.get("type"),
    value: formData.get("value"),
    expiresAt: formData.get("expiresAt") || undefined,
    usageLimit: formData.get("usageLimit") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const existing = await db.coupon.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { ok: false, message: "A coupon with this code already exists." };

  const coupon = await db.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      usageLimit: parsed.data.usageLimit ?? null,
    },
  });
  await logActivity(session.adminId, "coupon.create", "Coupon", coupon.id, { code: coupon.code });

  revalidatePath("/admin/offers");
  return { ok: true, message: "Coupon created." };
}

export async function toggleCouponActive(couponId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN", "COORDINATOR"]);
  const coupon = await db.coupon.findUnique({ where: { id: couponId } });
  if (!coupon) return;
  await db.coupon.update({ where: { id: couponId }, data: { active: !coupon.active } });
  revalidatePath("/admin/offers");
}

export async function deleteCoupon(couponId: string) {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);
  await db.coupon.delete({ where: { id: couponId } });
  await logActivity(session.adminId, "coupon.delete", "Coupon", couponId);
  revalidatePath("/admin/offers");
}
