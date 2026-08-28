"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { saveSiteContactInfo } from "@/lib/site-settings";
import { logActivity } from "@/lib/audit";
import { registerDailyWebhook } from "@/lib/daily";
import type { AdminFormState } from "@/lib/actions/admin-courses";

const schema = z.object({
  phone: z.string().trim().min(5),
  whatsappNumber: z.string().trim().min(5),
  email: z.email(),
  address: z.string().trim().min(5),
  instagram: z.string().trim().optional(),
  linkedin: z.string().trim().optional(),
  youtube: z.string().trim().optional(),
  facebook: z.string().trim().optional(),
});

export async function updateSiteContactInfo(
  _prev: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const parsed = schema.safeParse({
    phone: formData.get("phone"),
    whatsappNumber: formData.get("whatsappNumber"),
    email: formData.get("email"),
    address: formData.get("address"),
    instagram: formData.get("instagram") || undefined,
    linkedin: formData.get("linkedin") || undefined,
    youtube: formData.get("youtube") || undefined,
    facebook: formData.get("facebook") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please check the form." };

  const d = parsed.data;
  await saveSiteContactInfo({
    phone: d.phone,
    phoneHref: `tel:${d.phone.replace(/[^\d+]/g, "")}`,
    whatsappNumber: d.whatsappNumber.replace(/[^\d]/g, ""),
    email: d.email,
    address: d.address,
    socials: {
      instagram: d.instagram ?? "",
      linkedin: d.linkedin ?? "",
      youtube: d.youtube ?? "",
      facebook: d.facebook ?? "",
    },
  });
  await logActivity(session.adminId, "settings.update_contact_info", "ContentBlock", "site-contact-info");

  revalidatePath("/", "layout");
  return { ok: true, message: "Contact info updated." };
}

export async function registerDailyWebhookAction(): Promise<{ ok: boolean; message: string }> {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.DAILY_WEBHOOK_SECRET;
  if (!siteUrl || !secret) {
    return {
      ok: false,
      message: "Set NEXT_PUBLIC_SITE_URL and DAILY_WEBHOOK_SECRET before registering the webhook.",
    };
  }

  const success = await registerDailyWebhook(`${siteUrl}/api/webhooks/daily`, secret);
  if (!success) {
    return { ok: false, message: "Registration failed — check DAILY_API_KEY is set and valid." };
  }

  await logActivity(session.adminId, "settings.register_daily_webhook", "Settings", "daily-webhook");
  return { ok: true, message: "Daily webhook registered." };
}
