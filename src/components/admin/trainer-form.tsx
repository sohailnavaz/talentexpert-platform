"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { AdminFormState } from "@/lib/actions/admin-courses";
import type { Trainer } from "@/generated/prisma";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

export function TrainerForm({
  action,
  trainer,
  submitLabel = "Save trainer",
}: {
  action: (state: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  trainer?: Trainer;
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, { ok: true });

  useEffect(() => {
    if (state.message) {
      state.ok ? toast.success(state.message) : toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={trainer?.name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Portal login email (optional)</Label>
        <Input id="email" name="email" type="email" defaultValue={trainer?.email ?? ""} placeholder="trainer@talentexpertedu.com" />
        <p className="text-xs text-muted-foreground">
          {trainer?.email
            ? "Trainer already has portal access. Clear this field to revoke it."
            : "Setting an email grants trainer-portal access and emails a 6-digit code — the trainer verifies it and sets their own password at /trainer/verify."}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} defaultValue={trainer?.bio ?? ""} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="experienceYears">Years of experience</Label>
          <Input id="experienceYears" name="experienceYears" type="number" min={0} defaultValue={trainer?.experienceYears ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expertise">Expertise (comma separated)</Label>
          <Input id="expertise" name="expertise" defaultValue={trainer?.expertise.join(", ")} placeholder="React, Node.js, System Design" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="photoFile">Photo</Label>
        <Input id="photoFile" name="photoFile" type="file" accept="image/*" />
        <p className="text-xs text-muted-foreground">Or paste an image URL below instead.</p>
        <Input name="photoUrl" placeholder="https://..." defaultValue={trainer?.photoUrl ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="active" defaultChecked={trainer?.active ?? true} />
        Active (visible on the site)
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
