"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateTrainerProfile } from "@/lib/actions/trainer-profile";
import type { AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { ok: true };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function TrainerProfileForm({
  name,
  phone,
  bio,
}: {
  name: string;
  phone: string | null;
  bio: string | null;
}) {
  const [state, formAction] = useActionState(updateTrainerProfile, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Contact number</Label>
        <Input id="phone" name="phone" defaultValue={phone ?? ""} placeholder="+91 90000 00000" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={bio ?? ""} />
      </div>
      <SubmitButton />
    </form>
  );
}
