"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateSiteContactInfo } from "@/lib/actions/admin-settings";
import type { SiteContactInfo } from "@/lib/site-settings";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function SiteSettingsForm({ contact }: { contact: SiteContactInfo }) {
  const [state, formAction] = useActionState(updateSiteContactInfo, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone number</Label>
          <Input id="phone" name="phone" defaultValue={contact.phone} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsappNumber">WhatsApp number</Label>
          <Input id="whatsappNumber" name="whatsappNumber" defaultValue={contact.whatsappNumber} required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Contact email</Label>
        <Input id="email" name="email" type="email" defaultValue={contact.email} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="address">Office address</Label>
        <Input id="address" name="address" defaultValue={contact.address} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input id="instagram" name="instagram" defaultValue={contact.socials.instagram} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="linkedin">LinkedIn URL</Label>
          <Input id="linkedin" name="linkedin" defaultValue={contact.socials.linkedin} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="youtube">YouTube URL</Label>
          <Input id="youtube" name="youtube" defaultValue={contact.socials.youtube} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="facebook">Facebook URL</Label>
          <Input id="facebook" name="facebook" defaultValue={contact.socials.facebook} />
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}
