import type { Metadata } from "next";
import { verifyAdminSession, requireRole } from "@/lib/auth/dal";
import { getSiteContactInfo } from "@/lib/site-settings";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { DailyWebhookCard } from "@/components/admin/daily-webhook-card";

export const metadata: Metadata = { title: "Site Settings" };

export default async function AdminSettingsPage() {
  const session = await verifyAdminSession();
  requireRole(session, ["SUPER_ADMIN"]);

  const contact = await getSiteContactInfo();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Site Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Contact details shown across the public site footer, navbar and contact page.
        </p>
      </div>
      <SiteSettingsForm contact={contact} />
      <DailyWebhookCard />
    </div>
  );
}
